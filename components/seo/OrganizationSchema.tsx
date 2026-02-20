import Script from 'next/script';

export function OrganizationSchema() {
    return (
        <Script id="organization-schema" type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "MusicProductionCompany",
                "name": "Virzy Guns Production",
                "url": "https://virzyguns.com",
                "logo": "https://virzyguns.com/branding/logo-tg.jpg",
                "founder": {
                    "@type": "Person",
                    "name": "Virzy Guns"
                },
                "sameAs": [
                    "https://www.youtube.com/@VirzyGuns",
                    "https://www.instagram.com/virzyguns/",
                    "https://x.com/virzyguns",
                    "https://www.tiktok.com/@virzyguns808",
                    "https://www.linkedin.com/in/virzyguns/",
                    "https://www.beatstars.com/virzyguns"
                ]
            })
        }} />
    );
}
