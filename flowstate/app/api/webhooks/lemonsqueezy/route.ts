import { NextResponse } from "next/server";
import { verifyLemonSqueezySignature } from "@/lib/security/webhook";
import { createServiceClient } from "@/lib/supabase/server";

// Webhooks must run on the Node runtime (needs crypto + raw body).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired"
  | "trialing";
type SubscriptionPlan = "free" | "monthly" | "yearly" | "lifetime";

// Map Lemon Squeezy status → our enum.
function mapStatus(ls: string): SubscriptionStatus {
  switch (ls) {
    case "active":
      return "active";
    case "on_trial":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "active";
  }
}

export async function POST(req: Request) {
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
  const attributes = event?.data?.attributes ?? {};
  const subscriptionId: string | undefined = event?.data?.id;

  // We only act on subscription lifecycle events that carry our user_id.
  if (!eventName.startsWith("subscription_") || !userId || !subscriptionId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  // Derive plan by variant ID first (our LS variants are both auto-named "Default",
  // so name-matching alone would record every yearly sub as "monthly"), then fall
  // back to the variant name for safety.
  const variantId = String(attributes.variant_id ?? "");
  const variantName: string = (attributes.variant_name ?? "").toLowerCase();
  const plan: SubscriptionPlan = variantName.includes("life")
    ? "lifetime"
    : variantId === process.env.LEMONSQUEEZY_VARIANT_YEARLY || variantName.includes("year")
      ? "yearly"
      : "monthly";

  const supabase = await createServiceClient();

  // 3. Protect against replay and out-of-order execution
  const providerUpdatedAt: string | undefined = attributes.updated_at;
  if (providerUpdatedAt) {
    const { data: existing } = await supabase
      .from("flowstate_subscriptions")
      .select("provider_updated_at")
      .eq("provider_subscription_id", subscriptionId)
      .maybeSingle();

    if (existing?.provider_updated_at) {
      if (new Date(providerUpdatedAt) <= new Date(existing.provider_updated_at)) {
        return NextResponse.json({ received: true, ignored: true, reason: "older_event" });
      }
    }
  }

  const { error } = await supabase.from("flowstate_subscriptions").upsert(
    {
      user_id: userId,
      provider: "lemonsqueezy",
      provider_subscription_id: subscriptionId,
      provider_customer_id: attributes.customer_id?.toString() ?? null,
      status: mapStatus(attributes.status ?? "active"),
      plan,
      current_period_start: attributes.renews_at
        ? new Date(attributes.created_at).toISOString()
        : null,
      current_period_end: attributes.ends_at ?? attributes.renews_at ?? null,
      updated_at: new Date().toISOString(),
      provider_updated_at: providerUpdatedAt ? new Date(providerUpdatedAt).toISOString() : null,
    },
    { onConflict: "provider_subscription_id" }
  );

  if (error) {
    // Return 500 so Lemon Squeezy retries.
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Mirror plan onto the profile for quick reads (only if active or trialing, or cancelled with remaining time).
  const statusMapped = mapStatus(attributes.status ?? "active");
  const isCancelledAndActive = statusMapped === "cancelled" && (!attributes.ends_at || new Date(attributes.ends_at) > new Date());
  const isPlanActive = ["active", "trialing"].includes(statusMapped) || isCancelledAndActive;
  const profilePlan = isPlanActive ? plan : "free";

  await supabase
    .from("flowstate_profiles")
    .update({ plan: profilePlan })
    .eq("id", userId);

  return NextResponse.json({ received: true });
}
