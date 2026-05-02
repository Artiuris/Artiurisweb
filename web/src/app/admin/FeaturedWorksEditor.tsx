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
  const [aboutIds, setAboutIds] = useState<string[]>(config.aboutWorkIds || []);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"featured" | "about">("featured");

  const allWorks: { artistName: string; workId: string; workTitle: string; image: string }[] = [];
  for (const artist of artists) {
    for (const work of artist.works) {
      allWorks.push({ artistName: artist.name, workId: work.id, workTitle: work.title, image: work.image });
    }
  }

  const filtered = search
    ? allWorks.filter((w) => w.workTitle.toLowerCase().includes(search.toLowerCase()) || w.artistName.toLowerCase().includes(search.toLowerCase()))
    : allWorks;

  const toggleFeatured = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) { alert("Máximo 6 obras destacadas"); return prev; }
      return [...prev, id];
    });
  };

  const toggleAbout = (id: string) => {
    setAboutIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) { alert("Máximo 2 obras para la sección About"); return prev; }
      return [...prev, id];
    });
  };

  const handleSave = () => {
    onSave({ ...config, featuredWorkIds: selectedIds, aboutWorkIds: aboutIds });
  };

  const currentIds = activeTab === "featured" ? selectedIds : aboutIds;
  const toggleFn = activeTab === "featured" ? toggleFeatured : toggleAbout;
  const maxItems = activeTab === "featured" ? 6 : 2;
  const title = activeTab === "featured" ? "⭐ Obras Destacadas" : "🖼️ Obras \"Sobre la Colección\"";
  const description = activeTab === "featured"
    ? "Selecciona hasta 6 obras para mostrar en la página principal."
    : "Selecciona 2 obras para mostrar en la sección \"Sobre la colección\" de la página principal.";

  return (
    <div className={styles.adminPage}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Volver al menú</button>
        <button className={styles.saveBtn} disabled={saving} onClick={handleSave}>
          {saving ? "Guardando..." : "💾 Guardar Cambios"}
        </button>
      </div>
      <div className={styles.editorContent}>
        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setActiveTab("featured")}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: activeTab === "featured" ? "#b89b5e" : "#333",
              background: activeTab === "featured" ? "rgba(184,155,94,0.15)" : "transparent",
              color: activeTab === "featured" ? "#b89b5e" : "#999",
              cursor: "pointer",
              fontWeight: activeTab === "featured" ? 600 : 400,
              fontSize: "0.85rem",
            }}
          >
            ⭐ Destacadas ({selectedIds.length}/6)
          </button>
          <button
            onClick={() => setActiveTab("about")}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: activeTab === "about" ? "#b89b5e" : "#333",
              background: activeTab === "about" ? "rgba(184,155,94,0.15)" : "transparent",
              color: activeTab === "about" ? "#b89b5e" : "#999",
              cursor: "pointer",
              fontWeight: activeTab === "about" ? 600 : 400,
              fontSize: "0.85rem",
            }}
          >
            🖼️ Sobre la colección ({aboutIds.length}/2)
          </button>
        </div>

        <h2 className={styles.editorTitle}>{title} ({currentIds.length}/{maxItems})</h2>
        <p style={{ color: "#888", marginBottom: "1rem", fontSize: "0.85rem" }}>
          {description}
        </p>

        {currentIds.length > 0 && (
          <div className={styles.featuredPreview}>
            <h3 className={styles.sectionSubtitle}>Seleccionadas:</h3>
            <div className={styles.featuredList}>
              {currentIds.map((id) => {
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
                    <button className={styles.removeImgBtn} onClick={() => toggleFn(id)}>✕</button>
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
          {filtered.filter(w => w.image).slice(0, 50).map((w) => (
            <div
              key={w.workId}
              className={`${styles.workCard} ${currentIds.includes(w.workId) ? styles.workCardSelected : ""}`}
              onClick={() => toggleFn(w.workId)}
              style={{ cursor: "pointer" }}
            >
              <div className={styles.workCardImage}>
                {w.image ? <img src={w.image} alt={w.workTitle} /> : <div className={styles.workCardPlaceholder}>Sin img</div>}
              </div>
              <div className={styles.workCardInfo}>
                <h4>{w.workTitle || "Sin título"}</h4>
                <p>{w.artistName}</p>
              </div>
              <div style={{ color: currentIds.includes(w.workId) ? "#b89b5e" : "#555", fontSize: "1.2rem" }}>
                {currentIds.includes(w.workId) ? "★" : "☆"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
