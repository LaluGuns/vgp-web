/*
 * Local-only, idempotent schema migration for the Founder SEO dashboard.
 * Run manually with `node scripts/migrate-seo-analytics.js`; this script never
 * runs during a web request or deployment.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required to apply the SEO analytics migration.');
  process.exit(1);
}

const hostname = new URL(databaseUrl).hostname;
const ssl = hostname.endsWith('.supabase.com')
  ? { ca: fs.readFileSync(path.join(__dirname, '../supabase-prod-ca-2021.crt'), 'utf8'), rejectUnauthorized: true }
  : undefined;

const sql = `
CREATE TABLE IF NOT EXISTS seo_gsc_site_daily (
  metric_date date NOT NULL,
  search_type text NOT NULL DEFAULT 'web',
  dimension_kind text NOT NULL DEFAULT 'all' CHECK (dimension_kind IN ('all', 'country', 'device')),
  dimension_value text NOT NULL DEFAULT '',
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  position_weighted numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (metric_date, search_type, dimension_kind, dimension_value)
);

CREATE TABLE IF NOT EXISTS seo_gsc_page_daily (
  metric_date date NOT NULL,
  search_type text NOT NULL DEFAULT 'web',
  page_url text NOT NULL,
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  position_weighted numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (metric_date, search_type, page_url)
);

CREATE TABLE IF NOT EXISTS seo_gsc_query_page_daily (
  metric_date date NOT NULL,
  search_type text NOT NULL DEFAULT 'web',
  query text NOT NULL,
  page_url text NOT NULL,
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  position_weighted numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (metric_date, search_type, query, page_url)
);

-- Dimensioned data is kept separate from the canonical page/query-page totals
-- so country/device rollups never double-count the dashboard headline metrics.
CREATE TABLE IF NOT EXISTS seo_gsc_page_dimension_daily (
  metric_date date NOT NULL,
  search_type text NOT NULL DEFAULT 'web',
  page_url text NOT NULL,
  country text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  position_weighted numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (metric_date, search_type, page_url, country, device)
);

CREATE TABLE IF NOT EXISTS seo_gsc_query_page_dimension_daily (
  metric_date date NOT NULL,
  search_type text NOT NULL DEFAULT 'web',
  query text NOT NULL,
  page_url text NOT NULL,
  country text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  clicks integer NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  impressions integer NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  position_weighted numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (metric_date, search_type, query, page_url, country, device)
);

-- Existing local installs may have the earlier country-only grain.
ALTER TABLE seo_gsc_query_page_dimension_daily ADD COLUMN IF NOT EXISTS device text NOT NULL DEFAULT '';
ALTER TABLE seo_gsc_query_page_dimension_daily DROP CONSTRAINT IF EXISTS seo_gsc_query_page_dimension_daily_pkey;
ALTER TABLE seo_gsc_query_page_dimension_daily ADD PRIMARY KEY (metric_date, search_type, query, page_url, country, device);

CREATE TABLE IF NOT EXISTS seo_funnel_daily (
  metric_date date NOT NULL,
  market text NOT NULL DEFAULT 'unknown',
  locale text NOT NULL DEFAULT 'unknown',
  country text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  cluster text NOT NULL DEFAULT 'product',
  organic_visitors integer NOT NULL DEFAULT 0 CHECK (organic_visitors >= 0),
  focus_sessions integer NOT NULL DEFAULT 0 CHECK (focus_sessions >= 0),
  creator_previews integer NOT NULL DEFAULT 0 CHECK (creator_previews >= 0),
  checkouts integer NOT NULL DEFAULT 0 CHECK (checkouts >= 0),
  activated_pro integer NOT NULL DEFAULT 0 CHECK (activated_pro >= 0),
  creator_grants integer NOT NULL DEFAULT 0 CHECK (creator_grants >= 0),
  downloads integer NOT NULL DEFAULT 0 CHECK (downloads >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (metric_date, market, locale, country, device, cluster)
);

CREATE TABLE IF NOT EXISTS seo_ingestion_runs (
  id uuid PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  status text NOT NULL CHECK (status IN ('running', 'succeeded', 'failed', 'skipped')),
  gsc_status text NOT NULL DEFAULT 'not_configured',
  posthog_status text NOT NULL DEFAULT 'not_configured',
  last_complete_date date,
  error_message text,
  rows_written integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Provider evidence is written only by the deployment/operator workflow after
-- sitemap submission or URL Inspection. The application never fabricates it.
CREATE TABLE IF NOT EXISTS seo_indexing_evidence (
  page_url text PRIMARY KEY,
  market text NOT NULL,
  locale text NOT NULL,
  submitted_at timestamptz,
  indexed_state text NOT NULL DEFAULT 'unknown',
  declared_canonical text,
  google_canonical text,
  last_crawl_at timestamptz,
  mobile_result text,
  sitemap_status text,
  robots_allowed boolean,
  schema_status text,
  checked_at timestamptz NOT NULL DEFAULT now(),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS seo_ingestion_locks (
  lock_name text PRIMARY KEY,
  run_id uuid NOT NULL,
  locked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_page_daily_range ON seo_gsc_page_daily (metric_date DESC, search_type);
CREATE INDEX IF NOT EXISTS idx_seo_query_page_daily_range ON seo_gsc_query_page_daily (metric_date DESC, search_type);
CREATE INDEX IF NOT EXISTS idx_seo_page_dimension_daily_filter ON seo_gsc_page_dimension_daily (metric_date DESC, country, device);
CREATE INDEX IF NOT EXISTS idx_seo_query_page_dimension_daily_filter ON seo_gsc_query_page_dimension_daily (metric_date DESC, country);
CREATE INDEX IF NOT EXISTS idx_seo_funnel_daily_range ON seo_funnel_daily (metric_date DESC, market, locale);
CREATE INDEX IF NOT EXISTS idx_seo_indexing_evidence_checked ON seo_indexing_evidence (checked_at DESC, market, locale);
ALTER TABLE seo_gsc_site_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_gsc_page_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_gsc_query_page_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_gsc_page_dimension_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_gsc_query_page_dimension_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_funnel_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_ingestion_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_indexing_evidence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE seo_gsc_site_daily, seo_gsc_page_daily, seo_gsc_query_page_daily,
  seo_gsc_page_dimension_daily, seo_gsc_query_page_dimension_daily, seo_funnel_daily,
  seo_ingestion_runs, seo_ingestion_locks, seo_indexing_evidence FROM anon, authenticated;
`;

(async () => {
  const client = new Client({ connectionString: databaseUrl, ssl });
  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SEO analytics migration completed.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('SEO analytics migration failed:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
