import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'VGP Beatstore | Buy Trap, Drill, Phonk & Synthwave Beats',
    description: 'Premium instrumentals for artists. Browse our curated collection of Trap, Drill, Cyberphonk, and Synthwave beats. Instant license delivery.',
    keywords: ['buy beats', 'trap beats', 'drill instrumentals', 'phonk beats', 'cyberphonk', 'synthwave type beat', 'beatstore'],
};

export default function BeatsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
