'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell, PageHeader } from '@/components/editorial/EditorialPrimitives';
import { revealUp } from '@/lib/motion-presets';
import { CategoryDef, BeatProduct } from '@/lib/catalog';
import { beatStarsStoreUrl } from '@/lib/beatstars';

interface CategoryClientProps {
    category: CategoryDef;
    beats: BeatProduct[];
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const categoryCopy = {
    'en-US': {
        home: 'Home', beats: 'Beats', muted: 'for artists building a distinct sound.',
        storeDescription: (title: string) => `Browse the complete official catalog on BeatStars, or compare every available ${title} beat below.`,
        storeCta: 'Open official store', available: (title: string, count: number) => `${title} beats (${count})`, verified: 'Official preview', from: 'License from $15', details: 'Details & licenses',
        sound: 'Sound character', vocal: 'Recommended vocal fit', licensingTitle: 'Need clear licensing terms?', licensingSub: 'Compare MP3, WAV, Stems, and exclusive-license availability before you buy.', licensingCta: 'Read licensing guide',
    },
    'ja-JP': {
        home: 'ホーム', beats: 'ビート', muted: '個性あるサウンドを作るアーティストのために。',
        storeDescription: (title: string) => `BeatStarsの公式カタログを確認するか、下で利用可能な${title}ビートを比較できます。`,
        storeCta: '公式ストアを開く', available: (title: string, count: number) => `${title}ビート（${count}曲）`, verified: '公式プレビュー', from: 'ライセンスは$15から', details: '詳細とライセンス',
        sound: 'サウンドの特徴', vocal: 'おすすめのボーカルスタイル', licensingTitle: 'ライセンス条件を確認しますか？', licensingSub: '購入前にMP3、WAV、ステム、独占ライセンスの提供状況を比較できます。', licensingCta: 'ライセンスガイドを見る',
    },
    'de-DE': {
        home: 'Startseite', beats: 'Beats', muted: 'für Artists mit einem eigenen Sound.',
        storeDescription: (title: string) => `Durchsuche den vollständigen offiziellen Katalog auf BeatStars oder vergleiche unten alle verfügbaren ${title}-Beats.`,
        storeCta: 'Offiziellen Store öffnen', available: (title: string, count: number) => `${title}-Beats (${count})`, verified: 'Offizielle Vorschau', from: 'Lizenz ab 15 $', details: 'Details & Lizenzen',
        sound: 'Sound-Charakter', vocal: 'Empfohlener Vocal-Stil', licensingTitle: 'Klare Lizenzbedingungen?', licensingSub: 'Vergleiche MP3, WAV, Stems und die Verfügbarkeit einer Exklusivlizenz vor dem Kauf.', licensingCta: 'Lizenzguide lesen',
    },
} as const;

export default function CategoryClient({ category, beats, locale = 'en-US' }: CategoryClientProps) {
    const text = categoryCopy[locale];
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
            <article className="editorial-shell min-h-screen text-white pt-24 pb-20">
                <div className="mx-auto max-w-5xl px-6 mb-8 flex items-center justify-between">
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

                <PageHeader
                    eyebrow={`VGP Beat Store / ${category.primaryGenre}`}
                    title={title}
                    mutedTitle={text.muted}
                    description={shortDesc}
                />

                <SectionShell id="official-store-link" className="py-6">
                    <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl border border-white/[0.1] bg-white/[0.02] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-2xl text-sm leading-6 text-white/65">
                            {text.storeDescription(title)}
                        </p>
                        <a
                            href={beatStarsStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-sky-200/30 bg-sky-300/[0.08] px-4 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.16]"
                        >
                            {text.storeCta}
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                    </div>
                </SectionShell>

                {/* Matching Beats Inventory */}
                <SectionShell id="matching-beats" className="py-10">
                    <div className="mx-auto max-w-5xl">
                        <h2 className="font-display text-2xl font-semibold text-white mb-6">
                            {text.available(title, beats.length)}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {beats.map((beat) => (
                                <m.div
                                    key={beat.id}
                                    variants={revealUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm transition hover:border-sky-200/40 hover:bg-white/[0.04]"
                                >
                                    <div>
                                        <div className="flex items-center justify-between text-xs text-sky-200/60 font-semibold">
                                            <span>{beat.primaryGenre}</span>
                                            <span className="text-white/40">{text.verified}</span>
                                        </div>
                                        <h3 className="mt-2 text-xl font-bold text-white">{beat.title}</h3>
                                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/60">
                                            {beat.description[locale] || beat.description['en-US']}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                                        <span className="text-sm font-semibold text-sky-200">{text.from}</span>
                                        <Link
                                            href={getLocalePath(`/studio/beats/${beat.slug}`)}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-sky-200 transition"
                                        >
                                            {text.details}
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </m.div>
                            ))}
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
            </article>
        </PageTransition>
    );
}
