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
      return NextResponse.json({ error: "invalid_id" }, { status: 400 });
    }
    const service = await createServiceClient();

    // 1. First check if id matches a Certificate Record
    const { data: cert } = await service
      .from("flowstate_creator_license_certificates")
      .select("id, grant_id, track_id, track_title, track_artist, track_genre, terms_version, catalog_version, issued_at, revoked_at")
      .eq("id", id)
      .maybeSingle();

    if (cert) {
      return NextResponse.json({
        type: "certificate",
        certificateId: cert.id,
        grantId: cert.grant_id,
        valid: cert.revoked_at === null,
        issuedAt: cert.issued_at,
        trackId: cert.track_id,
        trackTitle: cert.track_title,
        trackArtist: cert.track_artist,
        trackGenre: cert.track_genre,
        termsVersion: cert.terms_version,
        catalogVersion: cert.catalog_version,
        issuer: "Chill Music Division / Virzy Guns Production",
      });
    }

    // 2. Fall back to checking Grant Record
    const { data: grant, error } = await service
      .from("flowstate_creator_license_grants")
      .select("id, terms_version, catalog_version, eligible_genres, granted_at, revoked_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "license_database_unavailable" }, { status: 503 });
    }
    if (!grant) return NextResponse.json({ error: "record_not_found" }, { status: 404 });

    return NextResponse.json({
      type: "grant",
      grantId: grant.id,
      valid: grant.revoked_at === null,
      issuedAt: grant.granted_at,
      termsVersion: grant.terms_version,
      catalogVersion: grant.catalog_version,
      eligibleGenres: grant.eligible_genres,
      issuer: "Chill Music Division / Virzy Guns Production",
    });
  } catch (error) {
    const failure = creatorLicenseErrorResponse(error);
    return NextResponse.json({ error: failure.code }, { status: failure.status });
  }
}
