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
        description: 'Premium music production, beats, and functional audio technology. 100% Art. 100% Science.',
        founder: {
            '@type': 'Person',
            name: 'Virzy Guns',
            jobTitle: 'Music Producer & Audio Technologist',
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
        description: '100% Art. 100% Science. Premium beats, music production education, and functional audio technology.',
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
        </>
    );
}
