'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { CategoryDef, BeatProduct } from '@/lib/catalog';
import { getGenreTheme } from '@/lib/genre-theme';
import BeatStarsCheckoutModal from './BeatStarsCheckoutModal';
import { StorePlayerProvider } from './BeatStorePlayer';
import { BeatStoreRow } from './BeatStoreRow';
import { toBeatRow } from './beat-row-data';

const rowCopy = {
    'en-US': { play: 'Play', pause: 'Pause', license: 'License' },
    'ja-JP': { play: '再生', pause: '一時停止', license: 'ライセンス' },
    'de-DE': { play: 'Abspielen', pause: 'Pausieren', license: 'Lizenz' },
} as const;

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

    const rows = beats.map((beat) => toBeatRow(beat, getLocalePath(`/studio/beats/${beat.slug}`)));
    const licenseBeatById = (beatId: string) => {
        const beat = beats.find((item) => item.id === beatId);
        if (beat) openCheckout([beat]);
    };

    return (
        <StorePlayerProvider locale={locale} onLicense={licenseBeatById}>
        <PageTransition>
            <article className="editorial-shell min-h-screen pb-28 pt-6 text-white sm:pt-10">
                <div className="px-4 sm:px-6">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-white/55">
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
                            <Link href={getLocalePath('/studio/beats')} className="transition-colors hover:text-white">{text.beats}</Link>
                            <span aria-hidden="true">/</span>
                            <span className="text-white/80">{title}</span>
                        </nav>
                        <div className="flex items-center gap-4" aria-label="Language">
                            {([
                                ['en-US', `/studio/beats/${category.slug}`, 'EN'],
                                ['ja-JP', `/ja-JP/studio/beats/${category.slug}`, 'JA'],
                                ['de-DE', `/de-DE/studio/beats/${category.slug}`, 'DE'],
                            ] as const).map(([code, href, label]) => (
                                <Link
                                    key={code}
                                    href={href}
                                    hrefLang={code}
                                    aria-current={locale === code ? 'page' : undefined}
                                    className={`inline-flex min-h-11 items-center transition-colors hover:text-white ${locale === code ? 'text-white underline decoration-white/40 underline-offset-[6px]' : ''}`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <header data-enter="" className="border-b border-white/10 px-4 pb-14 pt-8 sm:px-6 lg:pb-20">
                    <div className="mx-auto max-w-7xl">
                        <p className="inline-flex items-center gap-2 text-sm text-white/55">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: categoryTheme.accentHex }} aria-hidden="true" />
                            {category.primaryGenre}
                        </p>
                        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.045em]">
                            {title}
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{shortDesc}</p>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{text.storeDescription}</p>
                        <div className="mt-9">
                            <button
                                type="button"
                                onClick={() => document.getElementById('matching-beats')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group/button inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-[background-color,transform] duration-200 hover:bg-white/85 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]"
                            >
                                {text.storeCta}
                                <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-y-0.5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </header>

                <section id="matching-beats" aria-labelledby="matching-heading" className="scroll-mt-2 px-4 py-14 sm:px-6 lg:py-20">
                    <div className="mx-auto max-w-7xl">
                        <h2 id="matching-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                            {text.available(beats.length)}
                        </h2>
                        <ol className="mt-8 divide-y divide-white/[0.06] border-y border-white/10">
                            {rows.map((row, index) => (
                                <BeatStoreRow
                                    key={row.beatId}
                                    beat={row}
                                    queue={rows}
                                    index={index + 1}
                                    labels={{
                                        play: rowCopy[locale].play,
                                        pause: rowCopy[locale].pause,
                                        license: rowCopy[locale].license,
                                        shortlist: '',
                                        shortlisted: '',
                                        shortlistFull: '',
                                        details: text.details,
                                    }}
                                    onLicense={() => openCheckout([beats[index]])}
                                />
                            ))}
                        </ol>
                    </div>
                </section>

                <section data-reveal="" aria-label={`${text.sound} · ${text.vocal}`} className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                    <dl className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-16">
                        <div>
                            <dt className="text-xl font-semibold text-white">{text.sound}</dt>
                            <dd className="mt-3 text-base leading-7 text-white/70">{soundChar}</dd>
                        </div>
                        <div>
                            <dt className="text-xl font-semibold text-white">{text.vocal}</dt>
                            <dd className="mt-3 text-base leading-7 text-white/70">{vocalFit}</dd>
                        </div>
                    </dl>
                </section>

                <section data-reveal="" className="border-t border-white/10 px-4 py-16 sm:px-6">
                    <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">{text.licensingTitle}</h2>
                            <p className="mt-2 max-w-xl text-base leading-7 text-white/65">{text.licensingSub}</p>
                        </div>
                        <TextLink href={getLocalePath('/studio/beats/licensing')}>{text.licensingCta}</TextLink>
                    </div>
                </section>

                <BeatStarsCheckoutModal
                    open={checkoutOpen}
                    onClose={() => setCheckoutOpen(false)}
                    locale={locale}
                    beatSelections={checkoutBeatSelections}
                />
            </article>
        </PageTransition>
        </StorePlayerProvider>
    );
}
