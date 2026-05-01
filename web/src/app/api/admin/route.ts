import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src/data/artists.json");
const ADMIN_PASSWORD = "artiuris2024";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

// GET all artists
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  return NextResponse.json(data);
}

// PUT update all artists
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2), "utf-8");
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
    const artists = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    const idx = artists.findIndex((a: { id: string }) => a.id === updatedArtist.id);
    if (idx === -1) {
      // New artist
      artists.push(updatedArtist);
    } else {
      artists[idx] = updatedArtist;
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(artists, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
