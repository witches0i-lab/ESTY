# CLAUDE.md — witches0i-lab/ESTY

## ── COMMON (applies to every journal theme in this repo) ──

### Repo scope
This is the CODE track only. Design and marketing live elsewhere, NOT here:
- Design: Figma `Ds1jpwqKkL1nkWpTXsJczw` (Etsy-Project)
- Marketing / copy / SEO / pricing / pin status: Notion master hub
  → Read Notion page "🧭 GOYO 현재 상태 (Single Source of Truth)" for cross-track state.
- Chat-side Claude (claude.ai) handles Figma + Notion but CANNOT access this repo.
  Claude Code CANNOT access Figma or Notion. The Notion status page is the bridge.
- Chat-side memory and Claude Code memory are NOT shared. Don't assume shared context — read this file + Notion.

### Stack
Plain static site — no framework, no bundler, no npm dependencies. `tools/*.mjs` use
only Node built-ins (`node:fs`, `node:path`, `node:child_process`, `fetch`/`WebSocket`).
There is no test suite and no linter; correctness is verified visually + via
`docs/link-test.md`'s PDF link-count check.

### Source of truth (READ FIRST)
- `index.html` is the source of truth for **page design/markup** — one hand-authored
  instance of each of the 7 base pages (Cover, Year, Monthly, Daily, Habits, Notes,
  Gratitude; 1080×1440px each), styled by `css/tokens.css` + `css/base.css`, populated
  at load time by `js/journal.js` (date strip, calendar grid, mood/water widgets, etc.)
  and `js/medallion.js` (procedural najeon cover art). Open it with `npm run dev` to
  preview design changes directly.
- **`tools/planner.mjs` does NOT read `index.html`'s page markup** (only its `.cover`
  block, via `sliceClass()`, for the cover art). Every other page (Year, Monthly, Daily,
  Habits, Notes, Gratitude) is a **second, independent copy** of the same markup, built
  as template-literal string functions (`yearPage()`, `monthlyPage()`, `dailyPage()`,
  `habitsPage()`, `monthNotesPage()`, `gratitudePage()`) that loop over real
  month/day data to emit the full undated year (366 days incl. Feb 29, 12 months ×
  monthly+habits+notes pages, 405 pages total).
  **→ Any markup/structure change made in `index.html` for a non-cover page must be
  hand-mirrored into the matching function in `tools/planner.mjs`, or the shipped
  product silently drifts from the design source.** This is the single most important
  gotcha in this repo.
- `planner.html` (repo root) is a **generated build artifact** — `planner.mjs` overwrites
  it on every run as the najeon-only live preview of the full 405-page build. Never
  hand-edit it; don't treat it as canonical.

### Build pipeline (`tools/`)
- `npm run export` (`tools/planner.mjs`) → the real product: per-theme
  `export/<theme>/goyo-print.html` (combined, hyperlinked, 405 undated pages) +
  root `planner.html` (najeon preview). Anchor-ID scheme: `p-cover`, `p-year`,
  `p-m<MM>`, `p-d<MM><DD>`, `p-h<MM>`, `p-n<MM>`, `p-grat` (see `mId/dId/hId/nId`
  helpers) — any new page type must follow this scheme and be wired into both
  `tabs()` (top nav) and `rail()` (month rail).
- `npm run guide` (`tools/guide.mjs`) → 5-page per-theme user guide,
  `export/<theme>/goyo-guide.html`.
- `npm run sticker-guide` (`tools/sticker-guide.mjs`) → 3-page sticker-pack guide,
  `export/goyo/goyo-sticker-guide.html` (single `goyo` theme only — see below).
- Both guides share one design system + component builders — `tools/guide-kit.mjs`
  (`SEAL`, `gpage()`, `steps()`, `navlist()`, `guideCss` with the `--gz-*` type-scale
  tokens). **Edit `guide-kit.mjs` for shared guide layout/type changes; each
  generator only supplies its own copy/page list** (`sticker-guide.mjs` additionally
  layers a small `stickerCss` override to fit its content onto 3 pages instead of 5).
- `npm run pdf` (`tools/pdf.mjs`) → drives a local Chrome/Chromium over raw DevTools
  Protocol (dependency-free, no Puppeteer) to print every `goyo-print.html` /
  `goyo-guide.html` / sticker-guide HTML to PDF, preserving `#anchor` links as PDF
  GoTo links. Requires local Chrome; otherwise prints a manual
  "Print → Save as PDF" fallback and exits cleanly. Known constraints baked into the
  code (don't "fix" these away): `generateTaggedPDF:false` (avoids ~45% size bloat),
  streamed `IO.read` in ~1MB chunks (inlining hangs on 20MB+ files), a 600ms settle
  delay before printing (webfonts/medallion need to finish rendering).
- `npm run build` = export + guide + sticker-guide + pdf, in that order.
- QA: `docs/link-test.md` is the pre-publish checklist (GoodNotes/Notability tap-through
  + a `node -e` one-liner counting `/Subtype /Link` annotations in the built PDF;
  expect ~18,800 across 405 pages for the planner).

### Design-token / theme conventions
- `css/tokens.css` — single source of design tokens (`:root` palette/type/spacing
  variables). Change a variation by editing tokens only; `css/base.css` (layout) should
  never need to change per-theme.
- Colorway files (`themes/light.css`, `themes/hanji.css`) override `:root` tokens and
  add a handful of theme-specific selector overrides (seal fill, cover gradient,
  medallion swap). They must be linked **after** `tokens.css` — later link wins.
  najeon is the unstyled base (no override file); it IS `tokens.css`'s defaults.
- Per-theme cover art lives in `themes/cover/` (SVG `defs` + a pre-baked base64 PNG
  "pine" raster layer per theme). The pine layer is flattened to a single raster
  deliberately — stacked semi-transparent SVG shapes render fine in Chromium but some
  PDF viewers mis-composite nested transparency groups as black; baking to PNG also
  roughly halves final PDF size.
- Keep product lines/themes namespaced; one theme's change must never leak into another.
- When color assignments change, edit CSS rules AND HTML markup together.
- Measure before changing; never guess coordinates/values from memory.
- Don't treat `planner.html` as canonical.

### Undated-design invariant
No year or weekday is ever printed anywhere (design intent: reuse every year).
Day counts are fixed system-wide at `[31,29,31,30,31,30,31,31,30,31,30,31]` (Feb
pinned to 29 so the same file works in leap years) — this constant is duplicated in
`js/journal.js`, `index.html`'s static Monthly sample, and `tools/planner.mjs`'s
`MLEN`; if it ever needs to change, update all three.

## ── GOYO (Journal) — theme-specific ──
- Korean craft-inspired digital wellness journal for iPad (GoodNotes/Notability), undated hyperlinked PDFs.
- Colorways: Najeon (dark, the base), Light (pink/cyan on white), Hanji (warm cream paper, amber/sage — NOT dark, unlike najeon/light being read as "the dark ones"). Keep each colorway isolated.
- Status: journal build COMPLETE (2026-07). Maintenance/edits only.

## ── GOYO Sticker Guide — product-specific ──
- Separate product line: a quick-start guide for the companion GOYO sticker pack (162 stickers), NOT a journal theme.
- Single `goyo` theme only (the Najeon base, dark) — no light/hanji colorways. 3 pages, same GOYO guide design language (seal, type, frame) via `tools/guide-kit.mjs`.
- Build: `tools/sticker-guide.mjs` (`npm run sticker-guide`, also part of `npm run build`) → `export/goyo/goyo-sticker-guide.html` → `.pdf` via `tools/pdf.mjs`.
- The COMMON "7 journal base pages" rule does NOT apply here; keep this product namespaced from the journal.
- Status: build COMPLETE (2026-07). Maintenance/edits only.

## ── Adding a new theme later ──
- Duplicate the GOYO theme-specific section, rename, and fill in that theme's specifics.
- Keep the COMMON section untouched.
- New theme checklist (derived from how light/hanji were built): add `themes/<name>.css`
  (tokens override + seal/cover selector overrides), `themes/cover/<name>.defs.svg` +
  `<name>.pine.b64` (or a `.med-swap` raster swap like hanji's changho PNG), register
  the theme in the `themes` object in both `tools/planner.mjs` and `tools/guide.mjs`,
  and add it to the `themes` array in `tools/pdf.mjs`.
