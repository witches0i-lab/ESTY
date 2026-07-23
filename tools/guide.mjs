/* ============================================================
   GOYO — user guide generator  (second sellable file)
   Produces an on-brand quick-start guide that ships alongside the
   planner: welcome, how the hyperlinks work, importing to
   GoodNotes/Notability, reusing pages, and care tips.
   Output: export/<theme>/goyo-guide.html  (render → goyo-guide-<theme>.pdf via pdf.mjs)
   Dependency-free (Node built-ins only).

     node tools/guide.mjs        # or: npm run guide
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEAL, gpage, steps, navlist, guideCss } from './guide-kit.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const fontFace = read('assets/fonts/fonts.css');
const tokens = read('css/tokens.css');
const base   = read('css/base.css');
/* same layout/anchors/text everywhere — only the colourway tokens change.
   najeon ('') is the GOYO base; light/hanji are overrides. */
const themes = { najeon: '', light: read('themes/light.css'), hanji: read('themes/hanji.css') };

/* ---- pages ---- */
const welcome = `<div class="page"><div class="gpad g-welcome">
  ${SEAL}
  <div class="g-eyebrow">Quick-start guide</div>
  <div class="g-wordmark">G O Y O</div>
  <div class="g-tag">a quiet daily ritual</div>
  <p class="g-lead">Thank you for your purchase — and for supporting a small studio.
    GOYO is a hyperlinked wellness journal for <b>GoodNotes</b> and <b>Notability</b>:
    an <b>undated</b> full year — a page for <b>every day</b> (366, leap-year ready), twelve monthly
    calendars, and for each month its own habit tracker and notes page, plus a gratitude
    log — every page a tap away.</p>
  <div class="g-rule"><span>STILLNESS, ONE PAGE AT A TIME</span><span>UNDATED · REUSE EVERY YEAR</span></div>
</div></div>`;

const howItWorks = gpage('How it works', 'Tap to travel',
  `<p class="g-body">Your journal is fully hyperlinked. Nothing to scroll through —
   tap, and you are there. Use a reader that follows internal links (GoodNotes or Notability).</p>`
  + navlist([
    ['Month rail', 'The vertical JAN–DEC strip on the right edge jumps to any month, from any page.'],
    ['Year page', 'Tap any month to open its calendar.'],
    ['Monthly calendar', 'Tap any date to open that day’s page.'],
    ['Daily page', 'Tap the large date number (or the month name) to return to the month.'],
    ['Monthly notes', 'On the year page, tap a month’s “notes” chip to open its notes page.'],
    ['Top tabs', 'Year · Habits · Notes · Gratitude. Habits and Notes open the current month’s pages; Gratitude is the last page.'],
  ]),
  'Tip: in GoodNotes, make sure you are in <b>reading / hand</b> mode (not the pen) so a tap follows the link instead of drawing.');

const getSetUp = gpage('Get set up', 'Importing your journal',
  `<p class="g-body">After purchase the PDF is available to download right away. Save it somewhere
   easy to find, then add it to your note-taking app.</p>
   <div class="g-sub">GoodNotes (iPad / iPhone)</div>`
  + steps([
    'Tap the downloaded file to open it.',
    'Tap the <b>Share</b> icon and choose <b>Open in GoodNotes</b> (or the GoodNotes icon).',
    'When GoodNotes opens, a window pops up.',
    'Rename the file if you like, and pick a folder.',
    'Choose <b>Import as New Document</b> and tap <b>Import</b>.',
  ])
  + `<div class="g-sub">Notability</div>
   <p class="g-body">Share → <b>Open in Notability</b>, or import from the Notability library.
   Internal links work the same way.</p>`,
  'Undated by design — no fixed year, so you start any day and reuse it every January. Write in the dates (and mark the weekday) that suit you.');

const makeItYours = gpage('Make it yours', 'Reuse &amp; rearrange',
  `<div class="g-sub">Duplicate a page (e.g. extra daily or notes)</div>`
  + steps([
    'Open the page you want to copy.',
    'Tap the <b>•••</b> (menu) in the upper-right corner.',
    'Choose <b>Copy</b>, then add a new page where you want it and <b>Paste Page</b>.',
  ])
  + `<div class="g-sub">Move a page</div>`
  + steps([
    'Tap the <b>four-square</b> (thumbnail) icon, top-left.',
    'Drag the page to its new spot in the document.',
  ])
  + `<div class="g-note">
     <b>Keep your links working.</b> Move and duplicate freely — links travel with the pages.
     Just don’t delete the original section/template pages, or some links will have nowhere to land.
     Copied pages keep their contents; clear them with the <b>eraser</b> or <b>lasso</b> tool to start fresh.
   </div>`);

const thanks = gpage('With gratitude', 'Enjoy the stillness',
  `<p class="g-body">I hope GOYO becomes a calm corner of your day. If it does, a quick
   <b>review</b> on the shop means the world and helps other people find it.</p>
   <p class="g-body">Questions, a hiccup with a link, or a colourway you wish existed?
   Message me through the shop — I read every note.</p>`,
  'najeon · 나전 — mother-of-pearl, reimagined quietly · made by a small studio, for you');

const pages = [welcome, howItWorks, getSetUp, makeItYours, thanks];

/* guide styling (type scale + frame + components) is shared with the
   sticker guide — see tools/guide-kit.mjs (imported as guideCss above). */

const body = pages.join('\n');
for (const [theme, themeCss] of Object.entries(themes)) {
  const css = [fontFace, tokens, themeCss, base, guideCss].filter(Boolean).join('\n');
  // No Google Fonts <link> here on purpose: fontFace already embeds Bodoni Moda +
  // Inter as base64, and an external stylesheet link can make Chrome's print
  // pipeline hang waiting on network in offline/sandboxed render environments.
  const out = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GOYO — User guide (${theme})</title>
<style>${css}</style></head><body>
${body}
</body></html>
`;
  mkdirSync(join(root, 'export', theme), { recursive: true });
  writeFileSync(join(root, 'export', theme, 'goyo-guide.html'), out);
}
console.log(`Built user guide (${pages.length} pages × ${Object.keys(themes).length} themes) → export/<theme>/goyo-guide.html`);
console.log(`Next: node tools/pdf.mjs   → export/<theme>/goyo-guide-<theme>.pdf`);
