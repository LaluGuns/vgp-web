'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { revealUp, staggerChild, staggerParent } from '@/lib/motion-presets';
import { catalogCredentials } from '@/lib/vgp-ecosystem';

const catalogStyles = [
    {
        name: 'All styles',
        description: 'The complete Virzy Guns catalog across rap, electronic, R&B, and club production.',
    },
    {
        name: 'Trap',
        description: 'Heavy 808s, sharp drum movement, and open arrangements built for vocal performance.',
    },
    {
        name: 'Phonk',
        description: 'Distorted low end, chopped textures, and hard-edged rhythm with underground character.',
    },
    {
        name: 'Synthwave',
        description: 'Cinematic synths, driving basslines, and widescreen retro-futurist atmosphere.',
    },
    {
        name: 'R&B',
        description: 'Spacious drums, melodic harmony, and warm pockets designed around the voice.',
    },
    {
        name: 'Synthpop',
        description: 'Hook-forward electronic production with polished drums and bright melodic detail.',
    },
    {
        name: 'Club',
        description: 'Direct, energetic records built around movement, impact, and repeatable hooks.',
    },
    {
        name: 'Deep House',
        description: 'Deep grooves, restrained percussion, and immersive late-night electronic textures.',
    },
    {
        name: 'Drill',
        description: 'Sliding bass, tense melodies, and syncopated drums with space for commanding vocals.',
    },
];

const nonExclusiveLicenses = [
    {
        name: 'Basic MP3',
        price: '$15',
        copies: '2,000 Copies',
        streams: '100K',
        features: ['MP3 File', '1 Music Video'],
    },
    {
        name: 'Basic Pro',
        price: '$25',
        copies: '10,000 Copies',
        streams: '500K',
        features: ['MP3 + WAV', '1 Music Video', 'For-Profit Performances'],
    },
    {
        name: 'Premium',
        price: '$50',
        copies: '50,000 Copies',
        streams: '1M',
        features: ['MP3 + WAV', '1 Music Video', 'For-Profit', 'Radio (2 Stations)'],
    },
    {
        name: 'Unlimited',
        price: '$100',
        copies: 'Unlimited',
        streams: 'Unlimited',
        features: ['MP3 + WAV + Stems', '2 Music Videos', 'For-Profit', 'Radio (2 Stations)'],
    },
];

const beatstarsProfileUrl = 'https://www.beatstars.com/virzyguns';
const beatstarsTracksUrl = 'https://www.beatstars.com/virzyguns/tracks';
const instagramDmUrl = 'https://ig.me/m/virzyguns';

const getVirzyGunsCatalogUrl = (genreName: string) => {
    if (genreName === 'All styles') return beatstarsTracksUrl;
    return `${beatstarsTracksUrl}?q=${encodeURIComponent(genreName)}`;
};

export default function BeatsClient() {
    const [activeGenre, setActiveGenre] = useState(catalogStyles[0].name);
    const activeCatalog = catalogStyles.find((genre) => genre.name === activeGenre) ?? catalogStyles[0];

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <PageHeader
                    eyebrow="VGP Studio / Beats"
                    title="Premium beats"
                    mutedTitle="for working artists."
                    description="Beats by Virzy Guns, plus custom production, mixing, mastering, and sound design."
                />

                <SectionShell id="credentials" className="border-y border-white/[0.08] bg-white/[0.012] py-12 sm:py-14">
                    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200/55">
                                Verified track record
                            </p>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                Production proof behind the catalog.
                            </h2>
                            <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
                                Independent credits verified through MUSO.AI, placed here where the production record matters most.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                            {catalogCredentials.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group border-t border-white/[0.1] pt-4 transition hover:border-sky-200/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
                                >
                                    <p className="text-2xl font-semibold leading-none text-white">{item.value}</p>
                                    <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-white/55 transition group-hover:text-sky-100">
                                        {item.label}
                                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                <SectionShell id="catalog-focus" className="pb-10 pt-2 sm:pb-12">
                    <div className="mx-auto max-w-5xl">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">Catalog focus</p>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">Find the right production lane.</h2>
                            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                                Choose a style and the Virzy Guns BeatStars catalog opens with that search already applied. The full catalog stays embedded below.
                            </p>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Catalog focus">
                            {catalogStyles.map((genre) => {
                                const isActive = activeGenre === genre.name;

                                return (
                                    <a
                                        key={genre.name}
                                        href={getVirzyGunsCatalogUrl(genre.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-current={isActive ? 'true' : undefined}
                                        onClick={() => setActiveGenre(genre.name)}
                                        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030405] sm:px-4 ${
                                            isActive
                                                ? 'border-sky-200/45 bg-sky-300/[0.12] text-sky-100'
                                                : 'border-white/10 bg-white/[0.025] text-white/70 hover:border-white/25 hover:bg-white/[0.05] hover:text-white'
                                        }`}
                                    >
                                        {genre.name}
                                        <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                                    </a>
                                );
                            })}
                        </div>

                        <div
                            className="mt-6 border-y border-white/[0.08] py-5 sm:flex sm:items-start sm:justify-between sm:gap-8"
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            <div className="shrink-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/60">Last BeatStars search</p>
                                <p className="mt-2 text-lg font-semibold text-white">{activeCatalog.name}</p>
                            </div>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:mt-0 sm:text-right">
                                {activeCatalog.description}
                            </p>
                        </div>
                    </div>
                </SectionShell>

                <SectionShell id="beat-catalog" className="pt-8">
                    <div className="mx-auto max-w-5xl">
                        <m.div
                            className="overflow-hidden rounded-lg border border-white/[0.1] bg-black/20"
                            variants={revealUp}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/60">BeatStars catalog</p>
                                    <h2 className="mt-1 text-lg font-semibold text-white">Embedded VGP catalog</h2>
                                </div>
                                <a
                                    href={beatstarsProfileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white/70 transition hover:border-sky-200/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 sm:min-h-0 sm:self-auto"
                                >
                                    Open full catalog
                                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                            </div>

                            <div className="bg-[#030405]" id="beatstore-player">
                                <iframe
                                    src="https://player.beatstars.com/?storeId=122437"
                                    className="block h-[680px] w-full sm:h-[760px] lg:h-[800px]"
                                    allow="autoplay; clipboard-write"
                                    title="VGP Beat Store catalog on BeatStars"
                                    loading="lazy"
                                />
                            </div>

                            <div className="flex flex-col gap-1 border-t border-white/[0.08] px-4 py-3 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                <span>Secure checkout and instant delivery</span>
                                <span>Powered by BeatStars</span>
                            </div>
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell className="border-y border-white/[0.08] bg-white/[0.015]">
                    <div className="mx-auto max-w-5xl">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">Non-exclusive licenses</p>
                            <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Choose a release tier.</h2>
                            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                                Virzy Guns maintains ownership. Credit must read &quot;Prod. By Virzy Guns&quot;.
                            </p>
                        </div>

                        <m.div
                            className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {nonExclusiveLicenses.map((license) => (
                                <m.article
                                    key={license.name}
                                    variants={staggerChild}
                                    className="flex h-full flex-col rounded-lg border border-white/[0.1] bg-white/[0.025] p-5"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/70">{license.name}</p>
                                    <p className="mt-4 text-3xl font-semibold text-white">{license.price}</p>
                                    <div className="mt-4 space-y-1 text-sm text-white/60">
                                        <p>{license.copies}</p>
                                        <p>{license.streams} streams</p>
                                    </div>
                                    <div className="mt-5 flex-1 space-y-2 border-t border-white/[0.08] pt-4">
                                        {license.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-white/70">
                                                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-200" aria-hidden="true" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <a
                                        href={beatstarsTracksUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Choose a beat for the ${license.name} license on BeatStars`}
                                        className="mt-6 inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-sky-200/25 bg-sky-300/[0.07] px-3 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-200/45 hover:bg-sky-300/[0.11] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
                                    >
                                        Choose on BeatStars
                                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                </m.article>
                            ))}
                        </m.div>
                    </div>
                </SectionShell>

                <SectionShell id="private-commissions">
                    <m.div
                        className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start"
                        variants={revealUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">Private commissions</p>
                            <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">Exclusive rights or a custom record.</h2>
                            <p className="mt-4 text-base leading-7 text-white/70">Use DM only for work that needs a direct conversation: exclusive ownership or production built from scratch.</p>
                            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                                <a
                                    href={instagramDmUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-sky-200/30 bg-sky-300/[0.08] px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-sky-200/50 hover:bg-sky-300/[0.13] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030405]"
                                >
                                    DM for exclusive rights
                                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                                <a
                                    href={instagramDmUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030405]"
                                >
                                    DM for a custom beat
                                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                            </div>
                        </div>

                        <div className="grid gap-x-6 gap-y-3 border-t border-white/[0.08] pt-6 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/55">Exclusive package includes</p>
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
                                'Beat removed from public store',
                            ].map((item) => (
                                <div key={item} className="flex items-start gap-2 text-sm leading-6 text-white/70">
                                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-200" aria-hidden="true" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </m.div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
