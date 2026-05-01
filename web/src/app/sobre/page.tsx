import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import siteConfig from "@/data/site-config.json";
import artists from "@/data/artists.json";
import type { Artist, SiteConfig } from "@/lib/types";

const typedArtists = artists as Artist[];
const config = siteConfig as SiteConfig;

export const metadata = {
  title: "Sobre la colección — ArtIuris Collection",
  description: config.aboutText.slice(0, 160),
};

export default function SobrePage() {
  const totalWorks = typedArtists.reduce((acc, a) => acc + a.works.length, 0);

  const techniques = new Set<string>();
  for (const artist of typedArtists) {
    for (const work of artist.works) {
      if (work.technique && work.technique.length < 80) techniques.add(work.technique);
    }
  }

  // Get about sections from config or use defaults
  const aboutSections = config.aboutSections && config.aboutSections.length > 0
    ? config.aboutSections
    : [
        {
          title: "Una mirada personal al arte contemporáneo",
          body: "La colección representa décadas de dedicación y pasión por el arte. Cada obra ha sido seleccionada con criterio, buscando representar las múltiples voces del panorama artístico contemporáneo español e internacional.\n\nDesde la pintura y la escultura hasta la fotografía y el grabado, la colección abarca una amplia variedad de técnicas y estilos que reflejan la riqueza del arte de nuestro tiempo.",
          image: "",
        },
        {
          title: "Compromiso con la cultura",
          body: "Más allá de la mera acumulación de obras, esta colección nace del deseo de preservar y difundir el arte contemporáneo. Cada pieza cuenta una historia, cada artista aporta una visión única del mundo que nos rodea.",
          image: "",
        },
      ];

  // Get discipline data for technique detail
  const disciplines = config.disciplines || {};

  // Build work lookup for discipline featured works
  const workLookup: Record<string, { title: string; artist: string; image: string }> = {};
  for (const artist of typedArtists) {
    for (const work of artist.works) {
      workLookup[work.id] = { title: work.title, artist: artist.name, image: work.image };
    }
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.heroSection}>
        <p className={styles.pageLabel}>Sobre</p>
        <h1 className={styles.pageTitle}>La Colección</h1>
        <div className={styles.pageDivider} />
        <p className={styles.heroText}>{config.aboutText}</p>
      </section>

      {/* Stats Banner */}
      <section className={styles.statsBanner}>
        <div className={styles.statsBannerGrid}>
          <div>
            <div className={styles.statBannerNumber}>{typedArtists.length}</div>
            <div className={styles.statBannerLabel}>Artistas</div>
          </div>
          <div>
            <div className={styles.statBannerNumber}>{totalWorks}</div>
            <div className={styles.statBannerLabel}>Obras</div>
          </div>
          <div>
            <div className={styles.statBannerNumber}>{techniques.size || 5}</div>
            <div className={styles.statBannerLabel}>Disciplinas</div>
          </div>
          <div>
            <div className={styles.statBannerNumber}>30+</div>
            <div className={styles.statBannerLabel}>Años</div>
          </div>
        </div>
      </section>

      {/* Content Sections - from editable config */}
      {aboutSections.map((section, idx) => {
        // Look up artwork image from workId
        const sectionWork = section.workId ? workLookup[section.workId] : null;
        const imageToShow = sectionWork?.image || section.image;

        return (
          <section
            key={idx}
            className={`${styles.contentSection} ${idx % 2 !== 0 ? styles.reverse : ""}`}
          >
            <div className={styles.contentText}>
              <h2 className={styles.contentTitle}>{section.title}</h2>
              {section.body.split("\n").filter(Boolean).map((paragraph, pIdx) => (
                <p key={pIdx} className={styles.contentBody}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.contentImage}>
              {imageToShow ? (
                <>
                  <Image src={imageToShow} alt={sectionWork?.title || section.title} fill style={{ objectFit: "cover" }} />
                  {sectionWork && (
                    <div className={styles.contentImageCaption}>
                      <span className={styles.contentImageTitle}>{sectionWork.title}</span>
                      <span className={styles.contentImageArtist}>{sectionWork.artist}</span>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </section>
        );
      })}

      {/* Techniques - clickable */}
      {techniques.size > 0 && (
        <section className={styles.techniquesSection}>
          <p className={styles.pageLabel}>Disciplinas</p>
          <h2 className={styles.contentTitle}>Técnicas representadas</h2>
          <div className={styles.techniquesGrid}>
            {Array.from(techniques).map((tech) => (
              <Link
                key={tech}
                href={`/sobre/disciplina/${encodeURIComponent(tech)}`}
                className={styles.techniqueTag}
              >
                {tech}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
