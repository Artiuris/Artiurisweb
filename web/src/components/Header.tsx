"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/coleccion", label: "Colección" },
    { href: "/artistas", label: "Artistas" },
    { href: "/sobre", label: "Sobre" },
  ];

  const isHero = pathname === "/" && !scrolled;

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${isHero ? styles.heroMode : ""}`}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/logo-circle.jpg"
            alt="ArtIuris"
            width={40}
            height={40}
            className={styles.logoIcon}
            priority
          />
          <div className={styles.logoText}>
            <span className={`${styles.logoTitle} ${isHero ? styles.logoTitleLight : ""}`}>ArtIuris</span>
            <span className={`${styles.logoSubtitle} ${isHero ? styles.logoSubtitleLight : ""}`}>LUGO</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href ? styles.active : ""} ${isHero ? styles.navLinkLight : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className={`${styles.menuButton} ${mobileOpen ? styles.open : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú de navegación"
          id="mobile-menu-toggle"
        >
          <span className={`${styles.menuBar} ${isHero ? styles.menuBarLight : ""}`} />
          <span className={`${styles.menuBar} ${isHero ? styles.menuBarLight : ""}`} />
          <span className={`${styles.menuBar} ${isHero ? styles.menuBarLight : ""}`} />
        </button>
      </header>

      <div className={`${styles.mobileNav} ${mobileOpen ? styles.open : ""}`}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.mobileNavLink}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  );
}
