# 🚀 GigOps v0.1.0 — First Public Release

_AI for gig workers, not against them._

We're excited to release GigOps publicly! This is the first open-source CLI that gives freelancers AI-powered tools to find better gigs, write winning proposals, and make smarter decisions about their work.

## ✨ What's Included

### 6 Commands, Ready to Use

- **`gigops evaluate <url>`** — AI analysis of any gig listing. Is it worth your time? What are the red flags? Is the pay fair?
- **`gigops propose <url>`** — Generate a tailored proposal based on the gig details and your profile.
- **`gigops scan`** — Search and rank gigs across platforms matching your skills and preferences.
- **`gigops rate-check`** — Benchmark your rates against market data for your skill set.
- **`gigops client-intel <url>`** — Research a client before you bid — review history, payment patterns, warning signs.
- **`gigops pipeline`** — Track your active gigs, pending bids, and opportunity pipeline.

### Platform Support

- ✅ Airtasker
- ✅ Freelancer
- ✅ Upwork
- ✅ Any URL (generic scraper fallback)

### LLM Providers

- Anthropic (Claude)
- OpenAI (GPT-4o, GPT-4, GPT-3.5)
- Google Gemini
- Ollama (fully local, fully free)

## 📦 Installation

```bash
npm install -g gigops
```

Requires Node.js >= 18.

## ⚡ Getting Started

```bash
# Set up your preferred LLM
export ANTHROPIC_API_KEY="sk-..."

# Evaluate a gig
gigops evaluate "https://www.airtasker.com/tasks/example"

# Scan for opportunities
gigops scan --platform airtasker --skills "react, typescript"
```

## 🔮 What's Next

- More platform scrapers (Fiverr, Toptal, PeoplePerHour)
- Web dashboard for pipeline view
- Proposal A/B testing and win-rate tracking
- Community rate benchmarks (opt-in, anonymous)

## 🤝 Contributing

This is a community project. We'd love your help — check out [CONTRIBUTING.md](../CONTRIBUTING.md) for how to get started. Adding a new platform scraper is a great first contribution.

## 📄 License

MIT — free as in freelance.
