import type { Metadata } from "next";
import { DEFAULT_LOCALE } from "@/lib/translations/dictionaries";
import { isSupportedSeoLocale, localePath } from "@/lib/marketing/seo-registry";

const SITE = "https://flow.virzyguns.com";
const TITLE = "Flow by Virzy Guns — Get in the zone.";
const DESCRIPTION =
  "Deep work music + Pomodoro timer with an original soundtrack, produced in-house by Virzy Guns.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isSupportedSeoLocale(lang) ? lang : DEFAULT_LOCALE;
  const sharePath = localePath(locale, "share");
  const imagePath = localePath(locale, "social-card-v2");

  return {
    metadataBase: new URL(SITE),
    title: TITLE,
    description: DESCRIPTION,
    robots: { index: false, follow: true },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      siteName: "Flow by Virzy Guns",
      type: "website",
      url: `${SITE}${sharePath}`,
      images: [
        {
          url: `${SITE}${imagePath}`,
          width: 1200,
          height: 630,
          alt: TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: `${SITE}${imagePath}`, alt: TITLE }],
    },
    alternates: {
      canonical: localePath(locale),
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isSupportedSeoLocale(lang) ? lang : DEFAULT_LOCALE;
  const destination = localePath(locale);

  return (
    <main className="min-h-screen bg-[#050812] text-white flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm text-white/50">Opening Flow...</p>
        <a className="mt-3 inline-block text-cyan-300 underline underline-offset-4" href={destination}>
          Continue to Flow
        </a>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(destination)});`,
        }}
      />
    </main>
  );
}
