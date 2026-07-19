export type SubscriptionAnalyticsEvent =
  | "subscription_activated"
  | "subscription_cancelled"
  | "subscription_refunded"
  | "subscription_chargeback";

type SubscriptionEventInput = {
  eventName: string;
  status?: string | null;
  userId?: string | null;
  plan?: string | null;
  eventId?: string | null;
  occurredAt?: string | null;
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
  const normalizedEvent = eventName.toLowerCase();
  const normalizedStatus = status?.toLowerCase() ?? "";

  if (normalizedEvent.includes("chargeback")) return "subscription_chargeback";
  if (normalizedEvent === "subscription_payment_refunded" || normalizedStatus === "refunded") {
    return "subscription_refunded";
  }
  if (normalizedEvent === "subscription_cancelled" || normalizedStatus === "cancelled") {
    return "subscription_cancelled";
  }
  if (
    ["subscription_created", "subscription_resumed", "subscription_unpaused"].includes(normalizedEvent)
    && ["active", "on_trial", "trialing"].includes(normalizedStatus)
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
 * Best-effort server capture. Billing state is already committed before this
 * runs, so analytics downtime must never make Lemon Squeezy retry a valid
 * entitlement update. `$insert_id` keeps provider retries idempotent.
 */
export async function captureSubscriptionEvent(input: SubscriptionEventInput): Promise<void> {
  const event = subscriptionAnalyticsEvent(input.eventName, input.status);
  if (!event || !input.userId) return;

  const { key, host } = analyticsConfig();
  if (!key) return;

  const insertId = input.eventId
    || `${input.eventName}:${input.userId}:${input.occurredAt || "unknown"}`;

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
    // Deliberately non-blocking: connector health is monitored separately.
  }
}
