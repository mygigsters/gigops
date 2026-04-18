import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { BenchmarkEntry } from '../benchmarks/schema.js';
import { queueAnonymousEntry, loadQueue, clearQueue } from '../benchmarks/anonymous-queue.js';

function makeTempQueue(): string {
  const dir = mkdtempSync(join(tmpdir(), 'gigops-queue-test-'));
  return join(dir, 'anonymous-queue.jsonl');
}

const sampleEntry: BenchmarkEntry = {
  id: 'test-uuid-123',
  platform: 'Upwork',
  skill_category: 'frontend',
  rate_bid: 123,
  rate_final: 117,
  rate_type: 'hourly',
  currency: 'USD',
  location_country: 'AU',
  outcome: 'won',
  timestamp: '2026-03-15T10:30:00Z',
  gig_duration_estimate: 'weeks',
  notes: 'secret client details',
};

describe('anonymous-queue', () => {
  let queuePath: string;
  beforeEach(() => { queuePath = makeTempQueue(); });

  it('loadQueue returns empty for non-existent file', () => {
    expect(loadQueue(queuePath)).toEqual([]);
  });

  it('queueAnonymousEntry writes anonymised data', () => {
    const anon = queueAnonymousEntry(sampleEntry, queuePath);

    // Should be anonymised
    expect(anon).not.toHaveProperty('id');
    expect(anon).not.toHaveProperty('notes');
    expect(anon.rate_bid).toBe(125);  // 123 rounded to nearest 5
    expect(anon.rate_final).toBe(115); // 117 rounded to nearest 5
    expect(anon.timestamp_month).toBe('2026-03');

    // Should be persisted
    const queued = loadQueue(queuePath);
    expect(queued).toHaveLength(1);
    expect(queued[0].platform).toBe('Upwork');
    expect(queued[0]).not.toHaveProperty('id');
    expect(queued[0]).not.toHaveProperty('notes');
  });

  it('multiple entries queue correctly', () => {
    queueAnonymousEntry(sampleEntry, queuePath);
    queueAnonymousEntry({ ...sampleEntry, platform: 'Toptal', rate_bid: 150, outcome: 'lost', rate_final: null }, queuePath);
    queueAnonymousEntry({ ...sampleEntry, platform: 'Direct', rate_bid: 90, outcome: 'withdrawn', rate_final: null }, queuePath);

    const queued = loadQueue(queuePath);
    expect(queued).toHaveLength(3);
    expect(queued.map(q => q.platform)).toEqual(['Upwork', 'Toptal', 'Direct']);
  });

  it('clearQueue empties the queue file', () => {
    queueAnonymousEntry(sampleEntry, queuePath);
    queueAnonymousEntry(sampleEntry, queuePath);
    expect(loadQueue(queuePath)).toHaveLength(2);

    clearQueue(queuePath);
    expect(loadQueue(queuePath)).toEqual([]);
  });

  it('clearQueue is safe on non-existent file', () => {
    // Should not throw
    clearQueue(queuePath);
    expect(loadQueue(queuePath)).toEqual([]);
  });

  it('queued data is valid JSONL', () => {
    queueAnonymousEntry(sampleEntry, queuePath);
    queueAnonymousEntry({ ...sampleEntry, rate_bid: 200 }, queuePath);

    const raw = readFileSync(queuePath, 'utf-8').trim();
    const lines = raw.split('\n');
    expect(lines).toHaveLength(2);

    // Each line should parse independently
    for (const line of lines) {
      const parsed = JSON.parse(line);
      expect(parsed.platform).toBeDefined();
      expect(parsed.rate_bid % 5).toBe(0);
    }
  });

  it('never includes PII in queued data', () => {
    const entryWithNotes: BenchmarkEntry = {
      ...sampleEntry,
      notes: 'Client: Acme Corp, contact: john@acme.com',
    };
    queueAnonymousEntry(entryWithNotes, queuePath);

    const raw = readFileSync(queuePath, 'utf-8');
    expect(raw).not.toContain('test-uuid-123');
    expect(raw).not.toContain('Acme Corp');
    expect(raw).not.toContain('john@acme.com');
    expect(raw).not.toContain('secret');
  });
});
