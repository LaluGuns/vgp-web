import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('CADENZ registry keeps all selectors but only six indexable routes', () => {
  const source = fs.readFileSync('lib/organic-discovery/cadenz.ts', 'utf8');
  assert.match(source, /CADENZ_BPM_COVERAGE = \[130, 135, 140, 145, 150, 155, 160, 165, 170, 175, 180\]/);
  assert.match(source, /CADENZ_INDEXABLE_BPMS = \[180, 170, 165, 175, 160, 150\]/);
  const sitemap = fs.readFileSync('app/sitemap.ts', 'utf8');
  assert.match(sitemap, /CADENZ_HUB_PATH/);
  assert.match(sitemap, /CADENZ_INDEXABLE_BPMS/);
});

test('Flow pilots are English-only and runtime contract is 162', () => {
  const registry = fs.readFileSync('flowstate/lib/marketing/seo-registry.ts', 'utf8');
  assert.match(registry, /path: "work-music"/);
  assert.match(registry, /path: "coding-music"/);
  assert.match(registry, /releaseLocales: \["en"\]/);
  const crawl = fs.readFileSync('flowstate/scripts/release/runtime-seo-crawl.mjs', 'utf8');
  assert.match(crawl, /EXPECTED_INDEXABLE_URLS = 162/);
});

test('organic analytics payload has required shared dimensions and no automatic pageview', () => {
  const route = fs.readFileSync('app/api/analytics/organic/route.ts', 'utf8');
  for (const field of ['site_scope', 'funnel', 'route_key', 'locale', 'intent', 'bpm', 'destination_type', 'source_position']) assert.match(route, new RegExp(field));
  assert.doesNotMatch(route, /capture_pageview/);
});
