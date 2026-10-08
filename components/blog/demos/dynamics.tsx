'use client';

import { useRef, useState } from 'react';
import { fadeOut, hat, kick, bass, midi, rms, sequence, snare, type Engine } from './engine';
import { Meter, PlayButton, Segmented, Slider, useFrame, usePlayer } from './ui';

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

/**
 * Drum loop through a compressor. The compressed path is level-matched
 * to the dry path, so switching compares shape, not loudness.
 */
export function CompressorDemo() {
    const [mode, setMode] = useState<Mode>('on');
    const [threshold, setThreshold] = useState(PRESETS.punch.threshold);
    const [ratio, setRatio] = useState(PRESETS.punch.ratio);
    const [attack, setAttack] = useState(PRESETS.punch.attack);
    const [release, setRelease] = useState(PRESETS.punch.release);
    const [reduction, setReduction] = useState(0);
    const nodes = useRef<{ comp: DynamicsCompressorNode; dry: GainNode; wet: GainNode; ctx: AudioContext } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        const master = ctx.createGain();
        master.connect(out);
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const comp = ctx.createDynamicsCompressor();
        comp.knee.value = 2;
        comp.threshold.value = threshold;
        comp.ratio.value = ratio;
        comp.attack.value = attack / 1000;
        comp.release.value = release / 1000;
        const makeup = ctx.createGain();
        const pre = ctx.createAnalyser();
        const post = ctx.createAnalyser();
        pre.fftSize = post.fftSize = 2048;
        bus.connect(pre);
        bus.connect(dry).connect(master);
        bus.connect(comp).connect(post);
        comp.connect(makeup).connect(wet).connect(master);
        dry.gain.value = mode === 'off' ? 1 : 0;
        wet.gain.value = mode === 'on' ? 1 : 0;
        nodes.current = { comp, dry, wet, ctx };

        const seq = sequence(ctx, 92, 16, (step, time, dur) => playDrumStep(ctx, bus, step, time, dur));
        const a = new Float32Array(2048);
        const b = new Float32Array(2048);
        let smoothPre = 0;
        let smoothPost = 0;
        const match = window.setInterval(() => {
            smoothPre = smoothPre * 0.85 + rms(pre, a) * 0.15;
            smoothPost = smoothPost * 0.85 + rms(post, b) * 0.15;
            if (smoothPost > 1e-4) {
                const target = Math.min(8, Math.max(1, smoothPre / smoothPost));
                makeup.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
            }
        }, 50);
        return () => {
            seq.stop();
            window.clearInterval(match);
            nodes.current = null;
            fadeOut(ctx, master, () => bus.disconnect());
            setReduction(0);
        };
    });

    useFrame(player.playing, () => {
        if (nodes.current) setReduction(-nodes.current.comp.reduction);
    });

    const setParam = (name: 'threshold' | 'ratio' | 'attack' | 'release', value: number) => {
        const n = nodes.current;
        if (!n) return;
        const v = name === 'attack' || name === 'release' ? value / 1000 : value;
        n.comp[name].setTargetAtTime(v, n.ctx.currentTime, 0.02);
    };

    const applyMode = (next: Mode) => {
        setMode(next);
        const n = nodes.current;
        if (!n) return;
        const t = n.ctx.currentTime;
        n.dry.gain.setTargetAtTime(next === 'off' ? 1 : 0, t, 0.015);
        n.wet.gain.setTargetAtTime(next === 'on' ? 1 : 0, t, 0.015);
    };

    const applyPreset = (preset: keyof typeof PRESETS) => {
        const p = PRESETS[preset];
        setThreshold(p.threshold);
        setRatio(p.ratio);
        setAttack(p.attack);
        setRelease(p.release);
        setParam('threshold', p.threshold);
        setParam('ratio', p.ratio);
        setParam('attack', p.attack);
        setParam('release', p.release);
        applyMode('on');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Compressor"
                    value={mode}
                    onChange={applyMode}
                    options={[
                        { value: 'off', label: 'Bypass' },
                        { value: 'on', label: 'Compressed' },
                    ]}
                />
            </div>
            <Meter label="Gain reduction" value={reduction / 18} text={`${reduction.toFixed(1)} dB`} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider
                    label="Threshold"
                    value={threshold}
                    min={-50}
                    max={0}
                    onChange={(v) => {
                        setThreshold(v);
                        setParam('threshold', v);
                    }}
                    format={(v) => `${v} dB`}
                />
                <Slider
                    label="Ratio"
                    value={ratio}
                    min={1}
                    max={20}
                    step={0.5}
                    onChange={(v) => {
                        setRatio(v);
                        setParam('ratio', v);
                    }}
                    format={(v) => `${v}:1`}
                />
                <Slider
                    label="Attack"
                    value={attack}
                    min={0}
                    max={100}
                    onChange={(v) => {
                        setAttack(v);
                        setParam('attack', v);
                    }}
                    format={(v) => `${v} ms`}
                />
                <Slider
                    label="Release"
                    value={release}
                    min={20}
                    max={600}
                    step={10}
                    onChange={(v) => {
                        setRelease(v);
                        setParam('release', v);
                    }}
                    format={(v) => `${v} ms`}
                />
            </div>
            <p className="text-sm leading-6 text-white/60">
                Try{' '}
                <button type="button" className="vgp-link text-white" onClick={() => applyPreset('punch')}>
                    slow attack
                </button>{' '}
                to let the snare crack through, then{' '}
                <button type="button" className="vgp-link text-white" onClick={() => applyPreset('flat')}>
                    fast attack
                </button>{' '}
                to flatten it. Both paths play at the same loudness.
            </p>
        </div>
    );
}
