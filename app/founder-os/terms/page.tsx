import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';

export const metadata: Metadata = {
    title: 'Founder OS Terms of Service',
    description: 'Terms governing the Founder OS internal business workspace and its provider integrations.',
    alternates: { canonical: '/founder-os/terms' },
    openGraph: {
        title: 'Founder OS Terms of Service | Virzy Guns',
        description: 'Terms governing the Founder OS internal business workspace and its provider integrations.',
        url: 'https://www.virzyguns.com/founder-os/terms',
    },
    robots: {
        index: false,
        follow: true,
    },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function FounderOsTermsPage() {
    return (
        <PolicyPage
            eyebrow="Founder OS"
            title="Founder OS Terms of Service"
            summary="These terms apply to the Founder OS internal business workspace and the provider connections used with it. They do not replace product-specific terms for other Virzy Guns services."
            effectiveDate="August 8, 2026"
            sections={[
                {
                    title: 'Workspace and acceptance',
                    content: (
                        <>
                            <p>
                                Founder OS is a business workspace for planning, drafting, research, analytics, and approval-gated operations. By using it, you confirm that you are authorized to use the workspace and any account or provider connection you link to it.
                            </p>
                            <p>
                                Virzy Guns Production is operated by Virzy Guns. These terms apply only to Founder OS and do not act as catch-all terms for beats, Flow, CADENZ, books, or another product.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Provider connections',
                    content: (
                        <>
                            <p>
                                A provider connection uses the provider&apos;s official authorization flow when one is available. The provider, not Founder OS, controls the scopes and capabilities shown during authorization. You are responsible for linking an account you are permitted to connect and for keeping your provider account in good standing.
                            </p>
                            <p>
                                Connecting an account does not grant Founder OS permission to post, send email, or send direct messages automatically. A connection can be limited, rejected, expire, or be unavailable because of provider requirements or a provider decision.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Approval-gated actions',
                    content: (
                        <>
                            <p>
                                Founder OS is designed to preserve a draft, show the exact content proposed for an external action, and require an appropriate approval before execution. A publishable or otherwise external action must remain approval-gated; a draft or recommendation is not a completed action.
                            </p>
                            <p>
                                Cold automated direct messages are not supported. Outreach recommendations remain manual, and you must review the recipient, content, timing, and provider context before taking action.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Acceptable use and rights',
                    content: (
                        <>
                            <p>You must not use Founder OS to:</p>
                            <ul className={listClass}>
                                <li>send spam, impersonate another person or organization, or evade provider safeguards;</li>
                                <li>introduce malware, abuse security controls, or interfere with the workspace or a provider;</li>
                                <li>process information unlawfully or in a way that violates a person&apos;s rights; or</li>
                                <li>create, publish, or distribute content, media, or data without the rights and permissions required for that use.</li>
                            </ul>
                            <p>
                                You remain responsible for rights ownership, accuracy, required disclosures, platform rules, and the timing and context of anything you approve or publish. TikTok, Meta, and other providers have their own terms, API rules, and review requirements; Virzy Guns Production is independent from those providers.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Availability and responsibility',
                    content: (
                        <p>
                            Founder OS does not guarantee audience reach, sales, algorithm performance, provider approval, successful delivery, or uninterrupted availability. Integrations may be restricted, disconnected, or disabled because of token expiry, provider rejection, safety concerns, service changes, or compliance requirements. You should keep appropriate copies of important work and independently verify external results.
                        </p>
                    ),
                },
                {
                    title: 'Disconnection, suspension, and changes',
                    content: (
                        <p>
                            You may disconnect a provider connection when the available controls permit. Virzy Guns Production may suspend or limit access, a provider integration, or an action when needed for security, safety, legal compliance, or provider requirements. These terms may be updated when Founder OS changes; the revised effective date will be posted on this page.
                        </p>
                    ),
                },
            ]}
        />
    );
}
