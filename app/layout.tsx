import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { NavbarWrapper } from '@/components/NavbarWrapper';
import { SocialDock } from '@/components/SocialDock';
import { CustomCursor } from '@/components/CustomCursor';
import { Footer } from '@/components/sections/Footer';
import { SubscribePopup } from '@/components/SubscribePopup';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { NewsletterProvider } from '@/components/context/NewsletterContext';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://virzyguns.com'),
    title: {
        template: '%s | Virzy Guns Production',
        default: 'Virzy Guns Production — 100% Art. 100% Science.',
    },
    description: 'Premium trap, cyberphonk, synthwave, R&B, and drill beats for artists. Buy exclusive and non-exclusive licenses from $15. Explore HealingWave functional audio technology for focus, performance, and wellness. 100% Art. 100% Science.',
    keywords: [
        'buy beats online', 'premium beats', 'exclusive instrumentals', 'type beats',
        'trap beats', 'phonk beats', 'cyberphonk beats', 'synthwave beats', 'r&b beats',
        'rap beats', 'hip hop beats', 'pop beats', 'synthpop beats', 'club beats',
        'deep house beats', 'drill beats', 'beats for sale', 'license beats',
        'Virzy Guns Production', 'VGP', 'music production', 'music producer',
        'HealingWave', 'functional audio', 'focus music', 'binaural beats',
        'wellness app', 'neuroacoustic', 'productivity music', 'beatmaker',
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
        title: 'Virzy Guns Production — 100% Art. 100% Science.',
        description: 'Premium beats for artists. Exclusive Trap, Cyberphonk, Synthwave, R&B, Drill instrumentals + HealingWave functional audio technology.',
        url: 'https://virzyguns.com',
        siteName: 'Virzy Guns Production',
        images: [
            {
                url: '/branding/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Virzy Guns Production — 100% Art. 100% Science.',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Virzy Guns Production — 100% Art. 100% Science.',
        description: 'Premium beats for artists. Exclusive Trap, Cyberphonk, Synthwave, R&B + HealingWave functional audio.',
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
        description: '100% Art. 100% Science. Premium trap, cyberphonk, synthwave, R&B, and drill beats.',
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
        sameAs: [
            'https://youtube.com/@virzyguns',
            'https://instagram.com/virzyguns',
        ]
    };

    return (
        <html lang="en" className={`lenis ${inter.variable} ${jetbrainsMono.variable}`}>
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
                {/* Wave Physics Background */}
                <div className="wave-physics-bg" aria-hidden="true" />

                <NewsletterProvider>
                    <SmoothScrollProvider>
                        <LazyMotion features={domAnimation}>
                            <NavbarWrapper />
                            <main className="relative z-10 pt-24 pb-24 md:pb-16">
                                {children}
                            </main>
                            <Footer />
                            {/* SocialDock moved to home page only */}
                            <SubscribePopup />
                            <MobileBottomNav />
                        </LazyMotion>
                    </SmoothScrollProvider>
                </NewsletterProvider>
            </body>
        </html>
    );
}
