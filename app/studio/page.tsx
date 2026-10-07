import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader, TextLink } from '@/components/editorial/EditorialPrimitives';
import { founderEmail } from '@/lib/founder-contact';

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

const mailto = (subject: string) => `mailto:${founderEmail}?subject=${encodeURIComponent(subject)}`;

const services = [
    {
        title: 'Beat leases',
        description:
            'Original instrumentals in trap, drill, phonk, synthwave, R&B, club and pop. Pick a license and download straight away.',
        action: { label: 'Browse beats', href: '/studio/beats' },
    },
    {
        title: 'Exclusive rights',
        description:
            'Arranged one beat at a time. Ask about availability first; scope and files are confirmed in writing before you pay.',
        action: { label: 'Ask about an exclusive', href: '/studio/beats#private-commissions' },
    },
    {
        title: 'Custom production',
        description: 'A beat or a full production built for one artist, creator or brand.',
        action: { label: 'Start a custom project', href: mailto('Custom production inquiry') },
    },
    {
        title: 'Mixing and mastering',
        description: 'Balanced mixes and release-ready masters for songs you have already written.',
        action: { label: 'Ask about a mix', href: mailto('Mixing and mastering inquiry') },
    },
];

export default function StudioPage() {
    return (
        <article className="editorial-shell min-h-screen text-white">
            <PageHeader
                title="VGP Studio"
                description="Beats, custom production, mixing and mastering by Virzy Guns. License a beat today, or bring a record and work on it together."
                primary={{ label: 'Browse beats', href: '/studio/beats' }}
                secondary={{ label: 'Email the studio', href: `mailto:${founderEmail}` }}
            />

            <div className="px-4 sm:px-6">
                <div className="relative mx-auto aspect-[16/7] max-w-7xl overflow-hidden rounded-[6px] border border-white/10 bg-black">
                    <Image
                        src="/images/vgp-brand-hero-v2.png"
                        alt="Virzy Guns Production logo in brushed metal"
                        fill
                        priority
                        sizes="(min-width: 1280px) 1280px, 100vw"
                        className="object-cover"
                    />
                </div>
            </div>

            <section data-reveal="" aria-labelledby="services-heading" className="px-4 py-20 sm:px-6 lg:py-28">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <h2 id="services-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                            What the studio does
                        </h2>
                        <p className="mt-4 max-w-sm text-base leading-7 text-white/65">
                            Every license is explained in plain terms on the{' '}
                            <TextLink href="/studio/beats/licensing" inline>licensing page</TextLink>.
                        </p>
                    </div>
                    <ul className="divide-y divide-white/10 border-y border-white/10 lg:col-span-8">
                        {services.map((service) => (
                            <li key={service.title} className="grid gap-3 py-7 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-10">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                                    <p className="mt-2 max-w-xl text-base leading-7 text-white/65">{service.description}</p>
                                </div>
                                <TextLink href={service.action.href} className="sm:justify-self-end">
                                    {service.action.label}
                                </TextLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section data-reveal="" className="border-t border-white/10 px-4 pb-24 pt-14 sm:px-6">
                <p className="mx-auto max-w-7xl text-base leading-7 text-white/65">
                    Learning to produce? The masterclass series is in the works.{' '}
                    <TextLink href="/studio/masterclass" inline>See what it covers</TextLink>
                </p>
            </section>
        </article>
    );
}
