/**
 * Publisher Data — PT Kreasi Virzy Nusantara
 * Centralized data for the publisher profile and book catalog.
 */

export interface PublisherBook {
    slug: string;
    title: string;
    author: string;
    description: string;
    pages: number;
    chapters: number;
    format: string;
    language: string;
    coverImage: string;
    href: string;
    price?: string;
    status: 'published' | 'coming-soon';
    year: number;
}

export const publisherInfo = {
    name: 'PT Kreasi Virzy Nusantara',
    tagline: 'Penerbit Digital untuk Edukasi dan Keterampilan',
    description:
        'PT Kreasi Virzy Nusantara adalah penerbit digital yang berfokus pada buku-buku edukasi di bidang musik, keterampilan, dan pengembangan diri. Kami menerbitkan konten berkualitas dalam format ebook (PDF) yang mudah diakses dari perangkat apa pun.',
    mission:
        'Menyediakan materi edukasi digital berkualitas yang praktis, terjangkau, dan bisa dipelajari secara mandiri oleh siapa saja.',
    fields: [
        'Produksi Musik & Audio',
        'Keterampilan & Kerajinan',
        'Pengembangan Diri',
    ],
    contact: {
        email: 'founder@virzyguns.com',
        whatsapp: '6289667233666',
        whatsappDisplay: '+62 896-6723-3666',
        location: 'Lombok, Indonesia',
    },
    website: 'https://www.virzyguns.com',
    founded: 2026,
} as const;

export const publisherBooks: PublisherBook[] = [
    {
        slug: 'trap-guide',
        title: 'Music Production Guide: Trap Edition',
        author: 'Virzy Guns',
        description:
            'Panduan praktis produksi musik trap yang mencakup drum programming, 808, rekaman vokal, mixing, dan mastering untuk streaming. Disusun untuk mengubah insting menjadi keputusan yang bisa diulang.',
        pages: 80,
        chapters: 6,
        format: 'PDF Digital',
        language: 'English',
        coverImage: '/ebooks/trap-guide-book-cover.jpg',
        href: '/book',
        status: 'coming-soon',
        year: 2026,
    },
    {
        slug: 'jahit-yuk',
        title: 'Jahit Yuk! Ebook Menjahit Pemula',
        author: 'Baiq Sainik',
        description:
            'Panduan menjahit untuk pemula yang ingin belajar dari nol secara bertahap, praktis, dan mudah dipahami. Materi disusun dari pengenalan alat, mesin jahit, pola, hingga proyek rok sederhana.',
        pages: 192,
        chapters: 7,
        format: 'PDF Digital (HD + Siap Cetak)',
        language: 'Bahasa Indonesia',
        coverImage: '/ebooks/jahit-yuk-cover.jpg',
        href: 'https://wa.me/6289667233666?text=Halo%2C%20saya%20tertarik%20dengan%20ebook%20Jahit%20Yuk!',
        price: 'Rp58.888',
        status: 'published',
        year: 2026,
    },
];
