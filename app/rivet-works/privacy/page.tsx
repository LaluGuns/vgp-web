import Link from 'next/link';
import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';

export const metadata: Metadata = {
    title: 'Rivet Works Privacy Policy',
    description: 'Privacy policy for Rivet Works by PT Kreasi Virzy Nusantara.',
    alternates: { canonical: '/rivet-works/privacy' },
    openGraph: {
        title: 'Rivet Works Privacy Policy',
        description: 'How Rivet Works handles game data, purchases, advertising, consent, and notifications.',
        url: 'https://www.virzyguns.com/rivet-works/privacy',
    },
    robots: { index: true, follow: true },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function RivetWorksPrivacyPage() {
    return (
        <PolicyPage
            eyebrow="Rivet Works · PT Kreasi Virzy Nusantara"
            title="Privacy Policy"
            summary="Rivet Works does not require a player account. Core progress is stored on your device. This policy explains the limited online data flows used for game services, Google Play purchases, advertising and consent, and optional notifications."
            effectiveDate="September 4, 2026"
            sections={[
                {
                    title: 'Scope and operator',
                    content: (
                        <p>
                            This policy applies to the Android game Rivet Works, package <code>com.virzyguns.rivetworks</code>, provided by PT Kreasi Virzy Nusantara. It supplements the general VGP website privacy policy for product-specific data flows.
                        </p>
                    ),
                },
                {
                    title: 'Data stored on your device',
                    content: (
                        <>
                            <p>Rivet Works primarily stores game state locally on your device.</p>
                            <ul className={listClass}>
                                <li>Factory progress, upgrades, workshop and rebuild state, Blueprints, achievements, contracts, and daily progress.</li>
                                <li>Language, audio, haptics, reduced-motion, notification, and other settings.</li>
                                <li>An anonymous random game/session identifier and cached purchase-entitlement state.</li>
                            </ul>
                            <p>You can reset local game progress from Settings. Uninstalling the app normally removes app-local data, subject to Android and device backup behavior.</p>
                        </>
                    ),
                },
                {
                    title: 'Online game services and analytics',
                    content: (
                        <p>
                            When online services are enabled, Rivet Works may send a random identifier, app version, locale, daily/event requests, and limited gameplay events such as upgrades, achievements, rebuilds, and entitlement status. These signals are used to operate game services, diagnose failures, balance and improve the game, and prevent abuse. Rivet Works does not require your name, email address, contacts, photos, microphone, phone number, or precise GPS location to play.
                        </p>
                    ),
                },
                {
                    title: 'Google Play purchases',
                    content: (
                        <p>
                            Optional one-time digital products are processed by Google Play Billing. Rivet Works does not receive or store your payment-card credentials. To grant, restore, verify, or revoke valid entitlements, the app and its verification service may process the Google Play product identifier, purchase token, purchase state, and verification result. Google processes the payment under its own terms and privacy policies.
                        </p>
                    ),
                },
                {
                    title: 'Advertising and privacy choices',
                    content: (
                        <>
                            <p>
                                The Android release may use Google Mobile Ads for optional rewarded ads and limited interstitial ads at natural game transitions. Google and its advertising partners may process device or other identifiers, app interactions, diagnostics, ad interactions, and approximate location derived from network information where permitted by law and your choices.
                            </p>
                            <p>
                                Rivet Works uses Google User Messaging Platform (UMP) to request and manage privacy choices where required. If a privacy-options entry point is required for your region or consent state, you can reopen it from Rivet Works Settings. The Remove Ads and Supporter purchases suppress forced/interstitial ads; optional rewarded ads remain player-initiated.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Notifications',
                    content: (
                        <p>
                            If you opt in, Rivet Works can schedule local reminders about game progress or useful return moments. Notification permission is optional. You can disable reminders in the game or Android settings. Notification scheduling does not require access to contacts, messages, or precise location.
                        </p>
                    ),
                },
                {
                    title: 'Service providers and international processing',
                    content: (
                        <p>
                            Limited information may be processed by providers needed to operate the game, including Google Play Billing, Google Mobile Ads, Google UMP, hosting, database, security, and backend infrastructure. Provider processing is governed by their own terms and privacy policies. Data may be processed in countries other than yours subject to applicable law and safeguards.
                        </p>
                    ),
                },
                {
                    title: 'Retention, deletion, and your choices',
                    content: (
                        <ul className={listClass}>
                            <li>Reset local progress from Settings or remove app-local data by uninstalling the game, subject to device backup behavior.</li>
                            <li>Use Restore Purchases to re-check eligible Google Play ownership.</li>
                            <li>Use Ad Privacy Options in Settings when the provider indicates that privacy choices are available.</li>
                            <li>Disable notifications in Rivet Works or Android settings.</li>
                            <li>For developer-controlled backend privacy or deletion requests, email founder@virzyguns.com. We may need enough information to locate and verify the relevant anonymous record.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Children and security',
                    content: (
                        <p>
                            Rivet Works is not directed to children under 13. The production release is positioned for ages 13 and over. Reasonable technical and organizational safeguards are used, including encrypted network transport for production services where applicable, but no system can be guaranteed completely secure.
                        </p>
                    ),
                },
                {
                    title: 'Updates and terms',
                    content: (
                        <p>
                            This policy may be updated when Rivet Works, its SDKs, or legal requirements change. Material changes will be published here with a revised effective date. See the <Link className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="/rivet-works/terms">Rivet Works Terms of Use</Link> for purchase and gameplay terms.
                        </p>
                    ),
                },
            ]}
        />
    );
}
