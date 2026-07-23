"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, Key, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { WebGLBackground } from "@/components/scenes/webgl-background";
import { AmbientBackground } from "./ambient-background";
import { generateDemoSessions } from "@/lib/optimizer/demo-data";
import { FocusTrendChart } from "./focus-trend-chart";
import { FocusHeatmap } from "./focus-heatmap";
import { MomentumRow } from "./momentum-row";

// Full-screen status states for the insights page. Extracted verbatim from
// the page's early returns — same markup, same copy, same order of checks.

// 1. Loading State
export function InsightsLoadingScreen() {
  const { t } = useTranslation();
  return (
    <>
      <WebGLBackground />

      <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent text-white/50 items-center justify-center gap-3 z-10">
        <AmbientBackground />
        <Loader2 className="h-6 w-6 animate-apple-loader text-primary" />
        <span className="font-mono text-xs uppercase tracking-widest animate-pulse">{t("insights.loading", "Loading Analytics...")}</span>
      </div>
    </>
  );
}

// 2. Database unconfigured state
export function InsightsUnconfiguredScreen() {
  const { t } = useTranslation();
  return (
    <>
      <WebGLBackground />

      <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent items-center justify-center p-6 text-center z-10">
        <AmbientBackground />
        <div className="max-w-md space-y-6 z-10 glass-card p-8 border border-white/10">
          <div className="p-4 mx-auto w-fit rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-white/90">{t("insights.unconfigured.title", "Database Unconfigured")}</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            {t("insights.unconfigured.description", "Supabase is not configured in your environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable server-persisted focus history.")}
          </p>
          <Link href="/app" className="inline-block px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80">
            {t("dashboard.backToTimer", "Back to Timer")}
          </Link>
        </div>
      </div>
    </>
  );
}

// 3. Connection error state
export function InsightsErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <WebGLBackground />

      <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent items-center justify-center p-6 text-center z-10">
        <AmbientBackground />
        <div className="max-w-md space-y-6 z-10 glass-card p-8 border border-white/10">
          <div className="p-4 mx-auto w-fit rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-white/90">{t("insights.error.title", "Unable to Load Insights")}</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            {error === "Connection timed out." ? t("insights.error.description", "Please check your connection and try again.") : error}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onRetry}
              className="px-5 py-2.5 rounded-full bg-primary text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              {t("insights.error.retry", "Retry Connection")}
            </button>
            <Link href="/app" className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80">
              {t("dashboard.backToTimer", "Back to Timer")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// 4. User not logged in state — the gate stays, but a blurred demo of the
// insights surfaces sits behind it as a teaser of what sign-in gets you.
// Synthetic data only (never the visitor's own), non-interactive.
export function InsightsSignInScreen() {
  const { t } = useTranslation();
  const demoSessions = useMemo(() => generateDemoSessions(90), []);
  return (
    <>
      <WebGLBackground />

      <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent items-center justify-center p-6 text-center z-10">
        <AmbientBackground />
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden p-6 blur-[6px] opacity-35 pointer-events-none select-none"
        >
          <div className="mx-auto max-w-4xl space-y-4">
            <MomentumRow sessions={demoSessions} />
            <FocusTrendChart sessions={demoSessions} />
            <FocusHeatmap sessions={demoSessions} />
          </div>
        </div>
        <div className="max-w-sm space-y-6 z-10 glass-card p-8 border border-white/10">
          <div className="p-4 mx-auto w-fit rounded-full bg-primary/10 text-primary border border-primary/20">
            <Key className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-white/90">{t("insights.auth.title", "Sign in first")}</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            {t("insights.auth.description", "Sign in or create an account so your focus history is saved and synced.")}
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/login?next=/insights" className="px-5 py-2.5 rounded-full bg-primary text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
              {t("insights.auth.signIn", "Sign In / Sign Up")}
            </Link>
            <Link href="/app" className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80">
              {t("dashboard.backToTimer", "Back to Timer")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
