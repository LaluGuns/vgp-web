import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildLiveBeatDirectory,
    buildLiveIntelligenceSignals,
} from './live-view-model.ts';

test('live intelligence uses canonical counts and defers provider status to Settings', () => {
    const signals = buildLiveIntelligenceSignals(325, 2);
    const byId = Object.fromEntries(signals.map((signal) => [signal.id, signal]));

    assert.equal(byId.catalog.value, '325 tracks');
    assert.equal(byId.meta.value, 'Check Settings / live status');
    assert.equal(byId.tiktok.value, 'Check Settings / live status');
    assert.equal(byId.research.value, '2 canonical records');
    assert.equal(
        signals.some((signal) => signal.value === 'Not connected'),
        false,
    );
});

test('live intelligence shows an honest empty canonical baseline', () => {
    const signals = buildLiveIntelligenceSignals(-1, Number.NaN);
    const byId = Object.fromEntries(signals.map((signal) => [signal.id, signal]));

    assert.equal(byId.catalog.value, '0 tracks');
    assert.equal(byId.catalog.status, 'blocked');
    assert.equal(byId.research.value, 'No live records yet');
    assert.equal(byId.research.status, 'partial');
});

test('live beat directory resolves canonical ids, slugs, and track ids', () => {
    const catalog = [
        {
            id: 'beat-1',
            slug: 'night-drive',
            beatstarsTrackId: 'track-99',
            title: 'Night Drive',
            primaryGenre: 'Synthwave Trap',
            availability: 'available',
            offerVerification: 'product-page-active',
        },
    ];
    const directory = buildLiveBeatDirectory(
        ['beat-1', 'night-drive', 'track-99'],
        catalog,
    );

    assert.equal(directory['beat-1'].title, 'Night Drive');
    assert.equal(directory['night-drive'].href, '/studio/beats/night-drive');
    assert.equal(directory['track-99'].resolution, 'catalog');
    assert.match(directory['beat-1'].reason, /does not store a per-match rationale/);
});

test('live beat directory exposes unresolved ids without inventing an offer', () => {
    const directory = buildLiveBeatDirectory(['unknown-beat'], []);
    const unresolved = directory['unknown-beat'];

    assert.equal(unresolved.resolution, 'missing');
    assert.equal(unresolved.href, null);
    assert.match(unresolved.title, /Unresolved beat reference/);
    assert.match(unresolved.offerLabel, /No license or availability claim/);
});
