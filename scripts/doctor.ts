#!/usr/bin/env ts-node
/**
 * GigOps Doctor — Setup Validator
 * Checks all dependencies, configuration, and environment are correctly set up.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fix?: string;
}

const results: CheckResult[] = [];

function check(name: string, fn: () => CheckResult): void {
  try {
    results.push(fn());
  } catch (err) {
    results.push({ name, status: 'fail', message: `Unexpected error: ${err}` });
  }
}

// Check Node version
check('Node.js version', () => {
  const version = process.version;
  const major = parseInt(version.replace('v', '').split('.')[0]);
  if (major >= 18) {
    return { name: 'Node.js version', status: 'pass', message: `${version} ✓` };
  }
  return {
    name: 'Node.js version',
    status: 'fail',
    message: `${version} — Node 18+ required`,
    fix: 'Install Node.js 18+ from https://nodejs.org',
  };
});

// Check Playwright
check('Playwright installed', () => {
  try {
    require.resolve('playwright');
    return { name: 'Playwright installed', status: 'pass', message: 'playwright found ✓' };
  } catch {
    return {
      name: 'Playwright installed',
      status: 'fail',
      message: 'playwright not found',
      fix: 'Run: npm install',
    };
  }
});

// Check Playwright browsers
check('Playwright browsers', () => {
  try {
    execSync('npx playwright install chromium --dry-run 2>&1', { stdio: 'pipe' });
    return { name: 'Playwright browsers', status: 'pass', message: 'Chromium available ✓' };
  } catch {
    return {
      name: 'Playwright browsers',
      status: 'warn',
      message: 'Chromium may not be installed',
      fix: 'Run: npx playwright install chromium',
    };
  }
});

// Check .env
check('Environment file', () => {
  if (fs.existsSync('.env')) {
    return { name: 'Environment file', status: 'pass', message: '.env found ✓' };
  }
  return {
    name: 'Environment file',
    status: 'warn',
    message: '.env not found',
    fix: 'Run: cp .env.example .env and fill in your API keys',
  };
});

// Check ANTHROPIC_API_KEY
check('Anthropic API key', () => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key && key.startsWith('sk-ant-')) {
    return { name: 'Anthropic API key', status: 'pass', message: `Key configured (${key.substring(0, 10)}...) ✓` };
  }
  return {
    name: 'Anthropic API key',
    status: 'fail',
    message: 'ANTHROPIC_API_KEY not set or invalid',
    fix: 'Add ANTHROPIC_API_KEY=sk-ant-... to your .env file',
  };
});

// Check profile
check('User profile', () => {
  const profilePaths = ['./config/profile.yml', path.join(process.env.HOME || '~', '.gigops', 'profile.yml')];
  for (const p of profilePaths) {
    if (fs.existsSync(p)) {
      return { name: 'User profile', status: 'pass', message: `Profile found at ${p} ✓` };
    }
  }
  return {
    name: 'User profile',
    status: 'fail',
    message: 'profile.yml not found',
    fix: 'Run: cp config/profile.example.yml config/profile.yml and edit it',
  };
});

// Check platform configs
check('Platform configs', () => {
  const platforms = ['upwork', 'airtasker', 'freelancer'];
  const missing = platforms.filter(p => !fs.existsSync(`./config/platforms/${p}.yml`));
  if (missing.length === 0) {
    return { name: 'Platform configs', status: 'pass', message: 'All platform configs present ✓' };
  }
  return {
    name: 'Platform configs',
    status: 'warn',
    message: `Missing configs: ${missing.join(', ')}`,
    fix: 'Platform configs should be included in the repo — try git pull',
  };
});

// Check pipeline directory
check('Pipeline directory', () => {
  if (fs.existsSync('./pipeline')) {
    return { name: 'Pipeline directory', status: 'pass', message: 'pipeline/ exists ✓' };
  }
  fs.mkdirSync('./pipeline', { recursive: true });
  fs.writeFileSync('./pipeline/.gitkeep', '');
  return { name: 'Pipeline directory', status: 'pass', message: 'Created pipeline/ ✓' };
});

// Print results
console.log(chalk.bold('\n🩺 GigOps Doctor — Setup Check\n'));

let passCount = 0, warnCount = 0, failCount = 0;

for (const r of results) {
  if (r.status === 'pass') {
    console.log(chalk.green(`  ✓ ${r.name.padEnd(25)} ${r.message}`));
    passCount++;
  } else if (r.status === 'warn') {
    console.log(chalk.yellow(`  ⚠ ${r.name.padEnd(25)} ${r.message}`));
    if (r.fix) console.log(chalk.dim(`      Fix: ${r.fix}`));
    warnCount++;
  } else {
    console.log(chalk.red(`  ✗ ${r.name.padEnd(25)} ${r.message}`));
    if (r.fix) console.log(chalk.dim(`      Fix: ${r.fix}`));
    failCount++;
  }
}

console.log(`\n  ${chalk.green(`${passCount} passed`)}  ${chalk.yellow(`${warnCount} warnings`)}  ${chalk.red(`${failCount} failed`)}\n`);

if (failCount > 0) {
  console.log(chalk.red('  ✗ Setup incomplete. Fix the issues above before using GigOps.\n'));
  process.exit(1);
} else if (warnCount > 0) {
  console.log(chalk.yellow('  ⚠ Setup mostly complete. Address warnings for full functionality.\n'));
} else {
  console.log(chalk.green('  ✓ GigOps is ready to go! Run `gigops --help` to get started.\n'));
}
