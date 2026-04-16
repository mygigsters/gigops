import { Page } from 'playwright';
import { BaseScraper, GigListing, ScraperResult, SearchConfig } from './base.js';
import { newPage, sleep } from '../utils/browser.js';

export class UpworkScraper extends BaseScraper {
  platform = 'upwork';

  async scrapeListingUrl(url: string): Promise<GigListing> {
    const page = await newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await sleep(2000);

      const title = await page.locator('h1, [data-test="job-title"]').first().innerText().catch(() => '');
      const description = await page
        .locator('[data-test="description"], .description, .job-description')
        .first()
        .innerText()
        .catch(() => '');
      const budgetRaw = await page
        .locator('[data-test="budget"], .budget, [class*="Budget"]')
        .first()
        .innerText()
        .catch(() => '');
      const clientName = await page
        .locator('[data-test="client-name"], .client-name')
        .first()
        .innerText()
        .catch(() => undefined);
      const clientRatingText = await page
        .locator('[data-test="rating"], .rating-value')
        .first()
        .innerText()
        .catch(() => '');
      const skillsText = await page.locator('[data-test="skills"], .skills-list .badge').allInnerTexts().catch(() => []);
      const proposalsText = await page
        .locator('[data-test="proposals-count"], .proposals-count')
        .first()
        .innerText()
        .catch(() => '');
      const postedText = await page
        .locator('[data-test="posted-on"], time')
        .first()
        .innerText()
        .catch(() => undefined);
      const experienceText = await page
        .locator('[data-test="experience-level"], .experience-level')
        .first()
        .innerText()
        .catch(() => undefined);

      return {
        id: this.generateId(url),
        url,
        platform: this.platform,
        title: title.trim(),
        description: description.trim(),
        budget: this.parseBudget(budgetRaw, 'USD'),
        client: {
          name: clientName?.trim(),
          rating: clientRatingText ? parseFloat(clientRatingText) : undefined,
        },
        skills_required: skillsText.map((s) => s.trim()).filter(Boolean),
        proposals_count: proposalsText ? parseInt(proposalsText.replace(/\D/g, '')) : undefined,
        posted_at: postedText?.trim(),
        experience_level: experienceText?.trim(),
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
      const query = [...config.keywords, ...(config.skills || [])].join(' ');
      const searchUrl = `https://www.upwork.com/search/jobs/?q=${encodeURIComponent(query)}&sort=recency`;

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      await sleep(3000);

      const jobCards = await page.locator('[data-test="job-tile"], .job-tile, article').all();
      const limit = config.limit ?? 20;

      for (const card of jobCards.slice(0, limit)) {
        try {
          const linkEl = card.locator('a[href*="/jobs/"]').first();
          const href = await linkEl.getAttribute('href').catch(() => null);
          if (!href) continue;

          const url = href.startsWith('http') ? href : `https://www.upwork.com${href}`;
          const title = await card.locator('h2, h3, [data-test="job-title"]').first().innerText().catch(() => '');
          const desc = await card.locator('[data-test="job-description-text"], .description').first().innerText().catch(() => '');
          const budgetRaw = await card.locator('[data-test="budget"], .budget').first().innerText().catch(() => '');

          listings.push({
            id: this.generateId(url),
            url,
            platform: this.platform,
            title: title.trim(),
            description: desc.trim(),
            budget: this.parseBudget(budgetRaw, 'USD'),
            client: {},
            skills_required: [],
            scraped_at: new Date().toISOString(),
          });

          await sleep(500);
        } catch (err) {
          errors.push(`Failed to parse card: ${err}`);
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
      const ratingText = await page.locator('.rating, [data-test="rating"]').first().innerText().catch(() => '');
      const location = await page.locator('.location, [data-test="location"]').first().innerText().catch(() => undefined);
      const totalSpent = await page.locator('[data-test="total-spent"]').first().innerText().catch(() => undefined);
      const paymentVerified = await page.locator('[data-test="payment-verified"]').count().then((c) => c > 0).catch(() => false);

      return {
        name: name?.trim(),
        rating: ratingText ? parseFloat(ratingText) : undefined,
        location: location?.trim(),
        total_spent: totalSpent?.trim(),
        payment_verified: paymentVerified,
      };
    } finally {
      await page.close();
    }
  }
}
