import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageTransition } from '@/components/PageTransition';
import { PageHeader, TextLink } from '@/components/editorial/EditorialPrimitives';
import { articles, categories } from '@/lib/blog-data';
import { learningPaths } from '@/lib/blog/paths';
import { glossary } from '@/lib/blog/glossary';

export const metadata: Metadata = {
    title: 'Learn Hub | Music Production Articles, Books & Courses | VGP',
    description:
        'Practical music production education for beatmakers and producers. Access free articles, 808 tuning guides, producer manuals, and mixing courses by Virzy Guns.',
    alternates: {
        canonical: '/learn',
    },
};

const formats = [
    {
        title: 'Articles',
        status: `Free, ${articles.length} so far`,
        description: `Lessons in ${learningPaths.length} learning paths, from songwriting to mastering and the science of sound, with diagrams, listening demos, DAW experiments and quizzes.`,
        href: '/blog',
        cta: 'Read the articles',
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
            <main className="editorial-shell min-h-screen text-white">
                <PageHeader
                    title="Learn production"
                    description="Free articles on drums, 808s, mixing and licensing by Virzy Guns, with a book and a course on the way."
                    primary={{ label: 'Read the articles', href: '/blog' }}
                    secondary={{ label: 'Trap Edition guide', href: '/book' }}
                />

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
                                    <div className="mt-4">
                                        <TextLink href={format.href}>{format.cta}</TextLink>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section data-reveal="" aria-labelledby="latest-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <h2 id="latest-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                Latest articles
                            </h2>
                            <div className="mt-5 flex flex-col items-start gap-3">
                                <TextLink href="/blog">All articles</TextLink>
                                <TextLink href="/learn/glossary">Glossary of {glossary.length} terms</TextLink>
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
                                        <span className="mt-2 block text-lg font-semibold leading-snug text-white group-hover:underline group-hover:decoration-white/40 group-hover:underline-offset-4">
                                            {article.title}
                                        </span>
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
                            <div className="mt-8">
                                <TextLink href="/book">See what is inside</TextLink>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
