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
import BeatDetailClient from '../../../../studio/beats/components/BeatDetailClient';
import CategoryClient from '../../../../studio/beats/components/CategoryClient';
import LicensingClient from '../../../../studio/beats/components/LicensingClient';
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
            title: 'ビートライセンス利用規約ガイド | Virzy Guns Production',
            description:
                'Virzy Gunsによる公式ビートライセンス規約解説：MP3、WAV、トラックステム、無制限商用利用、独占ライセンス権。',
            keywords: [
                'ビートライセンス利用規約',
                '独占ライセンス権',
                '非独占ビートリース',
                'MP3 WAV ステム',
                '商用利用ビート',
            ],
            alternates: {
                canonical: `${SITE_URL}/ja-JP/studio/beats/licensing`,
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
        const description = getBeatMetaDescription(beat, 'ja-JP');
        const editorialWorld = getEditorialBeatWorld(beat.beatstarsTrackId) || beat.primaryGenre;
        const officialGenres = getOfficialBeatStarsGenres(beat.beatstarsTrackId);
        return {
            title: beat.localizedTitle?.['ja-JP'] || `${beat.title} | ${editorialWorld} ビート`,
            description,
            robots: beat.seoStatus === 'indexable' ? { index: true, follow: true } : { index: false, follow: true },
            keywords: [
                beat.title,
                editorialWorld,
                ...officialGenres,
                ...beat.tags,
                'ビート販売',
                'Virzy Guns',
            ],
            alternates: {
                canonical: `${SITE_URL}/ja-JP/studio/beats/${beat.slug}`,
                languages: {
                    'en-US': `${SITE_URL}/studio/beats/${beat.slug}`,
                    'ja-JP': `${SITE_URL}/ja-JP/studio/beats/${beat.slug}`,
                    'de-DE': `${SITE_URL}/de-DE/studio/beats/${beat.slug}`,
                    'x-default': `${SITE_URL}/studio/beats/${beat.slug}`,
                },
            },
            openGraph: {
                title: beat.title,
                description,
                url: `${SITE_URL}/ja-JP/studio/beats/${beat.slug}`,
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
                title: beat.localizedTitle?.['ja-JP'] || beat.title,
                description,
                images: [beat.coverImageUrl || `${SITE_URL}/branding/vgp-logo-chrome-full.png`],
            },
        };
    }

    const category = getCategoryBySlug(slug);
    if (category) {
        return {
            title: category.localizedName['ja-JP'] || `${category.name} | Virzy Guns`,
            description: category.shortDescription['ja-JP'] || category.shortDescription['en-US'] || '',
            keywords: category.keywords['ja-JP'] || [],
            alternates: {
                canonical: `${SITE_URL}/ja-JP/studio/beats/${category.slug}`,
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

export default async function JapaneseSlugPage({ params }: PageProps) {
    const { slug } = await params;

    if (slug === 'licensing') {
        const schema = generateLicensingSchema('ja-JP');
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <LicensingClient locale="ja-JP" />
            </>
        );
    }

    const beat = getBeatBySlug(slug);
    if (beat) {
        const schema = generateBeatProductSchema(beat, 'ja-JP');
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <BeatDetailClient beat={beat} locale="ja-JP" />
            </>
        );
    }

    const category = getCategoryBySlug(slug);
    if (category) {
        const matchingBeats = getBeatsByCategory(category.slug);
        const schema = generateCategorySchema(category, matchingBeats, 'ja-JP');
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
                <CategoryClient category={category} beats={matchingBeats} locale="ja-JP" />
            </>
        );
    }

    notFound();
}
