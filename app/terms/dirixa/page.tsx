import Link from 'next/link';
import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';
import { founderEmail } from '@/lib/founder-contact';

export const metadata: Metadata = {
    title: 'DIRIXA Terms of Use',
    description: 'Terms of use for DIRIXA by PT Kreasi Virzy Nusantara.',
    alternates: { canonical: '/terms/dirixa' },
    openGraph: {
        title: 'DIRIXA Terms of Use',
        description: 'Gameplay, advertising, acceptable use, and service terms for DIRIXA.',
        url: 'https://www.virzyguns.com/terms/dirixa',
    },
    robots: { index: true, follow: true },
};

export default function DirixaTermsPage() {
    return (
        <PolicyPage
            eyebrow="DIRIXA · PT Kreasi Virzy Nusantara"
            title="Terms of Use"
            summary="These Terms govern your use of DIRIXA. DIRIXA is a casual puzzle game with local progress, optional result sharing, and advertising provided through Google Mobile Ads."
            effectiveDate="September 6, 2026"
            sections={[
                {
                    title: 'License and eligibility',
                    content: (
                        <p>
                            You receive a limited, personal, non-exclusive, non-transferable license to use DIRIXA for personal entertainment, subject to these Terms and applicable law. If you are a minor where you live, use DIRIXA only with any consent required by applicable law or the app store that distributed the game.
                        </p>
                    ),
                },
                {
                    title: 'Accounts, progress, and device data',
                    content: (
                        <p>
                            DIRIXA does not require a player account for core gameplay. Progress and settings are primarily stored locally on your device. Clearing app data, resetting progress, changing devices, or uninstalling the app can remove local state, and restoration is not guaranteed unless a platform feature explicitly supports it.
                        </p>
                    ),
                },
                {
                    title: 'Gameplay and updates',
                    content: (
                        <p>
                            Levels, Daily content, scoring, progression, difficulty, presentation, and other gameplay systems may be corrected, rebalanced, expanded, or changed through updates. We may fix errors or alter content where reasonably needed to maintain the game, comply with platform rules, or improve reliability.
                        </p>
                    ),
                },
                {
                    title: 'Optional result sharing',
                    content: (
                        <p>
                            DIRIXA may let you share a result using the Android system share sheet or another share function on your device. You control whether to share and where the content is sent. You are responsible for content you add to a shared message and for complying with the destination service&apos;s terms.
                        </p>
                    ),
                },
                {
                    title: 'Advertising and privacy',
                    content: (
                        <p>
                            DIRIXA may display advertising provided through Google Mobile Ads and related advertising services. Ad availability, frequency, format, personalization, and privacy choices can vary by region, device, consent state, provider configuration, and applicable law. Data handling is described in the <Link className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="/privacy/dirixa">DIRIXA Privacy Policy</Link>.
                        </p>
                    ),
                },
                {
                    title: 'Acceptable use',
                    content: (
                        <p>
                            You may not use DIRIXA to violate law, abuse advertising or platform systems, interfere with the game or another user&apos;s device, distribute malware, bypass security controls, manipulate the app in a way that harms the service, or exploit DIRIXA commercially without permission. You may not reverse engineer the app except where applicable law expressly permits it.
                        </p>
                    ),
                },
                {
                    title: 'Intellectual property',
                    content: (
                        <p>
                            DIRIXA, including its name, software, visual design, game content, text, audio, graphics, and other original materials, is owned by or licensed to PT Kreasi Virzy Nusantara and is protected by applicable intellectual property laws. These Terms do not transfer ownership of DIRIXA or its content to you.
                        </p>
                    ),
                },
                {
                    title: 'Availability and third-party services',
                    content: (
                        <p>
                            We may update, suspend, replace, or discontinue DIRIXA or particular features. Advertising, app distribution, sharing destinations, and other third-party services can also change or become unavailable independently of us. Continuous or error-free availability is not guaranteed.
                        </p>
                    ),
                },
                {
                    title: 'Disclaimer and liability',
                    content: (
                        <p>
                            DIRIXA is provided on an &quot;as available&quot; basis to the extent permitted by law. Nothing in these Terms excludes rights or remedies that cannot legally be excluded. To the maximum extent permitted by law, PT Kreasi Virzy Nusantara is not responsible for indirect, incidental, special, or consequential losses arising from use of or inability to use DIRIXA or a third-party service connected to it.
                        </p>
                    ),
                },
                {
                    title: 'Suspension and termination',
                    content: (
                        <p>
                            You may stop using DIRIXA at any time by uninstalling it. We may restrict or terminate access to online or provider-dependent features when reasonably necessary for security, abuse prevention, legal compliance, platform compliance, or service discontinuation. Provisions that by their nature should survive termination, including intellectual property, disclaimers, and liability limits, continue to apply.
                        </p>
                    ),
                },
                {
                    title: 'Governing terms and mandatory rights',
                    content: (
                        <p>
                            These Terms are governed by applicable laws of Indonesia, without overriding mandatory consumer protections or other non-waivable rights that apply in your country or region. App store and third-party provider terms may also apply to their respective services.
                        </p>
                    ),
                },
                {
                    title: 'Updates and contact',
                    content: (
                        <p>
                            We may update these Terms when DIRIXA, its providers, platform requirements, or applicable law changes. The current version will be posted here with its effective date. Questions about these Terms may be sent to <a className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href={`mailto:${founderEmail}`}>{founderEmail}</a>.
                        </p>
                    ),
                },
            ]}
        />
    );
}
