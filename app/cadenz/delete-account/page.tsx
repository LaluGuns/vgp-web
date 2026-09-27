import type { Metadata } from 'next';
import Link from 'next/link';
import { PolicyPage } from '@/components/policies/PolicyPage';
import { founderEmail } from '@/lib/founder-contact';

const requestSubject = 'CADENZ account deletion request';
const requestBody = [
    'Please delete my CADENZ account and associated account data.',
    '',
    'CADENZ account email:',
    '',
].join('\n');
const requestHref = 'mailto:' + founderEmail
    + '?subject=' + encodeURIComponent(requestSubject)
    + '&body=' + encodeURIComponent(requestBody);

export const metadata: Metadata = {
    title: 'Delete your CADENZ account | Virzy Guns Production',
    description: 'Request deletion of a CADENZ account and associated data without signing in to or reinstalling the app.',
    alternates: { canonical: '/cadenz/delete-account' },
    openGraph: {
        title: 'Delete your CADENZ account | Virzy Guns Production',
        description: 'Request deletion of a CADENZ account and associated data without signing in to or reinstalling the app.',
        url: 'https://www.virzyguns.com/cadenz/delete-account',
        siteName: 'Virzy Guns Production',
        type: 'website',
    },
    robots: { index: true, follow: true },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function CadenzDeleteAccountPage() {
    return (
        <PolicyPage
            eyebrow="CADENZ · Virzy Guns Production"
            title="Delete your CADENZ account"
            summary="Use this page to request deletion of your CADENZ account and associated account data, including if you cannot sign in to or reinstall the app."
            effectiveDate="September 27, 2026"
            sections={[
                {
                    id: 'request-account-deletion',
                    title: 'Request account and data deletion',
                    content: (
                        <>
                            <p>
                                Email Virzy Guns Production to request deletion of your CADENZ account and associated account data. You do not need to sign in to or reinstall CADENZ to submit this request.
                            </p>
                            <p>
                                <a
                                    className="inline-flex rounded-full border border-sky-200/25 bg-sky-200/10 px-5 py-3 font-semibold text-sky-100 underline underline-offset-4 transition hover:border-sky-100/50 hover:text-white"
                                    href={requestHref}
                                >
                                    Email a CADENZ deletion request
                                </a>
                            </p>
                            <p>
                                Use the email address associated with your CADENZ account so we can verify ownership. Do not send your password or payment details. If you cannot access that email address, contact us from another address and explain; additional verification may be needed before the request can be processed.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Deletion scope and on-device data',
                    content: (
                        <>
                            <p>
                                A verified request covers the CADENZ account and associated data held by CADENZ services. Limited records may be retained where needed for security, fraud prevention, legal compliance, or dispute resolution. Copies in service-provider backups may remain subject to the providers’ backup-retention processes. See the <Link className="font-semibold text-sky-100 underline underline-offset-4" href="/cadenz/privacy#data-deletion">CADENZ privacy policy</Link> for the account-data retention details.
                            </p>
                            <p>
                                Data stored only on your device cannot be removed remotely through an email request. To remove local-only data from a device, use CADENZ’s in-app Delete account control while signed in, or clear CADENZ app storage or uninstall the app on that device.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Subscriptions',
                    content: (
                        <>
                            <p>
                                Deleting your CADENZ account does not cancel a subscription purchased through Google Play or Apple’s App Store. Cancel it separately in the store account used for the purchase if you want to stop future renewals. Subscription cancellation is not required to submit an account-deletion request.
                            </p>
                            <ul className={listClass}>
                                <li><a className="font-semibold text-sky-100 underline underline-offset-4" href="https://support.google.com/googleplay/answer/7018481?hl=en">Google Play subscription cancellation instructions</a></li>
                                <li><a className="font-semibold text-sky-100 underline underline-offset-4" href="https://support.apple.com/en-us/118428">Apple subscription cancellation instructions</a></li>
                            </ul>
                        </>
                    ),
                },
            ]}
        />
    );
}
