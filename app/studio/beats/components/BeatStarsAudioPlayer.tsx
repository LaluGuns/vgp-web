'use client';
/* eslint-disable @next/next/no-img-element -- BeatStars supplies short-lived artwork URLs, so the preview thumbnail is rendered directly. */

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle, ExternalLink, LoaderCircle, Pause, Play } from 'lucide-react';
import { formatTrackTime, getBeatStarsTrack, type BeatStarsTrackData } from './beatstars-track-data';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

interface BeatStarsAudioPlayerProps {
    trackId: string;
    productUrl: string;
    beatTitle: string;
    locale: BeatLocale;
    autoLoad?: boolean;
    showArtwork?: boolean;
}


const copy = {
    'en-US': {
        label: 'BeatStars preview',
        loading: 'Loading preview',
        unavailable: 'Preview unavailable',
        external: 'Open on BeatStars',
        play: 'Play preview',
        pause: 'Pause preview',
        position: (title: string) => `${title} playback position`,
    },
    'ja-JP': {
        label: '公式 BeatStars プレビュー',
        loading: 'プレビューを読み込み中',
        unavailable: 'プレビューを利用できません',
        external: 'BeatStars で開く',
        play: 'プレビューを再生',
        pause: 'プレビューを一時停止',
        position: (title: string) => `${title}の再生位置`,
    },
    'de-DE': {
        label: 'Offizielle BeatStars-Vorschau',
        loading: 'Vorschau wird geladen',
        unavailable: 'Vorschau nicht verfügbar',
        external: 'Bei BeatStars öffnen',
        play: 'Vorschau abspielen',
        pause: 'Vorschau pausieren',
        position: (title: string) => `Wiedergabeposition: ${title}`,
    },
} as const;

export default function BeatStarsAudioPlayer({
    trackId,
    productUrl,
    beatTitle,
    locale,
    autoLoad = false,
    showArtwork = false,
}: BeatStarsAudioPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [shouldLoad, setShouldLoad] = useState(autoLoad);
    const [previewUrl, setPreviewUrl] = useState<string>();
    const [artworkUrl, setArtworkUrl] = useState<string>();
    const [trackData, setTrackData] = useState<BeatStarsTrackData>();
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const text = copy[locale];

    useEffect(() => {
        const element = containerRef.current;
        if (!element || shouldLoad) return;

        if (!('IntersectionObserver' in window)) {
            queueMicrotask(() => setShouldLoad(true));
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

    useEffect(() => {
        if (!shouldLoad || previewUrl || hasFailed) return;

        let isCancelled = false;
        queueMicrotask(() => setIsLoading(true));

        getBeatStarsTrack(trackId)
            .then((payload) => {
                if (isCancelled) return;
                if (!payload.previewUrl) throw new Error('Preview URL unavailable');
                setPreviewUrl(payload.previewUrl);
                if (payload.duration) setDuration(payload.duration);
                if (payload.artworkUrl) setArtworkUrl(payload.artworkUrl);
                setTrackData(payload);
            })
            .catch(() => {
                if (isCancelled) return;
                setHasFailed(true);
            })
            .finally(() => {
                if (!isCancelled) setIsLoading(false);
            });

        return () => {
            isCancelled = true;
        };
    }, [hasFailed, previewUrl, shouldLoad, trackId]);

    useEffect(() => {
        const pauseOtherPlayer = (event: Event) => {
            if ((event as CustomEvent<string>).detail === trackId) return;
            audioRef.current?.pause();
            setIsPlaying(false);
        };

        window.addEventListener('vgp:preview-play', pauseOtherPlayer);
        return () => window.removeEventListener('vgp:preview-play', pauseOtherPlayer);
    }, [trackId]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !previewUrl) return;

        if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            audio.src = previewUrl;
            return () => {
                audio.removeAttribute('src');
                audio.load();
            };
        }

        if (!Hls.isSupported()) {
            queueMicrotask(() => setHasFailed(true));
            return;
        }

        const hls = new Hls({
            enableWorker: true,
            startLevel: -1,
        });

        hls.loadSource(previewUrl);
        hls.attachMedia(audio);
        hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) setHasFailed(true);
        });

        return () => hls.destroy();
    }, [previewUrl]);

    const togglePlayback = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            window.dispatchEvent(new CustomEvent('vgp:preview-play', { detail: trackId }));
            try {
                await audio.play();
                setIsPlaying(true);
            } catch {
                setHasFailed(true);
            }
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const seekTo = (value: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = value;
        setCurrentTime(value);
    };

    const metadata = [
        trackData?.metadata.bpm ? `${trackData.metadata.bpm} BPM` : undefined,
        trackData?.metadata.key,
        trackData?.metadata.genres[0],
    ].filter(Boolean).join(' · ');

    return (
        <div ref={containerRef} className="h-[104px] overflow-hidden rounded-xl border border-white/[0.1] bg-[#02080d] shadow-inner shadow-black/40">
            {hasFailed ? (
                <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 text-center" aria-live="polite">
                    <AlertCircle className="h-4 w-4 text-amber-200/75" aria-hidden="true" />
                    <p className="text-xs text-white/55">{text.unavailable}</p>
                    <a
                        href={productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-200 transition hover:text-white"
                    >
                        {text.external}
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                </div>
            ) : !previewUrl ? (
                <div className="flex h-full items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/60" aria-live="polite">
                    <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {text.loading}
                </div>
            ) : (
                <div className="flex h-full items-center p-3.5">
                    <audio
                        ref={audioRef}
                        preload="metadata"
                        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => setHasFailed(true)}
                    />
                    <div className="flex w-full items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                            {showArtwork && artworkUrl ? (
                                <img
                                    src={artworkUrl}
                                    alt={`${beatTitle} artwork`}
                                    loading="eager"
                                    className="h-full w-full object-cover"
                                />
                            ) : null}
                            <button
                                type="button"
                                onClick={togglePlayback}
                                aria-label={isPlaying ? text.pause : text.play}
                                className={`absolute inset-0 inline-flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                                    showArtwork && artworkUrl
                                        ? 'bg-slate-950/55 text-white hover:bg-slate-950/35'
                                        : 'bg-sky-200 text-slate-950 hover:bg-sky-100'
                                }`}
                            >
                                {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
                            </button>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">{text.label}</p>
                                <span className="shrink-0 font-mono text-[10px] text-white/50">{formatTrackTime(currentTime)} / {formatTrackTime(duration)}</span>
                            </div>
                            {metadata ? <p className="mt-1 truncate text-[10px] font-medium text-white/45">{metadata}</p> : null}
                            <input
                                type="range"
                                min="0"
                                max={Math.max(duration, 0)}
                                step="0.1"
                                value={Math.min(currentTime, duration || 0)}
                                onChange={(event) => seekTo(Number(event.target.value))}
                                aria-label={text.position(beatTitle)}
                                className={`${metadata ? 'mt-2' : 'mt-2.5'} h-1.5 w-full cursor-pointer accent-sky-200`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
