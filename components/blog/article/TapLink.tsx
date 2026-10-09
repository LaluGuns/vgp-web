import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * A small text link with a 44 px tall hit area (WCAG 2.5.5), for
 * breadcrumbs and "back to the path" links. The underline stays on the
 * text; the box around it takes the tap.
 */
export function TapLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
    return (
        <Link
            href={href}
            className={`inline-flex min-h-11 min-w-11 items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${className}`}
        >
            <span className="vgp-link">{children}</span>
        </Link>
    );
}
