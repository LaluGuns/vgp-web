import type { Metadata } from 'next';
import Link from 'next/link';
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
    image: '/games/hear-the-difference.webp',
    imageAlt: 'Hear the Difference game artwork',
    accent: '#f1bd2b',
    previewId: 'MT78Q9kogpM',
  },
  {
    slug: 'block-stacker',
    title: 'Block Stacker',
    type: 'Arcade',
    cue: 'Line it up, keep the tower alive, and beat your last run.',
    href: 'https://blockstacker.virzyguns.com',
    image: '/games/block-stacker.webp',
    imageAlt: 'Block Stacker game artwork with colorful stacked blocks',
    accent: '#5dddc3',
    previewId: '7gWp__E7d_c',
  },
  {
    slug: 'tap-groove',
    title: 'Tap Groove',
    type: 'Rhythm',
    cue: 'Pick a track, follow the lane, and stay locked to the beat.',
    href: 'https://tapgroove.virzyguns.com',
    image: '/games/tap-groove-home.webp',
    imageAlt: 'Tap Groove logo over a neon rhythm-game scene',
    accent: '#ff4f9a',
    previewId: 'HV4rdhrGfMk',
  },
  {
    slug: 'dirixa',
    title: 'DIRIXA',
    type: 'Puzzle',
    cue: 'Open the route, move the Flow, and clear the board one decision at a time.',
    href: 'https://dirixa.virzyguns.com',
    image: '/games/dirixa.webp',
    imageAlt: 'DIRIXA arrow escape puzzle portal and board artwork',
    accent: '#ffd33d',
  },
  {
    slug: 'rivet-works',
    title: 'Rivet Works',
    type: 'Factory optimization',
    cue: 'Build the line, find the constraint, and rebuild smarter.',
    href: 'https://play.google.com/store/apps/details?id=com.virzyguns.rivetworks',
    image: '/games/rivet-works.webp',
    imageAlt: 'Rivet Works factory machines and conveyors on a blueprint grid',
    accent: '#ffb51b',
  },
] as const;

const socialImage = `${siteUrl}/games/tap-groove-home.webp`;

export const metadata: Metadata = {
  title: 'VGP Games | Play in Your Browser',
  description: 'Play VGP games from Virzy Guns Production: audio puzzles, precision arcade, rhythm, arrow escape, and factory optimization.',
  alternates: { canonical: '/games' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'VGP Games | 100% Play. 100% VGP.',
    description: 'A growing browser game playground from Virzy Guns Production.',
    url: `${siteUrl}/games`,
    siteName: 'Virzy Guns Production',
    type: 'website',
    images: [{ url: socialImage, width: 1280, height: 720, alt: 'VGP Games' }],
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
      <section className={styles.infoSection} aria-labelledby="game-guides-title">
        <div className={styles.infoInner}>
          <p className={styles.infoEyebrow}>Before you play</p>
          <h2 id="game-guides-title">Five games, five ways to play</h2>
          <p className={styles.infoLead}>Each VGP game turns a focused idea into a clean challenge. Choose a game below, learn the objective, then open the play site.</p>
          <div className={styles.guideGrid}>
            <article className={styles.guideCard}>
              <h3>Hear the Difference</h3>
              <p>Listen close, compare the melodies, and find the one note that moved before the clock runs out.</p>
              <p className={styles.guideMeta}>Solo, Daily, and Versus modes</p>
            </article>
            <article className={styles.guideCard}>
              <h3>Block Stacker</h3>
              <p>Place each moving block cleanly. The overlap keeps the tower alive, and sharper timing builds the streak.</p>
              <p className={styles.guideMeta}>Modes: Solo and Daily Challenge</p>
            </article>
            <article className={styles.guideCard}>
              <h3>Tap Groove</h3>
              <p>Choose a track, lock to the lane after the countdown, and keep the groove alive through every section.</p>
              <p className={styles.guideMeta}>Difficulty: Easy, Normal, Hard, Expert</p>
            </article>
            <article className={styles.guideCard}>
              <h3>DIRIXA</h3>
              <p>Open a route through the arrow board, move the Flow, and make each decision count across 180 tactile puzzles.</p>
              <p className={styles.guideMeta}>Puzzle goal: open the path and keep the Flow moving</p>
            </article>
            <article className={styles.guideCard}>
              <h3>Rivet Works</h3>
              <p>Build a production chain, spot the bottleneck, and tune the machine that actually matters. Every rebuild makes the next line stronger.</p>
              <p className={styles.guideMeta}>Android game · eight languages · optional purchases</p>
            </article>
          </div>
          <nav className={styles.infoLinks} aria-label="VGP Games legal and company links">
            <span>VGP Games is operated by Virzy Guns Production.</span>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:founder@virzyguns.com">Contact</a>
          </nav>
        </div>
      </section>
    </main>
  );
}
