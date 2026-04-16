# Getting Started with GigOps

## Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com) (Claude)
- Git

## Installation

```bash
# Clone the repo
git clone https://github.com/mygigsters/gigops.git
cd gigops

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Set up environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Set up your profile
cp config/profile.example.yml config/profile.yml
# Edit config/profile.yml with your details

# Validate setup
npm run doctor
```

## Your First Evaluation

```bash
# Evaluate a specific gig
npx ts-node src/index.ts evaluate https://www.upwork.com/jobs/...

# Or after building:
npm run build
./dist/index.js evaluate https://www.upwork.com/jobs/...
```

## Your First Scan

```bash
# Scan Upwork for React jobs (uses your profile skills by default)
npx ts-node src/index.ts scan --platform upwork --evaluate --limit 5
```

## Generate a Proposal

```bash
npx ts-node src/index.ts propose https://www.upwork.com/jobs/...
```

## Track in Pipeline

```bash
# Evaluate and save to pipeline
npx ts-node src/index.ts evaluate <url> --save

# View your pipeline
npx ts-node src/index.ts pipeline list

# Update status after applying
npx ts-node src/index.ts pipeline update <id> applied
```

## Dashboard (Optional)

Requires Go 1.21+:

```bash
cd dashboard
go mod tidy
go run main.go
```

## Tips

1. **Fill out your profile thoroughly** — the quality of evaluations and proposals depends on it
2. **Add proof points** — specific, quantified achievements massively improve proposal quality
3. **Run `doctor` first** — fixes 90% of setup issues
4. **Start with `--limit 5`** when evaluating batches — save your API credits
5. **Grades below B?** Skip it. Your time is worth more than a long-shot application.
