import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import BookClient from './BookClient';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Music Production Guide: Trap Edition | Virzy Guns',
    description:
        'A practical PDF producer guide covering trap drums, 808s, recording, vocal processing, mixing, mastering, and release decisions. Coming soon from VGP Producer Library.',
    alternates: {
        canonical: '/book',
    },
    openGraph: {
        title: 'Music Production Guide: Trap Edition',
        description:
            'A practical producer guide for drums, 808s, vocals, mixing, mastering, and repeatable production decisions.',
        url: `${SITE_URL}/book`,
        type: 'book',
        images: ['/ebooks/trap-guide-book-cover.jpg'],
    },
};

const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `${SITE_URL}/book#product`,
    name: 'Music Production Guide: Trap Edition',
    url: `${SITE_URL}/book`,
    image: `${SITE_URL}/ebooks/trap-guide-book-cover.jpg`,
    description:
        'A practical PDF guide for producers covering trap drums, 808s, vocals, mixing, mastering, and release decisions.',
    author: {
        '@id': `${SITE_URL}/#founder`,
    },
    publisher: {
        '@id': `${SITE_URL}/#organization`,
    },
    bookFormat: 'EBook',
    inLanguage: 'en',
};

export default function GuidesPage() {
    return (
        <>
            <JsonLd data={bookJsonLd} />
            <BookClient />
        </>
    );
}
