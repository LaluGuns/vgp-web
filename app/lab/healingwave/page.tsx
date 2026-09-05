import type { Metadata } from 'next';
import HealingWaveClient from './HealingWaveClient';
import { JsonLd } from '@/components/seo/JsonLd';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'HealingWave Lab | Functional Audio',
    description:
        'HealingWave Lab by Virzy Guns covers functional audio for focus music, recovery listening, running cadence, cycling cadence, and CADENZ.',
    keywords: [
        'HealingWave Lab',
        'functional audio',
        'focus music',
        'cadence music',
        'CADENZ',
        'Virzy Guns',
        'music-tech',
    ],
    alternates: {
        canonical: '/lab/healingwave',
    },
};

const healingWaveSchema = {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    '@id': `${SITE_URL}/lab/healingwave#product`,
    name: 'HealingWave Lab',
    url: `${SITE_URL}/lab/healingwave`,
    description:
        'Virzy Guns Production functional-audio research program exploring focus listening, recovery listening, running cadence, cycling cadence, and related audio concepts.',
    parentOrganization: {
        '@id': `${SITE_URL}/#organization`,
    },
    founder: {
        '@id': `${SITE_URL}/#founder`,
    },
    knowsAbout: [
        'functional audio',
        'focus music',
        'recovery listening',
        'running cadence',
        'cycling cadence',
    ],
};

export default function HealingWavePage() {
    return (
        <>
            <JsonLd data={healingWaveSchema} />
            <HealingWaveClient />
        </>
    );
}
