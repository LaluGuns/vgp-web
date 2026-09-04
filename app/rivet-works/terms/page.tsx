import Link from 'next/link';
import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';

export const metadata: Metadata = {
    title: 'Rivet Works Terms of Use',
    description: 'Terms of use for Rivet Works by PT Kreasi Virzy Nusantara.',
    alternates: { canonical: '/rivet-works/terms' },
    openGraph: {
        title: 'Rivet Works Terms of Use',
        description: 'Gameplay, purchase, advertising, and service terms for Rivet Works.',
        url: 'https://www.virzyguns.com/rivet-works/terms',
    },
    robots: { index: true, follow: true },
};

export default function RivetWorksTermsPage() {
    return (
        <PolicyPage
            eyebrow="Rivet Works · PT Kreasi Virzy Nusantara"
            title="Terms of Use"
            summary="These Terms govern use of Rivet Works. In-game cash, Blueprints, upgrades, rewards, and other virtual items are entertainment features with no real-world cash value and are not gambling instruments."
            effectiveDate="September 4, 2026"
            sections={[
                {
                    title: 'License',
                    content: (
                        <p>
                            You receive a limited, personal, non-exclusive, non-transferable license to use Rivet Works for entertainment. You may not exploit, tamper with purchase verification, automate abuse, interfere with the service, or reverse engineer the app except where applicable law expressly permits it.
                        </p>
                    ),
                },
                {
                    title: 'Eligibility',
                    content: (
                        <p>
                            Rivet Works is not directed to children under 13. If you are a minor where you live, use the game only with any consent required by applicable law.
                        </p>
                    ),
                },
                {
                    title: 'Game progress and balancing',
                    content: (
                        <p>
                            Rivet Works is designed primarily around local game progress. Economy values, progression, rewards, objectives, and features may be rebalanced or updated to improve the game. We will not intentionally remove a valid paid entitlement without a lawful or provider-supported reason.
                        </p>
                    ),
                },
                {
                    title: 'Optional purchases',
                    content: (
                        <p>
                            The Android release may offer one-time Google Play products such as Remove Ads and Supporter. Supporter includes the Remove Ads entitlement plus an in-game supporter status benefit. Remove Ads removes forced/interstitial ads but does not remove optional rewarded ads that you choose to watch for a bonus. Product availability and localized prices are shown by Google Play. These products are not subscriptions unless a future Play product page explicitly states otherwise.
                        </p>
                    ),
                },
                {
                    title: 'Payment, restoration, and refunds',
                    content: (
                        <p>
                            Google Play processes Android purchases and payment details. Eligible non-consumable purchases can be restored through the Restore Purchases action when supported by Google Play. Refunds, chargebacks, and payment disputes are subject to Google Play rules and applicable consumer law. Fraudulent, refunded, revoked, or otherwise invalid purchases may result in the related entitlement being revoked.
                        </p>
                    ),
                },
                {
                    title: 'Advertising and rewarded bonuses',
                    content: (
                        <p>
                            Rivet Works may show limited advertising. Rewarded ads are optional and must be initiated by the player. Interstitial ads are limited to natural transitions and are suppressed by the Remove Ads entitlement. Ad rewards are virtual game bonuses and do not represent money, investments, transferable property, or guaranteed outcomes.
                        </p>
                    ),
                },
                {
                    title: 'Availability and online services',
                    content: (
                        <p>
                            We may update, suspend, replace, or discontinue online features, Daily objectives, advertising, purchase-provider integrations, or backend services. Core local gameplay may continue where technically possible, but uninterrupted availability is not guaranteed.
                        </p>
                    ),
                },
                {
                    title: 'Privacy',
                    content: (
                        <p>
                            Data handling is described in the <Link className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href="/rivet-works/privacy">Rivet Works Privacy Policy</Link>.
                        </p>
                    ),
                },
                {
                    title: 'Disclaimer and liability',
                    content: (
                        <p>
                            Rivet Works is provided on an “as available” basis to the extent permitted by law. Nothing in these Terms excludes rights or remedies that cannot legally be excluded. To the maximum extent permitted by law, PT Kreasi Virzy Nusantara is not responsible for indirect or consequential losses arising from use of the game.
                        </p>
                    ),
                },
                {
                    title: 'Governing law and contact',
                    content: (
                        <p>
                            These Terms are governed by applicable laws of Indonesia without overriding mandatory consumer protections that apply in your country or region. Questions may be sent to founder@virzyguns.com.
                        </p>
                    ),
                },
            ]}
        />
    );
}
