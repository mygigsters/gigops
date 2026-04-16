# Skill: propose

Generates tailored, ready-to-paste proposals for gig listings.

## Usage

```bash
gigops propose <url> [--tone professional|conversational|concise]
```

## What it does

1. Scrapes the listing (same as evaluate)
2. Reads user profile (proof points, career story, skills)
3. Optionally uses prior evaluation context
4. Generates a proposal that:
   - Opens with something specific about the client's project
   - Shows understanding of the problem (not just the requirements)
   - References 1-2 directly relevant proof points
   - Is concrete about approach
   - Ends with a clear next step
   - Stays under 300 words

## Tones

- **conversational** (default): Warm, direct, like talking to a founder
- **professional**: More formal, structured, suits larger corporations
- **concise**: Ultra-short, bullet-point style for platforms that favour brevity

## Rules the AI follows

- Never start with "I saw your job posting"
- Never list skills as bullet points
- Match energy of the listing (technical = technical)
- Reference real proof points, not generic claims
- One clear call to action

## Output

```
Subject: React payment integration — I've done this before

[Proposal text, ready to paste]

Key points used:
  • Built payment platform processing $2M/month
  • 5-star rating across 47 projects
```
