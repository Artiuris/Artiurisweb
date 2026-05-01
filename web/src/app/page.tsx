import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import siteConfig from "@/data/site-config.json";
import artists from "@/data/artists.json";
import type { Artist, SiteConfig } from "@/lib/types";

const typedArtists = artists as Artist[];
const config = siteConfig as SiteConfig;

// Get real stats
const totalArtists = typedArtists.length;
const totalWorks = typedArtists.reduce((acc, a) => acc + a.works.length, 0);
const allTechniques = new Set<string>();
typedArtists.forEach((a) => a.works.forEach((w) => { if (w.technique) allTechniques.add(w.technique); }));

// Get featured works - use selected IDs or fall back to first 6 with images
function getFeaturedWorks() {
  const allWorks: { artist: Artist; work: Artist["works"][0] }[] = [];
  for (const artist of typedArtists) {
    for (const work of artist.works) {
      allWorks.push({ artist, work });
    }
  }

  if (config.featuredWorkIds && config.featuredWorkIds.length > 0) {
    const featured: typeof allWorks = [];
    for (const id of config.featuredWorkIds) {
      const found = allWorks.find(({ work }) => work.id === id);
      if (found) featured.push(found);
    }
    if (featured.length > 0) return featured;
  }

  return allWorks.filter(({ work }) => work.image).slice(0, 6);
}

// Stats: auto-update or manual
const statsArtists = config.stats.autoUpdate ? `${totalArtists}` : config.stats.artists;
const statsWorks = config.stats.autoUpdate ? `${totalWorks}` : config.stats.works;
const statsDisciplines = config.stats.autoUpdate ? `${allTechniques.size || 5}` : "5";

export default function HomePage() {
  const featuredWorks = getFeaturedWorks();
  const ctaTitle = config.ctaTitle || `Explora ${statsArtists} artistas`;
  const ctaSubtitle = config.ctaSubtitle || "Descubre las obras y biografías de cada artista de la colección";

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroMosaic}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.heroMosaicItem} />
          ))}
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroBanner}>
          <Image
            src="/images/logo-horizontal-highres.png"
            alt="ArtIuris Art Collection"
            width={800}
            height={200}
            className={styles.heroLogo}
            priority
          />
        </div>
        <div className={styles.heroContent}>
          <p className={styles.heroSubtitle}>{config.heroTagline}</p>
          <div className={styles.heroDivider} />
          <Link href="/coleccion" className={styles.heroButton} id="hero-cta">
            Explorar la colección
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{statsArtists}</span>
            <span className={styles.statLabel}>Artistas</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{statsWorks}</span>
            <span className={styles.statLabel}>Obras</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{statsDisciplines}</span>
            <span className={styles.statLabel}>Disciplinas</span>
          </div>
        </div>
      </section>

      {/* Featured Works */}
      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Selección</p>
          <h2 className={styles.sectionTitle}>Obras destacadas</h2>
          <div className={styles.sectionDivider} />
        </div>

        <div className={styles.featuredGrid}>
          {featuredWorks.map(({ artist, work }) => (
            <div key={work.id} className={styles.artworkCard}>
              <div className={styles.artworkImageWrap}>
                <Link href={`/coleccion/${work.id}`} className={styles.cardLinkOverlay} aria-label={work.title} />
                {work.image ? (
                  <Image src={work.image} alt={work.title || "Obra de arte"} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.artworkPlaceholder}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={styles.artworkInfo}>
                <Link href={`/coleccion/${work.id}`} style={{ textDecoration: 'none' }}>
                  <h3 className={styles.artworkTitle}>{work.title}</h3>
                </Link>
                <Link href={`/artistas/${artist.id}`} className={styles.artworkArtistLink}>
                  <p className={styles.artworkArtist}>{artist.name}</p>
                </Link>
                {work.technique && (
                  <p className={styles.artworkTechnique}>{work.technique}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section className={styles.aboutPreview}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <p className={styles.sectionLabel}>Sobre la colección</p>
            <h2 className={styles.aboutQuote}>
              &ldquo;{config.aboutQuote || "El arte es la expresión más pura de la identidad humana"}&rdquo;
            </h2>
            <p className={styles.aboutDescription}>
              {config.aboutText.split("\n")[0]}
            </p>
            <Link href="/sobre" className={styles.aboutLink}>
              Conocer más
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className={styles.aboutImageGrid}>
            <div className={styles.aboutImageItem} />
            <div className={styles.aboutImageItem} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>{ctaTitle}</h2>
        <p className={styles.ctaSubtitle}>{ctaSubtitle}</p>
        <Link href="/artistas" className={styles.ctaButton}>
          Ver todos los artistas
        </Link>
      </section>
    </>
  );
}
