// /alternatives/pomofocus — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Pomofocus Alternative: Flow",
  metaDescription:
    "Looking for a Pomofocus alternative with music built in? Flow keeps the clean Pomodoro workflow and adds original in-house focus tracks and an ambient mixer.",
  h1: "Pomofocus Alternative: Flow",
  intro: [
    "Pomofocus presents a streamlined Pomodoro timer with task-oriented controls. Its current features and plan contents can change, so check Pomofocus's own site before deciding.",
    "Flow combines a browser timer and tasks with music produced in-house, ambient controls, and measured session history. This can reduce the need for a separate audio tab, but the better workflow depends on your preferences.",
  ],
  competitorName: "Pomofocus",
  tableHeading: "Side by side",
  rows: [
    { feature: "Current offer", them: "Plans and features may change; check Pomofocus's current offer", flow: "Free timer access and a paid Pro plan; check Flow's current pricing" },
    { feature: "Pomodoro workflow", them: "Check Pomofocus's current presets, tasks, and reports", flow: "Pomodoro presets, custom durations, and tasks" },
    { feature: "Audio", them: "Check Pomofocus's current audio features", flow: "In-house music and adjustable ambient controls" },
    { feature: "Session history", them: "Check Pomofocus's current reporting features", flow: "History based on measured session minutes" },
    { feature: "Creator license", them: "Check Pomofocus and any separate music provider's current license terms", flow: "Not included in Free. Exactly 174 eligible tracks; every new download/license requires active Pro and a valid per-track Grant Record. Attribution and published terms apply; Spotify or YouTube listening grants no creator rights" },
  ],
  whenHeading: "When Pomofocus is still the right pick",
  whenParagraphs: [
    "Pomofocus may suit you if its current timer and task workflow is all you need. Verify its present features, plans, and terms directly with Pomofocus.",
    "Consider Flow if you want timer, tasks, in-house music, ambient controls, and measured session history in one browser workspace.",
  ],
  faq: [
    {
      q: "Is Flow's timer as good as Pomofocus?",
      a: "Flow provides work/break presets, custom durations, and tasks. Check Pomofocus's current controls and try both products; this page does not claim equivalent quality or complete feature parity.",
    },
    {
      q: "Do I have to pay for Flow where Pomofocus is free?",
      a: "Flow offers free timer access and a separate paid Pro plan. Check both providers' current pricing pages because plan contents can change.",
    },
    {
      q: "Can I use my own music with Flow?",
      a: "You can keep any player running alongside, but Flow's point is the built-in library: instrumental tracks made for focus that start and stop with your block, with ambient layers mixed underneath.",
    },
    {
      q: "Can I use Flow music in videos or streams?",
      a: "Only through Flow Creator Music—not through Free, Spotify, or YouTube listening. Exactly 174 tracks are eligible. Every new download/license requires active Pro and a valid per-track Grant Record; required attribution and the published terms apply.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Pomofocus: Flow",
  metaDescription:
    "Cari alternatif Pomofocus dengan musik bawaan? Flow mempertahankan alur Pomodoro yang bersih dan menambah track fokus original in-house plus ambient mixer.",
  h1: "Alternatif Pomofocus: Flow",
  intro: [
    "Pomofocus memosisikan produknya sebagai timer Pomodoro ringkas dengan kontrol berorientasi task. Fitur dan isi plan dapat berubah, jadi cek situs Pomofocus sebelum memutuskan.",
    "Flow menggabungkan timer browser dan task dengan musik produksi sendiri, kontrol ambient, serta riwayat sesi terukur. Ini bisa mengurangi kebutuhan tab audio terpisah, tetapi alur yang lebih cocok tetap bergantung pada preferensimu.",
  ],
  competitorName: "Pomofocus",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Penawaran saat ini", them: "Plan dan fitur bisa berubah; cek penawaran Pomofocus saat ini", flow: "Akses timer gratis dan plan Pro berbayar; cek harga Flow saat ini" },
    { feature: "Alur Pomodoro", them: "Cek preset, task, dan laporan Pomofocus saat ini", flow: "Preset Pomodoro, durasi custom, dan task" },
    { feature: "Audio", them: "Cek fitur audio Pomofocus saat ini", flow: "Musik produksi sendiri dan kontrol ambient yang dapat diatur" },
    { feature: "Riwayat sesi", them: "Cek fitur pelaporan Pomofocus saat ini", flow: "Riwayat berdasarkan menit sesi terukur" },
    { feature: "Lisensi kreator", them: "Cek ketentuan Pomofocus dan penyedia musik terpisah saat ini", flow: "Tidak termasuk Free. Tepat 174 track memenuhi syarat; setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track. Atribusi serta ketentuan terbit berlaku; mendengarkan lewat Spotify atau YouTube tidak memberi hak kreator" },
  ],
  whenHeading: "Kapan Pomofocus tetap pilihan yang benar",
  whenParagraphs: [
    "Pomofocus mungkin cocok kalau alur timer dan task-nya saat ini sudah cukup untukmu. Verifikasi fitur, plan, dan ketentuan terbarunya langsung ke Pomofocus.",
    "Pertimbangkan Flow kalau kamu ingin timer, task, musik produksi sendiri, kontrol ambient, dan riwayat sesi terukur dalam satu ruang kerja browser.",
  ],
  faq: [
    {
      q: "Timer Flow sebagus Pomofocus?",
      a: "Flow menyediakan preset kerja/istirahat, durasi custom, dan task. Cek kontrol Pomofocus saat ini dan coba keduanya; halaman ini tidak menyatakan kualitas setara atau kesamaan fitur lengkap.",
    },
    {
      q: "Aku harus bayar Flow padahal Pomofocus gratis?",
      a: "Flow menyediakan akses timer gratis dan plan Pro berbayar yang terpisah. Cek halaman harga terbaru kedua penyedia karena isi plan dapat berubah.",
    },
    {
      q: "Bisa pakai musikku sendiri di Flow?",
      a: "Player apa pun bisa tetap jalan berdampingan, tapi inti Flow adalah library bawaannya: track instrumental yang dibuat untuk fokus, mulai-berhenti bareng block-mu, dengan lapisan ambient di bawahnya.",
    },
    {
      q: "Boleh pakai musik Flow di video atau stream?",
      a: "Hanya lewat Flow Creator Music—bukan lewat Free atau mendengarkan di Spotify/YouTube. Tepat 174 track memenuhi syarat. Setiap download/lisensi baru memerlukan Pro aktif dan Grant Record valid per track; atribusi wajib dan ketentuan terbit berlaku.",
    },
  ],
};

export function getPomofocusCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
