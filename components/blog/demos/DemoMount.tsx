'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DemoId } from '@/lib/blog/demos';
import type { Dialect } from '@/lib/blog/dialects';
import { DialectContext, LevelContext, whenIdle } from './shell';

// One chunk per family of demos. A chunk is fetched once the page has loaded
// and the browser is idle, and the demo mounts when it is about two screens
// away, so it is usually ready before the reader gets to it.
const LOADERS = {
    dynamics: () => import('./dynamics'),
    digital: () => import('./digital'),
    rhythm: () => import('./rhythm'),
    space: () => import('./space'),
    tone: () => import('./tone'),
    loudness: () => import('./loudness'),
    harmony: () => import('./harmony'),
    processing: () => import('./processing'),
    perception: () => import('./perception'),
};

type ModuleName = keyof typeof LOADERS;
type Modules = { [K in ModuleName]: Awaited<ReturnType<(typeof LOADERS)[K]>> };

const loaded: Partial<Record<ModuleName, unknown>> = {};
const loading: Partial<Record<ModuleName, Promise<unknown>>> = {};

function load(name: ModuleName): Promise<unknown> {
    let job = loading[name];
    if (!job) {
        job = LOADERS[name]().then(
            (m) => {
                loaded[name] = m;
                return m;
            },
            (error: unknown) => {
                // A failed fetch (a dropped connection) may be retried later.
                delete loading[name];
                throw error;
            },
        );
        loading[name] = job;
    }
    return job;
}

type Entry = { [K in ModuleName]: { module: K; render: (m: Modules[K]) => ReactNode } }[ModuleName];

const entry = <K extends ModuleName>(module: K, render: (m: Modules[K]) => ReactNode) => ({ module, render }) as Entry;

/** The entry's module and render function belong together; TypeScript cannot see that through the union. */
const renderEntry = (e: Entry, m: unknown) => (e.render as (m: unknown) => ReactNode)(m);

const DEMOS: Record<DemoId, Entry> = {
    compressor: entry('dynamics', (m) => <m.CompressorDemo />),
    aliasing: entry('digital', (m) => <m.AliasingDemo />),
    'bit-depth': entry('digital', (m) => <m.BitDepthDemo />),
    latency: entry('digital', (m) => <m.LatencyDemo />),
    swing: entry('rhythm', (m) => <m.GrooveDemo mode="swing" />),
    'late-snare': entry('rhythm', (m) => <m.GrooveDemo mode="snare" />),
    tempo: entry('rhythm', (m) => <m.GrooveDemo mode="tempo" />),
    humanize: entry('rhythm', (m) => <m.GrooveDemo mode="humanize" />),
    syncopation: entry('rhythm', (m) => <m.GrooveDemo mode="syncopation" />),
    drop: entry('rhythm', (m) => <m.DropDemo />),
    mono: entry('space', (m) => <m.MonoDemo />),
    phase: entry('space', (m) => <m.PhaseDemo />),
    reverb: entry('space', (m) => <m.ReverbDemo />),
    filter: entry('tone', (m) => <m.FilterDemo />),
    'eq-sweep': entry('tone', (m) => <m.FilterDemo initial="peaking" types={['peaking']} />),
    envelope: entry('tone', (m) => <m.EnvelopeDemo />),
    masking: entry('tone', (m) => <m.MaskingDemo />),
    saturation: entry('tone', (m) => <m.SaturationDemo />),
    normalization: entry('loudness', (m) => <m.NormalizationDemo />),
    'loudness-bias': entry('loudness', (m) => <m.LevelAbDemo />),
    cadence: entry('harmony', (m) => <m.CadenceDemo />),
    parallel: entry('processing', (m) => <m.ParallelDemo />),
    transient: entry('processing', (m) => <m.TransientDemo />),
    sidechain: entry('processing', (m) => <m.SidechainDemo />),
    limiter: entry('processing', (m) => <m.LimiterDemo />),
    'clip-recover': entry('processing', (m) => <m.ClipRecoverDemo />),
    width: entry('perception', (m) => <m.WidthDemo />),
    'monitor-level': entry('perception', (m) => <m.MonitorLevelDemo />),
    'reverb-duck': entry('perception', (m) => <m.ReverbDuckDemo />),
    'chord-context': entry('perception', (m) => <m.ChordContextDemo />),
};

function Placeholder() {
    return (
        <div className="flex min-h-11 items-center [@media(scripting:none)]:hidden">
            <span className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/55">Loading demo</span>
        </div>
    );
}

/**
 * The controls of one demo, inside the box DemoSlot reserves for them. Their
 * code loads when the page is idle or when the demo nears the screen,
 * whichever comes first; until then a placeholder holds the place.
 */
export function DemoMount({ id, dialect, level }: { id: DemoId; dialect: Dialect; level: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const name = DEMOS[id].module;
    const [near, setNear] = useState(false);
    const [failed, setFailed] = useState(false);
    const [, setReady] = useState(0);

    // Fetch the code once the page has finished loading and the browser is idle.
    useEffect(() => {
        let cancel = () => {};
        const start = () => {
            cancel = whenIdle(() => {
                load(name).catch(() => {});
            });
        };
        if (document.readyState === 'complete') start();
        else window.addEventListener('load', start, { once: true });
        return () => {
            window.removeEventListener('load', start);
            cancel();
        };
    }, [name]);

    // Mount the demo when it is about two screens away.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setNear(true);
                    io.disconnect();
                }
            },
            { rootMargin: '1500px 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    // Always ask, even when the idle fetch has already finished: it may have landed after this
    // render read the cache, and the resolved promise re-renders with the demo at once.
    useEffect(() => {
        if (!near) return;
        let alive = true;
        load(name).then(
            () => alive && setReady((n) => n + 1),
            () => alive && setFailed(true),
        );
        return () => {
            alive = false;
        };
    }, [near, name]);

    const mod = near ? loaded[name] : undefined;
    return (
        <div ref={ref}>
            {failed ? (
                <p className="text-sm leading-6 text-white/60">This demo could not load. Check your connection and reload the page.</p>
            ) : mod ? (
                <DialectContext.Provider value={dialect}>
                    <LevelContext.Provider value={level}>{renderEntry(DEMOS[id], mod)}</LevelContext.Provider>
                </DialectContext.Provider>
            ) : (
                <Placeholder />
            )}
        </div>
    );
}
