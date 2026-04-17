# Community rate benchmarks opt-in

**Labels:** `enhancement`, `community`

## Description

Allow users to anonymously contribute their rate data to a community benchmark pool, improving `gigops rate-check` for everyone.

## Motivation

`rate-check` currently uses publicly scraped data. Real freelancer rates (what people actually charge and get paid) would make benchmarks far more accurate. But privacy is paramount — this must be fully opt-in and anonymous.

## Proposed Approach

1. **Opt-in:** `gigops config --benchmarks opt-in` (off by default, always)
2. **Anonymous submission:** Only sends: skill category, experience bracket, hourly rate range, platform, region (country-level)
3. **No PII:** Never sends names, usernames, URLs, or anything identifiable
4. **Community API:** Simple backend that aggregates and serves anonymized percentiles
5. **Local-first:** Works fine without opt-in using only scraped public data

## Privacy Requirements

- Explicit opt-in with clear explanation of what's shared
- Users can see exactly what would be sent before confirming
- `gigops benchmarks my-data` shows your contributions
- `gigops config --benchmarks opt-out` deletes your data from the pool

## Open Questions

- Where to host the benchmark API? (Cloudflare Workers? Supabase?)
- Minimum sample size before showing community data for a skill?
- How to prevent gaming/spam submissions?
