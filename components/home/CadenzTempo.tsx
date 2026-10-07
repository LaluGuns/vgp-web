'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';

const MIN_BPM = 130;
const MAX_BPM = 180;
const STEPS = 4;
const LOOKAHEAD_S = 0.12;

/** A short, soft kick: a sine that drops in pitch and fades out. */
function scheduleKick(context: AudioContext, time: number, accent: boolean) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(accent ? 150 : 120, time);
    oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.55 : 0.35, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.2);
}

/**
 * A small metronome for the CADENZ section: pick a pace, press play and hear
 * the beat CADENZ would run its music on. The light keeps the same tempo.
 */
export function CadenzTempo() {
    const [bpm, setBpm] = useState(160);
    const [playing, setPlaying] = useState(false);
    const [cycle, setCycle] = useState(0);
    const sliderId = useId();
    const contextRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<number | null>(null);
    const nextBeatRef = useRef(0);
    const beatIndexRef = useRef(0);
    const bpmRef = useRef(bpm);

    useEffect(() => {
        bpmRef.current = bpm;
    }, [bpm]);

    const stop = useCallback(() => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
        setPlaying(false);
    }, []);

    const start = useCallback(async () => {
        const AudioContextClass =
            window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const context = contextRef.current ?? new AudioContextClass();
        contextRef.current = context;
        if (context.state === 'suspended') await context.resume();

        nextBeatRef.current = context.currentTime + 0.05;
        beatIndexRef.current = 0;
        setCycle((value) => value + 1);

        timerRef.current = window.setInterval(() => {
            while (nextBeatRef.current < context.currentTime + LOOKAHEAD_S) {
                scheduleKick(context, nextBeatRef.current, beatIndexRef.current % STEPS === 0);
                nextBeatRef.current += 60 / bpmRef.current;
                beatIndexRef.current += 1;
            }
        }, 25);
        setPlaying(true);
    }, []);

    useEffect(() => () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        void contextRef.current?.close();
    }, []);

    const beatStyle = { '--beat': `${60 / bpm}s` } as CSSProperties;
    // Restart the light whenever the tempo changes or playback starts, so it
    // lines up with the first kick.
    const phaseKey = `${bpm}-${cycle}`;

    return (
        <div className="mt-9 max-w-xl rounded-[6px] border border-white/10 bg-[#0a0e12] p-5 sm:p-6" style={beatStyle}>
            <div className="flex items-end justify-between gap-6">
                <div>
                    <label htmlFor={sliderId} className="text-xs text-white/55">
                        Try a pace
                    </label>
                    <p className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight text-white" aria-live="polite">
                        {bpm}
                        <span className="ml-2 text-base font-medium text-white/55">BPM</span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => (playing ? stop() : void start())}
                    aria-pressed={playing}
                    className="group/play relative mb-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-300 text-[#050607] transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e12]"
                >
                    <span
                        key={`ring-${phaseKey}`}
                        className="absolute inset-0 rounded-full bg-sky-300/50"
                        style={{ animation: 'vgp-ring var(--beat) cubic-bezier(0.16, 1, 0.3, 1) infinite' }}
                        aria-hidden="true"
                    />
                    {playing ? (
                        <Pause className="relative h-5 w-5" aria-hidden="true" />
                    ) : (
                        <Play className="relative ml-0.5 h-5 w-5" aria-hidden="true" />
                    )}
                    <span className="sr-only">{playing ? 'Stop the beat' : 'Play the beat'}</span>
                </button>
            </div>

            <div key={`steps-${phaseKey}`} className="mt-5 grid h-8 grid-cols-4 gap-1.5" aria-hidden="true">
                {Array.from({ length: STEPS }, (_, step) => (
                    <span
                        key={step}
                        className="origin-bottom rounded-[3px] bg-white/[0.14]"
                        style={{
                            animation: `vgp-step calc(var(--beat) * ${STEPS}) linear infinite`,
                            animationDelay: `calc(var(--beat) * ${step})`,
                        }}
                    />
                ))}
            </div>

            <input
                id={sliderId}
                type="range"
                min={MIN_BPM}
                max={MAX_BPM}
                step={5}
                value={bpm}
                onChange={(event) => setBpm(Number(event.target.value))}
                className="mt-5 w-full cursor-pointer accent-sky-300"
            />
            <div className="mt-1 flex justify-between text-xs tabular-nums text-white/50" aria-hidden="true">
                <span>{MIN_BPM}</span>
                <span>{MAX_BPM}</span>
            </div>
        </div>
    );
}
