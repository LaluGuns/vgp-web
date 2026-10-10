'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { getEngine, kWeighted, yieldToMain } from './engine';
import { Segmented, Variants } from './ui';

/*
 * The real mixes a demo can play instead of its synth: three short loops,
 * fetched only when the reader picks Real mix, decoded in the browser and
 * looped sample-accurately. They are MP3s served as application/octet-stream
 * from public/blog-mix/*.dat: no <audio> element, no audio/* content type and
 * no media extension in the URL, so a download manager does not offer to
 * grab them. Only these stereo mixes are published; no stems or samples.
 */

export type LoopId = 'dystopia' | 'chrome-teeth' | 'late-train-home';

interface LoopFacts {
    url: string;
    /** Length of the loop: eight bars, exactly. */
    seconds: number;
    /** Samples at 48 kHz in the loop, and in the file's whole stream as a decoder that ignores the gapless tag returns it. */
    samples: number;
    rawSamples: number;
    /** Where the loop starts in that whole stream: the encoder's delay plus a frame of wrapped context, at 48 kHz. */
    rawSkip: number;
    /** Ungated K-weighted loudness of the decoded loop (BS.1770, both channels, over the whole loop), LUFS. */
    lufs: number;
    /** The line each demo shows under its Source choice. */
    credit: string;
}

/*
 * Encoded by scratchpad r1/enc/encode.py (LAME VBR, 48 kHz stereo) with the end of
 * the loop before its start and the start after its end, then a gapless tag that
 * points past that context. A decoder that reads the tag returns exactly the loop;
 * one that ignores it returns the loop with real music on both sides, so either
 * way the loop below repeats without a seam.
 */
export const LOOPS: Record<LoopId, LoopFacts> = {
    dystopia: {
        url: '/blog-mix/dystopia.dat',
        seconds: 12.8,
        samples: 614400,
        rawSamples: 620928,
        rawSkip: 3409,
        lufs: -13.29,
        credit: 'Real mix: Dystopia by Virzy Guns (excerpt).',
    },
    'chrome-teeth': {
        url: '/blog-mix/chrome-teeth.dat',
        seconds: 40 / 3,
        samples: 640000,
        rawSamples: 646272,
        rawSkip: 3409,
        lufs: -14.62,
        credit: 'Real mix: Chrome Teeth, made for this blog.',
    },
    'late-train-home': {
        url: '/blog-mix/late-train-home.dat',
        seconds: 20,
        samples: 960000,
        rawSamples: 966528,
        rawSkip: 3409,
        lufs: -17.29,
        credit: 'Real mix: Late Train Home, made for this blog.',
    },
};

export interface RealLoop {
    id: LoopId;
    buffer: AudioBuffer;
    /** Loop points in the buffer, in seconds: `end - start` is the loop's length. */
    start: number;
    end: number;
    seconds: number;
}

/** Where the loop sits in a decoded buffer, whether or not the decoder trimmed the encoder's delay and padding. */
function place(id: LoopId, buffer: AudioBuffer): RealLoop {
    const f = LOOPS[id];
    const have = buffer.duration;
    let start = 0;
    if (Math.abs(have - f.seconds) > 0.002) {
        // The whole stream: the loop starts after the encoder's delay. A decoder that trimmed only part of it
        // gets the same share of what is left over; the music around the loop is the loop itself, so it still repeats cleanly.
        const raw = f.rawSamples / 48000;
        const extra = (f.rawSamples - f.samples) / 48000;
        start = Math.abs(have - raw) < 0.003 ? f.rawSkip / 48000 : Math.max(0, ((have - f.seconds) * (f.rawSkip / 48000)) / extra);
    }
    // A resampled decode can come out a sample short of the loop; the loop then ends at the buffer's end.
    return { id, buffer, start, end: Math.min(have, start + f.seconds), seconds: f.seconds };
}

const jobs = new Map<LoopId, Promise<RealLoop>>();
const loaded = new Map<LoopId, RealLoop>();

/** The decoded loop if it is already here (it is kept for the rest of the visit). */
export const loadedLoop = (id: LoopId): RealLoop | null => loaded.get(id) ?? null;

/**
 * Fetches and decodes a loop, once per page. Decoding uses the demos' audio
 * context, so the buffer is at the rate it plays at; the context is made a
 * task after the fetch lands, apart from the click that asked for the mix.
 */
export function loadLoop(id: LoopId): Promise<RealLoop> {
    let job = jobs.get(id);
    if (!job) {
        job = (async () => {
            const res = await fetch(LOOPS[id].url);
            if (!res.ok) throw new Error(`The mix answered ${res.status}.`);
            const bytes = await res.arrayBuffer();
            await yieldToMain();
            const { ctx } = getEngine();
            // The callback form: older Safari has no promise from decodeAudioData.
            const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
                ctx.decodeAudioData(bytes, resolve, (error) => reject(error ?? new Error('The mix could not be decoded.')));
            });
            const loop = place(id, buffer);
            loaded.set(id, loop);
            return loop;
        })().catch((error: unknown) => {
            // A dropped connection: picking Real mix again tries again.
            jobs.delete(id);
            throw error;
        });
        jobs.set(id, job);
    }
    return job;
}

export type Source = 'synth' | 'real';

export interface SourceState {
    id: LoopId;
    /** What the reader picked. */
    pick: Source;
    /** The decoded loop while Real mix is picked, null until it is here. */
    loop: RealLoop | null;
    /** The last fetch failed and the pick went back to Synth. */
    failed: boolean;
    choose: (next: Source) => void;
}

/** The Source choice of one demo: Synth, or a real loop that loads when the reader first picks it. */
export function useSource(id: LoopId): SourceState {
    const [pick, setPick] = useState<Source>('synth');
    const [loop, setLoop] = useState<RealLoop | null>(null);
    const [failed, setFailed] = useState(false);
    const live = useRef({ alive: true, pick: 'synth' as Source });
    useEffect(() => {
        const l = live.current;
        l.alive = true;
        return () => {
            l.alive = false;
        };
    }, []);
    // Transitions: a demo is large, and re-rendering it inside the tap ran long on a slow phone. React renders it
    // in slices instead; the fetch starts in the tap itself.
    const choose = useCallback(
        (next: Source) => {
            const l = live.current;
            l.pick = next;
            const ready = next === 'real' ? loadedLoop(id) : null;
            startTransition(() => {
                setPick(next);
                setFailed(false);
                if (ready) setLoop(ready);
            });
            if (next !== 'real' || ready) return;
            loadLoop(id).then(
                (got) => {
                    if (l.alive) startTransition(() => setLoop(got));
                },
                () => {
                    if (!l.alive || l.pick !== 'real') return;
                    l.pick = 'synth';
                    startTransition(() => {
                        setPick('synth');
                        setFailed(true);
                    });
                },
            );
        },
        [id],
    );
    return { id, pick, loop: pick === 'real' ? loop : null, failed, choose };
}

/**
 * The Source choice and its line: the loop's credit, "Loading the mix…" until
 * it can play (fetched, decoded and, for a level-matched demo, measured), or
 * why it went back to Synth. Every line takes the same place, so a change
 * moves nothing. The line is a live region: picking a loop that is already
 * here changes nothing in it (the radio says what was picked), so a switch is
 * announced once; a first pick reads "Loading the mix…" and then the credit
 * once it plays.
 */
export function SourceChoice({ source, loading }: { source: SourceState; loading: boolean }) {
    const show = source.failed ? 2 : loading ? 1 : 0;
    const lines = [LOOPS[source.id].credit, 'Loading the mix…', 'The mix could not load, so the demo stays on Synth. Check your connection and try again.'];
    return (
        // data-source says what plays, for scripts and tests: synth, loading (Real mix picked, not here yet) or real.
        <div data-source={source.pick === 'synth' ? 'synth' : loading ? 'loading' : 'real'}>
            <Segmented
                label="Source"
                value={source.pick}
                onChange={source.choose}
                options={[
                    { value: 'synth', label: 'Synth' },
                    { value: 'real', label: 'Real mix' },
                ]}
                hint={
                    <>
                        <span aria-hidden="true">
                            <Variants show={show} items={lines} />
                        </span>
                        {/* What is read out: a change of text, which every screen reader announces. */}
                        <span className="sr-only">{lines[show]}</span>
                    </>
                }
                liveHint
            />
        </div>
    );
}

// ── Playing ─────────────────────────────────────────────────────────

export interface Feed {
    /** Plays the synth (null) or a loop from now on, with a short crossfade. */
    use(loop: RealLoop | null): void;
    stop(): void;
}

const XFADE = 0.03;

/**
 * What goes into a demo: its synth, or a real loop at `level(loop)` (a gain),
 * looped on its exact loop points from its first bar. `synth` starts the
 * synth into the node it is given and returns its stop. `onLoop` hears the
 * audio-clock time a loop's first bar starts (for a playhead), or null when
 * the synth takes over.
 */
export function startFeed(
    ctx: AudioContext,
    dest: AudioNode,
    synth: (into: GainNode) => () => void,
    first: RealLoop | null,
    level: (loop: RealLoop) => number,
    onLoop?: (start: number | null, loop: RealLoop | null) => void,
): Feed {
    let current: { gain: GainNode; end: () => void; loop: RealLoop | null } | null = null;

    const begin = (loop: RealLoop | null, crossfade: boolean) => {
        const gain = ctx.createGain();
        gain.connect(dest);
        const t = ctx.currentTime;
        if (!loop) {
            if (crossfade) {
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(1, t + XFADE);
            }
            current = { gain, end: synth(gain), loop: null };
            onLoop?.(null, null);
            return;
        }
        const src = ctx.createBufferSource();
        src.buffer = loop.buffer;
        src.loop = true;
        src.loopStart = loop.start;
        src.loopEnd = loop.end;
        // A moment ahead, so the first bar starts on an exact sample; a few ms of fade in case the bar starts mid-sound.
        const at = t + 0.02;
        const g = level(loop);
        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(g, at + (crossfade ? XFADE : 0.005));
        src.connect(gain);
        src.start(at, loop.start);
        current = {
            gain,
            loop,
            end: () => {
                try {
                    src.stop();
                } catch {
                    // Already stopped.
                }
            },
        };
        onLoop?.(at, loop);
    };

    const fadeAway = (old: NonNullable<typeof current>) => {
        const t = ctx.currentTime;
        old.gain.gain.cancelScheduledValues(t);
        old.gain.gain.setValueAtTime(old.gain.gain.value, t);
        old.gain.gain.linearRampToValueAtTime(0, t + XFADE);
        window.setTimeout(() => {
            old.end();
            old.gain.disconnect();
        }, 250);
    };

    begin(first, false);
    return {
        use(loop) {
            if (!current || current.loop === loop) return;
            fadeAway(current);
            begin(loop, true);
        },
        stop() {
            // The demo fades its own output; the source stops once that is done.
            const c = current;
            current = null;
            if (c) window.setTimeout(() => {
                c.end();
                c.gain.disconnect();
            }, 150);
        },
    };
}

// ── Measuring ───────────────────────────────────────────────────────

const dbToGain = (db: number) => 10 ** (db / 20);

/** The gain that plays a loop at `lufs` (ungated, K-weighted) in a demo. */
export const loopGain = (loop: RealLoop, lufs: number) => dbToGain(lufs - LOOPS[loop.id].lufs);

export interface LoopRender {
    /** Each tap's left and right channels. */
    x: [Float32Array, Float32Array][];
    /** The first `weighted` taps again, K-weighted (engine.ts kWeighted). */
    k: [Float32Array, Float32Array][];
    /** The whole loop in these arrays, after the run-in and a tap's `delay`: [from, to) in samples. */
    span: (delay?: number) => [number, number];
    sampleRate: number;
}

/**
 * Renders one whole pass of a loop through a demo's graph, offline, at the
 * loop's own sample rate: `runIn` seconds of the loop's end first, so the
 * processors have settled and what is measured is the loop as it repeats.
 * `build` connects `src` (the loop at `gain`) to the taps; each tap is
 * recorded in stereo, and the first `weighted` ones K-weighted too. A tap
 * fed in mono records silence on its right channel.
 */
export async function renderLoop(
    loop: RealLoop,
    opts: { gain: number; taps: number; weighted?: number; runIn?: number; tail?: number },
    build: (ctx: OfflineAudioContext, src: AudioNode, taps: GainNode[]) => void,
): Promise<LoopRender> {
    const weighted = opts.weighted ?? 0;
    const runIn = opts.runIn ?? 1.5;
    const tail = opts.tail ?? 0.05;
    const sr = loop.buffer.sampleRate;
    const length = Math.ceil((runIn + loop.seconds + tail) * sr);
    const channels = (opts.taps + weighted) * 2;
    const ctx = new OfflineAudioContext(channels, length, sr);
    const merger = ctx.createChannelMerger(channels);
    merger.connect(ctx.destination);
    const record = (node: AudioNode, at: number) => {
        const split = ctx.createChannelSplitter(2);
        node.connect(split);
        split.connect(merger, 0, at);
        split.connect(merger, 1, at + 1);
    };
    const taps: GainNode[] = [];
    for (let i = 0; i < opts.taps; i++) {
        const g = ctx.createGain();
        record(g, i * 2);
        if (i < weighted) record(kWeighted(ctx, g), (opts.taps + i) * 2);
        taps.push(g);
    }
    const src = ctx.createBufferSource();
    src.buffer = loop.buffer;
    src.loop = true;
    src.loopStart = loop.start;
    src.loopEnd = loop.end;
    const level = ctx.createGain();
    level.gain.value = opts.gain;
    src.connect(level);
    build(ctx, level, taps);
    src.start(0, loop.end - runIn);
    const out = await ctx.startRendering();
    const pair = (c: number): [Float32Array, Float32Array] => [out.getChannelData(c), out.getChannelData(c + 1)];
    const from = Math.round(runIn * sr);
    const n = Math.round(loop.seconds * sr);
    return {
        x: Array.from({ length: opts.taps }, (_, i) => pair(i * 2)),
        k: Array.from({ length: weighted }, (_, i) => pair((opts.taps + i) * 2)),
        span: (delay = 0) => {
            const a = from + Math.round(delay * sr);
            return [a, Math.min(length, a + n)];
        },
        sampleRate: sr,
    };
}

/** Samples handled between yields in the measurements below: a few milliseconds on a slow phone. */
const CHUNK = 65536;

/** Summed mean square of both channels over [from, to): on K-weighted channels, a loudness. */
export async function stereoPower(x: [Float32Array, Float32Array], from: number, to: number): Promise<number> {
    let sum = 0;
    for (const ch of x) {
        for (let a = from; a < to; a += CHUNK) {
            const b = Math.min(to, a + CHUNK);
            for (let i = a; i < b; i++) sum += ch[i] * ch[i];
            await yieldToMain();
        }
    }
    return sum / Math.max(1, to - from);
}

/** Summed mean product of two stereo signals, channel by channel. */
export async function stereoProduct(x: [Float32Array, Float32Array], y: [Float32Array, Float32Array], from: number, to: number): Promise<number> {
    let sum = 0;
    for (let c = 0; c < 2; c++) {
        const p = x[c];
        const q = y[c];
        for (let a = from; a < to; a += CHUNK) {
            const b = Math.min(to, a + CHUNK);
            for (let i = a; i < b; i++) sum += p[i] * q[i];
            await yieldToMain();
        }
    }
    return sum / Math.max(1, to - from);
}

/** Highest sample of either channel over [from, to). */
export async function stereoPeak(x: [Float32Array, Float32Array], from: number, to: number): Promise<number> {
    let peak = 0;
    for (const ch of x) {
        for (let a = from; a < to; a += CHUNK) {
            const b = Math.min(to, a + CHUNK);
            for (let i = a; i < b; i++) {
                const v = ch[i] < 0 ? -ch[i] : ch[i];
                if (v > peak) peak = v;
            }
            await yieldToMain();
        }
    }
    return peak;
}

/**
 * The peak of each of `count` slices of a stereo signal over [from, to),
 * either channel: what a level strip draws for a whole loop. With `y`, one
 * array per amount in `amounts`, each the peaks of x + amount * y (a blend),
 * all from one pass. A few columns at a time, with a yield in between, so a
 * slow phone never spends long in here at once.
 */
export async function stereoColumns(x: [Float32Array, Float32Array], from: number, to: number, count: number, y?: [Float32Array, Float32Array], amounts: number[] = [0]): Promise<Float32Array[]> {
    const out = amounts.map(() => new Float32Array(count));
    const span = (to - from) / count;
    let done = 0;
    for (let c = 0; c < count; c++) {
        const a = from + Math.floor(c * span);
        const b = from + Math.max(Math.floor(c * span) + 1, Math.floor((c + 1) * span));
        for (let k = 0; k < amounts.length; k++) {
            const amount = amounts[k];
            let peak = 0;
            for (let ch = 0; ch < 2; ch++) {
                const p = x[ch];
                const q = y?.[ch];
                for (let i = a; i < b; i++) {
                    const v = q ? p[i] + amount * q[i] : p[i];
                    const m = v < 0 ? -v : v;
                    if (m > peak) peak = m;
                }
            }
            out[k][c] = peak;
        }
        done += (b - a) * amounts.length;
        if (done >= CHUNK) {
            done = 0;
            await yieldToMain();
        }
    }
    return out;
}
