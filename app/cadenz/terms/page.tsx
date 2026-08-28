import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';

export const metadata: Metadata = {
    title: 'CADENZ Terms of Service',
    description: 'Terms for using CADENZ, the cadence-first running and cycling music app by Virzy Guns Production.',
    alternates: { canonical: '/cadenz/terms' },
    openGraph: {
        title: 'CADENZ Terms of Service | Virzy Guns Production',
        description: 'Terms for using the CADENZ app.',
        url: 'https://virzyguns.com/cadenz/terms',
    },
    robots: {
        index: true,
        follow: true,
    },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function CadenzTermsPage() {
    return (
        <PolicyPage
            eyebrow="CADENZ · Virzy Guns Production"
            title="Terms of Service"
            summary="CADENZ is currently pre-launch. These are the canonical product terms URL and describe the intended service model without inventing unresolved release-jurisdiction details."
            effectiveDate="upon public launch"
            sections={[
                {
                    title: 'Agreement and operator',
                    content: (
                        <>
                            <p>
                                CADENZ is operated by PT KREASI VIRZY NUSANTARA, Indonesia. By using CADENZ after public launch, you agree to the terms presented for the released service. If you do not agree, do not use the app.
                            </p>
                            <p>
                                This pre-launch page may be updated before release to reflect final store, subscription, support, and jurisdiction details.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'The service',
                    content: (
                        <p>
                            CADENZ provides cadence-oriented music playback, running features, statistics, workout recovery, and training-related features. Cycling V1 uses manual or locked music tempo unless a future trusted pedal-cadence source is introduced. Some features may require Premium access.
                        </p>
                    ),
                },
                {
                    title: 'Accounts',
                    content: (
                        <ul className={listClass}>
                            <li>You are responsible for maintaining the security of your account credentials.</li>
                            <li>Provide accurate information where the app requests account or profile details.</li>
                            <li>You may delete your CADENZ account from Settings.</li>
                            <li>Do not attempt to access another user&apos;s account, private workout data, or Premium content without authorization.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Subscriptions, billing, and restoration',
                    content: (
                        <ul className={listClass}>
                            <li>Premium, if offered at launch, is sold through the Apple App Store or Google Play using the price and billing period shown at purchase.</li>
                            <li>Auto-renewal, cancellation, refunds, and store billing are governed by the applicable app store terms and account settings.</li>
                            <li>Use Restore Purchases in CADENZ to recover an eligible active subscription on a supported account/device.</li>
                            <li>CADENZ does not use an external payment link inside the iOS app for in-app digital Premium access.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Acceptable use and content license',
                    content: (
                        <>
                            <p>
                                Music, audio, branding, software, and other CADENZ content are provided for authorized use within the service. Unless separately licensed, app audio is for personal, non-commercial listening through CADENZ.
                            </p>
                            <p>
                                You may not rip, extract, redistribute, resell, bypass entitlement checks, defeat signed-URL controls, abuse the service, or reverse-engineer protected delivery mechanisms except where applicable law expressly permits it.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Health and safety',
                    content: (
                        <p>
                            CADENZ is not a medical device and does not provide medical advice. Running and cycling involve risk. Use appropriate judgment, follow local rules, remain aware of traffic and hazards, and do not rely on the app as a substitute for professional medical, safety, traffic, or navigation advice.
                        </p>
                    ),
                },
                {
                    title: 'Availability and changes',
                    content: (
                        <>
                            <p>
                                Features, catalog availability, supported devices, subscription offerings, and service providers may change as CADENZ evolves. We may suspend access where necessary for security, abuse prevention, legal compliance, or service operation.
                            </p>
                            <p>
                                Material terms applicable to the public release will be reflected on this canonical URL. Unresolved governing-law and jurisdiction wording will not be guessed in the pre-launch notice.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Contact',
                    content: (
                        <p>
                            Questions about CADENZ or these terms may be sent to the owner contact shown below. The final public-release terms may add a dedicated support contact if one is designated before launch.
                        </p>
                    ),
                },
            ]}
        />
    );
}
