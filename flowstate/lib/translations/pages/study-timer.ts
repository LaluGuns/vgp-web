// Copy for /[lang]/study-timer. EN and ID written for real; other locales
// fall back to English.
import type { Locale } from "@/lib/translations/dictionaries";
import type { FaqItem } from "@/lib/marketing/seo";
import type { LandingCopy } from "./deep-work-timer";

const en: LandingCopy = {
  metaTitle: "Study Timer — free 25/5 Pomodoro for studying",
  metaDescription:
    "Free study timer in your browser: 25 minutes on, 5 minutes off. No account, no ads. Pair it with original focus music in the Flow app.",
  h1: "Study Timer",
  paragraphs: [
    "Studying rarely fails at the understanding step — it fails at the sitting-down step, and then again at the staying-seated step. A study timer fixes both by shrinking the decision: you're not committing to an evening of organic chemistry, you're committing to 25 minutes of it.",
    "This page runs the classic 25/5 split, and it fits study work well: one flashcard deck, one problem set section, one lecture's notes per block. The 5-minute break is short on purpose — long enough to stand up and refill water, short enough that you don't lose the thread. After three or four rounds, take a longer break away from the desk.",
    "Two honest rules make the timer work: pick the task before you press start, and put the phone somewhere that requires standing up. The timer keeps counting in the tab title if you switch windows — but the point of the block is that you don't.",
  ],
  faq: [
    {
      q: "How long should a study session be?",
      a: "Start with 25/5. If you keep getting cut off mid-problem, move up to 45/15 or 50/10. The right length is the longest block you can finish without drifting — most students overestimate it at first.",
    },
    {
      q: "Is this study timer free?",
      a: "Yes. It runs in your browser, no account, no ads. The Flow app adds music and stats; it also has a free tier.",
    },
    {
      q: "Should I listen to music while studying?",
      a: "For reading-heavy work, music with lyrics competes with the text — instrumental works better for most people. Flow's library is instrumental focus music produced in-house, plus ambient layers like rain and café if music isn't your thing.",
    },
    {
      q: "Does the timer keep running if I switch tabs?",
      a: "Yes. The countdown continues in the background and the remaining time shows in the tab title.",
    },
  ],
};

const id: LandingCopy = {
  metaTitle: "Timer Belajar — Pomodoro 25/5 gratis untuk belajar",
  metaDescription:
    "Timer belajar gratis di browser: 25 menit belajar, 5 menit istirahat. Tanpa akun, tanpa iklan. Pasangkan dengan musik fokus original di aplikasi Flow.",
  h1: "Timer Belajar",
  paragraphs: [
    "Belajar jarang gagal di tahap memahami — gagalnya di tahap duduk, lalu gagal lagi di tahap bertahan duduk. Timer belajar membereskan keduanya dengan mengecilkan keputusannya: kamu bukan berkomitmen semalaman sama kimia organik, kamu berkomitmen 25 menit saja.",
    "Halaman ini menjalankan split klasik 25/5, dan itu pas buat belajar: satu deck flashcard, satu bagian soal, satu catatan kuliah per block. Break 5 menitnya memang sengaja pendek — cukup buat berdiri dan isi ulang air, cukup pendek supaya benang pikiranmu nggak putus. Setelah tiga-empat ronde, ambil break lebih panjang jauh dari meja.",
    "Dua aturan jujur yang bikin timer ini jalan: tentukan task sebelum tekan mulai, dan taruh HP di tempat yang mengharuskan berdiri. Timer tetap menghitung di judul tab kalau kamu pindah jendela — tapi inti block-nya justru supaya kamu nggak pindah.",
  ],
  faq: [
    {
      q: "Sesi belajar sebaiknya berapa lama?",
      a: "Mulai dari 25/5. Kalau kamu terus kepotong di tengah soal, naik ke 45/15 atau 50/10. Durasi yang benar adalah block terpanjang yang bisa kamu selesaikan tanpa buyar — kebanyakan pelajar awalnya menaksir terlalu tinggi.",
    },
    {
      q: "Timer belajar ini gratis?",
      a: "Gratis. Jalan di browser, tanpa akun, tanpa iklan. Aplikasi Flow menambah musik dan statistik; ada tier gratisnya juga.",
    },
    {
      q: "Sebaiknya dengar musik sambil belajar?",
      a: "Buat materi yang banyak membaca, musik berlirik bersaing dengan teksnya — instrumental lebih cocok buat kebanyakan orang. Library Flow berisi musik fokus instrumental yang diproduksi sendiri, plus lapisan ambient seperti hujan dan café kalau musik bukan seleramu.",
    },
    {
      q: "Timer tetap jalan kalau pindah tab?",
      a: "Tetap. Hitungan lanjut di background dan sisa waktu tampil di judul tab.",
    },
  ],
};

export function getStudyTimerCopy(locale: Locale): LandingCopy {
  return locale === "id" ? id : en;
}
