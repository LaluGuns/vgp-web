import { NextResponse } from "next/server";
import {
  claimGooglePlayRtdn,
  completeGooglePlayRtdn,
  failGooglePlayRtdn,
  queuePendingRefundReview,
  reconcileVoidedPurchase,
  rtdnEventName,
  verifyAndPersistPlayPurchase,
  verifyPubSubPushBearer,
} from "@/lib/google-play";
import { captureSubscriptionEvent } from "@/lib/server-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ANDROID_PACKAGE = "com.virzyguns.flow";

function occurredAtFor(rtdn: any, publishTime?: string) {
  const eventTimeMillis = Number(rtdn?.eventTimeMillis);
  return Number.isFinite(eventTimeMillis) && eventTimeMillis > 0
    ? new Date(eventTimeMillis).toISOString()
    : publishTime || new Date().toISOString();
}

function notificationKind(rtdn: any) {
  if (rtdn?.pendingRefundReviewNotification) return "pending_refund_review";
  if (rtdn?.voidedPurchaseNotification) return "voided_purchase";
  if (rtdn?.subscriptionNotification) return "subscription";
  return "other";
}

export async function POST(req: Request) {
  try {
    await verifyPubSubPushBearer(req.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 196_608) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const envelope = await req.json().catch(() => null) as null | {
    message?: { data?: string; messageId?: string; publishTime?: string };
    subscription?: string;
  };
  const encoded = envelope?.message?.data;
  const messageId = envelope?.message?.messageId?.trim() || "";
  if (!encoded || encoded.length > 128_000 || !messageId || messageId.length > 256) {
    return NextResponse.json({ error: "invalid_pubsub_payload" }, { status: 400 });
  }

  let rtdn: any;
  try {
    rtdn = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  } catch {
    return NextResponse.json({ error: "invalid_rtdn" }, { status: 400 });
  }
  if (rtdn?.packageName !== ANDROID_PACKAGE) {
    return NextResponse.json({ error: "package_mismatch" }, { status: 422 });
  }

  const kind = notificationKind(rtdn);
  const occurredAt = occurredAtFor(rtdn, envelope?.message?.publishTime);

  let claimed = false;
  try {
    claimed = await claimGooglePlayRtdn(messageId, kind);
  } catch (error) {
    console.error("google_play_rtdn_claim_failed", messageId, error);
    return NextResponse.json({ error: "rtdn_dedupe_unavailable" }, { status: 503 });
  }
  if (!claimed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const pendingRefund = rtdn?.pendingRefundReviewNotification;
    if (pendingRefund) {
      const pendingRefundToken = String(pendingRefund.pendingRefundToken || "").trim();
      const orderId = String(pendingRefund.orderId || "").trim();
      if (!pendingRefundToken || !orderId) throw new Error("invalid_pending_refund_review");

      const queued = await queuePendingRefundReview({
        pendingRefundToken,
        orderId,
        refundReason: Number(pendingRefund.refundReason || 0),
        obfuscatedAccountId: pendingRefund.obfuscatedAccountId ? String(pendingRefund.obfuscatedAccountId) : null,
        occurredAt,
      });
      await captureSubscriptionEvent({
        eventName: "google_play_chargeback_review",
        status: "active",
        userId: queued.userId,
        plan: "unknown",
        eventId: messageId,
        occurredAt,
        provider: "google_play",
        platform: "server",
      });
      await completeGooglePlayRtdn(messageId);
      return NextResponse.json({
        received: true,
        pendingRefundReview: true,
        queued: true,
        deadlineAt: queued.deadlineAt,
      });
    }

    const voided = rtdn?.voidedPurchaseNotification;
    if (voided) {
      if (Number(voided.productType) !== 1) {
        await completeGooglePlayRtdn(messageId);
        return NextResponse.json({ received: true, ignored: true, reason: "non_subscription_void" });
      }
      const purchaseToken = String(voided.purchaseToken || "").trim();
      const orderId = String(voided.orderId || "").trim();
      if (!purchaseToken || !orderId) throw new Error("invalid_voided_purchase");

      const found = await reconcileVoidedPurchase({
        purchaseToken,
        orderId,
        voidedTimeMillis: String(new Date(occurredAt).getTime()),
      });
      if (!found) throw new Error("voided_purchase_not_yet_known");
      await completeGooglePlayRtdn(messageId);
      return NextResponse.json({ received: true, voidedPurchase: true, reconciled: true });
    }

    const subscription = rtdn?.subscriptionNotification;
    if (subscription?.purchaseToken) {
      await verifyAndPersistPlayPurchase({
        purchaseToken: String(subscription.purchaseToken),
        sourceEvent: rtdnEventName(Number(subscription.notificationType || 0)),
        providerUpdatedAt: occurredAt,
      });
      await completeGooglePlayRtdn(messageId);
      return NextResponse.json({ received: true });
    }

    await completeGooglePlayRtdn(messageId);
    return NextResponse.json({ received: true, ignored: true });
  } catch (error) {
    await failGooglePlayRtdn(messageId, error);
    console.error("google_play_rtdn_processing_failed", messageId, error);
    return NextResponse.json({ error: "rtdn_processing_failed" }, { status: 500 });
  }
}
