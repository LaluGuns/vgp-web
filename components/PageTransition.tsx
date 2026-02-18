'use client';

/**
 * PageTransition — Lightweight CSS-only page entrance
 * Uses CSS transitions instead of Framer Motion spring physics
 * for dramatically faster page loads.
 */

import { useEffect, useState, ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Micro-delay for CSS transition to kick in
        const t = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(t);
    }, []);

    return (
        <div
            className={`transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${visible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
        >
            {children}
        </div>
    );
}
