import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import artists from "@/data/artists.json";
import type { Artist } from "@/lib/types";
import ExtraInfoToggle from "./ExtraInfoToggle";

const typedArtists = artists as Artist[];

export function generateStaticParams() {
  return typedArtists.map((artist) => ({
    id: artist.id,
  }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  // We need to use a sync approach for static generation
  return params.then(({ id }) => {
    const artist = typedArtists.find((a) => a.id === id);
    return {
      title: artist ? `${artist.name} — ArtIuris Collection` : "Artista no encontrado",
      description: artist?.biography?.slice(0, 160) || "",
    };
  });
}

export default async function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = typedArtists.find((a) => a.id === id);

  if (!artist) {
    notFound();
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Inicio</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/artistas" className={styles.breadcrumbLink}>Artistas</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{artist.name}</span>
      </nav>

      {/* Artist Header */}
      <div className={styles.artistHeader}>
        <div className={styles.artistPhoto}>
          {artist.photo ? (
            <img src={artist.photo} alt={artist.name} />
          ) : (
            <span className={styles.artistPhotoInitial}>{artist.name.charAt(0)}</span>
          )}
        </div>

        <div className={styles.artistInfo}>
          <h1 className={styles.artistName}>{artist.name}</h1>

          <div className={styles.artistMeta}>
            {artist.birthYear && (
              <div className={styles.artistMetaItem}>
                <span className={styles.artistMetaLabel}>Año de nacimiento</span>
                <span className={styles.artistMetaValue}>{artist.birthYear}</span>
              </div>
            )}
            {artist.birthPlace && (
              <div className={styles.artistMetaItem}>
                <span className={styles.artistMetaLabel}>Lugar de nacimiento</span>
                <span className={styles.artistMetaValue}>{artist.birthPlace}</span>
              </div>
            )}
            <div className={styles.artistMetaItem}>
              <span className={styles.artistMetaLabel}>Obras en la colección</span>
              <span className={styles.artistMetaValue}>{artist.works.length}</span>
            </div>
          </div>

          <p className={styles.artistBio}>{artist.biography}</p>

          {artist.extraInfo && (
            <ExtraInfoToggle text={artist.extraInfo} />
          )}
        </div>
      </div>

      {/* Works */}
      <section className={styles.worksSection}>
        <div className={styles.worksSectionHeader}>
          <h2 className={styles.worksSectionTitle}>Obras</h2>
          <span className={styles.worksCount}>
            {artist.works.length} obra{artist.works.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className={styles.worksGrid}>
          {artist.works.map((work) => (
            <Link
              key={work.id}
              href={`/coleccion/${work.id}`}
              className={styles.workCard}
            >
              <div className={styles.workImageWrap}>
                {work.image ? (
                  <Image 
                    src={work.image} 
                    alt={work.title || "Obra de arte"} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                  />
                ) : (
                  <div className={styles.workPlaceholder}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={styles.workInfo}>
                <h3 className={styles.workTitle}>{work.title}</h3>
                {work.year && <p className={styles.workYear}>{work.year}</p>}
                {work.technique && <p className={styles.workTechnique}>{work.technique}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
