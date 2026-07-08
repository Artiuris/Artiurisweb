import { NextRequest, NextResponse } from "next/server";
import { SITE_PASSWORD, ACCESS_COOKIE, EXPECTED_ACCESS_TOKEN } from "@/lib/auth";

// Valida la contraseña de acceso al sitio y establece la cookie de sesión
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  if (password !== SITE_PASSWORD) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ACCESS_COOKIE, EXPECTED_ACCESS_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}
