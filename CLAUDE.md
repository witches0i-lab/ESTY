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

### Source of truth (READ FIRST)
- `index.html` is the source of truth for journal pages. NOT planner.html.
- Each journal theme has 7 base pages: Cover, Year, Monthly, Daily, Habits, Notes, Gratitude. Each 1080×1440px.

### Conventions (all themes)
- Keep product lines/themes namespaced; one theme's change must never leak into another.
- When color assignments change, edit CSS rules AND HTML markup together.
- Measure before changing; never guess coordinates/values from memory.
- Don't treat planner.html as canonical.

## ── GOYO (Journal) — theme-specific ──
- Korean craft-inspired digital wellness journal for iPad (GoodNotes/Notability), undated hyperlinked PDFs.
- Colorways: Najeon (dark), Light (pink), Hanji (cream). Keep each colorway isolated.
- Status: journal build COMPLETE (2026-07). Maintenance/edits only.

## ── GOYO Sticker Guide — product-specific ──
- Separate product line: a quick-start guide for the companion GOYO sticker pack (162 stickers), NOT a journal theme.
- Single `goyo` theme only (the Najeon base, dark) — no light/hanji colorways. 3 pages, same GOYO guide design language (seal, type, frame).
- Build: `tools/sticker-guide.mjs` (`npm run sticker-guide`, also part of `npm run build`) → `export/goyo/goyo-sticker-guide.html` → `.pdf` via `tools/pdf.mjs`.
- The COMMON "7 journal base pages" rule does NOT apply here; keep this product namespaced from the journal.
- Status: build COMPLETE (2026-07). Maintenance/edits only.

## ── Adding a new theme later ──
- Duplicate the GOYO theme-specific section, rename, and fill in that theme's specifics.
- Keep the COMMON section untouched.
