// Cloudflare Pages Function — serves POST /api/share.
// Ported from app/api/share/route.ts.
import OpenAI from "openai";
import { RepoAnalysis } from "../../types";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const onRequestPost = async (context: { request: Request }): Promise<Response> => {
  // Bring-your-own-key: user's OpenAI key, supplied per request, never stored server-side.
  const apiKey = context.request.headers.get("x-api-key") ?? "";
  if (!apiKey) {
    return json({ error: "Add your OpenAI API key in Settings first." }, 401);
  }
  const client = new OpenAI({ apiKey });
  try {
    const analysis = (await context.request.json()) as RepoAnalysis;

    const prompt = `Write a viral Twitter/X post about this GitHub repo analysis. Max 280 chars.

Repo: ${analysis.meta.name}
Stack: ${analysis.architect.techStack.slice(0, 3).join(", ")}
Features: ${analysis.features.coreFeatures.slice(0, 3).join(", ")}

Style: short, punchy, builder-focused. End with "🔍 Analyzed by RepoMind AI". No hashtags.`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });

    const text = res.choices[0]?.message?.content || "";
    return json({ tweet: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Share failed";
    return json({ error: message }, 500);
  }
};
