// Copy for /[lang]/license — the creator-facing music license (backlink
// magnet). EN and ID written for real; other locales fall back to English.
import type { Locale } from "@/lib/translations/dictionaries";
import type { FaqItem } from "@/lib/marketing/seo";

export type LicenseCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  allowedHeading: string;
  allowed: string[];
  attributionHeading: string;
  attributionBody: string;
  attributionLine: string;
  notAllowedHeading: string;
  notAllowed: string[];
  finePrint: string;
  faq: FaqItem[];
};

const ATTRIBUTION = "Music: Flow by Virzy Guns — flow.virzyguns.com";

const en: LicenseCopy = {
  metaTitle: "Music License — free for streams & videos",
  metaDescription:
    "Flow music is free to use in your streams and videos with one attribution line. Original focus tracks by Virzy Guns — the terms fit on one page.",
  h1: "Flow music is free to use in your streams & videos",
  intro: [
    "Every track in Flow is written and produced by Virzy Guns. If you make videos, streams, or study-with-me content, you can use that music as your background — free, with one attribution line. This page is the whole license; there's no longer version hiding somewhere.",
    "This page grants the written permission referred to in our Terms of Service for creator use of the music.",
  ],
  allowedHeading: "What you can do",
  allowed: [
    "Use Flow music as background audio in YouTube videos, Twitch streams, podcasts, and study-with-me or coding-session content.",
    "Monetize that content — ads, sponsors, memberships are all fine.",
    "Play the app's music live on stream while you work.",
  ],
  attributionHeading: "The one condition",
  attributionBody:
    "Put this line in your video description, stream panel, or podcast notes:",
  attributionLine: ATTRIBUTION,
  notAllowedHeading: "What you can't do",
  notAllowed: [
    "Re-upload or distribute the tracks as standalone music — no 'lofi mix' re-uploads, no music channels built on our tracks.",
    "Claim the music as your own or register it with Content ID or any rights-management system.",
    "Redistribute the audio files themselves — link people to Flow instead.",
    "Sell the music, sample it into your own releases, or use it in paid stock libraries.",
  ],
  finePrint:
    "That's the entire license. If your use case is bigger or weirder than this — a game, an app, a commercial — email founder@virzyguns.com and ask; the producer reads it.",
  faq: [
    {
      q: "Do I need to pay to use the music in my videos?",
      a: "No. The license above is free, including for monetized content. The attribution line is the only requirement.",
    },
    {
      q: "Will I get a copyright claim on YouTube?",
      a: "The music is not registered with Content ID and we don't file claims against creators who follow this license. If a claim ever appears in error, email founder@virzyguns.com and it gets fixed.",
    },
    {
      q: "Can I use the music if I'm on Flow's free tier?",
      a: "Yes. The license covers the music you can play in Flow, whichever tier you're on.",
    },
    {
      q: "Can I download the tracks for offline editing?",
      a: "The app streams the music and we don't distribute the files. For editing workflows that genuinely need a file, email founder@virzyguns.com with what you're making.",
    },
  ],
};

const id: LicenseCopy = {
  metaTitle: "Lisensi Musik — gratis untuk stream & video",
  metaDescription:
    "Musik Flow gratis dipakai di stream dan video kamu dengan satu baris atribusi. Track fokus original oleh Virzy Guns — syaratnya muat satu halaman.",
  h1: "Musik Flow gratis dipakai di stream & video kamu",
  intro: [
    "Setiap track di Flow ditulis dan diproduksi oleh Virzy Guns. Kalau kamu bikin video, stream, atau konten study-with-me, kamu boleh pakai musiknya sebagai latar — gratis, dengan satu baris atribusi. Halaman ini adalah keseluruhan lisensinya; nggak ada versi panjang yang disembunyikan di tempat lain.",
    "Halaman ini memberikan izin tertulis yang dimaksud di Terms of Service kami untuk penggunaan musik oleh kreator.",
  ],
  allowedHeading: "Yang boleh kamu lakukan",
  allowed: [
    "Pakai musik Flow sebagai audio latar di video YouTube, stream Twitch, podcast, dan konten study-with-me atau sesi coding.",
    "Memonetisasi konten itu — iklan, sponsor, membership semuanya boleh.",
    "Memutar musik dari app secara live di stream sambil kamu kerja.",
  ],
  attributionHeading: "Satu-satunya syarat",
  attributionBody:
    "Cantumkan baris ini di deskripsi video, panel stream, atau catatan podcast kamu:",
  attributionLine: ATTRIBUTION,
  notAllowedHeading: "Yang nggak boleh",
  notAllowed: [
    "Re-upload atau menyebarkan track sebagai musik berdiri sendiri — nggak boleh re-upload 'lofi mix', nggak boleh bangun channel musik dari track kami.",
    "Mengklaim musiknya sebagai karyamu atau mendaftarkannya ke Content ID atau sistem rights-management mana pun.",
    "Menyebarkan file audionya — arahkan orang ke Flow saja.",
    "Menjual musiknya, me-sample ke rilisanmu sendiri, atau memasukkannya ke stock library berbayar.",
  ],
  finePrint:
    "Itu seluruh lisensinya. Kalau kebutuhanmu lebih besar atau lebih aneh dari ini — game, app, iklan komersial — email founder@virzyguns.com dan tanyakan; produsernya baca sendiri.",
  faq: [
    {
      q: "Perlu bayar buat pakai musiknya di video?",
      a: "Nggak. Lisensi di atas gratis, termasuk untuk konten yang dimonetisasi. Baris atribusi adalah satu-satunya syarat.",
    },
    {
      q: "Aku bakal kena copyright claim di YouTube?",
      a: "Musiknya nggak didaftarkan ke Content ID dan kami nggak mengajukan klaim ke kreator yang mengikuti lisensi ini. Kalau suatu saat muncul klaim keliru, email founder@virzyguns.com dan akan dibereskan.",
    },
    {
      q: "Boleh pakai musiknya kalau aku di tier gratis Flow?",
      a: "Boleh. Lisensi ini mencakup musik yang bisa kamu putar di Flow, apa pun tier-mu.",
    },
    {
      q: "Boleh download track-nya buat editing offline?",
      a: "App-nya melakukan streaming dan kami nggak menyebarkan file-nya. Untuk alur editing yang benar-benar butuh file, email founder@virzyguns.com dengan penjelasan yang kamu buat.",
    },
  ],
};

export function getLicenseCopy(locale: Locale): LicenseCopy {
  return locale === "id" ? id : en;
}
