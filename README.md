# GOYO — Wellness Journal

A dark-mode, **undated** wellness journal for GoodNotes / Notability, sold as a hyperlinked PDF.
Korean *najeon* (mother-of-pearl) reinterpreted as modern, minimal, editorial design.
Plain static site — **no framework, no build step**.

> Working with Claude Code? See **`CLAUDE.md`** — project rules, run steps, and roadmap.

## Run
```bash
python3 -m http.server 5173      # or: npm run dev
# open http://localhost:5173
```

## Structure
```
index.html        7 pages (Cover Index Monthly Weekly Daily Habits Notes), 1080x1440 each
css/tokens.css    design system — single source of truth (edit this to make variations)
css/base.css      layout + components
js/medallion.js   procedural najeon cover art
js/journal.js     seal + page generators (date strip, calendar, weekly, habits)
assets/           hi-fidelity cover medallion (svg + png)
themes/           colourway overrides (light.css, hanji.css)
CLAUDE.md         project context for Claude Code
```

## Make a variation
Edit **css/tokens.css** (palette, type, spacing) — layout never changes. Or apply a ready theme
by adding it after the tokens link in index.html (later link wins):
```html
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="themes/light.css">
```

## Roadmap (done)
1. ~~Theme switcher for review.~~ Colourways ship as separate per-theme builds instead
   (`export/<theme>/`); no in-page switcher.
2. Per-theme export to print-ready HTML.
3. Hyperlinked-PDF pipeline (tabs to pages, rail to months, index to sections) + GoodNotes link test.
4. New pages: year-at-a-glance, gratitude log, per-month notes.
