// /alternatives/endel — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Endel Alternative: Flow",
  metaDescription:
    "Compare Endel with Flow's browser-based timer, in-house music, measured session history, and separately governed Creator Music license.",
  h1: "Endel Alternative: Flow",
  intro: [
    "Endel presents its product around adaptive soundscapes and several listening contexts. Its integrations, device support, and modes can change, so check Endel's current product pages before deciding.",
    "Flow is browser-based and combines finished music produced in-house by one musician with a Pomodoro timer, tasks, and measured session history. The products use different audio and workflow approaches; this comparison does not claim one is universally better.",
  ],
  competitorName: "Endel",
  tableHeading: "Side by side",
  rows: [
    { feature: "Current offer", them: "Plans, platforms, and availability may change; check Endel's current offer", flow: "Free timer access and a paid Pro plan; check Flow's current pricing" },
    { feature: "Audio approach", them: "Endel describes adaptive soundscapes", flow: "Finished tracks produced in-house by one musician" },
    { feature: "Focus workflow", them: "Check Endel's current modes and timer controls", flow: "Pomodoro presets, custom durations, and tasks" },
    { feature: "Session history", them: "Check Endel's current reporting features", flow: "History based on measured session minutes" },
    { feature: "Creator license", them: "Check Endel's current license terms", flow: "Not included in Free. Exactly 174 eligible tracks; every new download/license requires active Pro and a valid per-track Grant Record. Attribution and published terms apply; Spotify or YouTube listening grants no creator rights" },
  ],
  whenHeading: "When Endel is still the right pick",
  whenParagraphs: [
    "Endel may suit you if its current adaptive-audio experience and supported devices match your routine. Verify present modes, platforms, plans, and terms directly with Endel because those details can change.",
    "Consider Flow if you prefer a browser timer, tasks, measured session history, and finished music produced by one musician. Confirm browser compatibility on your own device before relying on it.",
  ],
  faq: [
    {
      q: "Does Flow work on Windows?",
      a: "Flow is browser-based. Compatibility can vary by browser, device, and settings, so try the public timer on your own Windows setup before subscribing.",
    },
    {
      q: "Is Flow's music generative like Endel's?",
      a: "Flow streams finished tracks identified in its product copy as composed and produced by Virzy Guns. Check Endel's current explanation of its own audio technology directly.",
    },
    {
      q: "Is there a free way to try Flow?",
      a: "Flow offers public timer access and a free product tier. Check the current Flow pricing page for the latest included features and any account requirements.",
    },
    {
      q: "Can I use Flow music in videos or streams?",
      a: "Only through Flow Creator Music—not through Free, Spotify, or YouTube listening. Exactly 174 tracks are eligible. Every new download/license requires active Pro and a valid per-track Grant Record; required attribution and the published terms apply.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Endel: Flow",
  metaDescription:
    "Bandingkan Endel dengan timer berbasis browser Flow, musik produksi sendiri, riwayat sesi terukur, dan lisensi Creator Music yang terpisah.",
  h1: "Alternatif Endel: Flow",
  intro: [
    "Endel memosisikan produknya di sekitar soundscape adaptif dan beberapa konteks dengar. Integrasi, dukungan perangkat, dan modenya bisa berubah, jadi cek halaman produk Endel saat ini sebelum memutuskan.",
    "Flow berbasis browser dan menggabungkan musik jadi yang diproduksi sendiri oleh satu musisi dengan timer Pomodoro, task, serta riwayat sesi terukur. Keduanya memakai pendekatan audio dan alur kerja berbeda; perbandingan ini tidak menyatakan salah satunya selalu lebih baik.",
  ],
  competitorName: "Endel",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Penawaran saat ini", them: "Plan, platform, dan ketersediaan bisa berubah; cek penawaran Endel saat ini", flow: "Akses timer gratis dan plan Pro berbayar; cek harga Flow saat ini" },
    { feature: "Pendekatan audio", them: "Endel mendeskripsikan soundscape adaptif", flow: "Track jadi yang diproduksi sendiri oleh satu musisi" },
    { feature: "Alur fokus", them: "Cek mode dan kontrol timer Endel saat ini", flow: "Preset Pomodoro, durasi custom, dan task" },
    { feature: "Riwayat sesi", them: "Cek fitur pelaporan Endel saat ini", flow: "Riwayat berdasarkan menit sesi terukur" },
    { feature: "Lisensi kreator", them: "Cek ketentuan lisensi Endel saat ini", flow: "Tidak termasuk Free. Tepat 174 track memenuhi syarat; setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track. Atribusi serta ketentuan terbit berlaku; mendengarkan lewat Spotify atau YouTube tidak memberi hak kreator" },
  ],
  whenHeading: "Kapan Endel tetap pilihan yang benar",
  whenParagraphs: [
    "Endel mungkin cocok kalau pengalaman audio adaptif dan perangkat yang didukung saat ini sesuai rutinitasmu. Verifikasi mode, platform, plan, dan ketentuan terbarunya langsung ke Endel karena detail itu bisa berubah.",
    "Pertimbangkan Flow kalau kamu memilih timer browser, task, riwayat sesi terukur, dan musik jadi produksi satu musisi. Uji kompatibilitas browser di perangkatmu sendiri sebelum mengandalkannya.",
  ],
  faq: [
    {
      q: "Flow jalan di Windows?",
      a: "Flow berbasis browser. Kompatibilitas bisa berbeda menurut browser, perangkat, dan pengaturan, jadi coba timer publik di Windows milikmu sebelum berlangganan.",
    },
    {
      q: "Musik Flow generatif seperti Endel?",
      a: "Flow memutar track jadi yang dalam copy produknya disebut dikomposisi dan diproduksi Virzy Guns. Untuk teknologi audio Endel, cek penjelasan terbarunya langsung.",
    },
    {
      q: "Ada cara gratis buat coba Flow?",
      a: "Flow menyediakan akses timer publik dan tier produk gratis. Cek halaman harga Flow saat ini untuk fitur terbaru dan persyaratan akun.",
    },
    {
      q: "Boleh pakai musik Flow di video atau stream?",
      a: "Hanya lewat Flow Creator Music—bukan lewat Free atau mendengarkan di Spotify/YouTube. Tepat 174 track memenuhi syarat. Setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track; atribusi wajib dan ketentuan terbit berlaku.",
    },
  ],
};

export function getEndelCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
