import axios from "axios";
import { RepoData, RepoFiles, TreeItem } from "@/types";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `token ${token}` } : {};
}

function parseOwnerRepo(repoUrl: string): { owner: string; repo: string } {
  // Handle URLs like: https://github.com/owner/repo or github.com/owner/repo
  const clean = repoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const match = clean.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL. Example: https://github.com/owner/repo");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

async function fetchFile(base: string, path: string): Promise<string> {
  try {
    const res = await axios.get(`${base}/contents/${path}`, {
      headers: getHeaders(),
    });
    return Buffer.from(res.data.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

async function fetchReadme(base: string): Promise<string> {
  try {
    const res = await axios.get(`${base}/readme`, {
      headers: getHeaders(),
    });
    return Buffer.from(res.data.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

async function fetchTree(base: string): Promise<TreeItem[]> {
  try {
    const res = await axios.get(`${base}/git/trees/HEAD?recursive=1`, {
      headers: getHeaders(),
    });
    // Limit to 150 paths — enough signal without bloat
    return (res.data.tree as TreeItem[]).slice(0, 150);
  } catch {
    return [];
  }
}

async function fetchContents(base: string): Promise<string[]> {
  try {
    const res = await axios.get(`${base}/contents`, {
      headers: getHeaders(),
    });
    return (res.data as { name: string }[]).map((f) => f.name);
  } catch {
    return [];
  }
}

export async function fetchRepoData(repoUrl: string): Promise<RepoData> {
  const { owner, repo } = parseOwnerRepo(repoUrl);
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const headers = getHeaders();

  // Fetch repo metadata first
  const repoRes = await axios.get(base, { headers });
  const meta = repoRes.data;

  // Fetch everything in parallel
  const [readme, structure, tree] = await Promise.all([
    fetchReadme(base),
    fetchContents(base),
    fetchTree(base),
  ]);

  // Fetch all config files in parallel
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
