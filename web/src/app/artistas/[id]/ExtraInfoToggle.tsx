"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function ExtraInfoToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.extraInfoSection}>
      <button
        className={styles.extraInfoToggle}
        onClick={() => setOpen(!open)}
      >
        {open ? "Ocultar información ▲" : "Más información ▼"}
      </button>
      {open && (
        <div className={styles.extraInfoContent}>
          {text.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
}
