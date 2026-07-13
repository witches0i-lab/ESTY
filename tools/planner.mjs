/* ============================================================
   GOYO — full-year planner generator  (undated / perpetual)
   Builds the real product: cover, year-at-a-glance, 12 monthly
   pages, every day of the year (366 incl. Feb 29 so it works in
   leap years too), per-month habit pages, a weekly reflection, a
   gratitude log, and notes. No year and no weekday are printed —
   it is undated, reuse it every year. All wired with internal
   #anchors:
     • month rail (JAN–DEC) → the 12 monthly pages, everywhere
     • year-at-a-glance     → each month
     • monthly calendar day → that day's page
     • daily page number/month → back to its month
   Output: export/<theme>/goyo-print.html (combined, hyperlinked) +
   planner.html (live preview, najeon base). Render PDFs with
   `node tools/pdf.mjs`.  Dependency-free (Node built-ins only).

     node tools/planner.mjs        # or: npm run export
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const fontFace  = read('assets/fonts/fonts.css');   // base64-embedded serif/sans
const tokens    = read('css/tokens.css');
const base      = read('css/base.css');
const medallion = read('js/medallion.js');
const html      = read('index.html');

const themes = { najeon: '', light: read('themes/light.css'), hanji: read('themes/hanji.css') };
/* lift the procedural cover markup straight from the design sample */
const coverInner = sliceClass(html, 'cover');

/* per-theme cover packs (defs + medallion palette/opacity); najeon is the base.
   light has its own pink artwork; hanji falls back to najeon until designed.
   Every theme's pine is pre-baked to a flat PNG (themes/cover/<theme>.pine.b64):
   many stacked semi-transparent SVG shapes render fine in Chromium/pymupdf/
   poppler but some PDF viewers flatten nested transparency groups incorrectly
   and render the overlaps as black — baking to one raster layer sidesteps that
   entirely, and also roughly halves the final PDF size (one flat image per
   cover vs. thousands of tiny vector paths repeated as PDF XObjects). */
const COVER = {
  najeon: { defs: read('themes/cover/najeon.defs.svg'), med: '',
            pineB64: read('themes/cover/najeon.pine.b64') },
  light:  { defs: read('themes/cover/light.defs.svg'),  med: '',
            pineB64: read('themes/cover/light.pine.b64') },
};
const coverPack = (theme) => COVER[theme] || COVER.najeon;

/* hanji swaps the whole medallion for a raster changho PNG via .med-swap.
   themes/hanji.css points at assets/goyo-cover-hanji.png (a relative file
   URL that won't resolve from export/<theme>/); for the print/PDF build we
   inline it as a base64 data URL so Chrome renders it offline. */
const coverSwapCss = {
  hanji: `.med-swap{background-image:url(data:image/png;base64,${read('themes/cover/hanji.cover.b64').trim()})!important;}`,
};
const coverFor = (theme) => {
  let inner = coverInner.replace(/<defs>[\s\S]*?<\/defs>/, coverPack(theme).defs);
  const pine = coverPack(theme).pineB64;
  if (pine) {
    inner = inner.replace(
      /<g clip-path="url\(#discClip\)" id="art"><\/g>/,
      `<image clip-path="url(#discClip)" x="0" y="0" width="760" height="760" href="data:image/png;base64,${pine}"/>`
    );
  }
  return inner;
};

/* ---- month data (undated / perpetual — Feb has 29 for leap years) ---- */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON3 = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MLEN = [31,29,31,30,31,30,31,31,30,31,30,31];
const p2 = (n) => String(n).padStart(2, '0');
const dim = (m) => MLEN[m - 1];                                        // days in month, 1-based

/* ---- ids ---- */
const mId = (m) => `p-m${p2(m)}`;
const dId = (m, d) => `p-d${p2(m)}${p2(d)}`;
const hId = (m) => `p-h${p2(m)}`;
const nId = (m) => `p-n${p2(m)}`;

/* ---- mood faces: Google Material Symbols (sentiment_* scale) ---- */
const MOOD_PATHS = [
  'M480-260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260ZM312-520l44-42 42 42 42-42-84-86-86 86 42 42Zm250 0 42-42 44 42 42-42-86-86-84 86 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
  'M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 260q68 0 123.5-38.5T684-400h-66q-22 37-58.5 58.5T480-320q-43 0-79.5-21.5T342-400h-66q25 63 80.5 101.5T480-260Zm0 180q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
  'M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm20 180h240v-60H360v60ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
  'M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm140 100q-68 0-123.5 38.5T276-280h66q22-37 58.5-58.5T480-360q43 0 79.5 21.5T618-280h66q-25-63-80.5-101.5T480-420Zm0 340q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
  'M480-420q-68 0-123.5 38.5T276-280h408q-25-63-80.5-101.5T480-420Zm-168-60 44-42 42 42 42-42-42-42 42-44-42-42-42 42-44-42-42 42 42 44-42 42 42 42Zm250 0 42-42 44 42 42-42-42-42 42-44-42-42-44 42-42-42-42 42 42 44-42 42 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z',
];
const moodFaces = () => MOOD_PATHS.map((d) =>
  `<svg class="moodface" viewBox="0 -960 960 960"><path d="${d}"/></svg>`).join('');

/* ---- water glass with water (pretty tumbler) ---- */
const CUP_SVG = '<svg class="cup" viewBox="0 0 24 26">'
  + '<path class="water" d="M6.75 13 Q9 11.4 12 13 Q15 14.6 17.25 13 L16.9 22.9 Q16.85 23.5 16.3 23.5 H7.7 Q7.15 23.5 7.1 22.9 Z"/>'
  + '<path class="glass" d="M5 3 H19 L17.4 23 Q17.3 24 16.3 24 H7.7 Q6.7 24 6.6 23 Z"/></svg>';

/* ---- shared chrome ---- */
const SEAL = '<div class="seal"><svg viewBox="0 0 52 16">'
  + '<ellipse cx="6" cy="9" rx="5" ry="3" fill="#74a89f" opacity=".9"/>'
  + '<ellipse cx="17" cy="9" rx="3.3" ry="2.1" fill="#e6bcc7" opacity=".85"/>'
  + '<ellipse cx="25" cy="9" rx="1.9" ry="1.3" fill="#cdbfb0" opacity=".6"/>'
  + '<circle cx="44" cy="7" r="4" fill="#efe4cf" opacity=".85"/></svg></div>';

function tabs(activeId, ctxMonth = 1) {
  // Habits & Notes are month-contextual (this month's pages); Gratitude is the last page.
  const items = [['Year','p-year'],['Habits',hId(ctxMonth)],['Notes',nId(ctxMonth)],['Gratitude','p-grat']];
  return '<div class="tabs">' + items.map(([label, id]) =>
    `<a class="tab${id === activeId ? ' on' : ''}" href="#${id}">${label}</a>`).join('') + '</div>';
}
function rail(activeMonth = 0) {
  return '<div class="rail">' + MON3.map((mo, i) =>
    `<a class="rm${i + 1 === activeMonth ? ' on' : ''}" href="#${mId(i + 1)}">${mo}</a>`).join('') + '</div>';
}
const page = (id, inner) => `<div class="page" id="${id}">${inner}</div>`;

/* ---- pages ---- */
function coverPage(theme) {
  return page('p-cover', coverFor(theme));
}

function yearPage() {
  const cards = MONTHS.map((name, i) => {
    const m = i + 1, n = dim(m);
    let cells = '';
    for (let d = 1; d <= n; d++) cells += `<i>${d}</i>`;
    return `<div class="ycard">
      <a class="ym" href="#${mId(m)}">${name}</a>
      <a class="ynotes" href="#${nId(m)}">${name} notes</a>
      <a class="yg" href="#${mId(m)}">${cells}</a></div>`;
  }).join('');
  const inner = `${tabs('p-year')}${rail()}<div class="content">${SEAL}
    <div class="phead"><div><div class="eyebrow">At a glance</div><h1 class="h1">Your <em>year</em></h1></div>
      <div class="pmeta">YEAR 20＿＿<br>TAP A MONTH TO BEGIN</div></div>
    <div class="yag">${cards}</div></div>`;
  return page('p-year', inner);
}

function monthlyPage(m) {
  const n = dim(m);
  let cal = '';
  const cells = Math.ceil(n / 7) * 7;
  for (let i = 0; i < cells; i++) {
    const day = i + 1;
    if (day > n) cal += `<div class="cell dim"></div>`;
    else cal += `<a class="cell" href="#${dId(m, day)}">${day}</a>`;
  }
  const inner = `${tabs(mId(m), m)}${rail(m)}<div class="content">${SEAL}
    <div class="phead"><div><div class="eyebrow"><a href="#p-year">‹ Year</a> · Month ${p2(m)} / 12</div>
      <h1 class="h1">${MONTHS[m - 1]}</h1></div></div>
    <div class="hr white spaced"></div>
    <div class="cal">${cal}</div>
    <div class="m-single"><div class="lbl">Intention</div><div class="ln"></div></div>
    <div class="m-single"><div class="lbl">Focus</div><div class="ln"></div></div>
    <div class="m-foot">
      <div class="m-col"><div class="lbl">This month I want to feel</div><div class="lines"></div></div>
      <div class="m-col"><div class="lbl">Small joys</div><div class="lines"></div></div>
    </div></div>`;
  return page(mId(m), inner);
}

function dailyPage(m, d) {
  const n = dim(m);
  let strip = '';
  for (let i = 1; i <= n; i++) strip += `<a class="${i === d ? 'on' : ''}" href="#${dId(m, i)}">${i}</a>`;
  const wx = `<div class="wxr">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><circle cx="12" cy="12" r="4.2"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17 17l1.5 1.5M18.5 5.5L17 7M7 17l-1.5 1.5" stroke-linecap="round"/></svg>
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M7 18a4 4 0 010-8 5 5 0 019.6-1.5A3.5 3.5 0 0117 18H7z" stroke-linejoin="round"/></svg>
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><path d="M7 15a4 4 0 010-8 5 5 0 019.6-1.5A3.5 3.5 0 0117 15H7z" stroke-linejoin="round"/><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" stroke-linecap="round"/></svg>
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.3"><circle cx="8" cy="8" r="3"/><path d="M11 17a3.5 3.5 0 01.5-7 4.3 4.3 0 018.2 1.3A3 3 0 0119 17h-8z" stroke-linejoin="round"/></svg></div>`;
  let cups = '';
  for (let i = 0; i < 7; i++) cups += CUP_SVG;
  const left = `<div class="dcol-l">
    <div class="sec dph">Morning · Intention</div>
    <div class="lbl" style="margin-top:16px">Today's affirmation</div><div class="box" style="height:200px"></div>
    <div class="lbl" style="margin-top:18px">Today's weather</div>${wx}
    <div class="sec dph dph-lg">Well-being</div>
    <div class="row"><div class="k">Mood</div><div class="v"><div class="moods">${moodFaces()}</div></div></div>
    <div class="row"><div class="k">Energy</div><div class="v"><div class="ebar"><i style="height:9px"></i><i style="height:13px"></i><i style="height:17px"></i><i style="height:21px"></i><i style="height:24px"></i></div></div></div>
    <div class="row"><div class="k">Sleep</div><div class="v"><span class="hrs">hrs slept</span></div></div>
    <div class="row"><div class="k">Water</div><div class="v">${cups}</div></div>
    <div class="sec dph dph-lg">Nutrition check</div>
    <div class="nf"><div class="k">Breakfast</div></div>
    <div class="nf"><div class="k">Lunch</div></div>
    <div class="nf"><div class="k">Dinner</div></div>
    <div class="nf"><div class="k">Snack</div></div>
    <div class="nf nf-total"><div class="k">Total</div></div></div>`;
  const inner = `${tabs('', m)}${rail(m)}<div class="content">
    <div class="dtop"><a class="dnum" href="#${mId(m)}">${p2(d)}</a><div class="dstrip">${strip}</div></div>
    <div class="dsub"><a class="mo" href="#${mId(m)}" style="text-decoration:none">${MONTHS[m - 1]}</a></div>
    <div class="dwk"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
    <div class="dcols">${left}<div class="dcol-r"><div class="journal dj"></div></div></div>
    <div class="sec dph" style="color:var(--grat-c);border-color:var(--grat-line)">Night · Grateful for</div>
    <div class="gr3"><div class="ln"></div><div class="ln"></div><div class="ln"></div></div></div>`;
  return page(dId(m, d), inner);
}

function habitsPage(m) {
  const habits = ['Move my body','Drink water','Time outside','Read','Sleep by 11','No-phone hour','Be kind to myself'];
  let head = '<div class="hb-row"><div class="hb-name head">Habit</div><div class="hb-days">';
  for (let d = 1; d <= 31; d++) head += `<div class="hb-c">${d}</div>`;
  head += '</div></div>';
  const dots = () => { let s = ''; for (let d = 1; d <= 31; d++) s += `<div class="hb-c"><div class="o"></div></div>`; return s; };
  const rows = habits.map((name) =>
    `<div class="hb-row"><div class="hb-name">${name}</div><div class="hb-days">${dots()}</div></div>`).join('');
  // 5 blank rows for the buyer's own habits
  const blankRows = Array.from({ length: 5 }, () =>
    `<div class="hb-row"><div class="hb-name hb-blank"></div><div class="hb-days">${dots()}</div></div>`).join('');
  const inner = `${tabs(hId(m), m)}${rail(m)}<div class="content">${SEAL}
    <div class="phead"><div><div class="eyebrow">Habits · ${MONTHS[m - 1]}</div><h1 class="h1">Gentle <em>habits</em></h1></div>
      <div class="pmeta">PROGRESS,<br>NOT PERFECTION</div></div>
    <div class="hr white spaced"></div>
    <div class="hb">${head}${rows}${blankRows}</div>
    <div class="sec" style="margin-top:24px">Notes on this month</div><div class="hb-fill"></div></div>`;
  return page(hId(m), inner);
}

function gratitudePage() {
  const rows = MONTHS.map((name, i) =>
    `<a class="gr" href="#${mId(i + 1)}"><div class="gr-mo">${name}</div></a>`).join('');
  const inner = `${tabs('p-grat')}${rail()}<div class="content">${SEAL}
    <div class="phead"><div><div class="eyebrow">A year of thanks</div><h1 class="h1">Gratitude <em>log</em></h1></div>
      <div class="pmeta">ONE NOTE,<br>EACH MONTH</div></div>
    <div class="hr white spaced"></div><div class="grat">${rows}</div></div>`;
  return page('p-grat', inner);
}

function monthNotesPage(m) {
  const inner = `${tabs(nId(m), m)}${rail(m)}<div class="content">${SEAL}
    <div class="phead"><div><div class="eyebrow"><a href="#${mId(m)}">‹ ${MONTHS[m - 1]}</a> · Notes</div>
      <h1 class="h1">${MONTHS[m - 1]} <em>notes</em></h1></div>
      <div class="pmeta">THOUGHTS,<br>LISTS, IDEAS</div></div>
    <div class="hr white spaced"></div>
    <div class="nt"></div></div>`;
  return page(nId(m), inner);
}

/* ---- assemble the year in reading order ---- */
function buildPages(theme) {
  const out = [coverPage(theme), yearPage()];
  for (let m = 1; m <= 12; m++) {
    out.push(monthlyPage(m));
    for (let d = 1; d <= dim(m); d++) out.push(dailyPage(m, d));
    out.push(habitsPage(m));
    out.push(monthNotesPage(m));
  }
  out.push(gratitudePage());   // very last page
  return out;
}

/* ---- slice an element by class (depth-aware) for the cover lift ---- */
function sliceClass(src, cls) {
  const start = src.indexOf(`<div class="${cls}"`);
  if (start === -1) return '';
  const re = /<div\b|<\/div>/g; re.lastIndex = start; let d = 0, m;
  while ((m = re.exec(src))) { d += m[0] === '</div>' ? -1 : 1; if (d === 0) return src.slice(start, re.lastIndex); }
  return src.slice(start);
}

/* ---- doc shell ---- */
const printCss = `
/* print/export reset — only the pages render */
html,body{margin:0;padding:0;background:var(--bg);}
body{display:block;}
.page{margin:0 auto;break-after:page;page-break-after:always;}
.page:last-of-type{break-after:auto;}
@page{size:1080px 1440px;margin:0;}
@media print{html,body{background:#fff;}.page{box-shadow:none;}}
`;
function doc(title, themeCss, body, { med = medallion } = {}) {
  const css = [fontFace, tokens, base, themeCss, printCss].filter(Boolean).join('\n');
  // No Google Fonts <link> here on purpose: fontFace already embeds Bodoni Moda +
  // Inter as base64, and an external stylesheet link can make Chrome's print
  // pipeline hang waiting on network (fonts.googleapis.com) in offline/sandboxed
  // render environments.
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${css}</style></head>
<body>
${body}
<script>${med}</script>
</body></html>
`;
}

/* ---- build (cover artwork is per-theme, so build the body per theme) ---- */
const outRoot = join(root, 'export');
let pages;   // keep a reference for the page count log

for (const [theme, themeCss] of Object.entries(themes)) {
  pages = buildPages(theme);
  const body = pages.join('\n');
  const css = [themeCss, coverSwapCss[theme]].filter(Boolean).join('\n');
  mkdirSync(join(outRoot, theme), { recursive: true });
  writeFileSync(join(outRoot, theme, 'goyo-print.html'),
    doc(`GOYO — ${theme}`, css, body, { med: coverPack(theme).med }));
}
/* live preview (najeon base, no theme switcher) */
writeFileSync(join(root, 'planner.html'),
  doc('GOYO — planner', '', buildPages('najeon').join('\n'), { med: COVER.najeon.med }));

/* contact sheet */
const sheet = Object.keys(themes).map((t) =>
  `<section><h2>${t}</h2><ul><li><a href="${t}/goyo-print.html">Combined HTML (print → PDF)</a></li>`
  + `<li><a href="${t}/goyo-${t}.pdf">goyo-${t}.pdf (planner)</a></li>`
  + `<li><a href="${t}/goyo-guide-${t}.pdf">goyo-guide-${t}.pdf</a></li></ul></section>`).join('\n');
writeFileSync(join(outRoot, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>GOYO — exports</title><style>
body{font:14px/1.6 system-ui,sans-serif;background:#14181a;color:#e9e6df;margin:0;padding:40px;}
h1{font-weight:400;letter-spacing:.04em;}h2{text-transform:uppercase;letter-spacing:.18em;font-size:12px;color:#74a89f;}
section{display:inline-block;vertical-align:top;margin:0 48px 24px 0;}ul{list-style:none;padding:0;}
a{color:#e9e6df;text-decoration:none;}a:hover{color:#74a89f;}
</style></head><body><h1>GOYO — undated full-year planner</h1>
<p style="color:#8a9499">${pages.length} pages · cover + year + 12 months + 366 days + 12 habit grids + weekly + gratitude + notes. Undated (no year, no weekday — reuse every year). Internal links wired (rail → months, year → months, calendar → days, day → month).</p>
${sheet}</body></html>`);

const days = pages.filter((p) => /id="p-d/.test(p)).length;
console.log(`Built ${pages.length} pages (undated, ${days} days) → export/<theme>/goyo-print.html + planner.html`);
console.log(`Next: node tools/pdf.mjs   → export/<theme>/goyo-<theme>.pdf (internal links preserved)`);
