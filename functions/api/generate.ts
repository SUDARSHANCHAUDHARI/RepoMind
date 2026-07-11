// Cloudflare Pages Function — serves POST /api/generate.
// Ported from app/api/generate/route.ts.
import { generateStarterRepo } from "../../lib/generator";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const onRequestPost = async (context: { request: Request }): Promise<Response> => {
  try {
    const analysis = await context.request.json();

    // Bring-your-own-key: user's OpenAI key, supplied per request, never stored server-side.
    const apiKey = context.request.headers.get("x-api-key") ?? "";
    if (!apiKey) {
      return json({ error: "Add your OpenAI API key in Settings to generate a starter repo." }, 401);
    }

    const project = await generateStarterRepo(analysis, apiKey);
    return json(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("Generate error:", message);
    return json({ error: message }, 500);
  }
};
