// Server-rendered shell for the static marketing pages (/timer/*, the
// keyword landings, /license, /alternatives/*). Pure HTML/CSS — no WebGL
// background, no app stores — so these pages stay light and fully SSG.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/translations/dictionaries";
import { getTranslator } from "@/lib/translations/server";
import { getFreeTimerLinks, getMarketingShared } from "@/lib/translations/pages/shared";

export function MarketingShell({
  locale,
  breadcrumb,
  children,
}: {
  locale: Locale;
  /** Visible breadcrumb trail; last item is the current page (no link). */
  breadcrumb: { name: string; href?: string }[];
  children: React.ReactNode;
}) {
  const t = getTranslator(locale);
  const timerLinks = getFreeTimerLinks(locale);

  return (
    <div
      data-theme="glass"
      className="min-h-screen text-foreground"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, hsl(250 45% 10%) 0%, hsl(258 55% 5%) 55%, hsl(260 55% 3%) 100%)",
      }}
    >
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/[0.05]">
        <Link href={`/${locale}`} className="flex items-center gap-2 select-none shrink-0">
          <img
            src="/icons/flowstate-logo.png"
            alt="Flow by Virzy Guns logo"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <Link
          href={`/${locale}/app`}
          className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#00e5ff] border border-[#00e5ff]/30 hover:border-[#00e5ff] bg-[#00e5ff]/5 hover:bg-[#00e5ff]/10 rounded-xl transition-all duration-200"
        >
          {t("legal.landing.cta_start", "Start Focusing (Free)")}
        </Link>
      </header>

      <main className="w-full max-w-5xl mx-auto px-6 py-10 md:py-14 space-y-12">
        {/* Visible breadcrumb (matches the BreadcrumbList JSON-LD) */}
        <nav aria-label="Breadcrumb" className="text-[10px] font-mono text-white/40 flex flex-wrap items-center gap-1.5 uppercase tracking-wider">
          {breadcrumb.map((item, i) => (
            <span key={`${item.name}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-white/20">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-white transition-colors">
                  {item.name}
                </Link>
              ) : (
                <span className="text-white/60">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        {children}
      </main>

      {/* Footer with the free-timer cluster for internal linking */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-10 border-t border-white/[0.05] space-y-8">
        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
            {t("legal.landing.footer_timers", "Free timers")}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-mono text-white/50">
            {timerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-[10px] font-mono text-white/40">
            © {new Date().getFullYear()} Flow by Virzy Guns. {t("legal.landing.footer_rights", "All rights reserved.")}
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-white/40">
            <Link href={`/${locale}/pricing`} className="hover:text-white transition-colors">
              {t("legal.landing.nav_pricing", "Pricing")}
            </Link>
            <Link href={`/${locale}/legal/terms`} className="hover:text-white transition-colors">
              {t("dashboard.terms", "Terms")}
            </Link>
            <Link href={`/${locale}/legal/privacy`} className="hover:text-white transition-colors">
              {t("dashboard.privacy", "Privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Standard end-of-page CTA card pointing at /{lang}/app. */
export function MarketingCta({
  locale,
  title,
  body,
  button,
}: {
  locale: Locale;
  title: string;
  body: string;
  button: string;
}) {
  return (
    <section className="glass-card rounded-3xl border border-white/10 p-8 md:p-10 text-center space-y-4 bg-black/25">
      <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{title}</h2>
      <p className="text-sm text-white/60 max-w-xl mx-auto leading-relaxed">{body}</p>
      <div className="pt-2">
        <Link
          href={`/${locale}/app`}
          className="inline-flex items-center gap-2 px-8 py-4 text-xs font-mono font-bold uppercase tracking-widest text-black bg-[#00e5ff] rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        >
          {button}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
