"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function LegalShell({
  title,
  updated,
  active,
  children,
}: {
  title: string;
  updated: string;
  active: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const lastUpdated = t("legal.last_updated", "Last updated: {date}").replace("{date}", updated);
  const [contactBefore, contactAfter = ""] = t(
    "legal.questions_contact",
    "Questions? Contact {email}."
  ).split("{email}");

  const legalNav = [
    { href: "/legal/terms", label: t("dashboard.terms", "Terms") },
    { href: "/legal/privacy", label: t("dashboard.privacy", "Privacy") },
    { href: "/legal/refund", label: t("dashboard.refunds", "Refunds") },
    { href: "/legal/cookies", label: t("dashboard.cookies", "Cookies") },
  ];

  return (
    <main className="min-h-screen overflow-y-auto flex justify-center p-4 py-12 bg-[#060216]">
      <div className="w-full max-w-2xl space-y-5">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t("dashboard.backToFlowstate", "Back to Flowstate")}
        </Link>

        <div className="glass-card p-7 md:p-9 space-y-6">
          <header className="space-y-3 border-b border-white/[0.06] pb-5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground/50">
              {lastUpdated}
            </p>
            <nav className="flex flex-wrap gap-1.5 pt-1">
              {legalNav.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    "px-3 py-1 rounded-lg text-[11px] font-mono transition-colors border " +
                    (l.label === t(`dashboard.${active.toLowerCase() === "refunds" ? "refunds" : active.toLowerCase()}`, active)
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "text-muted-foreground/60 hover:text-white border-transparent hover:bg-white/5")
                  }
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </header>

          <article className="legal-prose space-y-5 text-sm leading-relaxed text-muted-foreground/85">
            {children}
          </article>

          <footer className="pt-5 border-t border-white/[0.06] text-[11px] text-muted-foreground/50 leading-relaxed">
            {contactBefore}
            <a
              href="mailto:founder@virzyguns.com"
              className="text-primary/80 hover:text-primary transition-colors"
            >
              founder@virzyguns.com
            </a>
            {contactAfter}
          </footer>
        </div>
      </div>
    </main>
  );
}
