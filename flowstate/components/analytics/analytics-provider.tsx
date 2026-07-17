"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackPageview, identifyUser, analyticsEnabled } from "@/lib/analytics";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Mount-once analytics lifecycle: init PostHog (no-op without a key),
 * manual pageviews on route change, and pseudonymous identify on auth change.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (pathname) trackPageview(pathname);
  }, [pathname]);

  // Presence ping — once per page load, signed-in users only, fire-and-forget.
  // Independent of analyticsEnabled(): presence powers the founder dashboard,
  // not PostHog.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!data.user) return;
        fetch("/api/presence", { method: "POST" }).catch(() => {});
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!analyticsEnabled() || !isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      identifyUser(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
