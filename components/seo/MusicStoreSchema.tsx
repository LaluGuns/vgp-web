import Script from 'next/script';

export function MusicStoreSchema() {
    return (
        <Script id="music-store-schema" type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Store",
                "name": "VGP Beatstore",
                "image": "https://virzyguns.com/branding/og-image.jpg",
                "description": "Buy exclusive Trap, Phonk, Synthwave, and R&B beats. Premium instrumentals for artists with instant licensing.",
                "url": "https://virzyguns.com/studio/beats",
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
