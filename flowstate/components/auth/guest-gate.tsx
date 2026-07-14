"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useGuestGateStore } from "@/lib/stores/guest-gate-store";
import { track } from "@/lib/analytics";

/**
 * Sign-in gate shown to signed-out visitors AFTER they finish a focus block.
 * Fires at the break boundary (never mid-session) so it never interrupts deep
 * work. Dismissible — it's a soft, recurring nudge, not a hard lock.
 *
 * Copy is intentionally hardcoded English for now (localization keys land once
 * the dictionary file is free); mirrors the UpgradePrompt shell.
 */
export function GuestGate() {
  const { open, close } = useGuestGateStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="guest-gate-title" className="glass-card relative w-full max-w-sm overflow-hidden rounded-3xl border border-primary/25 p-6 shadow-[0_24px_80px_rgba(0,0,0,.65)]">
        <button ref={closeButtonRef} type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 id="guest-gate-title" className="text-xl font-bold text-white">Nice — one block done.</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Sign in to save this session, keep your streak going, and unlock your focus stats. Your progress stays tied to your account.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={close} className="h-11 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 hover:text-white">
            Keep as guest
          </button>
          <Link href="/login?next=/app" onClick={() => track("guest_sign_in_clicked", {})} className="grid h-11 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_24px_rgba(0,229,255,.22)]">
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
