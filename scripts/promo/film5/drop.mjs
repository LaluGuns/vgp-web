// Film 5's A/B: one 128 BPM build into one drop, rendered twice from the same
// Cymatics samples. Version 1 runs the build (drum loop, noise riser, crash
// swell, chord stabs and their reverb) straight into the downbeat, the way most
// bedroom drops do. Version 2 is sample for sample the same, except that every
// build source and the build's reverb return are cut one 8th note (234.4 ms)
// before the downbeat with 8 ms fades: lesson 030's experiment.
// Both go through the same look-ahead limiter on the song bus.
//
// Exports the two mixes, the stems the measurements need (the kick alone and
// everything else, both through the shared limiter gain) and the limiter's
// gain, so the film can draw what is heard.
import path from 'node:path';
import { biquad, butter, convolve, db, kWeight, loudness, mulberry32, RATE, readAudio, undb, limiterGain } from './dsp.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SAMPLES = path.join(HERE, '../assets/samples');

export const BPM = 128;
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;
export const STEP = BEAT / 4;
/** Gap lengths at 128 BPM, in seconds. */
export const NOTE = { n32: BEAT / 8, n16: BEAT / 4, n8: BEAT / 2, beat: BEAT };
/** Render layout: one warm-up bar, two build bars, the downbeat, two drop bars. */
export const PRE = 3 * BAR;
export const LEN = PRE + 2 * BAR + 1.0;
export const GAP = NOTE.n8;
const FADE = 0.008;

export const LIMITER = { ceilingDb: -1, lookMs: 5, releaseMs: 150 };

export const FILES = {
    kick: 'Cymatics - Diamonds Kick 2 - C.wav',
    clap: 'Cymatics - Diamonds Clap 7.wav',
    snare: 'Cymatics - Diamonds Snare 8 - D#.wav',
    hat: 'Cymatics - Closed Hihat 7 - Punchy.wav',
    build: 'Cymatics - FX Essentials Buildup Drum Loop 11 - 128 BPM.wav',
    riser: 'Cymatics - FX Essentials White Noise Riser 14 - 128 BPM.wav',
    swell: 'Cymatics - White Noise Reverse Impact.wav',
    crash: 'Cymatics - Diamonds Crash 4.wav',
    reese: 'Cymatics - Bullseye - 128 BPM D# Min Reese.wav',
    stab: 'Cymatics - PLUCK Serious (C).wav',
    pad: 'Cymatics - PLUCK Digital (C).wav',
    note: 'Cymatics - KEYS Dusty (C).wav',
};

const at = (t) => Math.round(t * RATE);
const mono = (s) => Float32Array.from(s.L, (v, i) => 0.5 * (v + s.R[i]));

let S = null;
export function samples() {
    if (S) return S;
    S = {};
    for (const [k, f] of Object.entries(FILES)) S[k] = readAudio(path.join(SAMPLES, f));
    return S;
}

/** Stereo track buffer. */
const track = () => ({ L: new Float32Array(at(LEN)), R: new Float32Array(at(LEN)) });

/** Add `src` (stereo) at time t, gain g, playback rate (pitch by speed), from source offset `from` for `dur` seconds. */
function put(dst, src, t, g = 1, { rate = 1, from = 0, dur = Infinity, pan = 0 } = {}) {
    const i0 = at(t);
    const s0 = from * RATE;
    const len = Math.min(Math.floor((src.L.length - 1 - s0) / rate), Number.isFinite(dur) ? at(dur) : Infinity);
    const gl = g * Math.min(1, 1 - pan);
    const gr = g * Math.min(1, 1 + pan);
    for (let k = 0; k < len; k++) {
        const i = i0 + k;
        if (i < 0) continue;
        if (i >= dst.L.length) break;
        const p = s0 + k * rate;
        const j = Math.floor(p);
        const f = p - j;
        dst.L[i] += (src.L[j] + (src.L[j + 1] - src.L[j]) * f) * gl;
        dst.R[i] += (src.R[j] + (src.R[j + 1] - src.R[j]) * f) * gr;
    }
}

/** Multiply a track by a gain curve g(t) (seconds), in place. */
function shape(tr, g) {
    for (let i = 0; i < tr.L.length; i++) {
        const v = g(i / RATE);
        tr.L[i] *= v;
        tr.R[i] *= v;
    }
}
function add(dst, src, g = 1) {
    for (let i = 0; i < dst.L.length; i++) {
        dst.L[i] += src.L[i] * g;
        dst.R[i] += src.R[i] * g;
    }
}

/** Gain that fades to zero over FADE ending `cut` and stays there until `open`. */
const muteFrom = (cut, open = Infinity) => (t) => (t < cut - FADE ? 1 : t < cut ? (cut - t) / FADE : t < open ? 0 : 1);

/** Stereo reverb impulse: decorrelated noise with a 2.2 s decay, darkened, with early density. */
function impulse(seed) {
    const rt60 = 2.2;
    const n = at(2.8);
    const r = mulberry32(seed);
    const h = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const t = i / RATE;
        h[i] = (r() * 2 - 1) * Math.exp((-6.91 * t) / rt60) * Math.min(1, t / 0.012);
    }
    biquad(h, 'lp', 7000);
    biquad(h, 'hp', 250);
    let e = 0;
    for (const v of h) e += v * v;
    return h.map((v) => v / Math.sqrt(e));
}
let IR = null;
function reverb(send) {
    IR ??= [impulse(31), impulse(77)];
    const pre = at(0.02);
    const shift = (x) => {
        const y = new Float32Array(x.length);
        y.set(x.subarray(0, x.length - pre), pre);
        return y;
    };
    const m = Float32Array.from(send.L, (v, i) => 0.5 * (v + send.R[i]));
    return { L: shift(convolve(m, IR[0])), R: shift(convolve(m, IR[1])) };
}

const semis = (n) => 2 ** (n / 12);
// D# minor: build on B major (VI) and C# major (VII), land on D# minor (i).
// Notes as semitones above the samples' C, voiced around middle C.
const CHORDS = { B: [-1, 3, 6], 'C#': [1, 5, 8], 'D#m': [3, 6, 10] };

/**
 * Both versions' tracks. `gap` true cuts every build source and the build's
 * reverb at the downbeat minus GAP.
 */
function arrange(gap) {
    const s = samples();
    const T0 = PRE;
    const cut = T0 - GAP;
    const tr = {};
    for (const k of ['kick', 'drums', 'riser', 'swell', 'stabs', 'bass', 'crash', 'sendBuild', 'sendDrop']) tr[k] = track();

    // ── Build (bars -3 .. -1) ──
    // Drum loop: bars 5 to 7 of Cymatics' build loop (its own gap at bar 8 is not used).
    put(tr.drums, s.build, T0 - 3 * BAR, undb(-4), { from: 4 * BAR, dur: 3 * BAR });
    // Noise riser: the last two bars of the 8-bar riser. Its loudest point lands
    // on the downbeat and its tail fades over the first 8th of the drop (lesson
    // 030's figure: the riser peaks at the drop and its tail runs on).
    put(tr.riser, s.riser, T0 - 2 * BAR + GAP, undb(RISER_DB), { from: 6 * BAR, dur: 2 * BAR });
    // Crash swell (reversed impact) ending on the downbeat.
    const sw = mono(s.swell);
    let swEnd = sw.length - 1;
    while (swEnd > 0 && Math.abs(sw[swEnd]) < 0.02) swEnd--;
    put(tr.swell, s.swell, T0 - swEnd / RATE, undb(-3));
    // Chord stabs on the off-beat 8ths: B for a bar, C# for a bar (16ths in its last beat).
    const stab = (t, chord, g) => {
        for (const n of CHORDS[chord]) {
            put(tr.stabs, s.stab, t, g * undb(-7), { rate: semis(n) });
            put(tr.stabs, s.pad, t, g * undb(-17), { rate: semis(n - 12) });
        }
    };
    for (let b = 0; b < 3; b++) {
        const chord = b < 2 ? 'B' : 'C#';
        for (let k = 0; k < (b === 2 ? 6 : 8); k++) stab(T0 - (3 - b) * BAR + k * 2 * STEP, chord, undb(-2 + b));
    }
    for (let k = 0; k < 4; k++) stab(T0 - BEAT + k * STEP, 'C#', undb(1));

    // ── Drop (from the downbeat) ──
    // Kick 2 (C) tuned up three semitones to D#.
    for (let k = 0; k < 9; k++) put(tr.kick, s.kick, T0 + k * BEAT, undb(0), { rate: semis(3) });
    const drums = track();
    for (let k = 0; k < 4; k++) put(drums, s.clap, T0 + (2 * k + 1) * BEAT, undb(-5));
    for (let k = 0; k < 8; k++) put(drums, s.hat, T0 + (k + 0.5) * BEAT, undb(-11), { pan: 0.15 });
    add(tr.drums, drums);
    put(tr.crash, s.crash, T0, undb(-20));
    butter(tr.crash.L, 'hp', 300, 2);
    butter(tr.crash.R, 'hp', 300, 2);
    // Reese bass from the loop's own first bar, ducked by the kick.
    put(tr.bass, s.reese, T0, undb(1), { dur: 2 * BAR + 1 });
    for (let k = 0; k < 16; k++) stab(T0 + (k + 0.5) * BEAT, 'D#m', undb(0));
    const duck = (t) => {
        if (t < T0) return 1;
        const p = ((t - T0) % BEAT) / BEAT;
        return undb(-9 * Math.max(0, 1 - p / 0.4) ** 1.5);
    };
    shape(tr.bass, duck);

    // ── Reverb: build sends (stabs, drums, riser, swell) and drop sends (stabs, clap) ──
    const buildPart = (x) => (t) => (t < T0 ? x : 0);
    for (const [k, g] of [['stabs', 0.55], ['drums', 0.25], ['riser', 0.3], ['swell', 0.3]]) {
        const tmp = track();
        add(tmp, tr[k], g);
        shape(tmp, buildPart(1));
        add(tr.sendBuild, tmp);
    }
    const dropSend = track();
    add(dropSend, tr.stabs, 0.4);
    add(dropSend, drums, 0.2);
    shape(dropSend, (t) => (t >= T0 ? 1 : 0));
    add(tr.sendDrop, dropSend);
    shape(tr.stabs, duck);

    shape(tr.riser, (t) => (t < T0 ? 1 : Math.max(0, 1 - (t - T0) / GAP) ** 2));
    if (gap) {
        // Version 2: every build source cut an 8th early with an 8 ms fade.
        for (const k of ['riser', 'swell']) shape(tr[k], muteFrom(cut));
        shape(tr.drums, muteFrom(cut, T0));
        shape(tr.stabs, muteFrom(cut, T0));
        // The build's sends stop at the cut too.
        shape(tr.sendBuild, muteFrom(cut));
    }
    const verbBuild = reverb(tr.sendBuild);
    const verbDrop = reverb(tr.sendDrop);
    // Version 2 also mutes the reverb return for the gap: the build's tail is cut.
    if (gap) shape(verbBuild, muteFrom(cut));
    tr.verb = track();
    add(tr.verb, verbBuild, undb(-3));
    add(tr.verb, verbDrop, undb(-3));
    tr.verbBuild = track();
    add(tr.verbBuild, verbBuild, undb(-3));
    return tr;
}

const STEMS = ['kick', 'drums', 'riser', 'swell', 'stabs', 'bass', 'crash', 'verb'];

/** Bus drive into the limiter: the same for both versions. */
export const DRIVE_DB = -1;
/** Riser level against its sample. */
export const RISER_DB = 0;

/**
 * Render one version: { bus (pre-limiter), out (after limiter), gain (limiter),
 * kick and rest (each times the limiter gain), parts (named stems after the
 * limiter gain) }.
 */
export function render(gap) {
    const tr = arrange(gap);
    const n = at(LEN);
    const bus = { L: new Float32Array(n), R: new Float32Array(n) };
    const drive = undb(DRIVE_DB);
    for (const k of STEMS) add(bus, tr[k], drive);
    const gain = limiterGain(bus.L, bus.R, LIMITER);
    const mul = (x) => ({ L: Float32Array.from(x.L, (v, i) => v * gain[i] * drive), R: Float32Array.from(x.R, (v, i) => v * gain[i] * drive) });
    const out = { L: Float32Array.from(bus.L, (v, i) => v * gain[i]), R: Float32Array.from(bus.R, (v, i) => v * gain[i]) };
    const kick = mul(tr.kick);
    const rest = { L: Float32Array.from(out.L, (v, i) => v - kick.L[i]), R: Float32Array.from(out.R, (v, i) => v - kick.R[i]) };
    const parts = Object.fromEntries([...STEMS, 'verbBuild'].map((k) => [k, mul(tr[k])]));
    return { bus, out, gain, kick, rest, parts, T0: PRE };
}

// ── Measurements ──
const monoOf = (x) => Float32Array.from(x.L, (v, i) => 0.5 * (v + x.R[i]));
const energy = (x, a, b) => {
    let s = 0;
    for (let i = at(a); i < at(b); i++) s += x[i] * x[i];
    return s / Math.max(1, at(b) - at(a));
};
const band = (x, lo, hi) => {
    const y = Float32Array.from(x);
    butter(y, 'hp', lo, 4);
    butter(y, 'lp', hi, 4);
    return y;
};
/** The phone check: 200 Hz high-pass, 24 dB per octave. */
export const phone = (x) => butter(Float32Array.from(x), 'hp', 200, 4);
/** A stricter small-speaker model: 500 Hz high-pass (24 dB/oct), a +4 dB resonance at 1 kHz, 10 kHz low-pass. */
export const speakerSmall = (x) => {
    const y = butter(Float32Array.from(x), 'hp', 500, 4);
    const r = biquad(Float32Array.from(y), 'bp', 1000, 1);
    for (let i = 0; i < y.length; i++) y[i] += (10 ** (4 / 20) - 1) * r[i];
    return butter(y, 'lp', 10000, 2);
};

/** Loudness of the drop bar (downbeat plus one bar), K-weighted, gated. */
export const dropLoudness = (x) => loudness(x, PRE, PRE + BAR);

/**
 * Everything section 3 of the brief asks for, for both versions.
 * CLICK is the first 20 ms after the downbeat.
 */
export function measure() {
    const v = { 1: render(false), 2: render(true) };
    const T0 = PRE;
    const CLICK = 0.02;
    const res = { limiter: LIMITER, driveDb: DRIVE_DB, gapMs: GAP * 1000, fadeMs: FADE * 1000 };
    for (const k of [1, 2]) {
        const r = v[k];
        const grDb = Array.from(r.gain.subarray(at(T0), at(T0 + CLICK)), (g) => -db(g));
        const grBefore = -db(r.gain[at(T0) - 1]);
        const out = monoOf(r.out);
        const kick = monoOf(r.kick);
        const rest = monoOf(r.rest);
        res[k] = {
            grMean: grDb.reduce((a, b) => a + b, 0) / grDb.length,
            grMax: Math.max(...grDb),
            grBefore,
            dropLufs: dropLoudness(out),
            // Claim 2: click band, kick against everything else, first 20 ms.
            clickDb: 10 * Math.log10(energy(band(kick, 2000, 6000), T0, T0 + CLICK) / energy(band(rest, 2000, 6000), T0, T0 + CLICK)),
            clickPhoneDb: 10 * Math.log10(energy(band(phone(kick), 2000, 6000), T0, T0 + CLICK) / energy(band(phone(rest), 2000, 6000), T0, T0 + CLICK)),
            clickSmallDb: 10 * Math.log10(energy(band(speakerSmall(kick), 2000, 6000), T0, T0 + CLICK) / energy(band(speakerSmall(rest), 2000, 6000), T0, T0 + CLICK)),
            // What the build leaves in the gap (the last 8th before the downbeat), dB under the drop bar.
            gapDb: 10 * Math.log10(energy(kWeight(out).map(Number), T0 - GAP + 0.01, T0)) + 0.691 - dropLoudness(out),
            // The build's last bar against the drop bar, both before the limiter: is the build a fair one?
            buildVsDropDb: loudness(monoOf(r.bus), T0 - BAR, T0) - loudness(monoOf(r.bus), T0, T0 + BAR),
        };
    }
    // Matching: version 1 is turned to the drop-bar loudness of version 2.
    const off = res[2].dropLufs - res[1].dropLufs;
    res.matchOffsetDb = off;
    for (const k of [1, 2]) {
        const r = v[k];
        const g = k === 1 ? off : 0;
        const kick = monoOf(r.kick);
        const lvl = (x) => 10 * Math.log10(energy(x, T0, T0 + CLICK)) + g;
        // Claim 1, as heard: the kick's own level in the output over the click window, full band and phone band.
        res[k].kickDb = lvl(kick);
        res[k].kickPhoneDb = lvl(phone(kick));
        res[k].kickSmallDb = lvl(speakerSmall(kick));
        // Claim 4: the first kick (K-weighted, first 50 ms) over the drop bar's loudness, at matched loudness.
        const kk = kWeight(kick);
        res[k].kickOverBar = -0.691 + 10 * Math.log10(energy(kk, T0, T0 + 0.05)) - res[k].dropLufs;
    }
    const d = (key) => res[2][key] - res[1][key];
    res.claims = {
        1: { what: 'Limiter gain reduction on the first kick (mean over its first 20 ms), v1 minus v2', db: res[1].grMean - res[2].grMean },
        2: { what: 'Kick click 2-6 kHz over everything else in that band, first 20 ms, v2 minus v1', db: d('clickDb') },
        3: {
            what: 'Through the phone filter (200 Hz high-pass, 24 dB/oct): claim 1 as the kick level heard, claim 2 as before',
            kickFull: d('kickDb'),
            kickPhone: d('kickPhoneDb'),
            survive1: d('kickPhoneDb') / d('kickDb'),
            clickPhone: d('clickPhoneDb'),
            survive2: d('clickPhoneDb') / d('clickDb'),
            // The stricter small-speaker model, reported alongside (not part of the pass rule set by the brief).
            kickSmall: d('kickSmallDb'),
            clickSmall: d('clickSmallDb'),
        },
        4: { what: 'First kick (K-weighted, 50 ms) over the drop bar loudness, at matched loudness, v2 minus v1', db: d('kickOverBar') },
    };
    return { res, v };
}
