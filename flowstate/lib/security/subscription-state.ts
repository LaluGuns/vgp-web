import { createServiceClient } from "@/lib/supabase/server";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/security/subscription";

export type SubscriptionProvider = "google_play" | "lemonsqueezy";
export type SubscriptionApplyResult = "applied" | "stale" | "owner_conflict" | "retry";

export async function applySubscriptionState(input: {
  userId: string;
  provider: SubscriptionProvider;
  providerSubscriptionId: string;
  providerCustomerId?: string | null;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  providerUpdatedAt: string;
}): Promise<"applied" | "stale"> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase.rpc("flowstate_apply_subscription_state", {
    p_user_id: input.userId,
    p_provider: input.provider,
    p_provider_subscription_id: input.providerSubscriptionId,
    p_provider_customer_id: input.providerCustomerId || null,
    p_status: input.status,
    p_plan: input.plan,
    p_current_period_start: input.currentPeriodStart || null,
    p_current_period_end: input.currentPeriodEnd || null,
    p_provider_updated_at: input.providerUpdatedAt,
  });
  if (error) throw error;

  const result = String(data || "") as SubscriptionApplyResult;
  if (!["applied", "stale", "owner_conflict", "retry"].includes(result)) {
    throw new Error("Invalid subscription-state RPC response");
  }
  if (result === "owner_conflict") throw new Error("Subscription token ownership conflict");
  if (result === "retry") throw new Error("Subscription state update needs retry");
  return result;
}
