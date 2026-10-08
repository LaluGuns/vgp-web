'use client';

import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type LazyExoticComponent } from 'react';
import { demoCatalog, isDemoId, type DemoId } from '@/lib/blog/demos';
import { VolumeRow } from './ui';

function Placeholder() {
    return (
        <div className="flex min-h-11 items-center">
            <span className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white/55">
                Loading demo
            </span>
        </div>
    );
}

// Each module loads only when one of its demos is about to be seen.
type Loader = () => Promise<{ default: ComponentType }>;
const demo = (load: Loader) => lazy(load);

const DEMOS: Record<DemoId, LazyExoticComponent<ComponentType>> = {
    compressor: demo(() => import('./dynamics').then((m) => ({ default: m.CompressorDemo }))),
    aliasing: demo(() => import('./digital').then((m) => ({ default: m.AliasingDemo }))),
    'bit-depth': demo(() => import('./digital').then((m) => ({ default: m.BitDepthDemo }))),
    latency: demo(() => import('./digital').then((m) => ({ default: m.LatencyDemo }))),
    swing: demo(() => import('./rhythm').then((m) => ({ default: () => <m.GrooveDemo mode="swing" /> }))),
    'late-snare': demo(() => import('./rhythm').then((m) => ({ default: () => <m.GrooveDemo mode="snare" /> }))),
    tempo: demo(() => import('./rhythm').then((m) => ({ default: () => <m.GrooveDemo mode="tempo" /> }))),
    humanize: demo(() => import('./rhythm').then((m) => ({ default: () => <m.GrooveDemo mode="humanize" /> }))),
    syncopation: demo(() => import('./rhythm').then((m) => ({ default: () => <m.GrooveDemo mode="syncopation" /> }))),
    drop: demo(() => import('./rhythm').then((m) => ({ default: m.DropDemo }))),
    mono: demo(() => import('./space').then((m) => ({ default: m.MonoDemo }))),
    phase: demo(() => import('./space').then((m) => ({ default: m.PhaseDemo }))),
    reverb: demo(() => import('./space').then((m) => ({ default: m.ReverbDemo }))),
    filter: demo(() => import('./tone').then((m) => ({ default: () => <m.FilterDemo /> }))),
    'eq-sweep': demo(() => import('./tone').then((m) => ({ default: () => <m.FilterDemo initial="peaking" types={['peaking']} /> }))),
    envelope: demo(() => import('./tone').then((m) => ({ default: m.EnvelopeDemo }))),
    masking: demo(() => import('./tone').then((m) => ({ default: m.MaskingDemo }))),
    saturation: demo(() => import('./tone').then((m) => ({ default: m.SaturationDemo }))),
    normalization: demo(() => import('./loudness').then((m) => ({ default: m.NormalizationDemo }))),
    'loudness-bias': demo(() => import('./loudness').then((m) => ({ default: m.LevelAbDemo }))),
    cadence: demo(() => import('./harmony').then((m) => ({ default: m.CadenceDemo }))),
};

/** A listening demo in a framed panel. Its code loads when it nears the screen. */
export function DemoSlot({ id }: { id: string }) {
    const ref = useRef<HTMLElement>(null);
    const [near, setNear] = useState(false);

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
            { rootMargin: '600px 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    if (!isDemoId(id)) return null;
    const meta = demoCatalog[id];
    const Demo = DEMOS[id];

    return (
        <section ref={ref} aria-label={`Listen: ${meta.title}`} className="my-12 rounded-[6px] border border-white/10 bg-[var(--surface)] px-5 py-6 sm:px-7 sm:py-7">
            <p className="text-sm font-medium text-white/50">Listen</p>
            <h3 className="mt-1 text-xl font-semibold leading-snug text-white">{meta.title}</h3>
            <p className="mt-2 text-base leading-7 text-white/70">{meta.blurb}</p>
            <div className="mt-6 min-h-11">
                {near ? (
                    <Suspense fallback={<Placeholder />}>
                        <Demo />
                    </Suspense>
                ) : (
                    <Placeholder />
                )}
            </div>
            <VolumeRow />
        </section>
    );
}
