import type { Metadata } from 'next';
import HealingWaveClient from './HealingWaveClient';

export const metadata: Metadata = {
    title: 'HealingWave Project — Functional Audio Lab',
    description: 'Productivity & Wellness Ecosystem by VGP. Functional audio for deep focus, running, workouts, and sleep. 100% Art. 100% Science.',
};

export default function HealingWavePage() {
    return <HealingWaveClient />;
}
