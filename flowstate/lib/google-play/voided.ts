import { createServiceClient } from "@/lib/supabase/server";
import { applySubscriptionState } from "@/lib/security/subscription-state";
import { captureSubscriptionEvent } from "@/lib/server-analytics";
import { sha256Hex, type VoidedPurchase } from "@/lib/google-play/core";

function occurredAtFor(item: VoidedPurchase) {
  const ms = Number(item.voidedTimeMillis);
  return Number.isFinite(ms) && ms > 0 ? new Date(ms).toISOString() : new Date().toISOString();
}

function finalReason(item: VoidedPurchase) {
  if (item.voidedReason == null) {
    return {
      eventName: "google_play_subscription_revoked",
      revocationReason: "subscription_revoked",
      finalClassification: false,
    } as const;
  }
  if (Number(item.voidedReason) === 7) {
    return {
      eventName: "google_play_subscription_chargeback",
      revocationReason: "subscription_chargeback",
      finalClassification: true,
    } as const;
  }
  return {
    eventName: "google_play_subscription_refunded",
    revocationReason: "subscription_refunded",
    finalClassification: true,
  } as const;
}

/**
 * Revokes the exact Flow subscription row referenced by a Google Play voided
 * purchase. Creator grants are revoked only when they were issued no later
 * than the void event, so a later valid re-subscription cannot lose a newer
 * legal grant because an older order was refunded.
 */
export async function reconcileVoidedPurchase(item: VoidedPurchase): Promise<boolean> {
  const purchaseToken = item.purchaseToken?.trim();
  if (!purchaseToken || purchaseToken.length > 4096) return false;

  const tokenHash = sha256Hex(purchaseToken);
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("flowstate_subscriptions")
    .select("id,user_id,plan,current_period_start,provider_customer_id")
    .eq("provider", "google_play")
    .eq("provider_subscription_id", tokenHash)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;

  const occurredAt = occurredAtFor(item);
  const classification = finalReason(item);
  const applyResult = await applySubscriptionState({
    userId: data.user_id,
    provider: "google_play",
    providerSubscriptionId: tokenHash,
    providerCustomerId: data.provider_customer_id,
    status: "expired",
    plan: data.plan,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: occurredAt,
    providerUpdatedAt: occurredAt,
  });

  if (applyResult === "applied") {
    const { error: recomputeError } = await supabase.rpc("flowstate_recompute_profile_plan", {
      p_user_id: data.user_id,
    });
    if (recomputeError) throw recomputeError;
  }

  const { error: revokeError } = await supabase
    .from("flowstate_creator_license_grants")
    .update({ revoked_at: occurredAt, revocation_reason: classification.revocationReason })
    .eq("user_id", data.user_id)
    .contains("plan_snapshot", { subscription_id: data.id })
    .is("revoked_at", null)
    .lte("granted_at", occurredAt);
  if (revokeError) throw revokeError;

  // Push RTDN identifies the order but not the detailed void reason. The daily
  // pull API later supplies voidedReason, so refine the legal audit marker
  // without changing the original revocation timestamp.
  if (classification.finalClassification) {
    const { error: refineError } = await supabase
      .from("flowstate_creator_license_grants")
      .update({ revocation_reason: classification.revocationReason })
      .eq("user_id", data.user_id)
      .contains("plan_snapshot", { subscription_id: data.id })
      .in("revocation_reason", ["subscription_revoked", "subscription_refunded"])
      .lte("revoked_at", occurredAt);
    if (refineError) throw refineError;
  }

  // The immediate push records an operational revocation. The daily pull may
  // later add one final financial classification (refund or chargeback), even
  // if the entitlement row is already stale at the same timestamp.
  if (applyResult === "applied" || classification.finalClassification) {
    await captureSubscriptionEvent({
      eventName: classification.eventName,
      status: "expired",
      userId: data.user_id,
      plan: data.plan,
      eventId: `${classification.eventName}:${item.orderId || tokenHash}:${occurredAt}`,
      occurredAt,
      provider: "google_play",
      platform: "server",
    });
  }

  return true;
}
