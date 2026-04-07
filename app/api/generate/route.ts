import { NextRequest, NextResponse } from "next/server";
import { generateStarterRepo } from "@/lib/generator";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const analysis = await req.json();
    const project = await generateStarterRepo(analysis);
    return NextResponse.json(project);
  } catch (err: any) {
    console.error("Generate error:", err.message);
    return NextResponse.json({ error: err.message || "Generation failed" }, { status: 500 });
  }
}
