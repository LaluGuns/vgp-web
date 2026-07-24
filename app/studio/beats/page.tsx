import type { Metadata } from 'next';
import BeatsClient from './BeatsClient';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Beats for Sale | Trap, Phonk & Cyberpunk Beats by Virzy Guns',
    description:
        'Browse and license premium instrumentals by Virzy Guns. Cyberpunk trap, phonk, synthwave, hard 808s, and exclusive beats with instant delivery.',
    keywords: [
        'buy beats online',
        'beats for sale',
        'trap beats for sale',
        'cyberpunk beats for sale',
        'phonk beats for sale',
        'synthwave beats for sale',
        'hard 808 beats',
        'rap instrumentals for sale',
        'exclusive beats for sale',
        'beat licensing',
    ],
    alternates: {
        canonical: '/studio/beats',
    },
};

const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/studio/beats#collection`,
            name: 'Virzy Guns Beat Store',
            description:
                'Browse premium beats by Virzy Guns across trap, phonk, synthwave, R&B, drill, custom production, and mixing & mastering.',
            url: `${SITE_URL}/studio/beats`,
        },
        {
            '@type': 'BreadcrumbList',
            '@id': `${SITE_URL}/studio/beats#breadcrumbs`,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: SITE_URL,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Beats',
                    item: `${SITE_URL}/studio/beats`,
                },
            ],
        },
    ],
};

export default function BeatsPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
            />
            <BeatsClient />
        </>
    );
}
