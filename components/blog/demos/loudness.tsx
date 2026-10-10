'use client';

import { useEffect, useRef, useState } from 'react';
import { fadeOut, kWeighted, midi, pluck, scheduleSteps, sequence, type Engine } from './engine';
import { playDrumStep } from './dynamics';
import { Answers, PlayButton, Readout, Segmented, usePlayer, whenIdle } from './ui';

const BPM = 92;
const STEPS = 32;

function playLoopStep(ctx: BaseAudioContext, dest: AudioNode, step: number, time: number, stepDur: number) {
    playDrumStep(ctx, dest, step % 16, time, stepDur);
    if (step % 8 === 2) for (const n of step < 16 ? [57, 60, 64] : [53, 57, 60]) pluck(ctx, dest, time, midi(n), stepDur * 3, 0.9);
}

type Master = 'dynamic' | 'loud';

/** Builds one of the two masters between `input` and the returned output node. */
function masterChain(ctx: BaseAudioContext, input: AudioNode, kind: Master): AudioNode {
    if (kind === 'dynamic') {
        const glue = ctx.createDynamicsCompressor();
        glue.threshold.value = -12;
        glue.ratio.value = 2;
        glue.attack.value = 0.03;
        glue.release.value = 0.15;
        input.connect(glue);
        return glue;
    }
    // Pushed 14 dB into a hard clipper: louder, with the peaks shaved flat.
    const push = ctx.createGain();
    push.gain.value = 10 ** (14 / 20);
    const clip = ctx.createWaveShaper();
    const curve = new Float32Array(2048);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.max(-0.5, Math.min(0.5, (i / (curve.length - 1)) * 2 - 1));
    clip.curve = curve;
    clip.oversample = '4x';
    input.connect(push).connect(clip);
    return clip;
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
    kWeighted(ctx, masterChain(ctx, src, kind)).connect(ctx.destination);
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
    const [lufs, setLufs] = useState<Record<Master, number> | null>(null);
    const nodes = useRef<{ ctx: AudioContext; gains: Record<Master, GainNode>; level: Record<Master, GainNode> } | null>(null);

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
        for (const kind of ['dynamic', 'loud'] as Master[]) {
            const select = ctx.createGain();
            select.gain.value = kind === which ? 1 : 0;
            const lvl = ctx.createGain();
            lvl.gain.value = levelFor(kind, normalize, lufs);
            masterChain(ctx, src, kind).connect(lvl).connect(select).connect(master);
            gains[kind] = select;
            level[kind] = lvl;
        }
        nodes.current = { ctx, gains, level };
        const seq = sequence(ctx, BPM, STEPS, (step, time, dur) => playLoopStep(ctx, src, step, time, dur));
        if (!lufs) void measureBoth().then(setLufs);
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master);
        };
    });

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

    // A measurement that lands while playing with normalization on goes live at once.
    useEffect(() => {
        const n = nodes.current;
        if (!n || !lufs) return;
        for (const kind of ['dynamic', 'loud'] as Master[]) n.level[kind].gain.setTargetAtTime(levelFor(kind, normalize, lufs), n.ctx.currentTime, 0.02);
    }, [lufs, normalize]);

    const fmt = (v: number) => `${v.toFixed(1)} LUFS`;
    const diff = lufs ? lufs.loud - lufs.dynamic : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
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

/**
 * A blind A/B of the same loop where one side is 1 dB louder. Pick the
 * one that sounds better, then see which was louder.
 */
export function LevelAbDemo() {
    const [louder, setLouder] = useState<'a' | 'b'>(() => (Math.random() < 0.5 ? 'a' : 'b'));
    const [side, setSide] = useState<'a' | 'b'>('a');
    const [pick, setPick] = useState<'a' | 'b' | null>(null);
    const nodes = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
    const answers = useRef<HTMLDivElement>(null);
    const gainFor = (s: 'a' | 'b', l: 'a' | 'b') => (s === l ? 10 ** (1 / 20) : 1);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const gain = ctx.createGain();
        gain.gain.value = gainFor(side, louder) * 0.8;
        gain.connect(out);
        nodes.current = { ctx, gain };
        const seq = sequence(ctx, BPM, STEPS, (step, time, dur) => playLoopStep(ctx, gain, step, time, dur));
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, gain);
        };
    });

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
                <PlayButton playing={player.playing} onClick={player.toggle} />
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
