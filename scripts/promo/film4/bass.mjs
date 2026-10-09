// Film 4 bass engine: the pure sine sub, its parallel saturated copy, the
// phone check filter, and the analysis the picture draws from (harmonic
// levels by FFT, autocorrelation). Every number the film states about the
// bass is measured here, on the signal that is played.
import { RATE } from './dsp.mjs';

const TAU = Math.PI * 2;

/** Equal-tempered frequency of a note name like 'G#1'. */
export function hz(name) {
    const m = /^([A-G])(#?)(-?\d)$/.exec(name);
    const pc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
    const midi = 12 * (Number(m[3]) + 1) + pc;
    return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * One 808-style sub note, a pure sine: 12 ms raised-cosine attack (slow
 * enough that the onset adds no audible click above 200 Hz), exponential
 * decay, 40 ms raised-cosine release at the note's end.
 */
export function subNote(f0, dur, { decay = 0.9, attack = 0.012, release = 0.04 } = {}) {
    const n = Math.round((dur + release) * RATE);
    const x = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const t = i / RATE;
        let e = Math.exp(-t / decay);
        if (t < attack) e *= 0.5 - 0.5 * Math.cos((Math.PI * t) / attack);
        if (t > dur) e *= 0.5 + 0.5 * Math.cos((Math.PI * Math.min(1, (t - dur) / release)));
        x[i] = Math.sin(TAU * f0 * t) * e;
    }
    return x;
}

/**
 * A plucked bass string (Karplus-Strong), the "typical note": a real
 * harmonic stack at the same pitch as the sub.
 */
export function pluck(f0, dur) {
    const n = Math.round(dur * RATE);
    // The two-point average in the loop adds half a sample of delay.
    const D = RATE / f0 - 0.5;
    const L = Math.floor(D);
    const frac = D - L;
    const buf = new Float64Array(L + 2);
    // Excitation: the string's shape when plucked at 13% of its length, a
    // triangle, so harmonic n starts at sin(n·π·0.13)/n², as a real pluck.
    const peak = Math.round(0.13 * buf.length);
    for (let i = 0; i < buf.length; i++) buf[i] = i <= peak ? i / peak : (buf.length - 1 - i) / (buf.length - 1 - peak);
    let mean = 0;
    for (const v of buf) mean += v / buf.length;
    for (let i = 0; i < buf.length; i++) buf[i] -= mean;
    const out = new Float32Array(n);
    const off = L + 2;
    const line = new Float64Array(n + off);
    line.set(buf, 0);
    // Delay line read at a fractional delay (linear interpolation), averaged
    // with the sample before it, losing 0.2% per period.
    const at = (i, d) => line[i - d] * (1 - frac) + line[i - d - 1] * frac;
    for (let i = off; i < n + off; i++) line[i] = 0.998 * 0.5 * (at(i, L) + at(i, L + 1));
    for (let i = 0; i < n; i++) {
        const t = i / RATE;
        const fade = t > dur - 0.08 ? Math.max(0, (dur - t) / 0.08) : 1;
        out[i] = line[i] * fade;
    }
    return butter4(out, 'lp', 900);
}

// ── Filters ──
/** One RBJ biquad section, coefficients only. */
function coeffs(type, f, q) {
    const w = (TAU * f) / RATE;
    const al = Math.sin(w) / (2 * q);
    const c = Math.cos(w);
    const a0 = 1 + al;
    const b = type === 'hp' ? [(1 + c) / 2, -(1 + c), (1 + c) / 2] : [(1 - c) / 2, 1 - c, (1 - c) / 2];
    return { b: b.map((v) => v / a0), a: [(-2 * c) / a0, (1 - al) / a0] };
}
function runBiquad(x, { b, a }) {
    const y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
        const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[0] * y1 - a[1] * y2;
        x2 = x1;
        x1 = x[i];
        y2 = y1;
        y1 = v;
        y[i] = v;
    }
    return y;
}
/** 4th-order Butterworth (24 dB/oct): two biquads with Q 0.5412 and 1.3066. Returns a new array. */
export function butter4(x, type, f) {
    return runBiquad(runBiquad(x, coeffs(type, f, 0.541196)), coeffs(type, f, 1.306563));
}
/** Magnitude in dB of the 4th-order Butterworth high-pass at frequency f. */
export function butter4HpDb(f, fc) {
    const r = (f / fc) ** 4;
    return 20 * Math.log10(r / Math.sqrt(1 + r * r));
}
/** The lesson's small-speaker check: high-pass at 200 Hz, 24 dB per octave. */
export const PHONE_HZ = 200;
export const phone = (x) => butter4(x, 'hp', PHONE_HZ);

/** Saturation settings for the parallel copy (the lesson's step 3). */
export const SAT = { drive: 6, bias: 0.8, hp: 120 };
/**
 * Asymmetric soft clipper: a biased tanh with the bias's DC removed, so
 * both even and odd harmonics appear; then the DC the asymmetry leaves is
 * taken out with a 10 Hz one-pole high-pass, and the copy is high-passed at
 * 120 Hz (24 dB/oct) so only harmonics remain.
 */
export function saturateCopy(x, drive = SAT.drive) {
    const t0 = Math.tanh(SAT.bias);
    const y = Float32Array.from(x, (v) => Math.tanh(drive * v + SAT.bias) - t0);
    const a = Math.exp((-TAU * 10) / RATE);
    let px = 0;
    let py = 0;
    for (let i = 0; i < y.length; i++) {
        const v = y[i] - px + a * py;
        px = y[i];
        py = v;
        y[i] = v;
    }
    return butter4(y, 'hp', SAT.hp);
}

// ── Analysis ──
/** In-place iterative radix-2 FFT on (re, im). */
export function fft(re, im) {
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
        const ang = -TAU / len;
        const wr = Math.cos(ang);
        const wi = Math.sin(ang);
        for (let i = 0; i < n; i += len) {
            let cr = 1;
            let ci = 0;
            for (let k = 0; k < len / 2; k++) {
                const ar = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
                const ai = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
                re[i + k + len / 2] = re[i + k] - ar;
                im[i + k + len / 2] = im[i + k] - ai;
                re[i + k] += ar;
                im[i + k] += ai;
                const t = cr * wr - ci * wi;
                ci = cr * wi + ci * wr;
                cr = t;
            }
        }
    }
}

/**
 * Amplitude of each harmonic n * f0 (n = 1..count) in x around sample `c`:
 * a Hann window of `win` seconds centred on c (no lag), zero-padded to 16384
 * points, the peak magnitude within +-f0/4 of each harmonic, scaled so a
 * steady sine of amplitude A reads A.
 */
export function harmonics(x, c, f0, count = 12, win = 0.085) {
    const N = 16384;
    const w = Math.round(win * RATE);
    const re = new Float64Array(N);
    const im = new Float64Array(N);
    let wsum = 0;
    for (let k = 0; k < w; k++) {
        const h = 0.5 - 0.5 * Math.cos((TAU * k) / (w - 1));
        const i = c - (w >> 1) + k;
        re[k] = (i >= 0 && i < x.length ? x[i] : 0) * h;
        wsum += h;
    }
    fft(re, im);
    const bin = RATE / N;
    const out = [];
    for (let n = 1; n <= count; n++) {
        const lo = Math.max(1, Math.floor((n * f0 - f0 / 4) / bin));
        const hi = Math.ceil((n * f0 + f0 / 4) / bin);
        let m = 0;
        for (let k = lo; k <= hi; k++) m = Math.max(m, Math.hypot(re[k], im[k]));
        out.push((2 * m) / wsum);
    }
    return out;
}

/**
 * Normalised autocorrelation of x[a..b) at lags from `minLag` to `maxLag`
 * seconds; returns the lag (s) of the highest peak, refined by parabolic
 * interpolation, and the curve.
 */
export function autocorrPeak(x, a, b, minLag, maxLag) {
    const seg = x.subarray(a, b);
    let e0 = 0;
    for (const v of seg) e0 += v * v;
    const l0 = Math.round(minLag * RATE);
    const l1 = Math.round(maxLag * RATE);
    const r = new Float64Array(l1 + 2);
    for (let L = Math.max(1, l0 - 1); L <= l1 + 1; L++) {
        let s = 0;
        for (let i = 0; i + L < seg.length; i++) s += seg[i] * seg[i + L];
        r[L] = s / e0;
    }
    let best = l0;
    for (let L = l0; L <= l1; L++) if (r[L] > r[best]) best = L;
    const y0 = r[best - 1];
    const y1 = r[best];
    const y2 = r[best + 1];
    const d = (y0 - 2 * y1 + y2) !== 0 ? (0.5 * (y0 - y2)) / (y0 - 2 * y1 + y2) : 0;
    return { lag: (best + d) / RATE, r: y1 };
}
