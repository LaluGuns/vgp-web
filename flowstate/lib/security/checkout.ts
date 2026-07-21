import { FLOW_PRICING, priceCents, type SubscriptionInterval } from "../pricing.ts";

export type CheckoutInterval = SubscriptionInterval;

export interface CheckoutInput {
  interval: CheckoutInterval;
  discountCode?: string;
  acquisition?: CheckoutAcquisition;
}

export interface CheckoutAcquisition {
  sessionAcquisition: "organic" | "referral" | "direct" | "internal";
  firstTouchChannel: string;
  acquisitionSessionId: string;
  referrerHost: string;
  landingPath: string;
  locale: string;
  market: string;
  cluster: string;
}

function parseAcquisition(value: unknown): CheckoutAcquisition | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const input = value as Record<string, unknown>;
  const channel = input.sessionAcquisition;
  if (!["organic", "referral", "direct", "internal"].includes(String(channel))) return undefined;
  const read = (name: string, max: number) => typeof input[name] === "string" && input[name].length <= max
    ? input[name] as string
    : null;
  const acquisitionSessionId = read("acquisitionSessionId", 80);
  const firstTouchChannel = read("firstTouchChannel", 24);
  const referrerHost = read("referrerHost", 253);
  const landingPath = read("landingPath", 240);
  const locale = read("locale", 16);
  const market = read("market", 32);
  const cluster = read("cluster", 64);
  if (!acquisitionSessionId || !firstTouchChannel || referrerHost === null || !landingPath || !locale || !market || !cluster) return undefined;
  if (!landingPath.startsWith("/")) return undefined;
  return { sessionAcquisition: channel as CheckoutAcquisition["sessionAcquisition"], firstTouchChannel, acquisitionSessionId, referrerHost, landingPath, locale, market, cluster };
}

/** Strictly parse the only client-controlled checkout fields we support. */
export function parseCheckoutInput(value: unknown): CheckoutInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const input = value as Record<string, unknown>;
  if (input.interval !== "monthly" && input.interval !== "yearly") return null;
  if (input.discountCode !== undefined && typeof input.discountCode !== "string") {
    return null;
  }

  const discountCode = input.discountCode?.trim();
  const acquisition = parseAcquisition(input.acquisition);
  return {
    interval: input.interval,
    ...(discountCode ? { discountCode } : {}),
    ...(acquisition ? { acquisition } : {}),
  };
}

export function checkoutPriceCents(input: CheckoutInput): number {
  const promoApplied = input.discountCode?.toUpperCase() === FLOW_PRICING.promoCode;
  return priceCents(input.interval, promoApplied);
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
