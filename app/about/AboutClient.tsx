import Image from 'next/image';
import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { EditorialButton, TextLink } from '@/components/editorial/EditorialPrimitives';
import { CreditsStrip, MUSO_PROFILE_URL } from '@/components/editorial/CreditsStrip';
import { founderEmail } from '@/lib/founder-contact';

const workAreas = [
    {
        title: 'VGP Studio',
        body: 'Beats, custom production, mixing and mastering.',
        href: '/studio',
    },
    {
        title: 'HealingWave Lab',
        body: 'Research into music for focus, running cadence and recovery. The findings feed Flow and CADENZ.',
        href: '/lab/healingwave',
    },
    {
        title: 'Learn',
        body: 'Free production articles, the Trap Edition guide and upcoming masterclasses.',
        href: '/learn',
    },
];

export default function AboutClient() {
    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <section className="px-4 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
                        <div className="lg:col-span-7 lg:pb-12">
                            <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
                                Virzy Guns
                            </h1>
                            <p className="mt-6 max-w-xl text-xl leading-8 text-white/80 sm:text-2xl sm:leading-9">
                                Songwriter, producer and founder of Virzy Guns Production.
                            </p>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                                Virzy Guns writes and produces records and runs the VGP beat store. The same music
                                plays inside Flow, a focus timer, and CADENZ, an app for running and cycling.
                            </p>
                            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <EditorialButton href="/studio/beats" withArrow>
                                    Browse beats
                                </EditorialButton>
                                <TextLink href="/studio">Work with the studio</TextLink>
                            </div>
                        </div>

                        <figure className="lg:col-span-5">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-black">
                                <Image
                                    src="/images/founder.jpg"
                                    alt="Black and white portrait of Virzy Guns"
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 40vw, 100vw"
                                    className="object-cover object-[50%_25%]"
                                />
                            </div>
                        </figure>
                    </div>
                </section>

                <CreditsStrip className="mt-16 lg:mt-20" />

                <section aria-labelledby="story-heading" className="px-4 py-20 sm:px-6 lg:py-28">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <h2 id="story-heading" className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl lg:col-span-5">
                            Art leads. Science sharpens the decision.
                        </h2>
                        <div className="space-y-6 text-lg leading-8 text-white/75 lg:col-span-6 lg:col-start-7">
                            <p>
                                VGP started as a way to keep songs, beats, listening tools and teaching under one roof,
                                held to the same standard.
                            </p>
                            <p>
                                The technical side comes from study in wave physics, signal processing, data science,
                                psychoacoustics and meteorology. It shapes how mixes get checked and how Flow and CADENZ
                                pace their music. The song still comes first.
                            </p>
                        </div>
                    </div>
                </section>

                <section aria-labelledby="work-heading" className="border-t border-white/10 px-4 py-20 sm:px-6 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <h2 id="work-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-5">
                            Where the work goes
                        </h2>
                        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7">
                            {workAreas.map((area) => (
                                <li key={area.title}>
                                    <Link
                                        href={area.href}
                                        className="group block py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        <span className="text-xl font-semibold text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            {area.title}
                                        </span>
                                        <span className="mt-2 block max-w-xl text-base leading-7 text-white/65">{area.body}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section aria-labelledby="contact-heading" className="border-t border-white/10 px-4 pb-24 pt-20 sm:px-6 lg:pb-32">
                    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
                        <h2 id="contact-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-5">
                            Get in touch
                        </h2>
                        <div className="lg:col-span-6 lg:col-start-7">
                            <p className="text-lg leading-8 text-white/75">
                                For custom production, collaborations or press, email{' '}
                                <a
                                    href={`mailto:${founderEmail}`}
                                    className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                                >
                                    {founderEmail}
                                </a>
                                .
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <TextLink href="https://www.linkedin.com/in/virzyguns/">Virzy Guns on LinkedIn</TextLink>
                                <TextLink href={MUSO_PROFILE_URL}>
                                    Full credits on Muso.ai
                                </TextLink>
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        </PageTransition>
    );
}
