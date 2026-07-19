import { query } from '@/lib/db';
import type { SeoFilters } from './types';

const BRAND_TERMS = ['virzy', 'virzyguns', 'flow by virzy guns'];
const FLOW_PAGE_PREFIX = 'https://flow.virzyguns.com/';

function number(value: unknown): number { return Number(value) || 0; }
function parsePage(page: string) {
  let pathname = page;
  try { pathname = new URL(page).pathname; } catch { /* retained as received */ }
  const locale = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/|$)/)?.[1] ?? 'en';
  const normalized = pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, '') || '/';
  const cluster = normalized.includes('creator-music') ? 'creator_music'
    : normalized.includes('deep-work') ? 'deep_work'
      : normalized.includes('study-timer') ? 'study_timer'
        : normalized.includes('pomodoro') ? 'pomodoro_music'
          : normalized.includes('/timer/') ? 'timer_preset'
            : normalized.includes('pricing') ? 'pricing' : 'product';
  const market = locale === 'en' ? 'global-en' : locale === 'es' ? 'global-es' : locale;
  return { locale, cluster, market };
}
function isBrand(queryText: string) { return BRAND_TERMS.some((term) => queryText.toLowerCase().includes(term)); }
function normalizeFilters(input: URLSearchParams): SeoFilters {
  const candidate = Number(input.get('days'));
  const days = candidate === 7 || candidate === 90 ? candidate : 28;
  const read = (name: string) => input.get(name) || undefined;
  const brand = input.get('brand');
  const start = read('start'); const end = read('end');
  const validDate = (value: string | undefined) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)));
  return { days, start: validDate(start) ? start : undefined, end: validDate(end) ? end : undefined, market: read('market'), locale: read('locale'), country: read('country')?.toLowerCase(), cluster: read('cluster'), device: read('device')?.toUpperCase(), brand: brand === 'brand' || brand === 'non_brand' ? brand : 'all', searchType: 'web' };
}
function dateWindow(days: number, customStart?: string, customEnd?: string) {
  if (customStart && customEnd && customStart <= customEnd) {
    const start = new Date(`${customStart}T00:00:00Z`); const end = new Date(`${customEnd}T00:00:00Z`);
    const duration = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const previousEnd = new Date(start); previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
    const previousStart = new Date(previousEnd); previousStart.setUTCDate(previousStart.getUTCDate() - duration + 1);
    const iso = (date: Date) => date.toISOString().slice(0, 10);
    return { start: customStart, end: customEnd, previousStart: iso(previousStart), previousEnd: iso(previousEnd) };
  }
  const end = new Date(); end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - days + 1);
  const previousEnd = new Date(start); previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd); previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return { start: iso(start), end: iso(end), previousStart: iso(previousStart), previousEnd: iso(previousEnd) };
}
function aggregate(rows: { clicks: unknown; impressions: unknown; position_weighted?: unknown; position?: unknown }[]) {
  const clicks = rows.reduce((sum, row) => sum + number(row.clicks), 0);
  const impressions = rows.reduce((sum, row) => sum + number(row.impressions), 0);
  const weighted = rows.reduce((sum, row) => sum + (row.position_weighted === undefined ? number(row.position) * number(row.impressions) : number(row.position_weighted)), 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position: impressions ? weighted / impressions : null };
}

type FunnelAggregate = {
  organicVisitors: number;
  qualifiedActivations: number;
  focusSessions: number;
  creatorPreviews: number;
  checkouts: number;
  activatedPro: number;
  creatorGrants: number;
  downloads: number;
};

function hogqlLiteral(value: string) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

async function fetchExactPostHogFunnel(
  window: { start: string; end: string },
  filters: SeoFilters,
): Promise<{ state: 'connected' | 'not_configured' | 'error'; data: FunnelAggregate | null }> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!key) return { state: 'not_configured', data: null };
  const host = (process.env.POSTHOG_QUERY_HOST || 'https://us.posthog.com').replace(/\/$/, '');
  const projectId = process.env.POSTHOG_PROJECT_ID || '511095';
  const propertyFilters = Object.entries({ market: filters.market, locale: filters.locale, country: filters.country, device: filters.device, cluster: filters.cluster })
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([property, value]) => `AND coalesce(toString(properties.${property === 'country' ? '$geoip_country_code' : property === 'device' ? '$device_type' : property}), '') = ${hogqlLiteral(value)}`)
    .join('\n');
  const sql = `SELECT
    uniqIf(distinct_id, event = '$pageview' AND properties.session_acquisition = 'organic' AND properties.is_bot = false AND properties.is_staff = false),
    uniqIf(distinct_id, event IN ('session_started', 'creator_track_previewed') AND properties.session_acquisition = 'organic'),
    uniqIf(distinct_id, event = 'session_started' AND properties.session_acquisition = 'organic'),
    uniqIf(distinct_id, event = 'creator_track_previewed' AND properties.session_acquisition = 'organic'),
    uniqIf(distinct_id, event = 'checkout_started' AND properties.session_acquisition = 'organic'),
    uniqIf(distinct_id, event = 'subscription_activated' AND properties.session_acquisition = 'organic'),
    uniqIf(distinct_id, event = 'creator_license_granted' AND properties.session_acquisition = 'organic'),
    uniqIf(distinct_id, event = 'creator_track_downloaded' AND properties.session_acquisition = 'organic')
    FROM events
    WHERE timestamp >= toDateTime(${hogqlLiteral(`${window.start} 00:00:00`)})
      AND timestamp < toDateTime(${hogqlLiteral(`${window.end} 00:00:00`)}) + INTERVAL 1 DAY
      ${propertyFilters}`;
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/query/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } }),
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });
    if (!response.ok) return { state: 'error', data: null };
    const payload = await response.json() as { results?: unknown[][] };
    const row = payload.results?.[0];
    if (!row) return { state: 'error', data: null };
    return { state: 'connected', data: {
      organicVisitors: number(row[0]), qualifiedActivations: number(row[1]), focusSessions: number(row[2]),
      creatorPreviews: number(row[3]), checkouts: number(row[4]), activatedPro: number(row[5]),
      creatorGrants: number(row[6]), downloads: number(row[7]),
    } };
  } catch {
    return { state: 'error', data: null };
  }
}

export async function getFounderSeoDashboard(params: URLSearchParams) {
  const filters = normalizeFilters(params);
  const window = dateWindow(filters.days, filters.start, filters.end);
  const exactFunnelPromise = filters.brand && filters.brand !== 'all'
    ? Promise.resolve({ state: 'not_configured' as const, data: null })
    : fetchExactPostHogFunnel(window, filters);
  const pageTable = filters.country || filters.device ? 'seo_gsc_page_dimension_daily' : 'seo_gsc_page_daily';
  const pageConditions = ['metric_date BETWEEN $1 AND $2'];
  const pageValues: unknown[] = [window.start, window.end];
  if (filters.country) { pageValues.push(filters.country); pageConditions.push(`country = $${pageValues.length}`); }
  if (filters.device) { pageValues.push(filters.device); pageConditions.push(`device = $${pageValues.length}`); }
  const queryTable = filters.country || filters.device ? 'seo_gsc_query_page_dimension_daily' : 'seo_gsc_query_page_daily';
  const queryValues: unknown[] = [window.start, window.end];
  const queryConditions = ['metric_date BETWEEN $1 AND $2'];
  if (filters.country) { queryValues.push(filters.country); queryConditions.push(`country = $${queryValues.length}`); }
  if (filters.device) { queryValues.push(filters.device); queryConditions.push(`device = $${queryValues.length}`); }
  const [currentSite, previousSite, pageResult, queryPageResult, countryResult, deviceResult, runResult, indexingResult] = await Promise.all([
    query(`SELECT clicks, impressions, position_weighted FROM seo_gsc_site_daily WHERE metric_date BETWEEN $1 AND $2 AND dimension_kind='all'`, [window.start, window.end]),
    query(`SELECT clicks, impressions, position_weighted FROM seo_gsc_site_daily WHERE metric_date BETWEEN $1 AND $2 AND dimension_kind='all'`, [window.previousStart, window.previousEnd]),
    query(`SELECT page_url, SUM(clicks)::int AS clicks, SUM(impressions)::int AS impressions, SUM(position_weighted)::float AS position_weighted FROM ${pageTable} WHERE ${pageConditions.join(' AND ')} GROUP BY page_url ORDER BY clicks DESC, impressions DESC LIMIT 100`, pageValues),
    query(`SELECT query, page_url, SUM(clicks)::int AS clicks, SUM(impressions)::int AS impressions, SUM(position_weighted)::float AS position_weighted FROM ${queryTable} WHERE ${queryConditions.join(' AND ')} GROUP BY query, page_url ORDER BY clicks DESC, impressions DESC LIMIT 200`, queryValues),
    query(`SELECT dimension_value AS country, SUM(clicks)::int AS clicks, SUM(impressions)::int AS impressions, SUM(position_weighted)::float AS position_weighted FROM seo_gsc_site_daily WHERE metric_date BETWEEN $1 AND $2 AND dimension_kind='country' GROUP BY dimension_value ORDER BY clicks DESC, impressions DESC LIMIT 30`, [window.start, window.end]),
    query(`SELECT dimension_value AS device, SUM(clicks)::int AS clicks, SUM(impressions)::int AS impressions, SUM(position_weighted)::float AS position_weighted FROM seo_gsc_site_daily WHERE metric_date BETWEEN $1 AND $2 AND dimension_kind='device' GROUP BY dimension_value ORDER BY clicks DESC, impressions DESC LIMIT 10`, [window.start, window.end]),
    query(`SELECT status, gsc_status, posthog_status, started_at, completed_at, last_complete_date, error_message FROM seo_ingestion_runs ORDER BY started_at DESC LIMIT 1`),
    query(`SELECT page_url, market, locale, submitted_at, indexed_state, declared_canonical, google_canonical, last_crawl_at, mobile_result, sitemap_status, robots_allowed, schema_status, checked_at FROM seo_indexing_evidence ORDER BY checked_at DESC LIMIT 100`),
  ]);
  const pageRows = pageResult.rows.map((row) => {
    const details = parsePage(String(row.page_url));
    const result = { page: String(row.page_url), ...details, ...aggregate([row]) };
    return result;
  }).filter((row) => (!filters.locale || row.locale === filters.locale) && (!filters.market || row.market === filters.market) && (!filters.cluster || row.cluster === filters.cluster));
  const queryPages = queryPageResult.rows.map((row) => {
    const details = parsePage(String(row.page_url));
    return { query: String(row.query), page: String(row.page_url), brand: isBrand(String(row.query)), ...details, ...aggregate([row]) };
  }).filter((row) => (!filters.brand || filters.brand === 'all' || (filters.brand === 'brand') === row.brand) && (!filters.locale || row.locale === filters.locale) && (!filters.market || row.market === filters.market) && (!filters.cluster || row.cluster === filters.cluster));
  const trendForWindow = async (start: string, end: string) => {
    const brandFiltered = Boolean(filters.brand && filters.brand !== 'all');
    const dimensioned = Boolean(filters.country || filters.device);
    const table = brandFiltered ? queryTable : (dimensioned ? pageTable : 'seo_gsc_page_daily');
    const values: unknown[] = [start, end];
    const conditions = ['metric_date BETWEEN $1 AND $2'];
    if (dimensioned && filters.country) { values.push(filters.country); conditions.push(`country = $${values.length}`); }
    if (dimensioned && filters.device) { values.push(filters.device); conditions.push(`device = $${values.length}`); }
    const selectQuery = brandFiltered ? 'query,' : '';
    const groupQuery = brandFiltered ? 'query,' : '';
    const result = await query(`SELECT metric_date::text AS date, ${selectQuery} page_url, SUM(clicks)::int AS clicks, SUM(impressions)::int AS impressions FROM ${table} WHERE ${conditions.join(' AND ')} GROUP BY metric_date, ${groupQuery} page_url ORDER BY metric_date`, values);
    const byDate = new Map<string, { date: string; clicks: number; impressions: number }>();
    for (const row of result.rows) {
      const details = parsePage(String(row.page_url));
      if ((filters.locale && details.locale !== filters.locale) || (filters.market && details.market !== filters.market) || (filters.cluster && details.cluster !== filters.cluster)) continue;
      if (brandFiltered && (filters.brand === 'brand') !== isBrand(String(row.query))) continue;
      const date = String(row.date).slice(0, 10);
      const existing = byDate.get(date) || { date, clicks: 0, impressions: 0 };
      existing.clicks += number(row.clicks); existing.impressions += number(row.impressions);
      byDate.set(date, existing);
    }
    return [...byDate.values()];
  };
  const [chart, previousChart] = await Promise.all([
    trendForWindow(window.start, window.end),
    trendForWindow(window.previousStart, window.previousEnd),
  ]);
  const queries = [...queryPages].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 100);
  const nonBrandImpressions = queryPages.filter((row) => !row.brand).reduce((sum, row) => sum + row.impressions, 0);
  const allQueryImpressions = queryPages.reduce((sum, row) => sum + row.impressions, 0);
  const buckets = { '1-3': 0, '4-10': 0, '11-20': 0, '21-50': 0, '>50': 0 };
  for (const page of pageRows) {
    const position = page.position || 0;
    if (position <= 3) buckets['1-3']++; else if (position <= 10) buckets['4-10']++; else if (position <= 20) buckets['11-20']++; else if (position <= 50) buckets['21-50']++; else buckets['>50']++;
  }
  const samePageFilters = (rows: { page_url: unknown; clicks: unknown; impressions: unknown; position_weighted: unknown }[]) => rows.map((row) => ({ page: String(row.page_url), ...parsePage(String(row.page_url)), ...aggregate([row]) })).filter((row) => (!filters.locale || row.locale === filters.locale) && (!filters.market || row.market === filters.market) && (!filters.cluster || row.cluster === filters.cluster));
  const previousValues = [window.previousStart, window.previousEnd, ...((filters.brand && filters.brand !== 'all') ? queryValues.slice(2) : pageValues.slice(2))];
  const previousSource = filters.brand && filters.brand !== 'all'
    ? await query(`SELECT query, page_url, SUM(clicks)::int AS clicks, SUM(impressions)::int AS impressions, SUM(position_weighted)::float AS position_weighted FROM ${queryTable} WHERE ${queryConditions.join(' AND ')} GROUP BY query, page_url`, previousValues)
    : await query(`SELECT page_url, SUM(clicks)::int AS clicks, SUM(impressions)::int AS impressions, SUM(position_weighted)::float AS position_weighted FROM ${pageTable} WHERE ${pageConditions.join(' AND ')} GROUP BY page_url`, previousValues);
  const previousFiltered = filters.brand && filters.brand !== 'all'
    ? previousSource.rows.filter((row) => (filters.brand === 'brand') === isBrand(String(row.query))).map((row) => ({ ...row, page_url: row.page_url }))
    : previousSource.rows;
  const previousRows = samePageFilters(previousFiltered);
  const funnelConditions = ['metric_date BETWEEN $1 AND $2'];
  const funnelValues: unknown[] = [window.start, window.end];
  for (const [column, value] of Object.entries({ market: filters.market, locale: filters.locale, country: filters.country, device: filters.device, cluster: filters.cluster })) {
    if (value) { funnelValues.push(value); funnelConditions.push(`${column} = $${funnelValues.length}`); }
  }
  const clusterFunnelResult = await query(`SELECT cluster, SUM(organic_visitors)::int AS organic_visitors, SUM(focus_sessions + creator_previews)::int AS activations FROM seo_funnel_daily WHERE ${funnelConditions.join(' AND ')} GROUP BY cluster`, funnelValues);
  const clusterActivation = new Map(clusterFunnelResult.rows.map((row) => [String(row.cluster), number(row.organic_visitors) ? number(row.activations) / number(row.organic_visitors) : 0]));
  const activationValues = [...clusterActivation.values()].sort((a, b) => a - b);
  const bucketFor = (position: number | null) => !position ? '>50' : position <= 3 ? '1-3' : position <= 10 ? '4-10' : position <= 20 ? '11-20' : position <= 50 ? '21-50' : '>50';
  const ctrByBucket = new Map<string, number[]>();
  for (const page of pageRows) { const bucket = bucketFor(page.position); ctrByBucket.set(bucket, [...(ctrByBucket.get(bucket) || []), page.ctr]); }
  const median = (values: number[]) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0; };
  const splitIntentPages = new Set<string>();
  const queryGroups = new Map<string, typeof queryPages>();
  for (const row of queryPages) queryGroups.set(row.query, [...(queryGroups.get(row.query) || []), row]);
  for (const rows of queryGroups.values()) {
    const total = rows.reduce((sum, row) => sum + row.impressions, 0);
    const material = total ? rows.filter((row) => row.impressions / total >= 0.3) : [];
    if (material.length > 1) material.forEach((row) => splitIntentPages.add(row.page));
  }
  const eligibleLogImpressions = pageRows.filter((row) => row.impressions >= 50).map((row) => Math.log1p(row.impressions)).sort((a, b) => a - b);
  const medianImpressions = median(pageRows.map((row) => row.impressions));
  const medianActivation = median(activationValues);
  const opportunities = pageRows.map((row) => {
    if (row.impressions < 50) return { ...row, score: null, action: 'hold', reason: 'Insufficient data (<50 impressions).' };
    const logImpressions = Math.log1p(row.impressions);
    const impressionPercentile = eligibleLogImpressions.length
      ? eligibleLogImpressions.filter((value) => value <= logImpressions).length / eligibleLogImpressions.length * 100
      : 0;
    const rankOpportunity = row.position === null ? 0 : Math.max(0, Math.min(100, (50 - row.position) * 2));
    const medianCtr = median(ctrByBucket.get(bucketFor(row.position)) || []);
    const ctrGap = medianCtr ? Math.max(0, (medianCtr - row.ctr) / medianCtr) * 100 : 0;
    const activation = clusterActivation.get(row.cluster) || 0;
    const activationPercentile = activationValues.length ? activationValues.filter((value) => value <= activation).length / activationValues.length * 100 : 0;
    const score = Math.round(0.35 * impressionPercentile + 0.25 * rankOpportunity + 0.2 * ctrGap + 0.2 * activationPercentile);
    const action = splitIntentPages.has(row.page) ? 'merge/redirect'
      : score >= 70 ? 'update'
        : row.impressions >= medianImpressions && activation >= medianActivation ? 'expand' : 'hold';
    return { ...row, score, action, reason: action === 'merge/redirect' ? 'A query sends at least 30% of impressions to multiple pages.' : null };
  }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1)).slice(0, 20);
  const hasPageFilters = Boolean(filters.market || filters.locale || filters.country || filters.device || filters.cluster);
  const current = filters.brand && filters.brand !== 'all'
    ? aggregate(queryPages)
    : hasPageFilters ? aggregate(pageRows) : aggregate(currentSite.rows);
  const previous = filters.brand && filters.brand !== 'all'
    ? aggregate(previousRows)
    : hasPageFilters ? aggregate(previousRows) : aggregate(previousSite.rows);
  const exactFunnel = await exactFunnelPromise;
  const funnel = exactFunnel.data;
  const organicVisitors = funnel?.organicVisitors ?? null;
  const latestRun = runResult.rows[0] || null;
  const completedAt = latestRun?.completed_at ? new Date(latestRun.completed_at) : null;
  const connector = !latestRun ? { state: 'not_configured', message: 'No SEO ingestion run has been recorded.' }
    : latestRun.gsc_status === 'error' || latestRun.status === 'failed' ? { state: 'error', message: latestRun.error_message || 'SEO ingestion failed.' }
      : completedAt && Date.now() - completedAt.getTime() > 48 * 60 * 60 * 1000 ? { state: 'stale', message: 'Last successful SEO ingestion is older than 48 hours.' }
        : { state: 'connected', message: 'Aggregate data is sourced from the last ingestion run.' };
  const indexing = indexingResult.rows.map((row) => ({
    page: String(row.page_url), market: String(row.market), locale: String(row.locale),
    submittedAt: row.submitted_at || null, indexedState: String(row.indexed_state),
    declaredCanonical: row.declared_canonical || null, googleCanonical: row.google_canonical || null,
    lastCrawlAt: row.last_crawl_at || null, mobileResult: row.mobile_result || null,
    sitemapStatus: row.sitemap_status || null, robotsAllowed: row.robots_allowed,
    schemaStatus: row.schema_status || null, checkedAt: row.checked_at,
  })).filter((row) => (!filters.market || row.market === filters.market) && (!filters.locale || row.locale === filters.locale));
  const alerts: { kind: string; severity: 'warning' | 'error'; message: string; page?: string }[] = [];
  if (previous.clicks >= 20 && current.clicks < previous.clicks * 0.7 && previous.clicks - current.clicks >= 20) alerts.push({ kind: 'click_drop', severity: 'warning', message: `Clicks fell ${Math.round((1 - current.clicks / previous.clicks) * 100)}% (${previous.clicks - current.clicks} clicks) versus the previous period.` });
  if (connector.state === 'stale') alerts.push({ kind: 'connector_stale', severity: 'warning', message: 'SEO connector is stale by more than 48 hours.' });
  if (connector.state === 'error' || exactFunnel.state === 'error') alerts.push({ kind: 'ingestion_failed', severity: 'error', message: 'At least one SEO ingestion connector failed.' });
  for (const row of indexing) {
    if (row.declaredCanonical && row.googleCanonical && row.declaredCanonical !== row.googleCanonical) alerts.push({ kind: 'canonical_mismatch', severity: 'error', page: row.page, message: 'Google-selected canonical differs from the declared canonical.' });
    if (row.submittedAt && row.indexedState !== 'indexed' && Date.now() - new Date(row.submittedAt).getTime() > 14 * 86_400_000) alerts.push({ kind: 'beachhead_not_indexed', severity: 'warning', page: row.page, message: 'Submitted beachhead has not been indexed after 14 days.' });
  }
  return {
    connected: Boolean(latestRun), filters, scope: { pagePrefix: FLOW_PAGE_PREFIX, ...window },
    metrics: { ...current, previous, chart, previousChart,
      organicVisitors, qualifiedActivation: organicVisitors && funnel ? funnel.qualifiedActivations / organicVisitors : null,
      commercialConversion: organicVisitors && funnel ? funnel.activatedPro / organicVisitors : null,
      nonBrandShare: allQueryImpressions ? nonBrandImpressions / allQueryImpressions : null },
    pages: pageRows.slice(0, 100), queries, queryPages, countries: countryResult.rows.map((row) => ({ country: row.country, ...aggregate([row]) })), devices: deviceResult.rows.map((row) => ({ device: row.device, ...aggregate([row]) })),
    rankingBuckets: buckets, opportunities, funnel, indexing, alerts,
    funnelScope: funnel ? 'filtered' : 'unavailable_for_query_brand_filter',
    connector: { ...connector, posthogState: exactFunnel.state, lastSuccessfulSync: latestRun?.completed_at || null, lastCompleteDate: latestRun?.last_complete_date || null },
  };
}
