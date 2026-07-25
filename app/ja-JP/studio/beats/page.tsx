import type { Metadata } from 'next';
import BeatsClient from '../../../studio/beats/BeatsClient';

const SITE_URL = 'https://www.virzyguns.com';

export const metadata: Metadata = {
    title: 'ビート販売 | サイバーパンクトラップ、フォンク＆シンセウェーブ | Virzy Guns',
    description:
        'Virzy Gunsによる公式インストゥルメンタルのライセンス購入。サイバーパンクトラップ、フォンク、シンセウェーブ、重厚な808ベース。',
    keywords: [
        'ビート購入',
        'トラップビート',
        'サイバーパンクビート',
        'フォンクビート',
        'シンセウェーブ',
        'Virzy Guns',
    ],
    alternates: {
        canonical: `${SITE_URL}/ja-JP/studio/beats`,
        languages: {
            'en-US': `${SITE_URL}/studio/beats`,
            'ja-JP': `${SITE_URL}/ja-JP/studio/beats`,
            'de-DE': `${SITE_URL}/de-DE/studio/beats`,
            'x-default': `${SITE_URL}/studio/beats`,
        },
    },
    openGraph: {
        title: 'ビート販売 | Virzy Guns Production',
        description: 'Virzy Guns制作の公式サイバーパンクトラップ、フォンク、シンセウェーブビートのライセンス購入。',
        url: `${SITE_URL}/ja-JP/studio/beats`,
        siteName: 'Virzy Guns Production',
        images: [
            {
                url: `${SITE_URL}/branding/vgp-logo-chrome-full.png`,
                width: 1024,
                height: 1024,
                alt: 'Virzy Guns Production Beat Store',
            },
        ],
        type: 'website',
    },
};

const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/ja-JP/studio/beats#collection`,
            name: 'Virzy Guns ビートストア',
            description: 'Virzy Guns制作の公式ビートカタログ。サイバーパンクトラップ、フォンク、シンセウェーブ。',
            url: `${SITE_URL}/ja-JP/studio/beats`,
        },
        {
            '@type': 'BreadcrumbList',
            '@id': `${SITE_URL}/ja-JP/studio/beats#breadcrumbs`,
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: SITE_URL,
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Beats',
                    item: `${SITE_URL}/ja-JP/studio/beats`,
                },
            ],
        },
    ],
};

export default function JapaneseBeatsIndexPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
            />
            <BeatsClient locale="ja-JP" />
        </>
    );
}
