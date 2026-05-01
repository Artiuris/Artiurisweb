"use client";

import { useState } from "react";
import styles from "./page.module.css";
import type { SiteConfig } from "@/lib/types";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}

export default function SiteContentEditor({ config, onSave, onBack, saving }: Props) {
  const [cfg, setCfg] = useState<SiteConfig>({ ...config });

  const update = (field: string, value: string | boolean) => {
    setCfg((prev) => {
      if (field.startsWith("stats.")) {
        const key = field.split(".")[1];
        return { ...prev, stats: { ...prev.stats, [key]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Volver al menú</button>
        <button className={styles.saveBtn} disabled={saving} onClick={() => onSave(cfg)}>
          {saving ? "Guardando..." : "💾 Guardar Cambios"}
        </button>
      </div>
      <div className={styles.editorContent}>
        <h2 className={styles.editorTitle}>✏️ Contenido del Sitio</h2>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Texto del Hero (página principal)</label>
          <input
            className={styles.fieldInput}
            value={cfg.heroTagline}
            onChange={(e) => update("heroTagline", e.target.value)}
            placeholder="Descubre el arte contemporáneo..."
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Frase destacada (quote)</label>
          <input
            className={styles.fieldInput}
            value={cfg.aboutQuote || ""}
            onChange={(e) => update("aboutQuote", e.target.value)}
            placeholder="El arte es la expresión más pura..."
          />
        </div>

        <h3 className={styles.sectionSubtitle}>📊 Estadísticas</h3>
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

        <h3 className={styles.sectionSubtitle}>📣 CTA (llamada a la acción)</h3>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Título CTA</label>
          <input className={styles.fieldInput} value={cfg.ctaTitle || ""} onChange={(e) => update("ctaTitle", e.target.value)} placeholder="Explora 135+ artistas" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Subtítulo CTA</label>
          <input className={styles.fieldInput} value={cfg.ctaSubtitle || ""} onChange={(e) => update("ctaSubtitle", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
