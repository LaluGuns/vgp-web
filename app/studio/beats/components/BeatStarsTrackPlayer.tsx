'use client';

import { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { getBeatStarsTrackEmbedUrl } from '@/lib/beatstars';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

interface BeatStarsTrackPlayerProps {
    trackId: string;
    productUrl: string;
    beatTitle: string;
    locale: BeatLocale;
}

const copy = {
    'en-US': {
        load: 'Load official preview',
        external: 'Listen & buy on BeatStars',
        unavailable: 'The embedded preview is unavailable. You can still open this track on BeatStars.',
    },
    'ja-JP': {
        load: '公式プレビューを読み込む',
        external: 'BeatStarsで試聴・購入',
        unavailable: '埋め込みプレビューを読み込めません。BeatStarsでこのトラックを開けます。',
    },
    'de-DE': {
        load: 'Offizielle Vorschau laden',
        external: 'Auf BeatStars anhören & kaufen',
        unavailable: 'Die eingebettete Vorschau ist nicht verfügbar. Du kannst diesen Track trotzdem auf BeatStars öffnen.',
    },
} as const;

export default function BeatStarsTrackPlayer({
    trackId,
    productUrl,
    beatTitle,
    locale,
}: BeatStarsTrackPlayerProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const text = copy[locale];
    const embedUrl = getBeatStarsTrackEmbedUrl(trackId);

    if (hasFailed) {
        return (
            <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 px-4 py-5 text-center">
                <p className="max-w-sm text-xs leading-5 text-white/60">{text.unavailable}</p>
                <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-sky-200 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                >
                    {text.external}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 px-4 py-5 text-center">
                <button
                    type="button"
                    onClick={() => setIsLoaded(true)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-sky-200/30 bg-sky-300/[0.1] px-4 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-300/[0.18] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    {text.load}
                </button>
                <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white/55 transition hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                >
                    {text.external}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
            </div>
        );
    }

    return (
        <div>
            <iframe
                src={embedUrl}
                title={`${beatTitle} official BeatStars preview`}
                width="100%"
                height="140"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                className="block border-none"
                onError={() => setHasFailed(true)}
            />
            <div className="border-t border-white/10 px-3 py-2 text-right">
                <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-200 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                >
                    {text.external}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
            </div>
        </div>
    );
}
