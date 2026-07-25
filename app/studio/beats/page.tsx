import type { Metadata } from 'next';
import BeatsClient from './BeatsClient';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Beats for Sale | Cyberpunk Trap, Phonk & Synthwave Beats | Virzy Guns',
    description:
        'Browse and license official instrumentals by Virzy Guns. Cyberpunk trap, phonk, synthwave, hard 808s, and exclusive beats with instant delivery.',
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
        canonical: `${SITE_URL}/studio/beats`,
        languages: {
            'en-US': `${SITE_URL}/studio/beats`,
            'ja-JP': `${SITE_URL}/ja-JP/studio/beats`,
            'de-DE': `${SITE_URL}/de-DE/studio/beats`,
            'x-default': `${SITE_URL}/studio/beats`,
        },
    },
    openGraph: {
        title: 'Beats for Sale | Cyberpunk Trap, Phonk & Synthwave Beats | Virzy Guns',
        description:
            'Browse and license official instrumentals by Virzy Guns. Instant MP3, WAV, Track Stems, and Exclusive licensing options.',
        url: `${SITE_URL}/studio/beats`,
        siteName: 'Virzy Guns Production',
        images: [
            {
                url: `${SITE_URL}/branding/vgp-logo-chrome-full.png`,
                width: 1024,
                height: 1024,
                alt: 'Virzy Guns Production Beat Store',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Beats for Sale | Virzy Guns Production',
        description: 'Browse and license official Cyberpunk Trap, Phonk, and Synthwave beats.',
        images: [`${SITE_URL}/branding/vgp-logo-chrome-full.png`],
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
                'Browse official beat catalog produced by Virzy Guns across Cyberpunk Trap, Phonk, Synthwave, Hard 808, and Exclusive Rights.',
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
