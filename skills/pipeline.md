# Skill: pipeline

JSONL-based gig tracking system. Manages the full lifecycle from discovery to payment.

## Usage

```bash
gigops pipeline list
gigops pipeline list --status applied
gigops pipeline update <id> interviewing --notes "Had good call, sending contract"
gigops pipeline stats
gigops pipeline check --fix
```

## Pipeline Statuses

| Status | Description |
|--------|-------------|
| `discovered` | Found a gig, not yet evaluated |
| `evaluated` | AI score complete, deciding whether to apply |
| `proposal_drafted` | Proposal written, ready to send |
| `applied` | Proposal sent to client |
| `interviewing` | In conversation / discovery call |
| `won` | Got the gig 🎉 |
| `lost` | Didn't get it |
| `skipped` | Decided not to apply |
| `withdrawn` | Applied but withdrew |

## Data Format (pipeline.jsonl)

Each line is a JSON object:
```json
{
  "id": "upwork-abc123",
  "url": "https://www.upwork.com/jobs/...",
  "platform": "upwork",
  "title": "React Developer for SaaS App",
  "budget_raw": "$50-75/hr",
  "status": "applied",
  "score": 4.2,
  "grade": "A",
  "proposal_sent": true,
  "proposal_sent_at": "2024-03-15T09:00:00Z",
  "notes": "They mentioned using AWS — emphasised that in proposal",
  "discovered_at": "2024-03-14T18:00:00Z",
  "updated_at": "2024-03-15T09:05:00Z"
}
```

## Integrity Checks

`gigops pipeline check` validates:
- No duplicate URLs
- Required fields present (id, url, platform, title, status)
- Valid status values
- Score in 0-5 range

`--fix` flag auto-removes duplicates and normalizes status values.

## pipeline/ directory

The `pipeline/` directory is gitignored by default — your pipeline data stays local.
If you want to backup or sync, add pipeline.jsonl to your preferred backup solution.
