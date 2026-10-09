'use client';

import { useEffect } from 'react';

/**
 * Glossary definitions open as popovers pinned to the bottom of the screen
 * (bottom right on wide screens). When the word that opened one sits in the
 * lower half of the screen, the popover would cover it, so it opens at the
 * top instead, just under the site header. If the screen is too short for
 * either, the popover gets the room on the far side of the word and scrolls.
 */
export function TermPlacement() {
    useEffect(() => {
        const place = (event: Event) => {
            const pop = event.target as HTMLElement;
            if (!pop.classList?.contains('vgp-term-pop')) return;
            const state = (event as Event & { newState?: string }).newState;
            if (event.type === 'beforetoggle' && state === 'open') {
                const term = document.querySelector<HTMLElement>(`[popovertarget="${pop.id}"]:not([popovertargetaction])`);
                if (!term) return;
                const box = term.getBoundingClientRect();
                const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
                const top = Math.max(16, Math.round(header + 8));
                const below = box.top + box.height / 2 > window.innerHeight / 2;
                pop.toggleAttribute('data-top', below);
                pop.style.setProperty('--vgp-pop-top', `${top}px`);
                // The room between the popover's edge and the word, less a small gap.
                const room = below ? box.top - top - 8 : window.innerHeight - 16 - box.bottom - 8;
                pop.style.maxHeight = `${Math.max(160, Math.floor(room))}px`;
            }
        };
        document.addEventListener('beforetoggle', place, true);
        return () => document.removeEventListener('beforetoggle', place, true);
    }, []);

    return null;
}
