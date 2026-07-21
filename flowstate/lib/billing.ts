// Billing interval metadata for the pricing UI. Actual prices are
// server-authoritative — see PRICES_CENTS in lib/security/checkout.ts.
import { FLOW_PRICING } from "@/lib/pricing";

export const BILLING = {
  monthly: { id: "monthly", label: "Monthly", multiplier: 1, suffix: FLOW_PRICING.plans.monthly.suffix },
  yearly: { id: "yearly", label: "Yearly", multiplier: 10, suffix: FLOW_PRICING.plans.yearly.suffix },
} as const;

export type BillingInterval = keyof typeof BILLING;
