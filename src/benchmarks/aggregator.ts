/**
 * Aggregation functions for benchmark data.
 * Computes market intelligence from local (and eventually community) data.
 */

import type { BenchmarkEntry } from './schema.js';

export interface RateStats {
  count: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
}

export interface WinRateByPercentile {
  percentile: string; // e.g. "0-25", "25-50", "50-75", "75-100"
  totalBids: number;
  wins: number;
  winRate: number;
}

export interface TrendPoint {
  month: string; // YYYY-MM
  medianRate: number;
  count: number;
  winRate: number;
}

export interface PersonalStats {
  totalGigs: number;
  wins: number;
  losses: number;
  withdrawn: number;
  winRate: number;
  avgBidRate: number;
  avgFinalRate: number | null;
  ratesBySkill: Record<string, RateStats>;
}

export interface MarketData {
  bySkillPlatform: Record<string, RateStats>;
  winRateByPercentile: WinRateByPercentile[];
  trend: TrendPoint[];
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(nums: number[], p: number): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function computeRateStats(rates: number[]): RateStats {
  return {
    count: rates.length,
    median: median(rates),
    p25: percentile(rates, 25),
    p75: percentile(rates, 75),
    min: Math.min(...rates),
    max: Math.max(...rates),
  };
}

/** Personal stats from your own data */
export function personalStats(entries: BenchmarkEntry[]): PersonalStats {
  const wins = entries.filter(e => e.outcome === 'won');
  const losses = entries.filter(e => e.outcome === 'lost');
  const withdrawn = entries.filter(e => e.outcome === 'withdrawn');

  const bidRates = entries.map(e => e.rate_bid);
  const finalRates = wins.map(e => e.rate_final).filter((r): r is number => r != null);

  // Rates by skill
  const bySkill: Record<string, number[]> = {};
  for (const e of entries) {
    (bySkill[e.skill_category] ??= []).push(e.rate_bid);
  }

  return {
    totalGigs: entries.length,
    wins: wins.length,
    losses: losses.length,
    withdrawn: withdrawn.length,
    winRate: entries.length > 0 ? wins.length / entries.length : 0,
    avgBidRate: bidRates.length > 0 ? bidRates.reduce((a, b) => a + b, 0) / bidRates.length : 0,
    avgFinalRate: finalRates.length > 0 ? finalRates.reduce((a, b) => a + b, 0) / finalRates.length : null,
    ratesBySkill: Object.fromEntries(
      Object.entries(bySkill).map(([skill, rates]) => [skill, computeRateStats(rates)])
    ),
  };
}

/** Market-level aggregation */
export function marketData(entries: BenchmarkEntry[]): MarketData {
  // Group by skill+platform
  const groups: Record<string, number[]> = {};
  for (const e of entries) {
    const key = `${e.skill_category}/${e.platform}`;
    (groups[key] ??= []).push(e.rate_bid);
  }

  const bySkillPlatform = Object.fromEntries(
    Object.entries(groups).map(([k, rates]) => [k, computeRateStats(rates)])
  );

  // Win rate by rate percentile
  const allBids = entries.map(e => e.rate_bid).sort((a, b) => a - b);
  const p25Val = percentile(allBids, 25);
  const p50Val = percentile(allBids, 50);
  const p75Val = percentile(allBids, 75);

  const buckets = [
    { percentile: '0-25', filter: (r: number) => r <= p25Val },
    { percentile: '25-50', filter: (r: number) => r > p25Val && r <= p50Val },
    { percentile: '50-75', filter: (r: number) => r > p50Val && r <= p75Val },
    { percentile: '75-100', filter: (r: number) => r > p75Val },
  ];

  const winRateByPercentile = buckets.map(b => {
    const matching = entries.filter(e => b.filter(e.rate_bid));
    const wins = matching.filter(e => e.outcome === 'won');
    return {
      percentile: b.percentile,
      totalBids: matching.length,
      wins: wins.length,
      winRate: matching.length > 0 ? wins.length / matching.length : 0,
    };
  });

  // Trend over time (monthly)
  const byMonth: Record<string, BenchmarkEntry[]> = {};
  for (const e of entries) {
    const month = e.timestamp.slice(0, 7);
    (byMonth[month] ??= []).push(e);
  }

  const trend = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthEntries]) => ({
      month,
      medianRate: median(monthEntries.map(e => e.rate_bid)),
      count: monthEntries.length,
      winRate: monthEntries.filter(e => e.outcome === 'won').length / monthEntries.length,
    }));

  return { bySkillPlatform, winRateByPercentile, trend };
}
