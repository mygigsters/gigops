#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { loadProfile, detectPlatform } from './utils/config';
import { closeBrowser } from './utils/browser';
import { UpworkScraper } from './scrapers/upwork';
import { AirtaskerScraper } from './scrapers/airtasker';
import { FreelancerScraper } from './scrapers/freelancer';
import { evaluateGig } from './evaluator/evaluator';
import { generateProposal } from './proposal/generator';
import { PipelineTracker } from './pipeline/tracker';
import { checkIntegrity, deduplicatePipeline } from './pipeline/integrity';
import { checkMarketRate } from './rate/checker';
import { analyzeClient } from './client/intel';
import { SearchConfig } from './scrapers/base';

// Banner
const BANNER = chalk.cyan(
  '\n  GigOps — AI-Powered Gig Search Command Center\n' +
  chalk.dim('  by MyGigsters · mygigsters.com.au\n')
);

function getScraper(platform: string) {
  switch (platform) {
    case 'upwork': return new UpworkScraper();
    case 'airtasker': return new AirtaskerScraper();
    case 'freelancer': return new FreelancerScraper();
    default: return new UpworkScraper(); // generic fallback
  }
}

function printEvaluation(result: Awaited<ReturnType<typeof evaluateGig>>) {
  const { ai_analysis, heuristic } = result;
  const gradeColor = {
    A: chalk.green, B: chalk.cyan, C: chalk.yellow, D: chalk.red, F: chalk.red
  }[ai_analysis.grade] ?? chalk.white;

  console.log(boxen(
    gradeColor(`Grade: ${ai_analysis.grade}  Score: ${ai_analysis.score}/5`) + '\n\n' +
    chalk.bold('Summary:') + '\n' + ai_analysis.summary + '\n\n' +
    (ai_analysis.pros.length > 0 ? chalk.green('✓ Pros:\n') + ai_analysis.pros.map(p => `  • ${p}`).join('\n') + '\n\n' : '') +
    (ai_analysis.cons.length > 0 ? chalk.yellow('✗ Cons:\n') + ai_analysis.cons.map(c => `  • ${c}`).join('\n') + '\n\n' : '') +
    (ai_analysis.red_flags.length > 0 ? chalk.red('⚠ Red Flags:\n') + ai_analysis.red_flags.map(f => `  • ${f}`).join('\n') + '\n\n' : '') +
    chalk.bold('Recommendation: ') + (ai_analysis.recommendation === 'apply' ? chalk.green('✅ Apply') : ai_analysis.recommendation === 'consider' ? chalk.yellow('⚠️ Consider') : chalk.red('❌ Skip')),
    { padding: 1, borderStyle: 'round', title: result.listing.title.substring(0, 60) }
  ));

  console.log(chalk.dim('\nDimension breakdown:'));
  for (const d of heuristic.dimensions) {
    const bar = '█'.repeat(Math.round(d.raw)) + '░'.repeat(5 - Math.round(d.raw));
    console.log(`  ${d.name.padEnd(18)} ${bar} ${d.raw.toFixed(1)}  ${chalk.dim(d.rationale)}`);
  }
}

const program = new Command();

program
  .name('gigops')
  .description('AI-powered gig search command center for freelancers')
  .version('0.1.0');

// evaluate
program
  .command('evaluate <url>')
  .alias('eval')
  .description('Evaluate a gig listing against your profile')
  .option('-p, --profile <path>', 'Path to profile YAML')
  .option('--save', 'Save result to pipeline')
  .action(async (url: string, opts) => {
    console.log(BANNER);
    const spinner = ora('Loading profile...').start();
    try {
      const profile = loadProfile(opts.profile);
      const platform = detectPlatform(url);
      spinner.text = `Scraping ${platform} listing...`;
      const scraper = getScraper(platform);
      const listing = await scraper.scrapeListingUrl(url);
      spinner.text = 'Evaluating with AI...';
      const result = await evaluateGig(listing, profile);
      spinner.succeed('Evaluation complete');
      printEvaluation(result);

      if (opts.save) {
        const tracker = new PipelineTracker();
        tracker.addFromListing(listing, result);
        console.log(chalk.dim(`\nSaved to pipeline: ${listing.id}`));
      }
    } catch (err) {
      spinner.fail(`Error: ${err}`);
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

// propose
program
  .command('propose <url>')
  .description('Generate a tailored proposal for a gig')
  .option('-p, --profile <path>', 'Path to profile YAML')
  .option('-t, --tone <tone>', 'Tone: professional|conversational|concise', 'conversational')
  .action(async (url: string, opts) => {
    console.log(BANNER);
    const spinner = ora('Loading profile...').start();
    try {
      const profile = loadProfile(opts.profile);
      const platform = detectPlatform(url);
      spinner.text = `Scraping ${platform} listing...`;
      const scraper = getScraper(platform);
      const listing = await scraper.scrapeListingUrl(url);
      spinner.text = 'Generating proposal...';
      const result = await generateProposal(listing, profile, undefined, opts.tone);
      spinner.succeed('Proposal ready');

      console.log(boxen(
        chalk.bold('Subject: ') + result.subject_line + '\n\n' + result.proposal,
        { padding: 1, borderStyle: 'round', title: '📝 Your Proposal' }
      ));
      console.log(chalk.dim(`\nWord count: ${result.word_count}`));
      if (result.key_points.length > 0) {
        console.log(chalk.bold('\nKey points used:'));
        result.key_points.forEach(p => console.log(`  • ${p}`));
      }
    } catch (err) {
      spinner.fail(`Error: ${err}`);
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

// scan
program
  .command('scan')
  .description('Scan platforms for matching gigs')
  .option('-p, --platform <platform>', 'Platform: upwork|airtasker|freelancer', 'upwork')
  .option('-k, --keywords <keywords>', 'Search keywords (comma-separated)')
  .option('-l, --location <location>', 'Location filter')
  .option('-n, --limit <n>', 'Max results', '10')
  .option('--evaluate', 'Auto-evaluate each result')
  .option('--save', 'Save results to pipeline')
  .option('--profile <path>', 'Path to profile YAML')
  .action(async (opts) => {
    console.log(BANNER);
    const spinner = ora(`Scanning ${opts.platform}...`).start();
    try {
      const profile = loadProfile(opts.profile);
      const keywords = opts.keywords ? opts.keywords.split(',').map((k: string) => k.trim()) : profile.skills.primary;
      const searchConfig: SearchConfig = {
        keywords,
        location: opts.location,
        limit: parseInt(opts.limit),
      };

      const scraper = getScraper(opts.platform);
      const result = await scraper.searchListings(searchConfig);
      spinner.succeed(`Found ${result.listings.length} listings`);

      if (result.errors.length > 0) {
        console.log(chalk.yellow(`\nWarnings: ${result.errors.join(', ')}`));
      }

      for (const listing of result.listings) {
        console.log(chalk.bold(`\n${listing.title}`));
        console.log(chalk.dim(`  ${listing.url}`));
        console.log(`  Budget: ${listing.budget.raw || 'Not specified'}`);

        if (opts.evaluate || opts.save) {
          const evalSpinner = ora('  Evaluating...').start();
          try {
            const evaluation = await evaluateGig(listing, profile);
            const grade = evaluation.ai_analysis.grade;
            const gradeStr = { A: chalk.green(grade), B: chalk.cyan(grade), C: chalk.yellow(grade), D: chalk.red(grade), F: chalk.red(grade) }[grade] ?? grade;
            evalSpinner.succeed(`  Grade: ${gradeStr} (${evaluation.ai_analysis.score}/5) — ${evaluation.ai_analysis.recommendation}`);

            if (opts.save) {
              const tracker = new PipelineTracker();
              tracker.addFromListing(listing, evaluation);
            }
          } catch {
            evalSpinner.fail('  Evaluation failed');
          }
        }
      }

      if (!opts.evaluate && !opts.save) {
        console.log(chalk.dim(`\nTip: Add --evaluate to AI-score each result, --save to track them`));
      }
    } catch (err) {
      spinner.fail(`Error: ${err}`);
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

// rate-check
program
  .command('rate-check <skill>')
  .description('Check market rates for a skill')
  .option('-l, --location <location>', 'Location', 'Australia')
  .option('-e, --experience <years>', 'Years of experience', '3')
  .option('-p, --platform <platform>', 'Platform context')
  .option('--profile <path>', 'Path to profile YAML')
  .action(async (skill: string, opts) => {
    console.log(BANNER);
    const spinner = ora('Analysing market rates...').start();
    try {
      let profile;
      try { profile = loadProfile(opts.profile); } catch { /* optional */ }

      const result = await checkMarketRate({
        skill,
        location: opts.location,
        experience_years: parseInt(opts.experience),
        platform: opts.platform,
      }, profile);

      spinner.succeed('Rate analysis complete');
      console.log(boxen(
        chalk.bold(`${skill} — ${result.location}\n\n`) +
        `Recommended range: ${chalk.green(`${result.recommended_range.currency} ${result.recommended_range.min}–${result.recommended_range.max}/hr`)}\n` +
        `Optimal rate: ${chalk.cyan(`${result.recommended_range.currency} ${result.recommended_range.optimal}/hr`)}\n\n` +
        chalk.bold('Market Context:\n') + result.market_context + '\n\n' +
        chalk.bold('Positioning Advice:\n') + result.positioning_advice +
        (result.red_flags.length > 0 ? '\n\n' + chalk.red('⚠ Watch out:\n') + result.red_flags.map(f => `  • ${f}`).join('\n') : ''),
        { padding: 1, borderStyle: 'round', title: '💰 Rate Intelligence' }
      ));
    } catch (err) {
      spinner.fail(`Error: ${err}`);
      process.exit(1);
    }
  });

// client-intel
program
  .command('client-intel <url>')
  .alias('client')
  .description('Analyse a client profile for red flags and risk')
  .action(async (url: string) => {
    console.log(BANNER);
    const spinner = ora('Analysing client...').start();
    try {
      const result = await analyzeClient(url);
      spinner.succeed('Client analysis complete');

      const gradeColor = { A: chalk.green, B: chalk.cyan, C: chalk.yellow, D: chalk.red, F: chalk.red }[result.quality_grade] ?? chalk.white;

      console.log(boxen(
        gradeColor(`Quality Grade: ${result.quality_grade}  Risk Score: ${result.risk_score}/10\n\n`) +
        chalk.bold('Summary:\n') + result.summary + '\n\n' +
        (result.green_flags.length > 0 ? chalk.green('✓ Green Flags:\n') + result.green_flags.map(f => `  • ${f}`).join('\n') + '\n\n' : '') +
        (result.red_flags.length > 0 ? chalk.red('⚠ Red Flags:\n') + result.red_flags.map(f => `  • ${f}`).join('\n') + '\n\n' : '') +
        chalk.bold('Recommendation:\n') + result.recommendation,
        { padding: 1, borderStyle: 'round', title: `🔍 Client Intel: ${result.profile.name || url}` }
      ));
    } catch (err) {
      spinner.fail(`Error: ${err}`);
      process.exit(1);
    } finally {
      await closeBrowser();
    }
  });

// pipeline
const pipeline = program.command('pipeline').description('Manage your gig pipeline');

pipeline
  .command('list')
  .option('--status <status>', 'Filter by status')
  .description('List pipeline entries')
  .action((opts) => {
    const tracker = new PipelineTracker();
    let entries = tracker.readAll();
    if (opts.status) entries = entries.filter(e => e.status === opts.status);

    if (entries.length === 0) {
      console.log(chalk.dim('No pipeline entries found.'));
      return;
    }

    for (const e of entries) {
      const statusColors: Record<string, typeof chalk.green> = { won: chalk.green, applied: chalk.cyan, interviewing: chalk.yellow, skipped: chalk.dim, lost: chalk.red, discovered: chalk.blue, evaluated: chalk.magenta, proposal_drafted: chalk.cyan, withdrawn: chalk.gray };
      const statusColor = statusColors[e.status] ?? chalk.white;
      console.log(`${chalk.bold(e.title.substring(0, 50).padEnd(50))} ${statusColor(e.status.padEnd(16))} ${e.grade ? `Grade: ${e.grade}` : ''}`);
      console.log(chalk.dim(`  ${e.url}`));
    }

    const stats = tracker.getStats();
    console.log(chalk.dim(`\nTotal: ${stats.total} | Applied: ${stats.applied} | Won: ${stats.won} | Win Rate: ${stats.win_rate}%`));
  });

pipeline
  .command('update <id> <status>')
  .description('Update the status of a pipeline entry')
  .option('-n, --notes <notes>', 'Add notes')
  .action((id, status, opts) => {
    const tracker = new PipelineTracker();
    const entry = tracker.updateStatus(id, status, opts.notes);
    if (entry) {
      console.log(chalk.green(`Updated ${entry.title} → ${status}`));
    } else {
      console.log(chalk.red(`Entry not found: ${id}`));
    }
  });

pipeline
  .command('check')
  .description('Run integrity checks and deduplication')
  .option('--fix', 'Auto-fix issues')
  .action((opts) => {
    const tracker = new PipelineTracker();
    const report = checkIntegrity(tracker);

    console.log(chalk.bold('\nPipeline Integrity Report'));
    console.log(`Total entries: ${report.total}`);
    console.log(`Duplicates: ${report.duplicates.length}`);
    console.log(`Invalid entries: ${report.invalid.length}`);
    console.log(`Warnings: ${report.warnings.length}`);

    if (opts.fix && report.duplicates.length > 0) {
      const removed = deduplicatePipeline(tracker);
      console.log(chalk.green(`\nFixed: removed ${removed} duplicates`));
    }
  });

pipeline
  .command('stats')
  .description('Show pipeline statistics')
  .action(() => {
    const tracker = new PipelineTracker();
    const stats = tracker.getStats();
    console.log(boxen(
      Object.entries(stats).map(([k, v]) => `${k.padEnd(15)}: ${chalk.cyan(v)}`).join('\n'),
      { padding: 1, borderStyle: 'round', title: '📊 Pipeline Stats' }
    ));
  });

program.parse(process.argv);
