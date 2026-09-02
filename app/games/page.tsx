import type { Metadata } from 'next';
import GameArcade from './GameArcade';
import styles from './games.module.css';

const siteUrl = 'https://www.virzyguns.com';

const games = [
  {
    slug: 'hear-the-difference',
    title: 'Hear the Difference',
    type: 'Ear game',
    cue: 'Two melodies. One note changed. Catch it by ear.',
    href: 'https://htd.virzyguns.com',
    image: 'https://i.ytimg.com/vi/MT78Q9kogpM/hqdefault.jpg',
    imageAlt: 'Hear the Difference gameplay preview',
    accent: '#f1bd2b',
    previewId: 'MT78Q9kogpM',
  },
  {
    slug: 'block-stacker',
    title: 'Block Stacker',
    type: 'Arcade',
    cue: 'Line it up, keep the tower alive, and beat your last run.',
    href: 'https://blockstacker.virzyguns.com',
    image: 'https://i.ytimg.com/vi/7gWp__E7d_c/hqdefault.jpg',
    imageAlt: 'Block Stacker gameplay preview',
    accent: '#5dddc3',
    previewId: '7gWp__E7d_c',
  },
  {
    slug: 'tap-groove',
    title: 'Tap Groove',
    type: 'Rhythm',
    cue: 'Pick a track, follow the lane, and stay locked to the beat.',
    href: 'https://tapgroove.virzyguns.com',
    image: 'https://i.ytimg.com/vi/HV4rdhrGfMk/hqdefault.jpg',
    imageAlt: 'Tap Groove gameplay preview',
    accent: '#ff4f9a',
    previewId: 'HV4rdhrGfMk',
  },
] as const;

const socialImage = 'https://i.ytimg.com/vi/HV4rdhrGfMk/hqdefault.jpg';

export const metadata: Metadata = {
  title: 'VGP Games | Play in Your Browser',
  description: 'Play VGP browser games from Virzy Guns Production, including Hear the Difference, Block Stacker, and Tap Groove.',
  alternates: { canonical: '/games' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'VGP Games | 100% Play. 100% VGP.',
    description: 'A growing browser game playground from Virzy Guns Production.',
    url: `${siteUrl}/games`,
    siteName: 'Virzy Guns Production',
    type: 'website',
    images: [{ url: socialImage, width: 480, height: 360, alt: 'VGP Games' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VGP Games | 100% Play. 100% VGP.',
    description: 'A growing browser game playground from Virzy Guns Production.',
    images: [socialImage],
  },
};

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'VGP Games',
  url: `${siteUrl}/games`,
  description: 'A browser game library from Virzy Guns Production.',
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: games.map((game, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'VideoGame',
        name: game.title,
        url: game.href,
        description: game.cue,
        gamePlatform: 'Web browser',
      },
    })),
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Games', item: `${siteUrl}/games` },
  ],
};

export default function GamesPage() {
  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <GameArcade games={games} />
    </main>
  );
}
