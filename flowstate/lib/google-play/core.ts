import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { applySubscriptionState } from "@/lib/security/subscription-state";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/security/subscription";
import { captureSubscriptionEvent } from "@/lib/server-analytics";
import { ANDROID_PACKAGE, publisherFetch } from "@/lib/google-play/google-api";

export type SubscriptionPurchaseV2 = {
  startTime?: string;
  subscriptionState?: string;
  latestOrderId?: string;
  acknowledgementState?: string;
  linkedPurchaseToken?: string;
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  outOfAppPurchaseContext?: {
    expiredExternalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
    expiredPurchaseToken?: string;
  };
  lineItems?: Array<{
    productId?: string;
    expiryTime?: string;
    latestSuccessfulOrderId?: string;
    offerDetails?: { basePlanId?: string };
  }>;
};

type PurchaseDisposition = {
  status: SubscriptionStatus;
  entitled: boolean;
  acknowledge: boolean;
};

export function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function playAccountIdForUser(userId: string) {
  return sha256Hex(userId);
}

function validIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export async function bindPlayAccount(userId: string) {
  const supabase = await createServiceClient();
  const accountId = playAccountIdForUser(userId);
  const { error } = await supabase.from("flowstate_billing_accounts").upsert({
    provider: "google_play",
    provider_account_id: accountId,
    user_id: userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "provider,provider_account_id" });
  if (error) throw error;
  return accountId;
}

async function userForPlayAccount(accountId?: string | null) {
  if (!accountId) return null;
  const supabase = await createServiceClient();
  const { data, error } = await supabase.from("flowstate_billing_accounts")
    .select("user_id")
    .eq("provider", "google_play")
    .eq("provider_account_id", accountId)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

async function userForToken(token?: string | null) {
  if (!token) return null;
  const supabase = await createServiceClient();
  const { data, error } = await supabase.from("flowstate_subscriptions")
    .select("user_id")
    .eq("provider", "google_play")
    .eq("provider_subscription_id", sha256Hex(token))
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

function planForProduct(productId: string): SubscriptionPlan | null {
  if (productId === process.env.GOOGLE_PLAY_MONTHLY_PRODUCT_ID?.trim()) return "monthly";
  if (productId === process.env.GOOGLE_PLAY_YEARLY_PRODUCT_ID?.trim()) return "yearly";
  return null;
}

function configuredBasePlan(plan: SubscriptionPlan) {
  if (plan === "monthly") return process.env.GOOGLE_PLAY_MONTHLY_BASE_PLAN_ID?.trim() || null;
  if (plan === "yearly") return process.env.GOOGLE_PLAY_YEARLY_BASE_PLAN_ID?.trim() || null;
  return null;
}

function dispositionForState(state: string, expiry: string | null): PurchaseDisposition {
  const futureExpiry = Boolean(expiry && new Date(expiry).getTime() > Date.now());
  switch (state) {
    case "SUBSCRIPTION_STATE_ACTIVE":
    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      if (!futureExpiry) throw new Error("Google Play active subscription has no future expiry");
      return { status: "active", entitled: true, acknowledge: true };
    case "SUBSCRIPTION_STATE_CANCELED":
      if (!futureExpiry) throw new Error("Google Play cancelled subscription has no future expiry");
      return { status: "cancelled", entitled: true, acknowledge: true };
    case "SUBSCRIPTION_STATE_ON_HOLD":
    case "SUBSCRIPTION_STATE_PAUSED":
      return { status: "past_due", entitled: false, acknowledge: true };
    case "SUBSCRIPTION_STATE_PENDING":
      return { status: "past_due", entitled: false, acknowledge: false };
    case "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED":
    case "SUBSCRIPTION_STATE_EXPIRED":
      return { status: "expired", entitled: false, acknowledge: false };
    default:
      return { status: "expired", entitled: false, acknowledge: false };
  }
}

async function resolvePurchaseUser(
  purchase: SubscriptionPurchaseV2,
  token: string,
  expected?: string | null,
) {
  const direct = purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId?.trim() || null;
  const expired = purchase.outOfAppPurchaseContext?.expiredExternalAccountIdentifiers?.obfuscatedExternalAccountId?.trim() || null;
  const users = [...new Set((await Promise.all([
    userForToken(token),
    userForPlayAccount(direct),
    userForPlayAccount(expired),
    userForToken(purchase.linkedPurchaseToken),
    userForToken(purchase.outOfAppPurchaseContext?.expiredPurchaseToken),
  ])).filter((value): value is string => Boolean(value)))];

  if (expected) {
    if (!users.length) throw new Error("Google Play purchase has no provider-backed Flow account binding");
    if (users.some((userId) => userId !== expected)) throw new Error("Google Play purchase ownership conflict");
    const expectedHash = playAccountIdForUser(expected);
    if ((direct && direct !== expectedHash) || (expired && expired !== expectedHash)) {
      throw new Error("Google Play account identifier conflict");
    }
    return expected;
  }

  if (users.length !== 1) {
    throw new Error(users.length
      ? "Google Play purchase ownership conflict"
      : "Could not resolve Flow user for Google Play purchase");
  }
  return users[0];
}

async function acknowledgeSubscriptionPurchase(purchaseToken: string, productId: string) {
  await publisherFetch<void>(
    `/applications/${encodeURIComponent(ANDROID_PACKAGE)}/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`,
    { method: "POST", body: "{}" },
  );
}

export async function verifyAndPersistPlayPurchase(input: {
  purchaseToken: string;
  expectedUserId?: string | null;
  expectedProductId?: string | null;
  expectedBasePlanId?: string | null;
  restore?: boolean;
  sourceEvent?: string;
  providerUpdatedAt?: string;
}) {
  const purchaseToken = input.purchaseToken.trim();
  if (!purchaseToken || purchaseToken.length > 4096) throw new Error("Invalid Google Play purchase token");

  const purchase = await publisherFetch<SubscriptionPurchaseV2>(
    `/applications/${encodeURIComponent(ANDROID_PACKAGE)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`,
  );
  const userId = await resolvePurchaseUser(purchase, purchaseToken, input.expectedUserId);

  const lines = (purchase.lineItems || []).filter((line) => line.productId && planForProduct(line.productId));
  if (!lines.length) throw new Error("Purchase contains no configured Flow subscription product");
  lines.sort((a, b) => new Date(b.expiryTime || 0).getTime() - new Date(a.expiryTime || 0).getTime());

  const line = lines[0];
  const productId = String(line.productId);
  const plan = planForProduct(productId)!;
  const basePlanId = line.offerDetails?.basePlanId?.trim() || null;
  const requiredBasePlan = configuredBasePlan(plan);
  if (input.expectedProductId && input.expectedProductId !== productId) {
    throw new Error("Google Play product mismatch");
  }
  if (input.expectedBasePlanId && input.expectedBasePlanId !== basePlanId) {
    throw new Error("Google Play base plan mismatch");
  }
  if (requiredBasePlan && requiredBasePlan !== basePlanId) {
    throw new Error("Unexpected Google Play base plan");
  }

  const expiry = validIsoDate(line.expiryTime);
  const state = String(purchase.subscriptionState || "SUBSCRIPTION_STATE_UNSPECIFIED");
  const disposition = dispositionForState(state, expiry);
  const providerUpdatedAt = validIsoDate(input.providerUpdatedAt) || new Date().toISOString();
  const tokenHash = sha256Hex(purchaseToken);
  const startTime = validIsoDate(purchase.startTime);

  const result = await applySubscriptionState({
    userId,
    provider: "google_play",
    providerSubscriptionId: tokenHash,
    providerCustomerId: line.latestSuccessfulOrderId || purchase.latestOrderId || null,
    status: disposition.status,
    plan,
    currentPeriodStart: startTime,
    currentPeriodEnd: expiry,
    providerUpdatedAt,
  });

  if (result === "applied") {
    const supabase = await createServiceClient();
    const { error } = await supabase.rpc("flowstate_recompute_profile_plan", { p_user_id: userId });
    if (error) throw error;
  }

  let acknowledged = purchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";
  if (
    disposition.acknowledge &&
    purchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING"
  ) {
    // Persist entitlement first. If acknowledgement fails, the request fails so
    // the client/RTDN can retry. A stale retry still reaches this block because
    // Google remains the authority for acknowledgement state.
    await acknowledgeSubscriptionPurchase(purchaseToken, productId);
    acknowledged = true;
  }

  const eventName = input.sourceEvent || (
    input.restore ? "google_play_subscription_recovered" : "google_play_subscription_activated"
  );
  await captureSubscriptionEvent({
    eventName,
    status: disposition.status,
    userId,
    plan,
    eventId: `${eventName}:${tokenHash}:${providerUpdatedAt}`,
    occurredAt: providerUpdatedAt,
    provider: "google_play",
    platform: input.expectedUserId ? "android" : "server",
  });

  return {
    verified: true as const,
    entitled: disposition.entitled,
    acknowledged,
    userId,
    plan,
    status: disposition.status,
    subscriptionState: state,
    productId,
    basePlanId,
    purchaseTokenHash: tokenHash,
    currentPeriodEnd: expiry,
  };
}

export function rtdnEventName(type: number) {
  const names: Record<number, string> = {
    1: "google_play_subscription_recovered",
    2: "google_play_subscription_renewed",
    3: "google_play_subscription_cancelled",
    4: "google_play_subscription_purchased",
    5: "google_play_subscription_on_hold",
    6: "google_play_subscription_grace_period",
    7: "google_play_subscription_restarted",
    8: "google_play_subscription_price_change_confirmed",
    9: "google_play_subscription_deferred",
    10: "google_play_subscription_paused",
    11: "google_play_subscription_pause_schedule_changed",
    12: "google_play_subscription_revoked",
    13: "google_play_subscription_expired",
    17: "google_play_subscription_items_changed",
    18: "google_play_subscription_cancellation_scheduled",
    19: "google_play_subscription_price_change_updated",
    20: "google_play_subscription_pending_purchase_cancelled",
    22: "google_play_subscription_price_step_up_consent_updated",
  };
  return names[type] || `google_play_subscription_notification_${type}`;
}

function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid bearer JWT");
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
    aud?: string | string[];
    email?: string;
    exp?: number;
    iat?: number;
    iss?: string;
  };
}

export async function verifyPubSubPushBearer(authHeader: string | null) {
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || token.length > 16_384) throw new Error("Missing or invalid Pub/Sub bearer token");

  const parts = token.split(".");
  const payload = decodeJwtPayload(token);
  const expectedAud = process.env.GOOGLE_PLAY_PUBSUB_AUDIENCE?.trim();
  const expectedEmail = process.env.GOOGLE_PLAY_PUBSUB_SERVICE_ACCOUNT_EMAIL?.trim();
  if (!expectedAud || !expectedEmail) throw new Error("Pub/Sub verification is not configured");

  const certs = await fetch("https://www.googleapis.com/oauth2/v3/certs", {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  }).then((response) => {
    if (!response.ok) throw new Error("Could not load Google signing keys");
    return response.json();
  }) as { keys?: Array<{ kid?: string; kty?: string; n?: string; e?: string; alg?: string }> };

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as {
    kid?: string;
    alg?: string;
  };
  const jwk = certs.keys?.find((key) => key.kid === header.kid);
  if (!jwk || header.alg !== "RS256") throw new Error("Unknown Pub/Sub signing key");

  const key = crypto.createPublicKey({ key: jwk as crypto.JsonWebKey, format: "jwk" });
  const validSignature = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${parts[0]}.${parts[1]}`),
    key,
    Buffer.from(parts[2], "base64url"),
  );
  if (!validSignature) throw new Error("Invalid Pub/Sub signature");

  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    !aud.includes(expectedAud) ||
    payload.email !== expectedEmail ||
    !payload.exp ||
    payload.exp <= nowSeconds ||
    (payload.iat != null && payload.iat > nowSeconds + 300) ||
    !["accounts.google.com", "https://accounts.google.com"].includes(payload.iss || "")
  ) {
    throw new Error("Invalid Pub/Sub token claims");
  }
}

export type VoidedPurchase = {
  purchaseToken?: string;
  orderId?: string;
  voidedTimeMillis?: string;
  voidedReason?: number;
  voidedSource?: number;
};

export async function listVoidedSubscriptionPurchases(input: {
  startTimeMs: number;
  endTimeMs: number;
  pageToken?: string | null;
  maxResults?: number;
}) {
  const q = new URLSearchParams({
    startTime: String(Math.trunc(input.startTimeMs)),
    endTime: String(Math.trunc(input.endTimeMs)),
    type: "1",
    "pageSelection.maxResults": String(Math.max(1, Math.min(1000, Math.trunc(input.maxResults || 200)))),
  });
  if (input.pageToken) q.set("pageSelection.token", input.pageToken);
  return publisherFetch<{
    voidedPurchases?: VoidedPurchase[];
    tokenPagination?: { nextPageToken?: string };
  }>(`/applications/${encodeURIComponent(ANDROID_PACKAGE)}/purchases/voidedpurchases?${q}`);
}

export async function reconcileVoidedPurchase(item: VoidedPurchase): Promise<boolean> {
  if (!item.purchaseToken) return false;
  const tokenHash = sha256Hex(item.purchaseToken);
  const supabase = await createServiceClient();
  const { data, error } = await supabase.from("flowstate_subscriptions")
    .select("user_id,plan,current_period_start,provider_customer_id")
    .eq("provider", "google_play")
    .eq("provider_subscription_id", tokenHash)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;

  const voidedMs = Number(item.voidedTimeMillis);
  const occurredAt = Number.isFinite(voidedMs) && voidedMs > 0
    ? new Date(voidedMs).toISOString()
    : new Date().toISOString();

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
  return true;
}
