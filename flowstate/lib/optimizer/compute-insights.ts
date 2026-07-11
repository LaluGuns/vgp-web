export interface DbSession {
  id: string;
  user_id: string;
  mode: string;
  started_at: string;
  ended_at: string | null;
  target_duration_s: number;
  actual_duration_s: number | null;
  completed: boolean;
  fidget_count: number;
  fidget_timeline: number[] | null;
  defection_seconds: number;
  context_bookmark: string | null;
  real_focus_ratio: number | null;
}

export interface InsightsReport {
  totalSessions: number;
  totalFocusMinutes: number;
  averageFidgets: number;
  fidgetFirst10minAverage: number;
  insightMessage: string;
}

const EMPTY_REPORT: InsightsReport = {
  totalSessions: 0,
  totalFocusMinutes: 0,
  averageFidgets: 0,
  fidgetFirst10minAverage: 0,
  insightMessage: "Complete a focus session to generate insights.",
};

export function computeInsights(sessions: DbSession[]): InsightsReport {
  if (!sessions || sessions.length === 0) {
    return { ...EMPTY_REPORT };
  }

  const totalSessions = sessions.length;
  let totalFocusSeconds = 0;
  let totalFidgets = 0;
  let totalFidgetFirst10 = 0;

  for (const s of sessions) {
    // Measured time only — never credit the (unearned) target duration.
    totalFocusSeconds += s.actual_duration_s ?? 0;
    totalFidgets += s.fidget_count || 0;

    // Count fidgets in the first 10 minutes (600 seconds). Timeline is chronological.
    const timeline = Array.isArray(s.fidget_timeline) ? s.fidget_timeline : [];
    for (const t of timeline) {
      if (t > 600) break;
      totalFidgetFirst10++;
    }
  }

  const avgFidgetFirst10 = Math.round((totalFidgetFirst10 / totalSessions) * 10) / 10;

  let insightMessage = "Steady week — the numbers are holding.";
  if (avgFidgetFirst10 > 5) {
    insightMessage = `You average ${avgFidgetFirst10} adjustments in your first 10 minutes. Set your audio and scene before you start the clock.`;
  } else if (totalSessions >= 10) {
    insightMessage = "A few days of deep work in a row now. That's the habit forming.";
  }

  return {
    totalSessions,
    totalFocusMinutes: Math.round(totalFocusSeconds / 60),
    averageFidgets: Math.round((totalFidgets / totalSessions) * 10) / 10,
    fidgetFirst10minAverage: avgFidgetFirst10,
    insightMessage,
  };
}
