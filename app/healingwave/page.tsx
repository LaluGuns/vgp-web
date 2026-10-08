import type { Metadata } from 'next';
import { ogImage } from '@/lib/og';
import HealingWaveClient from './HealingWaveClient';

export const metadata: Metadata = {
    title: { absolute: 'HealingWave by Virzy Guns | Music that does people good' },
    description:
        'HealingWave by Virzy Guns makes music with a job to do: help people focus, keep a steady pace and recover. It ships as CADENZ for running and cycling and Flow for focus.',
    keywords: ['HealingWave', 'functional music', 'focus music', 'cadence music', 'CADENZ', 'Flow', 'Virzy Guns'],
    alternates: {
        canonical: '/healingwave',
    },
    openGraph: {
        title: 'HealingWave by Virzy Guns | Music that does people good',
        description: 'Music made to help people focus, move and recover. By Virzy Guns.',
        url: 'https://www.virzyguns.com/healingwave',
        images: [ogImage({ kicker: 'HealingWave', title: 'Music that does people good.', sub: 'Music made to help people focus, move and recover.' })],
    },
    twitter: {
        card: 'summary_large_image',
        images: [ogImage({ kicker: 'HealingWave', title: 'Music that does people good.', sub: 'Music made to help people focus, move and recover.' }).url],
    },
};

export default function HealingWavePage() {
    return <HealingWaveClient />;
}
