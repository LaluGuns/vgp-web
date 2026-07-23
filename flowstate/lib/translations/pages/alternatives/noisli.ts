// /alternatives/noisli — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Noisli Alternative: Flow",
  metaDescription:
    "Compare Noisli with Flow's in-house music, adjustable ambient controls, browser timer, measured history, and separate Creator Music license.",
  h1: "Noisli Alternative: Flow",
  intro: [
    "Noisli presents its product around mixing ambient sounds for work and relaxation. Its current sounds, controls, timer, and plans can change, so check Noisli's own site before deciding.",
    "Flow combines adjustable ambient controls with finished instrumental music produced in-house, a browser timer, tasks, and measured session history. This is a difference in scope, not a promise that one approach works better for concentration.",
  ],
  competitorName: "Noisli",
  tableHeading: "Side by side",
  rows: [
    { feature: "Current offer", them: "Plans and features may change; check Noisli's current offer", flow: "Free timer access and a paid Pro plan; check Flow's current pricing" },
    { feature: "Ambient controls", them: "Check Noisli's current sounds, mixing, and saving options", flow: "Adjustable ambient sounds within the Flow workspace" },
    { feature: "Music", them: "Check Noisli's current audio catalog", flow: "Finished tracks produced in-house by one musician" },
    { feature: "Focus workflow", them: "Check Noisli's current timer and reporting features", flow: "Pomodoro presets, custom durations, tasks, and measured history" },
    { feature: "Creator license", them: "Check Noisli and each audio provider's current license terms", flow: "Not included in Free. Exactly 174 eligible tracks; every new download/license requires active Pro and a valid per-track Grant Record. Attribution and published terms apply; Spotify or YouTube listening grants no creator rights" },
  ],
  whenHeading: "When Noisli is still the right pick",
  whenParagraphs: [
    "Noisli may suit you if its current ambient-sound workflow matches your preferences. Verify its present sounds, controls, plans, and terms directly with Noisli.",
    "Consider Flow if you want in-house music, adjustable ambient sounds, a timer, tasks, and measured session history in one browser workspace.",
  ],
  faq: [
    {
      q: "Does Flow have ambient sounds like Noisli?",
      a: "Flow currently includes adjustable ambient sounds that can run with or without its music. Check both products directly for their latest sound lists and controls.",
    },
    {
      q: "Can I use Flow as just a noise mixer?",
      a: "Sure. Leave the music off and run only the ambient layers with the timer. The free tier includes ambient sounds.",
    },
    {
      q: "Is Flow's music going to distract me?",
      a: "Flow's catalog includes instrumental music, but distraction is subjective and Flow does not guarantee focus outcomes. Try the music or use the ambient-only controls.",
    },
    {
      q: "Can I use Flow music in videos or streams?",
      a: "Only through Flow Creator Music—not through Free, Spotify, or YouTube listening. Exactly 174 tracks are eligible. Every new download/license requires active Pro and a valid per-track Grant Record; required attribution and the published terms apply.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Noisli: Flow",
  metaDescription:
    "Bandingkan Noisli dengan musik produksi sendiri, kontrol ambient, timer browser, riwayat terukur, dan lisensi Creator Music Flow yang terpisah.",
  h1: "Alternatif Noisli: Flow",
  intro: [
    "Noisli memosisikan produknya di sekitar pencampuran suara ambient untuk kerja dan relaksasi. Daftar suara, kontrol, timer, dan plan dapat berubah, jadi cek situs Noisli sebelum memutuskan.",
    "Flow menggabungkan kontrol ambient yang dapat diatur dengan musik instrumental jadi produksi sendiri, timer browser, task, dan riwayat sesi terukur. Ini perbedaan cakupan, bukan janji bahwa salah satu pendekatan pasti lebih baik untuk konsentrasi.",
  ],
  competitorName: "Noisli",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Penawaran saat ini", them: "Plan dan fitur bisa berubah; cek penawaran Noisli saat ini", flow: "Akses timer gratis dan plan Pro berbayar; cek harga Flow saat ini" },
    { feature: "Kontrol ambient", them: "Cek pilihan suara, mixing, dan penyimpanan Noisli saat ini", flow: "Suara ambient yang dapat diatur di dalam ruang kerja Flow" },
    { feature: "Musik", them: "Cek katalog audio Noisli saat ini", flow: "Track jadi yang diproduksi sendiri oleh satu musisi" },
    { feature: "Alur fokus", them: "Cek fitur timer dan pelaporan Noisli saat ini", flow: "Preset Pomodoro, durasi custom, task, dan riwayat terukur" },
    { feature: "Lisensi kreator", them: "Cek ketentuan lisensi Noisli dan tiap penyedia audio saat ini", flow: "Tidak termasuk Free. Tepat 174 track memenuhi syarat; setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track. Atribusi serta ketentuan terbit berlaku; mendengarkan lewat Spotify atau YouTube tidak memberi hak kreator" },
  ],
  whenHeading: "Kapan Noisli tetap pilihan yang benar",
  whenParagraphs: [
    "Noisli mungkin cocok kalau alur suara ambient-nya saat ini sesuai preferensimu. Verifikasi daftar suara, kontrol, plan, dan ketentuan terbarunya langsung ke Noisli.",
    "Pertimbangkan Flow kalau kamu ingin musik produksi sendiri, suara ambient yang dapat diatur, timer, task, dan riwayat sesi terukur dalam satu ruang kerja browser.",
  ],
  faq: [
    {
      q: "Flow punya ambient sound seperti Noisli?",
      a: "Flow saat ini menyediakan suara ambient yang dapat diatur dan bisa berjalan dengan atau tanpa musik. Cek kedua produk langsung untuk daftar suara dan kontrol terbaru.",
    },
    {
      q: "Bisa pakai Flow cuma sebagai mixer noise?",
      a: "Bisa. Matikan musiknya dan jalankan lapisan ambient saja dengan timer. Tier gratis sudah termasuk ambient sound.",
    },
    {
      q: "Musik Flow bakal mengganggu fokusku?",
      a: "Katalog Flow mencakup musik instrumental, tetapi distraksi bersifat subjektif dan Flow tidak menjamin hasil fokus. Coba musiknya atau gunakan kontrol ambient saja.",
    },
    {
      q: "Boleh pakai musik Flow di video atau stream?",
      a: "Hanya lewat Flow Creator Music—bukan lewat Free atau mendengarkan di Spotify/YouTube. Tepat 174 track memenuhi syarat. Setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track; atribusi wajib dan ketentuan terbit berlaku.",
    },
  ],
};

export function getNoisliCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
