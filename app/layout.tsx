import type { Metadata } from 'next';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { AppFrame } from '@/components/AppFrame';
import { NewsletterProvider } from '@/components/context/NewsletterContext';
import { headers } from 'next/headers';
import { founderSchema, organizationSchema, websiteSchema } from '@/lib/seo/structured-data';
import { OrganicDiscoveryAnalytics } from '@/components/analytics/OrganicDiscoveryAnalytics';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.virzyguns.com'),
    title: {
        template: '%s | Virzy Guns Production',
        default: 'Virzy Guns Production | Beats, Flow, CADENZ & Producer Education',
    },
    description:
        'Buy premium beats, use Flow for deep work, preview CADENZ cadence music, and learn music production through books, articles, and courses by Virzy Guns.',
    alternates: {
        canonical: '/',
    },
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
    authors: [{ name: 'Virzy Guns', url: 'https://www.virzyguns.com/about' }],
    creator: 'Virzy Guns',
    publisher: 'Virzy Guns Production',
    category: 'music',
    icons: {
        icon: '/branding/logo-tg.jpg',
        shortcut: '/branding/logo-tg.jpg',
        apple: '/branding/logo-tg.jpg',
    },
    openGraph: {
        title: 'Virzy Guns Production | Beats, Flow, CADENZ & Producer Education',
        description:
            'Premium beats, the Flow focus app, CADENZ cadence music, and practical producer education by Virzy Guns.',
        url: 'https://www.virzyguns.com',
        siteName: 'Virzy Guns Production',
        images: [
            {
                url: '/branding/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Virzy Guns Production — beats, Flow, CADENZ and producer education',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Virzy Guns Production | Beats, Flow, CADENZ & Producer Education',
        description:
            'Premium beats, the Flow focus app, CADENZ cadence music, and practical producer education by Virzy Guns.',
        images: ['/branding/og-image.png'],
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const nonce = (await headers()).get('x-nonce') || undefined;

    return (
        <html lang="en" className="lenis" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <script
                    nonce={nonce}
                    suppressHydrationWarning
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                <script
                    nonce={nonce}
                    suppressHydrationWarning
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                <script
                    nonce={nonce}
                    suppressHydrationWarning
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(founderSchema) }}
                />
            </head>
            <body className="bg-background text-white antialiased">
                <div className="wave-physics-bg" aria-hidden="true" />
                <OrganicDiscoveryAnalytics />

                <NewsletterProvider>
                        <SmoothScrollProvider>
                            <LazyMotion features={domAnimation}>
                                <AppFrame>
                                    {children}
                                </AppFrame>
                            </LazyMotion>
                        </SmoothScrollProvider>
                </NewsletterProvider>
            </body>
        </html>
    );
}
