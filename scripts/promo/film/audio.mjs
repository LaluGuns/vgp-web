// Soundtrack: the drum loop through the compressor the picture shows, a
// three-note motif on the key idea and at the end, and a soft tick on each
// setting change. Seeded noise, so every run writes the same samples.
import fs from 'node:fs';
import { buildModel, hits, knobGain, VOICES } from './model.mjs';

const RATE = 48000;
const TAU = Math.PI * 2;

function mulberry32(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** One-pole high-pass, in place. */
function highpass(x, hz) {
    const a = Math.exp((-TAU * hz) / RATE);
    let px = 0;
    let py = 0;
    for (let i = 0; i < x.length; i++) {
        const y = a * (py + x[i] - px);
        px = x[i];
        py = y;
        x[i] = y;
    }
    return x;
}

// Gaussian-ish noise with its rare spikes rounded off, so the peak level
// tracks the envelope instead of the luck of the draw.
// Band-limited to 11 kHz: full-band noise near Nyquist makes inter-sample
// peaks several dB above the sample peaks once it is clipped.
function noise(n, seed) {
    const r = mulberry32(seed);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = Math.tanh(((r() + r() + r() - 1.5) / 0.5) * 0.9);
    return lowpass(out, 11000);
}

/** Second-order Butterworth low-pass (RBJ), in place. */
function lowpass(x, hz) {
    const w = (TAU * hz) / RATE;
    const al = Math.sin(w) / Math.SQRT2;
    const c = Math.cos(w);
    const a0 = 1 + al;
    const b0 = (1 - c) / 2 / a0;
    const b1 = (1 - c) / a0;
    const a1 = (-2 * c) / a0;
    const a2 = (1 - al) / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
        const y = b0 * x[i] + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2;
        x2 = x1;
        x1 = x[i];
        y2 = y1;
        y1 = y;
        x[i] = y;
    }
    return x;
}

// One sample buffer per voice, shaped so its level follows VOICES[voice].
function voiceBuffer(voice, seed) {
    const v = VOICES[voice];
    const n = Math.round(RATE * 1.2);
    const out = new Float32Array(n);
    const onset = (dt) => Math.min(1, dt / 0.001);
    if (voice === 'kick') {
        const click = highpass(noise(n, seed), 1500);
        let ph = 0;
        for (let i = 0; i < n; i++) {
            const dt = i / RATE;
            const f = 48 + 120 * Math.exp(-dt / 0.035);
            ph += (TAU * f) / RATE;
            out[i] = onset(dt) * (v.body * Math.exp(-dt / v.bodyTau) * Math.sin(ph) + v.crack * Math.exp(-dt / v.crackTau) * click[i] * 1.6);
        }
    } else if (voice === 'snare') {
        const hiss = highpass(noise(n, seed), 900);
        for (let i = 0; i < n; i++) {
            const dt = i / RATE;
            const tone = Math.sin(TAU * 188 * dt) * 0.55 + Math.sin(TAU * 331 * dt) * 0.25;
            out[i] = onset(dt) * (v.crack * Math.exp(-dt / v.crackTau) * hiss[i] * 1.2 + v.body * Math.exp(-dt / v.bodyTau) * (hiss[i] * 0.75 + tone * 0.5));
        }
    } else {
        const hiss = highpass(highpass(noise(n, seed), 6000), 6000);
        for (let i = 0; i < n; i++) {
            const dt = i / RATE;
            out[i] = onset(dt) * v.body * Math.exp(-dt / v.bodyTau) * hiss[i] * 2.2;
        }
    }
    return out;
}

/** A noise sweep that rises into `t1` over `dur` seconds: the build before the key idea. */
function riser(out, t1, dur, level) {
    const i0 = Math.round((t1 - dur) * RATE);
    const n = Math.round(dur * RATE);
    const r = noise(n, 41);
    let y = 0;
    for (let k = 0; k < n; k++) {
        const x = k / n;
        const hz = 400 * (8000 / 400) ** x;
        const a = 1 - Math.exp((-TAU * hz) / RATE);
        y += a * (r[k] - y);
        out[i0 + k] += level * x ** 2.2 * y;
    }
}

/** A low hit on a downbeat: a falling sine and a short burst. */
function impact(out, t0, level) {
    const i0 = Math.round(t0 * RATE);
    const n = Math.round(0.9 * RATE);
    const r = noise(n, 43);
    let ph = 0;
    for (let k = 0; k < n && i0 + k < out.length; k++) {
        const dt = k / RATE;
        ph += (TAU * (38 + 40 * Math.exp(-dt / 0.08))) / RATE;
        out[i0 + k] += level * (Math.min(1, dt / 0.002) * Math.exp(-dt / 0.32) * Math.sin(ph) + 0.35 * Math.exp(-dt / 0.05) * r[k]);
    }
}

/** Soft bell: a sine plus an inharmonic partial, slow decay. */
function bell(out, t0, hz, level) {
    const i0 = Math.round(t0 * RATE);
    const n = Math.round(RATE * 2.4);
    for (let k = 0; k < n && i0 + k < out.length; k++) {
        const dt = k / RATE;
        const env = Math.min(1, dt / 0.004) * Math.exp(-dt / 0.7);
        out[i0 + k] += level * env * (Math.sin(TAU * hz * dt) + 0.28 * Math.sin(TAU * hz * 2.76 * dt) * Math.exp(-dt / 0.25));
    }
}

/**
 * The bed: A, F sharp minor, D, E, two bars each, as a soft pad with a sine
 * bass. It sits outside the compressor so it never pumps, and it carries the
 * key of the motif. The drums stay the subject.
 */
const CHORDS = [
    { bass: 55.0, pad: [220.0, 277.18, 329.63] },
    { bass: 46.25, pad: [220.0, 277.18, 369.99] },
    { bass: 36.71, pad: [220.0, 293.66, 369.99] },
    { bass: 41.2, pad: [207.65, 246.94, 329.63] },
];

/** The bed is silent during the hook and swells in on the next downbeat. */
function bedLevel(TL, t) {
    const first = TL.scenes.find((s) => s.bed);
    if (!first) return 0;
    const start = (first.bar - 1) * TL.bar;
    return t < start ? 0 : Math.min(1, (t - start) / 0.25);
}

function pad(out, TL) {
    const barN = Math.round(TL.bar * RATE);
    const ph = [0, 0, 0, 0, 0];
    for (let i = 0; i < out.length; i++) {
        const t = i / RATE;
        const bar = Math.floor(i / barN);
        const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];
        const inBar = (i % barN) / RATE;
        const inChord = ((i % (2 * barN)) / RATE);
        // Pad swells on each chord; bass restarts each bar with a soft pluck.
        const swell = Math.min(1, inChord / 0.35) * (0.8 + 0.2 * Math.exp(-inChord / 1.5));
        const pluck = Math.min(1, inBar / 0.012) * (0.55 + 0.45 * Math.exp(-inBar / 0.6));
        const intro = bedLevel(TL, t);
        let v = 0;
        chord.pad.forEach((hz, k) => {
            ph[k] += (TAU * hz * (1 + 0.002 * Math.sin(TAU * 0.25 * t + k * 1.7))) / RATE;
            v += 0.08 * swell * (Math.sin(ph[k]) + 0.22 * Math.sin(2 * ph[k]) + 0.08 * Math.sin(3 * ph[k]));
        });
        ph[4] += (TAU * chord.bass) / RATE;
        v += 0.34 * pluck * (Math.sin(ph[4]) + 0.25 * Math.sin(2 * ph[4]));
        out[i] += v * intro;
    }
}

function tick(out, t0, level) {
    const i0 = Math.round(t0 * RATE);
    const n = Math.round(RATE * 0.03);
    const r = highpass(noise(n, 99), 2500);
    for (let k = 0; k < n && i0 + k < out.length; k++) out[i0 + k] += level * Math.exp(-k / RATE / 0.004) * r[k];
}

export function renderAudio(TL, wavPath) {
    const M = buildModel(TL, RATE);
    const n = Math.ceil(TL.duration * RATE);
    const bus = new Float32Array(n);
    // Two takes per voice, alternated, so repeated hits are not identical.
    const takes = { kick: [voiceBuffer('kick', 1), voiceBuffer('kick', 2)], snare: [voiceBuffer('snare', 3), voiceBuffer('snare', 4)], hat: [voiceBuffer('hat', 5), voiceBuffer('hat', 6)], ghost: [voiceBuffer('ghost', 7), voiceBuffer('ghost', 8)] };
    const count = { kick: 0, snare: 0, hat: 0, ghost: 0 };
    for (const h of hits(TL)) {
        const buf = takes[h.voice][count[h.voice]++ % 2];
        const i0 = Math.round(h.t * RATE);
        for (let k = 0; k < buf.length && i0 + k < n; k++) bus[i0 + k] += buf[k];
    }
    // Compressor gain as computed by the model.
    for (let i = 0; i < n; i++) bus[i] *= 10 ** (-M.gr[i] / 20);
    // Makeup gain per scene so each compressed scene has the loudness of the
    // uncompressed loop (K-weighted, as LUFS measures it): the lesson's
    // "judge at matched level". Glides 20 ms between scenes.
    const makeupDb = loudnessMatch(TL, bus, M.idx);
    const glide = Math.exp(-1 / (0.02 * RATE));
    let makeup = 0;
    for (let i = 0; i < n; i++) {
        makeup = glide * makeup + (1 - glide) * makeupDb[M.idx[i]];
        bus[i] *= 10 ** (makeup / 20) * knobGain(TL, i / RATE);
    }
    const mix = new Float32Array(n);
    for (let i = 0; i < n; i++) mix[i] = bus[i] * 0.5;
    pad(mix, TL);
    // Motif: A, C sharp, E on eighth notes. Plays when the crack first gets
    // through, and returns, resolved up to A, under the call to action.
    const eighth = TL.bar / 8;
    for (const s of TL.scenes.filter((x) => x.motif)) {
        const t0 = (s.bar - 1) * TL.bar;
        [440, 554.37, 659.25].forEach((hz, k) => bell(mix, t0 + k * eighth, hz, 0.06));
        if (s.id === 'cta') bell(mix, t0 + 3 * eighth, 880, 0.07);
    }
    // A build and a hit on the key idea, and a hit under the end card.
    for (const s of TL.scenes) {
        const t0 = (s.bar - 1) * TL.bar;
        if (s.riser) riser(mix, t0, TL.bar / 2, 0.12);
        if (s.riser || s.impact) impact(mix, t0, 0.32);
    }
    // A tick where a setting changes: the moments the viewer should notice.
    TL.scenes.forEach((s, k) => {
        const prev = TL.scenes[k - 1];
        if (s.comp && prev && JSON.stringify(s.comp) !== JSON.stringify(prev.comp)) tick(mix, (s.bar - 1) * TL.bar, 0.05);
    });
    // Fade the last 0.8 s.
    const fade = Math.round(0.8 * RATE);
    for (let k = 0; k < fade; k++) mix[n - 1 - k] *= k / fade;
    writeWav(wavPath, mix);
    return { samples: n, makeupDb, mix };
}

/**
 * Master: a gain stage into a soft clipper. Clipping only rounds the few
 * milliseconds of each loud crack; a limiter would also duck the body after
 * it, which is the fast-attack sound the film argues against.
 * `knee` is where rounding starts and `ceiling` the most it can reach.
 */
export function master(mix, gainDb, ceilingDb, wavPath) {
    const g = 10 ** (gainDb / 20);
    const c = 10 ** (ceilingDb / 20);
    const k = c * 0.75;
    const out = new Float32Array(mix.length);
    for (let i = 0; i < mix.length; i++) {
        const x = mix[i] * g;
        const a = Math.abs(x);
        out[i] = a <= k ? x : Math.sign(x) * (k + (c - k) * Math.tanh((a - k) / (c - k)));
    }
    // Smooth the clipper's products above the hearing range of a phone.
    lowpass(out, 17000);
    // Delivered as stereo with both channels equal at -3 dB each, the same
    // loudness as the mono mix. Mastering measures this file, so the
    // true-peak limit applies to what ships.
    writeWav(wavPath, out, 2, Math.SQRT1_2);
    return out;
}

// ITU-R BS.1770 K-weighting at 48 kHz: high shelf, then high-pass.
function kWeight(x) {
    const stages = [
        { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [-1.69065929318241, 0.73248077421585] },
        { b: [1.0, -2.0, 1.0], a: [-1.99004745483398, 0.99007225036621] },
    ];
    let y = Float64Array.from(x);
    for (const { b, a } of stages) {
        const out = new Float64Array(y.length);
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        for (let i = 0; i < y.length; i++) {
            const v = b[0] * y[i] + b[1] * x1 + b[2] * x2 - a[0] * y1 - a[1] * y2;
            x2 = x1;
            x1 = y[i];
            y2 = y1;
            y1 = v;
            out[i] = v;
        }
        y = out;
    }
    return y;
}

/** Makeup in dB per scene: uncompressed scenes (after the first bar) set the reference. */
function loudnessMatch(TL, bus, idx) {
    const k = kWeight(bus);
    const sum = TL.scenes.map(() => 0);
    const cnt = TL.scenes.map(() => 0);
    for (let i = 0; i < k.length; i++) {
        sum[idx[i]] += k[i] * k[i];
        cnt[idx[i]]++;
    }
    const ms = sum.map((v, j) => v / Math.max(1, cnt[j]));
    // Reference: the plain loop, not the scene with the fader move.
    const ref = TL.scenes.map((s, j) => (!s.comp && s.view !== 'knob' ? j : -1)).filter((j) => j >= 0);
    const refMs = ref.reduce((a, j) => a + ms[j], 0) / ref.length;
    return TL.scenes.map((s, j) => (s.comp ? 10 * Math.log10(refMs / ms[j]) : 0));
}

/** 32-bit float WAV; `channels` copies of x, each scaled by `scale`. */
function writeWav(file, x, channels = 1, scale = 1) {
    const data = new Float32Array(x.length * channels);
    for (let i = 0; i < x.length; i++) for (let c = 0; c < channels; c++) data[i * channels + c] = x[i] * scale;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + data.length * 4, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(3, 20);
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(RATE, 24);
    header.writeUInt32LE(RATE * 4 * channels, 28);
    header.writeUInt16LE(4 * channels, 32);
    header.writeUInt16LE(32, 34);
    header.write('data', 36);
    header.writeUInt32LE(data.length * 4, 40);
    fs.writeFileSync(file, Buffer.concat([header, Buffer.from(data.buffer)]));
}
