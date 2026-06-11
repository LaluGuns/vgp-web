'use client';

/**
 * Lenis Smooth Scroll Provider
 * Light desktop smoothing without making wheel input feel delayed.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from '@studio-freight/lenis';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        if (pathname.startsWith('/blog')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.matchMedia('(max-width: 767px)').matches) return;

        const lenis = new Lenis({
            duration: 0.45,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.25,
            touchMultiplier: 2,
        });

        let rafId = 0;

        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, [pathname]);

    return <>{children}</>;
}
