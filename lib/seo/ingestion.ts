import crypto from 'crypto';
import { query, withTransaction } from '@/lib/db';
import type { PoolClient } from 'pg';
import { GSC_ROW_LIMIT, daysToBackfill, normalizePostHogFunnelRow, shouldRequestNextGscPage } from './ingestion-utils';
export { GSC_ROW_LIMIT, daysToBackfill, normalizePostHogFunnelRow, shouldRequestNextGscPage } from './ingestion-utils';

const FLOW_PAGE_PREFIX = 'https://flow.virzyguns.com/';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GSC_PROPERTY = process.env.GSC_SITE_URL || 'sc-domain:virzyguns.com';

type GscRow = { keys?: string[]; clicks?: number; impressions?: number; position?: number };
type ServiceAccount = { client_email: string; private_key: string };
export type ConnectorStatus = 'connected' | 'not_configured' | 'error';
export type IngestionResult = { status: ConnectorStatus; rowsWritten: number; error?: string };


function conciseError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown connector error';
  return message.replace(/[\r\n]+/g, ' ').slice(0, 400);
}

function parseServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.client_email || !parsed.private_key) throw new Error('missing client_email or private_key');
    return parsed;
  } catch {
    // Do not "repair" malformed secrets: a corrected string might silently
    // authenticate a different key. The operator must provide raw JSON.
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must contain valid, unescaped raw service-account JSON.');
  }
}

async function getAccessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({ iss: account.client_email, scope: GSC_SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })).toString('base64url');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${signer.sign(account.private_key, 'base64url')}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!response.ok) throw new Error(`GSC OAuth token exchange returned ${response.status}.`);
  const json = await response.json() as { access_token?: string };
  if (!json.access_token) throw new Error('GSC OAuth response did not include an access token.');
  return json.access_token;
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
    if (response.ok || (response.status !== 429 && response.status < 500)) return response;
    lastResponse = response;
    await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  return lastResponse!;
}

async function queryAll(token: string, metricDate: string, dimensions: string[]): Promise<GscRow[]> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_PROPERTY)}/searchAnalytics/query`;
  const rows: GscRow[] = [];
  for (let startRow = 0; ; startRow += GSC_ROW_LIMIT) {
    const response = await fetchWithRetry(url, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: metricDate, endDate: metricDate, searchType: 'web', dimensions,
        rowLimit: GSC_ROW_LIMIT, startRow,
        dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'contains', expression: FLOW_PAGE_PREFIX }] }],
      }),
    });
    if (!response.ok) throw new Error(`GSC Search Analytics returned ${response.status}.`);
    const json = await response.json() as { rows?: GscRow[] };
    const page = json.rows || [];
    rows.push(...page);
    if (!shouldRequestNextGscPage(page.length)) return rows;
  }
}

const n = (value: number | undefined) => Number(value) || 0;
const weighted = (row: GscRow) => n(row.position) * n(row.impressions);

type GscDay = { totals: GscRow[]; pages: GscRow[]; queryPages: GscRow[]; countries: GscRow[]; devices: GscRow[]; pageDimensions: GscRow[]; queryPageDimensions: GscRow[] };
export async function fetchGscDay(token: string, date: string): Promise<GscDay> {
  const [totals, pages, queryPages, countries, devices, pageDimensions, queryPageDimensions] = await Promise.all([
    queryAll(token, date, []), queryAll(token, date, ['page']), queryAll(token, date, ['query', 'page']),
    queryAll(token, date, ['country']), queryAll(token, date, ['device']), queryAll(token, date, ['page', 'country', 'device']), queryAll(token, date, ['query', 'page', 'country', 'device']),
  ]);
  return { totals, pages, queryPages, countries, devices, pageDimensions, queryPageDimensions };
}

async function upsertGscDay(client: PoolClient, date: string, data: GscDay): Promise<number> {
  const { totals, pages, queryPages, countries, devices, pageDimensions, queryPageDimensions } = data;
  let written = 0;
  const insert = async (sql: string, values: unknown[]) => { await client.query(sql, values); written++; };
  for (const row of totals) await insert(
    `INSERT INTO seo_gsc_site_daily (metric_date, dimension_kind, dimension_value, clicks, impressions, position_weighted)
     VALUES ($1, 'all', '', $2, $3, $4) ON CONFLICT (metric_date, search_type, dimension_kind, dimension_value)
     DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, position_weighted=EXCLUDED.position_weighted, updated_at=now()`,
    [date, n(row.clicks), n(row.impressions), weighted(row)]);
  for (const [kind, rows] of [['country', countries], ['device', devices]] as const) for (const row of rows) await insert(
    `INSERT INTO seo_gsc_site_daily (metric_date, dimension_kind, dimension_value, clicks, impressions, position_weighted)
     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (metric_date, search_type, dimension_kind, dimension_value)
     DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, position_weighted=EXCLUDED.position_weighted, updated_at=now()`,
    [date, kind, row.keys?.[0] || '', n(row.clicks), n(row.impressions), weighted(row)]);
  for (const row of pages) await insert(
    `INSERT INTO seo_gsc_page_daily (metric_date, page_url, clicks, impressions, position_weighted)
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (metric_date, search_type, page_url)
     DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, position_weighted=EXCLUDED.position_weighted, updated_at=now()`,
    [date, row.keys?.[0] || '', n(row.clicks), n(row.impressions), weighted(row)]);
  for (const row of queryPages) await insert(
    `INSERT INTO seo_gsc_query_page_daily (metric_date, query, page_url, clicks, impressions, position_weighted)
     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (metric_date, search_type, query, page_url)
     DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, position_weighted=EXCLUDED.position_weighted, updated_at=now()`,
    [date, row.keys?.[0] || '', row.keys?.[1] || '', n(row.clicks), n(row.impressions), weighted(row)]);
  for (const row of pageDimensions) await insert(
    `INSERT INTO seo_gsc_page_dimension_daily (metric_date, page_url, country, device, clicks, impressions, position_weighted)
     VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (metric_date, search_type, page_url, country, device)
     DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, position_weighted=EXCLUDED.position_weighted, updated_at=now()`,
    [date, row.keys?.[0] || '', row.keys?.[1] || '', row.keys?.[2] || '', n(row.clicks), n(row.impressions), weighted(row)]);
  for (const row of queryPageDimensions) await insert(
    `INSERT INTO seo_gsc_query_page_dimension_daily (metric_date, query, page_url, country, device, clicks, impressions, position_weighted)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (metric_date, search_type, query, page_url, country, device)
     DO UPDATE SET clicks=EXCLUDED.clicks, impressions=EXCLUDED.impressions, position_weighted=EXCLUDED.position_weighted, updated_at=now()`,
    [date, row.keys?.[0] || '', row.keys?.[1] || '', row.keys?.[2] || '', row.keys?.[3] || '', n(row.clicks), n(row.impressions), weighted(row)]);
  return written;
}

type PostHogFunnelRow = { dimensions: [string, string, string, string, string]; metrics: number[] };

async function fetchPostHogFunnelDay(date: string): Promise<{ result: IngestionResult; rows: PostHogFunnelRow[] }> {
  if (!process.env.POSTHOG_PERSONAL_API_KEY) return { result: { status: 'not_configured', rowsWritten: 0 }, rows: [] };
  const projectId = process.env.POSTHOG_PROJECT_ID || '511095';
  const host = (process.env.POSTHOG_QUERY_HOST || 'https://us.posthog.com').replace(/\/$/, '');
  const queryText = `SELECT
    coalesce(nullIf(toString(properties.market), ''), 'unknown') AS market,
    coalesce(nullIf(toString(properties.locale), ''), 'unknown') AS locale,
    coalesce(nullIf(toString(properties.$geoip_country_code), ''), '') AS country,
    coalesce(nullIf(toString(properties.$device_type), ''), '') AS device,
    coalesce(nullIf(toString(properties.cluster), ''), 'product') AS cluster,
    uniqIf(distinct_id, event = '$pageview' AND properties.session_acquisition = 'organic' AND properties.is_bot = false AND properties.is_staff = false) AS organic_visitors,
    uniqIf(distinct_id, event = 'session_started' AND properties.session_acquisition = 'organic') AS focus_sessions,
    uniqIf(distinct_id, event = 'creator_track_previewed' AND properties.session_acquisition = 'organic') AS creator_previews,
    uniqIf(distinct_id, event = 'checkout_started' AND properties.session_acquisition = 'organic') AS checkouts,
    uniqIf(distinct_id, event = 'subscription_activated' AND properties.session_acquisition = 'organic') AS activated_pro,
    uniqIf(distinct_id, event = 'creator_license_granted' AND properties.session_acquisition = 'organic') AS creator_grants,
    uniqIf(distinct_id, event = 'creator_track_downloaded' AND properties.session_acquisition = 'organic') AS downloads
    FROM events WHERE timestamp >= toDateTime('${date} 00:00:00') AND timestamp < toDateTime('${date} 00:00:00') + INTERVAL 1 DAY
    GROUP BY market, locale, country, device, cluster`;
  try {
    const response = await fetch(`${host}/api/projects/${projectId}/query/`, { method: 'POST', headers: { Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: { kind: 'HogQLQuery', query: queryText } }), signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`PostHog Query API returned ${response.status}.`);
    const payload = await response.json() as { results?: unknown[][] };
    const rows = (payload.results || []).map(normalizePostHogFunnelRow);
    return { result: { status: 'connected', rowsWritten: rows.length }, rows };
  } catch (error) { return { result: { status: 'error', rowsWritten: 0, error: conciseError(error) }, rows: [] }; }
}

async function upsertPostHogFunnelDay(client: PoolClient, date: string, rows: PostHogFunnelRow[]): Promise<number> {
  let rowsWritten = 0;
  for (const row of rows) {
      await client.query(`INSERT INTO seo_funnel_daily (metric_date, market, locale, country, device, cluster, organic_visitors, focus_sessions, creator_previews, checkouts, activated_pro, creator_grants, downloads)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (metric_date, market, locale, country, device, cluster)
        DO UPDATE SET organic_visitors=EXCLUDED.organic_visitors, focus_sessions=EXCLUDED.focus_sessions, creator_previews=EXCLUDED.creator_previews, checkouts=EXCLUDED.checkouts, activated_pro=EXCLUDED.activated_pro, creator_grants=EXCLUDED.creator_grants, downloads=EXCLUDED.downloads, updated_at=now()`, [date, ...row.dimensions, ...row.metrics]);
      rowsWritten++;
  }
  return rowsWritten;
}

export async function runSeoIngestion(): Promise<{ skipped?: boolean; gsc: IngestionResult; posthog: IngestionResult; rowsWritten: number }> {
  const runId = crypto.randomUUID();
  const claimed = await withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO seo_ingestion_locks (lock_name, run_id, locked_at) VALUES ('seo-ingest', $1, now())
       ON CONFLICT (lock_name) DO UPDATE SET run_id=EXCLUDED.run_id, locked_at=EXCLUDED.locked_at
       WHERE seo_ingestion_locks.locked_at < now() - interval '20 minutes' RETURNING run_id`, [runId]);
    return Boolean(result.rowCount);
  });
  if (!claimed) return { skipped: true, gsc: { status: 'connected', rowsWritten: 0 }, posthog: { status: 'not_configured', rowsWritten: 0 }, rowsWritten: 0 };
  let gsc: IngestionResult = { status: 'not_configured', rowsWritten: 0 };
  let posthog: IngestionResult = { status: 'not_configured', rowsWritten: 0 };
  let rowsWritten = 0;
  try {
    await query(`INSERT INTO seo_ingestion_runs (id, status, gsc_status, posthog_status) VALUES ($1, 'running', 'not_configured', 'not_configured')`, [runId]);
    try {
      const account = parseServiceAccount();
      if (account) {
        const token = await getAccessToken(account);
        for (const date of daysToBackfill()) {
          const data = await fetchGscDay(token, date); // no database transaction/connection during HTTP fetch
          gsc.rowsWritten += await withTransaction((client) => upsertGscDay(client, date, data));
        }
        gsc.status = 'connected';
      }
    } catch (error) {
      gsc = { status: 'error', rowsWritten: gsc.rowsWritten, error: conciseError(error) };
    }
    for (const date of daysToBackfill()) {
      const fetched = await fetchPostHogFunnelDay(date); // fetch occurs before the short DB upsert transaction
      posthog = fetched.result;
      if (posthog.status === 'connected') posthog.rowsWritten = await withTransaction((client) => upsertPostHogFunnelDay(client, date, fetched.rows));
      if (posthog.status === 'error' || posthog.status === 'not_configured') break;
      rowsWritten += posthog.rowsWritten;
    }
    rowsWritten += gsc.rowsWritten;
    const status = gsc.status === 'error' && posthog.status === 'error' ? 'failed' : 'succeeded';
    const errorMessage = [gsc.error, posthog.error].filter(Boolean).join(' | ') || null;
    await query(`UPDATE seo_ingestion_runs SET status=$2, completed_at=now(), rows_written=$3, gsc_status=$4, posthog_status=$5, last_complete_date=$6, error_message=$7 WHERE id=$1`, [runId, status, rowsWritten, gsc.status, posthog.status, daysToBackfill()[0], errorMessage]);
    return { gsc, posthog, rowsWritten };
  } catch (error) {
    const message = conciseError(error);
    gsc = gsc.status === 'not_configured' ? { status: 'error', rowsWritten: gsc.rowsWritten, error: message } : gsc;
    await query(`UPDATE seo_ingestion_runs SET status='failed', completed_at=now(), rows_written=$2, gsc_status=$3, posthog_status=$4, error_message=$5 WHERE id=$1`, [runId, rowsWritten, gsc.status, posthog.status, message]).catch(() => {});
    return { gsc, posthog, rowsWritten };
  } finally {
    await query(`DELETE FROM seo_ingestion_locks WHERE lock_name='seo-ingest' AND run_id=$1`, [runId]).catch(() => {});
  }
}
