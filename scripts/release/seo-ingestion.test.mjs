import assert from 'node:assert/strict';
import test from 'node:test';
import { daysToBackfill, normalizePostHogFunnelRow, shouldRequestNextGscPage } from '../../lib/seo/ingestion-utils.ts';

test('GSC pagination only continues after a complete 25k page', () => {
  assert.equal(shouldRequestNextGscPage(24_999), false);
  assert.equal(shouldRequestNextGscPage(25_000), true);
});

test('backfill is seven finalized UTC dates, newest first', () => {
  const dates = daysToBackfill(new Date('2026-07-19T12:00:00.000Z'));
  assert.deepEqual(dates, ['2026-07-16', '2026-07-15', '2026-07-14', '2026-07-13', '2026-07-12', '2026-07-11', '2026-07-10']);
});

test('PostHog funnel dimensions preserve empty strings instead of coercing them to zero', () => {
  const result = normalizePostHogFunnelRow(['global-en', 'en', '', '', 'product', '4', null]);
  assert.deepEqual(result.dimensions, ['global-en', 'en', '', '', 'product']);
  assert.deepEqual(result.metrics, [4, 0]);
});
