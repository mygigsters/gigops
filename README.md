<div align="center">

# ⚡ GigOps

**AI-powered gig search command center for freelancers**

*Companies use AI to filter gig workers. This gives gig workers AI to choose their gigs.*

[![MIT License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Built by MyGigsters](https://img.shields.io/badge/Built%20by-MyGigsters-7C3AED.svg)](https://mygigsters.com.au)

[Getting Started](#getting-started) · [Features](#features) · [Commands](#commands) · [Contributing](#contributing)

</div>

---

Tired of spending hours evaluating gigs that turn out to be terrible fits? GigOps is a CLI tool that uses Claude AI to evaluate gig listings, score clients, generate tailored proposals, and track your pipeline — all from your terminal.

> *"I did 19 different gigs before building a fintech for gig workers. This is the open-source tool I wish I had."*
> — Benji Elengovan, CEO of [MyGigsters](https://mygigsters.com.au)

---

## Features

### 🎯 Evaluate
AI evaluates any gig URL against your profile using 6 weighted dimensions. Gets a letter grade (A–F) and tells you whether to apply, consider, or skip — in under 30 seconds.

### 📝 Propose
Generate a tailored, ready-to-paste proposal for any gig. Opens with something specific about their project (never "I saw your posting"). Under 300 words. Referenced to your real proof points.

### 🔍 Scan
Configure saved searches per platform. GigOps crawls Upwork, Airtasker, and Freelancer, filters by your criteria, and queues matches for evaluation.

### 💰 Rate Check
Market rate intelligence for any skill/location/experience combo. Know your worth before you bid.

### 🕵️ Client Intel
Scrape and analyse client profiles. Flag red flags: low ratings, unverified payments, scope creep patterns. Know who you're dealing with before you apply.

### 📊 Pipeline
Track everything in a single JSONL file. From discovery → proposal → won/lost. With integrity checks, deduplication, and a terminal dashboard.

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Anthropic API key](https://console.anthropic.com) (Claude)
- Go 1.21+ (optional — for terminal dashboard)

### Install

```bash
git clone https://github.com/mygigsters/gigops.git
cd gigops
npm install
npx playwright install chromium
```

### Configure

```bash
# Environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Profile (this is how GigOps knows who you are)
cp config/profile.example.yml config/profile.yml
# Edit with your skills, rates, and proof points
```

### Validate setup

```bash
npm run doctor
```

---

## Commands

### Evaluate a gig

```bash
npx ts-node src/index.ts evaluate https://www.upwork.com/jobs/~01234
# or after build:
gigops evaluate https://www.upwork.com/jobs/~01234

# Save to pipeline
gigops evaluate <url> --save
```

**Output:**
```
┌── React/Node API for SaaS App ──────────────────────────────────┐
│                                                                  │
│  Grade: A  Score: 4.4/5                                         │
│                                                                  │
│  Summary: Strong skill match for a Node.js API project...       │
│                                                                  │
│  ✓ Pros:                                                         │
│    • All 4 primary skills match                                  │
│    • Client has 4.9/5 rating, payment verified                   │
│    • Only 3 proposals submitted — low competition               │
│                                                                  │
│  Recommendation: ✅ Apply                                        │
└──────────────────────────────────────────────────────────────────┘
```

### Generate a proposal

```bash
gigops propose https://www.upwork.com/jobs/~01234
gigops propose <url> --tone professional   # or conversational, concise
```

### Scan a platform

```bash
gigops scan --platform upwork --keywords "react,node.js" --limit 10
gigops scan --platform airtasker --evaluate --save  # evaluate + save all
```

### Check market rates

```bash
gigops rate-check "React Developer" --location "Sydney, AU" --experience 5
gigops rate-check "UI/UX Designer" --location "London, UK"
```

### Analyse a client

```bash
gigops client-intel https://www.upwork.com/companies/~01234567890
gigops client https://www.airtasker.com/users/clientusername/
```

### Pipeline management

```bash
gigops pipeline list
gigops pipeline list --status applied
gigops pipeline update abc123 interviewing --notes "Good call, sending contract"
gigops pipeline stats
gigops pipeline check --fix  # deduplicate + normalize
```

---

## Scoring System

GigOps evaluates every gig across 6 weighted dimensions:

| Dimension       | Weight | What it measures                            |
|-----------------|--------|---------------------------------------------|
| Skill Match     | 25%    | Your skills vs gig requirements             |
| Rate Fit        | 20%    | Budget vs your target/minimum rate          |
| Client Quality  | 20%    | Client rating, reviews, payment verification|
| Effort/Scope    | 15%    | Realistic time vs pay, scope red flags      |
| Growth Value    | 10%    | Portfolio-worthy? New skills?               |
| Win Probability | 10%    | Competition level, proposal count           |

**Grades:** A (4.5–5.0), B (3.5–4.5), C (2.5–3.5), D (1.5–2.5), F (<1.5)

**Rule:** GigOps only recommends applying to B+ (≥3.5). Life's too short for long shots.

---

## Terminal Dashboard

```bash
cd dashboard
go mod tidy
go run main.go
```

Navigate your pipeline, see grades and status at a glance, drill into details.

---

## Batch Evaluation

```bash
# Evaluate a list of URLs from a file
npx ts-node scripts/batch.ts --file urls.txt --concurrency 3 --save

# Or inline
npx ts-node scripts/batch.ts --urls "https://upwork.com/jobs/1,https://upwork.com/jobs/2"
```

---

## Project Structure

```
gigops/
├── src/
│   ├── index.ts           CLI entry point
│   ├── scrapers/          Playwright scrapers (Upwork, Airtasker, Freelancer)
│   ├── evaluator/         6-dimension scoring engine + AI evaluator
│   ├── proposal/          Proposal generator
│   ├── pipeline/          JSONL tracker + integrity checks
│   ├── rate/              Market rate intelligence
│   ├── client/            Client profile analysis
│   └── utils/             Browser helpers, config loader
├── dashboard/             Go bubbletea terminal dashboard
├── scripts/               doctor.ts, batch.ts
├── config/                Profile + platform configs (YAML)
├── skills/                AI skill documentation
└── templates/             Proposal templates, saved search examples
```

---

## Supported Platforms (v1)

| Platform | Evaluate | Propose | Scan | Client Intel |
|----------|----------|---------|------|--------------|
| Upwork | ✅ | ✅ | ✅ | ✅ |
| Airtasker | ✅ | ✅ | ✅ | ✅ |
| Freelancer | ✅ | ✅ | ✅ | ✅ |
| Other URLs | ✅ | ✅ | — | — |

Want to add a platform? See [docs/adding-platforms.md](docs/adding-platforms.md).

---

## What GigOps Does NOT Do

- **No auto-submitting proposals** — always human-in-the-loop. You review, you send.
- **No official API integrations** — pure Playwright scraping (works even when APIs don't exist)
- **No account credentials stored** — your login info never touches GigOps

---

## Contributing

PRs welcome! Priority areas:
- New platform scrapers (Toptal, PeoplePerHour, Guru)
- Improved selector accuracy (platform UIs change frequently)
- Better scoring heuristics
- Test coverage

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Built by MyGigsters

[MyGigsters](https://mygigsters.com.au) is a fintech platform solving financial problems for gig workers — tax, super, insurance, and cash flow. GigOps is our contribution to the open-source gig economy community.

Follow [@mygigsters](https://twitter.com/mygigsters) for updates.

---

## License

MIT © [MyGigsters Pty Ltd](https://mygigsters.com.au)
