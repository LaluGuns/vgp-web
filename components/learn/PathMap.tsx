import type { CSSProperties } from 'react';
import { DialectMark } from '@/components/blog/figures/DialectMark';
import type { Dialect } from '@/lib/blog/dialects';
import type { MapFamily, MapPath } from './map-data';

/**
 * The path map (docs/DESIGN.md, "Learn area"): every learning path as a
 * line of its lessons, drawn in its group's figure dialect and accent. The
 * one place the four accents appear together. Server-rendered HTML: every
 * lesson is a link in reading order, so it works with no script; the read
 * marks, the readout and in-app navigation are added after hydration
 * (PathMapLive) without changing any size.
 *
 * Each path's line is a grid of 44 px tall cells (one per lesson) that wraps
 * like a score's systems: 44 px wide on phones and any touch screen,
 * narrower from 640 px up with a mouse, and one line per path from 1280 px
 * with a mouse. A cell is just its link, and the link
 * draws itself with two background layers: its stretch of the line and the
 * lesson's value glyph (app/globals.css, "Learn area"). So a lesson costs
 * two elements and no pseudo-elements of its own (only the few cells that
 * carry a rule mark, a graticule or bar line, draw it with ::before), which
 * keeps the first render and a restyle cheap on a slow phone, and the
 * drawing wraps with the grid. The links are plain anchors, not
 * next/link: PathMapLive sends their clicks through the app router with one
 * listener instead of a hydrated Link component per lesson.
 */

/** The page background, inside a hollow mark, so the line does not show through it. */
const BG = '#050607';

/**
 * A lesson's value glyph in its dialect (the figures' Point, components/blog/figures/svg.tsx), as a
 * 12 x 12 SVG for a CSS background: hollow until the lesson is read, filled once it is.
 */
function markSvg(d: Dialect, read: boolean) {
    const fill = read ? d.accent : BG;
    const shape = {
        square: `<rect x="1.75" y="1.75" width="8.5" height="8.5" fill="${fill}" stroke="${d.accent}" stroke-width="1.5"/>`,
        // An engraved note head, leaning back.
        head: `<ellipse cx="6" cy="6" rx="4.6" ry="3.3" transform="rotate(-20 6 6)" fill="${fill}" stroke="${d.accent}" stroke-width="1.4"/>`,
        // A dot held in a focus ring.
        ring: `<circle cx="6" cy="6" r="5.4" fill="${BG}" stroke="${d.accent}" stroke-opacity="0.55"/><circle cx="6" cy="6" r="2.4" fill="${fill}" stroke="${d.accent}" stroke-width="1.2"/>`,
        // A tick, as on a ledger.
        tick: `<rect x="4.4" y="0.6" width="3.2" height="10.8" fill="${fill}" stroke="${d.accent}" stroke-width="1.2"/>`,
    }[d.marker];
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">${shape}</svg>`)}")`;
}

/** The group's tokens for its cells, set once on the group: accent, line weight and both marks. */
const familyStyle = (d: Dialect) =>
    ({
        '--accent': d.accent,
        '--line': `${d.name === 'music' ? 2 : d.name === 'mind' ? 1.75 : 1.5}px`,
        '--mark': markSvg(d, false),
        '--mark-read': markSvg(d, true),
    }) as CSSProperties;

/** The most lessons one line holds at 1280 px (24 px cells beside the 160 px names); a longer path wraps there too. */
const XL_AXIS = 44;

function Track({ path, family, order }: { path: MapPath; family: MapFamily; order: number }) {
    const d = family.dialect;
    const total = path.lessons.length;
    // The lesson list is named by the path alone; the link to the path page also says how many lessons.
    return (
        <li className="vgp-map-path">
            {/* Named "Songwriting, 10 lessons" (PathMapLive keeps the count in it): from its two boxes the name would
                read "Songwriting 10 lessons", and a hidden comma between them came out as "Songwriting , 10". */}
            <a
                href={`/blog/category/${path.slug}`}
                aria-label={`${path.name}, ${total} lessons`}
                data-map-path={path.name}
                className="vgp-focus group flex min-h-11 items-center justify-between gap-4 rounded-sm lg:flex-col lg:items-start lg:justify-center lg:gap-0"
            >
                <span className="text-sm font-semibold leading-5 text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                    {path.name}
                </span>
                <span data-map-count={path.slug} data-total={total} className="shrink-0 text-xs tabular-nums leading-4 text-white/55">
                    {total} lessons
                </span>
            </a>
            {/* The lane carries the group's rules (the paper); the list on it draws in once, left to right, in
                --len steps (one per lesson), after --o others of its group, wiped in by the box around it
                (app/globals.css, "Learn area"). Only these eleven boxes carry their own values: one per cell
                made every cell restyle on its own. */}
            <div className="vgp-map-lane" data-dialect={d.name}>
                <div className="vgp-map-wipe" data-reveal="draw" style={{ '--o': order, '--len': total } as CSSProperties}>
                    <ol aria-label={path.name} data-dialect={d.name} data-name={path.name} className="vgp-map-track">
                        {path.lessons.map((lesson, i) => (
                            <li
                                key={lesson.slug}
                                className="vgp-map-cell"
                                data-end={total === 1 ? 'only' : i === 0 ? 'first' : i === total - 1 ? 'last' : undefined}
                                data-bar={d.name === 'music' && i % 4 === 3 && i < total - 1 ? '' : undefined}
                                data-major={i % 5 === 4 ? '' : undefined}
                            >
                                <a
                                    href={`/blog/${lesson.slug}`}
                                    aria-label={`Lesson ${i + 1}: ${lesson.title}`}
                                    data-slug={lesson.slug}
                                    data-n={i + 1}
                                    data-min={lesson.minutes}
                                    className="vgp-focus"
                                />
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </li>
    );
}

export function PathMap({ families }: { families: MapFamily[] }) {
    // From 1280 px every path is one line on a shared lesson axis, as long as the longest path.
    const longest = Math.max(...families.flatMap((family) => family.paths.map((path) => path.lessons.length)));
    const axis = Math.min(longest, XL_AXIS);
    return (
        <div className="vgp-map grid gap-8" style={{ '--n': axis } as CSSProperties}>
            <div aria-hidden="true" className="vgp-map-axis -mb-4 hidden xl:grid xl:grid-cols-[160px_1fr] xl:gap-x-2">
                <span className="self-end text-xs leading-4 text-white/50">Lesson</span>
                <div className="vgp-map-ruler">
                    {Array.from({ length: axis }, (_, i) => (
                        <span key={i}>{i === 0 || (i + 1) % 5 === 0 || i === axis - 1 ? i + 1 : null}</span>
                    ))}
                </div>
            </div>
            {families.map((family) => (
                <div
                    key={family.dialect.name}
                    data-family={family.dialect.name}
                    style={familyStyle(family.dialect)}
                    className="border-t border-white/10 pt-4"
                >
                    <h3 id={`map-group-${family.dialect.name}`} className="flex items-center gap-2 text-sm font-medium text-white/60">
                        <DialectMark dialect={family.dialect} />
                        {family.name}
                    </h3>
                    <ul aria-labelledby={`map-group-${family.dialect.name}`} className="mt-2 grid gap-1">
                        {family.paths.map((path, p) => (
                            <Track key={path.slug} path={path} family={family} order={p} />
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
