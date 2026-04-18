import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadConfig, saveConfig } from '../config.js';

/**
 * Tests for the consent flow logic.
 *
 * We can't easily test the interactive prompt (it uses @inquirer/prompts),
 * but we can test the config-based logic that drives the flow:
 * - When shareAnonymousData is undefined → prompt should fire
 * - When shareAnonymousData is true → sharing enabled, no prompt
 * - When shareAnonymousData is false → sharing disabled, no prompt
 */

function makeTempConfig(): string {
  const dir = mkdtempSync(join(tmpdir(), 'gigops-consent-test-'));
  return join(dir, 'config.json');
}

describe('consent flow config logic', () => {
  let configPath: string;
  beforeEach(() => { configPath = makeTempConfig(); });

  it('shareAnonymousData is undefined on fresh config (prompt needed)', () => {
    const config = loadConfig(configPath);
    expect(config.shareAnonymousData).toBeUndefined();
    // typeof undefined !== 'boolean' → prompt should fire
    expect(typeof config.shareAnonymousData === 'boolean').toBe(false);
  });

  it('shareAnonymousData=true skips prompt', () => {
    saveConfig({ shareAnonymousData: true }, configPath);
    const config = loadConfig(configPath);
    expect(typeof config.shareAnonymousData).toBe('boolean');
    expect(config.shareAnonymousData).toBe(true);
  });

  it('shareAnonymousData=false skips prompt', () => {
    saveConfig({ shareAnonymousData: false }, configPath);
    const config = loadConfig(configPath);
    expect(typeof config.shareAnonymousData).toBe('boolean');
    expect(config.shareAnonymousData).toBe(false);
  });

  it('user can change from false to true (re-opt-in)', () => {
    saveConfig({ shareAnonymousData: false }, configPath);
    saveConfig({ shareAnonymousData: true }, configPath);
    expect(loadConfig(configPath).shareAnonymousData).toBe(true);
  });

  it('user can change from true to false (opt-out)', () => {
    saveConfig({ shareAnonymousData: true }, configPath);
    saveConfig({ shareAnonymousData: false }, configPath);
    expect(loadConfig(configPath).shareAnonymousData).toBe(false);
  });
});

describe('ensureDataSharingConsent', () => {
  let configPath: string;
  beforeEach(() => { configPath = makeTempConfig(); });

  it('returns true without prompting when already opted in', async () => {
    saveConfig({ shareAnonymousData: true }, configPath);

    // Import the function and test with pre-set config
    const { ensureDataSharingConsent } = await import('../commands/benchmark.js');

    // Since config already has boolean value, it should NOT prompt
    const result = await ensureDataSharingConsent(configPath);
    expect(result).toBe(true);
  });

  it('returns false without prompting when already opted out', async () => {
    saveConfig({ shareAnonymousData: false }, configPath);

    const { ensureDataSharingConsent } = await import('../commands/benchmark.js');
    const result = await ensureDataSharingConsent(configPath);
    expect(result).toBe(false);
  });
});
