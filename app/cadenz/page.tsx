import type { Metadata } from 'next';
import CadenzClient from './CadenzClient';

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

export default function CadenzPage() {
    return <CadenzClient />;
}
