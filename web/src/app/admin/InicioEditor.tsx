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

type SubTab = "hero" | "featured" | "aboutPreview" | "cta" | "contact";

export default function InicioEditor({ config, artists, onSave, onBack, saving }: Props) {
  const [cfg, setCfg] = useState<SiteConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<SubTab>("hero");

  // Build flat works list first
  const allWorks: { artistName: string; workId: string; workTitle: string; image: string }[] = [];
  for (const artist of artists) {
    for (const work of artist.works) {
      allWorks.push({ artistName: artist.name, workId: work.id, workTitle: work.title, image: work.image });
    }
  }

  // If no featured IDs are saved, default to the first 6 with images (matches homepage fallback)
  const defaultFeaturedIds = (config.featuredWorkIds && config.featuredWorkIds.length > 0)
    ? config.featuredWorkIds
    : allWorks.filter(w => w.image).slice(0, 6).map(w => w.workId);

  // Featured works state
  const [featuredIds, setFeaturedIds] = useState<string[]>(defaultFeaturedIds);
  const [aboutIds, setAboutIds] = useState<string[]>(config.aboutWorkIds || []);
  const [workSearch, setWorkSearch] = useState("");

  const update = (field: string, value: string | boolean) => {
    setCfg((prev) => {
      if (field.startsWith("stats.")) {
        const key = field.split(".")[1];
        return { ...prev, stats: { ...prev.stats, [key]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const updateSocial = (key: string, value: string) => {
    setCfg((prev) => ({ ...prev, socialMedia: { ...prev.socialMedia, [key]: value } }));
  };

  const handleSave = () => {
    onSave({ ...cfg, featuredWorkIds: featuredIds, aboutWorkIds: aboutIds });
  };

  const tabs: { id: SubTab; label: string; icon: string }[] = [
    { id: "hero", label: "Cabecera", icon: "🏠" },
    { id: "featured", label: "Destacadas", icon: "⭐" },
    { id: "aboutPreview", label: "Sobre (preview)", icon: "🖼️" },
    { id: "cta", label: "Texto inferior", icon: "📣" },
    { id: "contact", label: "Contacto", icon: "📞" },
  ];

  // Filtered works for pickers
  const filteredWorks = workSearch
    ? allWorks.filter((w) => w.workTitle.toLowerCase().includes(workSearch.toLowerCase()) || w.artistName.toLowerCase().includes(workSearch.toLowerCase()))
    : allWorks;

  const toggleFeatured = (id: string) => {
    setFeaturedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) { alert("Máximo 6 obras destacadas"); return prev; }
      return [...prev, id];
    });
  };

  const toggleAbout = (id: string) => {
    setAboutIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) { alert("Máximo 2 obras para esta sección"); return prev; }
      return [...prev, id];
    });
  };

  // Render selected items list
  const renderSelectedList = (ids: string[], toggleFn: (id: string) => void, max: number) => (
    ids.length > 0 ? (
      <div className={styles.featuredPreview}>
        <h3 className={styles.sectionSubtitle}>Seleccionadas ({ids.length}/{max}):</h3>
        <p style={{ color: "#777", fontSize: "0.78rem", marginBottom: "0.75rem" }}>
          Pulsa ✕ para quitar una obra. Luego busca abajo una nueva para añadirla.
        </p>
        <div className={styles.featuredList}>
          {ids.map((id) => {
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
                <button
                  onClick={() => toggleFn(id)}
                  title="Quitar esta obra"
                  style={{ background: "#c0392b", color: "#fff", borderRadius: "6px", padding: "0.4rem 0.8rem", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, flexShrink: 0, position: "relative" }}
                >
                  ✕ Quitar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <div style={{ padding: "1.5rem", textAlign: "center", background: "#141414", borderRadius: "10px", border: "1px dashed #333", marginBottom: "1rem" }}>
        <p style={{ color: "#888", fontSize: "0.85rem" }}>Ninguna obra seleccionada. Busca y selecciona obras de la galería de abajo.</p>
      </div>
    )
  );

  // Render work picker grid
  const renderWorkGrid = (currentIds: string[], toggleFn: (id: string) => void) => (
    <>
      <div className={styles.searchSection} style={{ padding: 0, marginBottom: "1rem" }}>
        <input
          className={styles.searchInput}
          placeholder="Buscar obra o artista..."
          value={workSearch}
          onChange={(e) => setWorkSearch(e.target.value)}
        />
      </div>
      <div className={styles.worksList}>
        {filteredWorks.filter(w => w.image).slice(0, 50).map((w) => (
          <div
            key={w.workId}
            className={`${styles.workCard} ${currentIds.includes(w.workId) ? styles.workCardSelected : ""}`}
            onClick={() => toggleFn(w.workId)}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.workCardImage}>
              <img src={w.image} alt={w.workTitle} />
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
    </>
  );

  return (
    <div className={styles.adminPage}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Volver al menú</button>
        <button className={styles.saveBtn} disabled={saving} onClick={handleSave}>
          {saving ? "Guardando..." : "💾 Guardar Cambios"}
        </button>
      </div>
      <div className={styles.editorContent}>
        <h2 className={styles.editorTitle}>🏠 Página de Inicio</h2>

        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setWorkSearch(""); }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: activeTab === tab.id ? "#b89b5e" : "#333",
                background: activeTab === tab.id ? "rgba(184,155,94,0.15)" : "transparent",
                color: activeTab === tab.id ? "#b89b5e" : "#999",
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: "0.8rem",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* HERO TAB */}
        {activeTab === "hero" && (
          <>
            <h3 className={styles.sectionSubtitle}>🏠 Cabecera (Hero)</h3>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Texto del Hero (bajo el logo)</label>
              <input
                className={styles.fieldInput}
                value={cfg.heroTagline}
                onChange={(e) => update("heroTagline", e.target.value)}
                placeholder="Descubre el arte contemporáneo..."
              />
            </div>

            <h3 className={styles.sectionSubtitle} style={{ marginTop: "2rem" }}>📊 Estadísticas</h3>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <input
                  type="checkbox"
                  checked={cfg.stats.autoUpdate ?? false}
                  onChange={(e) => update("stats.autoUpdate", e.target.checked)}
                  style={{ marginRight: "0.5rem" }}
                />
                Auto-actualizar con datos reales
              </label>
            </div>
            {!cfg.stats.autoUpdate && (
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Nº Artistas</label>
                  <input className={styles.fieldInput} value={cfg.stats.artists} onChange={(e) => update("stats.artists", e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Nº Obras</label>
                  <input className={styles.fieldInput} value={cfg.stats.works} onChange={(e) => update("stats.works", e.target.value)} />
                </div>
              </div>
            )}
          </>
        )}

        {/* FEATURED WORKS TAB */}
        {activeTab === "featured" && (
          <>
            <h3 className={styles.sectionSubtitle}>⭐ Obras Destacadas ({featuredIds.length}/6)</h3>
            <p style={{ color: "#888", marginBottom: "1rem", fontSize: "0.85rem" }}>
              Selecciona hasta 6 obras para mostrar en la galería destacada de la página principal. Si no seleccionas ninguna, se mostrarán automáticamente.
            </p>
            {renderSelectedList(featuredIds, toggleFeatured, 6)}
            {renderWorkGrid(featuredIds, toggleFeatured)}
          </>
        )}

        {/* ABOUT PREVIEW TAB */}
        {activeTab === "aboutPreview" && (
          <>
            <h3 className={styles.sectionSubtitle}>🖼️ Sección &quot;Sobre la colección&quot;</h3>
            <p style={{ color: "#888", marginBottom: "1rem", fontSize: "0.85rem" }}>
              Edita los textos y selecciona las 2 obras que aparecen a la derecha en la sección &quot;Sobre la colección&quot; de la página principal.
            </p>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Frase destacada (quote)</label>
              <input
                className={styles.fieldInput}
                value={cfg.aboutQuote || ""}
                onChange={(e) => update("aboutQuote", e.target.value)}
                placeholder="El arte es la expresión más pura..."
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Texto descriptivo</label>
              <textarea
                className={styles.fieldTextarea}
                value={cfg.aboutText}
                onChange={(e) => update("aboutText", e.target.value)}
                rows={4}
              />
            </div>

            <div style={{ borderTop: "1px solid #222", marginTop: "1.5rem", paddingTop: "1.5rem" }}>
              <h3 className={styles.sectionSubtitle}>🖼️ Obras del preview ({aboutIds.length}/2)</h3>
              {renderSelectedList(aboutIds, toggleAbout, 2)}
              {renderWorkGrid(aboutIds, toggleAbout)}
            </div>
          </>
        )}

        {/* CTA TAB */}
        {activeTab === "cta" && (
          <>
            <h3 className={styles.sectionSubtitle}>📣 Llamada a la acción (parte inferior)</h3>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Título CTA</label>
              <input className={styles.fieldInput} value={cfg.ctaTitle || ""} onChange={(e) => update("ctaTitle", e.target.value)} placeholder="Explora 135+ artistas" />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Subtítulo CTA</label>
              <input className={styles.fieldInput} value={cfg.ctaSubtitle || ""} onChange={(e) => update("ctaSubtitle", e.target.value)} />
            </div>

            <div style={{ borderTop: "1px solid #222", marginTop: "2rem", paddingTop: "2rem" }}>
              <h3 className={styles.sectionSubtitle}>📋 Footer</h3>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Descripción del footer</label>
                <textarea
                  className={styles.fieldTextarea}
                  value={cfg.footerDescription || cfg.description}
                  onChange={(e) => setCfg((p) => ({ ...p, footerDescription: e.target.value }))}
                  rows={4}
                  placeholder="Texto bajo el logo en el pie de página..."
                />
              </div>
            </div>
          </>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <>
            <h3 className={styles.sectionSubtitle}>📞 Información de contacto</h3>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email</label>
                <input className={styles.fieldInput} value={cfg.contactEmail} onChange={(e) => setCfg((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="email@ejemplo.com" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Teléfono</label>
                <input className={styles.fieldInput} value={cfg.contactPhone} onChange={(e) => setCfg((p) => ({ ...p, contactPhone: e.target.value }))} placeholder="+34 600 000 000" />
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Dirección</label>
              <input className={styles.fieldInput} value={cfg.contactAddress || ""} onChange={(e) => setCfg((p) => ({ ...p, contactAddress: e.target.value }))} placeholder="Dirección completa..." />
            </div>

            <h3 className={styles.sectionSubtitle} style={{ marginTop: "2rem" }}>🌐 Redes sociales</h3>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Instagram</label>
                <input className={styles.fieldInput} value={cfg.socialMedia.instagram} onChange={(e) => updateSocial("instagram", e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Facebook</label>
                <input className={styles.fieldInput} value={cfg.socialMedia.facebook} onChange={(e) => updateSocial("facebook", e.target.value)} placeholder="https://facebook.com/..." />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
