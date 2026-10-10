'use client';

import { createContext, useEffect, useId, useState } from 'react';
import type { Dialect } from '@/lib/blog/dialects';
import { VolumeRowView } from './views';
import { DEFAULT_VOLUME, onVolume, setVolume, storedVolume } from './volume';

/*
 * The small part of the demo code that a lesson with a demo slot loads up
 * front, in one chunk with DemoMount (DemoBoot fetches it): the contexts
 * DemoMount provides, the idle helper it waits with, and the volume row. The
 * audio engine and the controls (ui.tsx) arrive with the demo's own chunk,
 * so a lesson whose demo is never reached loads neither, and a lesson
 * without a demo loads none of it.
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
    return (
        <VolumeRowView
            id={id}
            volume={volume}
            onChange={(v) => {
                setLocal(v);
                setVolume(v);
            }}
        />
    );
}
