import { describe, it, expect } from "vitest";
import { architectPrompt, featurePrompt, criticPrompt } from "./prompts";
import { RepoData } from "@/types";

const sampleData: RepoData = {
  meta: {
    name: "acme-app",
    full_name: "acme/acme-app",
    description: "A demo application",
    language: "TypeScript",
    stargazers_count: 42,
    forks_count: 7,
    html_url: "https://github.com/acme/acme-app",
    topics: ["nextjs", "demo"],
    default_branch: "main",
  },
  readme: "# Acme App\nThis is the readme.",
  structure: ["package.json", "src"],
  tree: [
    { path: "src/index.ts", type: "blob" },
    { path: "node_modules/react/index.js", type: "blob" },
  ],
  files: {
    packageJson: '{"name":"acme-app"}',
    tsconfig: "",
    dockerfile: "",
    requirements: "",
    composerJson: "",
    gemfile: "",
    cargoToml: "",
    goMod: "",
    envExample: "",
    ciConfig: "",
  },
};

describe("prompt builders", () => {
  it("architectPrompt embeds repo metadata and asks for JSON only", () => {
    const prompt = architectPrompt(sampleData);
    expect(prompt).toContain("acme-app");
    expect(prompt).toContain("A demo application");
    expect(prompt).toContain("TypeScript");
    expect(prompt).toContain("ONLY valid JSON");
  });

  it("buildContext omits node_modules paths from the tree", () => {
    const prompt = architectPrompt(sampleData);
    expect(prompt).toContain("src/index.ts");
    expect(prompt).not.toContain("node_modules/react");
  });

  it("featurePrompt asks for missing features", () => {
    expect(featurePrompt(sampleData)).toContain("missingFeatures");
  });

  it("criticPrompt asks for security risks", () => {
    expect(criticPrompt(sampleData)).toContain("securityRisks");
  });
});
