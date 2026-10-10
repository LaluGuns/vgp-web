import type { ChangeEvent } from 'react';
import { DEFAULT_VOLUME } from './volume';

/*
 * Markup that a demo slot shows before its code has arrived, shared by the
 * server (DemoSlot renders it into the HTML) and the browser (DemoMount and
 * VolumeRow render the same), so swapping one for the other moves nothing.
 * No 'use client': on a lesson it is server markup, and it reaches the
 * browser only inside the demo's own chunk.
 */

/** The pill in a demo's box while its controls load. Hidden without JavaScript (DemoSlot's noscript line says why). */
export function Placeholder() {
    return (
        <div className="flex min-h-11 items-center [@media(scripting:none)]:hidden">
            <span className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/55">Loading demo</span>
        </div>
    );
}

/**
 * The volume row under a demo. With `onChange` it is the live control
 * (shell.tsx VolumeRow); without, the same row at the default volume, which
 * the live one replaces in place.
 */
export function VolumeRowView({ id, volume = DEFAULT_VOLUME, onChange }: { id: string; volume?: number; onChange?: (volume: number) => void }) {
    const percent = `${Math.round(volume * 100)}%`;
    const live = onChange ? { value: volume, onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)) } : { defaultValue: volume };
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
            <input id={id} type="range" min={0.05} max={1} step={0.05} {...live} aria-valuetext={percent} className="vgp-range w-full sm:order-1 sm:w-32" />
            <p className="w-full text-xs leading-5 text-white/50 sm:order-3 sm:w-auto sm:flex-1">Start with your speakers or headphones low.</p>
        </div>
    );
}
