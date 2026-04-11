import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoMind AI — Reverse-engineer any GitHub repo",
  description:
    "Paste a GitHub URL. Get architecture breakdown, feature extraction, weakness analysis, and a downloadable starter project — powered by 4 AI agents.",
  keywords: "github analyzer, repo reverse engineer, ai code analysis, clone any saas, github intelligence",
  authors: [{ name: "SudarshanTechLabs" }],
  openGraph: {
    title: "RepoMind AI — Reverse-engineer any GitHub repo",
    description: "Paste a GitHub URL. Get architecture, features, weaknesses, and a downloadable starter project in seconds.",
    type: "website",
    siteName: "RepoMind AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepoMind AI",
    description: "Turn any GitHub repo into a rebuildable blueprint + starter code.",
    creator: "@SudarshanTechLabs",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
