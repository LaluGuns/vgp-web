import type { DbSession } from "./compute-insights";

/**
 * Honest momentum metrics over a user's focus sessions.
 *
 * Rules (shared with the rest of the insights surface):
 *  - Only MEASURED time counts. We never credit `target_duration_s`; a session
 *    that ended early contributes only its `actual_duration_s`.
 *  - "Completed" is taken from the stored flag as-is — we do not re-derive it.
 *  - All calendar math is done in the user's LOCAL timezone using local Date
 *    methods (getFullYear/getMonth/getDate), never UTC string slicing, so a
 *    session at 11pm local lands on the correct local day regardless of offset.
 */

/**
 * Stable integer index for the LOCAL calendar day a Date falls on.
 * We read the local Y/M/D components and re-encode them through Date.UTC so the
 * result is an even multiple of one day — immune to DST hour shifts that would
 * corrupt a naive `ms / 86400000` on a local timestamp.
 */
function localDayOrdinal(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/**
 * ISO-8601 week key ("2026-W28") for the LOCAL calendar day a Date falls on.
 * ISO weeks start Monday and belong to the year containing their Thursday.
 */
function isoWeekKey(date: Date): string {
  // Anchor to the local calendar day, expressed as a UTC date for safe math.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Shift to the Thursday of this week (Mon=0 … Sun=6).
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const isoYear = d.getUTCFullYear();
  // Week 1 is the week containing the first Thursday — i.e. Jan 4th's week.
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

/** Local Monday 00:00:00 of the week containing `base`. */
function startOfLocalWeekMonday(base: Date): Date {
  const m = new Date(base);
  m.setHours(0, 0, 0, 0);
  // Days elapsed since Monday (Sun=0 → 6, Mon=1 → 0 …).
  const daysSinceMonday = (m.getDay() + 6) % 7;
  m.setDate(m.getDate() - daysSinceMonday);
  return m;
}

/**
 * Current and longest daily streak.
 * A "streak day" is any local calendar day with >= 1 completed session.
 * Current streak counts backward from today; if today has no completed session
 * yet but yesterday does, the streak is still considered alive (standard
 * habit-app grace — a day isn't "broken" until it fully passes unfilled).
 */
export function computeStreaks(sessions: DbSession[]): { current: number; longest: number } {
  const completedDays = new Set<number>();
  for (const s of sessions) {
    if (!s.completed) continue;
    const d = new Date(s.started_at);
    if (isNaN(d.getTime())) continue;
    completedDays.add(localDayOrdinal(d));
  }

  if (completedDays.size === 0) return { current: 0, longest: 0 };

  // Longest = max consecutive run over the sorted unique days.
  const sorted = Array.from(completedDays).sort((a, b) => a - b);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      run++;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }

  // Current = run ending today (or yesterday, if today is not yet filled).
  const today = localDayOrdinal(new Date());
  let cursor: number | null = null;
  if (completedDays.has(today)) cursor = today;
  else if (completedDays.has(today - 1)) cursor = today - 1;

  let current = 0;
  while (cursor !== null && completedDays.has(cursor)) {
    current++;
    cursor--;
  }

  return { current, longest };
}

/**
 * Personal records, all in whole minutes of MEASURED time:
 *  - longestSessionMin: the single longest session.
 *  - bestDayMin: highest single local-day total.
 *  - bestWeekMin: highest single ISO-week total.
 */
export function computeRecords(
  sessions: DbSession[]
): { longestSessionMin: number; bestDayMin: number; bestWeekMin: number } {
  let longestSessionSec = 0;
  const dayTotals = new Map<number, number>();
  const weekTotals = new Map<string, number>();

  for (const s of sessions) {
    const sec = s.actual_duration_s ?? 0; // honest: no target-duration fallback
    if (sec <= 0) continue;
    const d = new Date(s.started_at);
    if (isNaN(d.getTime())) continue;

    if (sec > longestSessionSec) longestSessionSec = sec;

    const dayKey = localDayOrdinal(d);
    dayTotals.set(dayKey, (dayTotals.get(dayKey) ?? 0) + sec);

    const weekKey = isoWeekKey(d);
    weekTotals.set(weekKey, (weekTotals.get(weekKey) ?? 0) + sec);
  }

  const bestDaySec = dayTotals.size > 0 ? Math.max(...dayTotals.values()) : 0;
  const bestWeekSec = weekTotals.size > 0 ? Math.max(...weekTotals.values()) : 0;

  return {
    longestSessionMin: Math.round(longestSessionSec / 60),
    bestDayMin: Math.round(bestDaySec / 60),
    bestWeekMin: Math.round(bestWeekSec / 60),
  };
}

/**
 * Total measured minutes for a single week (week starts Monday, local time).
 * Defaults to the current week; pass any Date inside another week to target it.
 */
export function weekFocusMinutes(sessions: DbSession[], weekStart?: Date): number {
  const monday = startOfLocalWeekMonday(weekStart ?? new Date());
  const nextMonday = new Date(monday);
  nextMonday.setDate(nextMonday.getDate() + 7);

  let totalSec = 0;
  for (const s of sessions) {
    const started = new Date(s.started_at);
    if (isNaN(started.getTime())) continue;
    if (started >= monday && started < nextMonday) {
      totalSec += s.actual_duration_s ?? 0; // measured time only
    }
  }
  return Math.round(totalSec / 60);
}
