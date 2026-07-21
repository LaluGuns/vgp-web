// Shared copy for the static marketing pages (timer presets, keyword
// landings, /license, /alternatives). EN and ID are written for real; the
// other nine locales fall back to English until they get a proper pass —
// per-page long copy intentionally lives outside the UI dictionaries.
import type { MiniTimerLabels } from "@/components/marketing/mini-timer";
import { marketRouteCopy, marketSharedCopy } from "@/lib/marketing/market-copy";

export type MarketingShared = {
  breadcrumbHome: string;
  breadcrumbTimers: string;
  faqHeading: string;
  otherTimersHeading: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  timer: Omit<MiniTimerLabels, "preset">;
  /** "{work} min work · {break} min break" template */
  presetTemplate: string;
};

const en: MarketingShared = {
  breadcrumbHome: "Home",
  breadcrumbTimers: "Timers",
  faqHeading: "Questions",
  otherTimersHeading: "Other splits",
  ctaTitle: "The full setup is one click away",
  ctaBody:
    "This page is the timer on its own. The app adds original focus music — produced in-house, not stock loops — an ambient mixer, tasks, and honest stats. Free tier, no sign-up to try.",
  ctaButton: "Open Flow (free)",
  timer: {
    work: "Work",
    break: "Break",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    skip: "Skip",
    caption: "Runs right here. The full app adds the music.",
    openApp: "Open the app",
  },
  presetTemplate: "{work} min work · {break} min break",
};

const id: MarketingShared = {
  breadcrumbHome: "Beranda",
  breadcrumbTimers: "Timer",
  faqHeading: "Tanya jawab",
  otherTimersHeading: "Split lainnya",
  ctaTitle: "Setup lengkapnya tinggal satu klik",
  ctaBody:
    "Halaman ini timer-nya saja. Di aplikasinya ada musik fokus original — diproduksi sendiri, bukan stock loop — plus ambient mixer, task list, dan statistik yang jujur. Ada tier gratis, coba tanpa daftar.",
  ctaButton: "Buka Flow (gratis)",
  timer: {
    work: "Kerja",
    break: "Istirahat",
    start: "Mulai",
    pause: "Jeda",
    reset: "Reset",
    skip: "Lewati",
    caption: "Jalan langsung di sini. Musiknya ada di aplikasi penuh.",
    openApp: "Buka aplikasinya",
  },
  presetTemplate: "{work} menit kerja · {break} menit istirahat",
};

export function getMarketingShared(locale: string): MarketingShared {
  const regional = marketSharedCopy(locale);
  if (regional) {
    return {
      breadcrumbHome: regional.breadcrumbHome,
      breadcrumbTimers: regional.breadcrumbTimers,
      faqHeading: regional.faqHeading,
      otherTimersHeading: regional.otherTimersHeading,
      ctaTitle: regional.ctaTitle,
      ctaBody: regional.ctaBody,
      ctaButton: regional.ctaButton,
      timer: {
        work: regional.work,
        break: regional.break,
        start: regional.start,
        pause: regional.pause,
        reset: regional.reset,
        skip: regional.skip,
        caption: regional.timerCaption,
        openApp: regional.openApp,
      },
      presetTemplate: regional.presetTemplate,
    };
  }
  if (locale === "id") return id;
  return en;
}

export function buildTimerLabels(
  locale: string,
  workMin: number,
  breakMin: number
): MiniTimerLabels {
  const s = getMarketingShared(locale);
  return {
    ...s.timer,
    preset: s.presetTemplate
      .replace("{work}", String(workMin))
      .replace("{break}", String(breakMin)),
  };
}

/** Internal links reused by the landing footer and the marketing shell. */
export function getFreeTimerLinks(locale: string): { href: string; label: string }[] {
  const isId = locale === "id";
  const label = (path: string, fallback: string) => marketRouteCopy(locale, path)?.h1 ?? fallback;
  return [
    { href: `/${locale}/timer/25-5`, label: label("timer/25-5", isId ? "Timer Pomodoro 25/5" : "25/5 Pomodoro Timer") },
    { href: `/${locale}/timer/50-10`, label: label("timer/50-10", isId ? "Timer Pomodoro 50/10" : "50/10 Pomodoro Timer") },
    { href: `/${locale}/timer/45-15`, label: isId ? "Timer Pomodoro 45/15" : "45/15 Pomodoro Timer" },
    { href: `/${locale}/timer/60-10`, label: isId ? "Timer Pomodoro 60/10" : "60/10 Pomodoro Timer" },
    { href: `/${locale}/timer/90-15`, label: isId ? "Timer Pomodoro 90/15" : "90/15 Pomodoro Timer" },
    { href: `/${locale}/deep-work-timer`, label: label("deep-work-timer", isId ? "Timer Deep Work" : "Deep Work Timer") },
    { href: `/${locale}/study-timer`, label: label("study-timer", isId ? "Timer Belajar" : "Study Timer") },
    { href: `/${locale}/pomodoro-timer-with-music`, label: label("pomodoro-timer-with-music", isId ? "Timer Pomodoro dengan Musik" : "Pomodoro Timer with Music") },
    { href: `/${locale}/license`, label: label("license", isId ? "Lisensi musik" : "Music license") },
  ];
}
