'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, ExternalLink, Instagram, Mail, Search, X } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';
import { catalogCredentials } from '@/lib/vgp-ecosystem';
import { categories, beatsCatalog } from '@/lib/catalog';
import { getOfficialBeatStarsGenres, officialBeatStarsGenreOptions } from '@/lib/catalog/beatstars-genre-index';
import { beatStarsStoreUrl } from '@/lib/beatstars';
import { getBeatSummary } from '@/lib/seo/beat-copy';
import { getFounderGmailComposeUrl } from '@/lib/founder-contact';
import { getGenreTheme } from '@/lib/genre-theme';
import BeatStarsAudioPlayer from './components/BeatStarsAudioPlayer';
import BeatStarsStorePlayer from './components/BeatStarsStorePlayer';

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
        credentialsTitle: 'Work people can trace.',
        credentialsSub: 'Verified songwriting, artist, and producer credits through MUSO.AI.',
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
        commissionsSub: 'Need a beat held for your project or built from zero? Tell us what you are making.',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'Email Direct',
        dmCustom: 'Custom Beat DM',
        exclusiveIncludes: 'What we confirm directly',
        viewBeatPage: 'License details',
        officialTrack: 'Official Track',
        exclusiveBoxHeader: 'Exclusive Rights Inquiry',
        exclusiveBoxText: 'To acquire 100% exclusive ownership and remove this beat from the store:',
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
        credentialsTitle: '実績で語るカタログ。',
        credentialsSub: 'MUSO.AIで確認できる作詞、アーティスト、プロデュースの実績。',
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
        commissionsSub: 'プロジェクト用にビートを確保したい、ゼロから作りたい。まず何を作るか教えてください。',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'メールで相談',
        dmCustom: 'カスタム制作のDM相談',
        exclusiveIncludes: '直接確認する内容',
        viewBeatPage: 'ビート詳細を見る',
        officialTrack: '公式トラック',
        exclusiveBoxHeader: '独占ライセンスのお問い合わせ',
        exclusiveBoxText: '100%独占所有権を取得し、ストアから取り下げるには:',
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
        credentialsTitle: 'Credits, die man nachprüfen kann.',
        credentialsSub: 'Verifizierte Songwriting-, Artist- und Producer-Credits über MUSO.AI.',
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
        commissionsSub: 'Du willst einen Beat für dein Projekt reservieren oder von null bauen? Sag uns, was du machst.',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'E-Mail Direkt',
        dmCustom: 'DM für Custom Beat',
        exclusiveIncludes: 'Direkt zu klären',
        viewBeatPage: 'Beat-Seite anzeigen',
        officialTrack: 'Offizieller Track',
        exclusiveBoxHeader: 'Exklusivrechte-Anfrage',
        exclusiveBoxText: 'Um 100% exklusive Rechte zu erwerben und den Beat aus dem Store zu entfernen:',
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
        copies: '5,000 Copies',
        streams: '100K Streams',
        features: ['MP3 File (320kbps)', '1 Music Video'],
    },
    {
        name: 'Basic Pro',
        price: '$25',
        copies: '10,000 Copies',
        streams: '500K Streams',
        features: ['MP3 + WAV (24-Bit)', '1 Music Video', 'For-Profit Performances'],
    },
    {
        name: 'Premium',
        price: '$50',
        copies: '50,000 Copies',
        streams: '1M Streams',
        features: ['MP3 + WAV + Stems', '1 Music Video', 'For-Profit', 'Radio (2 Stations)'],
    },
    {
        name: 'Unlimited',
        price: '$100',
        copies: 'Unlimited Copies',
        streams: 'Unlimited Streams',
        features: ['MP3 + WAV + Track Stems', '2 Music Videos', 'For-Profit', 'Radio (2 Stations)'],
    },
];

const licenseTierCopy = {
    'en-US': [
        { copies: '5,000 sales', streams: '100K streams', features: ['MP3 file (320kbps)', '1 music video'] },
        { copies: '10,000 sales', streams: '500K streams', features: ['MP3 + WAV (24-bit)', '1 music video', 'For-profit performances'] },
        { copies: '50,000 sales', streams: '1M streams', features: ['MP3 + WAV + stems', '1 music video', 'For-profit performances', 'Radio: 2 stations'] },
        { copies: 'Unlimited sales', streams: 'Unlimited streams', features: ['MP3 + WAV + stems', '2 music videos', 'For-profit performances', 'Radio: 2 stations'] },
    ],
    'ja-JP': [
        { copies: '販売上限：5,000', streams: 'ストリーミング：10万回', features: ['MP3ファイル（320kbps）', 'ミュージックビデオ1本'] },
        { copies: '販売上限：10,000', streams: 'ストリーミング：50万回', features: ['MP3 + WAV（24-bit）', 'ミュージックビデオ1本', '収益化パフォーマンス可'] },
        { copies: '販売上限：50,000', streams: 'ストリーミング：100万回', features: ['MP3 + WAV + ステム', 'ミュージックビデオ1本', '収益化パフォーマンス可', 'ラジオ：2局'] },
        { copies: '販売上限なし', streams: 'ストリーミング上限なし', features: ['MP3 + WAV + ステム', 'ミュージックビデオ2本', '収益化パフォーマンス可', 'ラジオ：2局'] },
    ],
    'de-DE': [
        { copies: '5.000 Verkäufe', streams: '100.000 Streams', features: ['MP3-Datei (320 kbps)', '1 Musikvideo'] },
        { copies: '10.000 Verkäufe', streams: '500.000 Streams', features: ['MP3 + WAV (24-Bit)', '1 Musikvideo', 'Kommerzielle Auftritte'] },
        { copies: '50.000 Verkäufe', streams: '1 Mio. Streams', features: ['MP3 + WAV + Stems', '1 Musikvideo', 'Kommerzielle Auftritte', 'Radio: 2 Sender'] },
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
    const genreScrollRef = useRef<HTMLDivElement>(null);

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
    const genreSections = [
        { label: catalogText.signatureGenres, genres: signatureGenres },
        {
            label: catalogText.officialGenres,
            genres: officialBeatStarsGenreOptions.map((genre) => ({
                id: `official:${genre.id}`,
                label: `${genre.label} (${genre.count})`,
                themeLabel: genre.label,
            })),
        },
    ];

    const filteredBeats = useMemo(() => beatsCatalog.filter((beat) => {
        const officialGenres = getOfficialBeatStarsGenres(beat.beatstarsTrackId);
        const matchesGenre = selectedGenre === 'all' || (
            selectedGenre.startsWith('official:')
                ? officialGenres.some((genre) => `official:${normalizeGenreId(genre)}` === selectedGenre)
                : [beat.primaryGenre, ...beat.subgenres, ...beat.tags]
                    .some((genre) => `signature:${normalizeGenreId(genre)}` === selectedGenre)
        );
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery = !normalizedQuery || [
            beat.title,
            beat.primaryGenre,
            ...beat.subgenres,
            ...beat.moods,
            ...beat.tags,
            ...officialGenres,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

        return matchesGenre && matchesQuery;
    }), [query, selectedGenre]);
    const pageCount = Math.max(1, Math.ceil(filteredBeats.length / PAGE_SIZE));
    const visibleBeats = filteredBeats.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

                <PageHeader
                    eyebrow={t.eyebrow}
                    title={t.title}
                    mutedTitle={t.mutedTitle}
                    description={t.description}
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

                <div className="order-[40]">
                    <BeatStarsStorePlayer locale={locale} />
                </div>

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
                            {categories.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={getLocalePath(`/studio/beats/${cat.slug}`)}
                                    className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-sky-200/40 hover:bg-white/[0.05]"
                                >
                                    <div>
                                        <span className="text-[11px] uppercase tracking-wider text-sky-200/60 font-semibold">{cat.primaryGenre}</span>
                                        <h3 className="mt-1.5 text-lg font-bold text-white group-hover:text-sky-200 transition">{cat.localizedName[locale] || cat.name}</h3>
                                        <p className="mt-2 text-xs leading-5 text-white/60">{cat.shortDescription[locale] || cat.shortDescription['en-US']}</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-sky-200 group-hover:underline">
                                        {t.categoryCta(cat.localizedName[locale] || cat.name)}
                                        <ExternalLink className="h-3 w-3" />
                                    </div>
                                </Link>
                            ))}
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

                            <div className="grid gap-3 rounded-2xl border border-white/[0.1] bg-[#06131c]/80 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-4 lg:grid-cols-[minmax(0,0.85fr)_1.7fr] lg:items-center">
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
                                        className="min-h-11 w-full rounded-lg border border-white/10 bg-[#03111a] py-2 pl-10 pr-10 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-200/60 focus:ring-2 focus:ring-sky-200/20"
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
                                        className="inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/65 transition hover:border-sky-200/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                    >
                                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                    <div ref={genreScrollRef} className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedGenre('all');
                                                setCurrentPage(1);
                                            }}
                                            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
                                                selectedGenre === 'all'
                                                    ? getGenreTheme(t.filterAll).filter
                                                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${getGenreTheme(t.filterAll).dot}`} aria-hidden="true" />
                                            {t.filterAll}
                                        </button>
                                        {genreSections.map((section) => (
                                            <div key={section.label} className="flex items-center gap-2">
                                                <span className="ml-1 shrink-0 border-l border-white/10 pl-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                                                    {section.label}
                                                </span>
                                                {section.genres.map((genre) => {
                                                    const theme = getGenreTheme('themeLabel' in genre ? genre.themeLabel : genre.label);
                                                    return (
                                                        <button
                                                            key={genre.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedGenre(genre.id);
                                                                setCurrentPage(1);
                                                            }}
                                                            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition ${
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
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => scrollGenres('right')}
                                        aria-label={catalogText.scrollGenresRight}
                                        className="inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/65 transition hover:border-sky-200/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                    >
                                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between gap-4 text-xs text-white/60">
                            <p>{catalogText.showing(visibleBeats.length, filteredBeats.length)}</p>
                            <p className="hidden sm:block">{catalogText.page(currentPage, pageCount)}</p>
                        </div>

                        {visibleBeats.length ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleBeats.map((beat) => {
                                const theme = getGenreTheme(beat.primaryGenre);
                                return (
                                    <article
                                        key={beat.id}
                                        className={`group relative flex min-h-[20.5rem] flex-col gap-3 overflow-hidden rounded-2xl border bg-[linear-gradient(145deg,rgba(8,22,31,0.94),rgba(3,10,15,0.92))] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.14)] transition duration-300 before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:content-[''] hover:-translate-y-0.5 sm:p-5 ${theme.card} ${theme.edge}`}
                                    >
                                        <div className="h-[8.25rem]">
                                            <div className={`flex items-center justify-between text-[11px] font-semibold ${theme.tag}`}>
                                                <span className="flex items-center gap-2 uppercase tracking-wider"><span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden="true" />{beat.primaryGenre}</span>
                                                <span className="text-white/40 font-mono">#{beat.beatstarsTrackId}</span>
                                            </div>
                                            <h3 className="mt-2 h-12 line-clamp-2 text-lg font-bold leading-snug text-white transition group-hover:text-sky-100">{beat.title}</h3>
                                            <p className="mt-1.5 h-10 line-clamp-2 text-xs leading-5 text-white/60">
                                                {getBeatSummary(beat, locale)}
                                            </p>
                                        </div>

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
                                            <a
                                                href={beat.beatstarsProductUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-sky-200 px-3 font-semibold text-slate-950 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                            >
                                                {catalogText.buy(beat.licenses[0]?.price || '')}
                                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                            </a>
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
                                    onClick={() => {
                                        setQuery('');
                                        setSelectedGenre('all');
                                        setCurrentPage(1);
                                    }}
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
                                    className="flex h-full flex-col rounded-xl border border-white/[0.1] bg-white/[0.025] p-5"
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
                                    <a
                                        href={beatStarsStoreUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-flex items-center justify-between gap-2 rounded-lg border border-sky-200/25 bg-sky-300/[0.07] px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.15]"
                                    >
                                        {t.chooseBeatstars}
                                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                    </a>
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
            </article>
        </PageTransition>
    );
}
