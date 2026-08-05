import Link from 'next/link';
import type { ReactNode } from 'react';
import { founderEmail } from '@/lib/founder-contact';

type PolicySection = {
    title: string;
    content: ReactNode;
};

export function ProviderPolicyPage({
    eyebrow,
    title,
    summary,
    sections,
}: {
    eyebrow: string;
    title: string;
    summary: string;
    sections: PolicySection[];
}) {
    return (
        <article className="editorial-shell min-h-screen text-white">
            <header className="relative overflow-hidden px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
                <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.14),transparent_42%),linear-gradient(180deg,rgba(3,4,5,0)_0%,#030405_92%)]"
                    aria-hidden="true"
                />
                <div className="relative z-10 mx-auto max-w-4xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/60">
                        {eyebrow}
                    </p>
                    <h1 className="mt-5 font-display text-4xl font-normal leading-[1.02] text-white sm:text-6xl">
                        {title}
                    </h1>
                    <p className="mt-6 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
                        {summary}
                    </p>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                        Effective August 5, 2026
                    </p>
                </div>
            </header>

            <section className="relative px-4 pb-20 sm:px-6 sm:pb-24">
                <div className="mx-auto max-w-4xl space-y-4">
                    {sections.map((section, index) => (
                        <section key={section.title} className="liquid-glass rounded-lg p-6 sm:p-8">
                            <div className="flex gap-4 sm:gap-6">
                                <span className="mt-1 text-xs font-semibold tabular-nums text-sky-200/45" aria-hidden="true">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                                    <div className="mt-4 space-y-4 text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                                        {section.content}
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}

                    <div className="liquid-glass-strong rounded-lg p-6 sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/55">
                            Owner contact
                        </p>
                        <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                            Virzy Guns Production is operated by Virzy Guns. Questions, privacy requests,
                            and data deletion requests may be sent to{' '}
                            <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href={`mailto:${founderEmail}`}>
                                {founderEmail}
                            </a>
                            .
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
                            <Link className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-white/70 transition hover:border-white/25 hover:text-white" href="/">
                                Official website
                            </Link>
                            <Link className="rounded-full border border-sky-300/20 bg-sky-300/[0.08] px-4 py-2 text-sky-100 transition hover:border-sky-200/40 hover:text-white" href="/founder/os">
                                Founder OS
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
}
