'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import {
    ArrowRight,
    AudioWaveform,
    BookOpen,
    CircuitBoard,
    SlidersHorizontal,
    type LucideIcon,
} from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import {
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';
import { RnDLock } from '@/components/ui/RnDLock';
import { staggerChild, staggerParent } from '@/lib/motion-presets';

interface Course {
    id: number;
    title: string;
    description: string;
    price: string;
    tag: string;
    Icon: LucideIcon;
    lessons: string;
    format: string;
    href: string;
}

const courses: Course[] = [
    {
        id: 1,
        title: 'Music Production Fundamentals',
        description: 'The foundational blueprint for professional music production. From DAW setup to final export.',
        price: 'TBA',
        tag: 'FOUNDATION',
        Icon: BookOpen,
        lessons: '12 Modules',
        format: 'PDF + Video',
        href: '#',
    },
    {
        id: 2,
        title: 'Music Production Guide: Trap Edition',
        description: 'Rhythm, low end, vocals, mixing, and release decisions for producers who want repeatable results.',
        price: 'TBA',
        tag: 'COMING SOON',
        Icon: BookOpen,
        lessons: 'Book / PDF',
        format: 'Digital guide',
        href: '/book',
    },
    {
        id: 3,
        title: 'Modern Producer Workflow',
        description: 'Build faster sessions, cleaner decisions, and repeatable production systems without losing creative control.',
        price: 'TBA',
        tag: 'WORKFLOW',
        Icon: CircuitBoard,
        lessons: '8 Modules',
        format: 'PDF + Video',
        href: '#',
    },
    {
        id: 4,
        title: 'Sonic Architecture',
        description: 'Deep dive into synthesis, sampling, and advanced sound design techniques.',
        price: 'TBA',
        tag: 'SOUND DESIGN',
        Icon: AudioWaveform,
        lessons: '15 Modules',
        format: 'PDF + Video',
        href: '#',
    },
    {
        id: 5,
        title: 'Mixing and Mastering',
        description: 'Professional mixing techniques for release ready tracks that compete commercially.',
        price: 'TBA',
        tag: 'MIX SYSTEMS',
        Icon: SlidersHorizontal,
        lessons: '10 Modules',
        format: 'PDF + Video',
        href: '#',
    },
];

function CourseContent({ course }: { course: Course }) {
    const { Icon } = course;

    return (
        <>
            <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/70">{course.tag}</span>
            </div>

            <div className="mt-8 flex-1">
                <h3 className="text-xl font-semibold leading-tight text-white">{course.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/70">{course.description}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/[0.08] pt-4 text-xs font-medium text-white/50">
                <span>{course.lessons}</span>
                <span>{course.format}</span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-xl font-semibold text-white">{course.price}</span>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-100/80">
                    {course.id === 2 ? 'View details' : 'Enroll'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
            </div>
        </>
    );
}

export default function MasterclassClient() {
    return (
        <PageTransition>
            <article className="editorial-shell min-h-screen text-white">
                <PageHeader
                    eyebrow="VGP Masterclass"
                    title="Music production"
                    mutedTitle="without the mystique."
                    description="Practical education for producers who want cleaner sound, sharper decisions, and stronger releases."
                />

                <SectionShell className="pt-4">
                    <div className="mx-auto max-w-5xl">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">Learning catalog</p>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">Build better production decisions.</h2>
                            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                                Focused guides and courses for songwriting, sound design, workflow, mixing, and mastering.
                            </p>
                        </div>

                        <m.div
                            className="mt-9 grid gap-4 md:grid-cols-2"
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {courses.map((course) => {
                                const cardClass = 'flex min-h-[22rem] flex-col rounded-lg border border-white/[0.1] bg-white/[0.025] p-5 sm:min-h-[20rem] sm:p-6';

                                return (
                                    <m.div key={course.id} variants={staggerChild} className="h-full">
                                        {course.id === 2 ? (
                                            <Link
                                                href={course.href}
                                                className={`${cardClass} group transition hover:-translate-y-1 hover:border-sky-200/30 hover:bg-white/[0.045] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030405]`}
                                            >
                                                <CourseContent course={course} />
                                            </Link>
                                        ) : (
                                            <RnDLock
                                                variant="studio"
                                                moduleName={course.title}
                                                status="Coming soon"
                                                showWaitlist={false}
                                            >
                                                <article className={cardClass}>
                                                    <CourseContent course={course} />
                                                </article>
                                            </RnDLock>
                                        )}
                                    </m.div>
                                );
                            })}
                        </m.div>
                    </div>
                </SectionShell>
            </article>
        </PageTransition>
    );
}
