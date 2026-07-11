import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/hooks/use-translation";
import { AudioDriver } from "@/components/audio/audio-driver";
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

export const metadata: Metadata = {
  title: "Flowstate - Deep Work Music & Focus Timer",
  description:
    "Get in the zone with original lofi & synthwave music, Pomodoro timer, ambient sound mixer, and focus analytics. Built for programmers, creators, and deep workers.",
  metadataBase: new URL("https://flow.virzyguns.com"),
  openGraph: {
    title: "Flowstate — Get in the zone.",
    description:
      "Deep work music + focus timer with original soundtrack by Virzy Guns.",
    siteName: "Flowstate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowstate — Get in the zone.",
    description:
      "Deep work music + focus timer with original soundtrack by Virzy Guns.",
  },
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      id: "/?lang=id",
      es: "/?lang=es",
      fr: "/?lang=fr",
      de: "/?lang=de",
      ja: "/?lang=ja",
      ko: "/?lang=ko",
      zh: "/?lang=zh",
      pt: "/?lang=pt",
      ru: "/?lang=ru",
      it: "/?lang=it",
    },
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} font-sans`} suppressHydrationWarning>
        {/* Set the interface theme before first paint to prevent a flash of the
            default (glass) theme. Reads the zustand-persist JSON defensively. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=["glass","studio","editorial","terminal"];var r=localStorage.getItem("flowstate-ui-theme");var t="glass";if(r){var s=JSON.parse(r);if(s&&s.state&&v.indexOf(s.state.theme)!==-1){t=s.state.theme;}}document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","glass");}})();`,
          }}
        />
        <LocaleProvider>
          <AudioDriver />
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