// Server-rendered building blocks shared by the marketing pages.
import Link from "next/link";
import type { Locale } from "@/lib/translations/dictionaries";
import type { FaqItem } from "@/lib/marketing/seo";
import { getFreeTimerLinks, getMarketingShared } from "@/lib/translations/pages/shared";

export function CopyBlock({ paragraphs }: { paragraphs: string[] }) {
  return (
    <section className="max-w-2xl space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-white/70 leading-relaxed">
          {p}
        </p>
      ))}
    </section>
  );
}

export function FaqBlock({ heading, faq }: { heading: string; faq: FaqItem[] }) {
  return (
    <section className="max-w-2xl space-y-5">
      <h2 className="text-xl font-bold text-white tracking-tight">{heading}</h2>
      <div className="space-y-4">
        {faq.map((f) => (
          <div key={f.q} className="border-b border-white/[0.06] pb-4 space-y-1.5">
            <h3 className="text-sm font-semibold text-white">{f.q}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Pill links into the timer preset cluster (skips the current page). */
export function TimerLinksBlock({
  locale,
  currentPath,
}: {
  locale: Locale;
  currentPath?: string;
}) {
  const shared = getMarketingShared(locale);
  const links = getFreeTimerLinks(locale).filter(
    (l) => !currentPath || !l.href.endsWith(`/${currentPath}`)
  );
  return (
    <section className="space-y-3">
      <h2 className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
        {shared.otherTimersHeading}
      </h2>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-mono border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
