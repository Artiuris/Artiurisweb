import Link from "next/link";
import Image from "next/image";
import styles from "../../page.module.css";
import siteConfig from "@/data/site-config.json";
import artists from "@/data/artists.json";
import type { Artist, SiteConfig } from "@/lib/types";

const typedArtists = artists as Artist[];
const config = siteConfig as SiteConfig;

interface Props {
  params: Promise<{ technique: string }>;
}

// Use dynamic rendering to avoid build issues with long technique names
export const dynamic = "force-dynamic";


export default async function DisciplinePage({ params }: Props) {
  const { technique: rawTech } = await params;
  const technique = decodeURIComponent(rawTech);

  // Get all works with this technique
  const worksForTech: { artist: Artist; work: Artist["works"][0] }[] = [];
  for (const artist of typedArtists) {
    for (const work of artist.works) {
      if (work.technique === technique) {
        worksForTech.push({ artist, work });
      }
    }
  }

  // Get discipline content from config
  const disciplines = config.disciplines || {};
  const disc = disciplines[technique];
  const title = disc?.title || technique;
  const description = disc?.description || `Obras de la colección realizadas con la técnica de ${technique.toLowerCase()}.`;

  // Featured works for this discipline
  const featuredIds = disc?.works || [];
  const featuredWorks = featuredIds
    .map((id) => worksForTech.find(({ work }) => work.id === id))
    .filter(Boolean) as typeof worksForTech;

  // If no featured, pick first 2 with images
  const displayFeatured = featuredWorks.length > 0
    ? featuredWorks
    : worksForTech.filter(({ work }) => work.image).slice(0, 2);

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <Link href="/sobre" style={{ color: "var(--color-accent)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1rem", display: "inline-block" }}>
          ← Volver a Sobre la colección
        </Link>
        <p className={styles.pageLabel}>Disciplina</p>
        <h1 className={styles.pageTitle}>{title}</h1>
        <div className={styles.pageDivider} />
        <p className={styles.heroText}>{description}</p>
      </section>

      {/* Featured works for this technique */}
      {displayFeatured.length > 0 && (
        <section className={styles.contentSection}>
          {displayFeatured.map(({ artist, work }, idx) => (
            <div key={work.id} style={{ textAlign: "center" }}>
              <Link href={`/coleccion/${work.id}`} style={{ textDecoration: "none" }}>
                <div className={styles.contentImage} style={{ position: "relative", marginBottom: "1rem" }}>
                  {work.image && (
                    <Image src={work.image} alt={work.title} fill style={{ objectFit: "cover" }} />
                  )}
                </div>
                <h3 className={styles.contentTitle} style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{work.title}</h3>
              </Link>
              <Link href={`/artistas/${artist.id}`} style={{ color: "var(--color-text-light)", textDecoration: "none", fontSize: "0.85rem" }}>
                {artist.name}
              </Link>
            </div>
          ))}
        </section>
      )}

      {/* Stats */}
      <section className={styles.statsBanner}>
        <div className={styles.statsBannerGrid} style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div>
            <div className={styles.statBannerNumber}>{worksForTech.length}</div>
            <div className={styles.statBannerLabel}>Obras</div>
          </div>
          <div>
            <div className={styles.statBannerNumber}>{new Set(worksForTech.map(({ artist }) => artist.id)).size}</div>
            <div className={styles.statBannerLabel}>Artistas</div>
          </div>
        </div>
      </section>

      {/* All works grid */}
      <section className={styles.techniquesSection}>
        <h2 className={styles.contentTitle} style={{ marginBottom: "2rem" }}>Todas las obras de {technique.toLowerCase()}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem", textAlign: "left" }}>
          {worksForTech.map(({ artist, work }) => (
            <Link key={work.id} href={`/coleccion/${work.id}`} style={{ textDecoration: "none" }}>
              <div style={{ aspectRatio: "3/4", background: "var(--color-bg-warm)", overflow: "hidden", marginBottom: "0.5rem", position: "relative" }}>
                {work.image && <Image src={work.image} alt={work.title} fill style={{ objectFit: "cover" }} />}
              </div>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--color-text)", marginBottom: "0.2rem" }}>{work.title}</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{artist.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
