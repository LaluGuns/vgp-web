export type CheckoutInterval = "monthly" | "yearly";

export interface CheckoutInput {
  interval: CheckoutInterval;
  discountCode?: string;
}

const PRICES_CENTS: Record<CheckoutInterval, { standard: number; promo: number }> = {
  monthly: { standard: 999, promo: 499 },
  yearly: { standard: 5999, promo: 2999 },
};

const PROMO_CODE = "FLOWBRO";

/** Strictly parse the only client-controlled checkout fields we support. */
export function parseCheckoutInput(value: unknown): CheckoutInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const input = value as Record<string, unknown>;
  if (input.interval !== "monthly" && input.interval !== "yearly") return null;
  if (input.discountCode !== undefined && typeof input.discountCode !== "string") {
    return null;
  }

  const discountCode = input.discountCode?.trim();
  return {
    interval: input.interval,
    ...(discountCode ? { discountCode } : {}),
  };
}

export function checkoutPriceCents(input: CheckoutInput): number {
  const promoApplied = input.discountCode?.toUpperCase() === PROMO_CODE;
  return PRICES_CENTS[input.interval][promoApplied ? "promo" : "standard"];
}

/** Reject browser POSTs coming from another origin (CSRF defence in depth). */
export function isAllowedRequestOrigin(originHeader: string | null, requestUrl: string): boolean {
  if (!originHeader) return true;

  try {
    return new URL(originHeader).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

export function resolveAppOrigin(
  configuredUrl: string | undefined,
  requestUrl: string,
  production: boolean
): string | null {
  if (!configuredUrl && production) return null;

  try {
    const origin = new URL(configuredUrl ?? requestUrl).origin;
    if (production && !origin.startsWith("https://")) return null;
    return origin;
  } catch {
    return null;
  }
}

export function isTrustedCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "lemonsqueezy.com" || url.hostname.endsWith(".lemonsqueezy.com"));
  } catch {
    return false;
  }
}

export function checkoutUrlFromResponse(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const data = (value as Record<string, unknown>).data;
  if (!data || typeof data !== "object") return null;
  const attributes = (data as Record<string, unknown>).attributes;
  if (!attributes || typeof attributes !== "object") return null;
  const url = (attributes as Record<string, unknown>).url;
  return isTrustedCheckoutUrl(url) ? url : null;
}
