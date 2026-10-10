'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { DemoId } from '@/lib/blog/demos';
import type { Dialect } from '@/lib/blog/dialects';

/*
 * The only demo code in a lesson's shared chunk. DemoSlot wraps the server's
 * markup for a demo's box and its volume row in these: until DemoMount's
 * chunk (DemoMount, the contexts and the volume row, about 2.5 KB gzipped)
 * has arrived they show that markup as it is, then they swap in the live
 * components, which render the same thing (views.tsx), so nothing moves. A
 * lesson without a demo never runs this, so it never fetches that chunk.
 * The fetch starts as soon as a lesson with a demo runs this module, while
 * the page hydrates, and a later lesson finds the chunk already here.
 */

type Mount = typeof import('./DemoMount');

let job: Promise<Mount> | null = null;

function loadMount(): Promise<Mount> {
    job ??= import('./DemoMount').catch((error: unknown) => {
        // A dropped connection: the next demo slot (or the next lesson) tries again.
        job = null;
        throw error;
    });
    return job;
}

// This module only runs on a lesson that renders a demo slot.
if (typeof window !== 'undefined') loadMount().catch(() => {});

/**
 * The loaded module, once it is here. The first render always shows the
 * server's markup (so hydration finds exactly what the server sent), and the
 * swap follows a moment later, even when the chunk is already loaded.
 */
function useMount(): Mount | null {
    const [m, setM] = useState<Mount | null>(null);
    useEffect(() => {
        let alive = true;
        loadMount().then(
            (loaded) => alive && setM(loaded),
            () => {},
        );
        return () => {
            alive = false;
        };
    }, []);
    return m;
}

/** A demo's controls: `children` (the server's placeholder) until DemoMount has loaded. */
export function DemoBoot({ id, dialect, level, children }: { id: DemoId; dialect: Dialect; level: number; children: ReactNode }) {
    const m = useMount();
    return m ? <m.DemoMount id={id} dialect={dialect} level={level} /> : <>{children}</>;
}

/** The volume row: `children` (the server's copy at the default volume) until the live one has loaded. */
export function VolumeBoot({ children }: { children: ReactNode }) {
    const m = useMount();
    return m ? <m.VolumeRow /> : <>{children}</>;
}
