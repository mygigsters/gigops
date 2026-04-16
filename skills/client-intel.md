# Skill: client-intel

Analyses a client profile for red flags, payment patterns, and overall quality.

## Usage

```bash
gigops client-intel https://www.upwork.com/companies/~01234567890
gigops client https://www.airtasker.com/users/username/
```

## What it does

1. Scrapes the client's platform profile page
2. Collects: rating, reviews, location, member since, total spent, payment verification
3. AI analysis flags patterns of:
   - Low ratings despite many reviews
   - Unverified payment methods
   - Suspicious account age vs project value
   - High number of abandoned projects
   - Location mismatches with posted budget
4. Returns: quality grade (A-F), risk score (0-10), red flags, green flags, recommendation

## Red Flags Detected

- Rating below 4.0 with many reviews (systematic bad behaviour)
- No payment verification (financial risk)
- Very new account posting high-budget projects (potential scam)
- Multiple short projects with bad reviews (scope creep)
- Overly vague requirements for high budgets
- Requesting unpaid "tests" or sample work

## Output

```
Quality Grade: B  Risk Score: 7/10

✓ Green Flags:
  • Payment verified
  • 4.7/5 rating across 23 reviews
  
Summary: Established client with consistent history...

Recommendation: Good client to work with. Negotiate rate firmly.
```

## Risk Score Guide

- 8-10: Great client, minimal risk
- 6-7: Good client, standard precautions
- 4-5: Proceed carefully, clarify scope upfront
- 0-3: Significant red flags, consider avoiding
