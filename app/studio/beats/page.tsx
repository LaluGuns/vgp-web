import type { Metadata } from 'next';
import BeatsClient from './BeatsClient';

export const metadata: Metadata = {
    title: 'Beats by Virzy Guns | VGP Studio Beat Store',
    description: 'Browse premium beats by Virzy Guns across trap, phonk, synthwave, R&B, drill, custom production, mixing, mastering, and sound design.',
    keywords: [
        'beats by Virzy Guns',
        'Virzy Guns beats',
        'VGP Beat Store',
        'buy beats online',
        'trap beats',
        'phonk beats',
        'synthwave beats',
        'R&B beats',
        'drill beats',
        'exclusive beat license',
    ],
    alternates: {
        canonical: '/studio/beats',
    },
};

export default function BeatsPage() {
    return <BeatsClient />;
}
