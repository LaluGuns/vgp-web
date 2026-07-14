"use client";

import Image from "next/image";
import Link from "next/link";
import { WebGLBackground } from "@/components/scenes/webgl-background";
import { TimerDisplay } from "@/components/timer/timer-display";
import { GENRES } from "@/lib/catalog";
import { recordFidget } from "@/lib/optimizer/fidget";
import { AmbientMixer } from "@/components/mixer/ambient-mixer";
import { MusicPlayer } from "@/components/player/music-player";
import { TaskList } from "@/components/tasks/task-list";
import { SceneSelector } from "@/components/scenes/scene-selector";

const SCENE_THEMES: Record<string, { primary: string }> = {
  midnight: { primary: "199 100% 67%" },     // #58c4ff
  "rain-window": { primary: "190 100% 50%" }, // #00e5ff
  synthwave: { primary: "330 100% 50%" },     // #ff0080
  forest: { primary: "152 100% 50%" },        // #00ff88
  terminal: { primary: "139 100% 50%" },      // #00ff66
  sunset: { primary: "20 100% 50%" },         // #ff5500
};

const SCENE_PROGRESS_THEMES: Record<
  string,
  {
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
  }
> = {
  midnight: { gradientStart: "#00A3FF", gradientMid: "#00E5FF", gradientEnd: "#80F5FF" },
  "rain-window": { gradientStart: "#0099FF", gradientMid: "#00E5FF", gradientEnd: "#80F5FF" },
  synthwave: { gradientStart: "#FF0080", gradientMid: "#D900FF", gradientEnd: "#F680FF" },
  forest: { gradientStart: "#047857", gradientMid: "#10B981", gradientEnd: "#80FFB8" },
  terminal: { gradientStart: "#022c22", gradientMid: "#059669", gradientEnd: "#80FF8A" },
  sunset: { gradientStart: "#CC3300", gradientMid: "#FF5500", gradientEnd: "#FFD080" },
};

import { musicPlayer } from "@/lib/audio/hls-player";
import { useTaskStore } from "@/lib/stores/task-store";
import { useTimerStore } from "@/lib/stores/timer-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useAppStore } from "@/lib/stores/app-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { use3dTilt } from "@/hooks/use-3d-tilt";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { AccountButton } from "@/components/auth/account-button";
import { useUser } from "@/hooks/use-user";
import { userDisplayName, userAvatarUrl } from "@/lib/user-profile";
import { useFocusTracker } from "@/hooks/use-focus-tracker";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { ContextModal } from "@/components/optimizer/context-modal";
import { SessionSummary } from "@/components/optimizer/session-summary";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { Maximize2, Minimize2, Lock, ChevronRight, Music, Volume2, Palette, ChevronDown, ChevronUp, CheckSquare, Timer, Sliders, BarChart2, HelpCircle } from "lucide-react";

// Atmosphere tab geometry (module-level constants — stable across renders).
const getTabLeftPct = (idx: number) => idx * 33.33 + 1;
const TAB_WIDTH_PCT = 33.33 - 2;

function LiveClock() {
  const [time, setTime] = useState({ hour: "00", minute: "00", second: "00" });
  useEffect(() => {
    function tick() {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      setTime({
        hour: pad(now.getHours()),
        minute: pad(now.getMinutes()),
        second: pad(now.getSeconds()),
      });
    }
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.06] backdrop-blur-md shadow-[inset_0_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.15)] select-none group hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
      <span className="text-[10px] font-mono font-medium text-white/50 tracking-wider tabular-nums flex items-center">
        <span>{time.hour}</span>
        <span className="animate-pulse inline-block duration-1000 mx-0.5 text-white/30">:</span>
        <span>{time.minute}</span>
        <span className="text-white/20 text-[9px] ml-1.5">{time.second}</span>
      </span>
    </div>
  );
}

export default function FlowstatePage() {
  const { t, locale, setLocale } = useTranslation();
  const { user } = useUser();
  const displayName = userDisplayName(user);
  const avatarUrl = userAvatarUrl(user);
  const isPremium = useAppStore((s) => s.isPremium);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [placement, setPlacement] = useState<"top" | "bottom" | "left" | "right" | "center">("center");
  const [activeTab, setActiveTab] = useState<"music" | "ambient" | "theme">("music");
  const [mobileTab, setMobileTab] = useState<"tasks" | "focus" | "atmosphere">("focus");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const TOUR_STEPS = [
    {
      title: "Welcome to Flowstate",
      desc: "A timer, music produced in-house by Virzy Guns Production, an ambient mixer, and a task list. That's the whole setup — takes about a minute to walk through.",
      target: "workspace"
    },
    {
      title: "1. Pomodoro Timer",
      desc: "Center of the screen. Click Play or hit SPACEBAR to start a 25-minute focus block. The gear sets your own work and break lengths.",
      target: "timer"
    },
    {
      title: "2. Soundtracks",
      desc: "Pick a track on the 'Music' tab — lofi, synthwave, ambient, all produced in-house. Tip: [ and ] swap tracks from the keyboard.",
      target: "music"
    },
    {
      title: "3. Ambient Mixer",
      desc: "The 'Ambient' tab, next to 'Music'. Layer rain, café, campfire, and white noise — each slider sets its own level.",
      target: "ambient"
    },
    {
      title: "4. Task Checklist",
      desc: "Left sidebar. Add tasks, estimate pomodoros, check them off as you go. One task per block keeps things clean. Press T to open the editor.",
      target: "tasks"
    },
    {
      title: "5. Focus Insights",
      desc: "Click 'Stats' in the sidebar or the mobile bottom bar. Sessions, streaks, and a heatmap of when you actually focus.",
      target: "stats"
    }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("flowstate_tour_completed");
      if (!completed) {
        setTourStep(0);
      }
    }
  }, []);

  // Update layout position of tour guide tooltips
  useEffect(() => {
    if (tourStep === null) return;

    if (tourStep === 0) {
      setPlacement("center");
      setTooltipStyle({});
      return;
    }

    const currentStep = TOUR_STEPS[tourStep];
    if (!currentStep) return;

    // Automatically transition tab / mobile state depending on active tour target
    if (tourStep === 1) {
      setMobileTab("focus");
    } else if (tourStep === 2) {
      setMobileTab("atmosphere");
      setActiveTab("music");
    } else if (tourStep === 3) {
      setMobileTab("atmosphere");
      setActiveTab("ambient");
    } else if (tourStep === 4) {
      setMobileTab("tasks");
    }

    const updatePosition = () => {
      let el: HTMLElement | null = null;
      if (currentStep.target === "timer") {
        el = document.getElementById("tour-timer");
      } else if (currentStep.target === "music") {
        el = document.getElementById("tour-music-tab");
      } else if (currentStep.target === "ambient") {
        el = document.getElementById("tour-ambient-tab");
      } else if (currentStep.target === "tasks") {
        el = document.getElementById("tour-tasks");
      } else if (currentStep.target === "stats") {
        el = window.innerWidth < 768 
          ? document.getElementById("tour-stats-bottom")
          : document.getElementById("tour-stats-sidebar");
      }

      if (!el) {
        setPlacement("center");
        setTooltipStyle({});
        return;
      }

      const rect = el.getBoundingClientRect();
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;

      // Decide placement
      let pref: "top" | "bottom" | "left" | "right" = "bottom";
      if (currentStep.target === "timer") {
        pref = "top";
      } else if (currentStep.target === "music" || currentStep.target === "ambient") {
        pref = winWidth < 768 ? "top" : "left";
      } else if (currentStep.target === "tasks") {
        pref = winWidth < 768 ? "bottom" : "right";
      } else if (currentStep.target === "stats") {
        pref = winWidth < 768 ? "top" : "right";
      }

      const gap = 14;
      let top = 0;
      let left = 0;
      const tooltipW = 340;
      const tooltipH = 180;

      if (pref === "bottom") {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2;
        left = Math.max(tooltipW / 2 + 16, Math.min(winWidth - tooltipW / 2 - 16, left));
      } else if (pref === "top") {
        top = rect.top - gap;
        left = rect.left + rect.width / 2;
        left = Math.max(tooltipW / 2 + 16, Math.min(winWidth - tooltipW / 2 - 16, left));
      } else if (pref === "left") {
        top = rect.top + rect.height / 2;
        left = rect.left - gap;
        top = Math.max(tooltipH / 2 + 16, Math.min(winHeight - tooltipH / 2 - 16, top));
      } else if (pref === "right") {
        top = rect.top + rect.height / 2;
        left = rect.right + gap;
        top = Math.max(tooltipH / 2 + 16, Math.min(winHeight - tooltipH / 2 - 16, top));
      }

      setPlacement(pref);
      setTooltipStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        transform: 
          pref === "bottom" ? "translate(-50%, 0)" :
          pref === "top" ? "translate(-50%, -100%)" :
          pref === "left" ? "translate(-100%, -50%)" :
          "translate(0, -50%)",
        zIndex: 9999,
      });
    };

    const handle = setTimeout(updatePosition, 200);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      clearTimeout(handle);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [tourStep, mobileTab, activeTab]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = t("metadata.title", "Flowstate - Deep Work Music & Focus Timer");
    }
  }, [t]);

  const phase = useTimerStore((s) => s.phase);
  const timerStatus = useTimerStore((s) => s.status);
  const isMusicPlaying = usePlayerStore((s) => s.isPlaying);
  const activeGenre = usePlayerStore((s) => s.activeGenre);
  const playGenre = usePlayerStore((s) => s.playGenre);


  // Global keyboard shortcuts (Space/R/S timer, P music, [ ] tracks)
  useKeyboardShortcuts();
  // Focus Optimizer: defection tracking, session lifecycle, context bookmark
  useFocusTracker();

  const autopilot = useFocusSessionStore((s) => s.autopilot);
  const optimizerLocked = autopilot && timerStatus === "running" && phase === "focus";

  // Scene info for visual theme display
  const scene = useAppStore((s) => s.scene);
  // Interface theme. In "glass" the Scene recolours --primary (legacy behaviour);
  // other themes own their accent, so we don't let the Scene override it.
  const uiTheme = useThemeStore((s) => s.theme);

  const activeColor = uiTheme !== "glass" ? uiTheme : scene;
  const activeLogoClass =
    activeColor === "studio" ? "logo-amber" :
    activeColor === "editorial" ? "logo-red" :
    activeColor === "terminal" ? "logo-green" :
    activeColor === "synthwave" ? "logo-magenta" :
    activeColor === "forest" ? "logo-emerald" :
    activeColor === "sunset" ? "logo-orange" :
    "logo-cyan";

  // 3D Parallax Tilt — subtle, Apple-like
  const { tiltProps: taskTilt } = use3dTilt(1.2);
  const { tiltProps: timerTilt } = use3dTilt(1.2);
  const { tiltProps: progressTilt } = use3dTilt(0.8);

  // Task metrics for Daily Progress card
  const tasks = useTaskStore((s) => s.tasks);
  const doneCount = tasks.filter((t) => t.done).length;
  const totalEstimated = tasks.reduce((sum, t) => sum + t.pomodorosEstimated, 0);
  const totalDone = tasks.reduce((sum, t) => sum + t.pomodorosDone, 0);
  const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0;

  const progressRadius = 25;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset = progressCircumference - (progress / 100) * progressCircumference;


  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 550);
    return () => clearTimeout(timer);
  }, [mobileTab]);

  const [isGenresExpanded, setIsGenresExpanded] = useState(false);

  // Two-phase liquid stretch for atmosphere tabs
  const tabOrder = ["music", "ambient", "theme"] as const;
  const activeTabIdx = tabOrder.indexOf(activeTab);
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [tabPill, setTabPill] = useState({ leftPct: 1, widthPct: 31.33 });
  const prevTabIdxRef = useRef(0);
  const tabTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const prev = prevTabIdxRef.current;
    const next = activeTabIdx;
    if (prev === next) return;

    if (tabTimerRef.current) clearTimeout(tabTimerRef.current);

    const prevLeft = getTabLeftPct(prev);
    const newLeft = getTabLeftPct(next);
    const minLeft = Math.min(prevLeft, newLeft);
    const maxRight = Math.max(prevLeft, newLeft) + TAB_WIDTH_PCT;

    // Phase 1: stretch across both positions
    setTabPill({ leftPct: minLeft, widthPct: maxRight - minLeft });

    // Phase 2: contract to new position
    tabTimerRef.current = setTimeout(() => {
      setTabPill({ leftPct: newLeft, widthPct: TAB_WIDTH_PCT });
    }, 220);

    prevTabIdxRef.current = next;
  }, [activeTabIdx]);

  const [showThemes, setShowThemes] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function toggleFullscreen() {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // Find current scene name for display
  const sceneNames: Record<string, string> = {
    midnight: "Dynamic Glass",
    "rain-window": "Rain Window",
    synthwave: "Synthwave",
    forest: "Deep Forest",
    terminal: "Terminal",
    sunset: "Sunset",
  };
  const currentSceneName = t(`dashboard.themes.${scene}`, sceneNames[scene] ?? "Dynamic Glass");
  const activeTourTarget = tourStep !== null && tourStep > 0 ? TOUR_STEPS[tourStep].target : null;

  return (
    <>
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
        <nav className="relative hidden md:flex flex-col h-full w-64 backdrop-blur-[45px] border-t border-l border-white/15 border-r border-b border-white/5 bg-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[32px] py-8 shrink-0 z-20 overflow-hidden">
          {/* Top specular reflection strip */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          
          <div className="px-6 mb-10 select-none">
            <Image
              src="/icons/flowstate-logo.png"
              alt="Flow"
              width={120}
              height={40}
              className={cn(
                "h-8 w-auto object-contain theme-logo transition-all duration-500",
                activeLogoClass
              )}
              priority
            />
            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-2.5 ml-0.5">{t("dashboard.deepWorkActive", "Deep Work Active")}</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-1.5 px-3">
            <Link
              href="/app"
              className="relative px-4 py-3 flex items-center gap-3 rounded-2xl bg-white/[0.07] border border-white/20 border-t-white/40 border-l-primary/60 shadow-[0_8px_20px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-wider text-primary drop-shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all duration-300 scale-[1.02]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              <span>{t("dashboard.focus", "Focus")}</span>
            </Link>
            <Link
              id="tour-stats-sidebar"
              href="/insights"
              className={cn(
                "group px-4 py-3 flex items-center gap-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.03] text-white/50 hover:text-white/90 transition-all duration-300 font-mono text-[11px] font-semibold uppercase tracking-wider hover:translate-x-1 active:scale-[0.98]",
                activeTourTarget === "stats" && "ring-2 ring-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-[#00e5ff]/10 text-white"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors duration-300" />
              <span>{t("dashboard.insights", "Insights")}</span>
            </Link>
          </div>
          
          <div className="mt-auto flex flex-col gap-1.5 px-3 pt-6 border-t border-white/10">
            {user && (
              <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/40 shrink-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[11px] font-bold text-white">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    (displayName || "?").charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white/90 truncate leading-tight">{displayName}</p>
                  <p className={cn("text-[9px] font-mono uppercase tracking-wider", isPremium ? "text-primary" : "text-white/35")}>
                    {isPremium ? "Pro" : t("dashboard.freePlan", "Free plan")}
                  </p>
                </div>
              </div>
            )}
            <Link
              href="/pricing"
              className="group px-4 py-2.5 flex items-center gap-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.03] text-white/50 hover:text-white/90 transition-all duration-300 font-mono text-[11px] font-semibold uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors duration-300" />
              <span>{t("dashboard.upgrade", "Upgrade")}</span>
            </Link>
            
            {/* Language Selector Dropdown */}
            <div className="px-4 py-1">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl px-2 py-1 text-[9px] font-mono text-white/50 hover:text-white/80 transition-all duration-300 focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#0b1326] text-white">English</option>
                <option value="id" className="bg-[#0b1326] text-white">Bahasa Indonesia</option>
                <option value="es" className="bg-[#0b1326] text-white">Español</option>
                <option value="fr" className="bg-[#0b1326] text-white">Français</option>
                <option value="de" className="bg-[#0b1326] text-white">Deutsch</option>
                <option value="ja" className="bg-[#0b1326] text-white">日本語</option>
                <option value="ko" className="bg-[#0b1326] text-white">한국어</option>
                <option value="zh" className="bg-[#0b1326] text-white">简体中文</option>
                <option value="pt" className="bg-[#0b1326] text-white">Português</option>
                <option value="ru" className="bg-[#0b1326] text-white">Русский</option>
                <option value="it" className="bg-[#0b1326] text-white">Italiano</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-4 pt-2 text-[9px] font-mono text-white/25">
              <Link href="/legal/terms" className="hover:text-white/60 transition-colors">{t("dashboard.terms", "Terms")}</Link>
              <span>·</span>
              <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">{t("dashboard.privacy", "Privacy")}</Link>
              <span>·</span>
              <Link href="/legal/refund" className="hover:text-white/60 transition-colors">{t("dashboard.refunds", "Refunds")}</Link>
            </div>
          </div>
        </nav>

        {/* Right Side: Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Header — Clean Apple-style bar */}
          <header className="h-14 flex items-center justify-between pb-4 shrink-0 select-none z-20">
            {/* Left: Live clock on desktop */}
            <div className="hidden md:flex items-center gap-3 w-40">
              <LiveClock />
            </div>

            {/* Mobile Language Selector */}
            <div className="flex md:hidden items-center w-24">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-xl px-2 py-1 text-[9px] font-mono text-white/50 hover:text-white/80 transition-all duration-300 focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#0b1326] text-white">EN</option>
                <option value="id" className="bg-[#0b1326] text-white">ID</option>
                <option value="es" className="bg-[#0b1326] text-white">ES</option>
                <option value="fr" className="bg-[#0b1326] text-white">FR</option>
                <option value="de" className="bg-[#0b1326] text-white">DE</option>
                <option value="ja" className="bg-[#0b1326] text-white">JA</option>
                <option value="ko" className="bg-[#0b1326] text-white">KO</option>
                <option value="zh" className="bg-[#0b1326] text-white">ZH</option>
                <option value="pt" className="bg-[#0b1326] text-white">PT</option>
                <option value="ru" className="bg-[#0b1326] text-white">RU</option>
                <option value="it" className="bg-[#0b1326] text-white">IT</option>
              </select>
            </div>

            {/* Center: Title/Logo */}
            <div className="flex items-center gap-2 group cursor-pointer select-none">
              <Image
                src="/icons/flowstate-logo.png"
                alt="Flow"
                width={100}
                height={32}
                className={cn(
                  "h-7 w-auto object-contain opacity-85 hover:opacity-100 theme-logo transition-all duration-500",
                  activeLogoClass
                )}
                priority
              />
            </div>

            {/* Right: Account + Tour Guide + Fullscreen */}
            <div className="flex justify-end items-center gap-2 w-auto md:w-52">
              <AccountButton />
              
              {/* Onboarding Tour Button */}
              <button
                onClick={() => setTourStep(0)}
                aria-label="Start guided tour"
                title="Start Tour Guide"
                className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 shadow-[inset_0_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-90"
              >
                <HelpCircle className="h-4 w-4 text-[#00e5ff] group-hover:text-cyan-300 transition-colors" />
              </button>
              <button
                onClick={toggleFullscreen}
                aria-label={t("dashboard.player.toggleFullscreen", "Toggle fullscreen")}
                title={t("dashboard.player.fullscreen", "Fullscreen")}
                className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 shadow-[inset_0_1px_rgba(255,255,255,0.05),0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-90"
              >
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out transform",
                      isFullscreen 
                        ? "opacity-0 scale-75 rotate-90 pointer-events-none" 
                        : "opacity-100 scale-100 rotate-0"
                    )}
                  >
                    <Maximize2 className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
                  </div>
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out transform",
                      isFullscreen 
                        ? "opacity-100 scale-100 rotate-0" 
                        : "opacity-0 scale-75 -rotate-90 pointer-events-none"
                    )}
                  >
                    <Minimize2 className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" />
                  </div>
                </div>
              </button>
            </div>
          </header>

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
              <div className="glass-card p-5 flex items-center justify-between shrink-0 tilt-container" {...progressTilt}>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-sans text-white/45 uppercase tracking-[0.15em] font-bold leading-none">
                    {t("dashboard.dailyProgress", "Daily Progress")}
                  </span>
                  <h4 className="text-sm font-bold text-white/90 tracking-tight leading-tight">
                    {tasks.length > 0 ? (
                      <>
                        <span className="text-white font-bold">{doneCount}</span>
                        <span className="text-white/30 mx-0.5">/</span>
                        <span className="text-white/70">{tasks.length}</span> {t("dashboard.tasksCompleted", "tasks completed")}
                      </>
                    ) : (
                      <span className="text-white/40 italic font-normal">{t("dashboard.noTasks", "No tasks active today")}</span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 leading-none">
                    <span>
                      <span className="text-white/70 font-semibold">{totalDone}</span>
                      <span className="text-white/30 mx-0.5">/</span>
                      <span className="text-white/60">{totalEstimated}</span> {t("dashboard.sessions", "sessions")}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                    <span className="text-primary font-bold tracking-tight">{progress.toFixed(0)}% {t("dashboard.achieved", "achieved")}</span>
                  </div>
                </div>

                {/* 3D Glass Disc Progress Indicator with SVG Ring */}
                <div className="relative w-16 h-16 rounded-full glass-dome-sm flex items-center justify-center shrink-0 select-none shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  {/* Specular sheen reflection */}
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/25 to-transparent opacity-90 pointer-events-none z-20" />
                  
                  {/* Outer glassy shine ring */}
                  <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none z-10" />

                  {/* SVG progress ring */}
                  <svg className="absolute inset-0 -rotate-90 w-full h-full p-1 z-0" viewBox="0 0 64 64">
                    <defs>
                      <linearGradient id="progressRingGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={SCENE_PROGRESS_THEMES[scene]?.gradientStart ?? "#00A3FF"} />
                        <stop offset="60%" stopColor={SCENE_PROGRESS_THEMES[scene]?.gradientMid ?? "#00E5FF"} />
                        <stop offset="100%" stopColor={SCENE_PROGRESS_THEMES[scene]?.gradientEnd ?? "#80F5FF"} />
                      </linearGradient>
                      <filter id="ring-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Background track circle - dark inset depth contrast */}
                    <circle
                      cx="32"
                      cy="32"
                      r={progressRadius}
                      fill="none"
                      style={{ stroke: "hsl(var(--primary) / 0.08)" }}
                      strokeWidth="3.5"
                    />
                    {/* Background track light border overlay for premium glassy look */}
                    <circle
                      cx="32"
                      cy="32"
                      r={progressRadius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="3.5"
                    />

                    {progress > 0 && (
                      <>
                        {/* Glow under-layer */}
                        <circle
                          cx="32"
                          cy="32"
                          r={progressRadius}
                          fill="none"
                          stroke="url(#progressRingGradient)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={progressCircumference}
                          strokeDashoffset={progressOffset}
                          opacity="0.4"
                          filter="url(#ring-glow)"
                          className="transition-[stroke-dashoffset] duration-700 ease-out"
                        />
                        {/* Sharp foreground ring */}
                        <circle
                          cx="32"
                          cy="32"
                          r={progressRadius}
                          fill="none"
                          stroke="url(#progressRingGradient)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={progressCircumference}
                          strokeDashoffset={progressOffset}
                          className="transition-[stroke-dashoffset] duration-700 ease-out"
                        />
                      </>
                    )}
                  </svg>
                  
                  {/* Percentage label */}
                  <span className="relative z-10 text-xs font-mono font-extrabold text-white tracking-tighter drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>

              {/* Sleek Collapsible Genre Selector */}
              <div className="glass-card p-3 flex flex-col shrink-0 transition-all duration-300">
                <button
                  onClick={() => setIsGenresExpanded(!isGenresExpanded)}
                  className="flex items-center justify-between w-full text-left focus:outline-none select-none group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                      <Music className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-sans text-white/35 uppercase tracking-[0.15em] block leading-none mb-1.5 font-bold">{t("dashboard.player.soundtrack", "Focus Soundtrack")}</span>
                      <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
                        {activeGenre}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-sans font-semibold uppercase tracking-[0.05em] text-white/40 group-hover:text-white/60 transition-colors duration-300">
                      {isGenresExpanded ? t("dashboard.player.collapse", "Collapse") : t("dashboard.player.changeSound", "Change Sound")}
                    </span>
                    <div className="w-5 h-5 rounded-md hover:bg-white/[0.04] flex items-center justify-center text-white/50 group-hover:text-white transition-colors duration-300">
                      {isGenresExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </button>

                <div className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isGenresExpanded ? "grid-rows-[1fr] opacity-100 mt-3.5" : "grid-rows-[0fr] opacity-0"
                )}>
                  <div className="overflow-hidden">
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 px-0.5 border-t border-white/[0.04] pt-3">
                      {GENRES.map((g) => {
                        const isActive = activeGenre === g;
                        return (
                          <button
                            key={g}
                            onClick={() => {
                              musicPlayer.unlockAudio();
                              playGenre(g);
                              recordFidget();
                            }}
                            className={cn(
                              "shrink-0 px-3.5 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 border flex items-center gap-1.5 active:scale-95",
                              isActive
                                ? "bg-primary/[0.12] text-primary border-primary/25 shadow-[inset_0_1px_rgba(255,255,255,0.1),0_0_12px_rgba(0,229,255,0.25)] border-t-primary/35 border-l-primary/30 font-semibold"
                                : "text-white/60 hover:text-white bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                            )}
                          >
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
                            )}
                            <span>{g}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

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
              <div className={cn(
                "glass-card p-5 h-full flex flex-col overflow-hidden transition-all duration-700",
                isMusicPlaying && "card-glow-active",
                optimizerLocked && "opacity-40 pointer-events-none"
              )}>
                {/* Header for Environment */}
                <div className="border-b border-white/[0.04] pb-3 mb-4 select-none shrink-0 flex items-center justify-between">
                  <div>
                    <span className="text-[9.5px] font-sans font-bold uppercase tracking-[0.15em] text-white/30 leading-none mb-1 block">{t("dashboard.mixer.atmosphere", "Atmosphere")}</span>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-tight">{t("dashboard.mixer.environmentalControls", "Environmental Controls")}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-primary/60">{t("dashboard.mixer.unified", "Unified")}</span>
                </div>

                {/* Glass Tab Selector with sliding liquid indicator */}
                <div ref={tabContainerRef} className="relative mb-4 shrink-0 h-10 select-none">
                  {/* Gooey filter layer — high-opacity blob for visible liquid merging */}
                  <div
                    className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                    style={{ filter: "url(#liquid-goo)" }}
                  >
                    <div className="absolute inset-0 bg-white/[0.04] rounded-xl" />
                    <div
                      className="absolute top-[3px] bottom-[3px] rounded-lg bg-white/[0.18] transition-all duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu will-change-[left,width]"
                      style={{
                        left: `${tabPill.leftPct}%`,
                        width: `${tabPill.widthPct}%`,
                      }}
                    />
                  </div>

                  {/* Crisp glass indicator (no filter, clean edges) */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div
                      className="absolute top-[3px] bottom-[3px] rounded-lg backdrop-blur-md bg-white/[0.07] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)] transition-all duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu will-change-[left,width]"
                      style={{
                        left: `${tabPill.leftPct}%`,
                        width: `${tabPill.widthPct}%`,
                      }}
                    />
                  </div>

                  {/* Track border */}
                  <div className="absolute inset-0 rounded-xl border border-white/[0.06] pointer-events-none" />

                  {/* Interactive buttons */}
                  <div className="absolute inset-0 grid grid-cols-3 p-1 items-center">
                    <button
                      id="tour-music-tab"
                      onClick={() => setActiveTab("music")}
                      className={cn(
                        "relative z-10 py-1 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5",
                        activeTab === "music" ? "text-white font-bold" : "text-white/60 hover:text-white",
                        activeTourTarget === "music" && "ring-2 ring-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-[#00e5ff]/10"
                      )}
                    >
                      <Music className="h-3.5 w-3.5" /> {t("dashboard.player.title", "Music")}
                    </button>
                    <button
                      id="tour-ambient-tab"
                      onClick={() => setActiveTab("ambient")}
                      className={cn(
                        "relative z-10 py-1 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5",
                        activeTab === "ambient" ? "text-white font-bold" : "text-white/60 hover:text-white",
                        activeTourTarget === "ambient" && "ring-2 ring-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-[#00e5ff]/10"
                      )}
                    >
                      <Volume2 className="h-3.5 w-3.5" /> {t("dashboard.player.ambient", "Ambient")}
                    </button>
                    <button
                      onClick={() => setActiveTab("theme")}
                      className={cn(
                        "relative z-10 py-1 rounded-lg text-xs font-semibold transition-colors duration-300 flex items-center justify-center gap-1.5",
                        activeTab === "theme" ? "text-white font-bold" : "text-white/60 hover:text-white"
                      )}
                    >
                      <Palette className="h-3.5 w-3.5" /> {t("dashboard.player.theme", "Theme")}
                    </button>
                  </div>
                </div>

                {/* Tab Content — scrollable area. */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                  <div className={cn("space-y-3 mb-3", activeTab === "music" ? "block" : "hidden")}>
                    <div className="flex items-center justify-between select-none mb-1">
                      <h4 className="text-[9.5px] font-sans font-bold text-white/45 uppercase tracking-[0.15em] leading-none">{t("dashboard.player.nowPlaying", "Now Playing")}</h4>
                      <span className="text-[9.5px] font-sans font-bold uppercase tracking-[0.05em] text-primary/60 leading-none">{t("dashboard.player.originals", "Originals")}</span>
                    </div>
                    <div className="glass-tile p-5">
                      <MusicPlayer />
                    </div>
                  </div>

                  <div className={cn("space-y-3 mb-3", activeTab === "ambient" ? "block" : "hidden")}>
                    <div className="flex items-center justify-between select-none mb-1">
                      <h4 className="text-[9.5px] font-sans font-bold text-white/45 uppercase tracking-[0.15em] leading-none">{t("dashboard.mixer.title", "Ambient Mixer")}</h4>
                      <span className="text-[9.5px] font-sans font-bold uppercase tracking-[0.05em] text-primary/60 leading-none">{t("dashboard.mixer.layered", "Layered")}</span>
                    </div>
                    <div className="glass-tile p-5">
                      <AmbientMixer />
                    </div>
                  </div>

                  <div className={cn("space-y-3 mb-3", activeTab === "theme" ? "block" : "hidden")}>
                    <div className="flex items-center justify-between select-none mb-1">
                      <h4 className="text-[9.5px] font-sans font-bold text-white/45 uppercase tracking-[0.15em] leading-none">{t("dashboard.player.theme", "Visual Theme")}</h4>
                      <span className="text-[9.5px] font-sans font-bold uppercase tracking-[0.05em] text-primary/60 leading-none">{currentSceneName}</span>
                    </div>
                    <div className="glass-tile p-5">
                      <SceneSelector />
                    </div>
                  </div>
                </div>
              </div>

              {optimizerLocked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="glass-card px-4 py-2.5 !rounded-full flex items-center gap-2 text-primary text-[11px] font-mono uppercase tracking-[0.15em]">
                    <Lock className="h-4 w-4" /> {t("dashboard.timer.lockedAutopilot", "Locked · Autopilot")}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div> {/* Right Side End */}

      </div> {/* Left Sidebar Outer Wrapper End */}

      {/* Mobile Bottom Navigation Bar (Stitch premium mobile layout spec) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-16 glass-pill flex items-center justify-around z-40 px-3 shadow-[0_16px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl border border-white/10 bg-black/40 rounded-full">
        {/* Tasks Tab */}
        <button
          onClick={() => setMobileTab("tasks")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 rounded-full",
            mobileTab === "tasks" ? "text-primary scale-105" : "text-white/45 hover:text-white"
          )}
        >
          <CheckSquare className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.tasks.title", "Tasks")}</span>
        </button>

        {/* Focus Tab (Central highlight) */}
        <button
          onClick={() => setMobileTab("focus")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 rounded-full relative -top-3 w-14 h-14 bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/15 shadow-xl backdrop-blur-xl",
            mobileTab === "focus"
              ? "text-primary border-primary/40 shadow-[0_8px_24px_rgba(88,196,255,0.3),inset_0_1px_rgba(255,255,255,0.25)]"
              : "text-white/60 hover:text-white"
          )}
        >
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/5 animate-pulse",
            mobileTab === "focus" ? "block" : "hidden"
          )} />
          <Timer className="h-6 w-6 relative z-10" />
          <span className="text-[8px] font-sans font-extrabold uppercase tracking-widest mt-0.5 relative z-10">{t("dashboard.timer.focus", "Focus")}</span>
        </button>

        {/* Atmosphere Tab */}
        <button
          onClick={() => setMobileTab("atmosphere")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 rounded-full",
            mobileTab === "atmosphere" ? "text-primary scale-105" : "text-white/45 hover:text-white"
          )}
        >
          <Sliders className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.player.sound", "Sound")}</span>
        </button>

        {/* Insights Link */}
        <Link
          id="tour-stats-bottom"
          href="/insights"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 text-white/45 hover:text-white transition-all duration-300",
            activeTourTarget === "stats" && "ring-2 ring-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-[#00e5ff]/10 rounded-xl"
          )}
        >
          <BarChart2 className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.insights", "Insights")}</span>
        </Link>
      </div>

      <ContextModal />
      <SessionSummary />

      {/* Interactive Tour Guide Overlay/Tooltip */}
      {tourStep !== null && (
        <>
          {/* Backdrop only for Step 0 (Welcome) */}
          {tourStep === 0 && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
              <div className="glass-card p-6 md:p-8 rounded-[24px] border border-[#00e5ff]/20 max-w-md w-full bg-[#0b1326]/90 shadow-[0_0_50px_rgba(0,229,255,0.15)] space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono text-[#00e5ff] tracking-widest uppercase bg-[#00e5ff]/10 px-2.5 py-1 rounded-md font-bold">
                    GUIDED TOUR • STEP 1 OF {TOUR_STEPS.length}
                  </span>
                  <button 
                    onClick={() => {
                      setTourStep(null);
                      localStorage.setItem("flowstate_tour_completed", "true");
                    }}
                    className="text-white/45 hover:text-white text-xs font-mono font-bold tracking-wider"
                  >
                    SKIP
                  </button>
                </div>

                <div className="space-y-2 text-left">
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {TOUR_STEPS[tourStep].title}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {TOUR_STEPS[tourStep].desc}
                  </p>
                </div>

                <div className="flex justify-end items-center pt-2">
                  <button
                    onClick={() => setTourStep(1)}
                    className="px-6 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                  >
                    Start Tour →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Tooltips for Step 1 to 5 */}
          {tourStep > 0 && (
            <div 
              style={tooltipStyle} 
              className="w-[calc(100vw-32px)] sm:w-[340px] p-5 rounded-2xl border border-[#00e5ff]/35 bg-[#0b1326]/95 shadow-[0_12px_40px_rgba(0,229,255,0.22)] space-y-4 text-left backdrop-blur-md transition-all duration-300 ease-out animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Arrow pointer */}
              <div
                className={cn(
                  "absolute w-3 h-3 bg-[#0b1326] border-[#00e5ff]/35 rotate-45 pointer-events-none",
                  placement === "top" && "bottom-[-7px] left-1/2 -translate-x-1/2 border-r border-b",
                  placement === "bottom" && "top-[-7px] left-1/2 -translate-x-1/2 border-l border-t",
                  placement === "left" && "right-[-7px] top-1/2 -translate-y-1/2 border-r border-t",
                  placement === "right" && "left-[-7px] top-1/2 -translate-y-1/2 border-l border-b"
                )}
              />

              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono text-[#00e5ff] tracking-widest uppercase bg-[#00e5ff]/10 px-2.5 py-1 rounded-md font-bold">
                  STEP {tourStep + 1} OF {TOUR_STEPS.length}
                </span>
                <button 
                  onClick={() => {
                    setTourStep(null);
                    localStorage.setItem("flowstate_tour_completed", "true");
                  }}
                  className="text-white/45 hover:text-white text-xs font-mono font-bold tracking-wider"
                >
                  SKIP
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {TOUR_STEPS[tourStep].title}
                </h3>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  {TOUR_STEPS[tourStep].desc}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => setTourStep(tourStep - 1)}
                  className="px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  ← Back
                </button>

                <button
                  onClick={() => {
                    if (tourStep < TOUR_STEPS.length - 1) {
                      setTourStep(tourStep + 1);
                    } else {
                      setTourStep(null);
                      localStorage.setItem("flowstate_tour_completed", "true");
                    }
                  }}
                  className="px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_10px_rgba(0,229,255,0.25)]"
                >
                  {tourStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next →"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
