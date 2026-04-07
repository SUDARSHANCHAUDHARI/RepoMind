import { NextRequest, NextResponse } from "next/server";
import { fetchRepoData } from "@/lib/github";
import { analyzeRepo } from "@/lib/analyzer";

export const maxDuration = 60; // allow up to 60s for multi-agent calls

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
    }

    if (!repoUrl.includes("github.com")) {
      return NextResponse.json(
        { error: "Invalid GitHub URL. Example: https://github.com/owner/repo" },
        { status: 400 }
      );
    }

    const repoData = await fetchRepoData(repoUrl);
    const analysis = await analyzeRepo(repoData);

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("Analyze error:", err.message);
    return NextResponse.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}
