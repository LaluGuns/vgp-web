"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useGuestGateStore } from "@/lib/stores/guest-gate-store";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { track } from "@/lib/analytics";
import { useTranslation } from "@/hooks/use-translation";

/**
 * Sign-in gate shown to signed-out visitors AFTER they finish a focus block.
 * Fires at the break boundary (never mid-session) so it never interrupts deep
 * work. Dismissible — it's a soft, recurring nudge, not a hard lock.
 * Mirrors the UpgradePrompt shell.
 */
export function GuestGate() {
  const { t } = useTranslation();
  const { open, close } = useGuestGateStore();
  // The Friction Audit (SessionSummary) fires at the same break boundary. Hold
  // this gate until that modal is dismissed so the user never faces two
  // stacked dialogs; `open` stays true, so we appear right after.
  const summaryShowing = useFocusSessionStore((s) => s.lastSummary !== null);
  const visible = open && !summaryShowing;
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [visible, close]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="guest-gate-title" className="glass-card relative w-full max-w-sm overflow-hidden rounded-3xl border border-primary/25 p-6 shadow-[0_24px_80px_rgba(0,0,0,.65)]">
        <button ref={closeButtonRef} type="button" onClick={close} aria-label={t("guestGate.close", "Close")} className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 id="guest-gate-title" className="text-xl font-bold text-white">{t("guestGate.title", "Nice — one block done.")}</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          {t("guestGate.body", "Sign in to save this session, keep your streak going, and see your focus stats. Your progress stays tied to your account.")}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={close} className="h-11 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 hover:text-white">
            {t("guestGate.keepGuest", "Keep as guest")}
          </button>
          <Link href="/login?next=/app" onClick={() => track("guest_sign_in_clicked", {})} className="grid h-11 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_24px_rgba(0,229,255,.22)]">
            {t("guestGate.signIn", "Sign in")}
          </Link>
        </div>
      </section>
    </div>
  );
}
