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
