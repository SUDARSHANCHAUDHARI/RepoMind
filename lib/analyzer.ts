import OpenAI from "openai";
import { architectPrompt, featurePrompt, criticPrompt, builderPrompt } from "./prompts";
import { RepoData, RepoAnalysis, ArchitectAnalysis, FeatureAnalysis, CriticAnalysis, BuilderAnalysis } from "@/types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runAgent<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.15,
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

export async function analyzeRepo(data: RepoData): Promise<RepoAnalysis> {
  // Run first 3 agents in parallel
  const [architect, features, critic] = await Promise.all([
    runAgent<ArchitectAnalysis>(architectPrompt(data), fallbackArchitect),
    runAgent<FeatureAnalysis>(featurePrompt(data), fallbackFeatures),
    runAgent<CriticAnalysis>(criticPrompt(data), fallbackCritic),
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
    fallbackBuilder
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
