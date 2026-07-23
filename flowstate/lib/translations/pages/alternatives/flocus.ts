// /alternatives/flocus — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Flocus Alternative: Flow",
  metaDescription:
    "Compare Flocus with Flow's browser timer, in-house music, measured session history, and separately governed Creator Music license.",
  h1: "Flocus Alternative: Flow",
  intro: [
    "Flocus presents a visual browser workspace that can include timer, music, and personalization features. Its current integrations and plan contents can change, so check Flocus's own site before deciding.",
    "Flow combines music produced in-house by one musician with a browser timer, tasks, ambient controls, and measured session history. This is a workflow distinction, not an objective quality ranking.",
  ],
  competitorName: "Flocus",
  tableHeading: "Side by side",
  rows: [
    { feature: "Current offer", them: "Plans and features may change; check Flocus's current offer", flow: "Free timer access and a paid Pro plan; check Flow's current pricing" },
    { feature: "Music approach", them: "Check Flocus's current music sources and terms", flow: "Finished tracks produced in-house by one musician" },
    { feature: "Focus workflow", them: "Check Flocus's current timer and task controls", flow: "Pomodoro presets, custom durations, and tasks" },
    { feature: "Session history", them: "Check Flocus's current reporting features", flow: "History based on measured session minutes" },
    { feature: "Creator license", them: "Check Flocus and each music provider's current license terms", flow: "Not included in Free. Exactly 174 eligible tracks; every new download/license requires active Pro and a valid per-track Grant Record. Attribution and published terms apply; Spotify or YouTube listening grants no creator rights" },
  ],
  whenHeading: "When Flocus is still the right pick",
  whenParagraphs: [
    "Flocus may suit you if its current visual workspace and integrations fit how you start a session. Verify its present features, plans, music sources, and terms directly with Flocus.",
    "Consider Flow if you prefer in-house music, a timer, tasks, ambient controls, and history based on measured minutes in one browser workspace.",
  ],
  faq: [
    {
      q: "Is Flow free like Flocus?",
      a: "Flow offers free timer access and a separate paid Pro plan. Plan contents can change, so check Flow's current pricing page and compare it with Flocus's current offer.",
    },
    {
      q: "What's actually different about the music?",
      a: "Flow's product copy identifies Virzy Guns as its composer and producer. Check Flocus's current music sources and their respective terms directly; do not assume playback includes creator-use rights.",
    },
    {
      q: "Does Flow look as good as Flocus?",
      a: "Different taste: Flocus goes for cozy wallpaper aesthetics, Flow goes for instrument-grade timer machines — a tape deck, a terminal, an editorial folio. Try the landing page demo and judge for yourself.",
    },
    {
      q: "Can I use Flow music in videos or streams?",
      a: "Only through Flow Creator Music—not through Free, Spotify, or YouTube listening. Exactly 174 tracks are eligible. Every new download/license requires active Pro and a valid per-track Grant Record; required attribution and the published terms apply.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Flocus: Flow",
  metaDescription:
    "Bandingkan Flocus dengan timer browser Flow, musik produksi sendiri, riwayat sesi terukur, dan lisensi Creator Music yang terpisah.",
  h1: "Alternatif Flocus: Flow",
  intro: [
    "Flocus memosisikan produknya sebagai ruang kerja visual di browser yang dapat mencakup timer, musik, dan personalisasi. Integrasi serta isi plan dapat berubah, jadi cek situs Flocus sebelum memutuskan.",
    "Flow menggabungkan musik produksi sendiri oleh satu musisi dengan timer browser, task, kontrol ambient, dan riwayat sesi terukur. Ini perbedaan alur kerja, bukan peringkat kualitas objektif.",
  ],
  competitorName: "Flocus",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Penawaran saat ini", them: "Plan dan fitur bisa berubah; cek penawaran Flocus saat ini", flow: "Akses timer gratis dan plan Pro berbayar; cek harga Flow saat ini" },
    { feature: "Pendekatan musik", them: "Cek sumber musik dan ketentuan Flocus saat ini", flow: "Track jadi yang diproduksi sendiri oleh satu musisi" },
    { feature: "Alur fokus", them: "Cek kontrol timer dan task Flocus saat ini", flow: "Preset Pomodoro, durasi custom, dan task" },
    { feature: "Riwayat sesi", them: "Cek fitur pelaporan Flocus saat ini", flow: "Riwayat berdasarkan menit sesi terukur" },
    { feature: "Lisensi kreator", them: "Cek ketentuan lisensi Flocus dan tiap penyedia musik saat ini", flow: "Tidak termasuk Free. Tepat 174 track memenuhi syarat; setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track. Atribusi serta ketentuan terbit berlaku; mendengarkan lewat Spotify atau YouTube tidak memberi hak kreator" },
  ],
  whenHeading: "Kapan Flocus tetap pilihan yang benar",
  whenParagraphs: [
    "Flocus mungkin cocok kalau ruang kerja visual dan integrasinya saat ini sesuai cara kamu memulai sesi. Verifikasi fitur, plan, sumber musik, dan ketentuan terbarunya langsung ke Flocus.",
    "Pertimbangkan Flow kalau kamu memilih musik produksi sendiri, timer, task, kontrol ambient, dan riwayat berbasis menit terukur dalam satu ruang kerja browser.",
  ],
  faq: [
    {
      q: "Flow gratis seperti Flocus?",
      a: "Flow menyediakan akses timer gratis dan plan Pro berbayar yang terpisah. Isi plan dapat berubah, jadi cek halaman harga Flow dan bandingkan dengan penawaran Flocus saat ini.",
    },
    {
      q: "Musiknya beda di mana sebenarnya?",
      a: "Copy produk Flow menyebut Virzy Guns sebagai komposer dan produser. Cek sumber musik Flocus dan ketentuannya saat ini langsung; jangan anggap hak dengar otomatis mencakup hak pakai kreator.",
    },
    {
      q: "Tampilan Flow sebagus Flocus?",
      a: "Beda selera: Flocus main di estetika wallpaper yang cozy, Flow main di mesin timer rasa instrumen — tape deck, terminal, folio editorial. Coba demo di halaman depan dan nilai sendiri.",
    },
    {
      q: "Boleh pakai musik Flow di video atau stream?",
      a: "Hanya lewat Flow Creator Music—bukan lewat Free atau mendengarkan di Spotify/YouTube. Tepat 174 track memenuhi syarat. Setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track; atribusi wajib dan ketentuan terbit berlaku.",
    },
  ],
};

export function getFlocusCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
