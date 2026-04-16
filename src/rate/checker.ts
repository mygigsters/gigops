import Anthropic from '@anthropic-ai/sdk';
import { UserProfile, getEnv } from '../utils/config.js';

export interface RateCheckInput {
  skill: string;
  location: string;
  experience_years: number;
  platform?: string;
}

export interface RateCheckResult {
  skill: string;
  location: string;
  recommended_range: {
    min: number;
    max: number;
    optimal: number;
    currency: string;
  };
  market_context: string;
  positioning_advice: string;
  red_flags: string[];
  data_sources: string[];
  checked_at: string;
}

export async function checkMarketRate(
  input: RateCheckInput,
  profile?: UserProfile
): Promise<RateCheckResult> {
  const client = new Anthropic({ apiKey: getEnv('ANTHROPIC_API_KEY') });

  const profileContext = profile
    ? `
## Freelancer Profile
Current target rate: ${profile.hourly_rate.currency} ${profile.hourly_rate.target}/hr
Experience: ${profile.experience_years} years
Location: ${profile.location}
Primary Skills: ${profile.skills.primary.join(', ')}
`
    : '';

  const prompt = `You are GigOps, a freelance market rate intelligence system.

${profileContext}

## Rate Check Request
Skill/Role: ${input.skill}
Location: ${input.location}
Experience Level: ${input.experience_years} years
Platform: ${input.platform || 'General freelance market'}

Provide a realistic market rate analysis for this skill/location combination in 2024-2025.
Base this on your knowledge of freelance market rates, typical platform rates, and location-based adjustments.

Respond in this exact JSON format:
{
  "recommended_range": {
    "min": <number>,
    "max": <number>,
    "optimal": <number>,
    "currency": "AUD|USD|GBP"
  },
  "market_context": "<2-3 sentences about the current market for this skill>",
  "positioning_advice": "<specific advice for positioning at the optimal rate>",
  "red_flags": ["<rate below X might signal poor quality clients>"],
  "data_sources": ["Platform averages", "Industry reports", "Regional adjustments"]
}

Be specific and realistic. If the location is Australian, use AUD. UK = GBP. Default to USD.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        skill: input.skill,
        location: input.location,
        ...parsed,
        checked_at: new Date().toISOString(),
      };
    }
  } catch {
    // fall through
  }

  return {
    skill: input.skill,
    location: input.location,
    recommended_range: { min: 0, max: 0, optimal: 0, currency: 'AUD' },
    market_context: text,
    positioning_advice: 'Unable to parse structured response',
    red_flags: [],
    data_sources: [],
    checked_at: new Date().toISOString(),
  };
}
