'use client';

/**
 * Lenis Smooth Scroll Provider
 * Light desktop smoothing without making wheel input feel delayed.
 *
 * It runs on wide screens without reduced motion, and never on the reading
 * pages (/blog and /learn), which scroll natively. The module is imported
 * only when it is about to run, after hydration, so phones and the reading
 * pages never download it and its rAF loop never starts there.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from '@studio-freight/lenis';

const NATIVE_SCROLL_PAGES = /^\/(?:blog|learn)(?:\/|$)/;

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        if (NATIVE_SCROLL_PAGES.test(pathname)) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.matchMedia('(max-width: 767px)').matches) return;

        let cancelled = false;
        let lenis: Lenis | null = null;
        let rafId = 0;

        import('@studio-freight/lenis')
            .then(({ default: LenisClass }) => {
                if (cancelled) return;
                const instance = new LenisClass({
                    duration: 0.45,
                    easing: (t) => 1 - Math.pow(1 - t, 3),
                    orientation: 'vertical',
                    gestureOrientation: 'vertical',
                    smoothWheel: true,
                    wheelMultiplier: 1.25,
                    touchMultiplier: 2,
                });
                lenis = instance;

                const raf = (time: number) => {
                    instance.raf(time);
                    rafId = requestAnimationFrame(raf);
                };
                rafId = requestAnimationFrame(raf);
            })
            .catch(() => {
                // Without the chunk the page simply scrolls natively.
            });

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
            lenis?.destroy();
        };
    }, [pathname]);

    return <>{children}</>;
}
