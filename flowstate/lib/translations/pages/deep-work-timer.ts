// Copy for /[lang]/deep-work-timer. EN and ID written for real; other
// locales fall back to English.
import type { Locale } from "@/lib/translations/dictionaries";
import type { FaqItem } from "@/lib/marketing/seo";

export type LandingCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  paragraphs: string[];
  faq: FaqItem[];
};

const en: LandingCopy = {
  metaTitle: "Deep Work Timer — free 90-minute focus blocks",
  metaDescription:
    "Free deep work timer with 90/15 blocks, running in your browser. Built for long, uninterrupted focus — with original in-house music in the full Flow app.",
  h1: "Deep Work Timer",
  paragraphs: [
    "Deep work is the stretch where the hard thing actually moves: the architecture decision, the proof, the chapter. Cal Newport gave it a name, but every programmer already knows the shape — it takes twenty minutes to load the problem into your head, and one Slack ping to drop it.",
    "This timer defaults to 90/15 instead of the classic 25/5 because some people prefer a longer, uninterrupted work block. It is a practical preset, not a universal biological rhythm; choose the duration that fits the task and your energy.",
    "Treat the block as a contract: one task, phone in another room, notifications off. Most people get two or three honest 90-minute blocks a day. That's not a limitation to fix — two real blocks beat eight interrupted ones.",
    "The timer above runs right here with real start, pause, and reset. When you want the full setup — original focus music produced in-house, an ambient mixer, and stats that only count measured minutes — the app is one click away and free to try.",
  ],
  faq: [
    {
      q: "Why 90 minutes and not 25?",
      a: "25/5 is great for small, nameable tasks. Deep work has a ramp-up cost — often 15–20 minutes before you're really in — so a 25-minute block ends right as the ramp pays off. 90 minutes pays the ramp once and spends the rest working.",
    },
    {
      q: "Is this deep work timer free?",
      a: "Yes. It runs in your browser with no account and no ads. The Flow app has a free tier too; the paid plan adds the full music library and extra ambient sounds.",
    },
    {
      q: "Can I change the block length?",
      a: "On this page the preset is fixed at 90/15, but there are other splits — 25/5, 45/15, 50/10, 60/10 — each on its own page, and the full app lets you set custom lengths.",
    },
    {
      q: "Does music help deep work?",
      a: "It depends on the person and the music. What we can say honestly: Flow's tracks are produced in-house specifically for long focus blocks — no lyrics fighting for your attention, no jarring transitions, not a stock playlist.",
    },
  ],
};

const id: LandingCopy = {
  metaTitle: "Timer Deep Work — block fokus 90 menit, gratis",
  metaDescription:
    "Timer deep work gratis dengan block 90/15, jalan langsung di browser. Dibuat untuk fokus panjang tanpa interupsi — dengan musik original in-house di aplikasi Flow.",
  h1: "Timer Deep Work",
  paragraphs: [
    "Deep work itu rentang waktu di mana hal yang susah benar-benar bergerak: keputusan arsitektur, pembuktian, satu bab tulisan. Cal Newport yang memberi nama, tapi setiap programmer sudah kenal bentuknya — butuh dua puluh menit buat masukin masalah ke kepala, dan satu ping Slack buat menjatuhkannya.",
    "Karena itu timer ini default-nya 90/15, bukan 25/5 klasik. Ini adalah preset praktis untuk orang yang lebih nyaman dengan blok kerja panjang, bukan klaim tentang ritme biologis yang paling tepat untuk semua orang; pilih durasi yang cocok dengan tugas dan energimu.",
    "Perlakukan block-nya seperti kontrak: satu task, HP di ruangan lain, notifikasi mati. Kebanyakan orang dapat dua atau tiga block 90 menit yang jujur per hari. Itu bukan keterbatasan yang harus diperbaiki — dua block beneran mengalahkan delapan block yang keinterupsi.",
    "Timer di atas jalan langsung di sini dengan tombol mulai, jeda, dan reset yang beneran. Kalau mau setup lengkapnya — musik fokus original yang diproduksi sendiri, ambient mixer, dan statistik yang cuma menghitung menit terukur — aplikasinya tinggal satu klik dan gratis dicoba.",
  ],
  faq: [
    {
      q: "Kenapa 90 menit, bukan 25?",
      a: "25/5 bagus buat task kecil yang jelas. Deep work punya biaya pemanasan — sering 15–20 menit sebelum benar-benar masuk — jadi block 25 menit habis tepat saat pemanasannya mulai kebayar. 90 menit membayar pemanasan sekali dan sisanya dipakai kerja.",
    },
    {
      q: "Timer deep work ini gratis?",
      a: "Gratis. Jalan di browser tanpa akun dan tanpa iklan. Aplikasi Flow juga punya tier gratis; plan berbayar menambah library musik penuh dan ambient sound ekstra.",
    },
    {
      q: "Bisa ganti panjang block-nya?",
      a: "Di halaman ini preset-nya tetap 90/15, tapi ada split lain — 25/5, 45/15, 50/10, 60/10 — masing-masing punya halaman sendiri, dan di aplikasi penuh kamu bisa atur durasi custom.",
    },
    {
      q: "Musik membantu deep work?",
      a: "Tergantung orangnya dan musiknya. Yang bisa kami bilang dengan jujur: track di Flow diproduksi sendiri khusus untuk block fokus panjang — tanpa lirik yang rebutan perhatian, tanpa transisi kasar, bukan playlist stock.",
    },
  ],
};

export function getDeepWorkTimerCopy(locale: Locale): LandingCopy {
  return locale === "id" ? id : en;
}
