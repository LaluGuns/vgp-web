import posthog from "posthog-js";

/**
 * Product analytics (PostHog) — privacy-first configuration.
 *
 * - No-ops entirely unless NEXT_PUBLIC_POSTHOG_KEY is set.
 * - localStorage persistence only (no cookies, no cross-site tracking).
 * - Autocapture OFF — only the explicit, typed events below are sent.
 * - Session recording OFF by default (can be enabled server-side per project).
 * - Respects Do Not Track.
 *
 * Event taxonomy (keep this list the single source of truth):
 *   $pageview            — route change (sent by AnalyticsProvider)
 *   session_started      — focus block begun             { mode }
 *   session_completed    — focus block finished          { duration_min, mode }
 *   session_skipped      — focus block abandoned early   { duration_min, mode }
 *   guest_gate_shown     — sign-in gate shown to guest   { count }
 *   guest_sign_in_clicked— guest tapped sign-in in gate  { }
 *   paywall_viewed       — upgrade prompt shown          { source }
 *   upgrade_clicked      — pricing CTA clicked           { source }
 *   checkout_started     — checkout POST fired           { interval, promo }
 *   checkout_redirected  — reached Lemon Squeezy checkout { interval }
 *   theme_changed        — interface theme switched      { theme }
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function analyticsEnabled(): boolean {
  return KEY.length > 0 && typeof window !== "undefined";
}

export function initAnalytics(): void {
  if (!analyticsEnabled() || initialized) return;
  initialized = true;
  posthog.init(KEY, {
    api_host: HOST,
    persistence: "localStorage",
    autocapture: false,
    capture_pageview: false, // sent manually on route change
    capture_pageleave: true,
    disable_session_recording: true,
    respect_dnt: true,
  });
}

export function trackPageview(path: string): void {
  if (!initialized) return;
  posthog.capture("$pageview", { $current_url: window.location.origin + path });
}

type EventName =
  | "session_started"
  | "session_completed"
  | "session_skipped"
  | "guest_gate_shown"
  | "guest_sign_in_clicked"
  | "paywall_viewed"
  | "upgrade_clicked"
  | "checkout_started"
  | "checkout_redirected"
  | "theme_changed";

export function track(event: EventName, props?: Record<string, string | number | boolean>): void {
  if (!initialized) return;
  posthog.capture(event, props);
}

export function identifyUser(userId: string | null): void {
  if (!initialized) return;
  if (userId) {
    // ID only — never email/name; profiles stay pseudonymous in analytics.
    posthog.identify(userId);
  } else {
    posthog.reset();
  }
}
