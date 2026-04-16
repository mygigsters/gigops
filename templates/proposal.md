# Proposal Templates

These are base templates. GigOps AI fills in the specifics based on your profile and the listing.
You shouldn't need to edit these — the AI adapts tone and content automatically.

---

## Template: Conversational (Default)

```
[OPENING — specific to their problem, not generic]

[PROOF POINT — one specific achievement directly relevant to their need]

[APPROACH — 2-3 sentences on how you'd tackle this]

[SOCIAL PROOF — brief credibility signal]

[CALL TO ACTION — specific next step]
```

**Example output:**
> Your dashboard rebuild sounds like it's blocking your team's ability to track real-time data — 
> that's exactly the kind of bottleneck I've solved before. At [Client], I rebuilt a similar 
> React dashboard that cut report generation from 45 minutes to under 30 seconds.
> 
> For this project, I'd start with a quick audit of the existing data flow before writing a 
> line of code — most performance issues at this scale are architectural, not frontend.
> 
> Happy to jump on a 20-minute call this week to walk through my approach. When works for you?

---

## Template: Professional

```
[DIRECT VALUE PROPOSITION — what you bring to this specific project]

[RELEVANT EXPERIENCE — specific and quantified]

[METHODOLOGY — your process and what makes it different]

[NEXT STEP — clear and low-friction]
```

---

## Template: Concise (Under 100 words)

```
[1 sentence about their problem]
[1-2 sentences on your direct experience]
[1 concrete next step]
```

**Example:**
> You need a Node.js API that handles high concurrency without falling over.
> I've built 3 similar systems in the past 2 years, including one processing 
> 50k requests/minute for a gig economy platform.
> Available to start this week — want to do a quick call first?

---

## Notes

- The AI generates fresh proposals for each gig — these templates are structural guides only
- Run `gigops propose <url>` to get a fully generated proposal
- Adjust tone with `--tone professional|conversational|concise`
