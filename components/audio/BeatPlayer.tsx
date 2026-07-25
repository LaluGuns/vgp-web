'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Play, Pause, Volume2, VolumeX, ExternalLink, X } from 'lucide-react';
import { BeatProduct } from '@/lib/catalog';

interface AudioContextType {
    currentBeat: BeatProduct | null;
    isPlaying: boolean;
    playBeat: (beat: BeatProduct) => void;
    pauseBeat: () => void;
    togglePlay: (beat: BeatProduct) => void;
}

const AudioContext = createContext<AudioContextType>({
    currentBeat: null,
    isPlaying: false,
    playBeat: () => {},
    pauseBeat: () => {},
    togglePlay: () => {},
});

export const useAudioPlayer = () => useContext(AudioContext);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
    const [currentBeat, setCurrentBeat] = useState<BeatProduct | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();

        const audio = audioRef.current;
        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, []);

    const playBeat = (beat: BeatProduct) => {
        if (!audioRef.current) return;

        if (currentBeat?.id === beat.id) {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
            return;
        }

        setCurrentBeat(beat);
        // Standard BeatStars MP3 stream audio preview endpoint pattern
        const audioSrc = `https://cdn2.beatstars.com/stream/track/${beat.beatstarsTrackId}.mp3`;
        audioRef.current.src = audioSrc;
        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(() => {
            // Fallback preview URL pattern
            if (audioRef.current) {
                audioRef.current.src = `https://www.beatstars.com/embed/track?id=${beat.beatstarsTrackId}`;
            }
        });
    };

    const pauseBeat = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const togglePlay = (beat: BeatProduct) => {
        if (currentBeat?.id === beat.id && isPlaying) {
            pauseBeat();
        } else {
            playBeat(beat);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current && audioRef.current.duration) {
            const newTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(parseFloat(e.target.value));
        }
    };

    return (
        <AudioContext.Provider value={{ currentBeat, isPlaying, playBeat, pauseBeat, togglePlay }}>
            {children}

            {/* Global Floating Sticky Audio Player Footer Bar */}
            {currentBeat && (
                <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-sky-200/20 bg-black/90 backdrop-blur-xl px-4 py-3 shadow-2xl transition-all">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                        {/* Track Info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => togglePlay(currentBeat)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-200 text-black shadow-lg transition hover:scale-105 hover:bg-sky-100"
                                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                            >
                                {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
                            </button>
                            <div className="min-w-0">
                                <h4 className="truncate text-sm font-bold text-white">{currentBeat.title}</h4>
                                <p className="truncate text-xs text-sky-200/70">{currentBeat.primaryGenre} • #{currentBeat.beatstarsTrackId}</p>
                            </div>
                        </div>

                        {/* Scrub Bar & Time */}
                        <div className="hidden flex-1 items-center gap-3 sm:flex max-w-md">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleSeek}
                                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-sky-200"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={toggleMute}
                                className="hidden sm:flex text-white/60 hover:text-white transition"
                            >
                                {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4" />}
                            </button>

                            <a
                                href={currentBeat.beatstarsProductUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200/30 bg-sky-300/[0.12] px-3.5 py-1.5 text-xs font-bold text-sky-100 transition hover:bg-sky-300/[0.25]"
                            >
                                Buy License ($15+)
                                <ExternalLink className="h-3 w-3" />
                            </a>

                            <button
                                onClick={() => {
                                    pauseBeat();
                                    setCurrentBeat(null);
                                }}
                                className="text-white/40 hover:text-white transition p-1"
                                aria-label="Close audio player"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AudioContext.Provider>
    );
}
