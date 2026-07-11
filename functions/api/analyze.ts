// Cloudflare Pages Function — serves POST /api/analyze.
// Ported from app/api/analyze/route.ts (static export + Functions on CF Pages).
import { fetchRepoData } from "../../lib/github";
import { analyzeRepo } from "../../lib/analyzer";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const onRequestPost = async (context: { request: Request }): Promise<Response> => {
  try {
    const body = (await context.request.json()) as { repoUrl?: string };
    const repoUrl = body.repoUrl;

    if (!repoUrl || typeof repoUrl !== "string") {
      return json({ error: "repoUrl is required" }, 400);
    }
    if (!repoUrl.includes("github.com")) {
      return json({ error: "Invalid GitHub URL. Example: https://github.com/owner/repo" }, 400);
    }

    // Bring-your-own-key: user's OpenAI key, supplied per request, never stored server-side.
    const apiKey = context.request.headers.get("x-api-key") ?? "";
    if (!apiKey) {
      return json({ error: "Add your OpenAI API key in Settings to analyze a repo." }, 401);
    }

    const repoData = await fetchRepoData(repoUrl);
    const analysis = await analyzeRepo(repoData, apiKey);
    return json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    console.error("Analyze error:", message);
    return json({ error: message }, 500);
  }
};
