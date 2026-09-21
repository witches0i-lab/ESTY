/* ============================================================
   INAE (이내) — export generator

   Reads inae/index.html (the design source of truth) and emits a
   combined, print-ready, hyperlink-preserving document:

     export/inae/inae-print.html

   ⚠️  ANTI-DRIFT RULE — the whole point of this file's shape.
   GOYO's generator re-declares every non-cover page as template
   literals, so /index.html and /tools/planner.mjs hold two
   independent copies of the same markup and silently diverge.
   That is documented in the root CLAUDE.md as the single worst
   gotcha in this repo. This generator does NOT do that: it slices
   the real markup out of inae/index.html. When INAE grows pages
   that need real data loops (a month grid, 366 days, …), keep the
   *markup* here sourced from index.html and loop only over data.

   Dependency-free (Node built-ins only).

     node inae/tools/build.mjs      # or: npm run inae:export
   ============================================================ */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const line = join(here, '..');          // inae/
const root = join(line, '..');          // repo root
const read = (p) => readFileSync(join(line, p), 'utf8');

const tokens = read('css/tokens.css');
const base   = read('css/base.css');
const html   = read('index.html');

/* Typefaces are part of the undecided motif, so inae/assets/fonts/ is empty
   and tokens.css falls back to system stacks. Once INAE picks its type, drop
   a base64-embedded fonts.css in there and it gets picked up automatically.
   Embedding (rather than a Google Fonts <link>) is not a preference — an
   external stylesheet can make Chrome's print pipeline hang waiting on the
   network in offline/sandboxed render environments. */
const fontsPath = join(line, 'assets/fonts/fonts.css');
const fontFace  = existsSync(fontsPath) ? readFileSync(fontsPath, 'utf8') : '';

/* Colorways for this line. INAE ships one look for now; if it ever gains
   colorways they register here as `name: read('themes/<name>.css')`, exactly
   like GOYO's — same pattern, separate registry, no shared file. */
const themes = { inae: '' };

/* ---- markup extraction (balanced-div slice, same technique GOYO uses) ---- */
function sliceAll(src, cls) {
  const out = [];
  const open = `<div class="${cls}"`;
  let from = 0, start;
  while ((start = src.indexOf(open, from)) !== -1) {
    const re = /<div\b|<\/div>/g; re.lastIndex = start;
    let depth = 0, m, end = src.length;
    while ((m = re.exec(src))) {
      depth += m[0] === '</div>' ? -1 : 1;
      if (depth === 0) { end = re.lastIndex; break; }
    }
    out.push(src.slice(start, end));
    from = end;
  }
  return out;
}

/* inline <style> blocks in index.html are provisional scaffolding styles;
   carry them into the export so the preview and the product match. */
const inlineCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map((m) => m[1]).join('\n');

const pages = sliceAll(html, 'page');
if (!pages.length) {
  console.error('No .page blocks found in inae/index.html — nothing to build.');
  process.exit(1);
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

function doc(title, themeCss, body) {
  const css = [fontFace, tokens, base, inlineCss, themeCss, printCss]
    .filter(Boolean).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${css}</style></head>
<body>
${body}
</body></html>
`;
}

/* ---- build ---- */
const outRoot = join(root, 'export');
for (const [theme, themeCss] of Object.entries(themes)) {
  const dir = join(outRoot, theme === 'inae' ? 'inae' : `inae-${theme}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'inae-print.html'),
    doc(`INAE — ${theme}`, themeCss, pages.join('\n')));
}

const ids = pages.map((p) => (p.match(/id="([^"]+)"/) || [])[1]).filter(Boolean);
console.log(`Built ${pages.length} page(s) → export/inae/inae-print.html`);
console.log(`Anchors: ${ids.join(', ') || '(none)'}`);
console.log('Scaffold only — page set, motif, palette and type are undecided (inae/README.md).');
console.log('No PDF step yet: render by hand (Chrome → Print → Save as PDF, background graphics ON, margins none).');
