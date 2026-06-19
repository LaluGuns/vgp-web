import Script from 'next/script';

export function MusicStoreSchema() {
    return (
        <Script id="music-store-schema" type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Store",
                "name": "VGP Beat Store",
                "image": "https://www.virzyguns.com/branding/vgp-logo-chrome-full.png",
                "description": "Premium beats, non-exclusive licenses, exclusive license inquiries, and audio services by Virzy Guns Production.",
                "url": "https://www.virzyguns.com/studio/beats",
                "priceRange": "$15 - $100",
                "offers": {
                    "@type": "AggregateOffer",
                    "priceCurrency": "USD",
                    "lowPrice": "15.00",
                    "highPrice": "100.00",
                    "offerCount": "50"
                }
            })
        }} />
    );
}
