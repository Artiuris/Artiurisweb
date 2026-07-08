import { createHash } from "crypto";

/**
 * Autenticación de acceso al sitio público.
 * Usa la MISMA contraseña que el panel de administración.
 */

// Contraseña única del sitio (misma que el admin)
export const SITE_PASSWORD = process.env.ADMIN_PASSWORD || "artiuris2024";

// Nombre de la cookie que marca una sesión válida
export const ACCESS_COOKIE = "site_access";

// Token guardado en la cookie: no exponemos la contraseña en claro
export function accessTokenFor(password: string): string {
  return createHash("sha256").update(`artiuris-access::${password}`).digest("hex");
}

// Token esperado para la contraseña configurada
export const EXPECTED_ACCESS_TOKEN = accessTokenFor(SITE_PASSWORD);
