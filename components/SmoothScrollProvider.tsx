'use client';

/**
 * Lenis Smooth Scroll Provider
 * Light desktop smoothing without making wheel input feel delayed.
 *
 * It runs on wide screens without reduced motion, and never on the reading
 * pages (/blog and /learn), which scroll natively. The module is imported
 * only when it is about to run, after hydration, so phones and the reading
 * pages never download it and its rAF loop never starts there.
 *
 * In-page anchor links glide (scroll-behavior: smooth on <html>) everywhere
 * except those reading pages, where a deep link or #section must land at once.
 * It is set inline here, per route, because a stylesheet rule on html would
 * apply to lessons too. Next keeps it (data-scroll-behavior="smooth" in
 * app/layout.tsx): route changes still jump, then the inline value returns.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from '@studio-freight/lenis';

const NATIVE_SCROLL_PAGES = /^\/(?:blog|learn)(?:\/|$)/;

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const html = document.documentElement;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const apply = () => {
            html.style.scrollBehavior = NATIVE_SCROLL_PAGES.test(pathname) || reducedMotion.matches ? '' : 'smooth';
        };
        apply();
        reducedMotion.addEventListener('change', apply);
        return () => {
            reducedMotion.removeEventListener('change', apply);
            html.style.scrollBehavior = '';
        };
    }, [pathname]);

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
