// /alternatives/brainfm — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Brain.fm Alternative: Flow",
  metaDescription:
    "Looking for a Brain.fm alternative? Flow pairs a Pomodoro timer with music produced in-house by one musician — not AI-generated — at $9.99/mo vs $14.99/mo.",
  h1: "Brain.fm Alternative: Flow",
  intro: [
    "Brain.fm is a serious product. They've invested in research on how audio affects attention, their catalog is deep, and plenty of people focus better with it. If it works for you, it works — this page isn't going to pretend otherwise.",
    "Flow makes a different bet. Brain.fm's music is generated and shaped by their AI system; Flow's is written and produced by one human musician, specifically for focus blocks, with a real Pomodoro timer and honest session stats built around it. Less catalog, more intent — and five dollars a month cheaper.",
  ],
  competitorName: "Brain.fm",
  tableHeading: "Side by side",
  rows: [
    { feature: "Price", them: "$14.99/mo", flow: "$9.99/mo or $59.99/yr" },
    { feature: "Music source", them: "AI-generated, shaped by their research", flow: "Produced in-house by one musician" },
    { feature: "Focus timer", them: "Session timer inside the player", flow: "Full Pomodoro: presets, custom splits, tasks" },
    { feature: "Session stats", them: "Listening-focused", flow: "Streaks, heatmap, records — measured minutes only" },
    { feature: "Free tier", them: "Trial, then paid", flow: "Free tier with timer, ambient sounds, and part of the library" },
    { feature: "Creator license", them: "Personal listening only", flow: "Free to use in streams and videos with attribution" },
  ],
  whenHeading: "When Brain.fm is still the right pick",
  whenParagraphs: [
    "If the research angle is what convinces you — audio engineered around attention studies, with modes for sleep and meditation as well as focus — Brain.fm is built around exactly that, and Flow doesn't make neuroscience claims at all (our Terms literally forbid it). Same if you need a large catalog across many moods, or polished native mobile apps as your main surface.",
    "Pick Flow if you want a focus tool first — timer, tasks, stats — with a smaller library of music made by a person, and you'd rather pay $9.99 than $14.99 for it.",
  ],
  faq: [
    {
      q: "Is Flow cheaper than Brain.fm?",
      a: "Yes. Flow Pro is $9.99/mo or $59.99/yr; Brain.fm is $14.99/mo. Flow also has a free tier with the timer, ambient sounds, and part of the music library.",
    },
    {
      q: "Is Flow's music AI-generated like Brain.fm's?",
      a: "No. Every Flow track is written and produced by Virzy Guns, the musician who built the app. Whether that matters is up to you — it's the core difference between the two products.",
    },
    {
      q: "Does Flow claim to boost focus scientifically?",
      a: "No. Flow makes no productivity or neuroscience claims — the timer counts measured minutes and the music is made for focus work, and that's as far as the claims go.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Brain.fm: Flow",
  metaDescription:
    "Cari alternatif Brain.fm? Flow memasangkan timer Pomodoro dengan musik yang diproduksi sendiri oleh satu musisi — bukan hasil AI — seharga $9.99/bln vs $14.99/bln.",
  h1: "Alternatif Brain.fm: Flow",
  intro: [
    "Brain.fm produk yang serius. Mereka berinvestasi di riset tentang pengaruh audio ke atensi, katalognya dalam, dan banyak orang memang lebih fokus dengannya. Kalau buat kamu jalan, ya jalan — halaman ini nggak akan pura-pura sebaliknya.",
    "Flow bertaruh di arah lain. Musik Brain.fm dihasilkan dan dibentuk oleh sistem AI mereka; musik Flow ditulis dan diproduksi satu musisi manusia, khusus untuk block fokus, dengan timer Pomodoro beneran dan statistik sesi yang jujur di sekelilingnya. Katalog lebih kecil, niat lebih jelas — dan lima dolar lebih murah per bulan.",
  ],
  competitorName: "Brain.fm",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Harga", them: "$14.99/bln", flow: "$9.99/bln atau $59.99/thn" },
    { feature: "Sumber musik", them: "Hasil AI, dibentuk riset mereka", flow: "Diproduksi sendiri oleh satu musisi" },
    { feature: "Timer fokus", them: "Timer sesi di dalam player", flow: "Pomodoro penuh: preset, split custom, task" },
    { feature: "Statistik sesi", them: "Berfokus ke listening", flow: "Streak, heatmap, rekor — hanya menit terukur" },
    { feature: "Tier gratis", them: "Trial, lalu berbayar", flow: "Tier gratis dengan timer, ambient, dan sebagian library" },
    { feature: "Lisensi kreator", them: "Hanya untuk didengarkan pribadi", flow: "Gratis dipakai di stream dan video dengan atribusi" },
  ],
  whenHeading: "Kapan Brain.fm tetap pilihan yang benar",
  whenParagraphs: [
    "Kalau sudut risetnya yang meyakinkanmu — audio yang direkayasa berdasarkan studi atensi, dengan mode untuk tidur dan meditasi selain fokus — Brain.fm memang dibangun untuk itu, dan Flow sama sekali nggak bikin klaim neuroscience (Terms kami memang melarangnya). Sama juga kalau kamu butuh katalog besar lintas banyak mood, atau app mobile native yang matang sebagai permukaan utama.",
    "Pilih Flow kalau kamu mau alat fokus dulu — timer, task, statistik — dengan library musik lebih kecil yang dibuat manusia, dan lebih memilih bayar $9.99 daripada $14.99.",
  ],
  faq: [
    {
      q: "Flow lebih murah dari Brain.fm?",
      a: "Ya. Flow Pro $9.99/bln atau $59.99/thn; Brain.fm $14.99/bln. Flow juga punya tier gratis dengan timer, ambient sound, dan sebagian library musik.",
    },
    {
      q: "Musik Flow hasil AI seperti Brain.fm?",
      a: "Bukan. Setiap track Flow ditulis dan diproduksi oleh Virzy Guns, musisi yang membangun app-nya. Penting atau tidaknya itu terserah kamu — tapi itulah perbedaan inti kedua produk.",
    },
    {
      q: "Flow mengklaim meningkatkan fokus secara ilmiah?",
      a: "Nggak. Flow nggak bikin klaim produktivitas atau neuroscience — timer menghitung menit terukur dan musiknya dibuat untuk kerja fokus, klaimnya berhenti di situ.",
    },
  ],
};

export function getBrainfmCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
