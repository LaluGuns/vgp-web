import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketingShell, MarketingCta } from "@/components/marketing/marketing-shell";
import { SoundtrackShowcase } from "@/components/landing/soundtrack-showcase";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/marketing/seo";

const PATH = "coding-music";

function ensureEnglish(lang: string) {
  if (lang !== "en") notFound();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  ensureEnglish(lang);
  return marketingMetadata(
    lang,
    PATH,
    "Coding Music for Deep Focus | Flow",
    "Coding music for calm work blocks: original Flow soundtracks, a focus timer, and ambient layers for programming sessions."
  );
}

export default async function CodingMusicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  ensureEnglish(lang);
  const breadcrumbLd = breadcrumbJsonLd(lang, [
    { name: "Flow", path: "" },
    { name: "Coding music", path: PATH },
  ]);

  return (
    <MarketingShell
      locale={lang}
      breadcrumb={[
        { name: "Flow", href: "/" + lang },
        { name: "Coding music" },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <section className="space-y-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#00e5ff]">Coding music → Flow</p>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
          Coding music for long stretches of deliberate work.
        </h1>
        <p className="text-base text-white/70 leading-relaxed max-w-2xl">
          Flow pairs original focus music with a timer and ambient layers so a coding session has a clear start, a stable sound bed, and a measurable finish.
        </p>
        <div className="flex flex-wrap gap-3">
          <TrackedLink
            href={"/" + lang + "/app"}
            destination={"/" + lang + "/app"}
            source="coding_music_hero"
            className="inline-flex rounded-xl bg-[#00e5ff] px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-black hover:bg-cyan-300"
          >
            Start coding with Flow
          </TrackedLink>
          <a href="#soundtracks" className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white/75 hover:border-white/30 hover:text-white">
            Browse the soundtracks
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["01 / SOUND", "Original music built for background listening."],
          ["02 / BLOCK", "Use a timer to give the session a clear boundary."],
          ["03 / ROOM", "Blend ambient layers without leaving the workspace."],
        ].map(([label, copy]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#00e5ff]">{label}</p>
            <p className="mt-3 text-sm leading-7 text-white/70">{copy}</p>
          </article>
        ))}
      </section>

      <section id="soundtracks" className="space-y-4">
        <SoundtrackShowcase />
      </section>

      <MarketingCta
        locale={lang}
        title="Make the next coding block easier to enter"
        body="Flow is free to try in your browser, with original music and a timer ready when you are."
        button="Open Flow"
      />
    </MarketingShell>
  );
}
