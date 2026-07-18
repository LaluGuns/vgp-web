"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useUpgradePromptStore } from "@/lib/stores/upgrade-prompt-store";
import { track } from "@/lib/analytics";

export function UpgradePrompt() {
  const { t } = useTranslation();
  const { open, messageKey, fallback, close } = useUpgradePromptStore();
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
      <section role="dialog" aria-modal="true" aria-labelledby="upgrade-title" className="glass-card relative w-full max-w-sm overflow-hidden rounded-3xl border border-primary/25 p-6 shadow-[0_24px_80px_rgba(0,0,0,.65)]">
        <button ref={closeButtonRef} type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 id="upgrade-title" className="text-xl font-bold text-white">{t("pricing.fixed.tagline", "Flow Pro")}</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">{t(messageKey, fallback)}</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={close} className="h-11 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 hover:text-white">
            {t("shareModal.close", "Not now")}
          </button>
          <Link href="/pricing" onClick={() => { track("upgrade_clicked", { source: "prompt" }); close(); }} className="grid h-11 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_24px_rgba(0,229,255,.22)]">
            {t("legal.landing.pricing_go_pro", "See Pro")}
          </Link>
        </div>
      </section>
    </div>
  );
}
