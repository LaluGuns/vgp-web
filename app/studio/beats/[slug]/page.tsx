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
import { getBeatMetaDescription } from '@/lib/seo/beat-copy';
import {
    getEditorialBeatWorld,
    getOfficialBeatStarsGenres,
} from '@/lib/catalog/beatstars-genre-index';

const SITE_URL = 'https://www.virzyguns.com';

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
                canonical: `${SITE_URL}/studio/beats/licensing`,
                languages: {
                    'en-US': `${SITE_URL}/studio/beats/licensing`,
                    'ja-JP': `${SITE_URL}/ja-JP/studio/beats/licensing`,
                    'de-DE': `${SITE_URL}/de-DE/studio/beats/licensing`,
                    'x-default': `${SITE_URL}/studio/beats/licensing`,
                },
            },
        };
    }

    const beat = getBeatBySlug(slug);
    if (beat) {
        const title = beat.localizedTitle?.['en-US'] || beat.title;
        const description = getBeatMetaDescription(beat, 'en-US');
        const editorialWorld = getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
        const officialGenres = getOfficialBeatStarsGenres(beat.beatstarsTrackId);
        return {
            title: `${title} | ${editorialWorld} Beat by Virzy Guns`,
            description,
            robots: beat.seoStatus === 'indexable' ? { index: true, follow: true } : { index: false, follow: true },
            keywords: [
                beat.title,
                editorialWorld,
                ...officialGenres,
                ...beat.tags,
                'buy beats online',
                'Virzy Guns beats',
            ],
            alternates: {
                canonical: `${SITE_URL}/studio/beats/${beat.slug}`,
                languages: {
                    'en-US': `${SITE_URL}/studio/beats/${beat.slug}`,
                    'ja-JP': `${SITE_URL}/ja-JP/studio/beats/${beat.slug}`,
                    'de-DE': `${SITE_URL}/de-DE/studio/beats/${beat.slug}`,
                    'x-default': `${SITE_URL}/studio/beats/${beat.slug}`,
                },
            },
            openGraph: {
                title: `${title} | ${editorialWorld} Beat by Virzy Guns`,
                description,
                url: `${SITE_URL}/studio/beats/${beat.slug}`,
                siteName: 'Virzy Guns Production',
                images: [
                    {
                        url: beat.coverImageUrl || `${SITE_URL}/branding/vgp-logo-chrome-full.png`,
                        width: 1024,
                        height: 1024,
                        alt: beat.title,
                    },
                ],
                type: 'music.song',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${title} | ${editorialWorld} Beat by Virzy Guns`,
                description,
                images: [beat.coverImageUrl || `${SITE_URL}/branding/vgp-logo-chrome-full.png`],
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
                canonical: `${SITE_URL}/studio/beats/${category.slug}`,
                languages: {
                    'en-US': `${SITE_URL}/studio/beats/${category.slug}`,
                    'ja-JP': `${SITE_URL}/ja-JP/studio/beats/${category.slug}`,
                    'de-DE': `${SITE_URL}/de-DE/studio/beats/${category.slug}`,
                    'x-default': `${SITE_URL}/studio/beats/${category.slug}`,
                },
            },
        };
    }

    return {};
}

export default async function SlugPage({ params }: PageProps) {
    const { slug } = await params;

    if (slug === 'licensing') {
        const schema = generateLicensingSchema('en-US');
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <LicensingClient locale="en-US" />
            </>
        );
    }

    const beat = getBeatBySlug(slug);
    if (beat) {
        const schema = generateBeatProductSchema(beat, 'en-US');
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <BeatDetailClient beat={beat} locale="en-US" />
            </>
        );
    }

    const category = getCategoryBySlug(slug);
    if (category) {
        const matchingBeats = getBeatsByCategory(category.slug);
        const schema = generateCategorySchema(category, matchingBeats, 'en-US');
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <CategoryClient category={category} beats={matchingBeats} locale="en-US" />
            </>
        );
    }

    notFound();
}
