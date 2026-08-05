import assert from 'node:assert/strict';
import test from 'node:test';

import {
    LeadScoutValidationError,
    runLeadScout,
    runLeadScoutBatch,
    type LeadCandidateInput,
} from '../../lib/founder-os/leads/index.ts';

const NOW = '2026-07-29T10:00:00.000Z';

function baseCandidate(
    overrides: Partial<LeadCandidateInput> = {},
): LeadCandidateInput {
    const candidate: LeadCandidateInput = {
        id: 'lead-rapper',
        displayName: 'Evidence Artist',
        handle: '@evidenceartist',
        segment: 'rapper',
        market: 'en-US',
        platform: 'youtube',
        profileUrl: 'https://artist.example/profile',
        contact: {
            businessEmail: 'manager@artist.example',
            permission: 'public-business-email',
            sourceEvidenceId: 'ev-profile',
            origin: 'source-provided',
        },
        evidence: [
            {
                id: 'ev-profile',
                label: 'Official profile',
                url: 'https://artist.example/profile',
                sourceType: 'manual-research',
                observedAt: '2026-07-28T12:00:00.000Z',
                note: 'Public business email is displayed on the official profile.',
            },
            {
                id: 'ev-project',
                label: 'Recent public project',
                url: 'https://artist.example/releases/new-project',
                sourceType: 'manual-research',
                observedAt: '2026-07-25T12:00:00.000Z',
                note: 'Recent public work has a dark cyberpunk trap direction.',
            },
        ],
        qualificationSignals: {
            audienceFit: {
                strength: 'high',
                evidenceIds: ['ev-project'],
                note: 'The active audience consumes dark trap releases.',
            },
            styleFit: {
                strength: 'high',
                evidenceIds: ['ev-project'],
                note: 'The current sound direction matches the cyberpunk trap catalog lane.',
            },
            purchaseIntent: {
                strength: 'high',
                evidenceIds: ['ev-project'],
                note: 'A recently announced recording project is active.',
            },
        },
        beatMatches: [
            {
                beatId: 'hardcore-phonk',
                title: 'HARDCORE PHONK',
                publicUrl: 'https://www.virzyguns.com/studio/beats/hardcore-phonk',
                matchReason: 'Dark high-energy production fits the verified project signal.',
                evidenceIds: ['ev-project'],
                verificationStatus: 'verified',
            },
        ],
    };

    return {
        ...candidate,
        ...overrides,
        contact: overrides.contact ?? candidate.contact,
        evidence: overrides.evidence ?? candidate.evidence,
        qualificationSignals:
            overrides.qualificationSignals ?? candidate.qualificationSignals,
        beatMatches: overrides.beatMatches ?? candidate.beatMatches,
    };
}

test('deterministic scoring uses inspectable fixed weights and preserves verified beat IDs', () => {
    const first = runLeadScout(baseCandidate(), { now: NOW, mode: 'production' });
    const second = runLeadScout(baseCandidate(), { now: NOW, mode: 'production' });

    assert.equal(first.candidate.prospect.score, 96);
    assert.deepEqual(first.candidate.prospect.scoreBreakdown, {
        audienceFit: 20,
        styleFit: 30,
        purchaseIntent: 20,
        contactability: 16,
        freshness: 10,
    });
    assert.equal(first.candidate.tier, 'qualified');
    assert.deepEqual(first.candidate.prospect.matchedBeatIds, ['hardcore-phonk']);
    assert.deepEqual(first, second);
});

test('batch prioritization is rapper-first without hiding the score', () => {
    const gameCandidate = baseCandidate({
        id: 'lead-game',
        displayName: 'Verified Game Studio',
        segment: 'game-developer',
        contact: {
            businessEmail: 'audio@studio.example',
            permission: 'verified-opt-in',
            sourceEvidenceId: 'ev-profile',
            origin: 'source-provided',
        },
    });

    const results = runLeadScoutBatch([gameCandidate, baseCandidate()], {
        now: NOW,
        mode: 'production',
    });

    assert.equal(results[0].candidate.prospect.segment, 'rapper');
    assert.equal(results[0].candidate.prospect.score, 96);
    assert.equal(results[1].candidate.prospect.segment, 'game-developer');
    assert.equal(results[1].candidate.prospect.score, 100);
});

test('production ingestion rejects evidence without URL or observed timestamp', () => {
    const unsafe = baseCandidate({
        evidence: [
            {
                id: 'ev-profile',
                label: 'Untraceable profile claim',
                url: null,
                sourceType: 'manual-research',
                observedAt: null,
            },
            {
                id: 'ev-project',
                label: 'Project',
                url: 'https://artist.example/project',
                sourceType: 'manual-research',
                observedAt: '2026-07-25T12:00:00.000Z',
            },
        ],
    });

    assert.throws(
        () => runLeadScout(unsafe, { now: NOW, mode: 'production' }),
        (error: unknown) => {
            assert.ok(error instanceof LeadScoutValidationError);
            assert.ok(error.issues.some((issue) => issue.code === 'missing-source-url'));
            assert.ok(error.issues.some((issue) => issue.code === 'missing-observed-at'));
            return true;
        },
    );
});

test('guessed contacts are rejected even when the guessed address is well formed', () => {
    const guessed = baseCandidate({
        contact: {
            businessEmail: 'guessed@artist.example',
            permission: 'public-business-email',
            sourceEvidenceId: 'ev-profile',
            origin: 'inferred',
        },
    });

    assert.throws(
        () => runLeadScout(guessed, { now: NOW, mode: 'production' }),
        (error: unknown) => {
            assert.ok(error instanceof LeadScoutValidationError);
            assert.ok(error.issues.some((issue) => issue.code === 'guessed-contact'));
            return true;
        },
    );
});

test('cold Instagram and TikTok remain manual-only draft handoffs', () => {
    for (const platform of ['instagram', 'tiktok'] as const) {
        const result = runLeadScout(
            baseCandidate({
                id: `lead-${platform}`,
                platform,
                profileUrl: `https://${platform}.example/evidenceartist`,
                contact: {
                    businessEmail: null,
                    permission: 'manual-only',
                    sourceEvidenceId: null,
                    origin: 'source-provided',
                },
            }),
            { now: NOW, mode: 'production' },
        );

        assert.equal(result.candidate.tier, 'qualified');
        assert.equal(result.outreach.channel, platform);
        assert.equal(result.outreach.deliveryMode, 'manual-social-handoff');
        assert.equal(result.outreach.steps.length, 3);
        assert.ok(
            result.outreach.gaps.some((gap) =>
                gap.includes('cannot initiate or schedule a cold social DM'),
            ),
        );
        for (const step of result.outreach.steps) {
            assert.equal(step.status, 'DRAFT');
            assert.equal(step.approvalRequired, true);
            assert.equal(step.canExecute, false);
            assert.equal(step.scheduledFor, null);
            assert.equal(step.deliveryMode, 'manual-social-handoff');
            assert.equal(step.subject, null);
        }
    }
});

test('rapper offer quotes only the exact owner-confirmed Basic MP3 terms', () => {
    const result = runLeadScout(baseCandidate(), { now: NOW, mode: 'production' });
    const offer = result.outreach.offer;

    assert.equal(offer.kind, 'canonical-basic-mp3');
    if (offer.kind !== 'canonical-basic-mp3') assert.fail('Expected Basic MP3 offer.');
    assert.equal(offer.licenseId, 'basic-mp3');
    assert.equal(offer.priceUsd, 15);
    assert.equal(offer.usage, 'Used for Music Recording');
    assert.equal(offer.distributionCopies, 2_000);
    assert.equal(offer.onlineAudioStreams, 5_000);
    assert.equal(offer.musicVideos, 1);
    assert.equal(offer.rightsInferred, false);
    assert.match(result.outreach.steps[0].body, /\$15/);
    assert.match(result.outreach.steps[0].body, /2,000 copies/);
    assert.match(result.outreach.steps[0].body, /5,000 online audio streams/);
    assert.match(result.outreach.steps[0].body, /one music video/);
});

test('game developer and content creator plans are custom sync inquiries with no inferred rights', () => {
    for (const segment of ['game-developer', 'content-creator'] as const) {
        const result = runLeadScout(
            baseCandidate({
                id: `lead-${segment}`,
                segment,
            }),
            { now: NOW, mode: 'production' },
        );
        const offer = result.outreach.offer;

        assert.equal(offer.kind, 'custom-sync-inquiry');
        if (offer.kind !== 'custom-sync-inquiry') assert.fail('Expected custom sync inquiry.');
        assert.equal(offer.priceUsd, null);
        assert.equal(offer.usage, null);
        assert.equal(offer.rightsInferred, false);
        assert.doesNotMatch(result.outreach.steps[0].body, /\$15|Basic MP3/);
        assert.match(result.outreach.steps[0].body, /no price or usage rights are assumed/i);
    }
});

test('three-step plan has fixed ordering, delays, unique hashes, and individual DRAFT approvals', () => {
    const result = runLeadScout(baseCandidate(), { now: NOW, mode: 'production' });

    assert.deepEqual(
        result.outreach.steps.map((step) => step.order),
        [1, 2, 3],
    );
    assert.deepEqual(
        result.outreach.steps.map((step) => step.suggestedDelayBusinessDays),
        [0, 5, 7],
    );
    assert.deepEqual(
        result.outreach.steps.map((step) => step.status),
        ['DRAFT', 'DRAFT', 'DRAFT'],
    );
    assert.ok(result.outreach.steps.every((step) => step.approvalRequired));
    assert.ok(result.outreach.steps.every((step) => !step.canExecute));
    assert.equal(new Set(result.outreach.steps.map((step) => step.contentHash)).size, 3);
    assert.ok(
        result.outreach.steps.every((step) =>
            step.contentHash.startsWith('sha256:'),
        ),
    );
});

test('Japanese and German drafts include English back-translations', () => {
    for (const market of ['ja-JP', 'de-DE'] as const) {
        const result = runLeadScout(
            baseCandidate({
                id: `lead-${market}`,
                market,
            }),
            { now: NOW, mode: 'production' },
        );

        assert.equal(result.outreach.steps.length, 3);
        assert.ok(result.outreach.steps.every((step) => step.language === market));
        assert.ok(
            result.outreach.steps.every(
                (step) => typeof step.backTranslation === 'string' && step.backTranslation.length > 0,
            ),
        );
    }
});

test('stale evidence is returned as stale with an inspectable freshness gap', () => {
    const staleEvidence = baseCandidate().evidence.map((item) => ({
        ...item,
        observedAt: '2025-01-01T00:00:00.000Z',
    }));
    const result = runLeadScout(
        baseCandidate({
            evidence: staleEvidence,
        }),
        { now: NOW, mode: 'production' },
    );

    assert.equal(result.candidate.evidenceFreshness, 'stale');
    assert.equal(result.candidate.prospect.scoreBreakdown.freshness, 3);
    assert.ok(
        result.candidate.prospect.gaps.some((gap) => gap.includes('freshness window')),
    );
});
