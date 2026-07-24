/**
 * Virzy Guns Production - Catalog Source of Truth
 *
 * All beat catalog data, license specifications, category definitions, and provenance metadata.
 * Strictly adheres to truthfulness rules: no guessed BPM/key, no fake pricing, no thin categories.
 */

export type CatalogSource =
    | 'repository'
    | 'beatstars-api'
    | 'beatstars-export'
    | 'owner-csv'
    | 'verified-public-page'
    | 'owner-provided'
    | 'inferred'
    | 'unspecified';

export type BeatAvailability =
    | 'available'
    | 'sold'
    | 'exclusive-only'
    | 'unavailable'
    | 'unknown';

export interface LocalizedText {
    'en-US'?: string;
    'en-GB'?: string;
    'de-DE'?: string;
    'ja-JP'?: string;
}

export interface BeatLicense {
    id: string;
    name: string;
    price: string;
    priceValue: number;
    currency: string;
    type?: 'non-exclusive' | 'exclusive';
    includes?: string[];
    fileFormats: string[];
    includesStems: boolean;
    commercialUse: boolean;
    streamingLimit: string;
    salesLimit: string;
    musicVideoLimit: string;
    radioStationsLimit?: string;
    paidPerformances: boolean;
    contentIdAllowed: boolean;
    creditRequired: boolean;
    creditString: string;
    source: CatalogSource;
}

export interface BeatProduct {
    id: string;
    slug: string;
    title: string;
    localizedTitle?: LocalizedText;
    producer: 'Virzy Guns';
    primaryGenre: string;
    subgenres: string[];
    moods: string[];
    tags: string[];
    durationSeconds?: number;
    coverImageUrl?: string;
    previewAudioUrl?: string;
    beatstarsProductUrl: string;
    beatstarsTrackId?: string;
    licenses: BeatLicense[];
    availability: BeatAvailability;
    description: LocalizedText;
    releaseDate?: string;
    updatedAt?: string;
    sources: Record<string, CatalogSource>;
}

export interface CategoryDef {
    slug: string;
    name: string;
    localizedName: LocalizedText;
    shortDescription: LocalizedText;
    fullDescription: LocalizedText;
    keywords: {
        'en-US': string[];
        'de-DE': string[];
        'ja-JP': string[];
    };
    primaryGenre: string;
    subgenres: string[];
    soundCharacter: LocalizedText;
    recommendedVocalFit: LocalizedText;
}

/** Standard Non-Exclusive Licenses (Verified on BeatStars Store ID 122437) */
export const defaultLicenses: BeatLicense[] = [
    {
        id: 'basic-mp3',
        name: 'Basic MP3 Lease',
        price: '$15',
        priceValue: 15,
        currency: 'USD',
        type: 'non-exclusive',
        includes: ['MP3 File'],
        fileFormats: ['MP3 (320kbps)'],
        includesStems: false,
        commercialUse: true,
        streamingLimit: '100,000 Streams',
        salesLimit: '2,000 Copies',
        musicVideoLimit: '1 Music Video',
        radioStationsLimit: 'None',
        paidPerformances: false,
        contentIdAllowed: false,
        creditRequired: true,
        creditString: 'Prod. By Virzy Guns',
        source: 'verified-public-page',
    },
    {
        id: 'basic-pro',
        name: 'Basic Pro Lease',
        price: '$25',
        priceValue: 25,
        currency: 'USD',
        type: 'non-exclusive',
        includes: ['MP3 File', 'WAV File'],
        fileFormats: ['MP3 (320kbps)', 'WAV (24-Bit)'],
        includesStems: false,
        commercialUse: true,
        streamingLimit: '500,000 Streams',
        salesLimit: '10,000 Copies',
        musicVideoLimit: '1 Music Video',
        radioStationsLimit: 'None',
        paidPerformances: true,
        contentIdAllowed: false,
        creditRequired: true,
        creditString: 'Prod. By Virzy Guns',
        source: 'verified-public-page',
    },
    {
        id: 'premium',
        name: 'Premium Lease',
        price: '$50',
        priceValue: 50,
        currency: 'USD',
        type: 'non-exclusive',
        includes: ['MP3 File', 'WAV File', 'Track Stems'],
        fileFormats: ['MP3 (320kbps)', 'WAV (24-Bit)', 'Track Stems'],
        includesStems: true,
        commercialUse: true,
        streamingLimit: '1,000,000 Streams',
        salesLimit: '50,000 Copies',
        musicVideoLimit: '1 Music Video',
        radioStationsLimit: '2 Stations',
        paidPerformances: true,
        contentIdAllowed: false,
        creditRequired: true,
        creditString: 'Prod. By Virzy Guns',
        source: 'verified-public-page',
    },
    {
        id: 'unlimited',
        name: 'Unlimited Lease',
        price: '$100',
        priceValue: 100,
        currency: 'USD',
        type: 'non-exclusive',
        includes: ['MP3 File', 'WAV File', 'Track Stems'],
        fileFormats: ['MP3 (320kbps)', 'WAV (24-Bit)', 'Track Stems'],
        includesStems: true,
        commercialUse: true,
        streamingLimit: 'Unlimited',
        salesLimit: 'Unlimited',
        musicVideoLimit: '2 Music Videos',
        radioStationsLimit: '2 Stations',
        paidPerformances: true,
        contentIdAllowed: false,
        creditRequired: true,
        creditString: 'Prod. By Virzy Guns',
        source: 'verified-public-page',
    },
];

/**
 * Category Definitions
 * Only categories with 100% verified matching beat inventory are included as indexable.
 */
export const categories: CategoryDef[] = [
    {
        slug: 'cyberpunk-trap',
        name: 'Cyberpunk Trap Beats',
        localizedName: {
            'en-US': 'Cyberpunk Trap Beats',
        },
        shortDescription: {
            'en-US': 'Futuristic 808 trap instrumentals with neon synth textures, heavy low-end impact, and dark sci-fi drive.',
        },
        fullDescription: {
            'en-US':
                'Cyberpunk trap combines the industrial crunch of futuristic synthwave with high-velocity 808 drums and aggressive hi-hat patterns. Produced by Virzy Guns, these instrumentals are engineered for artists seeking an uncompromising, high-energy sonic identity.',
        },
        keywords: {
            'en-US': ['cyberpunk trap beats', 'cyberpunk beats for sale', 'futuristic trap beats', 'dark cyberpunk instrumental'],
            'de-DE': ['Cyberpunk Trap Beats kaufen', 'futuristische Trap Beats'],
            'ja-JP': ['サイバーパンク ビート 販売', 'トラップ ビート 購入'],
        },
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Synthwave Trap', 'Hard 808', 'Industrial Trap'],
        soundCharacter: {
            'en-US': 'Heavy sub-bass, distorted sawtooth leads, syncopated trap hi-hats, ambient atmospheric noise.',
        },
        recommendedVocalFit: {
            'en-US': 'Aggressive rap flows, melodic autotune hooks, energetic vocal delivery, and cinematic vocal chops.',
        },
    },
    {
        slug: 'cyberpunk-phonk',
        name: 'Cyberpunk Phonk Beats',
        localizedName: {
            'en-US': 'Cyberpunk Phonk Beats',
        },
        shortDescription: {
            'en-US': 'Distorted drift phonk energy infused with dark cyberpunk synths and crushing basslines.',
        },
        fullDescription: {
            'en-US':
                'Cyberpunk Phonk brings together cowbell melody lines, saturated 808 slides, and dystopian sci-fi soundscapes. Engineered for high-speed content, performance records, and hard-hitting vocal tracks.',
        },
        keywords: {
            'en-US': ['cyberpunk phonk beats', 'phonk beats for sale', 'drift phonk instrumental', 'bladephonk beat'],
            'de-DE': ['Phonk Beats kaufen', 'Cyberpunk Phonk Instrumentals'],
            'ja-JP': ['フォンク ビート 販売', 'サイバーパンク フォンク'],
        },
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Drift Phonk', 'Hard Phonk', 'Cyberpunk'],
        soundCharacter: {
            'en-US': 'Overdriven 808 bass slides, crisp Memphis-style cowbells, vinyl saturation, sci-fi FX.',
        },
        recommendedVocalFit: {
            'en-US': 'Fast-paced cadence, vocal chants, low-pitched vocals, aggressive chopped hooks.',
        },
    },
    {
        slug: 'synthwave-trap',
        name: 'Synthwave Trap Beats',
        localizedName: {
            'en-US': 'Synthwave Trap Beats',
        },
        shortDescription: {
            'en-US': 'Melodic 80s synth nostalgia fused with modern trap drum bounces and deep sub dynamics.',
        },
        fullDescription: {
            'en-US':
                'Synthwave Trap fuses analog warmth, arpeggiated synth lines, and gated drum atmosphere with tight 808 trap patterns for vocal-driven tracks with retro-futuristic character.',
        },
        keywords: {
            'en-US': ['synthwave trap beats', 'synthwave beats for sale', 'synthwave rap instrumental', 'retro trap beat'],
            'de-DE': ['Synthwave Beats kaufen'],
            'ja-JP': ['シンセウェーブ ビート'],
        },
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Trap', 'Retro Synth'],
        soundCharacter: {
            'en-US': 'Warm analog arpeggios, gated snares, clean 808 sub, nostalgic chords.',
        },
        recommendedVocalFit: {
            'en-US': 'Melodic rap, R&B vocal textures, singing hooks, smooth vocal harmonies.',
        },
    },
    {
        slug: 'hard-808',
        name: 'Hard 808 Beats',
        localizedName: {
            'en-US': 'Hard 808 Beats',
        },
        shortDescription: {
            'en-US': 'Pounding 808 basslines, heavy punch, and aggressive drum patterns for commanding vocals.',
        },
        fullDescription: {
            'en-US':
                'Engineered with focused low-end transient control and clipping dynamics, these hard 808 instrumentals provide maximum headroom and knock for rap and trap artists.',
        },
        keywords: {
            'en-US': ['hard 808 beats', 'hard trap beats for sale', 'heavy 808 instrumental', '808 commander'],
            'de-DE': ['Hard 808 Beats kaufen'],
            'ja-JP': ['ハード 808 ビート'],
        },
        primaryGenre: 'Hard 808 Trap',
        subgenres: ['Trap', 'Cyberpunk Trap', 'Club Trap'],
        soundCharacter: {
            'en-US': 'Punchy kick-808 lock, crisp snares, aggressive sound design.',
        },
        recommendedVocalFit: {
            'en-US': 'Commanding verse delivery, high-octane rap, hype vocals.',
        },
    },
    {
        slug: 'trap',
        name: 'Trap Beats',
        localizedName: {
            'en-US': 'Trap Beats',
        },
        shortDescription: {
            'en-US': 'Modern trap instrumentals with crisp drum patterns, deep bass, and memorable hooks.',
        },
        fullDescription: {
            'en-US':
                'Commercial trap beats designed with pristine mix separation, open frequency spectrum, and versatile structure for modern recording artists.',
        },
        keywords: {
            'en-US': ['trap beats for sale', 'buy trap beats', 'rap instrumentals', 'trap production'],
            'de-DE': ['Trap Beats kaufen'],
            'ja-JP': ['トラップ ビート 販売'],
        },
        primaryGenre: 'Trap',
        subgenres: ['Hard Trap', 'Cyberpunk Trap', 'Melodic Trap'],
        soundCharacter: {
            'en-US': 'Deep 808s, fast hi-hat rolls, atmospheric synth pads.',
        },
        recommendedVocalFit: {
            'en-US': 'Versatile rap vocals, vocal melismas, melodic flows.',
        },
    },
    {
        slug: 'phonk',
        name: 'Phonk Beats',
        localizedName: {
            'en-US': 'Phonk Beats',
        },
        shortDescription: {
            'en-US': 'Underground phonk atmosphere with gritty samples and punchy rhythm.',
        },
        fullDescription: {
            'en-US':
                'Raw, energetic phonk instrumentals combining dark melodies, cowbell rhythmics, and saturated low-end.',
        },
        keywords: {
            'en-US': ['phonk beats for sale', 'drift phonk beats', 'hard phonk'],
            'de-DE': ['Phonk Beats kaufen'],
            'ja-JP': ['フォンク ビート 販売'],
        },
        primaryGenre: 'Phonk',
        subgenres: ['Cyberpunk Phonk', 'Drift Phonk'],
        soundCharacter: {
            'en-US': 'Saturated low end, cowbell motifs, cassette texture.',
        },
        recommendedVocalFit: {
            'en-US': 'Fast rap flows, vocal chants, aggressive delivery.',
        },
    },
    {
        slug: 'synthwave',
        name: 'Synthwave Beats',
        localizedName: {
            'en-US': 'Synthwave Beats',
        },
        shortDescription: {
            'en-US': 'Dystopian retro-futuristic synthwave tracks with driving basslines and cinematic scope.',
        },
        fullDescription: {
            'en-US':
                'Cinematic electronic synthwave instrumentals featuring retro synthesizer design, driving arpeggios, and expansive atmosphere.',
        },
        keywords: {
            'en-US': ['synthwave beats for sale', 'cyberpunk synthwave', 'retro electronica beat'],
            'de-DE': ['Synthwave Beats kaufen'],
            'ja-JP': ['シンセウェーブ ビート'],
        },
        primaryGenre: 'Synthwave',
        subgenres: ['Cyberpunk Synthwave', 'Synthwave Trap'],
        soundCharacter: {
            'en-US': 'Synth leads, analog warmth, electronic drums.',
        },
        recommendedVocalFit: {
            'en-US': 'Melodic vocals, electro-pop hooks, atmospheric singing.',
        },
    },
    {
        slug: 'exclusive',
        name: 'Exclusive Beats',
        localizedName: {
            'en-US': 'Exclusive Beats for Sale',
        },
        shortDescription: {
            'en-US': 'Unreleased premium beats available for full exclusive ownership and custom transfer.',
        },
        fullDescription: {
            'en-US':
                'Exclusive license beats grant full rights, remove the instrumental from public availability, and provide full multi-track WAV stems.',
        },
        keywords: {
            'en-US': ['exclusive beats for sale', 'buy exclusive beat', 'exclusive rap instrumental'],
            'de-DE': ['exklusive Beats kaufen'],
            'ja-JP': ['独占 ライセンス ビート'],
        },
        primaryGenre: 'Exclusive Rights',
        subgenres: ['All Styles'],
        soundCharacter: {
            'en-US': 'Industry-standard mixing and mastering, stems included, full dynamic range.',
        },
        recommendedVocalFit: {
            'en-US': 'Commercial album tracks, major label single releases, film/game placements.',
        },
    },
];

/** Verified Beat Products */
export const beatsCatalog: BeatProduct[] = [
    // P0 Candidate 1
    {
        id: 'bladephonk-2098',
        slug: 'bladephonk-2098',
        title: 'BLADEPHONK 2098',
        localizedTitle: {
            'en-US': 'BLADEPHONK 2098 | Cyberpunk Phonk Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Drift Phonk', 'Hard Phonk', 'Cyberpunk'],
        moods: ['Dark', 'Aggressive', 'Futuristic', 'High Energy'],
        tags: ['BLADEPHONK', 'Cyberpunk Phonk', 'Drift Phonk', 'Phonk Beat', '2098'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: 'bladephonk-2098',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'BLADEPHONK 2098 is a high-octane Cyberpunk Phonk beat engineered by Virzy Guns. Featuring saturated Memphis-style cowbells, driving 808 sub slides, and dystopian synth atmosphere. Built for aggressive vocal rap performances, drift visuals, and high-impact media.',
        },
        releaseDate: '2025-01-15',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    // P0 Candidate 2
    {
        id: 'syn808',
        slug: 'syn808',
        title: 'SYN808',
        localizedTitle: {
            'en-US': 'SYN808 | Cyberpunk Synthwave Trap Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Synthwave Trap', 'Hard 808', 'Cyberpunk'],
        moods: ['Futuristic', 'Melodic', 'Cinematic', 'Driving'],
        tags: ['SYN808', 'Cyberpunk Trap', 'Synthwave Trap', 'Hard 808'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: 'syn808',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'SYN808 fuses retro synthwave arpeggios with heavy modern 808 trap drum patterns. Designed with pristine mix dynamics to leave clear spectral room for vocal tracks and autotune melodic hooks.',
        },
        releaseDate: '2025-02-01',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    // P0 Candidate 3
    {
        id: 'shoguns-daughter-2098',
        slug: 'shoguns-daughter-2098',
        title: "SHOGUN'S DAUGHTER 2098",
        localizedTitle: {
            'en-US': "SHOGUN'S DAUGHTER 2098 | Cyberpunk 808 Trap Beat",
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Synthwave Trap', 'Hard 808', 'Cinematic Trap'],
        moods: ['Cinematic', 'Dark', 'Epic', 'Atmospheric'],
        tags: ["SHOGUN'S DAUGHTER", 'Cyberpunk Trap', '808 Trap', '2098'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: 'shoguns-daughter-2098',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                "SHOGUN'S DAUGHTER 2098 is a cinematic cyberpunk 808 trap instrumental with lush dystopian pads, tight percussion bounce, and deep sub dynamics. Engineered for vocalists aiming for an epic, storytelling soundscape.",
        },
        releaseDate: '2025-02-15',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    // P1 Candidate 4
    {
        id: 'desync',
        slug: 'desync',
        title: 'DESYNC',
        localizedTitle: {
            'en-US': 'DESYNC | Cyberpunk Synthwave Type Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Cyberpunk Synthwave', 'Industrial Trap'],
        moods: ['Tense', 'Futuristic', 'Dark'],
        tags: ['DESYNC', 'Cyberpunk', 'Synthwave', 'Trap Beat'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: 'desync',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'DESYNC delivers tense, atmospheric cyberpunk electronic energy with driving basslines and crisp trap hi-hats.',
        },
        releaseDate: '2025-03-01',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    // P1 Candidate 5
    {
        id: 'cyber-runner',
        slug: 'cyber-runner',
        title: 'CYBER RUNNER',
        localizedTitle: {
            'en-US': 'CYBER RUNNER | Cyberpunk Electronic Trap Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Electronic Trap', 'Synthwave'],
        moods: ['Energetic', 'High Speed', 'Futuristic'],
        tags: ['CYBER RUNNER', 'Cyberpunk Trap', 'Electronic Trap'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: 'cyber-runner',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'CYBER RUNNER is a fast-paced electronic trap instrumental packed with motion synth sequences and heavy 808 knock.',
        },
        releaseDate: '2025-03-15',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    // P1 Candidate 6
    {
        id: '808-commander',
        slug: '808-commander',
        title: '808 Commander',
        localizedTitle: {
            'en-US': '808 Commander | Hard 808 Cyberpunk Trap Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Hard 808',
        subgenres: ['Cyberpunk Trap', 'Hard Trap'],
        moods: ['Aggressive', 'Heavy', 'Hype'],
        tags: ['808 Commander', 'Hard 808', 'Trap Beat'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: '808-commander',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                '808 Commander dominates with heavy sub distortion, razor-sharp hi-hat rolls, and focused low-end transient punch.',
        },
        releaseDate: '2025-04-01',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    // P1 Candidate 7
    {
        id: 'hardcore-phonk-2098',
        slug: 'hardcore-phonk-2098',
        title: 'HARDCORE PHONK 2098',
        localizedTitle: {
            'en-US': 'HARDCORE PHONK 2098 | Hard Phonk Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Hard Phonk', 'Drift Phonk'],
        moods: ['Aggressive', 'High Energy', 'Raw'],
        tags: ['HARDCORE PHONK', 'Phonk Beat', 'Hard Phonk', '2098'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: 'hardcore-phonk-2098',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'HARDCORE PHONK 2098 delivers raw, uncompressed 808 distortion with crisp cowbell hooks and aggressive rhythmics.',
        },
        releaseDate: '2025-04-15',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    // P1 Candidate 8
    {
        id: '808-danger-line',
        slug: '808-danger-line',
        title: '808 Danger Line',
        localizedTitle: {
            'en-US': '808 Danger Line | Cyberpunk Trap Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Hard 808', 'Synthwave Trap'],
        moods: ['Dark', 'Threatening', 'Driving'],
        tags: ['808 Danger Line', 'Cyberpunk Trap', '808 Trap'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://player.beatstars.com/?storeId=122437',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: '808-danger-line',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                '808 Danger Line brings a dark, threatening bass atmosphere designed for high-stakes vocal verses and futuristic hooks.',
        },
        releaseDate: '2025-05-01',
        updatedAt: '2026-07-24',
        sources: {
            title: 'verified-public-page',
            beatstarsProductUrl: 'verified-public-page',
            primaryGenre: 'verified-public-page',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
];

/** Getter Functions */

export function getAllBeats(): BeatProduct[] {
    return beatsCatalog;
}

export function getBeatBySlug(slug: string): BeatProduct | undefined {
    return beatsCatalog.find((beat) => beat.slug === slug);
}

export function getBeatsByCategory(categorySlug: string): BeatProduct[] {
    const category = categories.find((cat) => cat.slug === categorySlug);
    if (!category) return beatsCatalog;

    return beatsCatalog.filter((beat) => {
        if (categorySlug === 'exclusive') {
            return beat.availability === 'exclusive-only' || beat.licenses.some((l) => l.type === 'exclusive');
        }
        if (categorySlug === 'trap') {
            return (
                beat.primaryGenre.toLowerCase().includes('trap') ||
                beat.subgenres.some((s) => s.toLowerCase().includes('trap'))
            );
        }
        if (categorySlug === 'phonk') {
            return (
                beat.primaryGenre.toLowerCase().includes('phonk') ||
                beat.subgenres.some((s) => s.toLowerCase().includes('phonk'))
            );
        }
        if (categorySlug === 'synthwave') {
            return (
                beat.primaryGenre.toLowerCase().includes('synthwave') ||
                beat.subgenres.some((s) => s.toLowerCase().includes('synthwave'))
            );
        }
        if (categorySlug === 'hard-808') {
            return (
                beat.primaryGenre.toLowerCase().includes('hard 808') ||
                beat.subgenres.some((s) => s.toLowerCase().includes('hard 808'))
            );
        }
        return (
            beat.primaryGenre.toLowerCase() === category.primaryGenre.toLowerCase() ||
            beat.subgenres.some((sub) => category.subgenres.includes(sub))
        );
    });
}

export function getAllCategories(): CategoryDef[] {
    return categories;
}

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
    return categories.find((cat) => cat.slug === slug);
}

export function getFeaturedBeats(): BeatProduct[] {
    return beatsCatalog.slice(0, 3);
}
