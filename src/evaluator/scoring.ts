import { GigListing } from '../scrapers/base';
import { UserProfile } from '../utils/config';

export interface DimensionScore {
  name: string;
  weight: number;
  raw: number;      // 0-5
  weighted: number; // raw * weight
  rationale: string;
}

export interface EvaluationScore {
  dimensions: DimensionScore[];
  total: number;    // 0-5
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendation: 'apply' | 'skip' | 'consider';
  summary: string;
}

const DIMENSIONS = [
  { name: 'Skill Match',     weight: 0.25 },
  { name: 'Rate Fit',        weight: 0.20 },
  { name: 'Client Quality',  weight: 0.20 },
  { name: 'Effort/Scope',    weight: 0.15 },
  { name: 'Growth Value',    weight: 0.10 },
  { name: 'Win Probability', weight: 0.10 },
];

export function getGrade(score: number): EvaluationScore['grade'] {
  if (score >= 4.5) return 'A';
  if (score >= 3.5) return 'B';
  if (score >= 2.5) return 'C';
  if (score >= 1.5) return 'D';
  return 'F';
}

export function getRecommendation(score: number): EvaluationScore['recommendation'] {
  if (score >= 3.5) return 'apply';
  if (score >= 2.5) return 'consider';
  return 'skip';
}

/**
 * Scores a gig listing against the user profile using the 6 weighted dimensions.
 * This is a heuristic pre-score; the AI evaluator provides the definitive assessment.
 */
export function heuristicScore(listing: GigListing, profile: UserProfile): EvaluationScore {
  const dimensions: DimensionScore[] = [];

  // 1. Skill Match (25%)
  const allUserSkills = [
    ...profile.skills.primary.map((s) => s.toLowerCase()),
    ...profile.skills.secondary.map((s) => s.toLowerCase()),
  ];
  const requiredSkills = listing.skills_required.map((s) => s.toLowerCase());
  const matchCount = requiredSkills.filter((s) =>
    allUserSkills.some((us) => us.includes(s) || s.includes(us))
  ).length;
  const skillScore = requiredSkills.length > 0 ? Math.min(5, (matchCount / requiredSkills.length) * 5) : 3;
  dimensions.push({
    name: 'Skill Match',
    weight: 0.25,
    raw: skillScore,
    weighted: skillScore * 0.25,
    rationale:
      requiredSkills.length > 0
        ? `${matchCount}/${requiredSkills.length} required skills matched`
        : 'No explicit skill requirements listed',
  });

  // 2. Rate Fit (20%)
  const budget = listing.budget;
  const target = profile.hourly_rate.target;
  const minimum = profile.hourly_rate.minimum;
  let rateScore = 3;
  let rateRationale = 'Budget not specified';
  if (budget.hourly && budget.min) {
    const midBudget = budget.max ? (budget.min + budget.max) / 2 : budget.min;
    if (midBudget >= target) rateScore = 5;
    else if (midBudget >= minimum) rateScore = 3.5;
    else if (midBudget >= minimum * 0.8) rateScore = 2;
    else rateScore = 1;
    rateRationale = `Budget ${budget.raw} vs target ${profile.hourly_rate.currency} ${target}/hr`;
  } else if (budget.fixed) {
    const estHours = budget.fixed / target;
    rateRationale = `Fixed ${budget.raw} ≈ ${estHours.toFixed(0)}hrs at target rate`;
    rateScore = budget.fixed >= profile.preferences.min_project_value ? 4 : 2;
  }
  dimensions.push({ name: 'Rate Fit', weight: 0.20, raw: rateScore, weighted: rateScore * 0.20, rationale: rateRationale });

  // 3. Client Quality (20%)
  const client = listing.client;
  let clientScore = 3;
  let clientRationale = 'Limited client data available';
  if (client.rating !== undefined) {
    clientScore = (client.rating / 5) * 5;
    clientRationale = `Client rating: ${client.rating.toFixed(1)}/5`;
    if (client.payment_verified) { clientScore = Math.min(5, clientScore + 0.3); clientRationale += ', payment verified'; }
    if (client.reviews && client.reviews > 10) { clientScore = Math.min(5, clientScore + 0.2); clientRationale += `, ${client.reviews} reviews`; }
  }
  dimensions.push({ name: 'Client Quality', weight: 0.20, raw: clientScore, weighted: clientScore * 0.20, rationale: clientRationale });

  // 4. Effort/Scope (15%)
  const desc = listing.description.toLowerCase();
  const scopeKeywords = ['urgent', 'asap', 'immediately', 'yesterday', 'massive', 'entire', 'everything'];
  const redFlags = scopeKeywords.filter((k) => desc.includes(k)).length;
  const effortScore = Math.max(1, 4.5 - redFlags * 0.5);
  dimensions.push({
    name: 'Effort/Scope',
    weight: 0.15,
    raw: effortScore,
    weighted: effortScore * 0.15,
    rationale: redFlags > 0 ? `${redFlags} scope concern(s) detected in description` : 'No major scope concerns detected',
  });

  // 5. Growth Value (10%)
  const growthKeywords = ['portfolio', 'startup', 'innovative', 'ai', 'machine learning', 'leadership', 'architect'];
  const growthMatches = growthKeywords.filter((k) => desc.includes(k) || listing.title.toLowerCase().includes(k)).length;
  const growthScore = Math.min(5, 2.5 + growthMatches * 0.5);
  dimensions.push({
    name: 'Growth Value',
    weight: 0.10,
    raw: growthScore,
    weighted: growthScore * 0.10,
    rationale: growthMatches > 0 ? `Growth indicators: ${growthMatches}` : 'Standard gig, limited growth signals',
  });

  // 6. Win Probability (10%)
  const proposals = listing.proposals_count ?? 0;
  let winScore = 3;
  let winRationale = 'Proposal count unknown';
  if (proposals > 0) {
    if (proposals < 5) { winScore = 5; winRationale = `Only ${proposals} proposals — low competition`; }
    else if (proposals < 15) { winScore = 4; winRationale = `${proposals} proposals — moderate competition`; }
    else if (proposals < 30) { winScore = 3; winRationale = `${proposals} proposals — competitive`; }
    else { winScore = 1.5; winRationale = `${proposals}+ proposals — very competitive`; }
  }
  dimensions.push({ name: 'Win Probability', weight: 0.10, raw: winScore, weighted: winScore * 0.10, rationale: winRationale });

  const total = dimensions.reduce((sum, d) => sum + d.weighted, 0);
  const grade = getGrade(total);
  const recommendation = getRecommendation(total);

  return {
    dimensions,
    total: Math.round(total * 10) / 10,
    grade,
    recommendation,
    summary: `Score: ${total.toFixed(2)}/5 (${grade}) — ${recommendation === 'apply' ? '✅ Recommend applying' : recommendation === 'consider' ? '⚠️ Worth considering' : '❌ Skip this one'}`,
  };
}
