import type { Metadata } from 'next';
import BeatsClient from './BeatsClient';

export const metadata: Metadata = {
    title: 'Beats & Instrumentals',
    description: 'Buy premium trap, cyberphonk, synthwave, R&B, and drill beats. Exclusive and non-exclusive licenses from $15. Produced by Virzy Guns. 100% Art. 100% Science.',
};

export default function BeatsPage() {
    return <BeatsClient />;
}
