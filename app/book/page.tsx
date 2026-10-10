'use client';

/**
 * Producer Library & Book Index Page
 */

import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { EditorialButton, TextLink } from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';
import { LearnNav } from '@/components/learn/LearnNav';

const chapters = [
    { number: '01', title: 'The Trap Framework', desc: 'Song structure, the rhythm grid and how a trap beat is built.' },
    { number: '02', title: 'The Low End', desc: '808 tuning, how it sits with the kick, sidechain and translation.' },
    { number: '03', title: 'The Recording Session', desc: 'Microphone choice, distance and fixing problems before the mix.' },
    { number: '04', title: 'Vocal Processing', desc: 'EQ moves, compression, saturation, de-essing and space.' },
    { number: '05', title: 'Mixing the Full Track', desc: 'Balance, pan, depth, stereo width and reference tracks.' },
    { number: '06', title: 'Mastering for Streaming', desc: 'Loudness metering, peak levels, limiting and final delivery.' },
];

const facts = ['80+ pages', 'PDF for any device', '6 chapters'];

export default function GuidesPage() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <LearnNav current="book" />
            {/* <main> is the skip link's target (#main), as on the other Learn pages. */}
            <main id="main" tabIndex={-1} className="editorial-shell min-h-screen text-white focus:outline-none">
                <article>
                    <section data-enter="" className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
                        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
                            <div className="lg:col-span-7">
                                <p className="text-sm text-white/55">PDF, coming soon</p>
                                <h1 className="mt-4 max-w-[16ch] font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
                                    Music Production Guide: Trap Edition
                                </h1>
                                <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                                    A practical guide for turning creative instinct into decisions you can repeat, from drums and
                                    808s to vocals, mixing and mastering.
                                </p>
                                <p className="mt-3 text-sm text-white/60">
                                    By <span className="text-white">Virzy Guns</span>
                                </p>
                                <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                    <EditorialButton onClick={openPopup}>Email me at launch</EditorialButton>
                                    <TextLink href="/blog">Read the free lessons</TextLink>
                                </div>
                                <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-6 text-sm text-white/70">
                                    {facts.map((fact) => (
                                        <li key={fact}>{fact}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="lg:col-span-4 lg:col-start-9">
                                <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[4px] border border-white/10">
                                    <Image
                                        src="/ebooks/trap-guide-book-cover.jpg"
                                        alt="Cover of Music Production Guide: Trap Edition by Virzy Guns"
                                        width={815}
                                        height={1058}
                                        priority
                                        sizes="320px"
                                        className="h-auto w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section data-reveal="" aria-labelledby="contents-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                            <h2 id="contents-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-4">
                                Contents
                            </h2>
                            <ol className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                                {chapters.map((chapter) => (
                                    <li key={chapter.number} className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr]">
                                        <span className="font-display text-lg font-semibold tabular-nums text-white/50">{chapter.number}</span>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{chapter.title}</h3>
                                            <p className="mt-1 text-base leading-7 text-white/65">{chapter.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </section>

                    <section data-reveal="" className="border-t border-white/10 px-4 pb-24 pt-14 sm:px-6">
                        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="max-w-xl text-base leading-7 text-white/70">
                                The release date is not set yet. Leave your email and you will get one message when the PDF is out.
                            </p>
                            <EditorialButton onClick={openPopup}>Email me at launch</EditorialButton>
                        </div>
                    </section>
                </article>
            </main>
        </PageTransition>
    );
}
