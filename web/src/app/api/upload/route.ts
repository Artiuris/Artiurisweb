import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isProduction, hasGitHubToken, uploadFileToGitHub } from "@/lib/github";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "artiuris2024";
// Ruta dentro del repo (web/ es subcarpeta del repositorio)
const GITHUB_IMAGE_BASE = "web/public/images/artworks";
// Límite defensivo: Vercel corta el body de las funciones en ~4.5MB.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const artistId = formData.get("artistId") as string | null;

    if (!file || !artistId) {
      return NextResponse.json({ error: "Falta el archivo o el artista" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande (máx. 4MB). Prueba con una imagen más ligera." },
        { status: 413 }
      );
    }

    // Sanear identificadores y garantizar un nombre único para evitar colisiones
    // (las fotos de móvil suelen llamarse igual, p.ej. "img.jpg").
    const safeArtistId = artistId.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const rawName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase() || "imagen.jpg";
    const filename = `${Date.now()}-${rawName}`;
    const publicPath = `/images/artworks/${safeArtistId}/${filename}`;

    if (isProduction() && hasGitHubToken()) {
      await uploadFileToGitHub(
        `${GITHUB_IMAGE_BASE}/${safeArtistId}/${filename}`,
        buffer,
        `Admin: subir imagen ${filename}`
      );
    } else {
      const destDir = path.join(process.cwd(), "public/images/artworks", safeArtistId);
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(path.join(destDir, filename), buffer);
    }

    return NextResponse.json({ success: true, path: publicPath });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al subir la imagen";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
