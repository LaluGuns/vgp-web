import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import {
  mapSubscriptionStatus,
  mapVariantToPlan,
  validIsoDate,
  type SubscriptionPlan,
} from "@/lib/security/subscription";
import { applySubscriptionState } from "@/lib/security/subscription-state";
import { verifyLemonSqueezySignature } from "@/lib/security/webhook";
import { createServiceClient } from "@/lib/supabase/server";
import { captureSubscriptionEvent } from "@/lib/server-analytics";

async function syncProfilePlan(userId: string) {
  const supabase = await createServiceClient();
  const { error } = await supabase.rpc("flowstate_recompute_profile_plan", { p_user_id: userId });
  return error;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 1_048_576) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  try {
    const rl = await rateLimit(`webhook:lemonsqueezy:${clientIp(req.headers)}`, {
      limit: 120,
      windowMs: 60_000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))) },
        },
      );
    }
  } catch (error) {
    console.error("lemonsqueezy_rate_limit_failed", error);
    return NextResponse.json({ error: "rate_limit_unavailable" }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  let valid = false;
  try {
    valid = verifyLemonSqueezySignature(raw, signature);
  } catch {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const eventName: string = event?.meta?.event_name ?? "";
  const userId: string | undefined = event?.meta?.custom_data?.user_id;
  const acquisition = {
    sessionAcquisition: event?.meta?.custom_data?.session_acquisition,
    firstTouchChannel: event?.meta?.custom_data?.first_touch_channel,
    acquisitionSessionId: event?.meta?.custom_data?.acquisition_session_id,
    referrerHost: event?.meta?.custom_data?.referrer_host,
    landingPath: event?.meta?.custom_data?.landing_path,
    locale: event?.meta?.custom_data?.locale,
    market: event?.meta?.custom_data?.market,
    cluster: event?.meta?.custom_data?.cluster,
  };
  const attributes = event?.data?.attributes ?? {};
  const subscriptionId: string | undefined = event?.data?.id;

  const supabase = await createServiceClient();

  if (eventName === "subscription_payment_refunded") {
    if (attributes.refunded !== true && attributes.status !== "refunded") {
      return NextResponse.json({ received: true, ignored: true, reason: "partial_refund" });
    }

    const refundedSubscriptionId = String(attributes.subscription_id ?? "").trim();
    const providerUpdatedAt = validIsoDate(attributes.updated_at);
    if (!refundedSubscriptionId || !providerUpdatedAt) {
      return NextResponse.json({ error: "invalid_refund_payload" }, { status: 422 });
    }

    const { data: existing, error: lookupError } = await supabase
      .from("flowstate_subscriptions")
      .select("id,user_id,provider,provider_customer_id,status,plan,current_period_start,current_period_end")
      .eq("provider_subscription_id", refundedSubscriptionId)
      .maybeSingle();
    if (lookupError) return NextResponse.json({ error: "db_error" }, { status: 500 });
    if (!existing) return NextResponse.json({ received: true, ignored: true, reason: "unknown_subscription" });
    if (existing.provider !== "lemonsqueezy") {
      console.error("lemonsqueezy_subscription_owner_conflict", refundedSubscriptionId);
      return NextResponse.json({ error: "subscription_owner_conflict" }, { status: 409 });
    }

    let applyResult: "applied" | "stale";
    try {
      applyResult = await applySubscriptionState({
        userId: existing.user_id,
        provider: "lemonsqueezy",
        providerSubscriptionId: refundedSubscriptionId,
        providerCustomerId: existing.provider_customer_id,
        status: "expired",
        plan: existing.plan as SubscriptionPlan,
        currentPeriodStart: existing.current_period_start,
        currentPeriodEnd: validIsoDate(attributes.refunded_at) ?? providerUpdatedAt,
        providerUpdatedAt,
      });
    } catch (error) {
      console.error("lemonsqueezy_refund_state_failed", error);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    if (applyResult === "stale") {
      return NextResponse.json({ received: true, ignored: true, reason: "older_event" });
    }

    if (await syncProfilePlan(existing.user_id)) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    const revokedAt = validIsoDate(attributes.refunded_at) ?? providerUpdatedAt;
    const { error: grantRevokeError } = await supabase
      .from("flowstate_creator_license_grants")
      .update({
        revoked_at: revokedAt,
        revocation_reason: "subscription_refunded",
      })
      .eq("user_id", existing.user_id)
      .contains("plan_snapshot", { subscription_id: existing.id })
      .is("revoked_at", null);
    if (grantRevokeError) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    await captureSubscriptionEvent({
      eventName,
      status: "refunded",
      userId: existing.user_id,
      eventId: event?.meta?.webhook_id,
      occurredAt: revokedAt,
      provider: "lemonsqueezy",
      platform: "server",
      acquisition,
    });
    return NextResponse.json({ received: true });
  }

  if (!eventName.startsWith("subscription_") || !userId || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const plan = mapVariantToPlan(attributes.variant_id, {
    monthly: process.env.LEMONSQUEEZY_VARIANT_MONTHLY,
    yearly: process.env.LEMONSQUEEZY_VARIANT_YEARLY,
    lifetime: process.env.LEMONSQUEEZY_VARIANT_LIFETIME,
  });
  const statusMapped = mapSubscriptionStatus(attributes.status);
  if (!statusMapped) {
    return NextResponse.json({ error: "unknown_subscription_status" }, { status: 422 });
  }
  if (!plan) {
    return NextResponse.json({ error: "unknown_subscription_variant" }, { status: 422 });
  }

  const providerUpdatedAt = validIsoDate(attributes.updated_at);
  if (!providerUpdatedAt) {
    return NextResponse.json({ error: "invalid_provider_updated_at" }, { status: 422 });
  }

  const createdAt = validIsoDate(attributes.created_at);
  const endsAt = validIsoDate(attributes.ends_at);
  const renewsAt = validIsoDate(attributes.renews_at);

  let applyResult: "applied" | "stale";
  try {
    applyResult = await applySubscriptionState({
      userId,
      provider: "lemonsqueezy",
      providerSubscriptionId: subscriptionId,
      providerCustomerId: attributes.customer_id?.toString() ?? null,
      status: statusMapped,
      plan,
      currentPeriodStart: renewsAt ? createdAt : null,
      currentPeriodEnd: endsAt ?? renewsAt,
      providerUpdatedAt,
    });
  } catch (error) {
    console.error("lemonsqueezy_subscription_state_failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (applyResult === "stale") {
    return NextResponse.json({ received: true, ignored: true, reason: "older_event" });
  }

  if (await syncProfilePlan(userId)) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  await captureSubscriptionEvent({
    eventName,
    status: statusMapped,
    userId,
    plan,
    eventId: event?.meta?.webhook_id,
    occurredAt: providerUpdatedAt,
    provider: "lemonsqueezy",
    platform: "server",
    acquisition,
  });

  return NextResponse.json({ received: true });
}
