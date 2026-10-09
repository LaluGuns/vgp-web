'use client';

import { useEffect } from 'react';

/**
 * Drives [data-reveal]. Elements already on screen when they mount are left
 * alone; elements below the fold are hidden, then eased in as they scroll into
 * view. New content (route changes, lazy sections) is picked up by a
 * MutationObserver. Does nothing under prefers-reduced-motion.
 *
 * `data-reveal="draw"` (article figures) is never hidden far from the
 * screen: it is marked "pending" only as it nears the bottom edge, then
 * "drawn" once it is 30% up the screen, which plays the one-time draw-in in
 * app/globals.css. A figure on screen at load, or reached from above, is
 * marked "shown" and never animates. Nothing is left pending on screen at
 * rest: when a scroll settles, after load and after a jump to a #section,
 * a pending figure with more than 24 px showing draws in.
 */
export function MotionObserver() {
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const revealAs =
            (state: 'shown' | 'drawn'): IntersectionObserverCallback =>
            (entries, observer) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.setAttribute('data-reveal-state', state);
                    observer.unobserve(entry.target);
                }
            };
        const intersection = new IntersectionObserver(revealAs('shown'), { rootMargin: '0px 0px -8% 0px' });
        // A figure waits until it is well inside the screen, so the drawing is seen.
        const drawing = new IntersectionObserver(revealAs('drawn'), { rootMargin: '0px 0px -30% 0px' });
        // A figure stays fully drawn until it comes within 30% of a screen of the bottom edge, so a
        // full-page capture or a quick look further down never shows it half-drawn. Only then, still
        // off screen, is it held at the start of its draw-in. One already showing (reached from
        // above, or landed on by a jump) stays as it is.
        const onScreen = (top: number) => top < window.innerHeight - 24;
        const approaching = new IntersectionObserver(
            (entries, observer) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    observer.unobserve(entry.target);
                    if (entry.target.hasAttribute('data-reveal-state')) continue;
                    if (onScreen(entry.boundingClientRect.top)) {
                        entry.target.setAttribute('data-reveal-state', 'shown');
                        continue;
                    }
                    entry.target.setAttribute('data-reveal-state', 'pending');
                    drawing.observe(entry.target);
                }
            },
            { rootMargin: '0px 0px 30% 0px' },
        );

        const scan = () => {
            const fold = window.innerHeight * 0.92;
            // Pending elements are re-observed too: a remount (Strict Mode,
            // fast refresh) disconnects the previous observer.
            document.querySelectorAll('[data-reveal]:not([data-reveal-state="shown"]):not([data-reveal-state="drawn"])').forEach((element) => {
                if (element.getAttribute('data-reveal') === 'draw') {
                    // A pending figure is left to its observer, so it draws in instead of snapping on.
                    if (element.getAttribute('data-reveal-state') === 'pending') drawing.observe(element);
                    else if (onScreen(element.getBoundingClientRect().top)) element.setAttribute('data-reveal-state', 'shown');
                    else approaching.observe(element);
                    return;
                }
                if (element.getBoundingClientRect().top < fold) {
                    element.setAttribute('data-reveal-state', 'shown');
                    return;
                }
                element.setAttribute('data-reveal-state', 'pending');
                intersection.observe(element);
            });
        };

        // A figure that comes to rest low on the screen, under the line where it would start drawing,
        // draws in then instead of waiting at 40% for the next scroll.
        const settle = () => {
            document.querySelectorAll('[data-reveal="draw"][data-reveal-state="pending"]').forEach((element) => {
                const { top, bottom } = element.getBoundingClientRect();
                if (!onScreen(top) || bottom < 24) return;
                drawing.unobserve(element);
                element.setAttribute('data-reveal-state', 'drawn');
            });
        };
        let idle = 0;
        // scrollend where the browser has it; 150 ms without a scroll event everywhere, so a jump that fires
        // no scrollend still settles.
        const settleSoon = () => {
            window.clearTimeout(idle);
            idle = window.setTimeout(settle, 150);
        };
        const settleNow = () => {
            window.clearTimeout(idle);
            settle();
        };

        // Only a batch that brings in [data-reveal] content (a route change, a lazy section) needs a scan.
        // Everything else (a demo mounting, a popover, a list growing) is skipped without reading
        // layout, so DOM work elsewhere on the page never pays for a forced layout here.
        const bringsReveal = (records: MutationRecord[]) =>
            records.some((record) =>
                Array.from(record.addedNodes).some(
                    (node) => node instanceof Element && (node.hasAttribute('data-reveal') || node.querySelector('[data-reveal]') !== null),
                ),
            );
        let frame = 0;
        const mutations = new MutationObserver((records) => {
            if (!bringsReveal(records)) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(scan);
        });

        // Every draw-in mark fires animationstart and animationend. Nothing listens for them, but each one
        // bubbling to React's root listener costs a walk up the tree, about 1 ms on a slow phone, so a busy
        // figure finishing could add 20 ms to one frame. They stop at the window, before the root sees them.
        const quietDrawIn = (event: AnimationEvent) => {
            if (event.target instanceof Element && event.target.closest('[data-reveal="draw"]')) event.stopPropagation();
        };

        scan();
        mutations.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('animationstart', quietDrawIn, true);
        window.addEventListener('animationend', quietDrawIn, true);
        window.addEventListener('scroll', settleSoon, { passive: true });
        window.addEventListener('scrollend', settleNow);
        window.addEventListener('hashchange', settleSoon);
        window.addEventListener('load', settleSoon);
        settleSoon();

        return () => {
            cancelAnimationFrame(frame);
            window.clearTimeout(idle);
            window.removeEventListener('scroll', settleSoon);
            window.removeEventListener('scrollend', settleNow);
            window.removeEventListener('hashchange', settleSoon);
            window.removeEventListener('load', settleSoon);
            window.removeEventListener('animationstart', quietDrawIn, true);
            window.removeEventListener('animationend', quietDrawIn, true);
            mutations.disconnect();
            intersection.disconnect();
            drawing.disconnect();
            approaching.disconnect();
        };
    }, []);

    return null;
}
