#!/usr/bin/env node
import { Command } from 'commander';
import { benchmarkCommand } from './commands/benchmark.js';
import { configCommand } from './commands/config.js';

const program = new Command();

program
  .name('gigops')
  .description('Freelancer gig operations toolkit')
  .version('0.1.0');

program.addCommand(benchmarkCommand());
program.addCommand(configCommand());

program.parse();
