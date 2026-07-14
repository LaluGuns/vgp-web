"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { useTimerStore } from "@/lib/stores/timer-store";
import { usePlayerStore } from "@/lib/stores/player-store";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import { recordFidget } from "@/lib/optimizer/fidget";
import { Lock, Check } from "lucide-react";
import { useThemeStore, THEMES } from "@/lib/stores/theme-store";
import { useUpgradePromptStore } from "@/lib/stores/upgrade-prompt-store";
import { useMixerStore } from "@/lib/stores/mixer-store";

const ENVIRONMENT_BUNDLES = {
  glass: { scene: "midnight", ambience: [{ id: "rain", volume: 0.32 }] },
  studio: { scene: "sunset", ambience: [{ id: "vinyl", volume: 0.28 }] },
  editorial: { scene: "rain-window", ambience: [{ id: "cafe", volume: 0.26 }] },
  terminal: { scene: "terminal", ambience: [{ id: "city", volume: 0.24 }] },
} as const;

// Small static preview palette per interface theme (bg + accent) for the swatch chips.
const THEME_PREVIEWS: Record<string, { bg: string; accent: string }> = {
  glass: { bg: "#0a0a1c", accent: "#58c4ff" },
  studio: { bg: "#160e05", accent: "#ee9b1f" },
  editorial: { bg: "#151310", accent: "#ef5a2b" },
  terminal: { bg: "#050a07", accent: "#22e06b" },
};

function InterfaceStyleSelector() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setScene = useAppStore((s) => s.setScene);
  const isPremium = useAppStore((s) => s.isPremium);
  const loadPreset = useMixerStore((s) => s.loadPreset);
  const showUpgrade = useUpgradePromptStore((s) => s.show);

  return (
    <div className="space-y-2.5 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[9.5px] font-sans font-bold text-white/45 uppercase tracking-[0.15em] leading-none">
          {t("app.themes.title", "Interface Style")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {THEMES.map((th) => {
          const isActive = theme === th.id;
          const locked = th.isPremium && !isPremium;
          const preview = THEME_PREVIEWS[th.id] ?? THEME_PREVIEWS.glass;
          return (
            <button
              key={th.id}
              onClick={() => {
                if (locked) {
                  showUpgrade("dashboard.themes.upgradeToUnlockTheme", "This environment is available with Flowstate Pro.", "environment");
                  return;
                }
                setTheme(th.id);
                const bundle = ENVIRONMENT_BUNDLES[th.id];
                setScene(bundle.scene);
                loadPreset([...bundle.ambience]);
                recordFidget();
              }}
              className={cn(
                "relative flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all duration-300 glass-tile active:scale-[0.98]",
                isActive
                  ? "ring-1 ring-primary/60"
                  : "opacity-80 hover:opacity-100"
              )}
            >
              <span
                className="relative w-7 h-7 rounded-lg shrink-0 border border-white/10 overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: preview.bg }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: preview.accent, boxShadow: `0 0 6px ${preview.accent}` }}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-white tracking-tight truncate">
                  {t(th.nameKey, th.fallbackName)}
                </span>
              </span>
              {isActive && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary/[0.12] border border-primary/25 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </span>
              )}
              {locked && !isActive && (
                <span className="absolute top-1.5 right-1.5 grid h-4 w-4 place-items-center rounded-full border border-white/10 bg-black/40">
                  <Lock className="h-2.5 w-2.5 text-white/55" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SCENES = [
  { 
    id: "midnight", 
    name: "Dynamic Glass", 
    gradient: "from-[#08021a] via-[#0c0528] to-[#04010a]", 
    orbs: [
      { color: "rgba(139, 92, 246, 0.85)", size: "900px", position: "-top-24 -left-24" },
      { color: "rgba(6, 182, 212, 0.78)", size: "1050px", position: "-bottom-48 -right-24" },
      { color: "rgba(236, 72, 153, 0.68)", size: "750px", position: "center" }
    ],
    previewGradient: "from-blue-600 via-indigo-900 to-black",
    isPremium: false 
  },
  { 
    id: "rain-window", 
    name: "Rain Window", 
    gradient: "from-[#010912] via-[#02182b] to-[#000408]", 
    orbs: [
      { color: "rgba(0, 229, 255, 0.18)", size: "550px", position: "-top-40 -right-20" },
      { color: "rgba(0, 110, 255, 0.25)", size: "650px", position: "-bottom-20 -left-40" }
    ],
    previewGradient: "from-cyan-700 via-[#02182b] to-black",
    isPremium: false 
  },
  { 
    id: "synthwave", 
    name: "Synthwave", 
    gradient: "from-[#0f001c] via-[#1b0030] to-[#02050a]", 
    orbs: [
      { color: "rgba(255, 0, 128, 0.18)", size: "600px", position: "-top-20 -left-20" },
      { color: "rgba(0, 225, 255, 0.22)", size: "600px", position: "-bottom-40 -right-20" },
      { color: "rgba(128, 0, 255, 0.15)", size: "500px", position: "top-1/3 left-1/4" }
    ],
    previewGradient: "from-pink-600 via-purple-900 to-black",
    isPremium: true 
  },
  { 
    id: "forest", 
    name: "Deep Forest", 
    gradient: "from-[#000803] via-[#011a0d] to-[#000301]", 
    orbs: [
      { color: "rgba(0, 255, 136, 0.14)", size: "550px", position: "-top-40 -right-20" },
      { color: "rgba(1, 80, 40, 0.28)", size: "650px", position: "-bottom-20 -left-20" }
    ],
    previewGradient: "from-emerald-700 via-green-950 to-black",
    isPremium: true 
  },
  { 
    id: "terminal", 
    name: "Terminal", 
    gradient: "from-[#010204] via-[#08151f] to-[#010203]", 
    orbs: [
      { color: "rgba(15, 37, 51, 0.25)", size: "500px", position: "-top-20 -left-20" },
      { color: "rgba(8, 20, 28, 0.28)", size: "550px", position: "-bottom-20 -right-20" }
    ],
    previewGradient: "from-slate-800 via-slate-950 to-black",
    isPremium: true 
  },
  { 
    id: "sunset", 
    name: "Sunset", 
    gradient: "from-[#170600] via-[#2d0d00] to-[#010408]", 
    orbs: [
      { color: "rgba(255, 85, 0, 0.2)", size: "550px", position: "-top-20 -left-20" },
      { color: "rgba(255, 200, 0, 0.16)", size: "650px", position: "-bottom-40 -right-20" }
    ],
    previewGradient: "from-orange-600 via-amber-950 to-black",
    isPremium: true 
  },
] as const;

export function SceneSelector() {
  const { t } = useTranslation();
  const scene = useAppStore((s) => s.scene);
  const setScene = useAppStore((s) => s.setScene);
  const isPremium = useAppStore((s) => s.isPremium);
  const showUpgrade = useUpgradePromptStore((s) => s.show);

  return (
    <div className="space-y-5 select-none">
      <InterfaceStyleSelector />

      <div className="h-px bg-white/[0.06]" />

      <div className="space-y-2.5">
        <span className="text-[9.5px] font-sans font-bold text-white/45 uppercase tracking-[0.15em] leading-none block">
          {t("dashboard.player.visualTheme", "Scene")}
        </span>
      <div className="grid grid-cols-2 gap-3">
        {SCENES.map((s) => {
          const isActive = scene === s.id;
          const locked = s.isPremium && !isPremium;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (locked) {
                  showUpgrade("dashboard.themes.upgradeToUnlockTheme", "This theme is Pro-only. Go Pro to get all themes?", "scene");
                  return;
                }
                setScene(s.id);
                recordFidget();
              }}
              className={cn(
                "relative group h-24 rounded-2xl bg-gradient-to-b overflow-hidden transition-all duration-500 text-left p-3.5 flex flex-col justify-end transform-gpu",
                "glass-tile",
                s.gradient,
                isActive
                  ? "ring-1 ring-primary/60 shadow-[0_0_14px_rgba(0,212,255,0.1)] scale-[1.005]"
                  : "border-white/5 opacity-85 hover:opacity-100"
              )}
            >
              {/* Dotted pattern inside button for preview */}
              <div className="absolute inset-0 dot-grid opacity-20 group-hover:opacity-30 transition-opacity" />
              
              {/* Selection Checkmark */}
              {isActive && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary/[0.08] border border-primary/20 flex items-center justify-center shadow-[0_0_6px_rgba(0,212,255,0.12)] animate-in zoom-in-75 duration-300">
                  <Check className="h-3 w-3 text-primary" />
                </div>
              )}

              {/* Lock Icon */}
              {locked && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                  <Lock className="h-2.5 w-2.5 text-white/60" />
                </div>
              )}

              <div className="relative z-10 space-y-0.5">
                <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">{t("dashboard.player.theme", "Theme")}</span>
                <h4 className="text-xs font-semibold text-white tracking-tight">{t(`dashboard.themes.${s.id}`, s.name)}</h4>
              </div>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

export function SceneBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const scene = useAppStore((s) => s.scene);
  const current = SCENES.find((s) => s.id === scene) ?? SCENES[0];

  const timerStatus = useTimerStore((s) => s.status);
  const isMusicPlaying = usePlayerStore((s) => s.isPlaying);
  const isCurrentlyActive = timerStatus === "running" || isMusicPlaying;

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 transition-all duration-1000 bg-gradient-to-br overflow-hidden",
        current.gradient,
        isCurrentlyActive && "ambient-active"
      )}
    >
      {/* Siri-style floating fluid glow orbs */}
      {current.orbs.map((orb, index) => {
        const pos = orb.position;
        const isCenter = pos.includes("1/3") || pos.includes("1/4") || pos.includes("center");
        return (
          <div
            key={index}
            className={cn(
              "glow-orb",
              isCurrentlyActive && "scale-105 opacity-50"
            )}
            style={{
              backgroundColor: orb.color,
              width: orb.size,
              height: orb.size,
              ...(isCenter
                ? { top: "25%", left: "20%" }
                : {
                    left: pos.includes("-left-") ? "-8%" : "auto",
                    right: pos.includes("-right-") ? "-8%" : "auto",
                    top: pos.includes("-top-") ? "-8%" : "auto",
                    bottom: pos.includes("-bottom-") ? "-8%" : "auto",
                  }),
              animationDelay: `${index * 4}s`,
              animationDuration: isCurrentlyActive ? `${8 + index * 2}s` : `${20 + index * 6}s`,
            }}
          />
        );
      })}

      {/* Dotted grid pattern overlay */}
      <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />

      {/* Very light vignette — cosmic colors should dominate */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/50" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Animated noise/grain texture */}
      <div className="absolute inset-0 opacity-[0.012] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')] pointer-events-none" />
    </div>
  );
}
