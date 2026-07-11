import { RepoData, RepoFiles, TreeItem } from "@/types";

// GitHub REST calls via the Web fetch API (works on Cloudflare Workers).
// GITHUB_TOKEN is optional — unauthenticated requests work at a lower rate limit.
function getHeaders(): Record<string, string> {
  const token = typeof process !== "undefined" ? process.env.GITHUB_TOKEN : undefined;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RepoMind/1.0 (+https://github.com/SUDARSHANCHAUDHARI/RepoMind)",
  };
  if (token) headers.Authorization = `token ${token}`;
  return headers;
}

// Decode base64 (GitHub content API) to UTF-8. Uses Buffer (nodejs_compat).
function decodeBase64(content: string): string {
  return Buffer.from(content, "base64").toString("utf-8");
}

export function parseOwnerRepo(repoUrl: string): { owner: string; repo: string } {
  const clean = repoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL. Example: https://github.com/owner/repo");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function getJSON(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

async function fetchFile(base: string, path: string): Promise<string> {
  try {
    const data = (await getJSON(`${base}/contents/${path}`)) as { content?: string };
    return data.content ? decodeBase64(data.content) : "";
  } catch {
    return "";
  }
}

async function fetchReadme(base: string): Promise<string> {
  try {
    const data = (await getJSON(`${base}/readme`)) as { content?: string };
    return data.content ? decodeBase64(data.content) : "";
  } catch {
    return "";
  }
}

async function fetchTree(base: string): Promise<TreeItem[]> {
  try {
    const data = (await getJSON(`${base}/git/trees/HEAD?recursive=1`)) as { tree: TreeItem[] };
    return (data.tree ?? []).slice(0, 150);
  } catch {
    return [];
  }
}

async function fetchContents(base: string): Promise<string[]> {
  try {
    const data = (await getJSON(`${base}/contents`)) as { name: string }[];
    return data.map((f) => f.name);
  } catch {
    return [];
  }
}

export async function fetchRepoData(repoUrl: string): Promise<RepoData> {
  const { owner, repo } = parseOwnerRepo(repoUrl);
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  // Fetch repo metadata first (throws on invalid/private repo so the route can 4xx).
  const meta = (await getJSON(base)) as RepoData["meta"];

  const [readme, structure, tree] = await Promise.all([
    fetchReadme(base),
    fetchContents(base),
    fetchTree(base),
  ]);

  const [packageJson, tsconfig, dockerfile, requirements, composerJson, gemfile, cargoToml, goMod, envExample, ciConfig] = await Promise.all([
    fetchFile(base, "package.json"),
    fetchFile(base, "tsconfig.json"),
    fetchFile(base, "Dockerfile"),
    fetchFile(base, "requirements.txt"),
    fetchFile(base, "composer.json"),
    fetchFile(base, "Gemfile"),
    fetchFile(base, "Cargo.toml"),
    fetchFile(base, "go.mod"),
    fetchFile(base, ".env.example"),
    fetchFile(base, ".github/workflows/ci.yml"),
  ]);
  const files: RepoFiles = { packageJson, tsconfig, dockerfile, requirements, composerJson, gemfile, cargoToml, goMod, envExample, ciConfig };

  return {
    meta,
    readme: readme.slice(0, 10000),
    structure,
    tree,
    files,
  };
}
