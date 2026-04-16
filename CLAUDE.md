# CLAUDE.md — GigOps AI Instructions

This file guides Claude Code, Claude, and other AI agents working on this codebase.

## What this project is

GigOps is an open-source CLI tool that helps freelancers use AI to evaluate gig opportunities, generate proposals, and track their pipeline. Built by MyGigsters — a fintech startup for gig workers.

**Tagline:** "Companies use AI to filter gig workers. This gives gig workers AI to choose their gigs."

## Architecture

```
src/
├── index.ts          — Commander CLI entry point
├── scrapers/         — Playwright scrapers (base + per-platform)
├── evaluator/        — 6-dimension scoring engine + AI evaluator
├── proposal/         — Proposal generator
├── pipeline/         — JSONL pipeline tracker + integrity checks
├── rate/             — Market rate intelligence
├── client/           — Client profile analysis
└── utils/            — Config loader, browser helpers

dashboard/            — Go bubbletea TUI
scripts/              — doctor.ts (setup validator), batch.ts (parallel eval)
skills/               — Skill documentation for AI agents
config/               — User profile + platform configs (YAML)
```

## Key conventions

- **TypeScript strict mode** — no `any` unless absolutely necessary
- **Playwright** for all web scraping — never use HTTP clients for pages that require JS
- **Graceful degradation** — scrapers fail softly (return empty strings, not thrown errors) for optional fields
- **AI via Anthropic SDK** — use `claude-opus-4-5` for evaluation/proposals, can drop to `claude-sonnet-4-5` for rate checks
- **JSONL for pipeline** — one JSON object per line, append-friendly, human-readable
- **No auto-sending** — proposals are always generated for human review, never auto-submitted

## Scoring system

6 weighted dimensions (see `src/evaluator/scoring.ts`):
- Skill Match (25%), Rate Fit (20%), Client Quality (20%), Effort/Scope (15%), Growth Value (10%), Win Probability (10%)
- Grades: A (4.5+), B (3.5+), C (2.5+), D (1.5+), F (<1.5)
- Only recommend applying to B+ (≥3.5)

## Adding a new platform

1. Create `src/scrapers/{platform}.ts` extending `BaseScraper`
2. Add `config/platforms/{platform}.yml` with selectors
3. Register in `getScraper()` in `src/index.ts`
4. Add `detectPlatform()` case in `src/utils/config.ts`
5. Document in `skills/{platform}.md`

## Running locally

```bash
npm install
npx playwright install chromium
cp .env.example .env  # Add ANTHROPIC_API_KEY
cp config/profile.example.yml config/profile.yml  # Edit with real data
npm run doctor
npx ts-node src/index.ts evaluate <url>
```

## What NOT to do

- **Never auto-submit proposals** — always return text for human review
- **Never store credentials** in any file (use .env, which is gitignored)
- **Never remove the rate limiting** in scrapers — we're guests on these platforms
- **Don't use `rm -rf`** — this is user data, treat it carefully
- **Don't change scoring weights** without updating `skills/evaluate.md` and the README

## Profile format

See `config/profile.example.yml`. The profile is YAML with a strict structure.
Always use `loadProfile()` from `src/utils/config.ts` — it handles path resolution.

## Pipeline format

JSONL (one JSON object per line). Each entry must have: `id`, `url`, `platform`, `title`, `status`, `discovered_at`, `updated_at`.

Valid statuses: `discovered`, `evaluated`, `proposal_drafted`, `applied`, `interviewing`, `won`, `lost`, `skipped`, `withdrawn`
