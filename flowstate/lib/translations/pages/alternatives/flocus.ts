// /alternatives/flocus — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Flocus Alternative: Flow",
  metaDescription:
    "Looking for a Flocus alternative? Flow trades the aesthetic dashboard for music that's actually produced for the app — original tracks, a real Pomodoro timer, honest stats.",
  h1: "Flocus Alternative: Flow",
  intro: [
    "Flocus nails the vibe. The aesthetic dashboard, the greeting with your name, the wallpapers — it turned the browser start page into a mood, and it's easy to see why people set it as their home tab and keep it there.",
    "The music is where the two products split. Flocus embeds existing lofi streams and playlists into that beautiful shell; Flow's entire reason to exist is the opposite — every track is produced in-house by one musician, for this app, and the timer, tasks, and stats are built around actually finishing focus blocks rather than setting a scene.",
  ],
  competitorName: "Flocus",
  tableHeading: "Side by side",
  rows: [
    { feature: "Music", them: "Embedded lofi streams and playlists", flow: "80+ original tracks produced in-house" },
    { feature: "Focus timer", them: "Pomodoro modes with aesthetic themes", flow: "Pomodoro presets, custom splits, per-session tasks" },
    { feature: "Session stats", them: "Light", flow: "Streaks, heatmap, records — measured minutes only" },
    { feature: "Ambient sounds", them: "Scene-based ambience", flow: "12-layer mixer with independent volumes" },
    { feature: "Price", them: "Free, with a premium tier for more themes", flow: "Free tier; Pro at $9.99/mo for the full library" },
    { feature: "Creator license", them: "Depends on the embedded music's owners", flow: "Free in streams and videos with attribution" },
  ],
  whenHeading: "When Flocus is still the right pick",
  whenParagraphs: [
    "If what you want is a beautiful start page — a calm screen with your name on it, wallpapers you enjoy looking at, and whatever music you already stream anyway — Flocus does that for free and does it with taste. Not every desk needs session analytics.",
    "Pick Flow when the music itself matters — because someone made it for this exact use, and because it starts and stops with your block — and when you want your focus time counted honestly instead of decorated.",
  ],
  faq: [
    {
      q: "Is Flow free like Flocus?",
      a: "Flow has a free tier — timer, ambient sounds, part of the music library. The $9.99/mo Pro plan mainly buys the full in-house music library and every scene.",
    },
    {
      q: "What's actually different about the music?",
      a: "Flocus plays existing lofi content inside its dashboard. Flow's tracks are written and produced by Virzy Guns specifically for focus blocks — they exist nowhere else, and they're licensed for your streams and videos with attribution.",
    },
    {
      q: "Does Flow look as good as Flocus?",
      a: "Different taste: Flocus goes for cozy wallpaper aesthetics, Flow goes for instrument-grade timer machines — a tape deck, a terminal, an editorial folio. Try the landing page demo and judge for yourself.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Flocus: Flow",
  metaDescription:
    "Cari alternatif Flocus? Flow menukar dashboard estetik dengan musik yang benar-benar diproduksi untuk app-nya — track original, timer Pomodoro beneran, statistik jujur.",
  h1: "Alternatif Flocus: Flow",
  intro: [
    "Flocus juara soal vibe. Dashboard estetik, sapaan dengan namamu, wallpaper-nya — dia mengubah start page browser jadi mood, dan gampang paham kenapa orang menjadikannya home tab dan nggak pindah-pindah.",
    "Musiknya yang jadi titik pisah dua produk ini. Flocus menyematkan stream dan playlist lofi yang sudah ada ke dalam cangkang cantik itu; alasan hidup Flow justru kebalikannya — setiap track diproduksi sendiri oleh satu musisi, untuk app ini, dan timer, task, serta statistiknya dibangun untuk benar-benar menyelesaikan block fokus, bukan sekadar membangun suasana.",
  ],
  competitorName: "Flocus",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Musik", them: "Stream dan playlist lofi yang disematkan", flow: "80+ track original diproduksi sendiri" },
    { feature: "Timer fokus", them: "Mode Pomodoro dengan tema estetik", flow: "Preset Pomodoro, split custom, task per sesi" },
    { feature: "Statistik sesi", them: "Ringan", flow: "Streak, heatmap, rekor — hanya menit terukur" },
    { feature: "Ambient sound", them: "Ambience berbasis scene", flow: "Mixer 12 lapis dengan volume masing-masing" },
    { feature: "Harga", them: "Gratis, dengan tier premium untuk tema tambahan", flow: "Tier gratis; Pro $9.99/bln untuk library penuh" },
    { feature: "Lisensi kreator", them: "Tergantung pemilik musik yang disematkan", flow: "Gratis di stream dan video dengan atribusi" },
  ],
  whenHeading: "Kapan Flocus tetap pilihan yang benar",
  whenParagraphs: [
    "Kalau yang kamu mau adalah start page yang cantik — layar tenang dengan namamu, wallpaper yang enak dipandang, dan musik apa pun yang memang sudah kamu putar — Flocus memberikan itu gratis dan dengan selera. Nggak semua meja butuh analitik sesi.",
    "Pilih Flow kalau musiknya sendiri yang penting — karena ada orang yang membuatnya untuk kegunaan persis ini, dan karena dia mulai-berhenti bareng block-mu — dan kalau kamu mau waktu fokusmu dihitung jujur, bukan didekorasi.",
  ],
  faq: [
    {
      q: "Flow gratis seperti Flocus?",
      a: "Flow punya tier gratis — timer, ambient sound, sebagian library musik. Plan Pro $9.99/bln terutama membeli library musik in-house penuh dan semua scene.",
    },
    {
      q: "Musiknya beda di mana sebenarnya?",
      a: "Flocus memutar konten lofi yang sudah ada di dalam dashboard-nya. Track Flow ditulis dan diproduksi Virzy Guns khusus untuk block fokus — nggak ada di tempat lain, dan berlisensi untuk stream dan videomu dengan atribusi.",
    },
    {
      q: "Tampilan Flow sebagus Flocus?",
      a: "Beda selera: Flocus main di estetika wallpaper yang cozy, Flow main di mesin timer rasa instrumen — tape deck, terminal, folio editorial. Coba demo di halaman depan dan nilai sendiri.",
    },
  ],
};

export function getFlocusCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
