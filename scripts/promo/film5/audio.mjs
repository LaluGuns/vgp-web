// Film 5 soundtrack: the narration, the A/B drop from drop.mjs (version 1
// runs into the downbeat, version 2 has the 234 ms gap), a bed that carries
// the drop on under the voice, and small effects. Returns the stereo mix plus
// the data the picture draws from (levels, limiter gain, the two hearing
// models), so what is drawn is what is heard.
import fs from 'node:fs';
import path from 'node:path';
import { BEAT, BAR, GAP, PRE, measure, samples } from './drop.mjs';
import { biquad, butter, db, loudness, mulberry32, noise, RATE, readAudio, undb, writeWav } from './dsp.mjs';
import { TIMELINE } from './timeline.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
export const ASSETS = path.join(HERE, '../assets');
const CUES = JSON.parse(fs.readFileSync(path.join(HERE, 'vo-cues.json'), 'utf8'));

// Picture data resolution: one value per millisecond.
const VIS = 1000;
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


// Effect peak level in dB relative to the narration's loudness.
const FX_DB = { pop: 4, tick: 0, blink: -2, whoosh: 3, slide: 0, grab: 4, spring: 3, kick: 2 };

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
        return { id: p.id, at: p.at, dur: c.to - c.from - removed, from: c.from, to: c.to, cuts, text: c.show ?? c.text, breaks: c.breaks ?? [], words };
    });
}

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

const DETECT = 0.005;

/** Picture data for one version around its downbeat: WIN.from .. WIN.to seconds from it. */
export const WIN = { from: -2.5 * BEAT, to: 2 * BEAT };

/**
 * Forward masking as drawn (a model after Moore, 2012): the masker's level
 * (0..1 over a 40 dB range below the kick's peak), carried forward with a
 * weight that falls on a log-time curve from 1 at the masker's offset to 0 at
 * 200 ms, so most of it is gone after 100 ms and all of it by 200 ms.
 */
const FOG_MS = 200;
function fogModel(maskerDb) {
    const m = maskerDb.map((v) => Math.max(0, Math.min(1, (v + 40) / 40)));
    const w = Array.from({ length: FOG_MS + 1 }, (_, k) => 1 - Math.log10(1 + k / 10) / Math.log10(1 + FOG_MS / 10));
    const out = new Float32Array(m.length);
    for (let i = 0; i < out.length; i++) {
        let f = 0;
        for (let k = 0; k <= FOG_MS && k <= i; k++) f = Math.max(f, m[i - k] * w[k]);
        out[i] = f;
    }
    return out;
}

/**
 * Adaptation as drawn (a model after Moore, 2012): a nerve's firing rate is
 * highest at a sound's onset, sinks while it continues and recovers in
 * silence. Drive is the level in dB over a 40 dB range; adaptation follows the
 * drive within 40 ms and recovers over 150 ms. Returns { rate, sens } per ms.
 */
function adaptModel(levelDb) {
    const drive = levelDb.map((v) => Math.max(0, Math.min(1, (v + 40) / 40)));
    const rate = new Float32Array(drive.length);
    const sens = new Float32Array(drive.length);
    let a = 0;
    for (let i = 0; i < drive.length; i++) {
        const target = drive[i];
        a += (target - a) * (target > a ? 1 - Math.exp(-1 / 40) : 1 - Math.exp(-1 / 150));
        sens[i] = 1 - 0.75 * a;
        rate[i] = drive[i] * sens[i];
    }
    return { rate: Array.from(rate, (v) => Math.round(v * 1000) / 1000), sens: Array.from(sens, (v) => Math.round(v * 1000) / 1000) };
}

const round = (a, k = 10000) => Array.from(a, (v) => Math.round(v * k) / k);

export function renderAudio() {
    const S = samples();
    const L = new Float32Array(n);
    const R = new Float32Array(n);

    // ── Narration ──
    const voSrc = readAudio(path.join(ASSETS, 'vo', 'narration.wav'));
    const vo = new Float32Array(n);
    const placed = voPlacements();
    const fade = at(0.008);
    for (const p of placed) {
        const bounds = [Math.max(0, p.from - 0.03), ...p.cuts.flat(), Math.min(p.to + 0.08, voSrc.L.length / RATE)];
        let dst = p.at - 0.03;
        for (let k = 0; k < bounds.length; k += 2) {
            const piece = voSrc.L.slice(at(bounds[k]), at(bounds[k + 1]));
            for (let q = 0; q < fade; q++) {
                piece[q] *= q / fade;
                piece[piece.length - 1 - q] *= q / fade;
            }
            mixIn(vo, piece, dst);
            dst += piece.length / RATE;
        }
    }
    const sfxList = TIMELINE.sfx.map((s) => {
        if (!s.cue) return s;
        const p = placed.find((v) => v.id === s.cue[0]);
        const w = p?.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, '') === s.cue[1].toLowerCase());
        if (!w) throw new Error(`sfx cue ${s.cue.join('/')} not found`);
        return { ...s, at: w.s + (s.dt ?? 0) };
    });
    biquad(vo, 'hp', 70);
    const rawLufs = loudness(vo);
    voiceChain(vo, rawLufs);
    const voLufs = loudness(vo);

    // ── The A/B: both versions, matched at the drop bar's loudness ──
    const { res, v } = measure();
    const match = { 1: undb(res.matchOffsetDb), 2: 1 };
    // Demos sit 2 dB under the narration's loudness at the drop bar, so their
    // peaks (-1 dBFS inside the song, 13 dB over its loudness) land where the
    // voice's limiter puts speech peaks and the master never clips them.
    const dropLufs = res[2].dropLufs;
    const demoGain = undb(voLufs - 2 - dropLufs);
    const dL = new Float32Array(n);
    const dR = new Float32Array(n);
    for (const d of TIMELINE.demos) {
        const out = v[d.v].out;
        const a = at(PRE - d.pre * BEAT);
        const b = at(PRE + d.post * BEAT);
        const g = demoGain * match[d.v];
        const fi = at(0.004);
        const fo = at(0.03);
        for (let k = 0; k < b - a; k++) {
            const env = Math.min(1, k / fi, (b - a - k) / fo);
            const i = at(d.at) + k;
            dL[i] += out.L[a + k] * g * env;
            dR[i] += out.R[a + k] * g * env;
        }
    }

    // ── Bed: the drop's bass and stabs (version 2), low-passed, carrying the
    // song on under the voice; it stops for the replay and the button ──
    const bedSrc = { L: new Float32Array(at(BAR)), R: new Float32Array(at(BAR)) };
    for (const k of ['bass', 'stabs', 'verb']) {
        const p = v[2].parts[k];
        for (let i = 0; i < bedSrc.L.length; i++) {
            bedSrc.L[i] += p.L[at(PRE + BAR) + i];
            bedSrc.R[i] += p.R[at(PRE + BAR) + i];
        }
    }
    butter(bedSrc.L, 'lp', 1400, 2);
    butter(bedSrc.R, 'lp', 1400, 2);
    const bL = new Float32Array(n);
    const bR = new Float32Array(n);
    const bedFrom = TIMELINE.demos[1].at + (TIMELINE.demos[1].pre + TIMELINE.demos[1].post) * BEAT;
    const replay = TIMELINE.demos[2].at;
    const replayEnd = TIMELINE.demos[3].at + (TIMELINE.demos[3].pre + TIMELINE.demos[3].post) * BEAT;
    const segs = [[bedFrom, replay], [replayEnd, TIMELINE.button]];
    for (const [a, b] of segs) {
        for (let t = a; t < b - 0.01; t += BAR) {
            const len = Math.min(BAR, b - t);
            const piece = { L: bedSrc.L.slice(0, at(len)), R: bedSrc.R.slice(0, at(len)) };
            const xf = at(0.006);
            for (let q = 0; q < xf; q++) for (const c of ['L', 'R']) {
                piece[c][q] *= q / xf;
                piece[c][piece[c].length - 1 - q] *= q / xf;
            }
            mixIn(bL, piece.L, t);
            mixIn(bR, piece.R, t);
        }
    }
    const bedLufs = loudness(mono(bedSrc.L, bedSrc.R));
    const demoEnd = (d) => d.at + (d.pre + d.post) * BEAT;
    // -9 dB alone, -15 under the voice; the voice wins. Out under the demos.
    const voiceOn = (t) => placed.some((p) => t >= p.at - 0.12 && t <= p.at + p.dur + 0.25);
    const demoOn = (t) => TIMELINE.demos.some((d) => t >= d.at - 0.05 && t <= demoEnd(d) + 0.05);
    const bg = levelCurve((t) => (demoOn(t) || t > TIMELINE.button - 0.05 ? -60 : voiceOn(t) ? -15 : -9), 0.06);
    const bedTrim = voLufs - bedLufs;
    for (let i = 0; i < n; i++) {
        const g = undb(bedTrim) * bg[i];
        bL[i] *= g;
        bR[i] *= g;
    }

    // ── Effects ──
    const fx = new Float32Array(n);
    const fxL = new Float32Array(n);
    const fxR = new Float32Array(n);
    const semis = (k) => 2 ** (k / 12);
    sfxList.forEach((s, k) => {
        if (s.kind === 'kick') {
            mixIn(fxL, S.kick.L, s.at, undb(voLufs + 2) / 0.9, semis(3));
            mixIn(fxR, S.kick.R, s.at, undb(voLufs + 2) / 0.9, semis(3));
            return;
        }
        if (s.kind === 'swell') {
            // The reverse impact rising into the loop point.
            const len = at(s.to - s.at);
            const src = S.swell;
            let end = src.L.length - 1;
            while (end > 0 && Math.abs(src.L[end]) < 0.02) end--;
            for (const [c, dst] of [['L', fxL], ['R', fxR]]) {
                const piece = src[c].slice(Math.max(0, end - len), end);
                piece.forEach((x, j) => (piece[j] = x * (j / piece.length) ** 2));
                mixIn(dst, piece, s.to - piece.length / RATE, undb(voLufs - 4) / 0.5);
            }
            return;
        }
        if (s.kind === 'button') {
            // The KEYS Dusty one-shot up three semitones to D#, with the kick.
            const trim = voLufs - 6 - loudness(mono(S.note.L, S.note.R));
            mixIn(fxL, S.note.L, s.at, undb(trim), semis(3));
            mixIn(fxR, S.note.R, s.at, undb(trim), semis(3));
            mixIn(fxL, S.kick.L, s.at, undb(voLufs - 2) / 0.9, semis(3));
            mixIn(fxR, S.kick.R, s.at, undb(voLufs - 2) / 0.9, semis(3));
            return;
        }
        const buf = sfx(s.kind, 100 + k, s.level ?? 1);
        const pk = buf.reduce((p, x) => Math.max(p, Math.abs(x)), 0) / (s.level ?? 1);
        mixIn(fx, buf, s.at, undb(voLufs + FX_DB[s.kind]) / Math.max(pk, 1e-6));
    });

    // ── Sum ──
    for (let i = 0; i < n; i++) {
        L[i] = vo[i] + dL[i] + bL[i] + fx[i] + fxL[i];
        R[i] = vo[i] + dR[i] + bR[i] + fx[i] + fxR[i];
    }

    // ── What the picture draws, per version, around its downbeat ──
    const versions = {};
    for (const k of [1, 2]) {
        const r = v[k];
        const g = match[k];
        const a = PRE + WIN.from;
        const b = PRE + WIN.to;
        const m = (x) => mono(x.L, x.R).map((q) => q * g);
        const out = m(r.out);
        const kick = m(r.kick);
        const build = ['riser', 'swell', 'drums', 'stabs', 'verbBuild'].map((p) => m(r.parts[p]));
        // The build's sound (everything that was playing before the drop) up to the downbeat and its tails after it.
        const masker = new Float32Array(out.length);
        for (let i = 0; i < out.length; i++) {
            if (i < at(PRE)) masker[i] = out[i] - kick[i];
            else masker[i] = build[0][i] + build[1][i] + build[4][i] + (i < at(PRE) ? build[2][i] + build[3][i] : 0);
        }
        const peakOf = (x) => decimate(x.map(Math.abs), a, b, VIS);
        const envDb = (x) => decimate(rmsEnv(x, DETECT, true), a, b, VIS).map((q) => db(q));
        const refDb = Math.max(...envDb(kick));
        const maskDb = envDb(masker).map((q) => q - refDb);
        const mixDb = envDb(out).map((q) => q - refDb);
        const gr = decimate(Float32Array.from(r.gain, (q) => -db(q)), a, b, VIS);
        versions[k] = {
            peak: peakOf(out),
            kick: peakOf(kick),
            masker: peakOf(masker),
            gr,
            fog: round(fogModel(maskDb), 1000),
            ...adaptModel(mixDb),
        };
    }
    const claims = res.claims;
    const measures = { voLufs, voRawLufs: rawLufs, demoGainDb: db(demoGain), res };
    return {
        L,
        R,
        data: { rate: VIS, win: WIN, gapMs: GAP * 1000, versions, claims: JSON.parse(JSON.stringify(claims)), r1: { gr: res[1].grMean, kickDb: res[1].kickDb, clickDb: res[1].clickDb }, r2: { gr: res[2].grMean, kickDb: res[2].kickDb, clickDb: res[2].clickDb }, vo: placed, sfx: sfxList },
        measures,
    };
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
