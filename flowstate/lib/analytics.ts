import posthog from "posthog-js";
import { classifyAcquisition, type AcquisitionClass } from "@/lib/analytics-acquisition";
export { classifyAcquisition } from "@/lib/analytics-acquisition";

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
const FIRST_TOUCH_KEY = "flow_first_touch_v1";

export type AnalyticsProperties = Record<string, string | number | boolean | undefined>;
export interface FirstTouch { channel: AcquisitionClass; referrerHost: string | null; landingPath: string; capturedAt: string; }

export function getOrCreateFirstTouch(path: string): FirstTouch | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = window.localStorage.getItem(FIRST_TOUCH_KEY);
    if (saved) return JSON.parse(saved) as FirstTouch;
    const referrer = document.referrer;
    const touch: FirstTouch = { channel: classifyAcquisition(referrer, window.location.hostname, navigator.userAgent), referrerHost: referrer ? new URL(referrer).hostname : null, landingPath: path, capturedAt: new Date().toISOString() };
    window.localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
    return touch;
  } catch { return null; }
}

export function marketingCluster(path: string): string {
  if (path.includes("creator-music")) return "creator_music";
  if (path.includes("deep-work")) return "deep_work";
  if (path.includes("study-timer")) return "study_timer";
  if (path.includes("pomodoro")) return "pomodoro_music";
  if (path.includes("/timer/")) return "timer_preset";
  if (path.includes("/pricing")) return "pricing";
  return "product";
}

export function localeFromPath(path: string): string { return path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/|$)/)?.[1] ?? "en"; }

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
  const firstTouch = getOrCreateFirstTouch(path);
  const context = { landing_path: path, cluster: marketingCluster(path), locale: localeFromPath(path), first_touch: firstTouch?.channel ?? "unknown" };
  posthog.capture("$pageview", { $current_url: window.location.origin + path, ...context });
  if (firstTouch?.channel === "organic" && firstTouch.landingPath === path) posthog.capture("seo_landing_view", context);
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
  | "theme_changed"
  | "seo_landing_view"
  | "seo_cta_clicked"
  | "creator_genre_viewed"
  | "creator_track_previewed"
  | "creator_license_started"
  | "creator_license_granted"
  | "creator_track_downloaded"
  | "license_attribution_copied"
  | "spotify_catalog_clicked";

export function track(event: EventName, props?: AnalyticsProperties): void {
  if (!initialized) return;
  const firstTouch = typeof window === "undefined" ? null : getOrCreateFirstTouch(window.location.pathname);
  posthog.capture(event, { ...props, first_touch: firstTouch?.channel ?? "unknown" });
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
