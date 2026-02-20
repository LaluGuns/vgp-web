import { Metadata } from 'next';
import { MusicStoreSchema } from '@/components/seo/MusicStoreSchema';

export const metadata: Metadata = {
    title: 'Premium Beats & Instrumentals',
    description: 'Premium instrumentals for artists. Browse our curated collection of Trap, Drill, Cyberphonk, and Synthwave beats. Instant license delivery.',
    keywords: ['buy beats', 'trap beats', 'drill instrumentals', 'phonk beats', 'cyberphonk', 'synthwave type beat', 'beatstore'],
};

export default function BeatsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <MusicStoreSchema />
            {children}
        </>
    );
}
