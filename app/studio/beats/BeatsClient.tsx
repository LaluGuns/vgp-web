'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Check, ExternalLink, Mail, Instagram } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';
import { catalogCredentials } from '@/lib/vgp-ecosystem';
import { categories, beatsCatalog, BeatProduct } from '@/lib/catalog';

interface BeatsClientProps {
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const copyDict = {
    'en-US': {
        eyebrow: 'VGP Studio / Beat Store',
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats',
        mutedTitle: 'Engineered for Recording & Content.',
        description: 'Browse official instrumentals by Virzy Guns across Cyberpunk Trap, Phonk, Synthwave, and Hard 808s. Instant MP3, WAV, and Track Stems license delivery.',
        credentialsTag: 'Verified track record',
        credentialsTitle: 'Production proof behind the catalog.',
        credentialsSub: 'Independent credits verified through MUSO.AI, placed here where the production record matters most.',
        categoriesTag: 'Shop by sound',
        categoriesTitle: 'Explore genre categories.',
        categoriesSub: 'Dedicated category landing pages optimized for search, streaming guidelines, and vocal fit.',
        catalogTag: 'Beat Inventory',
        catalogTitle: 'Browse Beats by Genre',
        catalogSub: 'Filter the catalog by genre to preview official audio tracks and inspect licensing specifications.',
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
        commissionsSub: 'Use Instagram DM or Email for work that needs a direct conversation: exclusive ownership or production built from scratch.',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'Email Direct',
        dmCustom: 'Custom Beat DM',
        exclusiveIncludes: 'Exclusive package includes',
        viewBeatPage: 'View Beat Page',
        officialTrack: 'Official Track',
        exclusiveBoxHeader: 'Exclusive Rights Inquiry',
        exclusiveBoxText: 'To acquire 100% exclusive ownership and remove this beat from the store:',
        secureCheckout: 'Secure checkout & instant MP3/WAV/Stems delivery',
        playAudio: 'Play Audio Preview',
        pauseAudio: 'Pause Audio',
    },
    'ja-JP': {
        eyebrow: 'VGPスタジオ / ビートストア',
        title: 'サイバーパンクトラップ・フォンク・シンセウェーブ ビート販売',
        mutedTitle: 'アーティス向け公式インストゥルメンタル。',
        description: 'Virzy Guns制作の公式サイバーパンクトラップ、フォンク、シンセウェーブ、808ビート。即時MP3/WAV/ステムダウンロード。',
        credentialsTag: '実績証明',
        credentialsTitle: '制作実績とクレジット',
        credentialsSub: 'MUSO.AIで検証された独立プロデューサーとしての公式制作クレジット。',
        categoriesTag: 'ジャンル別検索',
        categoriesTitle: 'カテゴリーから探す',
        categoriesSub: '検索とストリーミングガイドラインに最適化されたジャンル別専用ページ。',
        catalogTag: 'ビートインベントリ',
        catalogTitle: 'ジャンル別ビート一覧',
        catalogSub: 'ジャンルフィルターでビートを絞り込み、試聴プレーヤーでサウンドを確認できます。',
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
        commissionsSub: '独占所有権の取得や完全オーダーメイド楽曲の制作はダイレクトメッセージまたはメールでご相談ください。',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'メールで相談',
        dmCustom: 'カスタム制作のDM相談',
        exclusiveIncludes: '独占ライセンスパッケージ内容',
        viewBeatPage: 'ビート詳細を見る',
        officialTrack: '公式トラック',
        exclusiveBoxHeader: '独占ライセンスのお問い合わせ',
        exclusiveBoxText: '100%独占所有権を取得し、ストアから取り下げるには:',
        secureCheckout: '安全な決済および即時MP3/WAV/ステム配信',
        playAudio: '試聴再生',
        pauseAudio: '一時停止',
    },
    'de-DE': {
        eyebrow: 'VGP Studio / Beat Store',
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats',
        mutedTitle: 'Produziert für Künstler & Content.',
        description: 'Offizielle Cyberpunk Trap, Phonk, Synthwave und 808 Beats von Virzy Guns. Sofortiger MP3-, WAV- und Stems-Download.',
        credentialsTag: 'Verifizierte Erfolge',
        credentialsTitle: 'Produktionsnachweise des Katalogs.',
        credentialsSub: 'Unabhängige Credits verifiziert über MUSO.AI für maximale Transparenz.',
        categoriesTag: 'Nach Sound filtern',
        categoriesTitle: 'Genre-Kategorien erkunden.',
        categoriesSub: 'Spezielle Kategorie-Seiten optimiert für Suche, Streaming-Richtlinien und Vocal-Passgenauigkeit.',
        catalogTag: 'Beat-Inventar',
        catalogTitle: 'Beats nach Genre durchsuchen',
        catalogSub: 'Filtern Sie den Katalog nach Genre, um Audiotracks anzuhören und Lizenzdetails zu prüfen.',
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
        commissionsSub: 'Nutzen Sie DMs oder E-Mails für exklusive Rechte oder individuell angefertigte Instrumentals.',
        dmExclusive: 'Instagram DM (@virzyguns)',
        emailExclusive: 'E-Mail Direkt',
        dmCustom: 'DM für Custom Beat',
        exclusiveIncludes: 'Exklusiv-Paket enthält',
        viewBeatPage: 'Beat-Seite anzeigen',
        officialTrack: 'Offizieller Track',
        exclusiveBoxHeader: 'Exklusivrechte-Anfrage',
        exclusiveBoxText: 'Um 100% exklusive Rechte zu erwerben und den Beat aus dem Store zu entfernen:',
        secureCheckout: 'Sichere Kasse & sofortige MP3/WAV/Stems Lieferung',
        playAudio: 'Audio abspielen',
        pauseAudio: 'Pause',
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

const beatstarsTracksUrl = 'https://www.beatstars.com/virzyguns/tracks';
const instagramDmUrl = 'https://ig.me/m/virzyguns';

export default function BeatsClient({ locale = 'en-US' }: BeatsClientProps) {
    const t = copyDict[locale] || copyDict['en-US'];
    const [selectedGenre, setSelectedGenre] = useState<string>('all');

    const genresList = [
        { id: 'all', label: t.filterAll },
        { id: 'cyberpunk-trap', label: 'Cyberpunk Trap' },
        { id: 'cyberpunk-phonk', label: 'Cyberpunk Phonk' },
        { id: 'synthwave-trap', label: 'Synthwave Trap' },
        { id: 'drill', label: 'Drill' },
        { id: 'house', label: 'House' },
        { id: 'lo-fi', label: 'Lo-fi' },
        { id: 'r&b', label: 'R&B' },
    ];

    const filteredBeats = beatsCatalog.filter((beat) => {
        if (selectedGenre === 'all') return true;
        const genreId = selectedGenre.toLowerCase();
        return (
            beat.primaryGenre.toLowerCase().replace(/ /g, '-').includes(genreId) ||
            beat.subgenres.some((s) => s.toLowerCase().replace(/ /g, '-').includes(genreId))
        );
    });

    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white pt-24 pb-20">
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
                <SectionShell id="credentials" className="border-y border-white/[0.08] bg-white/[0.012] py-10 sm:py-12">
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

                {/* Main Embedded BeatStars Store Player */}
                <SectionShell id="store-player" className="py-12 border-b border-white/[0.08]">
                    <div className="mx-auto max-w-5xl">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
                            <div className="border-b border-white/10 px-5 py-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/60">{t.playerTag}</p>
                                <h2 className="mt-1 text-xl font-bold text-white">{t.playerTitle}</h2>
                                <p className="text-xs text-white/60">{t.playerSub}</p>
                            </div>

                            <div className="bg-[#030405]">
                                <iframe
                                    src="https://player.beatstars.com/?storeId=122437"
                                    className="block h-[700px] w-full sm:h-[780px] lg:h-[840px] border-none"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="VGP Beat Store Catalog Player"
                                />
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-white/50">
                                <span>{t.secureCheckout}</span>
                                <span>Powered by BeatStars Store</span>
                            </div>
                        </div>
                    </div>
                </SectionShell>

                {/* Genre Category Cards */}
                <SectionShell id="catalog-categories" className="py-12 border-b border-white/[0.08]">
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
                                        Explore {cat.localizedName[locale] || cat.name}
                                        <ExternalLink className="h-3 w-3" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                {/* Clean Beats Inventory by Genre (Organized Filter at the Bottom) */}
                <SectionShell id="beats-inventory" className="py-12">
                    <div className="mx-auto max-w-5xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">{t.catalogTag}</p>
                                <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">{t.catalogTitle}</h2>
                                <p className="mt-2 text-xs leading-6 text-white/70 sm:text-sm max-w-xl">
                                    {t.catalogSub}
                                </p>
                            </div>

                            {/* Genre Filter Buttons */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                                {genresList.map((g) => (
                                    <button
                                        key={g.id}
                                        onClick={() => setSelectedGenre(g.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                                            selectedGenre === g.id
                                                ? 'bg-sky-300/20 border-sky-200/60 text-sky-100'
                                                : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Beats Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredBeats.slice(0, 30).map((beat) => {
                                return (
                                    <div
                                        key={beat.id}
                                        className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 transition"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between text-[11px] font-semibold text-sky-200/70">
                                                <span className="uppercase tracking-wider">{beat.primaryGenre}</span>
                                                <span className="text-white/40 font-mono">#{beat.beatstarsTrackId}</span>
                                            </div>
                                            <h3 className="mt-2 text-lg font-bold text-white line-clamp-1">{beat.title}</h3>
                                            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/60">
                                                {beat.description[locale] || beat.description['en-US']}
                                            </p>
                                        </div>



                                        {/* Embedded Iframe Player Widget */}
                                        <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black min-h-[180px]">
                                            <iframe 
                                                src={`//www.beatstars.com/embed/track?id=${beat.beatstarsTrackId}`}
                                                width="100%"
                                                height="140"
                                                className="border-none"
                                            ></iframe>
                                        </div>

                                        {/* Clean Exclusive Rights Box */}
                                        <div className="mt-3 rounded-lg border border-sky-200/20 bg-sky-300/[0.04] p-3 text-[11px] space-y-2">
                                            <p className="text-sky-200 font-semibold uppercase tracking-wider text-[10px]">
                                                {t.exclusiveBoxHeader}
                                            </p>
                                            <p className="text-white/70 leading-4">
                                                {t.exclusiveBoxText}
                                            </p>
                                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                                                <a
                                                    href={instagramDmUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-sky-200 hover:underline font-semibold"
                                                >
                                                    <Instagram className="h-3 w-3 shrink-0" />
                                                    {t.dmExclusive}
                                                </a>
                                                <a
                                                    href={`mailto:contact@virzyguns.com?subject=Exclusive%20Rights%20Inquiry%20-%20${encodeURIComponent(beat.title)}`}
                                                    className="flex items-center gap-1 text-sky-200 hover:underline font-semibold"
                                                >
                                                    <Mail className="h-3 w-3 shrink-0" />
                                                    {t.emailExclusive}
                                                </a>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                                            <span className="text-white/50">{t.officialTrack}</span>
                                            <Link
                                                href={getLocalePath(`/studio/beats/${beat.slug}`)}
                                                className="inline-flex items-center gap-1 font-semibold text-white hover:text-sky-200 transition"
                                            >
                                                {t.viewBeatPage}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredBeats.length > 30 && (
                            <div className="mt-8 text-center">
                                <a
                                    href={beatstarsTracksUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-semibold text-white hover:bg-white/[0.08] transition"
                                >
                                    Browse all {filteredBeats.length} tracks on BeatStars Store
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        )}
                    </div>
                </SectionShell>

                {/* Non-Exclusive Licenses */}
                <SectionShell className="border-y border-white/[0.08] bg-white/[0.015] py-12">
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
                            {nonExclusiveLicenses.map((license) => (
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
                                        href={beatstarsTracksUrl}
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
                <SectionShell id="private-commissions" className="py-12">
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
                                    href="mailto:contact@virzyguns.com?subject=Exclusive%20Rights%20Inquiry"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/75 transition hover:text-white"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    {t.emailExclusive}
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-x-6 gap-y-2.5 border-t border-white/[0.08] pt-6 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/55">{t.exclusiveIncludes}</p>
                            {[
                                'Untagged MP3 + WAV + STEMS',
                                'Unlimited Sale Units',
                                'Unlimited Streams',
                                'For-Profit Performances',
                                'Unlimited Radio Use',
                                'YouTube Monetization',
                                'SoundCloud Monetization',
                                'Content ID Registration',
                                'Full Exclusive Rights',
                                'Beat removed from public store',
                            ].map((item) => (
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
