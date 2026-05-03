"use client";

import styles from "./page.module.css";

interface Props {
  onNavigate: (section: string) => void;
  stats: { artists: number; works: number; techniques: number };
}

export default function AdminDashboard({ onNavigate, stats }: Props) {
  const menuItems = [
    { id: "artists", icon: "🎨", label: "Artistas y Obras", desc: `${stats.artists} artistas · ${stats.works} obras` },
    { id: "inicio", icon: "🏠", label: "Página de Inicio", desc: "Hero, obras destacadas, about preview, CTA y contacto" },
    { id: "about", icon: "📖", label: "Página Sobre", desc: "Textos y secciones de la página Sobre" },
  ];

  return (
    <div className={styles.adminPage}>
      <div className={styles.topBar}>
        <h1 className={styles.adminTitle}>Panel de Administración</h1>
        <span className={styles.statsLabel}>
          {stats.artists} artistas · {stats.works} obras · {stats.techniques} técnicas
        </span>
      </div>
      <div className={styles.dashboardGrid}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={styles.dashboardCard}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.dashboardIcon}>{item.icon}</span>
            <h3 className={styles.dashboardCardTitle}>{item.label}</h3>
            <p className={styles.dashboardCardDesc}>{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
