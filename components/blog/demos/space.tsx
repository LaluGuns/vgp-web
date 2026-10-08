'use client';

import { useRef, useState } from 'react';
import { bass, fadeOut, kick, midi, noiseBuffer, pluck, sequence, snare, type Engine } from './engine';
import { PlayButton, Readout, Segmented, Slider, usePlayer } from './ui';

type Width = 'haas' | 'polarity';

/**
 * Kick, bass and a lead in the middle, plus a pluck made wide with a
 * width trick. Fold to mono and hear which parts survive.
 */
export function MonoDemo() {
    const [mono, setMono] = useState(false);
    const [trick, setTrick] = useState<Width>('haas');
    const nodes = useRef<{ ctx: AudioContext; stereo: GainNode; summed: GainNode; flip: GainNode; delay: DelayNode } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const mix = ctx.createChannelMerger(2);
        const center = ctx.createGain();
        center.connect(mix, 0, 0);
        center.connect(mix, 0, 1);
        // The wide pluck: dry on the left, a copy on the right that is delayed or flipped.
        const wide = ctx.createGain();
        const delay = ctx.createDelay(0.05);
        const flip = ctx.createGain();
        delay.delayTime.value = trick === 'haas' ? 0.012 : 0;
        flip.gain.value = trick === 'polarity' ? -1 : 1;
        wide.connect(mix, 0, 0);
        wide.connect(delay).connect(flip).connect(mix, 0, 1);

        const stereo = ctx.createGain();
        const summed = ctx.createGain();
        stereo.gain.value = mono ? 0 : 1;
        summed.gain.value = mono ? 1 : 0;
        mix.connect(stereo).connect(master);
        const split = ctx.createChannelSplitter(2);
        const sum = ctx.createGain();
        sum.gain.value = 0.5;
        mix.connect(split);
        split.connect(sum, 0);
        split.connect(sum, 1);
        sum.connect(summed).connect(master);
        nodes.current = { ctx, stereo, summed, flip, delay };

        const notes = [69, 72, 76, 74, 72, 69, 67, 64];
        const seq = sequence(ctx, 96, 16, (step, time, dur) => {
            if (step % 8 === 0) kick(ctx, center, time, 0.8);
            if (step === 4 || step === 12) snare(ctx, center, time, 0.6);
            if (step === 0) bass(ctx, center, time, midi(45), dur * 7, 0.45);
            if (step === 8) bass(ctx, center, time, midi(41), dur * 7, 0.45);
            if (step % 2 === 0) pluck(ctx, wide, time, midi(notes[(step / 2) % notes.length]), 0.35, 1.3);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master);
        };
    });

    const applyMono = (next: boolean) => {
        setMono(next);
        const n = nodes.current;
        if (!n) return;
        n.stereo.gain.setTargetAtTime(next ? 0 : 1, n.ctx.currentTime, 0.01);
        n.summed.gain.setTargetAtTime(next ? 1 : 0, n.ctx.currentTime, 0.01);
    };

    const applyTrick = (next: Width) => {
        setTrick(next);
        const n = nodes.current;
        if (!n) return;
        n.delay.delayTime.setTargetAtTime(next === 'haas' ? 0.012 : 0, n.ctx.currentTime, 0.01);
        n.flip.gain.setTargetAtTime(next === 'polarity' ? -1 : 1, n.ctx.currentTime, 0.01);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Playback"
                    value={mono ? 'mono' : 'stereo'}
                    onChange={(v) => applyMono(v === 'mono')}
                    options={[
                        { value: 'stereo', label: 'Stereo' },
                        { value: 'mono', label: 'Mono' },
                    ]}
                />
            </div>
            <div>
                <p className="mb-2 text-sm font-medium text-white/85">How the pluck is made wide</p>
                <Segmented
                    label="Width trick"
                    value={trick}
                    onChange={applyTrick}
                    options={[
                        { value: 'haas', label: '12 ms delay on one side' },
                        { value: 'polarity', label: 'Flipped polarity on one side' },
                    ]}
                />
            </div>
            <p className="text-sm leading-6 text-white/60">
                Use headphones for stereo. In mono, the delayed copy turns the pluck hollow and the flipped copy cancels it completely. The kick, bass and snare are in
                the middle, so they never change.
            </p>
        </div>
    );
}

/**
 * Two copies of the same bass note. Delay one or flip its polarity and
 * hear the low end thin out, then vanish.
 */
export function PhaseDemo() {
    const [delayMs, setDelayMs] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const nodes = useRef<{ ctx: AudioContext; delay: DelayNode; flip: GainNode } | null>(null);
    const freq = midi(33); // A1, 55 Hz

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const layerA = ctx.createGain();
        layerA.gain.value = 0.5;
        const layerB = ctx.createGain();
        layerB.gain.value = 0.5;
        const delay = ctx.createDelay(0.05);
        delay.delayTime.value = delayMs / 1000;
        const flip = ctx.createGain();
        flip.gain.value = flipped ? -1 : 1;
        layerA.connect(master);
        layerB.connect(delay).connect(flip).connect(master);
        nodes.current = { ctx, delay, flip };
        const notes = [33, 33, 36, 31];
        const seq = sequence(ctx, 90, 16, (step, time, dur) => {
            if (step % 4 === 0) {
                const n = midi(notes[step / 4]);
                // The same note, played into both layers.
                bass(ctx, layerA, time, n, dur * 3.6, 1.2);
                bass(ctx, layerB, time, n, dur * 3.6, 1.2);
            }
            if (step % 8 === 4) snare(ctx, master, time, 0.35);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master);
        };
    });

    const setDelay = (v: number) => {
        setDelayMs(v);
        const n = nodes.current;
        if (n) n.delay.delayTime.setTargetAtTime(v / 1000, n.ctx.currentTime, 0.02);
    };
    const setFlip = (v: boolean) => {
        setFlipped(v);
        const n = nodes.current;
        if (n) n.flip.gain.setTargetAtTime(v ? -1 : 1, n.ctx.currentTime, 0.005);
    };

    const shift = ((((delayMs / 1000) * freq * 360) % 360) + (flipped ? 180 : 0)) % 360;
    const level = Math.abs(Math.cos(((shift / 360) * 2 * Math.PI) / 2));
    const levelDb = level < 0.01 ? 'silent' : `${(20 * Math.log10(level)).toFixed(1)} dB`;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Second layer polarity"
                    value={flipped ? 'flipped' : 'normal'}
                    onChange={(v) => setFlip(v === 'flipped')}
                    options={[
                        { value: 'normal', label: 'Polarity normal' },
                        { value: 'flipped', label: 'Polarity flipped' },
                    ]}
                />
            </div>
            <Slider
                label="Delay on the second layer"
                value={delayMs}
                min={0}
                max={10}
                step={0.1}
                onChange={setDelay}
                format={(v) => `${v.toFixed(1)} ms`}
                hint="At 55 Hz one cycle lasts about 18 ms, so about 9 ms of delay puts the layers half a cycle apart."
            />
            <Readout
                items={[
                    { label: 'Phase difference at 55 Hz', value: `${Math.round(shift)}°` },
                    { label: 'Combined level at 55 Hz', value: levelDb },
                ]}
            />
        </div>
    );
}

function impulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(2, length, ctx.sampleRate);
    const noise = noiseBuffer(ctx).getChannelData(0);
    for (let c = 0; c < 2; c++) {
        const data = buf.getChannelData(c);
        const offset = c * 7919;
        for (let i = 0; i < length; i++) {
            // Exponential decay reaching -60 dB at the end: the classic RT60 shape.
            const env = Math.pow(10, (-3 * i) / length);
            data[i] = noise[(i + offset) % noise.length] * env;
        }
    }
    return buf;
}

/**
 * A short melody into a generated room. Pre-delay, decay and level move
 * the sound forward or back.
 */
export function ReverbDemo() {
    const [preMs, setPreMs] = useState(10);
    const [decay, setDecay] = useState(1.8);
    const [wetPct, setWetPct] = useState(35);
    const nodes = useRef<{ ctx: AudioContext; pre: DelayNode; wet: GainNode; dry: GainNode; conv: ConvolverNode } | null>(null);
    const decayTimer = useRef<number | undefined>(undefined);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const source = ctx.createGain();
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const pre = ctx.createDelay(0.5);
        const conv = ctx.createConvolver();
        conv.buffer = impulse(ctx, decay);
        pre.delayTime.value = preMs / 1000;
        dry.gain.value = 1 - (wetPct / 100) * 0.6;
        wet.gain.value = (wetPct / 100) * 0.9;
        source.connect(dry).connect(master);
        source.connect(pre).connect(conv).connect(wet).connect(master);
        nodes.current = { ctx, pre, wet, dry, conv };
        const phrase = [72, 0, 76, 79, 0, 77, 76, 0, 74, 0, 72, 74, 0, 0, 0, 0];
        const seq = sequence(ctx, 84, 16, (step, time) => {
            const n = phrase[step];
            if (n) pluck(ctx, source, time, midi(n), 0.3, 1.6);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master);
        };
    });

    const n = () => nodes.current;

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <div className="grid gap-5 sm:grid-cols-3">
                <Slider
                    label="Pre-delay"
                    value={preMs}
                    min={0}
                    max={120}
                    onChange={(v) => {
                        setPreMs(v);
                        const x = n();
                        if (x) x.pre.delayTime.setTargetAtTime(v / 1000, x.ctx.currentTime, 0.02);
                    }}
                    format={(v) => `${v} ms`}
                />
                <Slider
                    label="Decay"
                    value={decay}
                    min={0.3}
                    max={4}
                    step={0.1}
                    onChange={(v) => {
                        setDecay(v);
                        window.clearTimeout(decayTimer.current);
                        decayTimer.current = window.setTimeout(() => {
                            const x = n();
                            if (x) x.conv.buffer = impulse(x.ctx, v);
                        }, 150);
                    }}
                    format={(v) => `${v.toFixed(1)} s`}
                />
                <Slider
                    label="Reverb level"
                    value={wetPct}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(v) => {
                        setWetPct(v);
                        const x = n();
                        if (x) {
                            x.wet.gain.setTargetAtTime((v / 100) * 0.9, x.ctx.currentTime, 0.03);
                            x.dry.gain.setTargetAtTime(1 - (v / 100) * 0.6, x.ctx.currentTime, 0.03);
                        }
                    }}
                    format={(v) => `${v}%`}
                />
            </div>
            <p className="text-sm leading-6 text-white/60">
                Raise the pre-delay to about 60 ms and the notes step forward even with plenty of reverb. Push the level up with no pre-delay and they sink into the room.
            </p>
        </div>
    );
}
