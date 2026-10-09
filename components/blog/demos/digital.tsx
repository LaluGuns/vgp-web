'use client';

import { useEffect, useRef, useState } from 'react';
import { clickTone, fadeOut, getEngine, midi, noiseBuffer, sequence, type Engine } from './engine';
import { PlayButton, Readout, Segmented, Slider, useDialect, useFrame, usePlayer } from './ui';

const SWEEP_FROM = 500;
const SWEEP_TO = 15000;
const SWEEP_SECONDS = 8;

type Filter = 'none' | 'filter';
type Rate = '16000' | '44100';

/** What a converter at `rate` stores for an input at `f`, with or without its anti-alias filter. */
function stored(f: number, rate: number, filter: Filter): { freq: number; gain: number } {
    const nyquist = rate / 2;
    if (filter === 'filter') {
        // A steep low-pass just under Nyquist removes what the converter cannot store.
        const gain = f < nyquist * 0.88 ? 1 : f > nyquist * 0.99 ? 0 : (nyquist * 0.99 - f) / (nyquist * 0.11);
        return { freq: f, gain };
    }
    // Without a filter, anything above Nyquist folds back down.
    const folded = Math.abs(f - rate * Math.round(f / rate));
    return { freq: folded, gain: 1 };
}

/**
 * A rising sine sweep, played back as a 16 kHz converter would store it.
 * Above 8 kHz the stored tone turns around and falls: that falling tone
 * is the alias.
 */
export function AliasingDemo() {
    const [filter, setFilter] = useState<Filter>('none');
    const [rate, setRate] = useState<Rate>('16000');
    const [now, setNow] = useState<{ input: number; out: number; gain: number } | null>(null);
    const clock = useRef<{ ctx: AudioContext; start: number; filter: Filter; rate: number; retune: () => void } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const osc = ctx.createOscillator();
        const level = ctx.createGain();
        const master = ctx.createGain();
        // A pure tone is louder than its peak suggests: this puts it at about the loudness of the drum-loop
        // demos (K-weighted), with its peaks near -29 dBFS at the default volume.
        master.gain.value = 0.19;
        osc.connect(level).connect(master).connect(out);

        let scheduledUntil = 0;
        const schedule = () => {
            while (scheduledUntil < ctx.currentTime + 1.5) {
                const n = 256;
                const freqs = new Float32Array(n);
                const gains = new Float32Array(n);
                for (let i = 0; i < n; i++) {
                    const f = SWEEP_FROM + ((SWEEP_TO - SWEEP_FROM) * i) / (n - 1);
                    const s = stored(f, state.rate, state.filter);
                    freqs[i] = Math.max(20, s.freq);
                    gains[i] = s.gain;
                }
                osc.frequency.setValueCurveAtTime(freqs, scheduledUntil, SWEEP_SECONDS - 0.01);
                level.gain.setValueCurveAtTime(gains, scheduledUntil, SWEEP_SECONDS - 0.01);
                scheduledUntil += SWEEP_SECONDS;
            }
        };
        // Changing a setting restarts the sweep from the bottom so the difference is heard at once.
        const retune = () => {
            const t = ctx.currentTime + 0.03;
            osc.frequency.cancelScheduledValues(0);
            level.gain.cancelScheduledValues(0);
            state.start = t;
            scheduledUntil = t;
            schedule();
        };
        const state = { ctx, start: 0, filter, rate: Number(rate), retune };
        clock.current = state;
        retune();
        osc.start();
        const timer = window.setInterval(schedule, 400);
        return () => {
            window.clearInterval(timer);
            clock.current = null;
            setNow(null);
            fadeOut(ctx, master, () => osc.stop());
        };
    });

    useFrame(player.playing, () => {
        const c = clock.current;
        if (!c) return;
        const elapsed = Math.max(0, c.ctx.currentTime - c.start) % SWEEP_SECONDS;
        const input = SWEEP_FROM + ((SWEEP_TO - SWEEP_FROM) * elapsed) / SWEEP_SECONDS;
        const s = stored(input, c.rate, c.filter);
        setNow({ input, out: s.freq, gain: s.gain });
    });

    const apply = (next: { filter?: Filter; rate?: Rate }) => {
        if (next.filter) setFilter(next.filter);
        if (next.rate) setRate(next.rate);
        const c = clock.current;
        if (!c) return;
        if (next.filter) c.filter = next.filter;
        if (next.rate) c.rate = Number(next.rate);
        c.retune();
    };

    const hz = (f: number) => `${Math.round(f).toLocaleString('en-US')} Hz`;
    const rateNum = Number(rate);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} label="Play sweep" />
                <Segmented
                    label="Before the converter"
                    value={filter}
                    onChange={(v) => apply({ filter: v })}
                    options={[
                        { value: 'none', label: 'No filter' },
                        { value: 'filter', label: 'Anti-alias filter' },
                    ]}
                />
            </div>
            <Segmented
                label="Sample rate"
                value={rate}
                onChange={(v) => apply({ rate: v })}
                options={[
                    { value: '16000', label: '16 kHz' },
                    { value: '44100', label: '44.1 kHz' },
                ]}
            />
            <FoldPlot rate={rateNum} filter={filter} input={now?.input} />
            <Readout
                items={[
                    { label: 'Going in', value: now ? hz(now.input) : '–' },
                    { label: 'Stored and played', value: now ? (now.gain < 0.05 ? 'Filtered out' : hz(now.out)) : '–' },
                    { label: 'Nyquist limit', value: hz(rateNum / 2) },
                ]}
            />
        </div>
    );
}

/** Input frequency across, stored frequency up. The fold is the alias. Labels are HTML, so they stay readable at any width. */
function FoldPlot({ rate, filter, input }: { rate: number; filter: Filter; input?: number }) {
    const d = useDialect();
    // Percent of the plot: input from 500 Hz to 15 kHz across, stored frequency from 0 to 15 kHz up.
    const px = (f: number) => ((f - SWEEP_FROM) / (SWEEP_TO - SWEEP_FROM)) * 100;
    const py = (f: number) => 100 - (f / SWEEP_TO) * 100;
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
        const f = SWEEP_FROM + ((SWEEP_TO - SWEEP_FROM) * i) / 120;
        const s = stored(f, rate, filter);
        if (s.gain < 0.05) break;
        pts.push(`${i === 0 ? 'M' : 'L'}${px(f).toFixed(2)},${py(s.freq).toFixed(2)}`);
    }
    const current = input !== undefined ? stored(input, rate, filter) : null;
    const nyq = rate / 2;
    return (
        <div>
            <div className="vgp-plot relative h-32 w-full">
                <div className="absolute inset-x-1 inset-y-2">
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="block h-full w-full overflow-visible"
                        role="img"
                        aria-label={`Input frequency against the frequency that gets stored, at a ${rate / 1000} kHz sample rate${filter === 'filter' ? ' with the anti-alias filter' : ''}.${nyq < SWEEP_TO ? ` Above the Nyquist limit of ${nyq / 1000} kHz the stored tone ${filter === 'filter' ? 'is removed' : 'folds back down'}.` : ''}`}
                    >
                        {nyq < SWEEP_TO ? (
                            <line x1={px(nyq)} x2={px(nyq)} y1={0} y2={100} stroke="rgba(255,255,255,0.4)" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                        ) : null}
                        <path d={pts.join('')} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={d.line} strokeLinecap={d.cap} strokeLinejoin={d.join} vectorEffect="non-scaling-stroke" />
                    </svg>
                    {nyq < SWEEP_TO ? (
                        <span className="absolute top-0 ml-1.5 text-[11px] leading-none text-white/60" style={{ left: `${px(nyq)}%` }} aria-hidden="true">
                            Nyquist
                        </span>
                    ) : null}
                    {/* --accent is the lesson group's (DemoSlot). */}
                    {current && input !== undefined && current.gain >= 0.05 ? (
                        <span
                            aria-hidden="true"
                            className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)] ${d.marker === 'square' || d.marker === 'tick' ? '' : 'rounded-full'}`}
                            style={{ left: `${px(input)}%`, top: `${py(current.freq)}%` }}
                        />
                    ) : null}
                </div>
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-white/55" aria-hidden="true">
                <span>500 Hz</span>
                <span>Input frequency →</span>
                <span>15 kHz</span>
            </div>
        </div>
    );
}

function quantizer(bits: number): Float32Array<ArrayBuffer> {
    const n = 65536;
    const curve = new Float32Array(n);
    const steps = 2 ** (bits - 1);
    for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * 2 - 1;
        curve[i] = Math.round(x * steps) / steps;
    }
    return curve;
}

/** Bit-depth demo timing: a new note every 1.6 s, each fading by 66 dB over 1.5 s, so its tail is long and quiet. */
const NOTE_EVERY = 1.6;
const NOTE_FADE = 1.5;
/** The note goes into the converter at about -15 dBFS and is turned up afterwards by this much. */
const BIT_PRE = 0.1;
const BIT_POST = 7;

/**
 * A quiet, decaying piano-like note stored at fewer and fewer bits.
 * Dither trades the gritty distortion for a steady hiss.
 */
export function BitDepthDemo() {
    const [bits, setBits] = useState(16);
    const [dither, setDither] = useState(false);
    const nodes = useRef<{ ctx: AudioContext; shaper: WaveShaperNode; ditherGain: GainNode } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        const pre = ctx.createGain();
        pre.gain.value = BIT_PRE;
        const shaper = ctx.createWaveShaper();
        shaper.curve = quantizer(bits);
        const post = ctx.createGain();
        post.gain.value = BIT_POST;
        // Triangular dither of plus or minus one step: two independent noises of half a step each.
        const ditherGain = ctx.createGain();
        ditherGain.gain.value = dither ? 0.5 / 2 ** (bits - 1) : 0;
        const noises = [0, 0.97].map((offset) => {
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer(ctx);
            noise.loop = true;
            noise.connect(ditherGain);
            noise.start(0, offset);
            return noise;
        });
        ditherGain.connect(shaper);
        pre.connect(shaper).connect(post).connect(master).connect(out);
        nodes.current = { ctx, shaper, ditherGain };
        const notes = [60, 64, 67, 72];
        let i = 0;
        const play = () => {
            const t = ctx.currentTime + 0.05;
            const f = midi(notes[i++ % notes.length]);
            for (const [h, a] of [
                [1, 1],
                [2, 0.4],
                [3, 0.2],
                [4, 0.1],
            ] as const) {
                const osc = ctx.createOscillator();
                osc.frequency.value = f * h;
                const g = ctx.createGain();
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(a, t + 0.005);
                g.gain.exponentialRampToValueAtTime(0.0005, t + NOTE_FADE);
                osc.connect(g).connect(pre);
                osc.start(t);
                osc.stop(t + NOTE_FADE + 0.1);
            }
        };
        play();
        const timer = window.setInterval(play, NOTE_EVERY * 1000);
        return () => {
            window.clearInterval(timer);
            nodes.current = null;
            fadeOut(ctx, master, () => {
                for (const n of noises) n.stop();
            });
        };
    });

    const apply = (next: { bits?: number; dither?: boolean }) => {
        const b = next.bits ?? bits;
        const d = next.dither ?? dither;
        if (next.bits !== undefined) setBits(b);
        if (next.dither !== undefined) setDither(d);
        const n = nodes.current;
        if (!n) return;
        n.shaper.curve = quantizer(b);
        n.ditherGain.gain.setTargetAtTime(d ? 0.5 / 2 ** (b - 1) : 0, n.ctx.currentTime, 0.01);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Dither"
                    value={dither ? 'on' : 'off'}
                    onChange={(v) => apply({ dither: v === 'on' })}
                    options={[
                        { value: 'off', label: 'Off' },
                        { value: 'on', label: 'On' },
                    ]}
                />
            </div>
            <Slider
                label="Bit depth"
                value={bits}
                min={5}
                max={16}
                onChange={(v) => apply({ bits: v })}
                format={(v) => `${v}-bit`}
                hint="The note is played quietly and turned up afterwards, the way a fade or a quiet passage exposes low bits."
            />
            <Readout
                items={[
                    { label: 'Quantization noise floor', value: `about -${Math.round(6.02 * bits)} dBFS` },
                    { label: 'Steps between silence and full scale', value: (2 ** (bits - 1)).toLocaleString('en-US') },
                ]}
            />
        </div>
    );
}

/** Tap and hear the click arrive late. Somewhere past 10 ms, playing starts to feel wrong. */
export function LatencyDemo() {
    const [latency, setLatency] = useState(0);
    const [taps, setTaps] = useState(0);
    const live = useRef(latency);
    useEffect(() => {
        live.current = latency;
    }, [latency]);

    const tap = () => {
        const { ctx, out } = getEngine();
        clickTone(ctx, out, ctx.currentTime + live.current / 1000, 900, 0.9);
        setTaps((n) => n + 1);
    };

    // The metronome is a demo like the others: starting another demo stops it.
    const metronome = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        bus.connect(out);
        const seq = sequence(ctx, 90, 16, (step, time) => {
            if (step % 4 === 0) clickTone(ctx, bus, time, step === 0 ? 2000 : 1500, 0.7);
        });
        return () => {
            seq.stop();
            fadeOut(ctx, bus);
        };
    });

    return (
        <div className="space-y-6">
            <PlayButton playing={metronome.playing} onClick={metronome.toggle} label="Play metronome" />
            <div className="flex flex-wrap items-center gap-4">
                <button
                    type="button"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        tap();
                    }}
                    onKeyDown={(e) => {
                        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                            e.preventDefault();
                            tap();
                        }
                    }}
                    className="flex h-24 w-24 select-none items-center justify-center rounded-[6px] border border-white/30 text-sm font-semibold text-white transition-[border-color,transform] duration-100 active:scale-95 active:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    aria-label={`Tap pad. The click plays ${latency} milliseconds after you tap.`}
                >
                    Tap
                </button>
                <p className="min-w-0 flex-1 text-sm leading-6 text-white/60">
                    {taps > 0 ? `${taps} ${taps === 1 ? 'tap' : 'taps'}.` : 'Tap the pad, or focus it and press Space, along with the metronome.'}
                </p>
            </div>
            <Slider
                label="Added latency"
                value={latency}
                min={0}
                max={150}
                step={5}
                onChange={setLatency}
                format={(v) => `${v} ms`}
                hint="Your device adds a little of its own. Compare settings against each other, not against zero."
            />
        </div>
    );
}
