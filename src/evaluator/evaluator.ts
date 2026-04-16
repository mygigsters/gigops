import Anthropic from '@anthropic-ai/sdk';
import { GigListing } from '../scrapers/base';
import { UserProfile, getEnv } from '../utils/config';
import { heuristicScore, EvaluationScore } from './scoring';

export interface EvaluationResult {
  listing: GigListing;
  heuristic: EvaluationScore;
  ai_analysis: {
    grade: string;
    score: number;
    summary: string;
    pros: string[];
    cons: string[];
    red_flags: string[];
    recommendation: string;
    next_steps: string[];
  };
  evaluated_at: string;
}

export async function evaluateGig(
  listing: GigListing,
  profile: UserProfile
): Promise<EvaluationResult> {
  const heuristic = heuristicScore(listing, profile);

  const client = new Anthropic({ apiKey: getEnv('ANTHROPIC_API_KEY') });

  const prompt = buildEvaluationPrompt(listing, profile, heuristic);

  const response = await client.messages.create({
    model: process.env.GIGOPS_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const ai_analysis = parseAIEvaluation(text, heuristic);

  return {
    listing,
    heuristic,
    ai_analysis,
    evaluated_at: new Date().toISOString(),
  };
}

function buildEvaluationPrompt(
  listing: GigListing,
  profile: UserProfile,
  heuristic: EvaluationScore
): string {
  return `You are GigOps, an AI advisor helping freelancers evaluate gig opportunities.

## Freelancer Profile
Name: ${profile.name}
Title: ${profile.title}
Experience: ${profile.experience_years} years
Primary Skills: ${profile.skills.primary.join(', ')}
Secondary Skills: ${profile.skills.secondary.join(', ')}
Target Rate: ${profile.hourly_rate.currency} ${profile.hourly_rate.target}/hr (min: ${profile.hourly_rate.minimum}/hr)
Location: ${profile.location}
Preferences: ${profile.preferences.remote_only ? 'Remote only' : 'Open to on-site'}, min project value ${profile.hourly_rate.currency}${profile.preferences.min_project_value}
Avoid: ${profile.preferences.avoid.join(', ')}
Bio: ${profile.bio}
Key Proof Points:
${profile.proof_points.map((p) => `- ${p}`).join('\n')}

## Gig Listing
Platform: ${listing.platform}
Title: ${listing.title}
URL: ${listing.url}
Budget: ${listing.budget.raw}
Required Skills: ${listing.skills_required.join(', ') || 'Not specified'}
Posted: ${listing.posted_at || 'Unknown'}
Proposals: ${listing.proposals_count ?? 'Unknown'}
Client Rating: ${listing.client.rating ?? 'Unknown'}
Client Location: ${listing.client.location || 'Unknown'}

Description:
${listing.description.substring(0, 2000)}

## Pre-Score (Heuristic)
${heuristic.dimensions.map((d) => `- ${d.name}: ${d.raw.toFixed(1)}/5 — ${d.rationale}`).join('\n')}
Overall: ${heuristic.total}/5 (${heuristic.grade})

## Your Task
Evaluate this gig opportunity for the freelancer above. Provide a thorough, honest assessment.

Respond in this exact JSON format:
{
  "grade": "A|B|C|D|F",
  "score": <number 1-5>,
  "summary": "<1-2 sentence summary>",
  "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
  "cons": ["<con 1>", "<con 2>"],
  "red_flags": ["<flag 1>"] or [],
  "recommendation": "apply|consider|skip",
  "next_steps": ["<step 1>", "<step 2>"]
}

Be direct and honest. If this gig is a bad fit, say so clearly. Grade A = exceptional fit (definitely apply), F = waste of time.`;
}

function parseAIEvaluation(
  text: string,
  fallback: EvaluationScore
): EvaluationResult['ai_analysis'] {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fall through to defaults
  }

  return {
    grade: fallback.grade,
    score: fallback.total,
    summary: fallback.summary,
    pros: [],
    cons: [],
    red_flags: [],
    recommendation: fallback.recommendation,
    next_steps: fallback.recommendation === 'apply' ? ['Write a tailored proposal', 'Research the client'] : [],
  };
}
