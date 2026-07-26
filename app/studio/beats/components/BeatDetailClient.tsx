'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Check, ExternalLink, Mail, Instagram } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell } from '@/components/editorial/EditorialPrimitives';
import { revealUp } from '@/lib/motion-presets';
import { BeatProduct, getBeatsByCategory } from '@/lib/catalog';
import { trackBeatEvent } from '@/lib/analytics';
import { getBeatSummary } from '@/lib/seo/beat-copy';
import BeatStarsTrackPlayer from './BeatStarsTrackPlayer';

interface BeatDetailClientProps {
    beat: BeatProduct;
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

const instagramDmUrl = 'https://ig.me/m/virzyguns';

export default function BeatDetailClient({ beat, locale = 'en-US' }: BeatDetailClientProps) {
    const [selectedLicense, setSelectedLicense] = useState(beat.licenses[0] || beat.licenses[1]);
    const relatedBeats = getBeatsByCategory(beat.primaryGenre.toLowerCase().replace(/ /g, '-'))
        .filter((b) => b.id !== beat.id)
        .slice(0, 3);

    const description = getBeatSummary(beat, locale);

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

                    <div className="flex items-center gap-2 text-xs text-white/50 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/10">
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
                                    {beat.coverImageUrl ? (
                                        <Image
                                            src={beat.coverImageUrl}
                                            alt={`${beat.title} cover artwork`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 400px"
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_18%_16%,rgba(125,211,252,0.28),transparent_30%),radial-gradient(circle_at_86%_82%,rgba(168,85,247,0.2),transparent_34%),linear-gradient(145deg,#071923,#02070d_62%,#050a12)] p-7">
                                            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.06)_42%,transparent_43%)]" aria-hidden="true" />
                                            <div className="relative flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-100/75">
                                                <span>Virzy Guns</span>
                                                <span>Official release</span>
                                            </div>
                                            <div className="relative">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/70">{beat.primaryGenre}</p>
                                                <h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-[0.95] tracking-tight text-white sm:text-4xl">{beat.title}</h2>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Official Embedded BeatStars Track Player Widget */}
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black min-h-[180px]">
                                    <div className="border-b border-white/10 px-3 py-2 text-[11px] font-medium text-white/60 flex justify-between bg-black/40">
                                        <span>{playerTitle}</span>
                                        <span>{playerSub}</span>
                                    </div>
                                    {beat.beatstarsTrackId ? (
                                        <BeatStarsTrackPlayer
                                            trackId={beat.beatstarsTrackId}
                                            productUrl={beat.beatstarsProductUrl}
                                            beatTitle={beat.title}
                                            locale={locale}
                                        />
                                    ) : (
                                        <div className="flex min-h-[140px] items-center justify-center px-4 text-center text-xs text-white/60">
                                            Official preview unavailable. Use the BeatStars purchase link below.
                                        </div>
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
                                            Ready to license
                                        </span>
                                    </div>
                                    <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                        {beat.title}
                                    </h1>
                                    <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">
                                        {description}
                                    </p>
                                </div>

                                {/* License selection matrix */}
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
                                        Secure {selectedLicense.name} — {selectedLicense.price}
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>

                                {/* Exclusive License IG DM / Email Option */}
                                <div className="rounded-xl border border-sky-200/20 bg-sky-300/[0.04] p-5 space-y-3">
                                    <p className="text-sky-200 font-semibold text-xs uppercase tracking-wider">
                                        Exclusive Rights Inquiry
                                    </p>
                                    <p className="text-xs text-white/70 leading-5">
                                        To acquire 100% full exclusive ownership and remove this beat from the store, contact Virzy Guns directly:
                                    </p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <a
                                            href={instagramDmUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200/30 bg-sky-300/[0.1] px-4 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-300/[0.2] transition"
                                        >
                                            <Instagram className="h-3.5 w-3.5" />
                                            Instagram DM (@virzyguns)
                                        </a>
                                        <a
                                            href={`mailto:founder@virzyguns.com?subject=Exclusive%20Rights%20Inquiry%20-%20${encodeURIComponent(beat.title)}`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
                                        >
                                            <Mail className="h-3.5 w-3.5" />
                                            Email Direct
                                        </a>
                                    </div>
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
                            <p className="mt-4 text-sm leading-7 text-white/70">{description}</p>
                            <div className="mt-6 space-y-3 text-xs text-white/60">
                                <p><strong className="text-white">Tags:</strong> {beat.tags.join(', ')}</p>
                                <p><strong className="text-white">Credit required:</strong> {selectedLicense.creditString}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-200/70">Licensing Summary</h3>
                            <div className="space-y-3 text-xs text-white/70">
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">Selected license</span>
                                    <span className="text-sm font-semibold text-white">{selectedLicense.name}: {selectedLicense.streamingLimit}</span>
                                </div>
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">Included formats</span>
                                    <span className="text-sm font-semibold text-white">{selectedLicense.fileFormats.join(', ')}</span>
                                </div>
                                <div className="border-b border-white/5 pb-2">
                                    <span className="text-white/40 block">Official checkout</span>
                                    <span className="text-sm font-semibold text-white">Completed on the Virzy Guns BeatStars product page</span>
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
