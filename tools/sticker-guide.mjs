/* ============================================================
   GOYO — sticker guide generator  (companion to the sticker set)
   The GOYO sticker pack ships with its own quick-start guide, built
   in the exact GOYO guide design language (same seal, type, frame and
   tokens as tools/guide.mjs — only the words differ). Content: what's
   in the download, how to get set up, and three ways to use the
   stickers in GoodNotes/Notability, plus care & terms.
   Output: export/<theme>/goyo-sticker-guide.html
           (render → goyo-sticker-guide-<theme>.pdf via pdf.mjs)
   Dependency-free (Node built-ins only).

     node tools/sticker-guide.mjs        # or: npm run sticker-guide
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEAL, gpage, steps, guideCss } from './guide-kit.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const fontFace = read('assets/fonts/fonts.css');
const tokens = read('css/tokens.css');
const base   = read('css/base.css');
/* The sticker guide ships as a single 'goyo' theme — the GOYO base
   (najeon dark colourway, no override). Unlike the planner and user guide
   it is not built per-colourway. */
const THEME = 'goyo';

/* sticker-guide-only helpers (the shared guide parts come from guide-kit) */
const files = (items) => `<ul class="filelist">${items.map(([n, m, c]) =>
  `<li><span class="ftext"><span class="fn">${n}</span><span class="fm">${m}</span></span>`
  + `<span class="fc">${c}</span></li>`).join('')}</ul>`;
const tip = (label, body) =>
  `<div class="g-note"><div class="g-note-k">${label}</div>${body}</div>`;

/* ---- pages ---- */
const cover = `<div class="page"><div class="gpad g-welcome">
  ${SEAL}
  <div class="g-eyebrow">Sticker guide</div>
  <div class="g-wordmark">G O Y O</div>
  <div class="g-tag">stickers for a quiet page · 고요</div>
  <p class="g-lead">Thank you for your purchase — and for supporting a small studio.
    A set of <b>162</b> hand-finished stickers to mark, tag and soften your GOYO pages:
    phrases and month seals, trackers and note cards, blooms, sparkles and frames.
    Transparent <b>PNG</b> at <b>2×</b> for <b>GoodNotes</b> and <b>Notability</b>, plus a
    ready-made sticker book for copy &amp; paste.</p>
  <div class="g-rule"><span>162 STICKERS · SIX SETS</span><span>GOODNOTES · NOTABILITY</span></div>
</div></div>`;

/* Page 2 — what's inside + getting set up, on one page */
const download = gpage('What’s inside · set-up', 'Your download',
  `<p class="g-body">Six sticker sets — phrases, tags, month seals, washi, widgets and
   shapes — bundled into three tidy <b>.zip</b> files, plus a ready-made book. All are
   individual, pre-cropped PNGs at 2×, ready to drop onto a page.</p>`
  + files([
    ['goyo-word-label-stamp-tape.zip', 'Phrases, tags, month seals &amp; washi', '59 PNG'],
    ['goyo-widget.zip', 'Trackers, lists &amp; note cards', '25 PNG'],
    ['goyo-shape.zip', 'Circles, blooms, sparkles &amp; frames', '78 PNG'],
    ['goyo-stickerbook.goodnotes', 'A ready-made book — copy &amp; paste', 'BOOK'],
    ['goyo-sticker-guide.pdf', 'This file', 'GUIDE'],
  ])
  + `<div class="g-sub">Download &amp; unzip</div>`
  + steps([
    'Your files are ready the moment payment clears — download them from Etsy.',
    'Tap the <b>share</b> icon and choose <b>Save to Files</b>. Pick a folder you’ll remember.',
    'Open the <b>Files</b> app and tap the <b>.zip</b> — it unzips itself into a folder.',
    'Inside, each set has its own folder of individual, pre-cropped stickers.',
  ]),
  'Keep the unzipped folder in Files rather than Photos — GoodNotes imports from Files far more smoothly.');

/* Page 3 — the three ways to use them + care, on one page */
const useThem = gpage('Using your stickers', 'Three ways in',
  `<div class="g-sub">Method 1 · Elements — save once, reuse forever</div>`
  + steps([
    'Open any notebook and tap the <b>Elements</b> tool, then scroll to the end of the list and tap the <b>plus</b> sign.',
    'Name the collection (<b>GOYO Shapes</b>, <b>GOYO Widgets</b>…), tap <b>Import From</b> and pick your folder.',
    'Select the stickers you want, then tap <b>Create</b>.',
  ])
  + `<div class="g-sub">Method 2 · Image tool — one at a time</div>`
  + steps([
    'On your planner page, select the <b>Image</b> tool and choose <b>Insert From</b>.',
    'Pick a sticker; drag the corners to resize.',
  ])
  + `<div class="g-sub">Method 3 · Sticker book — copy &amp; paste</div>`
  + steps([
    'Open <b>goyo-stickerbook.goodnotes</b> beside your planner in <b>Split View</b>.',
    'Lasso a sticker, choose <b>Copy</b>, then paste it onto your page.',
  ])
  + tip('Good to know',
    `Every sticker is 2× — crisp when you scale it up. All six sets share one palette, so anything
     pairs. Notability, Noteshelf and GoodNotes accept the PNGs (the <b>.goodnotes</b> book is
     GoodNotes-only). For your own planning, please don’t resell or share. Something off?
     Message me through Etsy — and thank you for supporting a small studio.`),
  '고요 · stillness — mother-of-pearl, reimagined quietly · made by a small studio, for you');

const pages = [cover, download, useThem];

/* sticker-guide-only styling (the shared guide system comes from guideCss /
   guide-kit). Two components are unique to the sticker guide — the
   "what's inside" file list and the labelled note box. This file is also
   denser than the 5-page user guide: it folds the same content into three
   pages, so it re-points the shared --gz-* content sizes a notch smaller
   and tightens the vertical rhythm. Only the sticker guide sees this — the
   user guide keeps the guide-kit defaults. */
const stickerCss = `
:root{
  --gz-feature:19px;  /* lead + filename + emphasis (guide default 22) */
  --gz-body:17px;     /* body copy               (guide default 20) */
  --gz-body-sm:15px;  /* steps + notes           (guide default 18) */
  --gz-meta:14px;     /* file meta               (guide default 16) */
}
.gpad{padding:88px 110px;}
.steps li{padding:9px 0 9px 52px;}
.steps li::before{width:30px;height:30px;top:9px;}
.g-sub{margin:26px 0 4px;}
.g-note{margin-top:22px;padding:20px 24px;}
.g-note-k{font-family:var(--sans);font-size:var(--gz-label);letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent2);margin-bottom:8px;}
/* file list (what's inside) */
.filelist{list-style:none;padding:0;margin:18px 0 4px;}
.filelist li{display:flex;align-items:center;gap:22px;padding:15px 24px;margin-bottom:10px;
  border:1px solid var(--hair);border-radius:12px;background:var(--surface);}
.filelist .ftext{display:flex;flex-direction:column;gap:5px;min-width:0;}
.filelist .fn{font-family:var(--serif);font-style:italic;font-size:var(--gz-feature);color:var(--ink);line-height:1.1;}
.filelist .fm{font-family:var(--sans);font-size:var(--gz-meta);color:var(--muted);letter-spacing:.01em;}
.filelist .fc{margin-left:auto;flex:none;font-family:var(--sans);font-size:var(--gz-label);letter-spacing:.14em;
  text-transform:uppercase;color:var(--accent);white-space:nowrap;
  border:1px solid var(--accent-line);border-radius:100px;padding:7px 14px;}
`;

const body = pages.join('\n');
const css = [fontFace, tokens, base, guideCss, stickerCss].filter(Boolean).join('\n');
// No Google Fonts <link> here on purpose: fontFace already embeds Bodoni Moda +
// Inter as base64, and an external stylesheet link can make Chrome's print
// pipeline hang waiting on network in offline/sandboxed render environments.
const out = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GOYO — Sticker guide</title>
<style>${css}</style></head><body>
${body}
</body></html>
`;
mkdirSync(join(root, 'export', THEME), { recursive: true });
writeFileSync(join(root, 'export', THEME, 'goyo-sticker-guide.html'), out);
console.log(`Built sticker guide (${pages.length} pages) → export/${THEME}/goyo-sticker-guide.html`);
console.log(`Next: node tools/pdf.mjs   → export/${THEME}/goyo-sticker-guide.pdf`);
