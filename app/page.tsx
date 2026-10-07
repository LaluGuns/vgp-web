'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { CreditsStrip } from '@/components/editorial/CreditsStrip';
import {
    CADENZ_APP_URL,
    CADENZ_PLAY_URL,
    FLOW_APP_URL,
    founderStatement,
} from '@/lib/vgp-ecosystem';
import { useNewsletter } from '@/components/context/NewsletterContext';

function Availability({ children, live = false }: { children: ReactNode; live?: boolean }) {
    return (
        <p className={`text-xs font-medium ${live ? 'text-sky-300' : 'text-white/50'}`}>{children}</p>
    );
}

export default function HomePage() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <main className="relative min-h-screen overflow-hidden bg-[#050607] text-white">
                {/* Hero: the founder portrait is the page's one image-led moment. */}
                <section className="px-4 pt-24 sm:px-6 sm:pt-28 lg:pt-32">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
                        <div className="lg:col-span-7 lg:pb-14">
                            <h1 className="max-w-[13ch] font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
                                Premium beats and music tools by Virzy Guns.
                            </h1>
                            <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                                Original beats in trap, drill, phonk, synthwave, R&amp;B, club and pop, licensed on the spot.
                                The same studio makes Flow for deep work, CADENZ for running and cycling, and guides for
                                producers learning the craft.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <Link
                                    href="/studio/beats"
                                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#050607] transition-colors hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]"
                                >
                                    Browse beats
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                                <TextLink href={FLOW_APP_URL}>Open Flow</TextLink>
                            </div>
                        </div>

                        <figure className="lg:col-span-5">
                            <div className="relative aspect-[5/4] overflow-hidden rounded-[6px] bg-black sm:aspect-[4/3] lg:aspect-[4/5]">
                                <Image
                                    src="/images/founder.jpg"
                                    alt="Black and white portrait of Virzy Guns"
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 40vw, 100vw"
                                    className="object-cover object-[50%_25%]"
                                />
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050607] to-transparent"
                                    aria-hidden="true"
                                />
                            </div>
                            <figcaption className="mt-3 text-xs text-white/50">
                                Virzy Guns, founder and producer
                            </figcaption>
                        </figure>
                    </div>
                </section>

                {/* Credits: real numbers from Muso.ai, each linked to the source. */}
                <CreditsStrip className="mt-16 lg:mt-20" />

                {/* Beat store: the main product, so it gets the widest treatment. */}
                <section aria-labelledby="beats-heading" className="px-4 py-20 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
                        <div className="lg:col-span-5">
                            <Availability live>Open now</Availability>
                            <h2 id="beats-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                                The beat store
                            </h2>
                            <p className="mt-5 max-w-md text-base leading-7 text-white/70">
                                Pick a beat, choose a license and download it straight away. Trackouts and exclusive
                                rights are there when a record needs them. For a track built from scratch, or a mix
                                and master, book the studio.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
                                <TextLink href="/studio/beats">Browse beats</TextLink>
                                <TextLink href="/studio/beats/licensing">License terms</TextLink>
                                <TextLink href="/studio">Studio services</TextLink>
                            </div>
                        </div>
                        <div className="relative aspect-[16/9] overflow-hidden rounded-[6px] border border-white/10 bg-black lg:col-span-7">
                            <Image
                                src="/images/vgp-brand-hero-v2.png"
                                alt="Virzy Guns Production logo in brushed metal"
                                fill
                                sizes="(min-width: 1024px) 58vw, 100vw"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Apps: Flow is live, CADENZ lives on its own site now. */}
                <section aria-labelledby="apps-heading" className="border-t border-white/10 px-4 py-20 sm:px-6 lg:py-24">
                    <div className="mx-auto max-w-7xl">
                        <h2 id="apps-heading" className="max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                            Two apps, both scored with VGP music.
                        </h2>

                        <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-12">
                            <article className="lg:col-span-7">
                                <div className="flex aspect-[16/10] items-center justify-center rounded-[6px] border border-white/10 bg-[#0a0e12] px-[18%]">
                                    <Image
                                        src="/branding/flowstate-logo.png"
                                        alt="Flow logo"
                                        width={768}
                                        height={270}
                                        sizes="(min-width: 1024px) 38vw, 64vw"
                                        className="h-auto w-full"
                                    />
                                </div>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                                    <h3 className="text-2xl font-semibold">Flow</h3>
                                    <Availability live>Available now</Availability>
                                </div>
                                <p className="mt-3 max-w-lg text-base leading-7 text-white/70">
                                    A focus timer for long work blocks. It plays original VGP tracks and ambient sound,
                                    and keeps an honest count of the sessions you finish.
                                </p>
                                <div className="mt-5">
                                    <TextLink href={FLOW_APP_URL}>Open Flow</TextLink>
                                </div>
                            </article>

                            <article className="lg:col-span-5">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] border border-white/10 bg-black">
                                    <Image
                                        src="/images/CADENZ_POSTER.jpg"
                                        alt="CADENZ poster: a cyclist with a road bike next to the CADENZ running screen"
                                        fill
                                        sizes="(min-width: 1024px) 34vw, 100vw"
                                        className="object-cover object-top"
                                    />
                                </div>
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                                    <h3 className="text-2xl font-semibold">CADENZ</h3>
                                    <Availability live>On Google Play</Availability>
                                </div>
                                <p className="mt-3 text-base leading-7 text-white/70">
                                    Music matched to your running or cycling cadence, so the beat sits on your stride.
                                </p>
                                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                                    <TextLink href={CADENZ_APP_URL}>Visit cadenz.virzyguns.com</TextLink>
                                    <TextLink href={CADENZ_PLAY_URL}>Get it on Google Play</TextLink>
                                </div>
                            </article>
                        </div>

                        <p className="mt-14 border-t border-white/10 pt-6 text-sm leading-7 text-white/60">
                            Also from the studio:{' '}
                            <Link href="/games" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">browser games</Link>,{' '}
                            <Link href="/mycamscan" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">MyCamScan</Link>{' '}
                            and the{' '}
                            <Link href="/lab/healingwave" className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">HealingWave Lab</Link>.
                        </p>
                    </div>
                </section>

                {/* Learn: the book cover carries the section; content is a plain list. */}
                <section aria-labelledby="learn-heading" className="border-t border-white/10 px-4 py-20 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
                        <div className="relative mx-auto aspect-[815/1054] w-full max-w-sm overflow-hidden rounded-[4px] border border-white/10 lg:col-span-4 lg:mx-0">
                            <Image
                                src="/ebooks/trap-guide-book-cover.jpg"
                                alt="Cover of Music Production Guide: Trap Edition by Virzy Guns"
                                fill
                                sizes="(min-width: 1024px) 28vw, 384px"
                                className="object-cover"
                            />
                        </div>

                        <div className="lg:col-span-8 lg:pt-4">
                            <h2 id="learn-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                Learn how the records are made.
                            </h2>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
                                Notes from the studio on drums, 808s, mixing and licensing. The articles are free.
                            </p>

                            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
                                <li>
                                    <Link
                                        href="/blog/trap-beats-anatomy-of-the-perfect-808"
                                        className="group flex flex-col gap-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                                    >
                                        <span className="text-lg font-semibold group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            Trap Beats: Anatomy of the Perfect 808
                                        </span>
                                        <span className="shrink-0 text-xs text-white/50">Free article</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/book"
                                        className="group flex flex-col gap-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                                    >
                                        <span className="text-lg font-semibold group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            Music Production Guide: Trap Edition
                                        </span>
                                        <span className="shrink-0 text-xs text-white/50">80+ page PDF, coming soon</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/studio/masterclass"
                                        className="group flex flex-col gap-1 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                                    >
                                        <span className="text-lg font-semibold group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            Producer masterclasses
                                        </span>
                                        <span className="shrink-0 text-xs text-white/50">Coming soon</span>
                                    </Link>
                                </li>
                            </ul>

                            <div className="mt-8">
                                <TextLink href="/learn">Go to the Learn hub</TextLink>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Closing: founder statement and the newsletter, nothing else. */}
                <section aria-labelledby="founder-heading" className="border-t border-white/10 px-4 pb-24 pt-20 sm:px-6 lg:pb-32 lg:pt-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <h2 id="founder-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-5">
                            Why the studio exists
                        </h2>
                        <div className="lg:col-span-6 lg:col-start-7">
                            <p className="text-lg leading-8 text-white/75">{founderStatement}</p>
                            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <button
                                    type="button"
                                    onClick={openPopup}
                                    className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]"
                                >
                                    Get release notes by email
                                </button>
                                <TextLink href="/about">Read the founder story</TextLink>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
