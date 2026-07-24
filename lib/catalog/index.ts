/**
 * Virzy Guns Production - Catalog Source of Truth
 *
 * Full beat catalog data, license specifications, category definitions, and provenance metadata.
 * Strictly adheres to truthfulness rules: no guessed BPM/key, no fake pricing, no thin categories.
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
    {
        slug: 'hard-808',
        name: 'Hard 808 Beats',
        localizedName: {
            'en-US': 'Hard 808 Beats',
            'ja-JP': 'ハード808 ビート',
            'de-DE': 'Hard 808 Beats',
        },
        shortDescription: {
            'en-US': 'Pounding 808 basslines, heavy punch, and aggressive drum patterns for commanding vocals.',
            'ja-JP': '強烈な808ベースパンチと力強いドラムパターンを備えたアグレッシブビート。',
            'de-DE': 'Druckvolle 808-Basslines und aggressive Drum-Patterns für dominante Vocals.',
        },
        fullDescription: {
            'en-US':
                'Engineered with focused low-end transient control and clipping dynamics, these hard 808 instrumentals provide maximum headroom and knock for rap and trap artists.',
            'ja-JP':
                '低音域のダイナミクスを極限まで高めたハード808ビート。圧倒的なアタック感でラップボーカルを引き立てます。',
            'de-DE':
                'Präzise entwickelte Hard-808-Instrumentals mit maximalem Headroom und druckvollem Sub-Bass für Rap- und Trap-Künstler.',
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
            'ja-JP': '力強いキックと808の同調、鋭いスネア、アグレッシブな音響設計。',
            'de-DE': 'Knackige Kick-808-Verbindung, scharfe Snares und aggressives Sounddesign.',
        },
        recommendedVocalFit: {
            'en-US': 'Commanding verse delivery, high-octane rap, hype vocals.',
            'ja-JP': '存在感あるヴァース、ハイエナジーラップ。',
            'de-DE': 'Dominante Verse-Deliveries, High-Energy-Rap und Hype-Vocals.',
        },
    },
    {
        slug: 'phonk',
        name: 'Phonk Beats',
        localizedName: {
            'en-US': 'Phonk Beats',
            'ja-JP': 'フォンク ビート',
            'de-DE': 'Phonk Beats',
        },
        shortDescription: {
            'en-US': 'Underground phonk atmosphere with gritty samples and punchy rhythm.',
            'ja-JP': 'アンダーグラウンドフォンクのダークな雰囲気と強烈なリズムを備えたビート。',
            'de-DE': 'Underground-Phonk-Atmosphäre mit satten Samples und druckvollem Rhythmus.',
        },
        fullDescription: {
            'en-US':
                'Raw, energetic phonk instrumentals combining dark melodies, cowbell rhythmics, and saturated low-end.',
            'ja-JP':
                'ダークなメロディ、カウベルのリズム、飽和した低音を組み合わせたフォンクビート。',
            'de-DE':
                'Rohe Phonk-Instrumentals mit düsteren Melodien, Cowbells und gesättigtem Low-End.',
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
            'ja-JP': '飽和したローエンド、カウベル、テープ質感。',
            'de-DE': 'Gesättigtes Low-End, Cowbell-Motive und Kassetten-Textur.',
        },
        recommendedVocalFit: {
            'en-US': 'Fast rap flows, vocal chants, aggressive delivery.',
            'ja-JP': '高速ラップフロウ、アグレッシブなデリバリー。',
            'de-DE': 'Schnelle Rap-Flows, Chants und aggressive Delivery.',
        },
    },
    {
        slug: 'synthwave',
        name: 'Synthwave Beats',
        localizedName: {
            'en-US': 'Synthwave Beats',
            'ja-JP': 'シンセウェーブ ビート',
            'de-DE': 'Synthwave Beats',
        },
        shortDescription: {
            'en-US': 'Dystopian retro-futuristic synthwave tracks with driving basslines and cinematic scope.',
            'ja-JP': 'シネマティックでレトロフューチャーなシンセウェーブトラック。',
            'de-DE': 'Dystopische Retro-Synthwave-Tracks mit treibenden Basslines.',
        },
        fullDescription: {
            'en-US':
                'Cinematic electronic synthwave instrumentals featuring retro synthesizer design, driving arpeggios, and expansive atmosphere.',
            'ja-JP':
                'レトロシンセサイザーの質感と広がりのある音響空間を併せ持つシネマティックエレクトロニックトラック。',
            'de-DE':
                'Cinematische Synthwave-Instrumentals mit Retro-Synthesizer-Design und weiter Atmosphäre.',
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
            'ja-JP': 'シンセリード、アナログの温かみ、エレクトロニックドラム。',
            'de-DE': 'Synth-Leads, analoge Wärme und elektronische Drums.',
        },
        recommendedVocalFit: {
            'en-US': 'Melodic vocals, electro-pop hooks, atmospheric singing.',
            'ja-JP': 'メロディックボーカル、エレクトロポップフック。',
            'de-DE': 'Melodischer Gesang, Electro-Pop-Hooks und atmosphärische Vocals.',
        },
    },
];

/** Verified Beat Products */
export const beatsCatalog: BeatProduct[] = [
    {
        id: 'phonk-raptor',
        slug: 'phonk-raptor',
        title: 'PHONK RAPTOR',
        localizedTitle: {
            'en-US': 'PHONK RAPTOR | Cyberpunk Phonk Beat',
            'ja-JP': 'PHONK RAPTOR | サイバーパンクフォンク ビート',
            'de-DE': 'PHONK RAPTOR | Cyberpunk Phonk Beat kaufen',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Drift Phonk', 'Hard Phonk', 'Cyberpunk'],
        moods: ['Dark', 'Aggressive', 'High Speed'],
        tags: ['PHONK RAPTOR', 'Cyberpunk Phonk', 'Drift Phonk', 'Virzy Guns'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://www.beatstars.com/embed/track?id=24225531',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: '24225531',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24225531',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'PHONK RAPTOR is a ferocious Cyberpunk Phonk beat featuring overdriven 808 bass slides, crisp Memphis cowbells, and futuristic sci-fi soundscapes engineered by Virzy Guns.',
            'ja-JP':
                'PHONK RAPTORは歪んだ808ベーススライドと高速カウベルを組み合わせた激しいサイバーパンクフォンクビートです。',
            'de-DE':
                'PHONK RAPTOR ist ein aggressiver Cyberpunk-Phonk-Beat mit verzerrten 808-Slides und knackigen Memphis-Cowbells.',
        },
        releaseDate: '2025-01-10',
        updatedAt: '2026-07-24',
        sources: {
            title: 'track-widget-generator',
            beatstarsTrackId: 'track-widget-generator',
            beatstarsEmbedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    {
        id: 'hardcore-phonk-2098',
        slug: 'hardcore-phonk-2098',
        title: 'HARDCORE PHONK 2098',
        localizedTitle: {
            'en-US': 'HARDCORE PHONK 2098 | Hard Phonk Beat',
            'ja-JP': 'HARDCORE PHONK 2098 | ハードフォンク ビート',
            'de-DE': 'HARDCORE PHONK 2098 | Hard Phonk Beat kaufen',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Hard Phonk', 'Drift Phonk'],
        moods: ['Aggressive', 'High Energy', 'Raw'],
        tags: ['HARDCORE PHONK', 'Phonk Beat', 'Hard Phonk', '2098'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://www.beatstars.com/embed/track?id=24276595',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: '24276595',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24276595',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'HARDCORE PHONK 2098 delivers raw, uncompressed 808 distortion with crisp cowbell hooks and aggressive rhythmics.',
            'ja-JP':
                'HARDCORE PHONK 2098は生の808ディストーションと鋭いカウベルフックを備えた最高速度のフォンクビートです。',
            'de-DE':
                'HARDCORE PHONK 2098 liefert rohe 808-Verzerrung mit scharfen Cowbell-Hooks und aggressiver Rhythmik.',
        },
        releaseDate: '2025-04-15',
        updatedAt: '2026-07-24',
        sources: {
            title: 'track-widget-generator',
            beatstarsTrackId: 'track-widget-generator',
            beatstarsEmbedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    {
        id: 'bladephonk-2098',
        slug: 'bladephonk-2098',
        title: 'BLADEPHONK 2098',
        localizedTitle: {
            'en-US': 'BLADEPHONK 2098 | Cyberpunk Phonk Beat',
            'ja-JP': 'BLADEPHONK 2098 | サイバーパンクフォンク ビート',
            'de-DE': 'BLADEPHONK 2098 | Cyberpunk Phonk Beat kaufen',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Phonk',
        subgenres: ['Drift Phonk', 'Hard Phonk', 'Cyberpunk'],
        moods: ['Dark', 'Aggressive', 'Futuristic', 'High Energy'],
        tags: ['BLADEPHONK', 'Cyberpunk Phonk', 'Drift Phonk', 'Phonk Beat', '2098'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://www.beatstars.com/embed/track?id=24276590',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: '24276590',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24276590',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'BLADEPHONK 2098 is a high-octane Cyberpunk Phonk beat engineered by Virzy Guns. Featuring saturated Memphis-style cowbells, driving 808 sub slides, and dystopian synth atmosphere.',
            'ja-JP':
                'BLADEPHONK 2098はメンフィススタイルのカウベルと強力な808サブスライドをフィーチャーした近未来フォンクビートです。',
            'de-DE':
                'BLADEPHONK 2098 ist ein hochenergetischer Cyberpunk-Phonk-Beat mit satten Cowbells und dystopischer Synth-Atmosphäre.',
        },
        releaseDate: '2025-01-15',
        updatedAt: '2026-07-24',
        sources: {
            title: 'track-widget-generator',
            beatstarsTrackId: 'track-widget-generator',
            beatstarsEmbedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    {
        id: 'syn808',
        slug: 'syn808',
        title: 'SYN808',
        localizedTitle: {
            'en-US': 'SYN808 | Cyberpunk Synthwave Trap Beat',
            'ja-JP': 'SYN808 | サイバーパンクシンセウェーブトラップ ビート',
            'de-DE': 'SYN808 | Cyberpunk Synthwave Trap Beat kaufen',
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Synthwave Trap', 'Hard 808', 'Cyberpunk'],
        moods: ['Futuristic', 'Melodic', 'Cinematic', 'Driving'],
        tags: ['SYN808', 'Cyberpunk Trap', 'Synthwave Trap', 'Hard 808'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://www.beatstars.com/embed/track?id=24276585',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: '24276585',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24276585',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                'SYN808 fuses retro synthwave arpeggios with heavy modern 808 trap drum patterns. Designed with pristine mix dynamics to leave clear spectral room for vocal tracks and autotune melodic hooks.',
            'ja-JP':
                'SYN808はレトロなシンセアルペジオと重厚な現代808トラップを融合させたメロディックビートです。',
            'de-DE':
                'SYN808 verschmilzt Retro-Synthwave-Arpeggios mit modernen 808-Trap-Drums für klare Vocal-Tracks.',
        },
        releaseDate: '2025-02-01',
        updatedAt: '2026-07-24',
        sources: {
            title: 'track-widget-generator',
            beatstarsTrackId: 'track-widget-generator',
            beatstarsEmbedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
    {
        id: 'shoguns-daughter-2098',
        slug: 'shoguns-daughter-2098',
        title: "SHOGUN'S DAUGHTER 2098",
        localizedTitle: {
            'en-US': "SHOGUN'S DAUGHTER 2098 | Cyberpunk 808 Trap Beat",
            'ja-JP': "SHOGUN'S DAUGHTER 2098 | サイバーパンク 808 トラップ ビート",
            'de-DE': "SHOGUN'S DAUGHTER 2098 | Cyberpunk 808 Trap Beat kaufen",
        },
        producer: 'Virzy Guns',
        primaryGenre: 'Cyberpunk Trap',
        subgenres: ['Synthwave Trap', 'Hard 808', 'Cinematic Trap'],
        moods: ['Cinematic', 'Dark', 'Epic', 'Atmospheric'],
        tags: ["SHOGUN'S DAUGHTER", 'Cyberpunk Trap', '808 Trap', '2098'],
        coverImageUrl: '/branding/vgp-logo-chrome-full.png',
        previewAudioUrl: 'https://www.beatstars.com/embed/track?id=24276580',
        beatstarsProductUrl: 'https://www.beatstars.com/virzyguns/tracks',
        beatstarsTrackId: '24276580',
        beatstarsEmbedUrl: 'https://www.beatstars.com/embed/track?id=24276580',
        licenses: defaultLicenses,
        availability: 'available',
        description: {
            'en-US':
                "SHOGUN'S DAUGHTER 2098 is a cinematic cyberpunk 808 trap instrumental with lush dystopian pads, tight percussion bounce, and deep sub dynamics.",
            'ja-JP':
                "SHOGUN'S DAUGHTER 2098はディストピア的な音響空間と力強いサブベースを備えた壮大なサイバーパンクトラップビートです。",
            'de-DE':
                "SHOGUN'S DAUGHTER 2098 ist ein cinematischer Cyberpunk 808 Trap Beat mit tiefer Sub-Dynamik.",
        },
        releaseDate: '2025-02-15',
        updatedAt: '2026-07-24',
        sources: {
            title: 'track-widget-generator',
            beatstarsTrackId: 'track-widget-generator',
            beatstarsEmbedUrl: 'track-widget-generator',
            licenses: 'verified-public-page',
            availability: 'verified-public-page',
        },
    },
];

/** Getter Functions */

export function getAllBeats(): BeatProduct[] {
    return beatsCatalog.filter(Boolean);
}

export function getBeatBySlug(slug: string): BeatProduct | undefined {
    return beatsCatalog.find((beat) => beat && beat.slug === slug);
}

export function getBeatsByCategory(categorySlug: string): BeatProduct[] {
    const activeBeats = beatsCatalog.filter(Boolean);
    const category = categories.find((cat) => cat && cat.slug === categorySlug);
    if (!category) return activeBeats;

    return activeBeats.filter((beat) => {
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
    return categories.filter(Boolean);
}

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
    return categories.find((cat) => cat && cat.slug === slug);
}

export function getFeaturedBeats(): BeatProduct[] {
    return beatsCatalog.filter(Boolean).slice(0, 3);
}
