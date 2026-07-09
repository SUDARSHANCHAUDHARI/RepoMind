import OpenAI from "openai";
import { architectPrompt, featurePrompt, criticPrompt, builderPrompt } from "./prompts";
import { RepoData, RepoAnalysis, ArchitectAnalysis, FeatureAnalysis, CriticAnalysis, BuilderAnalysis } from "@/types";

function getClient(apiKey: string) {
  return new OpenAI({ apiKey });
}

async function runAgent<T>(prompt: string, fallback: T, apiKey: string): Promise<T> {
  try {
    const res = await getClient(apiKey).chat.completions.create({
      model: "gpt-4.1",
      temperature: 0.15,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = res.choices[0]?.message?.content;
    if (!text) return fallback;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("Agent error:", err);
    return fallback;
  }
}

const fallbackArchitect: ArchitectAnalysis = {
  techStack: ["unknown"],
  architecture: "Could not determine",
  patterns: [],
  dataFlow: "unknown",
  infraLayer: "unknown",
};

const fallbackFeatures: FeatureAnalysis = {
  coreFeatures: [],
  allFeatures: [],
  missingFeatures: [],
  userFlows: [],
};

const fallbackCritic: CriticAnalysis = {
  issues: [],
  securityRisks: [],
  scalabilityProblems: [],
  improvements: [],
  codeQuality: "unknown",
};

const fallbackBuilder: BuilderAnalysis = {
  rebuildPlan: "Could not generate",
  folderStructure: "",
  techRecommendations: [],
  mvpPrompt: "",
  saasPrompt: "",
  estimatedBuildTime: "unknown",
};

export async function analyzeRepo(data: RepoData, apiKey: string): Promise<RepoAnalysis> {
  // Run first 3 agents in parallel
  const [architect, features, critic] = await Promise.all([
    runAgent<ArchitectAnalysis>(architectPrompt(data), fallbackArchitect, apiKey),
    runAgent<FeatureAnalysis>(featurePrompt(data), fallbackFeatures, apiKey),
    runAgent<CriticAnalysis>(criticPrompt(data), fallbackCritic, apiKey),
  ]);

  // Builder agent synthesizes all three
  const builder = await runAgent<BuilderAnalysis>(
    builderPrompt({
      architect,
      features,
      critic,
      meta: {
        name: data.meta.name,
        description: data.meta.description,
        language: data.meta.language,
        stars: data.meta.stargazers_count,
      },
    }),
    fallbackBuilder,
    apiKey
  );

  return {
    architect,
    features,
    critic,
    builder,
    meta: {
      name: data.meta.name,
      description: data.meta.description,
      stars: data.meta.stargazers_count,
      language: data.meta.language,
      url: data.meta.html_url,
    },
  };
}
