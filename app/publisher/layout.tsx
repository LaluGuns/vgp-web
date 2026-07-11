import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Penerbit | PT Kreasi Virzy Nusantara',
    description:
        'Profil penerbit PT Kreasi Virzy Nusantara — penerbit digital untuk buku edukasi musik, keterampilan, dan pengembangan diri. Lihat katalog publikasi kami.',
    keywords: [
        'PT Kreasi Virzy Nusantara',
        'penerbit digital',
        'penerbit ebook',
        'penerbit Indonesia',
        'buku edukasi',
        'ebook musik',
        'ebook menjahit',
    ],
    alternates: {
        canonical: '/publisher',
    },
    openGraph: {
        title: 'Penerbit | PT Kreasi Virzy Nusantara',
        description:
            'Profil penerbit dan katalog publikasi PT Kreasi Virzy Nusantara. Penerbit digital untuk edukasi musik, keterampilan, dan pengembangan diri.',
        url: 'https://www.virzyguns.com/publisher',
    },
};

export default function PublisherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
