/**
 * GitHub API helper for updating files in the repo.
 * Used in production (Vercel) where the filesystem is read-only.
 * Changes committed via GitHub API trigger automatic Vercel redeploys.
 */

const GITHUB_OWNER = process.env.GITHUB_OWNER || "Artiuris";
const GITHUB_REPO = process.env.GITHUB_REPO || "Artiurisweb";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

interface GitHubFileResponse {
  sha: string;
  content: string;
}

async function githubFetch(path: string, options?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${err}`);
  }
  return res.json();
}

/**
 * Get a file from the repo
 */
export async function getFileFromGitHub(filePath: string): Promise<{ content: string; sha: string }> {
  const data: GitHubFileResponse = await githubFetch(`/contents/${filePath}?ref=${GITHUB_BRANCH}`);
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

/**
 * Update (or create) a file in the repo via commit
 */
export async function updateFileOnGitHub(filePath: string, content: string, message: string): Promise<void> {
  // Get current file SHA (needed for updates)
  let sha: string | undefined;
  try {
    const existing = await getFileFromGitHub(filePath);
    sha = existing.sha;
  } catch {
    // File doesn't exist yet, that's fine (will create)
  }

  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  await githubFetch(`/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Upload a binary file (image) to the repo
 */
export async function uploadFileToGitHub(filePath: string, fileBuffer: Buffer, message: string): Promise<void> {
  let sha: string | undefined;
  try {
    const existing = await getFileFromGitHub(filePath);
    sha = existing.sha;
  } catch {
    // New file
  }

  const body: Record<string, unknown> = {
    message,
    content: fileBuffer.toString("base64"),
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  await githubFetch(`/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Check if we're running in production (Vercel)
 */
export function isProduction(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

export function hasGitHubToken(): boolean {
  return !!GITHUB_TOKEN;
}
