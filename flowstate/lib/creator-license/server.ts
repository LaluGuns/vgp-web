import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  CREATOR_CATALOG_VERSION,
  CREATOR_GENRES,
  CREATOR_TERMS_VERSION,
  selectActiveCreatorPlan,
  type ActiveCreatorPlan,
} from "@/lib/creator-license/policy";

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
      "id, terms_version, catalog_version, eligible_genres, plan_snapshot, granted_at, revoked_at, revocation_reason"
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
  entitlement: { plan: ActiveCreatorPlan; subscriptionId: string | null }
) {
  return {
    user_id: userId,
    terms_version: CREATOR_TERMS_VERSION,
    catalog_version: CREATOR_CATALOG_VERSION,
    eligible_genres: [...CREATOR_GENRES],
    plan_snapshot: {
      plan: entitlement.plan,
      subscription_id: entitlement.subscriptionId,
      checked_at: new Date().toISOString(),
    },
  };
}

export function creatorLicenseErrorResponse(error: unknown): { code: string; status: number } {
  if (error instanceof CreatorLicenseError) {
    return { code: error.code, status: error.status };
  }
  return { code: "creator_license_unavailable", status: 503 };
}

