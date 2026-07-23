import posthog from "posthog-js";
import { classifyAcquisition, shouldStartNewAcquisitionSession, type AcquisitionClass } from "@/lib/analytics-acquisition";
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
 *   genre_selected       — soundtrack genre picked       { genre }
 *   track_played         — track manually selected       { genre, premium }
 *   tour_started         — guided tour begun             { }
 *   tour_completed       — guided tour finished          { }
 *   tour_skipped         — guided tour dismissed early   { step }
 *   insights_gate_shown  — guest hit the insights gate   { }
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;
const FIRST_TOUCH_KEY = "flow_first_touch_v1";
const ACQUISITION_SESSION_KEY = "flow_acquisition_session_v1";

export type AnalyticsProperties = Record<string, string | number | boolean | undefined>;
export interface FirstTouch { channel: AcquisitionClass; referrerHost: string | null; landingPath: string; capturedAt: string; }
export interface AcquisitionSession {
  id: string;
  channel: AcquisitionClass;
  referrerHost: string | null;
  landingPath: string;
  startedAt: string;
  lastSeenAt: string;
  seoLandingTracked: boolean;
}

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

function referrerHost(referrer: string): string | null {
  if (!referrer) return null;
  try { return new URL(referrer).hostname.toLowerCase(); } catch { return null; }
}

function sessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateAcquisitionSession(path: string, isTopLevelEntry = false): AcquisitionSession | null {
  if (typeof window === "undefined") return null;
  try {
    const now = new Date().toISOString();
    const referrer = document.referrer;
    const channel = classifyAcquisition(referrer, window.location.hostname, navigator.userAgent);
    const savedRaw = window.sessionStorage.getItem(ACQUISITION_SESSION_KEY);
    const saved = savedRaw ? JSON.parse(savedRaw) as AcquisitionSession : null;
    const expired = shouldStartNewAcquisitionSession(saved, isTopLevelEntry);
    // Direct/internal navigation does not overwrite a live acquisition source.
    const shouldReplace = expired || (!saved || saved.channel === "direct" || saved.channel === "internal") && (channel !== "direct" && channel !== "internal");
    const next: AcquisitionSession = shouldReplace
      ? { id: sessionId(), channel, referrerHost: referrerHost(referrer), landingPath: path, startedAt: now, lastSeenAt: now, seoLandingTracked: false }
      : { ...saved!, lastSeenAt: now };
    window.sessionStorage.setItem(ACQUISITION_SESSION_KEY, JSON.stringify(next));
    return next;
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
export function marketFromPath(path: string): string {
  const locale = localeFromPath(path);
  if (locale === "en") return "global-en";
  if (locale === "es") return "global-es";
  return locale;
}

export function getCheckoutAcquisitionContext(path: string) {
  const acquisition = getOrCreateAcquisitionSession(path);
  if (!acquisition || acquisition.channel === "bot" || acquisition.channel === "staff") return undefined;
  const firstTouch = getOrCreateFirstTouch(path);
  return {
    sessionAcquisition: acquisition.channel,
    firstTouchChannel: firstTouch?.channel ?? "unknown",
    acquisitionSessionId: acquisition.id,
    referrerHost: acquisition.referrerHost ?? "",
    landingPath: acquisition.landingPath,
    locale: localeFromPath(path),
    market: marketFromPath(path),
    cluster: marketingCluster(path),
  };
}

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

export function trackPageview(path: string, isTopLevelEntry = false): void {
  if (!initialized) return;
  const firstTouch = getOrCreateFirstTouch(path);
  const acquisition = getOrCreateAcquisitionSession(path, isTopLevelEntry);
  const context = {
    landing_path: path,
    cluster: marketingCluster(path),
    locale: localeFromPath(path),
    market: marketFromPath(path),
    first_touch_channel: firstTouch?.channel ?? "unknown",
    session_acquisition: acquisition?.channel ?? "unknown",
    acquisition_session_id: acquisition?.id ?? "unknown",
    referrer_host: acquisition?.referrerHost ?? "",
    is_staff: acquisition?.channel === "staff",
    is_bot: acquisition?.channel === "bot",
  };
  posthog.capture("$pageview", { $current_url: window.location.origin + path, ...context });
  if (acquisition?.channel === "organic" && !acquisition.seoLandingTracked) {
    posthog.capture("seo_landing_view", context);
    try { window.sessionStorage.setItem(ACQUISITION_SESSION_KEY, JSON.stringify({ ...acquisition, seoLandingTracked: true })); } catch { /* non-essential */ }
  }
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
  | "spotify_catalog_clicked"
  | "genre_selected"
  | "track_played"
  | "tour_started"
  | "tour_completed"
  | "tour_skipped"
  | "insights_gate_shown";

export function track(event: EventName, props?: AnalyticsProperties): void {
  if (!initialized) return;
  const firstTouch = typeof window === "undefined" ? null : getOrCreateFirstTouch(window.location.pathname);
  const acquisition = typeof window === "undefined" ? null : getOrCreateAcquisitionSession(window.location.pathname);
  posthog.capture(event, {
    ...props,
    first_touch_channel: firstTouch?.channel ?? "unknown",
    session_acquisition: acquisition?.channel ?? "unknown",
    acquisition_session_id: acquisition?.id ?? "unknown",
    referrer_host: acquisition?.referrerHost ?? "",
    landing_path: window.location.pathname,
    locale: localeFromPath(window.location.pathname),
    market: marketFromPath(window.location.pathname),
    cluster: marketingCluster(window.location.pathname),
    is_staff: acquisition?.channel === "staff",
    is_bot: acquisition?.channel === "bot",
  });
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
