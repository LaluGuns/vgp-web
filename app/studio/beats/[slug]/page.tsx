import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getBeatBySlug,
    getCategoryBySlug,
    getBeatsByCategory,
    beatsCatalog,
    categories,
} from '@/lib/catalog';
import {
    generateBeatProductSchema,
    generateCategorySchema,
    generateLicensingSchema,
} from '@/lib/seo/beat-structured-data';
import BeatDetailClient from '../components/BeatDetailClient';
import CategoryClient from '../components/CategoryClient';
import LicensingClient from '../components/LicensingClient';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const beatSlugs = beatsCatalog.map((b) => ({ slug: b.slug }));
    const categorySlugs = categories.map((c) => ({ slug: c.slug }));
    return [...beatSlugs, ...categorySlugs, { slug: 'licensing' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;

    if (slug === 'licensing') {
        return {
            title: 'Beat Licensing Guide & Terms | Virzy Guns Production',
            description:
                'Official beat licensing options explained: MP3, WAV, Stems, Unlimited, and Exclusive rights by Virzy Guns.',
            keywords: [
                'beat licensing guide',
                'exclusive beat rights',
                'non exclusive beat lease',
                'mp3 wav stems',
                'spotify beat licensing',
            ],
            alternates: {
                canonical: '/studio/beats/licensing',
            },
        };
    }

    const beat = getBeatBySlug(slug);
    if (beat) {
        return {
            title: beat.localizedTitle?.['en-US'] || `${beat.title} | ${beat.primaryGenre} Beat`,
            description: beat.description['en-US'] || '',
            keywords: [
                beat.title,
                beat.primaryGenre,
                ...beat.tags,
                'buy beats online',
                'Virzy Guns beats',
            ],
            alternates: {
                canonical: `/studio/beats/${beat.slug}`,
            },
            openGraph: {
                title: beat.title,
                description: beat.description['en-US'] || '',
                url: `https://www.virzyguns.com/studio/beats/${beat.slug}`,
                siteName: 'Virzy Guns Production',
                images: [
                    {
                        url: beat.coverImageUrl || '/branding/vgp-logo-chrome-full.png',
                        width: 1024,
                        height: 1024,
                        alt: beat.title,
                    },
                ],
                type: 'music.song',
            },
        };
    }

    const category = getCategoryBySlug(slug);
    if (category) {
        return {
            title: category.localizedName['en-US'] || `${category.name} | Virzy Guns`,
            description: category.shortDescription['en-US'] || '',
            keywords: category.keywords['en-US'] || [],
            alternates: {
                canonical: `/studio/beats/${category.slug}`,
            },
        };
    }

    return {};
}

export default async function SlugPage({ params }: PageProps) {
    const { slug } = await params;

    if (slug === 'licensing') {
        const schema = generateLicensingSchema();
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <LicensingClient />
            </>
        );
    }

    const beat = getBeatBySlug(slug);
    if (beat) {
        const schema = generateBeatProductSchema(beat);
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <BeatDetailClient beat={beat} />
            </>
        );
    }

    const category = getCategoryBySlug(slug);
    if (category) {
        const matchingBeats = getBeatsByCategory(category.slug);
        const schema = generateCategorySchema(category, matchingBeats);
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <CategoryClient category={category} beats={matchingBeats} />
            </>
        );
    }

    notFound();
}
