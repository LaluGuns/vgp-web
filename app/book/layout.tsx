import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Music Production Guide: Trap Edition | VGP Library',
    description: 'Music Production Guide: Trap Edition by Virzy Guns covers trap drums, 808s, vocals, mixing, mastering, and release decisions for producers.',
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
};

export default function BookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
