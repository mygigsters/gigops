# Dashboard: web UI for pipeline view

**Labels:** `enhancement`, `frontend`

## Description

Build a local web dashboard that visualizes the `gigops pipeline` data — active bids, won gigs, earnings, and opportunity funnel.

## Motivation

The CLI is great for power users, but a visual pipeline view makes it easier to track your freelance business at a glance. Think a personal CRM for gig work.

## Proposed Approach

- Lightweight local web server (Express or Fastify)
- Simple frontend (vanilla JS or Preact — keep deps minimal)
- Reads from the same pipeline data store the CLI uses
- Kanban-style columns: Scanning → Evaluating → Bid Sent → Won → Complete
- Stats: win rate, average earnings, gigs per platform

## Non-goals (for v1)

- No auth (local only)
- No real-time updates (refresh to update)
- No mobile-optimized layout

## Open Questions

- Should this be a separate package (`gigops-dashboard`) or built into the main CLI?
- What charting library, if any?
