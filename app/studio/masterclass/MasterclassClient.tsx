'use client';

/**
 * Masterclass Page  -  Music Production Masterclass
 * Y3K Studio aesthetic with gradient orbs & enhanced cards
 * STATUS: IN R&D - Wrapped with visual lock
 */

import { m } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { RnDLock } from '@/components/ui/RnDLock';
import { Portal3DIcon } from '@/components/ui/Portal3DIcon';
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
        href: '#',
    },
    {
        id: 2,
        title: 'Music Production Guide: Trap Edition',
        description: 'The physics, math, and engineering behind professional trap music. A practical guide from beat to Spotify.',
        price: 'TBA',
        tag: 'COMING SOON',
        Icon: BookIcon,
        lessons: 'Book / PDF',
        href: '/book', // Linking to the book landing page
    },
    {
        id: 3,
        title: 'Modern Producer Workflow',
        description: 'Build faster sessions, cleaner decisions, and repeatable production systems without losing creative control.',
        price: 'TBA',
        tag: 'NEW',
        Icon: CircuitIcon,
        lessons: '8 Modules',
        href: '#',
    },
    {
        id: 4,
        title: 'Sonic Architecture',
        description: 'Deep dive into synthesis, sampling, and advanced sound design techniques.',
        price: 'TBA',
        tag: 'ADVANCED',
        Icon: WaveformIcon,
        lessons: '15 Modules',
        href: '#',
    },
    {
        id: 5,
        title: 'Mixing and Mastering',
        description: 'Professional mixing techniques for release ready tracks that compete commercially.',
        price: 'TBA',
        tag: 'POPULAR',
        Icon: SliderIcon,
        lessons: '10 Modules',
        href: '#',
    },
];

export default function MasterclassClient() {
    return (
        <PageTransition>
            {/* â•â•â• HERO â•â•â• */}
            <section className="relative py-24 sm:py-32 px-6 text-center overflow-hidden">
                {/* Gradient orbs  -  Studio pink theme */}
                <div className="absolute top-[-10%] right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,60,172,0.06)_0%,transparent_70%)] blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(180,74,255,0.05)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

                <div className="max-w-3xl mx-auto relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-25">
                        <Portal3DIcon portalId="masterclass" color="#FF3CAC" size={350} />
                    </div>

                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <p className="font-mono text-[0.55rem] tracking-[0.4em] text-[#FF3CAC]/60 mb-5 uppercase">
                            MASTERCLASS
                        </p>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-2">
                            <span className="block text-white">Music Production</span>
                            <span className="block text-white/35">Masterclass.</span>
                        </h1>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#FF3CAC]/60 mb-6">
                            100% Art. 100% Science.
                        </p>
                        <p className="text-[#6B7080] text-base sm:text-lg max-w-xl mx-auto">
                            Practical education for producers who want cleaner sound, sharper decisions, and stronger releases.
                        </p>
                    </m.div>
                </div>
            </section>

            {/* â•â•â• COURSES â•â•â• */}
            <section className="py-12 px-6 bg-[#0C0E14]/50">
                <div className="max-w-5xl mx-auto">
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
                                    {course.id !== 2 ? (
                                        <RnDLock
                                            variant="studio"
                                            moduleName={course.title.toUpperCase()}
                                            status="COMING SOON"
                                            showWaitlist={false}
                                        >
                                            <GlassCard className="h-full" padding="none" hover>
                                                <div className="flex h-full">
                                                    {/* Icon Side */}
                                                    <div className="w-28 shrink-0 flex items-center justify-center bg-[#06070B] border-r border-white/[0.04] text-[#3A3E48]">
                                                        <course.Icon />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 p-5 flex flex-col">
                                                        {course.tag && (
                                                            <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[#FF3CAC] mb-2">{course.tag}</span>
                                                        )}
                                                        <h3 className="text-base font-medium mb-1.5 tracking-[-0.03em]">{course.title}</h3>
                                                        <p className="text-[#6B7080] text-sm mb-3 flex-1 leading-relaxed">{course.description}</p>

                                                        <div className="flex items-center gap-3 text-xs text-[#3A3E48] font-mono tracking-[0.1em] mb-4">
                                                            <span>{course.lessons}</span>
                                                            <span>PDF + Video</span>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                                                            <span className="text-xl font-black text-[#FF3CAC]">{course.price}</span>
                                                            <GlowButton variant="ghost" size="sm">
                                                                Enroll
                                                            </GlowButton>
                                                        </div>
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </RnDLock>
                                    ) : (
                                        <GlassCard className="h-full" padding="none" hover>
                                            <div className="flex h-full">
                                                {/* Icon Side */}
                                                <div className="w-28 shrink-0 flex items-center justify-center bg-[#06070B] border-r border-white/[0.04] text-[#3A3E48]">
                                                    <course.Icon />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 p-5 flex flex-col">
                                                    {course.tag && (
                                                        <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[#FF3CAC] mb-2">{course.tag}</span>
                                                    )}
                                                    <h3 className="text-base font-medium mb-1.5 tracking-[-0.03em]">{course.title}</h3>
                                                    <p className="text-[#6B7080] text-sm mb-3 flex-1 leading-relaxed">{course.description}</p>

                                                    <div className="flex items-center gap-3 text-xs text-[#3A3E48] font-mono tracking-[0.1em] mb-4">
                                                        <span>{course.lessons}</span>
                                                        <span>Book / PDF</span>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                                                        <span className="text-xl font-black text-[#FF3CAC]">{course.price}</span>
                                                        <GlowButton variant="ghost" size="sm" href={course.href}>
                                                            View Details
                                                        </GlowButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    )}
                                </m.div>
                            ))}
                        </m.div>
                </div>
            </section>
        </PageTransition>
    );
}
