export interface GigListing {
  id: string;
  url: string;
  platform: string;
  title: string;
  description: string;
  budget: {
    min?: number;
    max?: number;
    fixed?: number;
    hourly?: boolean;
    currency: string;
    raw: string;
  };
  client: {
    name?: string;
    rating?: number;
    reviews?: number;
    location?: string;
    member_since?: string;
    total_spent?: string;
    payment_verified?: boolean;
  };
  skills_required: string[];
  proposals_count?: number;
  posted_at?: string;
  duration?: string;
  experience_level?: string;
  scraped_at: string;
}

export interface SearchConfig {
  keywords: string[];
  location?: string;
  min_budget?: number;
  max_budget?: number;
  skills?: string[];
  experience_level?: string;
  limit?: number;
}

export interface ScraperResult {
  listings: GigListing[];
  next_page?: string;
  total_count?: number;
  errors: string[];
}

export abstract class BaseScraper {
  abstract platform: string;

  abstract scrapeListingUrl(url: string): Promise<GigListing>;
  abstract searchListings(config: SearchConfig): Promise<ScraperResult>;
  abstract scrapeClientProfile(clientUrl: string): Promise<GigListing['client']>;

  protected generateId(url: string): string {
    const hash = url.split('').reduce((a, c) => {
      a = (a << 5) - a + c.charCodeAt(0);
      return a & a;
    }, 0);
    return `${this.platform}-${Math.abs(hash).toString(36)}`;
  }

  protected parseBudget(raw: string, currency = 'AUD'): GigListing['budget'] {
    const cleaned = raw.replace(/[^0-9\-\.k]/gi, ' ').trim();
    const nums = cleaned.match(/[\d\.]+k?/gi) || [];
    const parsed = nums.map((n) =>
      n.toLowerCase().endsWith('k') ? parseFloat(n) * 1000 : parseFloat(n)
    );

    const hourly = raw.toLowerCase().includes('/hr') || raw.toLowerCase().includes('per hour');

    if (parsed.length === 2) {
      return { min: parsed[0], max: parsed[1], hourly, currency, raw };
    } else if (parsed.length === 1) {
      return { fixed: parsed[0], hourly, currency, raw };
    }
    return { currency, raw };
  }
}
