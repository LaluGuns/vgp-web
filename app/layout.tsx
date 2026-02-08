import type { Metadata } from 'next';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { NavbarWrapper } from '@/components/NavbarWrapper';
import { SocialDock } from '@/components/SocialDock';
import { Footer } from '@/components/sections/Footer';
import { SubscribePopup } from '@/components/SubscribePopup';
import './globals.css';

export const metadata: Metadata = {
    title: 'Virzy Guns Production | Buy Premium Beats Online | HealingWave Functional Audio',
    description: 'Buy exclusive Trap, Cyberphonk, Synthwave, R&B, Synthpop, Club, Deep House, and Drill beats for artists and creators. Explore HealingWave functional audio technology for focus and wellness. Licensed instrumentals for commercial use.',
    keywords: [
        'buy beats online', 'premium beats', 'exclusive instrumentals', 'type beats',
        'trap beats', 'phonk beats', 'cyberphonk beats', 'synthwave beats', 'r&b beats',
        'rap beats', 'hip hop beats', 'pop beats', 'afrobeat', 'reggaeton',
        'synthpop beats', 'club beats', 'deep house beats', 'drill beats',
        'beats for sale', 'license beats', 'instrumental beats',
        'Virzy Guns Production', 'VGP', 'music production',
        'HealingWave', 'functional audio', 'focus music', 'productivity audio',
        'neuro-acoustics', 'binaural beats', 'wellness audio', 'VST plugin', 'clock generator',
        'producer', 'beatmaker', 'music for artists', 'commercial beats'
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="lenis">
            <body className="bg-background text-white antialiased">
                {/* Wave Physics Background */}
                <div className="wave-physics-bg" aria-hidden="true" />

                <SmoothScrollProvider>
                    <LazyMotion features={domAnimation} strict>
                        <NavbarWrapper />
                        <main className="relative z-10 pt-24 pb-16">
                            {children}
                        </main>
                        <Footer />
                        {/* SocialDock moved to home page only */}
                        {/* <SubscribePopup /> */} {/* Disabled - enable when business email is ready */}
                    </LazyMotion>
                </SmoothScrollProvider>
            </body>
        </html>
    );
}
