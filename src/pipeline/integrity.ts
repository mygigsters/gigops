import { PipelineTracker, PipelineEntry } from './tracker';

export interface IntegrityReport {
  total: number;
  duplicates: PipelineEntry[][];
  invalid: Array<{ entry: PipelineEntry; reason: string }>;
  fixed: number;
  warnings: string[];
}

const REQUIRED_FIELDS: (keyof PipelineEntry)[] = ['id', 'url', 'platform', 'title', 'status', 'discovered_at'];
const VALID_STATUSES = ['discovered', 'evaluated', 'proposal_drafted', 'applied', 'interviewing', 'won', 'lost', 'skipped', 'withdrawn'];

export function checkIntegrity(tracker: PipelineTracker): IntegrityReport {
  const entries = tracker.readAll();
  const report: IntegrityReport = {
    total: entries.length,
    duplicates: [],
    invalid: [],
    fixed: 0,
    warnings: [],
  };

  // Check for duplicates by URL
  const urlMap = new Map<string, PipelineEntry[]>();
  for (const entry of entries) {
    const existing = urlMap.get(entry.url) ?? [];
    existing.push(entry);
    urlMap.set(entry.url, existing);
  }
  for (const [, group] of urlMap) {
    if (group.length > 1) report.duplicates.push(group);
  }

  // Validate required fields and status values
  for (const entry of entries) {
    for (const field of REQUIRED_FIELDS) {
      if (!entry[field]) {
        report.invalid.push({ entry, reason: `Missing required field: ${field}` });
      }
    }
    if (!VALID_STATUSES.includes(entry.status)) {
      report.invalid.push({ entry, reason: `Invalid status: ${entry.status}` });
    }
    if (entry.score !== undefined && (entry.score < 0 || entry.score > 5)) {
      report.warnings.push(`Entry ${entry.id}: score ${entry.score} out of range`);
    }
  }

  return report;
}

export function deduplicatePipeline(tracker: PipelineTracker): number {
  const entries = tracker.readAll();
  const seen = new Set<string>();
  const deduped: PipelineEntry[] = [];

  for (const entry of entries) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      deduped.push(entry);
    }
  }

  const removed = entries.length - deduped.length;
  if (removed > 0) {
    // Write back deduplicated entries
    const tempTracker = tracker as unknown as { writeAll: (e: PipelineEntry[]) => void };
    // Re-upsert all deduped entries
    for (const entry of deduped) {
      tracker.upsert(entry);
    }
  }

  return removed;
}

export function normalizeStatuses(tracker: PipelineTracker): number {
  const entries = tracker.readAll();
  const statusMap: Record<string, string> = {
    'in_progress': 'applied',
    'pending': 'applied',
    'submitted': 'applied',
    'closed': 'lost',
    'completed': 'won',
    'rejected': 'lost',
    'passed': 'skipped',
  };

  let fixed = 0;
  for (const entry of entries) {
    const normalized = statusMap[entry.status];
    if (normalized) {
      tracker.updateStatus(entry.id, normalized as PipelineEntry['status']);
      fixed++;
    }
  }
  return fixed;
}
