import type { Metadata } from 'next';
import { JsonLd } from '@/components/blog/article/JsonLd';

export const metadata: Metadata = {
    title: 'Music Production Guide: Trap Edition | PDF Book | VGP',
    description: 'A coming-soon PDF book by Virzy Guns covering trap drums, 808s, vocals, mixing, mastering, and release decisions for producers.',
    keywords: [
        'Music Production Guide Trap Edition',
        'trap production guide',
        '808 mixing',
        'beatmaking ebook',
        'music production book',
        'Virzy Guns book',
        'producer education',
    ],
    alternates: {
        canonical: '/book',
    },
    openGraph: {
        title: 'Music Production Guide: Trap Edition | PDF Book | VGP',
        description: 'A coming-soon PDF producer manual covering trap drums, 808s, vocals, mixing, mastering, and release decisions.',
        type: 'book',
        url: 'https://www.virzyguns.com/book',
        images: ['/ebooks/trap-guide-book-cover.jpg'],
    },
};

// The page is a client component, so its structured data is emitted here, with the CSP nonce.
const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: 'Music Production Guide: Trap Edition',
    url: 'https://www.virzyguns.com/book',
    image: 'https://www.virzyguns.com/ebooks/trap-guide-book-cover.jpg',
    description:
        'A practical PDF guide for producers covering trap drums, 808s, vocals, mixing, mastering, and release decisions.',
    author: {
        '@type': 'Person',
        name: 'Virzy Guns',
        url: 'https://www.virzyguns.com/about',
    },
    bookFormat: 'EBook',
    inLanguage: 'en',
};

export default function BookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <JsonLd data={bookJsonLd} />
            {children}
        </>
    );
}
