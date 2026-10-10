'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fadeOut, kWeighted, midi, pluck, scheduleSteps, sequence, type Engine } from './engine';
import { playDrumStep } from './dynamics';
import { SourceChoice, loopGain, renderLoop, startFeed, stereoPower, useSource, type Feed, type RealLoop } from './realmix';
import { Answers, PlayButton, Readout, Segmented, useAnalysis, usePlayer, whenIdle } from './ui';

const BPM = 92;
const STEPS = 32;

function playLoopStep(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number, stepDur: number) {
    playDrumStep(ctx, dest, step % 16, time, stepDur);
    if (step % 8 === 2) for (const n of step < 16 ? [57, 60, 64] : [53, 57, 60]) pluck(ctx, dest, time, midi(n), stepDur * 3, 0.9);
}

type Master = 'dynamic' | 'loud';

/**
 * The real mix (a finished master) goes in at this loudness, so with the
 * demo's playback level it plays at the house loudness as it was released.
 */
const NORM_REAL_IN = -13.6;
/** How far the real master is pushed into the clipper: it comes out about 5.8 LU louder, as the drum loop's loud master does. */
const NORM_REAL_PUSH = 11;

interface MasterChain {
    out: AudioNode;
    /** The drum loop's master (false) or the real mix's (true). */
    set(real: boolean): void;
}

/**
 * Builds one of the two masters between `input` and the returned output node.
 * The drum loop's dynamic master is a gentle glue compressor; the real mix
 * is already mastered, so its dynamic master is the mix as released (the
 * compressor at 1:1). The loud master pushes either into a hard clipper.
 */
function masterChain(ctx: BaseAudioContext, input: AudioNode, kind: Master, real = false): MasterChain {
    if (kind === 'dynamic') {
        const glue = ctx.createDynamicsCompressor();
        glue.attack.value = 0.03;
        glue.release.value = 0.15;
        const set = (r: boolean) => {
            glue.threshold.setValueAtTime(r ? 0 : -12, ctx.currentTime);
            glue.ratio.setValueAtTime(r ? 1 : 2, ctx.currentTime);
        };
        set(real);
        input.connect(glue);
        return { out: glue, set };
    }
    // Pushed into a hard clipper: louder, with the peaks shaved flat.
    const push = ctx.createGain();
    const set = (r: boolean) => push.gain.setValueAtTime(10 ** ((r ? NORM_REAL_PUSH : 14) / 20), ctx.currentTime);
    set(real);
    const clip = ctx.createWaveShaper();
    const curve = new Float32Array(2048);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.max(-0.5, Math.min(0.5, (i / (curve.length - 1)) * 2 - 1));
    clip.curve = curve;
    clip.oversample = '4x';
    input.connect(push).connect(clip);
    return { out: clip, set };
}

/**
 * Integrated loudness of a rendered loop, K-weighted (engine.ts) and ungated.
 * The loop's voices are made a few steps at a time (engine.ts scheduleSteps),
 * so measuring both masters while the page is idle never holds up a frame.
 */
async function measure(kind: Master, sampleRate: number): Promise<number> {
    const stepDur = 60 / BPM / 4;
    const seconds = stepDur * STEPS + 0.5;
    const ctx = new OfflineAudioContext(1, Math.ceil(seconds * sampleRate), sampleRate);
    const src = ctx.createGain();
    kWeighted(ctx, masterChain(ctx, src, kind).out).connect(ctx.destination);
    await scheduleSteps(STEPS, (step) => playLoopStep(ctx, src, step, 0.05 + step * stepDur, stepDur));
    const buffer = await ctx.startRendering();
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
    return -0.691 + 10 * Math.log10(sum / data.length);
}

/** Both masters' loudness, measured once per page from offline renders of this exact loop. */
let loudnessJob: Promise<Record<Master, number>> | null = null;
function measureBoth(): Promise<Record<Master, number>> {
    loudnessJob ??= Promise.all([measure('dynamic', 48000), measure('loud', 48000)]).then(([dynamic, loud]) => ({ dynamic, loud }));
    return loudnessJob;
}

/** Both masters' loudness on one whole pass of the real loop, as it repeats. */
async function measureReal(loop: RealLoop): Promise<Measured> {
    const one = async (kind: Master) => {
        const r = await renderLoop(loop, { gain: loopGain(loop, NORM_REAL_IN), taps: 1, weighted: 1 }, (ctx, src, [tap]) => masterChain(ctx, src, kind, true).out.connect(tap));
        const [from, to] = r.span();
        return -0.691 + 10 * Math.log10(await stereoPower(r.k[0], from, to));
    };
    return { real: loop, dynamic: await one('dynamic'), loud: await one('loud') };
}

/** The masters' loudness, and the real loop it was measured on (null for the drum loop). */
type Measured = Record<Master, number> & { real: RealLoop | null };

/** The real loop's measurement once made (ui.tsx useAnalysis), so a switch back to it goes live at once. */
const normResults = new Map<string, Measured | null>();

/** Gain for one master: with normalization on, the louder master is turned down to match the quieter one. */
function levelFor(kind: Master, norm: boolean, measured: Record<Master, number> | null): number {
    if (!norm || !measured) return 1;
    const target = Math.min(measured.dynamic, measured.loud);
    return 10 ** ((target - measured[kind]) / 20);
}

/**
 * Playback level. The clipped master peaks low for how loud it is (that is
 * the point), and at this level (with the demo's trim) it is already the
 * loudest demo on the site, about 6 LU above the house loudness where the
 * dynamic master sits, so it is not raised to match peaks.
 */
const NORM_OUT = 0.7;

/**
 * The same loop as a dynamic master and a loud, clipped master. Turn on
 * streaming-style normalization and both play at the same loudness, so
 * the clipped one loses its only advantage.
 */
export function NormalizationDemo() {
    const [which, setWhich] = useState<Master>('loud');
    const [normalize, setNormalize] = useState(false);
    const [synthLufs, setLufs] = useState<Record<Master, number> | null>(null);
    const source = useSource('dystopia');
    const real = source.loop;
    const realLufs = useAnalysis(real ? 'real' : 'synth', () => (real ? measureReal(real) : Promise.resolve(null)), normResults);
    // What plays, and what the readings and the normalization follow: the real mix once it has been measured.
    const fed = realLufs?.real ?? null;
    const lufs = useMemo<Measured | null>(() => (fed && realLufs ? realLufs : synthLufs ? { ...synthLufs, real: null } : null), [fed, realLufs, synthLufs]);
    const loading = source.pick === 'real' && (!real || fed !== real);
    const nodes = useRef<{ ctx: AudioContext; gains: Record<Master, GainNode>; level: Record<Master, GainNode>; chains: MasterChain[]; feed: Feed } | null>(null);

    // Measure while the page is idle, so pressing play does not wait for it.
    useEffect(() => {
        let alive = true;
        const cancel = whenIdle(() => {
            void measureBoth().then((m) => alive && setLufs(m));
        });
        return () => {
            alive = false;
            cancel();
        };
    }, []);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = NORM_OUT;
        master.connect(out);
        const src = ctx.createGain();
        const gains = {} as Record<Master, GainNode>;
        const level = {} as Record<Master, GainNode>;
        const chains: MasterChain[] = [];
        for (const kind of ['dynamic', 'loud'] as Master[]) {
            const select = ctx.createGain();
            select.gain.value = kind === which ? 1 : 0;
            const lvl = ctx.createGain();
            lvl.gain.value = levelFor(kind, normalize, lufs);
            const chain = masterChain(ctx, src, kind, fed !== null);
            chain.out.connect(lvl).connect(select).connect(master);
            chains.push(chain);
            gains[kind] = select;
            level[kind] = lvl;
        }
        const feed = startFeed(
            ctx,
            src,
            (into) => {
                const seq = sequence(ctx, BPM, STEPS, (step, time, dur) => playLoopStep(ctx, into, step, time, dur));
                return () => seq.stop();
            },
            fed,
            (loop) => loopGain(loop, NORM_REAL_IN),
        );
        nodes.current = { ctx, gains, level, chains, feed };
        if (!synthLufs) void measureBoth().then(setLufs);
        return () => {
            feed.stop();
            nodes.current = null;
            fadeOut(ctx, master);
        };
    }, !loading);

    const apply = (next: { which?: Master; normalize?: boolean }, measured = lufs) => {
        const w = next.which ?? which;
        const norm = next.normalize ?? normalize;
        if (next.which) setWhich(w);
        if (next.normalize !== undefined) setNormalize(norm);
        const n = nodes.current;
        if (!n) return;
        const t = n.ctx.currentTime;
        for (const kind of ['dynamic', 'loud'] as Master[]) {
            n.gains[kind].gain.setTargetAtTime(kind === w ? 1 : 0, t, 0.01);
            n.level[kind].gain.setTargetAtTime(levelFor(kind, norm, measured), t, 0.02);
        }
    };

    // A measurement that lands while playing with normalization on goes live at once, and a new source with its own.
    useEffect(() => {
        const n = nodes.current;
        if (!n) return;
        n.feed.use(fed);
        for (const c of n.chains) c.set(fed !== null);
        if (!lufs) return;
        for (const kind of ['dynamic', 'loud'] as Master[]) n.level[kind].gain.setTargetAtTime(levelFor(kind, normalize, lufs), n.ctx.currentTime, 0.02);
    }, [lufs, normalize, fed]);

    const fmt = (v: number) => `${v.toFixed(1)} LUFS`;
    const diff = lufs ? lufs.loud - lufs.dynamic : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} waiting={player.waiting} onClick={player.toggle} />
                <Segmented
                    label="Master"
                    value={which}
                    onChange={(v) => apply({ which: v })}
                    options={[
                        { value: 'dynamic', label: 'Dynamic master' },
                        { value: 'loud', label: 'Loud, clipped master' },
                    ]}
                />
            </div>
            <SourceChoice source={source} loading={loading} />
            <Segmented
                label="Normalization"
                value={normalize ? 'on' : 'off'}
                onChange={(v) => apply({ normalize: v === 'on' })}
                options={[
                    { value: 'off', label: 'Off' },
                    { value: 'on', label: 'On, like streaming' },
                ]}
            />
            <Readout
                items={[
                    { label: 'Dynamic master', value: lufs ? fmt(lufs.dynamic) : 'Measuring' },
                    { label: 'Loud master', value: lufs ? fmt(lufs.loud) : 'Measuring' },
                    { label: 'Normalization turns the loud one down', value: lufs ? `${diff.toFixed(1)} dB` : '–' },
                ]}
            />
            <p className="text-sm leading-6 text-white/60">
                Loudness is measured in your browser from this exact loop. With normalization on, switch masters and listen to the snare: the clipped master is no
                louder any more, only flatter.
            </p>
        </div>
    );
}

/** The real mix goes in at this loudness: the two sides then play 0.5 LU either side of the house loudness. */
const AB_REAL_IN = -13.8;

/**
 * A blind A/B of the same loop where one side is 1 dB louder. Pick the
 * one that sounds better, then see which was louder.
 */
export function LevelAbDemo() {
    const [louder, setLouder] = useState<'a' | 'b'>(() => (Math.random() < 0.5 ? 'a' : 'b'));
    const [side, setSide] = useState<'a' | 'b'>('a');
    const [pick, setPick] = useState<'a' | 'b' | null>(null);
    const source = useSource('dystopia');
    const fed = source.loop;
    const nodes = useRef<{ ctx: AudioContext; gain: GainNode; feed: Feed } | null>(null);
    const answers = useRef<HTMLDivElement>(null);
    const gainFor = (s: 'a' | 'b', l: 'a' | 'b') => (s === l ? 10 ** (1 / 20) : 1);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const gain = ctx.createGain();
        gain.gain.value = gainFor(side, louder) * 0.8;
        gain.connect(out);
        const feed = startFeed(
            ctx,
            gain,
            (into) => {
                const seq = sequence(ctx, BPM, STEPS, (step, time, dur) => playLoopStep(ctx, into, step, time, dur));
                return () => seq.stop();
            },
            fed,
            (loop) => loopGain(loop, AB_REAL_IN),
        );
        nodes.current = { ctx, gain, feed };
        return () => {
            feed.stop();
            nodes.current = null;
            fadeOut(ctx, gain);
        };
    }, source.pick === 'synth' || fed !== null);

    useEffect(() => {
        nodes.current?.feed.use(fed);
    }, [fed]);

    const listen = (s: 'a' | 'b') => {
        setSide(s);
        const n = nodes.current;
        if (n) n.gain.gain.setTargetAtTime(gainFor(s, louder) * 0.8, n.ctx.currentTime, 0.01);
    };

    const newRound = () => {
        const next = Math.random() < 0.5 ? 'a' : 'b';
        setLouder(next);
        setPick(null);
        const n = nodes.current;
        if (n) n.gain.gain.setTargetAtTime(gainFor(side, next) * 0.8, n.ctx.currentTime, 0.01);
        // The button that started the round is about to go: the new round starts at the first answer.
        answers.current?.querySelector('button')?.focus();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} waiting={player.waiting} onClick={player.toggle} />
                <Segmented
                    label="Listen to"
                    value={side}
                    onChange={listen}
                    options={[
                        { value: 'a', label: 'A' },
                        { value: 'b', label: 'B' },
                    ]}
                />
            </div>
            <SourceChoice source={source} loading={source.pick === 'real' && !fed} />
            <div ref={answers}>
                <Answers
                    label="Which one sounds better?"
                    value={pick}
                    onChange={(v) => setPick(v)}
                    options={[
                        { value: 'a', label: 'A sounds better' },
                        { value: 'b', label: 'B sounds better' },
                    ]}
                />
            </div>
            <div className="space-y-3">
                {/* Only the answer is announced; the button after it is not part of the message. */}
                <div aria-live="polite">
                    {pick ? (
                        <p className="text-base leading-7 text-white/80">
                            <span className="font-semibold text-white">{louder.toUpperCase()} was 1 dB louder.</span> Nothing else was different.{' '}
                            {pick === louder ? 'You picked the louder one, which is what loudness bias predicts.' : 'You resisted the louder one this round.'}
                        </p>
                    ) : (
                        <p className="text-sm text-white/55">The answer appears after you pick.</p>
                    )}
                </div>
                {pick ? (
                    <button
                        type="button"
                        onClick={newRound}
                        className="vgp-focus min-h-11 rounded-md border border-white/30 px-4 text-sm font-medium text-white transition-colors hover:border-white/70"
                    >
                        Try another round
                    </button>
                ) : null}
            </div>
        </div>
    );
}
