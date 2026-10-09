'use client';

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { bass, fadeOut, hat, kick, midi, pad, pluck, sequence, snare, type Engine } from './engine';
import { Meter, PlayButton, Readout, Segmented, Slider, useDialect, useFrame, usePlayer, whenIdle } from './ui';

// ── Shared helpers ──────────────────────────────────────────────────
//
// Every comparison here is level-matched with numbers, not by ear: each
// setting is rendered offline through the same graph that plays, its
// K-weighted loudness (ITU-R BS.1770) is measured, and the playing graph
// takes the new setting and its matching gain at the same moment. The
// figures are drawn from those same renders.

/** Sample rate of the offline renders that measure loudness and draw the figures. */
const RATE = 44100;
/** Where the first step lands in an offline render. */
const LEAD = 0.05;

const dbToGain = (db: number) => 10 ** (db / 20);
const gainToDb = (gain: number) => 20 * Math.log10(Math.max(gain, 1e-9));

function fmtDb(db: number, digits = 1, unit = 'dB'): string {
    const r = Number(db.toFixed(digits));
    return `${r > 0 ? '+' : ''}${(r === 0 ? 0 : r).toFixed(digits)} ${unit}`;
}

/** A waveshaper curve sampled over the input range -1 to 1. */
function curve(points: number, fn: (x: number) => number): Float32Array<ArrayBuffer> {
    const c = new Float32Array(points);
    for (let i = 0; i < points; i++) c[i] = fn((i / (points - 1)) * 2 - 1);
    return c;
}

/** Straight line from -1 to 1. Anything beyond full scale is held at full scale: a hard clip. */
const HARD_CLIP = new Float32Array([-1, 1]);

/** A one-pole smoother: the building block of an envelope follower. */
function onePole(ctx: BaseAudioContext, seconds: number): IIRFilterNode {
    const p = Math.exp(-1 / (seconds * ctx.sampleRate));
    return ctx.createIIRFilter([1 - p], [1, -p]);
}

const latencies = new Map<number, number>();
const latencyJobs = new Map<number, Promise<number>>();

/**
 * A DynamicsCompressorNode delays its output (about 6 ms in Chromium). Any
 * path that is compared with or summed against a compressed path is
 * delayed by the measured amount so the two line up.
 */
function measureLatency(sampleRate: number): Promise<number> {
    let job = latencyJobs.get(sampleRate);
    if (!job) {
        job = (async () => {
            const at = Math.round(sampleRate * 0.1);
            const length = at + Math.round(sampleRate * 0.05);
            const ctx = new OfflineAudioContext(1, length, sampleRate);
            const buffer = ctx.createBuffer(1, length, sampleRate);
            buffer.getChannelData(0)[at] = 0.001;
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.connect(ctx.createDynamicsCompressor()).connect(ctx.destination);
            src.start();
            const out = (await ctx.startRendering()).getChannelData(0);
            let best = at;
            for (let i = at; i < length; i++) if (Math.abs(out[i]) > Math.abs(out[best])) best = i;
            const seconds = (best - at) / sampleRate;
            latencies.set(sampleRate, seconds);
            return seconds;
        })().catch(() => 0);
        latencyJobs.set(sampleRate, job);
    }
    return job;
}

const latencyNow = (sampleRate: number) => latencies.get(sampleRate) ?? 0.006;

const makeupJobs = new Map<string, Promise<number>>();

/**
 * DynamicsCompressorNode adds its own makeup gain, set by its threshold,
 * knee and ratio. Measure it with a quiet steady signal so it can be
 * taken back out.
 */
function measureMakeup(key: string, build: (ctx: BaseAudioContext) => DynamicsCompressorNode): Promise<number> {
    let job = makeupJobs.get(key);
    if (!job) {
        job = (async () => {
            const ctx = new OfflineAudioContext(1, RATE / 2, RATE);
            const dc = ctx.createConstantSource();
            dc.offset.value = 0.001;
            dc.connect(build(ctx)).connect(ctx.destination);
            dc.start();
            const out = (await ctx.startRendering()).getChannelData(0);
            return out[out.length - 1] / 0.001;
        })();
        makeupJobs.set(key, job);
    }
    return job;
}

/** Renders a graph offline. Each tap is recorded to its own channel. */
async function renderOffline(seconds: number, taps: number, build: (ctx: OfflineAudioContext, taps: GainNode[]) => void): Promise<Float32Array<ArrayBuffer>[]> {
    const ctx = new OfflineAudioContext(taps, Math.ceil(seconds * RATE), RATE);
    const merger = ctx.createChannelMerger(taps);
    merger.connect(ctx.destination);
    const outs: GainNode[] = [];
    for (let i = 0; i < taps; i++) {
        const g = ctx.createGain();
        g.connect(merger, 0, i);
        outs.push(g);
    }
    build(ctx, outs);
    const buffer = await ctx.startRendering();
    return outs.map((_, i) => buffer.getChannelData(i));
}

function biquad(x: Float32Array, b0: number, b1: number, b2: number, a1: number, a2: number): Float32Array {
    const y = new Float32Array(x.length);
    let x1 = 0;
    let x2 = 0;
    let y1 = 0;
    let y2 = 0;
    for (let i = 0; i < x.length; i++) {
        const v = x[i];
        const out = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
        x2 = x1;
        x1 = v;
        y2 = y1;
        y1 = out;
        y[i] = out;
    }
    return y;
}

/** The K-weighting filter from ITU-R BS.1770, so matching follows what the ear hears rather than raw power. */
function kWeight(x: Float32Array): Float32Array {
    let k = Math.tan((Math.PI * 1681.974450955533) / RATE);
    let q = 0.7071752369554196;
    const vh = 10 ** (3.999843853973347 / 20);
    const vb = vh ** 0.4996667741545416;
    let a0 = 1 + k / q + k * k;
    const shelf = biquad(x, (vh + (vb * k) / q + k * k) / a0, (2 * (k * k - vh)) / a0, (vh - (vb * k) / q + k * k) / a0, (2 * (k * k - 1)) / a0, (1 - k / q + k * k) / a0);
    k = Math.tan((Math.PI * 38.13547087602444) / RATE);
    q = 0.5003270373238773;
    a0 = 1 + k / q + k * k;
    return biquad(shelf, 1, -2, 1, (2 * (k * k - 1)) / a0, (1 - k / q + k * k) / a0);
}

function meanProduct(a: Float32Array, b: Float32Array, from: number, to: number): number {
    let sum = 0;
    for (let i = from; i < to; i++) sum += a[i] * b[i];
    return sum / Math.max(1, to - from);
}

/** K-weighted mean square of a stretch of signal. Ratios of these are loudness ratios. */
function loudnessPower(x: Float32Array, from: number, to: number): number {
    const k = kWeight(x);
    return meanProduct(k, k, from, to);
}

function peakOf(x: Float32Array, from: number, to: number): number {
    let peak = 0;
    for (let i = from; i < to; i++) peak = Math.max(peak, Math.abs(x[i]));
    return peak;
}

/** Splits a stretch of signal into `count` slices and returns each slice's peak in dB relative to `ref`. */
function columns(sample: (i: number) => number, length: number, count: number, ref: number, lowest = false): number[] {
    const out: number[] = [];
    const span = length / count;
    for (let c = 0; c < count; c++) {
        const a = Math.floor(c * span);
        const b = Math.max(a + 1, Math.floor((c + 1) * span));
        let v = lowest ? Infinity : 0;
        for (let i = a; i < b; i++) {
            const s = Math.abs(sample(i));
            v = lowest ? Math.min(v, s) : Math.max(v, s);
        }
        out.push(gainToDb(v / ref));
    }
    return out;
}

/**
 * Level of each column as the RMS over `window` samples centred on it, in
 * dB relative to `ref`. Over half a cycle of a sine the RMS is the same
 * wherever the window starts, so a kick reads as one smooth shape rather
 * than a comb of cycles.
 */
function windowRms(sample: (i: number) => number, length: number, count: number, ref: number, window: number): number[] {
    const out: number[] = [];
    for (let c = 0; c < count; c++) {
        const centre = ((c + 0.5) * length) / count;
        const a = Math.max(0, Math.floor(centre - window / 2));
        const b = Math.min(length, Math.ceil(centre + window / 2));
        let sum = 0;
        for (let i = a; i < b; i++) sum += sample(i) ** 2;
        out.push(gainToDb(Math.sqrt(sum / Math.max(1, b - a)) / ref));
    }
    return out;
}

/**
 * Runs `measure` whenever `key` changes: one render at a time, always
 * finishing on the latest inputs. Returns the last finished result. The
 * first measurement waits for an idle moment, so a demo that mounts while
 * the reader scrolls toward it costs no frames.
 */
function useAnalysis<R>(key: string, measure: () => Promise<R>): R | null {
    const [result, setResult] = useState<R | null>(null);
    const measureRef = useRef(measure);
    const job = useRef({ busy: false, dirty: false, alive: true, first: true });
    useEffect(() => {
        measureRef.current = measure;
    });
    useEffect(() => {
        const j = job.current;
        j.alive = true;
        j.dirty = true;
        const run = () => {
            if (j.busy || !j.alive) return;
            j.busy = true;
            void (async () => {
                while (j.dirty && j.alive) {
                    j.dirty = false;
                    try {
                        const r = await measureRef.current();
                        if (j.alive) setResult(r);
                    } catch {
                        // Keep the last good result.
                    }
                }
                j.busy = false;
            })();
        };
        let cancel = () => {};
        if (j.first) {
            j.first = false;
            cancel = whenIdle(run, 600);
        } else run();
        return () => {
            j.alive = false;
            cancel();
        };
    }, [key]);
    return result;
}

/** Where step 0 of the loop last landed, so a playhead can follow the audio. */
interface LoopClock {
    ctx: AudioContext;
    barStart: number;
    barDur: number;
    /** Extra delay between the source and what is heard, in seconds. */
    offset: number;
}

/** Returns a ref for the playhead line. It follows the loop while `active`. */
function usePlayhead(active: boolean, clock: { current: LoopClock | null }): RefObject<HTMLDivElement> {
    const line = useRef<HTMLDivElement>(null);
    useFrame(active, () => {
        const c = clock.current;
        const el = line.current;
        if (!c || !el) return;
        const heard = c.ctx.currentTime - (c.ctx.outputLatency || 0) - c.offset - c.barStart;
        const phase = (((heard % c.barDur) + c.barDur) % c.barDur) / c.barDur;
        el.style.left = `${(phase * 100).toFixed(2)}%`;
    });
    return line;
}

// ── Figures ─────────────────────────────────────────────────────────

interface Trace {
    db: number[];
    /** before: grey filled level. reference: grey dashed line. after: the accent line, what you hear. */
    kind: 'before' | 'reference' | 'after';
}

const VIEW_W = 240;
const VIEW_H = 64;
/** The grey of a "before" level, blended to opaque over the panel so the kick marks do not show through it. */
const BEFORE_FILL = '#34383c';

function tracePath(db: number[], floor: number, closed: boolean): string {
    const n = db.length;
    const pts = db.map((v, i) => {
        const x = (i / Math.max(1, n - 1)) * VIEW_W;
        const y = (Math.max(floor, Math.min(0, v)) / floor) * VIEW_H;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return closed ? `M0,${VIEW_H}L${pts.join('L')}L${VIEW_W},${VIEW_H}Z` : `M${pts.join('L')}`;
}

/** Level over time on a dB scale: 0 dB at the top, `floor` at the bottom. */
function Strip({
    traces,
    floor,
    label,
    className = 'h-24',
    marks,
    playhead,
}: {
    traces: Trace[] | null;
    floor: number;
    label: string;
    className?: string;
    /** Positions from 0 to 1 to mark with faint vertical lines. */
    marks?: number[];
    playhead?: RefObject<HTMLDivElement>;
}) {
    // The lesson group's accent and line ends (DemoSlot), so the reading matches the figures.
    const d = useDialect();
    return (
        <div className="vgp-plot relative overflow-hidden">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" className={`block w-full ${className}`} role="img" aria-label={label}>
                {marks?.map((m) => (
                    <line key={m} x1={m * VIEW_W} x2={m * VIEW_W} y1={0} y2={VIEW_H} stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
                ))}
                {traces?.map((t, i) =>
                    t.kind === 'before' ? (
                        <path key={i} d={tracePath(t.db, floor, true)} fill={BEFORE_FILL} stroke="rgba(255,255,255,0.4)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                    ) : (
                        <path
                            key={i}
                            d={tracePath(t.db, floor, false)}
                            fill="none"
                            stroke={t.kind === 'after' ? d.accent : 'rgba(255,255,255,0.5)'}
                            strokeWidth={t.kind === 'after' ? 1.5 : 1}
                            strokeDasharray={t.kind === 'reference' ? '4 4' : undefined}
                            strokeLinecap={d.cap}
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    ),
                )}
            </svg>
            {playhead ? <div ref={playhead} aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/50 motion-reduce:hidden" /> : null}
        </div>
    );
}

function Legend({ items }: { items: { kind: Trace['kind']; text: string }[] }) {
    return (
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60">
            {items.map((item) => (
                <span key={item.text} className="inline-flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        style={item.kind === 'before' ? { backgroundColor: BEFORE_FILL, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)' } : undefined}
                        className={
                            item.kind === 'before'
                                ? 'h-2.5 w-3'
                                : item.kind === 'reference'
                                  ? 'w-3 border-t border-dashed border-white/60'
                                  : 'h-0.5 w-3 bg-[var(--accent)]'
                        }
                    />
                    {item.text}
                </span>
            ))}
        </div>
    );
}

// ── The drum loop ───────────────────────────────────────────────────

const DRUM_BPM = 92;
const STEP = 60 / DRUM_BPM / 4;
const BAR = STEP * 16;

// A boom-bap bar with ghost notes: the quiet detail that dynamics processing moves around.
const KICKS: [number, number][] = [
    [0, 1],
    [7, 0.5],
    [10, 0.9],
];
const SNARES: [number, number][] = [
    [4, 1],
    [6, 0.15],
    [9, 0.18],
    [12, 1],
    [15, 0.24],
];

function drums(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number) {
    for (const [s, level] of KICKS) if (s === step) kick(ctx, dest, time, level);
    for (const [s, level] of SNARES) if (s === step) snare(ctx, dest, time, level);
    if (step % 2 === 0) hat(ctx, dest, time, step % 4 === 0 ? 0.55 : 0.3);
}

/** Schedules two bars offline. The figures and the loudness use the second bar, after the processors settle. */
function twoBars(ctx: BaseAudioContext, dest: AudioNode, play: (ctx: BaseAudioContext, dest: AudioNode, step: number, time: number) => void) {
    for (let s = 0; s < 32; s++) play(ctx, dest, s % 16, LEAD + s * STEP);
}

/** Start and end samples of the second bar in an offline render, shifted by a path delay. */
function secondBar(delay: number): [number, number] {
    const from = Math.round((LEAD + BAR + delay) * RATE);
    return [from, from + Math.round(BAR * RATE)];
}

const BAR_COLUMNS = 240;
/** Playback level of the drum-loop demos, set to sit just under the compressor demo. */
const DRUM_LEVEL = 1.6;

// ── Parallel compression ────────────────────────────────────────────

type ParallelMode = 'dry' | 'blend' | 'solo';
const PARALLEL_MODES: ParallelMode[] = ['dry', 'blend', 'solo'];

/** The crushed bus: very low threshold, 20:1, 1 ms attack. */
function crusher(ctx: BaseAudioContext): DynamicsCompressorNode {
    const c = ctx.createDynamicsCompressor();
    c.threshold.value = -40;
    c.knee.value = 6;
    c.ratio.value = 20;
    c.attack.value = 0.001;
    c.release.value = 0.1;
    return c;
}

interface ParallelAnalysis {
    /** Second bar of the dry loop. */
    dry: Float32Array;
    /** Second bar of the crushed copy, scaled to the dry loop's loudness. */
    crushed: Float32Array;
    /** Gain that scales the crushed copy to the dry loudness. */
    norm: number;
    /** K-weighted powers: dry x dry, and dry x scaled crushed. Scaled crushed x itself equals pxx. */
    pxx: number;
    pxy: number;
    peak: number;
}

async function analyseParallel(): Promise<ParallelAnalysis> {
    const lat = await measureLatency(RATE);
    const [from, to] = secondBar(lat);
    const [dry, crushed] = await renderOffline(LEAD + 2 * BAR + lat + 0.02, 2, (ctx, [dryTap, crushTap]) => {
        const src = ctx.createGain();
        const delay = ctx.createDelay(0.05);
        delay.delayTime.value = lat;
        src.connect(delay).connect(dryTap);
        src.connect(crusher(ctx)).connect(crushTap);
        twoBars(ctx, src, drums);
    });
    const kx = kWeight(dry);
    const ky = kWeight(crushed);
    const pxx = meanProduct(kx, kx, from, to);
    const norm = Math.sqrt(pxx / meanProduct(ky, ky, from, to));
    return {
        dry: dry.slice(from, to),
        crushed: crushed.slice(from, to).map((v) => v * norm),
        norm,
        pxx,
        pxy: meanProduct(kx, ky, from, to) * norm,
        peak: peakOf(dry, from, to),
    };
}

/** Gain that brings dry + blend x crushed back to the loudness of the dry drums. K-weighting is linear, so no new render is needed. */
const blendMatch = (a: ParallelAnalysis, blend: number) => Math.sqrt(a.pxx / (a.pxx + 2 * blend * a.pxy + blend * blend * a.pxx));

/**
 * The dry drum loop plus a heavily compressed copy blended underneath.
 * Every option plays at the loudness of the dry loop.
 */
export function ParallelDemo() {
    const [mode, setMode] = useState<ParallelMode>('blend');
    const [blend, setBlend] = useState(40);
    const [reduction, setReduction] = useState(0);
    const analysis = useAnalysis('parallel', analyseParallel);
    const nodes = useRef<{
        ctx: AudioContext;
        comp: DynamicsCompressorNode;
        norm: GainNode;
        amount: GainNode;
        match: GainNode;
        master: GainNode;
        sel: Record<ParallelMode, GainNode>;
    } | null>(null);
    const clock = useRef<LoopClock | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(out);
        const src = ctx.createGain();
        const lat = latencyNow(ctx.sampleRate);
        const delay = ctx.createDelay(0.05);
        delay.delayTime.value = lat;
        const comp = crusher(ctx);
        const norm = ctx.createGain();
        const amount = ctx.createGain();
        const sum = ctx.createGain();
        const match = ctx.createGain();
        src.connect(delay);
        src.connect(comp).connect(norm);
        delay.connect(sum);
        norm.connect(amount).connect(sum);
        sum.connect(match);
        const sel = {} as Record<ParallelMode, GainNode>;
        for (const m of PARALLEL_MODES) {
            sel[m] = ctx.createGain();
            sel[m].gain.value = m === mode ? 1 : 0;
            sel[m].connect(master);
        }
        delay.connect(sel.dry);
        match.connect(sel.blend);
        norm.connect(sel.solo);
        amount.gain.value = blend / 100;
        if (analysis) {
            norm.gain.value = analysis.norm;
            match.gain.value = blendMatch(analysis, blend / 100);
            master.gain.setTargetAtTime(DRUM_LEVEL, ctx.currentTime, 0.02);
        }
        nodes.current = { ctx, comp, norm, amount, match, master, sel };
        const c: LoopClock = { ctx, barStart: ctx.currentTime, barDur: BAR, offset: lat };
        clock.current = c;
        void measureLatency(ctx.sampleRate).then((s) => {
            delay.delayTime.value = s;
            c.offset = s;
        });
        const seq = sequence(ctx, DRUM_BPM, 16, (step, time) => {
            if (step === 0) c.barStart = time;
            drums(ctx, src, step, time);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            clock.current = null;
            fadeOut(ctx, master, () => src.disconnect());
            setReduction(0);
        };
    });

    useEffect(() => {
        const n = nodes.current;
        if (!n || !analysis) return;
        const t = n.ctx.currentTime;
        for (const m of PARALLEL_MODES) n.sel[m].gain.setTargetAtTime(m === mode ? 1 : 0, t, 0.015);
        // The blend and its matching gain move together, so the loudness never jumps.
        n.amount.gain.setTargetAtTime(blend / 100, t, 0.02);
        n.match.gain.setTargetAtTime(blendMatch(analysis, blend / 100), t, 0.02);
        n.norm.gain.setTargetAtTime(analysis.norm, t, 0.02);
        n.master.gain.setTargetAtTime(DRUM_LEVEL, t, 0.02);
    }, [mode, blend, analysis]);

    useFrame(player.playing, () => {
        if (nodes.current) setReduction(-nodes.current.comp.reduction);
    });
    const line = usePlayhead(player.playing, clock);

    const traces = useMemo<Trace[] | null>(() => {
        if (!analysis) return null;
        const { dry, crushed, peak } = analysis;
        const b = blend / 100;
        const m = blendMatch(analysis, b);
        const after = mode === 'solo' ? (i: number) => crushed[i] : (i: number) => (dry[i] + b * crushed[i]) * m;
        return [
            { kind: 'before', db: columns((i) => dry[i], dry.length, BAR_COLUMNS, peak) },
            { kind: 'after', db: columns(after, dry.length, BAR_COLUMNS, peak) },
        ];
    }, [analysis, blend, mode]);

    const turnedDown = analysis ? -gainToDb(blendMatch(analysis, blend / 100)) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Listen to"
                    value={mode}
                    onChange={setMode}
                    options={[
                        { value: 'dry', label: 'Dry' },
                        { value: 'blend', label: 'Dry + crushed' },
                        { value: 'solo', label: 'Crushed copy' },
                    ]}
                />
            </div>
            <div>
                <Strip
                    traces={traces}
                    floor={-42}
                    label="Peak level across one bar of the loop, on a decibel scale. The blend lifts the ghost notes and hat tails while the loudest hits stay close to the dry ones."
                    playhead={player.playing ? line : undefined}
                />
                <Legend
                    items={[
                        { kind: 'before', text: 'Dry drums' },
                        { kind: 'after', text: mode === 'solo' ? 'Crushed copy, same loudness' : 'Dry + crushed, same loudness' },
                    ]}
                />
            </div>
            <Meter label="Gain reduction on the crushed copy" value={reduction / 36} text={`${reduction.toFixed(1)} dB`} />
            <Slider
                label="Blend"
                value={blend}
                min={0}
                max={100}
                step={5}
                onChange={setBlend}
                format={(v) => `${v}%`}
                hint="How much of the crushed copy sits under the dry drums. At 100% the copy is as loud as the dry loop on its own."
            />
            <p className="text-sm leading-6 text-white/60">
                The dry drums are never compressed. Every option plays at the loudness of the dry loop
                {analysis && turnedDown > 0.05 ? `, so at this blend the mix is turned down ${turnedDown.toFixed(1)} dB` : ''}. Listen to the ghost notes
                between the snares, then solo the crushed copy to hear what is doing the lifting.
            </p>
        </div>
    );
}

// ── Transient shaper vs compressor ──────────────────────────────────

type ShapeMode = 'dry' | 'shaper' | 'comp';
const SHAPE_MODES: ShapeMode[] = ['dry', 'shaper', 'comp'];

/** The log converter covers 100 dB, so a ratio between two envelopes becomes a difference. */
const LOG_RANGE = 100;
let logCurve: Float32Array<ArrayBuffer> | null = null;
let rectifyCurve: Float32Array<ArrayBuffer> | null = null;

/** Gain law: boost or cut by up to `attack` dB while the fast envelope leads, and by up to `sustain` dB while it trails. */
function shaperLaw(attack: number, sustain: number): Float32Array<ArrayBuffer> {
    return curve(4096, (d) => {
        const db = d * LOG_RANGE;
        return dbToGain(db > 0 ? attack * Math.min(1, db / 6) : sustain * Math.min(1, -db / 6));
    });
}

interface ShaperNodes {
    input: GainNode;
    output: GainNode;
    lookahead: DelayNode;
    law: WaveShaperNode;
}

/**
 * A transient shaper made from plain Web Audio nodes. Two envelope
 * followers watch the rectified signal: a fast one that jumps with each
 * hit and a slow one that lags behind. Their ratio, taken as a difference
 * of logs, is the same for a loud hit and a quiet one, so the shaper does
 * not care about level. While the fast envelope leads, the hit is
 * starting (attack). While it trails, the hit is ringing out (sustain).
 */
function transientShaper(ctx: BaseAudioContext, lookahead: number, attack: number, sustain: number): ShaperNodes {
    logCurve ??= curve(65536, (x) => Math.max(-1, gainToDb(Math.abs(x)) / LOG_RANGE));
    rectifyCurve ??= curve(4097, (x) => Math.abs(x));
    const input = ctx.createGain();
    const detector = ctx.createGain();
    detector.gain.value = 0.5;
    const rectify = ctx.createWaveShaper();
    rectify.curve = rectifyCurve;
    const fastA = onePole(ctx, 0.002);
    const fastB = onePole(ctx, 0.002);
    const slow = onePole(ctx, 0.04);
    const logFast = ctx.createWaveShaper();
    logFast.curve = logCurve;
    const logSlow = ctx.createWaveShaper();
    logSlow.curve = logCurve;
    const invert = ctx.createGain();
    invert.gain.value = -1;
    const difference = ctx.createGain();
    const law = ctx.createWaveShaper();
    law.curve = shaperLaw(attack, sustain);
    const smooth = onePole(ctx, 0.002);
    const vca = ctx.createGain();
    vca.gain.value = 0;
    const delay = ctx.createDelay(0.05);
    delay.delayTime.value = lookahead;
    const output = ctx.createGain();
    input.connect(detector).connect(rectify);
    rectify.connect(fastA).connect(fastB).connect(logFast).connect(difference);
    rectify.connect(slow).connect(logSlow).connect(invert).connect(difference);
    difference.connect(law).connect(smooth).connect(vca.gain);
    // The audio waits for the detector, so the boost lands on the first milliseconds of each hit.
    input.connect(delay).connect(vca).connect(output);
    return { input, output, lookahead: delay, law };
}

/** A compressor set the usual way for punch: slow attack, quick release. */
function punchCompressor(ctx: BaseAudioContext): DynamicsCompressorNode {
    const c = ctx.createDynamicsCompressor();
    c.threshold.value = -20;
    c.knee.value = 2;
    c.ratio.value = 4;
    c.attack.value = 0.03;
    c.release.value = 0.12;
    return c;
}

interface ShapeParams {
    level: number;
    attack: number;
    sustain: number;
}

interface Hit {
    title: string;
    before: number[];
    shaper: number[];
    comp: number[];
}

interface ShapeAnalysis {
    params: ShapeParams;
    trim: { shaper: number; comp: number };
    hits: Hit[];
    ghostDb: number;
}

const HIT_COLUMNS = 90;
/** Room above the dry hit's level in each panel, so a boosted attack has somewhere to go. */
const HIT_HEADROOM = 12;

async function analyseShape(params: ShapeParams): Promise<ShapeAnalysis> {
    const [lat, compMakeup] = await Promise.all([measureLatency(RATE), measureMakeup('punch', punchCompressor)]);
    const g = dbToGain(params.level);
    const [from, to] = secondBar(lat);
    const [dry, shaped, comped] = await renderOffline(LEAD + 2 * BAR + lat + 0.02, 3, (ctx, [dryTap, shaperTap, compTap]) => {
        const src = ctx.createGain();
        src.gain.value = g;
        const delay = ctx.createDelay(0.05);
        delay.delayTime.value = lat;
        src.connect(delay).connect(dryTap);
        const shaper = transientShaper(ctx, lat, params.attack, params.sustain);
        src.connect(shaper.input);
        shaper.output.connect(shaperTap);
        src.connect(punchCompressor(ctx)).connect(compTap);
        twoBars(ctx, src, drums);
    });
    const ref = loudnessPower(dry, from, to);
    const trim = {
        shaper: Math.sqrt(ref / loudnessPower(shaped, from, to)),
        comp: Math.sqrt(ref / loudnessPower(comped, from, to)),
    };
    // Each panel is scaled to its own dry hit, so a ghost note and a full hit are drawn the same size.
    // The panels show what each processor does to the hit before loudness matching: the shaper's
    // gain as it is, the compressor's gain reduction without its built-in makeup gain.
    const hit = (step: number, title: string) => {
        const a = Math.round((LEAD + (16 + step) * STEP + lat - 0.005) * RATE);
        const length = Math.round(0.155 * RATE);
        // 11 ms is about half a cycle of the kick's 48 Hz tail.
        const window = Math.round(0.011 * RATE);
        const level = (x: Float32Array, gain: number, ref: number) => windowRms((i) => x[a + i] * gain, length, HIT_COLUMNS, ref, window);
        const loudest = Math.max(...level(dry, 1, 1).map(dbToGain));
        const top = loudest * dbToGain(HIT_HEADROOM);
        return {
            loudest,
            hit: { title, before: level(dry, 1, top), shaper: level(shaped, 1, top), comp: level(comped, 1 / compMakeup, top) },
        };
    };
    const k = hit(0, 'Kick');
    const s = hit(12, 'Snare');
    const ghost = hit(15, 'Ghost note');
    return { params, trim, hits: [k.hit, s.hit, ghost.hit], ghostDb: gainToDb(ghost.loudest / s.loudest) };
}

/**
 * A transient shaper against a compressor on the same drum loop. Both are
 * matched to the loudness of the dry loop. Lower the level going in and
 * the shaper keeps working while the compressor falls silent.
 */
export function TransientDemo() {
    const [mode, setMode] = useState<ShapeMode>('shaper');
    const [shown, setShown] = useState<'shaper' | 'comp'>('shaper');
    const [attack, setAttack] = useState(6);
    const [sustain, setSustain] = useState(-6);
    const [level, setLevel] = useState(0);
    const [reduction, setReduction] = useState(0);
    const analysis = useAnalysis(`${level}|${attack}|${sustain}`, () => analyseShape({ level, attack, sustain }));
    const nodes = useRef<{
        ctx: AudioContext;
        input: GainNode;
        restore: GainNode;
        shaper: ShaperNodes;
        comp: DynamicsCompressorNode;
        shaperTrim: GainNode;
        compTrim: GainNode;
        master: GainNode;
        sel: Record<ShapeMode, GainNode>;
    } | null>(null);
    const modeRef = useRef(mode);
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(out);
        const lat = latencyNow(ctx.sampleRate);
        const src = ctx.createGain();
        const input = ctx.createGain();
        const delay = ctx.createDelay(0.05);
        delay.delayTime.value = lat;
        const shaper = transientShaper(ctx, lat, attack, sustain);
        const comp = punchCompressor(ctx);
        const shaperTrim = ctx.createGain();
        const compTrim = ctx.createGain();
        // Undo the input level after processing, so only what the processors see changes.
        const restore = ctx.createGain();
        restore.connect(master);
        src.connect(input);
        input.connect(delay);
        input.connect(shaper.input);
        input.connect(comp);
        shaper.output.connect(shaperTrim);
        comp.connect(compTrim);
        const sel = {} as Record<ShapeMode, GainNode>;
        for (const m of SHAPE_MODES) {
            sel[m] = ctx.createGain();
            sel[m].gain.value = m === modeRef.current ? 1 : 0;
            sel[m].connect(restore);
        }
        delay.connect(sel.dry);
        shaperTrim.connect(sel.shaper);
        compTrim.connect(sel.comp);
        const n = { ctx, input, restore, shaper, comp, shaperTrim, compTrim, master, sel };
        nodes.current = n;
        if (analysis) applyShape(n, analysis, 0);
        void measureLatency(ctx.sampleRate).then((s) => {
            delay.delayTime.value = s;
            shaper.lookahead.delayTime.value = s;
        });
        const seq = sequence(ctx, DRUM_BPM, 16, (step, time) => drums(ctx, src, step, time));
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master, () => src.disconnect());
            setReduction(0);
        };
    });

    // A new setting goes live together with its matching gain, once it has been measured.
    useEffect(() => {
        const n = nodes.current;
        if (n && analysis) applyShape(n, analysis, 0.005);
    }, [analysis]);

    useEffect(() => {
        const n = nodes.current;
        if (!n) return;
        for (const m of SHAPE_MODES) n.sel[m].gain.setTargetAtTime(m === mode ? 1 : 0, n.ctx.currentTime, 0.015);
    }, [mode]);

    useFrame(player.playing, () => {
        if (nodes.current) setReduction(-nodes.current.comp.reduction);
    });

    const pick = (next: ShapeMode) => {
        setMode(next);
        if (next !== 'dry') setShown(next);
    };

    const names = { shaper: 'Transient shaper', comp: 'Compressor' };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Listen to"
                    value={mode}
                    onChange={pick}
                    options={[
                        { value: 'dry', label: 'Dry' },
                        { value: 'shaper', label: 'Transient shaper' },
                        { value: 'comp', label: 'Compressor' },
                    ]}
                />
            </div>
            <div>
                <div className="grid grid-cols-3 gap-2">
                    {(analysis?.hits ?? [null, null, null]).map((h, i) => (
                        <div key={i}>
                            <p className="mb-1 truncate text-xs text-white/60">{h ? h.title : ['Kick', 'Snare', 'Ghost note'][i]}</p>
                            <Strip
                                className="h-20"
                                floor={-30 - HIT_HEADROOM}
                                traces={h ? [{ kind: 'before', db: h.before }, { kind: 'after', db: h[shown] }] : null}
                                label={`${h?.title ?? 'Hit'}: level over the first 150 milliseconds, dry and through the ${names[shown].toLowerCase()}, scaled to the dry hit and before loudness matching.`}
                            />
                        </div>
                    ))}
                </div>
                <Legend
                    items={[
                        { kind: 'before', text: 'Dry hit' },
                        { kind: 'after', text: `Through the ${names[shown].toLowerCase()}` },
                    ]}
                />
                <p className="mt-2 text-xs leading-5 text-white/60">
                    The level over the first 150 ms of each hit, scaled to the dry hit, before the loudness matching you hear.
                    {analysis ? ` The ghost note is ${Math.round(-analysis.ghostDb)} dB quieter than the snare.` : ''}
                </p>
            </div>
            <Meter label="Compressor gain reduction" value={reduction / 18} text={`${reduction.toFixed(1)} dB`} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider label="Shaper attack" value={attack} min={-12} max={12} onChange={setAttack} format={(v) => fmtDb(v, 0)} hint="Turns the start of every hit up or down." />
                <Slider label="Shaper sustain" value={sustain} min={-12} max={12} onChange={setSustain} format={(v) => fmtDb(v, 0)} hint="Turns the ring after each hit up or down." />
            </div>
            <Slider
                label="Level going in"
                value={level}
                min={-24}
                max={0}
                onChange={setLevel}
                format={(v) => fmtDb(v, 0)}
                hint="Turns the loop down before both processors and back up after them, so only what the processors see changes."
            />
            <p className="text-sm leading-6 text-white/60">
                All three options play at the loudness of the dry loop. The compressor uses 4:1 with a 30 ms attack, 120 ms release and a -20 dB threshold.
                Pull the level going in down to -24 dB. The loop no longer reaches the threshold, so the compressor does nothing, while the shaper still changes
                every hit, ghost notes included.
            </p>
        </div>
    );
}

function applyShape(
    n: { ctx: AudioContext; input: GainNode; restore: GainNode; shaper: ShaperNodes; shaperTrim: GainNode; compTrim: GainNode; master: GainNode },
    a: ShapeAnalysis,
    tau: number,
) {
    const t = n.ctx.currentTime;
    const g = dbToGain(a.params.level);
    const set = (param: AudioParam, value: number) => (tau > 0 ? param.setTargetAtTime(value, t, tau) : param.setValueAtTime(value, t));
    set(n.input.gain, g);
    set(n.restore.gain, 1 / g);
    set(n.shaperTrim.gain, a.trim.shaper);
    set(n.compTrim.gain, a.trim.comp);
    n.shaper.law.curve = shaperLaw(a.params.attack, a.params.sustain);
    n.master.gain.setTargetAtTime(DRUM_LEVEL, t, 0.02);
}

// ── Sidechain ducking ───────────────────────────────────────────────

type Duck = 'off' | 'full' | 'lows';
const SC_BPM = 120;
const SC_STEP = 60 / SC_BPM / 4;
const SC_BAR = SC_STEP * 16;
const CROSSOVER = 150;
const SC_LEVEL = 0.6;
const SC_CHORDS = [
    { bass: 33, chord: [57, 60, 64] },
    { bass: 29, chord: [53, 57, 60] },
];

/** A held bass: a sine sub plus a filtered saw, so it has body above the sub too. */
function heldBass(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, dur: number) {
    const sub = ctx.createOscillator();
    sub.frequency.value = freq;
    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.value = freq;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    const sawLevel = ctx.createGain();
    sawLevel.gain.value = 0.32;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.42, t + 0.02);
    env.gain.setValueAtTime(0.42, t + dur - 0.06);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sub.connect(env);
    saw.connect(lp).connect(sawLevel).connect(env);
    env.connect(dest);
    for (const o of [sub, saw]) {
        o.start(t);
        o.stop(t + dur + 0.05);
    }
}

function scMusic(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number) {
    if (step % 16 !== 0) return;
    const bar = SC_CHORDS[step / 16];
    heldBass(ctx, dest, time, midi(bar.bass), SC_BAR);
    pad(ctx, dest, time, bar.chord.map(midi), SC_BAR, 1.3, 2200);
}

function scDrums(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number) {
    if (step % 4 === 0) kick(ctx, dest, time, 0.95);
    if (step % 8 === 4) snare(ctx, dest, time, 0.4);
    if (step % 4 === 2) hat(ctx, dest, time, 0.5, true);
    else if (step % 2 === 1) hat(ctx, dest, time, 0.18);
}

/** A Linkwitz-Riley split (two Butterworth stages per side): the two bands add back up flat. */
function crossover(ctx: BaseAudioContext, input: AudioNode): { low: AudioNode; high: AudioNode } {
    const stage = (type: BiquadFilterType, from: AudioNode) => {
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = CROSSOVER;
        // Low-pass and high-pass Q is in dB in Web Audio. -3.01 dB is a Q of 0.707.
        f.Q.value = -3.0103;
        from.connect(f);
        return f;
    };
    return { low: stage('lowpass', stage('lowpass', input)), high: stage('highpass', stage('highpass', input)) };
}

/** Each kick pulls the gain down by `depth` dB in about 5 ms, holds 20 ms, then lets it recover over `release` ms. */
function duck(param: AudioParam, time: number, depth: number, release: number) {
    param.setTargetAtTime(dbToGain(-depth), time, 0.002);
    param.setTargetAtTime(1, time + 0.02, release / 1000 / 3);
}

interface DuckParams {
    depth: number;
    release: number;
}

interface DuckAnalysis {
    params: DuckParams;
    makeup: { full: number; lows: number };
    gain: number[];
}

async function analyseDuck(params: DuckParams): Promise<DuckAnalysis> {
    const loop = SC_STEP * 32;
    const [plain, full, lows, gain] = await renderOffline(LEAD + loop + 0.1, 4, (ctx, [plainTap, fullTap, lowsTap, gainTap]) => {
        const music = ctx.createGain();
        const one = ctx.createConstantSource();
        const gainCurve = ctx.createGain();
        one.connect(gainCurve).connect(gainTap);
        one.start();
        const chains = [plainTap, fullTap, lowsTap].map((tap) => {
            const split = crossover(ctx, music);
            const low = ctx.createGain();
            const high = ctx.createGain();
            split.low.connect(low).connect(tap);
            split.high.connect(high).connect(tap);
            return { low, high };
        });
        for (let s = 0; s < 32; s++) {
            const time = LEAD + s * SC_STEP;
            scMusic(ctx, music, s, time);
            if (s % 4 === 0) {
                for (const p of [chains[1].low.gain, chains[1].high.gain, chains[2].low.gain, gainCurve.gain]) duck(p, time, params.depth, params.release);
            }
        }
    });
    const from = Math.round(LEAD * RATE);
    const to = from + Math.round(loop * RATE);
    const ref = loudnessPower(plain, from, to);
    // Draw the second bar, so the first kick shows the tail of the previous bar's release.
    const barFrom = from + Math.round(SC_BAR * RATE);
    const length = Math.round(SC_BAR * RATE);
    return {
        params,
        makeup: { full: Math.sqrt(ref / loudnessPower(full, from, to)), lows: Math.sqrt(ref / loudnessPower(lows, from, to)) },
        gain: columns((i) => gain[barFrom + i], length, BAR_COLUMNS, 1, true),
    };
}

/**
 * A kick over a held bass and pad. Each kick ducks the bass and pad, the
 * whole band or only the lows. The bass and pad stay at the same overall
 * loudness in every setting, so you hear movement, not a quieter bass.
 */
export function SidechainDemo() {
    const [mode, setMode] = useState<Duck>('full');
    const [depth, setDepth] = useState(12);
    const [release, setRelease] = useState(180);
    const analysis = useAnalysis(`${depth}|${release}`, () => analyseDuck({ depth, release }));
    const nodes = useRef<{ ctx: AudioContext; low: GainNode; high: GainNode; makeup: GainNode; master: GainNode } | null>(null);
    const live = useRef<{ mode: Duck; params: DuckParams | null }>({ mode, params: null });
    const clock = useRef<LoopClock | null>(null);

    const makeupFor = (m: Duck, a: DuckAnalysis | null) => (!a || m === 'off' ? 1 : a.makeup[m]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(out);
        const music = ctx.createGain();
        const split = crossover(ctx, music);
        const low = ctx.createGain();
        const high = ctx.createGain();
        const makeup = ctx.createGain();
        split.low.connect(low).connect(makeup);
        split.high.connect(high).connect(makeup);
        makeup.connect(master);
        const drumBus = ctx.createGain();
        drumBus.connect(master);
        makeup.gain.value = makeupFor(live.current.mode, analysis);
        if (analysis) master.gain.setTargetAtTime(SC_LEVEL, ctx.currentTime, 0.02);
        nodes.current = { ctx, low, high, makeup, master };
        const c: LoopClock = { ctx, barStart: ctx.currentTime, barDur: SC_BAR, offset: 0 };
        clock.current = c;
        const seq = sequence(ctx, SC_BPM, 32, (step, time) => {
            if (step % 16 === 0) c.barStart = time;
            scMusic(ctx, music, step, time);
            scDrums(ctx, drumBus, step % 16, time);
            const { mode: m, params } = live.current;
            if (step % 4 === 0 && params && m !== 'off') {
                duck(low.gain, time, params.depth, params.release);
                if (m === 'full') duck(high.gain, time, params.depth, params.release);
            }
        });
        return () => {
            seq.stop();
            nodes.current = null;
            clock.current = null;
            fadeOut(ctx, master, () => music.disconnect());
        };
    });

    // Depth and release reach the kicks only with their matching gain.
    useEffect(() => {
        live.current.params = analysis?.params ?? null;
        const n = nodes.current;
        if (!n || !analysis) return;
        n.makeup.gain.setTargetAtTime(makeupFor(live.current.mode, analysis), n.ctx.currentTime, 0.02);
        n.master.gain.setTargetAtTime(SC_LEVEL, n.ctx.currentTime, 0.02);
    }, [analysis]);

    useEffect(() => {
        live.current.mode = mode;
        const n = nodes.current;
        if (!n) return;
        const t = n.ctx.currentTime;
        // Stop ducking what should no longer duck. The next kick ducks the rest.
        const still = mode === 'off' ? [n.low, n.high] : mode === 'lows' ? [n.high] : [];
        for (const g of still) {
            g.gain.cancelScheduledValues(t);
            g.gain.setTargetAtTime(1, t, 0.03);
        }
        n.makeup.gain.setTargetAtTime(makeupFor(mode, analysis), t, 0.02);
    }, [mode, analysis]);

    const line = usePlayhead(player.playing, clock);

    const flat = useMemo(() => new Array<number>(BAR_COLUMNS).fill(0), []);
    const traces: Trace[] | null = analysis
        ? mode === 'off'
            ? [{ kind: 'reference', db: flat }]
            : mode === 'lows'
              ? [
                    { kind: 'reference', db: flat },
                    { kind: 'after', db: analysis.gain },
                ]
              : [{ kind: 'after', db: analysis.gain }]
        : null;
    const legend: { kind: Trace['kind']; text: string }[] =
        mode === 'off'
            ? [{ kind: 'reference', text: 'Bass and pad gain, untouched' }]
            : mode === 'lows'
              ? [
                    { kind: 'after', text: `Below ${CROSSOVER} Hz` },
                    { kind: 'reference', text: `Above ${CROSSOVER} Hz, untouched` },
                ]
              : [{ kind: 'after', text: 'Bass and pad gain' }];
    const makeupDb = gainToDb(makeupFor(mode, analysis));

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <Segmented
                label="Ducking"
                value={mode}
                onChange={setMode}
                options={[
                    { value: 'off', label: 'No ducking' },
                    { value: 'full', label: 'Duck everything' },
                    { value: 'lows', label: `Duck only below ${CROSSOVER} Hz` },
                ]}
            />
            <div>
                <Strip
                    traces={traces}
                    floor={-24}
                    marks={[0, 0.25, 0.5, 0.75]}
                    label="Gain applied to the bass and pad across one bar, from 0 dB at the top to -24 dB at the bottom. Dotted lines mark the kicks."
                    playhead={player.playing ? line : undefined}
                />
                <div className="mt-1 flex justify-between text-[11px] text-white/55" aria-hidden="true">
                    <span>One bar, dotted lines are kicks</span>
                    <span>0 to -24 dB</span>
                </div>
                <Legend items={legend} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider label="Depth" value={depth} min={0} max={24} onChange={setDepth} format={(v) => `${v} dB`} hint="How far each kick pulls the bass down." />
                <Slider
                    label="Release"
                    value={release}
                    min={30}
                    max={480}
                    step={10}
                    onChange={setRelease}
                    format={(v) => `${v} ms`}
                    hint="How long the bass takes to come back. The kicks are 500 ms apart."
                />
            </div>
            <p className="text-sm leading-6 text-white/60">
                {mode === 'off'
                    ? 'The kick and the bass hit at the same moment and share the low end. Turn ducking on and listen to the kick get its own space.'
                    : `The bass and pad are turned up ${Math.max(0, makeupDb).toFixed(1)} dB to make up for the dips, so they keep the same overall loudness. A short release tucks the bass under the kick. A long one makes it pump.`}
            </p>
        </div>
    );
}

// ── Limiter ─────────────────────────────────────────────────────────

/** Inside this demo the loop is scaled so its loudest peak sits right at the threshold. */
const LIMIT_THRESHOLD = -12;
/** dB between the threshold and the ceiling clip. At 20:1 the compressor lets about drive / 20 dB through, so 2 dB leaves the clip to catch fast overshoots only. */
const CEILING_MARGIN = 2;
const CEILING = LIMIT_THRESHOLD + CEILING_MARGIN;

function limiterLoop(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number) {
    drums(ctx, dest, step, time);
    if (step === 0) bass(ctx, dest, time, midi(33), STEP * 6, 0.6);
    if (step === 10) bass(ctx, dest, time, midi(36), STEP * 4, 0.55);
    if (step === 2 || step === 10) for (const n of step === 2 ? [57, 60, 64] : [55, 59, 62]) pluck(ctx, dest, time, midi(n), STEP * 3, 0.9);
}

let loopPeakJob: Promise<number> | null = null;

function measureLoopPeak(): Promise<number> {
    loopPeakJob ??= (async () => {
        const [x] = await renderOffline(LEAD + 2 * BAR + 0.05, 1, (ctx, [tap]) => twoBars(ctx, tap, limiterLoop));
        const [from, to] = secondBar(0);
        return peakOf(x, from, to);
    })();
    return loopPeakJob;
}

function limiterCompressor(ctx: BaseAudioContext, release: number): DynamicsCompressorNode {
    const c = ctx.createDynamicsCompressor();
    c.threshold.value = LIMIT_THRESHOLD;
    c.knee.value = 0;
    c.ratio.value = 20;
    c.attack.value = 0.001;
    c.release.value = release;
    return c;
}

interface LimiterNodes {
    drive: GainNode;
    comp: DynamicsCompressorNode;
    /** Compressor output scaled so the ceiling sits at full scale: the input of the clip. */
    toCeiling: GainNode;
    output: GainNode;
}

/** The limiter: a fast 20:1 compressor, then a hard clip just above its threshold. */
function limiter(ctx: BaseAudioContext, makeup: number, release: number): LimiterNodes {
    const drive = ctx.createGain();
    const comp = limiterCompressor(ctx, release);
    const toCeiling = ctx.createGain();
    toCeiling.gain.value = 1 / (makeup * dbToGain(CEILING));
    const clip = ctx.createWaveShaper();
    clip.curve = HARD_CLIP;
    clip.oversample = '4x';
    const output = ctx.createGain();
    output.gain.value = dbToGain(CEILING);
    drive.connect(comp).connect(toCeiling).connect(clip).connect(output);
    return { drive, comp, toCeiling, output };
}

/** The same oversampled waveshaper as the ceiling, which the dry path never reaches. It keeps both paths' timing and filtering equal. */
function passThrough(ctx: BaseAudioContext): WaveShaperNode {
    const ws = ctx.createWaveShaper();
    ws.curve = HARD_CLIP;
    ws.oversample = '4x';
    return ws;
}

interface LimitParams {
    drive: number;
    release: number;
}

interface LimitAnalysis {
    params: LimitParams;
    makeup: number;
    /** Scales the loop so its peak sits at the threshold. */
    norm: number;
    match: number;
    /** Share of samples in the bar that went past the compressor and were clipped by the ceiling. */
    clipped: number;
    before: number[];
    after: number[];
}

async function analyseLimit(params: LimitParams): Promise<LimitAnalysis> {
    const [lat, makeup, peak] = await Promise.all([measureLatency(RATE), measureMakeup('limiter', (ctx) => limiterCompressor(ctx, 0.1)), measureLoopPeak()]);
    const norm = dbToGain(LIMIT_THRESHOLD) / peak;
    const [dry, limited, pre] = await renderOffline(LEAD + 2 * BAR + lat + 0.05, 3, (ctx, [dryTap, limTap, preTap]) => {
        const src = ctx.createGain();
        src.gain.value = norm;
        const delay = ctx.createDelay(0.05);
        delay.delayTime.value = lat;
        src.connect(delay).connect(passThrough(ctx)).connect(dryTap);
        const lim = limiter(ctx, makeup, params.release / 1000);
        lim.drive.gain.value = dbToGain(params.drive);
        src.connect(lim.drive);
        lim.output.connect(limTap);
        lim.toCeiling.connect(preTap);
        twoBars(ctx, src, limiterLoop);
    });
    const [from, to] = secondBar(lat);
    const match = Math.sqrt(loudnessPower(dry, from, to) / loudnessPower(limited, from, to));
    let over = 0;
    for (let i = from; i < to; i++) if (Math.abs(pre[i]) > 1) over++;
    const ref = peakOf(dry, from, to);
    const length = to - from;
    return {
        params,
        makeup,
        norm,
        match,
        clipped: over / length,
        before: columns((i) => dry[from + i], length, BAR_COLUMNS, ref),
        after: columns((i) => limited[from + i] * match, length, BAR_COLUMNS, ref),
    };
}

const fmtMs = (v: number) => `${v} ms`;

/**
 * A loop driven into a limiter, with the output matched to the loudness
 * of the original, so what changes is shape and tone, not level.
 */
export function LimiterDemo() {
    const [mode, setMode] = useState<'original' | 'limited'>('limited');
    const [drive, setDrive] = useState(9);
    const [release, setRelease] = useState(120);
    const [reduction, setReduction] = useState(0);
    const analysis = useAnalysis(`${drive}|${release}`, () => analyseLimit({ drive, release }));
    const nodes = useRef<{
        ctx: AudioContext;
        norm: GainNode;
        lim: LimiterNodes;
        match: GainNode;
        restore: GainNode;
        master: GainNode;
        sel: { original: GainNode; limited: GainNode };
    } | null>(null);
    const modeRef = useRef(mode);
    const clock = useRef<LoopClock | null>(null);
    useEffect(() => {
        modeRef.current = mode;
        const n = nodes.current;
        if (!n) return;
        n.sel.original.gain.setTargetAtTime(mode === 'original' ? 1 : 0, n.ctx.currentTime, 0.015);
        n.sel.limited.gain.setTargetAtTime(mode === 'limited' ? 1 : 0, n.ctx.currentTime, 0.015);
    }, [mode]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(out);
        const lat = latencyNow(ctx.sampleRate);
        const src = ctx.createGain();
        const norm = ctx.createGain();
        const delay = ctx.createDelay(0.05);
        delay.delayTime.value = lat;
        const lim = limiter(ctx, analysis?.makeup ?? 1, release / 1000);
        const match = ctx.createGain();
        // Scales back up by 1 / norm, so the original plays at its own level.
        const restore = ctx.createGain();
        restore.connect(master);
        const sel = { original: ctx.createGain(), limited: ctx.createGain() };
        sel.original.gain.value = modeRef.current === 'original' ? 1 : 0;
        sel.limited.gain.value = modeRef.current === 'limited' ? 1 : 0;
        src.connect(norm);
        norm.connect(delay).connect(passThrough(ctx)).connect(sel.original).connect(restore);
        norm.connect(lim.drive);
        lim.output.connect(match).connect(sel.limited).connect(restore);
        const n = { ctx, norm, lim, match, restore, master, sel };
        nodes.current = n;
        if (analysis) applyLimit(n, analysis, false);
        const c: LoopClock = { ctx, barStart: ctx.currentTime, barDur: BAR, offset: lat };
        clock.current = c;
        void measureLatency(ctx.sampleRate).then((s) => {
            delay.delayTime.value = s;
            c.offset = s;
        });
        const seq = sequence(ctx, DRUM_BPM, 16, (step, time) => {
            if (step === 0) c.barStart = time;
            limiterLoop(ctx, src, step, time);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            clock.current = null;
            fadeOut(ctx, master, () => src.disconnect());
            setReduction(0);
        };
    });

    // Drive and release go live together with their matching gain.
    useEffect(() => {
        const n = nodes.current;
        if (n && analysis) applyLimit(n, analysis, true);
    }, [analysis]);

    useFrame(player.playing, () => {
        if (nodes.current) setReduction(-nodes.current.lim.comp.reduction);
    });
    const line = usePlayhead(player.playing, clock);

    const traces: Trace[] | null = analysis
        ? [
              { kind: 'before', db: analysis.before },
              { kind: 'after', db: analysis.after },
          ]
        : null;
    const clippedText = !analysis ? '–' : analysis.clipped === 0 ? 'Never' : analysis.clipped < 0.001 ? 'Under 0.1% of the time' : `${(analysis.clipped * 100).toFixed(1)}% of the time`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Listen to"
                    value={mode}
                    onChange={setMode}
                    options={[
                        { value: 'original', label: 'Original' },
                        { value: 'limited', label: 'Limited' },
                    ]}
                />
            </div>
            <div>
                <Strip
                    traces={traces}
                    floor={-36}
                    label="Peak level across one bar, original and limited at the same loudness. Limiting lowers the peaks and raises everything between them."
                    playhead={player.playing ? line : undefined}
                />
                <Legend
                    items={[
                        { kind: 'before', text: 'Original' },
                        { kind: 'after', text: 'Limited, same loudness' },
                    ]}
                />
            </div>
            <Meter label="Gain reduction" value={reduction / 18} text={`${reduction.toFixed(1)} dB`} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider label="Drive" value={drive} min={0} max={18} onChange={setDrive} format={(v) => fmtDb(v, 0)} hint="How far the loudest peaks are pushed over the threshold." />
                <Slider
                    label="Release"
                    value={release}
                    min={10}
                    max={600}
                    step={10}
                    onChange={setRelease}
                    format={fmtMs}
                    hint="Short releases follow the bass waveform and add grit. Long ones make the loop duck after every kick."
                />
            </div>
            <Readout
                items={[
                    { label: 'Turned down to match the original', value: analysis ? fmtDb(gainToDb(analysis.match)) : '–' },
                    { label: 'Ceiling clip catches a peak', value: clippedText },
                ]}
            />
            <p className="text-sm leading-6 text-white/60">
                This limiter is a fast compressor (20:1, 1 ms attack) with a hard clip {CEILING_MARGIN} dB above its threshold to catch whatever gets past it. Both options
                play at the same loudness, so listen to the kick and snare lose their edge as the drive goes up.
            </p>
        </div>
    );
}

function applyLimit(n: { ctx: AudioContext; norm: GainNode; lim: LimiterNodes; match: GainNode; restore: GainNode; master: GainNode }, a: LimitAnalysis, smooth: boolean) {
    const t = n.ctx.currentTime;
    const set = (param: AudioParam, value: number) => (smooth ? param.setTargetAtTime(value, t, 0.005) : param.setValueAtTime(value, t));
    set(n.norm.gain, a.norm);
    set(n.restore.gain, 1 / a.norm);
    set(n.lim.drive.gain, dbToGain(a.params.drive));
    set(n.match.gain, a.match);
    n.lim.toCeiling.gain.setValueAtTime(1 / (a.makeup * dbToGain(CEILING)), t);
    n.lim.comp.release.setValueAtTime(a.params.release / 1000, t);
    n.master.gain.setTargetAtTime(1, t, 0.02);
}

// ── Clipping at the converter ───────────────────────────────────────

const CLIP_BPM = 84;
const CLIP_STEP = 60 / CLIP_BPM / 4;
const CLIP_LOOP = CLIP_STEP * 32;
/** The safe take peaks at -6 dBFS. */
const SAFE_PEAK = 0.5;
// step, note, length in steps, level
const PHRASE: [number, number, number, number][] = [
    [0, 57, 3, 0.75],
    [4, 60, 2, 0.8],
    [6, 64, 5, 1],
    [12, 62, 2, 0.7],
    [14, 60, 2, 0.75],
    [16, 62, 3, 0.8],
    [20, 60, 2, 0.7],
    [22, 57, 6, 0.95],
];

const voiceWaves = new WeakMap<BaseAudioContext, PeriodicWave>();

function voiceWave(ctx: BaseAudioContext): PeriodicWave {
    let wave = voiceWaves.get(ctx);
    if (!wave) {
        // A few soft harmonics: round like a hummed vowel, so clipping is easy to hear.
        wave = ctx.createPeriodicWave(new Float32Array([0, 0, 0, 0, 0, 0]), new Float32Array([0, 1, 0.45, 0.2, 0.08, 0.04]));
        voiceWaves.set(ctx, wave);
    }
    return wave;
}

function sing(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, dur: number, level: number) {
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(voiceWave(ctx));
    osc.frequency.value = freq;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.2;
    const vibrato = ctx.createGain();
    vibrato.gain.setValueAtTime(0, t);
    vibrato.gain.linearRampToValueAtTime(freq * 0.006, t + 0.3);
    lfo.connect(vibrato).connect(osc.frequency);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(level, t + 0.04);
    env.gain.setTargetAtTime(level * 0.8, t + 0.06, 0.2);
    env.gain.setTargetAtTime(0.0001, t + dur, 0.04);
    osc.connect(env).connect(dest);
    for (const o of [osc, lfo]) {
        o.start(t);
        o.stop(t + dur + 0.3);
    }
}

function phraseStep(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number) {
    for (const [s, note, len, level] of PHRASE) if (s === step) sing(ctx, dest, time, midi(note), len * CLIP_STEP, level);
}

/** The converter: anything past full scale is held at full scale. Oversampled like a real converter's front end. */
function converter(ctx: BaseAudioContext): WaveShaperNode {
    const ws = ctx.createWaveShaper();
    ws.curve = HARD_CLIP;
    ws.oversample = '4x';
    return ws;
}

let phrasePeakJob: Promise<number> | null = null;

/** Notes overlap as they release, so the phrase's true peak is measured rather than assumed. */
function measurePhrasePeak(): Promise<number> {
    phrasePeakJob ??= (async () => {
        const [x] = await renderOffline(LEAD + CLIP_LOOP + 0.4, 1, (ctx, [tap]) => {
            for (let s = 0; s < 32; s++) phraseStep(ctx, tap, s, LEAD + s * CLIP_STEP);
        });
        return peakOf(x, 0, x.length);
    })();
    return phrasePeakJob;
}

interface ClipAnalysis {
    input: number;
    /** Gain that puts the phrase's peak at -6 dBFS: the safe recording level. */
    safeGain: number;
    /** K-weighted powers of the hot take before the fader, and of the safe take. */
    hotPower: number;
    safePower: number;
    /** How far the take tried to go past full scale, in dB. */
    overDb: number;
    hotPeak: number;
    safePeak: number;
    /** 12 ms around the loudest moment: what the mic sent, what was recorded, and the safe take. */
    window: { sent: Float32Array; hot: Float32Array; safe: Float32Array };
}

async function analyseClip(input: number): Promise<ClipAnalysis> {
    const safeGain = SAFE_PEAK / (await measurePhrasePeak());
    const [hot, safe, sent] = await renderOffline(LEAD + CLIP_LOOP + 0.4, 3, (ctx, [hotTap, safeTap, sentTap]) => {
        const src = ctx.createGain();
        const hotIn = ctx.createGain();
        hotIn.gain.value = safeGain * dbToGain(input);
        src.connect(hotIn).connect(converter(ctx)).connect(hotTap);
        const safeIn = ctx.createGain();
        safeIn.gain.value = safeGain;
        src.connect(safeIn).connect(converter(ctx)).connect(safeTap);
        // What the mic sent, scaled into range for the same converter and back, so it lines up with the others.
        const down = ctx.createGain();
        down.gain.value = 1 / 16;
        const up = ctx.createGain();
        up.gain.value = 16;
        hotIn.connect(down).connect(converter(ctx)).connect(up).connect(sentTap);
        for (let s = 0; s < 32; s++) phraseStep(ctx, src, s, LEAD + s * CLIP_STEP);
    });
    const from = Math.round(LEAD * RATE);
    const to = hot.length;
    let loudest = from;
    for (let i = from; i < to; i++) if (Math.abs(sent[i]) > Math.abs(sent[loudest])) loudest = i;
    const half = Math.round(0.006 * RATE);
    const a = Math.max(0, loudest - half);
    const b = Math.min(to, loudest + half);
    return {
        input,
        safeGain,
        hotPower: loudnessPower(hot, from, to),
        safePower: loudnessPower(safe, from, to),
        overDb: gainToDb(Math.abs(sent[loudest])),
        hotPeak: peakOf(hot, from, to),
        safePeak: peakOf(safe, from, to),
        window: { sent: sent.slice(a, b), hot: hot.slice(a, b), safe: safe.slice(a, b) },
    };
}

/** Overall playback level: at the default settings the phrase is about as loud as the drum-loop demos. */
const CLIP_OUT = 0.65;

/**
 * A phrase recorded too hot, clipped at the converter, then turned down
 * with a fader. Against it, the same phrase recorded at a safe level and
 * turned to the same loudness.
 */
export function ClipRecoverDemo() {
    const [take, setTake] = useState<'hot' | 'safe'>('hot');
    const [input, setInput] = useState(12);
    const [fader, setFader] = useState(-6);
    const analysis = useAnalysis(String(input), () => analyseClip(input));
    const nodes = useRef<{
        ctx: AudioContext;
        hotIn: GainNode;
        safeIn: GainNode;
        fader: GainNode;
        safeMatch: GainNode;
        master: GainNode;
        sel: { hot: GainNode; safe: GainNode };
    } | null>(null);
    const takeRef = useRef(take);

    const safeMatch = (a: ClipAnalysis, faderDb: number) => dbToGain(faderDb) * Math.sqrt(a.hotPower / a.safePower);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(out);
        const src = ctx.createGain();
        const hotIn = ctx.createGain();
        const faderGain = ctx.createGain();
        faderGain.gain.value = dbToGain(fader);
        const safeIn = ctx.createGain();
        const match = ctx.createGain();
        const sel = { hot: ctx.createGain(), safe: ctx.createGain() };
        sel.hot.gain.value = takeRef.current === 'hot' ? 1 : 0;
        sel.safe.gain.value = takeRef.current === 'safe' ? 1 : 0;
        src.connect(hotIn).connect(converter(ctx)).connect(faderGain).connect(sel.hot).connect(master);
        src.connect(safeIn).connect(converter(ctx)).connect(match).connect(sel.safe).connect(master);
        nodes.current = { ctx, hotIn, safeIn, fader: faderGain, safeMatch: match, master, sel };
        if (analysis) {
            safeIn.gain.value = analysis.safeGain;
            hotIn.gain.value = analysis.safeGain * dbToGain(analysis.input);
            match.gain.value = safeMatch(analysis, fader);
            master.gain.setTargetAtTime(CLIP_OUT, ctx.currentTime, 0.02);
        }
        const seq = sequence(ctx, CLIP_BPM, 32, (step, time) => phraseStep(ctx, src, step, time));
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master, () => src.disconnect());
        };
    });

    // The input gain goes live together with the safe take's new matching gain.
    useEffect(() => {
        const n = nodes.current;
        if (!n || !analysis) return;
        const t = n.ctx.currentTime;
        n.safeIn.gain.setTargetAtTime(analysis.safeGain, t, 0.005);
        n.hotIn.gain.setTargetAtTime(analysis.safeGain * dbToGain(analysis.input), t, 0.005);
        n.fader.gain.setTargetAtTime(dbToGain(fader), t, 0.02);
        n.safeMatch.gain.setTargetAtTime(safeMatch(analysis, fader), t, 0.02);
        n.master.gain.setTargetAtTime(CLIP_OUT, t, 0.02);
    }, [analysis, fader]);

    useEffect(() => {
        takeRef.current = take;
        const n = nodes.current;
        if (!n) return;
        n.sel.hot.gain.setTargetAtTime(take === 'hot' ? 1 : 0, n.ctx.currentTime, 0.015);
        n.sel.safe.gain.setTargetAtTime(take === 'safe' ? 1 : 0, n.ctx.currentTime, 0.015);
    }, [take]);

    const fg = dbToGain(fader);
    const match = analysis ? safeMatch(analysis, fader) : 1;
    const clipped = analysis ? analysis.overDb > 0.05 : false;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Take"
                    value={take}
                    onChange={setTake}
                    options={[
                        { value: 'hot', label: 'Hot take, turned down' },
                        { value: 'safe', label: 'Safe take, same loudness' },
                    ]}
                />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <p className="mb-1 text-xs text-white/60">Recorded: the converter stops at 0 dBFS</p>
                    <Wave
                        line={1}
                        range={analysis ? Math.min(3, Math.max(1.3, peakOf(analysis.window.sent, 0, analysis.window.sent.length) * 1.08)) : 1.3}
                        traces={
                            analysis
                                ? [
                                      { data: analysis.window.sent, gain: 1, kind: 'reference' },
                                      { data: analysis.window.hot, gain: 1, kind: 'after' },
                                  ]
                                : null
                        }
                        label="12 milliseconds of the loudest note. The dashed line is what the mic sent, the solid line is what was recorded, flat wherever the dashed line goes past 0 dBFS."
                    />
                </div>
                <div>
                    <p className="mb-1 text-xs text-white/60">After the fader, next to the safe take</p>
                    <Wave
                        line={fg}
                        range={
                            analysis
                                ? Math.max(
                                      peakOf(analysis.window.hot, 0, analysis.window.hot.length) * fg,
                                      peakOf(analysis.window.safe, 0, analysis.window.safe.length) * match,
                                  ) * 1.2
                                : 1
                        }
                        traces={
                            analysis
                                ? [
                                      { data: analysis.window.safe, gain: match, kind: 'reference' },
                                      { data: analysis.window.hot, gain: fg, kind: 'after' },
                                  ]
                                : null
                        }
                        label="The same 12 milliseconds after the fader, beside the safe take at the same loudness. The level is lower but the tops are still flat."
                    />
                </div>
            </div>
            <Legend
                items={[
                    { kind: 'reference', text: 'What the mic sent, or the safe take' },
                    { kind: 'after', text: 'Hot take' },
                ]}
            />
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider
                    label="Input gain while recording"
                    value={input}
                    min={0}
                    max={15}
                    onChange={setInput}
                    format={(v) => fmtDb(v, 0)}
                    hint="0 dB is the safe take, peaking at -6 dBFS. Above +6 dB the peaks hit the converter's limit."
                />
                <Slider label="Fader after recording" value={fader} min={-20} max={0} onChange={setFader} format={(v) => fmtDb(v, 0)} />
            </div>
            <Readout
                items={[
                    { label: 'Went past 0 dBFS by', value: !analysis ? '–' : clipped ? `${analysis.overDb.toFixed(1)} dB` : 'Not clipped' },
                    { label: 'Hot take peak after the fader', value: analysis ? fmtDb(gainToDb(analysis.hotPeak * fg), 0, 'dBFS') : '–' },
                    {
                        label: 'Peak height lost against the safe take',
                        value: analysis ? `${Math.max(0, gainToDb((analysis.safePeak * match) / (analysis.hotPeak * fg))).toFixed(1)} dB` : '–',
                    },
                ]}
            />
            <p className="text-sm leading-6 text-white/60">
                Both takes play at the same loudness. The fader lowered the hot take, but the flattened tops were recorded into it, so its loud notes still
                buzz where the safe take stays round.
            </p>
        </div>
    );
}

/** A short waveform on a linear scale, with dotted lines at plus and minus `line`. Anything past `range` runs off the frame. */
function Wave({
    traces,
    line,
    range,
    label,
}: {
    traces: { data: Float32Array; gain: number; kind: 'reference' | 'after' }[] | null;
    line: number;
    range: number;
    label: string;
}) {
    const dialect = useDialect();
    const w = 300;
    const h = 110;
    const y = (v: number) => h / 2 - (v / range) * (h / 2 - 6);
    const path = (data: Float32Array, gain: number) => {
        let d = '';
        for (let i = 0; i < data.length; i++) d += `${i ? 'L' : 'M'}${((i / (data.length - 1)) * w).toFixed(1)},${y(data[i] * gain).toFixed(1)}`;
        return d;
    };
    // The label is HTML over the plot, so it stays the same size at any width.
    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-1 text-[11px] leading-none text-white/60" style={{ top: `max(2px, calc(${(y(line) / h) * 100}% - 13px))` }} aria-hidden="true">
                {line >= 0.999 ? '0 dBFS' : `${gainToDb(line).toFixed(0)} dBFS`}
            </span>
            <svg viewBox={`0 0 ${w} ${h}`} width="100%" className="vgp-plot block overflow-hidden" role="img" aria-label={label}>
                <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="rgba(255,255,255,0.1)" />
                {[line, -line].map((l) => (
                    <line key={l} x1={0} x2={w} y1={y(l)} y2={y(l)} stroke="rgba(255,255,255,0.35)" strokeDasharray="1 3" />
                ))}
                {traces?.map((t) => (
                    <path
                        key={t.kind}
                        d={path(t.data, t.gain)}
                        fill="none"
                        stroke={t.kind === 'after' ? dialect.accent : 'rgba(255,255,255,0.55)'}
                        strokeLinecap={dialect.cap}
                        strokeWidth={t.kind === 'after' ? 1.75 : 1.25}
                        strokeDasharray={t.kind === 'reference' ? '3 3' : undefined}
                        strokeLinejoin="round"
                    />
                ))}
            </svg>
        </div>
    );
}
