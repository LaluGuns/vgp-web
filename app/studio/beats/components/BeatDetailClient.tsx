'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Check, ExternalLink } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell } from '@/components/editorial/EditorialPrimitives';
import { revealUp } from '@/lib/motion-presets';
import { BeatProduct, getBeatsByCategory } from '@/lib/catalog';
import { trackBeatEvent } from '@/lib/analytics';

interface BeatDetailClientProps {
    beat: BeatProduct;
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

export default function BeatDetailClient({ beat, locale = 'en-US' }: BeatDetailClientProps) {
    const [selectedLicense, setSelectedLicense] = useState(beat.licenses[0] || beat.licenses[1]);
    const relatedBeats = getBeatsByCategory(beat.primaryGenre.toLowerCase().replace(/ /g, '-'))
        .filter((b) => b.id !== beat.id)
        .slice(0, 3);

    const description = beat.description[locale] || beat.description['en-US'] || '';

    const handleCheckoutClick = (licenseName: string, price: string) => {
        trackBeatEvent('beatstars_checkout_click', {
            beatId: beat.id,
            beatSlug: beat.slug,
            beatTitle: beat.title,
            licenseName,
            displayedPrice: price,
            destinationUrl: beat.beatstarsProductUrl,
        });
    };

    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    const playerTitle = locale === 'ja-JP' ? '公式ビート試聴' : locale === 'de-DE' ? 'Offizieller Beat-Player' : 'Play This Beat';
    const playerSub = locale === 'ja-JP' ? '公式BeatStarsプレイヤー' : locale === 'de-DE' ? 'Offizieller BeatStars Player' : 'Official Beat Preview';

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white pt-24 pb-20">
                {/* Language Selector & Breadcrumbs */}
                <div className="mx-auto max-w-5xl px-6 mb-8 flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <Link href={getLocalePath('/')} className="hover:text-white transition">Home</Link>
                        <span>/</span>
                        <Link href={getLocalePath('/studio/beats')} className="hover:text-white transition">Beats</Link>
                        <span>/</span>
                        <span className="text-sky-200/80">{beat.title}</span>
                    </nav>

                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Link href={`/studio/beats/${beat.slug}`} className={`hover:text-white transition ${locale === 'en-US' ? 'text-sky-200 font-bold' : ''}`}>EN</Link>
                        <span>|</span>
                        <Link href={`/ja-JP/studio/beats/${beat.slug}`} className={`hover:text-white transition ${locale === 'ja-JP' ? 'text-sky-200 font-bold' : ''}`}>JA</Link>
                        <span>|</span>
                        <Link href={`/de-DE/studio/beats/${beat.slug}`} className={`hover:text-white transition ${locale === 'de-DE' ? 'text-sky-200 font-bold' : ''}`}>DE</Link>
                    </div>
                </div>

                {/* Hero Product Stage */}
                <SectionShell id="beat-hero" className="py-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                            {/* Left: Cover Art & Integrated Track Player */}
                            <m.div
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-5"
                                variants={revealUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40 border border-white/10">
                                    <Image
                                        src={beat.coverImageUrl || '/branding/vgp-logo-chrome-full.png'}
                                        alt={`${beat.title} cover artwork`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 400px"
                                        className="object-cover"
                                        priority
                                    />
                                </div>

                                {/* Official Track-Specific BeatStars Player Widget */}
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60">
                                    <div className="border-b border-white/10 px-3 py-2 text-[11px] font-medium text-white/60 flex justify-between">
                                        <span>{playerTitle}</span>
                                        <span>{playerSub}</span>
                                    </div>
                                    {beat.beatstarsTrackId ? (
                                        <iframe
                                            src={`https://www.beatstars.com/embed/track?id=${beat.beatstarsTrackId}`}
                                            className="block h-[165px] w-full border-none"
                                            allow="autoplay; encrypted-media; fullscreen"
                                            title={`${beat.title} official BeatStars player`}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <iframe
                                            src="https://player.beatstars.com/?storeId=122437"
                                            className="block h-[220px] w-full border-none"
                                            allow="autoplay; clipboard-write"
                                            title={`${beat.title} full store player`}
                                            loading="lazy"
                                        />
                                    )}
                                </div>

                                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/50">
                                    <span>Producer: <strong className="text-white">{beat.producer}</strong></span>
                                    <span>Powered by BeatStars</span>
                                </div>
                            </m.div>

                            {/* Right: Beat Info & License Selector */}
                            <m.div variants={revealUp} initial="hidden" animate="visible" className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full border border-sky-200/30 bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-200">
                                            {beat.primaryGenre}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                                            Instant License Delivery
                                        </span>
                                    </div>
                                    <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                        {beat.title}
                                    </h1>
                                    <p className="mt-3 text-base leading-7 text-white/70">
                                        {description}
                                    </p>
                                </div>

                                {/* License Selection Matrix */}
                                <div className="space-y-3">
                                    <p className="text-xs uppercase tracking-widest text-sky-200/70 font-semibold">Select Release Tier</p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {beat.licenses.map((lic) => {
                                            const isSelected = selectedLicense.id === lic.id;
                                            return (
                                                <button
                                                    key={lic.id}
                                                    onClick={() => setSelectedLicense(lic)}
                                                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                                                        isSelected
                                                            ? 'border-sky-200/60 bg-sky-300/[0.12] text-white shadow-lg'
                                                            : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04]'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-sm font-semibold">{lic.name}</p>
                                                        <p className="text-xs text-white/50">{lic.streamingLimit}</p>
                                                    </div>
                                                    <p className="text-lg font-bold text-sky-200">{lic.price}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Active License Terms & Honest BeatStars CTA */}
                                <div className="rounded-xl border border-sky-200/20 bg-sky-300/[0.05] p-5 space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <span className="text-sm font-semibold text-white">Includes with {selectedLicense.name}:</span>
                                        <span className="text-xl font-bold text-sky-200">{selectedLicense.price}</span>
                                    </div>
                                    <ul className="grid gap-2 text-xs text-white/80 sm:grid-cols-2">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>Formats: {selectedLicense.fileFormats.join(', ')}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>Streams: {selectedLicense.streamingLimit}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>Sales: {selectedLicense.salesLimit}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                            <span>Stems: {selectedLicense.includesStems ? 'Included' : 'Not Included'}</span>
                                        </li>
                                    </ul>

                                    <a
                                        href={beat.beatstarsProductUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => handleCheckoutClick(selectedLicense.name, selectedLicense.price)}
                                        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-200 text-black font-semibold text-sm transition hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                                    >
                                        Choose {selectedLicense.name} on BeatStars ({selectedLicense.price})
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                            </m.div>
                        </div>
                    </div>
                </SectionShell>

                {/* Sound Character & Licensing Information */}
                <SectionShell id="specs" className="border-t border-white/10 py-14">
                    <div className="mx-auto max-w-5xl grid gap-10 md:grid-cols-2">
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-white">Production & Sound Character</h2>
                            <p className="mt-4 text-sm leading-7 text-white/70">
                                Engineered with 100% Art & 100% Science by Virzy Guns. Designed with dynamic headroom for vocal tracking and punchy transient control. Use the embedded BeatStars player above for real-time playback and track selection.
                            </p>
                            <div className="mt-6 space-y-3 text-xs text-white/60">
                                <p><strong className="text-white">Tags:</strong> {beat.tags.join(', ')}</p>
                                <p><strong className="text-white">Credit required:</strong> {selectedLicense.creditString}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-200/70">Licensing Summary</h3>
                            <div className="space-y-3 text-xs text-white/70">
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">Commercial Release</span>
                                    <span className="text-sm font-semibold text-white">Allowed on all major platforms</span>
                                </div>
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">Delivery</span>
                                    <span className="text-sm font-semibold text-white">Instant high-quality download via BeatStars</span>
                                </div>
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">Content ID Registration</span>
                                    <span className="text-sm font-semibold text-white">Available on Exclusive Rights</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionShell>

                {/* Related Beats in Genre */}
                {relatedBeats.length > 0 && (
                    <SectionShell id="related-beats" className="border-t border-white/10 py-14">
                        <div className="mx-auto max-w-5xl">
                            <h2 className="font-display text-2xl font-semibold text-white mb-6">More {beat.primaryGenre} Beats</h2>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {relatedBeats.map((relBeat) => (
                                    <Link
                                        key={relBeat.id}
                                        href={getLocalePath(`/studio/beats/${relBeat.slug}`)}
                                        className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-sky-200/40 hover:bg-white/[0.04]"
                                    >
                                        <p className="text-xs text-sky-200/60 uppercase font-semibold">{relBeat.primaryGenre}</p>
                                        <h3 className="mt-1 text-base font-semibold text-white group-hover:text-sky-200 transition">{relBeat.title}</h3>
                                        <p className="mt-2 text-xs text-white/50">Listen & Choose License →</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </SectionShell>
                )}
            </article>
        </PageTransition>
    );
}
