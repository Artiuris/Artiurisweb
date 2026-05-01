"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import artists from "@/data/artists.json";
import type { Artist } from "@/lib/types";

const typedArtists = artists as Artist[];

const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

export default function ArtistasPage() {
  const [search, setSearch] = useState("");

  const filteredArtists = useMemo(() => {
    if (!search.trim()) return typedArtists;
    const query = search.toLowerCase();
    return typedArtists.filter((a) =>
      a.name.toLowerCase().includes(query)
    );
  }, [search]);

  // Group by first letter
  const grouped = useMemo(() => {
    const groups: Record<string, Artist[]> = {};
    for (const artist of filteredArtists) {
      const letter = artist.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(artist);
    }
    // Sort each group alphabetically
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.name.localeCompare(b.name, "es"));
    }
    return groups;
  }, [filteredArtists]);

  const availableLetters = new Set(Object.keys(grouped));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>ArtIuris Collection</p>
        <h1 className={styles.pageTitle}>Artistas</h1>
        <p className={styles.pageSubtitle}>
          Explora los {typedArtists.length} artistas que forman parte de la colección
        </p>
        <div className={styles.pageDivider} />
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar artista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="artist-search"
        />
      </div>

      {!search && (
        <div className={styles.alphabetIndex}>
          {ALPHABET.map((letter) => (
            <a
              key={letter}
              href={availableLetters.has(letter) ? `#letter-${letter}` : undefined}
              className={`${styles.alphabetLetter} ${
                !availableLetters.has(letter) ? styles.disabled : ""
              }`}
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {search && (
        <p className={styles.resultCount}>
          {filteredArtists.length} resultado{filteredArtists.length !== 1 ? "s" : ""}
        </p>
      )}

      {filteredArtists.length === 0 ? (
        <div className={styles.noResults}>
          <h2 className={styles.noResultsTitle}>Sin resultados</h2>
          <p className={styles.noResultsText}>
            No se encontraron artistas con &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        Object.keys(grouped)
          .sort((a, b) => a.localeCompare(b, "es"))
          .map((letter) => (
            <div key={letter} className={styles.letterGroup} id={`letter-${letter}`}>
              <h2 className={styles.letterHeader}>{letter}</h2>
              <div className={styles.letterArtists}>
                {grouped[letter].map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artistas/${artist.id}`}
                    className={styles.artistCard}
                  >
                    <div className={styles.artistAvatar}>
                      <span className={styles.artistInitial}>
                        {artist.name.charAt(0)}
                      </span>
                    </div>
                    <h3 className={styles.artistCardName}>{artist.name}</h3>
                    <p className={styles.artistCardWorks}>
                      {artist.works.length} obra{artist.works.length !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
