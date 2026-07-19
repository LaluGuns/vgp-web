export const GSC_ROW_LIMIT = 25_000;

/** Pure pagination rule used by the GSC reader and release tests. */
export function shouldRequestNextGscPage(receivedRows: number, rowLimit = GSC_ROW_LIMIT): boolean {
  return receivedRows >= rowLimit;
}

export function daysToBackfill(now = new Date()): string[] {
  const dates: string[] = [];
  // GSC finalized data lags. Start three days back and rewrite seven days so
  // late corrections remain idempotent.
  for (let offset = 3; offset < 10; offset++) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
    dates.push(day.toISOString().slice(0, 10));
  }
  return dates;
}

export function normalizePostHogFunnelRow(row: unknown[]): { dimensions: [string, string, string, string, string]; metrics: number[] } {
  return {
    dimensions: [0, 1, 2, 3, 4].map((index) => String(row[index] ?? '')) as [string, string, string, string, string],
    metrics: row.slice(5).map((value) => Number(value) || 0),
  };
}
