export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "expired"
  | "trialing";

export type SubscriptionPlan = "monthly" | "yearly" | "lifetime";

export function mapSubscriptionStatus(value: unknown): SubscriptionStatus | null {
  switch (value) {
    case "active":
      return "active";
    case "on_trial":
      return "trialing";
    case "past_due":
    case "unpaid":
    case "paused":
      return "past_due";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return null;
  }
}

export function mapVariantToPlan(
  variantId: unknown,
  variants: { monthly?: string; yearly?: string; lifetime?: string }
): SubscriptionPlan | null {
  const id = String(variantId ?? "");
  if (!id) return null;
  if (variants.monthly && id === variants.monthly) return "monthly";
  if (variants.yearly && id === variants.yearly) return "yearly";
  if (variants.lifetime && id === variants.lifetime) return "lifetime";
  return null;
}

export function validIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function isEntitlementActive(
  status: SubscriptionStatus,
  endsAt: string | null,
  now = Date.now()
): boolean {
  if (status === "active" || status === "trialing") return true;
  if (status !== "cancelled" || !endsAt) return false;
  return new Date(endsAt).getTime() > now;
}

export function selectActivePlan(
  subscriptions: Array<{ status: unknown; plan: unknown; current_period_end?: unknown }>,
  now = Date.now()
): SubscriptionPlan | "free" {
  const priority: Record<SubscriptionPlan, number> = { monthly: 1, yearly: 2, lifetime: 3 };
  let selected: SubscriptionPlan | "free" = "free";

  for (const subscription of subscriptions) {
    const status = mapSubscriptionStatus(subscription.status);
    const plan = subscription.plan;
    if (!status || (plan !== "monthly" && plan !== "yearly" && plan !== "lifetime")) continue;
    const endsAt = validIsoDate(subscription.current_period_end);
    if (!isEntitlementActive(status, endsAt, now)) continue;
    if (selected === "free" || priority[plan] > priority[selected]) selected = plan;
  }

  return selected;
}
