'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { ArrowDown, ExternalLink, ShoppingBag } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell } from '@/components/editorial/EditorialPrimitives';
import { revealUp } from '@/lib/motion-presets';
import { CategoryDef, BeatProduct } from '@/lib/catalog';
import { getBeatSummary } from '@/lib/seo/beat-copy';
import { getGenreTheme } from '@/lib/genre-theme';
import { getEditorialBeatWorld } from '@/lib/catalog/beatstars-genre-index';
import BeatStarsAudioPlayer from './BeatStarsAudioPlayer';
import BeatStarsCheckoutModal from './BeatStarsCheckoutModal';

interface CategoryClientProps {
    category: CategoryDef;
    beats: BeatProduct[];
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const categoryCopy = {
    'en-US': {
        home: 'Home', beats: 'Beats', muted: 'Built for hard hooks and darker records.',
        storeDescription: 'Every track below is ready to audition. When one fits, open the official BeatStars cart and complete the license without leaving this site.',
        storeCta: 'Browse these beats', available: (count: number) => `${count} tracks ready to audition`, details: 'License details', buy: (price: string) => `License here · ${price}`,
        sound: 'Sound character', vocal: 'Recommended vocal fit', licensingTitle: 'Need clear licensing terms?', licensingSub: 'Compare MP3, WAV, Stems, and exclusive-license availability before you buy.', licensingCta: 'Read licensing guide',
    },
    'ja-JP': {
        home: 'ホーム', beats: 'ビート', muted: '強いフックとダークな世界観のために。',
        storeDescription: '下の全曲を試聴できます。気に入った曲は、このサイトを離れずBeatStars公式カートでライセンス購入できます。',
        storeCta: 'このジャンルを見る', available: (count: number) => `試聴できる${count}曲`, details: 'ライセンス詳細', buy: (price: string) => `ここで購入 · ${price}`,
        sound: 'サウンドの特徴', vocal: 'おすすめのボーカルスタイル', licensingTitle: 'ライセンス条件を確認しますか？', licensingSub: '購入前にMP3、WAV、ステム、独占ライセンスの提供状況を比較できます。', licensingCta: 'ライセンスガイドを見る',
    },
    'de-DE': {
        home: 'Startseite', beats: 'Beats', muted: 'Für harte Hooks und dunklere Records.',
        storeDescription: 'Jeden Track unten kannst du anhören. Wenn einer passt, öffne den offiziellen BeatStars-Warenkorb und lizenziere ihn, ohne diese Seite zu verlassen.',
        storeCta: 'Diese Beats ansehen', available: (count: number) => `${count} Tracks zum Anhören`, details: 'Lizenzdetails', buy: (price: string) => `Hier lizenzieren · ${price}`,
        sound: 'Sound-Charakter', vocal: 'Empfohlener Vocal-Stil', licensingTitle: 'Klare Lizenzbedingungen?', licensingSub: 'Vergleiche MP3, WAV, Stems und die Verfügbarkeit einer Exklusivlizenz vor dem Kauf.', licensingCta: 'Lizenzguide lesen',
    },
} as const;

export default function CategoryClient({ category, beats, locale = 'en-US' }: CategoryClientProps) {
    const text = categoryCopy[locale];
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [checkoutBeatSelections, setCheckoutBeatSelections] = useState<Array<{ trackId: string; title: string; productUrl: string }>>([]);
    const categoryTheme = getGenreTheme(category.primaryGenre);
    const openCheckout = (selectedBeats: BeatProduct[] = []) => {
        setCheckoutBeatSelections(selectedBeats.map((beat) => ({
            trackId: beat.beatstarsTrackId,
            title: beat.title,
            productUrl: beat.beatstarsProductUrl,
        })));
        setCheckoutOpen(true);
    };
    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    const title = category.localizedName[locale] || category.localizedName['en-US'] || category.name;
    const shortDesc = category.shortDescription[locale] || category.shortDescription['en-US'] || '';
    const soundChar = category.soundCharacter[locale] || category.soundCharacter['en-US'] || '';
    const vocalFit = category.recommendedVocalFit[locale] || category.recommendedVocalFit['en-US'] || '';

    return (
        <PageTransition>
            <article className={`editorial-shell min-h-screen pb-16 pt-20 text-white sm:pt-24 ${categoryTheme.world}`}>
                <div className="mx-auto mb-5 flex max-w-5xl items-center justify-between px-6">
                    <nav className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <Link href={getLocalePath('/')} className="hover:text-white transition">{text.home}</Link>
                        <span>/</span>
                        <Link href={getLocalePath('/studio/beats')} className="hover:text-white transition">{text.beats}</Link>
                        <span>/</span>
                        <span className="text-sky-200/80">{title}</span>
                    </nav>

                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Link href={`/studio/beats/${category.slug}`} className={`hover:text-white transition ${locale === 'en-US' ? 'text-sky-200 font-bold' : ''}`}>EN</Link>
                        <span>|</span>
                        <Link href={`/ja-JP/studio/beats/${category.slug}`} className={`hover:text-white transition ${locale === 'ja-JP' ? 'text-sky-200 font-bold' : ''}`}>JA</Link>
                        <span>|</span>
                        <Link href={`/de-DE/studio/beats/${category.slug}`} className={`hover:text-white transition ${locale === 'de-DE' ? 'text-sky-200 font-bold' : ''}`}>DE</Link>
                    </div>
                </div>

                <SectionShell id="category-intro" className="!py-6 sm:!py-8 lg:!py-10">
                    <div className={`mx-auto max-w-5xl overflow-hidden rounded-[1.5rem] border bg-[linear-gradient(135deg,rgba(8,27,39,0.92),rgba(3,10,15,0.98))] px-5 py-7 shadow-[0_24px_70px_rgba(0,0,0,0.2)] sm:px-8 sm:py-9 ${categoryTheme.surface}`}>
                        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${categoryTheme.tag}`}>
                            VGP Beat Store / {category.primaryGenre}
                        </p>
                        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="max-w-3xl">
                                <h1 className="font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                    {title}
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                                    {shortDesc}
                                </p>
                            </div>
                            <p className="max-w-xs border-l border-sky-200/25 pl-4 text-sm leading-6 text-sky-100/75 sm:pb-1">
                                {text.muted}
                            </p>
                        </div>
                    </div>
                </SectionShell>

                <SectionShell id="official-store-link" className="!py-6 sm:!py-8">
                    <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl border border-white/[0.1] bg-white/[0.02] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-2xl text-sm leading-6 text-white/65">
                            {text.storeDescription}
                        </p>
                        <button
                            type="button"
                            onClick={() => document.getElementById('matching-beats')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-sky-200/30 bg-sky-300/[0.08] px-4 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.16]"
                        >
                            {text.storeCta}
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </SectionShell>

                {/* Matching Beats Inventory */}
                <SectionShell id="matching-beats" className="!py-8 sm:!py-10">
                    <div className="mx-auto max-w-5xl">
                        <h2 className="font-display text-2xl font-semibold text-white mb-6">
                            {text.available(beats.length)}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {beats.map((beat) => {
                                const editorialWorld = getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
                                const theme = getGenreTheme(editorialWorld);
                                return (
                                    <m.article
                                        key={beat.id}
                                        variants={revealUp}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className={`group relative flex min-h-[20.5rem] flex-col gap-3 overflow-hidden rounded-2xl border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.14)] transition before:pointer-events-none before:absolute before:inset-x-5 before:top-0 before:h-px before:content-[''] hover:-translate-y-0.5 sm:p-5 ${theme.world} ${theme.card} ${theme.edge}`}
                                    >
                                        <div className="h-[8.25rem]">
                                            <div className={`flex items-center justify-between text-[11px] font-semibold ${theme.tag}`}>
                                                <span className="flex items-center gap-2 uppercase tracking-wider"><span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} aria-hidden="true" />{editorialWorld}</span>
                                                <span className="font-mono text-white/40">#{beat.beatstarsTrackId}</span>
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
                                                {text.details}
                                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => openCheckout([beat])}
                                                className="inline-flex min-h-11 items-center justify-center gap-1 rounded-xl bg-sky-200 px-3 font-semibold text-slate-950 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                                            >
                                                {text.buy(beat.licenses[0]?.price || '')}
                                                <ShoppingBag className="h-3 w-3" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </m.article>
                                );
                            })}
                        </div>
                    </div>
                </SectionShell>

                {/* Category Educational Content & Vocal Guidance */}
                <SectionShell id="guidance" className="border-t border-white/10 py-14">
                    <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                            <h3 className="text-lg font-semibold text-white">{text.sound}</h3>
                            <p className="mt-3 text-xs leading-6 text-white/70">
                                {soundChar}
                            </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
                            <h3 className="text-lg font-semibold text-white">{text.vocal}</h3>
                            <p className="mt-3 text-xs leading-6 text-white/70">
                                {vocalFit}
                            </p>
                        </div>
                    </div>
                </SectionShell>

                {/* Licensing Cross-Link */}
                <SectionShell id="licensing-cta" className="border-t border-white/10 py-10 text-center">
                    <div className="mx-auto max-w-2xl">
                        <h3 className="text-xl font-semibold text-white">{text.licensingTitle}</h3>
                        <p className="mt-2 text-sm text-white/60">{text.licensingSub}</p>
                        <Link
                            href={getLocalePath('/studio/beats/licensing')}
                            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-sky-200/30 bg-sky-300/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-300/20"
                        >
                            {text.licensingCta}
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </SectionShell>

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
