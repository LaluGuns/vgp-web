export type MobileBillingPlanId = "monthly" | "yearly";

export interface MobileBillingPlan {
  plan: MobileBillingPlanId;
  productId: string;
  basePlanId: string;
  name: string;
  description: string;
  offerId?: string;
  displayPrice: string;
  currencyCode: string;
  priceAmountMicros: number;
  pricingPhases: Array<{
    formattedPrice: string;
    priceAmountMicros: number;
    priceCurrencyCode: string;
    billingPeriod: string;
    billingCycleCount: number;
    recurrenceMode: number;
  }>;
}

export interface MobileBillingPurchaseResult {
  state: string;
  entitled?: boolean;
  hasPending?: boolean;
}

export interface FlowMobileBillingRuntime {
  loadPlans: () => Promise<MobileBillingPlan[]>;
  purchase: (plan: MobileBillingPlanId) => Promise<MobileBillingPurchaseResult>;
  restore: () => Promise<MobileBillingPurchaseResult>;
}

declare global {
  interface Window {
    __FLOW_MOBILE__?: boolean;
    __FLOW_MOBILE_BILLING__?: FlowMobileBillingRuntime;
  }
}

export function isFlowNativeShell(): boolean {
  return typeof window !== "undefined" && window.__FLOW_MOBILE__ === true;
}

export function flowMobileBillingRuntime(): FlowMobileBillingRuntime | null {
  if (typeof window === "undefined") return null;
  return window.__FLOW_MOBILE_BILLING__ ?? null;
}
