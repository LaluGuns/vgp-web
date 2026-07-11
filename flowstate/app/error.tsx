"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console and report to Sentry (no-op without NEXT_PUBLIC_SENTRY_DSN).
    console.error("App error boundary:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#060216] text-center">
      <div className="glass-card max-w-sm w-full p-8 space-y-4">
        <div className="text-primary font-mono text-3xl font-bold tracking-tighter glow-text-primary">
          Something broke
        </div>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          An unexpected error interrupted your session. Your focus data is saved.
        </p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/25 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full text-sm text-muted-foreground/70 hover:text-white transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
