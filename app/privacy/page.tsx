import type { Metadata } from 'next';
import { ProviderPolicyPage } from '@/components/policies/ProviderPolicyPage';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'How VGP Founder OS handles data for optional social-provider integrations.',
    alternates: { canonical: '/privacy' },
    openGraph: {
        title: 'Privacy Policy | Virzy Guns Production',
        description: 'Privacy information for VGP Founder OS social-provider integrations.',
        url: 'https://www.virzyguns.com/privacy',
    },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function PrivacyPage() {
    return (
        <ProviderPolicyPage
            eyebrow="Virzy Guns Production"
            title="Privacy Policy"
            summary="This policy explains how VGP Founder OS handles information when its authorized owner connects TikTok, Meta, or another supported social provider."
            sections={[
                {
                    title: 'Scope and controller',
                    content: (
                        <p>
                            Virzy Guns Production, operated by Virzy Guns, controls the information described here. This policy covers Founder OS social-provider connections and related workspace activity. Other VGP products may present additional notices for their own data flows.
                        </p>
                    ),
                },
                {
                    title: 'Information we process',
                    content: (
                        <ul className={listClass}>
                            <li>Provider account identifiers, display information, granted scopes, and connection status returned after authorization.</li>
                            <li>Access and refresh tokens needed to keep an authorized connection working. Tokens are handled server-side and are not intentionally exposed in the browser.</li>
                            <li>Content drafts, captions, media references, settings, approval decisions, and action results created in the workspace.</li>
                            <li>Account and content analytics made available by the provider under the permissions you grant.</li>
                            <li>Security, audit, error, and operational records needed to protect the service and investigate provider outcomes.</li>
                            <li>Public profile or content signals that the authorized owner asks Founder OS to evaluate for internal prospect research.</li>
                        </ul>
                    ),
                },
                {
                    title: 'How we use information',
                    content: (
                        <ul className={listClass}>
                            <li>Connect and maintain the provider account you select.</li>
                            <li>Show authorized analytics and help prepare content or recommendations.</li>
                            <li>Carry out a provider action only after the authorized owner approves the exact action.</li>
                            <li>Protect accounts, prevent abuse, troubleshoot errors, and maintain an audit trail.</li>
                            <li>Comply with provider requirements and applicable legal obligations.</li>
                        </ul>
                    ),
                },
                {
                    title: 'No automatic sending or sale of data',
                    content: (
                        <>
                            <p>
                                Connecting a provider does not authorize Founder OS to automatically post content, send email, or send direct messages. Founder OS does not support automated cold direct messages. Provider actions remain approval-gated.
                            </p>
                            <p>Virzy Guns Production does not sell connected-account personal information or use it for third-party targeted advertising.</p>
                        </>
                    ),
                },
                {
                    title: 'When information is shared',
                    content: (
                        <p>
                            Information is sent to TikTok, Meta, or another connected provider only as necessary for the authorized request. Limited information may also be processed by infrastructure vendors that host the application, database, security, or delivery systems. Those vendors act only to provide their services. Information may be disclosed when required by law or necessary to protect rights, users, and system security.
                        </p>
                    ),
                },
                {
                    title: 'Retention and security',
                    content: (
                        <>
                            <p>
                                Connected credentials are retained while the connection is active or as needed to complete a requested operation. Drafts, settings, and audit records are retained only as long as reasonably needed for the service, security, dispute resolution, and legal obligations.
                            </p>
                            <p>
                                Reasonable technical and organizational safeguards are used, including server-side credential handling and access controls. No storage or transmission method can be guaranteed completely secure.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Your controls and data deletion',
                    content: (
                        <>
                            <ul className={listClass}>
                                <li>Disconnect the provider in Founder OS or revoke access in your TikTok, Meta, or other provider account settings.</li>
                                <li>Request access, correction, or deletion by emailing founder@virzyguns.com from an address that can verify your authority over the connected account.</li>
                            </ul>
                            <p>
                                After a verified deletion request, Virzy Guns Production will delete or de-identify the applicable connected-account data, credentials, drafts, and analytics unless limited retention is required for security, fraud prevention, legal compliance, or resolving a disputed provider action. Revoking provider access stops future collection but does not automatically delete records already stored in Founder OS.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'International processing and children',
                    content: (
                        <p>
                            Infrastructure and connected providers may process information in countries other than yours, subject to their safeguards and applicable law. Founder OS is a business administration tool and is not directed to children. Do not use it unless you are legally able to authorize the account and meet the connected platform&apos;s age requirements.
                        </p>
                    ),
                },
                {
                    title: 'Policy updates',
                    content: (
                        <p>
                            This policy may be updated when Founder OS, provider permissions, or applicable requirements change. Material updates will be posted on this page with a revised effective date.
                        </p>
                    ),
                },
            ]}
        />
    );
}
