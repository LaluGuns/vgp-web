import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
    title: 'About Virzy Guns | Top 10% Songwriter, Top 25% Producer',
    description:
        'Virzy Guns is ranked top 10% songwriter and top 25% producer, plus beatmaker and founder of Virzy Guns Production, a music-tech ecosystem for songs, premium beats, functional audio, CADENZ, books, and producer education.',
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
        title: 'About Virzy Guns | Top 10% Songwriter, Top 25% Producer',
        description:
            'Meet Virzy Guns, ranked top 10% songwriter and top 25% producer behind VGP, HealingWave Lab, CADENZ, books, premium beats, and producer education.',
        url: 'https://virzyguns.com/about',
    },
};

export default function AboutPage() {
    return <AboutClient />;
}
