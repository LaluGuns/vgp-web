'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Play, Square } from 'lucide-react';
import { DIALECTS, type Dialect } from '@/lib/blog/dialects';
import { claim, getEngine, release, setVolume, storedVolume, type Engine } from './engine';

/**
 * The lesson group's dialect (lib/blog/dialects.ts), provided by DemoSlot.
 * A demo's displays (plots, meters, step grids) draw in it, so a demo looks
 * like the figures around it; its controls stay the same everywhere.
 * Outside a lesson it is technical.
 */
export const DialectContext = createContext<Dialect>(DIALECTS.technical);

export const useDialect = () => useContext(DialectContext);

/** A dialect's accent at an opacity, for canvas fills. */
export function accentAlpha(d: Dialect, opacity: number): string {
    const n = parseInt(d.accent.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${opacity})`;
}

/** Canvas line dash for grid rules: dotted in the mind dialect, solid elsewhere. */
export const ruleDash = (d: Dialect): number[] => (d.rule.dash ? [0.01, 4] : []);

/**
 * Starts and stops one demo. `start` builds the audio graph and returns
 * a function that tears it down. Playback stops when the reader starts
 * another demo, leaves the tab or leaves the page.
 */
export function usePlayer(start: (engine: Engine) => () => void) {
    const [playing, setPlaying] = useState(false);
    const stopRef = useRef<(() => void) | null>(null);
    const startRef = useRef(start);
    useEffect(() => {
        startRef.current = start;
    });

    const stop = useCallback(() => {
        stopRef.current?.();
    }, []);

    const play = useCallback(() => {
        const engine = getEngine();
        const halt = startRef.current(engine);
        const stopThis = () => {
            halt();
            release(stopThis);
            stopRef.current = null;
            setPlaying(false);
        };
        claim(stopThis);
        stopRef.current = stopThis;
        setPlaying(true);
    }, []);

    useEffect(() => {
        const onHide = () => {
            if (document.visibilityState === 'hidden') stopRef.current?.();
        };
        document.addEventListener('visibilitychange', onHide);
        return () => {
            document.removeEventListener('visibilitychange', onHide);
            stopRef.current?.();
        };
    }, []);

    return { playing, play, stop, toggle: () => (stopRef.current ? stop() : play()) };
}

export function PlayButton({ playing, onClick, label = 'Play' }: { playing: boolean; onClick: () => void; label?: string }) {
    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={onClick}
                aria-pressed={playing}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition-[border-color,transform] duration-200 hover:border-white/70 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
                {playing ? <Square size={14} fill="currentColor" aria-hidden="true" /> : <Play size={15} fill="currentColor" aria-hidden="true" />}
                {playing ? 'Stop' : label}
            </button>
            {/* --accent is the lesson group's inside a lesson (DemoSlot), sky elsewhere. */}
            <span className="text-sm text-[var(--accent)]" aria-live="polite">
                {playing ? 'Playing' : ''}
            </span>
        </div>
    );
}

export function Slider({
    label,
    value,
    min,
    max,
    step = 1,
    onChange,
    format,
    hint,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    format?: (value: number) => string;
    hint?: ReactNode;
}) {
    const id = useId();
    const text = format ? format(value) : String(value);
    return (
        <div>
            <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={id} className="text-sm font-medium text-white/85">
                    {label}
                </label>
                <output htmlFor={id} className="text-sm tabular-nums text-white/65">
                    {text}
                </output>
            </div>
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-valuetext={text}
                onChange={(e) => onChange(Number(e.target.value))}
                className="vgp-range mt-2 w-full"
            />
            {hint ? <p className="mt-1 text-xs leading-5 text-white/50">{hint}</p> : null}
        </div>
    );
}

export function Segmented<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    /** null when nothing is chosen yet. */
    value: T | null;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    return (
        <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(option.value)}
                        className={`min-h-10 rounded-md border px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                            active ? 'border-white/80 text-white' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

/** A level bar. `value` 0 to 1. Its ends follow the dialect (app/globals.css, `.vgp-meter`). */
export function Meter({ label, value, text }: { label: string; value: number; text: string }) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-white/70">{label}</span>
                <span className="tabular-nums text-white/85">{text}</span>
            </div>
            <div className="vgp-meter mt-2 h-2 bg-white/[0.06]" aria-hidden="true">
                <div className="vgp-meter-fill h-full bg-white/75" style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }} />
            </div>
        </div>
    );
}

export function Readout({ items }: { items: { label: string; value: string }[] }) {
    return (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {items.map((item) => (
                <div key={item.label}>
                    <dt className="text-xs text-white/50">{item.label}</dt>
                    <dd className="mt-0.5 text-lg font-semibold tabular-nums text-white">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function VolumeRow() {
    const [volume, setLocal] = useState(0.5);
    const id = useId();
    useEffect(() => {
        const frame = requestAnimationFrame(() => setLocal(storedVolume()));
        return () => cancelAnimationFrame(frame);
    }, []);
    return (
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-5">
            <label htmlFor={id} className="text-sm text-white/60">
                Demo volume
            </label>
            <input
                id={id}
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => {
                    const v = Number(e.target.value);
                    setLocal(v);
                    setVolume(v);
                }}
                className="vgp-range w-32"
            />
            <p className="w-full text-xs leading-5 text-white/50 sm:w-auto sm:flex-1">Start with your speakers or headphones low.</p>
        </div>
    );
}

/** Runs `fn` every animation frame while `active`. */
export function useFrame(active: boolean, fn: () => void) {
    const fnRef = useRef(fn);
    useEffect(() => {
        fnRef.current = fn;
    });
    useEffect(() => {
        if (!active) return;
        let id = 0;
        let last = 0;
        const loop = (t: number) => {
            // About 20 updates a second is plenty for meters.
            if (t - last > 50) {
                last = t;
                fnRef.current();
            }
            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(id);
    }, [active]);
}
