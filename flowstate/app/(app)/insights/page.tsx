"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { computeInsights, type DbSession } from "@/lib/optimizer/compute-insights";
import { generateDemoSessions } from "@/lib/optimizer/demo-data";
import { computeStreaks, computeRecords, weekFocusMinutes } from "@/lib/optimizer/streaks";
import { useGoalStore } from "@/lib/stores/goal-store";
import { formatMinutes } from "@/lib/utils";
import {
  Brain,
  Target,
  MousePointerClick,
  TrendingUp,
  Clock,
  History,
  AlertTriangle,
  Key,
  Trash2,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Code,
  Palette,
  FileText,
  BookOpen,
  Calendar,
  Share2,
  Timer,
  BarChart2,
  Flame,
  Trophy,
  Minus,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/use-translation";
import { userDisplayName, userAvatarUrl } from "@/lib/user-profile";
import { WebGLBackground } from "@/components/scenes/webgl-background";
import { ShareModal } from "@/components/optimizer/share-modal";

// Client-safe friendly date-time formatting to prevent SSR hydration mismatch
function formatDateTime(dateStr: string, t: (key: string, fallback?: string) => string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  
  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  
  if (isToday) {
    return t("insights.history.todayAt", "Today at {time}").replace("{time}", timeStr);
  } else if (isYesterday) {
    return t("insights.history.yesterdayAt", "Yesterday at {time}").replace("{time}", timeStr);
  } else {
    const datePart = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return t("insights.history.dateAt", "{date} at {time}").replace("{date}", datePart).replace("{time}", timeStr);
  }
}

// Background Ambient Glow Container
function AmbientBackground() {
  return (
    <>
      {/* .ambient-blob: theme-token colored; suppressed (display:none) in the
          flat editorial + terminal themes via globals.css */}
      <div className="ambient-blob absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[130px] pointer-events-none z-0" />
      <div className="ambient-blob absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/15 blur-[150px] pointer-events-none z-0" />
      <div className="ambient-blob absolute top-[40%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-primary/04 blur-[100px] pointer-events-none z-0" />
    </>
  );
}


// Interactive SVG Focus Minutes Trend Chart Component
function FocusTrendChart({ sessions }: { sessions: DbSession[] }) {
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
                  style={{ fill: p.completed ? "hsl(var(--primary))" : "#a855f7" }}
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
                hoveredPoint.completed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
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
            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" /> {t("insights.chart.skipped", "Skipped")}
          </span>
        </div>
        <span>{t("insights.chart.latest", "Latest Session")}</span>
      </div>
      </>
      )}
    </div>
  );
}

// Top Category focus blocks
interface CategoryProps {
  name: string;
  minutes: number;
  count: number;
  percentage: number;
}

function CategoryCard({ name, minutes, count, percentage }: CategoryProps) {
  const { t } = useTranslation();
  let Icon = Brain;
  if (name.includes("Development") || name.includes("Software")) Icon = Code;
  else if (name.includes("Design") || name.includes("UI")) Icon = Palette;
  else if (name.includes("Writing") || name.includes("Technical")) Icon = FileText;
  else if (name.includes("Learning") || name.includes("Research") || name.includes("Study")) Icon = BookOpen;
  else if (name.includes("Admin") || name.includes("Planning") || name.includes("Meeting")) Icon = Calendar;

  return (
    <div className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      
      <div className="absolute -right-4 -top-4 text-white/[0.01] group-hover:text-white/[0.03] transition-colors transform scale-150 pointer-events-none">
        <Icon className="h-16 w-16" />
      </div>
      
      <div className="flex justify-between items-start z-10">
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-sans font-semibold text-white/40 uppercase tracking-[0.15em]">{percentage}%</span>
      </div>

      <div className="flex flex-col z-10 mt-1">
        <span className="text-xs font-bold tracking-tight text-white/90 leading-tight truncate" title={name}>{name}</span>
        <span className="text-lg font-extrabold text-white tracking-tight leading-none mt-1.5 tabular-nums">
          {formatMinutes(minutes)}
        </span>
        <span className="text-[9px] text-white/40 font-mono tracking-tight mt-1">{count} {count === 1 ? t("insights.focusBlocks.sessionSingle", "deep session") : t("insights.focusBlocks.sessionPlural", "deep sessions")}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden mt-1 z-10">
        <div 
          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// 24-Week Focus Heatmap Component
function FocusHeatmap({ sessions }: { sessions: DbSession[] }) {
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
                      tabIndex={0}
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
                      onFocus={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parentRect = outerRef.current?.getBoundingClientRect();
                        if (parentRect) {
                          setHoveredCell({ date: day.date, minutes: day.minutes, sessions: day.sessions, cumulative: day.cumulative, x: rect.left - parentRect.left + rect.width / 2, y: rect.top - parentRect.top, parentW: parentRect.width });
                        }
                      }}
                      onBlur={() => setHoveredCell(null)}
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

// Focus Science Glossary & Tips Component
function FocusScienceGlossary() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"ratio" | "fidget" | "residue">("ratio");

  return (
    <section className="glass-card p-5 flex flex-col gap-4 h-full relative">
      
      <div className="flex flex-col gap-1 z-10">
        <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-primary leading-none mb-1.5">{t("insights.glossary.title", "How your focus stats work")}</h3>
        <p className="text-xs text-white/40 leading-relaxed font-normal">{t("insights.glossary.subtitle", "Plain notes on what each number measures — and what it doesn't.")}</p>
      </div>

      <div className="flex gap-1.5 border-b border-white/5 pb-2 z-10">
        <button
          onClick={() => setActiveTab("ratio")}
          className={cn(
            "text-[9.5px] font-sans font-semibold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-lg transition-all duration-200 border",
            activeTab === "ratio"
              ? "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_1px_rgba(255,255,255,0.05)]"
              : "text-white/60 hover:text-white border-transparent hover:bg-white/5"
          )}
        >
          {t("insights.glossary.focustime.tab", "Focus Time")}
        </button>
        <button
          onClick={() => setActiveTab("fidget")}
          className={cn(
            "text-[9.5px] font-sans font-semibold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-lg transition-all duration-200 border",
            activeTab === "fidget" 
              ? "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_1px_rgba(255,255,255,0.05)]" 
              : "text-white/60 hover:text-white border-transparent hover:bg-white/5"
          )}
        >
          {t("insights.glossary.fidgeting.tab", "Fidgeting")}
        </button>
        <button
          onClick={() => setActiveTab("residue")}
          className={cn(
            "text-[9.5px] font-sans font-semibold uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-lg transition-all duration-200 border",
            activeTab === "residue" 
              ? "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_1px_rgba(255,255,255,0.05)]" 
              : "text-white/60 hover:text-white border-transparent hover:bg-white/5"
          )}
        >
          {t("insights.glossary.residue.tab", "Residue")}
        </button>
      </div>

      <div className="min-h-[120px] text-xs text-white/70 leading-relaxed bg-white/[0.01] border border-white/5 p-4 rounded-xl z-10 flex-1 flex flex-col justify-center">
        {activeTab === "ratio" && (
          <div className="space-y-2">
            <p>
              <strong className="text-white">{t("insights.glossary.focustime.title", "Deep Focus Time")}</strong> {t("insights.glossary.focustime.desc1", "counts the real measured minutes your focus timer actually ran — nothing inflated. We never credit the target duration you didn't finish, and we don't penalise you for leaving this tab to work in another app (your editor, Word, Figma…). Flowstate can't see that app, so it doesn't pretend to.")}
            </p>
            <p>
              {t("insights.glossary.focustime.desc2", "The heatmap and trend chart both use these honest minutes, so the numbers you see are the minutes you actually put in.")}
            </p>
          </div>
        )}
        {activeTab === "fidget" && (
          <div className="space-y-2">
            <p>
              <strong className="text-white">{t("insights.glossary.fidgeting.title", "Fidget Auditing")}</strong> {t("insights.glossary.fidgeting.desc1", "counts the small adjustments you make in the first 10 minutes — nudging the volume, swapping the ambient mix, changing the scene.")}
            </p>
            <p>
              {t("insights.glossary.fidgeting.desc2", "A lot of adjusting usually means the setup wasn't ready. Get your audio and scene how you want them before you start the clock, and you settle in faster.")}
            </p>
          </div>
        )}
        {activeTab === "residue" && (
          <div className="space-y-2">
            <p>
              <strong className="text-white">{t("insights.glossary.residue.title", "Attention Residue")}</strong> {t("insights.glossary.residue.desc1", "is what's left over when you switch tasks — part of your head stays on the last thing for a while after you've moved on.")}
            </p>
            <p>
              {t("insights.glossary.residue.desc2", "A quick glance at messages mid-block leaves some of that residue. Fewer switches while the timer runs means less of your attention gets split.")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Momentum row: honest streak, weekly goal ring, and personal records.
function MomentumRow({ sessions }: { sessions: DbSession[] }) {
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

export default function InsightsPage() {
  const { t, locale, setLocale } = useTranslation();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${t("insights.title", "Focus Insights")} | Flowstate`;
    }
  }, [t]);

  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const handleShare = () => {
    setShareOpen(true);
  };
  
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const configured = isSupabaseConfigured();

  // Dev-only demo mode (`/insights?demo=1`): renders every insights surface with
  // deterministic synthetic sessions, no auth needed. The NODE_ENV guard is
  // statically resolved, so this whole branch is tree-shaken out of prod builds.
  const demoMode =
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("demo");

  const report = useMemo(() => computeInsights(sessions), [sessions]);

  const localizedInsightMessage = useMemo(() => {
    if (!report || report.totalSessions === 0) {
      return t("insights.message.noSessions", "Run one focus session and the insights show up.");
    }
    if (report.fidgetFirst10minAverage > 5) {
      return t("insights.message.fidgetAlert", "You average {count} adjustments in your first 10 minutes. Set your audio and scene before you start the clock.")
        .replace("{count}", String(report.fidgetFirst10minAverage));
    }
    if (report.totalSessions >= 10) {
      return t("insights.message.consistent", "A few days of deep work in a row now. That's the habit forming.");
    }
    return t("insights.message.solid", "Steady week — the numbers are holding.");
  }, [report, t]);

  const completionRate = useMemo(() => {
    if (!sessions || sessions.length === 0) return 0;
    const completed = sessions.filter(s => s.completed).length;
    return Math.round((completed / sessions.length) * 100);
  }, [sessions]);

  const sessionsThisWeek = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    return sessions.filter(s => new Date(s.started_at) >= since).length;
  }, [sessions]);

  // Dynamic Focus blocks parsed from context_bookmark
  const categoriesData = useMemo(() => {
    const categoryMap: Record<string, { minutes: number; count: number }> = {};
    
    sessions.forEach(s => {
      const bookmark = s.context_bookmark || "";
      // Measured time only — no target-duration fallback (honest minutes).
      const duration = Math.round((s.actual_duration_s ?? 0) / 60);
      if (duration <= 0) return;
      
      let cat = "General Deep Work";
      const bookmarkLower = bookmark.toLowerCase();
      
      if (/code|coding|dev|development|program|refactor|bug|fix|backend|frontend|react|typescript|javascript|api|git/i.test(bookmarkLower)) {
        cat = "Software Development";
      } else if (/design|figma|ui|ux|stitch|css|style|styling|tailwind|color|assets/i.test(bookmarkLower)) {
        cat = "Design & UI";
      } else if (/write|writing|doc|docs|documentation|blog|content|copy|draft/i.test(bookmarkLower)) {
        cat = "Technical Writing";
      } else if (/research|read|reading|learn|learning|study|course|analys/i.test(bookmarkLower)) {
        cat = "Research & Learning";
      } else if (/plan|planning|meet|meeting|email|slack|inbox|admin|mgmt|schedule/i.test(bookmarkLower)) {
        cat = "Planning & Admin";
      } else if (bookmark.trim().length > 0) {
        cat = bookmark.trim();
        if (cat.length > 25) {
          cat = cat.slice(0, 22) + "...";
        }
      }
      
      if (!categoryMap[cat]) {
        categoryMap[cat] = { minutes: 0, count: 0 };
      }
      categoryMap[cat].minutes += duration;
      categoryMap[cat].count += 1;
    });

    const totalMin = Object.values(categoryMap).reduce((sum, item) => sum + item.minutes, 0);
    
    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        minutes: data.minutes,
        count: data.count,
        percentage: totalMin > 0 ? Math.round((data.minutes / totalMin) * 100) : 0
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 4);
  }, [sessions]);

  useEffect(() => {
    isMounted.current = true;

    if (demoMode) {
      queueMicrotask(() => {
        setMounted(true);
        setUser({ id: "demo-user", email: "demo@flowstate.local" });
        setSessions(generateDemoSessions());
        setLoading(false);
      });
      return;
    }

    queueMicrotask(() => {
      setMounted(true);
      if (!configured) {
        setLoading(false);
      }
    });

    if (!configured) {
      return;
    }

    const supabase = createClient();
    let fetched = false;

    const handleUser = (currentUser: any) => {
      if (!isMounted.current) return;
      setUser(currentUser);
      
      if (currentUser) {
        if (!fetched) {
          fetched = true;
          setLoading(true);
          fetchSessions(supabase);
        }
      } else {
        fetched = false;
        setSessions([]);
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!isMounted.current) return;
      if (currentUser) {
        handleUser(currentUser);
      } else if (!currentUser) {
        setLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [configured, demoMode]);

  async function fetchSessions(supabase: any) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    let timedOut = false;

    try {
      setError(null);
      // Look back 180 days to fully populate the 24-week heatmap
      const hundredEightyDaysAgo = new Date();
      hundredEightyDaysAgo.setDate(hundredEightyDaysAgo.getDate() - 180);

      const queryPromise = supabase
        .from("flowstate_focus_sessions")
        .select("*")
        .gte("started_at", hundredEightyDaysAgo.toISOString())
        .order("started_at", { ascending: false })
        .abortSignal(signal);

      const timeoutPromise = new Promise<never>((_, reject) => {
        const tId = setTimeout(() => {
          timedOut = true;
          controller.abort();
          reject(new Error("Connection timed out. Please check your network connection."));
        }, 10000);

        signal.addEventListener("abort", () => {
          clearTimeout(tId);
        });
      });

      const { data, error: queryError } = await Promise.race([
        queryPromise,
        timeoutPromise as any
      ]);

      if (!isMounted.current || signal.aborted) return;

      if (queryError) {
        console.error("Error fetching sessions from Supabase:", queryError);
        setError(queryError.message);
      } else if (data) {
        setSessions(data as DbSession[]);
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      
      if (timedOut) {
        setError(err.message || "Connection timed out.");
      } else {
        if (err.name === "AbortError" || err.message === "aborted" || signal.aborted) {
          return;
        }
        console.error("Exception fetching sessions from Supabase:", err);
        setError(err instanceof Error ? err.message : "Failed to load focus sessions.");
      }
    } finally {
      if (isMounted.current && !signal.aborted) {
        setLoading(false);
      }
    }
  }

  async function handleDeleteSession(id: string) {
    if (!confirm(t("insights.history.confirmDelete", "Are you sure you want to permanently delete this focus session record from your history?"))) return;
    if (demoMode) {
      // Demo data is local-only — just drop it from state.
      setSessions((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("flowstate_focus_sessions")
        .delete()
        .eq("id", id);
        
      if (deleteError) throw deleteError;
      
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error("Failed to delete session:", err);
      alert(err.message || t("insights.history.deleteError", "An error occurred while deleting the session."));
    } finally {
      setDeletingId(null);
    }
  }

  // 1. Loading State
  if (loading) {
    return (
      <>
        <WebGLBackground />
        
        <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent text-white/50 items-center justify-center gap-3 z-10">
          <AmbientBackground />
          <Loader2 className="h-6 w-6 animate-apple-loader text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest animate-pulse">{t("insights.loading", "Loading Analytics...")}</span>
        </div>
      </>
    );
  }

  // 2. Database unconfigured state
  if (!configured) {
    return (
      <>
        <WebGLBackground />
        
        <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent items-center justify-center p-6 text-center z-10">
          <AmbientBackground />
          <div className="max-w-md space-y-6 z-10 glass-card p-8 border border-white/10">
            <div className="p-4 mx-auto w-fit rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-white/90">{t("insights.unconfigured.title", "Database Unconfigured")}</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("insights.unconfigured.description", "Supabase is not configured in your environment variables. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable server-persisted focus history.")}
            </p>
            <Link href="/app" className="inline-block px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80">
              {t("dashboard.backToTimer", "Back to Timer")}
            </Link>
          </div>
        </div>
      </>
    );
  }

  // 3. Connection error state
  if (error) {
    return (
      <>
        <WebGLBackground />
        
        <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent items-center justify-center p-6 text-center z-10">
          <AmbientBackground />
          <div className="max-w-md space-y-6 z-10 glass-card p-8 border border-white/10">
            <div className="p-4 mx-auto w-fit rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-white/90">{t("insights.error.title", "Unable to Load Insights")}</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              {error === "Connection timed out." ? t("insights.error.description", "Please check your connection and try again.") : error}
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  setLoading(true);
                  const supabase = createClient();
                  fetchSessions(supabase);
                }} 
                className="px-5 py-2.5 rounded-full bg-primary text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                {t("insights.error.retry", "Retry Connection")}
              </button>
              <Link href="/app" className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80">
                {t("dashboard.backToTimer", "Back to Timer")}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 4. User not logged in state
  if (!user) {
    return (
      <>
        <WebGLBackground />
        
        <div className="w-screen h-screen flex flex-col relative overflow-hidden bg-transparent items-center justify-center p-6 text-center z-10">
          <AmbientBackground />
          <div className="max-w-sm space-y-6 z-10 glass-card p-8 border border-white/10">
            <div className="p-4 mx-auto w-fit rounded-full bg-primary/10 text-primary border border-primary/20">
              <Key className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-white/90">{t("insights.auth.title", "Sign in first")}</h2>
            <p className="text-sm text-white/70 leading-relaxed">
              {t("insights.auth.description", "Sign in or create an account so your focus history is saved and synced.")}
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <Link href="/login?next=/insights" className="px-5 py-2.5 rounded-full bg-primary text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity">
                {t("insights.auth.signIn", "Sign In / Sign Up")}
              </Link>
              <Link href="/app" className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80">
                {t("dashboard.backToTimer", "Back to Timer")}
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const hasData = report.totalSessions > 0;

  return (
    <>
      <WebGLBackground />
      
      <div className="w-full max-w-full h-screen flex relative select-none overflow-hidden bg-transparent text-white/90 font-sans z-10 p-4 md:p-5 gap-5">
        {/* Background radial ambient light bleeds */}
        <AmbientBackground />

        {/* Left SideNav Sidebar (Stitch premium theme spec) */}
        <nav className="relative hidden md:flex flex-col h-full w-64 backdrop-blur-[45px] border-t border-l border-white/15 border-r border-b border-white/5 bg-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.15)] rounded-[32px] py-8 shrink-0 z-20 overflow-hidden">
          {/* Top specular reflection strip */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          
          <div className="px-6 mb-10">
            <Image
              src="/icons/flowstate-logo.png"
              alt="Flowstate"
              width={150}
              height={53}
              className="h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.22)]"
              priority
            />
            <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-2.5 ml-0.5">{t("dashboard.deepWorkActive", "Deep Work Active")}</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-1.5 px-3">
            <Link
              href="/app"
              className="group px-4 py-3 flex items-center gap-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.03] text-white/50 hover:text-white/90 transition-all duration-300 font-mono text-[11px] font-semibold uppercase tracking-wider hover:translate-x-1 active:scale-[0.98]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors duration-300" />
              <span>{t("dashboard.focus", "Focus")}</span>
            </Link>
            <Link
              href="/insights"
              className="relative px-4 py-3 flex items-center gap-3 rounded-2xl bg-white/[0.07] border border-white/20 border-t-white/40 border-l-primary/60 shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md font-mono text-[11px] font-bold uppercase tracking-wider text-primary drop-shadow-[0_0_10px_rgba(0,229,255,0.25)] transition-all duration-300 scale-[1.02]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
              <span>{t("dashboard.insights", "Insights")}</span>
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
          </div>
          
          <div className="mt-auto flex flex-col gap-1.5 px-3 pt-6 border-t border-white/10">
            {user && (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <span className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/40 shrink-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-[11px] font-bold text-white">
                  {userAvatarUrl(user) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userAvatarUrl(user)!} alt={userDisplayName(user)} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    (userDisplayName(user) || "?").charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white/90 truncate leading-tight">{userDisplayName(user)}</p>
                  <p className="text-[9px] font-mono text-white/35 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Side: Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <header className="md:h-14 h-auto flex flex-col md:flex-row md:items-center justify-between pb-4 shrink-0 select-none z-20 border-b border-white/5 mb-4 gap-3">
            <div className="flex items-start justify-between w-full md:w-auto gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white/90 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" /> {t("insights.title", "Focus Insights")}
                </h1>
                <p className="text-white/50 text-[10px] md:text-xs leading-relaxed max-w-xs md:max-w-none">{localizedInsightMessage}</p>
              </div>
              
              {/* Mobile Actions Container (Language Selector & Share) */}
              <div className="flex md:hidden items-center gap-2 shrink-0">
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

                {hasData && (
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full glass-pill hover:bg-primary/5 transition-all text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/40 flex items-center justify-center shadow-lg"
                    title={t("insights.share", "Share Stats")}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop-only action buttons */}
            <div className="hidden md:flex items-center gap-3">
              {hasData && (
                <button
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-full glass-pill hover:bg-primary/5 transition-all text-xs font-mono uppercase tracking-wider text-primary/80 hover:text-primary border border-primary/20 hover:border-primary/40 flex items-center gap-2"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {t("insights.share", "Share Stats")}
                </button>
              )}
              <Link href="/app" className="px-5 py-2.5 rounded-full glass-pill hover:bg-white/[0.04] transition-all text-xs font-mono uppercase tracking-wider text-white/80 border border-white/10">
                {t("dashboard.backToTimer", "Back to Timer")}
              </Link>
            </div>
          </header>

          {/* Scrollable Workspace Wrapper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 select-none pr-1">
            <div className="w-full space-y-8 pb-28 md:pb-8">

            {!hasData ? (
              <div className="flex flex-col items-center justify-center p-16 glass-card border border-white/5 text-center">
                <Brain className="h-14 w-14 text-white/20 mb-4 animate-pulse" />
                <h2 className="text-lg font-semibold text-white/80">{t("insights.empty.title", "No sessions yet")}</h2>
                <p className="text-xs text-white/50 mt-2 max-w-sm leading-relaxed">
                  {t("insights.empty.subtitle", "Run one block on the timer — your focus time, streaks, and history start filling in from there.")}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* 12-Column Responsive Dashboard Grid (Stitch spec) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column: Focus Minutes Trend Chart (Col-span 8) */}
                  <div className="lg:col-span-8 flex flex-col">
                    <FocusTrendChart sessions={sessions} />
                  </div>

                  {/* Right Column: Key Stats & Focus Blocks (Col-span 4) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Deep Work Sessions Card */}
                    <div className="glass-card p-5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary shadow-[inset_0_0_10px_hsl(var(--secondary)/0.2)] group-hover:scale-110 transition-transform">
                          <Brain className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-[9.5px] font-sans font-bold uppercase tracking-[0.15em] text-white/50 leading-none">{t("insights.metrics.sessions.title", "Deep Work Sessions")}</h3>
                          <div className="text-2xl font-extrabold tracking-tight text-white mt-2 leading-none">{report.totalSessions}</div>
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

                </div>

                {/* Momentum: streak, weekly goal, personal records */}
                <MomentumRow sessions={sessions} />

                {/* Focus Heatmap (Full width) */}
                <FocusHeatmap sessions={sessions} />

                {/* Glossary & History */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Glossary (Left) */}
                  <div className="lg:col-span-5 h-full">
                    <FocusScienceGlossary />
                  </div>

                  {/* History list (Right) */}
                  <section className="glass-card p-5 lg:col-span-7 flex flex-col gap-4 relative overflow-hidden">
                    
                    <h3 className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-white/70 leading-none z-10">{t("insights.history.title", "Recent Session History")}</h3>
                    
                    <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-0.5 z-10">
                      {sessions.map(session => {
                        // Honest measured minutes only — never fall back to the (unearned) target duration.
                        const durMin = Math.round((session.actual_duration_s || 0) / 60);
                        const isDeleting = deletingId === session.id;
 
                        return (
                          <div 
                            key={session.id} 
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-white/5 group gap-2 relative overflow-hidden"
                          >
                            
                            <div className="flex flex-col gap-1 min-w-0 z-10">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold tracking-tight text-white/90 truncate">
                                  {mounted ? formatDateTime(session.started_at, t) : t("insights.history.loadingDate", "Loading date...")}
                                </span>
                                {session.completed ? (
                                  <span className="inline-flex items-center gap-0.5 text-[8px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                                    <CheckCircle className="h-2 w-2" /> {t("insights.chart.completed", "Completed")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[8px] font-mono uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md">
                                    <XCircle className="h-2 w-2" /> {t("insights.chart.skipped", "Skipped")}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-white/50">
                                {t("insights.history.durationAndFidgets", "{duration}m duration • {fidgets} fidgets").replace("{duration}", String(durMin)).replace("{fidgets}", String(session.fidget_count || 0))}
                                {session.context_bookmark && (
                                  <span className="block text-[9px] font-sans tracking-tight text-primary/65 mt-1 truncate max-w-[280px]">
                                    {t("insights.history.workingOn", "Working on:")} &ldquo;{session.context_bookmark}&rdquo;
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 z-10">
                              <div className="flex flex-col items-end">
                                <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{t("insights.history.duration", "Focus Time")}</span>
                                <span className="font-bold text-xs text-primary">
                                  {durMin}m
                                </span>
                              </div>

                              <button
                                onClick={() => handleDeleteSession(session.id)}
                                disabled={isDeleting || deletingId !== null}
                                aria-label="Delete focus session record"
                                title="Delete permanently"
                                className="text-white/20 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30 disabled:hover:text-white/20 shrink-0"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-apple-loader" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                </div>

              </div>
            )}
            </div>
          </div>
        </div> {/* Right Side End */}
      </div> {/* Outer Wrapper End */}

      {/* Mobile Bottom Navigation Bar (Stitch premium mobile layout spec) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-16 glass-pill flex items-center justify-around z-40 px-3 shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.4)] backdrop-blur-2xl border border-white/10 bg-black/40 rounded-full">
        {/* Home/Focus Link */}
        <Link
          href="/app"
          className="flex flex-col items-center justify-center flex-1 py-1 text-white/45 hover:text-white transition-all duration-300"
        >
          <Timer className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.focus", "Focus")}</span>
        </Link>

        {/* Stats Tab (Active on insights page) */}
        <div className="flex flex-col items-center justify-center flex-1 py-1 text-primary scale-105">
          <BarChart2 className="h-5 w-5 mb-0.5" />
          <span className="text-[9px] font-sans font-bold uppercase tracking-wider">{t("dashboard.insights", "Insights")}</span>
        </div>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        focusMinutes={report.totalFocusMinutes}
        fidgetCount={Math.round(report.averageFidgets * report.totalSessions)}
        isSummary={true}
        sessionCount={report.totalSessions}
        completionRate={completionRate}
      />
    </>
  );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string; subtext: string }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3 relative overflow-hidden group hover:border-white/20 transition-colors">
      
      <div className="absolute -right-4 -top-4 text-white/[0.01] group-hover:text-white/[0.03] transition-colors transform scale-150 pointer-events-none">
        {icon}
      </div>
      <div className="text-primary z-10">{icon}</div>
      <div className="flex flex-col z-10">
        <span className="text-2xl font-extrabold tracking-tight text-white/90 leading-none tabular-nums">{value}</span>
        <span className="text-[9.5px] font-sans font-bold uppercase tracking-[0.15em] text-white/40 mt-2 leading-none">{label}</span>
        <span className="text-[10px] text-white/50 mt-2 leading-relaxed">{subtext}</span>
      </div>
    </div>
  );
}
