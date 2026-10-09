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
 */

const KEY = 'vgp_lessons_scroll';
/** How long after a popstate a list may still count as "mounted by Back". */
const TRAVERSE_WINDOW = 5000;

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

export function useScrollMemory() {
    const pathname = usePathname();

    useEffect(() => {
        let frame = 0;
        const url = here();
        if (traverse && traverse.url === url && Date.now() - traverse.at < TRAVERSE_WINDOW) {
            const top = readPositions()[url];
            if (typeof top === 'number') {
                frame = requestAnimationFrame(() => {
                    // Cleared here rather than in the effect, so a Strict Mode re-run still restores.
                    traverse = null;
                    window.scrollTo({ top, behavior: 'instant' });
                });
            }
        }

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
            cancelAnimationFrame(frame);
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
