'use client';

import { useEffect, useState } from 'react';
import { readArticles, subscribeRead } from './reading-state';

/** Slugs this reader has finished. Empty on the server and first paint. */
export function useReadArticles(): string[] {
    const [read, setRead] = useState<string[]>([]);
    useEffect(() => {
        const sync = () => setRead(readArticles());
        const frame = requestAnimationFrame(sync);
        const unsubscribe = subscribeRead(sync);
        return () => {
            cancelAnimationFrame(frame);
            unsubscribe();
        };
    }, []);
    return read;
}
