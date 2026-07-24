'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { SectionShell, PageHeader } from '@/components/editorial/EditorialPrimitives';
import { defaultLicenses, BeatLicense } from '@/lib/catalog';

interface LicensingClientProps {
    locale?: 'en-US' | 'ja-JP' | 'de-DE';
}

export default function LicensingClient({ locale = 'en-US' }: LicensingClientProps) {
    const getLocalePath = (path: string) => {
        if (locale === 'ja-JP') return `/ja-JP${path}`;
        if (locale === 'de-DE') return `/de-DE${path}`;
        return path;
    };

    const title = locale === 'ja-JP' ? 'ビートライセンス利用規約' : locale === 'de-DE' ? 'Beat-Lizenzbedingungen' : 'Beat Licensing Terms';
    const desc = locale === 'ja-JP' ? 'アーティスト、プロデューサー、レーベルのための明確で透明性のある商用ライセンス。' : locale === 'de-DE' ? 'Klar verständliche kommerzielle Veröffentlichungsrechte für Künstler und Produzenten.' : 'Clear, transparent commercial release rights for artists, producers, and labels.';

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white pt-24 pb-20">
                <div className="mx-auto max-w-5xl px-6 mb-8 flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-xs text-white/50 font-medium">
                        <Link href={getLocalePath('/')} className="hover:text-white transition">Home</Link>
                        <span>/</span>
                        <Link href={getLocalePath('/studio/beats')} className="hover:text-white transition">Beats</Link>
                        <span>/</span>
                        <span className="text-sky-200/80">{title}</span>
                    </nav>

                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Link href="/studio/beats/licensing" className={`hover:text-white transition ${locale === 'en-US' ? 'text-sky-200 font-bold' : ''}`}>EN</Link>
                        <span>|</span>
                        <Link href="/ja-JP/studio/beats/licensing" className={`hover:text-white transition ${locale === 'ja-JP' ? 'text-sky-200 font-bold' : ''}`}>JA</Link>
                        <span>|</span>
                        <Link href="/de-DE/studio/beats/licensing" className={`hover:text-white transition ${locale === 'de-DE' ? 'text-sky-200 font-bold' : ''}`}>DE</Link>
                    </div>
                </div>

                <PageHeader
                    eyebrow="Virzy Guns Licensing Hub"
                    title={title}
                    mutedTitle="explained clearly."
                    description={desc}
                />

                {/* License Matrix */}
                <SectionShell id="license-matrix" className="py-10">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {defaultLicenses.map((lic: BeatLicense) => (
                                <div
                                    key={lic.id}
                                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-white">{lic.name}</h3>
                                            <span className="text-xl font-bold text-sky-200">{lic.price}</span>
                                        </div>
                                        <div className="mt-4 space-y-2 text-xs text-white/70">
                                            <p className="font-semibold text-white">Files: {lic.fileFormats.join(', ')}</p>
                                            <p className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                                <span>Streams: {lic.streamingLimit}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                                <span>Sales: {lic.salesLimit}</span>
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Check className="h-3.5 w-3.5 text-sky-200 shrink-0" />
                                                <span>Music Videos: {lic.musicVideoLimit}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={getLocalePath('/studio/beats')}
                                        className="mt-6 flex items-center justify-center gap-1 rounded-lg border border-sky-200/30 bg-sky-300/10 py-2.5 text-xs font-semibold text-sky-200 transition hover:bg-sky-300/20"
                                    >
                                        Browse Beats for {lic.name}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionShell>

                {/* FAQ Section */}
                <SectionShell id="faq" className="border-t border-white/10 py-14">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <h2 className="font-display text-2xl font-semibold text-white text-center">Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                                <h3 className="text-base font-semibold text-white">Non-Exclusive vs. Exclusive Rights?</h3>
                                <p className="mt-2 text-xs leading-6 text-white/70">
                                    Non-exclusive leases allow multiple artists to license the same beat under stream and sales limits. Exclusive rights grant full ownership, remove the beat from the store, and provide unlimited distribution.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                                <h3 className="text-base font-semibold text-white">Can I upload to Spotify and Apple Music?</h3>
                                <p className="mt-2 text-xs leading-6 text-white/70">
                                    Yes! All non-exclusive leases permit commercial streaming releases on Spotify, Apple Music, and all digital platforms up to the stream limit of your chosen tier.
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                                <h3 className="text-base font-semibold text-white">Are track stems included?</h3>
                                <p className="mt-2 text-xs leading-6 text-white/70">
                                    Track stems are included with Premium Lease ($50), Unlimited Lease ($100), and Exclusive Rights.
                                </p>
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
