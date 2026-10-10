'use client';

import { useEffect } from 'react';
import { closeOpenWhenFocusLeaves } from './popover-focus';

/** Space kept between the definition and the word that opened it, and under the site header. */
const GAP = 8;

/**
 * Glossary definitions open as popovers pinned to the bottom of the screen
 * (bottom right on wide screens), or at the top, just under the site
 * header: whichever side of the word that opened it has more room, so the
 * word stays in view, and never taller than that room. When the definition
 * is too tall for either side (a phone held sideways), the page first
 * brings the word up under the header and the definition opens below it;
 * only if it still does not fit does it scroll inside. Tab past the
 * definition's last link closes it, so focus never moves on underneath it.
 *
 * Once it is open, the focus moves onto the definition (a dialog named by
 * the term and described by its definition), so a screen reader reads it
 * where it opened instead of saying nothing; the browser hands the focus
 * back to the word on Escape or Close. The move never scrolls the page: the
 * definition is already placed on screen.
 */
export function TermPlacement() {
    useEffect(() => {
        const wide = window.matchMedia('(min-width: 1024px)');
        const enter = (event: Event) => {
            const pop = event.target as HTMLElement;
            if (!pop.classList?.contains('vgp-term-pop') || (event as Event & { newState?: string }).newState !== 'open') return;
            if (!pop.matches(':popover-open') || pop.contains(document.activeElement)) return;
            pop.focus({ preventScroll: true });
        };
        const place = (event: Event) => {
            const pop = event.target as HTMLElement;
            if (!pop.classList?.contains('vgp-term-pop')) return;
            const state = (event as Event & { newState?: string }).newState;
            if (event.type !== 'beforetoggle' || state !== 'open') return;
            const term = document.querySelector<HTMLElement>(`[popovertarget="${pop.id}"]:not([popovertargetaction])`);
            if (!term) return;
            const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
            const top = Math.max(16, Math.round(header + GAP));
            // The popover's inset from the bottom of the screen (app/globals.css, .vgp-term-pop).
            const edge = wide.matches ? 24 : 16;
            pop.style.setProperty('--vgp-pop-top', `${top}px`);

            // Its full height and its left and right edges, measured unseen before it opens.
            pop.removeAttribute('data-top');
            pop.style.maxHeight = '';
            pop.style.visibility = 'hidden';
            pop.style.display = 'block';
            const size = pop.getBoundingClientRect();
            pop.style.removeProperty('display');
            pop.style.removeProperty('visibility');

            const rooms = () => {
                const word = term.getBoundingClientRect();
                return { word, above: word.top - top - GAP, below: window.innerHeight - edge - word.bottom - GAP };
            };
            const { word } = rooms();
            let { above, below } = rooms();
            // On a wide screen the definition sits to the right and may miss the word altogether.
            const overlaps = size.left < word.right && size.right > word.left;
            if (overlaps && Math.max(above, below) < size.height) {
                window.scrollBy({ top: word.top - top, behavior: 'instant' });
                ({ above, below } = rooms());
            }
            const atTop = above > below;
            pop.toggleAttribute('data-top', atTop);
            const room = overlaps ? Math.max(above, below) : window.innerHeight - top - edge;
            pop.style.maxHeight = `${Math.floor(room)}px`;
        };
        document.addEventListener('beforetoggle', place, true);
        document.addEventListener('toggle', enter, true);
        const stopFocus = closeOpenWhenFocusLeaves('.vgp-term-pop');
        return () => {
            document.removeEventListener('beforetoggle', place, true);
            document.removeEventListener('toggle', enter, true);
            stopFocus();
        };
    }, []);

    return null;
}
