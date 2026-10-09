'use client';

import { createContext, useEffect, useId, useState } from 'react';
import type { Dialect } from '@/lib/blog/dialects';
import { DEFAULT_VOLUME, onVolume, setVolume, storedVolume } from './volume';

/*
 * The small part of the demo code that every lesson with a demo slot loads
 * up front: the contexts DemoMount provides, the idle helper it waits with,
 * and the volume row. The audio engine and the controls (ui.tsx) arrive with
 * the demo's own chunk, so a lesson whose demo is never reached loads neither.
 */

/**
 * The lesson group's dialect (lib/blog/dialects.ts), provided by DemoMount.
 * A demo's displays (plots, meters, step grids) draw in it, so a demo looks
 * like the figures around it; its controls stay the same everywhere.
 * `useDialect` (ui.tsx) falls back to technical outside a lesson.
 */
export const DialectContext = createContext<Dialect | null>(null);

/** The demo's playback trim in dB (`level` in lib/blog/demos.ts), applied by usePlayer. */
export const LevelContext = createContext(0);

/** Runs `fn` when the browser is idle, or after `timeout` ms at the latest. Returns a cancel function. */
export function whenIdle(fn: () => void, timeout = 2000): () => void {
    if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => fn(), { timeout });
        return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(fn, 300);
    return () => window.clearTimeout(id);
}

export function VolumeRow() {
    const [volume, setLocal] = useState(DEFAULT_VOLUME);
    const id = useId();
    useEffect(() => {
        const frame = requestAnimationFrame(() => setLocal(storedVolume()));
        // One volume for every demo, so a second slider on the page follows the first.
        const stop = onVolume(setLocal);
        return () => {
            cancelAnimationFrame(frame);
            stop();
        };
    }, []);
    const percent = `${Math.round(volume * 100)}%`;
    return (
        // Without JavaScript the demo cannot play, so the volume control is hidden with it.
        // On a phone the label and the percentage share a line above a full-width slider, like the
        // demo's own sliders; from 640 px up the label, slider and percentage sit in one row.
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-5 [@media(scripting:none)]:hidden">
            <label htmlFor={id} className="text-sm text-white/60">
                Demo volume
            </label>
            {/* Not a live region: the slider's value text says the same as it moves. */}
            <output htmlFor={id} aria-live="off" className="ml-auto text-sm tabular-nums text-white/60 sm:order-2 sm:ml-0 sm:w-10">
                {percent}
            </output>
            <input
                id={id}
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={volume}
                aria-valuetext={percent}
                onChange={(e) => {
                    const v = Number(e.target.value);
                    setLocal(v);
                    setVolume(v);
                }}
                className="vgp-range w-full sm:order-1 sm:w-32"
            />
            <p className="w-full text-xs leading-5 text-white/50 sm:order-3 sm:w-auto sm:flex-1">Start with your speakers or headphones low.</p>
        </div>
    );
}
