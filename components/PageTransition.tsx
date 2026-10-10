/**
 * PageTransition: the wrapper around a page's content. It animates
 * nothing; it only keeps the page's own layers (z-index) and absolutely
 * placed parts together, under the site header and the phone tab bar.
 *
 * No transform on it: a transform, even translate-y-0, makes the wrapper
 * the containing block for position: fixed, so a fixed part inside the page
 * (a playing demo's Stop button on /learn) scrolled away with the page
 * instead of staying on the screen. `relative z-0` stacks and contains the
 * rest exactly as the transform did.
 */

import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    return <div className="relative z-0">{children}</div>;
}
