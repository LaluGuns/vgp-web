import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, SlidersHorizontal, Sparkles, Waves } from 'lucide-react';
import {
    PageHeader,
    SectionShell,
} from '@/components/editorial/EditorialPrimitives';

export const metadata: Metadata = {
    title: 'VGP Studio | Beats and Production by Virzy Guns',
    description:
        'VGP Studio offers premium beats, custom production, mixing, mastering, and sound design by Virzy Guns, ranked top 10% songwriter and top 25% producer.',
    keywords: [
        'VGP Studio',
        'Virzy Guns beats',
        'beats by Virzy Guns',
        'custom music production',
        'top 10% songwriter',
        'top 25% producer',
        'mixing and mastering',
        'sound design',
    ],
    alternates: {
        canonical: '/studio',
    },
};

const services = [
    {
        title: 'Premium Beats',
        description: 'Instrumentals across trap, drill, phonk, synthwave, R&B, club, pop, and deep house.',
        href: '/studio/beats',
        Icon: Waves,
    },
    {
        title: 'Custom Production',
        description: 'Original production for artists, creators, and brands that need a specific sound.',
        href: '/studio/beats',
        Icon: Sparkles,
    },
    {
        title: 'Mixing and Mastering',
        description: 'Mixing and mastering for cleaner balance, stronger translation, and release-ready files.',
        href: '/studio/beats',
        Icon: SlidersHorizontal,
    },
];

export default function StudioPage() {
    return (
        <article className="editorial-shell min-h-screen text-white">
            <PageHeader
                eyebrow="VGP Studio"
                title="Premium audio"
                mutedTitle="for creators."
                description="Beats, custom production, mixing, mastering, and sound design by Virzy Guns."
                primary={{ label: 'Browse Beats', href: '/studio/beats' }}
                secondary={{ label: 'View Masterclass', href: '/studio/masterclass' }}
            />

            <SectionShell className="pt-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {services.map((service) => (
                        <Link
                            key={service.title}
                            href={service.href}
                            className="group rounded-lg border border-white/[0.09] bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-sky-200/30 hover:bg-white/[0.055] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
                        >
                            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sky-100">
                                <service.Icon className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">{service.title}</h2>
                            <p className="mt-4 text-sm leading-7 text-white/65">{service.description}</p>
                            <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-sky-100/80 transition group-hover:text-white">
                                Explore
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </span>
                        </Link>
                    ))}
                </div>
            </SectionShell>
        </article>
    );
}
