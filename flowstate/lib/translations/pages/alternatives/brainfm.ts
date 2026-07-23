// /alternatives/brainfm — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Brain.fm Alternative: Flow",
  metaDescription:
    "Compare Brain.fm with Flow's browser timer, in-house music, measured session history, and separately governed Creator Music license.",
  h1: "Brain.fm Alternative: Flow",
  intro: [
    "Brain.fm presents its product around audio for focus and related listening modes. Its current features and claims can change, so check Brain.fm's own site before deciding whether that approach fits you.",
    "Flow takes a different approach: music produced in-house by one musician, a browser-based Pomodoro timer, tasks, and session history based on measured minutes. This is a difference in workflow, not a promise that one product will improve focus more than the other.",
  ],
  competitorName: "Brain.fm",
  tableHeading: "Side by side",
  rows: [
    { feature: "Current offer", them: "Plans and availability may change; check Brain.fm's current offer", flow: "Free timer access and a paid Pro plan; check Flow's current pricing" },
    { feature: "Music approach", them: "Brain.fm describes functional audio informed by its own research", flow: "Finished tracks produced in-house by one musician" },
    { feature: "Focus workflow", them: "Check Brain.fm's current player and session controls", flow: "Pomodoro presets, custom durations, and tasks" },
    { feature: "Session history", them: "Check Brain.fm's current reporting features", flow: "History based on measured session minutes" },
    { feature: "Creator license", them: "Check Brain.fm's current license terms", flow: "Not included in Free. Exactly 174 eligible tracks; every new download/license requires active Pro and a valid per-track Grant Record. Attribution and published terms apply; Spotify or YouTube listening grants no creator rights" },
  ],
  whenHeading: "When Brain.fm is still the right pick",
  whenParagraphs: [
    "Brain.fm may suit you if its current audio approach and listening modes match your routine. Verify its present catalog, apps, plans, and terms directly with Brain.fm because those details can change.",
    "Consider Flow if you want a browser timer, tasks, measured session history, and music produced by one musician. Flow does not make medical, neuroscience, or productivity guarantees.",
  ],
  faq: [
    {
      q: "Is Flow cheaper than Brain.fm?",
      a: "Prices and plan contents can change. Check each provider's current pricing page; Flow offers free timer access and a separate paid Pro plan.",
    },
    {
      q: "Is Flow's music AI-generated like Brain.fm's?",
      a: "Flow's published product copy identifies Virzy Guns as the composer and producer. Check Brain.fm's current description of its own audio system rather than relying on this comparison.",
    },
    {
      q: "Does Flow claim to boost focus scientifically?",
      a: "No. Flow makes no productivity or neuroscience claims — the timer counts measured minutes and the music is made for focus work, and that's as far as the claims go.",
    },
    {
      q: "Can I use Flow music in videos or streams?",
      a: "Only through Flow Creator Music—not through Free, Spotify, or YouTube listening. Exactly 174 tracks are eligible. Every new download/license requires active Pro and a valid per-track Grant Record; required attribution and the published terms apply.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Brain.fm: Flow",
  metaDescription:
    "Bandingkan Brain.fm dengan timer browser Flow, musik produksi sendiri, riwayat sesi terukur, dan lisensi Creator Music yang terpisah.",
  h1: "Alternatif Brain.fm: Flow",
  intro: [
    "Brain.fm memosisikan produknya di sekitar audio untuk fokus dan mode dengar terkait. Fitur dan klaimnya bisa berubah, jadi cek situs Brain.fm sebelum menilai apakah pendekatan itu cocok buatmu.",
    "Flow mengambil pendekatan berbeda: musik yang diproduksi sendiri oleh satu musisi, timer Pomodoro berbasis browser, task, dan riwayat sesi dari menit terukur. Ini perbedaan alur kerja, bukan janji bahwa salah satu produk pasti meningkatkan fokus lebih baik.",
  ],
  competitorName: "Brain.fm",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Penawaran saat ini", them: "Plan dan ketersediaan bisa berubah; cek penawaran Brain.fm saat ini", flow: "Akses timer gratis dan plan Pro berbayar; cek harga Flow saat ini" },
    { feature: "Pendekatan musik", them: "Brain.fm mendeskripsikan audio fungsional yang diinformasikan risetnya", flow: "Track jadi yang diproduksi sendiri oleh satu musisi" },
    { feature: "Alur fokus", them: "Cek player dan kontrol sesi Brain.fm saat ini", flow: "Preset Pomodoro, durasi custom, dan task" },
    { feature: "Riwayat sesi", them: "Cek fitur pelaporan Brain.fm saat ini", flow: "Riwayat berdasarkan menit sesi terukur" },
    { feature: "Lisensi kreator", them: "Cek ketentuan lisensi Brain.fm saat ini", flow: "Tidak termasuk Free. Tepat 174 track memenuhi syarat; setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track. Atribusi serta ketentuan terbit berlaku; mendengarkan lewat Spotify atau YouTube tidak memberi hak kreator" },
  ],
  whenHeading: "Kapan Brain.fm tetap pilihan yang benar",
  whenParagraphs: [
    "Brain.fm mungkin cocok kalau pendekatan audio dan mode dengarnya saat ini sesuai rutinitasmu. Verifikasi katalog, app, plan, dan ketentuan terbarunya langsung ke Brain.fm karena detail itu bisa berubah.",
    "Pertimbangkan Flow kalau kamu mencari timer browser, task, riwayat sesi terukur, dan musik produksi satu musisi. Flow tidak menjanjikan hasil medis, neuroscience, atau produktivitas.",
  ],
  faq: [
    {
      q: "Flow lebih murah dari Brain.fm?",
      a: "Harga dan isi plan dapat berubah. Cek halaman harga terbaru masing-masing penyedia; Flow menyediakan akses timer gratis dan plan Pro berbayar yang terpisah.",
    },
    {
      q: "Musik Flow hasil AI seperti Brain.fm?",
      a: "Copy produk Flow menyebut Virzy Guns sebagai komposer dan produser. Untuk sistem audio Brain.fm, cek deskripsi terbarunya langsung dan jangan hanya mengandalkan perbandingan ini.",
    },
    {
      q: "Flow mengklaim meningkatkan fokus secara ilmiah?",
      a: "Nggak. Flow nggak bikin klaim produktivitas atau neuroscience — timer menghitung menit terukur dan musiknya dibuat untuk kerja fokus, klaimnya berhenti di situ.",
    },
    {
      q: "Boleh pakai musik Flow di video atau stream?",
      a: "Hanya lewat Flow Creator Music—bukan lewat Free atau mendengarkan di Spotify/YouTube. Tepat 174 track memenuhi syarat. Setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track; atribusi wajib dan ketentuan terbit berlaku.",
    },
  ],
};

export function getBrainfmCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
