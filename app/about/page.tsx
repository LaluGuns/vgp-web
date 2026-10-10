import type { Metadata } from 'next';
import { ogImage, TWITTER_HANDLES, OG_SITE } from '@/lib/og';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
    title: { absolute: 'Story | Virzy Guns, producer and founder' },
    description:
        'Virzy Guns is a songwriter and producer who started Virzy Guns Production in 2020 and now builds HealingWave, music made to help people focus, move and recover.',
    keywords: [
        'Virzy Guns',
        'top 10% songwriter',
        'top 25% producer',
        'songwriter producer',
        'music producer',
        'beatmaker',
        'Virzy Guns Production founder',
        'functional audio producer',
    ],
    alternates: {
        canonical: '/about',
    },
    openGraph: {
        title: 'Story | Virzy Guns, producer and founder',
        description:
            'From making records to making music that helps. The story behind Virzy Guns Production and HealingWave.',
        url: 'https://www.virzyguns.com/about',
        ...OG_SITE,
        images: [ogImage({ kicker: 'Story', title: 'From making records to making music that helps.' })],
    },
    twitter: {
        card: 'summary_large_image',
        ...TWITTER_HANDLES,
        images: [ogImage({ kicker: 'Story', title: 'From making records to making music that helps.' }).url],
    },
};

export default function AboutPage() {
    return <AboutClient />;
}
