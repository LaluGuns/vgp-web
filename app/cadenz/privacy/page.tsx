import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';

export const metadata: Metadata = {
    title: 'CADENZ Privacy Policy',
    description: 'Privacy information for CADENZ, the cadence-first running and cycling music app by Virzy Guns Production.',
    alternates: { canonical: '/cadenz/privacy' },
    openGraph: {
        title: 'CADENZ Privacy Policy | Virzy Guns Production',
        description: 'Privacy information for the CADENZ app.',
        url: 'https://virzyguns.com/cadenz/privacy',
    },
    robots: {
        index: true,
        follow: true,
    },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function CadenzPrivacyPage() {
    return (
        <PolicyPage
            eyebrow="CADENZ · Virzy Guns Production"
            title="Privacy Policy"
            summary="CADENZ is currently pre-launch. This is the canonical product privacy URL. The policy below describes the current app data flows; any release-specific processor details will be reconciled here before public release."
            effectiveDate="upon public launch"
            sections={[
                {
                    title: 'Operator and scope',
                    content: (
                        <>
                            <p>
                                CADENZ is a running and cycling cadence-music app by Virzy Guns Production, operated by PT KREASI VIRZY NUSANTARA, Indonesia.
                            </p>
                            <p>
                                This policy covers the CADENZ mobile app and its account, workout, subscription, and app-service data flows.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Information CADENZ processes',
                    content: (
                        <ul className={listClass}>
                            <li>Account information such as email address and authentication credentials handled through Supabase Auth.</li>
                            <li>Optional profile information such as name, location text, birth date, weight, height, and running experience.</li>
                            <li>Run information such as time, distance, pace, cadence, music history, GPS quality, and an optional mapped route.</li>
                            <li>Precise location during an optional mapped run, where permission has been granted.</li>
                            <li>Motion and step data for optional running AUTO cadence. Cycling V1 does not treat phone steps or motion as pedal RPM.</li>
                            <li>Subscription and entitlement status from the app stores, RevenueCat, and CADENZ backend services.</li>
                            <li>Crash and diagnostic information needed for reliability and support.</li>
                            <li>Technical network information processed by service providers to operate and protect online services.</li>
                        </ul>
                    ),
                },
                {
                    title: 'How information is used',
                    content: (
                        <ul className={listClass}>
                            <li>Authenticate accounts and support password recovery.</li>
                            <li>Provide cadence-based music, workout tracking, maps, recovery, history, and training features.</li>
                            <li>Synchronize eligible completed workouts when the signed-in user has granted the required route-sync consent and sync is enabled.</li>
                            <li>Verify subscriptions and control Premium access.</li>
                            <li>Diagnose crashes, protect the service, and improve reliability.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Location, route data, and consent',
                    content: (
                        <>
                            <p>
                                Precise location is used only when the user chooses mapped running and grants the required device permission. Accepted GPS points are processed locally during the workout. CADENZ does not use route data as advertising analytics.
                            </p>
                            <p>
                                Completed route synchronization is account-specific and consent-controlled. Withdrawing route-sync consent prevents future queued precise-route uploads from proceeding. A withdrawal does not by itself represent a promise that a route already synchronized to the account has been deleted.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Service providers',
                    content: (
                        <>
                            <ul className={listClass}>
                                <li>Supabase for authentication, database services, and signed backend requests.</li>
                                <li>Google Maps SDK for Android for map display where the feature is used.</li>
                                <li>RevenueCat for subscription management.</li>
                                <li>Apple App Store and Google Play for payment processing.</li>
                                <li>Sentry for crash and diagnostic reporting when configured for the release.</li>
                            </ul>
                            <p>
                                CADENZ uses private, server-authorized audio delivery. The final underlying production storage/CDN provider will be reflected on this page before public release if additional disclosure is required.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Your controls',
                    content: (
                        <ul className={listClass}>
                            <li>Update supported profile information in the app.</li>
                            <li>Delete individual workouts from history.</li>
                            <li>Revoke route-sync consent from Settings for future eligible route synchronization.</li>
                            <li>Revoke location, background-location, or motion permission in device settings.</li>
                            <li>Delete your CADENZ account from Settings. Local finalization may retry if an interrupted cleanup cannot complete immediately.</li>
                            <li>Contact the owner using the email shown below for privacy or data requests.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Retention and security',
                    content: (
                        <>
                            <p>
                                Active-workout GPS points are retained locally only as needed to operate and recover the workout. Completed local workout information remains until the user deletes it, while synchronized account data is subject to deletion and provider backup-retention processes.
                            </p>
                            <p>
                                CADENZ uses HTTPS/TLS in transit, short-lived signed URLs for private audio delivery, server-side entitlement checks for Premium access, authenticated owner boundaries for account data, and platform-level authentication controls.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Children and policy updates',
                    content: (
                        <>
                            <p>
                                CADENZ is not designed or marketed as a service for children. Any age-specific requirement that applies to the final release jurisdiction will be reflected in the effective release policy rather than guessed in this pre-launch notice.
                            </p>
                            <p>
                                This page may be updated before launch as release infrastructure and store disclosures are finalized. Material post-launch changes will be reflected here with an updated policy date.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
