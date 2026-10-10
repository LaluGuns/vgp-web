import type { ReactNode } from 'react';

/**
 * The opening of every Learn page (/learn, /blog, the path pages, the
 * glossary): an optional label above the title, the display title, a
 * description and whatever the page adds under it. One spacing and type
 * scale for all of them, so the area reads as one place under its
 * sub-navigation (docs/DESIGN.md, "Learn area"). `facts` is a row of plain
 * counts from the data, on a hairline, like the book page's.
 */
export function LearnHeader({
    label,
    title,
    description,
    facts,
    children,
    titleClassName = '',
}: {
    label?: ReactNode;
    title: ReactNode;
    description: ReactNode;
    facts?: string[];
    children?: ReactNode;
    titleClassName?: string;
}) {
    return (
        <section data-enter="" className="px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
            <div className="mx-auto max-w-7xl">
                {label ? <div className="mb-3 flex items-center gap-2 text-sm text-white/55">{label}</div> : null}
                <h1 className={`max-w-[18ch] font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white ${titleClassName}`}>
                    {title}
                </h1>
                <div className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">{description}</div>
                {facts?.length ? (
                    <ul className="mt-6 flex max-w-2xl flex-wrap gap-x-6 gap-y-1 border-t border-white/10 pt-4 text-sm tabular-nums text-white/60">
                        {facts.map((fact) => (
                            <li key={fact}>{fact}</li>
                        ))}
                    </ul>
                ) : null}
                {children}
            </div>
        </section>
    );
}
