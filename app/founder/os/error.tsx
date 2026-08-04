'use client';

import { CircleAlert, RefreshCw } from 'lucide-react';

export default function FounderOsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#02070c] p-5 text-white">
            <div className="w-full max-w-lg rounded-[1.6rem] border border-rose-300/15 bg-[#07121b] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-300/[0.08] text-rose-100">
                    <CircleAlert className="h-5 w-5" aria-hidden="true" />
                </span>
                <h1 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
                    Founder OS could not load.
                </h1>
                <p className="mt-2 text-sm leading-6 text-white/50">
                    No external action was attempted. Retry the snapshot load or inspect the server error
                    before continuing.
                </p>
                {error.digest ? (
                    <p className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-3 font-mono text-[10px] text-white/35">
                        Error reference: {error.digest}
                    </p>
                ) : null}
                <button
                    type="button"
                    onClick={reset}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white/75 transition hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Retry snapshot
                </button>
            </div>
        </main>
    );
}
