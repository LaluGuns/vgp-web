/**
 * Single source of truth for site-wide JSON-LD.
 *
 * All three nodes are emitted once, site-wide, from the root layout, as plain
 * <script> tags carrying the CSP nonce.
 *
 * They must stay there. The previous `OrganizationSchema` component used
 * `next/script`, which never injected these nodes at all — production served
 * only the thin inline Organization from the layout, so the rich version was
 * dead code. Anything rendered through `next/script` here will silently vanish.
 *
 * Do not redeclare these objects anywhere else — two Organization or WebSite
 * nodes on the same page give Google conflicting entity signals.
 */

const SITE_URL = 'https://www.virzyguns.com';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const FOUNDER_ID = `${SITE_URL}/#founder`;

/** Public profiles for the company entity. Keep canonical (www + exact handle casing). */
const VIRZY_GUNS_SPOTIFY_URL = 'https://open.spotify.com/artist/13PhVfASmYQp8asSheyAxD';
const profiles = [
    'https://www.youtube.com/@VirzyGuns',
    'https://www.instagram.com/virzyguns/',
    'https://x.com/virzyguns',
    'https://www.tiktok.com/@virzyguns808',
    'https://www.linkedin.com/in/virzyguns/',
    'https://www.beatstars.com/virzyguns',
];

/** Artist-owned profiles are separate from the production organization. */
const virzyArtistProfiles = [
    ...profiles,
    VIRZY_GUNS_SPOTIFY_URL,
];

export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'Virzy Guns Production',
    alternateName: 'VGP',
    url: SITE_URL,
    logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/branding/vgp-logo-chrome-full.png`,
        width: 1024,
        height: 1024,
    },
    description:
        'Virzy Guns Production is a music-tech ecosystem for songs, premium beats, custom production, functional audio, Flow, CADENZ, books, games, and producer education.',
    founder: {
        '@id': FOUNDER_ID,
    },
    sameAs: [...profiles, VIRZY_GUNS_SPOTIFY_URL],
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        '@id': `${SITE_URL}/products#catalog`,
        name: 'Virzy Guns Production Product Catalog',
        url: `${SITE_URL}/products`,
        itemListElement: [
            {
                '@type': 'OfferCatalog',
                name: 'Released Music',
                url: `${SITE_URL}/products/music`,
            },
            {
                '@type': 'OfferCatalog',
                name: 'Beats & Instrumentals',
                url: `${SITE_URL}/studio/beats`,
            },
            {
                '@type': 'OfferCatalog',
                name: 'Apps, Functional Audio, Books, Courses & Games',
                url: `${SITE_URL}/products`,
            },
        ],
    },
};

/**
 * No SearchAction: a sitelinks searchbox requires a working search endpoint,
 * and the site has none (`/search` does not exist and `/blog` ignores `?q=`).
 * Declaring a broken one is worse than declaring none.
 */
export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'Virzy Guns Production',
    url: SITE_URL,
    description:
        'Songs, premium beats, custom production, functional audio, Flow, CADENZ, books, games, and producer education by Virzy Guns.',
    publisher: {
        '@id': ORGANIZATION_ID,
    },
};

export const founderSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': FOUNDER_ID,
    name: 'Virzy Guns',
    url: `${SITE_URL}/about`,
    jobTitle: 'Founder and creative director of Virzy Guns Production',
    worksFor: {
        '@id': ORGANIZATION_ID,
    },
    knowsAbout: [
        'songwriting',
        'music production',
        'beatmaking',
        'mixing and mastering',
        'functional audio',
        'producer education',
        'music technology',
    ],
    sameAs: virzyArtistProfiles,
};
