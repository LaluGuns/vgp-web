import type { Metadata } from 'next';
import HealingWaveClient from './HealingWaveClient';

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

export default function HealingWavePage() {
    return <HealingWaveClient />;
}
