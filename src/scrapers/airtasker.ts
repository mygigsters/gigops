import { BaseScraper, GigListing, ScraperResult, SearchConfig } from './base';
import { newPage, sleep } from '../utils/browser';

export class AirtaskerScraper extends BaseScraper {
  platform = 'airtasker';

  async scrapeListingUrl(url: string): Promise<GigListing> {
    const page = await newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await sleep(2000);

      const title = await page.locator('h1, [data-ui="task-title"]').first().innerText().catch(() => '');
      const description = await page
        .locator('[data-ui="task-description"], .task-description')
        .first()
        .innerText()
        .catch(() => '');
      const budgetRaw = await page
        .locator('[data-ui="task-budget"], .task-price, .budget')
        .first()
        .innerText()
        .catch(() => '');
      const clientName = await page
        .locator('[data-ui="poster-name"], .poster-name')
        .first()
        .innerText()
        .catch(() => undefined);
      const clientRatingText = await page
        .locator('.star-rating-score, .rating-score')
        .first()
        .innerText()
        .catch(() => '');
      const locationText = await page
        .locator('[data-ui="task-location"], .task-location')
        .first()
        .innerText()
        .catch(() => undefined);
      const postedText = await page.locator('time, .task-posted-date').first().getAttribute('datetime').catch(() => undefined);

      return {
        id: this.generateId(url),
        url,
        platform: this.platform,
        title: title.trim(),
        description: description.trim(),
        budget: this.parseBudget(budgetRaw, 'AUD'),
        client: {
          name: clientName?.trim(),
          rating: clientRatingText ? parseFloat(clientRatingText) : undefined,
          location: locationText?.trim(),
        },
        skills_required: [],
        posted_at: postedText ?? undefined,
        scraped_at: new Date().toISOString(),
      };
    } finally {
      await page.close();
    }
  }

  async searchListings(config: SearchConfig): Promise<ScraperResult> {
    const listings: GigListing[] = [];
    const errors: string[] = [];
    const page = await newPage();

    try {
      const query = config.keywords.join(' ');
      const location = config.location || 'Australia';
      const searchUrl = `https://www.airtasker.com/tasks/?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      await sleep(3000);

      // Scroll to load more tasks
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(1000);
      }

      const taskCards = await page.locator('[data-ui="task-card"], .task-card, [class*="TaskCard"]').all();
      const limit = config.limit ?? 20;

      for (const card of taskCards.slice(0, limit)) {
        try {
          const linkEl = card.locator('a').first();
          const href = await linkEl.getAttribute('href').catch(() => null);
          if (!href) continue;

          const url = href.startsWith('http') ? href : `https://www.airtasker.com${href}`;
          const title = await card.locator('h2, h3, [data-ui="task-title"]').first().innerText().catch(() => '');
          const desc = await card.locator('[data-ui="task-description"], p').first().innerText().catch(() => '');
          const budgetRaw = await card.locator('[data-ui="task-budget"], .budget, .price').first().innerText().catch(() => '');

          listings.push({
            id: this.generateId(url),
            url,
            platform: this.platform,
            title: title.trim(),
            description: desc.trim(),
            budget: this.parseBudget(budgetRaw, 'AUD'),
            client: {},
            skills_required: [],
            scraped_at: new Date().toISOString(),
          });
        } catch (err) {
          errors.push(`Failed to parse task card: ${err}`);
        }
      }
    } catch (err) {
      errors.push(`Search failed: ${err}`);
    } finally {
      await page.close();
    }

    return { listings, errors };
  }

  async scrapeClientProfile(clientUrl: string): Promise<GigListing['client']> {
    const page = await newPage();
    try {
      await page.goto(clientUrl, { waitUntil: 'domcontentloaded' });
      await sleep(2000);

      const name = await page.locator('h1, .profile-name').first().innerText().catch(() => undefined);
      const ratingText = await page.locator('.star-rating-score, .rating-score').first().innerText().catch(() => '');
      const reviewsText = await page.locator('.review-count, [class*="reviewCount"]').first().innerText().catch(() => '');
      const location = await page.locator('.user-location, .location').first().innerText().catch(() => undefined);

      return {
        name: name?.trim(),
        rating: ratingText ? parseFloat(ratingText) : undefined,
        reviews: reviewsText ? parseInt(reviewsText.replace(/\D/g, '')) : undefined,
        location: location?.trim(),
      };
    } finally {
      await page.close();
    }
  }
}
