import { BeatProduct, CategoryDef } from '@/lib/catalog';

const SITE_URL = 'https://www.virzyguns.com';

function toAbsoluteUrl(pathOrUrl?: string): string {
    if (!pathOrUrl) return `${SITE_URL}/branding/vgp-logo-chrome-full.png`;
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        return pathOrUrl;
    }
    return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export function generateHreflangs(path: string) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return {
        'en-US': `${SITE_URL}${cleanPath}`,
        'ja-JP': `${SITE_URL}/ja${cleanPath}`,
        'de-DE': `${SITE_URL}/de${cleanPath}`,
        'x-default': `${SITE_URL}${cleanPath}`,
    };
}

export function generateCanonicalUrl(path: string) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_URL}${cleanPath}`;
}

export function generateBeatProductSchema(beat: BeatProduct, locale: 'en-US' | 'ja-JP' | 'de-DE' = 'en-US') {
    const localizedSlug = locale === 'en-US' ? beat.slug : `${locale.split('-')[0]}/${beat.slug}`;
    const canonicalUrl = `${SITE_URL}/studio/beats/${localizedSlug}`;

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
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
            },
            {
                '@type': 'MusicRecording',
                '@id': `${canonicalUrl}#recording`,
                name: beat.title,
                byArtist: {
                    '@type': 'Person',
                    name: 'Virzy Guns',
                    url: `${SITE_URL}/about`,
                },
                duration: beat.durationSeconds ? `PT${beat.durationSeconds}S` : undefined,
                genre: [beat.primaryGenre, ...beat.subgenres],
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${canonicalUrl}#breadcrumbs`,
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
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: beat.title,
                        item: canonicalUrl,
                    },
                ],
            },
        ],
    };
}

export function generateCategorySchema(category: CategoryDef, beats: BeatProduct[], locale: 'en-US' | 'ja-JP' | 'de-DE' = 'en-US') {
    const localizedSlug = locale === 'en-US' ? category.slug : `${locale.split('-')[0]}/${category.slug}`;
    const canonicalUrl = `${SITE_URL}/studio/beats/${localizedSlug}`;

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
                    url: `${SITE_URL}/studio/beats/${beat.slug}`,
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
                        item: SITE_URL,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Beats',
                        item: `${SITE_URL}/studio/beats`,
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

export function generateLicensingSchema() {
    const canonicalUrl = `${SITE_URL}/studio/beats/licensing`;

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Article',
                '@id': `${canonicalUrl}#article`,
                headline: 'Beat Licensing Guide & Terms | Virzy Guns Production',
                description:
                    'Official beat licensing options explained: MP3, WAV, Stems, Unlimited, and Exclusive rights by Virzy Guns.',
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
            {
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
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${canonicalUrl}#breadcrumbs`,
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
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: 'Licensing Guide',
                        item: canonicalUrl,
                    },
                ],
            },
        ],
    };
}
