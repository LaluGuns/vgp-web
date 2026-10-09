'use client';

import { useEffect, type RefObject } from 'react';

/** Room kept beside a revealed chip: past the 48 px edge fade on the right, a neighbour's edge on the left. */
const EDGE = 56;

/** Scroll a sideways row (not the page) just far enough that `el` sits clear of its edges. */
function reveal(row: HTMLElement, el: HTMLElement) {
    if (row.scrollWidth <= row.clientWidth + 1) return;
    const box = row.getBoundingClientRect();
    const chip = el.getBoundingClientRect();
    const left = Math.min(EDGE, box.width / 4);
    if (chip.left < box.left + left) row.scrollLeft -= box.left + left - chip.left;
    else if (chip.right > box.right - EDGE) row.scrollLeft += chip.right - (box.right - EDGE);
}

/**
 * A row of chips or letters that scrolls sideways on a phone. Keeps the
 * selected item (`aria-pressed="true"` or `aria-current`) in view on mount
 * and whenever `selected` changes, brings a chip into view when it takes
 * keyboard focus, and sets `data-overflow` / `data-end` so the `.vgp-scroll`
 * rule in globals.css fades the right edge while more sits past it.
 */
export function useChipRow(ref: RefObject<HTMLElement | null>, selected: string) {
    useEffect(() => {
        const row = ref.current;
        if (!row) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const overflow = row.scrollWidth > row.clientWidth + 1;
            row.toggleAttribute('data-overflow', overflow);
            row.toggleAttribute('data-end', !overflow || row.scrollLeft + row.clientWidth >= row.scrollWidth - 2);
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        const onFocus = (event: FocusEvent) => {
            if (event.target instanceof HTMLElement && event.target !== row) reveal(row, event.target);
        };
        schedule();
        const observer = new ResizeObserver(schedule);
        observer.observe(row);
        row.addEventListener('scroll', schedule, { passive: true });
        row.addEventListener('focusin', onFocus);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            row.removeEventListener('scroll', schedule);
            row.removeEventListener('focusin', onFocus);
        };
    }, [ref]);

    useEffect(() => {
        const row = ref.current;
        const current = row?.querySelector<HTMLElement>('[aria-pressed="true"], [aria-current]');
        if (row && current) reveal(row, current);
    }, [ref, selected]);
}
