// Film 3 soundtrack: the narration, Cymatics drums through the compressor
// the picture shows, the Nightfall keys loop as a bed, and small effects.
// Returns the stereo mix plus the data the picture draws from (levels, gain
// reduction, hit times), so what is drawn is what is heard.
import fs from 'node:fs';
import path from 'node:path';
import { compress } from '../film/model.mjs';
import { biquad, db, loudness, mulberry32, noise, RATE, readAudio, undb, writeWav } from './dsp.mjs';
import { SETTINGS, TIMELINE } from './timeline.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
export const ASSETS = path.join(HERE, '../assets');
const CUES = JSON.parse(fs.readFileSync(path.join(HERE, 'vo-cues.json'), 'utf8'));

// Detector: RMS over 3 ms of the mono sum, centred so it has no lag (the
// lesson's model reads the envelope itself). The level the compressor reacts to.
const DETECT = 0.003;
// Picture data resolution.
const VIS = 1000;
const SLOW_VIS = 4000;

const n = Math.ceil(TIMELINE.duration * RATE);
const at = (t) => Math.round(t * RATE);

function mixIn(dst, src, t0, gain = 1, rate = 1) {
    const i0 = at(t0);
    if (rate === 1) {
        for (let k = 0; k < src.length && i0 + k < dst.length; k++) if (i0 + k >= 0) dst[i0 + k] += src[k] * gain;
        return;
    }
    // Resampled playback (pitch shift by speed), linear interpolation.
    const len = Math.floor((src.length - 1) / rate);
    for (let k = 0; k < len && i0 + k < dst.length; k++) {
        const p = k * rate;
        const j = Math.floor(p);
        dst[i0 + k] += (src[j] + (src[j + 1] - src[j]) * (p - j)) * gain;
    }
}

/** RMS over `win` seconds; `centred` puts the window around each sample, so the level has no lag. */
function rmsEnv(mono, win = DETECT, centred = false) {
    const w = Math.round(win * RATE);
    const out = new Float32Array(mono.length);
    const lag = centred ? Math.floor(w / 2) : 0;
    let s = 0;
    for (let i = 0; i < mono.length + lag; i++) {
        if (i < mono.length) s += mono[i] * mono[i];
        if (i >= w) s -= mono[i - w] * mono[i - w];
        if (i - lag >= 0) out[i - lag] = Math.sqrt(Math.max(0, s) / w);
    }
    return out;
}

function mono(L, R) {
    const m = new Float32Array(L.length);
    for (let i = 0; i < L.length; i++) m[i] = 0.5 * (L[i] + R[i]);
    return m;
}

/** Average x over blocks so the picture gets `rate` values per second. */
function decimate(x, from, to, rate) {
    const step = RATE / rate;
    const len = Math.round((to - from) * rate);
    const out = new Array(len);
    for (let k = 0; k < len; k++) {
        const a = Math.round(from * RATE + k * step);
        let m = 0;
        for (let j = a; j < a + step && j < x.length; j++) m = Math.max(m, x[j]);
        out[k] = Math.round(m * 10000) / 10000;
    }
    return out;
}

export function hitsOf(demo) {
    const step = TIMELINE.bar / 16;
    const out = [];
    for (let b = 0; b < demo.bars; b++)
        for (const [voice, steps] of Object.entries(TIMELINE.pattern))
            for (const s of steps) out.push({ voice, t: demo.at + b * TIMELINE.bar + s * step, demo: demo.id });
    return out.sort((a, b) => a.t - b.t || a.voice.localeCompare(b.voice));
}

const VELOCITY = { kick: 1, snare: 1, hat: 0.5, hatSoft: 0.3 };
// Effect peak level in dB relative to the narration's loudness.
const FX_DB = { pop: 4, tick: 0, blink: -2, whoosh: 3, slide: 0, grab: 4, spring: 3 };

/** Placed narration lines: { id, at, dur, words: [{ w, s, e }] } in film time. */
export function voPlacements() {
    return TIMELINE.vo.map((p) => {
        const c = CUES.segments.find((s) => s.id === p.id);
        if (!c) throw new Error(`no cue ${p.id}`);
        // Cuts (source seconds) come out of the line: words inside are dropped,
        // words after move up.
        const cuts = c.cuts ?? [];
        const removed = cuts.reduce((a, [x, y]) => a + (y - x), 0);
        const shift = (src) => cuts.reduce((a, [x, y]) => a + (src >= y ? y - x : 0), 0);
        const inCut = (src) => cuts.some(([x, y]) => src > x && src < y);
        // A kept word that starts inside a cut starts where the cut ends.
        const clampOut = (src) => cuts.reduce((v, [x, y]) => (v > x && v < y ? y : v), src);
        const place = (src) => p.at + clampOut(src) - c.from - shift(clampOut(src));
        const words = c.words.filter((w) => !inCut(c.from + (w.s + w.e) / 2)).map((w) => ({ w: w.w, s: place(c.from + w.s), e: place(c.from + w.e) }));
        return { id: p.id, at: p.at, dur: c.to - c.from - removed, from: c.from, to: c.to, cuts, text: c.show ?? c.text, words };
    });
}

/** Gain over time from a target level in dB, sampled every 10 ms and glided. */
function levelCurve(targetDb, smooth = 0.08) {
    const g = new Float32Array(n);
    const a = Math.exp(-1 / (smooth * RATE));
    const hop = at(0.01);
    let target = targetDb(0);
    let y = target;
    for (let i = 0; i < n; i++) {
        if (i % hop === 0) target = targetDb(i / RATE);
        y = a * y + (1 - a) * target;
        g[i] = undb(y);
    }
    return g;
}

function sfx(kind, seed, level = 1, to = 0) {
    const r = mulberry32(seed);
    const len = (s) => Math.round(s * RATE);
    if (kind === 'pop') {
        const m = len(0.09);
        const x = new Float32Array(m);
        let ph = 0;
        for (let k = 0; k < m; k++) {
            const t = k / RATE;
            ph += (2 * Math.PI * (720 * Math.exp(-t / 0.03) + 320)) / RATE;
            x[k] = Math.sin(ph) * Math.min(1, t / 0.002) * Math.exp(-t / 0.025) * 0.22;
        }
        return x.map((v) => v * level);
    }
    if (kind === 'tick') {
        const x = biquad(noise(len(0.03), seed), 'hp', 2500);
        return x.map((v, k) => v * Math.exp(-k / RATE / 0.004) * 0.12 * level);
    }
    if (kind === 'blink') {
        const x = new Float32Array(len(0.16));
        for (const t0 of [0, 0.08]) for (let k = 0; k < len(0.05); k++) {
            const t = k / RATE;
            x[len(t0) + k] += Math.sin(2 * Math.PI * 1500 * t) * Math.exp(-t / 0.012) * 0.06;
        }
        return x.map((v) => v * level);
    }
    if (kind === 'whoosh' || kind === 'slide') {
        const dur = kind === 'whoosh' ? 0.5 : 0.35;
        const m = len(dur);
        const src = noise(m, seed);
        // Band-pass swept by processing in short blocks.
        const out = new Float32Array(m);
        const blk = 256;
        for (let i = 0; i < m; i += blk) {
            const p = i / m;
            const hz = kind === 'whoosh' ? 300 + 2600 * Math.sin(Math.PI * p) : 2400 * (1 - p) + 500;
            const seg = biquad(src.slice(i, i + blk), 'bp', hz, 1.2);
            out.set(seg, i);
        }
        const peak = kind === 'whoosh' ? 0.5 : 0.2;
        return out.map((v, k) => v * Math.sin(Math.PI * Math.min(1, k / m)) ** (kind === 'whoosh' ? 1.5 : 0.7) * 0.35 * level * (k / m < peak ? 1 : 1));
    }
    if (kind === 'grab') {
        const m = len(0.12);
        const x = new Float32Array(m);
        const cl = biquad(noise(m, seed), 'bp', 1800, 2);
        for (let k = 0; k < m; k++) {
            const t = k / RATE;
            x[k] = Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t / 0.03) * 0.16 + cl[k] * Math.exp(-t / 0.006) * 0.2;
        }
        return x.map((v) => v * level);
    }
    if (kind === 'spring') {
        const m = len(0.6);
        const x = new Float32Array(m);
        let ph = 0;
        for (let k = 0; k < m; k++) {
            const t = k / RATE;
            const hz = 230 + 120 * Math.sin(2 * Math.PI * 14 * t) * Math.exp(-t / 0.2) + 160 * (1 - Math.exp(-t / 0.15));
            ph += (2 * Math.PI * hz) / RATE;
            x[k] = (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * Math.min(1, t / 0.004) * Math.exp(-t / 0.16) * 0.12;
        }
        return x.map((v) => v * level);
    }
    void r;
    void to;
    return new Float32Array(0);
}

/**
 * Speech leveller, in place: RMS compressor (3:1 above loudness + 4 dB,
 * 5 ms attack, 100 ms release), then a 2 ms look-ahead limiter with its
 * ceiling 11 dB over the loudness.
 */
function voiceChain(x, lufs) {
    const env = rmsEnv(x, 0.01);
    const thr = lufs + 4;
    const aA = Math.exp(-1 / (0.005 * RATE));
    const aR = Math.exp(-1 / (0.1 * RATE));
    let g = 0;
    for (let i = 0; i < x.length; i++) {
        const over = db(env[i]) - thr;
        const target = over > 0 ? over * (1 - 1 / 3) : 0;
        g = (target > g ? aA : aR) * g + (1 - (target > g ? aA : aR)) * target;
        x[i] *= undb(-g);
    }
    const ceil = undb(lufs + 11);
    const look = Math.round(0.002 * RATE);
    const rel = 1 - Math.exp(-1 / (0.06 * RATE));
    // Forward-looking peak over the look-ahead window (monotonic deque).
    const need = new Float32Array(x.length);
    const q = [];
    for (let i = x.length - 1; i >= 0; i--) {
        while (q.length && Math.abs(x[q[q.length - 1]]) <= Math.abs(x[i])) q.pop();
        q.push(i);
        while (q[0] > i + look) q.shift();
        const pk = Math.abs(x[q[0]]);
        need[i] = pk > ceil ? ceil / pk : 1;
    }
    let gl = 1;
    for (let i = 0; i < x.length; i++) {
        gl = need[i] < gl ? need[i] : gl + (1 - gl) * rel;
        x[i] *= Math.min(gl, need[i]);
    }
}

export function renderAudio(wavPath) {
    const S = {};
    for (const [k, f] of Object.entries(TIMELINE.samples)) S[k] = readAudio(path.join(ASSETS, 'samples', f));
    const L = new Float32Array(n);
    const R = new Float32Array(n);

    // ── Narration ──
    const voSrc = readAudio(path.join(ASSETS, 'vo', 'narration.mp3'));
    const vo = new Float32Array(n);
    const placed = voPlacements();
    const fade = at(0.008);
    for (const p of placed) {
        // A little room either side of the measured pause, inside the silence;
        // cuts are joined with short crossfades.
        const bounds = [Math.max(0, p.from - 0.03), ...p.cuts.flat(), Math.min(p.to + 0.08, voSrc.L.length / RATE)];
        let dst = p.at - 0.03;
        for (let k = 0; k < bounds.length; k += 2) {
            const piece = voSrc.L.slice(at(bounds[k]), at(bounds[k + 1]));
            const xf = k === 0 ? fade : at(0.012);
            const xl = k + 2 >= bounds.length ? fade : at(0.012);
            for (let q = 0; q < xf; q++) piece[q] *= q / xf;
            for (let q = 0; q < xl; q++) piece[piece.length - 1 - q] *= q / xl;
            mixIn(vo, piece, dst);
            dst += piece.length / RATE - (k + 2 < bounds.length ? 0.012 : 0);
        }
    }
    // Cue-tied effects (and dry hits) land on their word.
    const sfxList = TIMELINE.sfx.map((s) => {
        if (!s.cue) return s;
        const p = placed.find((v) => v.id === s.cue[0]);
        const w = p?.words.filter((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === s.cue[1].toLowerCase())[0];
        if (!w) throw new Error(`sfx cue ${s.cue.join('/')} not found`);
        return { ...s, at: w.s + (s.dt ?? 0) };
    });
    // Rumble out, then the usual voice chain: a gentle compressor and a
    // look-ahead peak limiter, so speech peaks sit about 11 dB over its
    // loudness and the master never has to clip the voice.
    biquad(vo, 'hp', 70);
    const rawLufs = loudness(vo);
    voiceChain(vo, rawLufs);
    const voLufs = loudness(vo);

    // ── Drums through the compressor ──
    const dL = new Float32Array(n);
    const dR = new Float32Array(n);
    const hits = TIMELINE.demos.flatMap(hitsOf);
    const dryHits = sfxList.filter((s) => s.kind === 'hit').map((s) => ({ voice: 'snare', t: s.at, demo: null, level: s.level ?? 1 }));
    for (const h of [...hits, ...dryHits]) {
        mixIn(dL, S[h.voice].L, h.t, VELOCITY[h.voice] * (h.level ?? 1));
        mixIn(dR, S[h.voice].R, h.t, VELOCITY[h.voice] * (h.level ?? 1));
    }
    // Scale the detector so the snare's crack reads 1.0.
    const snareEnv = rmsEnv(mono(S.snare.L, S.snare.R), DETECT, true);
    const ref = Math.max(...snareEnv);
    const env = rmsEnv(mono(dL, dR), DETECT, true).map((v) => v / ref);
    const demoAt = new Int16Array(n).fill(-1);
    TIMELINE.demos.forEach((d, j) => demoAt.fill(j, at(d.at), at(d.at + d.bars * TIMELINE.bar + 0.35)));
    // Each demo's compressor is warmed up on one bar of the same groove, so
    // it starts where it would be in the middle of a song, not from rest.
    const gr = new Float32Array(n);
    const barN = at(TIMELINE.bar);
    for (const d of TIMELINE.demos) {
        const a = at(d.at);
        const b = Math.min(n, at(d.at + d.bars * TIMELINE.bar + 0.35));
        const run = new Float32Array(barN + b - a);
        run.set(env.subarray(a, a + barN), 0);
        run.set(env.subarray(a, b), barN);
        gr.set(compress(run, RATE, () => SETTINGS[d.comp]).subarray(barN), a);
    }

    // Makeup per demo: the compressed bar matches the plain bar's loudness,
    // the lesson's "judge at matched level".
    const plain = mono(dL, dR);
    const comp = plain.map((v, i) => v * undb(-gr[i]));
    const makeup = TIMELINE.demos.map((d) => loudness(plain, d.at, d.at + TIMELINE.bar) - loudness(comp, d.at, d.at + TIMELINE.bar));
    // Plain drums sit 4 dB under the narration: a drum loop has about 20 dB
    // between its loudness and its peaks, and at this level the 30 ms crack
    // reaches the master ceiling with little rounding.
    const drumTrim = voLufs - 4 - loudness(plain, TIMELINE.demos[0].at, TIMELINE.demos[0].at + TIMELINE.bar);
    const demoEnd = (d) => d.at + d.bars * TIMELINE.bar;
    const mk = levelCurve((t) => {
        const j = demoAt[at(t)];
        if (j < 0) return 0;
        const d = TIMELINE.demos[j];
        return makeup[j] - (d.under && t > demoEnd(d) - d.under ? 9 : 0);
    }, 0.001);
    for (let i = 0; i < n; i++) {
        const g = undb(-gr[i] + drumTrim) * mk[i];
        dL[i] *= g;
        dR[i] *= g;
    }

    // ── Keys bed: loops every four bars, lower under the voice ──
    const bed = TIMELINE.bed;
    const loopLen = 4 * TIMELINE.bar;
    const bL = new Float32Array(n);
    const bR = new Float32Array(n);
    for (let t = bed.from; t < bed.to; t += loopLen) {
        const end = Math.min(S.keys.L.length, at(bed.to - t));
        mixIn(bL, S.keys.L.subarray(0, end), t);
        mixIn(bR, S.keys.R.subarray(0, end), t);
    }
    const keysLufs = loudness(mono(bL, bR), bed.from, bed.from + loopLen);
    // -9 dB alone, -11 under a demo, -15 under the voice; the voice wins.
    const voiceOn = (t) => placed.some((p) => t >= p.at - 0.12 && t <= p.at + p.dur + 0.25);
    const demoOn = (t) => TIMELINE.demos.some((d) => t >= d.at && t <= demoEnd(d) + 0.3);
    const bg = levelCurve((t) => (t > bed.to - 0.3 ? -60 : voiceOn(t) ? -15 : demoOn(t) ? -11 : -9), 0.12);
    const bedTrim = voLufs - keysLufs;
    for (let i = 0; i < n; i++) {
        const g = undb(bedTrim) * bg[i];
        bL[i] *= g;
        bR[i] *= g;
    }

    // ── Effects ──
    const fx = new Float32Array(n);
    const fxL = new Float32Array(n);
    const fxR = new Float32Array(n);
    sfxList.forEach((s, k) => {
        if (s.kind === 'hit') return;
        if (s.kind === 'crash') {
            mixIn(fxL, S.crash.L, s.at, undb(drumTrim - 6));
            mixIn(fxR, S.crash.R, s.at, undb(drumTrim - 6));
            return;
        }
        if (s.kind === 'swell') {
            // The crash reversed, rising into the downbeat.
            const len = at(s.to - s.at);
            for (const [src, dst] of [[S.crash.L, fxL], [S.crash.R, fxR]]) {
                const rev = src.slice(0, len).reverse();
                biquad(rev, 'lp', 5000);
                rev.forEach((v, j) => (rev[j] = v * (j / len) ** 2));
                mixIn(dst, rev, s.to - rev.length / RATE, undb(drumTrim - 14));
            }
            return;
        }
        if (s.kind === 'button') {
            // The last note: the Dusty keys one-shot, down a tone to A sharp, with a kick.
            const rate = 2 ** (-2 / 12);
            const trim = voLufs - 6 - loudness(mono(S.note.L, S.note.R));
            mixIn(fxL, S.note.L, s.at, undb(trim), rate);
            mixIn(fxR, S.note.R, s.at, undb(trim), rate);
            mixIn(fxL, S.kick.L, s.at, undb(drumTrim - 3));
            mixIn(fxR, S.kick.R, s.at, undb(drumTrim - 3));
            return;
        }
        // Effects peak a few dB over the voice's loudness, well under its peaks.
        const buf = sfx(s.kind, 100 + k, s.level ?? 1);
        const pk = buf.reduce((p, v) => Math.max(p, Math.abs(v)), 0) / (s.level ?? 1);
        mixIn(fx, buf, s.at, undb(voLufs + FX_DB[s.kind]) / Math.max(pk, 1e-6));
    });

    // ── Sum ──
    const mL = new Float32Array(n);
    const mR = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        mL[i] = vo[i] + dL[i] + bL[i] + fx[i] + fxL[i];
        mR[i] = vo[i] + dR[i] + bR[i] + fx[i] + fxR[i];
    }
    const tail = at(1.2);
    for (let k = 0; k < tail; k++) {
        const g = (k / tail) ** 2;
        mL[n - 1 - k] *= g;
        mR[n - 1 - k] *= g;
    }
    if (wavPath) writeWav(wavPath, mL, mR);

    // ── What the picture draws ──
    const gain = Float32Array.from(gr, (v) => undb(-v));
    const out = env.map((v, i) => v * gain[i]);
    const demos = TIMELINE.demos.map((d, j) => {
        const to = d.at + d.bars * TIMELINE.bar;
        return { id: d.id, at: d.at, to, comp: d.comp, makeupDb: Math.round(makeup[j] * 10) / 10, env: decimate(env, d.at, to, VIS), out: decimate(out, d.at, to, VIS), gr: decimate(gr, d.at, to, VIS) };
    });
    // One snare alone through FAST and SLOW, for the slow-motion scenes.
    const sn = snareEnv.map((v) => v / ref);
    const lone = {};
    for (const k of ['FAST', 'SLOW']) {
        const g = compress(sn, RATE, () => SETTINGS[k]);
        lone[k] = { gr: decimate(g, 0, 0.25, SLOW_VIS), out: decimate(sn.map((v, i) => v * undb(-g[i])), 0, 0.25, SLOW_VIS) };
    }
    const snare = { rate: SLOW_VIS, env: decimate(sn, 0, 0.25, SLOW_VIS), ...lone };
    // Each demo's snares up close (150 ms from the onset): level in, level out
    // before makeup. The picture multiplies by makeupDb for what you hear.
    for (const d of demos) {
        d.zooms = hits.filter((h) => h.demo === d.id && h.voice === 'snare').map((h) => ({ t: h.t, env: decimate(env, h.t, h.t + 0.15, SLOW_VIS), out: decimate(out, h.t, h.t + 0.15, SLOW_VIS), gr: decimate(gr, h.t, h.t + 0.15, SLOW_VIS) }));
    }
    const measures = {
        voLufs,
        voRawLufs: rawLufs,
        drumTrimDb: drumTrim,
        bedTrimDb: bedTrim,
        makeupDb: Object.fromEntries(TIMELINE.demos.map((d, j) => [d.id, Math.round(makeup[j] * 10) / 10])),
        crackBody: crackBody(sn),
    };
    return { L: mL, R: mR, data: { rate: VIS, demos, snare, hits: [...hits, ...dryHits], vo: placed }, measures };
}

/**
 * What each attack leaves of one snare: crack (first 15 ms) over body (25 to
 * 70 ms), RMS, in dB, before and after the compressor. The gap between FAST
 * and SLOW is the difference the hook asks the viewer to hear.
 */
function crackBody(sn) {
    const rms = (x, a, b) => {
        let q = 0;
        const i0 = Math.round(a * RATE);
        const i1 = Math.round(b * RATE);
        for (let i = i0; i < i1; i++) q += x[i] * x[i];
        return Math.sqrt(q / (i1 - i0));
    };
    const ratio = (x) => db(rms(x, 0, 0.015) / rms(x, 0.025, 0.07));
    const res = { plain: ratio(sn) };
    for (const k of ['FAST', 'SLOW']) {
        const g = compress(sn, RATE, () => SETTINGS[k]);
        res[k] = ratio(sn.map((v, i) => v * undb(-g[i])));
    }
    return Object.fromEntries(Object.entries(res).map(([k, v]) => [k, Math.round(v * 10) / 10]));
}

/**
 * Master: gain into a soft clipper, then a 17 kHz low-pass. A limiter's
 * release would duck the body after each crack, the sound the film argues
 * against, so peaks are rounded instead.
 */
export function master(L, R, gainDb, ceilingDb, wavPath) {
    const g = undb(gainDb);
    const c = undb(ceilingDb);
    const k = c * 0.75;
    const clip = (x) => {
        const a = Math.abs(x);
        return a <= k ? x : Math.sign(x) * (k + (c - k) * Math.tanh((a - k) / (c - k)));
    };
    const oL = Float32Array.from(L, (v) => clip(v * g));
    const oR = Float32Array.from(R, (v) => clip(v * g));
    biquad(oL, 'lp', 17000);
    biquad(oR, 'lp', 17000);
    writeWav(wavPath, oL, oR);
}
