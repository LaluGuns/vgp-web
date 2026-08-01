'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import {
    ArrowRight,
    AudioWaveform,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    CircuitBoard,
    SlidersHorizontal,
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    EditorialButton,
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { useNewsletter } from '@/components/context/NewsletterContext';

const courseModules = [
    {
        id: 'module-1',
        title: 'Module 1: DAW Blueprint & Signal Architecture',
        description: 'Template creation, gain staging, routing channels, and setting up bulletproof session defaults.',
        topics: ['Gain staging standards', 'Bus routing & stem export', 'CPU optimization & latency setup'],
    },
    {
        id: 'module-2',
        title: 'Module 2: Rhythmic Operating Systems & Drum Physics',
        description: 'Grid manipulation, velocity dynamics, swing control, and 808 pitch relationship with kicks.',
        topics: ['808 phase alignment & sidechain', 'Velocity humanization techniques', 'Hi-hat triplet roll formulas'],
    },
    {
        id: 'module-3',
        title: 'Module 3: Vocal Processing & Spatial Design',
        description: 'Surgical EQ, dual-stage compression, vocal tuning, satellite delays, and reverb depth control.',
        topics: ['Lead vocal EQ cuts & boosts', 'De-essing & sibilance control', 'Stereo width & 3D placement'],
    },
    {
        id: 'module-4',
        title: 'Module 4: Commercial Mixing & Mastering Systems',
        description: 'Frequency separation, dynamic EQ, saturation, loudness metering, and streaming peak delivery.',
        topics: ['Reference mix matching', 'LUFS target metering (-8 to -14)', 'Final limiting & dither export'],
    },
];

export default function MasterclassClient() {
    const { openPopup } = useNewsletter();
    const [openAccordion, setOpenAccordion] = useState<string | null>('module-1');

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <PageHeader
                    eyebrow="VGP Masterclass"
                    title="Music production"
                    mutedTitle="without the mystique."
                    description="Practical education for producers who want cleaner sound, sharper decisions, and commercial release readiness."
                />

                <SectionShell className="pt-4">
                    <div className="mx-auto max-w-4xl">
                        {/* Course Status Card */}
                        <div className="liquid-glass-strong rounded-2xl border border-white/10 p-6 sm:p-10">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                                <div>
                                    <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
                                        Enrollment Not Currently Open
                                    </span>
                                    <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                                        Commercial Production Roadmap
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold text-white/50">Status</span>
                                    <p className="text-sm font-semibold text-white">In Active Development</p>
                                </div>
                            </div>

                            <p className="mt-6 text-base leading-7 text-white/70">
                                We are structuring a comprehensive video masterclass and session breakdown series. Enrollment is currently closed while curriculum modules are finalized.
                            </p>

                            {/* Waitlist Action */}
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <EditorialButton onClick={openPopup}>
                                    Join Masterclass Waitlist
                                </EditorialButton>
                                <Link
                                    href="/book"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-6 text-sm font-semibold text-white transition hover:border-white/30"
                                >
                                    <BookOpen size={16} />
                                    <span>Explore Trap Edition Book</span>
                                </Link>
                            </div>
                        </div>

                        {/* Curriculum Accordion Previews */}
                        <div className="mt-12">
                            <h3 className="text-xl font-semibold text-white mb-6">Upcoming Curriculum Overview</h3>
                            <div className="grid gap-3">
                                {courseModules.map((mod) => {
                                    const isOpen = openAccordion === mod.id;
                                    return (
                                        <div
                                            key={mod.id}
                                            className="rounded-xl border border-white/10 bg-white/[0.025] transition hover:border-white/20"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleAccordion(mod.id)}
                                                className="flex w-full items-center justify-between p-5 text-left"
                                            >
                                                <span className="text-base font-semibold text-white">{mod.title}</span>
                                                <ChevronDown
                                                    size={18}
                                                    className={`text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            {isOpen && (
                                                <div className="border-t border-white/10 px-5 pb-5 pt-3">
                                                    <p className="text-sm leading-6 text-white/65">{mod.description}</p>
                                                    <ul className="mt-4 space-y-2">
                                                        {mod.topics.map((t) => (
                                                            <li key={t} className="flex items-center gap-2 text-xs text-white/60">
                                                                <CheckCircle2 size={14} className="text-sky-300 shrink-0" />
                                                                <span>{t}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
