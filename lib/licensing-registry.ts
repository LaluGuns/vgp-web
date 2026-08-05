/**
 * Canonical VGP licensing registry.
 *
 * Public quantities and product names are synchronized with the founder's
 * licensing commit. Automation eligibility is intentionally narrower than
 * public display eligibility: agents may only quote terms that have an
 * explicit outreach policy.
 */

export const LICENSE_REGISTRY_VERSION = 'owner-confirmed-main-c407209-2026-07-29' as const;

export type LicenseVerificationStatus = 'owner-confirmed' | 'unverified';

export interface CanonicalLicenseTier {
    id: 'basic-mp3' | 'basic-pro' | 'premium' | 'unlimited' | 'exclusive';
    catalogId: string;
    name: string;
    type: 'non-exclusive' | 'exclusive';
    verificationStatus: LicenseVerificationStatus;
    sourceLabel: string;
    sourceVersion: string;
    automationEligible: boolean;
    publicDisplayEligible: boolean;
    priceUsd: number | null;
    usage: string | null;
    fileFormats: string[];
    includesStems: boolean | null;
    commercialUse: boolean | null;
    distributionCopies: number | null;
    unlimitedDistribution: boolean;
    onlineAudioStreams: number | null;
    unlimitedOnlineAudioStreams: boolean;
    musicVideos: number | null;
    radioStations: number | null;
    paidPerformances: boolean | null;
    contentIdAllowed: boolean | null;
    creditRequired: boolean | null;
    creditString: string | null;
    reviewNote?: string;
}

const ownerConfirmed = (
    tier: Omit<
        CanonicalLicenseTier,
        'verificationStatus' | 'sourceLabel' | 'sourceVersion' | 'publicDisplayEligible'
    >,
): CanonicalLicenseTier => ({
    ...tier,
    verificationStatus: 'owner-confirmed',
    sourceLabel: 'Founder licensing commit c407209',
    sourceVersion: LICENSE_REGISTRY_VERSION,
    publicDisplayEligible: true,
});

const ownerConfirmedBasicMp3 = ownerConfirmed({
    id: 'basic-mp3',
    catalogId: 'basic-mp3',
    name: 'Basic MP3',
    type: 'non-exclusive',
    automationEligible: true,
    priceUsd: 15,
    usage: 'Used for Music Recording',
    fileFormats: ['MP3 (320kbps)'],
    includesStems: false,
    commercialUse: true,
    distributionCopies: 2_000,
    unlimitedDistribution: false,
    onlineAudioStreams: 5_000,
    unlimitedOnlineAudioStreams: false,
    musicVideos: 1,
    radioStations: 0,
    paidPerformances: false,
    contentIdAllowed: false,
    creditRequired: true,
    creditString: 'Prod. By Virzy Guns',
});

const ownerConfirmedBasicPro = ownerConfirmed({
    id: 'basic-pro',
    catalogId: 'basic-pro-wav',
    name: 'Basic Pro Lease',
    type: 'non-exclusive',
    automationEligible: false,
    priceUsd: 25,
    usage: null,
    fileFormats: ['MP3 (320kbps)', 'WAV (24-Bit)'],
    includesStems: false,
    commercialUse: true,
    distributionCopies: 5_000,
    unlimitedDistribution: false,
    onlineAudioStreams: 200_000,
    unlimitedOnlineAudioStreams: false,
    musicVideos: 1,
    radioStations: 2,
    paidPerformances: true,
    contentIdAllowed: false,
    creditRequired: true,
    creditString: 'Prod. By Virzy Guns',
});

const ownerConfirmedPremium = ownerConfirmed({
    id: 'premium',
    catalogId: 'premium-stems',
    name: 'Premium Lease',
    type: 'non-exclusive',
    automationEligible: false,
    priceUsd: 50,
    usage: null,
    fileFormats: ['MP3 (320kbps)', 'WAV (24-Bit)', 'Track Stems'],
    includesStems: true,
    commercialUse: true,
    distributionCopies: 10_000,
    unlimitedDistribution: false,
    onlineAudioStreams: 500_000,
    unlimitedOnlineAudioStreams: false,
    musicVideos: 1,
    radioStations: 2,
    paidPerformances: true,
    contentIdAllowed: false,
    creditRequired: true,
    creditString: 'Prod. By Virzy Guns',
});

const ownerConfirmedUnlimited = ownerConfirmed({
    id: 'unlimited',
    catalogId: 'unlimited',
    name: 'UNLIMITED Lease',
    type: 'non-exclusive',
    automationEligible: false,
    priceUsd: 100,
    usage: null,
    fileFormats: ['MP3 (320kbps)', 'WAV (24-Bit)', 'Track Stems'],
    includesStems: true,
    commercialUse: true,
    distributionCopies: null,
    unlimitedDistribution: true,
    onlineAudioStreams: null,
    unlimitedOnlineAudioStreams: true,
    musicVideos: 2,
    radioStations: 2,
    paidPerformances: true,
    contentIdAllowed: false,
    creditRequired: true,
    creditString: 'Prod. By Virzy Guns',
});

const unverifiedExclusive: CanonicalLicenseTier = {
    id: 'exclusive',
    catalogId: 'exclusive',
    name: 'Exclusive',
    type: 'exclusive',
    verificationStatus: 'unverified',
    sourceLabel: 'Founder review required',
    sourceVersion: LICENSE_REGISTRY_VERSION,
    automationEligible: false,
    publicDisplayEligible: false,
    priceUsd: null,
    usage: null,
    fileFormats: [],
    includesStems: null,
    commercialUse: null,
    distributionCopies: null,
    unlimitedDistribution: false,
    onlineAudioStreams: null,
    unlimitedOnlineAudioStreams: false,
    musicVideos: null,
    radioStations: null,
    paidPerformances: null,
    contentIdAllowed: null,
    creditRequired: null,
    creditString: null,
    reviewNote: 'Confirm the complete written terms in the dedicated licensing session.',
};

export const LICENSE_REGISTRY: readonly CanonicalLicenseTier[] = [
    ownerConfirmedBasicMp3,
    ownerConfirmedBasicPro,
    ownerConfirmedPremium,
    ownerConfirmedUnlimited,
    unverifiedExclusive,
] as const;

export const BASIC_MP3_LICENSE = ownerConfirmedBasicMp3;

export const PUBLIC_CONFIRMED_LICENSES = LICENSE_REGISTRY.filter(
    (tier) => tier.publicDisplayEligible && tier.verificationStatus === 'owner-confirmed',
);

export const AUTOMATION_ELIGIBLE_LICENSES = LICENSE_REGISTRY.filter(
    (tier) => tier.automationEligible && tier.verificationStatus === 'owner-confirmed',
);

export function getLicenseTier(id: CanonicalLicenseTier['id']): CanonicalLicenseTier | undefined {
    return LICENSE_REGISTRY.find((tier) => tier.id === id);
}

export function formatLicenseCount(
    value: number | null,
    singular: string,
    plural: string,
    unlimited = false,
): string {
    if (unlimited) return `UNLIMITED ${plural}`;
    if (value === null) return 'Needs owner confirmation';
    return `${value.toLocaleString('en-US')} ${value === 1 ? singular : plural}`;
}
