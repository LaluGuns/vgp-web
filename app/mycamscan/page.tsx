import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    Camera,
    CheckCircle2,
    Contrast,
    CreditCard,
    FileArchive,
    FileSearch,
    FileText,
    PenLine,
    ScanLine,
    ScanText,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { CinematicBackdrop, EditorialButton, SectionShell } from '@/components/editorial/EditorialPrimitives';

const PAGE_URL = 'https://virzyguns.com/mycamscan';

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
    { title: 'Fast scan', body: 'Point, capture and get a clean page in seconds.', Icon: Zap },
    { title: 'Max Quality capture', body: '3-frame capture for the sharpest result on detailed pages.', Icon: Camera },
    { title: 'Auto crop and enhance', body: 'Edges are found and the page is cleaned up automatically.', Icon: ScanLine },
    { title: 'On-device OCR', body: 'Text recognition runs on your phone, not on a server.', Icon: ScanText },
    { title: 'Searchable PDF', body: 'Export PDFs with selectable, searchable text.', Icon: FileSearch },
    { title: 'ID card mode', body: 'Capture both sides of an ID card onto one page.', Icon: CreditCard },
    { title: 'Signature', body: 'Sign a document right in the app.', Icon: PenLine },
    { title: 'PDF compression', body: 'Shrink files for email and messaging.', Icon: FileArchive },
    { title: 'No watermark', body: 'Your exports are clean, with nothing added to the page.', Icon: Contrast },
    { title: 'No account', body: 'Nothing to sign up for. Your scans stay on your device.', Icon: ShieldCheck },
];

const linkClass =
    'font-semibold text-sky-100 underline decoration-sky-200/30 underline-offset-4 hover:text-white';

export default function MyCamScanPage() {
    return (
        <article className="editorial-shell min-h-screen text-white">
            <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
                <CinematicBackdrop />
                <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/60">
                            MyCamScan · Virzy Guns Production
                        </p>
                        <h1 className="mt-5 font-display text-4xl font-normal leading-[1.02] text-white sm:text-6xl">
                            MyCamScan
                        </h1>
                        <p className="mt-4 text-xl font-semibold text-white/85 sm:text-2xl">
                            Scan documents, OCR, searchable PDF, private on-device
                        </p>
                        <p className="mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
                            A document scanner for Android that turns paper into clean, searchable PDFs. Text
                            recognition runs on your phone and your scans stay on your device.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-5 py-2.5 text-sm font-semibold text-sky-100">
                                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                Coming soon on Google Play
                            </span>
                            <EditorialButton href="/mycamscan/privacy" variant="ghost">Privacy Policy</EditorialButton>
                            <EditorialButton href="/mycamscan/terms" variant="ghost">Terms of Use</EditorialButton>
                        </div>
                    </div>
                    <div className="mx-auto w-full max-w-[16rem]">
                        <Image
                            src="/images/mycamscan-app-icon.png"
                            alt="MyCamScan app icon"
                            width={512}
                            height={512}
                            priority
                            className="h-auto w-full rounded-[22%] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.55)]"
                        />
                    </div>
                </div>
            </section>

            <SectionShell className="pt-4">
                <div className="mb-8 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-sky-200/70" aria-hidden="true" />
                    <h2 className="font-display text-3xl font-normal text-white sm:text-4xl">What it does</h2>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ title, body, Icon }) => (
                        <li key={title} className="liquid-glass rounded-lg p-6">
                            <Icon className="h-5 w-5 text-sky-200/70" aria-hidden="true" />
                            <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                            <p className="mt-2 text-sm leading-7 text-white/60">{body}</p>
                        </li>
                    ))}
                </ul>
            </SectionShell>

            <section className="px-4 pb-20 sm:px-6 sm:pb-24">
                <div className="liquid-glass-strong mx-auto max-w-4xl rounded-lg p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/55">Legal</p>
                    <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                        Read the{' '}
                        <Link className={linkClass} href="/mycamscan/privacy">Privacy Policy</Link> and the{' '}
                        <Link className={linkClass} href="/mycamscan/terms">Terms of Use</Link>. Both are also
                        available in Bahasa Indonesia at the end of each page.
                    </p>
                </div>
            </section>
        </article>
    );
}
