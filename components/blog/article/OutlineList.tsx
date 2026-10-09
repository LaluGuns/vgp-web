/**
 * Section links for a lesson. Plain markup, so the server renders it; the
 * reading tracker marks the current section with aria-current, and the
 * styles follow that attribute. `touch` gives each link a 44 px row, for phones.
 */

export interface OutlineItem {
    id: string;
    title: string;
}

export function OutlineList({ headings, touch = false }: { headings: OutlineItem[]; touch?: boolean }) {
    return (
        <ol className={touch ? '' : 'space-y-1'}>
            {headings.map((h, i) => (
                <li key={h.id}>
                    <a
                        href={`#${h.id}`}
                        className={`vgp-focus flex gap-3 border-l border-white/10 pl-3 text-sm leading-snug text-white/60 transition-colors hover:text-white aria-[current=location]:border-white aria-[current=location]:text-white ${
                            touch ? 'min-h-11 items-center py-2.5' : 'py-1.5'
                        }`}
                    >
                        <span className="w-5 shrink-0 tabular-nums text-white/50" aria-hidden="true">
                            {i + 1}.
                        </span>
                        <span>{h.title}</span>
                    </a>
                </li>
            ))}
        </ol>
    );
}
