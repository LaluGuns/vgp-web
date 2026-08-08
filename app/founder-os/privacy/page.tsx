import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';

export const metadata: Metadata = {
    title: 'Founder OS Privacy Policy',
    description: 'How Founder OS handles provider connection, workspace, approval, analytics, and operational data.',
    alternates: { canonical: '/founder-os/privacy' },
    openGraph: {
        title: 'Founder OS Privacy Policy | Virzy Guns',
        description: 'How Founder OS handles provider connection, workspace, approval, analytics, and operational data.',
        url: 'https://www.virzyguns.com/founder-os/privacy',
    },
    robots: {
        index: false,
        follow: true,
    },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function FounderOsPrivacyPage() {
    return (
        <PolicyPage
            eyebrow="Founder OS"
            title="Founder OS Privacy Policy"
            summary="This policy describes the information processed by Founder OS when a workspace uses provider connections, planning tools, analytics, and approval-gated operations."
            effectiveDate="August 8, 2026"
            sections={[
                {
                    title: 'Scope and operator',
                    content: (
                        <p>
                            This policy applies to Founder OS and its provider integrations operated by Virzy Guns Production, operated by Virzy Guns. It covers information processed in the workspace and does not replace a provider&apos;s own privacy policy or a product-specific notice for another Virzy Guns service.
                        </p>
                    ),
                },
                {
                    title: 'Information we process',
                    content: (
                        <>
                            <p>Depending on the connection and features you use, Founder OS may process:</p>
                            <ul className={listClass}>
                                <li>Provider account ID, display name, username, account type, profile URL, connection status, granted scopes or capabilities, and verification timestamps.</li>
                                <li>OAuth state and PKCE metadata used to protect an authorization flow, together with access and refresh tokens needed for an authorized connection.</li>
                                <li>Drafts, captions, media references, workspace settings, approval records and content hashes, action results, provider references, and failure or reconciliation records.</li>
                                <li>Provider analytics and webhook or inbound interaction data that Founder OS actually receives and processes for the connected features.</li>
                                <li>Audit, security, error, and operational records used to investigate activity and maintain the service.</li>
                                <li>Public profile or public-content signals requested for internal prospect research.</li>
                            </ul>
                            <p>
                                Access and refresh tokens are stored server-side in a credential record encrypted with AES-256-GCM. This statement describes the credential record; it does not mean that every database field or every stored item is encrypted with that method.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'How Founder OS uses information',
                    content: (
                        <p>
                            Founder OS uses provider and workspace information to establish and verify connections, display analytics, support research and drafting, execute actions that have received the required approval, protect the service, maintain audit and compliance records, reconcile provider results, and investigate errors. Connecting an account does not by itself cause an automatic post, email, or direct message.
                        </p>
                    ),
                },
                {
                    title: 'Approval, outreach, and sharing',
                    content: (
                        <>
                            <p>
                                External or publishable actions retain a draft, exact-content approval, and an approval-gated execution step. Cold direct messages are blocked and outreach suggestions remain manual-only. Founder OS shares information with a provider only as needed for a requested, authorized feature or action, and with infrastructure or service providers that support hosting, storage, security, or delivery.
                            </p>
                            <p>
                                TikTok, Meta, and other providers operate independently and apply their own terms, API requirements, review processes, and privacy practices. Founder OS does not control those provider policies or the information a provider separately collects.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Security and operational records',
                    content: (
                        <p>
                            Reasonable safeguards are used for credentials and operational access. Security, audit, error, approval, and reconciliation records may be retained when reasonably needed to protect the service, investigate activity, resolve disputes, meet legal obligations, or demonstrate compliance. No security method or transmission channel can be guaranteed completely secure.
                        </p>
                    ),
                },
                {
                    id: 'data-deletion',
                    title: 'Connection controls and data requests',
                    content: (
                        <>
                            <p>
                                When you disconnect a provider connection, Founder OS requests provider revocation when supported, deletes the encrypted credential row, marks the grants and connection as revoked, and records the event in the audit history. Revocation stops subsequent access through that connection, but it does not automatically delete drafts, approvals, analytics, or audit history that are retained for operational or compliance purposes.
                            </p>
                            <p>
                                Verified access, correction, or deletion requests may be sent to{' '}
                                <a className="font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="mailto:founder@virzyguns.com">
                                    founder@virzyguns.com
                                </a>
                                . We may verify the requester and the relevant connection before acting. This policy does not promise a fixed retention period or deletion deadline.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'International processing and service limits',
                    content: (
                        <p>
                            Founder OS and its infrastructure or provider partners may process information in countries other than yours, subject to applicable safeguards and law. Founder OS is a business tool and is not directed to children. Provider availability, capabilities, and data handling can change independently of this workspace.
                        </p>
                    ),
                },
                {
                    title: 'Policy updates',
                    content: (
                        <p>
                            This policy may be updated when Founder OS, an integration, or applicable requirements change. Material updates will be posted on this page with a revised effective date.
                        </p>
                    ),
                },
            ]}
        />
    );
}
