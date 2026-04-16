# Contributing to GigOps

Thanks for wanting to contribute! GigOps is a community project built for freelancers, by people who care about the gig economy.

## What we need most

1. **Platform scrapers** — Toptal, PeoplePerHour, Guru, Fiverr are all missing
2. **Selector updates** — platforms change their DOM constantly, fixes are always welcome
3. **Test coverage** — unit tests for scoring, integration tests for scrapers
4. **Documentation** — better examples, translated docs, video walkthroughs

## How to contribute

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/toptal-scraper`
3. Make your changes
4. Run tests: `npm test`
5. Run `npm run doctor` to validate setup
6. Open a PR with a clear description

## Code style

- TypeScript strict mode, no `any`
- Graceful degradation in scrapers (never throw on missing optional fields)
- Comments for non-obvious business logic
- Keep the AI prompts in the relevant module (not in index.ts)

## Platform scraper checklist

When adding a new platform:
- [ ] `src/scrapers/{platform}.ts` extending `BaseScraper`
- [ ] `config/platforms/{platform}.yml` with selectors
- [ ] Registered in `getScraper()` in `src/index.ts`
- [ ] `detectPlatform()` case in `src/utils/config.ts`
- [ ] `skills/{platform}.md` documentation
- [ ] At least one manual test with a real URL

## Code of Conduct

Be kind. This project is for freelancers trying to make a living.

## Questions?

Open an issue or join our [Discord](https://discord.gg/mygigsters) (coming soon).
