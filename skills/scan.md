# Skill: scan

Crawls platform search pages for matching gigs and optionally evaluates them.

## Usage

```bash
gigops scan --platform upwork --keywords "react,node.js" --limit 10 --evaluate --save
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--platform` | upwork, airtasker, freelancer | upwork |
| `--keywords` | Comma-separated search terms | Profile primary skills |
| `--location` | Location filter | None |
| `--limit` | Max results to fetch | 10 |
| `--evaluate` | Auto-evaluate each result | false |
| `--save` | Save to pipeline | false |

## What it does

1. Opens the platform's search page via Playwright
2. Scrolls/paginates to collect listings up to the limit
3. Extracts: title, URL, budget, description snippet
4. If `--evaluate`: runs AI evaluation on each (slower but gives grades)
5. If `--save`: adds all results to pipeline.jsonl

## Performance

- Without `--evaluate`: Fast, ~2-5 seconds total
- With `--evaluate`: ~15-30 seconds per listing (AI call + scraping)
- Use `--limit 5` with `--evaluate` for first runs

## Tip

Run scan without `--evaluate` first to see what's available, then run `gigops evaluate <url>` on interesting ones individually.

## Supported platforms (v1)

- Upwork (upwork.com)
- Airtasker (airtasker.com)
- Freelancer (freelancer.com)

More platforms coming in v2. See `docs/adding-platforms.md` to add your own.
