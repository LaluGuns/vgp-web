import type { Metadata } from 'next';
import { ogImage, socialMetadata } from '@/lib/og';
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
    ...socialMetadata({
        title: 'Music Production Masterclass | VGP',
        description: 'Practical courses on workflow, sound design, mixing, mastering and trap production from VGP.',
        url: 'https://www.virzyguns.com/studio/masterclass',
        image: ogImage({ kicker: 'Masterclass', title: 'Music production masterclass.', sub: 'Workflow, sound design, mixing, mastering and trap production.' }),
    }),
};

export default function MasterclassPage() {
    return <MasterclassClient />;
}
