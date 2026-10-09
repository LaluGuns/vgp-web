'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
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

/** Rounded ends for the dialects that draw round line ends, square for the others. */
const endClass = (d: Dialect) => (d.cap === 'round' ? 'rounded-full' : '');

/** Runs `fn` when the browser is idle, or after `timeout` ms at the latest. Returns a cancel function. */
export function whenIdle(fn: () => void, timeout = 2000): () => void {
    if (typeof window.requestIdleCallback === 'function') {
        const id = window.requestIdleCallback(() => fn(), { timeout });
        return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(fn, 300);
    return () => window.clearTimeout(id);
}

/** Runs `fn` in a new task once the next frame has been painted. */
function afterPaint(fn: () => void) {
    requestAnimationFrame(() => window.setTimeout(fn, 0));
}

/**
 * Starts and stops one demo. `start` builds the audio graph and returns
 * a function that tears it down. Playback stops when the reader starts
 * another demo, leaves the tab or leaves the page.
 *
 * The audio context is created or resumed inside the tap, as browsers
 * require, but the graph is built in the next task, after the button has
 * repainted, so the tap itself stays short on a slow phone.
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
        let halt: (() => void) | null = null;
        let stopped = false;
        const stopThis = () => {
            stopped = true;
            halt?.();
            halt = null;
            release(stopThis);
            if (stopRef.current === stopThis) stopRef.current = null;
            setPlaying(false);
        };
        claim(stopThis);
        stopRef.current = stopThis;
        setPlaying(true);
        afterPaint(() => {
            if (!stopped) halt = startRef.current(engine);
        });
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

/**
 * Play and Stop. The label itself says what a press does, so the button
 * carries no pressed state on top; the status next to it is announced.
 */
export function PlayButton({ playing, onClick, label = 'Play' }: { playing: boolean; onClick: () => void; label?: string }) {
    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={onClick}
                data-demo-play=""
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

/** A visible label above a group of controls, with an optional note under them. */
export function Field({ label, id, hint, children }: { label: string; id?: string; hint?: ReactNode; children: ReactNode }) {
    return (
        <div>
            <p id={id} className="mb-2 text-sm font-medium text-white/85">
                {label}
            </p>
            {children}
            {hint ? <p className="mt-2 text-xs leading-5 text-white/50">{hint}</p> : null}
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
                <label htmlFor={id} className="min-w-0 text-sm font-medium text-white/85">
                    {label}
                </label>
                <output htmlFor={id} className="shrink-0 whitespace-nowrap text-sm tabular-nums text-white/65">
                    {text}
                </output>
            </div>
            {/* .vgp-range (app/globals.css) is a 44 px touch target pulled in by 8 px top and bottom. */}
            <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-valuetext={text}
                onChange={(e) => onChange(Number(e.target.value))}
                className="vgp-range w-full"
            />
            {hint ? <p className="mt-1 text-xs leading-5 text-white/50">{hint}</p> : null}
        </div>
    );
}

const optionClass = (active: boolean) =>
    `min-h-11 min-w-11 rounded-md border px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
        active ? 'border-white/80 text-white' : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
    }`;

/**
 * One choice from a few, with its label shown above it. A radio group:
 * one tab stop, the arrow keys (and Home and End) move between the options
 * and choose as they go, Space and Enter choose too.
 */
export function Segmented<T extends string>({
    label,
    value,
    options,
    onChange,
    hint,
}: {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
    hint?: ReactNode;
}) {
    const labelId = useId();
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);
    const chosen = options.findIndex((o) => o.value === value);
    const tabStop = chosen >= 0 ? chosen : 0;

    const onKey = (from: number, e: KeyboardEvent<HTMLButtonElement>) => {
        const last = options.length - 1;
        let to: number;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = from === last ? 0 : from + 1;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = from === 0 ? last : from - 1;
        else if (e.key === 'Home') to = 0;
        else if (e.key === 'End') to = last;
        else return;
        e.preventDefault();
        buttons.current[to]?.focus();
        if (to !== chosen) onChange(options[to].value);
    };

    return (
        <Field label={label} id={labelId} hint={hint}>
            <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                {options.map((option, i) => (
                    <button
                        key={option.value}
                        ref={(el) => {
                            buttons.current[i] = el;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={i === chosen}
                        tabIndex={i === tabStop ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(e) => onKey(i, e)}
                        className={optionClass(i === chosen)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </Field>
    );
}

/**
 * Answer buttons that look like a choice group but act as plain buttons,
 * for a choice that reveals something (a blind test's pick). Moving the
 * focus never commits an answer; only a press does.
 */
export function Answers<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: T | null;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    const labelId = useId();
    return (
        <Field label={label} id={labelId}>
            <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)} className={optionClass(option.value === value)}>
                        {option.label}
                    </button>
                ))}
            </div>
        </Field>
    );
}

/** A level bar. `value` 0 to 1. Its ends follow the dialect (app/globals.css, `.vgp-meter`). */
export function Meter({ label, value, text }: { label: string; value: number; text: string }) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="min-w-0 text-white/70">{label}</span>
                <span className="shrink-0 whitespace-nowrap tabular-nums text-white/85">{text}</span>
            </div>
            <div className="vgp-meter mt-2 h-2 bg-white/[0.06]" aria-hidden="true">
                <div className="vgp-meter-fill h-full bg-white/75" style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }} />
            </div>
        </div>
    );
}

/** Numbers under their labels. Labels may wrap; the values always sit on one line, level with each other. */
export function Readout({ items }: { items: { label: string; value: string }[] }) {
    return (
        <dl className="grid grid-cols-2 items-end gap-x-6 gap-y-3 sm:grid-cols-3">
            {items.map((item) => (
                <div key={item.label} className="min-w-0">
                    <dt className="text-xs leading-4 text-white/50">{item.label}</dt>
                    <dd className="mt-1 whitespace-nowrap text-lg font-semibold leading-6 tabular-nums text-white">{item.value}</dd>
                </div>
            ))}
        </dl>
    );
}

/**
 * Where the music is: a row of steps (bars, chords) read like a lead sheet,
 * not buttons. Each step is a small label over a line; the step that is
 * playing lights its line in the accent. `focus` marks the step the demo is
 * about (its label is in the accent too). With `beats`, each line is split
 * into that many beats, and `sounding` says how many of them play, so a
 * beat left silent shows as a gap.
 */
export function StepStrip({
    steps,
    current,
    beats = 1,
}: {
    steps: { key: string; label: string; focus?: boolean; sounding?: number }[];
    current: number;
    beats?: number;
}) {
    const d = useDialect();
    return (
        <div aria-hidden="true" className="grid gap-x-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map((step, i) => {
                const on = i === current;
                return (
                    <div key={step.key} className="min-w-0">
                        <span className={`block truncate text-xs ${step.focus ? 'font-semibold text-[var(--accent)]' : on ? 'font-medium text-white' : 'text-white/55'}`}>{step.label}</span>
                        <span className="mt-1.5 flex h-[3px] gap-0.5">
                            {Array.from({ length: beats }, (_, b) => (
                                <span
                                    key={b}
                                    className={`h-full flex-1 transition-colors duration-150 ${endClass(d)} ${
                                        b >= (step.sounding ?? beats) ? 'bg-transparent' : on ? 'bg-[var(--accent)]' : 'bg-white/25'
                                    }`}
                                />
                            ))}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export interface RollNote {
    /** First slot of the note. */
    at: number;
    /** Length in slots. */
    len: number;
    /** MIDI note number. */
    pitch: number;
    /** A note the demo is about, drawn in the accent. */
    focus?: boolean;
}

/**
 * A small piano roll: time across, pitch up. Bar lines and note ends follow
 * the dialect. The note under the playhead brightens; `focus` notes are in
 * the accent. Drawn with boxes in percent, so it fills any width at a fixed
 * height without stretching the note ends.
 */
export function NoteRoll({ notes, slots, bars, current, label }: { notes: RollNote[]; slots: number; bars: number[]; current: number; label: string }) {
    const d = useDialect();
    const pitches = notes.map((n) => n.pitch);
    const low = Math.min(...pitches) - 1;
    const high = Math.max(...pitches) + 1;
    const radius = d.corner === 'pill' ? 999 : Math.min(d.corner, 3);
    const top = (p: number) => `calc(${((high - p) / (high - low)) * 100}% - 3px)`;
    return (
        <div role="img" aria-label={label} className="vgp-plot relative h-24 w-full overflow-hidden">
            <div className="absolute inset-x-0 bottom-3 top-2">
                {bars.map((b) => (
                    <span
                        key={b}
                        className={`absolute -bottom-3 -top-2 ${d.rule.dash ? 'w-0 border-l border-dotted border-white/30' : 'w-px bg-white/10'}`}
                        style={{ left: `${(b / slots) * 100}%` }}
                    />
                ))}
                {notes.map((n) => {
                    const sounding = current >= n.at && current < n.at + n.len;
                    return (
                        <span
                            key={`${n.at}-${n.pitch}`}
                            className={`absolute h-1.5 transition-colors duration-100 ${n.focus ? 'bg-[var(--accent)]' : sounding ? 'bg-white/95' : 'bg-white/50'}`}
                            style={{ left: `calc(${(n.at / slots) * 100}% + 2px)`, width: `calc(${(n.len / slots) * 100}% - 4px)`, top: top(n.pitch), borderRadius: radius }}
                        />
                    );
                })}
            </div>
            {current >= 0 ? (
                <span className="absolute bottom-0 h-[3px] bg-white/50" style={{ left: `${(current / slots) * 100}%`, width: `${100 / slots}%` }} />
            ) : null}
        </div>
    );
}

const TRACE_POINTS = 120;
/** The context area's grey, blended to opaque over the panel so no rule shows through it. */
const TRACE_AREA = '#34383c';
const powerDb = (p: number) => (p > 1e-12 ? 10 * Math.log10(p) : -120);

/** Mean square of an analyser's current block. */
export function blockPower(analyser: AnalyserNode, buf: Float32Array<ArrayBuffer>): number {
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return sum / buf.length;
}

/**
 * Level over the last six seconds: the context signal (a dry voice, the dry
 * notes) as a grey area, the signal the demo is about as the accent line.
 * `read` returns the two signals' current mean-square power, about 20 times
 * a second while `active`. The last picture stays after playback stops.
 */
export function LevelTrace({
    active,
    read,
    label,
    context,
    focus,
}: {
    active: boolean;
    read: () => { context: number; focus: number } | null;
    label: string;
    context: string;
    focus: string;
}) {
    const d = useDialect();
    const canvas = useRef<HTMLCanvasElement>(null);
    const history = useRef({ context: new Float32Array(TRACE_POINTS).fill(-120), focus: new Float32Array(TRACE_POINTS).fill(-120), head: 0 });

    useEffect(() => {
        if (!active) return;
        const h = history.current;
        h.context.fill(-120);
        h.focus.fill(-120);
        h.head = 0;
    }, [active]);

    useFrame(active, () => {
        const levels = read();
        if (!levels) return;
        const h = history.current;
        h.context[h.head] = powerDb(levels.context);
        h.focus[h.head] = powerDb(levels.focus);
        h.head = (h.head + 1) % TRACE_POINTS;
        drawTrace(canvas.current, h.context, h.focus, h.head, d);
    });

    return (
        <div>
            <canvas ref={canvas} role="img" aria-label={label} className="vgp-plot block h-24 w-full" />
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60" aria-hidden="true">
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-3 rounded-[1px]" style={{ backgroundColor: TRACE_AREA }} />
                    {context}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-0.5 w-3 bg-[var(--accent)]" />
                    {focus}
                </span>
                <span>Last 6 seconds</span>
            </div>
        </div>
    );
}

/** Sizes a canvas for the screen and returns a context that draws in CSS pixels. */
export function canvas2d(c: HTMLCanvasElement | null): { g: CanvasRenderingContext2D; w: number; h: number } | null {
    if (!c) return null;
    const g = c.getContext('2d');
    if (!g) return null;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    return { g, w, h };
}

function drawTrace(c: HTMLCanvasElement | null, context: Float32Array, focus: Float32Array, head: number, d: Dialect) {
    const s = canvas2d(c);
    if (!s) return;
    const { g, w, h } = s;
    const floor = -48;
    const top = -6;
    const y = (db: number) => h - 2 - ((Math.max(floor, Math.min(top, db)) - floor) / (top - floor)) * (h - 4);
    const x = (i: number) => (i / (TRACE_POINTS - 1)) * w;
    g.strokeStyle = d.rule.dash ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.08)';
    g.lineWidth = d.rule.dash ? 1.4 : 1;
    g.lineCap = d.rule.cap;
    g.setLineDash(ruleDash(d));
    for (const db of [-34, -20]) {
        g.beginPath();
        g.moveTo(0, y(db));
        g.lineTo(w, y(db));
        g.stroke();
    }
    g.setLineDash([]);
    const at = (arr: Float32Array, i: number) => arr[(head + i) % TRACE_POINTS];
    // The context as an opaque grey area, so no rule shows through it.
    g.beginPath();
    g.moveTo(0, h);
    for (let i = 0; i < TRACE_POINTS; i++) g.lineTo(x(i), y(at(context, i)));
    g.lineTo(w, h);
    g.closePath();
    g.fillStyle = TRACE_AREA;
    g.fill();
    // What the demo is about, as the accent line.
    g.beginPath();
    for (let i = 0; i < TRACE_POINTS; i++) {
        if (i === 0) g.moveTo(x(i), y(at(focus, i)));
        else g.lineTo(x(i), y(at(focus, i)));
    }
    g.strokeStyle = d.accent;
    g.lineWidth = 1.5;
    g.lineCap = d.cap;
    g.lineJoin = 'round';
    g.stroke();
}

export function VolumeRow() {
    const [volume, setLocal] = useState(0.5);
    const id = useId();
    useEffect(() => {
        const frame = requestAnimationFrame(() => setLocal(storedVolume()));
        return () => cancelAnimationFrame(frame);
    }, []);
    return (
        // Without JavaScript the demo cannot play, so the volume control is hidden with it.
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-5 [@media(scripting:none)]:hidden">
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
                aria-valuetext={`${Math.round(volume * 100)}%`}
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
