import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { listPendingRefundReviews, reviewPendingRefund, type GooglePlayRefundPreference } from "@/lib/google-play";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const configured = process.env.GOOGLE_PLAY_REFUND_REVIEW_SECRET?.trim();
  const supplied = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!configured || !supplied) return false;
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function guard(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const limit = await rateLimit(`flow:refund-review-admin:${clientIp(req.headers)}`, { limit: 30, windowMs: 60_000 });
    if (!limit.success) {
      return NextResponse.json({ error: "rate_limited" }, {
        status: 429,
        headers: { "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))) },
      });
    }
  } catch (error) {
    console.error("google_play_refund_review_rate_limit_failed", error);
    return NextResponse.json({ error: "rate_limit_unavailable" }, { status: 503 });
  }
  return null;
}

export async function GET(req: Request) {
  const blocked = await guard(req);
  if (blocked) return blocked;
  try {
    return NextResponse.json({ reviews: await listPendingRefundReviews(50) });
  } catch (error) {
    console.error("google_play_refund_review_list_failed", error);
    return NextResponse.json({ error: "refund_review_list_failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const blocked = await guard(req);
  if (blocked) return blocked;

  const body = await req.json().catch(() => null) as null | {
    providerReviewId?: unknown;
    refundPreference?: unknown;
    sampleContentProvided?: unknown;
    consumptionPercentageMilliunits?: unknown;
  };
  const providerReviewId = typeof body?.providerReviewId === "string" ? body.providerReviewId.trim() : "";
  const refundPreference = typeof body?.refundPreference === "string"
    ? body.refundPreference.trim().toUpperCase() as GooglePlayRefundPreference
    : null;
  const sampleContentProvided = body?.sampleContentProvided;
  const consumption = body?.consumptionPercentageMilliunits;

  if (!providerReviewId || !refundPreference || !["APPROVE", "DECLINE", "NEUTRAL"].includes(refundPreference)
      || typeof sampleContentProvided !== "boolean" || (consumption != null && typeof consumption !== "number")) {
    return NextResponse.json({ error: "invalid_refund_review_payload" }, { status: 400 });
  }

  try {
    const review = await reviewPendingRefund({
      providerReviewId,
      refundPreference,
      sampleContentProvided,
      consumptionPercentageMilliunits: consumption == null ? null : consumption,
    });
    return NextResponse.json({ reviewed: true, review });
  } catch (error) {
    console.error("google_play_refund_review_submit_failed", error);
    const message = error instanceof Error ? error.message : "unknown";
    const status = /not found/i.test(message) ? 404
      : /deadline|invalid|expired|processing|error/i.test(message) ? 409
      : 502;
    return NextResponse.json({ error: "refund_review_submit_failed" }, { status });
  }
}
