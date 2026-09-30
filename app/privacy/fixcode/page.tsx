import type { Metadata } from 'next';
import { PolicyPage } from '@/components/policies/PolicyPage';
import { founderEmail } from '@/lib/founder-contact';

export const metadata: Metadata = {
    title: 'FixCode Privacy Policy',
    description: 'Privacy policy for FixCode, the offline-first washing-machine troubleshooting app by Virzy Guns.',
    alternates: { canonical: '/privacy/fixcode' },
    openGraph: {
        title: 'FixCode Privacy Policy',
        description: 'How FixCode handles camera scans, on-device OCR, local troubleshooting data, and external manufacturer links.',
        url: 'https://www.virzyguns.com/privacy/fixcode',
    },
    robots: { index: true, follow: true },
};

const listClass = 'list-disc space-y-2 pl-5 marker:text-sky-200/45';

export default function FixCodePrivacyPage() {
    return (
        <PolicyPage
            eyebrow="FixCode · Virzy Guns"
            title="Privacy Policy"
            summary="FixCode is designed as an offline-first washing-machine troubleshooting app. Camera scans and diagnosis inputs are processed on the device and are not intentionally uploaded by FixCode app code."
            effectiveDate="September 30, 2026"
            sections={[
                {
                    title: 'Scope and operator',
                    content: (
                        <p>
                            This policy applies to FixCode, package <code>com.virzyguns.fixcode</code>, published by Virzy Guns. FixCode helps users interpret washing-machine error codes and common symptoms using a bundled local troubleshooting database.
                        </p>
                    ),
                },
                {
                    title: 'Camera and on-device OCR',
                    content: (
                        <>
                            <p>
                                FixCode can access the camera only after you choose the scan feature and grant camera permission. A captured image is used for on-device OCR so FixCode can read the washer display.
                            </p>
                            <p>
                                FixCode does not intentionally upload that image to Virzy Guns, a FixCode backend, an analytics provider, or an advertising provider. The temporary camera file is used for the active scan and deletion is attempted immediately after OCR finishes, fails, or is cancelled. FixCode does not write scan images to its SQLite database or to the device photo library.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Manual input and diagnosis data',
                    content: (
                        <p>
                            Brand choices, error codes, and symptom selections are processed locally against the bundled FixCode knowledge database. FixCode does not create a user account, diagnosis history, advertising profile, or cloud backup from those inputs in the current version.
                        </p>
                    ),
                },
                {
                    title: 'Local storage',
                    content: (
                        <p>
                            FixCode stores a local SQLite database containing bundled manufacturer troubleshooting guidance plus version and integrity metadata. This database is product content, not a user profile. Clearing app storage or uninstalling FixCode removes app-local storage managed by the operating system, subject to normal device backup or restore behavior.
                        </p>
                    ),
                },
                {
                    title: 'Camera permission',
                    content: (
                        <p>
                            Camera access is optional. It is used only for the scan flow. If you deny camera access, you can still type an error code manually or use the no-code symptom flow. Camera permission can be changed later in your device settings.
                        </p>
                    ),
                },
                {
                    title: 'External manufacturer links',
                    content: (
                        <p>
                            FixCode opens manufacturer support links only after you tap a source. The link is handed to your device browser or another external application. Once an external site or app is opened, its own privacy practices apply.
                        </p>
                    ),
                },
                {
                    title: 'Accounts, advertising, analytics, and remote AI',
                    content: (
                        <p>
                            The current FixCode source does not include account creation, advertising, analytics, cloud diagnosis, or remote AI diagnosis. If a future release adds any of those features, this policy and the relevant app-store disclosures must be updated before that behavior is released.
                        </p>
                    ),
                },
                {
                    title: 'Retention and deletion',
                    content: (
                        <>
                            <ul className={listClass}>
                                <li>FixCode does not maintain a cloud account, server-side diagnosis history, or server-side scan-image archive in the current version.</li>
                                <li>The temporary camera file used for OCR is scheduled for best-effort deletion immediately after the scan finishes, fails, or is cancelled.</li>
                                <li>The bundled SQLite database stores product guidance, not user-submitted content.</li>
                                <li>Clearing FixCode app storage or uninstalling the app removes app-local storage managed by the operating system, subject to normal device backup or restore behavior.</li>
                            </ul>
                            <p>
                                Because FixCode does not maintain a Virzy Guns account or server-side diagnosis record in the current version, there is no FixCode cloud account or diagnosis history to request for deletion.
                            </p>
                        </>
                    ),
                },
                {
                    title: 'Privacy requests and policy changes',
                    content: (
                        <>
                            <p>
                                If FixCode later stores user data off-device, this policy will be updated with the applicable retention and deletion process before that behavior is released.
                            </p>
                            <p>
                                For a privacy question or developer-controlled request, contact <a className="text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white" href={`mailto:${founderEmail}`}>{founderEmail}</a>.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
