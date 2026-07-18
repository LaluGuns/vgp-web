// /alternatives/endel — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Endel Alternative: Flow",
  metaDescription:
    "Looking for an Endel alternative that lives in the browser? Flow runs anywhere Chrome does — Windows included — with human-produced focus music and a real Pomodoro timer.",
  h1: "Endel Alternative: Flow",
  intro: [
    "Endel does adaptive soundscapes better than anyone: generative audio that reacts to the time of day, your movement, even your heart rate on a watch. On an iPhone with AirPods, it's a genuinely polished experience.",
    "The catch is where it lives. Endel is strongest on Apple platforms and thinnest on the open web and Windows — which is exactly where most working programmers spend the day. Flow starts from the opposite end: a browser tab that runs anywhere, a real Pomodoro timer with tasks and stats, and instrumental music produced by a human musician instead of a generative engine.",
  ],
  competitorName: "Endel",
  tableHeading: "Side by side",
  rows: [
    { feature: "Platform", them: "Strong on iOS/macOS/watch; web and Windows are afterthoughts", flow: "Browser-first — anywhere Chrome, Firefox, or Edge runs" },
    { feature: "Audio", them: "Generative, adaptive soundscapes", flow: "Original tracks produced in-house by one musician" },
    { feature: "Focus timer", them: "Focus modes with timers", flow: "Full Pomodoro: 25/5 to 90/15 presets, custom splits, tasks" },
    { feature: "Session stats", them: "Minimal", flow: "Streaks, heatmap, records — measured minutes only" },
    { feature: "Price", them: "Subscription, sold per platform", flow: "$9.99/mo or $59.99/yr, plus a free tier" },
    { feature: "Creator license", them: "Personal listening only", flow: "Free in streams and videos with attribution" },
  ],
  whenHeading: "When Endel is still the right pick",
  whenParagraphs: [
    "If you live inside the Apple ecosystem and want audio that adapts on its own — soundscapes shifting with your day, your walk, your heart rate — that's Endel's home turf and nothing else really plays there. It's also the better fit if you want sleep and relaxation modes as much as focus.",
    "Pick Flow if your focus happens at a desk in a browser, you want the timer and the stats to be first-class, and you'd rather listen to music a person wrote than a soundscape an engine renders.",
  ],
  faq: [
    {
      q: "Does Flow work on Windows?",
      a: "Yes — Flow runs in the browser, so Windows, Linux, macOS, and ChromeOS are all equal citizens. No install, no platform-specific app needed.",
    },
    {
      q: "Is Flow's music generative like Endel's?",
      a: "No. Endel renders adaptive soundscapes with a generative engine; Flow streams finished tracks written and produced by Virzy Guns. Different philosophy: composed music instead of computed audio.",
    },
    {
      q: "Is there a free way to try Flow?",
      a: "Yes. The free tier includes the timer, ambient sounds, and part of the music library — no credit card, and the timer pages on this site work without even signing up.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Endel: Flow",
  metaDescription:
    "Cari alternatif Endel yang hidup di browser? Flow jalan di mana pun Chrome jalan — termasuk Windows — dengan musik fokus buatan manusia dan timer Pomodoro beneran.",
  h1: "Alternatif Endel: Flow",
  intro: [
    "Endel mengerjakan soundscape adaptif lebih baik dari siapa pun: audio generatif yang bereaksi ke jam, gerakanmu, bahkan detak jantung di smartwatch. Di iPhone dengan AirPods, pengalamannya benar-benar matang.",
    "Masalahnya di tempat tinggalnya. Endel paling kuat di platform Apple dan paling tipis di web terbuka dan Windows — persis tempat kebanyakan programmer menghabiskan hari. Flow mulai dari ujung sebaliknya: tab browser yang jalan di mana saja, timer Pomodoro beneran dengan task dan statistik, dan musik instrumental yang diproduksi musisi manusia, bukan mesin generatif.",
  ],
  competitorName: "Endel",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Platform", them: "Kuat di iOS/macOS/watch; web dan Windows nomor dua", flow: "Browser dulu — di mana pun Chrome, Firefox, atau Edge jalan" },
    { feature: "Audio", them: "Soundscape generatif dan adaptif", flow: "Track original diproduksi sendiri oleh satu musisi" },
    { feature: "Timer fokus", them: "Mode fokus dengan timer", flow: "Pomodoro penuh: preset 25/5 sampai 90/15, split custom, task" },
    { feature: "Statistik sesi", them: "Minimal", flow: "Streak, heatmap, rekor — hanya menit terukur" },
    { feature: "Harga", them: "Langganan, dijual per platform", flow: "$9.99/bln atau $59.99/thn, plus tier gratis" },
    { feature: "Lisensi kreator", them: "Hanya untuk didengarkan pribadi", flow: "Gratis di stream dan video dengan atribusi" },
  ],
  whenHeading: "Kapan Endel tetap pilihan yang benar",
  whenParagraphs: [
    "Kalau kamu hidup di ekosistem Apple dan mau audio yang beradaptasi sendiri — soundscape yang bergeser mengikuti harimu, jalanmu, detak jantungmu — itu kandang Endel dan belum ada yang benar-benar main di sana. Endel juga lebih pas kalau kamu butuh mode tidur dan relaksasi sebanyak mode fokus.",
    "Pilih Flow kalau fokusmu terjadi di meja dalam browser, kamu mau timer dan statistiknya jadi warga kelas satu, dan lebih suka mendengarkan musik yang ditulis orang daripada soundscape yang di-render mesin.",
  ],
  faq: [
    {
      q: "Flow jalan di Windows?",
      a: "Jalan — Flow hidup di browser, jadi Windows, Linux, macOS, dan ChromeOS semuanya setara. Tanpa install, tanpa app khusus platform.",
    },
    {
      q: "Musik Flow generatif seperti Endel?",
      a: "Bukan. Endel me-render soundscape adaptif dengan mesin generatif; Flow memutar track jadi yang ditulis dan diproduksi Virzy Guns. Filosofinya beda: musik yang dikomposisi, bukan audio yang dihitung.",
    },
    {
      q: "Ada cara gratis buat coba Flow?",
      a: "Ada. Tier gratis mencakup timer, ambient sound, dan sebagian library musik — tanpa kartu kredit, dan halaman timer di situs ini bahkan jalan tanpa daftar.",
    },
  ],
};

export function getEndelCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
