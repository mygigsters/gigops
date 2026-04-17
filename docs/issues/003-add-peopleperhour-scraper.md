# Add PeoplePerHour scraper

**Labels:** `good first issue`, `scraper`, `help wanted`

## Description

Add a scraper for [PeoplePerHour](https://www.peopleperhour.com) so users can evaluate and scan PPH gigs through GigOps.

## What needs to happen

1. Create `src/scrapers/peopleperhour.ts` implementing the `Scraper` interface
2. Handle PPH project/hourlie URLs
3. Extract: title, description, budget, skills required, client info, proposals count
4. Register the scraper in `src/scrapers/index.ts`
5. Add tests in `tests/scrapers/peopleperhour.test.ts`

## Hints

- PPH has two types: Hourlies (fixed-price offers) and Projects (client briefs) — handle both
- See existing scrapers for the pattern

## Acceptance Criteria

- [ ] `gigops evaluate <pph-url>` works for both hourlies and projects
- [ ] Tests pass with fixture data
