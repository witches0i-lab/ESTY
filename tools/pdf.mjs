/* ============================================================
   GOYO — hyperlinked PDF render  (roadmap 3)
   Renders each theme's combined print file to a single PDF with
   internal links preserved (tabs → pages, rail → month, index →
   sections). Chrome's print-to-PDF turns same-document #anchors
   into PDF GoTo links — exactly what GoodNotes and Notability follow.

     node tools/export.mjs     # build export/<theme>/goyo-print.html first
     node tools/pdf.mjs        # then render → export/<theme>/goyo-<theme>.pdf

   Dependency-free: it drives a Chromium binary already on the machine
   over the DevTools Protocol (CDP), using only Node's built-in fetch
   and WebSocket — no npm install. Two things matter for a 400+ page
   document like this:
     - transferMode:'ReturnAsStream' + IO.read in chunks. Asking CDP to
       inline the whole PDF as one base64 string in the response can
       make Chrome hang for minutes on a 20MB+ file; streaming it in
       ~1MB chunks finishes in ~20s.
     - generateTaggedPDF:false. CDP defaults this to true, which roughly
       triples the PDF object count (an accessibility tag tree) and
       ~45% of the file size, with no user-visible difference.
   If no Chromium is found it prints the manual fallback (open
   goyo-print.html → Print → Save as PDF, "Background graphics" ON)
   and exits cleanly.
   ============================================================ */
import { existsSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const themes = ['najeon', 'light', 'hanji'];

/* ---- locate a Chromium/Chrome binary, dependency-free ---- */
function findChrome() {
  const fromEnv = [process.env.CHROME, process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH];
  const known = [
    '/opt/pw-browsers/chromium', // pre-installed (symlink → chrome)
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  let scanned = [];
  try {
    for (const d of readdirSync(pw)) {
      if (d.startsWith('chromium')) scanned.push(join(pw, d, 'chrome-linux', 'chrome'));
    }
  } catch {}
  return [...fromEnv, ...known, ...scanned].find((p) => p && existsSync(p));
}

const chrome = findChrome();

if (!chrome) {
  console.log('No Chromium/Chrome binary found.');
  console.log('Manual fallback — for each theme open export/<theme>/goyo-print.html in Chrome,');
  console.log('  Print → Destination: Save as PDF → "Background graphics" ON → Margins: None → Save.');
  console.log('Internal links (tabs/rail/index) are preserved by Chrome\'s PDF export.');
  process.exit(0);
}

/* ---- minimal CDP client: built-in fetch + WebSocket only ---- */
async function waitForDevTools(port, tries = 100) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Chrome DevTools endpoint never came up');
}

function cdpSend(ws, id, method, params = {}, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), timeoutMs);
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', onMsg);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function printToPdf(port, fileUrl) {
  const created = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })).json();
  const ws = new WebSocket(created.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve); ws.addEventListener('error', reject); });
  let id = 1;
  await cdpSend(ws, id++, 'Page.enable');
  const navPromise = new Promise((resolve) => {
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Page.loadEventFired') { ws.removeEventListener('message', onMsg); resolve(); }
    };
    ws.addEventListener('message', onMsg);
  });
  await cdpSend(ws, id++, 'Page.navigate', { url: fileUrl });
  await navPromise;
  await new Promise((r) => setTimeout(r, 600)); // let webfonts/medallion settle

  const { stream } = await cdpSend(ws, id++, 'Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true,
    paperWidth: 1080 / 96, paperHeight: 1440 / 96,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    generateTaggedPDF: false,
    transferMode: 'ReturnAsStream',
  }, 120000);

  const chunks = [];
  for (;;) {
    const r = await cdpSend(ws, id++, 'IO.read', { handle: stream, size: 1 << 20 }, 30000);
    chunks.push(Buffer.from(r.data, r.base64Encoded ? 'base64' : 'utf8'));
    if (r.eof) break;
  }
  await cdpSend(ws, id++, 'IO.close', { handle: stream });
  await cdpSend(ws, id++, 'Target.closeTarget', { targetId: created.id });
  ws.close();
  return Buffer.concat(chunks);
}

/* render targets: the planner (per theme) + the user guide.
   Output filenames carry the theme (goyo-najeon.pdf, goyo-guide-najeon.pdf, …)
   so the two sellable files never get mixed up between colourways. */
const jobs = themes.flatMap((t) => [
  { src: join(root, 'export', t, 'goyo-print.html'), out: join(root, 'export', t, `goyo-${t}.pdf`), label: `${t} planner` },
  { src: join(root, 'export', t, 'goyo-guide.html'), out: join(root, 'export', t, `goyo-guide-${t}.pdf`), label: `${t} guide` },
]);

const userDataDir = mkdtempSync(join(tmpdir(), 'goyo-pdf-'));
const port = 9333 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  `--remote-debugging-port=${port}`, `--user-data-dir=${userDataDir}`,
], { stdio: 'ignore' });

let ok = 0;
try {
  await waitForDevTools(port);
  console.log(`Using ${chrome} (CDP on :${port})`);
  for (const { src, out, label } of jobs) {
    if (!existsSync(src)) { console.log(`  skip ${label} (run npm run export / npm run guide first)`); continue; }
    try {
      const pdf = await printToPdf(port, pathToFileURL(src).href);
      writeFileSync(out, pdf);
      const rel = out.slice(root.length + 1);
      console.log(`  ✓ ${label} → ${rel} (${(pdf.length / 1e6).toFixed(1)}MB)`);
      ok++;
    } catch (e) {
      console.log(`  ✗ ${label} (${e.message})`);
    }
  }
} finally {
  proc.kill();
  await new Promise((r) => setTimeout(r, 300)); // let chrome release its profile dir
  rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3 });
}
console.log(`Rendered ${ok}/${jobs.length} PDFs. Verify internal links with docs/link-test.md.`);
