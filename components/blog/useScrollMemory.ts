'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/*
 * Back from a lesson should land where the reader left the list (/blog, a
 * path page, /learn, the glossary). The App Router does not restore scroll on
 * Back, so each list remembers its position per URL for this tab and puts it
 * back only when it mounts because of a Back or Forward to that same URL.
 *
 * The position is written when the reader leaves the page (a link click, the
 * tab going to the background, the page unloading), never per scroll frame.
 *
 * A list that fills in after hydration (the Saved view reads localStorage)
 * passes `ready` once its rows are there. The restore then waits, frame by
 * frame, until the page is tall enough to reach the old position, for at most
 * SETTLE_MS, and gives up as soon as the reader scrolls or presses a key.
 */

const KEY = 'vgp_lessons_scroll';
/** How long after a popstate a list may still count as "mounted by Back". */
const TRAVERSE_WINDOW = 5000;
/** How long the restore may wait for the page to grow to the old position. */
const SETTLE_MS = 1000;

const here = () => location.pathname + location.search;

let traverse: { url: string; at: number } | null = null;
if (typeof window !== 'undefined') {
    // At popstate the location is already the entry being returned to.
    window.addEventListener('popstate', () => {
        traverse = { url: here(), at: Date.now() };
    });
}

function readPositions(): Record<string, number> {
    try {
        const value: unknown = JSON.parse(sessionStorage.getItem(KEY) || '{}');
        return value && typeof value === 'object' ? (value as Record<string, number>) : {};
    } catch {
        return {};
    }
}

const READER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

export function useScrollMemory(ready = true) {
    const pathname = usePathname();

    useEffect(() => {
        if (!ready) return;
        const url = here();
        if (!traverse || traverse.url !== url || Date.now() - traverse.at >= TRAVERSE_WINDOW) return;
        const top = readPositions()[url];
        if (typeof top !== 'number') return;

        const until = performance.now() + SETTLE_MS;
        let frame = 0;
        const stop = () => {
            cancelAnimationFrame(frame);
            READER_INPUT.forEach((type) => window.removeEventListener(type, onReader));
        };
        // The reader moving first wins; the list stays where they put it.
        function onReader() {
            traverse = null;
            stop();
        }
        const tick = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (max < top - 1 && performance.now() < until) {
                frame = requestAnimationFrame(tick);
                return;
            }
            // Cleared here rather than in the effect, so a Strict Mode re-run still restores.
            traverse = null;
            stop();
            window.scrollTo({ top, behavior: 'instant' });
        };
        READER_INPUT.forEach((type) => window.addEventListener(type, onReader, { passive: true }));
        frame = requestAnimationFrame(tick);
        return stop;
    }, [pathname, ready]);

    useEffect(() => {
        const save = () => {
            // A late event after the router has moved on belongs to the next page.
            if (location.pathname !== pathname) return;
            try {
                sessionStorage.setItem(KEY, JSON.stringify({ ...readPositions(), [here()]: Math.round(window.scrollY) }));
            } catch {
                // Without storage, Back simply starts at the top.
            }
        };
        // Bubble phase on window: the link's own handlers (and any URL flush in the
        // list) have run, and the router has not changed the URL yet.
        const onClick = (event: MouseEvent) => {
            if (event.target instanceof Element && event.target.closest('a[href]')) save();
        };
        const onVisibility = () => {
            if (document.visibilityState === 'hidden') save();
        };
        window.addEventListener('click', onClick);
        window.addEventListener('pagehide', save);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('click', onClick);
            window.removeEventListener('pagehide', save);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [pathname]);
}

/** For server-rendered lists: remembers and restores the scroll position, renders nothing. */
export function ScrollMemory() {
    useScrollMemory();
    return null;
}
