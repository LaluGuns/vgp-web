import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import {
  mapSubscriptionStatus,
  mapVariantToPlan,
  selectActivePlan,
  validIsoDate,
} from "@/lib/security/subscription";
import { verifyLemonSqueezySignature } from "@/lib/security/webhook";
import { createServiceClient } from "@/lib/supabase/server";
import { captureSubscriptionEvent } from "@/lib/server-analytics";

async function syncProfilePlan(supabase: Awaited<ReturnType<typeof createServiceClient>>, userId: string) {
  const { data, error } = await supabase
    .from("flowstate_subscriptions")
    .select("status, plan, current_period_end")
    .eq("user_id", userId);
  if (error) return error;

  return (await supabase
    .from("flowstate_profiles")
    .update({ plan: selectActivePlan(data ?? []) })
    .eq("id", userId)).error;
}

// Webhooks must run on the Node runtime (needs crypto + raw body).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 1_048_576) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const ip = clientIp(req.headers);
  const rl = await rateLimit(`webhook:lemonsqueezy:${ip}`, {
    limit: 120,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))) },
      }
    );
  }

  // 1. Read RAW body and verify HMAC signature BEFORE parsing.
  const raw = await req.text();
  const signature = req.headers.get("x-signature") ?? "";

  let valid = false;
  try {
    valid = verifyLemonSqueezySignature(raw, signature);
  } catch {
    // Secret not configured — fail closed.
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }
  if (!valid) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // 2. Parse the verified payload.
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

  // Subscription invoice refunds identify the exact subscription. Partial
  // refunds keep access; a full refund expires that entitlement immediately.
  if (eventName === "subscription_payment_refunded") {
    if (attributes.refunded !== true && attributes.status !== "refunded") {
      return NextResponse.json({ received: true, ignored: true, reason: "partial_refund" });
    }
    const refundedSubscriptionId = String(attributes.subscription_id ?? "");
    const providerUpdatedAt = validIsoDate(attributes.updated_at);
    if (!refundedSubscriptionId || !providerUpdatedAt) {
      return NextResponse.json({ error: "invalid_refund_payload" }, { status: 422 });
    }

    const { data: existing, error: lookupError } = await supabase
      .from("flowstate_subscriptions")
      .select("id, user_id, provider_updated_at")
      .eq("provider_subscription_id", refundedSubscriptionId)
      .maybeSingle();
    if (lookupError) return NextResponse.json({ error: "db_error" }, { status: 500 });
    if (!existing) return NextResponse.json({ received: true, ignored: true, reason: "unknown_subscription" });
    if (existing.provider_updated_at && new Date(providerUpdatedAt) < new Date(existing.provider_updated_at)) {
      return NextResponse.json({ received: true, ignored: true, reason: "older_event" });
    }

    const { error: refundError } = await supabase
      .from("flowstate_subscriptions")
      .update({
        status: "expired",
        current_period_end: validIsoDate(attributes.refunded_at) ?? providerUpdatedAt,
        provider_updated_at: providerUpdatedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", refundedSubscriptionId);
    if (refundError || await syncProfilePlan(supabase, existing.user_id)) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    // A full refund revokes only grants issued from this exact canonical
    // subscription. Normal cancellation never reaches this branch, so already
    // published content keeps its perpetual receipt after cancellation.
    const { error: grantRevokeError } = await supabase
      .from("flowstate_creator_license_grants")
      .update({
        revoked_at: validIsoDate(attributes.refunded_at) ?? providerUpdatedAt,
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
      occurredAt: validIsoDate(attributes.refunded_at) ?? providerUpdatedAt,
      acquisition,
    });
    return NextResponse.json({ received: true });
  }

  // We only act on subscription lifecycle events that carry our user_id.
  if (!eventName.startsWith("subscription_") || !userId || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  // Variant names are both auto-named "Default", so entitlement is granted only
  // when the signed payload carries an explicitly configured variant ID.
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

  // 3. Protect against replay and out-of-order execution
  const { data: existing, error: lookupError } = await supabase
    .from("flowstate_subscriptions")
    .select("provider_updated_at")
    .eq("provider_subscription_id", subscriptionId)
    .maybeSingle();
  if (lookupError) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  if (existing?.provider_updated_at) {
    if (new Date(providerUpdatedAt) < new Date(existing.provider_updated_at)) {
      return NextResponse.json({ received: true, ignored: true, reason: "older_event" });
    }
  }

  const { error } = await supabase.from("flowstate_subscriptions").upsert(
    {
      user_id: userId,
      provider: "lemonsqueezy",
      provider_subscription_id: subscriptionId,
      provider_customer_id: attributes.customer_id?.toString() ?? null,
      status: statusMapped,
      plan,
      current_period_start: renewsAt ? createdAt : null,
      current_period_end: endsAt ?? renewsAt,
      updated_at: new Date().toISOString(),
      provider_updated_at: providerUpdatedAt,
    },
    { onConflict: "provider_subscription_id" }
  );

  if (error) {
    // Return 500 so Lemon Squeezy retries.
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Recalculate across every subscription so one expired/refunded subscription
  // cannot hide another valid entitlement.
  const profileError = await syncProfilePlan(supabase, userId);
  if (profileError) {
    // Returning 5xx ensures Lemon Squeezy retries instead of leaving profile
    // entitlement out of sync with the canonical subscription row.
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  await captureSubscriptionEvent({
    eventName,
    status: statusMapped,
    userId,
    plan,
    eventId: event?.meta?.webhook_id,
    occurredAt: providerUpdatedAt,
    acquisition,
  });

  return NextResponse.json({ received: true });
}
