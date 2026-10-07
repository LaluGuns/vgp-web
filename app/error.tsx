'use client';

import { useEffect } from 'react';
import { TextLink } from '@/components/editorial/EditorialPrimitives';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <article className="editorial-shell min-h-screen px-4 pb-28 pt-16 text-white sm:px-6 sm:pt-24">
            <div className="mx-auto max-w-3xl">
                <p className="font-mono text-sm text-sky-300">Error</p>
                <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
                    Something skipped.
                </h1>
                <p className="mt-6 max-w-md text-lg leading-8 text-white/70">
                    This page hit a problem while loading. Trying again usually fixes it.
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]"
                    >
                        Try again
                    </button>
                    <TextLink href="/">Go to the home page</TextLink>
                </div>
                {error.digest ? <p className="mt-10 font-mono text-xs text-white/40">Reference: {error.digest}</p> : null}
            </div>
        </article>
    );
}
