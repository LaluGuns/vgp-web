import test from 'node:test';
import assert from 'node:assert/strict';
import { extractBpm, parseCsv, renderCsv } from './generate-pack.mjs';

test('CSV parser preserves Luna store and LUNA Q artist identities', () => {
  const rows = parseCsv('"Date Inserted","Sale Month","Store","Artist","Title"\n"2026-08-01","2026-06","Luna","Virzy Guns","Cadence"\n"2026-08-01","2026-06","YouTube (Red)","LUNA Q","Single"');
  assert.equal(rows[0].Store, 'Luna');
  assert.equal(rows[0].Artist, 'Virzy Guns');
  assert.equal(rows[1].Artist, 'LUNA Q');
  assert.notEqual(rows[0].Store, rows[1].Artist);
});

test('Sale Month and Date Inserted remain separate fields', () => {
  const rows = parseCsv('"Date Inserted","Sale Month","Quantity"\n"2026-08-01","2026-06","1"');
  assert.equal(rows[0]['Sale Month'], '2026-06');
  assert.equal(rows[0]['Date Inserted'], '2026-08-01');
  assert.notEqual(rows[0]['Sale Month'], rows[0]['Date Inserted']);
});

test('BPM parser only accepts one explicit BPM or SPM token', () => {
  assert.equal(extractBpm('180 SPM Running Cadence'), 180);
  assert.equal(extractBpm('165 BPM Running Music'), 165);
  assert.equal(extractBpm('Running Music'), null);
  assert.equal(extractBpm('180 BPM / 170 BPM Mix'), null);
});

test('CSV renderer is deterministic and escapes commas', () => {
  const csv = renderCsv([{ value: 'a,b', tier: 'B' }], ['value', 'tier']);
  assert.equal(csv, 'value,tier\n"a,b",B\n');
});
