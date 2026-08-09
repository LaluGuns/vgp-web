/*
 * Non-destructive follow-up migration for Root + Flow SEO telemetry.
 *
 * Run after scripts/migrate-seo-analytics.js. Existing rows are explicitly
 * backfilled as Flow because the previous ingestion was Flow-only.
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required to apply the SEO site-scope migration.");
  process.exit(1);
}

const hostname = new URL(databaseUrl).hostname;
const ssl = hostname.endsWith(".supabase.com")
  ? { ca: fs.readFileSync(path.join(__dirname, "../supabase-prod-ca-2021.crt"), "utf8"), rejectUnauthorized: true }
  : undefined;

const scopedTables = [
  ["seo_gsc_site_daily", ["metric_date", "search_type", "dimension_kind", "dimension_value"]],
  ["seo_gsc_page_daily", ["metric_date", "search_type", "page_url"]],
  ["seo_gsc_query_page_daily", ["metric_date", "search_type", "query", "page_url"]],
  ["seo_gsc_page_dimension_daily", ["metric_date", "search_type", "page_url", "country", "device"]],
  ["seo_gsc_query_page_dimension_daily", ["metric_date", "search_type", "query", "page_url", "country", "device"]],
  ["seo_funnel_daily", ["metric_date", "market", "locale", "country", "device", "cluster"]],
];

const quote = (value) => '"' + value.replace(/"/g, '""') + '"';

const sql = [
  ...scopedTables.flatMap(([table, key]) => [
    'ALTER TABLE ' + quote(table) + ' ADD COLUMN IF NOT EXISTS site_scope text NOT NULL DEFAULT \'flow\' CHECK (site_scope IN (\'root\', \'flow\'));',
    'ALTER TABLE ' + quote(table) + ' DROP CONSTRAINT IF EXISTS ' + quote(table + "_pkey") + ';',
    'ALTER TABLE ' + quote(table) + ' ADD CONSTRAINT ' + quote(table + "_pkey") + ' PRIMARY KEY (' + key.map(quote).concat(["site_scope"]).join(", ") + ');',
  ]),
  "ALTER TABLE seo_ingestion_runs ADD COLUMN IF NOT EXISTS site_scope text NOT NULL DEFAULT 'all' CHECK (site_scope IN ('root', 'flow', 'all'));",
  "ALTER TABLE seo_ingestion_runs ADD COLUMN IF NOT EXISTS property_uri text;",
  "CREATE INDEX IF NOT EXISTS idx_seo_gsc_site_scope_daily ON seo_gsc_site_daily (site_scope, metric_date DESC);",
  "CREATE INDEX IF NOT EXISTS idx_seo_gsc_page_scope_daily ON seo_gsc_page_daily (site_scope, metric_date DESC, page_url);",
  "CREATE INDEX IF NOT EXISTS idx_seo_gsc_query_page_scope_daily ON seo_gsc_query_page_daily (site_scope, metric_date DESC, query, page_url);",
  "CREATE INDEX IF NOT EXISTS idx_seo_funnel_scope_daily ON seo_funnel_daily (site_scope, metric_date DESC, market, locale);",
].join("\n");

const client = new Client({ connectionString: databaseUrl, ssl });
(async () => {
  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("SEO site-scope migration completed.");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("SEO site-scope migration failed:", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
