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
            className={`vgp-focus inline-flex min-h-11 min-w-11 items-center rounded-sm ${className}`}
        >
            <span className="vgp-link">{children}</span>
        </Link>
    );
}
