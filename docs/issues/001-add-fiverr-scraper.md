# Add Fiverr scraper

**Labels:** `good first issue`, `scraper`, `help wanted`

## Description

Add a scraper for [Fiverr](https://www.fiverr.com) gig listings so users can evaluate, research, and track Fiverr gigs through GigOps.

## What needs to happen

1. Create `src/scrapers/fiverr.ts` implementing the `Scraper` interface
2. Handle Fiverr gig URLs (e.g. `https://www.fiverr.com/username/i-will-do-something`)
3. Extract: title, description, price/packages, seller info, reviews, delivery time
4. Register the scraper in `src/scrapers/index.ts`
5. Add tests with fixture HTML in `tests/scrapers/fiverr.test.ts`

## Hints

- See `src/scrapers/airtasker.ts` for a working example
- Fiverr uses server-rendered HTML for listing pages — `cheerio` should work
- Fiverr has packages (Basic/Standard/Premium) — map to price range
- Check [CONTRIBUTING.md](../../CONTRIBUTING.md) for the full guide

## Acceptance Criteria

- [ ] `gigops evaluate <fiverr-url>` works
- [ ] `gigops client-intel <fiverr-url>` extracts seller data
- [ ] Tests pass with fixture data
