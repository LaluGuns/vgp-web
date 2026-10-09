'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A display equation or table that may be wider than a phone. When it
 * overflows it becomes a labelled, focusable scroll region (so keyboard
 * users can scroll it with the arrow keys) and fades at the right edge
 * until the reader reaches the end.
 */
export function ScrollRegion({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [state, setState] = useState({ overflow: false, end: true });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const overflow = el.scrollWidth > el.clientWidth + 1;
            const end = !overflow || el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
            setState((s) => (s.overflow === overflow && s.end === end ? s : { overflow, end }));
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        schedule();
        const observer = new ResizeObserver(schedule);
        observer.observe(el);
        el.addEventListener('scroll', schedule, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            el.removeEventListener('scroll', schedule);
        };
    }, []);

    return (
        <div
            ref={ref}
            role={state.overflow ? 'region' : undefined}
            aria-label={state.overflow ? `${label}, scrolls sideways` : undefined}
            tabIndex={state.overflow ? 0 : undefined}
            data-overflow={state.overflow ? '' : undefined}
            data-end={state.end ? '' : undefined}
            className={`vgp-scroll overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${className}`}
        >
            {children}
        </div>
    );
}
