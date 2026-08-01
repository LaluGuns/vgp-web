import type { Metadata } from 'next';

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

export default function BookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
