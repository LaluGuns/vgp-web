'use client';
/* eslint-disable @next/next/no-img-element -- BeatStars supplies short-lived artwork URLs, so artwork is rendered directly. */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, Pause, Play, ShoppingBag } from 'lucide-react';
import { getBeatStarsTrack } from './beatstars-track-data';
import { useStorePlayer, type StoreTrack } from './BeatStorePlayer';

export type BeatRowData = StoreTrack & {
    href: string;
    genre: string;
    accentHex: string;
    bpm?: number;
    musicalKey?: string;
};

/** Loads the BeatStars artwork once the row is close to the viewport. */
function useArtwork(trackId: string) {
    const ref = useRef<HTMLDivElement>(null);
    const [url, setUrl] = useState<string>();

    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        let cancelled = false;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                observer.disconnect();
                getBeatStarsTrack(trackId)
                    .then((data) => {
                        if (!cancelled) setUrl(data.artworkUrl);
                    })
                    .catch(() => undefined);
            },
            { rootMargin: '300px 0px' },
        );
        observer.observe(element);
        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [trackId]);

    return { ref, url };
}

export function BeatStoreRow({
    beat,
    queue,
    index,
    labels,
    isShortlisted,
    shortlistDisabled,
    onToggleShortlist,
    onLicense,
}: {
    beat: BeatRowData;
    queue: StoreTrack[];
    index: number;
    labels: { play: string; pause: string; shortlist: string; shortlisted: string; shortlistFull: string; license: string; details: string };
    isShortlisted: boolean;
    shortlistDisabled: boolean;
    onToggleShortlist: () => void;
    onLicense: () => void;
}) {
    const { current, isPlaying, isLoading, play } = useStorePlayer();
    const { ref, url } = useArtwork(beat.trackId);
    const isCurrent = current?.trackId === beat.trackId;
    const showPause = isCurrent && (isPlaying || isLoading);

    return (
        <li
            className={`group/beat relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-2 py-3 transition-colors sm:px-3 md:grid-cols-[1.5rem_3rem_minmax(0,1fr)_9rem_3.5rem_3rem_10.5rem] ${
                isCurrent ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
            }`}
        >
            {/* Genre accent, drawn in on hover and while playing. */}
            <span
                className={`absolute inset-y-2 left-0 w-0.5 origin-center rounded-full transition-transform duration-500 ${isCurrent ? 'scale-y-100' : 'scale-y-0 group-hover/beat:scale-y-100'}`}
                style={{ backgroundColor: beat.accentHex }}
                aria-hidden="true"
            />

            <span className="hidden text-right font-mono text-xs tabular-nums text-white/40 md:block">{index}</span>

            <div ref={ref} className="relative h-12 w-12 overflow-hidden rounded-[4px] bg-white/[0.06]">
                {url ? <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}
                <button
                    type="button"
                    onClick={() => play(beat, queue)}
                    aria-label={`${showPause ? labels.pause : labels.play}: ${beat.name}`}
                    className={`absolute inset-0 inline-flex items-center justify-center bg-black/45 text-white transition-opacity focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 ${
                        isCurrent ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover/beat:opacity-100'
                    }`}
                >
                    {showPause ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
                </button>
            </div>

            <div className="min-w-0">
                <Link href={beat.href} className="block truncate text-sm font-semibold text-white hover:underline hover:decoration-white/40 hover:underline-offset-4 sm:text-base">
                    {beat.name}
                </Link>
                <p className="truncate text-xs text-white/50">
                    <span className="md:hidden">{[beat.genre, beat.bpm ? `${beat.bpm} BPM` : undefined, beat.musicalKey].filter(Boolean).join(' · ')}</span>
                    <span className="hidden md:inline">{beat.detail ?? beat.genre}</span>
                </p>
            </div>

            <span className="hidden truncate text-xs text-white/60 md:block">{beat.genre}</span>
            <span className="hidden font-mono text-xs tabular-nums text-white/60 md:block">{beat.bpm ? `${beat.bpm}` : '–'}</span>
            <span className="hidden font-mono text-xs text-white/60 md:block">{beat.musicalKey ?? '–'}</span>

            <div className="flex items-center justify-end gap-1.5">
                <button
                    type="button"
                    onClick={onToggleShortlist}
                    disabled={shortlistDisabled}
                    aria-pressed={isShortlisted}
                    aria-label={isShortlisted ? labels.shortlisted : labels.shortlist}
                    title={shortlistDisabled ? labels.shortlistFull : isShortlisted ? labels.shortlisted : labels.shortlist}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-30 ${
                        isShortlisted ? 'text-sky-300' : 'text-white/45 hover:text-white'
                    }`}
                >
                    <Bookmark className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={onLicense}
                    className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 px-3 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-[#050607] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                    <span className="hidden sm:inline">{labels.license}</span>
                    {beat.price}
                    <ShoppingBag className="h-3.5 w-3.5 sm:hidden" aria-hidden="true" />
                </button>
            </div>
        </li>
    );
}
