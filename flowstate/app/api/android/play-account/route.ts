import { NextResponse } from "next/server";
import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import { bindPlayAccount } from "@/lib/google-play";
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
    const limit = await rateLimit(`flow:play-account:${user.id}:${clientIp(req.headers)}`, {
      limit: 12,
      windowMs: 60_000,
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
    console.error("google_play_account_rate_limit_failed", error);
    return NextResponse.json({ error: "rate_limit_unavailable" }, { status: 503 });
  }

  try {
    const obfuscatedAccountId = await bindPlayAccount(user.id);
    return NextResponse.json({ registered: true, obfuscatedAccountId });
  } catch (error) {
    console.error("google_play_account_binding_failed", error);
    return NextResponse.json({ error: "billing_account_binding_failed" }, { status: 500 });
  }
}
