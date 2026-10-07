import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
