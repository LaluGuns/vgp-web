'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { ButtonArrow, TextLink, buttonMotionClass } from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';
import { CADENZ_APP_URL, CADENZ_PLAY_URL, FLOW_APP_URL, healingWaveModules } from '@/lib/vgp-ecosystem';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;
const revealDelay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

const primaryButton = `${buttonMotionClass} bg-white text-[#050607] hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]`;

const liveStates = new Set(['Available now', 'On Google Play']);

const principles = [
    {
        title: 'Music first',
        body: 'Every track is written and produced by VGP to stand on its own as music. What it does for you comes from tempo, structure and sound, so it still has to be worth listening to.',
    },
    {
        title: 'Claims you can check',
        body: 'HealingWave does not promise cures. The products measure what they can, like your cadence or the focus sessions you finish, and show you the numbers.',
    },
    {
        title: 'Built for ordinary days',
        body: 'Work, training and rest are where music already plays for hours. That is where it should help, without asking you to change your routine.',
    },
];

export default function HealingWaveClient() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                {/* Opening */}
                <section className="px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:pb-28">
                    <div className="mx-auto max-w-7xl">
                        <p data-enter="" style={delay(0)} className="text-sm text-white/60">
                            HealingWave, by Virzy Guns
                        </p>
                        <h1 className="mt-5 max-w-[14ch] font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.05em]">
                            <span data-enter="" style={delay(60)} className="block">Music that does</span>
                            <span data-enter="" style={delay(160)} className="block text-white/55">people good.</span>
                        </h1>
                        <p data-enter="" style={delay(280)} className="mt-8 max-w-2xl text-lg leading-8 text-white/75">
                            HealingWave is the part of Virzy Guns Production that makes music with a job to do: help people
                            focus, keep a steady pace and recover. It ships as apps you can use today.
                        </p>
                        <div data-enter="" style={delay(380)} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                            <a href={CADENZ_PLAY_URL} target="_blank" rel="noopener noreferrer" className={primaryButton}>
                                Get CADENZ
                                <ButtonArrow />
                            </a>
                            <TextLink href={FLOW_APP_URL}>Open Flow</TextLink>
                        </div>
                    </div>
                </section>

                {/* Founder note */}
                <section aria-labelledby="why-heading" className="border-t border-white/10 px-4 py-24 sm:px-6 lg:py-32">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                        <h2 data-reveal="" id="why-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-4">
                            Why I started it
                        </h2>
                        <div data-reveal="" style={revealDelay(120)} className="lg:col-span-7 lg:col-start-6">
                            <blockquote className="font-display text-2xl font-medium leading-[1.35] tracking-[-0.02em] text-white sm:text-3xl sm:leading-[1.3]">
                                A lot of what plays in people&apos;s ears all day is made to grab attention, and some of it
                                leaves them more tired and more scattered than before. I want to make the opposite: music
                                that leaves someone more focused, healthier and more useful to the people around them.
                            </blockquote>
                            <div className="mt-8 flex items-center gap-4">
                                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
                                    <Image
                                        src="/images/founder.jpg"
                                        alt=""
                                        fill
                                        sizes="48px"
                                        className="object-cover object-[50%_25%]"
                                    />
                                </div>
                                <p className="text-sm leading-6 text-white/60">
                                    <span className="block font-semibold text-white">Virzy Guns</span>
                                    Founder, Virzy Guns Production
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Principles */}
                <section aria-labelledby="principles-heading" className="border-t border-white/10 px-4 py-24 sm:px-6 lg:py-28">
                    <div className="mx-auto max-w-7xl">
                        <h2 data-reveal="" id="principles-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                            How it works
                        </h2>
                        <dl className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-white/10 bg-white/10 md:grid-cols-3">
                            {principles.map((principle, index) => (
                                <div key={principle.title} data-reveal="" style={revealDelay(index * 110)} className="bg-[#050607] p-7 sm:p-8">
                                    <dt className="flex items-baseline gap-3 text-lg font-semibold text-white">
                                        <span className="text-sm tabular-nums text-sky-300">0{index + 1}</span>
                                        {principle.title}
                                    </dt>
                                    <dd className="mt-3 text-base leading-7 text-white/65">{principle.body}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {/* CADENZ feature */}
                <section aria-labelledby="cadenz-heading" className="group border-t border-white/10 px-4 py-24 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
                        <div data-reveal="" className="vgp-zoom relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[6px] border border-white/10 bg-black lg:col-span-5 lg:mx-0 lg:max-w-none">
                            <Image
                                src="/images/CADENZ_POSTER.jpg"
                                alt="CADENZ poster: a cyclist with a road bike next to the CADENZ running screen"
                                fill
                                sizes="(min-width: 1024px) 40vw, 90vw"
                                className="object-cover object-top"
                            />
                        </div>
                        <div data-reveal="" style={revealDelay(120)} className="lg:col-span-6 lg:col-start-7">
                            <p className="text-xs font-medium text-sky-300">The first HealingWave app · On Google Play</p>
                            <h2 id="cadenz-heading" className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
                                CADENZ
                            </h2>
                            <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
                                Original VGP music matched to your running or cycling cadence. Pick a tempo between 130 and 180
                                BPM, or leave it on AUTO and the music follows your steps.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <a href={CADENZ_PLAY_URL} target="_blank" rel="noopener noreferrer" className={primaryButton}>
                                    Get it on Google Play
                                    <ButtonArrow />
                                </a>
                                <TextLink href={CADENZ_APP_URL}>cadenz.virzyguns.com</TextLink>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Everything so far */}
                <section aria-labelledby="products-heading" className="border-t border-white/10 px-4 py-24 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <div data-reveal="" className="lg:col-span-4">
                            <h2 id="products-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                What it makes so far
                            </h2>
                            <p className="mt-4 max-w-sm text-base leading-7 text-white/65">
                                Two apps people use today and one idea still being worked out.
                            </p>
                        </div>
                        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                            {healingWaveModules.map((module, index) => {
                                const isLive = liveStates.has(module.availability);
                                return (
                                    <li key={module.name} data-reveal="" style={revealDelay(index * 90)} className="grid gap-4 py-8 sm:grid-cols-[1fr_auto] sm:gap-10">
                                        <div>
                                            <p className={`text-xs font-medium ${isLive ? 'text-sky-300' : 'text-white/50'}`}>
                                                {module.availability} · {module.platform}
                                            </p>
                                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">{module.name}</h3>
                                            <p className="mt-3 max-w-xl text-base leading-7 text-white/70">{module.description}</p>
                                            <p className="mt-3 text-sm leading-6 text-white/50">{module.features.join(' · ')}</p>
                                        </div>
                                        {module.external ? (
                                            <div className="sm:pt-6">
                                                <TextLink href={module.href}>Open {module.name}</TextLink>
                                            </div>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>

                {/* Honest limits and updates */}
                <section aria-labelledby="limits-heading" className="border-t border-white/10 px-4 pb-28 pt-24 sm:px-6 lg:pb-32">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                        <div data-reveal="" className="lg:col-span-5">
                            <h2 id="limits-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                What it is not
                            </h2>
                            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
                                HealingWave music is not a medical treatment. If you have a health condition, talk to a doctor
                                before you change how you train or rest.
                            </p>
                        </div>
                        <div data-reveal="" style={revealDelay(120)} className="lg:col-span-6 lg:col-start-7">
                            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Follow the work</h2>
                            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
                                One email when there is a new release, an update to CADENZ or Flow, or something worth sharing
                                from the research.
                            </p>
                            <button type="button" onClick={openPopup} className={`mt-8 ${primaryButton}`}>
                                Get HealingWave updates
                            </button>
                        </div>
                    </div>
                </section>
            </article>
        </PageTransition>
    );
}
