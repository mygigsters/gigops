/**
 * Pipeline integration — prompt users to contribute benchmark data
 * when they mark a gig as won/lost in the pipeline tracker.
 *
 * Usage: call `promptBenchmarkContribution()` after a pipeline status change.
 */

import { confirm } from '@inquirer/prompts';

export interface PipelineGigResult {
  platform: string;
  skill_category: string;
  rate_bid: number;
  rate_type: 'hourly' | 'fixed';
  currency: string;
  outcome: 'won' | 'lost';
}

/**
 * After a gig outcome is recorded in the pipeline, ask the user
 * if they'd like to contribute this data to their benchmark history.
 * Returns true if the user opted in.
 */
export async function promptBenchmarkContribution(gig: PipelineGigResult): Promise<boolean> {
  console.log('\n📊 Benchmark Data');
  console.log('Help build rate intelligence by logging this outcome to your benchmarks.');
  console.log('Data stays local — nothing leaves your machine unless you explicitly export.\n');

  const contribute = await confirm({
    message: 'Add this gig to your benchmark data?',
    default: true,
  });

  return contribute;
}
