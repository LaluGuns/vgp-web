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
        default: 'Virzy Guns Production | Premium Beats & Audio',
    },
    description: 'Buy exclusive Trap, Cyberphonk, Synthwave, R&B, Synthpop, Club, Deep House, and Drill beats for artists and creators. Explore HealingWave functional audio technology for focus and wellness. Licensed instrumentals for commercial use.',
    keywords: [
        'buy beats online', 'premium beats', 'exclusive instrumentals', 'type beats',
        'trap beats', 'phonk beats', 'cyberphonk beats', 'synthwave beats', 'r&b beats',
        'rap beats', 'hip hop beats', 'pop beats', 'afrobeat', 'reggaeton',
        'synthpop beats', 'club beats', 'deep house beats', 'drill beats',
        'beats for sale', 'license beats', 'instrumental beats',
        'Virzy Guns Production', 'VGP', 'music production',
        'HealingWave', 'functional audio', 'focus music', 'productivity app',
        'neuroacoustic', 'binaural beats', 'wellness app', 'sleep audio', 'circadian rhythm',
        'producer', 'beatmaker', 'music for artists', 'commercial beats'
    ],
    icons: {
        icon: '/branding/logo-tg.jpg',
        shortcut: '/branding/logo-tg.jpg',
        apple: '/branding/logo-tg.jpg',
    },
    openGraph: {
        title: 'Virzy Guns Production | Premium Beats & HealingWave Audio',
        description: 'Buy exclusive Trap, Cyberphonk, Synthwave, R&B beats for artists and creators. Explore HealingWave functional audio technology.',
        url: 'https://virzyguns.com',
        siteName: 'Virzy Guns Production',
        images: [
            {
                url: '/branding/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Virzy Guns Production Logo',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Virzy Guns Production | Premium Beats & HealingWave Audio',
        description: 'Buy exclusive Trap, Cyberphonk, Synthwave, R&B beats. Explore HealingWave functional audio.',
        images: ['/branding/og-image.jpg'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`lenis ${inter.variable} ${jetbrainsMono.variable}`}>
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
