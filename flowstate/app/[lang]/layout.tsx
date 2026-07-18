import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LANGUAGES, DEFAULT_LOCALE, type Locale } from "@/lib/translations/dictionaries";
import { getTranslator } from "@/lib/translations/server";
import { LocaleProvider } from "@/hooks/use-translation";
import { AudioDriver } from "@/components/audio/audio-driver";
import { UpgradePrompt } from "@/components/pricing/upgrade-prompt";
import { GuestGate } from "@/components/auth/guest-gate";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE = "https://flow.virzyguns.com";
const LOCALES = Object.keys(LANGUAGES) as Locale[];

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES as string[]).includes(lang) ? (lang as Locale) : DEFAULT_LOCALE;
  const t = getTranslator(locale);

  // Localized metadata: each locale resolves its own title/description from the
  // shared dictionaries, so /id ships an Indonesian title, /ja Japanese, etc.
  const title = t("metadata.title", "Flow by Virzy Guns — Deep Work Music & Pomodoro Timer");
  const description = t(
    "metadata.description",
    "Get in the zone with original lofi & synthwave music, a Pomodoro timer, ambient sound mixer, and focus analytics. Built for programmers, creators, and deep workers."
  );
  const ogTitle = t("metadata.ogTitle", "Flow by Virzy Guns — Get in the zone.");
  const ogDescription = t(
    "metadata.ogDescription",
    "Deep work music + Pomodoro timer with an original soundtrack, produced in-house by Virzy Guns."
  );

  // hreflang: every locale gets its own URL, plus x-default → English.
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, `/${l}`])
  );
  languages["x-default"] = `/${DEFAULT_LOCALE}`;

  return {
    metadataBase: new URL(SITE),
    title: {
      default: title,
      template: "%s · Flow by Virzy Guns",
    },
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: "Flow by Virzy Guns",
      type: "website",
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    manifest: "/manifest.json",
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!(LOCALES as string[]).includes(lang)) notFound();

  return (
    <html lang={lang} className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans`} suppressHydrationWarning>
        {/* Set the interface theme before first paint to prevent a flash of the
            default (glass) theme. Reads the zustand-persist JSON defensively. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=["glass","studio","editorial","terminal"];var r=localStorage.getItem("flowstate-ui-theme");var t="glass";if(r){var s=JSON.parse(r);if(s&&s.state&&v.indexOf(s.state.theme)!==-1){t=s.state.theme;}}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","glass");}})();`,
          }}
        />
        <LocaleProvider initialLocale={lang as Locale}>
          <AudioDriver />
          <UpgradePrompt />
          <GuestGate />
          <AnalyticsProvider />
          <ThemeProvider />
          {children}
        </LocaleProvider>

        {/* Global SVG displacement filters for realistic liquid glass refraction */}
        <svg className="absolute w-[1px] h-[1px] opacity-0 pointer-events-none" aria-hidden="true" style={{ pointerEvents: "none" }}>
          <defs>
            {/* Card liquid glass refraction (warps background subtly) */}
            <filter id="liquid-glass-refract">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* 3D Sphere dial lens refraction (warps background like a crystal ball) */}
            <filter id="lens-refraction">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="35" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            {/* Gooey liquid effect for sliding tabs */}
            <filter id="liquid-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>
      </body>
    </html>
  );
}
