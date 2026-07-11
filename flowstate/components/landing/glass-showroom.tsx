"use client";

import dynamic from "next/dynamic";
import { cn, formatTime } from "@/lib/utils";
import { RotateCcw, SkipForward, Play, Pause } from "lucide-react";

// Same lazy-loaded liquid sphere the real app dial uses.
const LiquidSphere = dynamic(
  () => import("@/components/timer/liquid-sphere").then((m) => m.LiquidSphere),
  { ssr: false }
);

/**
 * Dynamic Glass showroom unit — the flagship liquid-glass dial, running on the
 * landing's demo clock. It's the actual sphere (three.js) + glass dome + SVG
 * progress ring + a real glass control pill, so the hero can show all four
 * interface styles side by side. Every control drives the demo (no fakes).
 */
export function GlassShowroomDial({
  secondsRemaining,
  progress,
  isFocus,
  isRunning,
  phaseLabel,
  contextLabel,
  onPlayPause,
  onReset,
  onSkip,
  t,
}: {
  secondsRemaining: number;
  progress: number;
  isFocus: boolean;
  isRunning: boolean;
  phaseLabel: string;
  contextLabel: string;
  onPlayPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  t: (key: string, fallback?: string) => string;
}) {
  const radius = 118;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference;
  const sphereColor = isFocus ? "#58c4ff" : "#51ecd6";

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      <div className="relative w-[280px] h-[280px] flex items-center justify-center shrink-0">
        {/* Glass lens dome */}
        <div className="absolute inset-[15px] rounded-full glass-dome transform-gpu pointer-events-none z-0" />

        {/* Live liquid sphere */}
        <div className="absolute inset-[15px] rounded-full overflow-hidden z-10 pointer-events-none">
          <LiquidSphere isRunning={isRunning} color={sphereColor} />
        </div>

        {/* Specular sheen + refraction ring */}
        <div className="absolute inset-[15px] rounded-full pointer-events-none z-20 overflow-hidden">
          <div className="glass-sheen" />
          <div className="glass-reflection" />
          <div className="absolute inset-1.5 rounded-full border border-white/15 bg-gradient-to-tr from-white/[0.03] to-transparent" />
        </div>

        {/* Ambient ripples while running */}
        {isRunning && (
          <>
            <div className={cn("absolute w-[250px] h-[250px] rounded-full border opacity-0 pointer-events-none animate-ripple z-0", isFocus ? "border-primary/20" : "border-emerald-500/20")} />
            <div className={cn("absolute w-[250px] h-[250px] rounded-full border opacity-0 pointer-events-none animate-ripple-delayed z-0", isFocus ? "border-primary/20" : "border-emerald-500/20")} />
          </>
        )}

        {/* Progress ring */}
        <svg className="absolute inset-0 -rotate-90 z-10 w-full h-full" viewBox="0 0 280 280">
          <defs>
            <linearGradient id="glassShowroomFocus" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#00B0FF" />
              <stop offset="100%" stopColor="#0055FF" />
            </linearGradient>
            <linearGradient id="glassShowroomBreak" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="glassShowroomGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="140" cy="140" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
          <circle
            cx="140" cy="140" r={radius} fill="none"
            stroke={isFocus ? "url(#glassShowroomFocus)" : "url(#glassShowroomBreak)"}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeOffset}
            opacity="0.3" filter="url(#glassShowroomGlow)"
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
          <circle
            cx="140" cy="140" r={radius} fill="none"
            stroke={isFocus ? "url(#glassShowroomFocus)" : "url(#glassShowroomBreak)"}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>

        {/* Central HUD */}
        <div className="absolute inset-0 pointer-events-none z-30 text-center">
          <div className="absolute top-[50px] left-1/2 -translate-x-1/2">
            <div className={cn("px-3.5 py-1 rounded-full border bg-black/40 backdrop-blur-sm flex items-center gap-2", isFocus ? "border-primary/20" : "border-emerald-500/25")}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isFocus ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]" : "bg-emerald-400 shadow-[0_0_6px_#10B981]")} />
              <span className={cn("text-[9px] font-mono font-bold uppercase tracking-[0.2em]", isFocus ? "text-primary" : "text-emerald-400")}>
                {phaseLabel}
              </span>
            </div>
          </div>
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] text-[5.2rem] font-sans font-semibold tracking-tight text-white leading-none tabular-nums"
            style={{ filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.5)) drop-shadow(0px 4px 20px rgba(88,196,255,0.4))" }}
          >
            {formatTime(secondsRemaining)}
          </span>
          <div className="absolute bottom-[46px] left-1/2 -translate-x-1/2 w-full max-w-[190px] flex items-center justify-center px-4">
            <span className="text-[10px] text-white/55 truncate font-mono uppercase tracking-wider">{contextLabel}</span>
          </div>
        </div>
      </div>

      {/* Real glass control pill */}
      <div className="flex items-center gap-6 px-6 py-2.5 rounded-full glass-card border-t-white/30 border-l-white/20">
        <button
          onClick={onReset}
          aria-label={t("dashboard.timer.reset", "Reset")}
          className="rounded-full h-10 w-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
        >
          <RotateCcw className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={onPlayPause}
          aria-label={isRunning ? t("dashboard.timer.pause", "Pause") : t("dashboard.timer.start", "Start")}
          className={cn(
            "rounded-full w-14 h-14 flex items-center justify-center border-2 text-primary transition-all hover:scale-[1.05] active:scale-95",
            isFocus ? "border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]" : "border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
          )}
        >
          {isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
        <button
          onClick={onSkip}
          aria-label={t("dashboard.timer.skip", "Skip")}
          className="rounded-full h-10 w-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] transition-all active:scale-95"
        >
          <SkipForward className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
