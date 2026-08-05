import type { Metadata } from 'next';
import { ProviderPolicyPage } from '@/components/policies/ProviderPolicyPage';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms for using VGP Founder OS and its optional social-provider integrations.',
    alternates: { canonical: '/terms' },
    openGraph: {
        title: 'Terms of Service | Virzy Guns Production',
        description: 'Terms for VGP Founder OS social-provider integrations.',
        url: 'https://www.virzyguns.com/terms',
    },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function TermsPage() {
    return (
        <ProviderPolicyPage
            eyebrow="Virzy Guns Production"
            title="Terms of Service"
            summary="These terms govern VGP Founder OS and its optional connections to social platforms such as TikTok and Meta. They do not replace any separate terms that apply to music, beat, or product purchases."
            sections={[
                {
                    title: 'Service and acceptance',
                    content: (
                        <>
                            <p>
                                VGP Founder OS is an internal business workspace operated by Virzy Guns Production. It helps the authorized owner research opportunities, prepare content, review analytics, and manage approved actions across connected services.
                            </p>
                            <p>By connecting an account or using these features, you agree to these terms and confirm that you have authority to act for that account.</p>
                        </>
                    ),
                },
                {
                    title: 'Connected platforms',
                    content: (
                        <>
                            <p>
                                Social-provider features use official authorization flows where available. You choose which account to connect and which requested permissions to grant. Your use of TikTok, Meta, and other providers remains subject to each provider&apos;s own terms, policies, and technical limits.
                            </p>
                            <p>Virzy Guns Production is independent from, and is not endorsed by, TikTok, Meta, or their affiliates.</p>
                        </>
                    ),
                },
                {
                    title: 'Approval-gated actions',
                    content: (
                        <ul className={listClass}>
                            <li>Connecting an account does not automatically publish content, send email, or send a direct message.</li>
                            <li>Publishable content must remain a draft until the authorized owner explicitly approves the exact revision and action.</li>
                            <li>Founder OS does not support automated cold direct messages. Suggested outreach remains manual.</li>
                            <li>You are responsible for checking accuracy, rights, disclosures, platform rules, and timing before approval.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Acceptable use',
                    content: (
                        <>
                            <p>You may not use Founder OS to impersonate others, mislead users, violate privacy or intellectual-property rights, distribute malware, evade platform safeguards, spam people, or perform unlawful activity.</p>
                            <p>Do not connect an account you do not own or administer, and do not upload content that you lack permission to use.</p>
                        </>
                    ),
                },
                {
                    title: 'Content and intellectual property',
                    content: (
                        <p>
                            You retain rights you already hold in content you submit. You authorize Founder OS and its infrastructure providers to process that content only as needed to provide the requested workspace, analysis, storage, and approved provider action. Virzy Guns Production retains its rights in the service, interface, branding, and original materials.
                        </p>
                    ),
                },
                {
                    title: 'Availability and responsibility',
                    content: (
                        <>
                            <p>
                                Provider APIs, permissions, review requirements, and availability can change. Founder OS may limit or disable a connection when credentials expire, a provider rejects an action, or safety checks fail.
                            </p>
                            <p>The service is provided on an as-available basis. To the extent permitted by law, Virzy Guns Production does not guarantee uninterrupted access, platform approval, audience growth, reach, sales, or algorithmic performance.</p>
                        </>
                    ),
                },
                {
                    title: 'Suspension, disconnection, and termination',
                    content: (
                        <p>
                            You may disconnect a provider or revoke its access through the provider at any time. Virzy Guns Production may suspend an integration to protect accounts, users, data, or platform compliance. Sections that by their nature should survive termination, including ownership, responsibility, and lawful record retention, will continue to apply.
                        </p>
                    ),
                },
                {
                    title: 'Changes and governing rules',
                    content: (
                        <p>
                            These terms may be updated when the service, providers, or applicable requirements change. Material updates will be posted here with a revised effective date. Applicable mandatory law remains controlling where it cannot be excluded by agreement.
                        </p>
                    ),
                },
            ]}
        />
    );
}
