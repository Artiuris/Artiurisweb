import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ADMIN_PASSWORD = "artiuris2024";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const artistId = formData.get("artistId") as string;

    if (!file || !artistId) {
      return NextResponse.json({ error: "Missing file or artistId" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const destDir = path.join(process.cwd(), "public/images/artworks", artistId);
    fs.mkdirSync(destDir, { recursive: true });

    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const destPath = path.join(destDir, filename);
    fs.writeFileSync(destPath, buffer);

    return NextResponse.json({
      success: true,
      path: `/images/artworks/${artistId}/${filename}`,
    });
  } catch (e) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
