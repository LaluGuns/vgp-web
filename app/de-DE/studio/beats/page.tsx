import type { Metadata } from 'next';
import BeatsClient from '../../../studio/beats/BeatsClient';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Cyberpunk Trap, Phonk & Synthwave Beats kaufen | Virzy Guns',
    description:
        'Offizielle Cyberpunk Trap-, Phonk-, Synthwave- und 808-Instrumentals von Virzy Guns anhören, eine Lizenz wählen und bei BeatStars kaufen.',
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
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats kaufen | Virzy Guns',
        description: 'Offizielle Instrumentals von Virzy Guns anhören, Lizenzen vergleichen und direkt bei BeatStars kaufen.',
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
    twitter: {
        card: 'summary_large_image',
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats kaufen | Virzy Guns',
        description: 'Offizielle Instrumentals anhören, Lizenzen vergleichen und direkt bei BeatStars kaufen.',
        images: [`${SITE_URL}/branding/vgp-logo-chrome-full.png`],
    },
};

const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/de-DE/studio/beats#collection`,
            name: 'Virzy Guns Beat Store',
            description: 'Offizieller Beat-Katalog von Virzy Guns für Cyberpunk Trap, Phonk, Synthwave, 808 und Rap-Instrumentals.',
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
