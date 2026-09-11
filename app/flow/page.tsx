import type { Metadata } from 'next';
import FlowClient from './FlowClient';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
    title: 'Flow by Virzy Guns — Deep Work Music & Pomodoro Timer',
    description:
        'Flow is a deep work app that pairs a pomodoro timer with focus music produced in-house by Virzy Guns. Free to use without an account, honest measured-only stats, four visual themes, and eleven languages.',
    keywords: [
        'Flow by Virzy Guns',
        'deep work music',
        'focus music app',
        'pomodoro timer',
        'focus timer',
        'study music',
        'work music',
        'concentration music',
        'flow state',
        'Virzy Guns Production',
    ],
    alternates: {
        canonical: '/flow',
    },
    openGraph: {
        title: 'Flow by Virzy Guns — Deep Work Music & Pomodoro Timer',
        description:
            'A pomodoro timer wrapped in focus music produced in-house by Virzy Guns. Free without an account, measured-only stats, four visual themes, eleven languages.',
        url: 'https://www.virzyguns.com/flow',
        type: 'website',
        images: ['/branding/vgp-logo-chrome-full.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Flow by Virzy Guns — Deep Work Music & Pomodoro Timer',
        description:
            'Deep work music and a pomodoro timer in one place. Music produced in-house, stats that only count what they measure.',
        images: ['/branding/vgp-logo-chrome-full.png'],
    },
};

const flowJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://www.virzyguns.com/flow#product',
    name: 'Flow by Virzy Guns',
    alternateName: ['Flow', 'Flowstate'],
    url: 'https://flow.virzyguns.com',
    sameAs: ['https://www.virzyguns.com/flow'],
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    description:
        'A deep work app that pairs a pomodoro timer with focus music produced in-house by Virzy Guns. Free tier without an account; Flow Pro unlocks the full catalog and themes.',
    author: {
        '@id': 'https://www.virzyguns.com/#founder',
    },
    publisher: {
        '@id': 'https://www.virzyguns.com/#organization',
    },
    offers: [
        {
            '@type': 'Offer',
            name: 'Flow Free',
            price: '0',
            priceCurrency: 'USD',
            url: 'https://flow.virzyguns.com',
        },
        {
            '@type': 'Offer',
            name: 'Flow Pro Monthly',
            price: '9.99',
            priceCurrency: 'USD',
            url: 'https://flow.virzyguns.com',
        },
        {
            '@type': 'Offer',
            name: 'Flow Pro Yearly',
            price: '59.99',
            priceCurrency: 'USD',
            url: 'https://flow.virzyguns.com',
        },
    ],
};

export default function FlowPage() {
    return (
        <>
            <JsonLd data={flowJsonLd} />
            <FlowClient />
        </>
    );
}
