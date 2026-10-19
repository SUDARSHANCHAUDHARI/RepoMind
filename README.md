# RepoMind AI

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4.1-412991.svg)](https://platform.openai.com/)
[![Release](https://img.shields.io/badge/release-production%20candidate-orange.svg)](#status)

Turn any GitHub repository into a rebuildable product blueprint. RepoMind reads a repo, runs multiple AI analysis agents, and returns architecture notes, feature maps, code risks, rebuild plans, launch prompts, and a generated starter project.

> **Status:** Production candidate · build verified · Cloudflare Pages setup documented · live release still needs real API smoke tests and extension URL wiring

## Contents

1. [Why This Exists](#why-this-exists)
2. [Status](#status)
3. [Key Technical Decisions](#key-technical-decisions)
4. [Features](#features)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Chrome Extension](#chrome-extension)
8. [Deployment](#deployment)
9. [Architecture](#architecture)
10. [Tech Stack](#tech-stack)
11. [Verification](#verification)
12. [Known Limits](#known-limits)
13. [Roadmap](#roadmap)
14. [Author](#author)

## Why This Exists

Developers often inspect GitHub repos to understand how an app is built, what features it contains, and how to rebuild something similar. A normal README or dependency list does not explain the product, architecture, risks, and build path together.

RepoMind turns that inspection into a structured workflow:

- read repository metadata, README, file tree, and common config files
- run focused AI agents for architecture, product features, and code review
- synthesize the results into a rebuild plan and AI-ready prompts
- generate a starter project based on the analysis
- support direct analysis from GitHub pages through a Chrome extension

## Status

| Item | State |
|---|---|
| Release type | Production candidate |
| Current target | Cloudflare Pages web app |
| Local build | Verified |
| API smoke with real keys | Pending |
| Chrome extension production URL | Pending |
| Public launch | Pending final env + route smoke |

**Last verified:** 2026-06-04

Verified commands:

```bash
pnpm build
pnpm exec tsc --noEmit
```

## Key Technical Decisions

**Next.js App Router was chosen for UI plus API routes in one repo.** RepoMind needs a polished web UI and server-side API handlers for OpenAI and GitHub calls. Keeping both inside the Next app avoids a separate backend during the first production release.

**GitHub Contents and Tree APIs provide enough signal without cloning repos.** The app fetches metadata, README content, top-level files, recursive tree paths, and common config files. This is faster and simpler than cloning, and it works well for public repos.

**Four focused AI passes are stronger than one large prompt.** Architect, Feature Engineer, and Code Critic agents run in parallel. The Builder agent then synthesizes their output into a rebuild plan and prompts. This gives clearer sections and keeps each prompt focused.

**JSON-mode responses make the UI predictable.** AI responses are requested as JSON objects and parsed into typed analysis sections. Fallback objects keep the UI usable if one agent fails.

**Deployed on Cloudflare Pages** as a static export plus native Pages Functions. The frontend is a static export (`npx next build` → `out`); the former Next API routes (`analyze`, `generate`, `share`) run as Pages Functions under `functions/api/`, with the `nodejs_compat` flag for `Buffer` and the OpenAI SDK. Live at `repomind.sudarshantechlabs.com`.

## Features

### Repository Analysis

- GitHub URL parser for `https://github.com/owner/repo`
- repository metadata lookup
- README extraction
- top-level file listing
- recursive file tree sampling
- config-file extraction for `package.json`, `tsconfig.json`, `Dockerfile`, `requirements.txt`, `Cargo.toml`, `go.mod`, `.env.example`, and CI config

### Multi-Agent AI Output

- architecture breakdown: stack, patterns, data flow, infrastructure layer
- feature extraction: core features, user flows, gaps, missing features
- code review: security risks, scalability issues, quality improvements
- builder synthesis: rebuild plan, folder structure, tech recommendations, MVP prompt, SaaS prompt

### Product Utilities

- generated starter repo files through `/api/generate`
- tweet/share copy through `/api/share`
- Chrome extension popup for analyzing the current GitHub page
- downloadable starter project support through `jszip`

## Getting Started

### Prerequisites

- Node.js `20.19.6` recommended
- pnpm
- OpenAI API key
- GitHub token recommended for higher GitHub API limits

### Install

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/RepoMind.git
cd RepoMind
pnpm install
```

### Configure

No `.env` is required to run. **The OpenAI key is bring-your-own-key** — each
visitor adds their own key in the app's Settings; it is stored only in their
browser and sent per request (`x-api-key` header), so hosting the app publicly
never bills your account.

An optional `GITHUB_TOKEN` env var raises the GitHub API rate limit when reading
repos; without it, public repos still work at the lower anonymous limit.

### Run Locally

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `OPENAI_API_KEY` | Yes | Used by analysis, starter generation, and share-copy API routes. |
| `GITHUB_TOKEN` | Recommended | Raises GitHub API limits and improves repo fetch reliability. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public app URL used for share links and extension handoff. |

## Chrome Extension

The extension lives in `extension/` and uses Manifest V3.

Setup:

1. Open Chrome at `chrome://extensions`.
2. Enable developer mode.
3. Load the `extension/` folder as an unpacked extension.
4. Open any `github.com/owner/repo` page.
5. Click the RepoMind extension icon.

The extension calls `https://repomind.sudarshantechlabs.com` by default. To use another app URL
(for example `http://localhost:3000` in local development), set it on the extension's Options page.
The popup needs your own OpenAI API key, also set on the Options page and stored only on that device.

See [extension/README.md](extension/README.md) for the extension-specific guide.

## Deployment

RepoMind uses Next API routes, so deploy it as a Next.js runtime app, not a static export.

Recommended Cloudflare Pages settings:

| Setting | Value |
|---|---|
| Framework preset | `Next.js` |
| Build command | `pnpm build:cloudflare` |
| Build output directory | (auto-detected by Cloudflare's Next-on-Pages adapter — see the [`@cloudflare/next-on-pages` README](https://github.com/cloudflare/next-on-pages) for the exact path the tool emits) |
| Node version | `20.19.6` |
| Production branch | `main` |

Set these Cloudflare environment variables:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
GITHUB_TOKEN=YOUR_GITHUB_TOKEN
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
```

Production smoke tests after deployment:

- submit a public GitHub repo URL through the main UI
- verify `/api/analyze` returns structured analysis
- verify `/api/generate` returns starter project files
- verify `/api/share` returns share copy
- verify the Chrome extension opens the deployed app URL

## Architecture

```txt
GitHub URL
   |
   v
app/api/analyze
   |
   v
lib/github.ts
   |-- repo metadata
   |-- README
   |-- file tree
   |-- common config files
   |
   v
lib/analyzer.ts
   |-- Architect agent
   |-- Feature Engineer agent
   |-- Code Critic agent
   |
   v
Builder synthesis agent
   |
   v
RepoAnalysis JSON -> web UI / generator / share route
```

Important paths:

```txt
RepoMind/
├── app/
│   ├── api/analyze/route.ts      # repo fetch + multi-agent analysis
│   ├── api/generate/route.ts     # starter project generation
│   ├── api/share/route.ts        # share-copy generation
│   ├── layout.tsx
│   └── page.tsx                  # main web UI
├── lib/
│   ├── github.ts                 # GitHub API reader
│   ├── prompts.ts                # agent prompts
│   ├── analyzer.ts               # parallel agent runner
│   └── generator.ts              # starter repo generator
├── extension/                    # Chrome extension
├── types/                        # shared TypeScript types
├── public/_headers               # Cloudflare/security headers
└── RELEASE_MEMORY.md             # release handoff notes
```

## Tech Stack

- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **UI:** React 18, Tailwind CSS, Framer Motion, Lucide icons
- **AI:** OpenAI SDK, GPT-4.1 for analysis/generation, GPT-4o mini for share copy
- **GitHub access:** GitHub REST API through Axios
- **Packaging utility:** JSZip for generated starter output
- **Deployment target:** Cloudflare Pages with Next runtime support
- **Browser extension:** Chrome Manifest V3

## Verification

Run before each release:

```bash
pnpm build
pnpm exec tsc --noEmit
```

Run with real environment variables before production:

```bash
pnpm dev
```

Then smoke-test:

- main page loads
- analysis works for a public GitHub repo
- starter project generation returns files
- share route returns a short post
- Chrome extension points to the correct app URL

## Known Limits

- No user accounts or saved analysis history yet.
- No billing or usage limits yet; OpenAI costs need monitoring before broad public launch.
- Private repo support depends on GitHub token permissions and has not been promoted as a release feature.
- Generated starter repos should be reviewed before claiming production quality.
- API routes need real-key smoke tests in the deployed Cloudflare environment.

## Roadmap

- Supabase auth with Google sign-in
- usage limits for free and paid tiers
- Stripe billing for Pro access
- saved analysis history
- public share pages for analysis results
- stronger generated project validation
- extension production release packaging

- [About](#about)

---

## About

I'm Sudarshan Chaudhari, a Senior Quality Engineer, Test Automation specialist, and AI systems builder based in Bangkok, Thailand.

I have 13+ years of experience in software quality engineering, working across SaaS, fintech, gaming, web, mobile, cloud, and digital signage platforms. My background combines hands-on test automation with QA leadership, test strategy, CI/CD, release quality, production investigation, and cross-platform validation.

Alongside my professional QA career, I run [SudarshanTechLabs](https://sudarshantechlabs.com/), my independent engineering and product lab where I design, build, test, and ship software across Android, web, AI, cybersecurity, developer tooling, and cross-platform applications.

### What I work on

- ⚙️ **Quality Engineering & Test Automation** — Playwright, Selenium, Cypress, Appium, API testing, automation frameworks, end-to-end testing, CI/CD, release gates, GitHub Actions, risk-based testing, and production validation
- 🤖 **AI Systems & Automation** — AI agents, multi-agent orchestration, MCP servers, AI-assisted QA, prompt tooling, developer workflows, automation systems, and Claude Code plugins
- 📱 **Mobile & Cross-Platform Applications** — Android applications built with Kotlin and Jetpack Compose, Google Play releases, automated build and publishing pipelines, and cross-platform development spanning iOS, web, Windows, and macOS
- 🌐 **Web Applications & Platforms** — Full-stack applications using Next.js, TypeScript, Firebase, Cloudflare, REST APIs, and modern web infrastructure
- 🛠️ **Developer Tooling & CLI Engineering** — Rust, Python, TypeScript, CLI utilities, multi-repository tooling, build automation, release tooling, and engineering productivity systems
- 🛡️ **Cybersecurity & Observability** — Threat detection, log analysis, security auditing, vulnerability assessment, monitoring, and security-focused developer tools
- 📺 **Digital Signage & Device Platforms** — Content validation, playback testing, device compatibility, production investigation, monitoring, and QA across diverse hardware and operating-system environments

My work sits at the intersection of quality engineering, automation, AI, and software development. I approach products with a QA mindset from the beginning: understanding failure modes, designing for testability, automating repetitive work, and building release confidence into the engineering process.

Through SudarshanTechLabs, I also build products and tools from idea to production, covering architecture, development, testing, CI/CD, release automation, monitoring, and ongoing maintenance.

🌐 [sudarshantechlabs.com](https://sudarshantechlabs.com/) · 💼 [LinkedIn](https://linkedin.com/in/sudarshan-chaudhari) · 🐙 [GitHub](https://github.com/SUDARSHANCHAUDHARI) · ✉️ [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
