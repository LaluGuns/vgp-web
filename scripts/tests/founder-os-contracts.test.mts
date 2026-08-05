import assert from 'node:assert/strict';
import test from 'node:test';

import {
    AUTOMATION_ELIGIBLE_LICENSES,
    BASIC_MP3_LICENSE,
    LICENSE_REGISTRY,
    LICENSE_REGISTRY_VERSION,
    PUBLIC_CONFIRMED_LICENSES,
} from '../../lib/licensing-registry.ts';
import {
    APPROVAL_STATUSES,
    DEFAULT_FOUNDER_SETTINGS,
    FOUNDER_OS_CONTRACT_VERSION,
} from '../../lib/founder-os/contracts.ts';

test('Basic MP3 uses the founder-confirmed terms exactly', () => {
    assert.equal(LICENSE_REGISTRY_VERSION, 'owner-confirmed-main-c407209-2026-07-29');
    assert.equal(BASIC_MP3_LICENSE.priceUsd, 15);
    assert.equal(BASIC_MP3_LICENSE.usage, 'Used for Music Recording');
    assert.equal(BASIC_MP3_LICENSE.distributionCopies, 2_000);
    assert.equal(BASIC_MP3_LICENSE.onlineAudioStreams, 5_000);
    assert.equal(BASIC_MP3_LICENSE.musicVideos, 1);
    assert.equal(BASIC_MP3_LICENSE.verificationStatus, 'owner-confirmed');
});

test('public non-exclusive tiers match the founder licensing commit', () => {
    assert.deepEqual(
        PUBLIC_CONFIRMED_LICENSES.map((tier) => ({
            id: tier.id,
            priceUsd: tier.priceUsd,
            distributionCopies: tier.distributionCopies,
            unlimitedDistribution: tier.unlimitedDistribution,
            onlineAudioStreams: tier.onlineAudioStreams,
            unlimitedOnlineAudioStreams: tier.unlimitedOnlineAudioStreams,
            musicVideos: tier.musicVideos,
        })),
        [
            {
                id: 'basic-mp3',
                priceUsd: 15,
                distributionCopies: 2_000,
                unlimitedDistribution: false,
                onlineAudioStreams: 5_000,
                unlimitedOnlineAudioStreams: false,
                musicVideos: 1,
            },
            {
                id: 'basic-pro',
                priceUsd: 25,
                distributionCopies: 5_000,
                unlimitedDistribution: false,
                onlineAudioStreams: 200_000,
                unlimitedOnlineAudioStreams: false,
                musicVideos: 1,
            },
            {
                id: 'premium',
                priceUsd: 50,
                distributionCopies: 10_000,
                unlimitedDistribution: false,
                onlineAudioStreams: 500_000,
                unlimitedOnlineAudioStreams: false,
                musicVideos: 1,
            },
            {
                id: 'unlimited',
                priceUsd: 100,
                distributionCopies: null,
                unlimitedDistribution: true,
                onlineAudioStreams: null,
                unlimitedOnlineAudioStreams: true,
                musicVideos: 2,
            },
        ],
    );
});

test('automation remains Basic-only and Exclusive remains fail-closed', () => {
    const unverified = LICENSE_REGISTRY.filter((tier) => tier.verificationStatus === 'unverified');

    assert.deepEqual(unverified.map((tier) => tier.id), ['exclusive']);
    assert.ok(unverified.every((tier) => !tier.automationEligible));
    assert.ok(unverified.every((tier) => !tier.publicDisplayEligible));
    assert.deepEqual(AUTOMATION_ELIGIBLE_LICENSES.map((tier) => tier.id), ['basic-mp3']);
    assert.ok(
        PUBLIC_CONFIRMED_LICENSES
            .filter((tier) => tier.id !== 'basic-mp3')
            .every((tier) => !tier.automationEligible),
    );
});

test('Founder OS defaults keep every external action founder-controlled', () => {
    assert.equal(FOUNDER_OS_CONTRACT_VERSION, '2026-07-29.1');
    assert.equal(DEFAULT_FOUNDER_SETTINGS.requireApprovalForEveryExternalAction, true);
    assert.equal(DEFAULT_FOUNDER_SETTINGS.allowColdSocialDm, false);
    assert.equal(DEFAULT_FOUNDER_SETTINGS.allowUnverifiedContacts, false);
    assert.equal(DEFAULT_FOUNDER_SETTINGS.trendSources.scraping, false);
    assert.deepEqual(APPROVAL_STATUSES, [
        'DRAFT',
        'READY_FOR_APPROVAL',
        'APPROVED',
        'EXECUTING',
        'SUCCEEDED',
        'FAILED',
        'UNKNOWN',
    ]);
});
