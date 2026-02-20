import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'HealingWave Functional Audio',
    description: 'Explore HealingWave by VGP. Scientifically engineered audio for cognitive enhancement, deep focus, running cadence, and workout performance.',
    keywords: ['functional audio', 'focus music', 'binaural beats', 'running cadence audio', 'workout music', 'neuroacoustic', 'HealingWave'],
};

export default function HealingWaveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
