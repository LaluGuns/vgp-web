import type { CSSProperties } from 'react';
import { demoCatalog, isDemoId } from '@/lib/blog/demos';
import { resolveDialect } from '@/lib/blog/dialects';
import { DemoMount } from './DemoMount';
import { VolumeRow } from './shell';

/**
 * A listening demo in a framed panel. The frame, title and blurb render on
 * the server; the controls (DemoMount) load in the browser when the page is
 * idle or when the demo nears the screen, whichever comes first. The box
 * under the blurb already has the controls' height (lib/blog/demos.ts), so
 * nothing below it moves when they appear.
 *
 * `dialect` is the lesson group's (lib/blog/dialects.ts): the panel scopes
 * `--accent` and `data-dialect` to it, so the demo's displays draw in the same
 * language as the lesson's figures. Its controls stay the same everywhere.
 */
export function DemoSlot({ id, dialect }: { id: string; dialect?: string }) {
    if (!isDemoId(id)) return null;
    const meta = demoCatalog[id];
    const d = resolveDialect(dialect);
    const size = Object.fromEntries(meta.height.map((h, i) => [`--demo-h${i}`, `${h}px`])) as CSSProperties;
    const level = 'level' in meta ? meta.level : 0;

    return (
        <section
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
                <DemoMount id={id} dialect={d} level={level} />
                <noscript>
                    <p className="text-sm leading-6 text-white/60">This demo makes its sound in your browser, so it needs JavaScript. Turn JavaScript on to play it.</p>
                </noscript>
            </div>
            <VolumeRow />
        </section>
    );
}
