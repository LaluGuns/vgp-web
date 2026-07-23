"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { DbSession } from "@/lib/optimizer/compute-insights";

// 24-Week Focus Heatmap Component
export function FocusHeatmap({ sessions }: { sessions: DbSession[] }) {
  const { t, locale } = useTranslation();
  const [hoveredCell, setHoveredCell] = useState<{ date: Date; minutes: number; sessions: number; cumulative: number; x: number; y: number; parentW: number } | null>(null);
  // Tooltip coordinates are measured against this OUTER wrapper (sibling of the
  // horizontal scroll area) so the tooltip is never clipped by overflow-x-auto.
  const outerRef = useRef<HTMLDivElement>(null);

  const startDate = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const d = new Date(today);
    d.setDate(today.getDate() - currentDay - 23 * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const heatmapDays = useMemo(() => {
    const days = [];
    const start = new Date(startDate);
    let cumulative = 0;

    for (let i = 0; i < 168; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      const daySessions = sessions.filter(s => {
        const sDate = new Date(s.started_at);
        return sDate.getFullYear() === currentDate.getFullYear() &&
               sDate.getMonth() === currentDate.getMonth() &&
               sDate.getDate() === currentDate.getDate();
      });

      const minutes = daySessions.reduce((sum, s) => {
        // Measured time only — no target-duration fallback (honest minutes).
        return sum + Math.max(0, (s.actual_duration_s ?? 0) / 60);
      }, 0);
      const roundedMinutes = Math.round(minutes);
      cumulative += roundedMinutes;

      days.push({
        date: currentDate,
        minutes: roundedMinutes,
        sessions: daySessions.length,
        cumulative,
      });
    }
    return days;
  }, [sessions, startDate]);

  const periodTotal = heatmapDays.at(-1)?.cumulative ?? 0;
  const activeDays = heatmapDays.filter((day) => day.minutes > 0).length;
  const periodSessions = heatmapDays.reduce((sum, day) => sum + day.sessions, 0);

  return (
    <div className="glass-card p-6 relative overflow-visible select-none mt-2">

      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none mb-1.5">{t("insights.heatmap.title", "Focus Heatmap")}</h2>
          <span className="text-[10px] text-white/50 font-sans tracking-normal leading-normal">{t("insights.heatmap.subtitle", "Daily deep focus duration across the last 24 weeks")}</span>
        </div>
        <div className="flex gap-5 text-right">
          <div><strong className="block text-lg text-white tabular-nums">{periodTotal}m</strong><span className="text-[8px] uppercase tracking-wider text-white/35">{t("insights.heatmap.cumulative", "Cumulative")}</span></div>
          <div><strong className="block text-lg text-white tabular-nums">{activeDays}</strong><span className="text-[8px] uppercase tracking-wider text-white/35">{t("insights.heatmap.activeDays", "Active days")}</span></div>
          <div><strong className="block text-lg text-white tabular-nums">{periodSessions}</strong><span className="text-[8px] uppercase tracking-wider text-white/35">{t("insights.heatmap.sessions", "Sessions")}</span></div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-sans font-semibold uppercase tracking-[0.1em] text-white/40 basis-full justify-end">
          <span>{t("insights.heatmap.less", "Less")}</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.03] border border-white/[0.04]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-secondary/15 border border-secondary/25" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-secondary/45 border border-secondary/55" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/35 border border-primary/45" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-primary/80 border border-primary" />
          <span>{t("insights.heatmap.more", "More")}</span>
        </div>
      </div>

      <div ref={outerRef} className="relative w-full overflow-visible">
        <div className="w-full overflow-x-auto scrollbar-hide pb-2">
          <div className="min-w-[580px] relative">

            {/* Months Header Row */}
            <div className="grid grid-cols-[30px_1fr] gap-2 mb-1.5 text-[9px] font-mono text-white/30 h-4">
              <span></span>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                {Array.from({ length: 24 }).map((_, w) => {
                  const date = new Date(startDate);
                  date.setDate(startDate.getDate() + w * 7);
                  const isFirstWeekOfMonth = date.getDate() <= 7;
                  return (
                    <div key={w} className="truncate select-none">
                      {isFirstWeekOfMonth ? date.toLocaleDateString(locale, { month: "short" }) : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Days + Grid Body */}
            <div className="grid grid-cols-[30px_1fr] gap-2 relative">

              {/* Day Labels */}
              <div className="grid grid-rows-7 gap-1.5 text-[9px] font-mono text-white/40 h-[105px] items-center">
                <span></span>
                <span>{t("insights.heatmap.mon", "Mon")}</span>
                <span></span>
                <span>{t("insights.heatmap.wed", "Wed")}</span>
                <span></span>
                <span>{t("insights.heatmap.fri", "Fri")}</span>
                <span></span>
              </div>

              {/* Grid Cells */}
              <div className="grid grid-flow-col grid-rows-7 gap-1.5 h-[105px] relative">
                {heatmapDays.map((day, idx) => {
                  let colorClass = "bg-white/[0.03] border border-white/[0.04]";
                  if (day.minutes > 0 && day.minutes <= 15) {
                    colorClass = "bg-secondary/15 border border-secondary/25";
                  } else if (day.minutes > 15 && day.minutes <= 45) {
                    colorClass = "bg-secondary/45 border border-secondary/55";
                  } else if (day.minutes > 45 && day.minutes <= 90) {
                    colorClass = "bg-primary/35 border border-primary/45";
                  } else if (day.minutes > 90) {
                    colorClass = "bg-primary/80 border border-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]";
                  }

                  return (
                    <div
                      key={idx}
                      role="img"
                      // Deliberately not focusable. 168 cells meant 168 tab
                      // stops between the heatmap and the next control, and the
                      // tooltip they revealed only repeats this aria-label — so
                      // keyboard users paid the traversal cost for nothing.
                      // Screen readers still announce every cell in browse mode.
                      aria-label={`${day.date.toLocaleDateString(locale)}: ${day.minutes} minutes, ${day.sessions} sessions, ${day.cumulative} cumulative minutes`}
                      className={cn(
                        "w-[13px] h-[13px] rounded-[3px] transition-all duration-150 cursor-pointer hover:scale-125 hover:border-white/30",
                        colorClass
                      )}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parentRect = outerRef.current?.getBoundingClientRect();
                        if (parentRect) {
                          setHoveredCell({
                            date: day.date,
                            minutes: day.minutes,
                            sessions: day.sessions,
                            cumulative: day.cumulative,
                            x: rect.left - parentRect.left + rect.width / 2,
                            y: rect.top - parentRect.top,
                            parentW: parentRect.width
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parentRect = outerRef.current?.getBoundingClientRect();
                        if (parentRect) {
                          setHoveredCell({ date: day.date, minutes: day.minutes, sessions: day.sessions, cumulative: day.cumulative, x: rect.left - parentRect.left + rect.width / 2, y: rect.top - parentRect.top, parentW: parentRect.width });
                        }
                      }}
                    />
                  );
                })}
              </div>

            </div>

          </div>
        </div>

        {/* Tooltip lives OUTSIDE the horizontal scroll container (sibling of it,
            positioned against outerRef) so overflow-x-auto can never clip it. */}
        {hoveredCell && (
          <div
            className={cn(
              "absolute z-20 pointer-events-none glass-card px-2.5 py-1.5 text-[10px] font-mono text-white flex flex-col gap-0.5 shadow-lg border border-white/20 -translate-y-[125%]",
              // Edge-aware: anchor from the right near the right edge so the last
              // columns can't squeeze/clip the tooltip.
              hoveredCell.x > hoveredCell.parentW * 0.7 ? "" : hoveredCell.x < 90 ? "" : "-translate-x-1/2"
            )}
            style={{
              ...(hoveredCell.x > hoveredCell.parentW * 0.7
                ? { right: `${hoveredCell.parentW - hoveredCell.x}px` }
                : { left: `${Math.max(4, hoveredCell.x)}px` }),
              top: `${hoveredCell.y}px`
            }}
          >
            <span className="font-semibold text-white/50">
              {hoveredCell.date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-primary font-bold">{t("insights.heatmap.focusMins", "{minutes} Focus Mins").replace("{minutes}", String(hoveredCell.minutes))}</span>
            <span className="text-white/55">{hoveredCell.sessions} {t("insights.heatmap.sessions", "sessions")}</span>
            <span className="text-white/55">{hoveredCell.cumulative}m {t("insights.heatmap.cumulative", "cumulative")}</span>
          </div>
        )}
      </div>

      {/* Heatmap Legend Subtext */}
      <div className="mt-4 text-[9px] font-mono text-white/20 border-t border-white/5 pt-3">
        <span>{t("insights.heatmap.note", "* Heatmap displays local day boundaries")}</span>
      </div>
    </div>
  );
}
