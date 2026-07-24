"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";
import type { DbSession } from "@/lib/optimizer/compute-insights";

// Interactive SVG Focus Minutes Trend Chart Component
export function FocusTrendChart({ sessions }: { sessions: DbSession[] }) {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  // Start-of-period cutoff shared by the headline AND the chart, so the
  // day/week/month toggle filters both consistently.
  const periodSince = useMemo(() => {
    const since = new Date();
    if (period === "day") {
      since.setHours(0, 0, 0, 0);
    } else {
      since.setDate(since.getDate() - (period === "week" ? 7 : 30));
    }
    return since;
  }, [period]);

  const trendData = useMemo(() => {
    return sessions
      .filter((s) => new Date(s.started_at) >= periodSince)
      .slice(0, 20) // sessions arrive newest-first; keep the 20 most recent in period
      .reverse()
      .map((s, idx) => {
        // Only credit MEASURED time (never fall back to the target duration —
        // an unmeasured session must not claim unearned minutes).
        const durMin = Math.round((s.actual_duration_s ?? 0) / 60);
        return {
          index: idx,
          id: s.id,
          date: s.started_at,
          completed: s.completed,
          duration: durMin,
          focusMinutes: durMin,
          fidgets: s.fidget_count || 0,
          bookmark: s.context_bookmark || ""
        };
      });
  }, [sessions, periodSince]);

  const periodFocusMinutes = useMemo(() => {
    return sessions
      .filter(s => new Date(s.started_at) >= periodSince)
      .reduce((sum, s) => sum + Math.round((s.actual_duration_s ?? 0) / 60), 0);
  }, [sessions, periodSince]);

  const periodLabel = period === "day" ? t("insights.period.today", "today") : period === "week" ? t("insights.period.last7days", "last 7 days") : t("insights.period.last30days", "last 30 days");

  const width = 800;
  const height = 220;
  const paddingX = 50;
  const paddingY = 35;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Pick a grid step that keeps every axis label a clean multiple of 5
  // (maxY/4 was producing labels like 8m/23m).
  const maxVal = Math.max(...trendData.map(d => d.focusMinutes), 20);
  const gridStep = Math.max(5, Math.ceil(maxVal / 4 / 5) * 5);
  const maxY = gridStep * 4;

  // Generate coordinates
  const points = trendData.map((d, i) => {
    const x = paddingX + (i * chartWidth) / (trendData.length - 1);
    const y = height - paddingY - (d.focusMinutes / maxY) * chartHeight;
    return { x, y, ...d };
  });

  // Smooth bezier curve builder
  const buildBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const dx = (next.x - curr.x) / 3;
      path += ` C ${curr.x + dx} ${curr.y}, ${next.x - dx} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = buildBezierPath(points);
  const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : "";

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full glass-card p-6 overflow-visible select-none h-full flex flex-col justify-between">

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none mb-1.5">{t("insights.focusMinutes", "Focus Minutes")}</h2>
          <div className="text-2xl font-extrabold tracking-tight text-white flex items-baseline gap-2 leading-none mt-1">
            {periodFocusMinutes.toLocaleString()}<span className="text-sm">m</span> <span className="text-[11px] font-normal tracking-tight text-white/50">{periodLabel}</span>
          </div>
        </div>
        <div className="flex gap-1.5 bg-white/[0.03] p-1 rounded-full border border-white/5">
          {(["day", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setHoveredIndex(null); }}
              className={cn(
                "px-3 py-1 rounded-full text-[9px] font-sans font-semibold uppercase tracking-[0.1em] transition-colors",
                period === p
                  ? "bg-primary/10 border border-primary/20 text-primary shadow-[inset_0_0_8px_hsl(var(--primary)/0.05)]"
                  : "text-white/40 hover:text-white/80 border border-transparent"
              )}
            >
              {t(`insights.period.${p}`, p)}
            </button>
          ))}
        </div>
      </div>

      {trendData.length < 2 ? (
        // In-card empty state: the period toggle above stays interactive, so an
        // empty "day" view can't trap the user (a full-card replace used to).
        <div className="flex flex-col items-center justify-center h-[180px] text-white/40 text-xs font-mono text-center px-6">
          <Info className="h-5 w-5 text-white/30 mb-2" />
          {trendData.length === 0
            ? t("insights.chart.noSessions", "No sessions {period} yet — run a focus block and it will chart here.").replace("{period}", periodLabel)
            : t("insights.chart.oneSession", "One session {period} so far — one more and the trend line appears.").replace("{period}", periodLabel)}
        </div>
      ) : (
      <>
      <div className="relative w-full overflow-visible">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "hsl(var(--primary))" }} stopOpacity="0.25" />
              <stop offset="50%" style={{ stopColor: "hsl(var(--secondary))" }} stopOpacity="0.08" />
              <stop offset="100%" style={{ stopColor: "hsl(var(--secondary))" }} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: "hsl(var(--secondary))" }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--primary))" }} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const val = Math.round((maxY / 4) * i);
            const y = height - paddingY - (val / maxY) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth="1"
                  strokeDasharray={i === 0 || i === 4 ? "0" : "4,4"}
                />
                <text
                  x={paddingX - 12}
                  y={y + 3}
                  fill="rgba(255,255,255,0.3)"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}m
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path
            d={areaPath}
            fill="url(#areaGradient)"
            className="transition-all duration-300"
          />

          {/* Hover helper vertical line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={paddingY}
              x2={hoveredPoint.x}
              y2={height - paddingY}
              style={{ stroke: "hsl(var(--primary) / 0.25)" }}
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          )}

          {/* Smooth Bezier line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />

          {/* Node circles */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={p.id}>
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8.5"
                    style={{ fill: "hsl(var(--primary) / 0.18)", stroke: "hsl(var(--primary) / 0.35)" }}
                    strokeWidth="1.5"
                    // SVG transforms default to the canvas origin (0,0) — without
                    // fill-box + origin-center, ping/scale THROWS the dot across
                    // the chart (the "glitch"). Same fix on the dot below.
                    className="animate-ping [transform-box:fill-box] origin-center"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  style={{ fill: p.completed ? "hsl(var(--primary))" : "hsl(var(--secondary))" }}
                  stroke="#0b1326"
                  strokeWidth="2"
                  className="cursor-pointer transition-transform duration-150 hover:scale-150 [transform-box:fill-box] origin-center"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip inside parent.
            Edge-aware anchoring: opens rightward near the left edge, leftward near the
            right edge, centered in the middle — so it can never overflow the chart. */}
        {hoveredPoint && (() => {
          const fx = hoveredPoint.x / width;
          const pct = Math.min(97, Math.max(3, fx * 100));
          // Right third anchors via `right` (not left+translate) — an abs-positioned
          // box with `left` near 100% gets shrink-to-fit squeezed by the container
          // edge (that's what wrapped/clipped the tooltip at the last data point).
          const nearRight = fx > 0.67;
          const xClass = nearRight ? "" : fx < 0.33 ? "" : "-translate-x-1/2";
          const yAnchor = hoveredPoint.y < 70 ? "translate-y-2" : "-translate-y-[115%]";
          return (
          <div
            className={cn(
              "absolute z-20 pointer-events-none glass-card p-3.5 text-[11px] font-mono text-white flex flex-col gap-1 border border-white/20 shadow-xl min-w-[170px] max-w-[220px]",
              xClass,
              yAnchor
            )}
            style={{
              ...(nearRight ? { right: `${100 - pct}%` } : { left: `${pct}%` }),
              top: `${(hoveredPoint.y / height) * 100}%`
            }}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-1 mb-1">
              <span className="font-semibold text-white/50">
                {t("insights.chart.session", "Session")} #{hoveredPoint.index + 1}
              </span>
              <span className={cn(
                "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                hoveredPoint.completed ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/10 text-secondary border border-secondary/20"
              )}>
                {hoveredPoint.completed ? t("insights.chart.completed", "Completed") : t("insights.chart.skipped", "Skipped")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("insights.chart.focusTime", "Focus Time:")}</span>
              <span className="text-primary font-bold">{hoveredPoint.focusMinutes} {t("insights.chart.mins", "mins")}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("insights.chart.fidgets", "Fidgets:")}</span>
              <span className="text-white/80">{hoveredPoint.fidgets} {t("insights.chart.times", "times")}</span>
            </div>
            {hoveredPoint.bookmark && (
              <div className="mt-1.5 border-t border-white/5 pt-1.5 text-[9px] text-white/50 italic truncate max-w-[150px]">
                &ldquo;{hoveredPoint.bookmark}&rdquo;
              </div>
            )}
          </div>
          );
        })()}
      </div>

      <div className="flex justify-between text-[9px] font-mono text-white/30 px-6 mt-4">
        <span>{t("insights.chart.older", "Older Sessions")}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t("insights.chart.completed", "Completed")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {t("insights.chart.skipped", "Skipped")}
          </span>
        </div>
        <span>{t("insights.chart.latest", "Latest Session")}</span>
      </div>
      </>
      )}
    </div>
  );
}
