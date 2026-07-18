// Copy for the programmatic timer preset pages (/[lang]/timer/[slug]).
// EN and ID are written for real; the other locales fall back to English.
import type { Locale } from "@/lib/translations/dictionaries";
import type { FaqItem } from "@/lib/marketing/seo";

export const TIMER_SLUGS = ["25-5", "50-10", "45-15", "60-10", "90-15"] as const;
export type TimerSlug = (typeof TIMER_SLUGS)[number];

export const TIMER_CONFIG: Record<TimerSlug, { workMin: number; breakMin: number }> = {
  "25-5": { workMin: 25, breakMin: 5 },
  "50-10": { workMin: 50, breakMin: 10 },
  "45-15": { workMin: 45, breakMin: 15 },
  "60-10": { workMin: 60, breakMin: 10 },
  "90-15": { workMin: 90, breakMin: 15 },
};

export type TimerPageCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  paragraphs: string[];
  faq: FaqItem[];
};

// FAQ answers shared across slugs, parameterized per split.
function enFaq(w: number, b: number): FaqItem[] {
  return [
    {
      q: `Is this ${w}/${b} timer free?`,
      a: `Yes. The timer on this page runs in your browser with no account and no ads. The full Flow app also has a free tier — the paid plan adds the full music library and extra ambient sounds.`,
    },
    {
      q: "Does the timer keep running if I switch tabs?",
      a: "Yes. The countdown keeps going in the background and the remaining time shows in the tab title, so you can work in another window.",
    },
    {
      q: `What is the ${w}/${b} method?`,
      a: `You work in fixed blocks: ${w} minutes on a single task, then a ${b}-minute break, then repeat. The fixed end point makes it easier to start, and the break keeps the next block usable.`,
    },
    {
      q: "Where is the music?",
      a: "This page is the bare timer. The Flow app pairs the same presets with original focus music produced in-house by Virzy Guns — not stock loops — plus an ambient mixer for rain, café, and similar layers.",
    },
  ];
}

function idFaq(w: number, b: number): FaqItem[] {
  return [
    {
      q: `Timer ${w}/${b} ini gratis?`,
      a: `Gratis. Timer di halaman ini jalan langsung di browser, tanpa akun dan tanpa iklan. Aplikasi Flow juga punya tier gratis — plan berbayar menambah library musik penuh dan ambient sound ekstra.`,
    },
    {
      q: "Timer-nya tetap jalan kalau aku pindah tab?",
      a: "Tetap jalan. Hitungannya lanjut di background dan sisa waktunya muncul di judul tab, jadi kamu bisa kerja di jendela lain.",
    },
    {
      q: `Metode ${w}/${b} itu apa?`,
      a: `Kamu kerja dalam block tetap: ${w} menit untuk satu task, lalu istirahat ${b} menit, lalu ulang. Titik akhir yang jelas bikin lebih gampang mulai, dan istirahatnya menjaga block berikutnya tetap kepakai.`,
    },
    {
      q: "Musiknya di mana?",
      a: "Halaman ini timer polosnya saja. Di aplikasi Flow, preset yang sama dipasangkan dengan musik fokus original yang diproduksi sendiri oleh Virzy Guns — bukan stock loop — plus ambient mixer untuk hujan, café, dan lapisan sejenis.",
    },
  ];
}

const en: Record<TimerSlug, TimerPageCopy> = {
  "25-5": {
    metaTitle: "25/5 Pomodoro Timer — free, with music",
    metaDescription:
      "Free 25/5 Pomodoro timer that runs in your browser. The classic split: 25 minutes of work, 5 minutes off. Pair it with original focus music in Flow.",
    h1: "25/5 Pomodoro Timer — free, with music",
    paragraphs: [
      "This is the original Pomodoro split: 25 minutes on one task, 5 minutes off. Francesco Cirillo timed it with a kitchen timer in the late 1980s and the ratio has survived because it works — 25 minutes is short enough that starting doesn't feel like a commitment, and long enough to actually finish something small.",
      "Use 25/5 when the work is made of small, nameable pieces: replying to a queue, fixing a list of bugs, grinding flashcards, editing a document section by section. If you keep hitting the break mid-thought, your tasks probably need a longer block — try 50/10 or 90/15 instead.",
      "The timer above runs right here, no account needed. Press start, work the block, take the break when it flips. That's the whole method.",
    ],
    faq: enFaq(25, 5),
  },
  "50-10": {
    metaTitle: "50/10 Pomodoro Timer — free, with music",
    metaDescription:
      "Free 50/10 Pomodoro timer in your browser. 50 minutes of focused work, 10 minutes off — the split for tasks that need a longer ramp-up. Music in Flow.",
    h1: "50/10 Pomodoro Timer — free, with music",
    paragraphs: [
      "50/10 is the double Pomodoro: 50 minutes of work, 10 minutes off. It exists because some work has a ramp — loading a codebase into your head, getting back into a draft, setting up an experiment — and a 25-minute block ends right when the ramp pays off.",
      "It suits programming, writing, and design sessions where the first ten minutes are just context-loading. The 10-minute break is long enough to actually leave the desk, which matters more at this block length — 50 minutes of sitting plus a 30-second break doesn't reset anything.",
      "If 50 minutes still feels like it cuts you off, the 90/15 split is the next step up. If you're drifting before minute 30, drop back to 25/5 until the habit holds.",
    ],
    faq: enFaq(50, 10),
  },
  "45-15": {
    metaTitle: "45/15 Pomodoro Timer — free, with music",
    metaDescription:
      "Free 45/15 timer in your browser. 45 minutes of work with a real 15-minute break — a school-period rhythm with room to recover. Music in Flow.",
    h1: "45/15 Pomodoro Timer — free, with music",
    paragraphs: [
      "45/15 trades a slightly shorter work block for a real break. Forty-five minutes is roughly a school period — a length most people's attention already knows — and fifteen minutes is enough to eat something, stretch, or walk around the block instead of just refreshing a feed.",
      "It's a good split for long study days and for physically draining work, where the limiting factor isn't focus per block but how many blocks you can stack before the day falls apart. The generous break is what keeps block number six as usable as block number two.",
      "If the 15-minute breaks keep turning into 40-minute ones, that's a sign the break is too open-ended for you — try 50/10 or 60/10, where the break is a pause instead of an intermission.",
    ],
    faq: enFaq(45, 15),
  },
  "60-10": {
    metaTitle: "60/10 Pomodoro Timer — free, with music",
    metaDescription:
      "Free 60/10 timer in your browser. A full hour of work, 10 minutes off — clean blocks that map onto a calendar. Original focus music in Flow.",
    h1: "60/10 Pomodoro Timer — free, with music",
    paragraphs: [
      "60/10 is the calendar-shaped split: a full hour of work, ten minutes off. Its main advantage is boring and practical — hours are how meetings, schedules, and billing already work, so 'two focused hours before lunch' maps directly onto your day without arithmetic.",
      "It fits people who plan their day in hour slots and want the timer to enforce the slot instead of redefining it. One task per hour, break at the top of the hour, repeat. The ten-minute break is enough to reset between blocks without losing the slot after it.",
      "An hour is a long time to sit with a task that's too vague. If you're stalling mid-block, the fix is usually the task, not the timer — cut it into something that fits the hour, or switch to 25/5 and let the smaller blocks do the cutting for you.",
    ],
    faq: enFaq(60, 10),
  },
  "90-15": {
    metaTitle: "90/15 Deep Work Timer — free, with music",
    metaDescription:
      "Free 90/15 timer in your browser. 90-minute deep work blocks with 15-minute recovery — built around the ultradian rhythm. Original focus music in Flow.",
    h1: "90/15 Deep Work Timer — free, with music",
    paragraphs: [
      "90/15 is the deep work split: ninety minutes on one hard thing, fifteen minutes of real recovery. The length lines up with the ultradian rhythm — the roughly 90-minute cycles your alertness moves through during the day — and with how long it takes to get somewhere on genuinely difficult work.",
      "This is the block for the work that doesn't fit anywhere else: architecture decisions, proofs, long-form writing, anything where interruption cost is measured in half-hours. One 90-minute block with the phone in another room routinely beats an afternoon of supervised multitasking.",
      "Ninety minutes is demanding, and that's the point — most people get two, maybe three of these blocks per day. Don't stack five. If you can't hold ninety yet, 50/10 is the honest on-ramp.",
    ],
    faq: enFaq(90, 15),
  },
};

const id: Record<TimerSlug, TimerPageCopy> = {
  "25-5": {
    metaTitle: "Timer Pomodoro 25/5 — gratis, dengan musik",
    metaDescription:
      "Timer Pomodoro 25/5 gratis yang jalan langsung di browser. Split klasik: 25 menit kerja, 5 menit istirahat. Pasangkan dengan musik fokus original di Flow.",
    h1: "Timer Pomodoro 25/5 — gratis, dengan musik",
    paragraphs: [
      "Ini split Pomodoro yang asli: 25 menit untuk satu task, 5 menit istirahat. Francesco Cirillo menghitungnya pakai timer dapur di akhir 1980-an, dan rasionya bertahan karena memang jalan — 25 menit cukup pendek sampai mulai kerja nggak terasa seperti komitmen besar, tapi cukup panjang buat benar-benar menyelesaikan sesuatu yang kecil.",
      "Pakai 25/5 kalau kerjaanmu terdiri dari potongan kecil yang jelas: balas antrean pesan, beresin daftar bug, hafalan flashcard, edit dokumen per bagian. Kalau kamu terus kepotong break di tengah pikiran, kemungkinan task-mu butuh block lebih panjang — coba 50/10 atau 90/15.",
      "Timer di atas jalan langsung di sini, tanpa akun. Tekan mulai, kerjakan block-nya, istirahat waktu dia berganti. Metodenya memang cuma itu.",
    ],
    faq: idFaq(25, 5),
  },
  "50-10": {
    metaTitle: "Timer Pomodoro 50/10 — gratis, dengan musik",
    metaDescription:
      "Timer Pomodoro 50/10 gratis di browser. 50 menit kerja fokus, 10 menit istirahat — split untuk kerjaan yang butuh pemanasan lebih panjang. Musiknya di Flow.",
    h1: "Timer Pomodoro 50/10 — gratis, dengan musik",
    paragraphs: [
      "50/10 itu Pomodoro dobel: 50 menit kerja, 10 menit istirahat. Split ini ada karena sebagian kerjaan punya tanjakan — masukin codebase ke kepala, balik ke draft tulisan, nyiapin eksperimen — dan block 25 menit habis tepat waktu tanjakannya mulai kebayar.",
      "Cocok buat sesi programming, menulis, dan desain, di mana sepuluh menit pertama cuma buat loading konteks. Break 10 menitnya cukup buat benar-benar ninggalin meja, dan itu makin penting di block sepanjang ini — 50 menit duduk plus break 30 detik nggak me-reset apa-apa.",
      "Kalau 50 menit masih terasa motong, 90/15 adalah langkah berikutnya. Kalau kamu sudah buyar sebelum menit 30, turun dulu ke 25/5 sampai kebiasaannya kepegang.",
    ],
    faq: idFaq(50, 10),
  },
  "45-15": {
    metaTitle: "Timer Pomodoro 45/15 — gratis, dengan musik",
    metaDescription:
      "Timer 45/15 gratis di browser. 45 menit kerja dengan istirahat 15 menit yang beneran — ritme jam pelajaran dengan ruang buat pulih. Musiknya di Flow.",
    h1: "Timer Pomodoro 45/15 — gratis, dengan musik",
    paragraphs: [
      "45/15 menukar block kerja yang sedikit lebih pendek dengan istirahat yang beneran. Empat puluh lima menit kira-kira satu jam pelajaran — durasi yang perhatian kebanyakan orang sudah hafal — dan lima belas menit cukup buat makan, stretching, atau jalan keluar sebentar, bukan sekadar refresh feed.",
      "Split ini enak buat hari belajar yang panjang dan kerja yang menguras fisik, di mana faktor pembatasnya bukan fokus per block tapi berapa block yang bisa kamu tumpuk sebelum harinya ambruk. Break yang lega itulah yang bikin block keenam masih sekepakai block kedua.",
      "Kalau break 15 menitmu terus berubah jadi 40 menit, tandanya break-nya terlalu longgar buat kamu — coba 50/10 atau 60/10, yang break-nya jeda, bukan babak istirahat.",
    ],
    faq: idFaq(45, 15),
  },
  "60-10": {
    metaTitle: "Timer Pomodoro 60/10 — gratis, dengan musik",
    metaDescription:
      "Timer 60/10 gratis di browser. Satu jam penuh kerja, 10 menit istirahat — block rapi yang pas dengan kalender. Musik fokus original di Flow.",
    h1: "Timer Pomodoro 60/10 — gratis, dengan musik",
    paragraphs: [
      "60/10 itu split berbentuk kalender: satu jam penuh kerja, sepuluh menit istirahat. Keunggulan utamanya membosankan tapi praktis — jam adalah satuan yang sudah dipakai meeting, jadwal, dan billing, jadi 'dua jam fokus sebelum makan siang' langsung nempel ke harimu tanpa hitung-hitungan.",
      "Cocok buat yang merencanakan hari dalam slot jam dan ingin timer-nya menegakkan slot itu, bukan mendefinisikan ulang. Satu task per jam, break di pergantian jam, ulang. Break sepuluh menitnya cukup buat reset antar block tanpa kehilangan slot setelahnya.",
      "Satu jam itu lama kalau task-nya terlalu kabur. Kalau kamu macet di tengah block, yang perlu dibenerin biasanya task-nya, bukan timer-nya — potong jadi sesuatu yang muat sejam, atau pindah ke 25/5 dan biarkan block kecilnya yang motong.",
    ],
    faq: idFaq(60, 10),
  },
  "90-15": {
    metaTitle: "Timer Deep Work 90/15 — gratis, dengan musik",
    metaDescription:
      "Timer 90/15 gratis di browser. Block deep work 90 menit dengan pemulihan 15 menit — dibangun di sekitar ritme ultradian. Musik fokus original di Flow.",
    h1: "Timer Deep Work 90/15 — gratis, dengan musik",
    paragraphs: [
      "90/15 itu split deep work: sembilan puluh menit untuk satu hal yang susah, lima belas menit pemulihan yang beneran. Panjangnya sejalan dengan ritme ultradian — siklus kurang lebih 90 menit yang dilalui kewaspadaanmu sepanjang hari — dan dengan waktu yang dibutuhkan buat benar-benar maju di kerjaan yang sulit.",
      "Ini block untuk kerjaan yang nggak muat di mana-mana: keputusan arsitektur, pembuktian, tulisan panjang, apa pun yang biaya interupsinya dihitung dalam setengah jam. Satu block 90 menit dengan HP di ruangan lain rutin mengalahkan satu sore multitasking.",
      "Sembilan puluh menit itu berat, dan memang itu intinya — kebanyakan orang dapat dua, paling banyak tiga block ini per hari. Jangan tumpuk lima. Kalau belum kuat sembilan puluh, 50/10 adalah jalur masuk yang jujur.",
    ],
    faq: idFaq(90, 15),
  },
};

export function getTimerCopy(locale: Locale, slug: TimerSlug): TimerPageCopy {
  if (locale === "id") return id[slug];
  return en[slug];
}
