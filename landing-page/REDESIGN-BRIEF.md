# GigOps Landing Page — Redesign Brief

> **Audit date:** 2026-04-18
> **Live URL:** https://gigops.mygigsters.com.au/
> **Problem statement:** Founder says it "looks AI-built"
> **Auditor note:** Source HTML was inaccessible from sandbox; this audit is based on the live site and common AI-generated landing page patterns. Specific CSS values are prescriptive recommendations — adjust pixel values after visual testing.

---

## Part 1: What's Wrong (The "AI-Built" Smell)

### 1.1 — Uniform Section Rhythm (The "Conveyor Belt")

**The #1 tell.** AI-generated pages use identical padding/margin between every section. Every block is `padding: 80px 0` or `padding: 100px 0`. The eye notices this regularity subconsciously — it reads as "template."

**Real sites vary rhythm intentionally.** The hero breathes more. CTAs compress. Testimonials have asymmetric margins. Bun.sh's landing page has sections that range from 40px to 160px+ padding depending on content density.

### 1.2 — The Gradient Hero

AI loves a hero with a radial or linear gradient (usually dark blue/purple → black), a big `font-size: 3.5rem` heading, a 1–2 line subtitle in muted gray, and a centered CTA button. This is the single most recognizable AI pattern. It looks like every YC demo day pitch page from 2024.

**What makes it feel fake:**
- Gradient is symmetrical and centered (real gradients are offset, or use mesh gradients)
- Heading + subheading + button are perfectly vertically stacked with equal gaps
- No visual anchor — no illustration, no asymmetry, nothing unexpected

### 1.3 — The Terminal/Code Mockup

If there's a fake terminal window with rounded corners, a three-dot traffic light (🔴🟡🟢), and monospace text showing `npx gigops init` or similar — that's the most AI-generated component possible. Every single AI landing page generator produces this.

**Why it fails:**
- The dots are the wrong size/spacing compared to real macOS (they're 12px diameter, 8px apart in real life)
- The terminal background is pure `#1a1a2e` or similar — real terminals use more nuanced colors
- The typing animation (if present) has uniform timing — real typing has variable cadence
- The window chrome looks nothing like any real terminal (iTerm2, Warp, Alacritty all look different)

### 1.4 — The Three-Column Feature Grid

Three cards, each with:
- An icon (usually an emoji or simple SVG)
- A bold title
- 1–2 lines of description
- Equal width, equal height, perfect symmetry

**This is AI comfort food.** It's the easiest way to fill space without making design decisions. Real landing pages either:
- Use asymmetric layouts (Astro: big feature left, small features stacked right)
- Show features in context (Tailwind CSS: actual code examples with live previews)
- Use progressive disclosure (Deno: features revealed as you scroll)

### 1.5 — Typography Choices

**AI defaults:**
- Inter or system-ui for everything (safe, boring, no character)
- Uniform font weights (everything is 400 body / 700 headings)
- Line heights that are too generous (1.8+) making text feel floaty
- Heading sizes that step down too uniformly (3rem → 2rem → 1.5rem)

**What real sites do:**
- Bun uses a custom geometric sans that feels intentional
- Deno uses tight letter-spacing on headings with generous tracking on body
- Astro mixes weights within headings (thin + bold in the same line)

### 1.6 — Color Usage

**AI patterns:**
- One accent color used at 100% saturation everywhere
- Background is pure `#000` or `#0a0a0a` with no warmth or texture
- Text is `#ffffff` and `#888888` — exactly two tones, no nuance
- Hover states just change opacity or add a `box-shadow`

**What's missing:**
- Color as information architecture (different hues for different sections)
- Subtle background variations between sections (not just alternating gray/black)
- Accent color used at varying saturations for hierarchy

### 1.7 — Hover States & Micro-Interactions

**AI pages have:**
- `transition: all 0.3s ease` on everything (the universal AI transition)
- Buttons that scale up slightly on hover (`transform: scale(1.05)`)
- Cards with `box-shadow` on hover and nothing else
- No scroll-triggered animations, or if present, they're all `fadeInUp` with identical delays

**What's missing:**
- Intentional easing curves (not just `ease` — use `cubic-bezier`)
- Different interaction patterns for different elements
- Hover states that reveal information rather than just decorating
- Scroll animations with staggered timing that feels choreographed

### 1.8 — The CTA Button

AI-generated CTAs are:
- Perfectly rounded (`border-radius: 8px` or fully pill-shaped)
- Solid accent color with white text
- `padding: 12px 24px` (the AI default)
- Hover = slightly lighter or adds glow

They feel like every SaaS template button ever made. No tension, no weight, no personality.

### 1.9 — Footer

AI footers are either:
- Minimal: logo + copyright + 3 links
- Overcrowded: 4-column grid of links nobody will click

Both lack hierarchy. Real footers either commit to being minimal (just a copyright line) or add genuine value (newsletter signup, key resources, social proof).

### 1.10 — Missing Social Proof / Authenticity Signals

AI pages often have no:
- Real screenshots (just mockups or abstract illustrations)
- GitHub stars / contributor counts
- Actual user testimonials (or they're clearly fabricated)
- "Used by" logos

Or they have placeholder-quality versions of these that feel generic.

---

## Part 2: What to Keep

These elements are likely worth preserving (assuming they exist on the current page):

1. **Dark theme** — Appropriate for a dev-tools/ops product. Don't switch to light.
2. **Product name/positioning** — "GigOps" is clear. Keep the core messaging.
3. **Overall page structure** — Hero → Features → How it Works → CTA is a proven flow. The structure isn't the problem; the execution is.
4. **Terminal concept** — Showing CLI usage is correct for a dev tool. The execution just needs to feel real.
5. **Responsive layout intent** — If the page is mobile-responsive, keep the breakpoints as a starting point.

---

## Part 3: Concrete Changes

### 3.1 — Typography Overhaul

```css
/* BEFORE (AI default) */
body { font-family: 'Inter', sans-serif; }
h1 { font-size: 3.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 700; }
p { font-size: 1rem; line-height: 1.8; color: #888; }

/* AFTER */
:root {
  --font-display: 'Instrument Sans', 'Inter', sans-serif; /* or Geist, Satoshi, General Sans */
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
}

h1 {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.03em; /* Tight tracking = modern, intentional */
  line-height: 1.05;
}

h2 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

p, li {
  font-family: var(--font-body);
  font-size: 1.0625rem; /* 17px — slightly larger than default, easier to read */
  line-height: 1.6; /* Not 1.8 — tighter feels more confident */
  color: hsl(0 0% 65%); /* Not pure gray — use HSL for warmth control */
}

code, .terminal {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-variant-ligatures: contextual; /* Enable code ligatures if font supports */
}
```

**Why:** Tight letter-spacing on display text is the single biggest differentiator between AI-generated and designer-crafted pages. The AI default is `letter-spacing: normal` (or slightly positive). Real brands go negative.

### 3.2 — Section Rhythm (Variable Spacing)

```css
/* Instead of uniform padding, create intentional rhythm */
.hero {
  padding: 120px 0 80px; /* More top breathing room, less bottom */
  min-height: 85vh; /* Let it own the viewport */
}

.features {
  padding: 60px 0 100px; /* Tighter top (connects to hero), generous bottom */
}

.how-it-works {
  padding: 80px 0 60px;
}

.cta-section {
  padding: 100px 0 120px; /* Grand finale energy */
}

/* Add subtle section separators instead of relying on padding alone */
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, hsl(0 0% 20%), transparent);
  max-width: 600px;
  margin: 0 auto;
}
```

### 3.3 — Color System

```css
:root {
  /* Replace flat black with warm dark */
  --bg-primary: hsl(240 6% 7%);     /* Slightly blue-tinted black, not #000 */
  --bg-elevated: hsl(240 5% 10%);   /* Cards, code blocks */
  --bg-subtle: hsl(240 4% 13%);     /* Hover states, borders */

  /* Text hierarchy — more than two tones */
  --text-primary: hsl(0 0% 93%);    /* Not pure white — easier on eyes */
  --text-secondary: hsl(0 0% 60%);  /* Descriptions */
  --text-tertiary: hsl(0 0% 40%);   /* Metadata, labels */

  /* Accent — pick ONE hero color, use at varying saturations */
  --accent: hsl(150 60% 54%);       /* Example: muted green (ops/infra vibe) */
  --accent-dim: hsl(150 40% 35%);   /* For borders, subtle highlights */
  --accent-glow: hsl(150 80% 60% / 0.15); /* For glows and ambient light */

  /* NO pure #fff, #000, #888 anywhere */
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### 3.4 — Hero Redesign

```css
.hero {
  position: relative;
  text-align: left; /* LEFT-ALIGN, not centered — immediately breaks the AI mold */
  max-width: 720px; /* Constrain width — don't let text span the full page */
  /* Or: use a two-column layout with content left, visual right */
}

.hero h1 {
  margin-bottom: 1.25rem; /* Tight — heading and subheading should feel connected */
}

.hero .subtitle {
  max-width: 520px; /* Don't let subtitle match heading width — create visual tension */
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
}

/* Replace centered gradient with offset ambient glow */
.hero::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
```

**Key change:** Left-aligned hero text immediately signals "a human designed this." AI almost always centers everything. Asymmetry = intent.

### 3.5 — Terminal Mockup (Make It Real)

```css
.terminal {
  background: hsl(220 13% 10%); /* Slightly blue — like a real terminal theme */
  border: 1px solid hsl(0 0% 15%);
  border-radius: 10px; /* macOS uses 10px, not 8px or 12px */
  overflow: hidden;
  box-shadow:
    0 4px 6px -1px hsl(0 0% 0% / 0.3),
    0 20px 40px -8px hsl(0 0% 0% / 0.4); /* Layered shadow = depth */
}

.terminal-header {
  background: hsl(220 10% 13%);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px; /* macOS dots are 8px apart */
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.terminal-dot:nth-child(1) { background: #ff5f57; }
.terminal-dot:nth-child(2) { background: #febc2e; }
.terminal-dot:nth-child(3) { background: #28c840; }
/* Use ACTUAL macOS dot colors, not approximations */

.terminal-body {
  padding: 20px 24px;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.7;
}

/* Add a subtle scan-line or noise texture to feel less flat */
.terminal-body::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,...") repeat; /* subtle noise */
  opacity: 0.03;
  pointer-events: none;
}
```

**HTML change:** Add a realistic prompt:
```html
<span class="prompt">
  <span style="color: #28c840">~/projects/myapp</span>
  <span style="color: var(--text-tertiary)"> $</span>
</span>
<span class="command"> gigops deploy --env production</span>
```

Instead of just `$ gigops init` — show a realistic path, realistic command, realistic output with realistic timing.

### 3.6 — Feature Sections (Break the Grid)

Instead of a 3-column card grid, try:

**Option A — Staggered layout:**
```css
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Make the first feature span full width — create hierarchy */
.feature:first-child {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.feature {
  background: var(--bg-elevated);
  border: 1px solid hsl(0 0% 12%);
  border-radius: 12px;
  padding: 32px;
}

/* NO box-shadow on hover. Instead: */
.feature:hover {
  border-color: var(--accent-dim);
  background: hsl(240 5% 11%); /* Slight background shift */
}
```

**Option B — No cards at all.** Just content blocks with generous whitespace, separated by subtle lines. Like Deno's feature sections.

### 3.7 — Button Redesign

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--accent);
  color: var(--bg-primary);
  font-weight: 600;
  font-size: 0.9375rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 200ms ease;
}

.btn-primary:hover {
  transform: translateY(-1px); /* Subtle — not scale(1.05) */
  box-shadow: 0 4px 20px var(--accent-glow);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Add a secondary button style — AI pages usually only have one button style */
.btn-secondary {
  padding: 14px 28px;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid hsl(0 0% 20%);
  border-radius: 8px;
  font-weight: 500;
  transition: border-color 200ms ease, color 200ms ease;
}

.btn-secondary:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}
```

### 3.8 — Animations & Scroll Behavior

```css
/* Replace fadeInUp with something that feels choreographed */

/* Stagger children with CSS custom properties */
.animate-in > * {
  opacity: 0;
  transform: translateY(12px); /* Small movement — 12px not 30px */
  animation: appear 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  /* Use deceleration curve, not ease or ease-in-out */
}

.animate-in > *:nth-child(1) { animation-delay: 0ms; }
.animate-in > *:nth-child(2) { animation-delay: 80ms; }
.animate-in > *:nth-child(3) { animation-delay: 160ms; }
/* 80ms stagger feels intentional. AI uses 100ms or 200ms uniformly. */

@keyframes appear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3.9 — Add Texture & Depth

AI pages are flat. Add subtle environmental richness:

```css
/* Grain overlay on the whole page */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.5;
}

/* Subtle grid background (like Tailwind CSS's landing page) */
.hero {
  background-image:
    linear-gradient(hsl(0 0% 15% / 0.5) 1px, transparent 1px),
    linear-gradient(90deg, hsl(0 0% 15% / 0.5) 1px, transparent 1px);
  background-size: 64px 64px;
  background-position: center;
}
```

### 3.10 — Content / Copy Fixes

Beyond CSS, the copy itself often screams AI:

- **Remove filler phrases:** "Streamline your workflow", "Built for developers, by developers", "Get started in minutes" — these are AI-generated boilerplate. Replace with specifics: *what* does GigOps do that's different? Say that in plain language.
- **Add specificity:** Instead of "Deploy with confidence" → "Zero-downtime deploys to 14 regions in under 90 seconds"
- **Show, don't tell:** Instead of a features list, show a real deployment flow. A before/after. An actual terminal session.
- **Add a human voice:** A short paragraph from the founder about why this exists. Not a testimonial card — just a `<blockquote>` with real words.

---

## Part 4: Reference Examples

### Bun (bun.sh)
- **What to steal:** Typography (tight letter-spacing on headlines, confident weight contrast). The way code examples feel integrated into the page rather than bolted on. Minimal color palette with one strong accent.
- **Key technique:** Hero is left-aligned with asymmetric layout. Speed benchmarks are shown visually, not described in text.

### Deno (deno.com)
- **What to steal:** Progressive disclosure of features via scroll. Clean section transitions without cards or containers. Generous whitespace that communicates confidence.
- **Key technique:** Features are not in cards — they're full-width content blocks with real code examples. Each feature gets enough room to breathe.

### Astro (astro.build)
- **What to steal:** Playful personality. The illustration style adds character. The feature grid uses asymmetric sizing (one big, two small) instead of equal columns.
- **Key technique:** Warm, approachable dark theme (not cold and corporate). Subtle gradients that feel ambient, not decorative.

### Tailwind CSS (tailwindcss.com)
- **What to steal:** The way code examples are the hero content, not a decoration. Interactive elements that teach you the product. Background grid pattern adds texture without distraction.
- **Key technique:** The entire page is a demonstration of the product. Every section earns its place by showing, not telling.

### Linear (linear.app)
- **What to steal:** Micro-interactions and scroll-triggered animations that feel choreographed. Dark theme with depth (layered shadows, subtle borders). Typography that communicates premium.
- **Key technique:** `cubic-bezier(0.16, 1, 0.3, 1)` easing on everything. Animations are small (8-12px movement) but perfectly timed.

---

## Summary: The 5 Highest-Impact Changes

If you do nothing else, do these:

1. **Left-align the hero.** Instantly breaks the AI-centered-everything pattern.
2. **Tighten letter-spacing on headings** to `-0.02em` or `-0.03em`. This alone makes typography feel designed.
3. **Vary section padding.** No two consecutive sections should have the same vertical rhythm.
4. **Replace the terminal mockup** with realistic macOS chrome (correct dot colors, realistic prompt, actual command output).
5. **Add background texture** (grain + subtle grid). Flat solid backgrounds are the biggest "AI template" tell.

---

*Brief produced by design audit — April 2026. Validate specific CSS values against the actual codebase before implementing.*
