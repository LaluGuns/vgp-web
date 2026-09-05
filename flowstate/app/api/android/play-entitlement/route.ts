import { NextResponse } from "next/server";
import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import { bindPlayAccount, verifyAndPersistPlayPurchase } from "@/lib/google-play";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticatedUser(req: Request) {
  const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!bearer || bearer.length > 16_384) return null;
  const supabase = createSupabaseJs(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.auth.getUser(bearer);
  return error ? null : data.user;
}

export async function POST(req: Request) {
  const user = await authenticatedUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const limit = await rateLimit(`flow:play-entitlement:${user.id}:${clientIp(req.headers)}`, {
      limit: 30,
      windowMs: 5 * 60_000,
    });
    if (!limit.success) {
      return NextResponse.json(
        { error: "rate_limited" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))),
          },
        },
      );
    }
  } catch (error) {
    console.error("google_play_entitlement_rate_limit_failed", error);
    return NextResponse.json({ error: "rate_limit_unavailable" }, { status: 503 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 16_384) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const body = await req.json().catch(() => null) as null | {
    purchaseToken?: unknown;
    productId?: unknown;
    basePlanId?: unknown;
    restore?: unknown;
  };
  const purchaseToken = typeof body?.purchaseToken === "string" ? body.purchaseToken.trim() : "";
  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  const basePlanId = typeof body?.basePlanId === "string" ? body.basePlanId.trim() : null;
  if (
    !purchaseToken ||
    purchaseToken.length > 4096 ||
    !productId ||
    productId.length > 180 ||
    (basePlanId?.length ?? 0) > 180
  ) {
    return NextResponse.json({ error: "invalid_purchase_payload" }, { status: 400 });
  }

  try {
    await bindPlayAccount(user.id);
    const result = await verifyAndPersistPlayPurchase({
      purchaseToken,
      expectedUserId: user.id,
      expectedProductId: productId,
      expectedBasePlanId: basePlanId,
      restore: body?.restore === true,
    });
    return NextResponse.json({
      verified: result.verified,
      entitled: result.entitled,
      acknowledged: result.acknowledged,
      plan: result.plan,
      status: result.status,
      subscriptionState: result.subscriptionState,
      productId: result.productId,
      basePlanId: result.basePlanId,
      currentPeriodEnd: result.currentPeriodEnd,
    });
  } catch (error) {
    console.error("google_play_entitlement_verify_failed", error);
    return NextResponse.json({ error: "purchase_verification_failed" }, { status: 422 });
  }
}
