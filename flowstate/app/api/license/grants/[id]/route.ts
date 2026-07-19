import { NextResponse } from "next/server";
import {
  assertCreatorLicenseEnabled,
  creatorLicenseErrorResponse,
  requireCreatorLicenseUser,
} from "@/lib/creator-license/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    assertCreatorLicenseEnabled();
    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "invalid_grant_id" }, { status: 400 });
    }

    const user = await requireCreatorLicenseUser();
    const service = await createServiceClient();
    const { data, error } = await service
      .from("flowstate_creator_license_grants")
      .select(
        "id, terms_version, catalog_version, eligible_genres, plan_snapshot, granted_at, revoked_at, revocation_reason"
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: "license_database_unavailable" }, { status: 503 });
    }
    if (!data) return NextResponse.json({ error: "grant_not_found" }, { status: 404 });
    return NextResponse.json({ grant: data });
  } catch (error) {
    const failure = creatorLicenseErrorResponse(error);
    return NextResponse.json({ error: failure.code }, { status: failure.status });
  }
}

