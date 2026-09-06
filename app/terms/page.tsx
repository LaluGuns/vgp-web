import Link from 'next/link';
import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';
import { founderEmail } from '@/lib/founder-contact';

export const metadata: Metadata = {
    title: 'VGP Terms of Use',
    description: 'General terms of use for VGP websites, games, and related services.',
    alternates: { canonical: '/terms' },
    openGraph: {
        title: 'VGP Terms of Use',
        description: 'General terms governing use of VGP websites, games, and related services.',
        url: 'https://www.virzyguns.com/terms',
    },
    robots: { index: true, follow: true },
};

export default function TermsPage() {
    return (
        <PolicyPage
            eyebrow="VGP · PT Kreasi Virzy Nusantara"
            title="Terms of Use"
            summary="These general Terms govern use of VGP websites, games, and related services. A product-specific policy or set of terms may add to or replace parts of these Terms for that product."
            effectiveDate="September 6, 2026"
            sections={[
                {
                    title: 'Using VGP services',
                    content: (
                        <p>
                            You may use VGP services for lawful personal or business purposes supported by the relevant product. You must comply with applicable law, platform rules, and any product-specific terms presented for the service you use.
                        </p>
                    ),
                },
                {
                    title: 'Acceptable use',
                    content: (
                        <p>
                            You may not misuse VGP services, interfere with security or availability, distribute malware, abuse advertising or payment systems, gain unauthorized access, infringe another person&apos;s rights, or use a VGP service for unlawful activity. Reverse engineering is prohibited except where applicable law expressly permits it.
                        </p>
                    ),
                },
                {
                    title: 'Intellectual property',
                    content: (
                        <p>
                            Unless otherwise stated, VGP software, branding, visual design, text, audio, graphics, and original content are owned by or licensed to PT Kreasi Virzy Nusantara and are protected by applicable intellectual property laws. Use of a service does not transfer ownership of that service or its content to you.
                        </p>
                    ),
                },
                {
                    title: 'Third-party services and advertising',
                    content: (
                        <p>
                            Some VGP products use third-party platforms for distribution, advertising, analytics, hosting, payments, sharing, or infrastructure. Those services may have their own terms and privacy policies. Product-specific pages describe material integrations where appropriate.
                        </p>
                    ),
                },
                {
                    title: 'Privacy',
                    content: (
                        <p>
                            General data handling is described in the <Link className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="/privacy">VGP Privacy Policy</Link>. Product-specific privacy policies may provide additional details for individual games or apps.
                        </p>
                    ),
                },
                {
                    title: 'Availability and changes',
                    content: (
                        <p>
                            VGP services may be updated, corrected, suspended, replaced, or discontinued. Third-party dependencies may also change independently of us. We do not guarantee uninterrupted or error-free availability.
                        </p>
                    ),
                },
                {
                    title: 'Disclaimer and liability',
                    content: (
                        <p>
                            VGP services are provided on an &quot;as available&quot; basis to the extent permitted by law. Nothing in these Terms excludes rights or remedies that cannot legally be excluded. To the maximum extent permitted by law, PT Kreasi Virzy Nusantara is not responsible for indirect, incidental, special, or consequential losses arising from use of or inability to use a VGP service.
                        </p>
                    ),
                },
                {
                    title: 'Termination',
                    content: (
                        <p>
                            You may stop using a VGP service at any time. We may restrict access when reasonably necessary for security, abuse prevention, legal or platform compliance, or service discontinuation. Terms that by their nature should survive termination continue to apply.
                        </p>
                    ),
                },
                {
                    title: 'Governing terms',
                    content: (
                        <p>
                            These Terms are governed by applicable laws of Indonesia, without overriding mandatory consumer protections or other non-waivable rights that apply in your country or region. Product-specific and third-party terms may also apply to their respective services.
                        </p>
                    ),
                },
                {
                    title: 'Updates and contact',
                    content: (
                        <p>
                            We may update these Terms as VGP services, providers, platform requirements, or applicable law changes. The current version will be posted here with its effective date. Questions may be sent to <a className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href={`mailto:${founderEmail}`}>{founderEmail}</a>.
                        </p>
                    ),
                },
            ]}
        />
    );
}
