"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useTaskStore } from "@/lib/stores/task-store";
import { useAppStore } from "@/lib/stores/app-store";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { useTimerStore } from "@/lib/stores/timer-store";
import { use3dTilt } from "@/hooks/use-3d-tilt";

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

// Daily Progress widget with 3D Tilt
export function DailyProgressCard() {
  const { t } = useTranslation();
  const scene = useAppStore((s) => s.scene);
  const { tiltProps: progressTilt } = use3dTilt(0.8);

  // Task metrics for Daily Progress card
  const tasks = useTaskStore((s) => s.tasks);
  const doneCount = tasks.filter((t) => t.done).length;
  const totalEstimated = tasks.reduce((sum, t) => sum + t.pomodorosEstimated, 0);
  const totalDone = tasks.reduce((sum, t) => sum + t.pomodorosDone, 0);

  // Without tasks the card used to sit at a permanent "0/0 · 0% achieved" —
  // contradicting the session-complete modal. Fall back to the measured daily
  // tally instead: real blocks finished today, ring filling one long-break
  // cycle (e.g. 4 blocks) as a neutral reference, capped, never judged.
  const todayDate = useFocusSessionStore((s) => s.todayDate);
  const todayBlocks = useFocusSessionStore((s) => s.todayBlocks);
  const todayMinutes = useFocusSessionStore((s) => s.todayMinutes);
  const longBreakInterval = useTimerStore((s) => s.preset.longBreakInterval);
  const isToday = todayDate === new Date().toDateString();
  const blocksToday = isToday ? todayBlocks : 0;
  const minutesToday = isToday ? todayMinutes : 0;

  const hasTasks = tasks.length > 0;
  const progress = hasTasks
    ? (doneCount / tasks.length) * 100
    : Math.min(blocksToday / Math.max(longBreakInterval, 1), 1) * 100;

  const progressRadius = 25;
  const progressCircumference = 2 * Math.PI * progressRadius;
  const progressOffset = progressCircumference - (progress / 100) * progressCircumference;

  return (
    <div className="glass-card p-5 flex items-center justify-between shrink-0 tilt-container" {...progressTilt}>
      <div className="flex flex-col gap-1.5">
        <span className="text-[9.5px] font-sans text-white/45 uppercase tracking-[0.15em] font-bold leading-none">
          {t("dashboard.dailyProgress", "Daily Progress")}
        </span>
        <h4 className="text-sm font-bold text-white/90 tracking-tight leading-tight">
          {hasTasks ? (
            <>
              <span className="text-white font-bold">{doneCount}</span>
              <span className="text-white/30 mx-0.5">/</span>
              <span className="text-white/70">{tasks.length}</span> {t("dashboard.tasksCompleted", "tasks completed")}
            </>
          ) : blocksToday > 0 ? (
            <>
              <span className="text-white font-bold">{blocksToday}</span>{" "}
              {blocksToday === 1
                ? t("dashboard.blockToday", "focus block today")
                : t("dashboard.blocksToday", "focus blocks today")}
            </>
          ) : (
            <span className="text-white/40 italic font-normal">{t("dashboard.noTasks", "No tasks active today")}</span>
          )}
        </h4>
        <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 leading-none">
          {hasTasks ? (
            <>
              <span>
                <span className="text-white/70 font-semibold">{totalDone}</span>
                <span className="text-white/30 mx-0.5">/</span>
                <span className="text-white/60">{totalEstimated}</span> {t("dashboard.sessions", "sessions")}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span className="text-primary font-bold tracking-tight">{progress.toFixed(0)}% {t("dashboard.achieved", "achieved")}</span>
            </>
          ) : (
            <span>
              <span className="text-white/70 font-semibold">{minutesToday}</span>{" "}
              {t("dashboard.minutesToday", "min of deep work today")}
            </span>
          )}
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
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.65" />
              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
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

        {/* Center label: task % when tasks drive the ring, block count otherwise */}
        <span className="relative z-10 text-xs font-mono font-extrabold text-white tracking-tighter drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          {hasTasks ? `${Math.round(progress)}%` : blocksToday}
        </span>
      </div>
    </div>
  );
}
