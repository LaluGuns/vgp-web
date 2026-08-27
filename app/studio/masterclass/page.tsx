import type { Metadata } from 'next';
import MasterclassClient from './MasterclassClient';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Music Production Masterclass | VGP',
    description:
        'Learn music production from VGP with practical courses on workflow, sound design, mixing, mastering, trap production, and release decisions.',
    keywords: [
        'music production masterclass',
        'producer education',
        'trap production course',
        'beatmaking course',
        'mixing and mastering course',
        'Virzy Guns masterclass',
    ],
    alternates: {
        canonical: '/studio/masterclass',
    },
};

const masterclassSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${SITE_URL}/studio/masterclass#product`,
    name: 'VGP Music Production Masterclass',
    url: `${SITE_URL}/studio/masterclass`,
    description:
        'Upcoming practical producer education covering workflow, sound design, mixing, mastering, trap production, and release decisions.',
    provider: {
        '@id': `${SITE_URL}/#organization`,
    },
    author: {
        '@id': `${SITE_URL}/#founder`,
    },
};

export default function MasterclassPage() {
    return (
        <>
            <JsonLd data={masterclassSchema} />
            <MasterclassClient />
        </>
    );
}
