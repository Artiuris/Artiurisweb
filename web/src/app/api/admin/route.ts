import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isProduction, hasGitHubToken, getFileFromGitHub, updateFileOnGitHub } from "@/lib/github";

const DATA_PATH = path.join(process.cwd(), "src/data/artists.json");
const GITHUB_FILE_PATH = "web/src/data/artists.json";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "artiuris2024";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

// GET all artists
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    if (isProduction() && hasGitHubToken()) {
      const { content } = await getFileFromGitHub(GITHUB_FILE_PATH);
      return NextResponse.json(JSON.parse(content));
    }
    const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

// PUT update all artists
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const content = JSON.stringify(body, null, 2);

    if (isProduction() && hasGitHubToken()) {
      await updateFileOnGitHub(GITHUB_FILE_PATH, content, "Admin: actualizar artistas");
    } else {
      fs.writeFileSync(DATA_PATH, content, "utf-8");
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

// POST update a single artist
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const updatedArtist = await req.json();

    let artists;
    if (isProduction() && hasGitHubToken()) {
      const { content } = await getFileFromGitHub(GITHUB_FILE_PATH);
      artists = JSON.parse(content);
    } else {
      artists = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    }

    const idx = artists.findIndex((a: { id: string }) => a.id === updatedArtist.id);
    if (idx === -1) {
      artists.push(updatedArtist);
    } else {
      artists[idx] = updatedArtist;
    }

    const content = JSON.stringify(artists, null, 2);
    if (isProduction() && hasGitHubToken()) {
      await updateFileOnGitHub(GITHUB_FILE_PATH, content, `Admin: actualizar ${updatedArtist.name}`);
    } else {
      fs.writeFileSync(DATA_PATH, content, "utf-8");
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
