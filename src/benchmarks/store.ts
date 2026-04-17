/**
 * Local JSONL storage for benchmark entries.
 * Data lives at ~/.gigops/benchmarks.jsonl
 */

import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import type { BenchmarkEntry, AnonymisedBenchmarkEntry } from './schema.js';
import { anonymise } from './schema.js';

const DATA_DIR = join(homedir(), '.gigops');
const BENCHMARKS_FILE = join(DATA_DIR, 'benchmarks.jsonl');

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** Get the path to the benchmarks file (useful for testing) */
export function getBenchmarksPath(): string {
  return BENCHMARKS_FILE;
}

/** Load all benchmark entries from local storage */
export function loadAll(filePath = BENCHMARKS_FILE): BenchmarkEntry[] {
  if (!existsSync(filePath)) return [];
  const raw = readFileSync(filePath, 'utf-8').trim();
  if (!raw) return [];
  return raw.split('\n').map(line => JSON.parse(line) as BenchmarkEntry);
}

/** Append a new benchmark entry. Returns the created entry with generated id + timestamp. */
export function addEntry(
  data: Omit<BenchmarkEntry, 'id' | 'timestamp'>,
  filePath = BENCHMARKS_FILE,
): BenchmarkEntry {
  ensureDataDir();
  const entry: BenchmarkEntry = {
    ...data,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };
  appendFileSync(filePath, JSON.stringify(entry) + '\n');
  return entry;
}

/** Export all entries as anonymised JSONL string */
export function exportAnonymous(filePath = BENCHMARKS_FILE): string {
  const entries = loadAll(filePath);
  return entries
    .map(e => JSON.stringify(anonymise(e)))
    .join('\n');
}

/** Write anonymised export to a file */
export function exportAnonymousToFile(outputPath: string, filePath = BENCHMARKS_FILE): number {
  const { writeFileSync } = require('node:fs') as typeof import('node:fs');
  const data = exportAnonymous(filePath);
  const lines = data ? data.split('\n') : [];
  writeFileSync(outputPath, data ? data + '\n' : '');
  return lines.length;
}
