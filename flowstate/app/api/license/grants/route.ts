import { NextResponse } from "next/server";
import { isAllowedRequestOrigin } from "@/lib/security/checkout";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { validateCreatorLicenseAcceptance } from "@/lib/creator-license/policy";
import {
  assertCreatorLicenseEnabled,
  creatorLicenseErrorResponse,
  findCurrentGrant,
  grantInsertPayload,
  requireActiveCreatorPlan,
  requireCreatorLicenseUser,
  setUserDisplayName,
} from "@/lib/creator-license/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedRequestOrigin(request.headers.get("origin"), request.url)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 4_096) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const ip = clientIp(request.headers);
  const rl = await rateLimit(`creator-license-grant:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.success) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))) },
      }
    );
  }

  let rawBody: Record<string, unknown> = {};
  try {
    rawBody = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const validation = validateCreatorLicenseAcceptance(rawBody);
  if (!validation.ok) {
    const status = validation.code === "terms_acceptance_required" ? 400 : 409;
    return NextResponse.json({ error: validation.code }, { status });
  }

  try {
    assertCreatorLicenseEnabled();
    const user = await requireCreatorLicenseUser();
    const entitlement = await requireActiveCreatorPlan(user.id);

    if (typeof rawBody.licenseeName === "string" && rawBody.licenseeName.trim().length > 0) {
      await setUserDisplayName(user.id, rawBody.licenseeName);
    }

    const current = await findCurrentGrant(user.id);
    if (current) return NextResponse.json({ grant: current, created: false });

    const service = await createServiceClient();
    const { data, error } = await service
      .from("flowstate_creator_license_grants")
      .insert(grantInsertPayload(user.id, entitlement, validation.acceptance))
      .select(
        "id, terms_version, terms_document_version, terms_document_sha256, catalog_version, eligible_genres, plan_snapshot, accepted_at, acceptance_method, granted_at, revoked_at, revocation_reason"
      )
      .single();
    if (error?.code === "23505") {
      const racedGrant = await findCurrentGrant(user.id);
      if (racedGrant) {
        return NextResponse.json({ grant: racedGrant, created: false });
      }
    }
    if (error || !data) {
      return NextResponse.json({ error: "license_database_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ grant: data, created: true }, { status: 201 });
  } catch (error) {
    const failure = creatorLicenseErrorResponse(error);
    return NextResponse.json({ error: failure.code }, { status: failure.status });
  }
}
