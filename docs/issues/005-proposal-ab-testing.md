# Proposal A/B testing & win-rate tracking

**Labels:** `enhancement`

## Description

Track which proposal styles win more gigs and use that data to improve future proposals.

## Motivation

`gigops propose` generates great proposals, but we have no feedback loop. Did the proposal win? Which tone/length/structure converts best? This feature closes the loop.

## Proposed Approach

1. **Outcome tracking:** `gigops pipeline mark-won <id>` / `gigops pipeline mark-lost <id>` to record bid outcomes
2. **Proposal variants:** Generate 2-3 proposal variants with different strategies (e.g., short vs detailed, value-led vs credential-led)
3. **Win-rate stats:** `gigops stats proposals` — win rate by style, platform, gig type
4. **Prompt tuning:** Feed win/loss data back into prompt templates to improve over time

## Data Model

```
proposals/
├── <gig-id>/
│   ├── variant-a.md
│   ├── variant-b.md
│   ├── selected: "a"
│   └── outcome: "won" | "lost" | null
```

## Acceptance Criteria

- [ ] Users can mark pipeline items as won/lost
- [ ] `gigops propose` can generate multiple variants
- [ ] Stats command shows win rates
