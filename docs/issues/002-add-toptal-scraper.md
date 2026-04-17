# Add Toptal scraper

**Labels:** `good first issue`, `scraper`, `help wanted`

## Description

Add a scraper for [Toptal](https://www.toptal.com) job listings so users can evaluate Toptal opportunities through GigOps.

## What needs to happen

1. Create `src/scrapers/toptal.ts` implementing the `Scraper` interface
2. Handle Toptal job URLs
3. Extract: title, description, required skills, engagement type, estimated duration
4. Register the scraper in `src/scrapers/index.ts`
5. Add tests with fixture HTML in `tests/scrapers/toptal.test.ts`

## Hints

- See `src/scrapers/airtasker.ts` for a working example
- Toptal jobs often don't show rates publicly — return `null` for rate fields
- Focus on the public job listing pages first

## Acceptance Criteria

- [ ] `gigops evaluate <toptal-url>` works
- [ ] Tests pass with fixture data
