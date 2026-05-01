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

export default function FooterContactEditor({ config, onSave, onBack, saving }: Props) {
  const [cfg, setCfg] = useState<SiteConfig>({ ...config });

  const updateSocial = (key: string, value: string) => {
    setCfg((prev) => ({ ...prev, socialMedia: { ...prev.socialMedia, [key]: value } }));
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
        <h2 className={styles.editorTitle}>📋 Footer y Contacto</h2>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Descripción del footer</label>
          <textarea
            className={styles.fieldTextarea}
            value={cfg.footerDescription || cfg.description}
            onChange={(e) => setCfg((p) => ({ ...p, footerDescription: e.target.value }))}
            rows={4}
            placeholder="Texto que aparece bajo el logo en el pie de página..."
          />
        </div>

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

        <h3 className={styles.sectionSubtitle}>🌐 Redes sociales</h3>
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
      </div>
    </div>
  );
}
