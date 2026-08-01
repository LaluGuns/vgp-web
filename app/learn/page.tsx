import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, GraduationCap, Newspaper, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/PageTransition';
import { CinematicBackdrop, EditorialButton, PageHeader, SectionShell } from '@/components/editorial/EditorialPrimitives';

export const metadata: Metadata = {
    title: 'Learn Hub | Music Production Articles, Books & Courses | VGP',
    description:
        'Practical music production education for beatmakers and producers. Access free articles, 808 tuning guides, producer manuals, and mixing courses by Virzy Guns.',
    alternates: {
        canonical: '/learn',
    },
};

const learnCategories = [
    {
        title: 'Articles & Tutorials',
        eyebrow: 'Free Producer Notes',
        href: '/blog',
        cta: 'Read Free Articles',
        Icon: Newspaper,
        status: 'Free',
        badgeColor: 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30',
        description:
            'Free practical breakdowns on trap drums, 808 physics, beat licensing, vocal processing, and mixing decisions.',
        highlights: [
            'How to tune 808s with your kick drum',
            'Understanding non-exclusive vs exclusive beat licenses',
            'Vocal chain fundamentals for modern trap',
        ],
    },
    {
        title: 'Books & Manuals',
        eyebrow: 'Structured Manuals',
        href: '/book',
        cta: 'Browse Books',
        Icon: BookOpen,
        status: 'Coming Soon',
        badgeColor: 'bg-amber-400/15 text-amber-200 ring-amber-400/30',
        description:
            'Comprehensive long-form production manuals and workbooks built to turn creative instinct into repeatable systems.',
        highlights: [
            'Music Production Guide: Trap Edition',
            '6 core chapters spanning 80+ pages',
            'PDF book format — launch date to be announced',
        ],
    },
    {
        title: 'Producer Masterclasses',
        eyebrow: 'Guided Courses',
        href: '/studio/masterclass',
        cta: 'View Course Roadmap',
        Icon: GraduationCap,
        status: 'Coming Soon',
        badgeColor: 'bg-amber-400/15 text-amber-200 ring-amber-400/30',
        description:
            'In-depth video modules and DAW session breakdowns for producers who want commercial release readiness.',
        highlights: [
            'Modern Producer Workflow',
            'Sonic Architecture & Sound Design',
            'Commercial Mixing & Mastering Systems',
        ],
    },
];

export default function LearnHubPage() {
    return (
        <PageTransition>
            <main className="editorial-shell min-h-screen text-white">
                {/* Hero */}
                <PageHeader
                    eyebrow="VGP Learn Hub"
                    title="Practical music production education."
                    mutedTitle="Articles, books, and courses for producers."
                    description="Beatmaking, 808 physics, sound design, mixing decisions, and beat licensing breakdown notes by Virzy Guns."
                />

                {/* Content Types Overview */}
                <SectionShell className="pt-2">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-10 max-w-2xl">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">
                                Three Ways To Learn
                            </span>
                            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                Choose the depth that matches your goal.
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {learnCategories.map((cat) => {
                                const { Icon } = cat;
                                return (
                                    <div
                                        key={cat.title}
                                        className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-sky-200/25 hover:bg-white/[0.045]"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                                    <Icon size={20} />
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cat.badgeColor}`}>
                                                    {cat.status}
                                                </span>
                                            </div>

                                            <span className="mt-6 block text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/60">
                                                {cat.eyebrow}
                                            </span>
                                            <h3 className="mt-2 text-xl font-semibold text-white">{cat.title}</h3>
                                            <p className="mt-3 text-sm leading-6 text-white/65">{cat.description}</p>

                                            <ul className="mt-6 space-y-2 border-t border-white/10 pt-4">
                                                {cat.highlights.map((item) => (
                                                    <li key={item} className="flex items-start gap-2 text-xs text-white/55">
                                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-8 pt-4">
                                            <Link
                                                href={cat.href}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-200 transition hover:text-white"
                                            >
                                                <span>{cat.cta}</span>
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </SectionShell>

                {/* Featured Book Showcase */}
                <SectionShell className="border-t border-white/[0.08] bg-white/[0.015] py-16">
                    <div className="mx-auto max-w-6xl">
                        <div className="liquid-glass-strong grid gap-8 rounded-2xl p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            <div>
                                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/70">
                                    <Sparkles size={14} className="text-sky-300" />
                                    Featured Release
                                </span>
                                <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                    Music Production Guide: Trap Edition
                                </h2>
                                <p className="mt-4 text-base leading-7 text-white/70">
                                    A practical 80+ page guide detailing 808 tuning, vocal processing, mixing balance, and release metering for modern producers.
                                </p>

                                <div className="mt-8 flex flex-wrap items-center gap-4">
                                    <EditorialButton href="/book">View Book Details</EditorialButton>
                                    <EditorialButton href="/blog" variant="ghost">Read Free Excerpts</EditorialButton>
                                </div>
                            </div>

                            <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-xl bg-neutral-950 shadow-2xl ring-1 ring-white/10">
                                <Image
                                    src="/ebooks/trap-guide-book-cover.jpg"
                                    alt="Music Production Guide: Trap Edition"
                                    width={815}
                                    height={1058}
                                    className="h-auto w-full"
                                />
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </main>
        </PageTransition>
    );
}
