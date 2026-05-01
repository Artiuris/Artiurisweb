"use client";

import { useState } from "react";
import styles from "./page.module.css";
import type { Artist, SiteConfig, DisciplineContent } from "@/lib/types";

interface Props {
  config: SiteConfig;
  artists: Artist[];
  onSave: (config: SiteConfig) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}

export default function DisciplinesEditor({ config, artists, onSave, onBack, saving }: Props) {
  const [cfg, setCfg] = useState<SiteConfig>({ ...config });
  const [editingTech, setEditingTech] = useState<string | null>(null);

  // Collect all techniques from artists data
  const allTechniques = new Set<string>();
  const worksByTechnique: Record<string, { workId: string; title: string; artist: string; image: string }[]> = {};
  for (const artist of artists) {
    for (const work of artist.works) {
      if (work.technique) {
        allTechniques.add(work.technique);
        if (!worksByTechnique[work.technique]) worksByTechnique[work.technique] = [];
        worksByTechnique[work.technique].push({ workId: work.id, title: work.title, artist: artist.name, image: work.image });
      }
    }
  }

  const techniques = Array.from(allTechniques).sort();
  const disciplines = cfg.disciplines || {};

  const updateDiscipline = (tech: string, field: keyof DisciplineContent, value: string | string[]) => {
    setCfg((prev) => ({
      ...prev,
      disciplines: {
        ...prev.disciplines,
        [tech]: { ...(prev.disciplines?.[tech] || { title: tech, description: "", works: [] }), [field]: value },
      },
    }));
  };

  const toggleWork = (tech: string, workId: string) => {
    const current = disciplines[tech]?.works || [];
    const newWorks = current.includes(workId) ? current.filter((w) => w !== workId) : [...current, workId].slice(0, 2);
    updateDiscipline(tech, "works", newWorks);
  };

  if (editingTech) {
    const disc = disciplines[editingTech] || { title: editingTech, description: "", works: [] };
    const techWorks = worksByTechnique[editingTech] || [];

    return (
      <div className={styles.adminPage}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => setEditingTech(null)}>← Volver a disciplinas</button>
          <button className={styles.saveBtn} disabled={saving} onClick={() => onSave(cfg)}>
            {saving ? "Guardando..." : "💾 Guardar Cambios"}
          </button>
        </div>
        <div className={styles.editorContent}>
          <h2 className={styles.editorTitle}>🖌️ {editingTech}</h2>
          <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1.5rem" }}>{techWorks.length} obras con esta técnica</p>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Título personalizado</label>
            <input className={styles.fieldInput} value={disc.title} onChange={(e) => updateDiscipline(editingTech, "title", e.target.value)} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Descripción</label>
            <textarea className={styles.fieldTextarea} value={disc.description} onChange={(e) => updateDiscipline(editingTech, "description", e.target.value)} rows={5} placeholder="Descripción de esta disciplina artística..." />
          </div>

          <h3 className={styles.sectionSubtitle}>Obras destacadas (max 2)</h3>
          <div className={styles.worksList}>
            {techWorks.slice(0, 30).map((w) => (
              <div
                key={w.workId}
                className={`${styles.workCard} ${(disc.works || []).includes(w.workId) ? styles.workCardSelected : ""}`}
                onClick={() => toggleWork(editingTech, w.workId)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.workCardImage}>
                  {w.image ? <img src={w.image} alt={w.title} /> : <div className={styles.workCardPlaceholder}>Sin img</div>}
                </div>
                <div className={styles.workCardInfo}>
                  <h4>{w.title || "Sin título"}</h4>
                  <p>{w.artist}</p>
                </div>
                <span style={{ color: (disc.works || []).includes(w.workId) ? "#b89b5e" : "#555" }}>
                  {(disc.works || []).includes(w.workId) ? "★" : "☆"}
                </span>
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
        <h2 className={styles.editorTitle}>🖌️ Disciplinas</h2>
        <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          Edita el contenido que aparece al hacer clic en cada técnica artística.
        </p>
        <div className={styles.artistsList} style={{ padding: 0 }}>
          {techniques.map((tech) => (
            <div key={tech} className={styles.artistRow} onClick={() => setEditingTech(tech)}>
              <div className={styles.artistRowInfo}>
                <h3 className={styles.artistRowName}>{tech}</h3>
                <p className={styles.artistRowMeta}>
                  {worksByTechnique[tech]?.length || 0} obras · {disciplines[tech]?.description ? "✅ Con descripción" : "⚠️ Sin descripción"}
                </p>
              </div>
              <span className={styles.artistRowArrow}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
