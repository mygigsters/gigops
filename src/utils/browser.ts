import { Browser, BrowserContext, Page, chromium } from 'playwright';

let _browser: Browser | null = null;
let _context: BrowserContext | null = null;

export interface ScrapeOptions {
  headless?: boolean;
  slowMo?: number;
  timeout?: number;
  userAgent?: string;
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

export async function getBrowser(opts: ScrapeOptions = {}): Promise<Browser> {
  if (_browser) return _browser;

  _browser = await chromium.launch({
    headless: opts.headless ?? process.env.PLAYWRIGHT_HEADLESS !== 'false',
    slowMo: opts.slowMo ?? parseInt(process.env.PLAYWRIGHT_SLOW_MO || '0'),
  });

  return _browser;
}

export async function getContext(opts: ScrapeOptions = {}): Promise<BrowserContext> {
  if (_context) return _context;

  const browser = await getBrowser(opts);
  _context = await browser.newContext({
    userAgent: opts.userAgent ?? DEFAULT_USER_AGENT,
    viewport: { width: 1280, height: 800 },
    locale: 'en-AU',
    timezoneId: 'Australia/Melbourne',
  });

  return _context;
}

export async function newPage(opts: ScrapeOptions = {}): Promise<Page> {
  const context = await getContext(opts);
  const page = await context.newPage();
  page.setDefaultTimeout(opts.timeout ?? 30000);
  return page;
}

export async function scrapePageContent(url: string, opts: ScrapeOptions = {}): Promise<string> {
  const page = await newPage(opts);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    return await page.content();
  } finally {
    await page.close();
  }
}

export async function scrapeText(url: string, selector: string, opts: ScrapeOptions = {}): Promise<string> {
  const page = await newPage(opts);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(selector, { timeout: 10000 }).catch(() => null);
    return await page.locator(selector).first().innerText().catch(() => '');
  } finally {
    await page.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (_context) {
    await _context.close();
    _context = null;
  }
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
