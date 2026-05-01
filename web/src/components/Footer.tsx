import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";
import siteConfig from "@/data/site-config.json";
import type { SiteConfig } from "@/lib/types";

const config = siteConfig as SiteConfig;

export function Footer() {
  const currentYear = 2026;
  const footerDesc = config.footerDescription || config.description;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoRow}>
            <Image
              src="/images/logo-circle.jpg"
              alt="ArtIuris"
              width={60}
              height={60}
              className={styles.footerLogo}
            />
            <div>
              <div className={styles.footerTitle}>{config.collectionName}</div>
              <div className={styles.footerSubtitle}>{config.collectionSubtitle}</div>
            </div>
          </div>
          <p className={styles.footerDescription}>
            {footerDesc}
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3>Navegación</h3>
          <div className={styles.footerLinks}>
            <Link href="/" className={styles.footerLink}>Inicio</Link>
            <Link href="/coleccion" className={styles.footerLink}>Colección</Link>
            <Link href="/artistas" className={styles.footerLink}>Artistas</Link>
            <Link href="/sobre" className={styles.footerLink}>Sobre la colección</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Contacto</h3>
          <div className={styles.footerLinks}>
            {config.contactEmail && (
              <a href={`mailto:${config.contactEmail}`} className={styles.footerLink}>
                {config.contactEmail}
              </a>
            )}
            {config.contactPhone && (
              <a href={`tel:${config.contactPhone}`} className={styles.footerLink}>
                {config.contactPhone}
              </a>
            )}
            {config.contactAddress && (
              <span className={styles.footerLink} style={{ cursor: 'default' }}>
                {config.contactAddress}
              </span>
            )}
            {config.socialMedia?.instagram && (
              <a href={config.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                Instagram
              </a>
            )}
            {config.socialMedia?.facebook && (
              <a href={config.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                Facebook
              </a>
            )}
          </div>
        </div>
      </div>

      <hr className={styles.footerDivider} />

      <div className={styles.footerBottom}>
        <span className={styles.footerCopy}>
          © {currentYear} {config.collectionName} {config.collectionSubtitle}. Todos los derechos reservados.
        </span>
      </div>
    </footer>
  );
}
