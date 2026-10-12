/* ============================================================
   INAE — webfont subsetter / embedder
   spec: docs/drawingbook-spec.md §3.1

   Fetches Newsreader / Noto Serif KR / Inter from Google Fonts,
   SUBSET TO ONLY THE GLYPHS THIS BOOK ACTUALLY USES, and writes
   assets/inae/fonts.css with each face inlined as base64.

   Why subset: every word in the book is fixed at build time — the
   reader draws, they never type — so the glyph inventory is closed.
   Noto Serif KR's full CJK face is several MB; the ~180 characters
   this book uses are a few KB.

   Why inline rather than a <link>: an external stylesheet can make
   Chrome's print pipeline hang waiting on fonts.googleapis.com in
   offline/sandboxed render environments (the same reason GOYO's
   planner embeds its faces).

   TWO-PASS BUILD — the glyph set is read out of the built HTML:
     node tools/drawingbook.mjs     # 1. emit pages (fonts may be stale)
     node tools/inae-fonts.mjs      # 2. subset to what those pages use
     node tools/drawingbook.mjs     # 3. re-emit, now with the faces
   Pass 3 verifies coverage and fails loudly if the copy drifted past
   the recorded subset.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const src = join(root, 'export/inae/inae-practice.html');
if (!existsSync(src)) {
  console.error('export/inae/inae-practice.html not found — run `node tools/drawingbook.mjs` first.');
  process.exit(1);
}

/* ---- harvest every character the pages render ---- */
const ENT = { '&mdash;': '—', '&rsquo;': '’', '&middot;': '·', '&nbsp;': ' ',
  '&deg;': '°', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"' };
let text = readFileSync(src, 'utf8')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<[^>]+>/g, '\u0000');                 // tags out, keep a separator
for (const [k, v] of Object.entries(ENT)) text = text.split(k).join(v);
text = text.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));

/* keep U+0020: it is a real glyph, and leaving it out of the subset makes the
   browser pull a fallback face just to set the spaces between 한자 */
const chars = [...new Set([...text])].filter((c) => c >= ' ' && c !== '\u0000').sort();
const isCJK = (c) => /[　-〿㄰-㆏가-힯一-鿿]/.test(c);
const cjk   = chars.filter(isCJK).join('');
const latin = chars.filter((c) => !isCJK(c)).join('');

console.log(`Glyphs in use: ${chars.length}  (CJK/Hangul ${cjk.length} · latin & marks ${latin.length})`);

/* ---- the three roles, per spec §3.1 ---- */
const FACES = [
  { css: 'Noto Serif KR', family: 'Noto+Serif+KR:wght@400', weight: 400, style: 'normal', text: cjk },
  { css: 'Newsreader',    family: 'Newsreader:wght@300',    weight: 300, style: 'normal', text: latin },
  { css: 'Newsreader',    family: 'Newsreader:ital,wght@1,300', weight: 300, style: 'italic', text: latin },
  { css: 'Inter',         family: 'Inter:wght@500',         weight: 500, style: 'normal', text: latin },
];

const get = async (url, bin = false) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url}`);
  return bin ? Buffer.from(await r.arrayBuffer()) : r.text();
};

let out = `/* ============================================================
   INAE — embedded webfaces (GENERATED, do not hand-edit)
   Regenerate with: node tools/inae-fonts.mjs
   Subset to the ${chars.length} glyphs used by inae-practice.html.
   Newsreader + Inter + Noto Serif KR are SIL Open Font License 1.1.
   ============================================================ */\n`;
let total = 0;

for (const f of FACES) {
  const url = `https://fonts.googleapis.com/css2?family=${f.family}`
    + `&text=${encodeURIComponent(f.text)}&display=block`;
  const css = await get(url);
  /* Google serves static subsets as .../xxx.woff2 but &text= subsets as
     .../l/font?kit=... with no extension — match any url() in the src. */
  const m = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/);
  if (!m) throw new Error(`no woff2 in Google's reply for ${f.family}\n${css.slice(0, 400)}`);
  const buf = await get(m[1], true);
  total += buf.length;
  console.log(`  ${f.css} ${f.weight}${f.style === 'italic' ? ' italic' : ''}`
    + ` → ${(buf.length / 1024).toFixed(1)} KB`);
  out += `@font-face{font-family:'${f.css}';font-style:${f.style};font-weight:${f.weight};`
    + `font-display:block;src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}\n`;
}

mkdirSync(join(root, 'assets/inae'), { recursive: true });
writeFileSync(join(root, 'assets/inae/fonts.css'), out);
/* sidecar so the generator can prove the subset still covers the copy */
writeFileSync(join(root, 'assets/inae/fonts.subset.json'),
  JSON.stringify({ generated: new Date().toISOString().slice(0, 10), chars: chars.join('') }, null, 2) + '\n');

console.log(`\nWrote assets/inae/fonts.css — ${(total / 1024).toFixed(1)} KB of font data`
  + ` (~${(total * 4 / 3 / 1024).toFixed(0)} KB as base64)`);
console.log('Now re-run: node tools/drawingbook.mjs');
