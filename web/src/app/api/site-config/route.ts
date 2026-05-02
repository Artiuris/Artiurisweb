import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isProduction, hasGitHubToken, getFileFromGitHub, updateFileOnGitHub } from "@/lib/github";

const CONFIG_PATH = path.join(process.cwd(), "src/data/site-config.json");
const GITHUB_FILE_PATH = "web/src/data/site-config.json";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "artiuris2024";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

// GET site config
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    if (isProduction() && hasGitHubToken()) {
      const { content } = await getFileFromGitHub(GITHUB_FILE_PATH);
      return NextResponse.json(JSON.parse(content));
    }
    const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Failed to read config" }, { status: 500 });
  }
}

// POST update site config
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const content = JSON.stringify(body, null, 2);

    if (isProduction() && hasGitHubToken()) {
      await updateFileOnGitHub(GITHUB_FILE_PATH, content, "Admin: actualizar configuración del sitio");
    } else {
      fs.writeFileSync(CONFIG_PATH, content, "utf-8");
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
