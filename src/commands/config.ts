import { Command } from 'commander';
import { loadConfig, setConfigValue, getConfigPath } from '../config.js';

/** Known boolean config keys that accept true/false */
const BOOLEAN_KEYS = new Set(['shareAnonymousData']);

/** Parse a string value into the appropriate type for the given key. */
function parseValue(key: string, raw: string): unknown {
  if (BOOLEAN_KEYS.has(key)) {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    throw new Error(`Invalid value for ${key}: expected "true" or "false", got "${raw}"`);
  }
  // Try number, fall back to string
  const num = Number(raw);
  if (!isNaN(num) && raw.trim() !== '') return num;
  return raw;
}

export function configCommand(): Command {
  const cmd = new Command('config')
    .description('View and update GigOps configuration');

  cmd
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const config = loadConfig();
      if (Object.keys(config).length === 0) {
        console.log('No configuration set yet.');
        console.log(`Config file: ${getConfigPath()}`);
        return;
      }
      console.log('\n⚙️  GigOps Config');
      console.log('─'.repeat(40));
      for (const [key, value] of Object.entries(config)) {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      }
      console.log(`\nConfig file: ${getConfigPath()}`);
    });

  cmd
    .command('get <key>')
    .description('Get a config value')
    .action((key: string) => {
      const config = loadConfig();
      if (key in config) {
        console.log(config[key]);
      } else {
        console.log(`Config key "${key}" is not set.`);
        process.exitCode = 1;
      }
    });

  cmd
    .command('set <key> <value>')
    .description('Set a config value (e.g. gigops config set shareAnonymousData true)')
    .action((key: string, rawValue: string) => {
      try {
        const value = parseValue(key, rawValue);
        setConfigValue(key, value);
        console.log(`✅ Set ${key} = ${JSON.stringify(value)}`);
      } catch (err: any) {
        console.error(`❌ ${err.message}`);
        process.exitCode = 1;
      }
    });

  return cmd;
}
