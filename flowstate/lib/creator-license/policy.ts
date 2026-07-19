export const CREATOR_GENRES = [
  "City Pop",
  "Cyberpunk Jazz",
  "Neo Synthwave",
] as const;

export type CreatorGenre = (typeof CREATOR_GENRES)[number];

export const CREATOR_TERMS_VERSION = "creator-license-v1";
export const CREATOR_CATALOG_VERSION = "creator-catalog-2026-07-19";
export const CREATOR_RIGHTS_VERSION = "creator-rights-v1";
export const CREATOR_RELEASE_LABEL =
  "Chill Music Division / Virzy Guns Production";

export function isCreatorGenre(value: unknown): value is CreatorGenre {
  return typeof value === "string" &&
    (CREATOR_GENRES as readonly string[]).includes(value);
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
 * rows instead of the denormalized profile plan or JWT metadata. A cancelled
 * subscription never creates a new grant, even while an older publication grant
 * remains valid.
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

