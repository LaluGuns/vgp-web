import type { Metadata } from 'next';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { AppFrame } from '@/components/AppFrame';
import { Footer } from '@/components/sections/Footer';
import { SubscribePopup } from '@/components/SubscribePopup';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { NewsletterProvider } from '@/components/context/NewsletterContext';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://virzyguns.com'),
    title: {
        template: '%s | Virzy Guns Production',
        default: 'Virzy Guns Production | Beats, Songs, Functional Audio',
    },
    description:
        'Virzy Guns Production is the music-tech ecosystem of Virzy Guns, ranked top 10% songwriter and top 25% producer, building songs, premium beats, functional audio, CADENZ, books, and producer education.',
    keywords: [
        'Virzy Guns',
        'Virzy Guns Production',
        'top 10% songwriter',
        'top 25% producer',
        'top songwriter producer',
        'songwriter producer',
        'buy beats online',
        'premium beats',
        'beats by Virzy Guns',
        'exclusive instrumentals',
        'type beats',
        'trap beats',
        'phonk beats',
        'cyberphonk beats',
        'synthwave beats',
        'r&b beats',
        'rap beats',
        'hip hop beats',
        'pop beats',
        'synthpop beats',
        'club beats',
        'deep house beats',
        'drill beats',
        'beats for sale',
        'license beats',
        'music production',
        'music producer',
        'songwriter',
        'HealingWave',
        'functional audio',
        'focus music',
        'CADENZ',
        'cadence music',
        'producer education',
        'beatmaker',
        '100% Art 100% Science',
    ],
    authors: [{ name: 'Virzy Guns', url: 'https://virzyguns.com/about' }],
    creator: 'Virzy Guns',
    publisher: 'Virzy Guns Production',
    category: 'music',
    icons: {
        icon: '/branding/logo-tg.jpg',
        shortcut: '/branding/logo-tg.jpg',
        apple: '/branding/logo-tg.jpg',
    },
    openGraph: {
        title: 'Virzy Guns Production | Beats, Songs, Functional Audio',
        description:
            'Songs, premium beats, custom production, functional audio, CADENZ, books, and producer education by Virzy Guns.',
        url: 'https://virzyguns.com',
        siteName: 'Virzy Guns Production',
        images: [
            {
                url: '/branding/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Virzy Guns Production | 100% Art. 100% Science.',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Virzy Guns Production | Beats, Songs, Functional Audio',
        description:
            'Songs, premium beats, custom production, functional audio, CADENZ, books, and producer education by Virzy Guns.',
        images: ['/branding/og-image.jpg'],
        creator: '@virzyguns',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: '/',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Virzy Guns Production',
        url: 'https://virzyguns.com',
        description: 'Songs, premium beats, custom production, functional audio, CADENZ, books, and producer education by Virzy Guns.',
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://virzyguns.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    };

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Virzy Guns Production',
        url: 'https://virzyguns.com',
        logo: 'https://virzyguns.com/branding/logo-tg.png',
        founder: {
            '@type': 'Person',
            name: 'Virzy Guns',
            jobTitle: 'Top 10% songwriter and top 25% producer',
        },
        sameAs: [
            'https://youtube.com/@virzyguns',
            'https://instagram.com/virzyguns',
        ],
    };

    return (
        <html lang="en" className="lenis">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                />
            </head>
            <body className="bg-background text-white antialiased">
                <div className="wave-physics-bg" aria-hidden="true" />

                <NewsletterProvider>
                    <SmoothScrollProvider>
                        <LazyMotion features={domAnimation}>
                            <AppFrame>
                                {children}
                            </AppFrame>
                            <Footer />
                            <SubscribePopup />
                            <MobileBottomNav />
                        </LazyMotion>
                    </SmoothScrollProvider>
                </NewsletterProvider>
            </body>
        </html>
    );
}
