"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Music, Volume2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { AmbientMixer } from "@/components/mixer/ambient-mixer";
import { MusicPlayer } from "@/components/player/music-player";
import { SceneSelector } from "@/components/scenes/scene-selector";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useAppStore } from "@/lib/stores/app-store";
import { useTimerStore } from "@/lib/stores/timer-store";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";

// Atmosphere tab geometry (module-level constants — stable across renders).
const getTabLeftPct = (idx: number) => idx * 33.33 + 1;
const TAB_WIDTH_PCT = 33.33 - 2;

export type AtmosphereTab = "music" | "ambient" | "theme";

// Column 3: Atmosphere Panel — music/ambient/theme tabs with the two-phase
// liquid pill indicator, plus the Autopilot lock overlay.
export function AtmospherePanel({
  activeTab,
  setActiveTab,
  activeTourTarget,
}: {
  activeTab: AtmosphereTab;
  setActiveTab: (tab: AtmosphereTab) => void;
  activeTourTarget: string | null;
}) {
  const { t } = useTranslation();

  const phase = useTimerStore((s) => s.phase);
  const timerStatus = useTimerStore((s) => s.status);
  const isMusicPlaying = usePlayerStore((s) => s.isPlaying);
  const scene = useAppStore((s) => s.scene);

  const autopilot = useFocusSessionStore((s) => s.autopilot);
  const optimizerLocked = autopilot && timerStatus === "running" && phase === "focus";

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

  // Find current scene name for display
  const sceneNames: Record<string, string> = {
    midnight: "Midnight",
    "rain-window": "Rain Window",
    synthwave: "Synthwave",
    forest: "Deep Forest",
    terminal: "Terminal",
    sunset: "Sunset",
  };
  const currentSceneName = t(`dashboard.themes.${scene}`, sceneNames[scene] ?? "Midnight");

  return (
    <>
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
    </>
  );
}
