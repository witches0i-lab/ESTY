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

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const fontFace = read('assets/fonts/fonts.css');
const tokens = read('css/tokens.css');
const base   = read('css/base.css');
/* same layout/anchors/text everywhere — only the colourway tokens change.
   najeon ('') is the GOYO base; light/hanji are overrides. */
const themes = { najeon: '', light: read('themes/light.css'), hanji: read('themes/hanji.css') };

const SEAL = '<div class="seal"><svg viewBox="0 0 52 16">'
  + '<ellipse cx="6" cy="9" rx="5" ry="3" fill="#74a89f" opacity=".9"/>'
  + '<ellipse cx="17" cy="9" rx="3.3" ry="2.1" fill="#e6bcc7" opacity=".85"/>'
  + '<ellipse cx="25" cy="9" rx="1.9" ry="1.3" fill="#cdbfb0" opacity=".6"/>'
  + '<circle cx="44" cy="7" r="4" fill="#efe4cf" opacity=".85"/></svg></div>';

const gpage = (eyebrow, title, body, foot = '') =>
  `<div class="page"><div class="gpad">${SEAL}
    <div class="g-head"><div class="eyebrow">${eyebrow}</div><h1 class="h1">${title}</h1></div>
    ${body}
    ${foot ? `<div class="g-foot">${foot}</div>` : ''}</div></div>`;

const steps = (items) => `<ol class="steps">${items.map((t) => `<li>${t}</li>`).join('')}</ol>`;
const navlist = (items) => `<ul class="navlist">${items.map(([k, v]) =>
  `<li><span class="nk">${k}</span><span class="nv">${v}</span></li>`).join('')}</ul>`;
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
  <div class="g-rule"><span>162 STICKERS · 3 PACKS</span><span>GOODNOTES · NOTABILITY</span></div>
</div></div>`;

const whatsInside = gpage('What’s inside', 'Your download',
  `<p class="g-body">Everything below arrives with your order. The stickers come as
   individual, pre-cropped PNGs — ready to drop straight onto a page.</p>`
  + files([
    ['goyo-word-label-stamp-tape.zip', 'Phrases, tags, month seals &amp; washi', '59 PNG'],
    ['goyo-widget.zip', 'Trackers, lists &amp; note cards', '25 PNG'],
    ['goyo-shape.zip', 'Circles, blooms, sparkles &amp; frames', '78 PNG'],
    ['goyo-stickerbook.goodnotes', 'A ready-made book — copy &amp; paste', 'BOOK'],
    ['goyo-sticker-guide.pdf', 'This file', 'GUIDE'],
  ]),
  'Every sticker is a transparent PNG at 2× resolution — crisp in GoodNotes, Notability, Noteshelf, and any app that accepts images.');

const gettingStarted = gpage('Getting started', 'Download &amp; unzip',
  steps([
    'Your files are ready the moment payment clears. Download them from Etsy on your iPad — or on a computer, and send them across.',
    'Tap the download; it opens in a new window.',
    'Tap the <b>share</b> icon (the arrow pointing up) and choose <b>Save to Files</b>. Pick a folder you’ll remember.',
    'Open the <b>Files</b> app and tap the <b>.zip</b> — it unzips itself into a folder.',
    'Inside you’ll find one folder per set, each holding its individual pre-cropped stickers.',
  ])
  + tip('A note on storage',
    `Keep the unzipped folder in <b>Files</b> rather than Photos — GoodNotes imports from Files far more smoothly.`));

const method1 = gpage('Method 1 · Elements', 'Best for everyday use',
  `<p class="g-body">Save the stickers into GoodNotes once, then reach them from any
   notebook, forever.</p>`
  + steps([
    'Open any notebook and tap the <b>Elements</b> tool in the toolbar.',
    'Scroll the bottom list to the end and tap the <b>plus</b> sign.',
    'Name the collection — <b>GOYO Shapes</b>, <b>GOYO Widgets</b>, and so on. One collection per folder keeps things tidy.',
    'Tap <b>Import From</b> and find your unzipped folder.',
    'Select the stickers you want, then tap <b>Create</b>.',
  ])
  + tip('Faster · split view',
    `Open <b>Files</b> beside GoodNotes. In Files tap the <b>•••</b>, choose <b>Select</b>, then
     <b>Select All</b> — drag the whole stack into the new collection window and let go.`));

const method23 = gpage('Two more ways', 'Image tool &amp; sticker book',
  `<div class="g-sub">Method 2 · Image tool — quick, one at a time</div>`
  + steps([
    'Open your planner page and select the <b>Image</b> tool.',
    'Tap where you want the sticker, then choose <b>Insert From</b>.',
    'Pick your sticker; drag the corners to resize.',
  ])
  + `<div class="g-sub">Method 3 · Sticker book — copy &amp; paste</div>`
  + steps([
    'Open <b>goyo-stickerbook.goodnotes</b> — tap it in Files and choose <b>Open in GoodNotes</b>.',
    'Open it beside your planner in <b>Split View</b>.',
    'Lasso a sticker, tap the selection, choose <b>Copy</b> — then paste it onto your page.',
  ]));

const goodToKnow = gpage('Good to know', 'Care &amp; terms',
  navlist([
    ['Resizing', 'Every sticker is 2× resolution, so it stays crisp when you scale it up — even on an iPad Pro.'],
    ['Mixing', 'All the sets share one palette. Any sticker sits happily beside any other.'],
    ['Other apps', 'Notability, Noteshelf and GoodNotes all accept these PNGs. Only the <b>.goodnotes</b> book is GoodNotes-only.'],
    ['Personal use', 'These stickers are for your own planning. Please don’t resell, share or redistribute the files.'],
  ])
  + tip('Something not working?',
    `Message me through Etsy and I’ll help you sort it out. Thank you for supporting a small studio.`),
  '고요 · stillness — mother-of-pearl, reimagined quietly · made by a small studio, for you');

const pages = [cover, whatsInside, gettingStarted, method1, method23, goodToKnow];

/* ---- guide styling (shared with tools/guide.mjs, layered after base.css) ---- */
const guideCss = `
html,body{margin:0;padding:0;background:var(--bg);}
body{display:block;}
.page{margin:0 auto;break-after:page;page-break-after:always;background:
  radial-gradient(120% 80% at 50% 28%,var(--surface) 0%,var(--bg) 60%);}
.page:last-of-type{break-after:auto;}
@page{size:1080px 1440px;margin:0;}
@media print{.page{box-shadow:none;}}
.gpad{padding:96px 110px;height:100%;display:flex;flex-direction:column;}
.g-head{margin-bottom:18px;}
.h1{font-size:54px;}
.eyebrow{font-size:13px;}
.g-body,.g-lead{font-family:var(--sans);color:var(--muted);font-size:20px;line-height:1.7;margin:18px 0;}
.g-lead{font-size:22px;color:var(--ink);max-width:760px;}
.g-body b,.g-lead b{color:var(--ink);font-weight:600;}
.g-sub{font-family:var(--sans);font-size:12px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent);margin:34px 0 6px;border-bottom:1px solid var(--accent-line);padding-bottom:9px;}
.steps{counter-reset:s;list-style:none;padding:0;margin:14px 0 6px;}
.steps li{counter-increment:s;position:relative;padding:12px 0 12px 56px;font-size:19px;color:var(--ink);
  line-height:1.55;border-bottom:1px solid var(--hair);}
.steps li::before{content:counter(s);position:absolute;left:0;top:11px;width:34px;height:34px;
  border-radius:50%;border:1px solid var(--accent-line);color:var(--accent);font-family:var(--serif);
  font-size:18px;display:flex;align-items:center;justify-content:center;}
.steps li b{color:var(--accent);font-weight:500;}
.navlist{list-style:none;padding:0;margin:20px 0;}
.navlist li{display:flex;gap:24px;padding:16px 2px;border-bottom:1px solid var(--hair);align-items:baseline;}
.navlist .nk{font-family:var(--serif);font-style:italic;font-size:21px;color:var(--accent);width:210px;flex:none;}
.navlist .nv{font-size:18px;color:var(--muted);line-height:1.55;}
.navlist b,.g-note b{color:var(--ink);}
.g-note{margin-top:28px;border:1px solid var(--accent2-line);background:var(--accent2-fill);
  border-radius:12px;padding:22px 26px;font-size:18px;line-height:1.65;color:var(--muted);}
.g-note-k{font-family:var(--sans);font-size:12px;letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent2);margin-bottom:8px;}
.g-foot{margin-top:auto;padding-top:28px;border-top:1px solid var(--hair);
  font-size:13px;letter-spacing:.08em;color:var(--faint);}
/* file list (what's inside) */
.filelist{list-style:none;padding:0;margin:22px 0 6px;}
.filelist li{display:flex;align-items:center;gap:22px;padding:20px 26px;margin-bottom:14px;
  border:1px solid var(--hair);border-radius:12px;background:var(--surface);}
.filelist .ftext{display:flex;flex-direction:column;gap:5px;min-width:0;}
.filelist .fn{font-family:var(--serif);font-style:italic;font-size:23px;color:var(--ink);line-height:1.1;}
.filelist .fm{font-family:var(--sans);font-size:16px;color:var(--muted);letter-spacing:.01em;}
.filelist .fc{margin-left:auto;flex:none;font-family:var(--sans);font-size:12px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--accent);white-space:nowrap;
  border:1px solid var(--accent-line);border-radius:100px;padding:7px 14px;}
/* welcome / cover */
.g-welcome{align-items:center;text-align:center;justify-content:center;}
.g-welcome .seal{justify-content:center;}
.g-eyebrow{font-size:14px;letter-spacing:.42em;text-transform:uppercase;color:var(--faint);margin-top:8px;}
.g-wordmark{font-family:var(--serif);font-weight:300;font-size:72px;letter-spacing:.36em;
  color:var(--ink);padding-left:.36em;margin:30px 0 16px;}
.g-tag{font-family:var(--serif);font-style:italic;font-size:27px;color:var(--accent);}
.g-welcome .g-lead{margin-top:40px;text-align:center;}
.g-rule{display:flex;justify-content:space-between;width:100%;margin-top:54px;border-top:1px solid var(--hair);
  padding-top:24px;font-size:14px;letter-spacing:.08em;color:var(--faint);}
`;

const body = pages.join('\n');
for (const [theme, themeCss] of Object.entries(themes)) {
  const css = [fontFace, tokens, themeCss, base, guideCss].filter(Boolean).join('\n');
  // No Google Fonts <link> here on purpose: fontFace already embeds Bodoni Moda +
  // Inter as base64, and an external stylesheet link can make Chrome's print
  // pipeline hang waiting on network in offline/sandboxed render environments.
  const out = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GOYO — Sticker guide (${theme})</title>
<style>${css}</style></head><body>
${body}
</body></html>
`;
  mkdirSync(join(root, 'export', theme), { recursive: true });
  writeFileSync(join(root, 'export', theme, 'goyo-sticker-guide.html'), out);
}
console.log(`Built sticker guide (${pages.length} pages × ${Object.keys(themes).length} themes) → export/<theme>/goyo-sticker-guide.html`);
console.log(`Next: node tools/pdf.mjs   → export/<theme>/goyo-sticker-guide-<theme>.pdf`);
