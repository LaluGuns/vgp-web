'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps a closing menu or dialog mounted for its exit transition.
 *
 * `mounted` is true while `open` is, and for `ms` after it turns false;
 * `closing` is true during that tail. Render the element while `mounted` and
 * set `data-closing` on it while `closing`: the `.vgp-shell-*` rules in
 * app/globals.css fade it in with @starting-style and out on data-closing.
 */
export function useExitTransition(open: boolean, ms: number) {
    const [lingering, setLingering] = useState(false);
    const [wasOpen, setWasOpen] = useState(open);

    // Adjust state while rendering when `open` flips (no extra effect pass):
    // opening cancels any exit, closing starts one.
    if (open !== wasOpen) {
        setWasOpen(open);
        setLingering(!open);
    }

    useEffect(() => {
        if (!lingering) return;
        const timer = window.setTimeout(() => setLingering(false), ms);
        return () => window.clearTimeout(timer);
    }, [lingering, ms]);

    return { mounted: open || lingering, closing: !open && lingering };
}
