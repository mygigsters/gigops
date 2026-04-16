# Skill: evaluate

Evaluates a single gig listing against the user's profile using 6 weighted dimensions.

## Usage

```bash
gigops evaluate <url> [--save] [--profile ./config/profile.yml]
```

## What it does

1. Detects platform from URL (Upwork, Airtasker, Freelancer, etc.)
2. Scrapes listing content via Playwright
3. Runs heuristic pre-score across 6 dimensions
4. Sends listing + profile + heuristic to Claude for full evaluation
5. Returns structured result: grade (A-F), score (0-5), pros/cons, red flags, recommendation

## Scoring Dimensions

| Dimension      | Weight | What it measures                              |
|----------------|--------|-----------------------------------------------|
| Skill Match    | 25%    | User skills vs gig requirements               |
| Rate Fit       | 20%    | Budget vs user target/minimum rate            |
| Client Quality | 20%    | Client rating, reviews, payment verification  |
| Effort/Scope   | 15%    | Scope signals, red flag language              |
| Growth Value   | 10%    | Portfolio potential, new skills               |
| Win Probability| 10%    | Competition level, proposal count             |

## Grades

- A (4.5-5.0): Exceptional fit — definitely apply
- B (3.5-4.5): Good fit — apply
- C (2.5-3.5): Mediocre — consider carefully
- D (1.5-2.5): Poor fit — probably skip
- F (<1.5): Waste of time — skip

**Rule:** Only apply to B+ or above. GigOps warns on anything below 3.5.

## AI Model

Uses Claude Opus for evaluation. Provides structured JSON response including pros, cons, red flags, and next steps.

## Output

```
Grade: B  Score: 3.8/5

Summary: Good skill match for a React/Node project...

✓ Pros:
  • All 4 primary skills match
  • Client has 4.8/5 rating with payment verified
  
✗ Cons:
  • Budget slightly below target rate

Recommendation: ✅ Apply
```
