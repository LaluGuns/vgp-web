import { Metadata } from 'next';
import { MusicStoreSchema } from '@/components/seo/MusicStoreSchema';

export const metadata: Metadata = {
    title: 'VGP Studio | Premium Beats and Instrumentals',
    description: 'Premium instrumentals and audio services for artists. Browse Trap, Drill, Phonk, Synthwave, R&B, and more from Virzy Guns Production.',
    keywords: ['buy beats', 'trap beats', 'drill instrumentals', 'phonk beats', 'synthwave type beat', 'Beat Store', 'music production services'],
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
