/**
 * User configuration for GigOps.
 * Stored at ~/.gigops/profile.yml as YAML, but we use simple key=value
 * JSON for now to avoid a YAML dependency. File: ~/.gigops/config.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export interface GigOpsConfig {
  /** Whether the user has opted in to sharing anonymous benchmark data */
  shareAnonymousData?: boolean;
  /** Any other config fields can be added here */
  [key: string]: unknown;
}

const DATA_DIR = join(homedir(), '.gigops');
const CONFIG_FILE = join(DATA_DIR, 'config.json');

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** Load config from disk. Returns empty object if no config file exists. */
export function loadConfig(configPath = CONFIG_FILE): GigOpsConfig {
  if (!existsSync(configPath)) return {};
  try {
    const raw = readFileSync(configPath, 'utf-8').trim();
    if (!raw) return {};
    return JSON.parse(raw) as GigOpsConfig;
  } catch {
    return {};
  }
}

/** Save config to disk (merges with existing). */
export function saveConfig(updates: Partial<GigOpsConfig>, configPath = CONFIG_FILE): GigOpsConfig {
  ensureDataDir();
  const existing = loadConfig(configPath);
  const merged = { ...existing, ...updates };
  writeFileSync(configPath, JSON.stringify(merged, null, 2) + '\n');
  return merged;
}

/** Get a specific config value. */
export function getConfigValue(key: string, configPath = CONFIG_FILE): unknown {
  const config = loadConfig(configPath);
  return config[key];
}

/** Set a specific config value. */
export function setConfigValue(key: string, value: unknown, configPath = CONFIG_FILE): void {
  saveConfig({ [key]: value }, configPath);
}

/** Get the default config file path (useful for testing). */
export function getConfigPath(): string {
  return CONFIG_FILE;
}
