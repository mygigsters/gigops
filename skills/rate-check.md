# Skill: rate-check

Market rate intelligence for a skill/location/experience combination.

## Usage

```bash
gigops rate-check "React Developer" --location "Sydney, Australia" --experience 5
gigops rate-check "UI/UX Designer" --location "London, UK" --platform upwork
```

## What it does

1. Takes a skill (or job title), location, and experience level
2. Queries Claude for current market rate intelligence
3. Returns: recommended range (min/max/optimal), market context, and positioning advice

## Output

```
React Developer — Sydney, Australia

Recommended range: AUD 85–130/hr
Optimal rate:      AUD 105/hr

Market Context:
React developers in Sydney's market are in strong demand...

Positioning Advice:
At 5 years experience, position at the upper-mid range...

⚠ Watch out:
  • Rates below AUD 60/hr often signal inexperienced clients
```

## Notes

- Uses Claude's training data (up to early 2024) for market context
- For real-time data, supplement with Upwork Rate Calculator and SEEK Salary Explorer
- Location matters significantly: Australian rates are typically 20-40% higher than US equivalents
- Platform also matters: Upwork rates tend to be lower than direct client rates

## Related commands

```bash
# Check if a specific gig's budget is reasonable
gigops evaluate <url>  # Rate Fit dimension covers this per-gig
```
