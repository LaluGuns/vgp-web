import { NextResponse } from "next/server";
import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4_096;

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
  const contentLength = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "request_too_large" }, { status: 413 });
  }

  const user = await authenticatedUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const limit = await rateLimit(`flow:account-delete:${user.id}:${clientIp(req.headers)}`, {
      limit: 3,
      windowMs: 60 * 60 * 1000,
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
    console.error("flow_account_delete_rate_limit_failed", error);
    return NextResponse.json({ error: "rate_limit_unavailable" }, { status: 503 });
  }

  let body: { confirmation?: unknown; acknowledgeSubscriptions?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const expected = (user.email || "DELETE").trim().toLowerCase();
  const confirmation = typeof body.confirmation === "string" ? body.confirmation.trim().toLowerCase() : "";
  if (!confirmation || confirmation !== expected) {
    return NextResponse.json({ error: "confirmation_mismatch" }, { status: 400 });
  }
  if (body.acknowledgeSubscriptions !== true) {
    return NextResponse.json({ error: "subscription_acknowledgement_required" }, { status: 400 });
  }

  try {
    const service = await createServiceClient();
    const { error } = await service.auth.admin.deleteUser(user.id, false);
    if (error) {
      console.error("flow_account_delete_failed", { code: error.code, status: error.status });
      return NextResponse.json({ error: "account_deletion_failed" }, { status: 500 });
    }

    return NextResponse.json(
      {
        deleted: true,
        retainedRecords:
          "Limited transaction and refund-review records may be de-identified and retained for legal, accounting, or fraud-prevention purposes. Issued Creator Music license records may retain licensee details where necessary to preserve license validity or defend legal rights.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("flow_account_delete_unavailable", error);
    return NextResponse.json({ error: "account_deletion_unavailable" }, { status: 503 });
  }
}
