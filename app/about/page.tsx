import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
    title: 'About - Virzy Guns Production',
    description: 'Virzy Guns is a professional music producer, beatmaker, and audio technologist. BMI songwriter, Sony Music Publishing affiliate, and creator of the HealingWave functional audio platform. 100% Art. 100% Science.',
    openGraph: {
        title: 'About Virzy Guns | Producer & Audio Technologist',
        description: 'BMI-affiliated songwriter and producer. Science-backed functional audio for focus, wellness, and performance. 100% Art. 100% Science.',
        url: 'https://virzyguns.com/about',
    },
};

export default function AboutPage() {
    return <AboutClient />;
}
