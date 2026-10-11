import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * A small text link with a 44 px tall hit area (WCAG 2.5.5), for
 * breadcrumbs and "back to the path" links. The underline stays on the
 * text; the box around it takes the tap.
 *
 * The underline is drawn by an inline span inside a plain box: a flex item
 * of its own would be a block, and a link that wraps would then draw one
 * line across the whole column under its last line, like a divider. The
 * box keeps the 3 px under the text that the block had, so the text stays
 * where it was, and `.vgp-link-tap` (app/globals.css) keeps the underline
 * where it was.
 */
export function TapLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
    return (
        <Link
            href={href}
            className={`vgp-focus inline-flex min-h-11 min-w-11 items-center rounded-sm ${className}`}
        >
            <span className="min-w-0 pb-[3px] [text-wrap:balance]">
                <span className="vgp-link vgp-link-tap">{children}</span>
            </span>
        </Link>
    );
}
