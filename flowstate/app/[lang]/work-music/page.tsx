import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarketingShell, MarketingCta } from "@/components/marketing/marketing-shell";
import { SoundtrackShowcase } from "@/components/landing/soundtrack-showcase";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { breadcrumbJsonLd, marketingMetadata } from "@/lib/marketing/seo";

const PATH = "work-music";

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
    "Work Music for Focused Sessions | Flow",
    "Use original work music with a focused Flow session, timer, and ambient mixer for calm, measurable work blocks."
  );
}

export default async function WorkMusicPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  ensureEnglish(lang);
  const breadcrumbLd = breadcrumbJsonLd(lang, [
    { name: "Flow", path: "" },
    { name: "Work music", path: PATH },
  ]);

  return (
    <MarketingShell
      locale={lang}
      breadcrumb={[
        { name: "Flow", href: "/" + lang },
        { name: "Work music" },
      ]}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <section className="space-y-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#00e5ff]">Work music → Flow</p>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
          Work music for a session you can actually finish.
        </h1>
        <p className="text-base text-white/70 leading-relaxed max-w-2xl">
          Flow combines original background music, a timer, and an ambient mixer in one browser-based focus environment. Choose a soundtrack, start a block, and keep the next action visible.
        </p>
        <div className="flex flex-wrap gap-3">
          <TrackedLink
            href={"/" + lang + "/app"}
            destination={"/" + lang + "/app"}
            source="work_music_hero"
            className="inline-flex rounded-xl bg-[#00e5ff] px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-black hover:bg-cyan-300"
          >
            Start a work session
          </TrackedLink>
          <a href="#soundtracks" className="inline-flex rounded-xl border border-white/15 px-5 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white/75 hover:border-white/30 hover:text-white">
            Hear the soundtracks
          </a>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">A soundtrack that stays in the background</h2>
        <p className="max-w-2xl text-sm text-white/65 leading-relaxed">
          The collection is made for work blocks rather than a generic playlist dump. Keep the volume steady, use the mixer when the room gets noisy, and let the timer mark the end of the block.
        </p>
      </section>

      <section id="soundtracks" className="space-y-4">
        <SoundtrackShowcase />
      </section>

      <MarketingCta
        locale={lang}
        title="Turn the next hour into a clear block"
        body="Open Flow free in your browser, choose a soundtrack, and start with the work interval that fits today."
        button="Open Flow"
      />
    </MarketingShell>
  );
}
