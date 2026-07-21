import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  CREATOR_CATALOG_VERSION,
  CREATOR_GENRES,
  CREATOR_RELEASE_LABEL,
  CREATOR_TERMS_VERSION,
  selectActiveCreatorPlan,
  validateLicenseeName,
  type ActiveCreatorPlan,
  type CreatorLicenseAcceptance,
} from "@/lib/creator-license/policy";
import {
  CREATOR_TERMS_DOCUMENT_SHA256,
  CREATOR_TERMS_DOCUMENT_VERSION,
  getCreatorContractSpec,
} from "@/lib/creator-license/contract-v1";
import { CREATOR_TRACK_BY_ID } from "@/lib/creator-license/catalog";
import { CREATOR_ATTRIBUTION } from "@/lib/creator-music/content";

export type CreatorLicenseUser = { id: string };

export class CreatorLicenseError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message = code
  ) {
    super(message);
  }
}

export function assertCreatorLicenseEnabled(): void {
  if (process.env.CREATOR_LICENSE_ENABLED !== "1") {
    throw new CreatorLicenseError("creator_license_not_enabled", 503);
  }
}

export async function requireCreatorLicenseUser(): Promise<CreatorLicenseUser> {
  let client;
  try {
    client = await createClient();
  } catch {
    throw new CreatorLicenseError("auth_not_configured", 503);
  }

  const { data, error } = await client.auth.getUser();
  if (!data.user) throw new CreatorLicenseError("login_required", 401);
  if (error) throw new CreatorLicenseError("auth_unavailable", 503);
  return { id: data.user.id };
}

export async function requireActiveCreatorPlan(
  userId: string
): Promise<{ plan: ActiveCreatorPlan; subscriptionId: string | null }> {
  let service;
  try {
    service = await createServiceClient();
  } catch {
    throw new CreatorLicenseError("license_service_not_configured", 503);
  }

  const { data, error } = await service
    .from("flowstate_subscriptions")
    .select("id, status, plan, current_period_end")
    .eq("user_id", userId);
  if (error) throw new CreatorLicenseError("license_database_unavailable", 503);

  const active = selectActiveCreatorPlan(data ?? []);
  if (!active) throw new CreatorLicenseError("active_pro_required", 403);
  return active;
}

export async function getUserDisplayName(userId: string): Promise<string | null> {
  let service;
  try {
    service = await createServiceClient();
  } catch {
    return null;
  }
  const { data } = await service
    .from("flowstate_profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
  if (data && typeof data.display_name === "string" && data.display_name.trim().length >= 2) {
    const validated = validateLicenseeName(data.display_name);
    if (validated.ok) return validated.name;
  }
  return null;
}

export async function setUserDisplayName(userId: string, name: string): Promise<void> {
  const validated = validateLicenseeName(name);
  if (!validated.ok) throw new CreatorLicenseError("invalid_licensee_name", 400);
  let service;
  try {
    service = await createServiceClient();
  } catch {
    throw new CreatorLicenseError("license_service_not_configured", 503);
  }
  const { error } = await service
    .from("flowstate_profiles")
    .upsert({ id: userId, display_name: validated.name }, { onConflict: "id" });
  if (error) throw new CreatorLicenseError("license_database_unavailable", 503);
}

export async function findCurrentGrant(userId: string) {
  let service;
  try {
    service = await createServiceClient();
  } catch {
    throw new CreatorLicenseError("license_service_not_configured", 503);
  }
  const { data, error } = await service
    .from("flowstate_creator_license_grants")
    .select(
      "id, terms_version, terms_document_version, terms_document_sha256, catalog_version, eligible_genres, plan_snapshot, accepted_at, acceptance_method, granted_at, revoked_at, revocation_reason"
    )
    .eq("user_id", userId)
    .eq("terms_version", CREATOR_TERMS_VERSION)
    .eq("catalog_version", CREATOR_CATALOG_VERSION)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new CreatorLicenseError("license_database_unavailable", 503);
  return data;
}

export function grantInsertPayload(
  userId: string,
  entitlement: { plan: ActiveCreatorPlan; subscriptionId: string | null },
  acceptance: CreatorLicenseAcceptance,
  acceptedAt = new Date().toISOString()
) {
  const spec = getCreatorContractSpec(acceptance.termsVersion) ?? {
    documentVersion: CREATOR_TERMS_DOCUMENT_VERSION,
    documentSha256: CREATOR_TERMS_DOCUMENT_SHA256,
  };

  return {
    user_id: userId,
    terms_version: acceptance.termsVersion,
    terms_document_version: spec.documentVersion,
    terms_document_sha256: spec.documentSha256,
    catalog_version: acceptance.catalogVersion,
    eligible_genres: [...CREATOR_GENRES],
    plan_snapshot: {
      plan: entitlement.plan,
      subscription_id: entitlement.subscriptionId,
      checked_at: new Date().toISOString(),
    },
    accepted_at: acceptedAt,
    acceptance_method: "clickwrap" as const,
  };
}

export type CreatorCertificateRow = {
  id: string;
  grant_id: string;
  user_id: string | null;
  track_id: string;
  track_title: string;
  track_artist: string;
  track_genre: string;
  catalog_version: string;
  terms_version: string;
  terms_document_version: string;
  terms_document_sha256: string;
  licensee_name: string;
  licensee_organization: string | null;
  attribution_text: string;
  issued_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
};

/**
 * Creates or retrieves an existing idempotent Certificate Record for (grant_id, track_id).
 */
export async function getOrCreateCertificate(
  userId: string,
  grant: {
    id: string;
    terms_version: string;
    terms_document_version: string;
    terms_document_sha256: string;
    catalog_version: string;
    revoked_at?: string | null;
  },
  trackId: string,
  licenseeNameInput?: string
): Promise<CreatorCertificateRow> {
  if (grant.revoked_at) {
    throw new CreatorLicenseError("license_grant_revoked", 403);
  }

  const track = CREATOR_TRACK_BY_ID.get(trackId);
  if (!track) {
    throw new CreatorLicenseError("track_not_eligible", 404);
  }

  let service;
  try {
    service = await createServiceClient();
  } catch {
    throw new CreatorLicenseError("license_service_not_configured", 503);
  }

  // 1. Check if certificate already exists (idempotency)
  const { data: existing } = await service
    .from("flowstate_creator_license_certificates")
    .select("*")
    .eq("grant_id", grant.id)
    .eq("track_id", trackId)
    .maybeSingle();

  if (existing) {
    return existing as CreatorCertificateRow;
  }

  // 2. Resolve licensee name
  let licenseeName: string | null = null;
  if (licenseeNameInput) {
    const valid = validateLicenseeName(licenseeNameInput);
    if (!valid.ok) {
      throw new CreatorLicenseError("invalid_licensee_name", 400);
    }
    await setUserDisplayName(userId, valid.name);
    licenseeName = valid.name;
  } else {
    licenseeName = await getUserDisplayName(userId);
  }

  if (!licenseeName) {
    throw new CreatorLicenseError("licensee_name_required", 400);
  }

  // 3. Insert new certificate record
  const payload = {
    grant_id: grant.id,
    user_id: userId,
    track_id: track.id,
    track_title: track.title,
    track_artist: track.artist,
    track_genre: track.genre,
    catalog_version: grant.catalog_version,
    terms_version: grant.terms_version,
    terms_document_version: grant.terms_document_version,
    terms_document_sha256: grant.terms_document_sha256,
    licensee_name: licenseeName,
    attribution_text: CREATOR_ATTRIBUTION,
  };

  const { data: created, error } = await service
    .from("flowstate_creator_license_certificates")
    .insert(payload)
    .select("*")
    .single();

  if (error?.code === "23505") {
    const raced = await service
      .from("flowstate_creator_license_certificates")
      .select("*")
      .eq("grant_id", grant.id)
      .eq("track_id", trackId)
      .maybeSingle();
    if (raced.data) return raced.data as CreatorCertificateRow;
  }

  if (error || !created) {
    throw new CreatorLicenseError("license_database_unavailable", 503);
  }

  return created as CreatorCertificateRow;
}

export function creatorLicenseErrorResponse(error: unknown): { code: string; status: number } {
  if (error instanceof CreatorLicenseError) {
    return { code: error.code, status: error.status };
  }
  return { code: "creator_license_unavailable", status: 503 };
}
