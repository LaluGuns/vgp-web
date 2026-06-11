import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'HealingWave Functional Audio',
    description: 'Explore HealingWave by VGP: functional audio concepts for focus music, recovery listening, running cadence, cycling cadence, and CADENZ.',
    keywords: ['functional audio', 'focus music', 'recovery music', 'running cadence audio', 'cycling cadence music', 'CADENZ', 'HealingWave'],
    alternates: {
        canonical: '/lab/healingwave',
    },
};

export default function HealingWaveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
