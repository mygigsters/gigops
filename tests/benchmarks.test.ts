import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { anonymise, type BenchmarkEntry } from '../src/benchmarks/schema';
import { addEntry, loadAll, exportAnonymous } from '../src/benchmarks/store';
import { personalStats, marketData } from '../src/benchmarks/aggregator';

function makeTempFile(): string {
  const dir = mkdtempSync(join(tmpdir(), 'gigops-test-'));
  return join(dir, 'benchmarks.jsonl');
}

const sampleEntry: Omit<BenchmarkEntry, 'id' | 'timestamp'> = {
  platform: 'Upwork',
  skill_category: 'frontend',
  rate_bid: 120,
  rate_final: 115,
  rate_type: 'hourly',
  currency: 'USD',
  location_country: 'AU',
  outcome: 'won',
  gig_duration_estimate: 'weeks',
};

describe('schema', () => {
  it('anonymises an entry correctly', () => {
    const entry: BenchmarkEntry = {
      ...sampleEntry,
      id: 'test-id',
      timestamp: '2026-03-15T10:30:00Z',
      rate_bid: 123,
      rate_final: 117,
      notes: 'secret stuff',
    };

    const anon = anonymise(entry);
    expect(anon).not.toHaveProperty('id');
    expect(anon).not.toHaveProperty('notes');
    expect(anon.rate_bid).toBe(125);       // 123 → nearest 5
    expect(anon.rate_final).toBe(115);     // 117 → nearest 5
    expect(anon.timestamp_month).toBe('2026-03');
  });

  it('rounds rates to nearest $5', () => {
    expect(anonymise({ ...sampleEntry, id: 'x', timestamp: '2026-01-01T00:00:00Z', rate_bid: 42, rate_final: 48 }).rate_bid).toBe(40);
    expect(anonymise({ ...sampleEntry, id: 'x', timestamp: '2026-01-01T00:00:00Z', rate_bid: 43, rate_final: 48 }).rate_bid).toBe(45);
  });

  it('handles null rate_final', () => {
    const anon = anonymise({ ...sampleEntry, id: 'x', timestamp: '2026-01-01T00:00:00Z', rate_final: null });
    expect(anon.rate_final).toBeNull();
  });
});

describe('store', () => {
  let tmpFile: string;
  beforeEach(() => { tmpFile = makeTempFile(); });

  it('loadAll returns empty for non-existent file', () => {
    expect(loadAll(tmpFile)).toEqual([]);
  });

  it('addEntry writes and loadAll reads', () => {
    const entry = addEntry(sampleEntry, tmpFile);
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.platform).toBe('Upwork');

    const all = loadAll(tmpFile);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(entry.id);
  });

  it('multiple entries append correctly', () => {
    addEntry(sampleEntry, tmpFile);
    addEntry({ ...sampleEntry, platform: 'Toptal', outcome: 'lost', rate_final: null }, tmpFile);
    addEntry({ ...sampleEntry, platform: 'Direct', outcome: 'withdrawn', rate_final: null }, tmpFile);

    const all = loadAll(tmpFile);
    expect(all).toHaveLength(3);
  });

  it('exportAnonymous produces valid JSONL', () => {
    addEntry(sampleEntry, tmpFile);
    addEntry({ ...sampleEntry, rate_bid: 133, notes: 'private note' }, tmpFile);

    const exported = exportAnonymous(tmpFile);
    const lines = exported.split('\n');
    expect(lines).toHaveLength(2);

    const parsed = lines.map(l => JSON.parse(l));
    // No id or notes in anonymised output
    for (const p of parsed) {
      expect(p).not.toHaveProperty('id');
      expect(p).not.toHaveProperty('notes');
      expect(p.rate_bid % 5).toBe(0); // rounded
    }
  });
});

describe('aggregator', () => {
  function makeEntries(): BenchmarkEntry[] {
    const base = { rate_type: 'hourly' as const, currency: 'USD', location_country: 'AU', gig_duration_estimate: 'weeks' as const };
    return [
      { id: '1', platform: 'Upwork', skill_category: 'frontend', rate_bid: 100, rate_final: 95, outcome: 'won', timestamp: '2026-01-15T00:00:00Z', ...base },
      { id: '2', platform: 'Upwork', skill_category: 'frontend', rate_bid: 120, rate_final: null, outcome: 'lost', timestamp: '2026-01-20T00:00:00Z', ...base },
      { id: '3', platform: 'Toptal', skill_category: 'frontend', rate_bid: 150, rate_final: 145, outcome: 'won', timestamp: '2026-02-10T00:00:00Z', ...base },
      { id: '4', platform: 'Upwork', skill_category: 'devops', rate_bid: 130, rate_final: 130, outcome: 'won', timestamp: '2026-02-15T00:00:00Z', ...base },
      { id: '5', platform: 'Direct', skill_category: 'frontend', rate_bid: 90, rate_final: null, outcome: 'withdrawn', timestamp: '2026-03-01T00:00:00Z', ...base },
    ];
  }

  it('personalStats computes correctly', () => {
    const stats = personalStats(makeEntries());
    expect(stats.totalGigs).toBe(5);
    expect(stats.wins).toBe(3);
    expect(stats.losses).toBe(1);
    expect(stats.withdrawn).toBe(1);
    expect(stats.winRate).toBeCloseTo(0.6);
    expect(stats.avgBidRate).toBeCloseTo(118);
    expect(stats.avgFinalRate).toBeCloseTo(123.33, 1);
    expect(Object.keys(stats.ratesBySkill)).toContain('frontend');
    expect(Object.keys(stats.ratesBySkill)).toContain('devops');
  });

  it('marketData groups by skill/platform', () => {
    const data = marketData(makeEntries());
    expect(data.bySkillPlatform['frontend/Upwork']).toBeDefined();
    expect(data.bySkillPlatform['frontend/Upwork'].count).toBe(2);
    expect(data.bySkillPlatform['devops/Upwork'].count).toBe(1);
  });

  it('marketData computes trend', () => {
    const data = marketData(makeEntries());
    expect(data.trend.length).toBeGreaterThanOrEqual(2);
    expect(data.trend[0].month).toBe('2026-01');
  });

  it('winRateByPercentile has 4 buckets', () => {
    const data = marketData(makeEntries());
    expect(data.winRateByPercentile).toHaveLength(4);
  });

  it('handles empty entries', () => {
    const stats = personalStats([]);
    expect(stats.totalGigs).toBe(0);
    expect(stats.winRate).toBe(0);

    const data = marketData([]);
    expect(data.trend).toEqual([]);
  });
});
