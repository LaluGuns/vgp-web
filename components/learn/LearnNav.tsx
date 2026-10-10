import type { CSSProperties } from 'react';
import Link from 'next/link';

/** The parts of the Learn area, in the order the sub-navigation lists them. */
export type LearnSection = 'lessons' | 'paths' | 'glossary' | 'book';

const ITEMS: { section: LearnSection; label: string; href: string }[] = [
    { section: 'lessons', label: 'Lessons', href: '/blog' },
    // The path map is the Learn landing.
    { section: 'paths', label: 'Paths', href: '/learn' },
    { section: 'glossary', label: 'Glossary', href: '/learn/glossary' },
    { section: 'book', label: 'Book', href: '/book' },
];

/**
 * The Learn area's own navigation (docs/DESIGN.md, "Learn area"): one row
 * under the site header on every Learn page. It is not sticky, so it never
 * sits over a lesson's text or its fixed reading tools, and it scrolls away
 * with the page; the site header keeps the Learn menu in reach after that.
 *
 * `current` is where the reader is. On the section's own page the link says
 * so with aria-current="page"; inside a section (a lesson under Lessons, a
 * path page under Paths) with aria-current="true". `accent` is the lesson
 * group's on a lesson, so the marker and focus rings match its figures;
 * everywhere else it is the site's sky.
 *
 * It sits flush under the fixed header (65 px tall plus the top safe area;
 * the page content starts 96 px down) and before <main>, so the skip link
 * passes it. Rendered on the server; screen only.
 */
export function LearnNav({ current, onPage = true, accent }: { current: LearnSection; onPage?: boolean; accent?: string }) {
    const style = (accent ? { '--accent': accent } : undefined) as CSSProperties | undefined;
    return (
        <nav
            aria-label="Learn"
            style={style}
            className="vgp-learn-nav mt-[calc(env(safe-area-inset-top,0px)-31px)] border-b border-white/10 px-4 print:hidden sm:px-6"
        >
            <div className="mx-auto max-w-7xl"><ul className="-ml-3 flex items-stretch sm:-ml-4">
                {/* The first label lines up with the page text; its tap area reaches into the gutter. */}
                {ITEMS.map((item) => {
                    const here = item.section === current;
                    return (
                        <li key={item.section} className="flex">
                            <Link
                                href={item.href}
                                aria-current={here ? (onPage ? 'page' : 'true') : undefined}
                                className={`vgp-focus relative flex min-h-12 items-center px-3 text-sm font-medium transition-colors sm:px-4 ${
                                    here ? 'text-white' : 'text-white/60 hover:text-white'
                                }`}
                            >
                                {item.label}
                                {here ? <span aria-hidden="true" className="absolute inset-x-3 bottom-[-1px] h-0.5 bg-[var(--accent)] sm:inset-x-4" /> : null}
                            </Link>
                        </li>
                    );
                })}
            </ul></div>
        </nav>
    );
}
