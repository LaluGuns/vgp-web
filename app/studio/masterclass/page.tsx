'use client';

/**
 * Masterclass Page - Music Production Masterclass
 * STATUS: IN R&D - Wrapped with visual lock
 */

import { m } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { RnDLock } from '@/components/ui/RnDLock';
import { staggerParent, staggerChild } from '@/lib/motion-presets';

// Y3K Minimal Icons
const BookIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 7h8M8 11h5" strokeLinecap="round" />
    </svg>
);

const CircuitIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
        <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
    </svg>
);

const WaveformIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12h2l2-6 3 12 3-8 2 4 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SliderIcon = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" strokeLinecap="round" />
        <circle cx="4" cy="12" r="2" />
        <circle cx="12" cy="10" r="2" />
        <circle cx="20" cy="14" r="2" />
    </svg>
);

const courses = [
    {
        id: 1,
        title: 'Music Production Fundamentals',
        description: 'The foundational blueprint for professional music production. From DAW setup to final export.',
        price: '$29',
        tag: 'BESTSELLER',
        Icon: BookIcon,
        lessons: '12 Modules',
    },
    {
        id: 2,
        title: 'AI Era Producer Workflow',
        description: 'Leverage AI tools to 10x your production speed without losing creative control.',
        price: '$39',
        tag: 'NEW',
        Icon: CircuitIcon,
        lessons: '8 Modules',
    },
    {
        id: 3,
        title: 'Sonic Architecture',
        description: 'Deep dive into synthesis, sampling, and advanced sound design techniques.',
        price: '$49',
        tag: 'ADVANCED',
        Icon: WaveformIcon,
        lessons: '15 Modules',
    },
    {
        id: 4,
        title: 'Mixing and Mastering',
        description: 'Professional mixing techniques for release ready tracks that compete commercially.',
        price: '$35',
        tag: 'POPULAR',
        Icon: SliderIcon,
        lessons: '10 Modules',
    },
];

export default function MasterclassPage() {
    return (
        <PageTransition>
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <SectionHeader
                        label="MASTERCLASS"
                        title="Music Production Masterclass"
                        description="Curated knowledge to accelerate your production journey."
                    />

                    {/* R&D Lock Wrapper */}
                    <RnDLock
                        variant="studio"
                        moduleName="MASTERCLASS"
                        status="IN DEVELOPMENT"
                        eta="Q2 2026"
                    >
                        {/* Courses Grid */}
                        <m.div
                            className="grid md:grid-cols-2 gap-6"
                            variants={staggerParent}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {courses.map((course) => (
                                <m.div key={course.id} variants={staggerChild}>
                                    <GlassCard className="h-full" padding="none" hover>
                                        <div className="flex h-full">
                                            {/* Icon Side */}
                                            <div className="w-28 shrink-0 flex items-center justify-center bg-carbon border-r border-white/5 text-dim-grey">
                                                <course.Icon />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-5 flex flex-col">
                                                {course.tag && (
                                                    <span className="mono-label text-primary text-xs mb-2">{course.tag}</span>
                                                )}
                                                <h3 className="text-base font-medium mb-1.5 tracking-apple">{course.title}</h3>
                                                <p className="text-cool-grey text-sm mb-3 flex-1 leading-relaxed">{course.description}</p>

                                                <div className="flex items-center gap-3 text-xs text-dim-grey mb-4">
                                                    <span>{course.lessons}</span>
                                                    <span>PDF + Video</span>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                    <span className="text-xl font-semibold text-primary">{course.price}</span>
                                                    <GlowButton variant="ghost" size="sm">
                                                        Enroll
                                                    </GlowButton>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </m.div>
                            ))}
                        </m.div>

                        {/* Bundle */}
                        <m.div
                            className="mt-12 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <GlassCard className="inline-block" padding="lg" glow="subtle">
                                <p className="mono-label text-primary mb-2">COMPLETE BUNDLE</p>
                                <h3 className="text-xl font-semibold mb-2">All Masterclass Package</h3>
                                <p className="text-cool-grey text-sm mb-4">All current and future courses at 40% off.</p>
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <span className="text-dim-grey line-through">$153</span>
                                    <span className="text-2xl font-semibold text-primary">$89</span>
                                </div>
                                <GlowButton variant="primary" size="md">
                                    Get Bundle
                                </GlowButton>
                            </GlassCard>
                        </m.div>
                    </RnDLock>
                </div>
            </section>
        </PageTransition>
    );
}
