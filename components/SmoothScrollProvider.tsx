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
 * In-page anchor links glide everywhere except those reading pages, where a
 * deep link or #section must land at once: through Lenis on wide screens,
 * and through scroll-behavior: smooth on <html> on phones, where Lenis does
 * not run (with Lenis running, a CSS smooth scroll under it stalls every
 * wheel). The value is set inline here, per route, because a stylesheet
 * rule on html would apply to lessons too. Next keeps it
 * (data-scroll-behavior="smooth" in app/layout.tsx): route changes still
 * jump, then the inline value returns.
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from '@studio-freight/lenis';

const NATIVE_SCROLL_PAGES = /^\/(?:blog|learn)(?:\/|$)/;
const WIDE = '(min-width: 768px)';
/** Matches scroll-padding-top in app/globals.css: room for the fixed header. */
const HEADER_OFFSET = 88;

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const html = document.documentElement;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        // Smooth anchor scrolling where the page scrolls natively. On wide
        // screens Lenis drives the scroll and glides anchors itself; a CSS
        // smooth scroll under it fights every frame Lenis writes.
        const apply = () => {
            const native = NATIVE_SCROLL_PAGES.test(pathname) || reducedMotion.matches;
            html.style.scrollBehavior = native || window.matchMedia(WIDE).matches ? '' : 'smooth';
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
        if (!window.matchMedia(WIDE).matches) return;

        let cancelled = false;
        let lenis: Lenis | null = null;
        let rafId = 0;

        // Same-page anchor links glide through Lenis. The history entry is
        // pushed first, so Back returns to where the reader was; the final
        // location.replace sets :target and where Tab goes next.
        const onClick = (event: MouseEvent) => {
            if (!lenis || event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const link = (event.target as Element | null)?.closest?.('a[href*="#"]');
            if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== '_self')) return;
            const url = new URL(link.href, window.location.href);
            const here = window.location;
            if (!url.hash || url.origin !== here.origin || url.pathname !== here.pathname || url.search !== here.search) return;
            const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
            if (!target) return;
            event.preventDefault();
            if (url.hash !== here.hash) window.history.pushState(window.history.state, '', url.hash);
            lenis.scrollTo(target, { offset: -HEADER_OFFSET, onComplete: () => window.location.replace(url.hash) });
        };
        document.addEventListener('click', onClick);

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
            document.removeEventListener('click', onClick);
            cancelAnimationFrame(rafId);
            lenis?.destroy();
        };
    }, [pathname]);

    return <>{children}</>;
}
