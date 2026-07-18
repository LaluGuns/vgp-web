// /alternatives/noisli — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Noisli Alternative: Flow",
  metaDescription:
    "Looking for a Noisli alternative with actual music? Flow layers a 12-channel ambient mixer under original in-house focus tracks, with a real Pomodoro timer on top.",
  h1: "Noisli Alternative: Flow",
  intro: [
    "Noisli got ambient mixing right years before it was fashionable: rain, thunder, wind, a coffee shop, each on its own fader, saved as combos. For masking an open office or tinnitus, a good noise mixer is quietly one of the most useful tools there is.",
    "But Noisli stops at noise — there's no music in it, and the timer is a side feature. Flow treats the same mixer idea as one layer of a bigger machine: original instrumental tracks produced in-house sit on top, the ambient layers blend underneath at independent volumes, and a full Pomodoro timer with tasks and honest stats drives the session.",
  ],
  competitorName: "Noisli",
  tableHeading: "Side by side",
  rows: [
    { feature: "Ambient sounds", them: "The core product — well-made noise generators", flow: "12-layer mixer: rain, café, fire, river, city, and more" },
    { feature: "Music", them: "None — ambient noise only", flow: "80+ original tracks produced in-house by one musician" },
    { feature: "Focus timer", them: "Basic timer alongside the sounds", flow: "Full Pomodoro: presets, custom splits, per-session tasks" },
    { feature: "Stats", them: "None to speak of", flow: "Streaks, heatmap, records — measured minutes only" },
    { feature: "Price", them: "Limited free hours, then subscription", flow: "Free tier; Pro at $9.99/mo for the full library" },
  ],
  whenHeading: "When Noisli is still the right pick",
  whenParagraphs: [
    "If music — any music — breaks your concentration and pure noise is what works for you, Noisli is dedicated to exactly that, and its combo-saving and background-noise focus is more granular than a music app's ambient layer will ever need to be. Writers who want a wall of rain and nothing else are well served there.",
    "Pick Flow when you want both dials: real music made for focus when you want it, the ambient wall when you don't, and a timer that turns the whole thing into finished blocks instead of an endless soundscape.",
  ],
  faq: [
    {
      q: "Does Flow have ambient sounds like Noisli?",
      a: "Yes — a 12-layer mixer with rain, café, fire, river, city, and more, each at its own volume. The difference is that Flow layers them under original music instead of stopping at noise.",
    },
    {
      q: "Can I use Flow as just a noise mixer?",
      a: "Sure. Leave the music off and run only the ambient layers with the timer. The free tier includes ambient sounds.",
    },
    {
      q: "Is Flow's music going to distract me?",
      a: "It's instrumental and written specifically to sit behind work — no lyrics, no attention-grabbing drops. If it still isn't for you, the ambient-only setup above is a click away.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Noisli: Flow",
  metaDescription:
    "Cari alternatif Noisli yang punya musik beneran? Flow melapis mixer ambient 12 kanal di bawah track fokus original in-house, dengan timer Pomodoro beneran di atasnya.",
  h1: "Alternatif Noisli: Flow",
  intro: [
    "Noisli membereskan urusan ambient mixing bertahun-tahun sebelum jadi tren: hujan, guntur, angin, kedai kopi, masing-masing dengan fader sendiri, bisa disimpan jadi combo. Buat menutup suara open office atau tinnitus, mixer noise yang bagus diam-diam salah satu alat paling berguna yang ada.",
    "Tapi Noisli berhenti di noise — nggak ada musik di dalamnya, dan timer-nya fitur sampingan. Flow memperlakukan ide mixer yang sama sebagai satu lapisan dari mesin yang lebih besar: track instrumental original yang diproduksi sendiri di atas, lapisan ambient membaur di bawah dengan volume masing-masing, dan timer Pomodoro penuh dengan task serta statistik jujur yang menjalankan sesinya.",
  ],
  competitorName: "Noisli",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Ambient sound", them: "Produk intinya — generator noise yang digarap baik", flow: "Mixer 12 lapis: hujan, café, api, sungai, kota, dan lainnya" },
    { feature: "Musik", them: "Nggak ada — hanya ambient noise", flow: "80+ track original diproduksi sendiri oleh satu musisi" },
    { feature: "Timer fokus", them: "Timer dasar di samping suara", flow: "Pomodoro penuh: preset, split custom, task per sesi" },
    { feature: "Statistik", them: "Praktis nggak ada", flow: "Streak, heatmap, rekor — hanya menit terukur" },
    { feature: "Harga", them: "Jam gratis terbatas, lalu langganan", flow: "Tier gratis; Pro $9.99/bln untuk library penuh" },
  ],
  whenHeading: "Kapan Noisli tetap pilihan yang benar",
  whenParagraphs: [
    "Kalau musik — musik apa pun — memecah konsentrasimu dan noise murni yang jalan buat kamu, Noisli didedikasikan persis untuk itu, dan fitur simpan-combo serta fokus background-noise-nya lebih granular daripada yang akan pernah dibutuhkan lapisan ambient sebuah app musik. Penulis yang cuma mau dinding hujan terlayani baik di sana.",
    "Pilih Flow kalau kamu mau dua kenop: musik beneran yang dibuat untuk fokus saat kamu mau, dinding ambient saat nggak, dan timer yang mengubah semuanya jadi block yang selesai, bukan soundscape tanpa ujung.",
  ],
  faq: [
    {
      q: "Flow punya ambient sound seperti Noisli?",
      a: "Punya — mixer 12 lapis dengan hujan, café, api, sungai, kota, dan lainnya, masing-masing dengan volume sendiri. Bedanya, Flow melapisnya di bawah musik original, bukan berhenti di noise.",
    },
    {
      q: "Bisa pakai Flow cuma sebagai mixer noise?",
      a: "Bisa. Matikan musiknya dan jalankan lapisan ambient saja dengan timer. Tier gratis sudah termasuk ambient sound.",
    },
    {
      q: "Musik Flow bakal mengganggu fokusku?",
      a: "Musiknya instrumental dan ditulis khusus untuk duduk di belakang kerjaan — tanpa lirik, tanpa drop yang menyita perhatian. Kalau tetap bukan seleramu, setup ambient-saja di atas tinggal satu klik.",
    },
  ],
};

export function getNoisliCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
