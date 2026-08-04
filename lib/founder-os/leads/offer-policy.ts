import {
    BASIC_MP3_LICENSE,
    type CanonicalLicenseTier,
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
} from '../../licensing-registry.ts';
// @ts-expect-error Node 24 strip-types requires explicit TypeScript extensions.
import { LeadScoutValidationError } from './errors.ts';
import type {
    CanonicalBasicMp3Offer,
    CustomSyncInquiryOffer,
    LeadOffer,
} from './types.ts';
import type { ProspectSegment } from '../contracts.ts';

type ConfirmedBasicMp3Tier = CanonicalLicenseTier & {
    id: 'basic-mp3';
    name: 'Basic MP3';
    verificationStatus: 'owner-confirmed';
    automationEligible: true;
    publicDisplayEligible: true;
    priceUsd: 15;
    usage: 'Used for Music Recording';
    distributionCopies: 2_000;
    onlineAudioStreams: 5_000;
    musicVideos: 1;
};

function isConfirmedBasicMp3(tier: CanonicalLicenseTier): tier is ConfirmedBasicMp3Tier {
    return (
        tier.id === 'basic-mp3' &&
        tier.name === 'Basic MP3' &&
        tier.verificationStatus === 'owner-confirmed' &&
        tier.automationEligible === true &&
        tier.publicDisplayEligible === true &&
        tier.priceUsd === 15 &&
        tier.usage === 'Used for Music Recording' &&
        tier.distributionCopies === 2_000 &&
        tier.onlineAudioStreams === 5_000 &&
        tier.musicVideos === 1
    );
}

function canonicalBasicMp3Offer(): CanonicalBasicMp3Offer {
    if (!isConfirmedBasicMp3(BASIC_MP3_LICENSE)) {
        throw new LeadScoutValidationError([
            {
                path: 'license.basic-mp3',
                code: 'unsafe-license',
                message:
                    'Basic MP3 is unavailable because the canonical owner-confirmed registry no longer matches the approved terms.',
            },
        ]);
    }

    return {
        kind: 'canonical-basic-mp3',
        licenseId: BASIC_MP3_LICENSE.id,
        name: BASIC_MP3_LICENSE.name,
        priceUsd: BASIC_MP3_LICENSE.priceUsd,
        usage: BASIC_MP3_LICENSE.usage,
        distributionCopies: BASIC_MP3_LICENSE.distributionCopies,
        onlineAudioStreams: BASIC_MP3_LICENSE.onlineAudioStreams,
        musicVideos: BASIC_MP3_LICENSE.musicVideos,
        sourceVersion: BASIC_MP3_LICENSE.sourceVersion,
        rightsInferred: false,
    };
}

function customSyncOffer(segment: Exclude<ProspectSegment, 'rapper'>): CustomSyncInquiryOffer {
    return {
        kind: 'custom-sync-inquiry',
        licenseId: null,
        name: 'Custom sync inquiry',
        priceUsd: null,
        usage: null,
        sourceVersion: null,
        rightsInferred: false,
        requiredScope:
            segment === 'game-developer'
                ? 'game-or-interactive-use-must-be-confirmed-in-writing'
                : 'creator-or-commercial-video-use-must-be-confirmed-in-writing',
    };
}

export function offerForSegment(segment: ProspectSegment): LeadOffer {
    if (segment === 'rapper') return canonicalBasicMp3Offer();
    return customSyncOffer(segment);
}

export function describeOffer(offer: LeadOffer): string {
    if (offer.kind === 'canonical-basic-mp3') {
        return [
            `${offer.name} is $${offer.priceUsd}`,
            'for music recording',
            `up to ${offer.distributionCopies.toLocaleString('en-US')} copies`,
            `${offer.onlineAudioStreams.toLocaleString('en-US')} online audio streams`,
            `${offer.musicVideos} music video`,
        ].join(', ');
    }

    return 'This project needs a custom sync inquiry; price and usage rights must be confirmed in writing before use.';
}
