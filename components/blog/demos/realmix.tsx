'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { kWeighted, peekEngine, warmEngine, yieldToMain } from './engine';
import { Announce, Segmented, Variants } from './ui';

/*
 * The real mixes a demo can play instead of its synth: three short loops,
 * fetched only when the reader picks Real mix, decoded in the browser and
 * looped sample-accurately. They are MP3s served as application/octet-stream
 * from public/blog-mix/*.dat: no <audio> element, no audio/* content type and
 * no media extension in the URL, so a download manager does not offer to
 * grab them. Only these stereo mixes are published; no stems or samples.
 */

type LoopId = 'dystopia' | 'chrome-teeth' | 'late-train-home';

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
const LOOPS: Record<LoopId, LoopFacts> = {
    dystopia: {
        url: '/blog-mix/dystopia.688cb19a26.dat',
        seconds: 12.8,
        samples: 614400,
        rawSamples: 620928,
        rawSkip: 3409,
        lufs: -13.29,
        credit: 'Real mix: Dystopia by Virzy Guns (excerpt).',
    },
    'chrome-teeth': {
        url: '/blog-mix/chrome-teeth.ab62783020.dat',
        seconds: 40 / 3,
        samples: 640000,
        rawSamples: 646272,
        rawSkip: 3409,
        lufs: -14.62,
        credit: 'Real mix: Chrome Teeth, made for this blog.',
    },
    'late-train-home': {
        url: '/blog-mix/late-train-home.9710c11da2.dat',
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

/** A fetch and decode in progress (or done), shared by every demo on the page that wants the same loop. */
interface LoopJob {
    loop: Promise<RealLoop>;
    abort: AbortController;
    /** The demos that picked Real mix and are waiting for it. */
    wanted: Set<object>;
}

const jobs = new Map<LoopId, LoopJob>();
const loaded = new Map<LoopId, RealLoop>();

/** The decoded loop if it is already here (it is kept for the rest of the visit). */
const loadedLoop = (id: LoopId): RealLoop | null => loaded.get(id) ?? null;

/**
 * Decodes in the demos' audio context, so the buffer is at the rate it plays
 * at. That context is made by the press that picked Real mix (SourceChoice),
 * never outside one; should it still be missing, an offline context decodes
 * at the files' own 48 kHz instead.
 */
function decode(bytes: ArrayBuffer): Promise<AudioBuffer> {
    const ctx: BaseAudioContext = peekEngine()?.ctx ?? new OfflineAudioContext(2, 1, 48000);
    // The callback form: older Safari has no promise from decodeAudioData.
    return new Promise<AudioBuffer>((resolve, reject) => {
        ctx.decodeAudioData(bytes, resolve, (error) => reject(error ?? new Error('The mix could not be decoded.')));
    });
}

/**
 * Fetches and decodes a loop for `who` (a demo), once per page. Once no demo
 * on the page still wants it (each picked Synth again or left the page), a
 * fetch still in flight is dropped (unwantLoop).
 */
function loadLoop(id: LoopId, who: object): Promise<RealLoop> {
    let job = jobs.get(id);
    if (!job) {
        const abort = new AbortController();
        const loop = (async () => {
            const res = await fetch(LOOPS[id].url, { signal: abort.signal });
            if (!res.ok) throw new Error(`The mix answered ${res.status}.`);
            const bytes = await res.arrayBuffer();
            await yieldToMain();
            abort.signal.throwIfAborted();
            const placed = place(id, await decode(bytes));
            loaded.set(id, placed);
            return placed;
        })();
        const made: LoopJob = { loop, abort, wanted: new Set() };
        // A dropped connection or an abort: picking Real mix again tries again.
        loop.catch(() => {
            if (jobs.get(id) === made) jobs.delete(id);
        });
        jobs.set(id, made);
        job = made;
    }
    job.wanted.add(who);
    return job.loop;
}

/** `who` no longer waits for the loop. When nobody does, its fetch stops. */
function unwantLoop(id: LoopId, who: object) {
    const job = jobs.get(id);
    if (!job || loaded.has(id)) return;
    job.wanted.delete(who);
    if (job.wanted.size > 0) return;
    jobs.delete(id);
    job.abort.abort();
}

type Source = 'synth' | 'real';

interface SourceState {
    id: LoopId;
    /** What the reader picked. */
    pick: Source;
    /** The decoded loop while Real mix is picked, null until it is here. */
    loop: RealLoop | null;
    /** The last fetch failed and the pick went back to Synth. */
    failed: boolean;
    choose: (next: Source) => void;
}

/**
 * The Source choice of one demo: Synth, or a real loop that loads when the
 * reader first picks it. Picking Synth again before it has arrived, or leaving
 * the page, gives up on it (unwantLoop).
 */
export function useSource(id: LoopId): SourceState {
    const [pick, setPick] = useState<Source>('synth');
    const [loop, setLoop] = useState<RealLoop | null>(null);
    const [failed, setFailed] = useState(false);
    // `ask` counts the picks of Real mix: an answer to an earlier one that was given up on is not this one's.
    const live = useRef({ alive: true, pick: 'synth' as Source, ask: 0 });
    useEffect(() => {
        const l = live.current;
        l.alive = true;
        return () => {
            l.alive = false;
            unwantLoop(id, l);
        };
    }, [id]);
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
            if (next !== 'real') unwantLoop(id, l);
            if (next !== 'real' || ready) return;
            const ask = ++l.ask;
            loadLoop(id, l).then(
                (got) => {
                    if (l.alive) startTransition(() => setLoop(got));
                },
                () => {
                    if (!l.alive || l.pick !== 'real' || l.ask !== ask) return;
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
 * moves nothing. A change of line is said once it has held for half a second
 * (ui.tsx Announce): picking a loop that is already here changes nothing in it
 * (the radio says what was picked); a first pick that takes a while says
 * "Loading the mix…" and then the credit once it plays.
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
                // The press that picks Real mix makes the audio context the mix is decoded in, as Play does: a task
                // ahead of the click (as a mouse button goes down or a finger lifts), or with the key.
                onPress={(v) => {
                    if (v === 'real') warmEngine();
                }}
                options={[
                    { value: 'synth', label: 'Synth' },
                    { value: 'real', label: 'Real mix' },
                ]}
                hint={
                    <>
                        <span aria-hidden="true">
                            <Variants show={show} items={lines} />
                        </span>
                        {/* What a screen reader reads here: the line that is shown. */}
                        <span className="sr-only">{lines[show]}</span>
                    </>
                }
            />
            <Announce on={String(show)} text={lines[show]} />
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

/** A stretch of a loop: `from` seconds into it, `seconds` long. */
interface LoopPart {
    from: number;
    seconds: number;
}

/**
 * What a per-setting analysis measures: bars 3 and 4 of the loop's eight,
 * after half a second of bar 2 as run-in (MATCH_RUN_IN). Over a grid of
 * settings of each demo that measures one (the compressor on Late Train Home,
 * the limiter and the saturation on Chrome Teeth, gentle to extreme), the
 * matching measured over these two bars lands within about a tenth of a dB of
 * the matching measured over the whole loop, for a quarter of the render.
 * The demo's one-off measurement of the loop going in covers the same bars
 * (and the whole loop where it needs it, such as the limiter's peak), so the
 * two sides of a match are measured on the same music.
 */
export const matchPart = (loop: RealLoop): LoopPart => ({ from: loop.seconds / 4, seconds: loop.seconds / 4 });
export const MATCH_RUN_IN = 0.5;

interface LoopRender {
    /** Each tap's left and right channels. */
    x: [Float32Array, Float32Array][];
    /** The first `weighted` taps again, K-weighted (engine.ts kWeighted). */
    k: [Float32Array, Float32Array][];
    /**
     * Where the rendered stretch (or `part`, a stretch of it given in the loop's own time) sits in these arrays,
     * after the run-in and a tap's `delay`: [from, to) in samples.
     */
    span: (delay?: number, part?: LoopPart) => [number, number];
    sampleRate: number;
}

/**
 * Renders a loop through a demo's graph, offline, at the loop's own sample
 * rate: one whole pass, or only `part` of it. `runIn` seconds of the music
 * before it go first, so the processors have settled and what is measured is
 * the loop as it repeats. `build` connects `src` (the loop at `gain`) to the
 * taps; each tap is recorded in stereo, and the first `weighted` ones
 * K-weighted too. A tap fed in mono records silence on its right channel.
 * `weightedOnly` keeps only the K-weighted channels (a loudness reading needs
 * no more), so a slow phone allocates half as much.
 */
export async function renderLoop(
    loop: RealLoop,
    opts: { gain: number; taps: number; weighted?: number; runIn?: number; tail?: number; weightedOnly?: boolean; part?: LoopPart },
    build: (ctx: OfflineAudioContext, src: AudioNode, taps: GainNode[]) => void,
): Promise<LoopRender> {
    const weighted = opts.weighted ?? 0;
    const runIn = opts.runIn ?? 1.5;
    const tail = opts.tail ?? 0.05;
    const part = opts.part ?? { from: 0, seconds: loop.seconds };
    const sr = loop.buffer.sampleRate;
    const length = Math.ceil((runIn + part.seconds + tail) * sr);
    // Where each tap's two channels go, and its K-weighted copy's.
    const raw = opts.weightedOnly ? 0 : opts.taps;
    const channels = (raw + weighted) * 2;
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
        if (i < raw) record(g, i * 2);
        if (i < weighted) record(kWeighted(ctx, g), (raw + i) * 2);
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
    // The run-in starts `runIn` before the stretch, wrapping round the loop's end.
    const at = (((part.from - runIn) % loop.seconds) + loop.seconds) % loop.seconds;
    src.start(0, loop.start + at);
    const out = await ctx.startRendering();
    const pair = (c: number): [Float32Array, Float32Array] => [out.getChannelData(c), out.getChannelData(c + 1)];
    const from = Math.round(runIn * sr);
    return {
        x: Array.from({ length: raw }, (_, i) => pair(i * 2)),
        k: Array.from({ length: weighted }, (_, i) => pair((raw + i) * 2)),
        span: (delay = 0, sub = { from: part.from, seconds: part.seconds }) => {
            const a = from + Math.round((sub.from - part.from + delay) * sr);
            return [a, Math.min(length, a + Math.round(sub.seconds * sr))];
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
