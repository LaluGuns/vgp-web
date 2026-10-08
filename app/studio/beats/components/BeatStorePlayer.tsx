'use client';
/* eslint-disable @next/next/no-img-element -- BeatStars supplies short-lived artwork URLs, so artwork is rendered directly. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type Hls from 'hls.js';
import { LoaderCircle, Pause, Play, ShoppingBag, SkipBack, SkipForward, X } from 'lucide-react';
import { trackBeatEvent } from '@/lib/analytics';
import { formatTrackTime, getBeatStarsTrack } from './beatstars-track-data';

type BeatLocale = 'en-US' | 'ja-JP' | 'de-DE';

export type StoreTrack = {
    beatId: string;
    trackId: string;
    name: string;
    detail?: string;
    meta?: string;
    price: string;
};

const copy = {
    'en-US': { play: 'Play', pause: 'Pause', next: 'Next beat', previous: 'Previous beat', close: 'Close player', license: 'License', unavailable: 'Preview unavailable', position: 'Playback position', player: 'Beat player' },
    'ja-JP': { play: '再生', pause: '一時停止', next: '次のビート', previous: '前のビート', close: 'プレーヤーを閉じる', license: 'ライセンス', unavailable: 'プレビューを利用できません', position: '再生位置', player: 'ビートプレーヤー' },
    'de-DE': { play: 'Abspielen', pause: 'Pausieren', next: 'Nächster Beat', previous: 'Vorheriger Beat', close: 'Player schließen', license: 'Lizenzieren', unavailable: 'Vorschau nicht verfügbar', position: 'Wiedergabeposition', player: 'Beat-Player' },
} as const;

type PlayerState = {
    current?: StoreTrack;
    isPlaying: boolean;
    isLoading: boolean;
    play: (track: StoreTrack, queue: StoreTrack[]) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

export function useStorePlayer() {
    const context = useContext(PlayerContext);
    if (!context) throw new Error('useStorePlayer must be used inside StorePlayerProvider');
    return context;
}

/**
 * One audio element for the whole store. Rows call play(); the bar at the
 * bottom of the screen shows what is playing, with seek, previous/next and a
 * license button.
 */
export function StorePlayerProvider({
    children,
    locale,
    onLicense,
}: {
    children: ReactNode;
    locale: BeatLocale;
    onLicense: (beatId: string) => void;
}) {
    const text = copy[locale];
    const audioRef = useRef<HTMLAudioElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const queueRef = useRef<StoreTrack[]>([]);
    const requestRef = useRef(0);
    const [current, setCurrent] = useState<StoreTrack>();
    const [artworkUrl, setArtworkUrl] = useState<string>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const detach = useCallback(() => {
        hlsRef.current?.destroy();
        hlsRef.current = null;
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        }
    }, []);

    const load = useCallback(async (track: StoreTrack) => {
        const request = ++requestRef.current;
        detach();
        setCurrent(track);
        setHasFailed(false);
        setIsLoading(true);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setArtworkUrl(undefined);

        try {
            const data = await getBeatStarsTrack(track.trackId);
            if (request !== requestRef.current) return;
            if (!data.previewUrl) throw new Error('No preview');
            setArtworkUrl(data.artworkUrl);
            if (data.duration) setDuration(data.duration);

            const audio = audioRef.current;
            if (!audio) return;

            if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                audio.src = data.previewUrl;
            } else {
                // hls.js is ~200 KB, so it loads on the first play, not with the page.
                const { default: HlsPlayer } = await import('hls.js');
                if (request !== requestRef.current) return;
                if (!HlsPlayer.isSupported()) throw new Error('HLS unsupported');
                const hls = new HlsPlayer({ enableWorker: true, startLevel: -1 });
                hlsRef.current = hls;
                // Wait for the manifest before play(), or Chrome rejects it
                // with "no supported source".
                await new Promise<void>((resolve, reject) => {
                    hls.on(HlsPlayer.Events.MANIFEST_PARSED, () => resolve());
                    hls.on(HlsPlayer.Events.ERROR, (_event, info) => {
                        if (info.fatal) {
                            setHasFailed(true);
                            reject(new Error(info.details));
                        }
                    });
                    hls.loadSource(data.previewUrl!);
                    hls.attachMedia(audio);
                });
                if (request !== requestRef.current) return;
            }

            try {
                await audio.play();
            } catch (error) {
                // Autoplay blocked: the track is ready, the visitor presses play.
                if ((error as Error).name === 'NotAllowedError') return;
                throw error;
            }
            if (request !== requestRef.current) return;
            setIsPlaying(true);
            trackBeatEvent('beat_preview_play', {
                beatId: track.beatId,
                beatTitle: track.name,
                sourcePage: 'beat-catalog',
            });
        } catch {
            if (request === requestRef.current) setHasFailed(true);
        } finally {
            if (request === requestRef.current) setIsLoading(false);
        }
    }, [detach]);

    const toggle = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio || !current) return;
        if (audio.paused) {
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
    }, [current]);

    const play = useCallback((track: StoreTrack, queue: StoreTrack[]) => {
        queueRef.current = queue;
        if (current?.trackId === track.trackId && !hasFailed) {
            void toggle();
            return;
        }
        void load(track);
    }, [current, hasFailed, load, toggle]);

    const step = useCallback((direction: 1 | -1) => {
        const queue = queueRef.current;
        if (!current || !queue.length) return;
        const index = queue.findIndex((track) => track.trackId === current.trackId);
        const next = queue[(index + direction + queue.length) % queue.length];
        if (next) void load(next);
    }, [current, load]);

    const close = useCallback(() => {
        requestRef.current += 1;
        detach();
        setCurrent(undefined);
        setIsPlaying(false);
        setIsLoading(false);
    }, [detach]);

    useEffect(() => () => hlsRef.current?.destroy(), []);

    const value = useMemo(() => ({ current, isPlaying, isLoading, play }), [current, isPlaying, isLoading, play]);
    const progress = duration ? Math.min(currentTime / duration, 1) : 0;

    return (
        <PlayerContext.Provider value={value}>
            {children}
            <audio
                ref={audioRef}
                preload="none"
                onLoadedMetadata={(event) => {
                    if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration);
                }}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => step(1)}
                className="hidden"
            />

            <div
                role="region"
                aria-label={text.player}
                className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0e12]/95 backdrop-blur-md transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    current ? 'translate-y-0' : 'pointer-events-none translate-y-full'
                }`}
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                {/* Thin progress line along the top edge, always visible. */}
                <div className="absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden="true">
                    <div className="h-full origin-left bg-sky-300" style={{ transform: `scaleX(${progress})` }} />
                </div>

                <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[4px] bg-white/[0.06]">
                        {artworkUrl ? <img src={artworkUrl} alt="" className="h-full w-full object-cover" /> : null}
                    </div>

                    <div className="min-w-0 flex-1 sm:max-w-xs">
                        <p className="truncate text-sm font-semibold text-white">{current?.name}</p>
                        <p className="truncate text-xs text-white/55">
                            {hasFailed ? text.unavailable : current?.meta || current?.detail}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => step(-1)} aria-label={text.previous} className="hidden h-10 w-10 items-center justify-center rounded-full text-white/65 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex">
                            <SkipBack className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => void toggle()}
                            disabled={hasFailed}
                            aria-label={isPlaying ? text.pause : text.play}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#050607] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e12]"
                        >
                            {isLoading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : isPlaying ? (
                                <Pause className="h-4 w-4" aria-hidden="true" />
                            ) : (
                                <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />
                            )}
                        </button>
                        <button type="button" onClick={() => step(1)} aria-label={text.next} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/65 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                            <SkipForward className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
                        <span className="w-10 shrink-0 text-right font-mono text-xs text-white/50">{formatTrackTime(currentTime)}</span>
                        <input
                            type="range"
                            min={0}
                            max={Math.max(duration, 0)}
                            step={0.1}
                            value={Math.min(currentTime, duration || 0)}
                            onChange={(event) => {
                                const audio = audioRef.current;
                                if (!audio) return;
                                audio.currentTime = Number(event.target.value);
                                setCurrentTime(audio.currentTime);
                            }}
                            aria-label={text.position}
                            className="h-1.5 w-full cursor-pointer accent-sky-300"
                        />
                        <span className="w-10 shrink-0 font-mono text-xs text-white/50">{formatTrackTime(duration)}</span>
                    </div>

                    {current ? (
                        <button
                            type="button"
                            onClick={() => onLicense(current.beatId)}
                            aria-label={`${text.license} · ${current.price}`}
                            className="inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-semibold text-[#050607] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-4"
                        >
                            <span className="hidden sm:inline">{text.license} · {current.price}</span>
                            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    ) : null}

                    <button type="button" onClick={close} aria-label={text.close} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/55 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </PlayerContext.Provider>
    );
}
