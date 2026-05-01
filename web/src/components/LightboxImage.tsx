"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import styles from "./LightboxImage.module.css";

interface LightboxImageProps {
  src: string;
  alt: string;
}

export default function LightboxImage({ src, alt }: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling when open
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const toggleLightbox = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Thumbnail / Main display */}
      <div className={styles.imageTrigger} onClick={toggleLightbox} title="Ampliar imagen">
        <Image 
          src={src} 
          alt={alt} 
          fill 
          style={{ objectFit: 'contain' }} 
        />
        <div className={styles.zoomIconWrap}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {mounted && isOpen && createPortal(
        <div className={styles.lightboxOverlay} onClick={toggleLightbox}>
          <button className={styles.closeButton} onClick={toggleLightbox} aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          
          <div className={styles.lightboxContent}>
            <Image 
              src={src} 
              alt={alt} 
              fill 
              style={{ objectFit: 'contain' }} 
              sizes="100vw"
              quality={100}
              priority
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
