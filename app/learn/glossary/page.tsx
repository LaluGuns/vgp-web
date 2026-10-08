import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTransition } from '@/components/PageTransition';
import { TextLink } from '@/components/editorial/EditorialPrimitives';
import { getArticleBySlug } from '@/lib/blog-data';
import { glossary } from '@/lib/blog/glossary';

export const metadata: Metadata = {
    title: 'Music Production Glossary | VGP Learn',
    description: 'Plain definitions of the terms used across the VGP articles: loudness, dynamics, EQ, phase, sampling, groove, vocals and more.',
    alternates: { canonical: '/learn/glossary' },
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
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="editorial-shell min-h-screen text-white">
                <section data-enter="" className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
                    <div className="mx-auto max-w-7xl">
                        <TextLink href="/learn">Learn</TextLink>
                        <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Glossary</h1>
                        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                            {terms.length} terms from the articles, in plain words. In an article, tap a dotted word to see its definition without leaving the page.
                        </p>
                    </div>
                </section>

                <section className="px-4 pb-20 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <nav aria-label="Jump to letter" className="sticky top-16 z-10 -mx-4 flex gap-1 overflow-x-auto border-y border-white/10 bg-[var(--bg)] px-4 py-3 sm:mx-0 sm:flex-wrap sm:px-0">
                            {letters.map((letter) => (
                                <a
                                    key={letter}
                                    href={`#letter-${letter}`}
                                    className="flex h-9 min-w-9 items-center justify-center rounded-md text-sm font-medium text-white/65 hover:bg-white/[0.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                >
                                    {letter}
                                </a>
                            ))}
                        </nav>

                        <div className="max-w-3xl">
                            {letters.map((letter) => (
                                <section key={letter} aria-labelledby={`letter-${letter}`} className="pt-8">
                                    <h2 id={`letter-${letter}`} className="scroll-mt-36 text-sm font-medium text-white/55">
                                        {letter}
                                    </h2>
                                    <dl>
                                        {terms
                                            .filter((t) => initial(t.term) === letter)
                                            .map((term) => {
                                                const article = term.article ? getArticleBySlug(term.article) : undefined;
                                                return (
                                                    <div key={term.id} id={term.id} className="scroll-mt-36 border-b border-white/10 py-6">
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
