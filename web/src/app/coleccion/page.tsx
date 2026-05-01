"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../artistas/page.module.css";
import homeStyles from "../page.module.css";
import artists from "@/data/artists.json";
import type { Artist } from "@/lib/types";

const typedArtists = artists as Artist[];

export default function ColeccionPage() {
  const [search, setSearch] = useState("");

  const allWorks = useMemo(() => {
    const works: { artist: Artist; work: Artist["works"][0] }[] = [];
    for (const artist of typedArtists) {
      for (const work of artist.works) {
        works.push({ artist, work });
      }
    }
    return works;
  }, []);

  const filteredWorks = useMemo(() => {
    if (!search.trim()) return allWorks;
    const query = search.toLowerCase();
    return allWorks.filter(
      ({ artist, work }) =>
        (work.title || "").toLowerCase().includes(query) ||
        (artist.name || "").toLowerCase().includes(query) ||
        (work.technique || "").toLowerCase().includes(query)
    );
  }, [search, allWorks]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>ArtIuris Collection</p>
        <h1 className={styles.pageTitle}>Colección Artística</h1>
        <p className={styles.pageSubtitle}>
          {allWorks.length} obras de {typedArtists.length} artistas
        </p>
        <div className={styles.pageDivider} />
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por título, artista o técnica..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="collection-search"
        />
      </div>

      {search && (
        <p className={styles.resultCount}>
          {filteredWorks.length} resultado{filteredWorks.length !== 1 ? "s" : ""}
        </p>
      )}

      {filteredWorks.length === 0 ? (
        <div className={styles.noResults}>
          <h2 className={styles.noResultsTitle}>Sin resultados</h2>
          <p className={styles.noResultsText}>
            No se encontraron obras con &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className={homeStyles.featuredGrid}>
          {filteredWorks.map(({ artist, work }) => (
            <div
              key={work.id}
              className={homeStyles.artworkCard}
            >
              <div className={homeStyles.artworkImageWrap}>
                <Link href={`/coleccion/${work.id}`} className={homeStyles.cardLinkOverlay} aria-label={work.title} />
                {work.image ? (
                  <Image 
                    src={work.image} 
                    alt={work.title || "Obra de arte"} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                  />
                ) : (
                  <div className={homeStyles.artworkPlaceholder}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={homeStyles.artworkInfo}>
                <Link href={`/coleccion/${work.id}`} style={{ textDecoration: 'none' }}>
                  <h3 className={homeStyles.artworkTitle}>{work.title}</h3>
                </Link>
                <Link href={`/artistas/${artist.id}`} className={homeStyles.artworkArtistLink}>
                  <p className={homeStyles.artworkArtist}>{artist.name}</p>
                </Link>
                {work.technique && (
                  <p className={homeStyles.artworkTechnique}>{work.technique}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
