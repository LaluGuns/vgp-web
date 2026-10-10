import type { Metadata } from 'next';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { ogImage, TWITTER_HANDLES } from '@/lib/og';
import BeatsClient from './BeatsClient';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'Cyberpunk Trap, Phonk & Synthwave Beats for Sale | Virzy Guns',
    description:
        'Buy and license official Cyberpunk Trap, Phonk, Synthwave, Hard 808, and rap instrumentals by Virzy Guns through the official BeatStars store.',
    keywords: [
        'buy beats online',
        'beats for sale',
        'trap beats for sale',
        'cyberpunk beats for sale',
        'phonk beats for sale',
        'synthwave beats for sale',
        'hard 808 beats',
        'rap instrumentals for sale',
        'exclusive beats for sale',
        'beat licensing',
    ],
    alternates: {
        canonical: `${SITE_URL}/studio/beats`,
        languages: {
            'en-US': `${SITE_URL}/studio/beats`,
            'ja-JP': `${SITE_URL}/ja-JP/studio/beats`,
            'de-DE': `${SITE_URL}/de-DE/studio/beats`,
            'x-default': `${SITE_URL}/studio/beats`,
        },
    },
    openGraph: {
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats for Sale | Virzy Guns',
        description:
            'Browse official instrumentals by Virzy Guns, compare license options, and buy directly through the official BeatStars store.',
        url: `${SITE_URL}/studio/beats`,
        siteName: 'Virzy Guns Production',
        images: [ogImage({ kicker: 'Beat Store', title: 'Beats by Virzy Guns.', sub: '300+ beats. Trap, drill, phonk, synthwave, R&B, club and pop. Licenses from $15.' })],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        ...TWITTER_HANDLES,
        title: 'Cyberpunk Trap, Phonk & Synthwave Beats for Sale | Virzy Guns',
        description: 'Browse official instrumentals, compare licenses, and buy directly through the official BeatStars store.',
        images: [ogImage({ kicker: 'Beat Store', title: 'Beats by Virzy Guns.', sub: '300+ beats. Trap, drill, phonk, synthwave, R&B, club and pop. Licenses from $15.' }).url],
    },
};

const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/studio/beats#collection`,
            name: 'Virzy Guns Beat Store',
            description:
                'Official beat catalog by Virzy Guns for artists looking for Cyberpunk Trap, Phonk, Synthwave, Hard 808, and rap instrumentals.',
            url: `${SITE_URL}/studio/beats`,
        },
        {
            '@type': 'BreadcrumbList',
            '@id': `${SITE_URL}/studio/beats#breadcrumbs`,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: SITE_URL,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Beats',
                    item: `${SITE_URL}/studio/beats`,
                },
            ],
        },
    ],
};

export default function BeatsPage() {
    return (
        <>
            <JsonLd data={hubSchema} />
            <BeatsClient />
        </>
    );
}
