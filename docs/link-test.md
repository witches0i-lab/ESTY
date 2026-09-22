# GOYO — Hyperlink test checklist

The Etsy product **is** the hyperlinks. Run this before publishing any PDF.
Build everything first:

```bash
npm run build       # planner + guide + PDFs for every theme
# → export/<theme>/goyo-<theme>.pdf       (planner, ~405 undated pages)
# → export/<theme>/goyo-guide-<theme>.pdf (user guide)
```

`npm run pdf` drives a pre-installed Chromium; if none is found it prints a
manual fallback: open `export/<theme>/goyo-print.html` in Chrome →
**Print → Save as PDF**, with **Background graphics ON** and **Margins: None**.
Fonts (Bodoni Moda + Inter) are embedded, so no network is needed at render time.

## Link map (what should be wired)
- **Top tabs** (every page except cover) → Year · Habits · Notes · Gratitude.
  Habits and Notes are **month-contextual** (open the current month's pages);
  Gratitude is the last page.
- **Month rail** (JAN–DEC) → the 12 monthly pages, from anywhere.
- **Year-at-a-glance** → each month; each card's "[Month] notes" chip → that
  month's notes page.
- **Monthly calendar** → each date → that day's page; the "‹ Year" eyebrow → year.
- **Daily page** → date number / month name → back to that month.
- **Cover** → no links (intentional).

Expected count in a built planner PDF: **~18,800 link annotations** across
**405 pages**. Quick sanity check without opening a reader:

```bash
node -e "const d=require('fs').readFileSync('export/najeon/goyo-najeon.pdf');\
console.log('links:',(d.toString('latin1').match(/\/Subtype\s*\/Link/g)||[]).length)"
```

## In GoodNotes (iPad) — the real test
1. Import `goyo-<theme>.pdf` (e.g. `goyo-najeon.pdf`) as a document (not as an image), in **reading/hand** mode.
2. Tap each **top tab** → lands on the matching section; on a month's day/monthly/
   habits/notes page, **Habits** and **Notes** open *that* month's pages.
3. Tap any **month** on the rail → lands on that monthly page.
4. On the **year** page, tap a month (→ its calendar) and its **notes** chip (→ its notes).
5. On a **monthly** page, tap a date → that day; on a **daily** page, tap the big
   date number → back to the month.
6. Confirm the **cover** has no stray tap targets.
7. Scribble on a page, follow a link, come back — ink persists (links don't flatten).

## In Notability
- Repeat the taps above. Notability follows the same in-document `#anchor` destinations.

## Visual / print
- [ ] Each page is exactly **1080×1440** (portrait), no margins, no workspace chrome/labels.
- [ ] Background graphics present (najeon dark / light pink / hanji warm as chosen).
- [ ] Rotated month-rail text not shifted (see CLAUDE.md caveat; vectorise/raster if it drifts).
- [ ] Fonts embedded — Bodoni Moda (serif) + Inter (sans) render without a network.
- [ ] No pre-filled trackers (mood/energy/sleep/water/habits all blank).

## Per edition
Three colourways, two files each — najeon is the base; light & hanji change only
the colourway tokens (layout, anchors and text positions are identical):
`export/najeon/`, `export/light/`, `export/hanji/` → `goyo-<theme>.pdf` + `goyo-guide-<theme>.pdf`
(e.g. `goyo-najeon.pdf`, `goyo-guide-najeon.pdf`).

---

# INAE Practice — Hyperlink test checklist

Separate product line, separate file. Spec: `docs/drawingbook-spec.md` §7.

```bash
npm run drawingbook          # → export/inae/inae-practice.html
node tools/pdf.mjs inae      # → export/inae/inae-practice.pdf (only this target)
```

The typefaces are **subset to a closed glyph inventory** (the book's copy is
fixed at build time — the reader draws, never types). If the copy changes,
re-bake them, which needs network:

```bash
node tools/drawingbook.mjs   # 1. emit pages
node tools/inae-fonts.mjs    # 2. re-subset to what those pages use
node tools/drawingbook.mjs   # 3. re-emit; prints any glyph outside the subset
```

`npm run build` deliberately does **not** call `inae-fonts.mjs` — the baked
`assets/inae/fonts.css` is committed so the normal build stays offline.

## Link map
- **Top tabs** (7: 目次 線 墨 餘白 形 自由 記錄) → the first page of each section,
  from every page **except the cover**, which carries no nav (matches Figma 881:1724).
- **目次 (x03)** → all 57 entries: 52 drills + 3 free templates + 2 record pages.
- **Drill log (r01)** → each of the 52 checkboxes → that drill.

Expected: **60 pages**, **522 link annotations** = 413 tabs (7 × 59) + 57 contents
+ 52 drill log.

```bash
node -e "const d=require('fs').readFileSync('export/inae/inae-practice.pdf').toString('latin1');\
console.log('pages:',(d.match(/\/Type\s*\/Page[^s]/g)||[]).length,\
'links:',(d.match(/\/Subtype\s*\/Link/g)||[]).length)"
```

## Typeface check (spec §7)
Only the three INAE faces may appear; any system fallback means a glyph escaped
the subset or a CJK run landed in a latin-only stack.

```bash
node -e "const d=require('fs').readFileSync('export/inae/inae-practice.pdf').toString('latin1');\
console.log([...new Set((d.match(/\/BaseFont\s*\/([A-Za-z0-9+-]+)/g)||[]).map(x=>x.split('/').pop()))].join('\n'))"
# expect exactly: Inter-Medium, NotoSerifKR-Regular, Newsreader-Light
# and zero of: Cormorant, Courier, DejaVu, Liberation, WenQuanYi
```

## In GoodNotes / Notability
1. Import `inae-practice.pdf` as a document, reading/hand mode.
2. Tap each of the 7 tabs → lands on that section's first page.
3. On 目次, tap entries from each 部 → the right drill, folio matches.
4. On the drill log, tap several numbers → the matching drill.
5. Confirm the **cover** has no tap targets.
6. Draw on a drill, follow a link, come back — ink persists.

## Cell centring (layout A)
`npm run inae-audit` renders the book and measures, in pixels, where the ink
actually lands inside all 188 drill cells. It reports anything off-centre by
more than 5px, or art crowding the cell frame that was not meant to fill it.

Pixels, not SVG geometry: `getBBox()` reports geometry *before* clipping, so a
hatch drawn long and clipped to its box measures as if it escaped the cell, and
masked shading measures as the whole cell. The rendered page is the only honest
source. Two pages are off-centre on purpose and are declared in the tool:
`s07` (balancing the given mass IS the drill) and `f13`'s YOURS axis (placed
where the cone's axis is, so a cone drawn on it lands centred).

- [ ] `npm run inae-audit` exits clean.

## Visual / print
- [ ] Every page exactly **1080×1440**, no margins, no workspace chrome.
- [ ] Paper texture present on all 60 pages (one shared raster, embedded once).
- [ ] Meta row DRILL numbers match spec §5; folios run 1–60 unbroken.
- [ ] No 目次 section straddles the two-column break.
- [ ] **No year, weekday or date printed anywhere** (undated invariant).
