import type { Metadata } from 'next';
import Image from 'next/image';
import { EditorialButton, TextLink } from '@/components/editorial/EditorialPrimitives';

const PAGE_URL = 'https://www.virzyguns.com/mycamscan';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.virzyguns.mycamscan';

export const metadata: Metadata = {
    title: 'MyCamScan | Document Scanner, OCR and Searchable PDF',
    description:
        'MyCamScan scans documents, runs OCR and exports searchable PDFs privately on your Android device. No account and no watermark. By Virzy Guns Production.',
    keywords: [
        'MyCamScan',
        'document scanner',
        'OCR scanner',
        'searchable PDF',
        'private document scanner',
        'on-device OCR',
        'ID card scanner',
        'PDF compression',
        'Virzy Guns Production',
    ],
    alternates: { canonical: PAGE_URL },
    openGraph: {
        title: 'MyCamScan | Scan documents, OCR, searchable PDF, private on-device',
        description:
            'Fast scan, auto crop and enhance, on-device OCR and searchable PDF export. No account. No watermark.',
        url: PAGE_URL,
        siteName: 'Virzy Guns Production',
        type: 'website',
        images: [
            {
                url: '/images/mycamscan-app-icon.png',
                width: 1024,
                height: 1024,
                alt: 'MyCamScan app icon',
            },
        ],
    },
    twitter: {
        card: 'summary',
        title: 'MyCamScan | Document scanner and OCR',
        description: 'Scan documents, OCR and searchable PDF, private on-device.',
        images: ['/images/mycamscan-app-icon.png'],
    },
    robots: { index: true, follow: true },
};

const features = [
    { title: 'Fast scan', body: 'Point, capture and get a clean page in seconds.' },
    { title: 'Max Quality capture', body: 'Three frames are combined for the sharpest result on detailed pages.' },
    { title: 'Auto crop and enhance', body: 'Edges are found and the page is cleaned up automatically.' },
    { title: 'On-device OCR', body: 'Text recognition runs on your phone, not on a server.' },
    { title: 'Searchable PDF', body: 'Export PDFs with selectable, searchable text.' },
    { title: 'ID card mode', body: 'Capture both sides of an ID card onto one page.' },
    { title: 'Signature', body: 'Sign a document right in the app.' },
    { title: 'PDF compression', body: 'Shrink files for email and messaging.' },
    { title: 'No watermark', body: 'Exports stay clean, with nothing added to the page.' },
    { title: 'No account', body: 'Nothing to sign up for. Your scans stay on your device.' },
];

export default function MyCamScanPage() {
    return (
        <article className="editorial-shell min-h-screen text-white">
            <section data-enter="" className="px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:items-center">
                    <div className="lg:col-span-7">
                        <p className="text-sm text-sky-300">On Google Play</p>
                        <h1 className="mt-4 font-display text-[clamp(2.75rem,6.5vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.04em]">
                            MyCamScan
                        </h1>
                        <p className="mt-5 max-w-xl text-xl leading-8 text-white/80 sm:text-2xl sm:leading-9">
                            Scan paper into searchable PDFs, privately, on your Android phone.
                        </p>
                        <p className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
                            Text recognition runs on the device and the scans never leave it. No account and no watermark.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                            <EditorialButton href={PLAY_URL} withArrow>
                                Get it on Google Play
                            </EditorialButton>
                            <TextLink href="/mycamscan/privacy">Privacy Policy</TextLink>
                        </div>
                    </div>
                    <div className="lg:col-span-4 lg:col-start-9">
                        <Image
                            src="/images/mycamscan-app-icon.png"
                            alt="MyCamScan app icon"
                            width={512}
                            height={512}
                            priority
                            sizes="(min-width: 1024px) 280px, 224px"
                            className="mx-auto h-auto w-56 rounded-[22%] border border-white/10 lg:w-full lg:max-w-[280px]"
                        />
                    </div>
                </div>
            </section>

            <section data-reveal="" aria-labelledby="features-heading" className="border-t border-white/10 px-4 py-16 sm:px-6 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
                    <h2 id="features-heading" className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:col-span-4">
                        What it does
                    </h2>
                    <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-8">
                        {features.map(({ title, body }) => (
                            <div key={title} className="border-t border-white/10 pt-5">
                                <dt className="text-lg font-semibold text-white">{title}</dt>
                                <dd className="mt-2 text-base leading-7 text-white/65">{body}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            <section data-reveal="" className="border-t border-white/10 px-4 pb-24 pt-14 sm:px-6">
                <p className="mx-auto max-w-7xl text-base leading-7 text-white/65">
                    The <TextLink href="/mycamscan/privacy" inline>Privacy Policy</TextLink> and{' '}
                    <TextLink href="/mycamscan/terms" inline>Terms of Use</TextLink> are also available in Bahasa Indonesia
                    at the end of each page.
                </p>
            </section>
        </article>
    );
}
