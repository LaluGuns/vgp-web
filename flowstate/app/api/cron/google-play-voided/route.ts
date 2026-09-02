import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { listVoidedSubscriptionPurchases, reconcileVoidedPurchase } from "@/lib/google-play";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretMatches(configured: string | undefined, supplied: string | undefined): boolean {
  const expected = configured?.trim();
  const actual = supplied?.trim();
  if (!expected || !actual) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function authorized(req: Request): boolean {
  const supplied = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  return secretMatches(process.env.GOOGLE_PLAY_RECONCILE_SECRET, supplied)
    || secretMatches(process.env.CRON_SECRET, supplied);
}

async function reconcile(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const endTimeMs = Date.now();
  const requestedHours = Number(new URL(req.url).searchParams.get("hours") || "26");
  const hours = Number.isFinite(requestedHours)
    ? Math.min(Math.max(requestedHours, 1), 24 * 30)
    : 26;
  const startTimeMs = endTimeMs - hours * 60 * 60 * 1000;
  let pageToken: string | null | undefined;
  let scanned = 0;
  let reconciled = 0;
  let unknown = 0;
  const failures: string[] = [];

  do {
    let page;
    try {
      page = await listVoidedSubscriptionPurchases({
        startTimeMs,
        endTimeMs,
        pageToken,
        maxResults: 200,
      });
    } catch (error) {
      console.error("google_play_voided_list_failed", error);
      return NextResponse.json({ error: "voided_purchase_list_failed", scanned, reconciled }, { status: 502 });
    }

    for (const item of page.voidedPurchases || []) {
      scanned += 1;
      if (!item.purchaseToken) {
        unknown += 1;
        continue;
      }
      try {
        const found = await reconcileVoidedPurchase(item);
        if (found) reconciled += 1;
        else unknown += 1;
      } catch (error) {
        if (failures.length < 10) failures.push(error instanceof Error ? error.message : "unknown_error");
      }
    }
    pageToken = page.tokenPagination?.nextPageToken || null;
  } while (pageToken && scanned < 5000);

  if (pageToken) {
    return NextResponse.json({ error: "reconcile_scan_limit_reached", scanned, reconciled, unknown }, { status: 503 });
  }
  if (failures.length > 0) {
    return NextResponse.json(
      { error: "partial_reconcile_failure", scanned, reconciled, unknown, failures },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, scanned, reconciled, unknown });
}

export const GET = reconcile;
export const POST = reconcile;
