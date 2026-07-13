import { NextResponse } from "next/server";
import {
  checkoutUrlFromResponse,
  checkoutPriceCents,
  isAllowedRequestOrigin,
  parseCheckoutInput,
  resolveAppOrigin,
} from "@/lib/security/checkout";
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
  if (!isAllowedRequestOrigin(req.headers.get("origin"), req.url)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 16_384) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const ip = clientIp(req.headers);
  const rl = await rateLimit(`checkout:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))) },
      }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const body = parseCheckoutInput(rawBody);
  if (!body) {
    return NextResponse.json({ error: "invalid_checkout_request" }, { status: 400 });
  }

  const { interval } = body;
  // Server-authoritative pricing: the client-sent amount is IGNORED (a client could
  // forge $1). Price is derived from interval + a server-validated promo code and
  // passed to Lemon Squeezy as custom_price. Keep in sync with the pricing page and
  // the Terms (legal.*.terms sec3). Promo (FLOWBRO) is an early-adopter price.
  const amount = checkoutPriceCents(body);

  // Require a signed-in user so the subscription can be linked via the webhook.
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: "auth_unavailable" }, { status: 503 });
  }
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

  const appUrl = resolveAppOrigin(
    process.env.NEXT_PUBLIC_APP_URL,
    req.url,
    process.env.NODE_ENV === "production"
  );
  if (!appUrl) {
    return NextResponse.json(
      { error: "checkout_not_configured", message: "App URL is not configured." },
      { status: 503 }
    );
  }

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

  let res: Response;
  try {
    res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return NextResponse.json({ error: "checkout_unavailable" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "checkout_failed" }, { status: 502 });
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return NextResponse.json({ error: "invalid_checkout_response" }, { status: 502 });
  }
  const url = checkoutUrlFromResponse(json);
  if (!url) {
    return NextResponse.json({ error: "invalid_checkout_url" }, { status: 502 });
  }

  return NextResponse.json({ url });
}
