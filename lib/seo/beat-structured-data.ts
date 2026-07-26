import { BeatProduct, CategoryDef } from '@/lib/catalog';
import { getOfficialBeatStarsGenres } from '@/lib/catalog/beatstars-genre-index';

const SITE_URL = 'https://www.virzyguns.com';

function toAbsoluteUrl(pathOrUrl?: string): string {
    if (!pathOrUrl) return `${SITE_URL}/branding/vgp-logo-chrome-full.png`;
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        return pathOrUrl;
    }
    return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function getLocalizedPageUrl(cleanPath: string, locale: 'en-US' | 'ja-JP' | 'de-DE' = 'en-US'): string {
    const pathWithSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    if (locale === 'en-US') {
        return `${SITE_URL}${pathWithSlash}`;
    }
    return `${SITE_URL}/${locale}${pathWithSlash}`;
}

export function generateHreflangs(cleanPath: string) {
    const pathWithSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return {
        'en-US': `${SITE_URL}${pathWithSlash}`,
        'ja-JP': `${SITE_URL}/ja-JP${pathWithSlash}`,
        'de-DE': `${SITE_URL}/de-DE${pathWithSlash}`,
        'x-default': `${SITE_URL}${pathWithSlash}`,
    };
}

export function generateCanonicalUrl(cleanPath: string, locale: 'en-US' | 'ja-JP' | 'de-DE' = 'en-US') {
    return getLocalizedPageUrl(cleanPath, locale);
}

export function generateBeatProductSchema(beat: BeatProduct, locale: 'en-US' | 'ja-JP' | 'de-DE' = 'en-US') {
    const canonicalUrl = getLocalizedPageUrl(`/studio/beats/${beat.slug}`, locale);
    const beatsIndexUrl = getLocalizedPageUrl('/studio/beats', locale);

    const graph: any[] = [];

    // Include Product & Offer schema ONLY when commercial offer data is verified
    if (beat.offerVerification === 'product-page-active' && beat.availability !== 'unknown') {
        graph.push({
            '@type': 'Product',
            '@id': `${canonicalUrl}#product`,
            name: beat.localizedTitle?.[locale] || beat.title,
            description: beat.description[locale] || beat.description['en-US'] || beat.title,
            ...(beat.coverImageUrl ? { image: [toAbsoluteUrl(beat.coverImageUrl)] } : {}),
            brand: {
                '@type': 'Brand',
                name: 'Virzy Guns',
            },
            seller: {
                '@type': 'Organization',
                name: 'Virzy Guns Production',
                url: SITE_URL,
            },
            url: canonicalUrl,
            offers: beat.licenses.map((lic) => ({
                '@type': 'Offer',
                name: `${beat.title} - ${lic.name}`,
                url: canonicalUrl,
                priceCurrency: lic.currency || 'USD',
                price: lic.priceValue.toString(),
                availability:
                    beat.availability === 'available'
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock',
                itemCondition: 'https://schema.org/NewCondition',
            })),
        });
    }

    // Always include MusicRecording schema
    graph.push({
        '@type': 'MusicRecording',
        '@id': `${canonicalUrl}#recording`,
        name: beat.title,
        byArtist: {
            '@type': 'Person',
            name: 'Virzy Guns',
            url: `${SITE_URL}/about`,
        },
        ...(beat.durationSeconds ? { duration: `PT${beat.durationSeconds}S` } : {}),
        // Schema exposes BeatStars' multi-genre taxonomy, not a legacy VGP label.
        genre: getOfficialBeatStarsGenres(beat.beatstarsTrackId).length > 0
            ? getOfficialBeatStarsGenres(beat.beatstarsTrackId)
            : [beat.primaryGenre, ...beat.subgenres],
    });

    // Always include BreadcrumbList schema
    graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumbs`,
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: locale === 'en-US' ? SITE_URL : `${SITE_URL}/${locale}`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Beats',
                item: beatsIndexUrl,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: beat.title,
                item: canonicalUrl,
            },
        ],
    });

    return {
        '@context': 'https://schema.org',
        '@graph': graph,
    };
}

export function generateCategorySchema(
    category: CategoryDef,
    beats: BeatProduct[],
    locale: 'en-US' | 'ja-JP' | 'de-DE' = 'en-US'
) {
    const canonicalUrl = getLocalizedPageUrl(`/studio/beats/${category.slug}`, locale);
    const beatsIndexUrl = getLocalizedPageUrl('/studio/beats', locale);

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${canonicalUrl}#collection`,
                name: category.localizedName[locale] || category.localizedName['en-US'] || category.name,
                description: category.shortDescription[locale] || category.shortDescription['en-US'] || category.name,
                url: canonicalUrl,
            },
            {
                '@type': 'ItemList',
                '@id': `${canonicalUrl}#itemlist`,
                name: category.name,
                numberOfItems: beats.length,
                itemListElement: beats.map((beat, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: getLocalizedPageUrl(`/studio/beats/${beat.slug}`, locale),
                    name: beat.title,
                })),
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${canonicalUrl}#breadcrumbs`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: locale === 'en-US' ? SITE_URL : `${SITE_URL}/${locale}`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Beats',
                        item: beatsIndexUrl,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: category.name,
                        item: canonicalUrl,
                    },
                ],
            },
        ],
    };
}

export function generateLicensingSchema(locale: 'en-US' | 'ja-JP' | 'de-DE' = 'en-US') {
    const canonicalUrl = getLocalizedPageUrl('/studio/beats/licensing', locale);
    const beatsIndexUrl = getLocalizedPageUrl('/studio/beats', locale);

    const localizedTitles = {
        'en-US': 'Beat Licensing Guide & Terms | Virzy Guns Production',
        'ja-JP': 'ビートライセンス利用規約ガイド | Virzy Guns Production',
        'de-DE': 'Beat-Lizenzierungsrichtlinien & Bedingungen | Virzy Guns Production',
    };

    const localizedDescriptions = {
        'en-US': 'Official beat licensing options explained: MP3, WAV, Stems, Unlimited, and Exclusive rights by Virzy Guns.',
        'ja-JP': 'Virzy Gunsによる公式ビートライセンス規約解説：MP3、WAV、トラックステム、無制限商用利用、独占ライセンス権。',
        'de-DE': 'Offizielle Beat-Lizenzierungsoptionen erklärt: MP3, WAV, Stems, Unbegrenzte und Exklusive Rechte von Virzy Guns.',
    };

    const graph: any[] = [
        {
            '@type': 'Article',
            '@id': `${canonicalUrl}#article`,
            headline: localizedTitles[locale],
            description: localizedDescriptions[locale],
            author: {
                '@type': 'Person',
                name: 'Virzy Guns',
                url: `${SITE_URL}/about`,
            },
            publisher: {
                '@type': 'Organization',
                name: 'Virzy Guns Production',
                url: SITE_URL,
            },
            mainEntityOfPage: canonicalUrl,
        },
    ];

    // Emit FAQPage ONLY for en-US where visible English FAQ content matches
    if (locale === 'en-US') {
        graph.push({
            '@type': 'FAQPage',
            '@id': `${canonicalUrl}#faq`,
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'What is the difference between non-exclusive and exclusive beat licenses?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Non-exclusive licenses allow multiple artists to lease and record over the same instrumental under stream and sales limits. An exclusive license transfers full rights to one artist, removes the beat from the public store, and grants unlimited usage.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Can I upload a song recorded over a leased beat to Spotify and Apple Music?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes! All non-exclusive leases (Basic MP3, Basic Pro, Premium, Unlimited) permit commercial streaming releases on Spotify, Apple Music, Tidal, and all digital streaming platforms up to the stream limit of your chosen tier.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Are track stems included with the lease?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Track stems (separated audio channels such as kick, snare, 808, synth, FX) are included with Premium Lease ($50), Unlimited Lease ($100), and Exclusive Rights.',
                    },
                },
            ],
        });
    }

    graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumbs`,
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: locale === 'en-US' ? SITE_URL : `${SITE_URL}/${locale}`,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Beats',
                item: beatsIndexUrl,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: 'Licensing Guide',
                item: canonicalUrl,
            },
        ],
    });

    return {
        '@context': 'https://schema.org',
        '@graph': graph,
    };
}
