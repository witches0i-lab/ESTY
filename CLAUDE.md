# CLAUDE.md — GOYO Wellness Journal

Project context for Claude Code. Read this before making changes.

## What this is
GOYO (고요, "stillness") is a **dark-mode, undated wellness journal** sold on Etsy as a
**GoodNotes / Notability–compatible hyperlinked PDF**. Aesthetic: Korean *najeon* (나전,
mother-of-pearl) reinterpreted as modern, minimal, editorial. Identity = celadon (primary) +
najeon pink (secondary) on dark ink, with a procedural najeon medallion on the cover.

The runtime journal is a **plain static site** — no framework, no dependencies. A tiny
dependency-free **build** (Node built-ins only) generates the sellable product.

**The Etsy product is two files per colourway:** the **planner** (`goyo-<theme>.pdf` — a full
hyperlinked year) and the **user guide** (`goyo-guide-<theme>.pdf`) — e.g. `goyo-najeon.pdf` +
`goyo-guide-najeon.pdf`. Named per-theme so the files never get mixed up. Both are generated for each theme
(najeon / light / hanji) into `export/<theme>/`. **najeon is the GOYO base**; light & hanji change
only the colourway tokens — layout, anchors and text positions are identical across all three.

## Run / preview
```bash
python3 -m http.server 5173      # or: npm run dev  → http://localhost:5173
# index.html  = 7-page design sample (the archetypes)
# planner.html = generated full-year planner (394 pages), live preview (najeon base)

npm run build   # planner.mjs + guide.mjs + pdf.mjs → export/<theme>/goyo-<theme>.pdf + goyo-guide-<theme>.pdf
```
Every `.page` is `1080 × 1440` (portrait, tablet-friendly for GoodNotes).

## Structure
```
index.html        7 archetype pages (Cover, Year, Monthly, Daily, Habits, Notes, Gratitude) — design sample
css/tokens.css    DESIGN SYSTEM — single source of truth (palette, type, spacing, frame)
css/base.css      layout + components (chrome, labels, rows, page-specific). Don't churn.
js/medallion.js   procedural najeon cover art (seeded PRNG → SVG into #art)
js/journal.js     seal + page generators for the sample (date strip, calendar, cols, habit grid)
assets/           hi-fidelity cover medallion (svg + png) for print/Figma
themes/           colourway overrides (light.css, hanji.css) — opt-in
themes/cover/      per-theme cover artwork packs (NN.defs.svg + NN.med.js); najeon = base,
                  light = pink glass-sphere. Planner builds the cover per theme.
tools/planner.mjs PRODUCT build: full year → cover, year, 12 months, 365 days, habits, weekly,
                  gratitude, notes; all internal links wired. → export/<theme>/goyo-print.html + planner.html
tools/guide.mjs   user-guide build, one per theme (same layout, colourway only) → export/<theme>/goyo-guide.html
tools/pdf.mjs     render every goyo-print.html + the guide → PDF (internal links preserved)
docs/link-test.md GoodNotes / Notability hyperlink test checklist
export/           generated output (regenerate via `npm run build`; large goyo-<theme>.pdf is gitignored)
```

## Design system rules (important)
- **Variations = edit `css/tokens.css` only.** Colour, font, spacing, and frame are all tokens.
  Never fork the layout to reskin it. To try a colourway, add/override `:root` in a theme file.
- **Apply a theme:** add `<link rel="stylesheet" href="themes/light.css">` *after* `css/tokens.css`
  in `index.html` (later link wins). Default ships dark. There is no in-page theme switcher —
  each colourway is a separate build/preview (see `export/<theme>/`).
- Keep the type hierarchy: one serif display per page (`--serif`, Bodoni Moda), everything else
  `--sans` (Inter) at `--t-label` (11px, uppercase, letter-spaced) with hairline separators.
- Accents: `--accent` (celadon) = active/section; `--accent2` (pink) = dividers, gratitude, seal.
- Chrome is shared: text tabs w/ celadon underline, 40px **rotated** month rail, najeon seal.

## Cover medallion
Generated procedurally in `js/medallion.js` (water + moon + lower-left najeon pine, seed = 11).
Don't hand-edit the generated nodes. The dark colourway is fixed for the cover; the standalone
`assets/goyo-cover-medallion.svg/.png` is the print/Figma copy.

## Roadmap (good tasks)
1. ~~`themes/` colourways + a tiny theme switcher for review.~~ ✅ Najeon (default dark) /
   Light / Hanji. (The in-page switcher UI was later removed as unnecessary; preview each
   colourway via its own build in `export/<theme>/` or `planner.html`.)
2. ~~Per-theme **export to print-ready HTML** (one file per page, no workspace chrome/labels).~~
   ✅ `npm run export` (`tools/export.mjs`) → `export/<theme>/NN-name.html` (7 pages × 3 themes),
   each self-contained (inlined CSS/JS, no chrome) at 1080×1440. `export/index.html` is a contact
   sheet. Dependency-free (Node built-ins only).
3. ~~**Hyperlinked-PDF pipeline** — wire nav as anchors (tabs→pages, rail→months, index→sections),
   render to PDF preserving internal links, and a GoodNotes link-test checklist.~~ ✅ Each `.page`
   has `id="p-<slug>"`; tabs/rail/index are `<a href="#p-…">`. `npm run export` emits a combined
   `goyo-print.html` per theme; `npm run pdf` drives a pre-installed Chromium to render
   `goyo-<theme>.pdf` with internal links preserved (~113 link annots / 7 pages). Per-page export files
   rewrite anchors to sibling `.html`. Test with `docs/link-test.md`. Rail → single Monthly page
   until roadmap 4 adds 12 monthlies.
4. ~~New pages: weekly reflection, year-at-a-glance, gratitude log.~~ ✅ Plus the big scale-up:
   `tools/planner.mjs` generates the **full undated year** — cover, year-at-a-glance, 12 monthly
   pages, **a page for every day** (366 incl. Feb 29 so it works in leap years), 12 monthly habit
   grids, 12 per-month notes pages, and a gratitude log as the final page. **No year, no weekday is
   printed** (it is undated — reuse every year; `MLEN` fixes month lengths). Top tabs are
   **Year · Habits · Notes · Gratitude**; Habits/Notes are month-contextual (this month's pages),
   Gratitude is last. Every nav is wired: rail JAN–DEC → the 12 months everywhere, year → months
   (+ a per-month notes chip), calendar day → that day, day → back to its month
   (~19k link annotations / PDF). `tools/guide.mjs` builds the companion user guide. The 7-page
   `index.html` remains the hand-authored design sample.

## Conventions
- Stay dependency-free and framework-free. No bundler.
- Keep `index.html` self-contained and each page `1080×1440`.
- Preserve token names (other files + the Figma build depend on them).

## Caveats
- The rotated month-rail renders fine in browsers, but some PDF exporters mishandle vertical
  text — if it shifts on export, outline (vectorise) or rasterise just the month labels.
- Etsy product = the **hyperlinks**; test every link in GoodNotes before publishing.
