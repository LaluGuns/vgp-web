'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Search } from 'lucide-react';

type Metric = { clicks: number; impressions: number; ctr: number; position: number | null };
export type SeoDashboardData = {
  connected: boolean;
  filters: { days: number; market?: string; locale?: string; cluster?: string; brand?: string };
  scope: { start: string; end: string; previousStart: string; previousEnd: string };
  metrics: Metric & { previous: Metric; chart: { date: string; clicks: number; impressions: number }[]; previousChart: { date: string; clicks: number; impressions: number }[]; organicVisitors: number | null; qualifiedActivation: number | null; commercialConversion: number | null; nonBrandShare: number | null };
  pages: (Metric & { page: string; locale: string; market: string; cluster: string })[];
  queryPages: (Metric & { query: string; page: string; brand: boolean; locale: string })[];
  rankingBuckets: Record<string, number>;
  opportunities: (Metric & { page: string; score: number | null; action: string; reason?: string | null })[];
  countries: (Metric & { country: string })[];
  devices: (Metric & { device: string })[];
  funnel: { organicVisitors: number; qualifiedActivations: number; focusSessions: number; creatorPreviews: number; checkouts: number; activatedPro: number; creatorGrants: number; downloads: number } | null;
  funnelScope?: 'filtered' | 'unavailable_for_query_brand_filter';
  indexing: { page: string; market: string; locale: string; submittedAt: string | null; indexedState: string; declaredCanonical: string | null; googleCanonical: string | null; lastCrawlAt: string | null; mobileResult: string | null; sitemapStatus: string | null; robotsAllowed: boolean | null; schemaStatus: string | null; checkedAt: string }[];
  alerts: { kind: string; severity: 'warning' | 'error'; message: string; page?: string }[];
  connector: { state: 'connected' | 'not_configured' | 'error' | 'stale'; posthogState?: 'connected' | 'not_configured' | 'error'; message: string; lastSuccessfulSync: string | null; lastCompleteDate: string | null };
};

function percent(value: number | null | undefined) { return value === null || value === undefined ? '—' : `${(value * 100).toFixed(1)}%`; }
function delta(current: number, previous: number) { return previous ? `${((current - previous) / previous * 100).toFixed(1)}%` : '—'; }
function compact(value: number) { return new Intl.NumberFormat('en-US').format(value); }

export function SeoDashboard({ data, loading, error, onFilterChange, onRefresh }: {
  data: SeoDashboardData | null; loading: boolean; error: string | null;
  onFilterChange: (filters: URLSearchParams) => void; onRefresh: () => void;
}) {
  const [days, setDays] = useState('28');
  const [market, setMarket] = useState('');
  const [locale, setLocale] = useState('');
  const [cluster, setCluster] = useState('');
  const [brand, setBrand] = useState('all');
  const [country, setCountry] = useState('');
  const [device, setDevice] = useState('');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  useEffect(() => {
    const params = new URLSearchParams({ days, brand });
    if (market) params.set('market', market); if (locale) params.set('locale', locale); if (cluster) params.set('cluster', cluster); if (country) params.set('country', country.toLowerCase()); if (device) params.set('device', device.toUpperCase()); if (customStart && customEnd) { params.set('start', customStart); params.set('end', customEnd); }
    onFilterChange(params);
  }, [days, market, locale, cluster, brand, country, device, customStart, customEnd, onFilterChange]);

  if (loading && !data) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-sky-300" /></div>;
  if (error && !data) return <EmptyState title="SEO telemetry unavailable" detail={error} />;
  if (!data || !data.connected) return <EmptyState title="Search Console telemetry" detail={data?.connector.message || 'No ingestion run has been recorded. Configure server-only GSC credentials, apply the SEO analytics migration, then trigger the protected cron.'} />;
  const connectorTone = data.connector.state === 'connected' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200' : 'border-amber-500/25 bg-amber-500/5 text-amber-100';
  return <div className="space-y-6">
    <div className="liquid-glass rounded-lg p-4 sm:flex sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/55">Search growth controls</p><p className="mt-1 text-xs text-white/45">Current {data.scope.start}–{data.scope.end}; compares the preceding equal-length period.</p></div>
      <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
        <select aria-label="SEO period" value={days} onChange={(e) => setDays(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white"><option value="7">7 days</option><option value="28">28 days</option><option value="90">90 days</option></select>
        <input aria-label="SEO custom start" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white" />
        <input aria-label="SEO custom end" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white" />
        <select aria-label="SEO market" value={market} onChange={(e) => setMarket(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white"><option value="">All markets</option><option value="global-en">Global English</option><option value="global-es">Global Spanish</option><option value="ja-JP">Japan</option><option value="de-DE">Germany</option><option value="pt-BR">Brazil</option><option value="ko-KR">Korea</option></select>
        <select aria-label="SEO locale" value={locale} onChange={(e) => setLocale(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white"><option value="">All locales</option><option value="en">en</option><option value="es">es</option><option value="ja-JP">ja-JP</option><option value="de-DE">de-DE</option><option value="pt-BR">pt-BR</option><option value="ko-KR">ko-KR</option></select>
        <select aria-label="SEO cluster" value={cluster} onChange={(e) => setCluster(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white"><option value="">All clusters</option><option value="creator_music">Creator music</option><option value="deep_work">Deep work</option><option value="pomodoro_music">Pomodoro</option><option value="timer_preset">Timer presets</option></select>
        <input aria-label="SEO country code" value={country} onChange={(e) => setCountry(e.target.value.slice(0, 3))} placeholder="usa" className="w-20 rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white placeholder:text-white/35" />
        <select aria-label="SEO device" value={device} onChange={(e) => setDevice(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white"><option value="">All devices</option><option value="DESKTOP">Desktop</option><option value="MOBILE">Mobile</option><option value="TABLET">Tablet</option></select>
        <select aria-label="SEO brand filter" value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white"><option value="all">All queries</option><option value="non_brand">Non-brand</option><option value="brand">Brand</option></select>
        <button onClick={onRefresh} className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1.5 text-xs text-white/70 hover:text-white"><RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
      </div>
    </div>
    <div className={`rounded-lg border p-4 text-xs ${connectorTone}`}><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" /><div><strong className="text-white">Connector {data.connector.state}</strong><p className="mt-1 opacity-75">{data.connector.message} {data.connector.lastSuccessfulSync ? `Last sync: ${new Date(data.connector.lastSuccessfulSync).toLocaleString()}.` : ''}</p></div></div></div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3"><Kpi label="GSC clicks" value={compact(data.metrics.clicks)} note={delta(data.metrics.clicks, data.metrics.previous.clicks)} /><Kpi label="Impressions" value={compact(data.metrics.impressions)} note={delta(data.metrics.impressions, data.metrics.previous.impressions)} /><Kpi label="CTR" value={percent(data.metrics.ctr)} note={percent(data.metrics.previous.ctr)} /><Kpi label="Average position" value={data.metrics.position?.toFixed(1) || '—'} note={data.metrics.previous.position?.toFixed(1) || '—'} /><Kpi label="Organic uniques" value={data.metrics.organicVisitors === null ? '—' : compact(data.metrics.organicVisitors)} note="Exact PostHog range aggregate" /><Kpi label="Qualified activation" value={percent(data.metrics.qualifiedActivation)} note={`Commercial ${percent(data.metrics.commercialConversion)} · non-brand ${percent(data.metrics.nonBrandShare)}`} /></div>
    <div className="liquid-glass rounded-lg p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">Organic clicks trend</p><SeoTrendChart points={data.metrics.chart} previous={data.metrics.previousChart} /></div>
    <div className="grid gap-4 lg:grid-cols-3"><Panel title="Ranking buckets">{Object.entries(data.rankingBuckets).map(([bucket, count]) => <Row key={bucket} label={bucket} value={`${count} pages`} />)}</Panel><Panel title="Action queue">{data.opportunities.length ? data.opportunities.slice(0, 5).map((row) => <Row key={row.page} label={row.page.replace('https://flow.virzyguns.com', '')} value={`${row.score ?? '—'} · ${row.action}`} />) : <p className="text-xs text-white/40">No page rows are available yet.</p>}</Panel><Panel title="Data caveat"><p className="text-xs leading-relaxed text-white/55">GSC rows can be privacy-limited and truncated. Funnel metrics remain aggregate-only; no query is joined to a visitor or user. Noindex is never automated from this queue.</p></Panel></div>
    {data.alerts.length > 0 && <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] p-5"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200"><AlertTriangle className="h-4 w-4" />SEO alerts</p><div className="mt-3 space-y-2">{data.alerts.map((alert, index) => <p key={`${alert.kind}-${alert.page || index}`} className="text-xs text-white/65"><span className={alert.severity === 'error' ? 'text-rose-300' : 'text-amber-200'}>{alert.kind.replaceAll('_', ' ')}</span> · {alert.message}{alert.page ? ` ${alert.page.replace('https://flow.virzyguns.com', '')}` : ''}</p>)}</div></div>}
    <div className="liquid-glass rounded-lg p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">Indexing, canonical, crawl & schema health</p>{data.indexing.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{data.indexing.slice(0, 12).map((row) => <div key={row.page} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4"><p className="truncate text-xs font-medium text-white">{row.page.replace('https://flow.virzyguns.com', '')}</p><div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-white/45"><span>Index: <b className="text-white/70">{row.indexedState}</b></span><span>Sitemap: <b className="text-white/70">{row.sitemapStatus || 'unknown'}</b></span><span>Robots: <b className="text-white/70">{row.robotsAllowed === null ? 'unknown' : row.robotsAllowed ? 'allowed' : 'blocked'}</b></span><span>Schema: <b className="text-white/70">{row.schemaStatus || 'unknown'}</b></span></div></div>)}</div> : <p className="mt-3 text-xs leading-relaxed text-white/45">No provider evidence has been recorded yet. This remains empty until Gemini submits the sitemap, runs URL Inspection/mobile checks, and stores the returned evidence.</p>}</div>
    <MetricTable title="Page performance" rows={data.pages} first="Page" firstValue={(row) => row.page.replace('https://flow.virzyguns.com', '')} />
    <MetricTable title="Query to page mapping" rows={data.queryPages} first="Query" firstValue={(row) => `${row.query}${row.brand ? ' · brand' : ''}`} secondary={(row) => row.page.replace('https://flow.virzyguns.com', '')} />
  </div>;
}
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="liquid-glass-strong rounded-lg p-8 text-center"><Search className="mx-auto h-7 w-7 text-sky-200/70" /><h2 className="mt-4 font-display text-2xl font-semibold text-white">{title}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55">{detail}</p></div>; }
function Kpi({ label, value, note }: { label: string; value: string; note: string }) { return <div className="liquid-glass-soft rounded-lg p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">{label}</p><p className="mt-3 font-display text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-xs text-white/40">Previous: {note}</p></div>; }
function SeoTrendChart({ points, previous }: { points: { date: string; clicks: number }[]; previous: { date: string; clicks: number }[] }) { if (points.length < 2) return <p className="mt-6 text-sm text-white/40">No daily GSC trend rows yet.</p>; const max = Math.max(1, ...points.map((point) => point.clicks), ...previous.map((point) => point.clicks)); const line = (rows: { clicks: number }[]) => rows.length < 2 ? '' : rows.map((point, index) => `${(index / (rows.length - 1)) * 100},${100 - point.clicks / max * 100}`).join(' '); return <><div className="mt-3 flex gap-4 text-[11px] text-white/40"><span className="text-sky-200">— Current</span><span>┄ Previous period</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-3 h-36 w-full overflow-visible" role="img" aria-label="Current versus previous organic clicks trend">{previous.length > 1 && <polyline fill="none" stroke="rgba(255,255,255,.3)" strokeDasharray="4 4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" points={line(previous)} />}<polyline fill="none" stroke="rgb(125 211 252)" strokeWidth="2" vectorEffect="non-scaling-stroke" points={line(points)} /></svg><div className="mt-2 flex justify-between text-[11px] text-white/35"><span>{points[0].date}</span><span>{points.at(-1)?.date}</span></div></>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="liquid-glass rounded-lg p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">{title}</p><div className="mt-4 space-y-2">{children}</div></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3 text-xs"><span className="truncate text-white/60">{label}</span><span className="shrink-0 text-sky-200">{value}</span></div>; }
function MetricTable({ title, rows, first, firstValue, secondary }: { title: string; rows: (Metric & Record<string, unknown>)[]; first: string; firstValue: (row: any) => string; secondary?: (row: any) => string }) { return <div className="liquid-glass overflow-hidden rounded-lg"><div className="border-b border-white/[0.07] px-6 py-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">{title}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-white/[0.07] text-[11px] uppercase tracking-[0.12em] text-white/40"><th className="px-6 py-3">{first}</th><th className="px-6 py-3">Clicks</th><th className="px-6 py-3">Impressions</th><th className="px-6 py-3">CTR</th><th className="px-6 py-3">Position</th></tr></thead><tbody className="divide-y divide-white/[0.05] text-white/80">{rows.length ? rows.slice(0, 50).map((row, index) => <tr key={`${firstValue(row)}-${index}`}><td className="px-6 py-3"><p className="max-w-[360px] truncate font-medium text-white">{firstValue(row)}</p>{secondary && <p className="max-w-[360px] truncate text-xs text-white/40">{secondary(row)}</p>}</td><td className="px-6 py-3">{compact(row.clicks)}</td><td className="px-6 py-3 text-white/55">{compact(row.impressions)}</td><td className="px-6 py-3 text-sky-200">{percent(row.ctr)}</td><td className="px-6 py-3 text-amber-200">{row.position?.toFixed(1) || '—'}</td></tr>) : <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">No source rows for these filters.</td></tr>}</tbody></table></div></div>; }

export function OrganicFunnelPanel({ data, loading }: { data: SeoDashboardData | null; loading: boolean }) {
  if (loading && !data) return <div className="liquid-glass rounded-lg p-6 text-sm text-white/45">Loading aggregate organic funnel…</div>;
  if (!data || data.connector.posthogState === 'not_configured') return <div className="liquid-glass rounded-lg p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">Organic acquisition funnel</p><p className="mt-3 text-xs leading-relaxed text-white/50">PostHog aggregate reporting is not connected, or the brand-query filter is active. No funnel values are invented and search queries are never joined to users.</p></div>;
  if (data.connector.posthogState === 'error') return <div className="liquid-glass rounded-lg border border-amber-500/20 p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">Organic acquisition funnel</p><p className="mt-3 text-xs text-white/50">The latest PostHog aggregate sync failed. Existing values may be incomplete; check the SEO connector status before making a decision.</p></div>;

  if (!data.funnel) return <div className="liquid-glass rounded-lg p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">Organic acquisition funnel</p><p className="mt-3 text-xs text-white/50">No exact aggregate funnel is available for this filter combination.</p></div>;
  const funnel = data.funnel;
  const stages = [
    ['Organic visitors', funnel.organicVisitors],
    ['Focus session', funnel.focusSessions],
    ['Creator preview', funnel.creatorPreviews],
    ['Checkout', funnel.checkouts],
    ['Activated Pro', funnel.activatedPro],
  ] as const;
  return <div className="space-y-4">
    <div className="liquid-glass rounded-lg p-6">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200/55">Organic acquisition funnel</p><p className="mt-1 text-xs text-white/40">Aggregate only · no search query is joined to a person or PII.</p></div><p className="text-[11px] text-white/35">{data.scope.start}–{data.scope.end}</p></div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">{stages.map(([label, value]) => <div key={label} className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-4"><p className="text-[10px] uppercase tracking-[0.12em] text-white/40">{label}</p><p className="mt-2 font-display text-xl font-semibold text-white">{compact(value)}</p><p className="mt-1 text-[11px] text-sky-200/55">{funnel.organicVisitors ? percent(value / funnel.organicVisitors) : '—'} of organic</p></div>)}</div>
      <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/10 p-4 text-xs text-white/45">Creator grants: <span className="text-white/75">{compact(funnel.creatorGrants)}</span> · downloads: <span className="text-white/75">{compact(funnel.downloads)}</span>. These remain gated until the final legal package is approved and licensing is enabled.</div>
    </div>
    <div className="grid gap-4 md:grid-cols-2"><Panel title="Organic search countries">{data.countries.length ? data.countries.slice(0, 6).map((row) => <Row key={row.country} label={row.country?.toUpperCase() || 'Unknown'} value={`${compact(row.clicks)} clicks`} />) : <p className="text-xs text-white/40">No country rows yet.</p>}</Panel><Panel title="Organic search devices">{data.devices.length ? data.devices.map((row) => <Row key={row.device} label={row.device || 'Unknown'} value={`${compact(row.clicks)} clicks`} />) : <p className="text-xs text-white/40">No device rows yet.</p>}</Panel></div>
  </div>;
}
