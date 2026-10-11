'use client';

import { useEffect, useRef, useState } from 'react';
import { bass, fadeOut, hat, kick, kWeighted, midi, scheduleSteps, sequence, snare, yieldToMain, type Engine } from './engine';
import { MATCH_RUN_IN, SourceChoice, loopGain, matchPart, renderLoop, startFeed, stereoPeak, stereoPower, useSource, type Feed, type RealLoop } from './realmix';
import { aheadAlong, along, rampGain, type Axis, type Posted } from './matching';
import { Announce, LiveMeter, PlayButton, Segmented, Slider, useAnalysis, usePlayer } from './ui';

// A 16-step boom-bap bar with ghost notes, so dynamics have something to grab.
const KICKS: [number, number][] = [
    [0, 1],
    [7, 0.65],
    [10, 0.95],
];
const SNARES: [number, number][] = [
    [4, 1],
    [6, 0.22],
    [12, 1],
    [15, 0.28],
];
const BASS: [number, number, number][] = [
    [0, midi(36), 6],
    [10, midi(39), 4],
];

export function playDrumStep(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number, stepDur: number, withBass = true) {
    for (const [s, level] of KICKS) if (s === step) kick(ctx, dest, time, level);
    for (const [s, level] of SNARES) if (s === step) snare(ctx, dest, time, level);
    if (step % 2 === 0) hat(ctx, dest, time, step % 4 === 0 ? 0.6 : 0.35);
    if (withBass) for (const [s, freq, len] of BASS) if (s === step) bass(ctx, dest, time, freq, len * stepDur, 0.55);
}

type Mode = 'off' | 'on';

const PRESETS = {
    punch: { threshold: -30, ratio: 4, attack: 30, release: 120 },
    flat: { threshold: -30, ratio: 8, attack: 0, release: 60 },
};
type Preset = keyof typeof PRESETS;

interface CompParams {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
}

/**
 * A DynamicsCompressorNode turns its output up by its own makeup gain:
 * (1 / its gain at full scale) to the power 0.6, so a low threshold and a
 * high ratio make it louder than what went in. This undoes that, so the
 * matching gain below starts from the compressor's real gain reduction.
 */
const undoMakeup = (threshold: number, ratio: number) => 10 ** ((0.6 * threshold * (1 - 1 / ratio)) / 20);

/** Matching may turn the compressed path up by at most 30 dB. At thresholds down to -40 dB no setting needs more. */
const MATCH_MAX = 10 ** (30 / 20);
/**
 * Matched for loudness, a slow attack leaves the hits' first milliseconds
 * standing above everything else, so the compressed loop peaks higher than
 * the bypass. Up to 6.3 dB higher is allowed (the default needs about 6.2,
 * so it may sit a fraction of a dB short); past that the matching stops,
 * which keeps every setting under the demo's ceiling, and the demo says how
 * much quieter that leaves the loop. This room sets the loudest peak of any
 * demo at the house level (engine.ts HOUSE), so it is no larger than the
 * default needs.
 */
const PEAK_ROOM = 10 ** (6.3 / 20);

const RATE = 44100;
const BPM = 92;
const STEP = 60 / BPM / 4;
const BAR = STEP * 16;
const LEAD = 0.05;
/**
 * Bars rendered for a measurement. The first lets the compressor settle; the rest are measured.
 * Five measured bars put the matching within about 0.2 dB of what a long listen measures.
 */
const BARS = 6;

function compressor(ctx: BaseAudioContext, p: CompParams): DynamicsCompressorNode {
    const comp = ctx.createDynamicsCompressor();
    comp.knee.value = 2;
    comp.threshold.value = p.threshold;
    comp.ratio.value = p.ratio;
    comp.attack.value = p.attack / 1000;
    comp.release.value = p.release / 1000;
    return comp;
}

interface CompAnalysis {
    params: CompParams;
    /** The real loop this was measured on, or null for the drum loop. */
    real: RealLoop | null;
    /** Gain after `undoMakeup` that plays the compressed loop at the bypass loudness, or as close as the peaks allow. */
    match: number;
    /** dB the compressed loop still sits under the bypass. */
    short: number;
}

/** Peak of `x` and summed power of `k` over the measured bars, a bar at a time with a yield after each, so a slow phone never spends long in here at once. */
async function measureBars(x: Float32Array, k: Float32Array): Promise<{ peak: number; power: number }> {
    let peak = 0;
    let power = 0;
    for (let bar = 1; bar < BARS; bar++) {
        const from = Math.round((LEAD + bar * BAR) * RATE);
        const to = Math.round((LEAD + (bar + 1) * BAR) * RATE);
        for (let i = from; i < to; i++) {
            const v = x[i] < 0 ? -x[i] : x[i];
            if (v > peak) peak = v;
            power += k[i] * k[i];
        }
        await yieldToMain();
    }
    return { peak, power };
}

interface CompLoop {
    /** The dry loop as it plays, for every measurement to play through the compressor. */
    source: AudioBuffer;
    peakDry: number;
    powDry: number;
}

let compLoopJob: Promise<CompLoop> | null = null;

/**
 * Six bars of the dry loop, rendered once per page with its K-weighted copy,
 * and its peak and loudness over the last five. Every setting is then
 * measured by playing this one render through the compressor: a buffer
 * source instead of a few hundred voices and two channels instead of four,
 * so a slider step on a slow phone stays inside a frame's budget, and every
 * setting is compared on the same hits.
 */
function prepareCompLoop(): Promise<CompLoop> {
    compLoopJob ??= (async () => {
        const length = Math.ceil((LEAD + BARS * BAR + 0.1) * RATE);
        const ctx = new OfflineAudioContext(2, length, RATE);
        const merger = ctx.createChannelMerger(2);
        merger.connect(ctx.destination);
        const bus = ctx.createGain();
        bus.connect(merger, 0, 0);
        kWeighted(ctx, bus).connect(merger, 0, 1);
        await scheduleSteps(BARS * 16, (s) => playDrumStep(ctx, bus, s % 16, LEAD + s * STEP, STEP));
        const buffer = await ctx.startRendering();
        const dry = buffer.getChannelData(0);
        const { peak, power } = await measureBars(dry, buffer.getChannelData(1));
        const source = new AudioBuffer({ numberOfChannels: 1, length, sampleRate: RATE });
        source.copyToChannel(dry, 0);
        return { source, peakDry: peak, powDry: power };
    })().catch((error: unknown) => {
        compLoopJob = null;
        throw error;
    });
    return compLoopJob;
}

/**
 * Plays the measured loop (six bars) through the compressor offline and
 * measures the last five against the dry loop: K-weighted loudness (engine.ts)
 * for the matching, and the highest peaks for the peak allowance. The snare
 * and hats are noise, different on every hit, so one bar alone can be a dB
 * off what plays.
 */
async function analyseComp(params: CompParams): Promise<CompAnalysis> {
    const loop = await prepareCompLoop();
    const ctx = new OfflineAudioContext(2, loop.source.length, RATE);
    const merger = ctx.createChannelMerger(2);
    merger.connect(ctx.destination);
    const src = ctx.createBufferSource();
    src.buffer = loop.source;
    const undo = ctx.createGain();
    undo.gain.value = undoMakeup(params.threshold, params.ratio);
    src.connect(compressor(ctx, params)).connect(undo);
    undo.connect(merger, 0, 0);
    kWeighted(ctx, undo).connect(merger, 0, 1);
    src.start();
    const buffer = await ctx.startRendering();
    const { peak: peakWet, power: powWet } = await measureBars(buffer.getChannelData(0), buffer.getChannelData(1));
    return matched(params, null, loop.powDry, loop.peakDry, powWet, peakWet);
}

function matched(params: CompParams, real: RealLoop | null, powDry: number, peakDry: number, powWet: number, peakWet: number): CompAnalysis {
    const wanted = powWet > 0 ? Math.sqrt(powDry / powWet) : 1;
    const match = Math.min(wanted, MATCH_MAX, peakWet > 0 ? (PEAK_ROOM * peakDry) / peakWet : MATCH_MAX);
    return { params, real, match, short: 20 * Math.log10(wanted / match) };
}

/**
 * The real mix goes into the compressor at this loudness (ungated, K-weighted),
 * about where the drum loop does, so the threshold acts on it the same way and
 * the bypass plays at the house loudness.
 */
const REAL_IN = -13.9;

const realDry = new WeakMap<RealLoop, Promise<{ peak: number; power: number }>>();

/** Settings already measured on this page, by source and setting (ui.tsx useAnalysis). */
const compResults = new Map<string, CompAnalysis>();

/** The real loop's own peak and loudness as it goes in, over the bars a setting is measured on (realmix.tsx matchPart), once per loop. */
function realDryStats(loop: RealLoop): Promise<{ peak: number; power: number }> {
    let job = realDry.get(loop);
    if (!job) {
        job = (async () => {
            // Those two bars and their run-in only, as a setting is measured: a quarter of the whole loop's render.
            const r = await renderLoop(loop, { gain: loopGain(loop, REAL_IN), taps: 1, weighted: 1, part: matchPart(loop), runIn: MATCH_RUN_IN }, (_, src, [tap]) => src.connect(tap));
            const [from, to] = r.span();
            return { peak: await stereoPeak(r.x[0], from, to), power: await stereoPower(r.k[0], from, to) };
        })();
        job.catch(() => realDry.delete(loop));
        realDry.set(loop, job);
    }
    return job;
}

/** The same measurement on the real loop, over the two bars that stand in for the whole of it (realmix.tsx matchPart). */
async function analyseCompReal(loop: RealLoop, params: CompParams): Promise<CompAnalysis> {
    const dry = await realDryStats(loop);
    const r = await renderLoop(loop, { gain: loopGain(loop, REAL_IN), taps: 1, weighted: 1, part: matchPart(loop), runIn: MATCH_RUN_IN }, (ctx, src, [tap]) => {
        const undo = ctx.createGain();
        undo.gain.value = undoMakeup(params.threshold, params.ratio);
        src.connect(compressor(ctx, params)).connect(undo).connect(tap);
    });
    const [from, to] = r.span();
    return matched(params, loop, dry.power, dry.peak, await stereoPower(r.k[0], from, to), await stereoPeak(r.x[0], from, to));
}

/**
 * Drum loop through a compressor. The compressed path is level-matched
 * to the dry path, so switching compares shape, not loudness. A new setting
 * goes live at once; its matching gain is its own measurement when it has
 * one, else an estimate from the measured settings around it
 * (compTarget), posted on the compressor's own time (postComp).
 */
export function CompressorDemo() {
    const [mode, setMode] = useState<Mode>('on');
    const [threshold, setThreshold] = useState(PRESETS.punch.threshold);
    const [ratio, setRatio] = useState(PRESETS.punch.ratio);
    const [attack, setAttack] = useState(PRESETS.punch.attack);
    const [release, setRelease] = useState(PRESETS.punch.release);
    const [playing, setPlaying] = useState(false);
    const source = useSource('late-train-home');
    const real = source.loop;
    const settings = { threshold, ratio, attack, release };
    // The setting now heard, for estimates made between renders (a measurement landing).
    const live = useRef(settings);
    const nodes = useRef<CompNodes | null>(null);
    // The shown measurement: the last one for a setting the reader asked for.
    const measured = useRef<CompAnalysis | null>(null);
    const follow = () => {
        const n = nodes.current;
        if (!n) return;
        const g = compTarget(live.current, n.src, measured.current);
        if (g !== null) postComp(n, g, live.current);
    };
    const analysis = useAnalysis(compKey(real, settings), () => measureComp(real, settings), compResults, {
        keep: 64,
        // Any measurement that lands can make the estimate for the setting now heard better.
        onResult: () => follow(),
        // While it plays, the settings around this one are measured ahead, so the next move lands on or between them.
        ahead: playing ? () => (!real || measured.current?.real === real ? compAhead(live.current, real) : []) : undefined,
    });
    // What plays is what the matching was measured on: a switch of source goes live with its first measurement.
    const fed = analysis?.real ?? null;
    const loading = source.pick === 'real' && (!real || fed !== real);
    const modeRef = useRef(mode);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        const master = ctx.createGain();
        master.connect(out);
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const comp = compressor(ctx, settings);
        const undo = ctx.createGain();
        undo.gain.value = undoMakeup(threshold, ratio);
        const makeup = ctx.createGain();
        bus.connect(dry).connect(master);
        bus.connect(comp).connect(undo).connect(makeup).connect(wet).connect(master);
        dry.gain.value = modeRef.current === 'off' ? 1 : 0;
        wet.gain.value = modeRef.current === 'on' ? 1 : 0;
        // Its matching gain from the start (Play pressed mid-measurement plays the estimate); silent until the first
        // setting has been measured, a moment after the page loads.
        const start = compTarget(settings, fed, analysis);
        makeup.gain.value = start ?? 0;
        const feed = startFeed(
            ctx,
            bus,
            (into) => {
                const seq = sequence(ctx, BPM, 16, (step, time, dur) => playDrumStep(ctx, into, step, time, dur));
                return () => seq.stop();
            },
            fed,
            (loop) => loopGain(loop, REAL_IN),
        );
        nodes.current = {
            comp,
            undo,
            makeup,
            dry,
            wet,
            ctx,
            feed,
            src: fed,
            changedAt: ctx.currentTime,
            release,
            releaseGrew: false,
            posted: { ctx, param: makeup.gain, target: start ?? 0 },
        };
        live.current = settings;
        setPlaying(true);
        return () => {
            feed.stop();
            nodes.current = null;
            setPlaying(false);
            fadeOut(ctx, master, () => bus.disconnect());
        };
    }, !loading);

    useEffect(() => {
        measured.current = analysis;
    });

    // A new setting is heard at once, with its matching gain (its own, or the estimate until it is measured).
    useEffect(() => {
        const p = { threshold, ratio, attack, release };
        live.current = p;
        const n = nodes.current;
        if (!n) return;
        applyParams(n, p);
        n.changedAt = n.ctx.currentTime;
        n.releaseGrew = p.release > n.release;
        n.release = p.release;
        follow();
    }, [threshold, ratio, attack, release]);

    // A measurement shown for the setting heard (or the first one for a new source, which then goes live).
    useEffect(() => {
        const n = nodes.current;
        if (!n || !analysis) return;
        if (n.src !== analysis.real) {
            n.feed.use(analysis.real);
            n.src = analysis.real;
            n.changedAt = n.ctx.currentTime;
        }
        follow();
    }, [analysis]);

    const applyMode = (next: Mode) => {
        setMode(next);
        modeRef.current = next;
        const n = nodes.current;
        if (!n) return;
        const t = n.ctx.currentTime;
        n.dry.gain.setTargetAtTime(next === 'off' ? 1 : 0, t, 0.015);
        n.wet.gain.setTargetAtTime(next === 'on' ? 1 : 0, t, 0.015);
    };

    const applyPreset = (preset: Preset) => {
        const p = PRESETS[preset];
        setThreshold(p.threshold);
        setRatio(p.ratio);
        setAttack(p.attack);
        setRelease(p.release);
        applyMode('on');
    };

    // Under half a dB is within the matching's own accuracy, and the default setting can land there.
    // To a tenth of a dB: playback lands within about a quarter of a dB of this (the snare's noise moves
    // the hits' peaks, and with them the matching, a little from one measurement to the next). A
    // half-dB step put 2.3 dB on either side of 2.25.
    const short = analysis && analysis.short >= 0.5 ? Math.round(analysis.short * 10) / 10 : 0;
    // The preset the sliders match, if any: the presets are a choice like the swing demo's.
    const levelNote =
        short > 0
            ? `At this setting the compressed loop plays about ${short.toFixed(1)} dB quieter than the bypass. Matching it fully would push its peaks past the demo's safe ceiling.`
            : 'Both paths play at the same loudness.';
    const preset = (Object.keys(PRESETS) as Preset[]).find((k) => {
        const p = PRESETS[k];
        return p.threshold === threshold && p.ratio === ratio && p.attack === attack && p.release === release;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} waiting={player.waiting} onClick={player.toggle} />
                <Segmented
                    label="Listen to"
                    value={mode}
                    onChange={applyMode}
                    options={[
                        { value: 'off', label: 'Bypass' },
                        { value: 'on', label: 'Compressed' },
                    ]}
                />
            </div>
            <SourceChoice source={source} loading={loading} />
            <LiveMeter label="Gain reduction" active={player.playing} read={() => (nodes.current ? -nodes.current.comp.reduction : null)} full={18} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider label="Threshold" value={threshold} min={-40} max={0} onChange={setThreshold} format={(v) => `${v} dB`} />
                <Slider label="Ratio" value={ratio} min={1} max={20} step={0.5} onChange={setRatio} format={(v) => `${v}:1`} />
                <Slider label="Attack" value={attack} min={0} max={100} onChange={setAttack} format={(v) => `${v} ms`} />
                <Slider label="Release" value={release} min={20} max={600} step={10} onChange={setRelease} format={(v) => `${v} ms`} />
            </div>
            <Segmented<Preset | 'custom'>
                label="Presets"
                value={preset ?? 'custom'}
                onChange={(v) => {
                    if (v !== 'custom') applyPreset(v);
                }}
                options={[
                    { value: 'punch', label: 'Slow attack' },
                    { value: 'flat', label: 'Fast attack' },
                ]}
                hint="A slow attack lets the snare crack through. A fast one flattens it."
            />
            <p className="text-sm leading-6 text-white/60">{levelNote}</p>
            <Announce
                on={analysis ? (short > 0 ? 'short' : 'matched') : null}
                text={short > 0 ? "At this setting the compressed loop plays quieter than the bypass, as matching it fully would push its peaks past the demo's safe ceiling." : levelNote}
            />
        </div>
    );
}

interface CompNodes {
    comp: DynamicsCompressorNode;
    undo: GainNode;
    makeup: GainNode;
    dry: GainNode;
    wet: GainNode;
    ctx: AudioContext;
    feed: Feed;
    /** The loop playing (null: the drum loop). */
    src: RealLoop | null;
    /** When the setting or the source last changed, and whether that lengthened the release. */
    changedAt: number;
    release: number;
    releaseGrew: boolean;
    posted: Posted;
}

function applyParams(n: CompNodes, p: CompParams) {
    const t = n.ctx.currentTime;
    const set = (param: AudioParam, value: number) => param.setTargetAtTime(value, t, 0.01);
    set(n.comp.threshold, p.threshold);
    set(n.comp.ratio, p.ratio);
    set(n.comp.attack, p.attack / 1000);
    set(n.comp.release, p.release / 1000);
    set(n.undo.gain, undoMakeup(p.threshold, p.ratio));
}

const sameParams = (a: CompParams, b: CompParams) => a.threshold === b.threshold && a.ratio === b.ratio && a.attack === b.attack && a.release === b.release;

/**
 * How many dB less the compressor turns the loop down at `p` than at the
 * measured setting, by the static curve (threshold and ratio) at the level
 * that measurement implies. Positive when `p` is gentler. The matching gain
 * of the measured setting is lowered by this until `p` has its own, so the
 * moment between them is never louder than either; a setting that
 * compresses more plays a little quieter for that moment instead.
 */
function gentlerBy(a: CompAnalysis, p: CompParams): number {
    // The gain reduction the measurement found (before the peak allowance cut the matching short).
    const then = 20 * Math.log10(a.match) + a.short;
    if (then <= 0.1 || a.params.ratio <= 1) return 0;
    const level = a.params.threshold + then / (1 - 1 / a.params.ratio);
    const now = Math.max(0, level - p.threshold) * (1 - 1 / p.ratio);
    return then - now;
}

/** The matching gain `p` gets from the measurement `a` alone (compTarget's safe rule): never above `a`'s own. */
function heldGain(a: CompAnalysis, p: CompParams): number {
    let gain = a.match * 10 ** (-Math.max(0, gentlerBy(a, p)) / 20);
    // A slower attack (or a faster release) lets more of each hit through before the compressor acts, so the peaks
    // can rise toward the dry loop's own. Until the setting is measured, the gain then stays within the peak
    // allowance the matching itself keeps, which holds those peaks where the bypass's allowance puts them.
    if (p.attack > a.params.attack || p.release < a.params.release) gain = Math.min(gain, PEAK_ROOM);
    return Math.min(gain, a.match);
}

type CompAxis = keyof CompParams;

/** The four sliders, each on the scale its matching gain changes about evenly along. */
const COMP_AXES: Record<CompAxis, Axis> = {
    threshold: { min: -40, max: 0, step: 1 },
    ratio: { min: 1, max: 20, step: 0.5, scale: (r) => 1 - 1 / r },
    attack: { min: 0, max: 100, step: 1 },
    release: { min: 20, max: 600, step: 10, scale: Math.log },
};
const AXIS_NAMES = Object.keys(COMP_AXES) as CompAxis[];

const compKey = (real: RealLoop | null, p: CompParams) => `${real ? 'real' : 'synth'}|${p.threshold}|${p.ratio}|${p.attack}|${p.release}`;
const measureComp = (real: RealLoop | null, p: CompParams) => (real ? analyseCompReal(real, p) : analyseComp(p));

/** The settings to measure ahead around `p` (matching.ts aheadAlong), nearest first. */
function compAhead(p: CompParams, real: RealLoop | null): [string, () => Promise<CompAnalysis>][] {
    const out: [string, () => Promise<CompAnalysis>][] = [];
    for (let tier = 0; tier < 3; tier++) {
        for (const name of AXIS_NAMES) {
            for (const v of aheadAlong(COMP_AXES[name], p[name])[tier]) {
                const q = { ...p, [name]: v };
                out.push([compKey(real, q), () => measureComp(real, q)]);
            }
        }
    }
    return out;
}

/**
 * The matching gain for `p` on source `src`: its own measurement, else from the measured settings on the same
 * slider (matching.ts along, with heldGain past the last one), else heldGain from the shown measurement.
 */
function compTarget(p: CompParams, src: RealLoop | null, shown: CompAnalysis | null): number | null {
    const known = [...compResults.values()].filter((r) => r.real === src);
    const exact = known.find((r) => sameParams(r.params, p));
    if (exact) return exact.match;
    let best: { gain: number; reach: number } | null = null;
    for (const name of AXIS_NAMES) {
        const line = known.filter((r) => AXIS_NAMES.every((o) => o === name || r.params[o] === p[o]));
        const est = along(
            line.map((r) => ({ v: r.params[name], gain: r.match, from: r })),
            p[name],
            COMP_AXES[name],
            (r) => heldGain(r, p),
        );
        if (est && (!best || est.reach < best.reach)) best = est;
    }
    if (best) return best.gain;
    return shown && shown.real === src ? heldGain(shown, p) : null;
}

/**
 * Posts a matching gain on the compressor's own time. A lower one lands at once. A higher one matches gain
 * reduction the compressor is still building: about 10 dB per attack time (the Web Audio definition) once its
 * parameter ramps are in, while between hits it lets go again, so a big change settles only over several hits;
 * and a longer release piles more up over about the release time. So the makeup rises straight in dB at a dB per
 * 0.6 attack times (a 17 dB revisit at the default 30 ms attack in 0.3 s), never in under 20 ms, unless the change
 * is long enough ago. Raised at once, a cached measurement's makeup played ahead of the reduction: a hit up to
 * 11 dB over the setting's own peaks.
 */
function postComp(n: CompNodes, gain: number, p: CompParams) {
    const rise = Math.min(30, Math.max(0, 20 * Math.log10(gain / Math.max(n.makeup.gain.value, 1e-4))));
    const duration = Math.max(0.02, 0.6 * (p.attack / 1000) * rise) + (n.releaseGrew ? p.release / 1000 : 0);
    const ready = n.changedAt + 0.02;
    if (n.ctx.currentTime > ready + duration) rampGain(n.posted, gain, 0, 0.03);
    else rampGain(n.posted, gain, ready, duration);
}

