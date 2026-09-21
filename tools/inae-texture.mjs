/* ============================================================
   INAE — paper texture baker
   spec: docs/drawingbook-spec.md §3.4

   Writes assets/inae/hanji-1080x1440.png: ONE full-bleed raster that
   every page shares (embedded once by tools/drawingbook.mjs).

   Deliberate choices, don't "fix" these away:
   • Baked to flat RGB, not a grayscale overlay with mix-blend-mode.
     Blend modes are nested transparency groups, and some PDF viewers
     mis-composite those as black — the same trap that made GOYO bake
     its pine layer to a raster (see root CLAUDE.md).
   • No SVG <pattern> tiling: Figma doesn't support it and it stretches.
   • Dependency-free PNG encoder (node:zlib only).

     node tools/inae-texture.mjs [--grain 2.1] [--broad 0.85] [--seed 20260921]
   ============================================================ */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => {
  const i = process.argv.indexOf('--' + k);
  return i === -1 ? d : Number(process.argv[i + 1]);
};

const W = 1080, H = 1440;
const BASE = [0xF3, 0xEE, 0xE6];        // texture base #F3EEE6 (§3.2)
const GRAIN = arg('grain', 2.1);        // 1px grain, σ in 8-bit levels
const BROAD = arg('broad', 0.85);       // broad tonal modulation amplitude
const SEED  = arg('seed', 20260921);

/* ---- deterministic RNG + gaussian ---- */
let s = SEED >>> 0;
const rand = () => {
  s = (s + 0x6D2B79F5) >>> 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
let spare = null;
const gauss = () => {
  if (spare !== null) { const v = spare; spare = null; return v; }
  let u, v, q;
  do { u = rand() * 2 - 1; v = rand() * 2 - 1; q = u * u + v * v; } while (!q || q >= 1);
  const f = Math.sqrt(-2 * Math.log(q) / q);
  spare = v * f;
  return u * f;
};

/* ---- broad modulation: a few low-frequency waves, no fibre grain.
   Fibre streaks read as scratches on a drawing page (§3.4), so the
   low-frequency term stays isotropic. ---- */
const waves = Array.from({ length: 5 }, () => ({
  fx: (rand() * 2 + 0.5) / W, fy: (rand() * 2 + 0.5) / H,
  ph: rand() * Math.PI * 2, a: rand(),
}));
const waveSum = waves.reduce((t, w) => t + w.a, 0);
const broadAt = (x, y) =>
  waves.reduce((t, w) =>
    t + w.a * Math.sin(2 * Math.PI * (w.fx * x + w.fy * y) + w.ph), 0) / waveSum;

/* ---- raster: filter byte 0 (None) + RGB triplets per scanline ---- */
const raw = Buffer.alloc(H * (1 + W * 3));
let o = 0;
for (let y = 0; y < H; y++) {
  raw[o++] = 0;
  for (let x = 0; x < W; x++) {
    const d = gauss() * GRAIN + broadAt(x, y) * BROAD;
    for (let c = 0; c < 3; c++) {
      const v = Math.round(BASE[c] + d);
      raw[o++] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
}

/* ---- minimal PNG writer ---- */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return (buf) => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;  // 8-bit truecolour

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = join(root, 'assets/inae/hanji-1080x1440.png');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`Wrote ${out}`);
console.log(`  ${W}×${H} RGB · grain σ${GRAIN} · broad ${BROAD} · seed ${SEED}`);
console.log(`  ${(png.length / 1024).toFixed(0)} KB on disk → ~${(png.length * 4 / 3 / 1024).toFixed(0)} KB as base64 in the HTML`);
