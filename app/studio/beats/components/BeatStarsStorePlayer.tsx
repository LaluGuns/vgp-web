'use client';

import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { beatStarsBlazePlayerUrl, beatStarsStoreUrl } from '@/lib/beatstars';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

const copy = {
    'en-US': {
        eyebrow: 'Official BeatStars catalog',
        title: 'Preview the full Virzy Guns catalog.',
        description: 'Browse every available beat and complete your purchase on the official BeatStars store. Compare tracks and license options here first.',
        load: 'Open the full BeatStars catalog',
        external: 'Open on BeatStars',
        unavailable: 'The store player is unavailable here. The official BeatStars catalog remains available in a new tab.',
    },
    'ja-JP': {
        eyebrow: '公式 BeatStars カタログ',
        title: 'Virzy Gunsの全カタログを試聴する。',
        description: 'BeatStarsの公式カタログで購入手続きを行えます。ここでは各ビートとライセンス内容を比較できます。',
        load: 'フル BeatStars カタログを開く',
        external: 'BeatStars で開く',
        unavailable: 'ここでストアプレイヤーを開けません。公式 BeatStars カタログを別タブで開くことができます。',
    },
    'de-DE': {
        eyebrow: 'Offizieller BeatStars-Katalog',
        title: 'Den vollständigen Virzy Guns Katalog anhören.',
        description: 'Für Kauf und Checkout öffne den offiziellen Katalog. Hier kannst du Beats und Lizenzoptionen vergleichen.',
        load: 'Vollständigen BeatStars-Katalog öffnen',
        external: 'Bei BeatStars öffnen',
        unavailable: 'Der Store-Player ist hier nicht verfügbar. Der offizielle BeatStars-Katalog lässt sich weiterhin in einem neuen Tab öffnen.',
    },
} as const;

export default function BeatStarsStorePlayer({ locale = 'en-US' }: { locale?: BeatLocale }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const text = copy[locale];

    return (
        <section className="border-y border-white/[0.08] bg-white/[0.012] py-10 sm:py-12" aria-label={text.eyebrow}>
            <div className="mx-auto max-w-5xl px-6">
                <div className="overflow-hidden rounded-2xl border border-sky-200/20 bg-[#04111a] shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
                    <div className="grid gap-5 border-b border-white/[0.09] px-5 py-5 sm:px-7 sm:py-6 md:grid-cols-[1fr_auto] md:items-end">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200/65">{text.eyebrow}</p>
                            <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">{text.title}</h2>
                            <p className="mt-2 text-sm leading-6 text-white/60">{text.description}</p>
                        </div>
                        <a
                            href={beatStarsStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-sky-200/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                        >
                            {text.external}
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                    </div>

                    {!isLoaded && !hasFailed ? (
                        <div className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center">
                            <button
                                type="button"
                                onClick={() => setIsLoaded(true)}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-200 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                            >
                                <Play className="h-4 w-4" aria-hidden="true" />
                                {text.load}
                            </button>
                        </div>
                    ) : null}

                    {hasFailed ? (
                        <div className="flex min-h-52 items-center justify-center px-5 py-10 text-center">
                            <p className="max-w-lg text-sm leading-6 text-white/60">{text.unavailable}</p>
                        </div>
                    ) : null}

                    {isLoaded && !hasFailed ? (
                        <iframe
                            src={beatStarsBlazePlayerUrl}
                            title={`${text.eyebrow}: Virzy Guns`}
                            className="block h-[620px] w-full border-0 sm:h-[760px]"
                            loading="lazy"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; payment"
                            referrerPolicy="strict-origin-when-cross-origin"
                            onError={() => setHasFailed(true)}
                        />
                    ) : null}
                </div>
            </div>
        </section>
    );
}
