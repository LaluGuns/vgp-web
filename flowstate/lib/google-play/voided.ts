import { createServiceClient } from "@/lib/supabase/server";
import { applySubscriptionState } from "@/lib/security/subscription-state";
import { captureSubscriptionEvent } from "@/lib/server-analytics";
import { sha256Hex, type VoidedPurchase } from "@/lib/google-play/core";

function occurredAtFor(item: VoidedPurchase) {
  const ms = Number(item.voidedTimeMillis);
  return Number.isFinite(ms) && ms > 0 ? new Date(ms).toISOString() : new Date().toISOString();
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

  const chargeback = Number(item.voidedReason) === 7;
  const revocationReason = chargeback ? "subscription_chargeback" : "subscription_refunded";

  const { error: revokeError } = await supabase
    .from("flowstate_creator_license_grants")
    .update({ revoked_at: occurredAt, revocation_reason: revocationReason })
    .eq("user_id", data.user_id)
    .contains("plan_snapshot", { subscription_id: data.id })
    .is("revoked_at", null)
    .lte("granted_at", occurredAt);
  if (revokeError) throw revokeError;

  // A push notification does not carry the void reason. The daily pull API
  // can later identify a chargeback. Refine the reason without changing the
  // original revocation timestamp.
  if (chargeback) {
    const { error: refineError } = await supabase
      .from("flowstate_creator_license_grants")
      .update({ revocation_reason: "subscription_chargeback" })
      .eq("user_id", data.user_id)
      .contains("plan_snapshot", { subscription_id: data.id })
      .eq("revocation_reason", "subscription_refunded")
      .lte("revoked_at", occurredAt);
    if (refineError) throw refineError;
  }

  if (applyResult === "applied") {
    await captureSubscriptionEvent({
      eventName: chargeback
        ? "google_play_subscription_chargeback"
        : "google_play_subscription_refunded",
      status: "expired",
      userId: data.user_id,
      plan: data.plan,
      eventId: `voided:${item.orderId || tokenHash}:${occurredAt}`,
      occurredAt,
      provider: "google_play",
      platform: "server",
    });
  }

  return true;
}
