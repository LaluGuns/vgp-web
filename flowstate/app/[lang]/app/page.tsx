"use client";

import { WebGLBackground } from "@/components/scenes/webgl-background";
import { TimerDisplay } from "@/components/timer/timer-display";
import { TaskList } from "@/components/tasks/task-list";
import { ContextModal } from "@/components/optimizer/context-modal";
import { SessionSummary } from "@/components/optimizer/session-summary";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { DailyProgressCard } from "@/components/workspace/daily-progress-card";
import { GenreSelector } from "@/components/workspace/genre-selector";
import { AtmospherePanel, type AtmosphereTab } from "@/components/workspace/atmosphere-panel";
import { WorkspaceMobileNav, type MobileTab } from "@/components/workspace/mobile-nav";
import { OnboardingTour, TOUR_STEPS } from "@/components/workspace/onboarding-tour";

import { useTimerStore } from "@/lib/stores/timer-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useAppStore } from "@/lib/stores/app-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { use3dTilt } from "@/hooks/use-3d-tilt";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFocusTracker } from "@/hooks/use-focus-tracker";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const SCENE_THEMES: Record<string, { primary: string }> = {
  midnight: { primary: "199 100% 67%" },     // #58c4ff
  "rain-window": { primary: "190 100% 50%" }, // #00e5ff
  synthwave: { primary: "330 100% 50%" },     // #ff0080
  forest: { primary: "152 100% 50%" },        // #00ff88
  terminal: { primary: "139 100% 50%" },      // #00ff66
  sunset: { primary: "20 100% 50%" },         // #ff5500
};

export default function FlowstatePage() {
  const { t } = useTranslation();

  // The welcome tour card is this page's LCP element on first visit, so it must
  // paint with the SSR HTML instead of waiting for hydration. SSR always renders
  // step 0; an inline script (see TOUR_GATE_SCRIPT below) hides it pre-paint for
  // returning users via a CSS attribute gate, and this effect then reconciles
  // React state with the localStorage flag after hydration.
  const [tourStep, setTourStep] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<AtmosphereTab>("music");
  const [mobileTab, setMobileTab] = useState<MobileTab>("focus");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let completed = false;
    try {
      completed = !!localStorage.getItem("flowstate_tour_completed");
    } catch {}
    if (completed) {
      // Unmount the (CSS-hidden) SSR card. The data attribute keeps it hidden
      // until this re-render commits, so returning users never see a flash.
      setTourStep(null);
    } else {
      // First visit: make sure the gate attribute can't linger (e.g. flag was
      // cleared since the last visit) — the card must be visible.
      document.documentElement.removeAttribute("data-flowstate-tour-done");
    }
  }, []);

  const startTour = () => {
    // Restarting the tour must lift the pre-hydration CSS gate, otherwise the
    // card would mount but stay display:none for returning users.
    document.documentElement.removeAttribute("data-flowstate-tour-done");
    setTourStep(0);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = t("metadata.title", "Flowstate - Deep Work Music & Focus Timer");
    }
  }, [t]);

  const timerStatus = useTimerStore((s) => s.status);
  const isMusicPlaying = usePlayerStore((s) => s.isPlaying);

  // Global keyboard shortcuts (Space/R/S timer, P music, [ ] tracks)
  useKeyboardShortcuts();
  // Focus Optimizer: defection tracking, session lifecycle, context bookmark
  useFocusTracker();

  // Scene info for visual theme display
  const scene = useAppStore((s) => s.scene);
  // Interface theme. In "glass" the Scene recolours --primary (legacy behaviour);
  // other themes own their accent, so we don't let the Scene override it.
  const uiTheme = useThemeStore((s) => s.theme);

  // 3D Parallax Tilt — subtle, Apple-like
  const { tiltProps: taskTilt } = use3dTilt(1.2);
  const { tiltProps: timerTilt } = use3dTilt(1.2);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 550);
    return () => clearTimeout(timer);
  }, [mobileTab]);

  // Ask for notification permission only after the user shows intent by
  // starting the timer — a permission prompt on page load is just noise
  // (and browsers increasingly auto-deny it).
  const notificationAskedRef = useRef(false);
  useEffect(() => {
    if (timerStatus !== "running" || notificationAskedRef.current) return;
    notificationAskedRef.current = true;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [timerStatus]);

  const activeTourTarget = tourStep !== null && tourStep > 0 ? TOUR_STEPS[tourStep].target : null;

  return (
    <>
      {/* Pre-hydration tour gate: runs while the HTML streams in, before the
          welcome overlay below is parsed/painted. Returning users (flag in
          localStorage) get the SSR-rendered card hidden via CSS (see
          globals.css) with zero flash; first-time visitors get the card painted
          together with FCP — no JS needed for it to show. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            'try{if(localStorage.getItem("flowstate_tour_completed"))document.documentElement.setAttribute("data-flowstate-tour-done","")}catch(e){}',
        }}
      />

      {/* Dynamic WebGL dynamic fluid flow background */}
      <WebGLBackground />

      {/* Screen Edge Ambient Glow */}
      <div className={cn(
        "ambient-edge-glow",
        isMusicPlaying && "ambient-active-edge"
      )} />

      {/* Full screen, immersive application layout */}
      <div
        style={(uiTheme === "glass" ? { "--primary": SCENE_THEMES[scene]?.primary } : {}) as React.CSSProperties}
        className="w-full max-w-full h-screen flex relative select-none overflow-hidden bg-transparent p-5 gap-5"
      >

        {/* Left SideNav Sidebar (Stitch premium theme spec) */}
        <WorkspaceSidebar activeTourTarget={activeTourTarget} />

        {/* Right Side: Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Header — Clean Apple-style bar */}
          <WorkspaceHeader onStartTour={startTour} />

          {/* Main Application Workspace Content */}
          <div className="flex-1 overflow-hidden md:overflow-y-auto custom-scrollbar z-10 pr-1">
            <div className="min-h-full grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch animate-slide-in-left relative w-full h-[calc(100vh-180px)] md:h-auto overflow-hidden md:overflow-visible">

            {/* ═══ Column 1: Tasks List (3/12 cols) ═══ */}
            <div
              className={cn(
                "col-span-12 md:col-span-3 md:h-full flex flex-col tilt-container liquid-tab-panel",
                "absolute inset-0 w-full h-full md:relative md:inset-auto md:w-auto md:h-full",
                mobileTab === "tasks"
                  ? "translate-x-0 opacity-100 z-10 pointer-events-auto"
                  : "-translate-x-full opacity-0 pointer-events-none z-0",
                "md:translate-x-0 md:opacity-100 md:z-10 md:pointer-events-auto md:flex",
                isTransitioning && "liquid-melting"
              )}
              {...taskTilt}
            >
              <div
                id="tour-tasks"
                className={cn(
                  "glass-card flex-1 p-5 flex flex-col overflow-hidden relative transition-all duration-300",
                  activeTourTarget === "tasks" && "ring-2 ring-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.4)] border-[#00e5ff]/40"
                )}
              >
                <TaskList />
              </div>
            </div>

            {/* ═══ Column 2: Timer & Progress (5/12 cols) ═══ */}
            <div
              className={cn(
                "col-span-12 md:col-span-5 md:h-full flex flex-col gap-3 md:gap-5 overflow-y-auto scrollbar-hide pb-28 md:pb-0 pr-0.5 liquid-tab-panel",
                "absolute inset-0 w-full h-full md:relative md:inset-auto md:w-auto md:h-full",
                mobileTab === "focus"
                  ? "translate-x-0 opacity-100 z-10 pointer-events-auto"
                  : (mobileTab === "tasks" ? "translate-x-full opacity-0 pointer-events-none z-0" : "-translate-x-full opacity-0 pointer-events-none z-0"),
                "md:translate-x-0 md:opacity-100 md:z-10 md:pointer-events-auto md:flex",
                isTransitioning && "liquid-melting"
              )}
            >

              {/* Daily Progress widget with 3D Tilt */}
              <DailyProgressCard />

              {/* Sleek Collapsible Genre Selector */}
              <GenreSelector />

              {/* Timer Display with 3D Tilt */}
              <div
                id="tour-timer"
                className={cn(
                  "flex-none md:flex-1 flex flex-col justify-center items-center py-4 md:py-6 px-4 md:px-5 glass-card min-h-[360px] md:min-h-0 overflow-visible md:overflow-hidden relative tilt-container transition-all duration-300",
                  timerStatus === "running" && "card-glow-active",
                  activeTourTarget === "timer" && "ring-2 ring-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.4)] border-[#00e5ff]/40"
                )}
                {...timerTilt}
              >
                <TimerDisplay />
              </div>

            </div>

            {/* ═══ Column 3: Atmosphere Panel (4/12 cols) ═══ */}
            <div
              className={cn(
                "col-span-12 md:col-span-4 md:h-full flex flex-col overflow-hidden relative liquid-tab-panel",
                "absolute inset-0 w-full h-full md:relative md:inset-auto md:w-auto md:h-full",
                mobileTab === "atmosphere"
                  ? "translate-x-0 opacity-100 z-10 pointer-events-auto"
                  : "translate-x-full opacity-0 pointer-events-none z-0",
                "md:translate-x-0 md:opacity-100 md:z-10 md:pointer-events-auto md:flex",
                isTransitioning && "liquid-melting"
              )}
            >
              <AtmospherePanel
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeTourTarget={activeTourTarget}
              />
            </div>

          </div>
        </div>

      </div> {/* Right Side End */}

      </div> {/* Left Sidebar Outer Wrapper End */}

      {/* Mobile Bottom Navigation Bar (Stitch premium mobile layout spec) */}
      <WorkspaceMobileNav
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        activeTourTarget={activeTourTarget}
      />

      <ContextModal />
      <SessionSummary />

      {/* Interactive Tour Guide Overlay/Tooltip */}
      <OnboardingTour
        tourStep={tourStep}
        setTourStep={setTourStep}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
      />
    </>
  );
}
