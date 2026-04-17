import { getProvider } from '../providers/index.js';
import { GigListing } from '../scrapers/base';
import { UpworkScraper } from '../scrapers/upwork';
import { AirtaskerScraper } from '../scrapers/airtasker';
import { FreelancerScraper } from '../scrapers/freelancer';
import { detectPlatform } from '../utils/config';

export interface ClientIntelResult {
  client_url: string;
  platform: string;
  profile: GigListing['client'];
  risk_score: number;        // 0-10 (lower = riskier)
  quality_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  red_flags: string[];
  green_flags: string[];
  summary: string;
  recommendation: string;
  analyzed_at: string;
}

export async function analyzeClient(clientUrl: string): Promise<ClientIntelResult> {
  const platform = detectPlatform(clientUrl);

  let profile: GigListing['client'] = {};
  try {
    if (platform === 'upwork') {
      profile = await new UpworkScraper().scrapeClientProfile(clientUrl);
    } else if (platform === 'airtasker') {
      profile = await new AirtaskerScraper().scrapeClientProfile(clientUrl);
    } else if (platform === 'freelancer') {
      profile = await new FreelancerScraper().scrapeClientProfile(clientUrl);
    }
  } catch (err) {
    // Continue with empty profile, AI will note limited data
  }

  const aiAnalysis = await aiAnalyzeClient(clientUrl, platform, profile);

  return {
    client_url: clientUrl,
    platform,
    profile,
    ...aiAnalysis,
    analyzed_at: new Date().toISOString(),
  };
}

async function aiAnalyzeClient(
  url: string,
  platform: string,
  profile: GigListing['client']
): Promise<Omit<ClientIntelResult, 'client_url' | 'platform' | 'profile' | 'analyzed_at'>> {
  const provider = getProvider();

  const prompt = `You are GigOps, analyzing a client profile for a freelancer.

## Client Data
Platform: ${platform}
URL: ${url}
Name: ${profile.name || 'Unknown'}
Rating: ${profile.rating ?? 'Not available'}
Reviews: ${profile.reviews ?? 'Not available'}
Location: ${profile.location || 'Not specified'}
Member Since: ${profile.member_since || 'Unknown'}
Total Spent: ${profile.total_spent || 'Unknown'}
Payment Verified: ${profile.payment_verified ?? 'Unknown'}

Analyze this client for a freelancer considering working with them. Be direct about risks.

Common red flags to check:
- Low or no rating with many reviews
- No payment verification
- Pattern of short projects (scope creep / not seeing projects through)
- Very new account with urgent high-budget projects
- Vague or suspicious total spent vs review count

Respond in this exact JSON format:
{
  "risk_score": <0-10, where 10 is safest>,
  "quality_grade": "A|B|C|D|F",
  "red_flags": ["<flag 1>"] or [],
  "green_flags": ["<green signal 1>"] or [],
  "summary": "<2-3 sentence honest assessment>",
  "recommendation": "<specific advice for the freelancer>"
}`;

  const response = await provider.complete(prompt, { maxTokens: 800 });

  const text = response.text;

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fall through
  }

  return {
    risk_score: 5,
    quality_grade: 'C',
    red_flags: ['Unable to fully analyze client profile'],
    green_flags: [],
    summary: text.substring(0, 300),
    recommendation: 'Proceed with caution, request more information before committing',
  };
}
