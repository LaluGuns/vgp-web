import type { CreatorGenre } from "@/lib/creator-license/policy";
import type { Locale } from "@/lib/translations/dictionaries";
import type { FaqItem } from "@/lib/marketing/seo";

export const CREATOR_MUSIC_PATH = "creator-music";
export const SPOTIFY_ARTIST_URL = "https://open.spotify.com/artist/21bxd77KSj9RR6vAqW5Hvy";
export const CREATOR_ATTRIBUTION =
  "Music: Flow Creator Music by Chill Music Division / Virzy Guns Production — https://flow.virzyguns.com/creator-music";

export type CreatorGenreContent = {
  slug: string;
  genre: CreatorGenre;
  title: string;
  description: string;
  h1: string;
  intro: string;
  useCases: string[];
  primaryQuery: string;
};

const enGenres: CreatorGenreContent[] = [
  {
    slug: "city-pop",
    genre: "City Pop",
    title: "City Pop Background Music for Videos",
    description: "City Pop background music for videos, streams, and creative edits. License eligible Flow tracks with an active Pro plan.",
    h1: "City Pop background music for your videos",
    intro: "Warm chords, night-drive bass, and polished rhythm for retro visual edits, vlogs, and relaxed creator work. These tracks are part of Flow Creator Music, curated by Chill Music Division.",
    useCases: ["Retro and anime-inspired edits", "Travel vlogs and night-drive visuals", "Lifestyle, design, and creative process videos"],
    primaryQuery: "city pop background music",
  },
  {
    slug: "cyberpunk-jazz",
    genre: "Cyberpunk Jazz",
    title: "Cyberpunk Jazz Background Music for Streams",
    description: "Cyberpunk jazz background music for streams, futuristic videos, and night-city visuals. Creator downloads require active Flow Pro.",
    h1: "Cyberpunk jazz for futuristic creator work",
    intro: "Noir chords, digital texture, and late-night rhythm for cyberpunk ambience, technology stories, and live coding scenes. License eligible through an active Flow Pro creator plan.",
    useCases: ["Cyberpunk ambience and futuristic visuals", "Technology explainers and live coding", "Night-city streams and motion graphics"],
    primaryQuery: "cyberpunk jazz background music",
  },
  {
    slug: "neo-synthwave",
    genre: "Neo Synthwave",
    title: "Neo Synthwave Music for Coding Videos",
    description: "Neo synthwave music for coding videos, streams, and technology content. Creator downloads require an active Flow Pro plan.",
    h1: "Neo synthwave for coding and technology content",
    intro: "Forward-moving synth lines and clean electronic momentum for build videos, product launches, and long coding sessions. Download access is included with an active Flow Pro creator license.",
    useCases: ["Coding videos and developer livestreams", "Product demos and technology reviews", "Futuristic motion graphics and game dev diaries"],
    primaryQuery: "neo synthwave music for coding videos",
  },
];

const idGenres: CreatorGenreContent[] = [
  {
    ...enGenres[0],
    title: "Musik City Pop untuk Video",
    description: "Musik City Pop untuk video, stream, dan edit kreatif. Download kreator tersedia dengan Flow Pro aktif.",
    h1: "Musik City Pop untuk video kamu",
    intro: "Chord hangat, bass night-drive, dan ritme rapi untuk edit retro, vlog, serta proses kreatif. Semua bagian dari Flow Creator Music yang dikurasi Chill Music Division.",
    useCases: ["Edit retro dan terinspirasi anime", "Vlog perjalanan dan visual night-drive", "Video lifestyle, desain, dan proses kreatif"],
  },
  {
    ...enGenres[1],
    title: "Musik Cyberpunk Jazz untuk Stream",
    description: "Musik Cyberpunk Jazz untuk stream, video futuristik, dan visual kota malam. Download kreator perlu Flow Pro aktif.",
    h1: "Cyberpunk Jazz untuk karya kreator futuristik",
    intro: "Chord noir, tekstur digital, dan ritme larut malam untuk ambience cyberpunk, cerita teknologi, dan live coding. Lisensi tersedia melalui Flow Pro aktif.",
    useCases: ["Ambience cyberpunk dan visual futuristik", "Video teknologi dan live coding", "Stream kota malam dan motion graphic"],
  },
  {
    ...enGenres[2],
    title: "Musik Neo Synthwave untuk Video Coding",
    description: "Musik Neo Synthwave untuk video coding, stream, dan konten teknologi. Download kreator perlu Flow Pro aktif.",
    h1: "Neo Synthwave untuk konten coding dan teknologi",
    intro: "Synth yang bergerak maju dan energi elektronik bersih untuk video membangun produk, launch, dan sesi coding panjang. Download tersedia dengan Flow Pro aktif.",
    useCases: ["Video coding dan livestream developer", "Demo produk dan review teknologi", "Motion graphic futuristik dan game dev diary"],
  },
];

export function creatorGenres(locale: Locale): CreatorGenreContent[] {
  return locale === "id" ? idGenres : enGenres;
}

export function creatorGenreBySlug(locale: Locale, slug: string) {
  return creatorGenres(locale).find((item) => item.slug === slug);
}

export function creatorMusicCopy(locale: Locale) {
  const isId = locale === "id";
  return {
    title: isId ? "Musik untuk Kreator — City Pop, Cyberpunk Jazz & Neo Synthwave" : "Music for Creators — City Pop, Cyberpunk Jazz & Neo Synthwave",
    description: isId
      ? "Musik City Pop, Cyberpunk Jazz, dan Neo Synthwave untuk video dan stream. Download kreator tersedia dengan lisensi Flow Pro aktif."
      : "City Pop, Cyberpunk Jazz, and Neo Synthwave music for videos and streams. Creator downloads are available with an active Flow Pro license.",
    h1: isId ? "Musik berlisensi untuk video, stream, dan karya kreator" : "Licensed music for videos, streams, and creator work",
    intro: isId
      ? "Flow Creator Music dikurasi oleh Chill Music Division — sebuah division dari Virzy Guns Production. Pilih tiga genre yang dibuat untuk visual kreator; gunakan dengan lisensi Flow Pro aktif."
      : "Flow Creator Music is curated by Chill Music Division — a division of Virzy Guns Production. Choose from three genres made for creator visuals, with an active Flow Pro creator license.",
    catalogHeading: isId ? "Cari katalog kreator" : "Browse the creator catalog",
    licenseHeading: isId ? "Cara kerja lisensinya" : "How the license works",
    licenseSteps: isId
      ? ["Aktifkan Flow Pro.", "Buat grant lisensi kreator di Flow.", "Download track dan cantumkan atribusi."]
      : ["Keep an active Flow Pro plan.", "Create your creator-license grant in Flow.", "Download tracks and include the attribution."],
  };
}

export function creatorLicenseCopy(locale: Locale) {
  const isId = locale === "id";
  const faq: FaqItem[] = isId
    ? [
        { q: "Apakah Flow Pro diperlukan?", a: "Ya. Lisensi kreator dan download berlaku untuk user dengan Flow Pro aktif." },
        { q: "Apa yang terjadi jika saya membatalkan Pro?", a: "Konten yang pertama kali dipublikasikan saat Pro aktif tetap berlisensi. Untuk karya baru, aktifkan Pro lagi." },
        { q: "Bolehkah saya mendaftarkan musik ke Content ID?", a: "Tidak. Kamu tidak boleh mendaftarkan, mengklaim, menjual ulang, atau mendistribusikan ulang musik." },
      ]
    : [
        { q: "Do I need Flow Pro?", a: "Yes. Creator licensing and downloads are for users with an active Flow Pro plan." },
        { q: "What happens if I cancel Pro?", a: "Content first published while Pro was active stays licensed. New work needs Pro to be active again." },
        { q: "Can I register the music with Content ID?", a: "No. You may not register, claim, resell, or redistribute the music." },
      ];
  return {
    title: isId ? "Lisensi Musik Kreator Flow Pro" : "Flow Pro Creator Music License",
    description: isId ? "Syarat lisensi Flow Pro untuk musik City Pop, Cyberpunk Jazz, dan Neo Synthwave bagi kreator." : "The Flow Pro license terms for City Pop, Cyberpunk Jazz, and Neo Synthwave creator music.",
    h1: isId ? "Lisensi musik kreator Flow Pro" : "Flow Pro creator music license",
    intro: isId
      ? "Lisensi ini memberi pengguna Flow Pro aktif izin terbatas untuk memakai katalog City Pop, Cyberpunk Jazz, dan Neo Synthwave yang eligible sebagai musik latar. Ini bukan transfer hak cipta atau lisensi bebas tanpa batas."
      : "This license gives active Flow Pro users a limited right to use eligible City Pop, Cyberpunk Jazz, and Neo Synthwave tracks as background music. It is not a transfer of copyright or an unlimited free license.",
    allowedHeading: isId ? "Boleh digunakan untuk" : "You may use it for",
    allowed: isId
      ? ["Video monetized, livestream, podcast, study-with-me, dan konten coding.", "Konten sosial dan video kreator dengan jumlah views atau stream tanpa batas.", "Konten yang pertama kali dipublikasikan ketika Flow Pro aktif, bahkan setelah pembatalan normal."]
      : ["Monetized videos, livestreams, podcasts, study-with-me, and coding content.", "Social and creator videos with unlimited views or streams.", "Content first published while Flow Pro was active, even after a normal cancellation."],
    notAllowedHeading: isId ? "Tidak boleh" : "You may not",
    notAllowed: isId
      ? ["Mendaftarkan musik atau karya turunan ke Content ID atau sistem rights-management.", "Mengunggah, menjual ulang, menyublisensikan, atau mendistribusikan file sebagai musik standalone.", "Me-sample, me-remix, membuat lagu turunan, atau mengunggahnya ke DSP atas nama kamu.", "Menggunakan musik untuk library, marketplace template, app, atau game tanpa izin terpisah."]
      : ["Register the music or a derivative work with Content ID or another rights-management system.", "Upload, resell, sublicense, or redistribute the files as standalone music.", "Sample, remix, make a derivative song, or upload it to a DSP under your name.", "Use the music in a library, template marketplace, app, or game without separate permission."],
    attributionHeading: isId ? "Atribusi wajib" : "Required attribution",
    attributionBody: isId ? "Cantumkan baris ini di deskripsi video, panel stream, atau catatan podcast:" : "Include this line in your video description, stream panel, or podcast notes:",
    finePrint: isId
      ? "Master recording, publishing, dan composition tetap milik Virzy Guns Production. Refund, chargeback, fraud, atau pelanggaran ketentuan dapat mencabut grant lisensi terkait."
      : "Master recording, publishing, and composition remain owned by Virzy Guns Production. A refund, chargeback, fraud, or terms violation may revoke the related license grant.",
    faq,
  };
}

export function creatorOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Chill Music Division",
    parentOrganization: { "@type": "Organization", name: "Virzy Guns Production" },
    sameAs: [SPOTIFY_ARTIST_URL],
    url: "https://flow.virzyguns.com/creator-music",
  };
}
