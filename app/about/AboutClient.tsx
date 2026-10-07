import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { CreditsStrip, MUSO_PROFILE_URL } from '@/components/editorial/CreditsStrip';
import { founderEmail } from '@/lib/founder-contact';
import { HEALINGWAVE_PATH, VGP_FOUNDED } from '@/lib/vgp-ecosystem';

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

const chapters = [
    {
        marker: 'The records',
        title: 'Learning the craft',
        paragraphs: [
            'I came up making records: writing, producing, recording vocals, mixing and mastering, then starting the next one.',
            'Muso.ai now lists 526 producer credits and 550 as primary artist, and ranks me in the top 10% of songwriters and the top 25% of producers. My publishing is administered through BeatStars Publishing, in partnership with Sony Music Publishing.',
        ],
    },
    {
        marker: String(VGP_FOUNDED),
        title: 'Starting Virzy Guns Production',
        paragraphs: [
            'I started Virzy Guns Production to keep songs, beats and teaching under one roof and held to one standard.',
            'The beat store came out of that, then the studio services for artists who want something built for them, then the articles and the Trap Edition guide for producers who want to learn how the records are made.',
        ],
    },
    {
        marker: 'Now',
        title: 'Building HealingWave',
        paragraphs: [
            'Music fills the hours people work, train and rest. A lot of it is made only to grab attention. I want what plays in those hours to leave people more focused, healthier and more useful to the people around them.',
            'That is HealingWave. It ships as CADENZ, which plays music on the beat of your run or ride, and Flow, a focus timer. Both use original VGP music.',
        ],
        link: { label: 'Read the HealingWave mission', href: HEALINGWAVE_PATH },
    },
];

const facts = [
    { label: 'Founded Virzy Guns Production', value: String(VGP_FOUNDED) },
    { label: 'Songwriter ranking on Muso.ai', value: 'Top 10%' },
    { label: 'Publishing', value: 'BeatStars Publishing, with Sony Music Publishing' },
];

const work = [
    { title: 'HealingWave', body: 'Music made to help people focus, move and recover.', href: HEALINGWAVE_PATH },
    { title: 'Studio', body: 'The beat store, custom production, mixing and mastering.', href: '/studio' },
    { title: 'Writing', body: 'Free articles and guides on how records are made.', href: '/learn' },
];

export default function AboutClient() {
    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <section className="px-4 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
                        <div className="lg:col-span-7 lg:pb-12">
                            <p data-enter="" style={delay(0)} className="text-sm text-white/60">
                                Story
                            </p>
                            <h1 className="mt-5 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                                <span data-enter="" style={delay(60)} className="block">From making records</span>
                                <span data-enter="" style={delay(160)} className="block text-white/55">to making music that helps.</span>
                            </h1>
                            <p data-enter="" style={delay(280)} className="mt-8 max-w-xl text-lg leading-8 text-white/75">
                                I&apos;m Virzy Guns, a songwriter and producer. I started Virzy Guns Production in {VGP_FOUNDED},
                                and now I&apos;m building HealingWave with it.
                            </p>
                        </div>

                        <figure data-enter="" style={delay(100)} className="lg:col-span-5">
                            <div className="relative aspect-square overflow-hidden rounded-[6px] bg-black">
                                <Image
                                    src="/images/virzy-guns-dp.jpg"
                                    alt="Virzy Guns portrait in blue light with the name VIRZY GUNS"
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 40vw, 100vw"
                                    data-enter="settle"
                                    className="object-cover"
                                />
                            </div>
                        </figure>
                    </div>
                </section>

                <CreditsStrip className="mt-16 lg:mt-20" />

                <section aria-label="Story" className="px-4 py-20 sm:px-6 lg:py-28">
                    <ol className="mx-auto max-w-7xl divide-y divide-white/10">
                        {chapters.map((chapter) => (
                            <li key={chapter.marker} data-reveal="" className="grid gap-6 py-14 first:pt-0 last:pb-0 lg:grid-cols-12 lg:gap-12 lg:py-20">
                                <div className="lg:col-span-4">
                                    <p className="text-sm tabular-nums text-sky-300">{chapter.marker}</p>
                                    <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                        {chapter.title}
                                    </h2>
                                </div>
                                <div className="space-y-5 text-lg leading-8 text-white/75 lg:col-span-7 lg:col-start-6">
                                    {chapter.paragraphs.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                    {chapter.link ? (
                                        <p className="pt-2">
                                            <TextLink href={chapter.link.href}>{chapter.link.label}</TextLink>
                                        </p>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section aria-labelledby="facts-heading" className="border-t border-white/10 px-4 py-20 sm:px-6 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <div data-reveal="" className="lg:col-span-4">
                            <h2 id="facts-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                The short version
                            </h2>
                            <div className="relative mt-8 aspect-square w-40 overflow-hidden rounded-[6px] border border-white/10 bg-black">
                                <Image
                                    src="/images/founder.jpg"
                                    alt="Black and white portrait of Virzy Guns"
                                    fill
                                    sizes="160px"
                                    className="object-cover object-[50%_25%]"
                                />
                            </div>
                        </div>
                        <dl data-reveal="" className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7 lg:col-start-6">
                            {facts.map((fact) => (
                                <div key={fact.label} className="grid gap-1 py-5 sm:grid-cols-[1fr_1.2fr] sm:gap-8">
                                    <dt className="text-sm text-white/55">{fact.label}</dt>
                                    <dd className="text-base font-medium text-white">{fact.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                <section aria-labelledby="work-heading" className="border-t border-white/10 px-4 py-20 sm:px-6 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <h2 data-reveal="" id="work-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-4">
                            What I work on
                        </h2>
                        <ul data-reveal="" className="divide-y divide-white/10 border-y border-white/10 lg:col-span-7 lg:col-start-6">
                            {work.map((area) => (
                                <li key={area.title}>
                                    <Link href={area.href} className="group/row flex flex-col gap-1 py-6 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                                        <span className="text-lg font-semibold transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:translate-x-2">
                                            {area.title}
                                        </span>
                                        <span className="text-sm text-white/55 sm:text-right">{area.body}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section aria-labelledby="contact-heading" className="border-t border-white/10 px-4 pb-24 pt-20 sm:px-6 lg:pb-32">
                    <div data-reveal="" className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
                        <h2 id="contact-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-4">
                            Get in touch
                        </h2>
                        <div className="lg:col-span-7 lg:col-start-6">
                            <p className="text-lg leading-8 text-white/75">
                                For custom production, collaborations, HealingWave or press, email{' '}
                                <TextLink href={`mailto:${founderEmail}`} inline>
                                    {founderEmail}
                                </TextLink>
                                .
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <TextLink href="https://www.linkedin.com/in/virzyguns/">LinkedIn</TextLink>
                                <TextLink href={MUSO_PROFILE_URL}>Full credits on Muso.ai</TextLink>
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        </PageTransition>
    );
}
