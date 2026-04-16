#!/usr/bin/env ts-node
/**
 * GigOps Batch Evaluator
 * Evaluates multiple gig URLs in parallel with concurrency control.
 * Usage: ts-node scripts/batch.ts [--file urls.txt] [--concurrency 3] [--save]
 */

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadProfile, detectPlatform } from '../src/utils/config.js';
import { closeBrowser } from '../src/utils/browser.js';
import { evaluateGig } from '../src/evaluator/evaluator.js';
import { PipelineTracker } from '../src/pipeline/tracker.js';
import { UpworkScraper } from '../src/scrapers/upwork.js';
import { AirtaskerScraper } from '../src/scrapers/airtasker.js';
import { FreelancerScraper } from '../src/scrapers/freelancer.js';

interface BatchResult {
  url: string;
  status: 'success' | 'error';
  grade?: string;
  score?: number;
  recommendation?: string;
  error?: string;
}

async function evaluateUrl(url: string, profile: ReturnType<typeof loadProfile>): Promise<BatchResult> {
  try {
    const platform = detectPlatform(url);
    const ScraperMap: Record<string, any> = {
      upwork: UpworkScraper,
      airtasker: AirtaskerScraper,
      freelancer: FreelancerScraper,
    };
    const ScraperClass = ScraperMap[platform] ?? UpworkScraper;
    const scraper = new ScraperClass();
    const listing = await scraper.scrapeListingUrl(url);
    const evaluation = await evaluateGig(listing, profile);
    return {
      url,
      status: 'success',
      grade: evaluation.ai_analysis.grade,
      score: evaluation.ai_analysis.score,
      recommendation: evaluation.ai_analysis.recommendation,
    };
  } catch (err) {
    return { url, status: 'error', error: String(err) };
  }
}

async function runBatch(urls: string[], concurrency: number, save: boolean, profilePath?: string) {
  console.log(chalk.bold(`\n🚀 GigOps Batch Evaluator\n`));
  console.log(`Processing ${urls.length} URLs with concurrency ${concurrency}\n`);

  const profile = loadProfile(profilePath);
  const tracker = save ? new PipelineTracker() : null;
  const results: BatchResult[] = [];

  // Process in chunks for concurrency control
  for (let i = 0; i < urls.length; i += concurrency) {
    const chunk = urls.slice(i, i + concurrency);
    const spinner = ora(`Evaluating ${i + 1}–${Math.min(i + concurrency, urls.length)} of ${urls.length}...`).start();

    const chunkResults = await Promise.allSettled(
      chunk.map(url => evaluateUrl(url, profile))
    );

    spinner.stop();

    for (const result of chunkResults) {
      if (result.status === 'fulfilled') {
        const r = result.value;
        results.push(r);
        if (r.status === 'success') {
          const gradeColors: Record<string, (s: string) => string> = {
            A: chalk.green, B: chalk.cyan, C: chalk.yellow, D: chalk.red, F: chalk.red
          };
          const colorFn = gradeColors[r.grade!] ?? chalk.white;
          console.log(`  ${colorFn(`[${r.grade}]`)} ${r.score}/5  ${r.recommendation?.padEnd(10)}  ${chalk.dim(r.url.substring(0, 70))}`);
        } else {
          console.log(`  ${chalk.red('[ERR]')}            ${chalk.dim(r.url.substring(0, 50))} — ${r.error?.substring(0, 50)}`);
        }
      } else {
        console.log(`  ${chalk.red('[FAIL]')} ${result.reason}`);
      }
    }

    // Delay between chunks to avoid rate limits
    if (i + concurrency < urls.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Summary
  const successes = results.filter(r => r.status === 'success');
  const topPicks = successes.filter(r => r.recommendation === 'apply').sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  console.log(chalk.bold(`\n📊 Batch Summary`));
  console.log(`  Processed: ${results.length}`);
  console.log(`  Success: ${chalk.green(successes.length)}`);
  console.log(`  Errors: ${chalk.red(results.length - successes.length)}`);
  console.log(`  Recommended: ${chalk.cyan(topPicks.length)}`);

  if (topPicks.length > 0) {
    console.log(chalk.bold('\n🎯 Top Picks (apply these):'));
    for (const pick of topPicks.slice(0, 5)) {
      console.log(`  ${chalk.green(`[${pick.grade}]`)} ${pick.score}/5  ${pick.url}`);
    }
  }

  // Export results
  const outputPath = './pipeline/batch-results.json';
  fs.writeFileSync(outputPath, JSON.stringify({ results, timestamp: new Date().toISOString() }, null, 2));
  console.log(chalk.dim(`\nResults saved to ${outputPath}`));

  await closeBrowser();
}

const program = new Command();
program
  .option('-f, --file <path>', 'File with URLs (one per line)')
  .option('-u, --urls <urls>', 'Comma-separated URLs')
  .option('-c, --concurrency <n>', 'Parallel evaluations', '3')
  .option('-s, --save', 'Save results to pipeline')
  .option('-p, --profile <path>', 'Path to profile YAML')
  .parse(process.argv);

const opts = program.opts();

let urls: string[] = [];

if (opts.file) {
  const filePath = path.resolve(opts.file);
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`File not found: ${filePath}`));
    process.exit(1);
  }
  urls = fs.readFileSync(filePath, 'utf-8').split('\n').map(u => u.trim()).filter(Boolean);
} else if (opts.urls) {
  urls = opts.urls.split(',').map((u: string) => u.trim()).filter(Boolean);
} else {
  console.error(chalk.red('Provide URLs with --file or --urls'));
  process.exit(1);
}

runBatch(urls, parseInt(opts.concurrency), opts.save, opts.profile).catch(err => {
  console.error(chalk.red(`Batch failed: ${err}`));
  process.exit(1);
});
