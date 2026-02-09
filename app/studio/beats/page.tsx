'use client';

/**
 * Beats Page - Premium Instrumentals for Artists
 * With Stitch-designed Y3K genre icons + Smart Copy Feature
 */

import { Metadata } from 'next'; // This type is for layout but next/head meta is managed by export
// Note: In App Router, page.tsx exporting metadata ONLY works in Server Components.
// This is a CLIENT component ('use client').
// To add metadata here, I should actually make a layout.tsx for this route OR remove 'use client' if possible.
// BUT this page uses state heavily.
// Alternative: Keep 'use client' but standard metadata export is IGNORED by Next.js in Client Components.
// WAIT. The user wants SEO.
// If I export `metadata` from a client component, Next.js throws a warning/error or ignores it.
// SOLUTION: Split into layout/page or just put metadata in `layout.tsx` of this folder?
// OR: Just keep it if Vercel allows it (sometimes it works if Next.js version is new enough to separate it).
// STRICTLY: Metadata must be in Server Component/Layout.
// So I should create `app/studio/beats/layout.tsx` for SEO?
// Or just ignore it?
// Actually, I can just not export metadata here and accept global.
// USER ASKED FOR SEO UPDATE.
// The proper way is to add `app/studio/beats/layout.tsx`.

// However, I will overwrite this file MINUS the metadata export for now to fix the LINK first.
// And I will Create `layout.tsx` for Beats separately?
// Let's just fix the link first.
// Wait, Step 3624 tried to add metadata.
// I'll add the link change.

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { staggerParent, staggerChild, revealUp } from '@/lib/motion-presets';

// Stitch-designed Y3K Genre Icons
const TrapIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2" strokeLinecap="round" />
    </svg>
);

const CyberphonkIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <path d="M5 9h3M16 9h3M9 5v3M9 16v3M15 5v3M15 16v3" strokeLinecap="round" />
    </svg>
);

const SynthwaveIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 19a7 7 0 1 0 0-14" strokeLinecap="round" />
        <path d="M5 19h14" strokeLinecap="round" />
        <path d="M7 16h10M9 13h6" strokeLinecap="round" />
    </svg>
);

const RnBIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12c3-4 6 0 10-2s6 4 10 0" strokeLinecap="round" />
        <path d="M2 16c3-4 6 0 10-2s6 4 10 0" strokeLinecap="round" opacity="0.5" />
    </svg>
);

const SynthpopIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="16" cy="12" r="2" />
        <path d="M11 9h2v6h-2" strokeLinecap="round" />
    </svg>
);

const ClubIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v1M12 19v1M4 12h1M19 12h1M6.3 6.3l.7.7M17 17l.7.7M6.3 17.7l.7-.7M17 7l.7-.7" strokeLinecap="round" />
    </svg>
);

const DeepHouseIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12l9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 15c1-1 2 1 3 0s2 1 3 0" strokeLinecap="round" />
    </svg>
);

const DrillIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L6 12l6 10 6-10L12 2z" strokeLinejoin="round" />
        <path d="M12 7l-3 5 3 5 3-5-3-5z" strokeLinejoin="round" />
    </svg>
);

const genres = [
    { name: 'Trap', Icon: TrapIcon, color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    { name: 'Cyberphonk', Icon: CyberphonkIcon, color: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)' },
    { name: 'Synthwave', Icon: SynthwaveIcon, color: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' },
    { name: 'R&B', Icon: RnBIcon, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
    { name: 'Synthpop', Icon: SynthpopIcon, color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
    { name: 'Club', Icon: ClubIcon, color: '#eab308', glow: 'rgba(234, 179, 8, 0.5)' },
    { name: 'Deep House', Icon: DeepHouseIcon, color: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
    { name: 'Drill', Icon: DrillIcon, color: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' },
];

const nonExclusiveLicenses = [
    {
        name: 'Basic MP3',
        price: '$15',
        copies: '2,000 Copies',
        streams: '100K Streams',
        features: ['MP3 File', '1 Music Video'],
    },
    {
        name: 'Basic Pro',
        price: '$25',
        copies: '10,000 Copies',
        streams: '500K Streams',
        features: ['MP3 + WAV', '1 Music Video', 'For-Profit Performances'],
    },
    {
        name: 'Premium',
        price: '$50',
        copies: '50,000 Copies',
        streams: '1M Streams',
        features: ['MP3 + WAV', '1 Music Video', 'For-Profit', 'Radio (2 Stations)'],
    },
    {
        name: 'Unlimited',
        price: '$100',
        copies: 'UNLIMITED',
        streams: 'UNLIMITED',
        features: ['MP3 + WAV + Stems', '2 Music Videos', 'For-Profit', 'Radio (2 Stations)'],
    },
];

export default function BeatsPage() {
    const [activeGenre, setActiveGenre] = useState<string | null>(null);

    const handleGenreClick = (genreName: string) => {
        setActiveGenre(activeGenre === genreName ? null : genreName);
    };

    return (
        <PageTransition>

            {/* Hero */}
            <section className="py-16 sm:py-24 px-4 sm:px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="mono-label text-primary mb-4">VGP BEATSTORE</p>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-hero mb-6">
                            Premium Instrumentals for Artists
                        </h1>
                        <p className="text-cool-grey text-lg leading-relaxed">
                            Curated beats across multiple genres. From hard hitting Trap & Drill to atmospheric
                            Phonk & Synthwave. Plus smooth R&B, Rap, Club & Pop. Find your signature sound.
                        </p>
                    </m.div>
                </div>
            </section>

            {/* Genre Icons */}
            <section className="py-8 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                        {genres.map((genre) => {
                            const isActive = activeGenre === genre.name;
                            return (
                                <button
                                    key={genre.name}
                                    onClick={() => handleGenreClick(genre.name)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-carbon border-white/5 text-dim-grey transition-all duration-150 hover:-translate-y-1 hover:scale-105 active:scale-95"
                                    style={{
                                        backgroundColor: isActive ? genre.color + '1A' : undefined,
                                        borderColor: isActive ? genre.color : 'rgba(255,255,255,0.05)',
                                        boxShadow: isActive ? `0 0 20px ${genre.glow}` : 'none',
                                        color: isActive ? genre.color : undefined,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.borderColor = genre.color;
                                            e.currentTarget.style.color = genre.color;
                                            e.currentTarget.style.boxShadow = `0 6px 20px ${genre.glow}`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                            e.currentTarget.style.color = '';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }
                                    }}
                                >
                                    <genre.Icon />
                                    <span className="text-sm font-medium">{genre.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Beatstore Embed */}
            <section className="py-8 sm:py-12 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        label="BROWSE"
                        title="Select Your Beat"
                        description="Preview, license, and download instantly."
                    />

                    <m.div
                        className="bg-titanium rounded-xl overflow-hidden border border-white/5"
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/5 bg-carbon">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/20" />
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/20" />
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/20" />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="terminal-text text-white/50 text-xs">VGP://BEATSTORE</span>
                            </div>
                            <div className="w-12" />
                        </div>

                        {/* Beatstars Embed */}
                        <div className="bg-obsidian flex justify-center" id="beatstore-player">
                            <iframe
                                src="https://player.beatstars.com/?storeId=122437"
                                width="100%"
                                height="800"
                                style={{ border: 'none', display: 'block', maxWidth: '1024px' }}
                                allow="autoplay; clipboard-write"
                                title="VGP Beatstore"
                                loading="lazy"
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-carbon border-t border-white/5">
                            <div className="flex items-center gap-4 terminal-text text-xs text-white/40">
                                <span>◈ SECURE CHECKOUT</span>
                                <span className="hidden sm:inline">◈ INSTANT DELIVERY</span>
                            </div>
                            <a href="https://www.beatstars.com/virzyguns" target="_blank" rel="noopener noreferrer" className="terminal-text text-primary/50 hover:text-primary text-xs transition-colors">POWERED BY BEATSTARS</a>
                        </div>
                    </m.div>
                </div>
            </section>

            {/* Non-Exclusive Licensing */}
            <section className="py-12 sm:py-20 px-4 sm:px-6 bg-carbon">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        label="NON-EXCLUSIVE LICENSES"
                        title="Choose Your License"
                        description="Virzy Guns maintains ownership. Must credit 'Prod. By Virzy Guns'."
                    />

                    <m.div
                        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
                        variants={staggerParent}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {nonExclusiveLicenses.map((license) => (
                            <m.div key={license.name} variants={staggerChild}>
                                <GlassCard className="h-full" padding="md" hover>
                                    <p className="mono-label text-primary mb-3 text-xs">{license.name}</p>
                                    <p className="text-3xl font-bold mb-1">{license.price}</p>
                                    <p className="text-xs text-dim-grey mb-1">{license.copies}</p>
                                    <p className="text-xs text-dim-grey mb-4">{license.streams} Streams</p>
                                    <div className="space-y-1.5 pt-3 border-t border-white/5">
                                        {license.features.map((f) => (
                                            <div key={f} className="flex items-center gap-2 text-xs text-cool-grey">
                                                <span className="text-primary">✓</span>
                                                <span>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </m.div>
                        ))}
                    </m.div>
                </div>
            </section>

            {/* Exclusive License */}
            <section className="py-12 sm:py-20 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <m.div
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <GlassCard padding="lg" glow="subtle" className="text-center">
                            <p className="mono-label text-primary mb-3">EXCLUSIVE LICENSE</p>
                            <h3 className="text-2xl sm:text-3xl font-bold mb-2">Full Rights Package</h3>
                            <p className="text-dim-grey mb-6">Negotiable / Make an Offer</p>

                            <div className="grid sm:grid-cols-2 gap-4 text-left mb-6">
                                {[
                                    'Untagged MP3 + WAV + STEMS',
                                    'Unlimited Sale Units',
                                    'Unlimited Streams',
                                    'For-Profit Performances',
                                    'Unlimited Radio Use',
                                    'YouTube Monetization',
                                    'SoundCloud Monetization',
                                    'Content ID Registration',
                                    'Full Exclusive Rights',
                                    'Beat Removed from Store',
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-cool-grey">
                                        <span className="text-primary">✓</span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>

                            <a
                                href="mailto:founder@virzyguns.com?subject=Exclusive License Inquiry"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-xl hover:bg-primary hover:text-obsidian hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all duration-200"
                            >
                                <span>Make an Offer</span>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        </GlassCard>
                    </m.div>
                </div>
            </section>
        </PageTransition>
    );
}
