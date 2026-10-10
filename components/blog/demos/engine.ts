/**
 * A small shared Web Audio engine for the article demos. Every sound is
 * synthesised in the browser, so there are no audio files to load and no
 * rights to clear.
 *
 * Output: demo -> house level -> safety limiter -> ceiling clip -> the
 * reader's volume -> speakers. The volume comes last, so it scales what a
 * demo plays and never changes its dynamics: the limiter and the clip see
 * the same signal at 5 % as at 100 %. Every demo's own level (its playback
 * trim, `level` in lib/blog/demos.ts) keeps its loudest moment under the
 * ceiling, so the limiter only ever acts on a mistake.
 */
import { onVolume, storedVolume, volumeGain } from './volume';

/** Nothing the demos play goes above this, in dBFS, at any volume. */
const CEILING_DB = -6;
const CEILING = 10 ** (CEILING_DB / 20);
const LIMIT_RATIO = 20;
/**
 * A DynamicsCompressorNode turns its whole output up by a makeup gain set by
 * its threshold and ratio: (1 / its gain at full scale) to the power 0.6, in
 * Chromium, WebKit and Gecko alike. The engine takes that back out after the
 * limiter, so material under the ceiling passes at exactly its own level.
 */
const LIMIT_MAKEUP = 10 ** ((-0.6 * CEILING_DB * (1 - 1 / LIMIT_RATIO)) / 20);
/**
 * House level: the gain from every demo's output to the limiter. At 100 %
 * volume it puts the drum-loop demos at about -24 LUFS (K-weighted, both
 * channels, ungated) with their hits peaking around -11 dBFS. Demos whose
 * loudest setting would peak above -7 dBFS there play a little lower (their
 * trims), so nothing reaches the ceiling. The default volume (80 %) is
 * about 4 dB lower.
 */
const HOUSE = 0.265;

export interface Engine {
    ctx: AudioContext;
    /** Connect demo output here. */
    out: GainNode;
}

let engine: Engine | null = null;
let currentStop: (() => void) | null = null;

/**
 * A hard clip at the ceiling, and a straight line below it (the curve's
 * points fall on the line, so in between nothing changes either). The
 * limiter's attack lets a fast edge past for a moment; this catches it.
 */
function ceilingCurve(): Float32Array<ArrayBuffer> {
    const points = 1025;
    const c = new Float32Array(points);
    for (let i = 0; i < points; i++) c[i] = Math.max(-CEILING, Math.min(CEILING, (i / (points - 1)) * 2 - 1));
    return c;
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
    out.gain.value = HOUSE;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = CEILING_DB;
    limiter.knee.value = 0;
    limiter.ratio.value = LIMIT_RATIO;
    limiter.attack.value = 0;
    limiter.release.value = 0.1;
    const unMakeup = ctx.createGain();
    unMakeup.gain.value = 1 / LIMIT_MAKEUP;
    const clip = ctx.createWaveShaper();
    clip.curve = ceilingCurve();
    const volume = ctx.createGain();
    volume.gain.value = volumeGain(storedVolume());
    onVolume((v) => volume.gain.setTargetAtTime(volumeGain(v), ctx.currentTime, 0.03));
    out.connect(limiter).connect(unMakeup).connect(clip).connect(volume).connect(ctx.destination);
    engine = { ctx, out };
    return engine;
}

/**
 * Creates (or wakes) the audio context ahead of the click that plays: on the
 * press of a mouse button or key, or as a finger lifts. Building a context
 * takes a while on a slow phone; this way it runs in a task of its own.
 */
export function warmEngine() {
    getEngine();
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

// ── Measuring ───────────────────────────────────────────────────────

/**
 * K-weighting (ITU-R BS.1770) as Web Audio filters, for measuring loudness
 * in an offline render: a +4 dB high shelf at 1.68 kHz, then a high-pass at
 * 38 Hz with the standard's Q of 0.5. Web Audio reads a high-pass Q in dB,
 * so that Q is written as 20 log10(0.5), about -6.02 dB; a plain 0.5 would
 * give a resonant Q of about 1.06. Every demo's loudness matching and the
 * house level use this filter. Returns the weighted signal.
 */
export function kWeighted(ctx: BaseAudioContext, input: AudioNode): AudioNode {
    const shelf = ctx.createBiquadFilter();
    shelf.type = 'highshelf';
    shelf.frequency.value = 1681.97;
    shelf.gain.value = 4;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 38.13;
    hp.Q.value = 20 * Math.log10(0.5);
    input.connect(shelf).connect(hp);
    return hp;
}

/** Ends the current task so the browser can paint and take input; the caller carries on in a new one. */
export function yieldToMain(): Promise<void> {
    const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (typeof s?.yield === 'function') return s.yield();
    return new Promise((resolve) => window.setTimeout(resolve, 0));
}

/**
 * Calls `play` for steps 0 to `steps - 1`, eight at a time, each batch in a
 * task of its own (the first one too, so it never shares a task with
 * building the rest of the graph). Creating a step's voices is main-thread
 * work (a drum step takes a few milliseconds on a slow phone), so filling an
 * offline render with a few bars in one go would hold up input for longer
 * than a frame should.
 */
export async function scheduleSteps(steps: number, play: (step: number) => void): Promise<void> {
    for (let s = 0; s < steps; s++) {
        if (s % 8 === 0) await yieldToMain();
        play(s);
    }
}

// ── Reverb ──────────────────────────────────────────────────────────

/**
 * The gain a ConvolverNode with `normalize` on would give this impulse
 * (Web Audio spec, "Calculate normalization scale"), so an impulse split over
 * several nodes plays at the level the whole one would.
 */
function normalizationScale(channels: Float32Array[], sampleRate: number): number {
    let sum = 0;
    for (const data of channels) for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
    const power = Math.max(Math.sqrt(sum / (channels.length * channels[0].length)), 0.000125);
    return ((1 / power) * 0.00125 * 44100) / sampleRate;
}

export interface Reverb {
    input: GainNode;
    output: GainNode;
    /**
     * Loads an impulse: `make` returns its channels at the given sample rate.
     * The previous impulse fades out once the start of the new one is in place.
     */
    load(make: (sampleRate: number) => Float32Array<ArrayBuffer>[]): void;
    /** Stops any loading still to come and disconnects everything. */
    dispose(): void;
}

/** Length of each piece of a split impulse, in seconds. */
const REVERB_PIECE = 1;

/**
 * A convolution reverb with its impulse split into one-second pieces, each on
 * its own ConvolverNode behind a delay equal to the piece's start. Together
 * they make the same convolution as one node with the whole impulse. Handing
 * a ConvolverNode its impulse is main-thread work that grows with the length
 * (about 20 ms per second of impulse on a slow phone), so the impulse is
 * built in one task and each piece, the first one too, set up in a task of
 * its own: playback starts at once and the room fills in over the next few
 * frames.
 */
export function reverb(ctx: AudioContext): Reverb {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const timers = new Set<number>();
    let job = 0;
    let current: AudioNode[] = [];

    const later = (fn: () => void) => {
        const id = window.setTimeout(() => {
            timers.delete(id);
            fn();
        }, 0);
        timers.add(id);
    };
    const drop = (nodes: AudioNode[], group?: GainNode) => {
        if (group) {
            const t = ctx.currentTime;
            group.gain.cancelScheduledValues(t);
            group.gain.setValueAtTime(group.gain.value, t);
            group.gain.linearRampToValueAtTime(0, t + 0.08);
        }
        // Cut the feed from the input as well as each node's output, or the old
        // convolvers keep running (and holding their impulse) until Stop.
        window.setTimeout(
            () =>
                nodes.forEach((n) => {
                    try {
                        input.disconnect(n);
                    } catch {
                        // Not fed from the input directly (the group, or a piece behind its delay).
                    }
                    n.disconnect();
                }),
            group ? 150 : 0,
        );
    };

    return {
        input,
        output,
        load(make) {
            const id = ++job;
            later(() => {
                if (id !== job) return;
                const channels = make(ctx.sampleRate);
                const length = channels[0].length;
                const piece = Math.round(REVERB_PIECE * ctx.sampleRate);
                const group = ctx.createGain();
                group.gain.value = normalizationScale(channels, ctx.sampleRate);
                group.connect(output);
                const old = current;
                const oldGroup = old[0] as GainNode | undefined;
                const nodes: AudioNode[] = [group];
                current = nodes;
                const add = (from: number) => {
                    if (id !== job) return;
                    const to = Math.min(length, from + piece);
                    const buffer = ctx.createBuffer(channels.length, to - from, ctx.sampleRate);
                    channels.forEach((data, c) => buffer.copyToChannel(data.subarray(from, to), c));
                    const conv = ctx.createConvolver();
                    conv.normalize = false;
                    conv.buffer = buffer;
                    conv.connect(group);
                    nodes.push(conv);
                    if (from === 0) {
                        input.connect(conv);
                        if (old.length) drop(old, oldGroup);
                    } else {
                        const delay = ctx.createDelay(from / ctx.sampleRate + 0.01);
                        delay.delayTime.value = from / ctx.sampleRate;
                        input.connect(delay).connect(conv);
                        nodes.push(delay);
                    }
                    if (to < length) later(() => add(to));
                };
                later(() => add(0));
            });
        },
        dispose() {
            job++;
            timers.forEach((id) => window.clearTimeout(id));
            timers.clear();
            if (current.length) drop([...current, input], current[0] as GainNode);
            current = [];
        },
    };
}

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
