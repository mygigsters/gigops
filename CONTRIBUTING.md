# Contributing to GigOps

Thanks for wanting to help! GigOps is built by freelancers, for freelancers.

## Dev Environment Setup

```bash
# Clone the repo
git clone https://github.com/nicepkg/gigops.git
cd gigops

# Install dependencies
npm install

# Run in dev mode
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

**Requirements:** Node.js >= 18, npm >= 9

You'll need at least one LLM provider configured (see README). For development, Ollama with a local model is free and works great.

## Project Structure

```
src/
├── commands/       # CLI command handlers (evaluate, propose, scan, etc.)
├── scrapers/       # Platform-specific scrapers
│   ├── airtasker.ts
│   ├── freelancer.ts
│   ├── upwork.ts
│   └── generic.ts  # Fallback for any URL
├── providers/      # LLM provider integrations
│   ├── anthropic.ts
│   ├── openai.ts
│   ├── gemini.ts
│   └── ollama.ts
├── prompts/        # AI prompt templates
├── pipeline/       # Pipeline state management
└── utils/          # Shared utilities
```

## Adding a New Platform Scraper

This is the easiest way to contribute! Each scraper lives in `src/scrapers/` and implements the `Scraper` interface:

```typescript
// src/scrapers/fiverr.ts
import { Scraper, GigListing } from './types';

export const fiverrScraper: Scraper = {
  name: 'fiverr',
  
  // Does this scraper handle the given URL?
  matches(url: string): boolean {
    return url.includes('fiverr.com');
  },

  // Extract structured data from a gig listing page
  async scrape(url: string): Promise<GigListing> {
    // Fetch the page, parse HTML, return structured data
    // See existing scrapers for examples
  },

  // (Optional) Search/scan for gigs matching criteria
  async scan(criteria: ScanCriteria): Promise<GigListing[]> {
    // ...
  },
};
```

Then register it in `src/scrapers/index.ts`:

```typescript
import { fiverrScraper } from './fiverr';
// Add to the scrapers array
export const scrapers = [airtaskerScraper, freelancerScraper, upworkScraper, fiverrScraper, genericScraper];
```

> **Note:** The generic scraper should always be last — it's the fallback.

### Scraper Guidelines

- Use `cheerio` for HTML parsing (already a dependency)
- Handle rate limiting gracefully (exponential backoff)
- Return `null` for fields you can't extract — don't guess
- Add tests in `tests/scrapers/`
- Respect `robots.txt`

## Adding a New LLM Provider

Providers live in `src/providers/` and implement the `LLMProvider` interface:

```typescript
// src/providers/my-provider.ts
import { LLMProvider, LLMResponse } from './types';

export const myProvider: LLMProvider = {
  name: 'my-provider',

  async complete(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    // Call the API, return the response
  },

  // Validate that the provider is configured (API key exists, etc.)
  async validate(): Promise<boolean> {
    // ...
  },
};
```

Register it in `src/providers/index.ts` and add the config option in `src/commands/config.ts`.

## Code Style

- **TypeScript** throughout — no `any` unless truly unavoidable
- **Prettier** for formatting (runs on commit via husky)
- **ESLint** for linting — `npm run lint` to check
- Keep functions small and focused
- Prefer descriptive names over comments

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add/update tests as needed
4. Run `npm test` and `npm run lint`
5. Write a clear PR description — what and why
6. Link any related issues

We review PRs within a few days. Don't be shy about pinging if it's been a week.

## Testing

```bash
# All tests
npm test

# Specific test file
npm test -- --grep "airtasker"

# Watch mode
npm run test:watch
```

Tests live in `tests/` mirroring the `src/` structure. Use real fixture data where possible (saved HTML snapshots of gig pages).

## Questions?

Open an issue or start a discussion. We don't bite.
