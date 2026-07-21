/**
 * Public price presentation. Checkout remains server-authoritative, but every
 * visible surface and schema document reads these same values so SEO copy
 * cannot drift from checkout pricing.
 */
export type SubscriptionInterval = "monthly" | "yearly";

export const FLOW_PRICING = {
  currency: "USD",
  promoCode: "FLOWBRO",
  plans: {
    monthly: {
      standardCents: 999,
      promoCents: 499,
      suffix: "/mo",
      isoDuration: "P1M",
    },
    yearly: {
      standardCents: 5999,
      promoCents: 2999,
      suffix: "/yr",
      isoDuration: "P1Y",
    },
  },
} as const;

export function priceCents(interval: SubscriptionInterval, promo = false) {
  const plan = FLOW_PRICING.plans[interval];
  return promo ? plan.promoCents : plan.standardCents;
}

export function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function priceLabel(interval: SubscriptionInterval, promo = false) {
  return `${formatUsd(priceCents(interval, promo))}${FLOW_PRICING.plans[interval].suffix}`;
}

export const STANDARD_ANNUAL_SAVINGS_PERCENT = Math.round(
  (1 - priceCents("yearly") / (priceCents("monthly") * 12)) * 100
);

export function pricingJsonLdOffers() {
  return (Object.keys(FLOW_PRICING.plans) as SubscriptionInterval[]).map((interval) => ({
    "@type": "Offer",
    price: (priceCents(interval) / 100).toFixed(2),
    priceCurrency: FLOW_PRICING.currency,
    billingDuration: FLOW_PRICING.plans[interval].isoDuration,
    category: "Subscription",
    url: "https://flow.virzyguns.com/en/pricing",
  }));
}
