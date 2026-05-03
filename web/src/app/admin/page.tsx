"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import type { Artist, Artwork, SiteConfig } from "@/lib/types";
import AdminDashboard from "./AdminDashboard";
import InicioEditor from "./InicioEditor";
import AboutEditor from "./AboutEditor";

const PASSWORD_KEY = "artiuris_admin_pw";

function safeStr(val: unknown): string {
  return typeof val === "string" ? val : "";
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSection, setCurrentSection] = useState<string>("dashboard");

  const getPw = () => localStorage.getItem(PASSWORD_KEY) || password;

  const fetchData = useCallback(async (pw: string) => {
    const [resArtists, resConfig] = await Promise.all([
      fetch("/api/admin", { headers: { "x-admin-password": pw } }),
      fetch("/api/site-config", { headers: { "x-admin-password": pw } }),
    ]);
    if (resArtists.ok) {
      setArtists(await resArtists.json());
      setAuthenticated(true);
      localStorage.setItem(PASSWORD_KEY, pw);
    } else {
      setMessage("Contraseña incorrecta");
      localStorage.removeItem(PASSWORD_KEY);
      return;
    }
    if (resConfig.ok) {
      setSiteConfig(await resConfig.json());
    }
  }, []);

  useEffect(() => {
    const storedPw = localStorage.getItem(PASSWORD_KEY);
    if (storedPw) fetchData(storedPw);
  }, [fetchData]);

  const handleLogin = () => fetchData(password);

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const saveArtist = async (artist: Artist) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": getPw() },
        body: JSON.stringify(artist),
      });
      if (res.ok) {
        showToast("✓ Guardado correctamente");
        setArtists((prev) => prev.map((a) => (a.id === artist.id ? artist : a)));
      } else showToast("Error al guardar");
    } catch { showToast("Error de conexión"); }
    setSaving(false);
  };

  const saveSiteConfig = async (config: SiteConfig) => {
    setSaving(true);
    try {
      const res = await fetch("/api/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": getPw() },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSiteConfig(config);
        showToast("✓ Configuración guardada");
      } else showToast("Error al guardar");
    } catch { showToast("Error de conexión"); }
    setSaving(false);
  };

  const uploadImage = async (file: File, artistId: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("artistId", artistId);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-password": getPw() },
        body: formData,
      });
      if (res.ok) return (await res.json()).path;
    } catch {}
    return null;
  };

  const currentArtist = selectedArtistId ? artists.find((a) => a.id === selectedArtistId) ?? null : null;
  const currentWork = selectedWorkId && currentArtist ? currentArtist.works.find((w) => w.id === selectedWorkId) ?? null : null;
  const filteredArtists = searchQuery ? artists.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase())) : artists;

  const updateArtistField = (field: string, value: string) => {
    setArtists((prev) => prev.map((a) => a.id === selectedArtistId ? { ...a, [field]: value } : a));
  };

  const updateWorkField = (field: string, value: string) => {
    setArtists((prev) => prev.map((a) => a.id === selectedArtistId ? { ...a, works: a.works.map((w) => w.id === selectedWorkId ? { ...w, [field]: value } : w) } : a));
  };

  const updateWorkImages = (newImages: string[]) => {
    setArtists((prev) => prev.map((a) => a.id === selectedArtistId ? { ...a, works: a.works.map((w) => w.id === selectedWorkId ? { ...w, images: newImages } : w) } : a));
  };

  const deleteWork = (workId: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta obra?")) return;
    setArtists((prev) => prev.map((a) => a.id === selectedArtistId ? { ...a, works: a.works.filter((w) => w.id !== workId) } : a));
  };

  const addWork = () => {
    if (!currentArtist) return;
    const newId = `${currentArtist.id}-nueva-obra-${Date.now()}`;
    setArtists((prev) => prev.map((a) => a.id === selectedArtistId ? { ...a, works: [...a.works, { id: newId, title: "Nueva Obra", image: "" } as Artwork] } : a));
    setSelectedWorkId(newId);
  };

  const slugify = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const addArtist = () => {
    const name = prompt("Nombre completo del artista:");
    if (!name?.trim()) return;
    const id = slugify(name.trim());
    if (artists.some((a) => a.id === id)) { alert("Ya existe un artista con un ID similar."); return; }
    const newArtist: Artist = { id, name: name.trim().toUpperCase(), biography: "", extraInfo: "", works: [] };
    setArtists((prev) => [...prev, newArtist]);
    saveArtist(newArtist);
    setSelectedArtistId(id);
  };

  const deleteArtist = () => {
    if (!selectedArtistId) return;
    if (!confirm(`¿Seguro que quieres eliminar a ${currentArtist?.name || "este artista"}?`)) return;
    const newArtists = artists.filter((a) => a.id !== selectedArtistId);
    fetch("/api/admin", { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-password": getPw() }, body: JSON.stringify(newArtists) });
    setArtists(newArtists);
    setSelectedArtistId(null);
    setSelectedWorkId(null);
    showToast("✓ Artista eliminado");
  };

  const totalWorks = artists.reduce((s, a) => s + a.works.length, 0);
  const allTechniques = new Set<string>();
  artists.forEach((a) => a.works.forEach((w) => { if (w.technique) allTechniques.add(w.technique); }));

  // --- Login Screen ---
  if (!authenticated) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Panel de Administración</h1>
          <p className={styles.loginSubtitle}>ArtIuris Collection</p>
          <input type="password" className={styles.loginInput} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          <button className={styles.loginBtn} onClick={handleLogin}>Acceder</button>
          {message && <p className={styles.loginError}>{message}</p>}
        </div>
      </div>
    );
  }

  // --- Sub-editors for site config sections ---
  if (siteConfig && currentSection === "inicio") {
    return (<><InicioEditor config={siteConfig} artists={artists} onSave={saveSiteConfig} onBack={() => setCurrentSection("dashboard")} saving={saving} />{message && <div className={styles.toast}>{message}</div>}</>);
  }
  if (siteConfig && currentSection === "about") {
    return (<><AboutEditor config={siteConfig} artists={artists} onSave={saveSiteConfig} onBack={() => setCurrentSection("dashboard")} saving={saving} />{message && <div className={styles.toast}>{message}</div>}</>);
  }

  // --- Work Editor ---
  if (currentSection === "artists" && currentArtist && currentWork) {
    const handleWorkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      const path = await uploadImage(file, currentArtist.id);
      if (path) updateWorkField("image", path);
    };
    const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; if (!file) return;
      const path = await uploadImage(file, currentArtist.id);
      if (path) updateWorkImages([...(currentWork.images || []), path]);
    };
    const removeExtraImage = (idx: number) => {
      const newImages = [...(currentWork.images || [])]; newImages.splice(idx, 1); updateWorkImages(newImages);
    };

    return (
      <div key={`work-${currentWork.id}`} className={styles.adminPage}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => setSelectedWorkId(null)}>← Volver a {currentArtist.name}</button>
          <button className={styles.saveBtn} disabled={saving} onClick={() => saveArtist(artists.find((a) => a.id === selectedArtistId)!)}>{saving ? "Guardando..." : "💾 Guardar Cambios"}</button>
        </div>
        {message && <div className={styles.toast}>{message}</div>}
        <div className={styles.editorContent}>
          <h2 className={styles.editorTitle}>✏️ Editando Obra</h2>
          <div className={styles.imagePreviewRow}>
            <div className={styles.imagePreview}>
              {currentWork.image && <img src={currentWork.image} alt={safeStr(currentWork.title)} />}
            </div>
            <div>
              <label className={styles.fieldLabel}>Cambiar imagen principal</label>
              <input type="file" accept="image/*" onChange={handleWorkImageUpload} />
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Título</label><input className={styles.fieldInput} value={safeStr(currentWork.title)} onChange={(e) => updateWorkField("title", e.target.value)} /></div>
            <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Año</label><input className={styles.fieldInput} value={safeStr(currentWork.year)} onChange={(e) => updateWorkField("year", e.target.value)} /></div>
            <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Técnica</label><input className={styles.fieldInput} value={safeStr(currentWork.technique)} onChange={(e) => updateWorkField("technique", e.target.value)} /></div>
            <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Dimensiones</label><input className={styles.fieldInput} value={safeStr(currentWork.dimensions)} onChange={(e) => updateWorkField("dimensions", e.target.value)} /></div>
          </div>
          <div className={styles.fieldGroup}><label className={styles.fieldLabel}>📝 Descripción</label><textarea className={styles.fieldTextarea} value={safeStr(currentWork.description)} onChange={(e) => updateWorkField("description", e.target.value)} placeholder="Descripción de la obra..." rows={4} /></div>
          <div className={styles.fieldGroup}><label className={styles.fieldLabel}>💬 Comentarios</label><textarea className={styles.fieldTextarea} value={safeStr(currentWork.comments)} onChange={(e) => updateWorkField("comments", e.target.value)} placeholder="Comentarios adicionales..." rows={4} /></div>
          <div className={styles.fieldGroup}><label className={styles.fieldLabel}>ℹ️ Información</label><textarea className={styles.fieldTextarea} value={safeStr(currentWork.info)} onChange={(e) => updateWorkField("info", e.target.value)} placeholder="Información adicional..." rows={4} /></div>
          <div className={styles.fieldGroup}><label className={styles.fieldLabel}>🏛️ Exposiciones</label><textarea className={styles.fieldTextarea} value={safeStr(currentWork.exhibitions)} onChange={(e) => updateWorkField("exhibitions", e.target.value)} placeholder="Exposiciones..." rows={4} /></div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>📸 Imágenes adicionales</label>
            <div className={styles.extraImagesAdmin}>
              {(currentWork.images || []).map((img, i) => (
                <div key={i} className={styles.extraImgThumb}><img src={img} alt={`Extra ${i + 1}`} /><button className={styles.removeImgBtn} onClick={() => removeExtraImage(i)}>✕</button></div>
              ))}
              <label className={styles.addImgBtn}>+ Añadir<input type="file" accept="image/*" onChange={handleExtraImageUpload} style={{ display: "none" }} /></label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Artist Editor ---
  if (currentSection === "artists" && currentArtist) {
    return (
      <div key={`artist-${currentArtist.id}`} className={styles.adminPage}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => setSelectedArtistId(null)}>← Volver a la lista</button>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className={styles.deleteArtistBtn} onClick={deleteArtist}>🗑️ Eliminar artista</button>
            <button className={styles.saveBtn} disabled={saving} onClick={() => saveArtist(artists.find((a) => a.id === selectedArtistId)!)}>{saving ? "Guardando..." : "💾 Guardar Cambios"}</button>
          </div>
        </div>
        {message && <div className={styles.toast}>{message}</div>}
        <div className={styles.editorContent}>
          <h2 className={styles.editorTitle}>✏️ Editando Artista</h2>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Nombre</label><input className={styles.fieldInput} value={safeStr(currentArtist.name)} onChange={(e) => updateArtistField("name", e.target.value)} /></div>
            <div className={styles.fieldGroup}><label className={styles.fieldLabel}>ID (slug)</label><input className={styles.fieldInput} value={safeStr(currentArtist.id)} disabled /></div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Biografía</label>
            <textarea className={styles.fieldTextarea} value={safeStr(currentArtist.biography)} onChange={(e) => updateArtistField("biography", e.target.value)} rows={6} />
            <span className={styles.charCount}>{safeStr(currentArtist.biography).length} / 1000 caracteres</span>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>ℹ️ Más información (expandible en la web)</label>
            <textarea className={styles.fieldTextarea} value={safeStr(currentArtist.extraInfo)} onChange={(e) => updateArtistField("extraInfo", e.target.value)} placeholder="Texto adicional..." rows={6} />
          </div>
          <div className={styles.worksSection}>
            <div className={styles.worksSectionHeader}>
              <h3 className={styles.worksSectionTitle}>Obras ({currentArtist.works.length})</h3>
              <button className={styles.addWorkBtn} onClick={addWork}>+ Añadir Obra</button>
            </div>
            <div className={styles.worksList}>
              {currentArtist.works.map((w) => (
                <div key={w.id} className={styles.workCard}>
                  <div className={styles.workCardImage}>{w.image ? <img src={w.image} alt={safeStr(w.title)} /> : <div className={styles.workCardPlaceholder}>Sin imagen</div>}</div>
                  <div className={styles.workCardInfo}><h4>{w.title || "Sin título"}</h4><p>{[w.technique, w.year].filter(Boolean).join(" · ") || "Sin datos"}</p></div>
                  <div className={styles.workCardActions}>
                    <button className={styles.editWorkBtn} onClick={() => setSelectedWorkId(w.id)}>✏️ Editar</button>
                    <button className={styles.deleteWorkBtn} onClick={() => deleteWork(w.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Artists List ---
  if (currentSection === "artists") {
    return (
      <div className={styles.adminPage}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => setCurrentSection("dashboard")}>← Volver al menú</button>
          <span className={styles.statsLabel}>{artists.length} artistas · {totalWorks} obras</span>
        </div>
        <div className={styles.searchSection}>
          <input className={styles.searchInput} placeholder="Buscar artista..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button className={styles.addArtistBtn} onClick={addArtist}>+ Nuevo Artista</button>
        </div>
        <div className={styles.artistsList}>
          {filteredArtists.map((a) => (
            <div key={a.id} className={styles.artistRow} onClick={() => setSelectedArtistId(a.id)}>
              <div className={styles.artistRowInfo}>
                <h3 className={styles.artistRowName}>{a.name}</h3>
                <p className={styles.artistRowMeta}>{a.works.length} obra{a.works.length !== 1 ? "s" : ""} · {a.biography?.length > 0 ? "✅ Bio" : "⚠️ Sin bio"}</p>
              </div>
              <span className={styles.artistRowArrow}>→</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Dashboard Menu ---
  return (
    <>
      <AdminDashboard
        onNavigate={setCurrentSection}
        stats={{ artists: artists.length, works: totalWorks, techniques: allTechniques.size }}
      />
      {message && <div className={styles.toast}>{message}</div>}
    </>
  );
}
