// The drum loop as data: every hit, its level envelope, and the compressor
// that acts on it. audio.mjs runs this at 48 kHz to make the sound;
// film.js runs the same code at 10 kHz to draw it. No imports, so the page
// can inline it.

const STEP = (TL) => TL.bar / 16;

// Level envelopes (linear amplitude) of each instrument: a short crack and a
// longer body, the two parts the film names.
export const VOICES = {
    kick: { crack: 0.55, crackTau: 0.004, body: 1.0, bodyTau: 0.16 },
    snare: { crack: 1.0, crackTau: 0.006, body: 0.6, bodyTau: 0.1 },
    hat: { crack: 0, crackTau: 0.001, body: 0.2, bodyTau: 0.025 },
    // Off-beat sixteenth hats, quieter: they fill the groove and stay under the threshold.
    ghost: { crack: 0, crackTau: 0.001, body: 0.1, bodyTau: 0.018 },
};

/** One bar of the pattern in 16th steps. */
const PATTERN = { kick: [0, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], ghost: [1, 3, 5, 7, 9, 11, 13, 15] };

/** Every hit in the film, sorted by time. The last bar stops after beat 3. */
export function hits(TL) {
    const step = STEP(TL);
    const out = [];
    for (let bar = 0; bar < TL.bars; bar++) {
        for (const [voice, steps] of Object.entries(PATTERN)) {
            for (const s of steps) {
                if (bar === TL.bars - 1 && s > 8) continue;
                out.push({ voice, t: bar * TL.bar + s * step });
            }
        }
    }
    return out.sort((a, b) => a.t - b.t);
}

/** Envelope of one voice dt seconds after its hit, with a 1 ms onset ramp. */
export function voiceEnv(v, dt) {
    if (dt < 0) return 0;
    const onset = Math.min(1, dt / 0.001);
    return onset * (v.crack * Math.exp(-dt / v.crackTau) + v.body * Math.exp(-dt / v.bodyTau));
}

/** Drum-bus envelope sampled at `rate` Hz over the whole film. */
export function busEnvelope(TL, rate) {
    const n = Math.ceil(TL.duration * rate) + 1;
    const env = new Float32Array(n);
    for (const h of hits(TL)) {
        const v = VOICES[h.voice];
        const i0 = Math.round(h.t * rate);
        const len = Math.ceil(1.2 * rate);
        for (let k = 0; k < len && i0 + k < n; k++) env[i0 + k] += voiceEnv(v, k / rate);
    }
    return env;
}

const toDb = (v) => 20 * Math.log10(Math.max(1e-5, v));

/**
 * Feed-forward compressor in the log domain with smooth branching between
 * attack and release (Giannoulis, Massberg and Reiss, 2012). `settingsAt(i)`
 * returns {threshold, ratio, attack, release} or null for bypass at sample i.
 * Returns gain reduction in dB (positive numbers) per sample.
 */
export function compress(env, rate, settingsAt) {
    const gr = new Float32Array(env.length);
    let g = 0;
    let last = null;
    let aA = 0;
    let aR = 0;
    for (let i = 0; i < env.length; i++) {
        const c = settingsAt(i);
        if (!c) {
            g = 0;
            last = null;
            continue;
        }
        if (c !== last) {
            aA = Math.exp(-1 / (c.attack * rate));
            aR = Math.exp(-1 / (c.release * rate));
            last = c;
        }
        const over = toDb(env[i]) - toDb(c.threshold);
        const target = over > 0 ? over * (1 - 1 / c.ratio) : 0;
        const a = target > g ? aA : aR;
        g = a * g + (1 - a) * target;
        gr[i] = g;
    }
    return gr;
}

/** Scene active at sample i, for the compressor's settings. */
export function sceneIndexAt(TL, t) {
    const bar = Math.floor(t / TL.bar) + 1;
    const i = TL.scenes.findIndex((s) => bar >= s.bar && bar < s.bar + s.bars);
    return i === -1 ? TL.scenes.length - 1 : i;
}

/**
 * The fader move in the first bar, the "volume knob" the film opens on:
 * down 6 dB across beats 2 and 3, back up as bar 2 starts. Linear gain.
 */
export function knobGain(TL, t) {
    const beat = TL.bar / 4;
    const down = 10 ** (-6 / 20);
    const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
    if (t < TL.bar) return 1 + (down - 1) * ease((t - 1.1 * beat) / (1.2 * beat));
    return down + (1 - down) * ease((t - TL.bar) / 0.12);
}

/**
 * Everything the picture and the sound need: the envelope, gain reduction
 * as heard, and a makeup gain per scene that keeps every scene at the
 * loudness of the uncompressed loop (the lesson's "judge at matched level").
 */
export function buildModel(TL, rate) {
    const env = busEnvelope(TL, rate);
    const scenes = TL.scenes;
    const idx = new Int16Array(env.length);
    for (let i = 0; i < env.length; i++) idx[i] = sceneIndexAt(TL, i / rate);
    const gr = compress(env, rate, (i) => scenes[idx[i]].comp);
    const makeupDb = scenes.map((s, k) => {
        if (!s.comp) return 0;
        let dry = 0;
        let wet = 0;
        for (let i = 0; i < env.length; i++) {
            if (idx[i] !== k) continue;
            const g = 10 ** (-gr[i] / 20);
            dry += env[i] * env[i];
            wet += env[i] * g * env[i] * g;
        }
        return wet > 0 ? 10 * Math.log10(dry / wet) : 0;
    });
    return { rate, env, gr, idx, makeupDb, hits: hits(TL) };
}
