import { Command } from 'commander';
import { input, select } from '@inquirer/prompts';
import { addEntry, loadAll, exportAnonymous } from '../benchmarks/store';
import { personalStats, marketData } from '../benchmarks/aggregator';
import { writeFileSync } from 'node:fs';
import type { GigOutcome, GigDurationEstimate } from '../benchmarks/schema';

export function benchmarkCommand(): Command {
  const cmd = new Command('benchmark')
    .description('Rate benchmark tracking and market intelligence');

  cmd
    .command('add')
    .description('Log a gig outcome')
    .action(async () => {
      const platform = await input({ message: 'Platform (e.g. Upwork, Toptal, direct):' });
      const skill_category = await input({ message: 'Skill category (e.g. frontend, devops):' });
      const rate_type = await select({
        message: 'Rate type:',
        choices: [
          { value: 'hourly', name: 'Hourly' },
          { value: 'fixed', name: 'Fixed/Project' },
        ],
      }) as 'hourly' | 'fixed';
      const rate_bid = parseFloat(await input({ message: 'Rate you bid/proposed:' }));
      const outcome = await select({
        message: 'Outcome:',
        choices: [
          { value: 'won', name: 'Won' },
          { value: 'lost', name: 'Lost' },
          { value: 'withdrawn', name: 'Withdrawn' },
        ],
      }) as GigOutcome;

      let rate_final: number | null = null;
      if (outcome === 'won') {
        rate_final = parseFloat(await input({ message: 'Final agreed rate:' }));
      }

      const currency = await input({ message: 'Currency (e.g. USD, AUD):', default: 'USD' });
      const location_country = await input({ message: 'Your country code (e.g. AU, US):' });
      const gig_duration_estimate = await select({
        message: 'Estimated duration:',
        choices: [
          { value: 'hours', name: '< 1 day' },
          { value: 'days', name: '1-5 days' },
          { value: 'weeks', name: '1-4 weeks' },
          { value: 'months', name: '1-6 months' },
          { value: 'long-term', name: '6+ months' },
        ],
      }) as GigDurationEstimate;

      const entry = addEntry({
        platform,
        skill_category,
        rate_type,
        rate_bid,
        rate_final,
        currency,
        location_country,
        outcome,
        gig_duration_estimate,
      });

      console.log(`\n✅ Benchmark logged: ${entry.id}`);
      console.log(`   ${platform} / ${skill_category} / ${outcome} @ ${currency} ${rate_bid}`);
    });

  cmd
    .command('stats')
    .description('Show your personal benchmark stats')
    .action(() => {
      const entries = loadAll();
      if (entries.length === 0) {
        console.log('No benchmark data yet. Run `gigops benchmark add` to start.');
        return;
      }

      const stats = personalStats(entries);
      console.log('\n📊 Your Benchmark Stats');
      console.log('─'.repeat(40));
      console.log(`Total gigs:    ${stats.totalGigs}`);
      console.log(`Won:           ${stats.wins} (${(stats.winRate * 100).toFixed(0)}%)`);
      console.log(`Lost:          ${stats.losses}`);
      console.log(`Withdrawn:     ${stats.withdrawn}`);
      console.log(`Avg bid rate:  $${stats.avgBidRate.toFixed(2)}`);
      if (stats.avgFinalRate != null) {
        console.log(`Avg final rate: $${stats.avgFinalRate.toFixed(2)}`);
      }

      if (Object.keys(stats.ratesBySkill).length > 0) {
        console.log('\nBy Skill:');
        for (const [skill, rs] of Object.entries(stats.ratesBySkill)) {
          console.log(`  ${skill}: median $${rs.median.toFixed(0)} (n=${rs.count}, range $${rs.min}-$${rs.max})`);
        }
      }
    });

  cmd
    .command('market')
    .description('Show aggregated market data')
    .action(() => {
      const entries = loadAll();
      if (entries.length === 0) {
        console.log('No benchmark data yet. Run `gigops benchmark add` to start.');
        return;
      }

      const data = marketData(entries);
      console.log('\n🌍 Market Data');
      console.log('─'.repeat(40));

      console.log('\nRates by Skill/Platform:');
      for (const [key, rs] of Object.entries(data.bySkillPlatform)) {
        console.log(`  ${key}: median $${rs.median.toFixed(0)} (p25=$${rs.p25.toFixed(0)}, p75=$${rs.p75.toFixed(0)}, n=${rs.count})`);
      }

      if (data.winRateByPercentile.some(b => b.totalBids > 0)) {
        console.log('\nWin Rate by Rate Percentile:');
        for (const b of data.winRateByPercentile) {
          if (b.totalBids > 0) {
            console.log(`  ${b.percentile}th: ${(b.winRate * 100).toFixed(0)}% (${b.wins}/${b.totalBids})`);
          }
        }
      }

      if (data.trend.length > 1) {
        console.log('\nMonthly Trend:');
        for (const t of data.trend) {
          console.log(`  ${t.month}: median $${t.medianRate.toFixed(0)}, win ${(t.winRate * 100).toFixed(0)}% (n=${t.count})`);
        }
      }
    });

  cmd
    .command('export')
    .description('Export anonymised benchmark data')
    .option('--anonymous', 'Strip PII and round rates')
    .option('-o, --output <path>', 'Output file path')
    .action((opts) => {
      const data = exportAnonymous();
      if (!data) {
        console.log('No benchmark data to export.');
        return;
      }

      if (opts.output) {
        writeFileSync(opts.output, data + '\n');
        const count = data.split('\n').length;
        console.log(`✅ Exported ${count} anonymised entries to ${opts.output}`);
      } else {
        console.log(data);
      }
    });

  return cmd;
}
