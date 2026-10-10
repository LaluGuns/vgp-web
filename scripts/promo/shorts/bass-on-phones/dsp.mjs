// Small audio helpers for film 3: decode, filters, loudness, WAV out.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

export const RATE = 48000;
const TAU = Math.PI * 2;

/** Any audio file as 48 kHz stereo float: { L, R }. Decoded by ffmpeg. */
export function readAudio(file) {
    const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '2', '-ar', String(RATE), '-'], { maxBuffer: 1 << 30 });
    const all = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
    const n = all.length / 2;
    const L = new Float32Array(n);
    const R = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        L[i] = all[2 * i];
        R[i] = all[2 * i + 1];
    }
    return { L, R };
}

export function mulberry32(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** RBJ biquad, in place. type: 'lp' | 'hp' | 'bp'. */
export function biquad(x, type, hz, q = Math.SQRT1_2) {
    const w = (TAU * Math.min(hz, RATE * 0.45)) / RATE;
    const al = Math.sin(w) / (2 * q);
    const c = Math.cos(w);
    let b0, b1, b2;
    if (type === 'lp') [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
    else if (type === 'hp') [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
    else [b0, b1, b2] = [al, 0, -al];
    const a0 = 1 + al;
    const a1 = -2 * c;
    const a2 = 1 - al;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
        const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
        x2 = x1;
        x1 = x[i];
        y2 = y1;
        y1 = y;
        x[i] = y;
    }
    return x;
}

/** Seeded noise, band-limited to 11 kHz so clipping makes no inter-sample peaks. */
export function noise(n, seed) {
    const r = mulberry32(seed);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = Math.tanh(((r() + r() + r() - 1.5) / 0.5) * 0.9);
    return biquad(out, 'lp', 11000);
}

// ITU-R BS.1770 K-weighting at 48 kHz: high shelf, then high-pass.
export function kWeight(x) {
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

/**
 * K-weighted loudness in dB (LUFS-like, mono) of x between two times,
 * gated BS.1770 style on 400 ms blocks: absolute -70, then relative -10.
 */
export function loudness(x, from = 0, to = x.length / RATE) {
    const k = kWeight(x.subarray(Math.round(from * RATE), Math.round(to * RATE)));
    const block = Math.round(0.4 * RATE);
    const hop = Math.round(0.1 * RATE);
    const ms = [];
    for (let i = 0; i + block <= k.length; i += hop) {
        let s = 0;
        for (let j = i; j < i + block; j++) s += k[j] * k[j];
        ms.push(s / block);
    }
    if (!ms.length) {
        let s = 0;
        for (const v of k) s += v * v;
        ms.push(s / Math.max(1, k.length));
    }
    const lufs = (m) => -0.691 + 10 * Math.log10(m + 1e-20);
    const abs = ms.filter((m) => lufs(m) > -70);
    const mean = (a) => a.reduce((p, v) => p + v, 0) / Math.max(1, a.length);
    const rel = lufs(mean(abs)) - 10;
    return lufs(mean(abs.filter((m) => lufs(m) > rel)));
}

export const db = (v) => 20 * Math.log10(Math.max(v, 1e-12));
export const undb = (d) => 10 ** (d / 20);

/** 32-bit float stereo WAV. */
export function writeWav(file, L, R) {
    const n = L.length;
    const data = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
        data[2 * i] = L[i];
        data[2 * i + 1] = R[i];
    }
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + data.length * 4, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(3, 20);
    header.writeUInt16LE(2, 22);
    header.writeUInt32LE(RATE, 24);
    header.writeUInt32LE(RATE * 8, 28);
    header.writeUInt16LE(8, 32);
    header.writeUInt16LE(32, 34);
    header.write('data', 36);
    header.writeUInt32LE(data.length * 4, 40);
    fs.writeFileSync(file, Buffer.concat([header, Buffer.from(data.buffer)]));
}

/**
 * Ungated K-weighted level in dB of x between two times: the BS.1770
 * weighting without its -70 LUFS absolute gate, so a signal as quiet as a
 * sub through a phone filter still gets a number. Same scale as loudness().
 */
export function kLevel(x, from = 0, to = x.length / RATE) {
    const k = kWeight(x.subarray(Math.round(from * RATE), Math.round(to * RATE)));
    let s = 0;
    for (const v of k) s += v * v;
    return -0.691 + 10 * Math.log10(s / Math.max(1, k.length) + 1e-30);
}
