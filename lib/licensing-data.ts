/**
 * Public licensing view adapter.
 *
 * Product summaries come from the canonical registry. Exclusive terms remain
 * inquiry-only until the founder approves the complete written agreement.
 */

import {
    PUBLIC_CONFIRMED_LICENSES,
    formatLicenseCount,
    type CanonicalLicenseTier,
} from './licensing-registry';

export interface LicenseTier {
    id: string;
    name: string;
    price: string;
    priceValue: number;
    type: 'non-exclusive' | 'exclusive';
    features: string[];
    includes: string[];
    highlight?: boolean;
}

const licenseFeatures = (tier: CanonicalLicenseTier): string[] => {
    const features = [
        formatLicenseCount(
            tier.distributionCopies,
            'Sale/Copy',
            'Sales/Copies',
            tier.unlimitedDistribution,
        ),
        formatLicenseCount(
            tier.onlineAudioStreams,
            'Online Audio Stream',
            'Online Audio Streams',
            tier.unlimitedOnlineAudioStreams,
        ),
        formatLicenseCount(tier.musicVideos, 'Music Video', 'Music Videos'),
    ];

    if (tier.paidPerformances) features.push('For-Profit Performances');
    if ((tier.radioStations ?? 0) > 0) {
        features.push(formatLicenseCount(tier.radioStations, 'Radio Station', 'Radio Stations'));
    }
    if (tier.creditRequired && tier.creditString) {
        features.push(`Must Credit "${tier.creditString}"`);
    }

    return features;
};

export const nonExclusiveTiers: LicenseTier[] = PUBLIC_CONFIRMED_LICENSES.map((tier) => ({
    id: tier.id,
    name: tier.name,
    price: tier.priceUsd === null ? 'Contact' : `$${tier.priceUsd}`,
    priceValue: tier.priceUsd ?? 0,
    type: 'non-exclusive',
    includes: [...tier.fileFormats],
    features: licenseFeatures(tier),
    highlight: tier.id === 'premium',
}));

export const exclusiveLicense: LicenseTier = {
    id: 'exclusive',
    name: 'Exclusive Inquiry',
    price: 'Contact for written terms',
    priceValue: 0,
    type: 'exclusive',
    includes: [],
    features: [
        'Availability confirmed directly',
        'Scope and files confirmed in writing',
        'No automated rights or usage promises',
    ],
    highlight: true,
};

export const allLicenseTiers: LicenseTier[] = [...nonExclusiveTiers, exclusiveLicense];

export const nonExclusiveRules = [
    'The written license issued at checkout is authoritative',
    'Each non-exclusive tier has its own usage and distribution limits',
    'Credit, Content ID, territory, and upgrade terms must be checked in the written license',
];
