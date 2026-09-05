import type { Metadata } from 'next';
import CadenzClient from './CadenzClient';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'CADENZ Running Music by BPM | 130-180 BPM',
    description:
        'Explore CADENZ running music from 130 to 180 BPM, then discover the cadence-first music app for runners and cyclists by HealingWave Lab and Virzy Guns Production.',
    keywords: [
        'CADENZ',
        'cadence music app',
        'running music app',
        'cycling music app',
        'HealingWave Lab',
        'Virzy Guns Production',
        'functional audio',
        'running music by BPM',
        '130 BPM running music',
        '180 BPM running music',
    ],
    alternates: {
        canonical: '/cadenz',
    },
    openGraph: {
        title: 'CADENZ Running Music by BPM',
        description:
            'Choose running music across the 130-180 BPM spectrum and discover the CADENZ cadence-first experience.',
        url: '/cadenz',
        siteName: 'Virzy Guns Production',
        type: 'website',
        images: [
            {
                url: '/images/CADENZ_POSTER.jpg',
                width: 575,
                height: 1024,
                alt: 'CADENZ running and cycling music by HealingWave Lab',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CADENZ Running Music by BPM',
        description:
            'Choose running music across the 130-180 BPM spectrum and discover the CADENZ cadence-first experience.',
        images: ['/images/CADENZ_POSTER.jpg'],
    },
};

const cadenzSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/cadenz#product`,
    name: 'CADENZ',
    url: `${SITE_URL}/cadenz`,
    applicationCategory: 'HealthApplication',
    description:
        'A cadence-first music app from HealingWave Lab and Virzy Guns Production for runners and cyclists, built around original music and BPM targets.',
    audience: [
        {
            '@type': 'Audience',
            audienceType: 'Runners',
        },
        {
            '@type': 'Audience',
            audienceType: 'Cyclists',
        },
    ],
    author: {
        '@id': `${SITE_URL}/#organization`,
    },
    publisher: {
        '@id': `${SITE_URL}/#organization`,
    },
    image: `${SITE_URL}/images/CADENZ_POSTER.jpg`,
};

export default function CadenzPage() {
    return (
        <>
            <JsonLd data={cadenzSchema} />
            <CadenzClient />
        </>
    );
}
