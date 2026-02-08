/**
 * VGP Licensing Data System
 * Based on Beatstars licensing structure
 */

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

// Non-Exclusive License Tiers
export const nonExclusiveTiers: LicenseTier[] = [
    {
        id: 'basic-mp3',
        name: 'Basic MP3',
        price: '$15',
        priceValue: 15,
        type: 'non-exclusive',
        includes: ['MP3 File'],
        features: [
            '2,000 Sales/Copies',
            '100,000 Streams',
            '1 Music Video',
            'Must Credit "Prod. By Virzy Guns"',
        ],
    },
    {
        id: 'basic-pro',
        name: 'Basic Pro Lease',
        price: '$25',
        priceValue: 25,
        type: 'non-exclusive',
        includes: ['MP3 File', 'WAV File'],
        features: [
            '10,000 Sales/Copies',
            '500,000 Streams',
            '1 Music Video',
            'Profit Performances',
            'Must Credit "Prod. By Virzy Guns"',
        ],
    },
    {
        id: 'premium',
        name: 'Premium Lease',
        price: '$50',
        priceValue: 50,
        type: 'non-exclusive',
        includes: ['MP3 File', 'WAV File', 'Track Stems'],
        features: [
            '50,000 Sales/Copies',
            '1,000,000 Streams',
            '1 Music Video',
            'Profit Performances',
            'Radio Broadcasting (2 Stations)',
            'Must Credit "Prod. By Virzy Guns"',
        ],
        highlight: true,
    },
    {
        id: 'unlimited',
        name: 'Unlimited Lease',
        price: '$100',
        priceValue: 100,
        type: 'non-exclusive',
        includes: ['MP3 File', 'WAV File', 'Track Stems'],
        features: [
            'UNLIMITED Sales/Copies',
            'UNLIMITED Streams',
            '2 Music Videos',
            'Profit Performances',
            'Radio Broadcasting (2 Stations)',
            'Must Credit "Prod. By Virzy Guns"',
        ],
    },
];

// Exclusive License
export const exclusiveLicense: LicenseTier = {
    id: 'exclusive',
    name: 'Exclusive Rights',
    price: 'Make an Offer',
    priceValue: 0,
    type: 'exclusive',
    includes: ['Untagged MP3', 'Untagged WAV', 'Full Track Stems'],
    features: [
        'UNLIMITED Sale Units',
        'UNLIMITED Streams',
        'UNLIMITED Music Videos',
        'Profit Performances',
        'UNLIMITED Radio Broadcasting',
        'YouTube Monetization',
        'SoundCloud Monetization',
        'Content ID Registration',
        'Full Exclusive Rights',
        'No Credit Required',
    ],
    highlight: true,
};

// All tiers combined
export const allLicenseTiers: LicenseTier[] = [...nonExclusiveTiers, exclusiveLicense];

// Common rules for non-exclusive licenses
export const nonExclusiveRules = [
    'Virzy Guns Production maintains full ownership of the instrumental',
    'Artist must credit "Prod. By Virzy Guns" in song title and description',
    'License is non-transferable',
    'Beat may be sold to other artists (non-exclusive)',
];
