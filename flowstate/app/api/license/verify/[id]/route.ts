import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import {
  assertCreatorLicenseEnabled,
  creatorLicenseErrorResponse,
} from "@/lib/creator-license/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = clientIp(request.headers);
  const rl = await rateLimit(`creator-license-verify:${ip}`, {
    limit: 60,
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
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "invalid_grant_id" }, { status: 400 });
    }
    const service = await createServiceClient();
    const { data, error } = await service
      .from("flowstate_creator_license_grants")
      .select("id, terms_version, catalog_version, eligible_genres, granted_at, revoked_at")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: "license_database_unavailable" }, { status: 503 });
    }
    if (!data) return NextResponse.json({ error: "grant_not_found" }, { status: 404 });

    return NextResponse.json({
      grantId: data.id,
      valid: data.revoked_at === null,
      issuedAt: data.granted_at,
      termsVersion: data.terms_version,
      catalogVersion: data.catalog_version,
      eligibleGenres: data.eligible_genres,
    });
  } catch (error) {
    const failure = creatorLicenseErrorResponse(error);
    return NextResponse.json({ error: failure.code }, { status: failure.status });
  }
}

