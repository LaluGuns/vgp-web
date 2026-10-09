import type { ReactNode } from 'react';
import { founderEmail } from '@/lib/founder-contact';
import { TextLink } from '@/components/editorial/EditorialPrimitives';

export type PolicySection = {
    id?: string;
    title: string;
    content: ReactNode;
};

/** Reading layout for legal pages: one column, numbered sections, hairline rules. */
export function PolicyPage({
    eyebrow,
    title,
    summary,
    effectiveDate,
    sections,
}: {
    eyebrow: string;
    title: string;
    summary: string;
    effectiveDate: string;
    sections: PolicySection[];
}) {
    return (
        <article className="editorial-shell min-h-screen text-white">
            <header className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
                <div className="mx-auto max-w-3xl">
                    <p className="text-sm text-white/55">{eyebrow}</p>
                    <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-white/75">{summary}</p>
                    <p className="mt-5 text-sm text-white/55">Effective {effectiveDate}</p>
                </div>
            </header>

            <div className="px-4 pb-24 sm:px-6">
                <div className="mx-auto max-w-3xl border-t border-white/10">
                    {sections.map((section, index) => (
                        <section
                            key={section.id ?? section.title}
                            id={section.id}
                            className="scroll-mt-2 border-b border-white/10 py-10"
                        >
                            <h2 className="flex gap-4 text-xl font-semibold text-white">
                                <span className="w-7 shrink-0 tabular-nums text-white/45">{index + 1}.</span>
                                <span>{section.title}</span>
                            </h2>
                            <div className="mt-4 space-y-4 text-base leading-8 text-white/75 sm:pl-11">
                                {section.content}
                            </div>
                        </section>
                    ))}

                    <section className="py-10">
                        <h2 className="text-xl font-semibold text-white">Contact</h2>
                        <p className="mt-4 text-base leading-8 text-white/75">
                            Virzy Guns Production is operated by Virzy Guns. Send questions, privacy requests and data
                            deletion requests to{' '}
                            <TextLink href={`mailto:${founderEmail}`} inline>
                                {founderEmail}
                            </TextLink>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </article>
    );
}
