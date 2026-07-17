"use client";

import { useMemo } from "react";
import { Flame, Target, Trophy, Minus, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useGoalStore } from "@/lib/stores/goal-store";
import { computeStreaks, computeRecords, weekFocusMinutes } from "@/lib/optimizer/streaks";
import { formatMinutes } from "@/lib/utils";
import type { DbSession } from "@/lib/optimizer/compute-insights";

// Momentum row: honest streak, weekly goal ring, and personal records.
export function MomentumRow({ sessions }: { sessions: DbSession[] }) {
  const { t } = useTranslation();
  const weeklyGoalMinutes = useGoalStore((s) => s.weeklyGoalMinutes);
  const setWeeklyGoal = useGoalStore((s) => s.setWeeklyGoal);

  const streaks = useMemo(() => computeStreaks(sessions), [sessions]);
  const records = useMemo(() => computeRecords(sessions), [sessions]);
  const thisWeek = useMemo(() => weekFocusMinutes(sessions), [sessions]);

  // Progress ring geometry (0..1 fill of a 42px-radius circle).
  const R = 42;
  const CIRC = 2 * Math.PI * R;
  const progress = weeklyGoalMinutes > 0 ? Math.min(1, thisWeek / weeklyGoalMinutes) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Streak */}
      <div className="glass-card p-5 flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none">
            {t("insights.momentum.streak.title", "Current Streak")}
          </h3>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-primary group-hover:scale-110 transition-transform">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-5">
          <div className="text-4xl font-extrabold tracking-tight text-white leading-none tabular-nums">
            {streaks.current}
            <span className="text-base font-bold text-white/50 ml-2">
              {streaks.current === 1 ? t("insights.momentum.streak.day", "day") : t("insights.momentum.streak.days", "days")}
            </span>
          </div>
          <p className="text-[10px] text-white/40 mt-2.5 font-mono tracking-tight">
            {t("insights.momentum.streak.longest", "Longest: {count} days").replace("{count}", String(streaks.longest))}
          </p>
        </div>
      </div>

      {/* Weekly goal */}
      <div className="glass-card p-5 flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none">
            {t("insights.momentum.goal.title", "Weekly Goal")}
          </h3>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-primary group-hover:scale-110 transition-transform">
            <Target className="h-4 w-4" />
          </div>
        </div>

        <div className="flex items-center gap-5 mt-4">
          {/* Progress ring */}
          <div className="relative w-[104px] h-[104px] shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                style={{ stroke: "hsl(var(--primary))" }}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - progress)}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold tracking-tight text-white leading-none tabular-nums">{thisWeek}m</span>
              <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest mt-1">
                {t("insights.momentum.goal.ofGoal", "of {goal}m goal").replace("{goal}", String(weeklyGoalMinutes))}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.15em] text-white/40">
              {t("insights.momentum.goal.adjust", "Adjust Goal")}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeeklyGoal(weeklyGoalMinutes - 30)}
                aria-label={t("insights.momentum.goal.decrease", "Decrease goal")}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06] transition-all active:scale-95"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[52px] text-center text-sm font-bold text-white tabular-nums">{weeklyGoalMinutes}m</span>
              <button
                onClick={() => setWeeklyGoal(weeklyGoalMinutes + 30)}
                aria-label={t("insights.momentum.goal.increase", "Increase goal")}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06] transition-all active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="glass-card p-5 flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none">
            {t("insights.momentum.records.title", "Personal Records")}
          </h3>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-primary group-hover:scale-110 transition-transform">
            <Trophy className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2.5">
          {[
            { label: t("insights.momentum.records.longestSession", "Longest session"), value: records.longestSessionMin },
            { label: t("insights.momentum.records.bestDay", "Best day"), value: records.bestDayMin },
            { label: t("insights.momentum.records.bestWeek", "Best week"), value: records.bestWeekMin },
          ].map((row, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-white/[0.02] px-3 py-2.5 rounded-xl border border-white/5"
            >
              <span className="text-[11px] font-semibold text-white/70 tracking-tight">{row.label}</span>
              <span className="text-xs font-mono font-bold text-primary tabular-nums">{formatMinutes(row.value)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
