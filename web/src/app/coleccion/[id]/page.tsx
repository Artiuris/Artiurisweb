import Link from "next/link";
import Image from "next/image";
import LightboxImage from "@/components/LightboxImage";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import artists from "@/data/artists.json";
import type { Artist } from "@/lib/types";

const typedArtists = artists as Artist[];

// Flatten all works with their artist reference
function getAllWorks() {
  const works: { artist: Artist; work: Artist["works"][0] }[] = [];
  for (const artist of typedArtists) {
    for (const work of artist.works) {
      works.push({ artist, work });
    }
  }
  return works;
}

const allWorks = getAllWorks();

export function generateStaticParams() {
  return allWorks.map(({ work }) => ({
    id: work.id,
  }));
}

export default async function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const found = allWorks.find(({ work }) => work.id === id);
  if (!found) {
    notFound();
  }

  const { artist, work } = found;

  // Get other works by the same artist (excluding current)
  const otherWorks = artist.works
    .filter((w) => w.id !== work.id)
    .slice(0, 4);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Inicio</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link href="/coleccion" className={styles.breadcrumbLink}>Colección</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{work.title}</span>
      </nav>

      {/* Work Detail */}
      <div className={styles.workDetail}>
        {/* Image */}
        <div className={styles.workImageSection}>
          <div className={styles.workImage}>
            {work.image ? (
              <LightboxImage 
                src={work.image} 
                alt={work.title || "Obra de arte"} 
              />
            ) : (
              <div className={styles.workImagePlaceholder}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Imagen pendiente</span>
              </div>
            )}
          </div>

          {/* Extra images gallery */}
          {work.images && work.images.length > 0 && (
            <div className={styles.extraImagesGrid}>
              {work.images.map((img, i) => (
                <div key={i} className={styles.extraImageWrap}>
                  <LightboxImage
                    src={img}
                    alt={`${work.title || "Obra"} — vista ${i + 2}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.workInfo}>
          <div>
            <h1 className={styles.workTitle}>{work.title}</h1>
            <Link href={`/artistas/${artist.id}`} className={styles.workArtistLink}>
              {artist.name}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Technical Sheet */}
          <div className={styles.techSheet}>
            <h2 className={styles.techSheetTitle}>Ficha técnica</h2>
            
            {work.title && (
              <div className={styles.techRow}>
                <span className={styles.techLabel}>Título</span>
                <span className={styles.techValue}>{work.title}</span>
              </div>
            )}
            
            <div className={styles.techRow}>
              <span className={styles.techLabel}>Artista</span>
              <span className={styles.techValue}>
                <Link href={`/artistas/${artist.id}`} className={styles.techArtistLink}>
                  {artist.name}
                </Link>
              </span>
            </div>

            {work.year && (
              <div className={styles.techRow}>
                <span className={styles.techLabel}>Año</span>
                <span className={styles.techValue}>{work.year}</span>
              </div>
            )}

            {work.technique && (
              <div className={styles.techRow}>
                <span className={styles.techLabel}>Técnica</span>
                <span className={styles.techValue}>{work.technique}</span>
              </div>
            )}

            {work.dimensions && (
              <div className={styles.techRow}>
                <span className={styles.techLabel}>Dimensiones</span>
                <span className={styles.techValue}>{work.dimensions}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {work.description && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoBlockTitle}>Descripción</h2>
              <p className={styles.infoBlockText}>{work.description}</p>
            </div>
          )}

          {/* Comments */}
          {work.comments && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoBlockTitle}>Comentarios</h2>
              <p className={styles.infoBlockText}>{work.comments}</p>
            </div>
          )}

          {/* Info */}
          {work.info && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoBlockTitle}>Información</h2>
              <p className={styles.infoBlockText}>{work.info}</p>
            </div>
          )}

          {/* Exhibitions */}
          {work.exhibitions && (
            <div className={styles.infoBlock}>
              <h2 className={styles.infoBlockTitle}>Exposiciones</h2>
              <p className={styles.infoBlockText}>{work.exhibitions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Works */}
      {otherWorks.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>Más obras de {artist.name}</h2>
            <Link href={`/artistas/${artist.id}`} className={styles.relatedLink}>
              Ver todas →
            </Link>
          </div>

          <div className={styles.relatedGrid}>
            {otherWorks.map((w) => (
              <Link key={w.id} href={`/coleccion/${w.id}`} className={styles.relatedCard}>
                <div className={styles.relatedImageWrap}>
                  {w.image ? (
                    <Image 
                      src={w.image} 
                      alt={w.title || "Obra de arte"} 
                      fill 
                      style={{ objectFit: 'cover' }} 
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>
                <h3 className={styles.relatedWorkTitle}>{w.title}</h3>
                <p className={styles.relatedWorkArtist}>{artist.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
