'use client';

/**
 * PageTransition — Server-safe CSS page entrance
 * Defaults to visible state so SSR HTML renders with full opacity for search crawlers.
 */

import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <div className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-100 translate-y-0">
            {children}
        </div>
    );
}
