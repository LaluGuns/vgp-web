import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { JsonLd } from '@/components/blog/article/JsonLd';
import { TapLink } from '@/components/blog/article/TapLink';
import { getArticleBySlug } from '@/lib/blog-data';
import { glossary } from '@/lib/blog/glossary';
import { ogImage } from '@/lib/og';

const description = `Plain definitions of the ${glossary.length} terms used in the lessons: loudness, dynamics, EQ, phase, sampling, groove, vocals and more.`;
const card = ogImage({ kicker: 'Glossary', title: 'Music production terms, in plain words', sub: `${glossary.length} terms from the lessons · Virzy Guns` });

export const metadata: Metadata = {
    title: 'Music production glossary',
    description,
    alternates: { canonical: '/learn/glossary' },
    openGraph: {
        title: 'Music production glossary',
        description,
        type: 'website',
        url: 'https://www.virzyguns.com/learn/glossary',
        images: [card],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Music production glossary',
        description,
        images: [card.url],
    },
};

const terms = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
const initial = (term: string) => term[0].toUpperCase().replace(/[^A-Z]/, '#');
const letters = Array.from(new Set(terms.map((t) => initial(t.term))));

export default function GlossaryPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'Music production glossary',
        url: 'https://www.virzyguns.com/learn/glossary',
        hasDefinedTerm: terms.map((t) => ({
            '@type': 'DefinedTerm',
            name: t.term,
            description: t.definition,
            url: `https://www.virzyguns.com/learn/glossary#${t.id}`,
        })),
    };

    return (
        <PageTransition>
            <JsonLd data={jsonLd} />
            <main id="main" tabIndex={-1} className="editorial-shell min-h-screen text-white focus:outline-none">
                <section data-enter="" className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <nav aria-label="Breadcrumb" className="-my-3 flex flex-wrap gap-x-2 text-sm font-medium text-white">
                            <TapLink href="/learn">Learn</TapLink>
                            <span aria-hidden="true" className="self-center text-white/55">
                                /
                            </span>
                            <TapLink href="/blog">Lessons</TapLink>
                        </nav>
                        <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Glossary</h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                            {terms.length} terms from the lessons, in plain words. In a lesson, tap a dotted word to see its definition without leaving the page.
                        </p>
                    </div>
                </section>

                <section className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <nav aria-label="Jump to letter" className="sticky top-16 z-10 -mx-4 flex gap-0.5 overflow-x-auto border-y border-white/10 bg-[var(--bg)] px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:px-0">
                            {letters.map((letter) => (
                                <a
                                    key={letter}
                                    href={`#letter-${letter}`}
                                    className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-sm font-medium text-white/65 hover:bg-white/[0.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                >
                                    {letter}
                                </a>
                            ))}
                        </nav>

                        <div className="max-w-3xl">
                            {letters.map((letter) => (
                                <section key={letter} aria-labelledby={`letter-${letter}`} className="pt-8">
                                    <h2 id={`letter-${letter}`} className="scroll-mt-10 text-sm font-medium text-white/55">
                                        {letter}
                                    </h2>
                                    <dl>
                                        {terms
                                            .filter((t) => initial(t.term) === letter)
                                            .map((term) => {
                                                const article = term.article ? getArticleBySlug(term.article) : undefined;
                                                return (
                                                    <div key={term.id} id={term.id} className="scroll-mt-10 border-b border-white/10 py-6">
                                                        <dt className="text-lg font-semibold text-white">{term.term}</dt>
                                                        <dd className="mt-2 text-base leading-7 text-white/75">{term.definition}</dd>
                                                        {article ? (
                                                            <dd className="mt-2 text-sm text-white/55">
                                                                Explained in{' '}
                                                                <Link href={`/blog/${article.slug}`} className="vgp-link text-white/80 hover:text-white">
                                                                    {article.title}
                                                                </Link>
                                                            </dd>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                    </dl>
                                </section>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </PageTransition>
    );
}
