import type { Metadata } from 'next';
import CadenzClient from './CadenzClient';

export const metadata: Metadata = {
    title: 'CADENZ by HealingWave Lab',
    description:
        'CADENZ by HealingWave Lab is a coming-soon cadence music app for runners and cyclists from Virzy Guns Production.',
    keywords: [
        'CADENZ',
        'cadence music app',
        'running music app',
        'cycling music app',
        'HealingWave Lab',
        'Virzy Guns Production',
        'functional audio',
    ],
    alternates: {
        canonical: '/cadenz',
    },
};

export default function CadenzPage() {
    return <CadenzClient />;
}
