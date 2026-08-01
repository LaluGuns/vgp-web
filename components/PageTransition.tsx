'use client';

/**
 * PageTransition — Lightweight CSS-only page entrance
 * Uses CSS transitions instead of Framer Motion spring physics
 * for dramatically faster page loads.
 */

import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <div
            className="translate-y-0 opacity-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
            {children}
        </div>
    );
}
