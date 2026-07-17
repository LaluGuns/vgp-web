"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { computeInsights, type DbSession } from "@/lib/optimizer/compute-insights";
import { generateDemoSessions } from "@/lib/optimizer/demo-data";
import { Brain } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { WebGLBackground } from "@/components/scenes/webgl-background";
import { ShareModal } from "@/components/optimizer/share-modal";

import { AmbientBackground } from "@/components/insights/ambient-background";
import { FocusTrendChart } from "@/components/insights/focus-trend-chart";
import { FocusHeatmap } from "@/components/insights/focus-heatmap";
import { FocusScienceGlossary } from "@/components/insights/focus-science-glossary";
import { MomentumRow } from "@/components/insights/momentum-row";
import { KeyStatsColumn } from "@/components/insights/key-stats-column";
import { SessionHistory } from "@/components/insights/session-history";
import { InsightsSidebar } from "@/components/insights/insights-sidebar";
import { InsightsHeader } from "@/components/insights/insights-header";
import { InsightsMobileNav } from "@/components/insights/insights-mobile-nav";
import {
  InsightsLoadingScreen,
  InsightsUnconfiguredScreen,
  InsightsErrorScreen,
  InsightsSignInScreen,
} from "@/components/insights/insights-status-screens";

export default function InsightsPage() {
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t("insights.title", "Focus Insights")} | Flowstate`;
    }
  }, [t]);

  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const handleShare = () => {
    setShareOpen(true);
  };

  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const configured = isSupabaseConfigured();

  // Dev-only demo mode (`/insights?demo=1`): renders every insights surface with
  // deterministic synthetic sessions, no auth needed. The NODE_ENV guard is
  // statically resolved, so this whole branch is tree-shaken out of prod builds.
  const demoMode =
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("demo");

  const report = useMemo(() => computeInsights(sessions), [sessions]);

  const localizedInsightMessage = useMemo(() => {
    if (!report || report.totalSessions === 0) {
      return t("insights.message.noSessions", "Run one focus session and the insights show up.");
    }
    if (report.fidgetFirst10minAverage > 5) {
      return t("insights.message.fidgetAlert", "You average {count} adjustments in your first 10 minutes. Set your audio and scene before you start the clock.")
        .replace("{count}", String(report.fidgetFirst10minAverage));
    }
    if (report.totalSessions >= 10) {
      return t("insights.message.consistent", "A few days of deep work in a row now. That's the habit forming.");
    }
    return t("insights.message.solid", "Steady week — the numbers are holding.");
  }, [report, t]);

  const completionRate = useMemo(() => {
    if (!sessions || sessions.length === 0) return 0;
    const completed = sessions.filter(s => s.completed).length;
    return Math.round((completed / sessions.length) * 100);
  }, [sessions]);

  const sessionsThisWeek = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    return sessions.filter(s => new Date(s.started_at) >= since).length;
  }, [sessions]);

  // Dynamic Focus blocks parsed from context_bookmark
  const categoriesData = useMemo(() => {
    const categoryMap: Record<string, { minutes: number; count: number }> = {};

    sessions.forEach(s => {
      const bookmark = s.context_bookmark || "";
      // Measured time only — no target-duration fallback (honest minutes).
      const duration = Math.round((s.actual_duration_s ?? 0) / 60);
      if (duration <= 0) return;

      let cat = "General Deep Work";
      const bookmarkLower = bookmark.toLowerCase();

      if (/code|coding|dev|development|program|refactor|bug|fix|backend|frontend|react|typescript|javascript|api|git/i.test(bookmarkLower)) {
        cat = "Software Development";
      } else if (/design|figma|ui|ux|stitch|css|style|styling|tailwind|color|assets/i.test(bookmarkLower)) {
        cat = "Design & UI";
      } else if (/write|writing|doc|docs|documentation|blog|content|copy|draft/i.test(bookmarkLower)) {
        cat = "Technical Writing";
      } else if (/research|read|reading|learn|learning|study|course|analys/i.test(bookmarkLower)) {
        cat = "Research & Learning";
      } else if (/plan|planning|meet|meeting|email|slack|inbox|admin|mgmt|schedule/i.test(bookmarkLower)) {
        cat = "Planning & Admin";
      } else if (bookmark.trim().length > 0) {
        cat = bookmark.trim();
        if (cat.length > 25) {
          cat = cat.slice(0, 22) + "...";
        }
      }

      if (!categoryMap[cat]) {
        categoryMap[cat] = { minutes: 0, count: 0 };
      }
      categoryMap[cat].minutes += duration;
      categoryMap[cat].count += 1;
    });

    const totalMin = Object.values(categoryMap).reduce((sum, item) => sum + item.minutes, 0);

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        minutes: data.minutes,
        count: data.count,
        percentage: totalMin > 0 ? Math.round((data.minutes / totalMin) * 100) : 0
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 4);
  }, [sessions]);

  useEffect(() => {
    isMounted.current = true;

    if (demoMode) {
      queueMicrotask(() => {
        setMounted(true);
        setUser({ id: "demo-user", email: "demo@flowstate.local" });
        setSessions(generateDemoSessions());
        setLoading(false);
      });
      return;
    }

    queueMicrotask(() => {
      setMounted(true);
      if (!configured) {
        setLoading(false);
      }
    });

    if (!configured) {
      return;
    }

    const supabase = createClient();
    let fetched = false;

    const handleUser = (currentUser: any) => {
      if (!isMounted.current) return;
      setUser(currentUser);

      if (currentUser) {
        if (!fetched) {
          fetched = true;
          setLoading(true);
          fetchSessions(supabase);
        }
      } else {
        fetched = false;
        setSessions([]);
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!isMounted.current) return;
      if (currentUser) {
        handleUser(currentUser);
      } else if (!currentUser) {
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [configured, demoMode]);

  async function fetchSessions(supabase: any) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    let timedOut = false;

    try {
      setError(null);
      // Look back 180 days to fully populate the 24-week heatmap
      const hundredEightyDaysAgo = new Date();
      hundredEightyDaysAgo.setDate(hundredEightyDaysAgo.getDate() - 180);

      const queryPromise = supabase
        .from("flowstate_focus_sessions")
        .select("*")
        .gte("started_at", hundredEightyDaysAgo.toISOString())
        .order("started_at", { ascending: false })
        .abortSignal(signal);

      const timeoutPromise = new Promise<never>((_, reject) => {
        const tId = setTimeout(() => {
          timedOut = true;
          controller.abort();
          reject(new Error("Connection timed out. Please check your network connection."));
        }, 10000);

        signal.addEventListener("abort", () => {
          clearTimeout(tId);
        });
      });

      const { data, error: queryError } = await Promise.race([
        queryPromise,
        timeoutPromise as any
      ]);

      if (!isMounted.current || signal.aborted) return;

      if (queryError) {
        console.error("Error fetching sessions from Supabase:", queryError);
        setError(queryError.message);
      } else if (data) {
        setSessions(data as DbSession[]);
      }
    } catch (err: any) {
      if (!isMounted.current) return;

      if (timedOut) {
        setError(err.message || "Connection timed out.");
      } else {
        if (err.name === "AbortError" || err.message === "aborted" || signal.aborted) {
          return;
        }
        console.error("Exception fetching sessions from Supabase:", err);
        setError(err instanceof Error ? err.message : "Failed to load focus sessions.");
      }
    } finally {
      if (isMounted.current && !signal.aborted) {
        setLoading(false);
      }
    }
  }

  async function handleDeleteSession(id: string) {
    if (!confirm(t("insights.history.confirmDelete", "Are you sure you want to permanently delete this focus session record from your history?"))) return;
    if (demoMode) {
      // Demo data is local-only — just drop it from state.
      setSessions((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("flowstate_focus_sessions")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error("Failed to delete session:", err);
      alert(err.message || t("insights.history.deleteError", "An error occurred while deleting the session."));
    } finally {
      setDeletingId(null);
    }
  }

  // 1. Loading State
  if (loading) {
    return <InsightsLoadingScreen />;
  }

  // 2. Database unconfigured state
  if (!configured) {
    return <InsightsUnconfiguredScreen />;
  }

  // 3. Connection error state
  if (error) {
    return (
      <InsightsErrorScreen
        error={error}
        onRetry={() => {
          setLoading(true);
          const supabase = createClient();
          fetchSessions(supabase);
        }}
      />
    );
  }

  // 4. User not logged in state
  if (!user) {
    return <InsightsSignInScreen />;
  }

  const hasData = report.totalSessions > 0;

  return (
    <>
      <WebGLBackground />

      <div className="w-full max-w-full h-screen flex relative select-none overflow-hidden bg-transparent text-white/90 font-sans z-10 p-4 md:p-5 gap-5">
        {/* Background radial ambient light bleeds */}
        <AmbientBackground />

        {/* Left SideNav Sidebar (Stitch premium theme spec) */}
        <InsightsSidebar user={user} />

        {/* Right Side: Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Header */}
          <InsightsHeader
            message={localizedInsightMessage}
            hasData={hasData}
            onShare={handleShare}
          />

          {/* Scrollable Workspace Wrapper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 select-none pr-1">
            <div className="w-full space-y-8 pb-28 md:pb-8">

            {!hasData ? (
              <div className="flex flex-col items-center justify-center p-16 glass-card border border-white/5 text-center">
                <Brain className="h-14 w-14 text-white/20 mb-4 animate-pulse" />
                <h2 className="text-lg font-semibold text-white/80">{t("insights.empty.title", "No sessions yet")}</h2>
                <p className="text-xs text-white/50 mt-2 max-w-sm leading-relaxed">
                  {t("insights.empty.subtitle", "Run one block on the timer — your focus time, streaks, and history start filling in from there.")}
                </p>
              </div>
            ) : (
              <div className="space-y-8">

                {/* 12-Column Responsive Dashboard Grid (Stitch spec) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                  {/* Left Column: Focus Minutes Trend Chart (Col-span 8) */}
                  <div className="lg:col-span-8 flex flex-col">
                    <FocusTrendChart sessions={sessions} />
                  </div>

                  {/* Right Column: Key Stats & Focus Blocks (Col-span 4) */}
                  <KeyStatsColumn
                    totalSessions={report.totalSessions}
                    sessionsThisWeek={sessionsThisWeek}
                    completionRate={completionRate}
                    categoriesData={categoriesData}
                  />

                </div>

                {/* Momentum: streak, weekly goal, personal records */}
                <MomentumRow sessions={sessions} />

                {/* Focus Heatmap (Full width) */}
                <FocusHeatmap sessions={sessions} />

                {/* Glossary & History */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                  {/* Glossary (Left) */}
                  <div className="lg:col-span-5 h-full">
                    <FocusScienceGlossary />
                  </div>

                  {/* History list (Right) */}
                  <SessionHistory
                    sessions={sessions}
                    mounted={mounted}
                    deletingId={deletingId}
                    onDelete={handleDeleteSession}
                  />

                </div>

              </div>
            )}
            </div>
          </div>
        </div> {/* Right Side End */}
      </div> {/* Outer Wrapper End */}

      {/* Mobile Bottom Navigation Bar (Stitch premium mobile layout spec) */}
      <InsightsMobileNav />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        focusMinutes={report.totalFocusMinutes}
        fidgetCount={Math.round(report.averageFidgets * report.totalSessions)}
        isSummary={true}
        sessionCount={report.totalSessions}
        completionRate={completionRate}
      />
    </>
  );
}
