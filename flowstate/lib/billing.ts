// Billing interval metadata for the pricing UI. Actual prices are
// server-authoritative — see PRICES_CENTS in lib/security/checkout.ts.
export const BILLING = {
  monthly: { id: "monthly", label: "Monthly", multiplier: 1, suffix: "/mo" },
  yearly: { id: "yearly", label: "Yearly", multiplier: 10, suffix: "/yr" },
} as const;

export type BillingInterval = keyof typeof BILLING;
