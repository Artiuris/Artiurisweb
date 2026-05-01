"use client";

import { useState } from "react";
import styles from "./page.module.css";
import type { Artist, SiteConfig, AboutSection } from "@/lib/types";

interface Props {
  config: SiteConfig;
  artists: Artist[];
  onSave: (config: SiteConfig) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}

export default function AboutEditor({ config, artists, onSave, onBack, saving }: Props) {
  const [cfg, setCfg] = useState<SiteConfig>({ ...config });
  const [pickingFor, setPickingFor] = useState<number | null>(null);
  const [workSearch, setWorkSearch] = useState("");

  // Build flat list of all works
  const allWorks: { workId: string; title: string; artistName: string; image: string }[] = [];
  for (const artist of artists) {
    for (const work of artist.works) {
      allWorks.push({ workId: work.id, title: work.title, artistName: artist.name, image: work.image });
    }
  }

  const updateSection = (idx: number, field: keyof AboutSection, value: string) => {
    setCfg((prev) => {
      const sections = [...(prev.aboutSections || [])];
      sections[idx] = { ...sections[idx], [field]: value };
      return { ...prev, aboutSections: sections };
    });
  };

  const addSection = () => {
    setCfg((prev) => ({
      ...prev,
      aboutSections: [...(prev.aboutSections || []), { title: "Nueva sección", body: "", image: "", workId: "" }],
    }));
  };

  const removeSection = (idx: number) => {
    setCfg((prev) => ({
      ...prev,
      aboutSections: (prev.aboutSections || []).filter((_, i) => i !== idx),
    }));
  };

  const selectWork = (sectionIdx: number, workId: string) => {
    updateSection(sectionIdx, "workId", workId);
    setPickingFor(null);
    setWorkSearch("");
  };

  const clearWork = (sectionIdx: number) => {
    updateSection(sectionIdx, "workId", "");
  };

  // Work picker overlay
  if (pickingFor !== null) {
    const filtered = workSearch
      ? allWorks.filter((w) => w.title.toLowerCase().includes(workSearch.toLowerCase()) || w.artistName.toLowerCase().includes(workSearch.toLowerCase()))
      : allWorks;

    return (
      <div className={styles.adminPage}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => { setPickingFor(null); setWorkSearch(""); }}>← Volver a editar secciones</button>
        </div>
        <div className={styles.editorContent}>
          <h2 className={styles.editorTitle}>🖼️ Seleccionar obra para Sección {pickingFor + 1}</h2>
          <div style={{ marginBottom: "1rem" }}>
            <input
              className={styles.searchInput}
              placeholder="Buscar obra o artista..."
              value={workSearch}
              onChange={(e) => setWorkSearch(e.target.value)}
              style={{ maxWidth: "100%" }}
            />
          </div>
          <div className={styles.worksList}>
            {filtered.filter((w) => w.image).slice(0, 50).map((w) => (
              <div
                key={w.workId}
                className={styles.workCard}
                onClick={() => selectWork(pickingFor, w.workId)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.workCardImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.image} alt={w.title} />
                </div>
                <div className={styles.workCardInfo}>
                  <h4>{w.title || "Sin título"}</h4>
                  <p>{w.artistName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Volver al menú</button>
        <button className={styles.saveBtn} disabled={saving} onClick={() => onSave(cfg)}>
          {saving ? "Guardando..." : "💾 Guardar Cambios"}
        </button>
      </div>
      <div className={styles.editorContent}>
        <h2 className={styles.editorTitle}>📖 Página Sobre</h2>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Texto principal (cabecera)</label>
          <textarea
            className={styles.fieldTextarea}
            value={cfg.aboutText}
            onChange={(e) => setCfg((p) => ({ ...p, aboutText: e.target.value }))}
            rows={6}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Frase destacada (quote)</label>
          <input
            className={styles.fieldInput}
            value={cfg.aboutQuote || ""}
            onChange={(e) => setCfg((p) => ({ ...p, aboutQuote: e.target.value }))}
          />
        </div>

        <div style={{ borderTop: "1px solid #222", marginTop: "2rem", paddingTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 className={styles.sectionSubtitle} style={{ margin: 0 }}>Secciones de contenido</h3>
            <button className={styles.addWorkBtn} onClick={addSection}>+ Añadir sección</button>
          </div>

          {(cfg.aboutSections || []).map((section, idx) => {
            const selectedWork = section.workId ? allWorks.find((w) => w.workId === section.workId) : null;

            return (
              <div key={idx} style={{ background: "#141414", border: "1px solid #222", borderRadius: "10px", padding: "1.5rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ color: "#b89b5e", fontSize: "0.85rem" }}>Sección {idx + 1} {idx % 2 === 0 ? "(imagen a la derecha)" : "(imagen a la izquierda)"}</span>
                  <button className={styles.deleteWorkBtn} onClick={() => removeSection(idx)}>🗑️ Eliminar</button>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Título</label>
                  <input className={styles.fieldInput} value={section.title} onChange={(e) => updateSection(idx, "title", e.target.value)} />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Texto</label>
                  <textarea className={styles.fieldTextarea} value={section.body} onChange={(e) => updateSection(idx, "body", e.target.value)} rows={5} />
                </div>

                {/* Work image selector */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>🖼️ Obra que aparece {idx % 2 === 0 ? "a la derecha" : "a la izquierda"} del texto</label>
                  {selectedWork ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#1a1a1a", borderRadius: "8px" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "4px", overflow: "hidden", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedWork.image} alt={selectedWork.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#fff", fontSize: "0.9rem" }}>{selectedWork.title}</div>
                        <div style={{ color: "#888", fontSize: "0.78rem" }}>{selectedWork.artistName}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className={styles.editWorkBtn} onClick={() => setPickingFor(idx)}>Cambiar</button>
                        <button className={styles.deleteWorkBtn} onClick={() => clearWork(idx)}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className={styles.addWorkBtn}
                      onClick={() => setPickingFor(idx)}
                      style={{ width: "100%", padding: "1rem", textAlign: "center" }}
                    >
                      + Seleccionar obra de la colección
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
