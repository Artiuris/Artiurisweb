"use client";

import { useState } from "react";
import styles from "./page.module.css";
import type { Artist, SiteConfig } from "@/lib/types";

interface Props {
  config: SiteConfig;
  artists: Artist[];
  onSave: (config: SiteConfig) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}

export default function FeaturedWorksEditor({ config, artists, onSave, onBack, saving }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(config.featuredWorkIds || []);
  const [search, setSearch] = useState("");

  const allWorks: { artistName: string; workId: string; workTitle: string; image: string }[] = [];
  for (const artist of artists) {
    for (const work of artist.works) {
      allWorks.push({ artistName: artist.name, workId: work.id, workTitle: work.title, image: work.image });
    }
  }

  const filtered = search
    ? allWorks.filter((w) => w.workTitle.toLowerCase().includes(search.toLowerCase()) || w.artistName.toLowerCase().includes(search.toLowerCase()))
    : allWorks;

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) { alert("Máximo 6 obras destacadas"); return prev; }
      return [...prev, id];
    });
  };

  const handleSave = () => {
    onSave({ ...config, featuredWorkIds: selectedIds });
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Volver al menú</button>
        <button className={styles.saveBtn} disabled={saving} onClick={handleSave}>
          {saving ? "Guardando..." : "💾 Guardar Cambios"}
        </button>
      </div>
      <div className={styles.editorContent}>
        <h2 className={styles.editorTitle}>⭐ Obras Destacadas ({selectedIds.length}/6)</h2>
        <p style={{ color: "#888", marginBottom: "1rem", fontSize: "0.85rem" }}>
          Selecciona hasta 6 obras para mostrar en la página principal. Si no seleccionas ninguna, se mostrarán las primeras 6 obras con imagen.
        </p>

        {selectedIds.length > 0 && (
          <div className={styles.featuredPreview}>
            <h3 className={styles.sectionSubtitle}>Seleccionadas:</h3>
            <div className={styles.featuredList}>
              {selectedIds.map((id) => {
                const w = allWorks.find((x) => x.workId === id);
                return (
                  <div key={id} className={styles.featuredItem}>
                    <div className={styles.featuredThumb}>
                      {w?.image && <img src={w.image} alt={w?.workTitle} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#fff", fontSize: "0.85rem" }}>{w?.workTitle || id}</div>
                      <div style={{ color: "#888", fontSize: "0.75rem" }}>{w?.artistName}</div>
                    </div>
                    <button className={styles.removeImgBtn} onClick={() => toggle(id)}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.searchSection} style={{ padding: 0, marginBottom: "1rem" }}>
          <input
            className={styles.searchInput}
            placeholder="Buscar obra o artista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.worksList}>
          {filtered.slice(0, 50).map((w) => (
            <div
              key={w.workId}
              className={`${styles.workCard} ${selectedIds.includes(w.workId) ? styles.workCardSelected : ""}`}
              onClick={() => toggle(w.workId)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.workCardImage}>
                {w.image ? <img src={w.image} alt={w.workTitle} /> : <div className={styles.workCardPlaceholder}>Sin img</div>}
              </div>
              <div className={styles.workCardInfo}>
                <h4>{w.workTitle || "Sin título"}</h4>
                <p>{w.artistName}</p>
              </div>
              <div style={{ color: selectedIds.includes(w.workId) ? "#b89b5e" : "#555", fontSize: "1.2rem" }}>
                {selectedIds.includes(w.workId) ? "★" : "☆"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
