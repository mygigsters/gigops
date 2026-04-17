/**
 * Benchmark data model — types for community rate benchmarks.
 * Privacy-first: all data local, anonymisation built in.
 */

export type GigOutcome = 'won' | 'lost' | 'withdrawn';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'NZD' | 'SGD' | 'JPY' | 'INR' | string;

export type GigDurationEstimate =
  | 'hours'      // < 1 day
  | 'days'       // 1-5 days
  | 'weeks'      // 1-4 weeks
  | 'months'     // 1-6 months
  | 'long-term'; // 6+ months

export interface BenchmarkEntry {
  /** UUID v4 */
  id: string;
  /** Platform where gig was found (e.g. Upwork, Toptal, direct) */
  platform: string;
  /** Skill category (e.g. "frontend", "devops", "design", "copywriting") */
  skill_category: string;
  /** Rate you bid / proposed (hourly or project, see rate_type) */
  rate_bid: number;
  /** Final agreed rate (null if lost/withdrawn) */
  rate_final: number | null;
  /** Hourly or fixed/project rate */
  rate_type: 'hourly' | 'fixed';
  /** ISO 4217 currency code */
  currency: Currency;
  /** ISO 3166-1 alpha-2 country code (your location) */
  location_country: string;
  /** Outcome of the bid */
  outcome: GigOutcome;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Estimated duration of the gig */
  gig_duration_estimate: GigDurationEstimate;
  /** Optional freeform notes (stripped during anonymisation) */
  notes?: string;
}

/** Anonymised version — no id, no notes, rates rounded */
export interface AnonymisedBenchmarkEntry {
  platform: string;
  skill_category: string;
  rate_bid: number;      // rounded to nearest $5
  rate_final: number | null; // rounded to nearest $5
  rate_type: 'hourly' | 'fixed';
  currency: Currency;
  location_country: string;
  outcome: GigOutcome;
  /** Truncated to month: YYYY-MM */
  timestamp_month: string;
  gig_duration_estimate: GigDurationEstimate;
}

/** Anonymise a benchmark entry */
export function anonymise(entry: BenchmarkEntry): AnonymisedBenchmarkEntry {
  const roundTo5 = (n: number) => Math.round(n / 5) * 5;
  return {
    platform: entry.platform,
    skill_category: entry.skill_category,
    rate_bid: roundTo5(entry.rate_bid),
    rate_final: entry.rate_final != null ? roundTo5(entry.rate_final) : null,
    rate_type: entry.rate_type,
    currency: entry.currency,
    location_country: entry.location_country,
    outcome: entry.outcome,
    timestamp_month: entry.timestamp.slice(0, 7),
    gig_duration_estimate: entry.gig_duration_estimate,
  };
}
