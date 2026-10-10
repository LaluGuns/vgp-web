import type { CSSProperties } from 'react';
import Link from 'next/link';
import { DialectMark } from '@/components/blog/figures/DialectMark';
import type { Dialect } from '@/lib/blog/dialects';
import type { MapFamily, MapPath } from './map-data';

/**
 * The path map (docs/DESIGN.md, "Learn area"): every learning path as a
 * line of its lessons, drawn in its group's figure dialect and accent. The
 * one place the four accents appear together. Server-rendered HTML and SVG:
 * every lesson is a link in reading order, so it works with no script; the
 * read marks and the readout are added after hydration (PathMapLive) without
 * changing any size.
 *
 * Each path's line is a grid of 44 px tall cells (one per lesson) that wraps
 * like a score's systems: 44 px wide on phones, narrower from 640 px up,
 * and one line per path from 1280 px. A cell draws its own stretch of the
 * line and of its group's rules, so the drawing wraps with the grid.
 */

/** A lesson's value glyph in its dialect: hollow until it is read (PathMapLive fills it). */
function Mark({ d }: { d: Dialect }) {
    switch (d.marker) {
        case 'square':
            return <rect className="vgp-map-fill" x={2} y={2} width={8} height={8} strokeWidth={1.5} />;
        case 'head':
            // An engraved note head, leaning back.
            return <ellipse className="vgp-map-fill" cx={6} cy={6} rx={4.6} ry={3.3} transform="rotate(-20 6 6)" strokeWidth={1.4} />;
        case 'ring':
            return (
                <>
                    <circle cx={6} cy={6} r={5.4} fill="none" stroke="currentColor" strokeOpacity={0.55} strokeWidth={1} />
                    <circle className="vgp-map-fill" cx={6} cy={6} r={2.4} strokeWidth={1.2} />
                </>
            );
        case 'tick':
            return <rect className="vgp-map-fill" x={4.5} y={0.75} width={3} height={10.5} strokeWidth={1.2} />;
    }
}

function Track({ path, family, order }: { path: MapPath; family: MapFamily; order: number }) {
    const d = family.dialect;
    const total = path.lessons.length;
    const labelId = `map-${path.slug}`;
    return (
        <li className="vgp-map-path">
            <Link
                href={`/blog/category/${path.slug}`}
                id={labelId}
                className="vgp-focus group flex min-h-11 items-center justify-between gap-4 rounded-sm lg:flex-col lg:items-start lg:justify-center lg:gap-0"
            >
                <span className="text-sm font-semibold leading-5 text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                    {path.name}
                </span>
                <span data-map-count={path.slug} data-total={total} className="shrink-0 text-xs tabular-nums leading-4 text-white/55">
                    {total} lessons
                </span>
            </Link>
            <ol aria-labelledby={labelId} data-reveal="draw" data-dialect={d.name} className="vgp-map-track">
                {path.lessons.map((lesson, i) => {
                    const end = total === 1 ? 'only' : i === 0 ? 'first' : i === total - 1 ? 'last' : undefined;
                    // The line draws along the path, one cell after the next; the marks land just behind it.
                    const delay = { '--draw-delay': `${order * 60 + i * 16}ms` } as CSSProperties;
                    const pop = { '--draw-delay': `${order * 60 + i * 16 + 90}ms` } as CSSProperties;
                    return (
                        <li
                            key={lesson.slug}
                            className="vgp-map-cell"
                            data-end={end}
                            data-bar={d.name === 'music' && i % 4 === 3 && i < total - 1 ? '' : undefined}
                            data-major={i % 5 === 4 ? '' : undefined}
                        >
                            <Link
                                href={`/blog/${lesson.slug}`}
                                aria-label={`Lesson ${i + 1}: ${lesson.title}`}
                                data-slug={lesson.slug}
                                data-n={i + 1}
                                data-min={lesson.minutes}
                                className="vgp-focus"
                            >
                                <span aria-hidden="true" className="vgp-map-rule vgp-draw-grow" style={delay} />
                                <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false" className="vgp-map-mark vgp-draw-pop" style={pop}>
                                    <Mark d={d} />
                                </svg>
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </li>
    );
}

export function PathMap({ families }: { families: MapFamily[] }) {
    let order = 0;
    return (
        <div className="vgp-map grid gap-10 lg:gap-8">
            {families.map((family) => (
                <div
                    key={family.dialect.name}
                    data-family={family.dialect.name}
                    style={{ '--accent': family.dialect.accent } as CSSProperties}
                    className="border-t border-white/10 pt-4"
                >
                    <h3 id={`map-group-${family.dialect.name}`} className="flex items-center gap-2 text-sm font-medium text-white/60">
                        <DialectMark dialect={family.dialect} />
                        {family.name}
                    </h3>
                    <ul aria-labelledby={`map-group-${family.dialect.name}`} className="mt-3 grid gap-3 lg:gap-1">
                        {family.paths.map((path) => (
                            <Track key={path.slug} path={path} family={family} order={order++} />
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
