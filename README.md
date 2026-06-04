# RepoMind AI

> Turn any GitHub repo into a rebuildable blueprint — powered by 4 AI agents running in parallel.

Not a clone of GitReverse. A step above it.

---

## What it does

Paste a GitHub URL → get:

- **Architecture breakdown** — tech stack, patterns, data flow, infra
- **Feature extraction** — core features, all features, missing features, user flows
- **Code review** — issues, security risks, scalability problems, improvements
- **Rebuild blueprint** — step-by-step plan, folder structure, recommended stack
- **AI prompts** — MVP prompt + SaaS version prompt, ready to paste into Claude Code / Cursor
- **Downloadable starter repo** — AI-generated boilerplate based on the analysis
- **Chrome extension** — analyze directly from any GitHub page

---

## Quick Start

### 1. Clone / unzip

```bash
cd repomind-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add API keys

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
GITHUB_TOKEN=YOUR_GITHUB_TOKEN   # optional but recommended
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your OpenAI key: https://platform.openai.com/api-keys  
Get your GitHub token: https://github.com/settings/tokens (no scopes needed for public repos)

### 4. Run

```bash
npm run dev
```

Open: http://localhost:3000

---

## Project Structure

```
repomind-ai/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts     ← multi-agent analysis endpoint
│   │   ├── generate/route.ts    ← starter repo generator
│   │   └── share/route.ts       ← viral tweet generator
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 ← full premium UI
│
├── lib/
│   ├── github.ts                ← deep repo parsing (README + files + tree)
│   ├── prompts.ts               ← 4 agent prompts (architect, features, critic, builder)
│   ├── analyzer.ts              ← parallel multi-agent runner
│   └── generator.ts             ← starter repo code generator
│
├── types/
│   └── index.ts                 ← all TypeScript types
│
├── extension/
│   ├── manifest.json            ← Chrome extension manifest (v3)
│   ├── popup.html               ← extension popup UI
│   ├── popup.js                 ← extension logic
│   └── README.md                ← extension setup guide
│
├── .env.local.example
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## How the AI works

Instead of one weak prompt, RepoMind uses **4 agents in parallel**:

| Agent | Role | Output |
|---|---|---|
| Architect | Senior software architect | Tech stack, patterns, data flow |
| Feature Engineer | Product engineer | Features, user flows, gaps |
| Code Critic | Security reviewer | Issues, risks, improvements |
| Builder | Startup CTO | Rebuild plan, prompts, stack recommendations |

Agents 1-3 run in parallel. Agent 4 synthesizes their outputs.

---

## Chrome Extension

See `extension/README.md` for setup.

Works on any `github.com/owner/repo` page. Shows stack + features in the popup, links to full analysis on the web app.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | ✅ Yes | GPT-4o access |
| `GITHUB_TOKEN` | ⚡ Recommended | Raises rate limit from 60 → 5000 req/hr |
| `NEXT_PUBLIC_APP_URL` | Recommended | App URL for share links and extension handoff |

---

## Deploy to Cloudflare Pages

RepoMind uses Next API routes, so deploy it as a Next.js runtime app, not a static export.

Recommended production setup:

- Framework preset: `Next.js`
- Build command: `pnpm build:cloudflare`
- Build output directory: `.vercel/output/static`
- Node version: `20.19.6`
- Production branch: `main`

Set these environment variables in Cloudflare Pages:

- `OPENAI_API_KEY`
- `GITHUB_TOKEN` optional but recommended
- `NEXT_PUBLIC_APP_URL` with the production URL

After deployment, update `extension/popup.js` so `APP_URL` points to the production app.

## Local Verification

```bash
pnpm build
pnpm exec tsc --noEmit
```

Smoke-test `/api/analyze`, `/api/generate`, and `/api/share` with real environment variables before launch.

---

## Upgrade Path (V2+)

After launch, add:

- **Supabase auth** — login with Google
- **Usage limits** — free 5/day, pro unlimited
- **Stripe billing** — $9/month Pro
- **Result history** — save past analyses
- **Share links** — public analysis URLs

All designed to be added without restructuring.

---

## Built by SudarshanTechLabs

Powered by OpenAI GPT-4o + GitHub API.
