export type SubscriptionAnalyticsEvent =
  | "subscription_activated"
  | "subscription_renewed"
  | "subscription_recovered"
  | "subscription_cancelled"
  | "subscription_past_due"
  | "subscription_grace_period"
  | "subscription_expired"
  | "subscription_revoked"
  | "subscription_refunded"
  | "subscription_chargeback"
  | "subscription_chargeback_review";

type SubscriptionEventInput = {
  eventName: string;
  status?: string | null;
  userId?: string | null;
  plan?: string | null;
  eventId?: string | null;
  occurredAt?: string | null;
  provider?: "lemonsqueezy" | "google_play" | string | null;
  platform?: "web" | "android" | "server" | string | null;
  acquisition?: {
    sessionAcquisition?: string | null;
    firstTouchChannel?: string | null;
    acquisitionSessionId?: string | null;
    referrerHost?: string | null;
    landingPath?: string | null;
    locale?: string | null;
    market?: string | null;
    cluster?: string | null;
  };
};

export function subscriptionAnalyticsEvent(
  eventName: string,
  status?: string | null,
): SubscriptionAnalyticsEvent | null {
  const event = eventName.toLowerCase();
  const normalizedStatus = status?.toLowerCase() ?? "";

  if (event.includes("chargeback_review")) return "subscription_chargeback_review";
  if (event.includes("chargeback")) return "subscription_chargeback";
  if (event.includes("refund") || normalizedStatus === "refunded") return "subscription_refunded";
  if (event.includes("revoked")) return "subscription_revoked";
  if (event.includes("expired") || normalizedStatus === "expired") return "subscription_expired";
  if (event.includes("renewed")) return "subscription_renewed";
  if (event.includes("recovered") || event.includes("restarted") || event.includes("resumed") || event.includes("unpaused")) {
    return "subscription_recovered";
  }
  if (event.includes("cancelled") || event.includes("canceled") || normalizedStatus === "cancelled") {
    return "subscription_cancelled";
  }
  if (event.includes("grace_period")) return "subscription_grace_period";
  if (event.includes("on_hold") || event.includes("account_hold") || event.includes("paused") || normalizedStatus === "past_due") {
    return "subscription_past_due";
  }
  if (
    event.includes("activated") ||
    event === "subscription_created" ||
    ["active", "on_trial", "trialing"].includes(normalizedStatus)
  ) {
    return "subscription_activated";
  }
  return null;
}

function analyticsConfig() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_PROJECT_KEY || "";
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || process.env.POSTHOG_CAPTURE_HOST || "https://us.i.posthog.com")
    .replace(/\/$/, "");
  return { key, host };
}

/**
 * Best-effort server capture. Entitlement state is committed before analytics,
 * so analytics downtime never blocks provider retries or user access.
 */
export async function captureSubscriptionEvent(input: SubscriptionEventInput): Promise<void> {
  const event = subscriptionAnalyticsEvent(input.eventName, input.status);
  if (!event || !input.userId) return;

  const { key, host } = analyticsConfig();
  if (!key) return;

  const insertId = input.eventId || `${input.eventName}:${input.userId}:${input.occurredAt || "unknown"}`;

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        properties: {
          distinct_id: input.userId,
          $insert_id: insertId,
          site_scope: "flow",
          funnel: "flow",
          provider: input.provider || (input.eventName.startsWith("google_play_") ? "google_play" : "lemonsqueezy"),
          platform: input.platform || "server",
          plan: input.plan || "unknown",
          provider_event: input.eventName,
          subscription_status: input.status || "unknown",
          occurred_at: input.occurredAt || undefined,
          session_acquisition: input.acquisition?.sessionAcquisition || "unknown",
          first_touch_channel: input.acquisition?.firstTouchChannel || "unknown",
          acquisition_session_id: input.acquisition?.acquisitionSessionId || "unknown",
          referrer_host: input.acquisition?.referrerHost || "",
          landing_path: input.acquisition?.landingPath || "",
          locale: input.acquisition?.locale || "unknown",
          market: input.acquisition?.market || "unknown",
          cluster: input.acquisition?.cluster || "product",
          is_staff: false,
          is_bot: false,
        },
        timestamp: input.occurredAt || undefined,
      }),
      signal: AbortSignal.timeout(2_500),
    });
  } catch {
    // Deliberately non-blocking.
  }
}
