/* ============================================================
   INAE Practice — cell centring audit

   Renders the built book and measures, in PIXELS, where the ink actually
   lands inside every layout-A cell. Reports art that is off-centre or
   crowding the cell frame.

   Why pixels and not SVG geometry: getBBox() reports geometry before
   clipping, so a hatch that is drawn long and clipped to its box measures as
   if it escaped the cell. Masked shading is worse. The rendered page is the
   only honest source.

   Needs a local Chromium (same lookup as tools/pdf.mjs) — it is a QA step,
   not part of `npm run build`.

     node tools/drawingbook.mjs && node tools/inae-audit.mjs
   ============================================================ */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Pages whose art is off-centre BY DESIGN. Listed here so the audit stays at
   zero unexpected findings and nobody "fixes" them later. */
const EXPECTED = {
  s07: 'the given mass is deliberately off-centre — balancing it is the drill',
  'f13:Y': 'the YOURS axis is placed where the cone’s axis is, so a cone drawn '
    + 'on it lands centred; the bare axis is therefore not centred itself',
};
const TOL_CENTRE = 5;    // px
const TOL_MARGIN = 6;    // px, only for art that is not meant to fill the cell
/* Drills whose art fills the cell to its edges on purpose (value boxes,
   stippling, negative-space hatching, thumbnail frames). */
const FILLS_CELL = new Set(['x02','m01','m02','m03','m04','m05','m07','m09','m12','s01','s02','s03','s04','s05','s08']);

function findChrome() {
  const known = ['/opt/pw-browsers/chromium', '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const scanned = [];
  try { for (const d of readdirSync(pw)) if (d.startsWith('chromium'))
    scanned.push(join(pw, d, 'chrome-linux', 'chrome')); } catch {}
  return [process.env.CHROME, process.env.CHROME_PATH, ...known, ...scanned]
    .find((p) => p && existsSync(p));
}

/* ---- minimal PNG reader (8-bit RGB/RGBA, non-interlaced) ---- */
function decodePNG(buf) {
  let o = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), t = buf.toString('ascii', o + 4, o + 8);
    const d = buf.subarray(o + 8, o + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    else if (t === 'IDAT') idat.push(d); else if (t === 'IEND') break;
    o += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, raw = inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(w * h * bpp), st = w * bpp;
  const pa = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0, p = 0; y < h; y++) {
    const f = raw[p++];
    for (let i = 0; i < st; i++) {
      const x = raw[p + i], a = i >= bpp ? out[y * st + i - bpp] : 0;
      const b = y ? out[(y - 1) * st + i] : 0, c = (i >= bpp && y) ? out[(y - 1) * st + i - bpp] : 0;
      out[y * st + i] = f === 0 ? x : f === 1 ? x + a : f === 2 ? x + b
        : f === 3 ? x + ((a + b) >> 1) : x + pa(a, b, c);
    }
    p += st;
  }
  return { w, bpp, px: out };
}

const chrome = findChrome();
if (!chrome) { console.log('No Chromium found — skipping the centring audit.'); process.exit(0); }

const tmp = mkdtempSync(join(tmpdir(), 'inae-audit-'));
const cellsPath = join(tmp, 'cells.json');
execFileSync(process.execPath, [join(root, 'tools/drawingbook.mjs')],
  { env: { ...process.env, INAE_AUDIT: cellsPath }, stdio: 'ignore' });
const cells = JSON.parse(readFileSync(cellsPath, 'utf8')).map((c) => ({
  ...c, x: Math.round(c.x), y: Math.round(c.y),
  w: Math.round(c.w ?? c.c), h: Math.round(c.h ?? c.c),
}));

const src = readFileSync(join(root, 'export/inae/inae-practice.html'), 'utf8');
const head = src.slice(0, src.indexOf('</head>') + 7);
const slice = (id) => {
  const st = src.indexOf(`<div class="page" id="p-${id}"`); if (st < 0) return null;
  const re = /<div\b|<\/div>/g; re.lastIndex = st; let d = 0, m;
  while ((m = re.exec(src))) { d += m[0] === '</div>' ? -1 : 1; if (d === 0) return src.slice(st, re.lastIndex); }
};
const byPage = {};
for (const c of cells) (byPage[c.at.split(':')[0]] ||= []).push(c);

const INK = 230, INSET = 2;   // paper is ~239 with sigma-2.1 grain
const findings = [];
for (const [pid, list] of Object.entries(byPage)) {
  const f = join(tmp, `${pid}.html`), png = join(tmp, `${pid}.png`);
  writeFileSync(f, head + '<body style="display:block;margin:0;padding:0">' + slice(pid) + '</body></html>');
  // the window must exceed the page: headless's usable viewport is a little
  // shorter than --window-size, which would crop the last row out of frame
  execFileSync(chrome, ['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',
    '--window-size=1080,1500','--virtual-time-budget=4000',
    `--screenshot=${png}`, `file://${f}`], { stdio: 'ignore' });
  const { w, bpp, px } = decodePNG(readFileSync(png));
  const lum = (x, y) => { const i = (y * w + x) * bpp;
    return 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]; };
  // a lone dark pixel is paper grain, not a mark
  const ink = (x, y) => lum(x, y) < INK && (lum(x + 1, y) < INK || lum(x, y + 1) < INK);
  for (const cell of list) {
    if (cell.mode === 'contain') {
      /* Only the top and bottom edges are checked, and only outside the frame:
         a ground line running to both side edges is normal, art poking out of
         the band is not. The left 90px is skipped because the EXAMPLE / YOURS
         labels sit just above their frame there. */
      let over = 0;
      for (const [from, to] of [[cell.y - 12, cell.y - 2],
                                [cell.y + cell.h + 2, cell.y + cell.h + 12]])
        for (let y = from; y < to; y++)
          for (let x = cell.x + 90; x < cell.x + cell.w; x++)
            if (ink(x, y)) over = Math.max(over, y < cell.y ? cell.y - y : y - (cell.y + cell.h));
      if (over) findings.push(`${cell.at.padEnd(14)} ink escapes the frame by ${over}px`);
      continue;
    }
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = cell.y + INSET; y < cell.y + cell.h - INSET; y++)
      for (let x = cell.x + INSET; x < cell.x + cell.w - INSET; x++)
        // a lone dark pixel is paper grain, not a mark
        if (lum(x, y) < INK && (lum(x + 1, y) < INK || lum(x, y + 1) < INK)) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
    if (x1 < 0) continue;
    const [col, row, side] = [cell.at.split(':')[0], cell.at.split(':')[1], cell.at.split(':')[2]];
    if (EXPECTED[col] || EXPECTED[`${col}:${side}`]) continue;
    const margin = Math.min(x0 - cell.x, y0 - cell.y,
      cell.x + cell.w - (x1 + 1), cell.y + cell.h - (y1 + 1));
    const dx = (x0 + (x1 - x0 + 1) / 2) - (cell.x + cell.w / 2);
    const dy = (y0 + (y1 - y0 + 1) / 2) - (cell.y + cell.h / 2);
    if (Math.abs(dx) > TOL_CENTRE || Math.abs(dy) > TOL_CENTRE)
      findings.push(`${cell.at.padEnd(14)} off-centre  dx ${dx.toFixed(1).padStart(6)}  dy ${dy.toFixed(1).padStart(6)}  (cell ${cell.w})`);
    else if (!FILLS_CELL.has(col) && margin < TOL_MARGIN)
      findings.push(`${cell.at.padEnd(14)} crowds the frame  margin ${margin}px  (cell ${cell.w})`);
  }
}
rmSync(tmp, { recursive: true, force: true });

console.log(`Centring audit: ${cells.length} cells measured.`);
for (const [k, why] of Object.entries(EXPECTED)) console.log(`  skipped ${k} — ${why}`);
if (!findings.length) console.log(`\n✓ nothing off-centre by more than ${TOL_CENTRE}px.`);
else { console.log(`\n⚠  ${findings.length} finding(s):`); for (const f of findings) console.log('   ' + f); }
process.exit(findings.length ? 1 : 0);
