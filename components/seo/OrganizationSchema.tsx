import Script from 'next/script';

export function OrganizationSchema() {
    const organization = {
        '@context': 'https://schema.org',
        '@type': 'MusicProductionCompany',
        name: 'Virzy Guns Production',
        alternateName: 'VGP',
        url: 'https://virzyguns.com',
        logo: {
            '@type': 'ImageObject',
            url: 'https://virzyguns.com/branding/logo-tg.jpg',
            width: 400,
            height: 400,
        },
        description: 'Virzy Guns Production is a music-tech ecosystem for songs, premium beats, custom production, functional audio, CADENZ, books, and producer education.',
        founder: {
            '@type': 'Person',
            name: 'Virzy Guns',
            jobTitle: 'Top 10% songwriter and top 25% producer, founder of Virzy Guns Production',
            sameAs: 'https://www.linkedin.com/in/virzyguns/',
        },
        sameAs: [
            'https://www.youtube.com/@VirzyGuns',
            'https://www.instagram.com/virzyguns/',
            'https://x.com/virzyguns',
            'https://www.tiktok.com/@virzyguns808',
            'https://www.linkedin.com/in/virzyguns/',
            'https://www.beatstars.com/virzyguns',
        ],
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Beats & Instrumentals',
            url: 'https://virzyguns.com/studio/beats',
        },
    };

    const website = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Virzy Guns Production',
        url: 'https://virzyguns.com',
        description: 'Songs, premium beats, custom production, functional audio, CADENZ, books, and producer education by Virzy Guns.',
        publisher: {
            '@type': 'Organization',
            name: 'Virzy Guns Production',
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://virzyguns.com/blog?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };

    const founder = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Virzy Guns',
        url: 'https://virzyguns.com/about',
        jobTitle: 'Top 10% songwriter and top 25% producer',
        worksFor: {
            '@type': 'Organization',
            name: 'Virzy Guns Production',
            url: 'https://virzyguns.com',
        },
        knowsAbout: [
            'songwriting',
            'music production',
            'beatmaking',
            'mixing and mastering',
            'functional audio',
            'producer education',
        ],
        sameAs: [
            'https://www.youtube.com/@VirzyGuns',
            'https://www.instagram.com/virzyguns/',
            'https://x.com/virzyguns',
            'https://www.tiktok.com/@virzyguns808',
            'https://www.linkedin.com/in/virzyguns/',
            'https://www.beatstars.com/virzyguns',
        ],
    };

    return (
        <>
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
            />
            <Script
                id="website-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
            />
            <Script
                id="founder-person-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(founder) }}
            />
        </>
    );
}
