"use client";

import { CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { DbSession } from "@/lib/optimizer/compute-insights";

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

// Recent Session History list with per-row permanent delete.
export function SessionHistory({
  sessions,
  mounted,
  deletingId,
  onDelete,
}: {
  sessions: DbSession[];
  mounted: boolean;
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold tracking-tight text-white/90 truncate">
                    {mounted ? formatDateTime(session.started_at, t) : t("insights.history.loadingDate", "Loading date...")}
                  </span>
                  {session.completed ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                      <CheckCircle className="h-2.5 w-2.5" /> {t("insights.chart.completed", "Completed")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium uppercase tracking-wider text-secondary/80 bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-md">
                      <XCircle className="h-2.5 w-2.5" /> {t("insights.chart.skipped", "Skipped")}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-white/60">
                  {t("insights.history.durationAndFidgets", "{duration}m duration • {fidgets} fidgets").replace("{duration}", String(durMin)).replace("{fidgets}", String(session.fidget_count || 0))}
                  {session.context_bookmark && (
                    <div className="text-[10px] font-sans tracking-tight text-primary/80 mt-0.5 truncate max-w-[280px]">
                      {t("insights.history.workingOn", "Working on:")} &ldquo;{session.context_bookmark}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-10">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{t("insights.history.duration", "Focus Time")}</span>
                  <span className="font-bold text-xs text-primary">
                    {durMin}m
                  </span>
                </div>

                <button
                  onClick={() => onDelete(session.id)}
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
  );
}
