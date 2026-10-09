/**
 * A small shared Web Audio engine for the article demos. Every sound is
 * synthesised in the browser, so there are no audio files to load and no
 * rights to clear. Output runs through one volume control and a limiter
 * so no demo can jump out louder than the reader set it.
 */

/** Ceiling of the output limiter, in dBFS. */
const LIMIT_DB = -6;
const LIMIT_RATIO = 20;
/**
 * A DynamicsCompressorNode turns its whole output up by a makeup gain set by
 * its threshold and ratio: (1 / its gain at full scale) to the power 0.6, in
 * Chromium, WebKit and Gecko alike. The engine takes that back out after the
 * limiter, and puts the same amount in front of it, so quiet material plays
 * exactly as loud as before and the ceiling is LIMIT_DB, not 3.4 dB above it.
 */
const LIMIT_MAKEUP = 10 ** ((-0.6 * LIMIT_DB * (1 - 1 / LIMIT_RATIO)) / 20);

export interface Engine {
    ctx: AudioContext;
    /** Connect demo output here. */
    out: GainNode;
}

let engine: Engine | null = null;
let volumeNode: GainNode | null = null;
let currentStop: (() => void) | null = null;

const VOLUME_KEY = 'vgp_demo_volume';

export function storedVolume(): number {
    try {
        const v = Number(localStorage.getItem(VOLUME_KEY));
        return Number.isFinite(v) && v > 0 && v <= 1 ? v : 0.5;
    } catch {
        return 0.5;
    }
}

/** The engine if a demo has already started one, without creating it. */
export function peekEngine(): Engine | null {
    return engine;
}

/** Must be called from a click or key press the first time. */
export function getEngine(): Engine {
    if (engine) {
        if (engine.ctx.state === 'suspended') void engine.ctx.resume();
        return engine;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor({ latencyHint: 'interactive' });
    const out = ctx.createGain();
    out.gain.value = 0.5 * LIMIT_MAKEUP;
    volumeNode = ctx.createGain();
    volumeNode.gain.value = curve(storedVolume());
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = LIMIT_DB;
    limiter.knee.value = 0;
    limiter.ratio.value = LIMIT_RATIO;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.12;
    const unMakeup = ctx.createGain();
    unMakeup.gain.value = 1 / LIMIT_MAKEUP;
    out.connect(volumeNode).connect(limiter).connect(unMakeup).connect(ctx.destination);
    engine = { ctx, out };
    return engine;
}

const curve = (v: number) => v * v;

export function setVolume(v: number) {
    try {
        localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
        // The slider still works for this visit.
    }
    if (engine && volumeNode) volumeNode.gain.setTargetAtTime(curve(v), engine.ctx.currentTime, 0.03);
}

/** Only one demo plays at a time. Starting one stops the last. */
export function claim(stop: () => void) {
    if (currentStop && currentStop !== stop) currentStop();
    currentStop = stop;
}

export function release(stop: () => void) {
    if (currentStop === stop) currentStop = null;
}

// ── Building blocks ─────────────────────────────────────────────────

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

export function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
    let buf = noiseBuffers.get(ctx);
    if (!buf) {
        buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = buf.getChannelData(0);
        let seed = 1;
        for (let i = 0; i < data.length; i++) {
            seed = (seed * 16807) % 2147483647;
            data[i] = (seed / 2147483647) * 2 - 1;
        }
        noiseBuffers.set(ctx, buf);
    }
    return buf;
}

function envGain(ctx: BaseAudioContext, dest: AudioNode, t: number, peak: number, attack: number, decay: number): GainNode {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(dest);
    return g;
}

export function kick(ctx: BaseAudioContext, dest: AudioNode, t: number, level = 1) {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.11);
    const g = envGain(ctx, dest, t, 0.9 * level, 0.002, 0.42);
    osc.connect(g);
    osc.start(t);
    osc.stop(t + 0.5);
    // A short click so the hit reads on small speakers too.
    const click = ctx.createBufferSource();
    click.buffer = noiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2500;
    click.connect(hp).connect(envGain(ctx, dest, t, 0.12 * level, 0.001, 0.012));
    click.start(t, 0.3, 0.03);
}

export function snare(ctx: BaseAudioContext, dest: AudioNode, t: number, level = 1) {
    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(210, t);
    body.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    body.connect(envGain(ctx, dest, t, 0.35 * level, 0.001, 0.1));
    body.start(t);
    body.stop(t + 0.15);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = 'highpass';
    bp.frequency.value = 1400;
    noise.connect(bp).connect(envGain(ctx, dest, t, 0.42 * level, 0.001, 0.17));
    noise.start(t, Math.random(), 0.25);
}

export function hat(ctx: BaseAudioContext, dest: AudioNode, t: number, level = 1, open = false) {
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer(ctx);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    noise.connect(hp).connect(envGain(ctx, dest, t, 0.22 * level, 0.001, open ? 0.25 : 0.045));
    noise.start(t, Math.random(), open ? 0.3 : 0.08);
}

export function clickTone(ctx: BaseAudioContext, dest: AudioNode, t: number, freq = 1600, level = 0.5) {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.connect(envGain(ctx, dest, t, level, 0.001, 0.04));
    osc.start(t);
    osc.stop(t + 0.06);
}

/** A round sub bass note, like a clean 808. */
export function bass(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, dur: number, level = 1) {
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7 * level, t + 0.008);
    g.gain.setTargetAtTime(0.45 * level, t + 0.05, 0.2);
    g.gain.setTargetAtTime(0.0001, t + dur, 0.04);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.3);
}

/** A plucked synth note: saw through a closing low-pass filter. */
export function pluck(
    ctx: BaseAudioContext,
    dest: AudioNode,
    t: number,
    freq: number,
    dur = 0.4,
    level = 1,
    attack = 0.003,
) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 1;
    lp.frequency.setValueAtTime(Math.min(9000, freq * 12), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 2), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25 * level, t + Math.max(0.002, attack));
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack + 0.05, dur));
    osc.connect(lp).connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + Math.max(attack + 0.05, dur) + 0.05);
}

/** A soft sustained chord: detuned saws through a low-pass filter. */
export function pad(ctx: BaseAudioContext, dest: AudioNode, t: number, freqs: number[], dur: number, level = 1, cutoff = 1800) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09 * level, t + 0.25);
    g.gain.setValueAtTime(0.09 * level, t + Math.max(0.3, dur - 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(g).connect(dest);
    for (const f of freqs) {
        for (const detune of [-7, 7]) {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = f;
            osc.detune.value = detune;
            osc.connect(lp);
            osc.start(t);
            osc.stop(t + dur + 0.05);
        }
    }
}

export const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);

// ── Timing ──────────────────────────────────────────────────────────

export interface Sequencer {
    stop(): void;
    setBpm(bpm: number): void;
}

/**
 * Calls `onStep` slightly ahead of time for every 16th note, with the
 * exact audio-clock time to schedule at. Look-ahead scheduling keeps
 * timing tight even when the main thread is busy.
 */
export function sequence(
    ctx: AudioContext,
    bpm: number,
    steps: number,
    onStep: (step: number, time: number, stepDur: number) => void,
): Sequencer {
    let tempo = bpm;
    let next = ctx.currentTime + 0.08;
    let step = 0;
    const tick = () => {
        const stepDur = 60 / tempo / 4;
        while (next < ctx.currentTime + 0.15) {
            onStep(step, next, stepDur);
            next += stepDur;
            step = (step + 1) % steps;
        }
    };
    tick();
    const timer = window.setInterval(tick, 25);
    return {
        stop: () => window.clearInterval(timer),
        setBpm: (b) => {
            tempo = b;
        },
    };
}

/** Root-mean-square level of an analyser's current block, linear. */
export function rms(analyser: AnalyserNode, buffer: Float32Array<ArrayBuffer>): number {
    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
    return Math.sqrt(sum / buffer.length);
}

/** Fade a bus out, then disconnect it. */
export function fadeOut(ctx: BaseAudioContext, node: GainNode, after?: () => void) {
    const t = ctx.currentTime;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(node.gain.value, t);
    node.gain.linearRampToValueAtTime(0, t + 0.06);
    window.setTimeout(() => {
        node.disconnect();
        after?.();
    }, 120);
}
