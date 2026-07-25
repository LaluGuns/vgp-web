/**
 * Virzy Guns Production - Catalog Source of Truth
 *
 * Full beat catalog data, license specifications, category definitions, and provenance metadata.
 * Generated from Stage A Playwright verified BeatStars Studio inventory extraction.
 */

export type CatalogSource =
    | 'repository'
    | 'beatstars-api'
    | 'beatstars-export'
    | 'owner-csv'
    | 'verified-public-page'
    | 'track-widget-generator'
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
    beatstarsTrackId: string;
    beatstarsEmbedUrl: string;
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
        salesLimit: '5,000 Copies',
        musicVideoLimit: '1 Music Video',
        radioStationsLimit: '0 Stations',
        paidPerformances: false,
        contentIdAllowed: false,
        creditRequired: true,
        creditString: 'Prod. By Virzy Guns',
        source: 'verified-public-page',
    },
    {
        id: 'basic-pro-wav',
        name: 'Basic Pro WAV Lease',
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
        radioStationsLimit: '1 Station',
        paidPerformances: true,
        contentIdAllowed: false,
        creditRequired: true,
        creditString: 'Prod. By Virzy Guns',
        source: 'verified-public-page',
    },
    {
        id: 'premium-stems',
        name: 'Premium Stems Lease',
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

/** Category Definitions */
export const categories: CategoryDef[] = [
    {
        slug: 'cyberpunk-trap',
        name: 'Cyberpunk Trap Beats',
        localizedName: {
            'en-US': 'Cyberpunk Trap Beats',
            'ja-JP': 'サイバーパンクトラップ ビート',
            'de-DE': 'Cyberpunk Trap Beats',
        },
        shortDescription: {
            'en-US': 'Futuristic 808 trap instrumentals with neon synth textures, heavy low-end impact, and dark sci-fi drive.',
            'ja-JP': '重厚な808ベースと近未来的なシンセサイザーが融合したダークなサイバーパンクトラップビート。',
            'de-DE': 'Futuristische 808-Trap-Instrumentals mit Neon-Synth-Texturen und düsterem Sci-Fi-Drive.',
        },
        fullDescription: {
            'en-US':
                'Cyberpunk trap combines the industrial crunch of futuristic synthwave with high-velocity 808 drums and aggressive hi-hat patterns. Produced by Virzy Guns, these instrumentals are engineered for artists seeking an uncompromising, high-energy sonic identity.',
            'ja-JP':
                'サイバーパンクトラップは、インダストリアルなシンセウェーブの質感と高速な808ドラムを融合させたサウンドです。プロデューサーVirzy Gunsにより制作され、存在感のあるトラックを求めるアーティストに最適です。',
            'de-DE':
                'Cyberpunk Trap kombiniert die industrielle Härte futuristischer Synthwave mit schnellen 808-Drums. Produziert von Virzy Guns für Künstler, die eine kompromisslose Klangidentität suchen.',
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
            'ja-JP': 'ディストーション808ベース、歪んだ鋸歯状リードシンセ、高速ハイハット、アンビエントノイズ。',
            'de-DE': 'Verzerrter Sub-Bass, Sägezahn-Leads, schnelle Hi-Hats, atmosphärische Sci-Fi-Texturen.',
        },
        recommendedVocalFit: {
            'en-US': 'Aggressive rap flows, melodic autotune hooks, energetic vocal delivery, and cinematic vocal chops.',
            'ja-JP': 'アグレッシブなラップ、オートチューンフック、力強いボーカルデリバリー。',
            'de-DE': 'Aggressive Rap-Flows, melodische Autotune-Hooks und kraftvoller Gesang.',
        },
    },
    {
        slug: 'cyberpunk-phonk',
        name: 'Cyberpunk Phonk Beats',
        localizedName: {
            'en-US': 'Cyberpunk Phonk Beats',
            'ja-JP': 'サイバーパンクフォンク ビート',
            'de-DE': 'Cyberpunk Phonk Beats',
        },
        shortDescription: {
            'en-US': 'Distorted drift phonk energy infused with dark cyberpunk synths and crushing basslines.',
            'ja-JP': '歪んだドトフトフォンクのエネルギーとダークなサイバーパンクシンセが融合したビート。',
            'de-DE': 'Verzerrte Drift-Phonk-Energie kombiniert mit düsteren Cyberpunk-Synths.',
        },
        fullDescription: {
            'en-US':
                'Cyberpunk Phonk brings together cowbell melody lines, saturated 808 slides, and dystopian sci-fi soundscapes. Engineered for high-speed content, performance records, and hard-hitting vocal tracks.',
            'ja-JP':
                'サイバーパンクフォンクは、カウベルメロディ、歪んだ808スライド、ディストピア的サウンドスケープを特徴とします。ドリフト動画やアグレッシブなラップに最適です。',
            'de-DE':
                'Cyberpunk Phonk vereint Cowbell-Melodien, gesättigte 808-Slides und dystopische Soundscapes. Perfekt für High-Speed-Content und harte Rap-Vocal-Tracks.',
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
            'ja-JP': 'オーバードライブ808ベーススライド、メンフィススタイルカウベル、テープサチュレーション。',
            'de-DE': 'Verzerrte 808-Bass-Slides, knackige Memphis-Cowbells, Sättigung und Sci-Fi-FX.',
        },
        recommendedVocalFit: {
            'en-US': 'Fast-paced cadence, vocal chants, low-pitched vocals, aggressive chopped hooks.',
            'ja-JP': '高速フロウ、ローピッチボーカル、アグレッシブなボイスサンプル。',
            'de-DE': 'Schnelle Kadenz, tief gepitchte Vocals und aggressive Chopped-Hooks.',
        },
    },
    {
        slug: 'synthwave-trap',
        name: 'Synthwave Trap Beats',
        localizedName: {
            'en-US': 'Synthwave Trap Beats',
            'ja-JP': 'シンセウェーブトラップ ビート',
            'de-DE': 'Synthwave Trap Beats',
        },
        shortDescription: {
            'en-US': 'Melodic 80s synth nostalgia fused with modern trap drum bounces and deep sub dynamics.',
            'ja-JP': '80年代シンセノスタルジーと現代トラップドラムが融合したメロディックビート。',
            'de-DE': 'Melodische 80er-Synth-Nostalgie verschmolzen mit modernen Trap-Drums.',
        },
        fullDescription: {
            'en-US':
                'Synthwave Trap fuses analog warmth, arpeggiated synth lines, and gated drum atmosphere with tight 808 trap patterns for vocal-driven tracks with retro-futuristic character.',
            'ja-JP':
                'シンセウェーブトラップは、アナログシンセの温かみと808ドラムのノック感を融合させ、レトロフューチャーなボーカル曲に最適なサウンドを提供します。',
            'de-DE':
                'Synthwave Trap verbindet analoge Wärme, Arpeggio-Synths und knackige 808-Muster für vocal-orientierte Tracks mit Retro-Charakter.',
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
            'ja-JP': 'アナログアルペジオ、クリーン808サブベース、ノスタルジックなコード。',
            'de-DE': 'Warme analoge Arpeggios, klare 808-Sub-Bässe und nostalgische Akkorde.',
        },
        recommendedVocalFit: {
            'en-US': 'Melodic rap, R&B vocal textures, singing hooks, smooth vocal harmonies.',
            'ja-JP': 'メロディックラップ、R&Bボーカル、歌フック。',
            'de-DE': 'Melodischer Rap, R&B-Gesang und geschmeidige Vocal-Harmonien.',
        },
    },
];

/** Full Beats Catalog */
export const beatsCatalog: BeatProduct[] = [
    {
        id: 'hardcore-phonk',
        slug: 'hardcore-phonk',
        title: 'HARDCORE PHONK',
        localizedTitle: {
            'en-US': 'HARDCORE PHONK',
            'ja-JP': 'HARDCORE PHONK',
            'de-DE': 'HARDCORE PHONK',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Drift Phonk', 'Hard Phonk', 'Cyberpunk'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Phonk', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24276595',
        beatstarsTrackId: '24276595',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24276595',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "HARDCORE PHONK" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"HARDCORE PHONK"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "HARDCORE PHONK" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: '808-danger-line',
        slug: '808-danger-line',
        title: '808 Danger Line - Cyberpunk Trap Type Beat',
        localizedTitle: {
            'en-US': '808 Danger Line - Cyberpunk Trap Type Beat',
            'ja-JP': '808 Danger Line - Cyberpunk Trap Type Beat',
            'de-DE': '808 Danger Line - Cyberpunk Trap Type Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Hard 808', 'Industrial Trap', 'Cyberpunk'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24233863',
        beatstarsTrackId: '24233863',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24233863',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "808 Danger Line - Cyberpunk Trap Type Beat" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"808 Danger Line - Cyberpunk Trap Type Beat"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "808 Danger Line - Cyberpunk Trap Type Beat" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: '808s-and-dance',
        slug: '808s-and-dance',
        title: '808s and Dance (Nicki Minaj, Ice Spice, Doja Cat, Club)',
        localizedTitle: {
            'en-US': '808s and Dance (Nicki Minaj, Ice Spice, Doja Cat, Club)',
            'ja-JP': '808s and Dance (Nicki Minaj, Ice Spice, Doja Cat, Club)',
            'de-DE': '808s and Dance (Nicki Minaj, Ice Spice, Doja Cat, Club)',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Club Trap', 'Dance Trap', '808 Trap'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24225531',
        beatstarsTrackId: '24225531',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24225531',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "808s and Dance" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"808s and Dance"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "808s and Dance" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: '808-commander-hard-808-type-beat-the-weeknd-playboi-carti',
        slug: '808-commander-hard-808-type-beat-the-weeknd-playboi-carti',
        title: '808 Commander - Hard 808 Type Beat, The Weeknd Playboi Carti',
        localizedTitle: {
            'en-US': '808 Commander - Hard 808 Type Beat, The Weeknd Playboi Carti',
            'ja-JP': '808 Commander - Hard 808 Type Beat, The Weeknd Playboi Carti',
            'de-DE': '808 Commander - Hard 808 Type Beat, The Weeknd Playboi Carti',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Hard 808', 'Industrial Trap', 'Cyberpunk'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24198649',
        beatstarsTrackId: '24198649',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24198649',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "808 Commander - Hard 808 Type Beat, The Weeknd Playboi Carti" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"808 Commander - Hard 808 Type Beat, The Weeknd Playboi Carti"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "808 Commander - Hard 808 Type Beat, The Weeknd Playboi Carti" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'endless-sacrifice',
        slug: 'endless-sacrifice',
        title: 'ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT',
        localizedTitle: {
            'en-US': 'ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT',
            'ja-JP': 'ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT',
            'de-DE': 'ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Hard 808', 'Industrial Trap', 'Cyberpunk'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24175250',
        beatstarsTrackId: '24175250',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24175250',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "ENDLESS SACRIFICE - CYBERPUNK HARD 808 TRAP TYPE BEAT" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'bladephonk-2098',
        slug: 'bladephonk-2098',
        title: 'BLADEPHONK 2098 - Cyberpunk Phonk Type Beat',
        localizedTitle: {
            'en-US': 'BLADEPHONK 2098 - Cyberpunk Phonk Type Beat',
            'ja-JP': 'BLADEPHONK 2098 - Cyberpunk Phonk Type Beat',
            'de-DE': 'BLADEPHONK 2098 - Cyberpunk Phonk Type Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Drift Phonk', 'Hard Phonk', 'Cyberpunk'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Phonk', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24147773',
        beatstarsTrackId: '24147773',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24147773',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "BLADEPHONK 2098 - Cyberpunk Phonk Type Beat" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"BLADEPHONK 2098 - Cyberpunk Phonk Type Beat"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "BLADEPHONK 2098 - Cyberpunk Phonk Type Beat" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'shogun-s-daughter',
        slug: 'shogun-s-daughter',
        title: 'SHOGUN’S DAUGHTER',
        localizedTitle: {
            'en-US': 'SHOGUN’S DAUGHTER',
            'ja-JP': 'SHOGUN’S DAUGHTER',
            'de-DE': 'SHOGUN’S DAUGHTER',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Hard 808', 'Industrial Trap', 'Cyberpunk'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24140060',
        beatstarsTrackId: '24140060',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24140060',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "SHOGUN’S DAUGHTER" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"SHOGUN’S DAUGHTER"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "SHOGUN’S DAUGHTER" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'syn808-cyberpunk-synthwave-trap-beat',
        slug: 'syn808-cyberpunk-synthwave-trap-beat',
        title: 'SYN808 - Cyberpunk Synthwave Trap Beat',
        localizedTitle: {
            'en-US': 'SYN808 - Cyberpunk Synthwave Trap Beat',
            'ja-JP': 'SYN808 - Cyberpunk Synthwave Trap Beat',
            'de-DE': 'SYN808 - Cyberpunk Synthwave Trap Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24097008',
        beatstarsTrackId: '24097008',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24097008',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "SYN808 - Cyberpunk Synthwave Trap Beat" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"SYN808 - Cyberpunk Synthwave Trap Beat"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "SYN808 - Cyberpunk Synthwave Trap Beat" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'cyber-runner',
        slug: 'cyber-runner',
        title: 'CYBER RUNNER',
        localizedTitle: {
            'en-US': 'CYBER RUNNER',
            'ja-JP': 'CYBER RUNNER',
            'de-DE': 'CYBER RUNNER',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Hard 808', 'Industrial Trap', 'Cyberpunk'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Cyberpunk Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24082291',
        beatstarsTrackId: '24082291',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24082291',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "CYBER RUNNER" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"CYBER RUNNER"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "CYBER RUNNER" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'desync',
        slug: 'desync',
        title: 'DESYNC - Cyberpunk Synthwave Type Beat',
        localizedTitle: {
            'en-US': 'DESYNC - Cyberpunk Synthwave Type Beat',
            'ja-JP': 'DESYNC - Cyberpunk Synthwave Type Beat',
            'de-DE': 'DESYNC - Cyberpunk Synthwave Type Beat',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24047819',
        beatstarsTrackId: '24047819',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24047819',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "DESYNC - Cyberpunk Synthwave Type Beat" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"DESYNC - Cyberpunk Synthwave Type Beat"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "DESYNC - Cyberpunk Synthwave Type Beat" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'christmas-synth',
        slug: 'christmas-synth',
        title: 'Christmas Synth',
        localizedTitle: {
            'en-US': 'Christmas Synth',
            'ja-JP': 'Christmas Synth',
            'de-DE': 'Christmas Synth',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/24017418',
        beatstarsTrackId: '24017418',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24017418',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "Christmas Synth" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"Christmas Synth"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "Christmas Synth" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'velvetpulse',
        slug: 'velvetpulse',
        title: 'Velvetpulse (Cyberpunk Retro-Futuristic Synthwave Beat)',
        localizedTitle: {
            'en-US': 'Velvetpulse (Cyberpunk Retro-Futuristic Synthwave Beat)',
            'ja-JP': 'Velvetpulse (Cyberpunk Retro-Futuristic Synthwave Beat)',
            'de-DE': 'Velvetpulse (Cyberpunk Retro-Futuristic Synthwave Beat)',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23845815',
        beatstarsTrackId: '23845815',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23845815',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "Velvetpulse" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"Velvetpulse"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "Velvetpulse" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'memory-bloom',
        slug: 'memory-bloom',
        title: 'memory bloom (cyberpunk retro-futuristic synthwave beat)',
        localizedTitle: {
            'en-US': 'memory bloom (cyberpunk retro-futuristic synthwave beat)',
            'ja-JP': 'memory bloom (cyberpunk retro-futuristic synthwave beat)',
            'de-DE': 'memory bloom (cyberpunk retro-futuristic synthwave beat)',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23701127',
        beatstarsTrackId: '23701127',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23701127',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "memory bloom" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"memory bloom"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "memory bloom" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'nightflower',
        slug: 'nightflower',
        title: 'NIGHTFLOWER (RETRO-FUTURISTIC SYNTHWAVE BEAT)',
        localizedTitle: {
            'en-US': 'NIGHTFLOWER (RETRO-FUTURISTIC SYNTHWAVE BEAT)',
            'ja-JP': 'NIGHTFLOWER (RETRO-FUTURISTIC SYNTHWAVE BEAT)',
            'de-DE': 'NIGHTFLOWER (RETRO-FUTURISTIC SYNTHWAVE BEAT)',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23690781',
        beatstarsTrackId: '23690781',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23690781',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "NIGHTFLOWER" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"NIGHTFLOWER"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "NIGHTFLOWER" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'zero-hurtz',
        slug: 'zero-hurtz',
        title: 'ZERO HURTZ (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
        localizedTitle: {
            'en-US': 'ZERO HURTZ (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
            'ja-JP': 'ZERO HURTZ (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
            'de-DE': 'ZERO HURTZ (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23682668',
        beatstarsTrackId: '23682668',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23682668',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "ZERO HURTZ" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"ZERO HURTZ"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "ZERO HURTZ" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'easecode',
        slug: 'easecode',
        title: 'EASECODE (CYBERPUNK RETRo-FUTURISTIC SYNTHWAVE BEAT)',
        localizedTitle: {
            'en-US': 'EASECODE (CYBERPUNK RETRo-FUTURISTIC SYNTHWAVE BEAT)',
            'ja-JP': 'EASECODE (CYBERPUNK RETRo-FUTURISTIC SYNTHWAVE BEAT)',
            'de-DE': 'EASECODE (CYBERPUNK RETRo-FUTURISTIC SYNTHWAVE BEAT)',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23671789',
        beatstarsTrackId: '23671789',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23671789',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "EASECODE" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"EASECODE"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "EASECODE" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'silkglitch-cyberpunk-retro-futuristic-synthwave-beat',
        slug: 'silkglitch-cyberpunk-retro-futuristic-synthwave-beat',
        title: 'SILKGLITCH | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
        localizedTitle: {
            'en-US': 'SILKGLITCH | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
            'ja-JP': 'SILKGLITCH | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
            'de-DE': 'SILKGLITCH | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23632641',
        beatstarsTrackId: '23632641',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23632641',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "SILKGLITCH | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"SILKGLITCH | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "SILKGLITCH | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'groovecaine-cyberpunk-retro-futuristic-synthwave-beat',
        slug: 'groovecaine-cyberpunk-retro-futuristic-synthwave-beat',
        title: 'GROOVECAINE | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
        localizedTitle: {
            'en-US': 'GROOVECAINE | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
            'ja-JP': 'GROOVECAINE | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
            'de-DE': 'GROOVECAINE | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23632279',
        beatstarsTrackId: '23632279',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23632279',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "GROOVECAINE | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"GROOVECAINE | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "GROOVECAINE | CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'joybreaker-cyberpunk-synthwave-beat',
        slug: 'joybreaker-cyberpunk-synthwave-beat',
        title: 'Joybreaker CYBERPUNK SYNTHWAVE BEAT',
        localizedTitle: {
            'en-US': 'Joybreaker CYBERPUNK SYNTHWAVE BEAT',
            'ja-JP': 'Joybreaker CYBERPUNK SYNTHWAVE BEAT',
            'de-DE': 'Joybreaker CYBERPUNK SYNTHWAVE BEAT',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23624295',
        beatstarsTrackId: '23624295',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23624295',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "Joybreaker CYBERPUNK SYNTHWAVE BEAT" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"Joybreaker CYBERPUNK SYNTHWAVE BEAT"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "Joybreaker CYBERPUNK SYNTHWAVE BEAT" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    },
    {
        id: 'floatstate',
        slug: 'floatstate',
        title: 'FLOATSTATE (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
        localizedTitle: {
            'en-US': 'FLOATSTATE (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
            'ja-JP': 'FLOATSTATE (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
            'de-DE': 'FLOATSTATE (CYBERPUNK RETRO-FUTURISTIC SYNTHWAVE BEAT)',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Synthwave Trap',
        subgenres: ['Synthwave', 'Retro Trap', 'Cyberpunk Synth'],
        moods: ['Dark', 'Futuristic', 'High-Energy', 'Aggressive'],
        tags: ['Virzy Guns', 'Cyberpunk', 'Synthwave Trap', 'BeatStars'],
        beatstarsProductUrl: 'https://www.beatstars.com/beat/23613920',
        beatstarsTrackId: '23613920',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=23613920',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US': `Official beat "FLOATSTATE" produced by Virzy Guns. Engineered in high-definition audio featuring heavy 808 dynamics, atmospheric synth soundscapes, and driving rhythm designed for vocal tracks and content creation. Choose your license tier directly via BeatStars checkout.`,
            'ja-JP': `Virzy Guns制作の公式ビート"FLOATSTATE"。重厚な808ベースと近未来的なシンセサイザーサウンドが融合したビート。BeatStars公式プレイヤーよりお好みのライセンスを選択して即時ダウンロード可能です。`,
            'de-DE': `Offizieller Beat "FLOATSTATE" von Virzy Guns. High-Definition-Audio mit kraftvollen 808-Drums und atmosphärischen Synths. Wählen Sie Ihre Lizenz direkt über den integrierten BeatStars-Checkout.`,
        },
        sources: {
            identity: 'track-widget-generator',
            trackId: 'track-widget-generator',
            embedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
        },
    }
];

// Getter functions
export function getAllBeats(): BeatProduct[] {
    return beatsCatalog;
}

export function getBeatBySlug(slug: string): BeatProduct | undefined {
    return beatsCatalog.find((b) => b.slug === slug);
}

export function getBeatsByCategory(categorySlug: string): BeatProduct[] {
    const category = categories.find((c) => c.slug === categorySlug);
    if (!category) return [];
    return beatsCatalog.filter(
        (b) => b.primaryGenre === category.primaryGenre || b.subgenres.some((s) => category.subgenres.includes(s))
    );
}

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
    return categories.find((c) => c.slug === slug);
}
