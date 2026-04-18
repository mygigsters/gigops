import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadConfig, saveConfig, getConfigValue, setConfigValue } from '../config.js';

function makeTempConfig(): string {
  const dir = mkdtempSync(join(tmpdir(), 'gigops-cfg-test-'));
  return join(dir, 'config.json');
}

describe('config', () => {
  let configPath: string;
  beforeEach(() => { configPath = makeTempConfig(); });

  it('loadConfig returns empty object for non-existent file', () => {
    expect(loadConfig(configPath)).toEqual({});
  });

  it('saveConfig creates file and returns merged config', () => {
    const result = saveConfig({ shareAnonymousData: true }, configPath);
    expect(result).toEqual({ shareAnonymousData: true });
  });

  it('saveConfig merges with existing config', () => {
    saveConfig({ shareAnonymousData: false }, configPath);
    const result = saveConfig({ someOtherKey: 'hello' }, configPath);
    expect(result).toEqual({ shareAnonymousData: false, someOtherKey: 'hello' });
  });

  it('saveConfig overwrites existing keys', () => {
    saveConfig({ shareAnonymousData: false }, configPath);
    const result = saveConfig({ shareAnonymousData: true }, configPath);
    expect(result.shareAnonymousData).toBe(true);
  });

  it('getConfigValue returns undefined for missing keys', () => {
    expect(getConfigValue('nonexistent', configPath)).toBeUndefined();
  });

  it('getConfigValue returns saved values', () => {
    saveConfig({ shareAnonymousData: true }, configPath);
    expect(getConfigValue('shareAnonymousData', configPath)).toBe(true);
  });

  it('setConfigValue sets individual keys', () => {
    setConfigValue('shareAnonymousData', false, configPath);
    expect(loadConfig(configPath).shareAnonymousData).toBe(false);

    setConfigValue('shareAnonymousData', true, configPath);
    expect(loadConfig(configPath).shareAnonymousData).toBe(true);
  });

  it('handles corrupted config file gracefully', () => {
    writeFileSync(configPath, 'not json at all');
    expect(loadConfig(configPath)).toEqual({});
  });

  it('handles empty config file', () => {
    writeFileSync(configPath, '');
    expect(loadConfig(configPath)).toEqual({});
  });

  it('preserves other config fields when setting shareAnonymousData', () => {
    saveConfig({ someField: 42, shareAnonymousData: false }, configPath);
    setConfigValue('shareAnonymousData', true, configPath);
    const config = loadConfig(configPath);
    expect(config.someField).toBe(42);
    expect(config.shareAnonymousData).toBe(true);
  });
});
