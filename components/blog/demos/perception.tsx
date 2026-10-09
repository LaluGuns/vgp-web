'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { bass, fadeOut, hat, kick, midi, noiseBuffer, pluck, sequence, snare, type Engine } from './engine';
import { Meter, PlayButton, Segmented, Slider, useFrame, usePlayer } from './ui';

// ── Small helpers ───────────────────────────────────────────────────

const ACCENT = '#7dd3fc';
const dbToGain = (db: number) => 10 ** (db / 20);
const powerDb = (p: number) => (p > 1e-12 ? 10 * Math.log10(p) : -120);

function fmtDb(db: number, digits = 1): string {
    const v = Math.abs(db) < 0.5 * 10 ** -digits ? 0 : db;
    return `${v > 0 ? '+' : ''}${v.toFixed(digits)} dB`;
}

function meanSquare(buf: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return sum / buf.length;
}

function gainNode(ctx: BaseAudioContext, value = 1): GainNode {
    const g = ctx.createGain();
    g.gain.value = value;
    return g;
}

/** A visible label above a control that has none of its own. */
function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <p className="mb-2 text-sm font-medium text-white/85">{label}</p>
            {children}
        </div>
    );
}

/** Sizes a canvas for the screen and returns a context that draws in CSS pixels. */
function canvas2d(c: HTMLCanvasElement | null): { g: CanvasRenderingContext2D; w: number; h: number } | null {
    if (!c) return null;
    const g = c.getContext('2d');
    if (!g) return null;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    const h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    return { g, w, h };
}

/** K-weighting from ITU-R BS.1770: a rough model of how loud a signal sounds. */
function kWeighted(ctx: BaseAudioContext, input: AudioNode): AudioNode {
    const shelf = ctx.createBiquadFilter();
    shelf.type = 'highshelf';
    shelf.frequency.value = 1681.97;
    shelf.gain.value = 4;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 38.13;
    hp.Q.value = 0.5;
    input.connect(shelf).connect(hp);
    return hp;
}

// ── A vocal-like voice ──────────────────────────────────────────────

type Vowel = 'a' | 'e' | 'i' | 'o' | 'u';

// Rough first three formants of sung vowels, in Hz.
const VOWELS: Record<Vowel, [number, number, number]> = {
    a: [750, 1200, 2800],
    e: [480, 1850, 2600],
    i: [310, 2250, 3000],
    o: [480, 850, 2600],
    u: [340, 750, 2400],
};
const FORMANT_WIDTH = [110, 130, 180];
const FORMANT_LEVEL = [1, 0.6, 0.32];

interface Syllable {
    /** 16th step the syllable starts on. */
    at: number;
    /** Length in 16ths. */
    len: number;
    note: number;
    vowel: Vowel;
    /** Vowel to glide to over the note. */
    to?: Vowel;
    consonant?: 's' | 't';
}

/**
 * One sung syllable: a saw with a small scoop and vibrato, shaped by three
 * band-pass formants so it reads as a vowel.
 */
function sing(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, dur: number, vowel: Vowel, level = 1, to?: Vowel) {
    const end = t + dur;
    const src = ctx.createOscillator();
    src.type = 'sawtooth';
    src.frequency.value = freq;
    src.detune.setValueAtTime(-35, t);
    src.detune.linearRampToValueAtTime(0, t + 0.07);
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.2;
    const vibDepth = ctx.createGain();
    vibDepth.gain.setValueAtTime(0, t);
    vibDepth.gain.linearRampToValueAtTime(dur > 0.4 ? 22 : 8, t + Math.min(dur, 0.5));
    vib.connect(vibDepth).connect(src.detune);

    const env = ctx.createGain();
    const peak = Math.max(0.0002, level);
    const attack = 0.04;
    const fall = Math.min(0.09, dur * 0.4);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(peak, t + attack);
    env.gain.setValueAtTime(peak, Math.max(t + attack, end - fall));
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    env.connect(dest);

    // A little of the raw source for body, then the three formants.
    const body = ctx.createBiquadFilter();
    body.type = 'lowpass';
    body.frequency.value = 700;
    src.connect(body).connect(gainNode(ctx, 0.12)).connect(env);
    const from = VOWELS[vowel];
    const goal = VOWELS[to ?? vowel];
    for (let i = 0; i < 3; i++) {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.value = from[i] / FORMANT_WIDTH[i];
        bp.frequency.setValueAtTime(from[i], t);
        if (to) bp.frequency.linearRampToValueAtTime(goal[i], end);
        src.connect(bp).connect(gainNode(ctx, FORMANT_LEVEL[i] * 3)).connect(env);
    }
    src.start(t);
    vib.start(t);
    src.stop(end + 0.02);
    vib.stop(end + 0.02);
}

/** A short burst of filtered noise in front of a syllable: an "s" or a "t". */
function consonant(ctx: BaseAudioContext, dest: AudioNode, t: number, kind: 's' | 't', level = 1) {
    const sibilant = kind === 's';
    const start = Math.max(ctx.currentTime, t - (sibilant ? 0.06 : 0.012));
    const len = sibilant ? 0.08 : 0.025;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    const f = ctx.createBiquadFilter();
    f.type = sibilant ? 'highpass' : 'bandpass';
    f.frequency.value = sibilant ? 5500 : 3200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime((sibilant ? 0.07 : 0.16) * level, start + (sibilant ? 0.03 : 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, start + len);
    src.connect(f).connect(g).connect(dest);
    src.start(start, Math.random() * 1.5, len + 0.02);
}

// ── The short stereo mix shared by the width and monitor-level demos ──

/** A pad whose left and right sides are detuned differently, so the channels never quite match. */
function stereoPad(ctx: BaseAudioContext, left: AudioNode, right: AudioNode, t: number, notes: number[], dur: number, level = 1) {
    const sides: [AudioNode, number[], number][] = [
        [left, [-12, 5], 1500],
        [right, [-5, 12], 1900],
    ];
    for (const [dest, detunes, cutoff] of sides) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = cutoff;
        const g = ctx.createGain();
        const peak = 0.06 * level;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.3);
        g.gain.setValueAtTime(peak, t + dur - 0.25);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
        lp.connect(g).connect(dest);
        for (const n of notes) {
            for (const d of detunes) {
                const osc = ctx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.value = midi(n);
                osc.detune.value = d;
                osc.connect(lp);
                osc.start(t);
                osc.stop(t + dur + 0.15);
            }
        }
    }
}

interface MixBus {
    /** Plays equally on both sides. */
    center: GainNode;
    left: GainNode;
    right: GainNode;
    /** Mostly left or mostly right, for the arpeggio. */
    leanLeft: GainNode;
    leanRight: GainNode;
    /** The finished left and right channels. */
    l: GainNode;
    r: GainNode;
}

// Keeps the mix at the loudness of the other demos on the site.
const MIX_TRIM = 0.5;

function mixBus(ctx: BaseAudioContext): MixBus {
    const bus: MixBus = {
        center: gainNode(ctx),
        left: gainNode(ctx),
        right: gainNode(ctx),
        leanLeft: gainNode(ctx),
        leanRight: gainNode(ctx),
        l: gainNode(ctx, MIX_TRIM),
        r: gainNode(ctx, MIX_TRIM),
    };
    bus.center.connect(bus.l);
    bus.center.connect(bus.r);
    bus.left.connect(bus.l);
    bus.right.connect(bus.r);
    const lean = (from: GainNode, near: GainNode, far: GainNode) => {
        from.connect(gainNode(ctx, 0.9)).connect(near);
        from.connect(gainNode(ctx, 0.3)).connect(far);
    };
    lean(bus.leanLeft, bus.left, bus.right);
    lean(bus.leanRight, bus.right, bus.left);
    return bus;
}

const MIX_BPM = 94;
const MIX_STEPS = 32;
// Dm9, then Bbmaj9 over the bass.
const MIX_PAD = [
    [53, 57, 60, 64],
    [53, 57, 60, 62],
];
const MIX_BASS = [38, 34];
const MIX_ARP = [74, 77, 81, 76, 74, 77, 84, 81, 74, 77, 81, 72, 70, 74, 77, 81];
const MIX_VOICE: Syllable[] = [
    { at: 0, len: 3, note: 69, vowel: 'a' },
    { at: 4, len: 2, note: 72, vowel: 'o' },
    { at: 6, len: 2, note: 74, vowel: 'e' },
    { at: 8, len: 4, note: 72, vowel: 'a', to: 'i' },
    { at: 13, len: 2, note: 69, vowel: 'o' },
    { at: 16, len: 4, note: 65, vowel: 'o', to: 'a' },
    { at: 20, len: 2, note: 62, vowel: 'a' },
    { at: 22, len: 2, note: 65, vowel: 'e' },
    { at: 24, len: 6, note: 69, vowel: 'a', to: 'o' },
];
const MIX_VOICE_LEVEL = 0.75;

/** Kick, snare, hats, bass and voice in the middle; a pad and an arpeggio that differ left to right. */
function playMixStep(ctx: BaseAudioContext, bus: MixBus, step: number, time: number, stepDur: number) {
    const bar = step < 16 ? 0 : 1;
    const s = step % 16;
    if (s === 0 || s === 8) kick(ctx, bus.center, time, 0.8);
    if (s === 11) kick(ctx, bus.center, time, 0.5);
    if (s === 4 || s === 12) snare(ctx, bus.center, time, 0.42);
    hat(ctx, bus.center, time, s % 2 === 0 ? 0.3 : 0.13);
    if (s === 0) {
        bass(ctx, bus.center, time, midi(MIX_BASS[bar]), stepDur * 9.5, 0.6);
        bass(ctx, bus.center, time, midi(MIX_BASS[bar] + 12), stepDur * 9.5, 0.1);
        stereoPad(ctx, bus.left, bus.right, time, MIX_PAD[bar], stepDur * 16, 1);
    }
    if (s === 11) {
        bass(ctx, bus.center, time, midi(MIX_BASS[bar]), stepDur * 4.5, 0.55);
        bass(ctx, bus.center, time, midi(MIX_BASS[bar] + 12), stepDur * 4.5, 0.09);
    }
    if (step % 2 === 0) {
        const i = step / 2;
        pluck(ctx, i % 2 === 0 ? bus.leanLeft : bus.leanRight, time, midi(MIX_ARP[i]), stepDur * 1.6, 0.7);
    }
    for (const v of MIX_VOICE) if (v.at === step) sing(ctx, bus.center, time, midi(v.note), v.len * stepDur * 0.9, v.vowel, MIX_VOICE_LEVEL, v.to);
}

function encodeMidSide(ctx: BaseAudioContext, l: AudioNode, r: AudioNode): { mid: GainNode; side: GainNode } {
    const mid = gainNode(ctx, 0.5);
    const side = gainNode(ctx, 0.5);
    l.connect(mid);
    r.connect(mid);
    l.connect(side);
    r.connect(gainNode(ctx, -1)).connect(side);
    return { mid, side };
}

interface MidSidePower {
    mid: number;
    side: number;
}

/** K-weighted power of the mix's mid and side, rendered offline from the same notes. */
async function measureMidSide(sampleRate: number): Promise<MidSidePower> {
    const stepDur = 60 / MIX_BPM / 4;
    const seconds = stepDur * MIX_STEPS + 0.5;
    const ctx = new OfflineAudioContext(2, Math.ceil(seconds * sampleRate), sampleRate);
    const bus = mixBus(ctx);
    const { mid, side } = encodeMidSide(ctx, bus.l, bus.r);
    const merger = ctx.createChannelMerger(2);
    kWeighted(ctx, mid).connect(merger, 0, 0);
    kWeighted(ctx, side).connect(merger, 0, 1);
    merger.connect(ctx.destination);
    for (let step = 0; step < MIX_STEPS; step++) playMixStep(ctx, bus, step, 0.05 + step * stepDur, stepDur);
    const buffer = await ctx.startRendering();
    return { mid: meanSquare(buffer.getChannelData(0)), side: meanSquare(buffer.getChannelData(1)) };
}

// ── Width ───────────────────────────────────────────────────────────

const SIDE_OFF = -24;
const sideGain = (db: number) => (db <= SIDE_OFF ? 0 : dbToGain(db));

/**
 * Total stereo loudness is the sum of mid and side power (the cross terms
 * cancel), so the gain that keeps it steady follows from the two powers.
 */
function matchGain(midDb: number, sideDb: number, ms: MidSidePower | null): number {
    if (!ms) return 1;
    const gm = dbToGain(midDb);
    const gs = sideGain(sideDb);
    const now = gm * gm * ms.mid + gs * gs * ms.side;
    if (now <= 0) return 1;
    return Math.min(4, Math.max(0.25, Math.sqrt((ms.mid + ms.side) / now)));
}

interface WidthSettings {
    sideDb: number;
    midDb: number;
    mono: boolean;
    matched: boolean;
    ms: MidSidePower | null;
}

interface WidthNodes {
    ctx: AudioContext;
    mid: GainNode;
    side: GainNode;
    straight: GainNode[];
    cross: GainNode[];
    match: GainNode[];
    anL: AnalyserNode;
    anR: AnalyserNode;
    bufL: Float32Array<ArrayBuffer>;
    bufR: Float32Array<ArrayBuffer>;
}

function applyWidth(n: WidthNodes, s: WidthSettings) {
    const t = n.ctx.currentTime;
    n.mid.gain.setTargetAtTime(dbToGain(s.midDb), t, 0.03);
    n.side.gain.setTargetAtTime(sideGain(s.sideDb), t, 0.03);
    // Mono: each output carries half of left plus half of right.
    const cross = s.mono ? 0.5 : 0;
    for (const g of n.straight) g.gain.setTargetAtTime(1 - cross, t, 0.01);
    for (const g of n.cross) g.gain.setTargetAtTime(cross, t, 0.01);
    const match = s.matched ? matchGain(s.midDb, s.sideDb, s.ms) : 1;
    for (const g of n.match) g.gain.setTargetAtTime(match, t, 0.05);
}

function drawScope(c: HTMLCanvasElement | null, l: Float32Array, r: Float32Array, scale: number) {
    const s = canvas2d(c);
    if (!s) return;
    const { g, w, h } = s;
    const cx = w / 2;
    const cy = h / 2;
    const rad = Math.min(w, h) / 2 - 2;
    const d = rad * Math.SQRT1_2;
    g.strokeStyle = 'rgba(255,255,255,0.1)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx, cy - rad);
    g.lineTo(cx, cy + rad);
    g.moveTo(cx - rad, cy);
    g.lineTo(cx + rad, cy);
    g.moveTo(cx - d, cy - d);
    g.lineTo(cx + d, cy + d);
    g.moveTo(cx + d, cy - d);
    g.lineTo(cx - d, cy + d);
    g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.font = '11px system-ui, sans-serif';
    g.fillText('L', 5, 13);
    g.fillText('R', w - 12, 13);
    g.fillText('M', cx + 4, 12);
    if (scale <= 0) return;
    // Mid goes up, side goes across: mono is a vertical line, wide is a broad cloud.
    const k = (rad * 0.8) / scale;
    g.fillStyle = 'rgba(125,211,252,0.55)';
    for (let i = 0; i < l.length; i += 3) {
        const x = cx + (r[i] - l[i]) * k;
        const y = cy - (l[i] + r[i]) * k;
        g.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
    }
}

function CorrelationMeter({ value }: { value: number | null }) {
    const v = value ?? 0;
    const pos = ((v + 1) / 2) * 100;
    const from = Math.min(50, pos);
    const width = Math.abs(pos - 50);
    return (
        <div>
            <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-white/70">Phase correlation</span>
                <span className="tabular-nums text-white/85">{value === null ? '–' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}`}</span>
            </div>
            <div className="relative mt-2 h-2 rounded-full bg-white/[0.06]" aria-hidden="true">
                <span className="absolute inset-y-0 left-1/2 w-px bg-white/30" />
                {value === null ? null : (
                    <>
                        <span className="absolute inset-y-0 rounded-full bg-white/40" style={{ left: `${from}%`, width: `${width}%` }} />
                        <span className="absolute -inset-y-1 w-1 -translate-x-1/2 rounded-full bg-[var(--accent)]" style={{ left: `${pos}%` }} />
                    </>
                )}
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-white/55" aria-hidden="true">
                <span>-1 opposed</span>
                <span>0</span>
                <span>+1 mono</span>
            </div>
        </div>
    );
}

/**
 * A short mix split into mid and side. Raise the side level, fold to mono
 * and watch the correlation meter. The output is loudness-matched by
 * default, so wider cannot win just by being louder.
 */
export function WidthDemo() {
    const [sideDb, setSideDb] = useState(0);
    const [midDb, setMidDb] = useState(0);
    const [mono, setMono] = useState(false);
    const [matched, setMatched] = useState(true);
    const [ms, setMs] = useState<MidSidePower | null>(null);
    const [meters, setMeters] = useState<{ corr: number; mid: number; side: number } | null>(null);
    const scope = useRef<HTMLCanvasElement>(null);
    const nodes = useRef<WidthNodes | null>(null);
    const measuring = useRef(false);
    const smooth = useRef({ corr: 1, scale: 0 });
    const live = useRef<WidthSettings>({ sideDb, midDb, mono, matched, ms });
    useEffect(() => {
        live.current = { sideDb, midDb, mono, matched, ms };
        if (nodes.current) applyWidth(nodes.current, live.current);
    }, [sideDb, midDb, mono, matched, ms]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const bus = mixBus(ctx);
        const enc = encodeMidSide(ctx, bus.l, bus.r);
        const mid = gainNode(ctx, 1);
        const side = gainNode(ctx, 1);
        enc.mid.connect(mid);
        enc.side.connect(side);
        // Decode: left = mid + side, right = mid - side.
        const outL = gainNode(ctx);
        const outR = gainNode(ctx);
        mid.connect(outL);
        mid.connect(outR);
        side.connect(outL);
        side.connect(gainNode(ctx, -1)).connect(outR);
        // Stereo or folded to mono.
        const foldL = gainNode(ctx);
        const foldR = gainNode(ctx);
        const straight = [gainNode(ctx), gainNode(ctx)];
        const cross = [gainNode(ctx, 0), gainNode(ctx, 0)];
        outL.connect(straight[0]).connect(foldL);
        outR.connect(cross[0]).connect(foldL);
        outR.connect(straight[1]).connect(foldR);
        outL.connect(cross[1]).connect(foldR);
        const match = [gainNode(ctx), gainNode(ctx)];
        foldL.connect(match[0]);
        foldR.connect(match[1]);
        const merger = ctx.createChannelMerger(2);
        match[0].connect(merger, 0, 0);
        match[1].connect(merger, 0, 1);
        merger.connect(master);
        const anL = ctx.createAnalyser();
        const anR = ctx.createAnalyser();
        anL.fftSize = anR.fftSize = 4096;
        match[0].connect(anL);
        match[1].connect(anR);
        const n: WidthNodes = { ctx, mid, side, straight, cross, match, anL, anR, bufL: new Float32Array(4096), bufR: new Float32Array(4096) };
        nodes.current = n;
        applyWidth(n, live.current);
        smooth.current = { corr: 1, scale: 0 };

        if (!live.current.ms && !measuring.current) {
            measuring.current = true;
            void measureMidSide(ctx.sampleRate)
                .then(setMs)
                .finally(() => {
                    measuring.current = false;
                });
        }
        const seq = sequence(ctx, MIX_BPM, MIX_STEPS, (step, time, dur) => playMixStep(ctx, bus, step, time, dur));
        return () => {
            seq.stop();
            nodes.current = null;
            setMeters(null);
            drawScope(scope.current, n.bufL, n.bufR, 0);
            fadeOut(ctx, master);
        };
    });

    useFrame(player.playing, () => {
        const n = nodes.current;
        if (!n) return;
        n.anL.getFloatTimeDomainData(n.bufL);
        n.anR.getFloatTimeDomainData(n.bufR);
        const l = n.bufL;
        const r = n.bufR;
        let ll = 0;
        let rr = 0;
        let lr = 0;
        let peak = 0;
        for (let i = 0; i < l.length; i++) {
            ll += l[i] * l[i];
            rr += r[i] * r[i];
            lr += l[i] * r[i];
            peak = Math.max(peak, Math.abs(l[i] + r[i]), Math.abs(l[i] - r[i]));
        }
        const sm = smooth.current;
        // Correlation: +1 when both sides match, 0 when unrelated, -1 when opposed.
        if (ll > 1e-7 && rr > 1e-7) sm.corr = sm.corr * 0.6 + (lr / Math.sqrt(ll * rr)) * 0.4;
        sm.scale = Math.max(peak, sm.scale * 0.92, 1e-4);
        const len = l.length;
        setMeters({
            corr: Math.max(-1, Math.min(1, sm.corr)),
            mid: powerDb((ll + rr + 2 * lr) / (4 * len)),
            side: powerDb(Math.max(0, ll + rr - 2 * lr) / (4 * len)),
        });
        drawScope(scope.current, l, r, sm.scale);
    });

    const levelMeter = (db: number | undefined) => ({
        value: db === undefined ? 0 : (db + 60) / 54,
        text: db === undefined ? '–' : db < -70 ? 'Silent' : `${db.toFixed(1)} dB`,
    });
    const midMeter = levelMeter(meters?.mid);
    const sideMeter = levelMeter(meters?.side);
    const matchDb = 20 * Math.log10(matchGain(midDb, sideDb, ms));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <PlayButton playing={player.playing} onClick={player.toggle} />
                <Segmented
                    label="Playback"
                    value={mono ? 'mono' : 'stereo'}
                    onChange={(v) => setMono(v === 'mono')}
                    options={[
                        { value: 'stereo', label: 'Stereo' },
                        { value: 'mono', label: 'Mono' },
                    ]}
                />
            </div>
            <CorrelationMeter value={meters ? meters.corr : null} />
            <div>
                <div className="flex items-center gap-5">
                    <canvas ref={scope} aria-hidden="true" className="block h-28 w-28 shrink-0 rounded-[3px] bg-white/[0.035]" />
                    <div className="min-w-0 flex-1 space-y-4">
                        <Meter label="Mid level" value={midMeter.value} text={midMeter.text} />
                        <Meter label="Side level" value={sideMeter.value} text={sideMeter.text} />
                    </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/50">The square plots left against right. A vertical line is mono. The wider the cloud, the wider the image.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider
                    label="Side level"
                    value={sideDb}
                    min={SIDE_OFF}
                    max={6}
                    onChange={setSideDb}
                    format={(v) => (v <= SIDE_OFF ? 'Off' : fmtDb(v, 0))}
                    hint="0 dB is the mix as it was made. Off leaves only the middle."
                />
                <Slider label="Mid level" value={midDb} min={-12} max={0} onChange={setMidDb} format={(v) => fmtDb(v, 0)} />
            </div>
            <Field label="Loudness">
                <Segmented
                    label="Loudness"
                    value={matched ? 'matched' : 'raw'}
                    onChange={(v) => setMatched(v === 'matched')}
                    options={[
                        { value: 'matched', label: 'Matched' },
                        { value: 'raw', label: 'Not matched' },
                    ]}
                />
                <p className="mt-2 text-xs leading-5 text-white/50">
                    {matched
                        ? ms
                            ? `Matching changes the output by ${fmtDb(matchDb)} so the stereo mix stays at the same loudness.`
                            : 'Matching starts once the mix has been measured, a moment after you press play.'
                        : 'Raising the sides now also makes the mix louder, which can make wider seem better.'}
                </p>
            </Field>
            <p className="text-sm leading-6 text-white/60">
                Kick, bass, snare and voice sit in the middle. The pad and the arpeggio differ between left and right, so part of them lives in the sides. As the sides
                come up, the correlation falls toward 0 and the middle parts take a smaller share of the mix, so the voice and kick seem to sit further back. Switch to
                mono and the side signal is gone: whatever you added there disappears.
            </p>
        </div>
    );
}

// ── Monitor level ───────────────────────────────────────────────────

type LevelStep = 'quiet' | 'medium' | 'loud';
const STEP_DB: Record<LevelStep, number> = { quiet: -24, medium: -12, loud: 0 };
const BANDS = [
    { label: 'Bass, below 150 Hz', lo: 20, hi: 150 },
    { label: 'Middle, 150 Hz to 5 kHz', lo: 150, hi: 5000 },
    { label: 'Air, above 5 kHz', lo: 5000, hi: 16000 },
];

/**
 * The same mix at three playback levels, 12 dB apart. The band meters
 * show the balance of the signal never changes; only the level does.
 */
export function MonitorLevelDemo() {
    const [step, setStep] = useState<LevelStep>('loud');
    const [bands, setBands] = useState<number[] | null>(null);
    const nodes = useRef<{ ctx: AudioContext; level: GainNode; an: AnalyserNode; data: Float32Array<ArrayBuffer> } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const level = gainNode(ctx, dbToGain(STEP_DB[step]));
        const bus = mixBus(ctx);
        const merger = ctx.createChannelMerger(2);
        bus.l.connect(merger, 0, 0);
        bus.r.connect(merger, 0, 1);
        merger.connect(level).connect(master);
        const an = ctx.createAnalyser();
        an.fftSize = 4096;
        an.smoothingTimeConstant = 0.85;
        level.connect(an);
        nodes.current = { ctx, level, an, data: new Float32Array(an.frequencyBinCount) };
        const seq = sequence(ctx, MIX_BPM, MIX_STEPS, (s, time, dur) => playMixStep(ctx, bus, s, time, dur));
        return () => {
            seq.stop();
            nodes.current = null;
            setBands(null);
            fadeOut(ctx, master);
        };
    });

    useFrame(player.playing, () => {
        const n = nodes.current;
        if (!n) return;
        n.an.getFloatFrequencyData(n.data);
        const binHz = n.ctx.sampleRate / n.an.fftSize;
        setBands(
            BANDS.map(({ lo, hi }) => {
                let sum = 0;
                for (let i = Math.ceil(lo / binHz); i < Math.min(n.data.length, hi / binHz); i++) sum += 10 ** (n.data[i] / 10);
                return powerDb(sum);
            }),
        );
    });

    const choose = (next: LevelStep) => {
        setStep(next);
        const n = nodes.current;
        if (n) n.level.gain.setTargetAtTime(dbToGain(STEP_DB[next]), n.ctx.currentTime, 0.05);
    };

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <Field label="Playback level">
                <Segmented
                    label="Playback level"
                    value={step}
                    onChange={choose}
                    options={[
                        { value: 'quiet', label: 'Quiet, -24 dB' },
                        { value: 'medium', label: 'Medium, -12 dB' },
                        { value: 'loud', label: 'Loud, 0 dB' },
                    ]}
                />
            </Field>
            <div className="space-y-4">
                {BANDS.map((band, i) => {
                    const db = bands?.[i];
                    return (
                        <Meter
                            key={band.label}
                            label={band.label}
                            value={db === undefined ? 0 : (db + 90) / 70}
                            text={db === undefined ? '–' : db < -110 ? 'Silent' : `${db.toFixed(0)} dB`}
                        />
                    );
                })}
                <p className="text-xs leading-5 text-white/50">Measured from the signal after the level step. Each band drops by the same 12 dB per step.</p>
            </div>
            <p className="text-sm leading-6 text-white/60">
                This page cannot see your device volume, so the steps are relative to each other, and the loud step is no louder than the other demos here. Set a
                comfortable level on Loud first, then step down without touching your volume. On the quiet step, listen to the bass under the kick and the hats on
                top: many listeners hear them fade faster than the voice, even though the meters show the balance has not changed.
            </p>
        </div>
    );
}

// ── Reverb ducking ──────────────────────────────────────────────────

type FxMode = 'plain' | 'ducked' | 'delay';
type DelayNote = 'eighth' | 'dotted' | 'quarter';

const RD_BPM = 88;
const RD_STEPS = 32;
const REVERB_SECONDS = 3.4;
const DELAY_BEATS: Record<DelayNote, number> = { eighth: 0.5, dotted: 0.75, quarter: 1 };
const delaySeconds = (note: DelayNote) => (DELAY_BEATS[note] * 60) / RD_BPM;

// Two short lines with a gap after each, so a long tail runs into the next line.
const RD_PHRASE: Syllable[] = [
    { at: 0, len: 2, note: 64, vowel: 'a' },
    { at: 2, len: 1, note: 67, vowel: 'i', consonant: 't' },
    { at: 3, len: 3, note: 69, vowel: 'a' },
    { at: 7, len: 2, note: 67, vowel: 'o', consonant: 's' },
    { at: 9, len: 3, note: 64, vowel: 'e', to: 'i' },
    { at: 16, len: 2, note: 62, vowel: 'o' },
    { at: 18, len: 1, note: 64, vowel: 'a', consonant: 't' },
    { at: 19, len: 3, note: 67, vowel: 'e' },
    { at: 23, len: 2, note: 64, vowel: 'a', consonant: 's' },
    { at: 25, len: 3, note: 60, vowel: 'o', to: 'u' },
];
const RD_VOICE_LEVEL = 0.8;
const REVERB_LEVEL = 0.9;
const DELAY_LEVEL = 0.75;

/** A generated stereo hall: decaying noise that also loses its top end as it fades. */
function hallImpulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
    const sr = ctx.sampleRate;
    const length = Math.max(1, Math.floor(sr * seconds));
    const buf = ctx.createBuffer(2, length, sr);
    for (let c = 0; c < 2; c++) {
        const data = buf.getChannelData(c);
        let seed = 7 + c * 7919;
        let smooth = 0;
        for (let i = 0; i < length; i++) {
            seed = (seed * 16807) % 2147483647;
            const white = (seed / 2147483647) * 2 - 1;
            const x = i / length;
            smooth += (white - smooth) * (0.9 - 0.75 * x);
            // -60 dB at the end, with a 5 ms fade in.
            data[i] = smooth * Math.pow(10, -3 * x) * Math.min(1, i / (sr * 0.005));
        }
    }
    return buf;
}

/** One-pole low-pass coefficients with time constant `tau` seconds. */
function onePole(tau: number, sampleRate: number): { feedforward: number[]; feedback: number[] } {
    const a = Math.exp(-1 / (tau * sampleRate));
    return { feedforward: [1 - a], feedback: [1, -a] };
}

function curveOf(fn: (x: number) => number): Float32Array<ArrayBuffer> {
    const n = 2048;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) curve[i] = fn((i / (n - 1)) * 2 - 1);
    return curve;
}

// The follower's input scaling and the shape that turns level into "how ducked".
const FOLLOW_GAIN = 6;
const DUCK_CURVE = (x: number) => (x <= 0 ? 0 : Math.tanh(3 * x));

interface FxSettings {
    mode: FxMode;
    amount: number;
    depth: number;
    delayNote: DelayNote;
    feedback: number;
}

interface FxNodes {
    ctx: AudioContext;
    revOut: GainNode;
    delOut: GainNode;
    depthGain: GainNode;
    dl: DelayNode;
    dr: DelayNode;
    fb: GainNode[];
    dryAn: AnalyserNode;
    wetAn: AnalyserNode;
    ctlAn: AnalyserNode;
    buf: Float32Array<ArrayBuffer>;
    ctl: Float32Array<ArrayBuffer>;
}

const duckFloor = (s: FxSettings) => (s.mode === 'ducked' ? 1 - dbToGain(-s.depth) : 0);

function applyFx(n: FxNodes, s: FxSettings) {
    const t = n.ctx.currentTime;
    const a = s.amount / 100;
    n.revOut.gain.setTargetAtTime(s.mode === 'delay' ? 0 : a * REVERB_LEVEL, t, 0.04);
    n.delOut.gain.setTargetAtTime(s.mode === 'delay' ? a * DELAY_LEVEL : 0, t, 0.04);
    n.depthGain.gain.setTargetAtTime(-duckFloor(s), t, 0.03);
    n.dl.delayTime.setTargetAtTime(delaySeconds(s.delayNote), t, 0.03);
    n.dr.delayTime.setTargetAtTime(delaySeconds(s.delayNote), t, 0.03);
    for (const g of n.fb) g.gain.setTargetAtTime(s.feedback / 100, t, 0.03);
}

const TRACE_POINTS = 120;

function drawTrace(c: HTMLCanvasElement | null, dry: Float32Array, wet: Float32Array, head: number) {
    const s = canvas2d(c);
    if (!s) return;
    const { g, w, h } = s;
    const floor = -66;
    const top = -6;
    const y = (db: number) => h - 2 - ((Math.max(floor, Math.min(top, db)) - floor) / (top - floor)) * (h - 4);
    const x = (i: number) => (i / (TRACE_POINTS - 1)) * w;
    g.strokeStyle = 'rgba(255,255,255,0.08)';
    g.lineWidth = 1;
    for (const db of [-46, -26]) {
        g.beginPath();
        g.moveTo(0, y(db));
        g.lineTo(w, y(db));
        g.stroke();
    }
    const at = (arr: Float32Array, i: number) => arr[(head + i) % TRACE_POINTS];
    // The dry voice as a grey area.
    g.beginPath();
    g.moveTo(0, h);
    for (let i = 0; i < TRACE_POINTS; i++) g.lineTo(x(i), y(at(dry, i)));
    g.lineTo(w, h);
    g.closePath();
    g.fillStyle = 'rgba(255,255,255,0.16)';
    g.fill();
    // The effect return as the accent line.
    g.beginPath();
    for (let i = 0; i < TRACE_POINTS; i++) {
        if (i === 0) g.moveTo(x(i), y(at(wet, i)));
        else g.lineTo(x(i), y(at(wet, i)));
    }
    g.strokeStyle = ACCENT;
    g.lineWidth = 1.5;
    g.stroke();
}

/**
 * A vocal-like phrase into a long reverb. Duck the reverb with an envelope
 * follower on the dry phrase, or swap it for a filtered tempo delay.
 */
export function ReverbDuckDemo() {
    const [mode, setMode] = useState<FxMode>('plain');
    const [amount, setAmount] = useState(60);
    const [depth, setDepth] = useState(12);
    const [delayNote, setDelayNote] = useState<DelayNote>('dotted');
    const [feedback, setFeedback] = useState(35);
    const [duck, setDuck] = useState<number | null>(null);
    const trace = useRef<HTMLCanvasElement>(null);
    const history = useRef({ dry: new Float32Array(TRACE_POINTS).fill(-120), wet: new Float32Array(TRACE_POINTS).fill(-120), head: 0 });
    const nodes = useRef<FxNodes | null>(null);
    const live = useRef<FxSettings>({ mode, amount, depth, delayNote, feedback });
    useEffect(() => {
        live.current = { mode, amount, depth, delayNote, feedback };
        if (nodes.current) applyFx(nodes.current, live.current);
    }, [mode, amount, depth, delayNote, feedback]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const dry = gainNode(ctx);
        dry.connect(master);
        const beat = gainNode(ctx);
        beat.connect(master);
        const fxSum = gainNode(ctx);
        fxSum.connect(master);

        // Reverb: a short pre-delay, a generated hall, then the ducker.
        const pre = ctx.createDelay(0.2);
        pre.delayTime.value = 0.02;
        const conv = ctx.createConvolver();
        conv.buffer = hallImpulse(ctx, REVERB_SECONDS);
        const ducker = gainNode(ctx, 1);
        const revOut = gainNode(ctx, 0);
        dry.connect(pre).connect(conv).connect(ducker).connect(revOut).connect(fxSum);

        // Envelope follower on the dry phrase. A fast path catches each syllable at once;
        // a slow path holds the duck through short gaps inside a line.
        const rect = ctx.createWaveShaper();
        rect.curve = curveOf(Math.abs);
        const fastCoef = onePole(0.01, ctx.sampleRate);
        const slowCoef = onePole(0.22, ctx.sampleRate);
        const fast = ctx.createIIRFilter(fastCoef.feedforward, fastCoef.feedback);
        const slow = ctx.createIIRFilter(slowCoef.feedforward, slowCoef.feedback);
        const sum = gainNode(ctx, FOLLOW_GAIN);
        const shape = ctx.createWaveShaper();
        shape.curve = curveOf(DUCK_CURVE);
        const depthGain = gainNode(ctx, 0);
        dry.connect(rect);
        rect.connect(fast).connect(sum);
        rect.connect(slow).connect(sum);
        // The ducker's gain is 1 plus this signal, which goes negative while the voice sings.
        sum.connect(shape).connect(depthGain).connect(ducker.gain);

        // Tempo delay: filtered on the way in and on every repeat, bouncing left and right.
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 500;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3200;
        const dl = ctx.createDelay(2);
        const dr = ctx.createDelay(2);
        dl.delayTime.value = dr.delayTime.value = delaySeconds(live.current.delayNote);
        const fb = [gainNode(ctx, 0), gainNode(ctx, 0)];
        const loopLp = ctx.createBiquadFilter();
        loopLp.type = 'lowpass';
        loopLp.frequency.value = 2600;
        dry.connect(hp).connect(lp).connect(dl);
        dl.connect(fb[0]).connect(dr);
        dr.connect(loopLp).connect(fb[1]).connect(dl);
        const dMerge = ctx.createChannelMerger(2);
        dl.connect(dMerge, 0, 0);
        dr.connect(dMerge, 0, 1);
        const delOut = gainNode(ctx, 0);
        dMerge.connect(delOut).connect(fxSum);

        const dryAn = ctx.createAnalyser();
        const wetAn = ctx.createAnalyser();
        const ctlAn = ctx.createAnalyser();
        dryAn.fftSize = wetAn.fftSize = 2048;
        ctlAn.fftSize = 256;
        dry.connect(dryAn);
        fxSum.connect(wetAn);
        shape.connect(ctlAn);

        const n: FxNodes = { ctx, revOut, delOut, depthGain, dl, dr, fb, dryAn, wetAn, ctlAn, buf: new Float32Array(2048), ctl: new Float32Array(256) };
        nodes.current = n;
        applyFx(n, live.current);
        history.current.dry.fill(-120);
        history.current.wet.fill(-120);

        const seq = sequence(ctx, RD_BPM, RD_STEPS, (step, time, stepDur) => {
            for (const v of RD_PHRASE) {
                if (v.at !== step) continue;
                if (v.consonant) consonant(ctx, dry, time, v.consonant);
                sing(ctx, dry, time, midi(v.note), v.len * stepDur * 0.88, v.vowel, RD_VOICE_LEVEL, v.to);
            }
            if (step === 0 || step === 16) kick(ctx, beat, time, 0.35);
            if (step % 2 === 0) hat(ctx, beat, time, step % 4 === 0 ? 0.18 : 0.1);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            setDuck(null);
            fadeOut(ctx, master);
        };
    });

    useFrame(player.playing, () => {
        const n = nodes.current;
        if (!n) return;
        const h = history.current;
        n.dryAn.getFloatTimeDomainData(n.buf);
        h.dry[h.head] = powerDb(meanSquare(n.buf));
        n.wetAn.getFloatTimeDomainData(n.buf);
        h.wet[h.head] = powerDb(meanSquare(n.buf));
        h.head = (h.head + 1) % TRACE_POINTS;
        drawTrace(trace.current, h.dry, h.wet, h.head);
        n.ctlAn.getFloatTimeDomainData(n.ctl);
        const c = n.ctl[n.ctl.length - 1];
        setDuck(-20 * Math.log10(Math.max(1e-3, 1 - duckFloor(live.current) * c)));
    });

    const effectName = mode === 'delay' ? 'Delay' : 'Reverb';
    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <Field label="Effect">
                <Segmented
                    label="Effect"
                    value={mode}
                    onChange={setMode}
                    options={[
                        { value: 'plain', label: 'Plain reverb' },
                        { value: 'ducked', label: 'Ducked reverb' },
                        { value: 'delay', label: 'Tempo delay' },
                    ]}
                />
            </Field>
            <div>
                <canvas ref={trace} aria-hidden="true" className="block h-24 w-full rounded-[3px] bg-white/[0.035]" />
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/60" aria-hidden="true">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-3 rounded-[1px] bg-white/25" />
                        Dry voice
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="h-0.5 w-3 bg-[var(--accent)]" />
                        {effectName}
                    </span>
                    <span>Last 6 seconds</span>
                </div>
            </div>
            <Meter
                label="Reverb turned down by"
                value={mode === 'ducked' && duck !== null ? duck / 24 : 0}
                text={mode !== 'ducked' ? 'Not ducking' : duck === null ? '–' : `${duck.toFixed(1)} dB`}
            />
            <div className="grid gap-5 sm:grid-cols-2">
                <Slider label={`${effectName} level`} value={amount} min={0} max={100} step={5} onChange={setAmount} format={(v) => `${v}%`} />
                {mode === 'ducked' ? (
                    <Slider
                        label="Duck depth"
                        value={depth}
                        min={0}
                        max={24}
                        onChange={setDepth}
                        format={(v) => `${v} dB`}
                        hint="How far the reverb drops while the voice sings."
                    />
                ) : null}
                {mode === 'delay' ? <Slider label="Feedback" value={feedback} min={0} max={70} step={5} onChange={setFeedback} format={(v) => `${v}%`} /> : null}
            </div>
            {mode === 'delay' ? (
                <Field label="Delay time">
                    <Segmented
                        label="Delay time"
                        value={delayNote}
                        onChange={setDelayNote}
                        options={[
                            { value: 'eighth', label: `1/8, ${Math.round(delaySeconds('eighth') * 1000)} ms` },
                            { value: 'dotted', label: `Dotted 1/8, ${Math.round(delaySeconds('dotted') * 1000)} ms` },
                            { value: 'quarter', label: `1/4, ${Math.round(delaySeconds('quarter') * 1000)} ms` },
                        ]}
                    />
                </Field>
            ) : null}
            <p className="text-sm leading-6 text-white/60">
                The dry voice never changes. With plain reverb, the tail of each line runs over the start of the next. Ducked, the reverb drops while the voice sings
                and swells in the gaps. The delay repeats in time with the beat at {RD_BPM} BPM and is filtered thin, so the echoes sit behind the words.
            </p>
        </div>
    );
}

// ── Chord in context ────────────────────────────────────────────────

type Part = 'chord' | 'melody';
type LeadIn = 'alone' | 'home' | 'away' | 'lift';
type Register = 'low' | 'middle' | 'high';
type Tempo = 'slow' | 'fast';
type Mode = 'major' | 'minor';

interface Chord {
    name: string;
    bass: number;
    notes: number[];
}

const TARGET: Chord = { name: 'C', bass: 48, notes: [60, 64, 67] };
const CH = {
    F: { name: 'F', bass: 41, notes: [60, 65, 69] },
    G7: { name: 'G7', bass: 43, notes: [59, 65, 67] },
    Bb: { name: 'Bb', bass: 46, notes: [62, 65, 70] },
    Gm7: { name: 'Gm7', bass: 43, notes: [62, 65, 70] },
    Ab: { name: 'Ab', bass: 44, notes: [60, 63, 68] },
} satisfies Record<string, Chord>;

const LEAD_INS: Record<LeadIn, { label: string; chords: { chord: Chord; beats: number }[]; hint: string }> = {
    alone: {
        label: 'Nothing',
        chords: [],
        hint: 'On its own, C is simply a major chord. Play it after each lead-in and compare.',
    },
    home: {
        label: 'F and G7',
        chords: [
            { chord: CH.F, beats: 2 },
            { chord: CH.G7, beats: 2 },
        ],
        hint: 'After F and G7, many listeners hear C as the end of the phrase, the place it was heading.',
    },
    away: {
        label: 'F, Bb and Gm7',
        chords: [
            { chord: CH.F, beats: 1 },
            { chord: CH.Bb, beats: 1 },
            { chord: CH.Gm7, beats: 2 },
        ],
        hint: 'These chords point toward F, so the same C can sound like a step on the way back to F rather than an arrival.',
    },
    lift: {
        label: 'Ab and Bb',
        chords: [
            { chord: CH.Ab, beats: 2 },
            { chord: CH.Bb, beats: 2 },
        ],
        hint: 'Coming from Ab and Bb, C often sounds brighter and more lifted than it does after G7.',
    },
};

// One melody note per eighth (0 is a rest) over C, F, G, C for two beats each.
const MELODY = [79, 76, 79, 84, 81, 77, 81, 84, 83, 79, 74, 79, 76, 0, 72, 0];
const MELODY_CHORDS: Chord[] = [
    { name: 'C', bass: 48, notes: [60, 64, 67] },
    { name: 'F', bass: 41, notes: [60, 65, 69] },
    { name: 'G', bass: 43, notes: [59, 62, 67] },
    { name: 'C', bass: 48, notes: [60, 64, 67] },
];
/** The parallel minor: the third and sixth drop a semitone; the leading tone stays for the G chord. */
const isModal = (n: number) => n % 12 === 4 || n % 12 === 9;
const toMode = (n: number, mode: Mode) => (mode === 'minor' && isModal(n) ? n - 1 : n);
const chordName = (c: Chord, mode: Mode) => (mode === 'minor' && c.notes.some(isModal) ? `${c.name}m` : c.name);

const REGISTER_SHIFT: Record<Register, number> = { low: -12, middle: 0, high: 12 };
// Rough loudness trims so the registers play at a similar loudness.
const REGISTER_TRIM: Record<Register, number> = { low: 1.3, middle: 1, high: 0.75 };
const TEMPO_BPM: Record<Tempo, number> = { slow: 60, fast: 140 };

/** A soft keyboard note: a triangle with two quiet overtones that decays like a struck string. */
function keys(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, dur: number, level = 1) {
    const peak = 0.16 * level;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    // Lower notes ring longer.
    g.gain.setTargetAtTime(peak * 0.25, t + 0.006, Math.min(0.9, 0.15 + 40 / freq));
    g.gain.setTargetAtTime(0.0001, t + dur, 0.07);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(9000, freq * 7), t);
    lp.frequency.setTargetAtTime(Math.min(5000, freq * 3), t, 0.3);
    lp.connect(g).connect(dest);
    const partials: [OscillatorType, number, number][] = [
        ['triangle', 1, 1],
        ['sine', 2, 0.35],
        ['sine', 3, 0.12],
    ];
    for (const [type, mult, amp] of partials) {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq * mult;
        osc.connect(gainNode(ctx, amp)).connect(lp);
        osc.start(t);
        osc.stop(t + dur + 0.45);
    }
}

interface ChordSettings {
    part: Part;
    leadIn: LeadIn;
    register: Register;
    tempo: Tempo;
    mode: Mode;
}

function chordPlan(leadIn: LeadIn): { chord: Chord | null; beats: number }[] {
    return [...LEAD_INS[leadIn].chords, { chord: TARGET, beats: 3 }, { chord: null, beats: 1 }];
}

function MelodyRoll({ mode, current }: { mode: Mode; current: number }) {
    const w = 320;
    const h = 92;
    const slot = w / MELODY.length;
    const lowest = 70;
    const highest = 85;
    const y = (n: number) => 8 + ((highest - n) / (highest - lowest)) * (h - 22);
    return (
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" className="block max-w-md" role="img" aria-label={`The melody in ${mode}. The highlighted notes are the ones that change.`}>
            <rect x={0} y={0} width={w} height={h} rx={3} fill="rgba(255,255,255,0.035)" />
            {[0, 4, 8, 12].map((i) => (
                <line key={i} x1={i * slot} x2={i * slot} y1={0} y2={h} stroke="rgba(255,255,255,0.08)" />
            ))}
            {MELODY.map((n, i) => {
                if (!n) return null;
                const len = MELODY[i + 1] === 0 ? 2 : 1;
                const note = toMode(n, mode);
                const playing = i === current;
                const fill = isModal(n) ? ACCENT : playing ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)';
                return <rect key={i} x={i * slot + 2} y={y(note) - 3} width={slot * len - 4} height={6} rx={2} fill={fill} opacity={playing || isModal(n) ? 1 : 0.85} />;
            })}
            {current >= 0 ? <rect x={current * slot} y={h - 6} width={slot} height={3} rx={1} fill="rgba(255,255,255,0.5)" /> : null}
        </svg>
    );
}

/**
 * One chord after different lead-ins, and one melody in major or minor,
 * each in three registers and at two tempos.
 */
export function ChordContextDemo() {
    const [part, setPart] = useState<Part>('chord');
    const [leadIn, setLeadIn] = useState<LeadIn>('home');
    const [register, setRegister] = useState<Register>('middle');
    const [tempo, setTempo] = useState<Tempo>('slow');
    const [mode, setMode] = useState<Mode>('major');
    const [current, setCurrent] = useState(-1);
    const live = useRef<ChordSettings>({ part, leadIn, register, tempo, mode });
    const restart = useRef(true);
    const queue = useRef<{ time: number; index: number }[]>([]);
    const clock = useRef<{ ctx: AudioContext; seq: ReturnType<typeof sequence> } | null>(null);

    useEffect(() => {
        live.current = { part, leadIn, register, tempo, mode };
        clock.current?.seq.setBpm(TEMPO_BPM[tempo]);
    }, [part, leadIn, register, tempo, mode]);
    // A new lead-in or part starts from the top so the comparison is clean.
    useEffect(() => {
        restart.current = true;
    }, [part, leadIn]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const bus = ctx.createGain();
        bus.connect(out);
        let k = 0;
        restart.current = true;
        const seq = sequence(ctx, TEMPO_BPM[live.current.tempo], 16, (_, time, stepDur) => {
            const s = live.current;
            if (restart.current) {
                restart.current = false;
                k = 0;
            }
            const shift = REGISTER_SHIFT[s.register];
            const trim = REGISTER_TRIM[s.register];
            const beatDur = stepDur * 4;
            if (s.part === 'chord') {
                const plan = chordPlan(s.leadIn);
                const loop = plan.reduce((sum, p) => sum + p.beats, 0) * 4;
                if (k >= loop) k = 0;
                if (k % 4 === 0) {
                    const beat = k / 4;
                    let start = 0;
                    for (let i = 0; i < plan.length; i++) {
                        const { chord, beats } = plan[i];
                        if (beat < start + beats) {
                            if (chord) {
                                for (const n of chord.notes) keys(ctx, bus, time, midi(n + shift), beatDur * 0.92, 0.6 * trim);
                                if (beat === start) keys(ctx, bus, time, midi(chord.bass + shift), beatDur * beats * 0.95, 0.75 * trim);
                            }
                            queue.current.push({ time, index: chord ? i : -1 });
                            break;
                        }
                        start += beats;
                    }
                }
            } else {
                if (k >= MELODY.length * 2) k = 0;
                if (k % 2 === 0) {
                    const e = k / 2;
                    const pitch = (n: number) => midi(toMode(n, s.mode) + shift);
                    if (e % 4 === 0) {
                        const chord = MELODY_CHORDS[e / 4];
                        for (const n of chord.notes) keys(ctx, bus, time, pitch(n), beatDur * 1.9, 0.42 * trim);
                        keys(ctx, bus, time, pitch(chord.bass), beatDur * 1.9, 0.6 * trim);
                    }
                    const n = MELODY[e];
                    if (n) keys(ctx, bus, time, pitch(n), (MELODY[e + 1] === 0 ? 2 : 1) * stepDur * 2 * 0.9, 0.85 * trim);
                    queue.current.push({ time, index: e });
                }
            }
            k++;
        });
        clock.current = { ctx, seq };
        return () => {
            seq.stop();
            clock.current = null;
            queue.current = [];
            setCurrent(-1);
            fadeOut(ctx, bus);
        };
    });

    useFrame(player.playing, () => {
        const c = clock.current;
        if (!c) return;
        const now = c.ctx.currentTime;
        let latest: number | null = null;
        while (queue.current.length && queue.current[0].time <= now) {
            const next = queue.current.shift();
            if (next) latest = next.index;
        }
        if (latest !== null) setCurrent(latest);
    });

    const boxes = [...LEAD_INS[leadIn].chords.map((c) => c.chord), TARGET];
    const hint =
        part === 'chord'
            ? LEAD_INS[leadIn].hint
            : 'The highlighted notes are the only ones that change between major and minor. Try minor, fast and high, then major, slow and low. For many listeners, tempo and register move the mood about as much as the mode does.';

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <Field label="Listen to">
                <Segmented
                    label="Listen to"
                    value={part}
                    onChange={(v) => {
                        setPart(v);
                        setCurrent(-1);
                    }}
                    options={[
                        { value: 'chord', label: 'One chord, different lead-ins' },
                        { value: 'melody', label: 'One melody, major or minor' },
                    ]}
                />
            </Field>
            {part === 'chord' ? (
                <>
                    <Field label="Before the C chord">
                        <Segmented
                            label="Before the C chord"
                            value={leadIn}
                            onChange={(v) => {
                                setLeadIn(v);
                                setCurrent(-1);
                            }}
                            options={(Object.keys(LEAD_INS) as LeadIn[]).map((id) => ({ value: id, label: LEAD_INS[id].label }))}
                        />
                    </Field>
                    <div aria-hidden="true" className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${boxes.length}, minmax(0, 1fr))` }}>
                        {boxes.map((chord, i) => {
                            const target = i === boxes.length - 1;
                            return (
                                <div
                                    key={`${leadIn}-${i}`}
                                    className={`rounded-[3px] border px-3 py-2 text-sm font-semibold transition-colors ${current === i ? 'border-white/60' : 'border-white/10'} ${
                                        target ? 'text-[var(--accent)]' : current === i ? 'text-white' : 'text-white/55'
                                    }`}
                                >
                                    {chord.name}
                                    {target ? <span className="ml-1.5 text-xs font-normal text-white/50">same every time</span> : null}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <>
                    <Field label="Mode">
                        <Segmented
                            label="Mode"
                            value={mode}
                            onChange={setMode}
                            options={[
                                { value: 'major', label: 'Major' },
                                { value: 'minor', label: 'Minor' },
                            ]}
                        />
                    </Field>
                    <div>
                        <MelodyRoll mode={mode} current={current} />
                        <p className="mt-2 text-xs text-white/50" aria-hidden="true">
                            Chords: {MELODY_CHORDS.map((c) => chordName(c, mode)).join(', ')}
                        </p>
                    </div>
                </>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Register">
                    <Segmented
                        label="Register"
                        value={register}
                        onChange={setRegister}
                        options={[
                            { value: 'low', label: 'Low' },
                            { value: 'middle', label: 'Middle' },
                            { value: 'high', label: 'High' },
                        ]}
                    />
                </Field>
                <Field label="Tempo">
                    <Segmented
                        label="Tempo"
                        value={tempo}
                        onChange={setTempo}
                        options={[
                            { value: 'slow', label: `Slow, ${TEMPO_BPM.slow} BPM` },
                            { value: 'fast', label: `Fast, ${TEMPO_BPM.fast} BPM` },
                        ]}
                    />
                </Field>
            </div>
            <p className="text-sm leading-6 text-white/60">{hint}</p>
        </div>
    );
}
