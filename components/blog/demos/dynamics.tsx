'use client';

import { useEffect, useRef, useState } from 'react';
import { bass, fadeOut, hat, kick, kWeighted, midi, scheduleSteps, sequence, snare, yieldToMain, type Engine } from './engine';
import { LiveMeter, PlayButton, Segmented, Slider, useAnalysis, usePlayer } from './ui';

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
 * the bypass. Up to 7 dB higher is allowed (the default needs about that,
 * give or take a dB, so it may sit a fraction of a dB short); past that the
 * matching stops, which keeps every setting under the demo's ceiling, and
 * the demo says how much quieter that leaves the loop.
 */
const PEAK_ROOM = 10 ** (7 / 20);

const RATE = 44100;
const BPM = 92;
const STEP = 60 / BPM / 4;
const BAR = STEP * 16;
const LEAD = 0.05;
/** Bars rendered for a measurement. The first lets the compressor settle; the rest are measured. */
const BARS = 4;

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
    /** Gain after `undoMakeup` that plays the compressed loop at the bypass loudness, or as close as the peaks allow. */
    match: number;
    /** dB the compressed loop still sits under the bypass. */
    short: number;
}

/**
 * Renders four bars of the loop offline, dry and through the compressor, and
 * measures the last three: K-weighted loudness (engine.ts) for the matching,
 * and the highest peaks for the 7 dB allowance. The snare and hats are noise,
 * different on every hit, so one bar alone can be a dB off what plays.
 */
async function analyseComp(params: CompParams): Promise<CompAnalysis> {
    const ctx = new OfflineAudioContext(4, Math.ceil((LEAD + BARS * BAR + 0.1) * RATE), RATE);
    const merger = ctx.createChannelMerger(4);
    merger.connect(ctx.destination);
    const bus = ctx.createGain();
    const undo = ctx.createGain();
    undo.gain.value = undoMakeup(params.threshold, params.ratio);
    bus.connect(compressor(ctx, params)).connect(undo);
    bus.connect(merger, 0, 0);
    undo.connect(merger, 0, 1);
    kWeighted(ctx, bus).connect(merger, 0, 2);
    kWeighted(ctx, undo).connect(merger, 0, 3);
    await scheduleSteps(BARS * 16, (s) => playDrumStep(ctx, bus, s % 16, LEAD + s * STEP, STEP));
    const buffer = await ctx.startRendering();
    const [dry, wet, dryK, wetK] = [0, 1, 2, 3].map((c) => buffer.getChannelData(c));
    let peakDry = 0;
    let peakWet = 0;
    let powDry = 0;
    let powWet = 0;
    // A bar at a time, with a yield after each, so a slow phone never spends long in here at once.
    for (let bar = 1; bar < BARS; bar++) {
        const from = Math.round((LEAD + bar * BAR) * RATE);
        const to = Math.round((LEAD + (bar + 1) * BAR) * RATE);
        for (let i = from; i < to; i++) {
            const d = dry[i] < 0 ? -dry[i] : dry[i];
            const w = wet[i] < 0 ? -wet[i] : wet[i];
            if (d > peakDry) peakDry = d;
            if (w > peakWet) peakWet = w;
            powDry += dryK[i] * dryK[i];
            powWet += wetK[i] * wetK[i];
        }
        await yieldToMain();
    }
    const wanted = powWet > 0 ? Math.sqrt(powDry / powWet) : 1;
    const match = Math.min(wanted, MATCH_MAX, peakWet > 0 ? (PEAK_ROOM * peakDry) / peakWet : MATCH_MAX);
    return { params, match, short: 20 * Math.log10(wanted / match) };
}

/**
 * Drum loop through a compressor. The compressed path is level-matched
 * to the dry path, so switching compares shape, not loudness. A setting
 * goes live together with its matching gain, once it has been measured.
 */
export function CompressorDemo() {
    const [mode, setMode] = useState<Mode>('on');
    const [threshold, setThreshold] = useState(PRESETS.punch.threshold);
    const [ratio, setRatio] = useState(PRESETS.punch.ratio);
    const [attack, setAttack] = useState(PRESETS.punch.attack);
    const [release, setRelease] = useState(PRESETS.punch.release);
    const analysis = useAnalysis(`${threshold}|${ratio}|${attack}|${release}`, () => analyseComp({ threshold, ratio, attack, release }));
    const nodes = useRef<{ comp: DynamicsCompressorNode; undo: GainNode; makeup: GainNode; dry: GainNode; wet: GainNode; ctx: AudioContext } | null>(null);
    const modeRef = useRef(mode);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        const master = ctx.createGain();
        master.connect(out);
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const comp = compressor(ctx, analysis?.params ?? PRESETS.punch);
        const undo = ctx.createGain();
        const makeup = ctx.createGain();
        bus.connect(dry).connect(master);
        bus.connect(comp).connect(undo).connect(makeup).connect(wet).connect(master);
        dry.gain.value = modeRef.current === 'off' ? 1 : 0;
        wet.gain.value = modeRef.current === 'on' ? 1 : 0;
        // Silent until the setting has been measured, a moment after the page loads.
        makeup.gain.value = 0;
        const n = { comp, undo, makeup, dry, wet, ctx };
        nodes.current = n;
        if (analysis) applyComp(n, analysis, false);
        const seq = sequence(ctx, BPM, 16, (step, time, dur) => playDrumStep(ctx, bus, step, time, dur));
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master, () => bus.disconnect());
        };
    });

    useEffect(() => {
        const n = nodes.current;
        if (n && analysis) applyComp(n, analysis, true);
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

    // Under 1 dB is within the matching's own accuracy, and the default setting can land there.
    const short = analysis && analysis.short >= 1 ? Math.round(analysis.short) : 0;
    // The preset the sliders match, if any: the presets are a choice like the swing demo's.
    const preset = (Object.keys(PRESETS) as Preset[]).find((k) => {
        const p = PRESETS[k];
        return p.threshold === threshold && p.ratio === ratio && p.attack === attack && p.release === release;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
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
            <p className="text-sm leading-6 text-white/60" aria-live="polite">
                {short > 0
                    ? `At this setting the compressed loop plays about ${short} dB quieter than the bypass. Matching it fully would push its peaks past the demo's safe ceiling.`
                    : 'Both paths play at the same loudness.'}
            </p>
        </div>
    );
}

function applyComp(n: { comp: DynamicsCompressorNode; undo: GainNode; makeup: GainNode; ctx: AudioContext }, a: CompAnalysis, smooth: boolean) {
    const t = n.ctx.currentTime;
    const set = (param: AudioParam, value: number) => (smooth ? param.setTargetAtTime(value, t, 0.01) : param.setValueAtTime(value, t));
    set(n.comp.threshold, a.params.threshold);
    set(n.comp.ratio, a.params.ratio);
    set(n.comp.attack, a.params.attack / 1000);
    set(n.comp.release, a.params.release / 1000);
    set(n.undo.gain, undoMakeup(a.params.threshold, a.params.ratio));
    set(n.makeup.gain, a.match);
}
