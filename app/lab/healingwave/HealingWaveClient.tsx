'use client';

import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { EditorialButton, PageHeader, TextLink } from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';
import { CADENZ_APP_URL, CADENZ_PLAY_URL, FLOW_APP_URL, healingWaveModules } from '@/lib/vgp-ecosystem';

const liveStates = new Set(['Available now', 'On Google Play']);

export default function HealingWaveClient() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <PageHeader
                    title="HealingWave Lab"
                    description="The research side of VGP. It studies how music can support focus, running cadence and recovery, then turns what holds up into apps. Flow and CADENZ both came out of it."
                    primary={{ label: 'Open Flow', href: FLOW_APP_URL }}
                    secondary={{ label: 'Visit CADENZ', href: CADENZ_APP_URL }}
                />

                <section aria-labelledby="products-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <h2 id="products-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                Apps and experiments
                            </h2>
                            <p className="mt-4 max-w-sm text-base leading-7 text-white/65">
                                The lab is careful with claims. Music can help a session go well; it is not sold here as a
                                treatment for anything.
                            </p>
                        </div>
                        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                            {healingWaveModules.map((module) => {
                                const isLive = liveStates.has(module.availability);
                                const isSelfLink = module.href === '/lab/healingwave';
                                return (
                                    <li key={module.name} className="py-8">
                                        <p className={`text-xs font-medium ${isLive ? 'text-sky-300' : 'text-white/50'}`}>
                                            {module.availability} · {module.platform}
                                        </p>
                                        <h3 className="mt-2 text-xl font-semibold text-white">{module.name}</h3>
                                        <p className="mt-2 max-w-xl text-base leading-7 text-white/70">{module.description}</p>
                                        <p className="mt-3 text-sm leading-6 text-white/55">{module.features.join(' · ')}</p>
                                        {!isSelfLink ? (
                                            <div className="mt-5">
                                                <TextLink href={module.href}>Open {module.name}</TextLink>
                                            </div>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>

                <section aria-labelledby="cadenz-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-center">
                        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[6px] border border-white/10 bg-black lg:col-span-5 lg:mx-0">
                            <Image
                                src="/images/CADENZ_POSTER.jpg"
                                alt="CADENZ poster: a cyclist with a road bike next to the CADENZ running screen"
                                fill
                                sizes="(min-width: 1024px) 34vw, 90vw"
                                className="object-cover object-top"
                            />
                        </div>
                        <div className="lg:col-span-6 lg:col-start-7">
                            <p className="text-xs font-medium text-sky-300">On Google Play</p>
                            <h2 id="cadenz-heading" className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                CADENZ
                            </h2>
                            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
                                Original VGP music matched to your running or cycling cadence. Pick a tempo in steps or
                                pedal strokes per minute and the music keeps the beat with you.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <EditorialButton href={CADENZ_PLAY_URL}>Get it on Google Play</EditorialButton>
                                <TextLink href={CADENZ_APP_URL}>cadenz.virzyguns.com</TextLink>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-t border-white/10 px-4 pb-24 pt-14 sm:px-6">
                    <p className="mx-auto max-w-7xl text-base leading-7 text-white/65">
                        Want the lab notes when there is something new?{' '}
                        <button
                            type="button"
                            onClick={openPopup}
                            className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        >
                            Get them by email
                        </button>
                    </p>
                </section>
            </article>
        </PageTransition>
    );
}
