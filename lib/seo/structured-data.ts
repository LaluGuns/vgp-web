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

/** Public profiles for the company entity. Keep canonical (www + exact handle casing). */
const profiles = [
    'https://www.youtube.com/@VirzyGuns',
    'https://www.instagram.com/virzyguns/',
    'https://x.com/virzyguns',
    'https://www.tiktok.com/@virzyguns808',
    'https://www.linkedin.com/in/virzyguns/',
    'https://www.beatstars.com/virzyguns',
    'https://open.spotify.com/artist/21bxd77KSj9RR6vAqW5Hvy',
];

export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'MusicProductionCompany',
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
        'Virzy Guns Production is a music-tech ecosystem for songs, premium beats, custom production, functional audio, Flow, CADENZ, books, and producer education.',
    founder: {
        '@type': 'Person',
        name: 'Virzy Guns',
        jobTitle: 'Founder and creative director of Virzy Guns Production',
        sameAs: 'https://www.linkedin.com/in/virzyguns/',
    },
    sameAs: profiles,
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Beats & Instrumentals',
        url: `${SITE_URL}/studio/beats`,
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
    name: 'Virzy Guns Production',
    url: SITE_URL,
    description:
        'Songs, premium beats, custom production, functional audio, Flow, CADENZ, books, and producer education by Virzy Guns.',
    publisher: {
        '@type': 'Organization',
        name: 'Virzy Guns Production',
    },
};

export const founderSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Virzy Guns',
    url: `${SITE_URL}/about`,
    jobTitle: 'Founder and creative director of Virzy Guns Production',
    worksFor: {
        '@type': 'Organization',
        name: 'Virzy Guns Production',
        url: SITE_URL,
    },
    knowsAbout: [
        'songwriting',
        'music production',
        'beatmaking',
        'mixing and mastering',
        'functional audio',
        'producer education',
    ],
    sameAs: profiles,
};
