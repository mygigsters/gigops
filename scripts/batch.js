#!/usr/bin/env ts-node
"use strict";
/**
 * GigOps Batch Evaluator
 * Evaluates multiple gig URLs in parallel with concurrency control.
 * Usage: ts-node scripts/batch.ts [--file urls.txt] [--concurrency 3] [--save]
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const config_1 = require("../src/utils/config");
const browser_1 = require("../src/utils/browser");
const evaluator_1 = require("../src/evaluator/evaluator");
const tracker_1 = require("../src/pipeline/tracker");
const upwork_1 = require("../src/scrapers/upwork");
const airtasker_1 = require("../src/scrapers/airtasker");
const freelancer_1 = require("../src/scrapers/freelancer");
async function evaluateUrl(url, profile) {
    try {
        const platform = (0, config_1.detectPlatform)(url);
        const ScraperMap = {
            upwork: upwork_1.UpworkScraper,
            airtasker: airtasker_1.AirtaskerScraper,
            freelancer: freelancer_1.FreelancerScraper,
        };
        const ScraperClass = ScraperMap[platform] ?? upwork_1.UpworkScraper;
        const scraper = new ScraperClass();
        const listing = await scraper.scrapeListingUrl(url);
        const evaluation = await (0, evaluator_1.evaluateGig)(listing, profile);
        return {
            url,
            status: 'success',
            grade: evaluation.ai_analysis.grade,
            score: evaluation.ai_analysis.score,
            recommendation: evaluation.ai_analysis.recommendation,
        };
    }
    catch (err) {
        return { url, status: 'error', error: String(err) };
    }
}
async function runBatch(urls, concurrency, save, profilePath) {
    console.log(chalk_1.default.bold(`\n🚀 GigOps Batch Evaluator\n`));
    console.log(`Processing ${urls.length} URLs with concurrency ${concurrency}\n`);
    const profile = (0, config_1.loadProfile)(profilePath);
    const tracker = save ? new tracker_1.PipelineTracker() : null;
    const results = [];
    // Process in chunks for concurrency control
    for (let i = 0; i < urls.length; i += concurrency) {
        const chunk = urls.slice(i, i + concurrency);
        const spinner = (0, ora_1.default)(`Evaluating ${i + 1}–${Math.min(i + concurrency, urls.length)} of ${urls.length}...`).start();
        const chunkResults = await Promise.allSettled(chunk.map(url => evaluateUrl(url, profile)));
        spinner.stop();
        for (const result of chunkResults) {
            if (result.status === 'fulfilled') {
                const r = result.value;
                results.push(r);
                if (r.status === 'success') {
                    const gradeColors = {
                        A: chalk_1.default.green, B: chalk_1.default.cyan, C: chalk_1.default.yellow, D: chalk_1.default.red, F: chalk_1.default.red
                    };
                    const colorFn = gradeColors[r.grade] ?? chalk_1.default.white;
                    console.log(`  ${colorFn(`[${r.grade}]`)} ${r.score}/5  ${r.recommendation?.padEnd(10)}  ${chalk_1.default.dim(r.url.substring(0, 70))}`);
                }
                else {
                    console.log(`  ${chalk_1.default.red('[ERR]')}            ${chalk_1.default.dim(r.url.substring(0, 50))} — ${r.error?.substring(0, 50)}`);
                }
            }
            else {
                console.log(`  ${chalk_1.default.red('[FAIL]')} ${result.reason}`);
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
    console.log(chalk_1.default.bold(`\n📊 Batch Summary`));
    console.log(`  Processed: ${results.length}`);
    console.log(`  Success: ${chalk_1.default.green(successes.length)}`);
    console.log(`  Errors: ${chalk_1.default.red(results.length - successes.length)}`);
    console.log(`  Recommended: ${chalk_1.default.cyan(topPicks.length)}`);
    if (topPicks.length > 0) {
        console.log(chalk_1.default.bold('\n🎯 Top Picks (apply these):'));
        for (const pick of topPicks.slice(0, 5)) {
            console.log(`  ${chalk_1.default.green(`[${pick.grade}]`)} ${pick.score}/5  ${pick.url}`);
        }
    }
    // Export results
    const outputPath = './pipeline/batch-results.json';
    fs_1.default.writeFileSync(outputPath, JSON.stringify({ results, timestamp: new Date().toISOString() }, null, 2));
    console.log(chalk_1.default.dim(`\nResults saved to ${outputPath}`));
    await (0, browser_1.closeBrowser)();
}
const program = new commander_1.Command();
program
    .option('-f, --file <path>', 'File with URLs (one per line)')
    .option('-u, --urls <urls>', 'Comma-separated URLs')
    .option('-c, --concurrency <n>', 'Parallel evaluations', '3')
    .option('-s, --save', 'Save results to pipeline')
    .option('-p, --profile <path>', 'Path to profile YAML')
    .parse(process.argv);
const opts = program.opts();
let urls = [];
if (opts.file) {
    const filePath = path_1.default.resolve(opts.file);
    if (!fs_1.default.existsSync(filePath)) {
        console.error(chalk_1.default.red(`File not found: ${filePath}`));
        process.exit(1);
    }
    urls = fs_1.default.readFileSync(filePath, 'utf-8').split('\n').map(u => u.trim()).filter(Boolean);
}
else if (opts.urls) {
    urls = opts.urls.split(',').map((u) => u.trim()).filter(Boolean);
}
else {
    console.error(chalk_1.default.red('Provide URLs with --file or --urls'));
    process.exit(1);
}
runBatch(urls, parseInt(opts.concurrency), opts.save, opts.profile).catch(err => {
    console.error(chalk_1.default.red(`Batch failed: ${err}`));
    process.exit(1);
});
//# sourceMappingURL=batch.js.map