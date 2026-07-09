import { NextRequest, NextResponse } from "next/server";
import { generateStarterRepo } from "@/lib/generator";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const analysis = await req.json();

    // Bring-your-own-key: user's OpenAI key, supplied per request, never stored server-side.
    const apiKey = req.headers.get("x-api-key") ?? "";
    if (!apiKey) {
      return NextResponse.json({ error: "Add your OpenAI API key in Settings to generate a starter repo." }, { status: 401 });
    }

    const project = await generateStarterRepo(analysis, apiKey);
    return NextResponse.json(project);
  } catch (err: any) {
    console.error("Generate error:", err.message);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
