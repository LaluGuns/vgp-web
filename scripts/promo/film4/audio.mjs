// Film 4 soundtrack: the narration, a sine sub bass line (clean, or with a
// parallel saturated copy), Cymatics drums, the Nightfall keys as a vamp,
// a plucked note and small effects. The music bus goes through the lesson's
// phone check filter (200 Hz high-pass, 24 dB/oct); the voice never does.
// Returns the stereo mix plus the data the picture draws from (harmonic
// levels by FFT, the phone's waveform, measured periods), so what is drawn
// is what is heard.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { autocorrPeak, butter4HpDb, harmonics, hz, phone, pluck, saturateCopy, subNote } from './bass.mjs';
import { biquad, db, kLevel, loudness, noise, RATE, readAudio, undb, writeWav } from './dsp.mjs';
import { TIMELINE } from './timeline.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
export const ASSETS = path.join(HERE, '../assets');
const CUES = JSON.parse(fs.readFileSync(path.join(HERE, 'vo-cues.json'), 'utf8'));

/**
 * The narration as the film uses it: the ElevenLabs take, 10% slower, by
 * Rubber Band (formants and pitch kept, crisp transients), so the lesson
 * reads at a teaching pace without a new generation. Built from
 * assets/vo/narration.mp3 when missing; vo-cues.json is cued on this file.
 */
export const VO_TAKE = path.join(ASSETS, 'vo', 'narration.mp3');
export const VO_FILE = path.join(ASSETS, 'vo', 'narration-slow.wav');
export const VO_STRETCH = 'rubberband=tempo=0.9:transients=crisp:formant=preserved:pitchq=quality:window=standard:channels=together';
export function narrationFile() {
    if (!fs.existsSync(VO_FILE)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', VO_TAKE, '-af', VO_STRETCH, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', VO_FILE]);
    return VO_FILE;
}

const n = Math.ceil(TIMELINE.duration * RATE);
const at = (t) => Math.round(t * RATE);
const STEP = TIMELINE.bar / 16;
const CYCLE = 2 * TIMELINE.bar;
/** Harmonics analysed and drawn. */
export const NH = 10;
/** Picture data rate for the spectrum (one analysis per video frame). */
const FR = TIMELINE.fps;
/** Waveform rate for the scope. */
const SCOPE_RATE = 12000;

function mixIn(dst, src, t0, gain = 1, rate = 1) {
    const i0 = at(t0);
    if (rate === 1) {
        for (let k = 0; k < src.length && i0 + k < dst.length; k++) if (i0 + k >= 0) dst[i0 + k] += src[k] * gain;
        return;
    }
    // Resampled playback (pitch shift by speed), linear interpolation.
    const len = Math.floor((src.length - 1) / rate);
    for (let k = 0; k < len && i0 + k < dst.length; k++) {
        if (i0 + k < 0) continue;
        const p = k * rate;
        const j = Math.floor(p);
        dst[i0 + k] += (src[j] + (src[j + 1] - src[j]) * (p - j)) * gain;
    }
}

function rmsEnv(x, win) {
    const w = Math.round(win * RATE);
    const out = new Float32Array(x.length);
    let s = 0;
    for (let i = 0; i < x.length; i++) {
        s += x[i] * x[i];
        if (i >= w) s -= x[i - w] * x[i - w];
        out[i] = Math.sqrt(Math.max(0, s) / w);
    }
    return out;
}

function mono(L, R) {
    const m = new Float32Array(L.length);
    for (let i = 0; i < L.length; i++) m[i] = 0.5 * (L[i] + R[i]);
    return m;
}

/** Placed narration lines: { id, at, dur, words: [{ w, s, e }] } in film time. */
export function voPlacements() {
    return TIMELINE.vo.map((p) => {
        const c = CUES.segments.find((s) => s.id === p.id);
        if (!c) throw new Error(`no cue ${p.id}`);
        const words = c.words.map((w) => ({ w: w.w, s: p.at + w.s, e: p.at + w.e }));
        return { id: p.id, at: p.at, dur: c.to - c.from, from: c.from, to: c.to, text: c.show ?? c.text, breaks: c.breaks ?? [], words };
    });
}
const PLACED = voPlacements();
const normW = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
/** The beat a sentence belongs to: 'air-2' and 'hook-b1' are beats 'air' and 'hook-b'. */
export const beatOf = (id) => id.replace(/-?\d+$/, '');
/** Film time of a cue: `cue: [beat, word]` plus `dt`, or a plain `at`. */
export function cueTime(s) {
    if (!s.cue) return s.at;
    const words = PLACED.filter((v) => v.id === s.cue[0] || beatOf(v.id) === s.cue[0]).flatMap((v) => v.words);
    const w = words.find((x) => normW(x.w) === normW(s.cue[1]));
    if (!w) throw new Error(`cue ${s.cue.join('/')} not found`);
    return w.s + (s.dt ?? 0);
}

/** Start of the vamp cycle playing at t (bar 1 of the vamp starts there). */
export function cycleStart(t) {
    const s = TIMELINE.vampSync.filter((x) => x <= t + 1e-9).pop() ?? TIMELINE.gridOrigin;
    return s + Math.floor((t - s) / CYCLE + 1e-9) * CYCLE;
}
/** Vamp bar (0 or 1) at t. */
export const vampBar = (t) => ((t - cycleStart(t)) >= TIMELINE.bar - 1e-9 ? 1 : 0);

/** A value that is a number or a ramp { cue, dt, to, v } (smoothstep from 0 to v). */
function ramp(spec, t) {
    if (typeof spec === 'number') return spec;
    const t0 = cueTime(spec);
    const k = Math.min(1, Math.max(0, (t - t0) / spec.to));
    return spec.v * k * k * (3 - 2 * k);
}

/** Every bass note in the film: { t, dur, name, f0, seg }. */
export function bassNotes() {
    const out = [];
    for (const seg of TIMELINE.bass) {
        const first = TIMELINE.gridOrigin + Math.floor((seg.from - TIMELINE.gridOrigin) / TIMELINE.bar) * TIMELINE.bar;
        for (let B = first; B < seg.to - 1e-9; B += TIMELINE.bar) {
            const bar = vampBar(B + 1e-3);
            for (const [s, len, name] of TIMELINE.riff[bar]) {
                const t = B + s * STEP;
                if (t < seg.from - 1e-9 || t >= seg.to - 1e-9) continue;
                const dur = Math.min(len * STEP - 0.02, seg.to - t - 0.02);
                out.push({ t, dur, name, f0: hz(name), seg: seg.id });
            }
        }
    }
    return out;
}

const VELOCITY = { kick: 1, snare: 1, hat: 0.5, hatSoft: 0.3 };
// Effect peak level in dB relative to the narration's loudness.
const FX_DB = { pop: 4, tick: 0, blink: -2, whoosh: 3, thud: 3, shimmer: -1 };

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

function sfx(kind, seed, level = 1) {
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
    if (kind === 'whoosh') {
        const m = len(0.5);
        const src = noise(m, seed);
        const out = new Float32Array(m);
        const blk = 256;
        for (let i = 0; i < m; i += blk) {
            const p = i / m;
            const seg = biquad(src.slice(i, i + blk), 'bp', 300 + 2600 * Math.sin(Math.PI * p), 1.2);
            out.set(seg, i);
        }
        return out.map((v, k) => v * Math.sin(Math.PI * Math.min(1, k / m)) ** 1.5 * 0.35 * level);
    }
    if (kind === 'thud') {
        // A small cone hitting its stop: a short knock with a rattle.
        const m = len(0.14);
        const x = new Float32Array(m);
        const cl = biquad(noise(m, seed), 'bp', 2200, 2);
        for (let k = 0; k < m; k++) {
            const t = k / RATE;
            x[k] = Math.sin(2 * Math.PI * 310 * t) * Math.min(1, t / 0.001) * Math.exp(-t / 0.02) * 0.2 + cl[k] * Math.exp(-t / 0.008) * 0.25;
        }
        return x.map((v) => v * level);
    }
    if (kind === 'shimmer') {
        // A soft three-partial chime, for the moment a missing note "appears".
        const m = len(1.1);
        const x = new Float32Array(m);
        for (const [f, a, d] of [[932.3, 0.1, 0.5], [1396.9, 0.07, 0.4], [1864.7, 0.05, 0.3]])
            for (let k = 0; k < m; k++) {
                const t = k / RATE;
                x[k] += Math.sin(2 * Math.PI * f * t) * a * Math.min(1, t / 0.01) * Math.exp(-t / d);
            }
        return x.map((v) => v * level);
    }
    return new Float32Array(0);
}

/**
 * Speech leveller, in place: RMS compressor (3:1 above loudness + 4 dB,
 * 5 ms attack, 100 ms release), then a 2 ms look-ahead limiter with its
 * ceiling 9.5 dB over the loudness.
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
    const ceil = undb(lufs + 9.5);
    const look = Math.round(0.002 * RATE);
    const rel = 1 - Math.exp(-1 / (0.06 * RATE));
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

    // ── Narration ──
    const voSrc = readAudio(narrationFile());
    const vo = new Float32Array(n);
    const fade = at(0.008);
    for (const p of PLACED) {
        const piece = voSrc.L.slice(at(Math.max(0, p.from - 0.03)), at(Math.min(p.to + 0.08, voSrc.L.length / RATE)));
        for (let q = 0; q < fade; q++) {
            piece[q] *= q / fade;
            piece[piece.length - 1 - q] *= q / fade;
        }
        mixIn(vo, piece, p.at - 0.03);
    }
    biquad(vo, 'hp', 70);
    const rawLufs = loudness(vo);
    voiceChain(vo, rawLufs);
    const voLufs = loudness(vo);
    const voiceOn = (t) => PLACED.some((p) => t >= p.at - 0.12 && t <= p.at + p.dur + 0.2);
    const sfxList = TIMELINE.sfx.map((s) => ({ ...s, at: cueTime(s) }));

    // ── Bass: the clean sub, its saturated copy, blended ──
    const notes = bassNotes();
    const clean = new Float32Array(n);
    for (const nt of notes) mixIn(clean, subNote(nt.f0, nt.dur), nt.t);
    const copy = saturateCopy(clean);
    // The demo at t; a note's release just past a demo's end still belongs to it.
    const segAt = (t) => TIMELINE.bass.find((s) => t >= s.from && t < s.to) ?? TIMELINE.bass.find((s) => t >= s.from && t < s.to + 0.3);
    const blendAt = (t) => {
        const s = segAt(t);
        return s ? ramp(s.blend, t) : 0;
    };
    // Level match: the saturated version (blend 0.5) has the same full-range
    // K-weighted loudness as the clean sub, on the same two bars.
    const hc = TIMELINE.bass.find((s) => s.id === 'hookClean');
    const ref0 = hc.from + 1;
    const blendTest = clean.map((v, i) => v + 0.5 * copy[i]);
    const matchDb = loudness(clean, ref0, ref0 + CYCLE) - loudness(blendTest, ref0, ref0 + CYCLE);
    const boostAt = (t) => {
        const s = segAt(t);
        return s?.boostDb ? ramp({ ...s.boostDb, v: s.boostDb.db }, t) : 0;
    };
    const bassG = levelCurve((t) => matchDb * (blendAt(t) / 0.5) + boostAt(t), 0.01);
    const bl = new Float32Array(n);
    for (let i = 0; i < n; i += 480) {
        const v = blendAt(i / RATE);
        bl.fill(v, i, Math.min(n, i + 480));
    }
    const bassRaw = new Float32Array(n);
    for (let i = 0; i < n; i++) bassRaw[i] = (clean[i] + bl[i] * copy[i]) * bassG[i];

    // ── The plucked note ──
    const pl = new Float32Array(n);
    const plucks = TIMELINE.plucks.map((p) => ({ ...p, t: cueTime(p), f0: hz(p.note) }));
    for (const p of plucks) mixIn(pl, pluck(p.f0, p.dur), p.t);

    // ── Drums, in the demos that have them ──
    const dL = new Float32Array(n);
    const dR = new Float32Array(n);
    const hits = [];
    for (const seg of TIMELINE.bass.filter((s) => s.drums)) {
        const first = TIMELINE.gridOrigin + Math.floor((seg.from - TIMELINE.gridOrigin) / TIMELINE.bar) * TIMELINE.bar;
        for (let B = first; B < seg.to - 1e-9; B += TIMELINE.bar)
            for (const [voice, steps] of Object.entries(TIMELINE.pattern))
                for (const s of steps) {
                    const t = B + s * STEP;
                    if (t >= seg.from - 1e-9 && t < seg.to - 1e-9) hits.push({ voice, t, seg: seg.id });
                }
    }
    hits.sort((a, b) => a.t - b.t);
    for (const h of hits) {
        mixIn(dL, S[h.voice].L, h.t, VELOCITY[h.voice]);
        mixIn(dR, S[h.voice].R, h.t, VELOCITY[h.voice]);
    }

    // ── Keys: the loop's first two bars as a vamp, restarted on each sync ──
    const bL = new Float32Array(n);
    const bR = new Float32Array(n);
    const bed = TIMELINE.bed;
    const cut = at(CYCLE);
    const xf = at(0.015);
    const starts = [];
    for (let c = cycleStart(bed.from); c < bed.to; ) {
        starts.push(c);
        const next = c + CYCLE;
        const sync = TIMELINE.vampSync.find((s) => s > c + 1e-9 && s < next - 1e-9);
        c = sync ?? next;
    }
    starts.forEach((c, k) => {
        const end = Math.min(k + 1 < starts.length ? starts[k + 1] : bed.to, bed.to);
        const len = Math.min(cut, at(end - c) + xf);
        for (const [src, dst] of [[S.keys.L, bL], [S.keys.R, bR]]) {
            const piece = src.slice(0, len);
            for (let q = 0; q < xf; q++) piece[piece.length - 1 - q] *= q / xf;
            mixIn(dst, piece, c);
        }
    });

    // ── Levels ──
    // The saturated bass, through the phone, sits 5 dB under the narration
    // in its demos; the clean bass gets the same gain (they are level-matched
    // before the phone filter). Drums through the phone sit 6 dB under it.
    const hs = TIMELINE.bass.find((s) => s.id === 'hookSat');
    const bassPhoneRaw = phone(bassRaw);
    const bassTrim = voLufs - 5 - loudness(bassPhoneRaw, hs.from, hs.to);
    const drumsPhone = phone(mono(dL, dR));
    const drumTrim = voLufs - 6 - loudness(drumsPhone, ref0, ref0 + CYCLE);
    const keysLufs = loudness(mono(bL, bR), ref0, ref0 + CYCLE);
    const bedTrim = voLufs - keysLufs;
    const plTrim = voLufs - 10 - loudness(phone(pl), plucks[0].t, plucks[0].t + 2);
    // The pluck as the track carries it (for the picture): its fundamental
    // 3 dB under the clean sub's, so the two stacks share one scale. In the
    // mix it sits under the voice, like the ducked bass.
    const plF = harmonics(pl, at(plucks[0].t + 0.3), plucks[0].f0, 1)[0];
    const plDisp = bassTrim + db(undb(-3) / plF);
    const demoOn = (t) => TIMELINE.bass.some((s) => s.drums && t >= s.from && t <= s.to + 0.3);
    const bg = levelCurve((t) => (t > bed.to - 0.3 ? -60 : voiceOn(t) ? -15 : demoOn(t) ? -11 : -9), 0.12);
    // Under the voice the drums dip 8 dB, so their peaks and the speech
    // never meet at the master's clipper.
    const drumDuck = levelCurve((t) => (voiceOn(t) ? -8 : 0), 0.05);
    // Under the voice the bass ducks 9 dB, so it never masks a word.
    const duck = levelCurve((t) => {
        const s = segAt(t);
        return s?.duck && voiceOn(t) ? -9 : 0;
    }, 0.08);

    // Analysis signal: the bass (and the pluck) as the track carries it,
    // after its trim and before the voice ducking.
    const bassTrack = new Float32Array(n);
    for (let i = 0; i < n; i++) bassTrack[i] = bassRaw[i] * undb(bassTrim) + pl[i] * undb(plDisp);
    const bassPh = phone(bassTrack);

    // ── Music bus through the phone ──
    const musL = new Float32Array(n);
    const musR = new Float32Array(n);
    const gDr = undb(drumTrim);
    const gBed = undb(bedTrim);
    for (let i = 0; i < n; i++) {
        const b = bassRaw[i] * undb(bassTrim) * duck[i] + pl[i] * undb(plTrim);
        musL[i] = b + dL[i] * gDr * drumDuck[i] + bL[i] * gBed * bg[i];
        musR[i] = b + dR[i] * gDr * drumDuck[i] + bR[i] * gBed * bg[i];
    }
    for (const s of sfxList.filter((q) => q.kind === 'crash')) {
        mixIn(musL, S.crash.L, s.at, gDr * undb(-4));
        mixIn(musR, S.crash.R, s.at, gDr * undb(-4));
    }
    const pL = phone(musL);
    const pR = phone(musR);
    // The film opens mid-bar: a 10 ms fade-in on the music at frame 1.
    for (let k = 0; k < at(0.01); k++) {
        pL[k] *= k / at(0.01);
        pR[k] *= k / at(0.01);
    }

    // ── Effects (not through the phone) ──
    const fx = new Float32Array(n);
    const fxL = new Float32Array(n);
    const fxR = new Float32Array(n);
    sfxList.forEach((s, k) => {
        if (s.kind === 'crash') return;
        if (s.kind === 'button') {
            // The last note: the Dusty keys one-shot, down a tone to A sharp, with a kick.
            const rate = 2 ** (-2 / 12);
            const trim = voLufs - 6 - loudness(mono(S.note.L, S.note.R));
            mixIn(fxL, S.note.L, s.at, undb(trim), rate);
            mixIn(fxR, S.note.R, s.at, undb(trim), rate);
            mixIn(fxL, S.kick.L, s.at, gDr * undb(-3));
            mixIn(fxR, S.kick.R, s.at, gDr * undb(-3));
            return;
        }
        const buf = sfx(s.kind, 100 + k, s.level ?? 1);
        const pk = buf.reduce((p, v) => Math.max(p, Math.abs(v)), 0) / (s.level ?? 1);
        mixIn(fx, buf, s.at, undb(voLufs + FX_DB[s.kind]) / Math.max(pk, 1e-6));
    });

    // ── Sum ──
    const mL = new Float32Array(n);
    const mR = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        mL[i] = vo[i] + pL[i] + fx[i] + fxL[i];
        mR[i] = vo[i] + pR[i] + fx[i] + fxR[i];
    }
    const tail = at(1.0);
    for (let k = 0; k < tail; k++) {
        const g = (k / tail) ** 2;
        mL[n - 1 - k] *= g;
        mR[n - 1 - k] *= g;
    }
    if (wavPath) writeWav(wavPath, mL, mR);

    // ── What the picture draws ──
    // Harmonic levels at every video frame where the bass or the pluck
    // sounds, in dB re the clean sub's fundamental at full level.
    const REF = undb(bassTrim);
    const sources = [...notes.map((q) => ({ t: q.t, end: q.t + q.dur + 0.04, f0: q.f0 })), ...plucks.map((p) => ({ t: p.t, end: p.t + p.dur, f0: p.f0 }))].sort((a, b) => a.t - b.t);
    const srcAt = (t) => {
        let f = null;
        for (const s of sources) if (t >= s.t - 0.01 && t < s.end + 0.06) f = s;
        return f;
    };
    const frames = { rate: FR, f0: [], full: [], phone: [] };
    const nf = Math.round(TIMELINE.duration * FR);
    for (let k = 0; k < nf; k++) {
        const t = k / FR;
        const src = srcAt(t);
        const f0 = src?.f0 ?? 0;
        frames.f0.push(f0 ? Math.round(f0 * 100) / 100 : 0);
        if (!f0) {
            frames.full.push(null);
            frames.phone.push(null);
            continue;
        }
        // The window is gated to the sounding note: its centre is kept far
        // enough inside the note (15 ms past the onset, to its end) that the
        // 85 ms window never reaches into the next or previous note, whose
        // edges would smear into false harmonics.
        const half = 0.0425;
        const lo = src.t + 0.015 + half;
        const hi = Math.max(lo, src.end - 0.04 - half);
        const c = at(Math.min(hi, Math.max(lo, t)));
        const r = (a) => a.map((v) => Math.round(db(v / REF) * 10) / 10);
        frames.full.push(r(harmonics(bassTrack, c, f0, NH)));
        frames.phone.push(r(harmonics(bassPh, c, f0, NH)));
    }
    // The phone's output, for the scope, from the strange part to the end of the ghost.
    const sc0 = TIMELINE.scenes.find((s) => s.id === 'strange').at - 0.5;
    const sc1 = TIMELINE.scenes.find((s) => s.id === 'limit').at + 0.3;
    const dec = RATE / SCOPE_RATE;
    const scope = { rate: SCOPE_RATE, from: sc0, x: [] };
    for (let i = at(sc0); i < at(sc1); i += dec) {
        let s = 0;
        for (let j = 0; j < dec; j++) s += bassPh[i + j];
        scope.x.push(Math.round((s / dec / REF) * 10000) / 10000);
    }

    // ── Measured claims ──
    const steady = (q) => at(q.t + Math.min(0.2, q.dur / 2));
    const firstOf = (seg, name) => notes.find((q) => q.seg === seg && q.name === name && q.dur > 0.3) ?? notes.find((q) => q.seg === seg && q.name === name);
    const names = [...new Set(notes.map((q) => q.name))];
    // 1. Through the phone filter, each clean sub's fundamental drops.
    const claim1 = names.map((name) => {
        const q = firstOf('hookClean', name);
        const c = steady(q);
        const full = harmonics(bassTrack, c, q.f0, NH);
        const ph = harmonics(bassPh, c, q.f0, NH);
        return { name, f0: Math.round(q.f0 * 10) / 10, dropDb: Math.round((db(full[0]) - db(ph[0])) * 10) / 10, theoryDb: Math.round(-butter4HpDb(q.f0, 200) * 10) / 10, cleanTopHarmonicDb: Math.round(Math.max(...full.slice(1).map((v) => db(v / full[0]))) * 10) / 10 };
    });
    // 2. Bass level through the phone, saturated against clean, same notes,
    // matched full-range loudness.
    // Ungated K-weighted level: the clean sub through the phone is below
    // the -70 LUFS gate of a loudness meter.
    const hcF = kLevel(bassTrack, ref0, ref0 + CYCLE);
    const hsF = kLevel(bassTrack, hs.from, hs.from + CYCLE);
    const hcP = kLevel(bassPh, ref0, ref0 + CYCLE);
    const hsP = kLevel(bassPh, hs.from, hs.from + CYCLE);
    const claim2 = { cleanFull: hcF, satFull: hsF, cleanPhone: hcP, satPhone: hsP, gainDb: hsP - hcP };
    // 3. Autocorrelation of the phone-filtered saturated bass, per note: the
    // highest peak between 2.5 and 30 ms (any pitch from 33 to 400 Hz).
    const claim3 = names.map((name) => {
        const q = firstOf('hookSat', name);
        const a = at(q.t + 0.03);
        const b = at(q.t + Math.min(q.dur - 0.02, 0.5));
        const r = autocorrPeak(bassPh, a, b, 0.0025, 0.03);
        return { name, f0: q.f0, periodMs: 1000 / q.f0, lagMs: r.lag * 1000, errPct: 100 * (r.lag * q.f0 - 1), r: r.r };
    });
    // Periods measured on every saturated note, for the scope's brackets.
    const periods = notes.map((q) => {
        if (q.seg === 'hookClean' || q.seg === 'againClean' || q.seg === 'boost' || blendAt(q.t + 0.05) < 0.45) return null;
        const r = autocorrPeak(bassPh, at(q.t + 0.03), at(q.t + Math.min(q.dur - 0.02, 0.5)), 0.0025, 0.03);
        return Math.round(r.lag * 1e6) / 1e6;
    });
    // 4. Cone movement for equal level, x ∝ 1/f² (p ∝ S·x·f²).
    const claim4 = [200, 100, 50].map((f) => ({ hz: f, x: (200 / f) ** 2 }));
    // The level of each note's harmonics, saturated, full range (for the log).
    const satStack = names.map((name) => {
        const q = firstOf('hookSat', name);
        const h = harmonics(bassTrack, steady(q), q.f0, NH);
        return { name, db: h.map((v) => Math.round(db(v / REF) * 10) / 10) };
    });

    const measures = {
        voLufs,
        voRawLufs: rawLufs,
        pluckDuckDb: plDisp - plTrim,
        matchDb,
        bassTrimDb: bassTrim,
        drumTrimDb: drumTrim,
        bedTrimDb: bedTrim,
        claim1,
        claim2,
        claim3,
        claim4,
        satStack,
    };
    const data = {
        vo: PLACED,
        notes: notes.map((q, i) => ({ ...q, period: periods[i] })),
        plucks,
        hits,
        frames,
        scope,
        sfx: sfxList.map((s) => ({ kind: s.kind, at: s.at })),
        claims: { claim1, claim2, claim3, claim4 },
        nh: NH,
    };
    return { L: mL, R: mR, data, measures };
}

/**
 * Master: gain into a soft clipper, then a 17 kHz low-pass. Peaks are
 * rounded rather than limited, so nothing pumps.
 */
export function master(L, R, gainDb, ceilingDb, wavPath, guard = []) {
    const g = undb(gainDb);
    const c = undb(ceilingDb);
    const k = c * 0.9;
    // Samples over the clipper's knee inside the guarded spans (the speech).
    let over = 0;
    const where = [];
    for (const [a, b] of guard)
        for (let i = at(a); i < Math.min(L.length, at(b)); i++)
            if (Math.abs(L[i] * g) > k || Math.abs(R[i] * g) > k) {
                over++;
                if (!where.length || i / RATE - where[where.length - 1] > 0.05) where.push(i / RATE);
            }
    master.where = where;
    const clip = (x) => {
        const a = Math.abs(x);
        return a <= k ? x : Math.sign(x) * (k + (c - k) * Math.tanh((a - k) / (c - k)));
    };
    const oL = Float32Array.from(L, (v) => clip(v * g));
    const oR = Float32Array.from(R, (v) => clip(v * g));
    biquad(oL, 'lp', 17000);
    biquad(oR, 'lp', 17000);
    writeWav(wavPath, oL, oR);
    return over;
}
