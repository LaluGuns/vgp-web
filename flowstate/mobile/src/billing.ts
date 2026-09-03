import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/stores/app-store";
import { flowBilling } from "./native-bridge";

export type FlowPlayPlan = "monthly" | "yearly";

type PlayCatalogItem = {
  plan: FlowPlayPlan;
  productId: string;
  basePlanId: string;
};

type PlayAccountResponse = {
  registered: boolean;
  obfuscatedAccountId: string;
  products: PlayCatalogItem[];
};

type PricingPhase = {
  formattedPrice: string;
  priceAmountMicros: number;
  priceCurrencyCode: string;
  billingPeriod: string;
  billingCycleCount: number;
  recurrenceMode: number;
};

type StoreOffer = {
  basePlanId: string;
  offerId?: string | null;
  offerToken: string;
  pricingPhases: PricingPhase[];
};

type StoreProduct = {
  productId: string;
  name: string;
  title: string;
  description: string;
  productType: string;
  offers: StoreOffer[];
};

export type ResolvedPlayPlan = PlayCatalogItem & {
  name: string;
  description: string;
  offerId?: string;
  displayPrice: string;
  currencyCode: string;
  priceAmountMicros: number;
  pricingPhases: PricingPhase[];
};

type PurchaseResult = {
  state: string;
  purchaseToken?: string;
  productId?: string;
};

type RestoredPurchase = {
  state: string;
  purchaseToken: string;
  productId: string;
};

type EntitlementResponse = {
  verified?: boolean;
  entitled?: boolean;
  acknowledged?: boolean;
  plan?: string;
  status?: string;
  subscriptionState?: string;
  productId?: string;
  basePlanId?: string | null;
  currentPeriodEnd?: string | null;
  error?: string;
};

async function authContext() {
  if (!isSupabaseConfigured()) throw new Error("AUTH_NOT_CONFIGURED");
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const accessToken = data.session?.access_token;
  const userId = data.session?.user?.id;
  if (!accessToken || !userId) throw new Error("SIGN_IN_REQUIRED");
  return { accessToken, userId };
}

async function postAuthed<T>(path: string, accessToken: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) {
    const error = new Error(payload.error || `FLOW_API_${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return payload;
}

async function accountAndProducts() {
  const { accessToken, userId } = await authContext();
  const account = await postAuthed<PlayAccountResponse>("/api/android/play-account", accessToken);
  if (!/^[a-f0-9]{64}$/i.test(account.obfuscatedAccountId || "")) {
    throw new Error("INVALID_PLAY_ACCOUNT_BINDING");
  }
  if (!Array.isArray(account.products) || account.products.length !== 2) {
    throw new Error("INVALID_PLAY_PRODUCT_CATALOG");
  }
  const billing = flowBilling();
  if (!billing?.getProducts) throw new Error("PLAY_BILLING_UNAVAILABLE");
  const storeResult = await billing.getProducts({ productIds: account.products.map((item) => item.productId) });
  return {
    accessToken,
    userId,
    account,
    storeProducts: (storeResult.products || []) as StoreProduct[],
  };
}

function chooseOffer(product: StoreProduct, configured: PlayCatalogItem): StoreOffer | null {
  const eligible = (product.offers || []).filter((offer) => offer.basePlanId === configured.basePlanId);
  return eligible.find((offer) => !offer.offerId) || eligible[0] || null;
}

export async function loadPlayPlans(): Promise<ResolvedPlayPlan[]> {
  const { account, storeProducts } = await accountAndProducts();
  return account.products.map((configured) => {
    const product = storeProducts.find((item) => item.productId === configured.productId);
    if (!product) throw new Error(`PLAY_PRODUCT_UNAVAILABLE:${configured.plan}`);
    const offer = chooseOffer(product, configured);
    if (!offer || !offer.offerToken || !offer.pricingPhases?.length) {
      throw new Error(`PLAY_OFFER_UNAVAILABLE:${configured.plan}`);
    }
    const recurring = offer.pricingPhases[offer.pricingPhases.length - 1];
    return {
      ...configured,
      name: product.name,
      description: product.description,
      offerId: offer.offerId || undefined,
      displayPrice: recurring.formattedPrice,
      currencyCode: recurring.priceCurrencyCode,
      priceAmountMicros: recurring.priceAmountMicros,
      pricingPhases: offer.pricingPhases,
    };
  });
}

async function verifyPurchase(
  accessToken: string,
  userId: string,
  configured: PlayCatalogItem,
  purchaseToken: string,
  restore: boolean,
): Promise<EntitlementResponse> {
  const result = await postAuthed<EntitlementResponse>("/api/android/play-entitlement", accessToken, {
    purchaseToken,
    productId: configured.productId,
    basePlanId: configured.basePlanId,
    restore,
  });
  if (result.entitled === true) {
    useAppStore.getState().setPremium(true, userId);
  }
  return result;
}

export async function purchasePlayPlan(plan: FlowPlayPlan) {
  const { accessToken, userId, account, storeProducts } = await accountAndProducts();
  const configured = account.products.find((item) => item.plan === plan);
  if (!configured) throw new Error("PLAY_PLAN_NOT_CONFIGURED");
  const product = storeProducts.find((item) => item.productId === configured.productId);
  if (!product) throw new Error("PLAY_PRODUCT_UNAVAILABLE");
  const offer = chooseOffer(product, configured);
  if (!offer) throw new Error("PLAY_OFFER_UNAVAILABLE");

  const billing = flowBilling();
  if (!billing?.purchase || !billing.restore) throw new Error("PLAY_BILLING_UNAVAILABLE");
  const restored = await billing.restore();
  const owned = (restored.purchases || []).find((purchase) => purchase.state === "PURCHASED");

  if (owned?.productId === configured.productId && owned.purchaseToken) {
    const entitlement = await verifyPurchase(accessToken, userId, configured, owned.purchaseToken, true);
    return { state: "PURCHASED", entitlement, restored: true };
  }

  const result = await billing.purchase({
    productId: configured.productId,
    basePlanId: configured.basePlanId,
    offerId: offer.offerId || undefined,
    obfuscatedAccountId: account.obfuscatedAccountId,
    ...(owned?.purchaseToken && owned.productId
      ? {
          oldPurchaseToken: owned.purchaseToken,
          oldProductId: owned.productId,
          replacementMode: "DEFERRED" as const,
        }
      : {}),
  }) as PurchaseResult;

  if (result.state === "PENDING") {
    return { state: "PENDING", entitlement: null, restored: false };
  }
  if (result.state !== "PURCHASED" || !result.purchaseToken) {
    return { state: result.state || "ERROR", entitlement: null, restored: false };
  }

  const entitlement = await verifyPurchase(accessToken, userId, configured, result.purchaseToken, false);
  return { state: "PURCHASED", entitlement, restored: false };
}

export async function restorePlayPurchases() {
  const { accessToken, userId, account } = await accountAndProducts();
  const billing = flowBilling();
  if (!billing?.restore) throw new Error("PLAY_BILLING_UNAVAILABLE");
  const result = await billing.restore();
  const verified: EntitlementResponse[] = [];
  let hasPending = false;

  for (const purchase of (result.purchases || []) as RestoredPurchase[]) {
    const configured = account.products.find((item) => item.productId === purchase.productId);
    if (!configured || !purchase.purchaseToken) continue;
    if (purchase.state === "PENDING") {
      hasPending = true;
      continue;
    }
    if (purchase.state !== "PURCHASED") continue;
    verified.push(await verifyPurchase(accessToken, userId, configured, purchase.purchaseToken, true));
  }

  return {
    entitled: verified.some((item) => item.entitled === true),
    hasPending,
    verified,
  };
}
