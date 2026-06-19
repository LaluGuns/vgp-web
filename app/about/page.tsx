import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
    title: 'About Virzy Guns | Founder of Virzy Guns Production',
    description:
        'Meet Virzy Guns, founder and creative director of a music-tech ecosystem spanning VGP Studio, HealingWave Lab, CADENZ, books, and producer education.',
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
        title: 'About Virzy Guns | Founder of Virzy Guns Production',
        description:
            'Meet the founder behind VGP Studio, HealingWave Lab, CADENZ, books, premium beats, and producer education.',
        url: 'https://www.virzyguns.com/about',
    },
};

export default function AboutPage() {
    return <AboutClient />;
}
