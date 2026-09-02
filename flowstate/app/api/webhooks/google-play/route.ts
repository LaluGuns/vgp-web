import { NextResponse } from "next/server";
import {
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
  if (!encoded || encoded.length > 128_000) {
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

  const occurredAt = occurredAtFor(rtdn, envelope?.message?.publishTime);

  const pendingRefund = rtdn?.pendingRefundReviewNotification;
  if (pendingRefund) {
    const pendingRefundToken = String(pendingRefund.pendingRefundToken || "").trim();
    const orderId = String(pendingRefund.orderId || "").trim();
    if (!pendingRefundToken || !orderId) {
      return NextResponse.json({ error: "invalid_pending_refund_review" }, { status: 400 });
    }

    try {
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
        eventId: envelope?.message?.messageId || queued.providerReviewId,
        occurredAt,
        provider: "google_play",
        platform: "server",
      });
      return NextResponse.json({
        received: true,
        pendingRefundReview: true,
        queued: true,
        deadlineAt: queued.deadlineAt,
      });
    } catch (error) {
      console.error("google_play_chargeback_review_failed", envelope?.message?.messageId, error);
      return NextResponse.json({ error: "chargeback_review_queue_failed" }, { status: 500 });
    }
  }

  const voided = rtdn?.voidedPurchaseNotification;
  if (voided) {
    if (Number(voided.productType) !== 1) {
      return NextResponse.json({ received: true, ignored: true, reason: "non_subscription_void" });
    }
    const purchaseToken = String(voided.purchaseToken || "").trim();
    const orderId = String(voided.orderId || "").trim();
    if (!purchaseToken || !orderId) {
      return NextResponse.json({ error: "invalid_voided_purchase" }, { status: 400 });
    }

    try {
      const found = await reconcileVoidedPurchase({
        purchaseToken,
        orderId,
        voidedTimeMillis: String(new Date(occurredAt).getTime()),
      });
      return NextResponse.json({
        received: true,
        voidedPurchase: true,
        reconciled: found,
      });
    } catch (error) {
      console.error("google_play_voided_rtdn_failed", envelope?.message?.messageId, error);
      return NextResponse.json({ error: "voided_purchase_reconcile_failed" }, { status: 500 });
    }
  }

  const subscription = rtdn?.subscriptionNotification;
  if (!subscription?.purchaseToken) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    await verifyAndPersistPlayPurchase({
      purchaseToken: String(subscription.purchaseToken),
      sourceEvent: rtdnEventName(Number(subscription.notificationType || 0)),
      providerUpdatedAt: occurredAt,
    });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("google_play_rtdn_sync_failed", envelope?.message?.messageId, error);
    return NextResponse.json({ error: "rtdn_sync_failed" }, { status: 500 });
  }
}
