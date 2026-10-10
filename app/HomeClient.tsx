'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { ButtonArrow, TextLink, buttonMotionClass } from '@/components/editorial/EditorialPrimitives';
import { CreditsStrip } from '@/components/editorial/CreditsStrip';
import { CadenzTempo } from '@/components/home/CadenzTempo';
import { JourneyTimeline, type JourneyChapter } from '@/components/home/JourneyTimeline';
import { CADENZ_APP_URL, CADENZ_PLAY_URL, FLOW_APP_URL, HEALINGWAVE_PATH, VGP_FOUNDED } from '@/lib/vgp-ecosystem';
import { founderEmail } from '@/lib/founder-contact';
import { useNewsletter } from '@/components/context/NewsletterContext';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;
const revealDelay = (ms: number) => ({ '--reveal-delay': `${ms}ms` }) as CSSProperties;

const primaryButton = `${buttonMotionClass} bg-white text-[#050607] hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]`;
const outlineButton = `${buttonMotionClass} border border-white/25 text-white hover:border-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050607]`;

const journey: JourneyChapter[] = [
    {
        marker: 'The records',
        title: 'Producer',
        body: 'I learned to make records the slow way: drums, 808s, vocals, mix, master, then start again. Muso.ai lists 526 producer credits and 550 as primary artist, and ranks me in the top 10% of songwriters.',
        image: {
            src: '/images/virzy-guns-dp.jpg',
            alt: 'Virzy Guns portrait in blue light with the name VIRZY GUNS',
            className: 'object-center',
        },
    },
    {
        marker: String(VGP_FOUNDED),
        title: 'Founder',
        body: 'I started Virzy Guns Production to keep songs, beats and teaching under one roof and held to one standard. The beat store, the studio services and the production guides all grew out of it.',
        image: {
            src: '/images/vgp-brand-hero-v2.png',
            alt: 'Virzy Guns Production logo in brushed metal',
            className: 'object-[70%_50%]',
        },
    },
    {
        marker: 'Now',
        title: 'HealingWave',
        body: 'Music already fills the hours people work, train and rest. I want what plays in those hours to do some good: help someone focus longer, hold a steadier pace, recover better. HealingWave is where I build that, starting with CADENZ and Flow.',
        image: {
            src: '/images/CADENZ_POSTER.jpg',
            alt: 'CADENZ poster: a cyclist with a road bike next to the CADENZ running screen',
            className: 'object-top',
        },
    },
];

const principles = [
    {
        title: 'Music first',
        body: 'Every track is written and produced to stand on its own. What it does for you comes from tempo, structure and sound.',
    },
    {
        title: 'Claims you can check',
        body: 'No promises of a cure. The products measure what they can, like cadence and finished focus sessions, and tell you what they measured.',
    },
    {
        title: 'Built for ordinary days',
        body: 'Work, training and rest: the hours music already plays in. That is where it should help.',
    },
];

function Availability({ children }: { children: ReactNode }) {
    return <p className="text-xs font-medium text-sky-300">{children}</p>;
}

/** The home page body. app/page.tsx passes the lesson count, so the browser never loads the lessons. */
export default function HomeClient({ lessonCount }: { lessonCount: number }) {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <main id="main" tabIndex={-1} className="relative min-h-screen overflow-x-clip bg-[#050607] text-white">
                {/* Hero: the founder and the one idea the site is about. */}
                <section className="px-4 pt-24 sm:px-6 sm:pt-28 lg:pt-32">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
                        <div className="lg:col-span-7 lg:pb-12">
                            <p data-enter="" style={delay(0)} className="text-sm text-white/60">
                                Virzy Guns, producer and founder
                            </p>
                            <h1 className="mt-5 font-display text-[clamp(2.35rem,6.4vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                                <span data-enter="" style={delay(60)} className="block">Music should</span>
                                <span data-enter="" style={delay(160)} className="block">leave you better</span>
                                <span data-enter="" style={delay(260)} className="block text-white/55">than it found you.</span>
                            </h1>
                            <p data-enter="" style={delay(380)} className="mt-8 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                                I produced records for years, started Virzy Guns Production in {VGP_FOUNDED}, and now I build
                                HealingWave: music made to help people focus, move and recover.
                            </p>
                            <div data-enter="" style={delay(480)} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <Link href={HEALINGWAVE_PATH} className={primaryButton}>
                                    See HealingWave
                                    <ButtonArrow />
                                </Link>
                                <TextLink href="/about">Read my story</TextLink>
                                <TextLink href="/blog">{lessonCount} free production lessons</TextLink>
                            </div>
                        </div>

                        <figure data-enter="" style={delay(120)} className="lg:col-span-5">
                            <div className="vgp-zoom relative aspect-[5/4] overflow-hidden rounded-[6px] bg-black sm:aspect-[4/3] lg:aspect-[4/5]">
                                <Image
                                    src="/images/founder.jpg"
                                    alt="Black and white portrait of Virzy Guns"
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 40vw, 100vw"
                                    data-enter="settle"
                                    className="object-cover object-[50%_25%]"
                                />
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050607] to-transparent"
                                    aria-hidden="true"
                                />
                            </div>
                        </figure>
                    </div>
                </section>

                {/* Proof: verified credits, each linked to the source. */}
                <CreditsStrip className="mt-16 lg:mt-20" />

                {/* Journey: producer, founder, HealingWave. */}
                <section aria-labelledby="journey-heading" className="px-4 py-24 sm:px-6 lg:py-32">
                    <div className="mx-auto max-w-7xl">
                        <h2 data-reveal="" id="journey-heading" className="max-w-[18ch] font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                            From the studio to HealingWave.
                        </h2>
                        <div className="mt-16">
                            <JourneyTimeline chapters={journey} />
                        </div>
                    </div>
                </section>

                {/* Mission: what HealingWave is for. */}
                <section aria-labelledby="mission-heading" className="border-t border-white/10 px-4 py-24 sm:px-6 lg:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div data-reveal="" className="max-w-4xl">
                            <h2 id="mission-heading" className="font-display text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                                HealingWave makes music people can use.
                            </h2>
                            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">
                                Some music wears people down. I want to make the kind that leaves them sharper, healthier and
                                more useful to the people around them. Every HealingWave product starts from original VGP
                                music and one clear job for it to do.
                            </p>
                        </div>
                        <dl className="mt-16 grid gap-px overflow-hidden rounded-[6px] border border-white/10 bg-white/10 md:grid-cols-3">
                            {principles.map((principle, index) => (
                                <div
                                    key={principle.title}
                                    data-reveal=""
                                    style={revealDelay(index * 110)}
                                    className="bg-[#050607] p-7 sm:p-8"
                                >
                                    <dt className="flex items-baseline gap-3 text-lg font-semibold text-white">
                                        <span className="text-sm tabular-nums text-sky-300">0{index + 1}</span>
                                        {principle.title}
                                    </dt>
                                    <dd className="mt-3 text-base leading-7 text-white/65">{principle.body}</dd>
                                </div>
                            ))}
                        </dl>
                        <div data-reveal="" className="mt-10">
                            <TextLink href={HEALINGWAVE_PATH}>Read the HealingWave mission</TextLink>
                        </div>
                    </div>
                </section>

                {/* CADENZ: the first HealingWave product, with a tempo you can hear. */}
                <section aria-labelledby="cadenz-heading" className="group border-t border-white/10 px-4 py-24 sm:px-6 lg:py-32">
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
                            <Availability>On Google Play</Availability>
                            <h2 id="cadenz-heading" className="mt-3 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
                                CADENZ
                            </h2>
                            <p className="mt-4 text-xl leading-8 text-white/85 sm:text-2xl sm:leading-9">
                                Music that keeps time with your run.
                            </p>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                                Pick a tempo between 130 and 180 BPM and CADENZ plays original VGP music on that beat.
                                Leave it on AUTO and the music follows your cadence, or LOCK it to hold a steady pace.
                                It works for running and for cycling.
                            </p>
                            <CadenzTempo />
                            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <a href={CADENZ_PLAY_URL} target="_blank" rel="noopener noreferrer" className={primaryButton}>
                                    Get it on Google Play
                                    <ButtonArrow />
                                </a>
                                <TextLink href={CADENZ_APP_URL}>Visit cadenz.virzyguns.com</TextLink>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Flow: the second HealingWave product. */}
                <section aria-labelledby="flow-heading" className="group border-t border-white/10 px-4 py-20 sm:px-6 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
                        <div data-reveal="" className="lg:col-span-5">
                            <Availability>Available now</Availability>
                            <h2 id="flow-heading" className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                                Flow
                            </h2>
                            <p className="mt-5 max-w-md text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                                A focus timer for long work blocks. It plays original VGP tracks and ambient sound, and
                                keeps an honest count of the sessions you finish.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <a href={FLOW_APP_URL} target="_blank" rel="noopener noreferrer" className={outlineButton}>
                                    Open Flow
                                    <ButtonArrow />
                                </a>
                                <TextLink href="/flow">What Flow does</TextLink>
                            </div>
                        </div>
                        <div data-reveal="" style={revealDelay(120)} className="vgp-zoom flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[6px] border border-white/10 bg-[#0a0e12] px-[18%] lg:col-span-7">
                            <Image
                                src="/branding/flowstate-logo.png"
                                alt="Flow logo"
                                width={768}
                                height={270}
                                sizes="(min-width: 1024px) 38vw, 64vw"
                                className="h-auto w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* The studio is still open. */}
                <section aria-labelledby="records-heading" className="border-t border-white/10 px-4 py-24 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                        <h2 data-reveal="" id="records-heading" className="font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:col-span-5">
                            I still make records.
                        </h2>
                        <div data-reveal="" style={revealDelay(120)} className="lg:col-span-6 lg:col-start-7">
                            <p className="text-lg leading-8 text-white/70">
                                The beat store has more than 300 beats in trap, drill, phonk, synthwave, R&amp;B, club and pop.
                                License one and download it straight away, or bring a song to the studio for custom
                                production, mixing and mastering.
                            </p>
                            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
                                {[
                                    { label: 'Beat Store', note: 'Licenses from $15', href: '/studio/beats' },
                                    { label: 'Studio services', note: 'Custom work, mix and master', href: '/studio' },
                                    { label: 'License terms', note: 'What each license allows', href: '/studio/beats/licensing' },
                                ].map((row) => (
                                    <li key={row.href}>
                                        <Link
                                            href={row.href}
                                            className="group/row flex items-baseline justify-between gap-6 py-5 transition-colors hover:bg-white/[0.02]"
                                        >
                                            <span className="text-lg font-semibold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2">
                                                {row.label}
                                            </span>
                                            <span className="shrink-0 text-sm text-white/50">{row.note}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Writing: free notes from the studio. */}
                <section aria-labelledby="writing-heading" className="group border-t border-white/10 px-4 py-24 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
                        <div data-reveal="" className="vgp-zoom relative mx-auto aspect-[815/1054] w-full max-w-xs overflow-hidden rounded-[4px] border border-white/10 lg:col-span-4 lg:mx-0">
                            <Image
                                src="/ebooks/trap-guide-book-cover.jpg"
                                alt="Cover of Music Production Guide: Trap Edition by Virzy Guns"
                                fill
                                sizes="(min-width: 1024px) 28vw, 320px"
                                className="object-cover"
                            />
                        </div>
                        <div data-reveal="" style={revealDelay(120)} className="lg:col-span-7 lg:col-start-6 lg:pt-4">
                            <h2 id="writing-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                What I have learned, written down.
                            </h2>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
                                Free lessons in learning paths, from songwriting and sound design to mixing, audio science and
                                licensing. A full guide for producers is on the way.
                            </p>
                            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
                                {[
                                    { label: 'Trap Beats: Anatomy of the Perfect 808', note: 'Free lesson', href: '/blog/trap-beats-anatomy-of-the-perfect-808' },
                                    { label: 'Music Production Guide: Trap Edition', note: '80+ page PDF, coming soon', href: '/book' },
                                    { label: 'All lessons', note: 'Free', href: '/blog' },
                                ].map((row) => (
                                    <li key={row.href}>
                                        <Link
                                            href={row.href}
                                            className="group/row flex flex-col gap-1 py-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                                        >
                                            <span className="text-lg font-semibold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2">
                                                {row.label}
                                            </span>
                                            <span className="shrink-0 text-xs text-white/50">{row.note}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Closing: follow the build. */}
                <section aria-labelledby="follow-heading" className="border-t border-white/10 px-4 pb-28 pt-24 sm:px-6 lg:pb-36 lg:pt-32">
                    <div data-reveal="" className="mx-auto max-w-7xl">
                        <h2 id="follow-heading" className="max-w-[14ch] font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
                            Follow the build.
                        </h2>
                        <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">
                            I write when there is something real to show: a new CADENZ release, a Flow update, or something
                            HealingWave has learned. For work or press, email me.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
                            <button type="button" onClick={openPopup} className={primaryButton}>
                                Get updates by email
                            </button>
                            <TextLink href={`mailto:${founderEmail}`}>{founderEmail}</TextLink>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
