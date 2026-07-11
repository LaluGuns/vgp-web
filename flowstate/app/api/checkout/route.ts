import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creates a Lemon Squeezy subscription checkout at a server-fixed price.
 * Body: { interval: "monthly" | "yearly", discountCode?: string }
 * The price is computed server-side and passed as custom_price; the user_id is
 * attached so the webhook (app/api/webhooks/lemonsqueezy) links the subscription.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = await rateLimit(`checkout:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { interval?: string; amountUsdCents?: number; discountCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const interval = body.interval === "yearly" ? "yearly" : "monthly";
  // Server-authoritative pricing: the client-sent amount is IGNORED (a client could
  // forge $1). Price is derived from interval + a server-validated promo code and
  // passed to Lemon Squeezy as custom_price. Keep in sync with the pricing page and
  // the Terms (legal.*.terms sec3). Promo (FLOWBRO) is an early-adopter price.
  const promoApplied =
    typeof body.discountCode === "string" &&
    body.discountCode.trim().toUpperCase() === "FLOWBRO";
  const PRICE_CENTS = {
    monthly: promoApplied ? 499 : 999,
    yearly: promoApplied ? 2999 : 5999,
  } as const;
  const amount = PRICE_CENTS[interval];

  // Require a signed-in user so the subscription can be linked via the webhook.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "login_required" }, { status: 401 });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId =
    interval === "yearly"
      ? process.env.LEMONSQUEEZY_VARIANT_YEARLY
      : process.env.LEMONSQUEEZY_VARIANT_MONTHLY;

  if (!apiKey || !storeId || !variantId) {
    return NextResponse.json(
      { error: "checkout_not_configured", message: "Payments not configured yet." },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const payload = {
    data: {
      type: "checkouts",
      attributes: {
        custom_price: amount, // cents, store currency (USD)
        product_options: {
          redirect_url: `${appUrl}/app?upgraded=1`,
          receipt_button_text: "Back to Flowstate",
        },
        checkout_data: {
          email: user.email ?? undefined,
          // Promo is applied via custom_price above, NOT an LS discount object
          // (passing an unknown discount_code would error the checkout).
          custom: { user_id: user.id },
        },
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(variantId) } },
      },
    },
  };

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) return NextResponse.json({ error: "no_url" }, { status: 502 });

  return NextResponse.json({ url });
}
