import type { Metadata } from 'next';
import MasterclassClient from './MasterclassClient';

export const metadata: Metadata = {
    title: 'Music Production Masterclass | VGP',
    description:
        'Learn music production from VGP with practical courses on workflow, sound design, mixing, mastering, trap production, and release decisions.',
    keywords: [
        'music production masterclass',
        'producer education',
        'trap production course',
        'beatmaking course',
        'mixing and mastering course',
        'Virzy Guns masterclass',
    ],
    alternates: {
        canonical: '/studio/masterclass',
    },
};

export default function MasterclassPage() {
    return <MasterclassClient />;
}
