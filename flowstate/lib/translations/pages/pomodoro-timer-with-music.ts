// Copy for /[lang]/pomodoro-timer-with-music — the main money page of the
// timer cluster. EN and ID written for real; other locales fall back to EN.
import type { Locale } from "@/lib/translations/dictionaries";
import type { LandingCopy } from "./deep-work-timer";

export type MusicLandingCopy = LandingCopy & {
  musicHeading: string;
  musicParagraphs: string[];
  genresLabel: string;
  genres: string[];
};

const en: MusicLandingCopy = {
  metaTitle: "Pomodoro Timer with Music — original tracks, free",
  metaDescription:
    "A Pomodoro timer with music actually made for it: 80+ original tracks produced in-house by one musician — not AI, not YouTube loops. Free tier, runs in your browser.",
  h1: "Pomodoro Timer with Music",
  paragraphs: [
    "Most 'Pomodoro timer with music' setups are really two tabs: a timer here, a YouTube lofi stream there, and an ad break right when you finally stopped noticing the music. Flow is the two tabs merged, with the music actually made for the job.",
    "The timer part is the standard tool done properly — presets from 25/5 to 90/15, custom lengths, tasks next to the clock, and stats that only count measured minutes. The timer on this page is a working sample; press start and it runs.",
    "The music part is the difference. Every track in Flow is produced in-house by Virzy Guns — one musician, writing instrumental music specifically for focus blocks. Not AI-generated, not licensed from a stock library, not a re-upload of someone's playlist. When the block starts the music starts, and when the block ends it stops with it.",
  ],
  musicHeading: "Music produced for this app, not found for it",
  musicParagraphs: [
    "80+ original instrumental tracks and counting, with new ones added monthly. Written to sit behind your work: no lyrics, no drops that yank your attention, no three-second gaps between loops.",
    "Because one producer makes everything, the library is consistent in a way playlists can't be — and because it lives in the app, the ambient mixer can layer rain, café, or fire under any track at independent volumes.",
  ],
  genresLabel: "In the library",
  genres: ["Lofi", "Synthwave", "City Pop", "Cyberpunk Jazz", "Ambient"],
  faq: [
    {
      q: "Is the music AI-generated?",
      a: "No. Every track is written and produced by Virzy Guns, the musician who built the app. That's the whole point of the product — it's the one thing a competitor can't copy with an API key.",
    },
    {
      q: "Is the Pomodoro timer free?",
      a: "Yes — the timer, a portion of the music library, and the basic ambient sounds are free. The paid plan ($9.99/mo or $59.99/yr) adds the full library, every scene, and new tracks monthly.",
    },
    {
      q: "Why not just use a YouTube lofi stream?",
      a: "You can, and plenty of people do. What you give up: no ads mid-block, music that starts and stops with the timer, an ambient mixer under the music, and stats from the same tool. What you pay: nothing, on the free tier.",
    },
    {
      q: "Can I use the music in my own videos or streams?",
      a: "Yes, with attribution — see the music license page. Credit 'Music: Flow by Virzy Guns — flow.virzyguns.com' and you're covered for streams, videos, and study-with-me content.",
    },
  ],
};

const id: MusicLandingCopy = {
  metaTitle: "Timer Pomodoro dengan Musik — track original, gratis",
  metaDescription:
    "Timer Pomodoro dengan musik yang memang dibuat buat ini: 80+ track original diproduksi sendiri oleh satu musisi — bukan AI, bukan loop YouTube. Ada tier gratis, jalan di browser.",
  h1: "Timer Pomodoro dengan Musik",
  paragraphs: [
    "Kebanyakan setup 'timer Pomodoro dengan musik' sebenarnya dua tab: timer di sini, stream lofi YouTube di sana, dan iklan muncul tepat waktu kamu akhirnya berhenti sadar sama musiknya. Flow itu dua tab tadi digabung, dengan musik yang memang dibuat untuk kerjaannya.",
    "Bagian timer-nya adalah alat standar yang digarap benar — preset dari 25/5 sampai 90/15, durasi custom, task di samping jam, dan statistik yang cuma menghitung menit terukur. Timer di halaman ini contoh yang beneran jalan; tekan mulai dan dia hidup.",
    "Bagian musiknya yang jadi pembeda. Setiap track di Flow diproduksi sendiri oleh Virzy Guns — satu musisi, menulis musik instrumental khusus untuk block fokus. Bukan hasil AI, bukan lisensi dari stock library, bukan re-upload playlist orang. Musik mulai saat block mulai, dan berhenti saat block selesai.",
  ],
  musicHeading: "Musik yang diproduksi untuk app ini, bukan dicari buat app ini",
  musicParagraphs: [
    "80+ track instrumental original dan terus bertambah, dengan track baru tiap bulan. Ditulis untuk duduk di belakang kerjaanmu: tanpa lirik, tanpa drop yang menyentak perhatian, tanpa jeda tiga detik antar loop.",
    "Karena semuanya dibuat satu produser, library-nya konsisten dengan cara yang nggak bisa ditiru playlist — dan karena hidup di dalam app, ambient mixer bisa melapis hujan, café, atau api di bawah track mana pun dengan volume masing-masing.",
  ],
  genresLabel: "Di dalam library",
  genres: ["Lofi", "Synthwave", "City Pop", "Cyberpunk Jazz", "Ambient"],
  faq: [
    {
      q: "Musiknya hasil AI?",
      a: "Bukan. Setiap track ditulis dan diproduksi oleh Virzy Guns, musisi yang membangun app-nya. Justru itu inti produknya — satu hal yang nggak bisa ditiru kompetitor pakai API key.",
    },
    {
      q: "Timer Pomodoro-nya gratis?",
      a: "Gratis — timer, sebagian library musik, dan ambient sound dasar bisa dipakai tanpa bayar. Plan berbayar ($9.99/bln atau $59.99/thn) menambah library penuh, semua scene, dan track baru tiap bulan.",
    },
    {
      q: "Kenapa nggak pakai stream lofi YouTube saja?",
      a: "Bisa, dan banyak yang begitu. Yang kamu korbankan: bebas iklan di tengah block, musik yang mulai-berhenti bareng timer, ambient mixer di bawah musik, dan statistik dari alat yang sama. Yang kamu bayar: nol, di tier gratis.",
    },
    {
      q: "Boleh pakai musiknya di video atau stream-ku sendiri?",
      a: "Boleh, dengan atribusi — lihat halaman lisensi musik. Cantumkan 'Music: Flow by Virzy Guns — flow.virzyguns.com' dan kamu aman untuk stream, video, dan konten study-with-me.",
    },
  ],
};

export function getPomodoroMusicCopy(locale: Locale): MusicLandingCopy {
  return locale === "id" ? id : en;
}
