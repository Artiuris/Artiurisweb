"use client";

import { useState } from "react";
import styles from "../admin/page.module.css";

export default function AccesoPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Volver al destino original si venía indicado
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from");
        const dest = from && from.startsWith("/") ? from : "/";
        window.location.href = dest;
      } else {
        setError("Contraseña incorrecta");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>ArtIuris Collection</h1>
        <p className={styles.loginSubtitle}>Sitio privado — introduce la contraseña</p>
        <input
          type="password"
          className={styles.loginInput}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        <button className={styles.loginBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Accediendo..." : "Acceder"}
        </button>
        {error && <p className={styles.loginError}>{error}</p>}
      </div>
    </div>
  );
}
