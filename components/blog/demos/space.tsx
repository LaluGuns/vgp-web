'use client';

import { useRef, useState } from 'react';
import { bass, fadeOut, kick, midi, pluck, reverb, sequence, snare, type Engine, type Reverb } from './engine';
import { LevelTrace, Meter, PlayButton, Readout, Segmented, Slider, blockPower, useFrame, usePlayer } from './ui';

const toDb = (power: number) => (power > 1e-12 ? 10 * Math.log10(power) : -120);

type Width = 'haas' | 'polarity';

/**
 * Kick, bass and snare in the middle, plus a pluck made wide with a
 * width trick. Fold to mono and hear which parts survive. Two meters show
 * the level of each part after the fold.
 */
export function MonoDemo() {
    const [mono, setMono] = useState(false);
    const [trick, setTrick] = useState<Width>('haas');
    const [levels, setLevels] = useState<{ center: number; wide: number } | null>(null);
    const nodes = useRef<{
        ctx: AudioContext;
        stereo: GainNode;
        summed: GainNode;
        flip: GainNode;
        delay: DelayNode;
        centerAn: AnalyserNode;
        wideL: AnalyserNode;
        wideR: AnalyserNode;
        buf: Float32Array<ArrayBuffer>;
        smooth: { center: number; wide: number };
    } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        // The middle parts are one signal sent equally to both sides, so folding to mono cannot change them.
        const center = ctx.createGain();
        center.connect(master);
        // The wide pluck: dry on the left, a copy on the right that is delayed or flipped.
        const wide = ctx.createGain();
        const mix = ctx.createChannelMerger(2);
        const delay = ctx.createDelay(0.05);
        const flip = ctx.createGain();
        delay.delayTime.value = trick === 'haas' ? 0.012 : 0;
        flip.gain.value = trick === 'polarity' ? -1 : 1;
        wide.connect(mix, 0, 0);
        wide.connect(delay).connect(flip).connect(mix, 0, 1);
        // Stereo as it is, or folded: both sides get half of left plus half of right.
        const wideOut = ctx.createGain();
        wideOut.connect(master);
        const stereo = ctx.createGain();
        const summed = ctx.createGain();
        stereo.gain.value = mono ? 0 : 1;
        summed.gain.value = mono ? 1 : 0;
        mix.connect(stereo).connect(wideOut);
        const split = ctx.createChannelSplitter(2);
        const sum = ctx.createGain();
        sum.gain.value = 0.5;
        mix.connect(split);
        split.connect(sum, 0);
        split.connect(sum, 1);
        sum.connect(summed).connect(wideOut);
        // Meters: the middle parts, and each side of the pluck after the fold.
        const centerAn = ctx.createAnalyser();
        const wideL = ctx.createAnalyser();
        const wideR = ctx.createAnalyser();
        centerAn.fftSize = wideL.fftSize = wideR.fftSize = 2048;
        center.connect(centerAn);
        const sides = ctx.createChannelSplitter(2);
        wideOut.connect(sides);
        sides.connect(wideL, 0);
        sides.connect(wideR, 1);
        nodes.current = { ctx, stereo, summed, flip, delay, centerAn, wideL, wideR, buf: new Float32Array(2048), smooth: { center: 0, wide: 0 } };

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
            setLevels(null);
            fadeOut(ctx, master);
        };
    });

    useFrame(player.playing, () => {
        const n = nodes.current;
        if (!n) return;
        // Averaged over about a second, so the meters read the parts rather than single notes.
        const k = 0.06;
        n.smooth.center += (blockPower(n.centerAn, n.buf) - n.smooth.center) * k;
        const wide = (blockPower(n.wideL, n.buf) + blockPower(n.wideR, n.buf)) / 2;
        n.smooth.wide += (wide - n.smooth.wide) * k;
        setLevels({ center: toDb(n.smooth.center), wide: toDb(n.smooth.wide) });
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

    const meter = (db: number | undefined) => ({ value: db === undefined ? 0 : (db + 60) / 50, text: db === undefined ? '–' : db < -70 ? 'Silent' : `${db.toFixed(1)} dB` });
    const center = meter(levels?.center);
    const wide = meter(levels?.wide);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
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
            <Segmented
                label="How the pluck is made wide"
                value={trick}
                onChange={applyTrick}
                options={[
                    { value: 'haas', label: '12 ms delay on one side' },
                    { value: 'polarity', label: 'Flipped polarity on one side' },
                ]}
            />
            <div className="space-y-4">
                <Meter label="Kick, bass and snare" value={center.value} text={center.text} />
                <Meter label="Wide pluck" value={wide.value} text={wide.text} />
                <p className="text-xs leading-5 text-white/50">Average level of each part as you hear it, after the fold to mono when it is on.</p>
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
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Second layer polarity"
                    value={flipped ? 'flipped' : 'normal'}
                    onChange={(v) => setFlip(v === 'flipped')}
                    options={[
                        { value: 'normal', label: 'Normal' },
                        { value: 'flipped', label: 'Flipped' },
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
                live
                items={[
                    { label: 'Phase difference at 55\u00a0Hz', value: `${Math.round(shift)}°` },
                    { label: 'Combined level at 55\u00a0Hz', value: levelDb },
                ]}
            />
        </div>
    );
}

/**
 * A room's impulse: noise falling exponentially to -60 dB at the end (the
 * classic RT60 shape), a different noise on each side. A running product for
 * the decay and an integer noise generator keep it quick on a slow phone.
 */
function roomImpulse(seconds: number) {
    return (sampleRate: number): Float32Array<ArrayBuffer>[] => {
        const length = Math.max(1, Math.floor(sampleRate * seconds));
        const step = 10 ** (-3 / length);
        return [0, 1].map((c) => {
            const data = new Float32Array(length);
            let seed = (1 + c * 7919) | 0;
            let env = 1;
            for (let i = 0; i < length; i++) {
                // xorshift32: white noise from -1 to 1.
                seed ^= seed << 13;
                seed ^= seed >>> 17;
                seed ^= seed << 5;
                data[i] = (seed / 2147483648) * env;
                env *= step;
            }
            return data;
        });
    };
}

/** Playback level: the melody is sparse, so it plays up to sit with the drum-loop demos. */
const REVERB_OUT = 3.5;

/**
 * A short melody into a generated room. Pre-delay, decay and level move
 * the sound forward or back. A trace shows the dry notes and the room
 * they leave behind.
 */
export function ReverbDemo() {
    const [preMs, setPreMs] = useState(10);
    const [decay, setDecay] = useState(1.8);
    const [wetPct, setWetPct] = useState(35);
    const nodes = useRef<{
        ctx: AudioContext;
        pre: DelayNode;
        wet: GainNode;
        dry: GainNode;
        room: Reverb;
        dryAn: AnalyserNode;
        wetAn: AnalyserNode;
        buf: Float32Array<ArrayBuffer>;
    } | null>(null);
    const decayTimer = useRef<number | undefined>(undefined);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = REVERB_OUT;
        master.connect(out);
        const source = ctx.createGain();
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const pre = ctx.createDelay(0.5);
        const room = reverb(ctx);
        room.load(roomImpulse(decay));
        pre.delayTime.value = preMs / 1000;
        dry.gain.value = 1 - (wetPct / 100) * 0.6;
        wet.gain.value = (wetPct / 100) * 0.9;
        source.connect(dry).connect(master);
        source.connect(pre).connect(room.input);
        room.output.connect(wet).connect(master);
        const dryAn = ctx.createAnalyser();
        const wetAn = ctx.createAnalyser();
        dryAn.fftSize = wetAn.fftSize = 2048;
        dry.connect(dryAn);
        wet.connect(wetAn);
        nodes.current = { ctx, pre, wet, dry, room, dryAn, wetAn, buf: new Float32Array(2048) };
        const phrase = [72, 0, 76, 79, 0, 77, 76, 0, 74, 0, 72, 74, 0, 0, 0, 0];
        const seq = sequence(ctx, 84, 16, (step, time) => {
            const n = phrase[step];
            if (n) pluck(ctx, source, time, midi(n), 0.3, 1.6);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            fadeOut(ctx, master, () => room.dispose());
        };
    });

    const n = () => nodes.current;
    // Both levels as heard, after the playback gain.
    const read = () => {
        const x = nodes.current;
        if (!x) return null;
        const g = REVERB_OUT * REVERB_OUT;
        return { context: blockPower(x.dryAn, x.buf) * g, focus: blockPower(x.wetAn, x.buf) * g };
    };

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <LevelTrace
                active={player.playing}
                read={read}
                context="Dry notes"
                focus="Reverb"
                label="Level over the last six seconds: the dry notes as a grey area and the reverb as a line. Longer decay stretches the line out between the notes; more level lifts it toward the notes."
            />
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
                            if (x) x.room.load(roomImpulse(v));
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
