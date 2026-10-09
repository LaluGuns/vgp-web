import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { PageHeader } from '@/components/editorial/EditorialPrimitives';
import { TapLink } from '@/components/blog/article/TapLink';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { StartHere } from '@/components/blog/paths/StartHere';
import { startLessons } from '@/components/blog/paths/startLessons';
import { SITE, breadcrumbs, pathsCollection } from '@/components/blog/paths/structured';
import { ScrollMemory } from '@/components/blog/useScrollMemory';
import { articles, categories } from '@/lib/blog-data';
import { learningPaths } from '@/lib/blog/paths';
import { glossary } from '@/lib/blog/glossary';
import { ogImage, socialMetadata } from '@/lib/og';

const title = 'Learn music production';
const description = `${articles.length} free music production lessons in ${learningPaths.length} learning paths, a glossary of ${glossary.length} terms, and a book and a course on the way. By Virzy Guns.`;
const url = `${SITE}/learn`;

export const metadata: Metadata = {
    title,
    description,
    alternates: {
        canonical: '/learn',
    },
    ...socialMetadata({
        title,
        description,
        url,
        image: ogImage({ kicker: 'Learn', title: 'Free music production lessons', sub: `${articles.length} lessons · ${learningPaths.length} paths · a glossary` }),
    }),
};

const formats = [
    {
        title: 'Lessons',
        status: `Free, ${articles.length} so far`,
        description: `${learningPaths.length} learning paths, from songwriting to mastering and the science of sound, with diagrams, listening demos, DAW experiments and quizzes.`,
        href: '/blog',
        cta: 'Browse the lessons',
    },
    {
        title: 'Music Production Guide: Trap Edition',
        status: 'PDF, coming soon',
        description: 'An 80+ page manual on drums, 808s, vocals, mix balance and mastering for release.',
        href: '/book',
        cta: 'See the chapters',
    },
    {
        title: 'Producer masterclass',
        status: 'In development',
        description: 'Video modules built from real sessions, from DAW setup to final master.',
        href: '/studio/masterclass',
        cta: 'See the planned modules',
    },
];

const categoryName = (slug: string) => categories.find((category) => category.slug === slug)?.name ?? slug;

const latestArticles = [...articles]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5);

export default function LearnHubPage() {
    return (
        <PageTransition>
            <JsonLd data={pathsCollection({ name: title, description, url, paths: learningPaths })} />
            <JsonLd data={breadcrumbs([{ name: 'Learn', url }])} />
            <ScrollMemory />
            <main id="main" tabIndex={-1} className="editorial-shell min-h-screen text-white focus:outline-none">
                <PageHeader
                    title="Learn production"
                    description={`${articles.length} free lessons in ${learningPaths.length} paths: songwriting, arrangement, sound design, vocals, mixing and mastering, audio science, music psychology, producer mindset, production tips, genres and licensing. A book and a course are on the way.`}
                    primary={{ label: 'Browse the lessons', href: '/blog' }}
                />

                <section data-reveal="" aria-labelledby="paths-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <h2 id="paths-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                {learningPaths.length} learning paths
                            </h2>
                            <p className="mt-4 max-w-sm text-base leading-7 text-white/65">Each path is a set of lessons meant to be read in order.</p>
                            <StartHere lessons={startLessons()} className="mt-3 max-w-sm" />
                            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
                                Stuck on a term?{' '}
                                <TapLink href="/learn/glossary" className="text-white">
                                    The glossary explains {glossary.length} of them
                                </TapLink>
                            </p>
                        </div>
                        <ul className="grid border-t border-white/10 sm:grid-cols-2 sm:gap-x-10 lg:col-span-8">
                            {learningPaths.map((path) => (
                                <li key={path.category.slug} className="border-b border-white/10">
                                    <Link
                                        href={`/blog/category/${path.category.slug}`}
                                        className="group flex min-h-11 items-baseline justify-between gap-4 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        <span className="text-lg font-semibold text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            {path.category.name}
                                        </span>
                                        <span className="shrink-0 text-xs tabular-nums text-white/55">{path.articles.length} lessons</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section data-reveal="" aria-labelledby="formats-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <h2 id="formats-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-4">
                            Three formats
                        </h2>
                        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                            {formats.map((format) => (
                                <li key={format.title} className="py-7">
                                    <p className="text-xs font-medium text-white/50">{format.status}</p>
                                    <h3 className="mt-2 text-xl font-semibold text-white">{format.title}</h3>
                                    <p className="mt-2 max-w-xl text-base leading-7 text-white/65">{format.description}</p>
                                    <p className="mt-1">
                                        <TapLink href={format.href} className="text-sm font-medium text-white">
                                            {format.cta}
                                        </TapLink>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section data-reveal="" aria-labelledby="latest-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <h2 id="latest-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                Latest lessons
                            </h2>
                            <div className="mt-3 flex flex-col items-start text-sm font-medium text-white">
                                <TapLink href="/blog">All lessons</TapLink>
                                <TapLink href="/learn/glossary">Glossary of {glossary.length} terms</TapLink>
                            </div>
                        </div>
                        <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                            {latestArticles.map((article) => (
                                <li key={article.slug}>
                                    <Link
                                        href={`/blog/${article.slug}`}
                                        className="group block py-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        <span className="text-xs text-white/50">
                                            {categoryName(article.category)} · {article.readingTime} min read
                                        </span>
                                        <h3 className="mt-2 text-lg font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            {article.title}
                                        </h3>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section data-reveal="" aria-labelledby="book-heading" className="border-t border-white/10 px-4 pb-24 pt-16 sm:px-6 lg:pt-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-center">
                        <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-[4px] border border-white/10 lg:col-span-4 lg:mx-0">
                            <Image
                                src="/ebooks/trap-guide-book-cover.jpg"
                                alt="Cover of Music Production Guide: Trap Edition by Virzy Guns"
                                width={815}
                                height={1058}
                                sizes="320px"
                                className="h-auto w-full"
                            />
                        </div>
                        <div className="lg:col-span-7 lg:col-start-6">
                            <p className="text-xs font-medium text-white/50">PDF, coming soon</p>
                            <h2 id="book-heading" className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                Music Production Guide: Trap Edition
                            </h2>
                            <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
                                More than 80 pages on 808 tuning, vocal processing, mix balance and loudness for streaming.
                                Written for producers who want a method they can repeat.
                            </p>
                            <p className="mt-6">
                                <TapLink href="/book" className="text-sm font-medium text-white">
                                    See what is inside
                                </TapLink>
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
