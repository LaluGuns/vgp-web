import type { ReactNode } from 'react';

/**
 * The opening of every Learn page (/learn, /blog, the path pages, the
 * glossary): an optional label above the title, the display title, a
 * description and whatever the page adds under it. One spacing and type
 * scale for all of them, so the area reads as one place under its
 * sub-navigation (docs/DESIGN.md, "Learn area"). `facts` is a row of plain
 * counts from the data, on a hairline, like the book page's. `aside` sits
 * beside the title from 1024 px (the Start here links on /learn).
 */
export function LearnHeader({
    label,
    title,
    description,
    facts,
    children,
    aside,
    titleClassName = '',
}: {
    label?: ReactNode;
    title: ReactNode;
    description: ReactNode;
    /** A fact with `fromSm` is left out on a phone (the description already says it there). */
    facts?: (string | { text: string; fromSm: boolean })[];
    children?: ReactNode;
    /** Beside the title from 1024 px, under it below that. */
    aside?: ReactNode;
    titleClassName?: string;
}) {
    return (
        <section data-enter="" className="px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
            <div className={`mx-auto max-w-7xl ${aside ? 'grid gap-6 sm:gap-10 lg:grid-cols-12 lg:items-end lg:gap-12' : ''}`}>
                <div className={aside ? 'lg:col-span-7' : ''}>
                    {label ? <div className="mb-3 flex items-center gap-2 text-sm text-white/55">{label}</div> : null}
                    <h1 className={`max-w-[18ch] font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white ${titleClassName}`}>
                        {title}
                    </h1>
                    <div className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{description}</div>
                    {facts?.length ? (
                        <ul className="mt-6 flex max-w-2xl flex-wrap gap-x-6 gap-y-1 border-t border-white/10 pt-4 text-sm tabular-nums text-white/60">
                            {facts.map((fact) =>
                                typeof fact === 'string' ? (
                                    <li key={fact}>{fact}</li>
                                ) : (
                                    <li key={fact.text} className={fact.fromSm ? 'hidden sm:list-item' : undefined}>
                                        {fact.text}
                                    </li>
                                ),
                            )}
                        </ul>
                    ) : null}
                    {children}
                </div>
                {aside ? <div className="lg:col-span-5">{aside}</div> : null}
            </div>
        </section>
    );
}
