/**
 * Anonymous data queue — stores anonymised benchmark entries locally
 * for future upload to community API.
 *
 * Data is appended to ~/.gigops/anonymous-queue.jsonl
 * A future `gigops benchmark sync` command will push this to the API.
 */

import { appendFileSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { BenchmarkEntry, AnonymisedBenchmarkEntry } from './schema.js';
import { anonymise } from './schema.js';

const DATA_DIR = join(homedir(), '.gigops');
const QUEUE_FILE = join(DATA_DIR, 'anonymous-queue.jsonl');

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** Queue an anonymised version of a benchmark entry for future sharing. */
export function queueAnonymousEntry(entry: BenchmarkEntry, queuePath = QUEUE_FILE): AnonymisedBenchmarkEntry {
  ensureDataDir();
  const anon = anonymise(entry);
  appendFileSync(queuePath, JSON.stringify(anon) + '\n');
  return anon;
}

/** Load all queued anonymous entries. */
export function loadQueue(queuePath = QUEUE_FILE): AnonymisedBenchmarkEntry[] {
  if (!existsSync(queuePath)) return [];
  const raw = readFileSync(queuePath, 'utf-8').trim();
  if (!raw) return [];
  return raw.split('\n').map(line => JSON.parse(line) as AnonymisedBenchmarkEntry);
}

/** Clear the queue (after successful sync). */
export function clearQueue(queuePath = QUEUE_FILE): void {
  if (existsSync(queuePath)) {
    writeFileSync(queuePath, '');
  }
}

/** Get the default queue file path (useful for testing). */
export function getQueuePath(): string {
  return QUEUE_FILE;
}
