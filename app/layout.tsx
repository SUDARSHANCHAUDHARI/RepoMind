import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoMind AI — Reverse-engineer any GitHub repo",
  description:
    "Paste a GitHub repo URL. Get architecture breakdown, feature extraction, weakness analysis, and a downloadable starter project — in seconds.",
  keywords: "github analyzer, repo reverse engineer, ai code analysis, clone any repo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
