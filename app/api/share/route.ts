import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RepoAnalysis } from "@/types";

export async function POST(req: NextRequest) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const analysis: RepoAnalysis = await req.json();

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
    return NextResponse.json({ tweet: text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
