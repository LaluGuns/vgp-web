import type { DbSession } from "./compute-insights";

/**
 * Synthetic session history for the dev-only insights demo mode
 * (`/insights?demo=1`, only when NODE_ENV !== "production" — the call site is
 * statically tree-shaken out of production builds).
 *
 * Shapes ~120 days of plausible focus behaviour so every insights surface has
 * something to render: weekday-weighted sessions, varied durations, ~75%
 * completion, fidget timelines, and categorised context bookmarks.
 */

const BOOKMARKS = [
  "refactor payment webhook",
  "design system tokens",
  "write API docs",
  "read distributed systems paper",
  "sprint planning notes",
  "fix flaky e2e tests",
  "mixing new lofi track",
  "landing page copy",
  null,
];

// Deterministic PRNG so the demo looks the same on every reload.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDemoSessions(days = 120): DbSession[] {
  const rand = mulberry32(1337);
  const sessions: DbSession[] = [];
  const now = new Date();

  for (let dayOffset = 0; dayOffset < days; dayOffset++) {
    const day = new Date(now);
    day.setDate(now.getDate() - dayOffset);
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

    // Weekdays: usually 1-4 sessions; weekends: often zero. A few skipped
    // weekdays keep the streak logic honest.
    const skipDay = rand() < (isWeekend ? 0.55 : 0.18);
    if (skipDay) continue;
    const count = 1 + Math.floor(rand() * (isWeekend ? 2 : 4));

    for (let i = 0; i < count; i++) {
      const startHour = 8 + Math.floor(rand() * 12); // 08:00–20:00
      const started = new Date(day);
      started.setHours(startHour, Math.floor(rand() * 60), 0, 0);
      if (started > now) continue;

      const targetMin = [25, 25, 25, 50, 90][Math.floor(rand() * 5)];
      const completed = rand() < 0.75;
      const actualMin = completed
        ? targetMin
        : Math.max(2, Math.round(targetMin * (0.15 + rand() * 0.6)));
      const actualS = Math.round(actualMin * 60);

      const fidgets = Math.floor(rand() * 7);
      const timeline = Array.from({ length: fidgets }, () =>
        Math.floor(rand() * actualS)
      ).sort((a, b) => a - b);

      sessions.push({
        id: `demo-${dayOffset}-${i}`,
        user_id: "demo-user",
        mode: targetMin >= 90 ? "deep" : "pomodoro",
        started_at: started.toISOString(),
        ended_at: new Date(started.getTime() + actualS * 1000).toISOString(),
        target_duration_s: targetMin * 60,
        actual_duration_s: actualS,
        completed,
        fidget_count: fidgets,
        fidget_timeline: timeline,
        defection_seconds: 0,
        context_bookmark: BOOKMARKS[Math.floor(rand() * BOOKMARKS.length)],
        real_focus_ratio: null,
      });
    }
  }

  // Newest first — matches the Supabase query ordering the page expects.
  return sessions.sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}
