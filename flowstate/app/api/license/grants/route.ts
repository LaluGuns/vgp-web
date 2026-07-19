import { NextResponse } from "next/server";
import { isAllowedRequestOrigin } from "@/lib/security/checkout";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import {
  assertCreatorLicenseEnabled,
  creatorLicenseErrorResponse,
  findCurrentGrant,
  grantInsertPayload,
  requireActiveCreatorPlan,
  requireCreatorLicenseUser,
} from "@/lib/creator-license/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAllowedRequestOrigin(request.headers.get("origin"), request.url)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
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

  try {
    assertCreatorLicenseEnabled();
    const user = await requireCreatorLicenseUser();
    const entitlement = await requireActiveCreatorPlan(user.id);
    const current = await findCurrentGrant(user.id);
    if (current) return NextResponse.json({ grant: current, created: false });

    const service = await createServiceClient();
    const { data, error } = await service
      .from("flowstate_creator_license_grants")
      .insert(grantInsertPayload(user.id, entitlement))
      .select(
        "id, terms_version, catalog_version, eligible_genres, plan_snapshot, granted_at, revoked_at, revocation_reason"
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
