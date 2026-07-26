'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getBeatStarsTrackEmbedUrl } from '@/lib/beatstars';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

interface BeatStarsCatalogPreviewProps {
    trackId: string;
    productUrl: string;
    beatTitle: string;
    locale: BeatLocale;
}

const copy = {
    'en-US': {
        loading: 'Loading official preview',
        unavailable: 'Preview unavailable. Open this beat on BeatStars.',
        open: 'Open on BeatStars',
    },
    'ja-JP': {
        loading: '公式プレビューを読み込み中',
        unavailable: 'プレビューは利用できません。BeatStars で開きます。',
        open: 'BeatStars で開く',
    },
    'de-DE': {
        loading: 'Offizielle Vorschau wird geladen',
        unavailable: 'Vorschau nicht verfügbar. Diesen Beat bei BeatStars öffnen.',
        open: 'Bei BeatStars öffnen',
    },
} as const;

export default function BeatStarsCatalogPreview({
    trackId,
    productUrl,
    beatTitle,
    locale,
}: BeatStarsCatalogPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const text = copy[locale];

    useEffect(() => {
        const element = containerRef.current;
        if (!element || shouldLoad) return;

        if (!('IntersectionObserver' in window)) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '280px 0px' },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [shouldLoad]);

    return (
        <div ref={containerRef} className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-black/40">
            {hasFailed ? (
                <div className="flex h-[140px] flex-col items-center justify-center gap-2 px-4 text-center">
                    <p className="text-xs leading-5 text-white/60">{text.unavailable}</p>
                    <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-200 transition hover:text-white"
                    >
                        {text.open}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                </div>
            ) : shouldLoad ? (
                <iframe
                    src={getBeatStarsTrackEmbedUrl(trackId)}
                    title={`${beatTitle} official BeatStars preview`}
                    width="100%"
                    height="140"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="block border-0"
                    onError={() => setHasFailed(true)}
                />
            ) : (
                <div className="flex h-[140px] items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/65">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-sky-200/70" aria-hidden="true" />
                    {text.loading}
                </div>
            )}
        </div>
    );
}
