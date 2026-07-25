import type { Metadata } from 'next';
import BeatsClient from '../../../studio/beats/BeatsClient';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Beats kaufen | Cyberpunk Trap, Phonk & Synthwave | Virzy Guns',
    description:
        'Offizielle Instrumentals von Virzy Guns durchsuchen und lizensieren. Cyberpunk Trap, Phonk, Synthwave und exklusive Beats.',
    keywords: [
        'Beats kaufen',
        'Trap Beats kaufen',
        'Cyberpunk Beats',
        'Phonk Beats',
        'Synthwave Beats',
        'Virzy Guns',
    ],
    alternates: {
        canonical: `${SITE_URL}/de-DE/studio/beats`,
        languages: {
            'en-US': `${SITE_URL}/studio/beats`,
            'ja-JP': `${SITE_URL}/ja-JP/studio/beats`,
            'de-DE': `${SITE_URL}/de-DE/studio/beats`,
            'x-default': `${SITE_URL}/studio/beats`,
        },
    },
    openGraph: {
        title: 'Beats kaufen | Virzy Guns Production',
        description: 'Offizielle Cyberpunk Trap, Phonk und Synthwave Beats von Virzy Guns lizensieren.',
        url: `${SITE_URL}/de-DE/studio/beats`,
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
};

const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/de-DE/studio/beats#collection`,
            name: 'Virzy Guns Beat Store',
            description: 'Offizieller Beat-Katalog von Virzy Guns. Cyberpunk Trap, Phonk, Synthwave.',
            url: `${SITE_URL}/de-DE/studio/beats`,
        },
        {
            '@type': 'BreadcrumbList',
            '@id': `${SITE_URL}/de-DE/studio/beats#breadcrumbs`,
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
                    item: `${SITE_URL}/de-DE/studio/beats`,
                },
            ],
        },
    ],
};

export default function GermanBeatsIndexPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
            />
            <BeatsClient locale="de-DE" />
        </>
    );
}
