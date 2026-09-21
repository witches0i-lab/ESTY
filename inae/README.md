# INAE (이내) — line charter

A **separate product line** under JUDE. Not a GOYO theme, not a GOYO colorway.
Decision to start: 2026-09-21 (Jude). Recorded in the Notion master hub under
「🆕 신규 착수 상태」.

## Isolation contract (the reason this folder exists)

INAE shares **zero files** with GOYO. Not tokens, not layout, not page markup,
not cover art, not the guide kit. The only things in common are *format*
constraints that any GoodNotes/Notability product has to satisfy (page size,
print reset, `#anchor` hyperlinking).

Concretely:

| | GOYO | INAE |
|---|---|---|
| design source of truth | `/index.html` | `/inae/index.html` |
| tokens | `/css/tokens.css` | `/inae/css/tokens.css` |
| layout | `/css/base.css` | `/inae/css/base.css` |
| generator | `/tools/planner.mjs` | `/inae/tools/build.mjs` |
| output | `/export/<theme>/goyo-*.html` | `/export/inae/inae-*.html` |
| anchor prefix | `p-*` | `i-*` |

**A change in one line must never require touching the other.** If you find
yourself wanting to import across the boundary, extract the shared thing into
a third, line-neutral module instead — don't reach sideways.

## What is decided

- Separate line, separate namespace. (2026-09-21, Jude)
- Etsy vocabulary is **`planner`, not `journal`.** Notion's Marketplace Insights
  sweep (12 search terms, no exceptions) puts every `planner` term at High~Very
  high conversion and every `journal` term at Low~Typical. GOYO is already
  published as "journal" and is paying to unwind that. INAE is a blank slate, so
  it starts on the right noun — in the product name, filenames, SKU, page titles
  and listing copy alike.

## What is NOT decided (blocking real page work)

- **Product form.** Undated perpetual planner (GOYO's 405-page shape), or a
  different page set entirely?
- **Page set.** Which pages, how many, what each one does.
- **Motif / palette / type.** The only input that exists today is the Framer
  landing teaser: *색 · 달 · 구름 · 별* (color, moon, cloud, star). There is no
  INAE page in the Figma file `Ds1jpwqKkL1nkWpTXsJczw` yet.
- **Colorways.** Whether INAE ships one look or several.

Until those land, `inae/css/tokens.css` values are **provisional placeholders**
and `inae/index.html` holds a single Cover page whose only job is to prove the
pipeline runs end to end.

## Build

```bash
npm run inae:export     # inae/index.html + tokens → export/inae/inae-print.html
npm run dev             # preview inae/index.html at :5173
```

There is deliberately **no `inae/tools/pdf.mjs` yet.** `/tools/pdf.mjs` is a
172-line dependency-free Chrome DevTools Protocol driver, and copying it for a
placeholder cover would mean fixing every future bug twice. Until INAE has a
real page set, render by hand (Chrome → Print → Save as PDF → Background
graphics ON → Margins None). **When INAE's page set is final, extract the CDP
driver into a line-neutral module and have both lines call it** rather than
duplicating it.

## Known gotcha inherited from GOYO

GOYO's single worst trap is that `index.html` and `tools/planner.mjs` hold *two
independent copies* of the same page markup, so a design edit in one silently
drifts from the other. **Do not reproduce that here.** Whatever INAE's page set
turns out to be, `inae/tools/build.mjs` should read its markup from
`inae/index.html` rather than re-declaring it as template literals.
