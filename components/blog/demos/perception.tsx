'use client';

import { memo, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Dialect } from '@/lib/blog/dialects';
import { bass, envelopeGain, fadeOut, hat, kick, kWeighted, midi, noiseBuffer, peekEngine, pluck, reverb, scheduleSteps, sequence, snare, type Engine } from './engine';
import { SourceChoice, loopGain, renderLoop, startFeed, stereoPower, useSource, type Feed, type RealLoop } from './realmix';
import {
    Announce,
    LevelTrace,
    Meter,
    NoteRoll,
    PlayButton,
    Segmented,
    Slider,
    StepStrip,
    Variants,
    accentAlpha,
    blockPower,
    canvas2d,
    ruleDash,
    useAnalysis,
    useDialect,
    useFrame,
    usePlayer,
    whenIdle,
    type RollNote,
} from './ui';

// ── Small helpers ───────────────────────────────────────────────────

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
    /** The last syllable of a line: the one a delay throw catches. */
    last?: boolean;
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
    const vibDepth = envelopeGain(ctx);
    vibDepth.gain.setValueAtTime(0, t);
    vibDepth.gain.linearRampToValueAtTime(dur > 0.4 ? 22 : 8, t + Math.min(dur, 0.5));
    vib.connect(vibDepth).connect(src.detune);

    const env = envelopeGain(ctx);
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
    const g = envelopeGain(ctx);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime((sibilant ? 0.07 : 0.16) * level, start + (sibilant ? 0.03 : 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, start + len);
    src.connect(f).connect(g).connect(dest);
    src.start(start, Math.random() * 1.5, len + 0.02);
}

// ── The short stereo mix shared by the width and monitor-level demos ──

/**
 * A pad voiced differently on each side and detuned differently, so the
 * two channels share some notes but never quite match.
 */
function stereoPad(ctx: BaseAudioContext, left: AudioNode, right: AudioNode, t: number, voicing: { l: number[]; r: number[] }, dur: number, level = 1) {
    const sides: [AudioNode, number[], number[], number][] = [
        [left, voicing.l, [-12, 5], 1500],
        [right, voicing.r, [-5, 12], 1900],
    ];
    for (const [dest, notes, detunes, cutoff] of sides) {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = cutoff;
        const g = envelopeGain(ctx);
        const peak = 0.11 * level;
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
    /** Mostly left or mostly right, with an echo on the other side, for the arpeggio. */
    leanLeft: GainNode;
    leanRight: GainNode;
    /** The finished left and right channels. */
    l: GainNode;
    r: GainNode;
}

const MIX_BPM = 94;
const MIX_STEPS = 32;
const MIX_LOOP_SECONDS = (MIX_STEPS * 60) / MIX_BPM / 4;
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
    const echo = (3 * 60) / MIX_BPM / 4;
    const lean = (from: GainNode, near: GainNode, far: GainNode) => {
        from.connect(gainNode(ctx, 1)).connect(near);
        from.connect(gainNode(ctx, 0.2)).connect(far);
        const delay = ctx.createDelay(1);
        delay.delayTime.value = echo;
        from.connect(delay).connect(gainNode(ctx, 0.5)).connect(far);
    };
    lean(bus.leanLeft, bus.left, bus.right);
    lean(bus.leanRight, bus.right, bus.left);
    return bus;
}

// Dm9, then B♭maj9 over the bass, voiced differently left and right.
const MIX_PAD = [
    { l: [53, 57, 60, 64], r: [57, 62, 65, 69] },
    { l: [53, 57, 60, 62], r: [58, 62, 65, 69] },
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
    hat(ctx, bus.center, time, s % 2 === 0 ? 0.42 : 0.18);
    if (s === 6 || s === 14) hat(ctx, bus.center, time, 0.28, true);
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
        pluck(ctx, i % 2 === 0 ? bus.leanLeft : bus.leanRight, time, midi(MIX_ARP[i]), stepDur * 1.6, 1);
    }
    for (const v of MIX_VOICE) if (v.at === step) sing(ctx, bus.center, time, midi(v.note), v.len * stepDur * 0.9, v.vowel, MIX_VOICE_LEVEL, v.to);
}

/**
 * The real mix (Dystopia) goes into the width and monitor-level demos at this
 * loudness, so at their defaults it plays at the house loudness.
 */
const MIX_REAL_IN = -11.8;

/** The short mix as a stereo signal into `into`, played on its loop. Returns its stop. */
function playMix(ctx: AudioContext, into: AudioNode): () => void {
    const bus = mixBus(ctx);
    const merger = ctx.createChannelMerger(2);
    bus.l.connect(merger, 0, 0);
    bus.r.connect(merger, 0, 1);
    merger.connect(into);
    const seq = sequence(ctx, MIX_BPM, MIX_STEPS, (step, time, dur) => playMixStep(ctx, bus, step, time, dur));
    return () => seq.stop();
}

/** A stereo input split into its left and right channels. */
function splitStereo(ctx: BaseAudioContext): { input: GainNode; l: GainNode; r: GainNode } {
    const input = gainNode(ctx);
    const split = ctx.createChannelSplitter(2);
    input.connect(split);
    const l = gainNode(ctx);
    const r = gainNode(ctx);
    split.connect(l, 0);
    split.connect(r, 1);
    return { input, l, r };
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
    /** The real loop this was measured on, or null for the synth mix. */
    real?: RealLoop | null;
}

/** The real loop's measurement once made (ui.tsx useAnalysis), so a switch back to it goes live at once. */
const widthResults = new Map<string, MidSidePower | null>();

/** The real loop's mid and side power, K-weighted, over one whole pass as it repeats. */
async function midSideReal(loop: RealLoop): Promise<MidSidePower> {
    const r = await renderLoop(loop, { gain: loopGain(loop, MIX_REAL_IN), taps: 2, weighted: 2, weightedOnly: true }, (ctx, src, [midTap, sideTap]) => {
        const { input, l, r: right } = splitStereo(ctx);
        src.connect(input);
        const { mid, side } = encodeMidSide(ctx, l, right);
        mid.connect(midTap);
        side.connect(sideTap);
    });
    const [from, to] = r.span();
    return { mid: await stereoPower(r.k[0], from, to), side: await stereoPower(r.k[1], from, to), real: loop };
}

let midSideJob: Promise<MidSidePower> | null = null;

/** The mix's mid and side power, measured once per page. Their ratio barely depends on the sample rate, so it can run before anything plays. */
function midSidePower(): Promise<MidSidePower> {
    midSideJob ??= measureMidSide(48000).catch((error: unknown) => {
        midSideJob = null;
        throw error;
    });
    return midSideJob;
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
    // A few steps at a time (engine.ts scheduleSteps), so this idle-time measurement never holds up a frame.
    await scheduleSteps(MIX_STEPS, (step) => playMixStep(ctx, bus, step, 0.05 + step * stepDur, stepDur));
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

const SCOPE_FONT = '11px system-ui, sans-serif';

function drawScope(c: HTMLCanvasElement | null, l: Float32Array, r: Float32Array, scale: number, dialect: Dialect) {
    const s = canvas2d(c);
    if (!s) return;
    const { g, w, h } = s;
    const cx = w / 2;
    const cy = h / 2;
    const rad = Math.min(w, h) / 2 - 2;
    const d = rad * Math.SQRT1_2;
    // The axes are rules, drawn in the lesson's dialect: dotted in mind lessons, solid elsewhere.
    g.strokeStyle = dialect.rule.dash ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.1)';
    g.lineWidth = dialect.rule.dash ? 1.4 : 1;
    g.lineCap = dialect.rule.cap;
    g.setLineDash(ruleDash(dialect));
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
    g.setLineDash([]);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.font = SCOPE_FONT;
    g.fillText('L', 5, 13);
    g.fillText('R', w - 12, 13);
    g.fillText('M', cx + 4, 12);
    if (scale <= 0) return;
    // Mid goes up, side goes across: mono is a vertical line, wide is a broad cloud.
    const k = (rad * 0.8) / scale;
    g.fillStyle = accentAlpha(dialect, 0.55);
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
                <span>-1 out of phase</span>
                <span>0</span>
                <span>+1 mono</span>
            </div>
        </div>
    );
}

/** The width meters' running averages, kept between frames (WidthDemo resets them on Play and on a switch to mono). */
interface WidthSmooth {
    ll: number;
    rr: number;
    lr: number;
    midDb: number;
    sideDb: number;
    scale: number;
    at: number;
}

const freshSmooth = (): WidthSmooth => ({ ll: 0, rr: 0, lr: 0, midDb: -120, sideDb: -120, scale: 0, at: 0 });

/**
 * The correlation meter, the scope and the mid and side meters. They move
 * about 20 times a second while the demo plays, so they are a component of
 * their own: only they re-render as they move, not the whole demo (on a slow
 * phone that was a long task every few frames), and a change to the demo's
 * settings does not re-render them.
 */
const WidthReadings = memo(function WidthReadings({
    active,
    nodesRef,
    smoothRef,
}: {
    active: boolean;
    nodesRef: MutableRefObject<WidthNodes | null>;
    smoothRef: MutableRefObject<WidthSmooth>;
}) {
    const dialect = useDialect();
    const scope = useRef<HTMLCanvasElement>(null);
    const [meters, setMeters] = useState<{ corr: number; mid: number; side: number } | null>(null);
    useFrame(active, () => {
        const n = nodesRef.current;
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
        // Average over about a fifth of a second, like a hardware meter.
        const sm = smoothRef.current;
        const len = l.length;
        const now = performance.now();
        const k = sm.at === 0 ? 1 : 1 - Math.exp(-(now - sm.at) / 200);
        sm.at = now;
        sm.ll += (ll / len - sm.ll) * k;
        sm.rr += (rr / len - sm.rr) * k;
        sm.lr += (lr / len - sm.lr) * k;
        // Mid is half the sum of the sides, side is half the difference.
        sm.midDb += (powerDb((ll + rr + 2 * lr) / (4 * len)) - sm.midDb) * k;
        sm.sideDb += (powerDb(Math.max(0, ll + rr - 2 * lr) / (4 * len)) - sm.sideDb) * k;
        sm.scale = Math.max(peak, sm.scale * 0.92, 1e-4);
        // Correlation: +1 when both sides match, 0 when unrelated, -1 when opposed.
        const energy = Math.sqrt(sm.ll * sm.rr);
        setMeters({
            corr: energy > 1e-9 ? Math.max(-1, Math.min(1, sm.lr / energy)) : 1,
            mid: sm.midDb,
            side: sm.sideDb,
        });
        drawScope(scope.current, l, r, sm.scale, dialect);
    });
    // The canvas's drawing context, its pixels and its font are set up while the page is idle (it stays
    // blank), so the first frame after Play does not pay for them: on a slow phone that frame ran long.
    useEffect(
        () =>
            whenIdle(() => {
                const c = canvas2d(scope.current);
                if (!c) return;
                c.g.font = SCOPE_FONT;
                c.g.measureText('LRM');
            }),
        [],
    );
    // When playback stops, the scope keeps only its axes.
    const was = useRef(false);
    useEffect(() => {
        if (was.current && !active) drawScope(scope.current, new Float32Array(0), new Float32Array(0), 0, dialect);
        was.current = active;
    }, [active, dialect]);

    const shown = active ? meters : null;
    const levelMeter = (db: number | undefined) => ({
        value: db === undefined ? 0 : (db + 60) / 54,
        text: db === undefined ? '–' : db < -70 ? 'Silent' : `${db.toFixed(1)} dB`,
    });
    const midMeter = levelMeter(shown?.mid);
    const sideMeter = levelMeter(shown?.side);
    return (
        <>
            <CorrelationMeter value={shown ? shown.corr : null} />
            <div>
                <div className="flex items-center gap-5">
                    <canvas ref={scope} aria-hidden="true" className="vgp-plot block h-28 w-28 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-4">
                        <Meter label="Mid signal" value={midMeter.value} text={midMeter.text} />
                        <Meter label="Side signal" value={sideMeter.value} text={sideMeter.text} />
                    </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/50">The square plots left against right. A vertical line is mono. The wider the cloud, the wider the image.</p>
            </div>
        </>
    );
});

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
    const [synthMs, setMs] = useState<MidSidePower | null>(null);
    const source = useSource('dystopia');
    const real = source.loop;
    const realMs = useAnalysis(real ? 'real' : 'synth', () => (real ? midSideReal(real) : Promise.resolve(null)), widthResults);
    // What plays, and what the matching follows: the real mix once its mid and side have been measured.
    const fed = realMs?.real ?? null;
    const ms = fed ? realMs : synthMs;
    const loading = source.pick === 'real' && (!real || fed !== real);
    const nodes = useRef<(WidthNodes & { feed: Feed }) | null>(null);
    const smooth = useRef<WidthSmooth>(freshSmooth());
    const live = useRef<WidthSettings>({ sideDb, midDb, mono, matched, ms });
    useEffect(() => {
        live.current = { sideDb, midDb, mono, matched, ms };
        const n = nodes.current;
        if (!n) return;
        n.feed.use(fed);
        applyWidth(n, live.current);
    }, [sideDb, midDb, mono, matched, ms, fed]);
    // Folding to mono is a switch, so let the meters jump with it.
    useEffect(() => {
        smooth.current.at = 0;
    }, [mono]);
    // Measure the mix while the page is idle, so pressing play does not wait for it.
    useEffect(() => {
        let alive = true;
        const cancel = whenIdle(() => {
            midSidePower().then(
                (m) => alive && setMs(m),
                () => {},
            );
        });
        return () => {
            alive = false;
            cancel();
        };
    }, []);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const stereo = splitStereo(ctx);
        const enc = encodeMidSide(ctx, stereo.l, stereo.r);
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
        const feed = startFeed(ctx, stereo.input, (into) => playMix(ctx, into), fed, (loop) => loopGain(loop, MIX_REAL_IN));
        const n = { ctx, mid, side, straight, cross, match, anL, anR, bufL: new Float32Array(4096), bufR: new Float32Array(4096), feed };
        nodes.current = n;
        applyWidth(n, live.current);
        smooth.current = freshSmooth();

        if (!synthMs) midSidePower().then(setMs, () => {});
        return () => {
            feed.stop();
            nodes.current = null;
            fadeOut(ctx, master);
        };
    }, !loading);

    const matchDb = 20 * Math.log10(matchGain(midDb, sideDb, ms));

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PlayButton playing={player.playing} waiting={player.waiting} onClick={player.toggle} />
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
            <SourceChoice source={source} loading={loading} />
            <WidthReadings active={player.playing} nodesRef={nodes} smoothRef={smooth} />
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
            <Segmented
                label="Loudness"
                value={matched ? 'matched' : 'raw'}
                onChange={(v) => setMatched(v === 'matched')}
                options={[
                    { value: 'matched', label: 'Matched' },
                    { value: 'raw', label: 'Not matched' },
                ]}
                hint={
                    matched
                        ? ms
                            ? `Matching changes the output by ${fmtDb(matchDb)} so the stereo mix stays at the same loudness.`
                            : 'Matching starts once the mix has been measured, a moment after the page loads.'
                        : 'Raising the sides now also makes the mix louder, which can make wider seem better.'
                }
                liveHint={matched ? 'Matching turns the output up or down so the stereo mix stays at the same loudness.' : true}
            />
            <p className="text-sm leading-6 text-white/60">
                {/* Both sources' wording in one place, so a switch moves nothing below. */}
                <Variants
                    show={fed ? 1 : 0}
                    items={[
                        'Drums, bass and voice sit in the middle. The pad and the arpeggio differ between left and right, so part of them lives in the sides. As the sides come up, the correlation falls toward 0 and the middle parts take a smaller share of the mix, so the voice and kick seem to sit further back. Switch to mono and the side signal is gone: whatever you added there disappears, and with loudness matched the mono version gets quieter as the sides go up.',
                        'In Dystopia the kick and the 808 sit in the middle, while the lead, the pads and the hats are wide, so part of them lives in the sides. As the sides come up, the correlation falls toward 0 and the middle takes a smaller share of the mix, so the kick and 808 seem to sit further back. Switch to mono and the side signal is gone: whatever you added there disappears, and with loudness matched the mono version gets quieter as the sides go up.',
                    ]}
                />
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
 * They measure the mix before the level step, averaged over one full
 * loop so the numbers hold still, then add the step's exact gain.
 */
export function MonitorLevelDemo() {
    const [step, setStep] = useState<LevelStep>('loud');
    const [bands, setBands] = useState<number[] | null>(null);
    const source = useSource('dystopia');
    const fed = source.loop;
    const nodes = useRef<{
        ctx: AudioContext;
        level: GainNode;
        an: AnalyserNode;
        data: Float32Array<ArrayBuffer>;
        history: { time: number; power: number[] }[];
        /** One loop of what plays, the span the band levels average over. */
        span: number;
        feed: Feed;
    } | null>(null);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = ctx.createGain();
        master.connect(out);
        const level = gainNode(ctx, dbToGain(STEP_DB[step]));
        const mix = gainNode(ctx);
        mix.connect(level).connect(master);
        const an = ctx.createAnalyser();
        an.fftSize = 4096;
        an.smoothingTimeConstant = 0;
        mix.connect(an);
        const feed = startFeed(ctx, mix, (into) => playMix(ctx, into), fed, (loop) => loopGain(loop, MIX_REAL_IN));
        nodes.current = { ctx, level, an, data: new Float32Array(an.frequencyBinCount), history: [], span: fed ? fed.seconds : MIX_LOOP_SECONDS, feed };
        return () => {
            feed.stop();
            nodes.current = null;
            setBands(null);
            fadeOut(ctx, master);
        };
    }, source.pick === 'synth' || fed !== null);

    // A new source starts a new average, over one loop of it.
    useEffect(() => {
        const n = nodes.current;
        if (!n) return;
        n.feed.use(fed);
        n.span = fed ? fed.seconds : MIX_LOOP_SECONDS;
        n.history.length = 0;
    }, [fed]);

    useFrame(player.playing, () => {
        const n = nodes.current;
        if (!n) return;
        n.an.getFloatFrequencyData(n.data);
        const binHz = n.ctx.sampleRate / n.an.fftSize;
        const power = BANDS.map(({ lo, hi }) => {
            let sum = 0;
            for (let i = Math.ceil(lo / binHz); i < Math.min(n.data.length, hi / binHz); i++) sum += 10 ** (n.data[i] / 10);
            return sum;
        });
        // Average over exactly one loop of the mix, so the reading stays put while the music moves.
        const now = n.ctx.currentTime;
        n.history.push({ time: now, power });
        while (n.history.length > 1 && n.history[0].time < now - n.span) n.history.shift();
        setBands(BANDS.map((_, b) => powerDb(n.history.reduce((sum, h) => sum + h.power[b], 0) / n.history.length)));
    });

    const choose = (next: LevelStep) => {
        setStep(next);
        const n = nodes.current;
        if (n) n.level.gain.setTargetAtTime(dbToGain(STEP_DB[next]), n.ctx.currentTime, 0.05);
    };

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} waiting={player.waiting} onClick={player.toggle} />
            <SourceChoice source={source} loading={source.pick === 'real' && !fed} />
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
            <div className="space-y-4">
                {BANDS.map((band, i) => {
                    const db = bands ? bands[i] + STEP_DB[step] : undefined;
                    return (
                        <Meter
                            key={band.label}
                            label={band.label}
                            value={db === undefined ? 0 : (db + 90) / 70}
                            text={db === undefined ? '–' : db < -110 ? 'Silent' : `${db.toFixed(0)} dB`}
                        />
                    );
                })}
                <p className="text-xs leading-5 text-white/50">Band levels of the mix at the chosen step, averaged over one loop. Each step lowers every band by the same 12 dB.</p>
            </div>
            <p className="text-sm leading-6 text-white/60">
                {/* Both sources' wording in one place, so a switch moves nothing below. */}
                <Variants
                    show={fed ? 1 : 0}
                    items={[
                        'This page cannot see your device volume, so the steps are relative to each other, and the loud step is no louder than the other demos here. Set a comfortable level on Loud first, then step down without touching your volume. On the quiet step, listen to the bass under the kick and the hats on top: many listeners hear them fade faster than the voice, even though the meters show the balance has not changed.',
                        'This page cannot see your device volume, so the steps are relative to each other, and the loud step is no louder than the other demos here. Set a comfortable level on Loud first, then step down without touching your volume. On the quiet step, listen to the 808 under the kick and the hats on top: many listeners hear them fade faster than the lead, even though the meters show the balance has not changed.',
                    ]}
                />
            </p>
        </div>
    );
}

// ── Reverb ducking ──────────────────────────────────────────────────

type FxMode = 'plain' | 'ducked' | 'throw';
type DelayNote = 'eighth' | 'dotted' | 'quarter';

const RD_BPM = 88;
const RD_STEPS = 32;
const REVERB_SECONDS = 4.5;
const DELAY_BEATS: Record<DelayNote, number> = { eighth: 0.5, dotted: 0.75, quarter: 1 };
const delaySeconds = (note: DelayNote) => (DELAY_BEATS[note] * 60) / RD_BPM;

// Two short lines with about a second of gap after each: long enough for a
// throw to repeat in, short enough for a long reverb tail to reach the next line.
const RD_PHRASE: Syllable[] = [
    { at: 0, len: 2, note: 64, vowel: 'a' },
    { at: 2, len: 1, note: 67, vowel: 'i', consonant: 't' },
    { at: 3, len: 2, note: 69, vowel: 'a' },
    { at: 5, len: 2, note: 67, vowel: 'o', consonant: 's' },
    { at: 8, len: 2, note: 64, vowel: 'e', to: 'i', last: true },
    { at: 16, len: 2, note: 62, vowel: 'o' },
    { at: 18, len: 1, note: 64, vowel: 'a', consonant: 't' },
    { at: 19, len: 2, note: 67, vowel: 'e' },
    { at: 21, len: 2, note: 64, vowel: 'a', consonant: 's' },
    { at: 24, len: 2, note: 60, vowel: 'o', to: 'u', last: true },
];
const RD_VOICE_LEVEL = 0.8;
// Keeps this demo at the loudness of the other demos on the site.
const RD_TRIM = 0.8;
const REVERB_LEVEL = 1.3;
const THROW_LEVEL = 1;

const halls = new Map<string, Float32Array<ArrayBuffer>[]>();

/**
 * A generated stereo hall: decaying noise that also loses its top end as it
 * fades, at a given sample rate. Built once per rate and kept. A running
 * product for the decay and an integer noise generator keep it quick on a
 * slow phone.
 */
function hallImpulse(seconds: number) {
    return (sr: number): Float32Array<ArrayBuffer>[] => {
        const key = `${sr}|${seconds}`;
        const cached = halls.get(key);
        if (cached) return cached;
        const length = Math.max(1, Math.floor(sr * seconds));
        const decay = 10 ** (-3 / length);
        const fadeIn = sr * 0.005;
        const channels = [0, 1].map((c) => {
            const data = new Float32Array(length);
            let seed = (7 + c * 7919) | 0;
            let smooth = 0;
            let env = 1;
            for (let i = 0; i < length; i++) {
                // xorshift32: white noise from -1 to 1.
                seed ^= seed << 13;
                seed ^= seed >>> 17;
                seed ^= seed << 5;
                const white = seed / 2147483648;
                smooth += (white - smooth) * (0.9 - (0.55 * i) / length);
                // -60 dB at the end, with a 5 ms fade in.
                data[i] = smooth * env * (i < fadeIn ? i / fadeIn : 1);
                env *= decay;
            }
            return data;
        });
        halls.set(key, channels);
        return channels;
    };
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
    n.revOut.gain.setTargetAtTime(s.mode === 'throw' ? 0 : a * REVERB_LEVEL, t, 0.04);
    n.delOut.gain.setTargetAtTime(s.mode === 'throw' ? a * THROW_LEVEL : 0, t, 0.04);
    n.depthGain.gain.setTargetAtTime(-duckFloor(s), t, 0.03);
    n.dl.delayTime.setTargetAtTime(delaySeconds(s.delayNote), t, 0.03);
    n.dr.delayTime.setTargetAtTime(delaySeconds(s.delayNote), t, 0.03);
    for (const g of n.fb) g.gain.setTargetAtTime(s.feedback / 100, t, 0.03);
}

/** What each effect does, under the choice. It changes with the choice, so it is announced. */
const EFFECT_HINT: Record<FxMode, string> = {
    plain: 'The tail of each line runs on under the start of the next.',
    ducked: 'The reverb drops while the voice sings and swells in the gaps. Duck depth below sets how far.',
    throw: 'No reverb. Only the last syllable of each line goes to a delay. Its feedback and time are below.',
};

/**
 * A vocal-like phrase into a long reverb. Duck the reverb with an envelope
 * follower on the dry phrase, or drop the reverb and throw only the last
 * syllable of each line into a filtered tempo delay.
 */
export function ReverbDuckDemo() {
    const [mode, setMode] = useState<FxMode>('plain');
    const [amount, setAmount] = useState(60);
    const [depth, setDepth] = useState(12);
    const [delayNote, setDelayNote] = useState<DelayNote>('dotted');
    const [feedback, setFeedback] = useState(35);
    const [duck, setDuck] = useState<number | null>(null);
    const nodes = useRef<FxNodes | null>(null);
    // If another demo has already started the audio, build the hall while the page is idle.
    useEffect(
        () =>
            whenIdle(() => {
                const engine = peekEngine();
                if (engine) hallImpulse(REVERB_SECONDS)(engine.ctx.sampleRate);
            }),
        [],
    );
    const live = useRef<FxSettings>({ mode, amount, depth, delayNote, feedback });
    useEffect(() => {
        live.current = { mode, amount, depth, delayNote, feedback };
        if (nodes.current) applyFx(nodes.current, live.current);
    }, [mode, amount, depth, delayNote, feedback]);

    const player = usePlayer(({ ctx, out }: Engine) => {
        const master = gainNode(ctx, RD_TRIM);
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
        const hall = reverb(ctx);
        hall.load(hallImpulse(REVERB_SECONDS));
        const ducker = gainNode(ctx, 1);
        const revOut = gainNode(ctx, 0);
        dry.connect(pre).connect(hall.input);
        hall.output.connect(ducker).connect(revOut).connect(fxSum);

        // Envelope follower on the dry phrase. A fast path catches each syllable at once;
        // a slow path holds the duck through short gaps inside a line.
        const rect = ctx.createWaveShaper();
        rect.curve = curveOf(Math.abs);
        // The fast path is a critically damped biquad with both poles at 5 ms (about one 10 ms pole):
        // an IIRFilterNode with a pole that fast takes tens of ms of main thread to create on a slow phone.
        const slowCoef = onePole(0.15, ctx.sampleRate);
        const fast = ctx.createBiquadFilter();
        fast.type = 'lowpass';
        fast.frequency.value = 1 / (2 * Math.PI * 0.005);
        fast.Q.value = 20 * Math.log10(0.5);
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

        // Delay throw: a send that opens only for the last syllable of each line, into a
        // tempo delay filtered on the way in and on every repeat, bouncing left and right.
        const throwSend = gainNode(ctx, 0);
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
        dry.connect(throwSend).connect(hp).connect(lp).connect(dl);
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

        const seq = sequence(ctx, RD_BPM, RD_STEPS, (step, time, stepDur) => {
            for (const v of RD_PHRASE) {
                if (v.at !== step) continue;
                const dur = v.len * stepDur * 0.88;
                if (v.consonant) consonant(ctx, dry, time, v.consonant);
                sing(ctx, dry, time, midi(v.note), dur, v.vowel, RD_VOICE_LEVEL, v.to);
                if (v.last && live.current.mode === 'throw') {
                    throwSend.gain.setTargetAtTime(1, time - 0.01, 0.003);
                    throwSend.gain.setTargetAtTime(0, time + dur, 0.01);
                }
            }
            if (step === 0 || step === 16) kick(ctx, beat, time, 0.35);
            if (step % 2 === 0) hat(ctx, beat, time, step % 4 === 0 ? 0.18 : 0.1);
        });
        return () => {
            seq.stop();
            nodes.current = null;
            setDuck(null);
            fadeOut(ctx, master, () => hall.dispose());
        };
    });

    // The trace reads the dry voice and the effect return as heard, after the playback trim.
    const read = () => {
        const n = nodes.current;
        if (!n) return null;
        const g = RD_TRIM * RD_TRIM;
        return { context: blockPower(n.dryAn, n.buf) * g, focus: blockPower(n.wetAn, n.buf) * g };
    };

    useFrame(player.playing, () => {
        const n = nodes.current;
        if (!n) return;
        n.ctlAn.getFloatTimeDomainData(n.ctl);
        const c = n.ctl[n.ctl.length - 1];
        setDuck(-20 * Math.log10(Math.max(1e-3, 1 - duckFloor(live.current) * c)));
    });

    const effectName = mode === 'throw' ? 'Throw' : 'Reverb';
    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
            <Segmented
                label="Effect"
                value={mode}
                onChange={setMode}
                options={[
                    { value: 'plain', label: 'Plain reverb' },
                    { value: 'ducked', label: 'Ducked reverb' },
                    { value: 'throw', label: 'Delay throw' },
                ]}
                hint={EFFECT_HINT[mode]}
                liveHint
            />
            <LevelTrace
                active={player.playing}
                read={read}
                context="Dry voice"
                focus={mode === 'throw' ? 'Delay throw' : 'Reverb'}
                label={`Level over the last six seconds: the dry voice as a grey area and the ${mode === 'throw' ? 'delay throw' : 'reverb'} as a line.`}
            />
            <Meter
                label="Reverb turned down by"
                value={mode === 'ducked' && duck !== null ? duck / 24 : 0}
                text={!player.playing ? '–' : mode !== 'ducked' ? 'Not ducking' : duck === null ? '–' : `${duck.toFixed(1)} dB`}
                widest="Not ducking"
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
                    />
                ) : null}
                {mode === 'throw' ? <Slider label="Feedback" value={feedback} min={0} max={70} step={5} onChange={setFeedback} format={(v) => `${v}%`} /> : null}
            </div>
            {mode === 'throw' ? (
                <Segmented
                    label="Delay time"
                    value={delayNote}
                    onChange={setDelayNote}
                    options={[
                        { value: 'eighth', label: `1/8, ${Math.round(delaySeconds('eighth') * 1000)} ms` },
                        { value: 'dotted', label: `Dotted 1/8, ${Math.round(delaySeconds('dotted') * 1000)} ms` },
                        { value: 'quarter', label: `1/4, ${Math.round(delaySeconds('quarter') * 1000)} ms` },
                    ]}
                    hint="With a 1/4 note, the second repeat lands on the first word of the next line."
                />
            ) : null}
            <p className="text-sm leading-6 text-white/60">
                The dry voice never changes, only what the effect leaves under the next line. The throw&apos;s delay is filtered and timed to the beat at {RD_BPM}{' '}
                BPM, so its repeats fill the gap instead.
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
    Bb: { name: 'B♭', bass: 46, notes: [62, 65, 70] },
    Gm7: { name: 'Gm7', bass: 43, notes: [62, 65, 70] },
    Ab: { name: 'A♭', bass: 44, notes: [60, 63, 68] },
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
        label: 'F, B♭ and Gm7',
        chords: [
            { chord: CH.F, beats: 1 },
            { chord: CH.Bb, beats: 1 },
            { chord: CH.Gm7, beats: 2 },
        ],
        hint: 'These chords point toward F, so the same C can sound like a step on the way back to F.',
    },
    lift: {
        label: 'A♭ and B♭',
        chords: [
            { chord: CH.Ab, beats: 2 },
            { chord: CH.Bb, beats: 2 },
        ],
        hint: 'Coming from A♭ and B♭, C often sounds brighter and more lifted than it does after G7.',
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
// Small trims so the three registers measure within about 1 dB of each other (K-weighted).
const REGISTER_TRIM: Record<Register, number> = { low: 1, middle: 1, high: 1.1 };
// Keeps this demo at the loudness of the other demos on the site.
const CHORD_TRIM = 2.5;
const TEMPO_BPM: Record<Tempo, number> = { slow: 60, fast: 140 };
// More notes per second add up to a louder result; this keeps the two tempos at a similar loudness.
const TEMPO_TRIM: Record<Tempo, number> = { slow: 1, fast: 0.75 };

/** A soft keyboard note: a triangle with two quiet overtones that decays like a struck string. */
function keys(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, dur: number, level = 1) {
    const peak = 0.16 * level;
    const g = envelopeGain(ctx);
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

/** The melody on a roll of eighths, in the chosen mode. The notes that change between major and minor are in the accent. */
function melodyRoll(mode: Mode): RollNote[] {
    return MELODY.flatMap((n, i) => (n ? [{ at: i, len: MELODY[i + 1] === 0 ? 2 : 1, pitch: toMode(n, mode), focus: isModal(n) }] : []));
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
        const bus = gainNode(ctx, CHORD_TRIM);
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
            const trim = REGISTER_TRIM[s.register] * TEMPO_TRIM[s.tempo];
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
            : 'The highlighted notes are the only melody notes that change between major and minor, and the chords under them change to match. Try minor, fast and high, then major, slow and low. For many listeners, tempo and register move the mood about as much as the mode does.';

    return (
        <div className="space-y-6">
            <PlayButton playing={player.playing} onClick={player.toggle} />
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
            {part === 'chord' ? (
                <>
                    <Segmented
                        label="Before the C chord"
                        value={leadIn}
                        onChange={(v) => {
                            setLeadIn(v);
                            setCurrent(-1);
                        }}
                        options={(Object.keys(LEAD_INS) as LeadIn[]).map((id) => ({ value: id, label: LEAD_INS[id].label }))}
                    />
                    <div>
                        <StepStrip current={current} steps={boxes.map((chord, i) => ({ key: `${leadIn}-${i}`, label: chord.name, focus: i === boxes.length - 1 }))} />
                        <p className="mt-2 text-xs leading-5 text-white/50">The C chord is played the same way every time.</p>
                    </div>
                </>
            ) : (
                <>
                    <Segmented
                        label="Mode"
                        value={mode}
                        onChange={setMode}
                        options={[
                            { value: 'major', label: 'Major' },
                            { value: 'minor', label: 'Minor' },
                        ]}
                    />
                    <div>
                        <NoteRoll
                            notes={melodyRoll(mode)}
                            slots={MELODY.length}
                            bars={[4, 8, 12]}
                            current={current}
                            label={`The melody in ${mode}. The notes in the accent are the ones that change between major and minor.`}
                        />
                        <p className="mt-2 text-xs text-white/50" aria-hidden="true">
                            Chords: {MELODY_CHORDS.map((c) => chordName(c, mode)).join(', ')}
                        </p>
                    </div>
                </>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
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
                <Segmented
                    label="Tempo"
                    value={tempo}
                    onChange={setTempo}
                    options={[
                        { value: 'slow', label: `Slow, ${TEMPO_BPM.slow} BPM` },
                        { value: 'fast', label: `Fast, ${TEMPO_BPM.fast} BPM` },
                    ]}
                />
            </div>
            <p className="text-sm leading-6 text-white/60">{hint}</p>
            <Announce on={hint} text={hint} />
        </div>
    );
}
