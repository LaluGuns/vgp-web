'use client';

import { useId, useState } from 'react';
import type { CSSProperties } from 'react';

const MIN_BPM = 130;
const MAX_BPM = 180;
const STEPS = 4;

/**
 * A small metronome for the CADENZ section: pick a pace and the light keeps
 * that beat, which is what the app does with its music.
 */
export function CadenzTempo() {
    const [bpm, setBpm] = useState(160);
    const sliderId = useId();
    const beatStyle = { '--beat': `${60 / bpm}s` } as CSSProperties;

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

                {/* key restarts the animations so they stay in phase after a change */}
                <div key={`pulse-${bpm}`} className="relative mb-2 h-4 w-4 shrink-0" aria-hidden="true">
                    <span
                        className="absolute inset-0 rounded-full bg-sky-300/60"
                        style={{ animation: 'vgp-ring var(--beat) cubic-bezier(0.16, 1, 0.3, 1) infinite' }}
                    />
                    <span
                        className="absolute inset-0 rounded-full bg-sky-300"
                        style={{ animation: 'vgp-beat var(--beat) ease-out infinite' }}
                    />
                </div>
            </div>

            <div key={`steps-${bpm}`} className="mt-5 grid h-8 grid-cols-4 gap-1.5" aria-hidden="true">
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
