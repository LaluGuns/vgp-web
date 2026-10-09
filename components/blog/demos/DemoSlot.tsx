'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { demoCatalog, isDemoId, type DemoId } from '@/lib/blog/demos';
import { resolveDialect } from '@/lib/blog/dialects';
import { DialectContext, VolumeRow, whenIdle } from './ui';

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
 * A listening demo in a framed panel. Its code loads when the page is idle
 * or when it nears the screen, whichever comes first. The panel already has
 * the demo's height before the code arrives (lib/blog/demos.ts), so nothing
 * below it moves when the controls appear.
 *
 * `dialect` is the lesson group's (lib/blog/dialects.ts): the panel scopes
 * `--accent` and `data-dialect` to it, so the demo's displays draw in the same
 * language as the lesson's figures. Its controls stay the same everywhere.
 */
export function DemoSlot({ id, dialect }: { id: string; dialect?: string }) {
    const ref = useRef<HTMLElement>(null);
    const name = isDemoId(id) ? DEMOS[id].module : null;
    const [near, setNear] = useState(false);
    const [failed, setFailed] = useState(false);
    const [, setReady] = useState(0);

    // Fetch the code once the page has finished loading and the browser is idle.
    useEffect(() => {
        if (!name) return;
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
        if (!el || !name) return;
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
    }, [name]);

    useEffect(() => {
        if (!near || !name || loaded[name]) return;
        let alive = true;
        load(name).then(
            () => alive && setReady((n) => n + 1),
            () => alive && setFailed(true),
        );
        return () => {
            alive = false;
        };
    }, [near, name]);

    if (!isDemoId(id) || !name) return null;
    const meta = demoCatalog[id];
    const d = resolveDialect(dialect);
    const mod = near ? loaded[name] : undefined;
    const size = Object.fromEntries(meta.height.map((h, i) => [`--demo-h${i}`, `${h}px`])) as CSSProperties;

    return (
        <section
            ref={ref}
            aria-label={`Listen: ${meta.title}`}
            data-dialect={d.name}
            style={{ '--accent': d.accent } as CSSProperties}
            className="vgp-demo my-12 rounded-[6px] border border-white/10 bg-[var(--surface)] px-5 py-6 sm:px-7 sm:py-7"
        >
            <p className="text-sm font-medium text-white/50">Listen</p>
            <h3 className="mt-1 text-xl font-semibold leading-snug text-white">{meta.title}</h3>
            <p className="mt-2 text-base leading-7 text-white/70">{meta.blurb}</p>
            <div
                style={size}
                className="mt-6 min-h-[var(--demo-h0)] min-[360px]:min-h-[var(--demo-h1)] min-[375px]:min-h-[var(--demo-h2)] min-[412px]:min-h-[var(--demo-h3)] sm:min-h-[var(--demo-h4)] [@media(scripting:none)]:min-h-0"
            >
                {failed ? (
                    <p className="text-sm leading-6 text-white/60">This demo could not load. Check your connection and reload the page.</p>
                ) : mod ? (
                    <DialectContext.Provider value={d}>{renderEntry(DEMOS[id], mod)}</DialectContext.Provider>
                ) : (
                    <Placeholder />
                )}
                <noscript>
                    <p className="text-sm leading-6 text-white/60">This demo makes its sound in your browser, so it needs JavaScript. Turn JavaScript on to play it.</p>
                </noscript>
            </div>
            <VolumeRow />
        </section>
    );
}
