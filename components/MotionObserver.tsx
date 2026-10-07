'use client';

import { useEffect } from 'react';

/**
 * Drives [data-reveal]. Elements already on screen when they mount are left
 * alone; elements below the fold are hidden, then eased in as they scroll into
 * view. New content (route changes, lazy sections) is picked up by a
 * MutationObserver. Does nothing under prefers-reduced-motion.
 */
export function MotionObserver() {
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const intersection = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.setAttribute('data-reveal-state', 'shown');
                    intersection.unobserve(entry.target);
                }
            },
            { rootMargin: '0px 0px -8% 0px' },
        );

        const scan = () => {
            const fold = window.innerHeight * 0.92;
            // Pending elements are re-observed too: a remount (Strict Mode,
            // fast refresh) disconnects the previous observer.
            document.querySelectorAll('[data-reveal]:not([data-reveal-state="shown"])').forEach((element) => {
                if (element.getBoundingClientRect().top < fold) {
                    element.setAttribute('data-reveal-state', 'shown');
                    return;
                }
                element.setAttribute('data-reveal-state', 'pending');
                intersection.observe(element);
            });
        };

        let frame = 0;
        const mutations = new MutationObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(scan);
        });

        scan();
        mutations.observe(document.body, { childList: true, subtree: true });

        return () => {
            cancelAnimationFrame(frame);
            mutations.disconnect();
            intersection.disconnect();
        };
    }, []);

    return null;
}
