import type { Metadata } from 'next';
import { MotionObserver } from '@/components/MotionObserver';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { AppFrame } from '@/components/AppFrame';
import { NewsletterProvider } from '@/components/context/NewsletterContext';
import { headers } from 'next/headers';
import { founderSchema, organizationSchema, websiteSchema } from '@/lib/seo/structured-data';
import { ogImage } from '@/lib/og';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.virzyguns.com'),
    other: {
        'google-adsense-account': 'ca-pub-9018533091343425',
    },
    title: {
        template: '%s | Virzy Guns Production',
        default: 'Virzy Guns | Producer and founder of HealingWave',
    },
    description:
        'Virzy Guns is a producer and the founder of Virzy Guns Production, now building HealingWave: music made to help people focus, move and recover, starting with CADENZ and Flow. Beats and studio services too.',
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
        icon: { url: '/branding/favicon-48.png', sizes: '48x48', type: 'image/png' },
        shortcut: '/branding/favicon-48.png',
        apple: { url: '/branding/apple-touch-icon.png', sizes: '180x180' },
    },
    openGraph: {
        title: 'Virzy Guns | Producer and founder of HealingWave',
        description:
            'Producer turned founder. HealingWave makes music people can use to focus, move and recover.',
        url: 'https://www.virzyguns.com',
        siteName: 'Virzy Guns Production',
        images: [ogImage({ title: 'Music should leave you better than it found you.', sub: 'Producer and founder. Now building HealingWave.' })],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Virzy Guns | Producer and founder of HealingWave',
        description:
            'Producer turned founder. HealingWave makes music people can use to focus, move and recover.',
        images: [ogImage({ title: 'Music should leave you better than it found you.', sub: 'Producer and founder. Now building HealingWave.' }).url],
        site: '@virzyguns',
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
    const requestHeaders = await headers();
    const nonce = requestHeaders.get('x-nonce') || undefined;
    const pathname = requestHeaders.get('x-pathname') || '/';
    const documentLang = pathname.match(/^\/(ja-JP|de-DE)(?:\/|$)/)?.[1] || 'en';

    return (
        <html lang={documentLang} className="lenis" data-scroll-behavior="smooth" suppressHydrationWarning>
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

                <NewsletterProvider>
                        <SmoothScrollProvider>
                            <AppFrame>
                                {children}
                            </AppFrame>
                            <MotionObserver />
                        </SmoothScrollProvider>
                </NewsletterProvider>
            </body>
        </html>
    );
}
