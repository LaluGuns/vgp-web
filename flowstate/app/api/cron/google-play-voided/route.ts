import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { listVoidedSubscriptionPurchases, reconcileVoidedPurchase } from "@/lib/google-play";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const configured = process.env.GOOGLE_PLAY_RECONCILE_SECRET?.trim();
  const supplied = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!configured || !supplied) return false;
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const endTimeMs = Date.now();
  const requestedHours = Number(new URL(req.url).searchParams.get("hours") || "26");
  const hours = Number.isFinite(requestedHours) ? Math.min(Math.max(requestedHours, 1), 24 * 30) : 26;
  const startTimeMs = endTimeMs - hours * 60 * 60 * 1000;
  let pageToken: string | null | undefined;
  let scanned = 0;
  let reconciled = 0;
  const failures: string[] = [];

  do {
    const page = await listVoidedSubscriptionPurchases({ startTimeMs, endTimeMs, pageToken, maxResults: 200 });
    for (const item of page.voidedPurchases || []) {
      scanned += 1;
      if (!item.purchaseToken) continue;
      try {
        await reconcileVoidedPurchase(item);
        reconciled += 1;
      } catch (error) {
        if (failures.length < 10) failures.push(error instanceof Error ? error.message : "unknown_error");
      }
    }
    pageToken = page.tokenPagination?.nextPageToken || null;
  } while (pageToken && scanned < 5000);

  if (failures.length > 0) {
    return NextResponse.json({ error: "partial_reconcile_failure", scanned, reconciled, failures }, { status: 500 });
  }
  return NextResponse.json({ ok: true, scanned, reconciled });
}
