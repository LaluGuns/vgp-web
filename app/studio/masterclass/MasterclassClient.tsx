'use client';

import { PageTransition } from '@/components/PageTransition';
import { PageHeader } from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';

const courseModules = [
    {
        title: 'DAW Blueprint & Signal Architecture',
        description: 'Template creation, gain staging, channel routing and reliable session defaults.',
        topics: ['Gain staging standards', 'Bus routing & stem export', 'CPU optimization & latency setup'],
    },
    {
        title: 'Rhythmic Operating Systems & Drum Physics',
        description: 'Grid work, velocity dynamics, swing control and how the 808 pitch sits with the kick.',
        topics: ['808 phase alignment & sidechain', 'Velocity humanization techniques', 'Hi-hat triplet roll formulas'],
    },
    {
        title: 'Vocal Processing & Spatial Design',
        description: 'Surgical EQ, two-stage compression, tuning, delays and reverb depth.',
        topics: ['Lead vocal EQ cuts & boosts', 'De-essing & sibilance control', 'Stereo width & 3D placement'],
    },
    {
        title: 'Commercial Mixing & Mastering Systems',
        description: 'Frequency separation, dynamic EQ, saturation, loudness metering and streaming delivery.',
        topics: ['Reference mix matching', 'LUFS target metering (-8 to -14)', 'Final limiting & dither export'],
    },
];

export default function MasterclassClient() {
    const { openPopup } = useNewsletter();

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <PageHeader
                    eyebrow="In development, enrollment closed"
                    title="Producer masterclass"
                    description="A video course on drums, 808s, vocals, mixing and mastering, taught from real sessions. The modules are still being recorded."
                    primary={{ label: 'Email me when it opens', onClick: openPopup }}
                    secondary={{ label: 'Read the Trap Edition guide', href: '/book' }}
                />

                <section data-reveal="" aria-labelledby="curriculum-heading" className="border-t border-white/10 px-4 pb-24 pt-16 sm:px-6 lg:pt-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <h2 id="curriculum-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-4">
                            Planned modules
                        </h2>
                        <ol className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                            {courseModules.map((mod, index) => (
                                <li key={mod.title} className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr]">
                                    <span className="font-display text-lg font-semibold tabular-nums text-white/50">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{mod.title}</h3>
                                        <p className="mt-2 max-w-xl text-base leading-7 text-white/70">{mod.description}</p>
                                        <ul className="mt-4 grid gap-1.5 text-sm leading-6 text-white/60">
                                            {mod.topics.map((topic) => (
                                                <li key={topic}>{topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            </article>
        </PageTransition>
    );
}
