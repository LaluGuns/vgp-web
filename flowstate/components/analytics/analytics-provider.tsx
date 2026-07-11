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
