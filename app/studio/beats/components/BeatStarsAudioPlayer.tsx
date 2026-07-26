'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ExternalLink, LoaderCircle, Pause, Play } from 'lucide-react';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

interface BeatStarsAudioPlayerProps {
    trackId: string;
    productUrl: string;
    beatTitle: string;
    locale: BeatLocale;
    autoLoad?: boolean;
}

interface PreviewResponse {
    previewUrl?: string;
    duration?: number | null;
    error?: string;
}

const copy = {
    'en-US': {
        label: 'Official BeatStars preview',
        loading: 'Loading preview',
        unavailable: 'Preview unavailable',
        external: 'Open on BeatStars',
        play: 'Play preview',
        pause: 'Pause preview',
    },
    'ja-JP': {
        label: '公式 BeatStars プレビュー',
        loading: 'プレビューを読み込み中',
        unavailable: 'プレビューを利用できません',
        external: 'BeatStars で開く',
        play: 'プレビューを再生',
        pause: 'プレビューを一時停止',
    },
    'de-DE': {
        label: 'Offizielle BeatStars-Vorschau',
        loading: 'Vorschau wird geladen',
        unavailable: 'Vorschau nicht verfügbar',
        external: 'Bei BeatStars öffnen',
        play: 'Vorschau abspielen',
        pause: 'Vorschau pausieren',
    },
} as const;

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export default function BeatStarsAudioPlayer({
    trackId,
    productUrl,
    beatTitle,
    locale,
    autoLoad = false,
}: BeatStarsAudioPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [shouldLoad, setShouldLoad] = useState(autoLoad);
    const [previewUrl, setPreviewUrl] = useState<string>();
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

    useEffect(() => {
        if (!shouldLoad || previewUrl || hasFailed) return;

        const controller = new AbortController();
        setIsLoading(true);

        fetch(`/api/beats/preview/${trackId}`, { signal: controller.signal })
            .then(async (response) => {
                const payload = (await response.json()) as PreviewResponse;
                if (!response.ok || !payload.previewUrl) throw new Error(payload.error);
                setPreviewUrl(payload.previewUrl);
                if (payload.duration) setDuration(payload.duration);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setHasFailed(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
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

    return (
        <div ref={containerRef} className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[#03090d]">
            {hasFailed ? (
                <div className="flex min-h-[116px] flex-col items-center justify-center gap-2 px-4 text-center">
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
                <div className="flex min-h-[116px] items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/60">
                    <LoaderCircle className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {text.loading}
                </div>
            ) : (
                <div className="p-4">
                    <audio
                        ref={audioRef}
                        src={previewUrl}
                        preload="metadata"
                        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => setHasFailed(true)}
                    />
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={togglePlayback}
                            aria-label={isPlaying ? text.pause : text.play}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-200 text-slate-950 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                        >
                            {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-100/70">{text.label}</p>
                                <span className="font-mono text-[10px] text-white/40">{formatTime(currentTime)} / {formatTime(duration)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={Math.max(duration, 0)}
                                step="0.1"
                                value={Math.min(currentTime, duration || 0)}
                                onChange={(event) => seekTo(Number(event.target.value))}
                                aria-label={`${beatTitle} playback position`}
                                className="mt-2 h-1.5 w-full cursor-pointer accent-sky-200"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
