# Status — RepoMind

**Last updated:** 2026-06-21
**Maturity:** 🟢 `status-production-ready`

## What's done

- Four-agent pipeline: **Architect** (tech stack, patterns, infra), **Product** (features, gaps, user flows), **Critic** (issues, security, scalability), **Builder** (rebuild plan, MVP prompt, SaaS prompt)
- GitHub API integration via `lib/github.ts` — fetches metadata, README, file tree (capped at 150 paths), and 10 common config files in parallel
- AI generation via OpenAI/Anthropic in `lib/generator.ts`
- Three Next.js API routes: `/api/analyze`, `/api/generate`, `/api/share`
- Cloudflare-on-Pages build script (`build:cloudflare`)
- ESLint configured (was missing), Next.js + core-web-vitals
- Exported `parseOwnerRepo()` for testing
- 10 tests across 2 suites — URL parsing (6 cases incl. `.git` suffix, no-protocol, malformed → throws) and prompt builders (metadata embedding, node_modules tree filtering, required JSON keys)
- Build, lint, typecheck, tests all green

## What's left

- **Chrome extension** (in `extension/` folder) — present but unclear current status; needs an audit pass to confirm it builds and matches the web app
- **Live deploy** to your own host needs `OPENAI_API_KEY` (and optional `GITHUB_TOKEN` for higher API rate limits). Stock Next.js — pick whatever Node/static host fits your existing flow.
- Optional: rate limiting on the API routes (currently unprotected — fine for personal use, risky for public)
- Optional: caching of GitHub API responses (each analyze hits the API for ~12 endpoints)

## Quality gates

| Gate | Status |
|---|---|
| Build | ✅ |
| Lint | ✅ 0 errors |
| Typecheck | ✅ |
| Tests | ✅ 10 / 2 suites |

## Deployment

Not yet deployed. Self-hosted on your own domain — deploy via the same Node/static flow you already use for your other apps.

## File-by-file checklist

### App shell
- [x] `app/layout.tsx` — root layout
- [x] `app/page.tsx` — analyzer UI (popular-repo examples shortcut)
- [x] `app/error.tsx`, `app/not-found.tsx`, `app/globals.css`
- [x] `middleware.ts` — in-memory rate limiter (TODO: swap to shared KV in production)

### API routes
- [x] `app/api/analyze/route.ts` — runs architect / feature / critic agents
- [x] `app/api/generate/route.ts` — runs builder agent
- [x] `app/api/share/route.ts` — share-URL endpoint

### Lib
- [x] `lib/github.ts` — GitHub Contents/Tree API client; parses owner/repo from URL
- [x] `lib/analyzer.ts` — orchestrates the 3 parallel agents
- [x] `lib/generator.ts` — builder synthesis
- [x] `lib/prompts.ts` — architect / feature / critic / builder prompts

### Tests
- [x] `lib/github.test.ts` — 6 tests (URL parsing, error paths, `.git` suffix, no-protocol, trailing slash, non-GitHub rejection)
- [x] `lib/prompts.test.ts` — 4 tests (metadata embedding, node_modules tree filtering, required JSON keys)

### Types
- [x] `types/index.ts`

### Quality + scaffolding
- [x] `.eslintrc.json` (next/core-web-vitals) — 0 errors
- [x] `typecheck` + `test` scripts
- [x] Build + lint + typecheck green
- [x] `build:cloudflare` script for Cloudflare Pages

### Not done
- [ ] Live deploy needs `OPENAI_API_KEY` (and optional `GITHUB_TOKEN`)
- [ ] Rate limiting on API routes (`middleware.ts` is in-memory; swap to shared KV)
- [ ] Caching GitHub API responses (each analyze hits ~12 endpoints)
- [ ] Audit `extension/` folder — Chrome extension present but status unverified

## Categorized work remaining

| Item | Effort | Bucket | Blocker | Priority |
|------|--------|--------|---------|----------|
| Swap in-memory rate limiter for shared KV | ~3h | 🟦 Pure code | Cloudflare KV or Upstash Redis client + binding (one-time setup on Cloudflare side) | P2 |
| Cache GitHub API responses (per repo, short TTL) | ~3h | 🟦 Pure code | none — use the same KV layer or a simple in-process cache | P2 |
| Audit `extension/` folder | ~1–2h | 🟦 Pure code | none — verify it builds + matches the web app's contract | P3 |
| Live deploy to Cloudflare Pages | ~30m | 🔑 Needs creds | `OPENAI_API_KEY` (+ optional `GITHUB_TOKEN` for higher API rate limits) | P1 |

## Release plan

1. **Bounded engineering:** add shared KV rate limiter, GitHub response caching, audit/fix the Chrome extension.
2. **Deploy:**
   - Cloudflare Pages: connect the GitHub repo, set build command `pnpm build:cloudflare`, set the env vars above
   - Confirm `/api/analyze?url=https://github.com/facebook/react` returns valid JSON
3. **Tag release:** `gh release create v1.0.0 --title "RepoMind v1.0.0 — 4-agent GitHub repo analyzer"`
4. **Optional:** publish the Chrome extension to the Web Store (separate flow, needs developer account).

### Deploy prerequisites
- `OPENAI_API_KEY` — required
- `GITHUB_TOKEN` — optional but recommended (higher GitHub API rate limits)
- `NEXT_PUBLIC_APP_URL` — your live URL
- Cloudflare account (free tier works)
