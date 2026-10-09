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

/** Biquad with an explicit Q, cascaded for steeper Butterworth slopes. */
export function butter(x, type, hz, order = 4) {
    // Butterworth sections: Q of each second-order stage.
    const qs = { 2: [Math.SQRT1_2], 4: [0.5412, 1.3066], 8: [0.5098, 0.6013, 0.9000, 2.5629] }[order];
    for (const q of qs) biquad(x, type, hz, q);
    return x;
}

/** In-place radix-2 FFT on separate real and imaginary arrays (length a power of two). */
export function fft(re, im, inverse = false) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
        let bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
            [re[i], re[j]] = [re[j], re[i]];
            [im[i], im[j]] = [im[j], im[i]];
        }
    }
    for (let len = 2; len <= n; len <<= 1) {
        const ang = ((inverse ? 2 : -2) * Math.PI) / len;
        const wr = Math.cos(ang);
        const wi = Math.sin(ang);
        for (let i = 0; i < n; i += len) {
            let cr = 1;
            let ci = 0;
            for (let k = 0; k < len / 2; k++) {
                const a = i + k;
                const b = a + len / 2;
                const tr = re[b] * cr - im[b] * ci;
                const ti = re[b] * ci + im[b] * cr;
                re[b] = re[a] - tr;
                im[b] = im[a] - ti;
                re[a] += tr;
                im[a] += ti;
                const nr = cr * wr - ci * wi;
                ci = cr * wi + ci * wr;
                cr = nr;
            }
        }
    }
    if (inverse) for (let i = 0; i < n; i++) {
        re[i] /= n;
        im[i] /= n;
    }
}

/** Linear convolution of x with an impulse response h, by FFT. Output has x's length. */
export function convolve(x, h) {
    let n = 1;
    while (n < x.length + h.length) n <<= 1;
    const ar = new Float64Array(n);
    const ai = new Float64Array(n);
    const br = new Float64Array(n);
    const bi = new Float64Array(n);
    ar.set(x);
    br.set(h);
    fft(ar, ai);
    fft(br, bi);
    for (let i = 0; i < n; i++) {
        const r = ar[i] * br[i] - ai[i] * bi[i];
        ai[i] = ar[i] * bi[i] + ai[i] * br[i];
        ar[i] = r;
    }
    fft(ar, ai, true);
    return Float32Array.from(ar.subarray(0, x.length));
}

/**
 * Stereo-linked look-ahead peak limiter. The gain needed to keep every
 * sample under `ceilingDb` is looked up `lookMs` ahead (a running minimum),
 * released exponentially over `releaseMs`, then averaged over the look-ahead
 * window, so the gain is down before each peak arrives and never lets one
 * over. Returns the gain (linear, per sample); apply it to both channels.
 */
export function limiterGain(L, R, { ceilingDb = -1, lookMs = 5, releaseMs = 150 } = {}) {
    const n = L.length;
    const c = undb(ceilingDb);
    const look = Math.max(1, Math.round((lookMs / 1000) * RATE));
    const need = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const pk = Math.max(Math.abs(L[i]), Math.abs(R[i]));
        need[i] = pk > c ? c / pk : 1;
    }
    // Running minimum over [i, i + look] (monotonic deque).
    const gmin = new Float32Array(n);
    const q = new Int32Array(n);
    let h = 0;
    let t = 0;
    for (let i = n - 1; i >= 0; i--) {
        while (t > h && need[q[t - 1]] >= need[i]) t--;
        q[t++] = i;
        while (q[h] > i + look) h++;
        gmin[i] = need[q[h]];
    }
    const rel = 1 - Math.exp(-1 / ((releaseMs / 1000) * RATE));
    const env = new Float32Array(n);
    let e = 1;
    for (let i = 0; i < n; i++) {
        e = gmin[i] < e ? gmin[i] : e + (1 - e) * rel;
        env[i] = Math.min(e, 1);
    }
    // Average over the look-ahead window (ending at i): smooth attack, no overs.
    const out = new Float32Array(n);
    let s = 0;
    for (let i = 0; i < n; i++) {
        s += env[i];
        if (i >= look) s -= env[i - look];
        out[i] = s / Math.min(i + 1, look);
    }
    return out;
}
