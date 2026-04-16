import { heuristicScore, getGrade, getRecommendation } from '../src/evaluator/scoring';
import { GigListing } from '../src/scrapers/base';
import { UserProfile } from '../src/utils/config';

const mockProfile: UserProfile = {
  name: 'Jane Smith',
  title: 'Full-Stack Developer',
  skills: {
    primary: ['React', 'Node.js', 'TypeScript'],
    secondary: ['Python', 'AWS'],
  },
  experience_years: 5,
  hourly_rate: { minimum: 60, target: 85, currency: 'AUD' },
  availability: { hours_per_week: 30, timezone: 'Australia/Melbourne' },
  location: 'Melbourne, AU',
  platforms: ['upwork'],
  bio: 'Full-stack developer',
  preferences: {
    remote_only: true,
    min_project_value: 500,
    max_project_duration: '3months',
    avoid: ['crypto'],
  },
  proof_points: ['Built payment platform processing $2M/month'],
  career_story: 'Started freelancing in 2019...',
};

const mockListing: GigListing = {
  id: 'upwork-test1',
  url: 'https://upwork.com/jobs/test',
  platform: 'upwork',
  title: 'React/Node.js Developer',
  description: 'Looking for an experienced React and Node.js developer to build a web application.',
  budget: { min: 70, max: 100, hourly: true, currency: 'AUD', raw: 'AUD 70-100/hr' },
  client: { rating: 4.8, reviews: 15, payment_verified: true },
  skills_required: ['React', 'Node.js', 'TypeScript'],
  proposals_count: 5,
  scraped_at: new Date().toISOString(),
};

describe('Scoring Engine', () => {
  test('grades A-F correct ranges', () => {
    expect(getGrade(4.8)).toBe('A');
    expect(getGrade(4.0)).toBe('B');
    expect(getGrade(3.0)).toBe('C');
    expect(getGrade(2.0)).toBe('D');
    expect(getGrade(1.0)).toBe('F');
  });

  test('recommendations correct thresholds', () => {
    expect(getRecommendation(4.0)).toBe('apply');
    expect(getRecommendation(3.0)).toBe('consider');
    expect(getRecommendation(1.5)).toBe('skip');
  });

  test('heuristic score on good match', () => {
    const result = heuristicScore(mockListing, mockProfile);
    expect(result.total).toBeGreaterThan(3.5);
    expect(result.grade).toMatch(/A|B/);
    expect(result.recommendation).toBe('apply');
    expect(result.dimensions).toHaveLength(6);
  });

  test('skill match dimension weights correctly', () => {
    const result = heuristicScore(mockListing, mockProfile);
    const skillDim = result.dimensions.find(d => d.name === 'Skill Match');
    expect(skillDim).toBeDefined();
    expect(skillDim!.weight).toBe(0.25);
    expect(skillDim!.raw).toBeGreaterThan(3);
  });

  test('low budget scores poorly on rate fit', () => {
    const lowBudgetListing: GigListing = {
      ...mockListing,
      budget: { min: 20, max: 30, hourly: true, currency: 'AUD', raw: 'AUD 20-30/hr' },
    };
    const result = heuristicScore(lowBudgetListing, mockProfile);
    const rateDim = result.dimensions.find(d => d.name === 'Rate Fit');
    expect(rateDim!.raw).toBeLessThan(3);
  });

  test('high proposal count reduces win probability', () => {
    const crowdedListing: GigListing = {
      ...mockListing,
      proposals_count: 50,
    };
    const result = heuristicScore(crowdedListing, mockProfile);
    const winDim = result.dimensions.find(d => d.name === 'Win Probability');
    expect(winDim!.raw).toBeLessThan(2);
  });
});
