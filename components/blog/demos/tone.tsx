'use client';

import { useEffect, useRef, useState } from 'react';
import { bass, fadeOut, hat, kick, midi, noiseBuffer, peekEngine, pluck, rms, scheduleSteps, sequence, snare, type Engine } from './engine';
import { MATCH_RUN_IN, SourceChoice, loopGain, matchPart, renderLoop, startFeed, stereoPower, useSource, type Feed, type RealLoop } from './realmix';
import { Meter, PlayButton, Segmented, Slider, accentAlpha, ruleDash, useAnalysis, useDialect, useFrame, usePlayer, whenIdle } from './ui';

// ── A live spectrum, drawn from an AnalyserNode on a log frequency axis ──

const SPECTRUM_POINTS = 160;
/** The analyser size every spectrum here draws from. */
const SPECTRUM_FFT = 4096;

interface Band {
    /** First analyser bin in the band. */
    from: number;
    /** Weight of each bin from `from` on, summing to 1. */
    weights: Float32Array;
}

/**
 * Sixth-octave smoothing: each point is a weighted mean of the bins' power
 * within a third of an octave around it, the weight falling in a triangle
 * from the centre, so the band is a sixth of an octave wide at half weight.
 * A harmonic sound then reads as one outline instead of a comb of partials.
 * Below about 200 Hz the band is narrower than a bin, so the nearest two
 * bins are interpolated.
 */
function smoothingBands(binCount: number, binHz: number): Band[] {
    return Array.from({ length: SPECTRUM_POINTS }, (_, k) => {
        const f = 20 * 1000 ** (k / (SPECTRUM_POINTS - 1));
        const lo = Math.max(1, Math.ceil(f / 2 ** (1 / 6) / binHz));
        const hi = Math.min(binCount - 1, Math.floor((f * 2 ** (1 / 6)) / binHz));
        if (hi - lo < 1) {
            const at = Math.min(binCount - 1.001, Math.max(1, f / binHz));
            const i = Math.floor(at);
            return { from: i, weights: new Float32Array([1 - (at - i), at - i]) };
        }
        const weights = new Float32Array(hi - lo + 1);
        let sum = 0;
        for (let i = lo; i <= hi; i++) {
            const w = Math.max(0, 1 - Math.abs(Math.log2((i * binHz) / f)) * 6);
            weights[i - lo] = w;
            sum += w;
        }
        for (let i = 0; i < weights.length; i++) weights[i] = sum > 0 ? weights[i] / sum : 1 / weights.length;
        return { from: lo, weights };
    });
}

const bandCache = new Map<string, Band[]>();

/** The bands for an analyser's size and sample rate, worked out once per page. */
function bandsFor(binCount: number, binHz: number): Band[] {
    const key = `${binCount}|${binHz}`;
    let bands = bandCache.get(key);
    if (!bands) {
        bands = smoothingBands(binCount, binHz);
        bandCache.set(key, bands);
    }
    return bands;
}

/** dB per point from the analyser's dB per bin. `power` is scratch space, one value per bin. */
function smoothed(data: Float32Array, bands: Band[], power: Float32Array, out: Float32Array) {
    for (let i = 0; i < data.length; i++) power[i] = 10 ** (data[i] / 10);
    for (let k = 0; k < bands.length; k++) {
        const { from, weights } = bands[k];
        let p = 0;
        for (let j = 0; j < weights.length; j++) p += power[from + j] * weights[j];
        out[k] = p > 1e-12 ? 10 * Math.log10(p) : -120;
    }
}

interface Trace {
    analyser: AnalyserNode;
    data: Float32Array<ArrayBuffer>;
    power: Float32Array;
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
    const traces = useRef<{ bands: Band[]; key: string; list: Trace[] } | null>(null);

    // Size the canvas, make its 2D context and work out the smoothing bands while the page is idle, so
    // the first frame of playback (already the busiest moment on a slow phone) only draws. The bands are
    // made for the rates an audio context runs at, each in an idle moment of its own.
    useEffect(() => {
        const cancels = [
            whenIdle(() => {
                const c = canvas.current;
                if (!c) return;
                const dpr = window.devicePixelRatio || 1;
                c.width = c.clientWidth * dpr;
                c.height = c.clientHeight * dpr;
                c.getContext('2d');
            }),
            ...[...new Set([peekEngine()?.ctx.sampleRate ?? 48000, 48000, 44100])].map((rate) => whenIdle(() => bandsFor(SPECTRUM_FFT / 2, rate / SPECTRUM_FFT))),
        ];
        return () => cancels.forEach((cancel) => cancel());
    }, []);

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
                bands: bandsFor(analyser.frequencyBinCount, analyser.context.sampleRate / analyser.fftSize),
                list: sources.map((a) => ({
                    analyser: a,
                    data: new Float32Array(a.frequencyBinCount),
                    power: new Float32Array(a.frequencyBinCount),
                    db: new Float32Array(SPECTRUM_POINTS),
                })),
            };
        }
        const { bands, list } = traces.current;
        for (const t of list) {
            t.analyser.getFloatFrequencyData(t.data);
            smoothed(t.data, bands, t.power, t.db);
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
                        // Under 360 px "20k" would run into "10k", so it is left out there; the plot still ends at 20 kHz.
                        className={`absolute top-0${f === 20000 ? ' max-[360px]:hidden' : ''}`}
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

/**
 * The loudness the real mix goes into the filter at, by the demo's starting
 * filter, so its default setting plays at the house loudness: the low-pass
 * at 900 Hz takes away most of the mix's level, the narrow boost adds a little.
 */
const FILTER_REAL_IN = -19.3;

/**
 * On the real mix, a high resonance or a wide boost lands on its bass and
 * chords hard enough to take the peaks past the demo's ceiling (a resonance
 * of 20 dB peaks about 3 dB over -7 dBFS there), so the output comes down as
 * they rise: 0.45 dB per dB of resonance above 11, and 1.8 dB per step of Q
 * below 2 on the boost. Worked out from every cutoff and Q on the loop. The
 * synth never comes near the ceiling, so it plays untrimmed.
 */
function realTrim(type: FilterKind, q: number): number {
    const db = type === 'peaking' ? -Math.max(0, 2 - q) * 1.8 : -Math.max(0, q - 11) * 0.45;
    return 10 ** (db / 20);
}

/** A bright chord and noise through one filter, with the spectrum drawn live. */
export function FilterDemo({ initial = 'lowpass', types = ['lowpass', 'highpass', 'peaking'] }: { initial?: FilterKind; types?: FilterKind[] }) {
    const [type, setType] = useState<FilterKind>(initial);
    const [freq, setFreq] = useState(initial === 'peaking' ? 1200 : 900);
    const [q, setQ] = useState(initial === 'peaking' ? 8 : 4);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const source = useSource('late-train-home');
    const fed = source.loop;
    const nodes = useRef<{ ctx: AudioContext; filter: BiquadFilterNode; safe: GainNode; feed: Feed; real: boolean } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.gain.value = FILTER_OUT;
        master.connect(out);
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.Q.value = q;
        filter.gain.value = 12;
        const safe = ctx.createGain();
        safe.gain.value = fed ? realTrim(type, q) : 1;
        const an = ctx.createAnalyser();
        an.fftSize = SPECTRUM_FFT;
        an.smoothingTimeConstant = 0.8;
        filter.connect(safe).connect(master);
        safe.connect(an);
        const feed = startFeed(
            ctx,
            filter,
            (into) => {
                // A soft bed of noise so the filter shape shows across the whole range.
                const noise = ctx.createBufferSource();
                noise.buffer = noiseBuffer(ctx);
                noise.loop = true;
                const noiseGain = ctx.createGain();
                noiseGain.gain.value = 0.05;
                noise.connect(noiseGain).connect(into);
                noise.start();
                const chords = [
                    [45, 57, 60, 64],
                    [41, 53, 57, 60],
                ];
                const seq = sequence(ctx, 100, 16, (step, time, dur) => {
                    const chord = chords[step < 8 ? 0 : 1];
                    if (step % 2 === 0) for (const n of chord) pluck(ctx, into, time, midi(n + 12), dur * 1.8, 0.8);
                    if (step % 4 === 0) kick(ctx, into, time, 0.5);
                    if (step % 2 === 1) hat(ctx, into, time, 0.25);
                });
                return () => {
                    seq.stop();
                    noise.stop();
                };
            },
            fed,
            (loop) => loopGain(loop, FILTER_REAL_IN),
        );
        nodes.current = { ctx, filter, safe, feed, real: fed !== null };
        setAnalyser(an);
        return () => {
            feed.stop();
            nodes.current = null;
            setAnalyser(null);
            fadeOut(ctx, master);
        };
    }, source.pick === 'synth' || fed !== null);

    const live = useRef({ type, q });
    useEffect(() => {
        live.current = { type, q };
    });
    useEffect(() => {
        const n = nodes.current;
        if (!n) return;
        n.feed.use(fed);
        n.real = fed !== null;
        n.safe.gain.setTargetAtTime(fed ? realTrim(live.current.type, live.current.q) : 1, n.ctx.currentTime, 0.02);
    }, [fed]);

    const set = (patch: { type?: FilterKind; freq?: number; q?: number }) => {
        if (patch.type) setType(patch.type);
        if (patch.freq) setFreq(patch.freq);
        if (patch.q) setQ(patch.q);
        const n = nodes.current;
        if (!n) return;
        if (patch.type) n.filter.type = patch.type;
        if (patch.freq) n.filter.frequency.setTargetAtTime(patch.freq, n.ctx.currentTime, 0.02);
        if (patch.q) n.filter.Q.setTargetAtTime(patch.q, n.ctx.currentTime, 0.02);
        if (patch.type || patch.q) n.safe.gain.setTargetAtTime(n.real ? realTrim(patch.type ?? type, patch.q ?? q) : 1, n.ctx.currentTime, 0.02);
    };

    const names: Record<FilterKind, string> = { lowpass: 'Low-pass', highpass: 'High-pass', peaking: 'Narrow boost' };
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} waiting={player.waiting} onClick={player.toggle} />
                {types.length > 1 ? (
                    <Segmented label="Filter type" value={type} onChange={(v) => set({ type: v })} options={types.map((t) => ({ value: t, label: names[t] }))} />
                ) : null}
            </div>
            <SourceChoice source={source} loading={source.pick === 'real' && !fed} />
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
        leadAn.fftSize = padAn.fftSize = SPECTRUM_FFT;
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

type SatKind = 'off' | 'soft' | 'hard';

/** What the shaper does to one sample at a gain of `k` (a WaveShaperNode holds its input to ±1 first). */
function shape(kind: 'soft' | 'hard', k: number, x: number): number {
    const v = (x > 1 ? 1 : x < -1 ? -1 : x) * k;
    return kind === 'soft' ? Math.tanh(v) : v > 1 ? 1 : v < -1 ? -1 : v;
}

function shaperCurve(kind: 'soft' | 'hard', drive: number): Float32Array<ArrayBuffer> {
    const n = 2048;
    const curve = new Float32Array(n);
    const k = 10 ** (drive / 20);
    for (let i = 0; i < n; i++) curve[i] = shape(kind, k, (i / (n - 1)) * 2 - 1);
    return curve;
}

/** The real mix goes into the saturation demo at this loudness, so the clean path plays at the house loudness. */
const SAT_REAL_IN = -11.3;
/** The demo's input gain, ahead of the shaper. */
const SAT_IN = 0.8;
const SAT_BPM = 92;
/** The samples each of the synth's level readings covers (its analysers' fftSize). */
const SAT_BLOCK = 2048;
const clampGain = (g: number) => Math.min(4, Math.max(0.05, g));

/** One step of the synth loop: bass, chords and a snare. The demo plays it live, and once offline for the estimate below. */
function satStep(ctx: BaseAudioContext, into: AudioNode, step: number, time: number, dur: number) {
    if (step === 0) bass(ctx, into, time, midi(33), dur * 6, 0.9);
    if (step === 8) bass(ctx, into, time, midi(36), dur * 6, 0.9);
    if (step % 4 === 2) for (const n of [57, 60, 64]) pluck(ctx, into, time, midi(n), dur * 2, 0.7);
    if (step === 4 || step === 12) snare(ctx, into, time, 0.6);
}

let satBarJob: Promise<Float32Array> | null = null;
/** The bar below once it is rendered, for the moments that cannot wait for a promise (a slider step). */
let satBar: Float32Array | null = null;

/**
 * One bar of the synth loop as it reaches the shaper, rendered offline once
 * per page while it is idle: the second of two bars, so the first one's tails
 * ring into it as they do while the loop repeats. The synth is mono.
 */
function prepareSatBar(): Promise<Float32Array> {
    satBarJob ??= (async () => {
        const rate = 48000;
        const step = 60 / SAT_BPM / 4;
        const bar = Math.round(16 * step * rate);
        const ctx = new OfflineAudioContext(1, bar * 2, rate);
        const into = ctx.createGain();
        into.gain.value = SAT_IN;
        into.connect(ctx.destination);
        await scheduleSteps(32, (s) => satStep(ctx, into, s % 16, s * step, step));
        const out = await ctx.startRendering();
        satBar = out.getChannelData(0).slice(bar);
        return satBar;
    })().catch((error: unknown) => {
        satBarJob = null;
        throw error;
    });
    return satBarJob;
}

/** Every this many samples of the bar are read: the curve has no memory, so they give the same levels at a quarter of the work. */
const SAT_STRIDE = 4;

/**
 * The mean RMS of SAT_BLOCK-sample blocks taken round the bar (as a loop, one
 * starting every 256 samples), clean or through a curve: what the synth's
 * running level readings average to while it plays.
 */
function blockRms(bar: Float32Array, kind?: 'soft' | 'hard', drive = 0): number {
    const n = Math.floor(bar.length / SAT_STRIDE);
    const block = SAT_BLOCK / SAT_STRIDE;
    const k = 10 ** (drive / 20);
    // Running sums of the squares, so a block costs two lookups.
    const sums = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) {
        const x = bar[i * SAT_STRIDE];
        const v = kind ? shape(kind, k, x) : x;
        sums[i + 1] = sums[i] + v * v;
    }
    let sum = 0;
    let count = 0;
    for (let a = 0; a < n; a += 256 / SAT_STRIDE) {
        const b = a + block;
        const power = b <= n ? sums[b] - sums[a] : sums[n] - sums[a] + sums[b - n];
        sum += Math.sqrt(Math.max(0, power) / block);
        count++;
    }
    return sum / count;
}

const synthGains = new Map<string, number>();

/** The matching gain the synth's level follower settles on at a setting, worked out from the bar once per setting (about a millisecond). */
function synthGain(bar: Float32Array, kind: 'soft' | 'hard', drive: number): number {
    let clean = synthGains.get('clean');
    if (clean === undefined) {
        clean = blockRms(bar);
        synthGains.set('clean', clean);
    }
    const key = `${kind}|${drive}`;
    let g = synthGains.get(key);
    if (g === undefined) {
        const wet = blockRms(bar, kind, drive);
        g = wet > 1e-6 ? clampGain(clean / wet) : 1;
        synthGains.set(key, g);
    }
    return g;
}

interface SatMatch {
    real: RealLoop;
    /** The setting it was measured at. */
    kind: SatKind;
    drive: number;
    /** Gain after the shaper that plays it at the clean loop's loudness. */
    gain: number;
}

const satDry = new WeakMap<RealLoop, Promise<number>>();

/** Matches already measured on this page, by setting (ui.tsx useAnalysis); the synth's is null (it matches as it plays). */
const satResults = new Map<string, SatMatch | null>();

/** K-weighted power of the clean real loop as it reaches the shaper, over the two bars a setting is measured on (realmix.tsx matchPart), once per loop. */
function satDryPower(loop: RealLoop): Promise<number> {
    let job = satDry.get(loop);
    if (!job) {
        job = (async () => {
            // Those two bars and their run-in only, as a setting is measured: a quarter of the whole loop's render.
            const r = await renderLoop(loop, { gain: loopGain(loop, SAT_REAL_IN) * SAT_IN, taps: 1, weighted: 1, weightedOnly: true, part: matchPart(loop), runIn: MATCH_RUN_IN }, (_, src, [tap]) =>
                src.connect(tap),
            );
            const [from, to] = r.span();
            return stereoPower(r.k[0], from, to);
        })();
        job.catch(() => satDry.delete(loop));
        satDry.set(loop, job);
    }
    return job;
}

/**
 * On the real mix the matching is measured, not followed: two bars of the
 * loop that stand in for the whole of it (realmix.tsx matchPart) through the
 * shaper, offline, against the same bars clean, both K-weighted. One fixed
 * gain per setting, so the mix does not breathe with a running level match.
 * A new setting is heard at once with an estimate of its gain (realGuess)
 * until its own lands.
 */
async function matchSatReal(loop: RealLoop, kind: SatKind, drive: number): Promise<SatMatch> {
    if (kind === 'off') return { real: loop, kind, drive, gain: 1 };
    const dry = await satDryPower(loop);
    const r = await renderLoop(loop, { gain: loopGain(loop, SAT_REAL_IN) * SAT_IN, taps: 1, weighted: 1, weightedOnly: true, part: matchPart(loop), runIn: MATCH_RUN_IN }, (ctx, src, [tap]) => {
        const shaper = ctx.createWaveShaper();
        shaper.curve = shaperCurve(kind, drive);
        shaper.oversample = '4x';
        src.connect(shaper).connect(tap);
    });
    const [from, to] = r.span();
    const wet = await stereoPower(r.k[0], from, to);
    return { real: loop, kind, drive, gain: wet > 0 ? clampGain(Math.sqrt(dry / wet)) : 1 };
}

const realGains = new WeakMap<RealLoop, Map<string, number>>();

/**
 * How far a curve turns the real loop's measured bars up, as the gain that
 * undoes it: unweighted power, clean against shaped, over every eighth sample
 * (the curve has no memory, so 40,000 of them give the same power), about a
 * millisecond per setting.
 */
function realGain(loop: RealLoop, kind: 'soft' | 'hard', drive: number): number {
    let byKey = realGains.get(loop);
    if (!byKey) {
        byKey = new Map();
        realGains.set(loop, byKey);
    }
    const key = `${kind}|${drive}`;
    let g = byKey.get(key);
    if (g === undefined) {
        const { buffer } = loop;
        const part = matchPart(loop);
        const from = Math.floor((loop.start + part.from) * buffer.sampleRate);
        const to = Math.min(buffer.length, from + Math.round(part.seconds * buffer.sampleRate));
        const k = 10 ** (drive / 20);
        const level = loopGain(loop, SAT_REAL_IN) * SAT_IN;
        let clean = 0;
        let wet = 0;
        for (let c = 0; c < Math.min(2, buffer.numberOfChannels); c++) {
            const x = buffer.getChannelData(c);
            for (let i = from; i < to; i += 8) {
                const v = x[i] * level;
                const y = shape(kind, k, v);
                clean += v * v;
                wet += y * y;
            }
        }
        g = wet > 0 ? Math.sqrt(clean / wet) : 1;
        byKey.set(key, g);
    }
    return g;
}

/**
 * The gain a setting plays the real mix with until its own is measured: the
 * last measured setting's, moved by as much as the two curves' estimates
 * differ (realGain), which takes the K-weighting's share out of the estimate.
 */
function realGuess(sat: SatMatch, kind: SatKind, drive: number): number {
    if (kind === 'off' || (sat.kind === kind && sat.drive === drive)) return sat.gain;
    const now = realGain(sat.real, kind, drive);
    return clampGain(sat.kind === 'off' ? now : (sat.gain * now) / realGain(sat.real, sat.kind, sat.drive));
}

/** Bass and chords through a waveshaper, level-matched so you hear harmonics, not volume. */
export function SaturationDemo() {
    const [drive, setDrive] = useState(12);
    const [kind, setKind] = useState<SatKind>('soft');
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [gr, setGr] = useState(0);
    const source = useSource('chrome-teeth');
    const real = source.loop;
    const sat = useAnalysis(real ? `real|${kind}|${drive}` : 'synth', () => (real ? matchSatReal(real, kind, drive) : Promise.resolve(null)), satResults);
    // The real mix goes live with its first measured match; the synth is matched as it plays.
    const fed = sat?.real ?? null;
    const loading = source.pick === 'real' && (!real || fed !== real);
    const nodes = useRef<{
        ctx: AudioContext;
        shaper: WaveShaperNode;
        dry: GainNode;
        wet: GainNode;
        matched: GainNode;
        feed: Feed;
        real: { current: boolean };
        retune: (kind: 'soft' | 'hard', drive: number, sat: SatMatch | null) => (() => void) | null;
    } | null>(null);
    // The setting now heard, for a bar that is rendered after Play.
    const live = useRef({ kind, drive });

    // The synth's bar is rendered while the page is idle, so Play and the first slider step already have it.
    useEffect(
        () =>
            whenIdle(() => {
                void prepareSatBar()
                    .then((bar) => synthGain(bar, 'soft', 12))
                    .catch(() => {});
            }),
        [],
    );

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const src = ctx.createGain();
        src.gain.value = SAT_IN;
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const curveKind = kind === 'hard' ? 'hard' : 'soft';
        const shaper = ctx.createWaveShaper();
        shaper.curve = shaperCurve(curveKind, drive);
        shaper.oversample = '4x';
        const matched = ctx.createGain();
        const pre = ctx.createAnalyser();
        const post = ctx.createAnalyser();
        pre.fftSize = post.fftSize = SAT_BLOCK;
        const an = ctx.createAnalyser();
        an.fftSize = SPECTRUM_FFT;
        src.connect(pre);
        src.connect(dry).connect(master);
        src.connect(shaper).connect(post);
        shaper.connect(matched).connect(wet).connect(master);
        master.connect(an);
        dry.gain.value = kind === 'off' ? 1 : 0;
        wet.gain.value = kind === 'off' ? 0 : 1;
        const isReal = { current: fed !== null };
        // The synth's running level readings, before and after the shaper.
        let sa = 0;
        let sb = 0;
        // The follower leaves the gain alone until `hold` (its readings are still too few, or the last
        // curve's), and its after-shaper reading until `fresh` (its block still holds the last curve).
        let hold = 0;
        let fresh = 0;
        // A new curve's matching gain at once, from the estimate: a lower gain lands with the curve, a higher one
        // rises over 10 ms just after it, so the switch never plays louder than either setting for a moment.
        // On the synth the follower goes on from it: its after-shaper reading becomes the one the estimate implies.
        const seed = (g: number, follow: boolean) => {
            const t = ctx.currentTime;
            if (g < matched.gain.value) {
                matched.gain.cancelScheduledValues(t);
                matched.gain.setValueAtTime(g, t);
            } else matched.gain.setTargetAtTime(g, t + 0.01, 0.003);
            if (!follow) return;
            if (sa > 0) sb = sa / g;
            hold = fresh = t + 0.05;
            setGr(20 * Math.log10(1 / g));
        };
        // Works the estimate out now (a few ms, more on a slow phone) and returns the step that applies it, so the
        // caller can hand the new curve and its gain to the audio thread together.
        const retune = (k: 'soft' | 'hard', d: number, measured: SatMatch | null) => {
            if (isReal.current) {
                if (!measured) return null;
                const g = realGuess(measured, k, d);
                return () => seed(g, false);
            }
            if (!satBar) return null;
            const g = synthGain(satBar, k, d);
            return () => seed(g, true);
        };
        if (sat) matched.gain.value = realGuess(sat, kind, drive);
        else if (satBar) {
            const g = synthGain(satBar, curveKind, drive);
            matched.gain.value = g;
            setGr(20 * Math.log10(1 / g));
            // A few readings in, the follower takes over from the estimate.
            hold = ctx.currentTime + 0.6;
        } else
            void prepareSatBar()
                .then(() => {
                    const now = live.current;
                    if (nodes.current?.matched === matched && now.kind !== 'off') retune(now.kind, now.drive, null)?.();
                })
                .catch(() => {});
        const feed = startFeed(
            ctx,
            src,
            (into) => {
                const seq = sequence(ctx, SAT_BPM, 16, (step, time, dur) => satStep(ctx, into, step, time, dur));
                return () => seq.stop();
            },
            fed,
            (loop) => loopGain(loop, SAT_REAL_IN),
        );
        nodes.current = { ctx, shaper, dry, wet, matched, feed, real: isReal, retune };
        setAnalyser(an);
        const a = new Float32Array(SAT_BLOCK);
        const b = new Float32Array(SAT_BLOCK);
        const timer = window.setInterval(() => {
            const t = ctx.currentTime;
            sa = sa * 0.85 + rms(pre, a) * 0.15;
            if (t < fresh) return;
            sb = sb * 0.85 + rms(post, b) * 0.15;
            // The real mix plays with its measured match instead (below).
            if (sb > 1e-4 && !isReal.current && t >= hold) {
                const g = clampGain(sa / sb);
                matched.gain.setTargetAtTime(g, t, 0.2);
                setGr(20 * Math.log10(1 / g));
            }
        }, 60);
        return () => {
            feed.stop();
            window.clearInterval(timer);
            nodes.current = null;
            setAnalyser(null);
            fadeOut(ctx, master);
        };
    }, !loading);

    // A measured match goes live with its setting, and a switch of source with its first one. Clean has no
    // match of its own: the shaped path is silent there and keeps the gain it has.
    useEffect(() => {
        const n = nodes.current;
        if (!n) return;
        n.feed.use(sat?.real ?? null);
        n.real.current = sat !== null;
        if (sat && sat.kind !== 'off') n.matched.gain.setTargetAtTime(sat.gain, n.ctx.currentTime, 0.01);
    }, [sat]);
    const shownGr = sat && sat.kind !== 'off' ? 20 * Math.log10(1 / sat.gain) : gr;

    const apply = (next: { drive?: number; kind?: SatKind }) => {
        const d = next.drive ?? drive;
        const k = next.kind ?? kind;
        if (next.drive !== undefined) setDrive(d);
        if (next.kind) setKind(k);
        live.current = { kind: k, drive: d };
        const n = nodes.current;
        if (!n) return;
        if (k !== 'off') {
            const curveKind = k === 'hard' ? 'hard' : 'soft';
            // The new curve's matching gain with it, so a jump or a drag never plays louder (or quieter) while the
            // follower or the measurement catches up. Both are worked out first, then go to the audio thread together.
            const curve = shaperCurve(curveKind, d);
            const match = n.retune(curveKind, d, sat);
            n.shaper.curve = curve;
            match?.();
        }
        n.dry.gain.setTargetAtTime(k === 'off' ? 1 : 0, n.ctx.currentTime, 0.015);
        n.wet.gain.setTargetAtTime(k === 'off' ? 0 : 1, n.ctx.currentTime, 0.015);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} waiting={player.waiting} onClick={player.toggle} />
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
            <SourceChoice source={source} loading={loading} />
            <Spectrum analyser={analyser} active={player.playing} label="Live spectrum of the output, from 20 Hz to 20 kHz. Saturation adds harmonics that fill in the space above the notes." />
            <Slider label="Drive" value={drive} min={0} max={30} onChange={(v) => apply({ drive: v })} format={(v) => `${v} dB`} />
            <Meter label="Level-matching turned the output down by" value={Math.max(0, shownGr) / 24} text={`${Math.max(0, shownGr).toFixed(1)} dB`} />
        </div>
    );
}
