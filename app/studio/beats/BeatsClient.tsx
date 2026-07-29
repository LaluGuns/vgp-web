'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Bookmark, Check, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Gift, Instagram, Mail, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell } from '@/components/editorial/EditorialPrimitives';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';
import { catalogCredentials } from '@/lib/vgp-ecosystem';
import { categories, beatsCatalog, type BeatProduct } from '@/lib/catalog';
import {
    getEditorialBeatWorld,
    getOfficialBeatStarsGenres,
    officialBeatStarsGenreOptions,
} from '@/lib/catalog/beatstars-genre-index';
import { trackBeatEvent } from '@/lib/analytics';
import { getBeatSummary } from '@/lib/seo/beat-copy';
import { getFounderGmailComposeUrl } from '@/lib/founder-contact';
import { getGenreTheme } from '@/lib/genre-theme';
import beatStarsFilterIndexJson from '@/data/beatstars-filter-index.json';
import BeatStarsAudioPlayer from './components/BeatStarsAudioPlayer';
import BeatStarsCheckoutModal from './components/BeatStarsCheckoutModal';
import BeatStoreGuide, {
    type BeatFinderPreset,
    type BeatGuideMode,
} from './components/BeatStoreGuide';
import GenreSignalHeader from './components/GenreSignalHeader';

interface BeatsClientProps {
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const copyDict = {
    'en-US': {
        eyebrow: 'VGP Studio / Beat Store',
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats',
        mutedTitle: 'Pick the sound. Write the record.',
        description: 'Start with the feeling, not a genre dropdown. Preview the beat, find the pocket for your vocal, then choose your BeatStars license when it clicks.',
        credentialsTag: 'Verified track record',
        credentialsTitle: 'Credits you can verify.',
        credentialsSub: 'View songwriting, artist, and producer credits on MUSO.AI.',
        categoriesTag: 'Shop by sound',
        categoriesTitle: 'Choose the mood before the beat.',
        categoriesSub: 'Heavy 808 pressure, distorted phonk, or neon synth melodies. Start with the feeling your vocal needs.',
        catalogTag: 'Beat Inventory',
        catalogTitle: 'Find the beat that gives the record a pulse.',
        catalogSub: 'Every beat is ready to audition. Press play, find the pocket for your vocal, then choose your license on BeatStars.',
        catalogMeta: 'Preview every beat · Licenses from $15 · Official BeatStars checkout',
        categoryCta: (name: string) => `Browse ${name}`,
        filterAll: 'All Beats',
        playerTag: 'BeatStars Catalog Player',
        playerTitle: 'Official Audio Store Player',
        playerSub: 'Interactive store player powered by BeatStars. Secure checkout and instant file delivery.',
        licensesTag: 'Release Tiers',
        licensesTitle: 'Non-exclusive licenses.',
        readLicensing: 'Read full licensing terms & FAQ',
        chooseBeatstars: 'Choose License on BeatStars',
        commissionsTag: 'Private commissions',
        commissionsTitle: 'Exclusive rights or custom beats.',
        commissionsSub: 'Want to ask about exclusive availability or commission a custom beat? Tell us about your project.',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'Email Direct',
        dmCustom: 'Custom Beat DM',
        exclusiveIncludes: 'What we confirm directly',
        viewBeatPage: 'License details',
        officialTrack: 'Official Track',
        exclusiveBoxHeader: 'Exclusive license inquiry',
        exclusiveBoxText: 'Ask whether this beat is available for an exclusive license. The scope, files, and any store removal are confirmed directly in writing.',
        secureCheckout: 'Secure checkout & instant MP3/WAV/Stems delivery',
        playAudio: 'Play Audio Preview',
        pauseAudio: 'Pause Audio',
        exclusiveEmailSubject: 'Exclusive license inquiry',
        exclusiveEmailBody: 'Hi Virzy Guns,\n\nI would like to discuss an exclusive license for a beat.\n\nProject details:',
    },
    'ja-JP': {
        eyebrow: 'VGPスタジオ / ビートストア',
        title: 'サイバーパンクトラップ・フォンク・シンセウェーブ ビート販売',
        mutedTitle: '曲の核になるサウンドを選ぶ。',
        description: 'ジャンルからではなく、まずムードから選ぶ。試聴して、しっくり来たらBeatStarsでライセンスを選べます。',
        credentialsTag: '実績証明',
        credentialsTitle: '確認できるクレジット。',
        credentialsSub: 'MUSO.AIで確認できる作詞、アーティスト、プロデュースのクレジット。',
        categoriesTag: 'ジャンル別検索',
        categoriesTitle: 'ビートより先に、ムードを選ぶ。',
        categoriesSub: '重い808、歪んだフォンク、ネオンのシンセ。ボーカルに合う質感から探せます。',
        catalogTag: 'ビートインベントリ',
        catalogTitle: '曲に火をつけるビートを見つける。',
        catalogSub: 'すべてのビートを試聴できます。ボーカルに合う一曲を見つけたら、BeatStarsでライセンスを選んでください。',
        catalogMeta: '全曲試聴 · ライセンスは$15から · BeatStars公式決済',
        categoryCta: (name: string) => `${name}を見る`,
        filterAll: 'すべてのビート',
        playerTag: 'BeatStars公式プレーヤー',
        playerTitle: 'オフィシャル試聴プレーヤー',
        playerSub: 'BeatStars提供のインタラクティブストア。安全な決済と即時ファイル配信。',
        licensesTag: 'ライセンス体系',
        licensesTitle: '非独占ライセンス規約',
        readLicensing: 'ライセンス規約とFAQを読む',
        chooseBeatstars: 'BeatStarsで購入する',
        commissionsTag: '個別の制作依頼',
        commissionsTitle: '独占ライセンス権・カスタム制作',
        commissionsSub: '独占ライセンスの可否やカスタムビートについて相談したい場合は、プロジェクトの内容をお聞かせください。',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'メールで相談',
        dmCustom: 'カスタム制作のDM相談',
        exclusiveIncludes: '直接確認する内容',
        viewBeatPage: 'ビート詳細を見る',
        officialTrack: '公式トラック',
        exclusiveBoxHeader: '独占ライセンスのお問い合わせ',
        exclusiveBoxText: 'このビートが独占ライセンスの対象かお問い合わせください。利用範囲、ファイル内容、ストアからの取り下げの有無は書面で直接確認します。',
        secureCheckout: '安全な決済および即時MP3/WAV/ステム配信',
        playAudio: '試聴再生',
        pauseAudio: '一時停止',
        exclusiveEmailSubject: '独占ライセンスのお問い合わせ',
        exclusiveEmailBody: 'Virzy Guns様\n\nビートの独占ライセンスについて伺いたいです。\n\nプロジェクトの詳細:',
    },
    'de-DE': {
        eyebrow: 'VGP Studio / Beat Store',
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats',
        mutedTitle: 'Finde den Sound für deinen nächsten Record.',
        description: 'Starte nicht beim Genre. Hör rein, finde den Beat für deine Vocal und wähle die passende Lizenz bei BeatStars.',
        credentialsTag: 'Verifizierte Erfolge',
        credentialsTitle: 'Nachprüfbare Credits.',
        credentialsSub: 'Songwriting-, Artist- und Producer-Credits auf MUSO.AI einsehen.',
        categoriesTag: 'Nach Sound filtern',
        categoriesTitle: 'Erst die Stimmung, dann der Beat.',
        categoriesSub: 'Schwere 808s, verzerrter Phonk oder Neon-Synths. Fang bei dem Gefühl an, das deine Vocal braucht.',
        catalogTag: 'Beat-Inventar',
        catalogTitle: 'Finde den Beat, der deinem Record Puls gibt.',
        catalogSub: 'Jeder Beat ist bereit zum Anhören. Finde den Raum für deine Stimme und wähle die Lizenz bei BeatStars, wenn es passt.',
        catalogMeta: 'Jeden Beat anhören · Lizenzen ab 15 $ · Offizieller BeatStars-Checkout',
        categoryCta: (name: string) => `${name} ansehen`,
        filterAll: 'Alle Beats',
        playerTag: 'BeatStars Catalog Player',
        playerTitle: 'Offizieller Audio-Showcase',
        playerSub: 'Interaktiver Store-Player betrieben von BeatStars. Sichere Kasse und sofortige Dateilieferung.',
        licensesTag: 'Lizenzstufen',
        licensesTitle: 'Nicht-exklusive Lizenzen.',
        readLicensing: 'Vollständige Lizenzbedingungen & FAQ lesen',
        chooseBeatstars: 'Auf BeatStars wählen',
        commissionsTag: 'Private Aufträge',
        commissionsTitle: 'Exklusivrechte oder Custom Beats.',
        commissionsSub: 'Möchtest du nach einer Exklusivlizenz fragen oder einen individuellen Beat beauftragen? Erzähl uns von deinem Projekt.',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'E-Mail Direkt',
        dmCustom: 'DM für Custom Beat',
        exclusiveIncludes: 'Direkt zu klären',
        viewBeatPage: 'Beat-Seite anzeigen',
        officialTrack: 'Offizieller Track',
        exclusiveBoxHeader: 'Anfrage zur Exklusivlizenz',
        exclusiveBoxText: 'Frag an, ob dieser Beat für eine Exklusivlizenz verfügbar ist. Umfang, Dateien und eine mögliche Entfernung aus dem Store werden direkt schriftlich bestätigt.',
        secureCheckout: 'Sichere Kasse & sofortige MP3/WAV/Stems Lieferung',
        playAudio: 'Audio abspielen',
        pauseAudio: 'Pause',
        exclusiveEmailSubject: 'Anfrage zu einer Exklusivlizenz',
        exclusiveEmailBody: 'Hallo Virzy Guns,\n\nich möchte mich nach einer Exklusivlizenz für einen Beat erkundigen.\n\nProjektdetails:',
    },
};

const nonExclusiveLicenses = [
    {
        name: 'Basic MP3',
        price: '$15',
        copies: '2,000 Copies',
        streams: '5K Streams',
        features: ['MP3 File (320kbps)', '1 Music Video'],
    },
    {
        name: 'Basic Pro Lease',
        price: '$25',
        copies: '5,000 Copies',
        streams: '200K Streams',
        features: ['MP3 + WAV (24-Bit)', '1 Music Video', 'For-Profit Performances', 'Radio (2 Stations)'],
    },
    {
        name: 'Premium Lease',
        price: '$50',
        copies: '10,000 Copies',
        streams: '500K Streams',
        features: ['MP3 + WAV + Stems', '1 Music Video', 'For-Profit Performances', 'Radio (2 Stations)'],
    },
    {
        name: 'UNLIMITED Lease',
        price: '$100',
        copies: 'UNLIMITED Copies',
        streams: 'UNLIMITED Streams',
        features: ['MP3 + WAV + Track Stems', '2 Music Videos', 'For-Profit Performances', 'Radio (2 Stations)'],
    },
];

const licenseTierCopy = {
    'en-US': [
        { copies: '2,000 sales', streams: '5,000 streams', features: ['MP3 file (320kbps)', '1 music video'] },
        { copies: '5,000 sales', streams: '200,000 streams', features: ['MP3 + WAV (24-bit)', '1 music video', 'For-profit performances', 'Radio: 2 stations'] },
        { copies: '10,000 sales', streams: '500,000 streams', features: ['MP3 + WAV + stems', '1 music video', 'For-profit performances', 'Radio: 2 stations'] },
        { copies: 'UNLIMITED sales', streams: 'UNLIMITED streams', features: ['MP3 + WAV + stems', '2 music videos', 'For-profit performances', 'Radio: 2 stations'] },
    ],
    'ja-JP': [
        { copies: '販売上限：2,000', streams: 'ストリーミング：5,000回', features: ['MP3ファイル（320kbps）', 'ミュージックビデオ1本'] },
        { copies: '販売上限：5,000', streams: 'ストリーミング：20万回', features: ['MP3 + WAV（24-bit）', 'ミュージックビデオ1本', '収益化パフォーマンス可', 'ラジオ：2局'] },
        { copies: '販売上限：10,000', streams: 'ストリーミング：50万回', features: ['MP3 + WAV + ステム', 'ミュージックビデオ1本', '収益化パフォーマンス可', 'ラジオ：2局'] },
        { copies: '販売上限なし', streams: 'ストリーミング上限なし', features: ['MP3 + WAV + ステム', 'ミュージックビデオ2本', '収益化パフォーマンス可', 'ラジオ：2局'] },
    ],
    'de-DE': [
        { copies: '2.000 Verkäufe', streams: '5.000 Streams', features: ['MP3-Datei (320 kbps)', '1 Musikvideo'] },
        { copies: '5.000 Verkäufe', streams: '200.000 Streams', features: ['MP3 + WAV (24-Bit)', '1 Musikvideo', 'Kommerzielle Auftritte', 'Radio: 2 Sender'] },
        { copies: '10.000 Verkäufe', streams: '500.000 Streams', features: ['MP3 + WAV + Stems', '1 Musikvideo', 'Kommerzielle Auftritte', 'Radio: 2 Sender'] },
        { copies: 'Unbegrenzte Verkäufe', streams: 'Unbegrenzte Streams', features: ['MP3 + WAV + Stems', '2 Musikvideos', 'Kommerzielle Auftritte', 'Radio: 2 Sender'] },
    ],
} as const;

const exclusiveBenefits = {
    'en-US': ['Ask about current availability', 'Scope confirmed directly in writing', 'Files and delivery confirmed before purchase', 'Catalog removal discussed when applicable'],
    'ja-JP': ['現在の提供状況を確認', '利用範囲を書面で直接確認', '購入前にファイルと納品内容を確認', '該当する場合はストアからの取り下げを相談'],
    'de-DE': ['Aktuelle Verfügbarkeit anfragen', 'Umfang direkt schriftlich bestätigen', 'Dateien und Lieferung vor dem Kauf bestätigen', 'Entfernung aus dem Katalog bei Bedarf besprechen'],
} as const;

const instagramDmUrl = 'https://ig.me/m/virzyguns';
const PAGE_SIZE = 24;

type BeatFilterMetadata = {
    bpm: number | null;
    key: string | null;
    duration: number | null;
    genres: string[];
    tags: string[];
};

const beatStarsFilterIndex = beatStarsFilterIndexJson as Record<string, BeatFilterMetadata>;

type TempoFilter = 'all' | 'under-90' | '90-109' | '110-129' | '130-plus';
type DurationFilter = 'all' | 'short' | 'standard' | 'long';

const tempoMatches = (bpm: number | null, filter: TempoFilter) => {
    if (filter === 'all') return true;
    if (!bpm) return false;
    if (filter === 'under-90') return bpm < 90;
    if (filter === '90-109') return bpm >= 90 && bpm <= 109;
    if (filter === '110-129') return bpm >= 110 && bpm <= 129;
    return bpm >= 130;
};

const durationMatches = (duration: number | null, filter: DurationFilter) => {
    if (filter === 'all') return true;
    if (!duration) return false;
    if (filter === 'short') return duration < 180;
    if (filter === 'standard') return duration >= 180 && duration < 240;
    return duration >= 240;
};

const vibeMatchers = {
    Aggressive: /aggressive|hard 808|hard trap|rage|drill|grime/i,
    Dark: /dark|cyberpunk|phonk|dystopian|horror/i,
    Melodic: /melodic|synthwave|synthpop|pop|r&b|soul|orchestral/i,
    Chill: /chill|lo-?fi|ambient|deep house|relax/i,
    Club: /club|house|dance|jersey|techno|edm/i,
} as const;

type VibeFilter = 'all' | keyof typeof vibeMatchers;

function getTrackVibes(beat: BeatProduct, metadata?: BeatFilterMetadata) {
    const editorialWorld = getEditorialBeatWorld(beat.beatstarsTrackId);
    const source = [
        beat.title,
        editorialWorld,
        ...beat.subgenres,
        ...(metadata?.genres || []),
        ...(metadata?.tags || []),
    ].filter(Boolean).join(' ');

    return (Object.entries(vibeMatchers) as Array<[keyof typeof vibeMatchers, RegExp]>)
        .flatMap(([vibe, matcher]) => matcher.test(source) ? [vibe] : []);
}

function normalizeGenreId(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const catalogCopy = {
    'en-US': {
        search: 'Search title, genre, or mood',
        clear: 'Clear search',
        showing: (shown: number, total: number) => `Showing ${shown} of ${total} official beats`,
        noResults: 'No beats match that search yet.',
        reset: 'Reset filters',
        cardHint: 'Open the beat page for the official preview and license options.',
        openBeatStars: 'Open on BeatStars',
        buy: (price: string) => `License from ${price}`,
        previous: 'Previous',
        next: 'Next',
        scrollGenresLeft: 'Show previous genres',
        scrollGenresRight: 'Show more genres',
        signatureGenres: 'VGP sound tags',
        officialGenres: 'BeatStars genres',
        moreGenres: 'More genres',
        closeGenres: 'Close genres',
        genreSearch: 'Find a BeatStars genre',
        popularGenres: 'Popular BeatStars genres',
        showAllGenres: 'Show all genres',
        showPopularGenres: 'Show popular genres',
        promoTitle: 'Buy 2, get 1 free',
        promoText: 'Add every qualifying beat with the same eligible license. BeatStars confirms and applies the discount in its cart.',
        promoCta: 'Open onsite checkout',
        shortlist: 'Add to release kit',
        shortlisted: 'In release kit',
        shortlistFull: 'Your release kit already has 3 beats',
        shortlistTitle: (count: number) => count === 3 ? 'Your 3-beat release kit is ready' : `${count}/3 beats in your release kit`,
        shortlistText: (count: number) => count === 3 ? 'Open the embedded BeatStars checkout and add each qualifying beat with the same eligible license.' : `Add ${3 - count} more ${3 - count === 1 ? 'beat' : 'beats'} to compare a complete release set.`,
        shortlistCta: 'License inside this site',
        clearShortlist: 'Clear release kit',
        filterLabel: 'Shape the search',
        filtersOpen: 'More filters',
        filtersClose: 'Hide filters',
        tempo: 'Tempo',
        allTempos: 'All BPM',
        key: 'Key',
        allKeys: 'All keys',
        vibe: 'Vibe',
        allVibes: 'All vibes',
        duration: 'Length',
        allDurations: 'Any length',
        shortDuration: 'Under 3:00',
        standardDuration: '3:00–3:59',
        longDuration: '4:00+',
        checkout: 'License here',
        chooseBeatFirst: 'Choose a beat first',
        guide: 'Beat finder guide',
        page: (current: number, total: number) => `Page ${current} of ${total}`,
    },
    'ja-JP': {
        search: 'タイトル、ジャンル、ムードで検索',
        clear: '検索をクリア',
        showing: (shown: number, total: number) => `${total}曲中 ${shown}曲を表示`,
        noResults: 'その検索に合うビートはまだありません。',
        reset: 'フィルターをリセット',
        cardHint: '公式プレビューとライセンスはビートページで確認できます。',
        openBeatStars: 'BeatStars で開く',
        buy: (price: string) => `${price} からライセンス`,
        previous: '前へ',
        next: '次へ',
        scrollGenresLeft: '前のジャンルを表示',
        scrollGenresRight: '次のジャンルを表示',
        signatureGenres: 'VGPサウンドタグ',
        officialGenres: 'BeatStarsジャンル',
        moreGenres: 'その他のジャンル',
        closeGenres: 'ジャンルを閉じる',
        genreSearch: 'BeatStarsジャンルを検索',
        popularGenres: '人気のBeatStarsジャンル',
        showAllGenres: 'すべてのジャンルを表示',
        showPopularGenres: '人気ジャンルに戻る',
        promoTitle: '2曲購入で1曲無料',
        promoText: '対象曲を同じ対象ライセンスで追加してください。割引条件と適用結果はBeatStarsのカートで確認されます。',
        promoCta: 'サイト内チェックアウト',
        shortlist: 'リリース候補に追加',
        shortlisted: '候補に追加済み',
        shortlistFull: 'リリース候補は3曲までです',
        shortlistTitle: (count: number) => count === 3 ? '3曲のリリース候補がそろいました' : `${count}/3曲をリリース候補に追加`,
        shortlistText: (count: number) => count === 3 ? '埋め込みBeatStarsチェックアウトで、対象曲を同じ対象ライセンスで追加してください。' : `あと${3 - count}曲を追加してリリース候補を比較できます。`,
        shortlistCta: 'このサイトでライセンス購入',
        clearShortlist: '候補をクリア',
        filterLabel: '検索条件',
        filtersOpen: '詳細フィルター',
        filtersClose: 'フィルターを閉じる',
        tempo: 'テンポ',
        allTempos: 'すべてのBPM',
        key: 'キー',
        allKeys: 'すべてのキー',
        vibe: 'バイブ',
        allVibes: 'すべてのバイブ',
        duration: '長さ',
        allDurations: 'すべての長さ',
        shortDuration: '3分未満',
        standardDuration: '3:00〜3:59',
        longDuration: '4分以上',
        checkout: 'ここでライセンス購入',
        chooseBeatFirst: '先にビートを選ぶ',
        guide: 'ビート選びガイド',
        page: (current: number, total: number) => `${current} / ${total} ページ`,
    },
    'de-DE': {
        search: 'Titel, Genre oder Stimmung suchen',
        clear: 'Suche löschen',
        showing: (shown: number, total: number) => `${shown} von ${total} offiziellen Beats`,
        noResults: 'Zu dieser Suche gibt es noch keine Beats.',
        reset: 'Filter zurücksetzen',
        cardHint: 'Auf der Beat-Seite findest du die offizielle Vorschau und Lizenzoptionen.',
        openBeatStars: 'Bei BeatStars öffnen',
        buy: (price: string) => `Lizenz ab ${price}`,
        previous: 'Zurück',
        next: 'Weiter',
        scrollGenresLeft: 'Vorherige Genres anzeigen',
        scrollGenresRight: 'Weitere Genres anzeigen',
        signatureGenres: 'VGP-Sound-Tags',
        officialGenres: 'BeatStars-Genres',
        moreGenres: 'Weitere Genres',
        closeGenres: 'Genres schließen',
        genreSearch: 'BeatStars-Genre suchen',
        popularGenres: 'Beliebte BeatStars-Genres',
        showAllGenres: 'Alle Genres anzeigen',
        showPopularGenres: 'Beliebte Genres anzeigen',
        promoTitle: '2 kaufen, 1 gratis',
        promoText: 'Lege alle qualifizierten Beats mit derselben berechtigten Lizenz in den Warenkorb. BeatStars bestätigt und verrechnet den Rabatt dort.',
        promoCta: 'Checkout auf dieser Seite',
        shortlist: 'Zum Release-Kit',
        shortlisted: 'Im Release-Kit',
        shortlistFull: 'Dein Release-Kit enthält bereits 3 Beats',
        shortlistTitle: (count: number) => count === 3 ? 'Dein Release-Kit mit 3 Beats ist bereit' : `${count}/3 Beats im Release-Kit`,
        shortlistText: (count: number) => count === 3 ? 'Öffne den eingebetteten BeatStars-Checkout und füge jeden qualifizierten Beat mit derselben Lizenz hinzu.' : `Füge noch ${3 - count} ${3 - count === 1 ? 'Beat' : 'Beats'} hinzu, um ein vollständiges Release-Set zu vergleichen.`,
        shortlistCta: 'Auf dieser Seite lizenzieren',
        clearShortlist: 'Release-Kit leeren',
        filterLabel: 'Suche formen',
        filtersOpen: 'Mehr Filter',
        filtersClose: 'Filter ausblenden',
        tempo: 'Tempo',
        allTempos: 'Alle BPM',
        key: 'Tonart',
        allKeys: 'Alle Tonarten',
        vibe: 'Vibe',
        allVibes: 'Alle Vibes',
        duration: 'Länge',
        allDurations: 'Jede Länge',
        shortDuration: 'Unter 3:00',
        standardDuration: '3:00–3:59',
        longDuration: '4:00+',
        checkout: 'Hier lizenzieren',
        chooseBeatFirst: 'Zuerst Beat wählen',
        guide: 'Beat-Finder-Guide',
        page: (current: number, total: number) => `Seite ${current} von ${total}`,
    },
} as const;

export default function BeatsClient({ locale = 'en-US' }: BeatsClientProps) {
    const t = copyDict[locale] || copyDict['en-US'];
    const catalogText = catalogCopy[locale];
    const localizedLicenses = nonExclusiveLicenses.map((license, index) => ({
        ...license,
        ...licenseTierCopy[locale][index],
    }));
    const [selectedGenre, setSelectedGenre] = useState<string>('all');
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showGenrePanel, setShowGenrePanel] = useState(false);
    const [showAllOfficialGenres, setShowAllOfficialGenres] = useState(false);
    const [genreQuery, setGenreQuery] = useState('');
    const [shortlistedBeatIds, setShortlistedBeatIds] = useState<string[]>([]);
    const [tempoFilter, setTempoFilter] = useState<TempoFilter>('all');
    const [keyFilter, setKeyFilter] = useState('all');
    const [vibeFilter, setVibeFilter] = useState<VibeFilter>('all');
    const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutBeatSelections, setCheckoutBeatSelections] = useState<Array<{ trackId: string; title: string; productUrl: string }>>([]);
    const [guideOpen, setGuideOpen] = useState(false);
    const [guideMode, setGuideMode] = useState<BeatGuideMode>('store');
    const genreScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const requestedPanel = params.get('panel');
        if (requestedPanel === 'store' || requestedPanel === 'finder') {
            const frame = window.requestAnimationFrame(() => {
                setGuideMode(requestedPanel);
                setGuideOpen(true);
            });
            params.delete('panel');
            const nextSearch = params.toString();
            window.history.replaceState(
                null,
                '',
                `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`,
            );
            return () => window.cancelAnimationFrame(frame);
        }

        if (window.localStorage.getItem('vgp-beat-store-guide-seen')) return;
        const timer = window.setTimeout(() => setGuideOpen(true), 900);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const openStoreGuide = () => {
            setGuideMode('store');
            setGuideOpen(true);
        };
        const openFinderGuide = () => {
            setGuideMode('finder');
            setGuideOpen(true);
        };

        window.addEventListener('vgp:open-store-guide', openStoreGuide);
        window.addEventListener('vgp:open-finder-guide', openFinderGuide);
        return () => {
            window.removeEventListener('vgp:open-store-guide', openStoreGuide);
            window.removeEventListener('vgp:open-finder-guide', openFinderGuide);
        };
    }, []);

    const closeGuide = () => {
        window.localStorage.setItem('vgp-beat-store-guide-seen', 'true');
        setGuideOpen(false);
    };

    const openGuide = (mode: BeatGuideMode) => {
        setGuideMode(mode);
        setGuideOpen(true);
    };

    const applyFinderPreset = (preset: BeatFinderPreset) => {
        const vibeByPreset = {
            aggressive: 'Aggressive',
            melodic: 'Melodic',
            club: 'Club',
            chill: 'Chill',
        } as const;

        setQuery('');
        setSelectedGenre('all');
        setTempoFilter('all');
        setKeyFilter('all');
        setDurationFilter('all');
        setVibeFilter(vibeByPreset[preset]);
        setShowAdvancedFilters(true);
        setCurrentPage(1);
        trackBeatEvent('beat_finder_preset_applied', {
            preset,
            vibe: vibeByPreset[preset],
            sourcePage: 'beat-catalog',
        });
    };

    const openCheckout = (beats: BeatProduct[] = []) => {
        if (!beats.length) return;
        const selections = beats.map((beat) => ({
            trackId: beat.beatstarsTrackId,
            title: beat.title,
            productUrl: beat.beatstarsProductUrl,
        }));
        setCheckoutBeatSelections(selections);
        setCheckoutOpen(true);
        trackBeatEvent('beatstars_checkout_modal_opened', {
            beatCount: selections.length,
            beatIds: selections.map((beat) => beat.trackId).join(','),
            beatTitle: selections.map((beat) => beat.title).join(' | '),
            sourcePage: 'beat-catalog',
        });
    };

    const scrollGenres = (direction: 'left' | 'right') => {
        const container = genreScrollRef.current;
        if (!container) return;

        container.scrollLeft += direction === 'left' ? -260 : 260;
    };

    const signatureGenres = [
        { id: 'signature:cyberpunk-trap', label: 'Cyberpunk Trap' },
        { id: 'signature:cyberpunk-phonk', label: 'Cyberpunk Phonk' },
        { id: 'signature:synthwave-trap', label: 'Synthwave Trap' },
        { id: 'signature:retro-synth', label: 'Retro Synth' },
        { id: 'signature:drift-phonk', label: 'Drift Phonk' },
        { id: 'signature:drill', label: 'Drill' },
        { id: 'signature:house', label: 'House' },
        { id: 'signature:lo-fi', label: 'Lo-fi' },
        { id: 'signature:r-b', label: 'R&B' },
    ];
    const officialGenres = officialBeatStarsGenreOptions.map((genre) => ({
        id: `official:${genre.id}`,
        label: genre.label,
        count: genre.count,
    }));
    const normalizedGenreQuery = genreQuery.trim().toLowerCase();
    const matchingOfficialGenres = officialGenres.filter((genre) => (
        !normalizedGenreQuery || genre.label.toLowerCase().includes(normalizedGenreQuery)
    ));
    const visibleOfficialGenres = normalizedGenreQuery || showAllOfficialGenres
        ? matchingOfficialGenres
        : matchingOfficialGenres.slice(0, 12);
    const selectedOfficialGenre = selectedGenre.startsWith('official:')
        ? officialGenres.find((genre) => genre.id === selectedGenre)
        : undefined;

    const availableKeys = useMemo(() => Array.from(new Set(
        Object.values(beatStarsFilterIndex)
            .map((metadata) => metadata.key)
            .filter((key): key is string => Boolean(key && key !== 'None')),
    )).sort((a, b) => a.localeCompare(b)), []);

    const filteredBeats = useMemo(() => beatsCatalog.filter((beat) => {
        const metadata = beatStarsFilterIndex[beat.beatstarsTrackId];
        const officialGenres = getOfficialBeatStarsGenres(beat.beatstarsTrackId);
        const editorialWorld = getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
        const matchesGenre = selectedGenre === 'all' || (
            selectedGenre.startsWith('official:')
                ? officialGenres.some((genre) => `official:${normalizeGenreId(genre)}` === selectedGenre)
                : [editorialWorld, ...beat.subgenres, ...beat.tags]
                    .some((genre) => `signature:${normalizeGenreId(genre)}` === selectedGenre)
        );
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery = !normalizedQuery || [
            beat.title,
            editorialWorld,
            ...beat.subgenres,
            ...beat.moods,
            ...beat.tags,
            ...officialGenres,
            ...(metadata?.tags || []),
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
        const matchesTempo = tempoMatches(metadata?.bpm ?? null, tempoFilter);
        const matchesKey = keyFilter === 'all' || metadata?.key === keyFilter;
        const matchesVibe = vibeFilter === 'all' || getTrackVibes(beat, metadata).includes(vibeFilter);
        const matchesDuration = durationMatches(metadata?.duration ?? beat.durationSeconds ?? null, durationFilter);

        return matchesGenre && matchesQuery && matchesTempo && matchesKey && matchesVibe && matchesDuration;
    }), [durationFilter, keyFilter, query, selectedGenre, tempoFilter, vibeFilter]);
    const pageCount = Math.max(1, Math.ceil(filteredBeats.length / PAGE_SIZE));
    const visibleBeats = filteredBeats.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const shortlistedBeats = beatsCatalog.filter((beat) => shortlistedBeatIds.includes(beat.id));
    const selectedGenreLabel = selectedGenre === 'all'
        ? t.filterAll
        : selectedOfficialGenre?.label
            || signatureGenres.find((genre) => genre.id === selectedGenre)?.label
            || t.filterAll;
    const filteredBpms = filteredBeats
        .map((beat) => beatStarsFilterIndex[beat.beatstarsTrackId]?.bpm)
        .filter((bpm): bpm is number => Boolean(bpm));
    const minBpm = filteredBpms.length ? Math.min(...filteredBpms) : 64;
    const maxBpm = filteredBpms.length ? Math.max(...filteredBpms) : 190;
    const bpmRange = minBpm === maxBpm ? String(minBpm) : `${minBpm}–${maxBpm}`;
    const bpmMidpoint = (minBpm + maxBpm) / 2;
    const hasAdvancedFilters = tempoFilter !== 'all' || keyFilter !== 'all' || vibeFilter !== 'all' || durationFilter !== 'all';

    const toggleShortlist = (beat: BeatProduct) => {
        const isShortlisted = shortlistedBeatIds.includes(beat.id);
        if (!isShortlisted && shortlistedBeatIds.length >= 3) return;

        setShortlistedBeatIds((current) => (
            current.includes(beat.id)
                ? current.filter((id) => id !== beat.id)
                : [...current, beat.id]
        ));
        trackBeatEvent('beat_shortlist_toggled', {
            beatId: beat.id,
            beatSlug: beat.slug,
            beatTitle: beat.title,
            action: isShortlisted ? 'removed' : 'added',
            sourcePage: 'beat-catalog',
        });
    };

    const resetFilters = () => {
        setQuery('');
        setSelectedGenre('all');
        setTempoFilter('all');
        setKeyFilter('all');
        setVibeFilter('all');
        setDurationFilter('all');
        setCurrentPage(1);
    };

    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    return (
        <PageTransition>
            <article className="editorial-shell flex min-h-screen flex-col text-white pt-24 pb-20">
                {/* Language Switcher Navbar */}
                <div className="mx-auto max-w-5xl px-6 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-200/60">
                        <span>Virzy Guns Production</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-white/50 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/10">
                        <Link href="/studio/beats" className={`hover:text-white transition ${locale === 'en-US' ? 'text-sky-200 font-bold' : ''}`}>English (EN)</Link>
                        <span>|</span>
                        <Link href="/ja-JP/studio/beats" className={`hover:text-white transition ${locale === 'ja-JP' ? 'text-sky-200 font-bold' : ''}`}>日本語 (JA)</Link>
                        <span>|</span>
                        <Link href="/de-DE/studio/beats" className={`hover:text-white transition ${locale === 'de-DE' ? 'text-sky-200 font-bold' : ''}`}>Deutsch (DE)</Link>
                    </div>
                </div>

                <GenreSignalHeader
                    locale={locale}
                    genreLabel={selectedGenreLabel}
                    isAllGenres={selectedGenre === 'all'}
                    resultCount={filteredBeats.length}
                    totalCount={beatsCatalog.length}
                    bpmRange={bpmRange}
                    bpmMidpoint={bpmMidpoint}
                    checkoutCount={shortlistedBeats.length}
                    onGuideOpen={() => openGuide('store')}
                    onCheckoutOpen={() => openCheckout(shortlistedBeats)}
                />

                {/* Verified Credentials */}
                <SectionShell id="credentials" className="order-[50] border-y border-white/[0.08] bg-white/[0.012] py-10 sm:py-12">
                    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55">
                                {t.credentialsTag}
                            </p>
                            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                                {t.credentialsTitle}
                            </h2>
                            <p className="mt-3 max-w-md text-xs leading-6 text-white/55 sm:text-sm">
                                {t.credentialsSub}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                            {catalogCredentials.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group border-t border-white/[0.1] pt-3 transition hover:border-sky-200/40 focus:outline-none"
                                >
                                    <p className="text-xl font-semibold leading-none text-white">{item.value}</p>
                                    <p className="mt-2 flex items-center gap-1 text-[11px] leading-4 text-white/55 transition group-hover:text-sky-100">
                                        {item.label}
                                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                {/* Genre Category Cards */}
                <SectionShell id="catalog-categories" className="order-[20] border-b border-white/[0.08] py-12">
                    <div className="mx-auto max-w-5xl">
                        <div className="max-w-2xl mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">{t.categoriesTag}</p>
                            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{t.categoriesTitle}</h2>
                            <p className="mt-2 text-xs leading-6 text-white/70 sm:text-sm">
                                {t.categoriesSub}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((cat) => {
                                const theme = getGenreTheme(cat.primaryGenre);
                                return (
                                    <Link
                                        key={cat.slug}
                                        href={getLocalePath(`/studio/beats/${cat.slug}`)}
                                        className={`group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl border p-5 transition hover:-translate-y-1 ${theme.world} ${theme.card}`}
                                    >
                                        <div className="absolute inset-x-5 top-0 h-px opacity-80" style={{ backgroundColor: theme.accentHex }} aria-hidden="true" />
                                        <div>
                                            <span className={`text-[11px] font-semibold uppercase tracking-wider ${theme.tag}`}>{cat.primaryGenre}</span>
                                            <h3 className="mt-2 text-xl font-bold text-white transition group-hover:text-white">{cat.localizedName[locale] || cat.name}</h3>
                                            <p className="mt-3 text-xs leading-5 text-white/62">{cat.shortDescription[locale] || cat.shortDescription['en-US']}</p>
                                        </div>
                                        <div className={`mt-5 flex items-center gap-1 text-xs font-semibold ${theme.tag}`}>
                                            {t.categoryCta(cat.localizedName[locale] || cat.name)}
                                            <ExternalLink className="h-3 w-3" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </SectionShell>

                {/* Clean Beats Inventory by Genre (Organized Filter at the Bottom) */}
                <SectionShell id="beats-inventory" className="order-10 py-10 sm:py-12">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-7 flex flex-col gap-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">{t.catalogTag}</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{t.catalogTitle}</h2>
                                <p className="mt-2 max-w-2xl text-xs leading-6 text-white/70 sm:text-sm">
                                    {t.catalogSub}
                                </p>
                                <p className="mt-3 text-[11px] font-medium tracking-wide text-sky-100/60 sm:text-xs">
                                    {t.catalogMeta}
                                </p>
                            </div>

                            <div className="space-y-3 rounded-2xl border border-white/[0.1] bg-[#06131c]/80 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-4">
                                <div className="grid gap-3 lg:grid-cols-[minmax(16rem,0.72fr)_1.28fr]">
                                    <label className="relative block">
                                        <span className="sr-only">{catalogText.search}</span>
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-200/60" aria-hidden="true" />
                                        <input
                                            type="search"
                                            value={query}
                                            onChange={(event) => {
                                                setQuery(event.target.value);
                                                setCurrentPage(1);
                                            }}
                                            placeholder={catalogText.search}
                                            className="min-h-11 w-full rounded-xl border border-white/10 bg-[#03111a] py-2 pl-10 pr-10 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-200/60 focus:ring-2 focus:ring-sky-200/20"
                                        />
                                        {query ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setQuery('');
                                                    setCurrentPage(1);
                                                }}
                                                aria-label={catalogText.clear}
                                                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                            >
                                                <X className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        ) : null}
                                    </label>

                                    <div className="flex min-w-0 items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => scrollGenres('left')}
                                            aria-label={catalogText.scrollGenresLeft}
                                            className="inline-flex h-11 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/65 transition hover:border-sky-200/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                        >
                                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <div ref={genreScrollRef} className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedGenre('all');
                                                    setCurrentPage(1);
                                                }}
                                                className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                                                    selectedGenre === 'all'
                                                        ? getGenreTheme(t.filterAll).filter
                                                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
                                                }`}
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${getGenreTheme(t.filterAll).dot}`} aria-hidden="true" />
                                                {t.filterAll}
                                            </button>
                                            {selectedOfficialGenre ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowGenrePanel(true);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${getGenreTheme(selectedOfficialGenre.label).filter}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${getGenreTheme(selectedOfficialGenre.label).dot}`} aria-hidden="true" />
                                                    {selectedOfficialGenre.label}
                                                </button>
                                            ) : null}
                                            {signatureGenres.map((genre) => {
                                                const theme = getGenreTheme(genre.label);
                                                return (
                                                    <button
                                                        key={genre.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedGenre(genre.id);
                                                            setCurrentPage(1);
                                                        }}
                                                        className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                                                            selectedGenre === genre.id
                                                                ? theme.filter
                                                                : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden="true" />
                                                        {genre.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => scrollGenres('right')}
                                            aria-label={catalogText.scrollGenresRight}
                                            className="inline-flex h-11 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/65 transition hover:border-sky-200/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                        >
                                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowGenrePanel((current) => !current)}
                                            aria-expanded={showGenrePanel}
                                            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-sky-200/25 bg-sky-300/[0.07] px-3.5 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.13] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                        >
                                            {showGenrePanel ? catalogText.closeGenres : catalogText.moreGenres}
                                            <ChevronDown className={`h-3.5 w-3.5 transition ${showGenrePanel ? 'rotate-180' : ''}`} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
                                    <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-sky-200/65" aria-hidden="true" />
                                        {catalogText.filterLabel}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {hasAdvancedFilters ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTempoFilter('all');
                                                    setKeyFilter('all');
                                                    setVibeFilter('all');
                                                    setDurationFilter('all');
                                                    setCurrentPage(1);
                                                }}
                                                className="min-h-9 rounded-lg px-3 text-xs font-semibold text-white/50 transition hover:text-white"
                                            >
                                                {catalogText.reset}
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => setShowAdvancedFilters((current) => !current)}
                                            aria-expanded={showAdvancedFilters}
                                            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-white/68 transition hover:border-sky-200/30 hover:text-white"
                                        >
                                            {showAdvancedFilters ? catalogText.filtersClose : catalogText.filtersOpen}
                                            <ChevronDown className={`h-3.5 w-3.5 transition ${showAdvancedFilters ? 'rotate-180' : ''}`} aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>

                                {showAdvancedFilters ? (
                                    <div className="grid gap-3 rounded-xl border border-white/[0.09] bg-black/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
                                        <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                                            <span>{catalogText.tempo}</span>
                                            <select
                                                value={tempoFilter}
                                                onChange={(event) => {
                                                    setTempoFilter(event.target.value as TempoFilter);
                                                    setCurrentPage(1);
                                                }}
                                                className="min-h-10 w-full rounded-lg border border-white/10 bg-[#03111a] px-3 text-xs font-medium normal-case tracking-normal text-white outline-none transition focus:border-sky-200/55"
                                            >
                                                <option value="all">{catalogText.allTempos}</option>
                                                <option value="under-90">&lt; 90 BPM</option>
                                                <option value="90-109">90–109 BPM</option>
                                                <option value="110-129">110–129 BPM</option>
                                                <option value="130-plus">130+ BPM</option>
                                            </select>
                                        </label>
                                        <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                                            <span>{catalogText.key}</span>
                                            <select
                                                value={keyFilter}
                                                onChange={(event) => {
                                                    setKeyFilter(event.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="min-h-10 w-full rounded-lg border border-white/10 bg-[#03111a] px-3 text-xs font-medium normal-case tracking-normal text-white outline-none transition focus:border-sky-200/55"
                                            >
                                                <option value="all">{catalogText.allKeys}</option>
                                                {availableKeys.map((key) => <option key={key} value={key}>{key}</option>)}
                                            </select>
                                        </label>
                                        <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                                            <span>{catalogText.vibe}</span>
                                            <select
                                                value={vibeFilter}
                                                onChange={(event) => {
                                                    setVibeFilter(event.target.value as VibeFilter);
                                                    setCurrentPage(1);
                                                }}
                                                className="min-h-10 w-full rounded-lg border border-white/10 bg-[#03111a] px-3 text-xs font-medium normal-case tracking-normal text-white outline-none transition focus:border-sky-200/55"
                                            >
                                                <option value="all">{catalogText.allVibes}</option>
                                                {Object.keys(vibeMatchers).map((vibe) => <option key={vibe} value={vibe}>{vibe}</option>)}
                                            </select>
                                        </label>
                                        <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                                            <span>{catalogText.duration}</span>
                                            <select
                                                value={durationFilter}
                                                onChange={(event) => {
                                                    setDurationFilter(event.target.value as DurationFilter);
                                                    setCurrentPage(1);
                                                }}
                                                className="min-h-10 w-full rounded-lg border border-white/10 bg-[#03111a] px-3 text-xs font-medium normal-case tracking-normal text-white outline-none transition focus:border-sky-200/55"
                                            >
                                                <option value="all">{catalogText.allDurations}</option>
                                                <option value="short">{catalogText.shortDuration}</option>
                                                <option value="standard">{catalogText.standardDuration}</option>
                                                <option value="long">{catalogText.longDuration}</option>
                                            </select>
                                        </label>
                                    </div>
                                ) : null}

                                {showGenrePanel ? (
                                    <div className="rounded-xl border border-white/[0.09] bg-black/20 p-3 sm:p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/70">
                                                {catalogText.popularGenres}
                                            </p>
                                            <label className="relative block sm:w-64">
                                                <span className="sr-only">{catalogText.genreSearch}</span>
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" aria-hidden="true" />
                                                <input
                                                    type="search"
                                                    value={genreQuery}
                                                    onChange={(event) => setGenreQuery(event.target.value)}
                                                    placeholder={catalogText.genreSearch}
                                                    className="min-h-9 w-full rounded-lg border border-white/10 bg-[#03111a] py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-white/35 outline-none transition focus:border-sky-200/60"
                                                />
                                            </label>
                                        </div>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                            {visibleOfficialGenres.map((genre) => {
                                                const theme = getGenreTheme(genre.label);
                                                return (
                                                    <button
                                                        key={genre.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedGenre(genre.id);
                                                            setCurrentPage(1);
                                                            setShowGenrePanel(false);
                                                        }}
                                                        className={`flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${
                                                            selectedGenre === genre.id
                                                                ? theme.filter
                                                                : 'border-white/[0.09] bg-white/[0.025] text-white/65 hover:border-white/20 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="inline-flex min-w-0 items-center gap-2">
                                                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} aria-hidden="true" />
                                                            <span className="truncate">{genre.label}</span>
                                                        </span>
                                                        <span className="font-mono text-[10px] text-white/35">{genre.count}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {!normalizedGenreQuery && officialGenres.length > 12 ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowAllOfficialGenres((current) => !current)}
                                                className="mt-3 text-xs font-semibold text-sky-200 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                            >
                                                {showAllOfficialGenres ? catalogText.showPopularGenres : catalogText.showAllGenres}
                                            </button>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-col gap-4 rounded-2xl border border-violet-300/20 bg-[linear-gradient(105deg,rgba(76,29,149,0.2),rgba(14,116,144,0.12))] p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-200/20 bg-violet-300/10 text-violet-100">
                                        <Gift className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{catalogText.promoTitle}</p>
                                        <p className="mt-1 text-xs leading-5 text-white/60">{catalogText.promoText}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => shortlistedBeats.length ? openCheckout(shortlistedBeats) : openGuide('finder')}
                                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200/20 bg-white/[0.06] px-4 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                                >
                                    {shortlistedBeats.length ? catalogText.promoCta : catalogText.guide}
                                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between gap-4 text-xs text-white/60">
                            <p>{catalogText.showing(visibleBeats.length, filteredBeats.length)}</p>
                            <p className="hidden sm:block">{catalogText.page(currentPage, pageCount)}</p>
                        </div>

                        {shortlistedBeats.length ? (
                            <div className="sticky top-24 z-20 mb-4 flex flex-col gap-4 rounded-2xl border border-sky-200/30 bg-[#071923]/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">{catalogText.shortlistTitle(shortlistedBeats.length)}</p>
                                    <p className="mt-1 text-xs text-white/55">{catalogText.shortlistText(shortlistedBeats.length)}</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {shortlistedBeats.map((beat) => (
                                            <button
                                                key={beat.id}
                                                type="button"
                                                onClick={() => toggleShortlist(beat)}
                                                className="inline-flex max-w-48 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70 transition hover:border-rose-200/30 hover:text-white"
                                            >
                                                <span className="truncate">{beat.title}</span>
                                                <X className="h-3 w-3 shrink-0" aria-hidden="true" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShortlistedBeatIds([])}
                                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
                                    >
                                        {catalogText.clearShortlist}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            trackBeatEvent('beat_shortlist_store_click', {
                                                beatIds: shortlistedBeatIds.join(','),
                                                beatCount: shortlistedBeatIds.length,
                                                sourcePage: 'beat-catalog',
                                            });
                                            openCheckout(shortlistedBeats);
                                        }}
                                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-sky-200 px-4 text-xs font-semibold text-slate-950 transition hover:bg-sky-100"
                                    >
                                        {catalogText.shortlistCta}
                                        <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {visibleBeats.length ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleBeats.map((beat) => {
                                const editorialWorld = getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
                                const theme = getGenreTheme(editorialWorld);
                                const metadata = beatStarsFilterIndex[beat.beatstarsTrackId];
                                const isShortlisted = shortlistedBeatIds.includes(beat.id);
                                const isShortlistFull = shortlistedBeatIds.length >= 3 && !isShortlisted;
                                return (
                                    <article
                                        key={beat.id}
                                        className={`group relative flex min-h-[22rem] flex-col gap-3 overflow-hidden rounded-2xl border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition duration-300 before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:content-[''] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.3)] sm:p-5 ${theme.world} ${theme.card} ${theme.edge} ${isShortlisted ? 'ring-1 ring-sky-200/65' : ''}`}
                                    >
                                        <div className="h-[8.25rem]">
                                            <div className={`flex items-center justify-between text-[11px] font-semibold ${theme.tag}`}>
                                                <span className="flex items-center gap-2 uppercase tracking-wider"><span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden="true" />{editorialWorld}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleShortlist(beat)}
                                                    disabled={isShortlistFull}
                                                    aria-pressed={isShortlisted}
                                                    title={isShortlistFull ? catalogText.shortlistFull : undefined}
                                                    className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                                                        isShortlisted
                                                            ? 'border-sky-200/40 bg-sky-300/15 text-sky-100'
                                                            : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-sky-200/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35'
                                                    }`}
                                                >
                                                    <Bookmark className={`h-3 w-3 ${isShortlisted ? 'fill-current' : ''}`} aria-hidden="true" />
                                                    {isShortlisted ? catalogText.shortlisted : catalogText.shortlist}
                                                </button>
                                            </div>
                                            <h3 className="mt-2 h-12 line-clamp-2 text-lg font-bold leading-snug text-white transition group-hover:text-sky-100">{beat.title}</h3>
                                            <p className="mt-1.5 h-10 line-clamp-2 text-xs leading-5 text-white/60">
                                                {getBeatSummary(beat, locale)}
                                            </p>
                                        </div>

                                        {metadata ? (
                                            <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-white/52">
                                                {metadata.bpm ? <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">{metadata.bpm} BPM</span> : null}
                                                {metadata.key && metadata.key !== 'None' ? <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">{metadata.key}</span> : null}
                                                {metadata.genres[0] ? <span className="max-w-32 truncate rounded-full border border-white/10 bg-black/20 px-2 py-1">{metadata.genres[0]}</span> : null}
                                            </div>
                                        ) : null}

                                        <BeatStarsAudioPlayer
                                            trackId={beat.beatstarsTrackId}
                                            productUrl={beat.beatstarsProductUrl}
                                            beatTitle={beat.title}
                                            locale={locale}
                                            showArtwork
                                        />

                                        <div className="mt-auto grid grid-cols-[0.95fr_1.05fr] gap-2 pt-1 text-xs">
                                            <Link
                                                href={getLocalePath(`/studio/beats/${beat.slug}`)}
                                                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border border-white/15 px-3 font-semibold text-white/80 transition hover:border-sky-200/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                            >
                                                {t.viewBeatPage}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => openCheckout([beat])}
                                                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-sky-200 px-3 font-semibold text-slate-950 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                            >
                                                {catalogText.checkout} · {beat.licenses[0]?.price || '$15'}
                                                <ShoppingBag className="h-3 w-3" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-white/[0.14] px-5 py-12 text-center">
                                <p className="text-sm text-white/65">{catalogText.noResults}</p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-4 text-xs font-semibold text-sky-200 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                >
                                    {catalogText.reset}
                                </button>
                            </div>
                        )}

                        {pageCount > 1 ? (
                            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Catalog pagination">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-sky-200/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                    {catalogText.previous}
                                </button>
                                <span className="text-xs text-white/50">{catalogText.page(currentPage, pageCount)}</span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                                    disabled={currentPage === pageCount}
                                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-sky-200/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                    {catalogText.next}
                                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </nav>
                        ) : null}
                    </div>
                </SectionShell>

                {/* Non-Exclusive Licenses */}
                <SectionShell className="order-[30] border-y border-white/[0.08] bg-white/[0.015] py-12">
                    <div className="mx-auto max-w-5xl">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">{t.licensesTag}</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">{t.licensesTitle}</h2>
                            </div>
                            <Link
                                href={getLocalePath('/studio/beats/licensing')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-200 hover:underline"
                            >
                                {t.readLicensing}
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <m.div
                            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {localizedLicenses.map((license) => (
                                <m.article
                                    key={license.name}
                                    variants={staggerChild}
                                    className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.025] p-5 transition hover:border-sky-200/25 hover:bg-white/[0.04]"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/70">{license.name}</p>
                                    <p className="mt-3 text-3xl font-semibold text-white">{license.price}</p>
                                    <div className="mt-3 space-y-1 text-xs text-white/60">
                                        <p>{license.copies}</p>
                                        <p>{license.streams}</p>
                                    </div>
                                    <div className="mt-4 flex-1 space-y-2 border-t border-white/[0.08] pt-3">
                                        {license.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-2 text-xs leading-5 text-white/70">
                                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-200" aria-hidden="true" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => openCheckout(shortlistedBeats)}
                                        disabled={!shortlistedBeats.length}
                                        className="mt-5 inline-flex items-center justify-between gap-2 rounded-lg border border-sky-200/25 bg-sky-300/[0.07] px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.15] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {shortlistedBeats.length ? t.chooseBeatstars : catalogText.chooseBeatFirst}
                                        <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </m.article>
                            ))}
                        </m.div>
                    </div>
                </SectionShell>

                {/* Private Commissions */}
                <SectionShell id="private-commissions" className="order-[60] py-12">
                    <m.div
                        className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start"
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">{t.commissionsTag}</p>
                            <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">{t.commissionsTitle}</h2>
                            <p className="mt-3 text-xs leading-6 text-white/70 sm:text-sm">{t.commissionsSub}</p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href={instagramDmUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200/30 bg-sky-300/[0.08] px-4 py-2.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.15]"
                                >
                                    <Instagram className="h-3.5 w-3.5" />
                                    {t.dmExclusive}
                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                                <a
                                    href={getFounderGmailComposeUrl(
                                        t.exclusiveEmailSubject,
                                        t.exclusiveEmailBody,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/75 transition hover:text-white"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    {t.emailExclusive}
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-x-6 gap-y-2.5 border-t border-white/[0.08] pt-6 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/55">{t.exclusiveIncludes}</p>
                            {exclusiveBenefits[locale].map((item) => (
                                <div key={item} className="flex items-start gap-2 text-xs leading-5 text-white/70">
                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-200" aria-hidden="true" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </m.div>
                </SectionShell>

                <BeatStoreGuide
                    key={`${guideMode}-${guideOpen ? 'open' : 'closed'}`}
                    open={guideOpen}
                    onClose={closeGuide}
                    locale={locale}
                    initialMode={guideMode}
                    onApplyPreset={applyFinderPreset}
                />
                <BeatStarsCheckoutModal
                    open={checkoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                    locale={locale}
                    beatSelections={checkoutBeatSelections}
                />
            </article>
        </PageTransition>
    );
}
