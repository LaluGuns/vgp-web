'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import styles from './games.module.css';

type ArcadeGame = {
  slug: string;
  title: string;
  type: string;
  href: string;
  image: string;
  imageAlt: string;
  cue: string;
  accent: string;
  previewId: string;
};

function PlayGlyph() {
  return <span aria-hidden="true" className={styles.playGlyph}>▶</span>;
}

export default function GameArcade({ games }: { games: readonly ArcadeGame[] }) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const tapGrooveIndex = games.findIndex((game) => game.slug === 'tap-groove');
    return tapGrooveIndex >= 0 ? tapGrooveIndex : 0;
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const activeGame = games[activeIndex] ?? games[0];

  function choose(index: number) {
    setActiveIndex(index);
    setPreviewOpen(false);
  }

  useEffect(() => {
    if (!previewOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [previewOpen]);

  const activeStyle = { '--active-accent': activeGame.accent } as CSSProperties;

  return (
    <section className={styles.hub} style={activeStyle} aria-label="VGP Games">
      <div className={styles.desktopExperience}>
        <header className={styles.desktopTopbar}>
          <a href="/" className={styles.brandLockup} aria-label="VGP home">
            <strong>VGP</strong>
            <span>Games</span>
          </a>
          <div className={styles.desktopTopbarRight}>
            <span className={styles.mantra}>100% Play. 100% VGP.</span>
            <a href="/" className={styles.homeLink}>VGP Home</a>
          </div>
        </header>

        <main className={styles.desktopMain}>
          <section className={styles.desktopFeatured} aria-label={`Featured game: ${activeGame.title}`}>
            <div className={styles.desktopFeaturedInfo}>
              <p className={styles.featureBadge}>Featured game</p>
              <div>
                <p className={styles.gameType}>{activeGame.type}</p>
                <h1>{activeGame.title}</h1>
                <p className={styles.featureCue}>{activeGame.cue}</p>
              </div>
              <div className={styles.desktopActions}>
                <a href={activeGame.href} className={styles.primaryButton}>
                  <span>Play</span>
                  <PlayGlyph />
                </a>
                <button type="button" className={styles.secondaryButton} onClick={() => setPreviewOpen(true)}>
                  <span>Watch preview</span>
                  <PlayGlyph />
                </button>
              </div>
            </div>

            <div className={styles.desktopFeaturedMedia}>
              <Image
                key={activeGame.slug}
                src={activeGame.image}
                alt={activeGame.imageAlt}
                fill
                priority
                sizes="(min-width: 1180px) 58vw, (min-width: 761px) 55vw, 0px"
                className={styles.featureImage}
              />
            </div>
          </section>

          <section className={styles.desktopLibrary} aria-labelledby="desktop-library-title">
            <div className={styles.libraryHeader}>
              <div>
                <p>VGP Games</p>
                <h2 id="desktop-library-title">Play our games</h2>
              </div>
            </div>

            <div className={styles.desktopGameGrid} role="list" aria-label="VGP game library">
              {games.map((game, index) => {
                const active = index === activeIndex;
                return (
                  <article
                    key={game.slug}
                    role="listitem"
                    className={`${styles.desktopGameCard} ${active ? styles.desktopGameCardActive : ''}`}
                    style={{ '--game-accent': game.accent } as CSSProperties}
                  >
                    <button
                      type="button"
                      className={styles.cardSelect}
                      aria-label={`Feature ${game.title}`}
                      aria-pressed={active}
                      onClick={() => choose(index)}
                    >
                      <span className={styles.desktopCardThumb}>
                        <Image src={game.image} alt={game.imageAlt} fill sizes="(min-width: 1100px) 31vw, 44vw" />
                      </span>
                    </button>
                    <div className={styles.desktopCardFooter}>
                      <button type="button" className={styles.cardTitleButton} onClick={() => choose(index)}>
                        <span className={styles.cardType}>{game.type}</span>
                        <strong>{game.title}</strong>
                      </button>
                      <a href={game.href} className={styles.cardPlayLink} aria-label={`Play ${game.title}`}>
                        <span>Play</span>
                        <PlayGlyph />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <footer className={styles.desktopFooter}>100% Play. 100% VGP.</footer>
        </main>
      </div>

      <div className={styles.mobileExperience}>
        <header className={styles.mobileTopbar}>
          <a href="/" className={styles.brandLockup} aria-label="VGP home">
            <strong>VGP</strong>
            <span>Games</span>
          </a>
          <a href="/" className={styles.mobileHomeLink}>VGP</a>
        </header>

        <main className={styles.mobileMain}>
          <section className={styles.mobileFeatured} aria-label={`Featured game: ${activeGame.title}`}>
            <div className={styles.mobileFeaturedArt}>
              <Image
                key={activeGame.slug}
                src={activeGame.image}
                alt={activeGame.imageAlt}
                fill
                priority
                sizes="100vw"
                className={styles.featureImage}
              />
            </div>
            <div className={styles.mobileFeaturedInfo}>
              <p className={styles.gameType}>{activeGame.type}</p>
              <h1>{activeGame.title}</h1>
              <p>{activeGame.cue}</p>
              <div className={styles.mobileActions}>
                <a href={activeGame.href} className={styles.primaryButton}>
                  <span>Play</span>
                  <PlayGlyph />
                </a>
                <button type="button" className={styles.secondaryButton} onClick={() => setPreviewOpen(true)}>
                  <span>Watch preview</span>
                  <PlayGlyph />
                </button>
              </div>
            </div>
          </section>

          <section className={styles.mobileLibrary} aria-labelledby="mobile-library-title">
            <div className={styles.mobileLibraryHeader}>
              <p>VGP Games</p>
              <h2 id="mobile-library-title">Play our games</h2>
            </div>

            <div className={styles.mobileRows} role="list" aria-label="More VGP games">
              {games.map((game, index) => {
                if (index === activeIndex) return null;
                return (
                  <article
                    key={game.slug}
                    role="listitem"
                    className={styles.mobileGameRow}
                    style={{ '--game-accent': game.accent } as CSSProperties}
                  >
                    <button type="button" className={styles.mobileRowSelect} onClick={() => choose(index)}>
                      <span className={styles.mobileRowThumb}>
                        <Image src={game.image} alt="" fill sizes="132px" />
                      </span>
                      <span className={styles.mobileRowTitle}>
                        <small>{game.type}</small>
                        <strong>{game.title}</strong>
                      </span>
                    </button>
                    <a href={game.href} className={styles.mobileRowPlay} aria-label={`Play ${game.title}`}>
                      <PlayGlyph />
                    </a>
                  </article>
                );
              })}
            </div>
          </section>

          <footer className={styles.mobileFooter}>100% Play. 100% VGP.</footer>
        </main>
      </div>

      {previewOpen ? (
        <div className={styles.previewOverlay} role="presentation" onMouseDown={() => setPreviewOpen(false)}>
          <section
            className={styles.previewSheet}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeGame.title} gameplay preview`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.previewHeader}>
              <div>
                <small>Gameplay preview</small>
                <strong>{activeGame.title}</strong>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview">×</button>
            </div>
            <div className={styles.previewVideo}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeGame.previewId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                title={`${activeGame.title} gameplay preview`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
