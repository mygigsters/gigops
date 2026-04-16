import Anthropic from '@anthropic-ai/sdk';
import { GigListing } from '../scrapers/base.js';
import { UserProfile, getEnv } from '../utils/config.js';
import { EvaluationResult } from '../evaluator/evaluator.js';

export interface ProposalResult {
  listing: GigListing;
  proposal: string;
  subject_line: string;
  key_points: string[];
  word_count: number;
  generated_at: string;
}

export async function generateProposal(
  listing: GigListing,
  profile: UserProfile,
  evaluation?: EvaluationResult,
  tone: 'professional' | 'conversational' | 'concise' = 'conversational'
): Promise<ProposalResult> {
  const client = new Anthropic({ apiKey: getEnv('ANTHROPIC_API_KEY') });

  const prompt = buildProposalPrompt(listing, profile, evaluation, tone);

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return parseProposalResponse(text, listing);
}

function buildProposalPrompt(
  listing: GigListing,
  profile: UserProfile,
  evaluation: EvaluationResult | undefined,
  tone: string
): string {
  const evalContext = evaluation
    ? `\n## Previous Evaluation\nScore: ${evaluation.ai_analysis.score}/5 (${evaluation.ai_analysis.grade})\nKey pros: ${evaluation.ai_analysis.pros.join(', ')}\n`
    : '';

  return `You are GigOps, an expert freelance proposal writer.

## Freelancer Profile
Name: ${profile.name}
Title: ${profile.title}
Experience: ${profile.experience_years} years
Primary Skills: ${profile.skills.primary.join(', ')}
Target Rate: ${profile.hourly_rate.currency} ${profile.hourly_rate.target}/hr
Portfolio: ${profile.portfolio_url || 'Not provided'}
Bio: ${profile.bio}

Key Proof Points (use these where relevant):
${profile.proof_points.map((p) => `- ${p}`).join('\n')}

Career Story Excerpt:
${profile.career_story?.substring(0, 500) || ''}
${evalContext}
## Gig Listing
Platform: ${listing.platform}
Title: ${listing.title}
Budget: ${listing.budget.raw}
Skills Required: ${listing.skills_required.join(', ') || 'Not specified'}

Description:
${listing.description.substring(0, 2000)}

## Instructions
Write a ${tone} proposal for this gig. Rules:
1. Open with something specific about their project (not "I saw your job posting")
2. Show you understand their problem, not just the requirements
3. Reference 1-2 specific proof points that are directly relevant
4. Be concrete about how you'd approach this
5. Include a clear next step
6. Keep it under 300 words — clients read the first 100 words most carefully
7. Don't list skills as bullet points — weave them naturally into the narrative
8. Match the energy of the listing (technical listing = more technical; casual listing = more casual)

Respond in this JSON format:
{
  "subject_line": "<compelling subject line for the proposal>",
  "proposal": "<the full proposal text, ready to paste>",
  "key_points": ["<point 1>", "<point 2>", "<point 3>"]
}`;
}

function parseProposalResponse(text: string, listing: GigListing): ProposalResult {
  let proposal = '';
  let subject_line = `Proposal for: ${listing.title}`;
  let key_points: string[] = [];

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      proposal = parsed.proposal || text;
      subject_line = parsed.subject_line || subject_line;
      key_points = parsed.key_points || [];
    } else {
      proposal = text;
    }
  } catch {
    proposal = text;
  }

  return {
    listing,
    proposal,
    subject_line,
    key_points,
    word_count: proposal.split(/\s+/).length,
    generated_at: new Date().toISOString(),
  };
}
