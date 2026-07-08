import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, EXPECTED_ACCESS_TOKEN } from "@/lib/auth";

/**
 * Puerta de acceso a todo el sitio público.
 * Bloquea cualquier página salvo que exista una cookie de sesión válida.
 *   - /acceso : página de login del sitio (siempre accesible)
 *   - /admin  : tiene su propio login independiente (se deja pasar)
 * Las rutas de API y los archivos estáticos se excluyen en `config.matcher`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que no requieren la cookie del sitio
  if (pathname === "/acceso" || pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (token === EXPECTED_ACCESS_TOKEN) {
    return NextResponse.next();
  }

  // No autenticado → redirigir a la página de acceso conservando el destino
  const url = request.nextUrl.clone();
  const destino = pathname + request.nextUrl.search;
  url.pathname = "/acceso";
  url.search = "";
  url.searchParams.set("from", destino);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas EXCEPTO:
     * - api            (rutas de API, con su propia autenticación)
     * - _next/static   (JS/CSS necesarios para renderizar la página de acceso)
     * - _next/image    (optimización de imágenes)
     * - images         (imágenes públicas de las obras)
     * - archivos con extensión de imagen/icono en la raíz (favicon, etc.)
     */
    "/((?!api|_next/static|_next/image|images|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
