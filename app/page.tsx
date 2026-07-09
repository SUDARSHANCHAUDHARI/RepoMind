"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JSZip from "jszip";
import { RepoAnalysis } from "@/types";
import ApiKeySettings from "@/components/ApiKeySettings";
import { getAiHeaders } from "@/lib/apiKey";

// ─── Icons (inline SVG to avoid extra deps) ──────────────────────────────────
function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    search: "M21 21l-4.35-4.35M11 19A8 8 0 1 0 11 3a8 8 0 0 0 0 16z",
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    alert: "M12 2L2 22h20L12 2zm0 8v4m0 4h.01",
    tool: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
    copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
    check: "M20 6L9 17l-5-5",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
    x: "M18 6L6 18M6 6l12 12",
    chevron: "M9 18l6-6-6-6",
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name] || ""} />
    </svg>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ text, color = "default" }: { text: string; color?: string }) {
  const colors: Record<string, string> = {
    default: "bg-zinc-800 text-zinc-300",
    green: "bg-green-950 text-green-400 border border-green-900",
    yellow: "bg-yellow-950 text-yellow-400 border border-yellow-900",
    red: "bg-red-950 text-red-400 border border-red-900",
    blue: "bg-blue-950 text-blue-400 border border-blue-900",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {text}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
function Card({ title, icon, children, className = "" }: CardProps) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-5 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-zinc-400">{icon}</span>
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
    >
      <Icon name={copied ? "check" : "copy"} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Tag list ─────────────────────────────────────────────────────────────────
function TagList({ items, color }: { items: string[]; color?: string }) {
  if (!items?.length) return <p className="text-zinc-600 text-sm">None detected</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <Badge key={i} text={item} color={color} />
      ))}
    </div>
  );
}

// ─── Bullet List ──────────────────────────────────────────────────────────────
function BulletList({ items, color = "zinc-400" }: { items: string[]; color?: string }) {
  if (!items?.length) return <p className="text-zinc-600 text-sm">None detected</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-${color} flex-shrink-0`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: "layers" },
  { id: "features", label: "Features", icon: "zap" },
  { id: "issues", label: "Issues", icon: "alert" },
  { id: "rebuild", label: "Rebuild", icon: "tool" },
] as const;

// ─── Loading State ────────────────────────────────────────────────────────────
function LoadingState({ step }: { step: number }) {
  const steps = [
    "Fetching repository structure...",
    "Running architect analysis...",
    "Extracting features...",
    "Reviewing code quality...",
    "Generating rebuild blueprint...",
  ];
  return (
    <div className="mt-10 flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
        <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-zinc-300 font-medium">{steps[step] || "Analyzing..."}</p>
        <p className="text-zinc-600 text-sm mt-1">Using 4 AI agents in parallel</p>
      </div>
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
              i <= step ? "bg-white" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function HomeInner() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<RepoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [tab, setTab] = useState<"overview" | "features" | "issues" | "rebuild">("overview");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [tweet, setTweet] = useState("");

  async function analyzeUrl(repoUrl: string) {
    setLoading(true);
    setError("");
    setResult(null);
    setTab("overview");

    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 4));
    }, 2500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAiHeaders() },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await res.json() as RepoAnalysis & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      clearInterval(stepInterval);
      setLoadingStep(0);
      setLoading(false);
    }
  }

  // Auto-analyze when Chrome extension passes ?repo= query param
  useEffect(() => {
    const repoParam = searchParams.get("repo");
    if (repoParam) {
      setUrl(repoParam);
      void analyzeUrl(repoParam);
    }
  // analyzeUrl is stable (defined inside component, no deps change) — safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function analyze() {
    if (!url.trim()) return;
    void analyzeUrl(url.trim());
  }

  async function downloadStarterRepo() {
    if (!result) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAiHeaders() },
        body: JSON.stringify(result),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const zip = new JSZip();
      (data.files || []).forEach((f: { path: string; content: string }) => {
        zip.file(f.path, f.content);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${result.meta.name}-starter.zip`;
      a.click();
    } catch (err: any) {
      alert("Generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function generateTweet() {
    if (!result) return;
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAiHeaders() },
      body: JSON.stringify(result),
    });
    const data = await res.json();
    setTweet(data.tweet || "");
  }

  const qualityColor =
    result?.critic.codeQuality?.startsWith("good")
      ? "green"
      : result?.critic.codeQuality?.startsWith("poor")
      ? "red"
      : "yellow";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">RepoMind AI</span>
            <span className="text-xs text-zinc-600 ml-1 font-medium bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-zinc-600 text-sm hidden sm:block">Turn any GitHub repo into a rebuildable blueprint</p>
            <ApiKeySettings />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        {!result && !loading && (
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Reverse-engineer{" "}
              <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                any repo
              </span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Paste a GitHub URL. Get architecture, features, weaknesses, and a downloadable starter project — powered by 4 AI agents.
            </p>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 mb-2">
          <div className="flex-1 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 focus-within:border-zinc-600 transition-colors">
            <Icon name="search" />
            <input
              className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-zinc-600"
              placeholder="https://github.com/owner/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
            />
            {url && (
              <button onClick={() => setUrl("")} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <Icon name="x" />
              </button>
            )}
          </div>
          <button
            onClick={analyze}
            disabled={loading || !url.trim()}
            className="px-6 py-3.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Example repos */}
        {!result && !loading && (
          <div className="flex flex-wrap gap-2 mb-10">
            <span className="text-zinc-600 text-xs py-1">Try:</span>
            {[
              "facebook/react",
              "supabase/supabase",
              "calcom/cal.com",
              "steven-tey/dub",
            ].map((ex) => (
              <button
                key={ex}
                onClick={() => setUrl(`https://github.com/${ex}`)}
                className="text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded-lg transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-950 border border-red-900 text-red-300 p-4 rounded-xl mb-6 text-sm">
            <Icon name="alert" />
            <div>
              <p className="font-medium">Analysis failed</p>
              <p className="text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingState step={loadingStep} />}

        {/* Results */}
        {result && !loading && (
          <div>
            {/* Repo Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">{result.meta.name}</h2>
                  <a
                    href={result.meta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    <Icon name="external" />
                  </a>
                </div>
                <p className="text-zinc-500 text-sm">{result.meta.description || "No description"}</p>
                <div className="flex items-center gap-3 mt-2">
                  {result.meta.language && <Badge text={result.meta.language} color="blue" />}
                  <span className="text-zinc-600 text-xs flex items-center gap-1">
                    <Icon name="star" /> {result.meta.stars?.toLocaleString()}
                  </span>
                  <Badge text={result.critic.codeQuality?.split("—")[0]?.trim() || "unknown"} color={qualityColor} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateTweet}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all"
                >
                  <Icon name="share" /> Share
                </button>
                <button
                  onClick={() => { setResult(null); setTweet(""); setUrl(""); }}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Tweet preview */}
            {tweet && (
              <div className="mb-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-zinc-300">{tweet}</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <CopyButton text={tweet} />
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-200 transition-all"
                    >
                      Post on X
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-6 w-fit">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon name={t.icon} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {tab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Tech Stack" icon={<Icon name="layers" />}>
                  <TagList items={result.architect.techStack} />
                </Card>
                <Card title="Architecture" icon={<Icon name="search" />}>
                  <p className="text-sm text-zinc-300">{result.architect.architecture || "Not detected"}</p>
                  {result.architect.patterns?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-zinc-600 mb-2">Design Patterns</p>
                      <TagList items={result.architect.patterns} />
                    </div>
                  )}
                </Card>
                <Card title="Data Flow" icon={<Icon name="share" />}>
                  <p className="text-sm text-zinc-300">{result.architect.dataFlow || "Not detected"}</p>
                </Card>
                <Card title="Infrastructure" icon={<Icon name="tool" />}>
                  <p className="text-sm text-zinc-300">{result.architect.infraLayer || "Not detected"}</p>
                </Card>
              </div>
            )}

            {tab === "features" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Core Features" icon={<Icon name="star" />} className="md:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(result.features.coreFeatures || []).map((f, i) => (
                      <div key={i} className="flex items-start gap-2 bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card title="All Features" icon={<Icon name="zap" />}>
                  <BulletList items={result.features.allFeatures} />
                </Card>
                <Card title="Missing Features" icon={<Icon name="alert" />}>
                  <BulletList items={result.features.missingFeatures} color="yellow-500" />
                </Card>
                {result.features.userFlows?.length > 0 && (
                  <Card title="User Flows" icon={<Icon name="chevron" />} className="md:col-span-2">
                    <BulletList items={result.features.userFlows} color="blue-500" />
                  </Card>
                )}
              </div>
            )}

            {tab === "issues" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Code Issues" icon={<Icon name="alert" />}>
                  <BulletList items={result.critic.issues} color="yellow-500" />
                </Card>
                <Card title="Security Risks" icon={<Icon name="alert" />}>
                  <BulletList items={result.critic.securityRisks} color="red-500" />
                </Card>
                <Card title="Scalability Problems" icon={<Icon name="layers" />}>
                  <BulletList items={result.critic.scalabilityProblems} color="orange-500" />
                </Card>
                <Card title="Suggested Improvements" icon={<Icon name="zap" />}>
                  <BulletList items={result.critic.improvements} color="green-500" />
                </Card>
              </div>
            )}

            {tab === "rebuild" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card title="Recommended Stack" icon={<Icon name="layers" />}>
                    <TagList items={result.builder.techRecommendations} />
                    <p className="mt-3 text-xs text-zinc-600">Est. build time: {result.builder.estimatedBuildTime}</p>
                  </Card>
                  <Card title="Folder Structure" icon={<Icon name="tool" />}>
                    <pre className="text-xs text-zinc-400 font-mono leading-relaxed">{result.builder.folderStructure}</pre>
                  </Card>
                </div>

                <Card title="Rebuild Plan" icon={<Icon name="chevron" />}>
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap">{result.builder.rebuildPlan}</pre>
                </Card>

                <Card title="MVP Prompt" icon={<Icon name="zap" />}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-xs text-zinc-600">Paste into Claude Code / Cursor to build the MVP</p>
                    <CopyButton text={result.builder.mvpPrompt} />
                  </div>
                  <pre className="text-sm text-zinc-300 bg-zinc-800 rounded-xl p-4 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {result.builder.mvpPrompt}
                  </pre>
                </Card>

                <Card title="SaaS Version Prompt" icon={<Icon name="star" />}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-xs text-zinc-600">Build the monetized SaaS version</p>
                    <CopyButton text={result.builder.saasPrompt} />
                  </div>
                  <pre className="text-sm text-zinc-300 bg-zinc-800 rounded-xl p-4 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                    {result.builder.saasPrompt}
                  </pre>
                </Card>

                {/* Download button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={downloadStarterRepo}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Icon name="download" />
                    {generating ? "Generating project..." : "Download Starter Repo"}
                  </button>
                  <p className="text-zinc-600 text-xs">AI-generated starter code based on this analysis</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <footer className="mt-16 pt-8 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-700">
            <p>RepoMind AI — built by SudarshanTechLabs</p>
            <p>Powered by OpenAI GPT-4o</p>
          </footer>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}
