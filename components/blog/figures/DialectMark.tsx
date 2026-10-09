import { resolveDialect, type Dialect } from '@/lib/blog/dialects';

/**
 * The lesson group's mark: the same glyph its figures use for a value (a
 * square, a note head, a focus ring, a ledger bar ending in its tick), in
 * the group's accent. It sits beside the category name on a lesson and on
 * its learning path, so the colour and shape in the figures have a key
 * before the first figure. Decorative for screen readers: the category is
 * already in the text next to it.
 */
export function DialectMark({ dialect, className = '' }: { dialect: Dialect | string | undefined; className?: string }) {
    const d = resolveDialect(dialect);
    return (
        <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" focusable="false" className={`inline-block shrink-0 ${className}`} color={d.accent}>
            {d.marker === 'square' ? <rect x={2.5} y={2.5} width={7} height={7} fill="currentColor" /> : null}
            {d.marker === 'head' ? <ellipse cx={6} cy={6} rx={4.7} ry={3.3} transform="rotate(-20 6 6)" fill="currentColor" /> : null}
            {d.marker === 'ring' ? (
                <g fill="currentColor">
                    <circle cx={6} cy={6} r={2.2} />
                    <circle cx={6} cy={6} r={5} fill="none" stroke="currentColor" strokeOpacity={0.6} strokeWidth={1} />
                </g>
            ) : null}
            {d.marker === 'tick' ? (
                <g fill="currentColor">
                    <rect x={0.5} y={4} width={9} height={4} />
                    <rect x={9} y={1} width={2} height={10} />
                </g>
            ) : null}
        </svg>
    );
}
