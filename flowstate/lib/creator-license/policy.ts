export const CREATOR_GENRES = [
  "City Pop",
  "Cyberpunk Jazz",
  "Neo Synthwave",
] as const;

export type CreatorGenre = (typeof CREATOR_GENRES)[number];

export const CREATOR_TERMS_VERSION = "creator-license-2026-07-21";
export const CREATOR_CATALOG_VERSION = "creator-catalog-2026-07-19";
export const CREATOR_RIGHTS_VERSION = "creator-rights-v1";
export const CREATOR_RELEASE_LABEL =
  "Chill Music Division / Virzy Guns Production";

export function isCreatorGenre(value: unknown): value is CreatorGenre {
  return typeof value === "string" &&
    (CREATOR_GENRES as readonly string[]).includes(value);
}

export type CreatorLicenseAcceptance = {
  acceptTerms: true;
  termsVersion: typeof CREATOR_TERMS_VERSION;
  catalogVersion: typeof CREATOR_CATALOG_VERSION;
};

export type CreatorLicenseAcceptanceFailure =
  | "terms_acceptance_required"
  | "terms_version_mismatch"
  | "catalog_version_mismatch";

/**
 * Clickwrap is fail-closed: a grant can only be issued for an explicit `true`
 * acceptance of the exact server-published terms and catalog versions.
 */
export function validateCreatorLicenseAcceptance(
  value: unknown
):
  | { ok: true; acceptance: CreatorLicenseAcceptance }
  | { ok: false; code: CreatorLicenseAcceptanceFailure } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, code: "terms_acceptance_required" };
  }

  const input = value as Record<string, unknown>;
  if (input.acceptTerms !== true) {
    return { ok: false, code: "terms_acceptance_required" };
  }
  if (input.termsVersion !== CREATOR_TERMS_VERSION) {
    return { ok: false, code: "terms_version_mismatch" };
  }
  if (input.catalogVersion !== CREATOR_CATALOG_VERSION) {
    return { ok: false, code: "catalog_version_mismatch" };
  }

  return {
    ok: true,
    acceptance: {
      acceptTerms: true,
      termsVersion: CREATOR_TERMS_VERSION,
      catalogVersion: CREATOR_CATALOG_VERSION,
    },
  };
}

/**
 * Server-side validation for explicit licensee display name ("Licensed to").
 * Must be 2-100 characters, no control characters, and cannot be an email address.
 */
export function validateLicenseeName(
  value: unknown
): { ok: true; name: string } | { ok: false; code: "invalid_licensee_name" } {
  if (typeof value !== "string") {
    return { ok: false, code: "invalid_licensee_name" };
  }
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { ok: false, code: "invalid_licensee_name" };
  }
  // Reject control characters (\x00-\x1F, \x7F) and newlines
  if (/[\x00-\x1F\x7F\r\n\t]/.test(trimmed)) {
    return { ok: false, code: "invalid_licensee_name" };
  }
  // Reject email addresses (do not silently use email)
  if (trimmed.includes("@")) {
    return { ok: false, code: "invalid_licensee_name" };
  }
  return { ok: true, name: trimmed };
}

export type CreatorSubscriptionRow = {
  id?: string;
  status: unknown;
  plan: unknown;
  current_period_end?: unknown;
};

export type ActiveCreatorPlan = "monthly" | "yearly" | "lifetime";

/**
 * Creator downloads and new grants intentionally use the canonical subscription
 * rows instead of the denormalized profile plan or JWT metadata.
 */
export function selectActiveCreatorPlan(
  subscriptions: CreatorSubscriptionRow[],
  now = Date.now()
): { plan: ActiveCreatorPlan; subscriptionId: string | null } | null {
  const priority: Record<ActiveCreatorPlan, number> = {
    monthly: 1,
    yearly: 2,
    lifetime: 3,
  };
  let selected: { plan: ActiveCreatorPlan; subscriptionId: string | null } | null = null;

  for (const subscription of subscriptions) {
    const plan = subscription.plan;
    if (plan !== "monthly" && plan !== "yearly" && plan !== "lifetime") continue;
    if (subscription.status !== "active" && subscription.status !== "trialing") continue;

    if (plan !== "lifetime") {
      if (typeof subscription.current_period_end !== "string") continue;
      const end = new Date(subscription.current_period_end).getTime();
      if (!Number.isFinite(end) || end <= now) continue;
    }

    if (!selected || priority[plan] > priority[selected.plan]) {
      selected = {
        plan,
        subscriptionId: typeof subscription.id === "string" ? subscription.id : null,
      };
    }
  }

  return selected;
}

export function safeCreatorDownloadFilename(title: string, id: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  const fallback = id.split("/").at(-1)?.replace(/[^a-zA-Z0-9_-]/g, "") || "flow-track";
  return `${(base || fallback).slice(0, 96)}.mp3`;
}

export function safeCreatorCertificateFilename(title: string, certificateId: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  const fallback = certificateId.slice(0, 8);
  return `Flow-License-${(base || fallback).slice(0, 60)}-${certificateId}.pdf`;
}
