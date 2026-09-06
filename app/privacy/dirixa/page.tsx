import Link from 'next/link';
import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';
import { founderEmail } from '@/lib/founder-contact';

export const metadata: Metadata = {
    title: 'DIRIXA Privacy Policy',
    description: 'Privacy policy for DIRIXA by PT Kreasi Virzy Nusantara.',
    alternates: { canonical: '/privacy/dirixa' },
    openGraph: {
        title: 'DIRIXA Privacy Policy',
        description: 'How DIRIXA handles local game data, advertising, privacy choices, and optional result sharing.',
        url: 'https://www.virzyguns.com/privacy/dirixa',
    },
    robots: { index: true, follow: true },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function DirixaPrivacyPage() {
    return (
        <PolicyPage
            eyebrow="DIRIXA · PT Kreasi Virzy Nusantara"
            title="Privacy Policy"
            summary="DIRIXA does not require a player account. Game progress and settings are stored locally on your device. The Android app uses Google Mobile Ads, so limited device and usage data may also be processed by Google for advertising, measurement, diagnostics, and fraud prevention."
            effectiveDate="September 6, 2026"
            sections={[
                {
                    title: 'Scope and operator',
                    content: (
                        <p>
                            This policy applies to the Android game DIRIXA, package <code>com.virzyguns.dirixa</code>, provided by PT Kreasi Virzy Nusantara. It explains DIRIXA-specific data handling and supplements the general VGP website privacy policy.
                        </p>
                    ),
                },
                {
                    title: 'Data stored on your device',
                    content: (
                        <>
                            <p>DIRIXA stores core game state locally on your device. This can include:</p>
                            <ul className={listClass}>
                                <li>Level progress, completion results, best results, Daily progress, and other gameplay state.</li>
                                <li>Language, audio, haptics, accessibility, privacy-related choices exposed by the app, and other settings.</li>
                            </ul>
                            <p>No DIRIXA account is required to play. Clearing DIRIXA app data or uninstalling the app normally removes app-local data, subject to Android and device backup or restore behavior.</p>
                        </>
                    ),
                },
                {
                    title: 'Advertising and Google Mobile Ads',
                    content: (
                        <>
                            <p>
                                DIRIXA uses Google Mobile Ads (AdMob) to provide advertising. According to Google&apos;s Mobile Ads SDK disclosure, the SDK automatically collects and shares certain information such as IP address, user product interactions, diagnostic information, and device and account identifiers. Google describes these data as being used for purposes including advertising, analytics, and fraud prevention.
                            </p>
                            <p>
                                Google and participating advertising partners may process information under their own privacy policies and legal obligations. DIRIXA does not receive your payment-card details from the advertising SDK.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Consent and privacy choices',
                    content: (
                        <p>
                            Where applicable law, Google&apos;s advertising requirements, or the current ad flow requires a consent or privacy choice, DIRIXA or Google&apos;s advertising components may present the relevant controls. Availability and the exact choices can vary by region, device, consent state, and Google&apos;s current requirements. We do not claim that every privacy control is shown in every region.
                        </p>
                    ),
                },
                {
                    title: 'Optional result sharing',
                    content: (
                        <p>
                            DIRIXA can let you share a game result through the Android system share sheet or another share feature available on your device. Sharing is optional and does not require DIRIXA to read your contacts. You choose the destination. Once you send content to another app or service, that destination processes the shared content under its own terms and privacy practices.
                        </p>
                    ),
                },
                {
                    title: 'Permissions and core gameplay',
                    content: (
                        <p>
                            Core DIRIXA gameplay does not require access to your camera, contacts, microphone, or precise location. Network access may be used for advertising and related online functions. A third-party advertising service may infer coarse or approximate location from network information such as an IP address without DIRIXA requesting precise GPS location.
                        </p>
                    ),
                },
                {
                    title: 'Third-party processing',
                    content: (
                        <p>
                            Google Mobile Ads and the distribution platform may process limited information needed to provide ads, app distribution, security, diagnostics, measurement, or fraud prevention. Their processing is governed by their own terms and privacy policies. Information may be processed in countries other than yours, subject to applicable law and safeguards required of those providers.
                        </p>
                    ),
                },
                {
                    title: 'Retention, deletion, and requests',
                    content: (
                        <ul className={listClass}>
                            <li>DIRIXA local progress and settings remain on your device until they are reset, app data is cleared, or the app is uninstalled, subject to device backup or restore behavior.</li>
                            <li>Data processed by Google Mobile Ads is retained and deleted under Google&apos;s applicable policies and controls.</li>
                            <li>If you voluntarily email VGP for support or a privacy request, we receive the information you choose to send and may retain it as reasonably needed to respond, maintain security, meet legal obligations, or resolve the request.</li>
                            <li>For a developer-controlled privacy or deletion request, contact <a className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href={`mailto:${founderEmail}`}>{founderEmail}</a>.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Children and security',
                    content: (
                        <p>
                            DIRIXA is distributed subject to the age, audience, and consent settings declared on the relevant app store. We use reasonable technical and organizational measures for developer-controlled systems, but no device, network, or online service can be guaranteed completely secure.
                        </p>
                    ),
                },
                {
                    title: 'Policy updates and terms',
                    content: (
                        <p>
                            We may update this policy when DIRIXA, its SDKs, advertising configuration, or legal requirements change. The current version will be posted here with its effective date. See the <Link className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="/terms/dirixa">DIRIXA Terms of Use</Link> for gameplay and service terms.
                        </p>
                    ),
                },
            ]}
        />
    );
}
