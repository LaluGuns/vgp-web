import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { authorizeCustomGptAction } from '../../lib/founder-os/gpt-action-auth.ts';
import { customGptProspectInputSchema } from '../../lib/founder-os/leads/action-validation.ts';

test('Custom GPT bearer auth fails closed and accepts only the configured key', () => {
    const previous = process.env.FOUNDER_OS_GPT_ACTION_SECRET;
    process.env.FOUNDER_OS_GPT_ACTION_SECRET = 'a'.repeat(64);
    try {
        assert.deepEqual(authorizeCustomGptAction(new Headers()), {
            ok: false,
            status: 401,
            code: 'UNAUTHORIZED',
        });
        assert.deepEqual(
            authorizeCustomGptAction(new Headers({
                authorization: `Bearer ${'b'.repeat(64)}`,
            })),
            { ok: false, status: 401, code: 'UNAUTHORIZED' }
        );
        assert.deepEqual(
            authorizeCustomGptAction(new Headers({
                authorization: `Bearer ${'a'.repeat(64)}`,
            })),
            { ok: true }
        );
    } finally {
        if (previous === undefined) {
            delete process.env.FOUNDER_OS_GPT_ACTION_SECRET;
        } else {
            process.env.FOUNDER_OS_GPT_ACTION_SECRET = previous;
        }
    }
});

test('prospect handoff requires public evidence and never accepts inferred contact origin', () => {
    const candidate = {
        requestKey: 'prospect-demo-001',
        displayName: 'Evidence Artist',
        handle: '@evidenceartist',
        segment: 'rapper',
        market: 'en-US',
        platform: 'youtube',
        profileUrl: 'https://example.com/artist',
        contact: {
            businessEmail: null,
            permission: 'manual-only',
            sourceEvidenceKey: null,
            origin: 'source-provided',
        },
        evidence: [{
            key: 'profile',
            label: 'Public artist page',
            url: 'https://example.com/artist',
            observedAt: '2026-07-29T10:00:00.000Z',
        }],
        qualificationSignals: {
            audienceFit: {
                strength: 'medium',
                evidenceKeys: ['profile'],
                note: 'Public release activity matches the target audience.',
            },
            styleFit: {
                strength: 'high',
                evidenceKeys: ['profile'],
                note: 'Recent music uses a compatible dark trap direction.',
            },
            purchaseIntent: {
                strength: 'none',
                evidenceKeys: [],
                note: null,
            },
        },
        beatMatches: [],
    };
    assert.equal(customGptProspectInputSchema.safeParse(candidate).success, true);
    assert.equal(
        customGptProspectInputSchema.safeParse({
            ...candidate,
            contact: { ...candidate.contact, origin: 'inferred' },
        }).success,
        false
    );
    assert.equal(
        customGptProspectInputSchema.safeParse({
            ...candidate,
            evidence: [{ ...candidate.evidence[0], url: 'http://example.com' }],
        }).success,
        false
    );
});

test('action surface is draft-only and TikTok requires founder-confirmed upload', async () => {
    const spec = await readFile(
        new URL('../../docs/founder-os/custom-gpt-action.openapi.yaml', import.meta.url),
        'utf8'
    );
    const validationSource = await readFile(
        new URL('../../lib/founder-os/validation.ts', import.meta.url),
        'utf8'
    );
    assert.match(spec, /Creates DRAFT only/);
    assert.doesNotMatch(spec, /operationId:\s*(approve|execute|publish|send)/i);
    assert.match(spec, /operationId: submitScoutedProspect/);
    assert.match(spec, /operationId: searchFounderBeatCatalog/);
    assert.match(
        validationSource,
        /founderConfirmedUpload:\s*z\.literal\(true\)/
    );
});

test('Instagram Reel creation and publication are separate draft approvals', async () => {
    const spec = await readFile(
        new URL('../../docs/founder-os/custom-gpt-action.openapi.yaml', import.meta.url),
        'utf8'
    );
    const validationSource = await readFile(
        new URL('../../lib/founder-os/validation.ts', import.meta.url),
        'utf8'
    );
    const serviceSource = await readFile(
        new URL('../../lib/founder-os/service.ts', import.meta.url),
        'utf8'
    );

    assert.match(spec, /const: instagram-reel-publish/);
    assert.match(validationSource, /kind:\s*z\.literal\('instagram-reel-publish'\)/);
    assert.match(validationSource, /creationId:[\s\S]*max\(256\)[\s\S]*A-Za-z0-9/);
    assert.match(serviceSource, /operation:\s*'meta\.reel\.publish'/);
});
