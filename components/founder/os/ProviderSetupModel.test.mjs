import test from 'node:test';
import assert from 'node:assert/strict';
import {
    parseProviderStatusPayload,
    providerStatusesFromSnapshot,
} from './ProviderSetupModel.ts';

test('snapshot provider state never enables OAuth without a live check', () => {
    const providers = providerStatusesFromSnapshot({
        meta: 'configured',
        tiktok: 'not-connected',
    });

    assert.equal(providers.meta.status, 'configured');
    assert.equal(providers.meta.configured, true);
    assert.equal(providers.meta.oauthAvailable, false);
    assert.equal(providers.meta.source, 'snapshot');
    assert.equal(providers.tiktok.oauthAvailable, false);
});

test('live configured state enables OAuth but does not invent capabilities', () => {
    const fallback = providerStatusesFromSnapshot({
        meta: 'not-connected',
        tiktok: 'not-connected',
    });
    const result = parseProviderStatusPayload(
        {
            providers: {
                meta: {
                    status: 'not-connected',
                    configured: true,
                    oauthAvailable: true,
                    lastCheckedAt: '2026-07-29T08:00:00.000Z',
                },
                tiktok: {
                    status: 'not-connected',
                    configured: true,
                    oauthAvailable: true,
                },
            },
        },
        fallback,
    );

    assert.equal(result.recognizedProviders, 2);
    assert.equal(result.providers.meta.source, 'live');
    assert.equal(result.providers.meta.oauthAvailable, true);
    assert.equal(
        result.providers.meta.capabilities.find(({ id }) => id === 'owned-analytics')
            ?.state,
        'not-connected',
    );
    assert.equal(
        result.providers.tiktok.capabilities.find(({ id }) => id === 'direct-post-init')
            ?.state,
        'disabled',
    );
});

test('explicit provider capability states are kept while cold outbound stays manual-only', () => {
    const fallback = providerStatusesFromSnapshot({
        meta: 'not-connected',
        tiktok: 'not-connected',
    });
    const result = parseProviderStatusPayload(
        {
            data: {
                providers: {
                    meta: {
                        status: 'connected',
                        configured: true,
                        accountLabel: '@vgp.official',
                        lastCheckedAt: '2026-07-29T08:00:00.000Z',
                        metrics: { views: 999999 },
                        capabilities: [
                            {
                                id: 'owned-analytics',
                                state: 'available',
                                detail: 'Confirmed by the provider scope check.',
                            },
                            {
                                id: 'inbound-reply',
                                state: 'missing-scope',
                            },
                            {
                                id: 'cold-outbound-dm',
                                label: 'Cold outbound DM',
                                state: 'available',
                            },
                        ],
                    },
                },
            },
        },
        fallback,
    );

    const meta = result.providers.meta;
    assert.equal(result.recognizedProviders, 1);
    assert.equal(meta.status, 'connected');
    assert.equal(meta.accountLabel, '@vgp.official');
    assert.equal(
        meta.capabilities.find(({ id }) => id === 'owned-analytics')?.state,
        'available',
    );
    assert.equal(
        meta.capabilities.find(({ id }) => id === 'inbound-reply')?.state,
        'missing-scope',
    );
    assert.equal(
        meta.capabilities.find(({ id }) => id === 'cold-outbound-dm')?.state,
        'manual-only',
    );
    assert.equal(Object.hasOwn(meta, 'metrics'), false);
    assert.equal(result.providers.tiktok.source, 'snapshot');
    assert.equal(result.providers.tiktok.oauthAvailable, false);
});

test('malformed or unrelated status payload fails closed to the snapshot', () => {
    const fallback = providerStatusesFromSnapshot({
        meta: 'not-connected',
        tiktok: 'error',
    });
    const result = parseProviderStatusPayload(
        {
            providers: {
                youtube: { status: 'connected' },
                meta: 'connected',
            },
        },
        fallback,
    );

    assert.equal(result.recognizedProviders, 0);
    assert.deepEqual(result.providers, fallback);
    assert.equal(result.providers.meta.oauthAvailable, false);
    assert.equal(result.providers.tiktok.status, 'error');
});

test('capability object maps and nested provider errors are parsed defensively', () => {
    const fallback = providerStatusesFromSnapshot({
        meta: 'not-connected',
        tiktok: 'not-connected',
    });
    const result = parseProviderStatusPayload(
        {
            tiktok: {
                configured: true,
                error: { message: 'Provider token was revoked.' },
                capabilities: {
                    'owned-analytics': {
                        label: 'Owned insights',
                        state: 'error',
                        reason: 'Reconnect the account.',
                    },
                    'draft-init': 'missing-scope',
                    unexpected: 'made-up-state',
                },
            },
        },
        fallback,
    );

    const tiktok = result.providers.tiktok;
    assert.equal(result.recognizedProviders, 1);
    assert.equal(tiktok.status, 'error');
    assert.equal(tiktok.error, 'Provider token was revoked.');
    assert.equal(
        tiktok.capabilities.find(({ id }) => id === 'draft-init')?.state,
        'missing-scope',
    );
    assert.equal(
        tiktok.capabilities.some(({ id }) => id === 'unexpected'),
        false,
    );
});
