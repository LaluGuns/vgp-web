'use client';

import { useEffect, useRef, useState } from 'react';
import { bass, fadeOut, hat, kick, midi, noiseBuffer, pluck, rms, sequence, snare, type Engine } from './engine';
import { Meter, PlayButton, Segmented, Slider, accentAlpha, ruleDash, useDialect, useFrame, usePlayer } from './ui';

// ── A live spectrum, drawn from an AnalyserNode on a log frequency axis ──

const SPECTRUM_POINTS = 160;
/** Half of a sixth of an octave, as a frequency ratio. */
const SIXTH = 2 ** (1 / 12);

/** Analyser bins averaged for each point of a 1/6-octave smoothed spectrum. Narrow bands at the bottom interpolate between bins. */
function smoothingBands(binCount: number, binHz: number): { lo: number; hi: number; at: number }[] {
    return Array.from({ length: SPECTRUM_POINTS }, (_, k) => {
        const f = 20 * 1000 ** (k / (SPECTRUM_POINTS - 1));
        const lo = Math.max(1, Math.ceil(f / SIXTH / binHz));
        const hi = Math.min(binCount - 1, Math.floor((f * SIXTH) / binHz));
        return { lo, hi, at: Math.min(binCount - 1.001, f / binHz) };
    });
}

/** dB per point: the mean power of the bins in each band. */
function smoothed(data: Float32Array, bands: { lo: number; hi: number; at: number }[], out: Float32Array) {
    for (let k = 0; k < bands.length; k++) {
        const { lo, hi, at } = bands[k];
        let power: number;
        if (hi >= lo) {
            power = 0;
            for (let i = lo; i <= hi; i++) power += 10 ** (data[i] / 10);
            power /= hi - lo + 1;
        } else {
            const i = Math.floor(at);
            const t = at - i;
            power = 10 ** (data[i] / 10) * (1 - t) + 10 ** (data[i + 1] / 10) * t;
        }
        out[k] = power > 1e-12 ? 10 * Math.log10(power) : -120;
    }
}

interface Trace {
    analyser: AnalyserNode;
    data: Float32Array<ArrayBuffer>;
    db: Float32Array;
}

/**
 * A live spectrum, smoothed to sixth-octave bands so it reads as a shape.
 * `analyser` is what the demo is about, drawn in the accent; `context`
 * (optional) is drawn behind it as an opaque grey area.
 */
function Spectrum({
    analyser,
    context,
    active,
    marker,
    label,
}: {
    analyser: AnalyserNode | null;
    context?: AnalyserNode | null;
    active: boolean;
    marker?: number;
    label: string;
}) {
    // The lesson group's accent and rules (DemoSlot), so the live display matches the figures.
    const dialect = useDialect();
    const canvas = useRef<HTMLCanvasElement>(null);
    const traces = useRef<{ bands: { lo: number; hi: number; at: number }[]; key: string; list: Trace[] } | null>(null);

    useFrame(active, () => {
        const c = canvas.current;
        if (!c || !analyser) return;
        const ctx2d = c.getContext('2d');
        if (!ctx2d) return;
        const dpr = window.devicePixelRatio || 1;
        const w = c.clientWidth;
        const h = c.clientHeight;
        if (c.width !== w * dpr) {
            c.width = w * dpr;
            c.height = h * dpr;
        }
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.clearRect(0, 0, w, h);
        const sources = context ? [context, analyser] : [analyser];
        const key = `${analyser.frequencyBinCount}|${analyser.context.sampleRate}|${sources.length}`;
        if (!traces.current || traces.current.key !== key || traces.current.list.some((t, i) => t.analyser !== sources[i])) {
            traces.current = {
                key,
                bands: smoothingBands(analyser.frequencyBinCount, analyser.context.sampleRate / analyser.fftSize),
                list: sources.map((a) => ({ analyser: a, data: new Float32Array(a.frequencyBinCount), db: new Float32Array(SPECTRUM_POINTS) })),
            };
        }
        const { bands, list } = traces.current;
        for (const t of list) {
            t.analyser.getFloatFrequencyData(t.data);
            smoothed(t.data, bands, t.db);
        }
        const x = (k: number) => (k / (SPECTRUM_POINTS - 1)) * w;
        const y = (db: number) => h - ((Math.max(-100, Math.min(-10, db)) + 100) / 90) * h;
        const fx = (f: number) => (Math.log10(f / 20) / Math.log10(20000 / 20)) * w;
        ctx2d.strokeStyle = dialect.rule.dash ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)';
        ctx2d.lineWidth = dialect.rule.dash ? 1.4 : 1;
        ctx2d.lineCap = dialect.rule.cap;
        ctx2d.setLineDash(ruleDash(dialect));
        for (const f of [100, 1000, 10000]) {
            ctx2d.beginPath();
            ctx2d.moveTo(fx(f), 0);
            ctx2d.lineTo(fx(f), h);
            ctx2d.stroke();
        }
        ctx2d.setLineDash([]);
        const curve = (db: Float32Array) => {
            ctx2d.beginPath();
            for (let k = 0; k < SPECTRUM_POINTS; k++) {
                if (k === 0) ctx2d.moveTo(x(k), y(db[k]));
                else ctx2d.lineTo(x(k), y(db[k]));
            }
        };
        const focus = list[list.length - 1].db;
        if (list.length > 1) {
            // The context as an opaque grey area, so no rule shows through it.
            curve(list[0].db);
            ctx2d.lineTo(w, h);
            ctx2d.lineTo(0, h);
            ctx2d.closePath();
            ctx2d.fillStyle = '#34383c';
            ctx2d.fill();
        } else if (dialect.fillUnder) {
            curve(focus);
            ctx2d.lineTo(w, h);
            ctx2d.lineTo(0, h);
            ctx2d.closePath();
            ctx2d.fillStyle = accentAlpha(dialect, dialect.area);
            ctx2d.fill();
        }
        curve(focus);
        ctx2d.strokeStyle = dialect.accent;
        ctx2d.lineWidth = 1.5;
        ctx2d.lineCap = dialect.cap;
        ctx2d.lineJoin = 'round';
        ctx2d.stroke();
        if (marker) {
            ctx2d.strokeStyle = 'rgba(255,255,255,0.55)';
            ctx2d.lineWidth = 1;
            ctx2d.setLineDash([4, 4]);
            ctx2d.beginPath();
            ctx2d.moveTo(fx(marker), 0);
            ctx2d.lineTo(fx(marker), h);
            ctx2d.stroke();
            ctx2d.setLineDash([]);
        }
    });

    return (
        <div>
            <canvas ref={canvas} role="img" aria-label={label} className="vgp-plot block h-28 w-full" />
            <div className="relative mt-1 h-4 text-[11px] text-white/55" aria-hidden="true">
                {[
                    [20, '20 Hz'],
                    [100, '100'],
                    [1000, '1k'],
                    [10000, '10k'],
                    [20000, '20k'],
                ].map(([f, text], i, all) => (
                    <span
                        key={text}
                        className="absolute top-0"
                        style={{
                            left: `${(Math.log10(Number(f) / 20) / 3) * 100}%`,
                            transform: i === 0 ? 'none' : i === all.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                        }}
                    >
                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}

const logSlider = {
    to: (v: number) => Math.round(20 * Math.pow(1000, v / 1000)),
    from: (f: number) => (Math.log(f / 20) / Math.log(1000)) * 1000,
};
const fmtHz = (f: number) => (f >= 1000 ? `${(f / 1000).toFixed(f >= 10000 ? 0 : 1)} kHz` : `${f} Hz`);

type FilterKind = 'lowpass' | 'highpass' | 'peaking';

/** Playback levels that put these sparser demos at about the loudness of the drum-loop demos. */
const FILTER_OUT = 1.58;
const ENVELOPE_OUT = 2.24;
const MASKING_OUT = 1.41;

/** A bright chord and noise through one filter, with the spectrum drawn live. */
export function FilterDemo({ initial = 'lowpass', types = ['lowpass', 'highpass', 'peaking'] }: { initial?: FilterKind; types?: FilterKind[] }) {
    const [type, setType] = useState<FilterKind>(initial);
    const [freq, setFreq] = useState(initial === 'peaking' ? 1200 : 900);
    const [q, setQ] = useState(initial === 'peaking' ? 8 : 4);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const nodes = useRef<{ ctx: AudioContext; filter: BiquadFilterNode } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = FILTER_OUT;
        master.connect(out);
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = q;
        filter.gain.value = 12;
        const an = ctx.createAnalyser();
        an.fftSize = 4096;
        an.smoothingTimeConstant = 0.8;
        filter.connect(master);
        filter.connect(an);
        // A soft bed of noise so the filter shape shows across the whole range.
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer(ctx);
        noise.loop = true;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.05;
        noise.connect(noiseGain).connect(filter);
        noise.start();
        const chords = [
            [45, 57, 60, 64],
            [41, 53, 57, 60],
        ];
        const seq = sequence(ctx, 100, 16, (step, time, dur) => {
            const chord = chords[step < 8 ? 0 : 1];
            if (step % 2 === 0) for (const n of chord) pluck(ctx, filter, time, midi(n + 12), dur * 1.8, 0.8);
            if (step % 4 === 0) kick(ctx, filter, time, 0.5);
            if (step % 2 === 1) hat(ctx, filter, time, 0.25);
        });
        nodes.current = { ctx, filter };
        setAnalyser(an);
        return () => {
            seq.stop();
            nodes.current = null;
            setAnalyser(null);
            fadeOut(ctx, master, () => noise.stop());
        };
    });

    const set = (patch: { type?: FilterKind; freq?: number; q?: number }) => {
        if (patch.type) setType(patch.type);
        if (patch.freq) setFreq(patch.freq);
        if (patch.q) setQ(patch.q);
        const n = nodes.current;
        if (!n) return;
        if (patch.type) n.filter.type = patch.type;
        if (patch.freq) n.filter.frequency.setTargetAtTime(patch.freq, n.ctx.currentTime, 0.02);
        if (patch.q) n.filter.Q.setTargetAtTime(patch.q, n.ctx.currentTime, 0.02);
    };

    const names: Record<FilterKind, string> = { lowpass: 'Low-pass', highpass: 'High-pass', peaking: 'Narrow boost' };
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                {types.length > 1 ? (
                    <Segmented label="Filter type" value={type} onChange={(v) => set({ type: v })} options={types.map((t) => ({ value: t, label: names[t] }))} />
                ) : null}
            </div>
            <Spectrum
                analyser={analyser}
                active={player.playing}
                marker={freq}
                label={`Live spectrum of the filtered sound, from 20 Hz to 20 kHz. The dashed line marks the ${type === 'peaking' ? 'boost' : 'cutoff'} at ${fmtHz(freq)}.`}
            />
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider
                    label={type === 'peaking' ? 'Boost frequency' : 'Cutoff'}
                    value={Math.round(logSlider.from(freq))}
                    min={0}
                    max={1000}
                    onChange={(v) => set({ freq: logSlider.to(v) })}
                    format={() => fmtHz(freq)}
                />
                <Slider
                    label={type === 'peaking' ? 'Width (Q)' : 'Resonance (Q)'}
                    value={q}
                    min={0.5}
                    max={20}
                    step={0.5}
                    onChange={(v) => set({ q: v })}
                    format={(v) => v.toFixed(1)}
                />
            </div>
        </div>
    );
}

const ENV_BPM = 92;
const ENV_STEP = 60 / ENV_BPM / 4;
/** Each note lasts a dotted eighth plus the release, as `pluck` plays it. */
const noteLength = (attackMs: number, releaseMs: number) => Math.max(attackMs / 1000 + 0.05, ENV_STEP * 1.5 + releaseMs / 1000);
/** The plot spans the longest note the sliders allow, about 1.05 s, rounded up. */
const ENV_SPAN = 1.1;

/**
 * One note's level against time, as `pluck` shapes it: an exponential rise
 * over the attack, then an exponential fall to silence by the end of the
 * note. Linear in amplitude, the way a waveform's outline looks.
 */
function envelopePoints(attackMs: number, releaseMs: number): { rise: string; fall: string; area: string } {
    const a = Math.max(0.002, attackMs / 1000);
    const end = noteLength(attackMs, releaseMs);
    const x = (t: number) => (t / ENV_SPAN) * 100;
    const y = (v: number) => 100 - v * 92;
    const floor = 0.0001;
    const at = (t: number) => (t <= a ? floor * (1 / floor) ** (t / a) : (1 / floor) ** (-(t - a) / (end - a)));
    const rise: string[] = [];
    const fall: string[] = [];
    for (let i = 0; i <= 40; i++) {
        const t = (a * i) / 40;
        rise.push(`${x(t).toFixed(2)},${y(at(t)).toFixed(2)}`);
    }
    for (let i = 0; i <= 80; i++) {
        const t = a + ((end - a) * i) / 80;
        fall.push(`${x(t).toFixed(2)},${y(at(t)).toFixed(2)}`);
    }
    return { rise: `M${rise.join('L')}`, fall: `M${fall.join('L')}`, area: `M0,100L${rise.join('L')}L${fall.join('L')}L${x(end).toFixed(2)},100Z` };
}

/** One synth phrase with an adjustable attack. The same notes, a different intent. */
export function EnvelopeDemo() {
    const dialect = useDialect();
    const [attack, setAttack] = useState(5);
    const [release, setRelease] = useState(250);
    const live = useRef({ attack, release });
    useEffect(() => {
        live.current = { attack, release };
    }, [attack, release]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        bus.gain.value = ENVELOPE_OUT;
        bus.connect(out);
        const phrase = [64, 0, 67, 0, 69, 0, 67, 64, 62, 0, 64, 0, 0, 0, 0, 0];
        const seq = sequence(ctx, ENV_BPM, 16, (step, time) => {
            const n = phrase[step];
            const { attack: a, release: r } = live.current;
            if (n) pluck(ctx, bus, time, midi(n), noteLength(a, r), 1.4, a / 1000);
            if (step % 4 === 0) kick(ctx, bus, time, 0.35);
        });
        return () => {
            seq.stop();
            fadeOut(ctx, bus);
        };
    });

    const shape = envelopePoints(attack, release);
    const lineProps = { fill: 'none', strokeLinecap: dialect.cap, strokeLinejoin: dialect.join, vectorEffect: 'non-scaling-stroke' } as const;
    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <div>
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="vgp-plot block h-20 w-full"
                    role="img"
                    aria-label={`The level of one note over ${Math.round(ENV_SPAN * 1000)} milliseconds: it rises over ${attack} ms, then fades out over the rest of the note, ${Math.round(noteLength(attack, release) * 1000)} ms in all.`}
                >
                    {dialect.fillUnder ? <path d={shape.area} fill={accentAlpha(dialect, dialect.area)} stroke="none" /> : null}
                    <path d={shape.fall} {...lineProps} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} />
                    <path d={shape.rise} {...lineProps} stroke={dialect.accent} strokeWidth={2.25} />
                </svg>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60" aria-hidden="true">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-0.5 w-3 bg-[var(--accent)]" />
                        Attack
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-0.5 w-3 bg-white/60" />
                        Fade to silence
                    </span>
                    <span>One note, {ENV_SPAN.toFixed(1)} seconds across</span>
                </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider label="Attack" value={attack} min={1} max={400} onChange={setAttack} format={(v) => `${v} ms`} hint="Under 10 ms speaks. Over 100 ms swells." />
                <Slider label="Release" value={release} min={20} max={800} step={10} onChange={setRelease} format={(v) => `${v} ms`} />
            </div>
        </div>
    );
}

/**
 * A lead line and a pad that fight for the same range. Carve the pad with
 * EQ or duck it under the lead and hear the lead come forward without
 * getting louder.
 */
export function MaskingDemo() {
    const [fix, setFix] = useState<'none' | 'eq' | 'duck'>('none');
    const [analysers, setAnalysers] = useState<{ lead: AnalyserNode; pad: AnalyserNode } | null>(null);
    const nodes = useRef<{ ctx: AudioContext; cut: BiquadFilterNode; duck: GainNode } | null>(null);
    const live = useRef(fix);
    useEffect(() => {
        live.current = fix;
    }, [fix]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = MASKING_OUT;
        master.connect(out);
        const padBus = ctx.createGain();
        const cut = ctx.createBiquadFilter();
        cut.type = 'peaking';
        cut.frequency.value = 1400;
        cut.Q.value = 1.1;
        cut.gain.value = fix === 'eq' ? -9 : 0;
        const duck = ctx.createGain();
        padBus.connect(cut).connect(duck).connect(master);
        const lead = ctx.createGain();
        lead.gain.value = 0.9;
        lead.connect(master);
        // Each part's spectrum after its treatment, slow enough to read while the notes move.
        const leadAn = ctx.createAnalyser();
        const padAn = ctx.createAnalyser();
        leadAn.fftSize = padAn.fftSize = 4096;
        leadAn.smoothingTimeConstant = padAn.smoothingTimeConstant = 0.88;
        lead.connect(leadAn);
        duck.connect(padAn);
        setAnalysers({ lead: leadAn, pad: padAn });
        nodes.current = { ctx, cut, duck };
        const melody = [76, 0, 79, 81, 0, 79, 76, 0, 74, 0, 76, 0, 72, 0, 0, 0];
        const seq = sequence(ctx, 96, 16, (step, time, dur) => {
            if (step === 0 || step === 8) {
                // A bright, busy pad right where the lead lives.
                for (const n of [64, 67, 71, 74, 76]) pluck(ctx, padBus, time, midi(n), dur * 8, 1.1, 0.04);
                for (const n of [64, 67, 71, 74, 76]) pluck(ctx, padBus, time + dur * 4, midi(n), dur * 4, 0.9, 0.04);
            }
            const n = melody[step];
            if (n) {
                pluck(ctx, lead, time, midi(n), dur * 1.6, 1.2);
                if (live.current === 'duck') {
                    duck.gain.cancelScheduledValues(time);
                    duck.gain.setTargetAtTime(0.35, time, 0.01);
                    duck.gain.setTargetAtTime(1, time + dur * 1.2, 0.08);
                }
            }
            if (step % 4 === 0) kick(ctx, master, time, 0.4);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            setAnalysers(null);
            fadeOut(ctx, master);
        };
    });

    const apply = (next: 'none' | 'eq' | 'duck') => {
        setFix(next);
        const n = nodes.current;
        if (!n) return;
        n.cut.gain.setTargetAtTime(next === 'eq' ? -9 : 0, n.ctx.currentTime, 0.03);
        if (next !== 'duck') {
            n.duck.gain.cancelScheduledValues(n.ctx.currentTime);
            n.duck.gain.setTargetAtTime(1, n.ctx.currentTime, 0.03);
        }
    };

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <Segmented
                label="Pad treatment"
                value={fix}
                onChange={apply}
                options={[
                    { value: 'none', label: 'Untouched' },
                    { value: 'eq', label: 'Cut the pad at 1.4 kHz' },
                    { value: 'duck', label: 'Duck the pad under the lead' },
                ]}
            />
            <div>
                <Spectrum
                    analyser={analysers?.pad ?? null}
                    context={analysers?.lead ?? null}
                    active={player.playing}
                    label="Live spectra of the lead, as a grey area, and of the pad, as a line. Cutting the pad at 1.4 kHz dips its line where the lead is strongest; ducking lowers the whole line while the lead plays."
                />
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60" aria-hidden="true">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-3 rounded-[1px] bg-[#34383c]" />
                        Lead
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-0.5 w-3 bg-[var(--accent)]" />
                        Pad
                    </span>
                </div>
            </div>
            <p className="text-sm leading-6 text-white/60">The lead never changes level. Only the pad does.</p>
        </div>
    );
}

function shaperCurve(kind: 'soft' | 'hard', drive: number): Float32Array<ArrayBuffer> {
    const n = 2048;
    const curve = new Float32Array(n);
    const k = 10 ** (drive / 20);
    for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * 2 - 1;
        const v = x * k;
        curve[i] = kind === 'soft' ? Math.tanh(v) : Math.max(-1, Math.min(1, v));
    }
    return curve;
}

/** Bass and chords through a waveshaper, level-matched so you hear harmonics, not volume. */
export function SaturationDemo() {
    const [drive, setDrive] = useState(12);
    const [kind, setKind] = useState<'off' | 'soft' | 'hard'>('soft');
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [gr, setGr] = useState(0);
    const nodes = useRef<{ ctx: AudioContext; shaper: WaveShaperNode; dry: GainNode; wet: GainNode; matched: GainNode } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const src = ctx.createGain();
        src.gain.value = 0.8;
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const shaper = ctx.createWaveShaper();
        shaper.curve = shaperCurve(kind === 'hard' ? 'hard' : 'soft', drive);
        shaper.oversample = '4x';
        const matched = ctx.createGain();
        const pre = ctx.createAnalyser();
        const post = ctx.createAnalyser();
        pre.fftSize = post.fftSize = 2048;
        const an = ctx.createAnalyser();
        an.fftSize = 4096;
        src.connect(pre);
        src.connect(dry).connect(master);
        src.connect(shaper).connect(post);
        shaper.connect(matched).connect(wet).connect(master);
        master.connect(an);
        dry.gain.value = kind === 'off' ? 1 : 0;
        wet.gain.value = kind === 'off' ? 0 : 1;
        nodes.current = { ctx, shaper, dry, wet, matched };
        setAnalyser(an);
        const seq = sequence(ctx, 92, 16, (step, time, dur) => {
            if (step === 0) bass(ctx, src, time, midi(33), dur * 6, 0.9);
            if (step === 8) bass(ctx, src, time, midi(36), dur * 6, 0.9);
            if (step % 4 === 2) for (const n of [57, 60, 64]) pluck(ctx, src, time, midi(n), dur * 2, 0.7);
            if (step === 4 || step === 12) snare(ctx, src, time, 0.6);
        });
        const a = new Float32Array(2048);
        const b = new Float32Array(2048);
        let sa = 0;
        let sb = 0;
        const timer = window.setInterval(() => {
            sa = sa * 0.85 + rms(pre, a) * 0.15;
            sb = sb * 0.85 + rms(post, b) * 0.15;
            if (sb > 1e-4) {
                const g = Math.min(4, Math.max(0.05, sa / sb));
                matched.gain.setTargetAtTime(g, ctx.currentTime, 0.2);
                setGr(20 * Math.log10(1 / g));
            }
        }, 60);
        return () => {
            seq.stop();
            window.clearInterval(timer);
            nodes.current = null;
            setAnalyser(null);
            fadeOut(ctx, master);
        };
    });

    const apply = (next: { drive?: number; kind?: 'off' | 'soft' | 'hard' }) => {
        const d = next.drive ?? drive;
        const k = next.kind ?? kind;
        if (next.drive !== undefined) setDrive(d);
        if (next.kind) setKind(k);
        const n = nodes.current;
        if (!n) return;
        if (k !== 'off') n.shaper.curve = shaperCurve(k === 'hard' ? 'hard' : 'soft', d);
        n.dry.gain.setTargetAtTime(k === 'off' ? 1 : 0, n.ctx.currentTime, 0.015);
        n.wet.gain.setTargetAtTime(k === 'off' ? 0 : 1, n.ctx.currentTime, 0.015);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Saturation"
                    value={kind}
                    onChange={(v) => apply({ kind: v })}
                    options={[
                        { value: 'off', label: 'Clean' },
                        { value: 'soft', label: 'Soft saturation' },
                        { value: 'hard', label: 'Hard clip' },
                    ]}
                />
            </div>
            <Spectrum analyser={analyser} active={player.playing} label="Live spectrum of the output, from 20 Hz to 20 kHz. Saturation adds harmonics that fill in the space above the notes." />
            <Slider label="Drive" value={drive} min={0} max={30} onChange={(v) => apply({ drive: v })} format={(v) => `${v} dB`} />
            <Meter label="Level-matching turned the output down by" value={Math.max(0, gr) / 24} text={`${Math.max(0, gr).toFixed(1)} dB`} />
        </div>
    );
}
