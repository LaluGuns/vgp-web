import { useId, type CSSProperties } from 'react';
import { demoCatalog, isDemoId } from '@/lib/blog/demos';
import { resolveDialect } from '@/lib/blog/dialects';
import { DemoBoot, VolumeBoot } from './DemoBoot';
import { Placeholder, VolumeRowView } from './views';

/**
 * A listening demo in a framed panel. The frame, title and blurb render on
 * the server; the controls (DemoMount) load in the browser when the page is
 * idle or when the demo nears the screen, whichever comes first. The box
 * under the blurb already has the controls' height (lib/blog/demos.ts), so
 * nothing below it moves when they appear. The live parts (DemoMount and the
 * volume row) come in a chunk that only lessons with a demo load (DemoBoot);
 * until then the server's copies of the same markup (views.tsx) hold their
 * place.
 *
 * `dialect` is the lesson group's (lib/blog/dialects.ts): the panel scopes
 * `--accent` and `data-dialect` to it, so the demo's displays draw in the same
 * language as the lesson's figures. Its controls stay the same everywhere.
 */
export function DemoSlot({ id, dialect }: { id: string; dialect?: string }) {
    // Ties the volume row's label to its slider until the live row (with its own id) replaces it.
    const volumeId = useId();
    if (!isDemoId(id)) return null;
    const meta = demoCatalog[id];
    const d = resolveDialect(dialect);
    const size = Object.fromEntries(meta.height.map((h, i) => [`--demo-h${i}`, `${h}px`])) as CSSProperties;
    const level = 'level' in meta ? meta.level : 0;

    return (
        // Not a named region: a lesson has no landmarks inside its text. The h3 introduces the demo.
        // data-demo names it for scripts and tests.
        <section
            data-demo={id}
            data-dialect={d.name}
            style={{ '--accent': d.accent } as CSSProperties}
            className="vgp-demo my-12 rounded-[6px] border border-white/10 bg-[var(--surface)] px-5 py-6 sm:px-7 sm:py-7"
        >
            <p className="text-sm font-medium text-white/50">Listen</p>
            <h3 className="mt-1 text-xl font-semibold leading-snug text-white">{meta.title}</h3>
            <p className="mt-2 text-base leading-7 text-white/70">{meta.blurb}</p>
            <div
                style={size}
                // One reserved height per width range (lib/blog/demos.ts). Only min-[...] variants, so Tailwind orders them by width.
                className="mt-6 min-h-[var(--demo-h0)] min-[344px]:min-h-[var(--demo-h1)] min-[360px]:min-h-[var(--demo-h2)] min-[375px]:min-h-[var(--demo-h3)] min-[390px]:min-h-[var(--demo-h4)] min-[393px]:min-h-[var(--demo-h5)] min-[412px]:min-h-[var(--demo-h6)] min-[428px]:min-h-[var(--demo-h7)] min-[480px]:min-h-[var(--demo-h8)] min-[540px]:min-h-[var(--demo-h9)] min-[600px]:min-h-[var(--demo-h10)] min-[640px]:min-h-[var(--demo-h11)] min-[736px]:min-h-[var(--demo-h12)] min-[1024px]:min-h-[var(--demo-h13)] min-[1104px]:min-h-[var(--demo-h14)] [@media(scripting:none)]:min-h-0"
            >
                <DemoBoot id={id} dialect={d} level={level}>
                    {/* DemoMount's first render, until its chunk is here. */}
                    <div>
                        <Placeholder />
                    </div>
                </DemoBoot>
                <noscript>
                    <p className="text-sm leading-6 text-white/60">This demo makes its sound in your browser, so it needs JavaScript. Turn JavaScript on to play it.</p>
                </noscript>
            </div>
            <VolumeBoot>
                <VolumeRowView id={volumeId} />
            </VolumeBoot>
            {/* While the demo plays, its Stop button goes here (ui.tsx PlayButton), so it is the next stop after the demo in the tab order. */}
            <div data-demo-stop="" />
        </section>
    );
}
