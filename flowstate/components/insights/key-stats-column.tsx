"use client";

import { Brain, CheckCircle, TrendingUp } from "lucide-react";
import { cn, formatMinutes } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

export interface FocusCategory {
  name: string;
  minutes: number;
  count: number;
  percentage: number;
}

// Right Column: Key Stats & Focus Blocks (Col-span 4) — deep work sessions,
// completion rate, and the Top Focus Blocks list.
export function KeyStatsColumn({
  totalSessions,
  sessionsThisWeek,
  completionRate,
  categoriesData,
}: {
  totalSessions: number;
  sessionsThisWeek: number;
  completionRate: number;
  categoriesData: FocusCategory[];
}) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">

      {/* Deep Work Sessions Card */}
      <div className="glass-card p-5 flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary shadow-[inset_0_0_10px_hsl(var(--secondary)/0.2)] group-hover:scale-110 transition-transform">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[9.5px] font-sans font-bold uppercase tracking-[0.15em] text-white/50 leading-none">{t("insights.metrics.sessions.title", "Deep Work Sessions")}</h3>
            <div className="text-2xl font-extrabold tracking-tight text-white mt-2 leading-none">{totalSessions}</div>
          </div>
        </div>
        <div className={cn(
          "flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border gap-0.5",
          sessionsThisWeek > 0
            ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[inset_0_0_8px_rgba(81,236,214,0.05)]"
            : "text-white/40 bg-white/[0.03] border-white/10"
        )}>
          {sessionsThisWeek > 0 ? (
            <><TrendingUp className="h-3 w-3" /> {t("insights.metrics.sessions.thisWeek", "+{count} this week").replace("{count}", String(sessionsThisWeek))}</>
          ) : (
            t("insights.metrics.sessions.allTime", "All time")
          )}
        </div>
      </div>

      {/* Completion Rate Card */}
      <div className="glass-card p-5 flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[inset_0_0_10px_hsl(var(--primary)/0.2)] group-hover:scale-110 transition-transform">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[9.5px] font-sans font-bold uppercase tracking-[0.15em] text-white/50 leading-none">{t("insights.metrics.completion.title", "Completion Rate")}</h3>
            <div className="text-2xl font-extrabold tracking-tight text-white mt-2 leading-none">{completionRate}%</div>
          </div>
        </div>
        <div className={cn(
          "flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border gap-0.5",
          completionRate >= 70
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : completionRate >= 40
              ? "text-primary bg-primary/10 border-primary/20"
              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
        )}>
          {completionRate >= 70 ? t("insights.metrics.completion.strong", "Strong") : completionRate >= 40 ? t("insights.metrics.completion.steady", "Steady") : t("insights.metrics.completion.building", "Building")}
        </div>
      </div>

      {/* Top Focus Blocks Card (Vertical list layout matching Stitch mock) */}
      <div className="glass-card p-5 flex-1 flex flex-col justify-between">
        <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none mb-4">{t("insights.focusBlocks.title", "Top Focus Blocks")}</h3>
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 max-h-[170px] custom-scrollbar">
          {categoriesData.length === 0 ? (
            <div className="text-center text-white/40 text-xs font-mono py-8">
              {t("insights.focusBlocks.empty", "No focus blocks logged yet.")}
            </div>
          ) : (
            categoriesData.map((cat, idx) => {
              const dotColor = idx === 0 ? "bg-primary" : idx === 1 ? "bg-secondary" : "bg-emerald-400";
              return (
                <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]", dotColor === "bg-primary" ? "text-primary" : dotColor === "bg-secondary" ? "text-secondary" : "text-emerald-400", dotColor)}></div>
                    <span className="text-xs font-semibold text-white/80 tracking-tight truncate">{cat.name === "General Deep Work" ? t("insights.focusBlocks.general", "General Deep Work") : cat.name === "Software Development" ? t("insights.focusBlocks.software", "Software Development") : cat.name === "Design & UI" ? t("insights.focusBlocks.design", "Design & UI") : cat.name === "Technical Writing" ? t("insights.focusBlocks.writing", "Technical Writing") : cat.name === "Research & Learning" ? t("insights.focusBlocks.research", "Research & Learning") : cat.name === "Planning & Admin" ? t("insights.focusBlocks.planning", "Planning & Admin") : cat.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary shrink-0 ml-2">{formatMinutes(cat.minutes)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
