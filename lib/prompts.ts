import { RepoData, ArchitectAnalysis, FeatureAnalysis, CriticAnalysis } from "@/types";

function buildContext(data: RepoData): string {
  const fileSummary = Object.entries(data.files)
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => `--- ${k} ---\n${v.slice(0, 1500)}`)
    .join("\n\n");

  const treePaths = data.tree
    .map((t) => t.path)
    .filter((p) => !p.includes("node_modules") && !p.includes(".git"))
    .slice(0, 80)
    .join("\n");

  const foundFiles = Object.entries(data.files)
    .filter(([, v]) => v.length > 0)
    .map(([k]) => k)
    .join(", ");

  return `
REPO NAME: ${data.meta.name}
DESCRIPTION: ${data.meta.description || "none"}
LANGUAGE: ${data.meta.language || "unknown"}
STARS: ${data.meta.stargazers_count}
TOPICS: ${(data.meta.topics || []).join(", ") || "none"}

DETECTED CONFIG FILES: ${foundFiles || "none"}

ROOT FILES:
${data.structure.join(", ")}

DIRECTORY TREE:
${treePaths}

CONFIG FILES:
${fileSummary || "none found"}

README (truncated):
${data.readme.slice(0, 6000)}
`;
}

// ─── Agent 1: Software Architect ──────────────────────────────────────────────
export function architectPrompt(data: RepoData): string {
  return `You are a principal software architect with 15+ years of experience.

Analyze this GitHub repository and return ONLY valid JSON. No markdown, no explanation.

REPOSITORY DATA:
${buildContext(data)}

RULES:
- Only use facts from the data above. Never guess.
- If something is unclear, write "unknown".
- Be specific (e.g. "Next.js 14" not just "React").

Return this exact JSON shape:
{
  "techStack": ["list of technologies with versions if detectable"],
  "architecture": "1-3 sentence description of the overall architecture pattern",
  "patterns": ["design patterns used, e.g. MVC, Repository, Observer"],
  "dataFlow": "how data flows through the system",
  "infraLayer": "hosting/deployment/infra if detectable"
}`;
}

// ─── Agent 2: Product Engineer ─────────────────────────────────────────────────
export function featurePrompt(data: RepoData): string {
  return `You are a senior product engineer who deeply understands user value.

Analyze this repository and return ONLY valid JSON. No markdown, no explanation.

REPOSITORY DATA:
${buildContext(data)}

RULES:
- Be specific. "User authentication with JWT" not just "auth".
- missingFeatures = obvious gaps a production app needs but this doesn't have.
- userFlows = key actions a user can take.

Return this exact JSON shape:
{
  "coreFeatures": ["3-5 most important features"],
  "allFeatures": ["complete list of all features detected"],
  "missingFeatures": ["features missing that a production app should have"],
  "userFlows": ["key user journeys/flows"]
}`;
}

// ─── Agent 3: Code Reviewer ────────────────────────────────────────────────────
export function criticPrompt(data: RepoData): string {
  return `You are a security-focused senior code reviewer.

Analyze this repository and return ONLY valid JSON. No markdown, no explanation.

REPOSITORY DATA:
${buildContext(data)}

RULES:
- Be honest and specific. This helps builders improve.
- Only flag issues you can actually infer from the data.
- codeQuality: "good" | "average" | "poor" with one-line reason.

Return this exact JSON shape:
{
  "issues": ["code quality / architectural issues"],
  "securityRisks": ["potential security vulnerabilities"],
  "scalabilityProblems": ["things that won't scale"],
  "improvements": ["concrete suggestions to make this better"],
  "codeQuality": "good/average/poor — reason"
}`;
}

// ─── Agent 4: Startup CTO / Builder ───────────────────────────────────────────
export function builderPrompt(context: {
  architect: ArchitectAnalysis;
  features: FeatureAnalysis;
  critic: CriticAnalysis;
  meta: { name: string; description: string; language: string; stars: number };
}): string {
  return `You are a startup CTO who has shipped dozens of products.

Based on this analysis of a GitHub repo, create a rebuild guide. Return ONLY valid JSON.

ANALYSIS:
${JSON.stringify(context, null, 2)}

RULES:
- rebuildPlan should be actionable numbered steps.
- mvpPrompt: a complete prompt someone can paste into an AI code editor to rebuild the MVP.
- saasPrompt: a complete prompt to build a monetized SaaS version.
- techRecommendations: modern stack you'd use to rebuild this today.

Return this exact JSON shape:
{
  "rebuildPlan": "1. Step one\\n2. Step two\\n3. ...",
  "folderStructure": "project/\\n├── src/\\n│   ├── ...",
  "techRecommendations": ["Next.js 14", "Supabase", "Tailwind", "Stripe"],
  "mvpPrompt": "Build a [type] app that [does X]. Use [stack]. Include: [features]. Structure: [folders].",
  "saasPrompt": "Build a SaaS version of [X] with auth, billing, and [features]. Use [stack].",
  "estimatedBuildTime": "e.g. 2-3 days for MVP"
}`;
}
