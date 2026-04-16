import { BaseScraper, GigListing, ScraperResult, SearchConfig } from './base.js';
import { newPage, sleep } from '../utils/browser.js';

export class FreelancerScraper extends BaseScraper {
  platform = 'freelancer';

  async scrapeListingUrl(url: string): Promise<GigListing> {
    const page = await newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await sleep(2000);

      const title = await page.locator('h1, .project-title').first().innerText().catch(() => '');
      const description = await page
        .locator('.project-description, [class*="Description"]')
        .first()
        .innerText()
        .catch(() => '');
      const budgetRaw = await page
        .locator('.project-budget, [class*="Budget"], .budget')
        .first()
        .innerText()
        .catch(() => '');
      const clientName = await page
        .locator('.employer-name, [class*="EmployerName"]')
        .first()
        .innerText()
        .catch(() => undefined);
      const clientRatingText = await page
        .locator('.reputation-score, .rating')
        .first()
        .innerText()
        .catch(() => '');
      const skillsElements = await page.locator('.skills .skill, [class*="skill-tag"]').allInnerTexts().catch(() => []);
      const proposalsText = await page
        .locator('.bids-count, [class*="BidCount"]')
        .first()
        .innerText()
        .catch(() => '');
      const postedText = await page.locator('time, .time-left').first().innerText().catch(() => undefined);

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
        skills_required: skillsElements.map((s) => s.trim()).filter(Boolean),
        proposals_count: proposalsText ? parseInt(proposalsText.replace(/\D/g, '')) : undefined,
        posted_at: postedText?.trim(),
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
      const searchUrl = `https://www.freelancer.com/jobs/${encodeURIComponent(query.replace(/\s+/g, '-'))}/`;

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      await sleep(3000);

      const jobCards = await page
        .locator('.JobSearchCard-item, [class*="project-card"], .project-list-item')
        .all();
      const limit = config.limit ?? 20;

      for (const card of jobCards.slice(0, limit)) {
        try {
          const linkEl = card.locator('a[href*="/projects/"]').first();
          const href = await linkEl.getAttribute('href').catch(() => null);
          if (!href) continue;

          const url = href.startsWith('http') ? href : `https://www.freelancer.com${href}`;
          const title = await card
            .locator('h2, h3, .project-title, [class*="ProjectName"]')
            .first()
            .innerText()
            .catch(() => '');
          const desc = await card
            .locator('.project-description, p, [class*="Description"]')
            .first()
            .innerText()
            .catch(() => '');
          const budgetRaw = await card.locator('.project-budget, .budget').first().innerText().catch(() => '');
          const skills = await card.locator('.skill, [class*="skill"]').allInnerTexts().catch(() => []);

          listings.push({
            id: this.generateId(url),
            url,
            platform: this.platform,
            title: title.trim(),
            description: desc.trim(),
            budget: this.parseBudget(budgetRaw, 'USD'),
            client: {},
            skills_required: skills.map((s) => s.trim()).filter(Boolean),
            scraped_at: new Date().toISOString(),
          });
        } catch (err) {
          errors.push(`Failed to parse project card: ${err}`);
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

      const name = await page.locator('h1, .profile-username').first().innerText().catch(() => undefined);
      const ratingText = await page.locator('.reputation-score, .rating-score').first().innerText().catch(() => '');
      const reviewsText = await page.locator('.reviews-count, [class*="ReviewCount"]').first().innerText().catch(() => '');
      const location = await page.locator('.user-country, .location').first().innerText().catch(() => undefined);

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
