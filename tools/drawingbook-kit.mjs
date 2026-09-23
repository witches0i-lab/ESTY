/* ============================================================
   INAE Practice — drill primitives
   spec: docs/drawingbook-spec.md §4 (hatching formula) · §5 (params)

   Pure SVG-string builders. No DOM, no deps. Every generator that
   places random marks takes an explicit seed so a rebuild is
   byte-identical — the book must not shuffle between exports.
   ============================================================ */

/* ---- deterministic RNG (mulberry32) ---- */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v) => Number(v.toFixed(2));
export const svg = (w, h, inner, extra = '') =>
  `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"${extra}>${inner}</svg>`;

/* ============================================================
   HATCHING  (§4)
   45° hatching has an effective spacing of `spacing × 0.707`, so to hit a
   target ink density you need  width = density × 0.707 × spacing.
   That yields the spec's table exactly:
     25% → 8 / 1.4    50% → 5 / 1.8    75% → 4 / 2.1    100% → solid
   ============================================================ */
export const HATCH = { 0.25: [8, 1.4], 0.5: [5, 1.8], 0.75: [4, 2.1] };

export function hatchWidth(density, spacing) {
  return n(density * 0.707 * spacing);
}

/** Parallel hatch lines filling w×h at `angle` degrees, clipped to the box. */
export function hatch(w, h, { angle = 45, spacing = 5, width = 1.8, color = 'var(--ink)', id }) {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad), dy = Math.sin(rad);
  // step perpendicular to the line direction, sweeping far enough to cover
  // the whole box from either diagonal
  const px = -dy, py = dx;
  const reach = Math.abs(w * dx) + Math.abs(h * dy);
  const span = Math.abs(w * px) + Math.abs(h * py);
  const cx = w / 2, cy = h / 2;
  let d = '';
  for (let t = -span / 2; t <= span / 2; t += spacing) {
    const ox = cx + px * t, oy = cy + py * t;
    d += `M${n(ox - dx * reach)} ${n(oy - dy * reach)}L${n(ox + dx * reach)} ${n(oy + dy * reach)}`;
  }
  const clip = `hc${id}`;
  return `<clipPath id="${clip}"><rect width="${w}" height="${h}"/></clipPath>`
    + `<g clip-path="url(#${clip})"><path d="${d}" stroke="${color}" stroke-width="${width}"/></g>`;
}

/** Hatch a box to one of the spec's four canonical values. */
export function valueBox(w, h, density, id, { angle = 45 } = {}) {
  if (density >= 1) return `<rect width="${w}" height="${h}" fill="var(--ink)"/>`;
  const [spacing, width] = HATCH[density] || [5, hatchWidth(density, 5)];
  return hatch(w, h, { angle, spacing, width, id });
}

/* ---- stippling (§5.2 m03: ~20/55/110 dots per 100px²) ---- */
export function stipple(w, h, per100, seed, { r = 1.15 } = {}) {
  const rand = rng(seed);
  const count = Math.round((w * h) / 10000 * per100);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = n(rand() * w), y = n(rand() * h);
    d += `M${x} ${y}m${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
  }
  return `<path d="${d}" fill="var(--ink)"/>`;
}

/* ---- dots & guides ---- */
export const dot = (x, y, r = 3.4, c = 'var(--guide)') =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${c}"/>`;

export const line = (x1, y1, x2, y2, { c = 'var(--guide)', w = 1, dash } = {}) =>
  `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}" stroke="${c}" stroke-width="${w}"`
  + `${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

export const rect = (x, y, w, h, { c = 'var(--hair)', sw = 1, fill = 'none' } = {}) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${c}" stroke-width="${sw}"/>`;

export const ellipse = (cx, cy, rx, ry, { c = 'var(--ink)', w = 1.6, fill = 'none' } = {}) =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}" stroke="${c}" stroke-width="${w}"/>`;

/** Rows of dot pairs to be joined in one stroke (線 drills l01/l02/l06). */
export function dotPairs({ rows, len, pitch, x = 0, y = 0, vertical = false }) {
  let s = '';
  for (let i = 0; i < rows; i++) {
    const o = i * pitch;
    s += vertical ? dot(x + o, y) + dot(x + o, y + len)
                  : dot(x, y + o) + dot(x + len, y + o);
  }
  return s;
}

/** Arc through three points — used for 弧 (l07). */
export function arc3(x1, y1, x2, y2, x3, y3, { c = 'var(--ink)', w = 1.6 } = {}) {
  // circumcentre of the three points, then a sweep between the outer two
  const a = x1 - x2, b = y1 - y2, cc = x1 - x3, d = y1 - y3;
  const e = ((x1 * x1 - x2 * x2) + (y1 * y1 - y2 * y2)) / 2;
  const f = ((x1 * x1 - x3 * x3) + (y1 * y1 - y3 * y3)) / 2;
  const det = a * d - b * cc;
  if (Math.abs(det) < 1e-6) return line(x1, y1, x3, y3, { c, w });
  const ux = (d * e - b * f) / det, uy = (a * f - cc * e) / det;
  const r = Math.hypot(x1 - ux, y1 - uy);
  const sweep = ((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)) < 0 ? 1 : 0;
  return `<path d="M${n(x1)} ${n(y1)}A${n(r)} ${n(r)} 0 0 ${sweep} ${n(x3)} ${n(y3)}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
}

/** Archimedean spiral (l10). */
export function spiral(cx, cy, turns, gap, { c = 'var(--ink)', w = 1.6, steps = 480 } = {}) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * turns * Math.PI * 2;
    const r = (gap / (Math.PI * 2)) * th;
    const x = n(cx + r * Math.cos(th)), y = n(cy + r * Math.sin(th));
    d += (i ? 'L' : 'M') + x + ' ' + y;
  }
  return `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
}

/** Tapered stroke — one line, three weights (l12). */
export function taper(x, y, len, w0, w1, { c = 'var(--ink)', steps = 40 } = {}) {
  let s = '';
  for (let i = 0; i < steps; i++) {
    const t0 = i / steps, t1 = (i + 1) / steps;
    s += `<path d="M${n(x + len * t0)} ${y}L${n(x + len * t1)} ${y}" stroke="${c}" `
      + `stroke-width="${n(w0 + (w1 - w0) * t0)}" stroke-linecap="round"/>`;
  }
  return s;
}

/* ---- perspective (四 形) ---- */
/** Vanishing point mark + label. */
export const vp = (x, y, label) =>
  `<path d="M${n(x - 3.4)} ${n(y)}h6.8M${n(x)} ${n(y - 3.4)}v6.8" stroke="var(--ink)" stroke-width="1.6"/>`
  + (label ? `<text x="${n(x + 16)}" y="${n(y - 9)}" fill="var(--muted)" font-size="11.5" `
    + `font-family="Inter,system-ui,sans-serif" font-weight="500" letter-spacing=".9">${label}</text>` : '');

/** Convergence rays from a vanishing point across the full field. */
export function rays(x, y, w, h, count, { c = 'var(--guide-l)', sw = 1 } = {}) {
  let s = '';
  // fan to evenly spaced points around the field border so the rays read as
  // one convergence rather than a top/bottom pair
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    s += line(x, y, t * w, 0, { c, w: sw });
    s += line(x, y, t * w, h, { c, w: sw });
  }
  for (let i = 1; i < count; i++) {
    const t = i / count;
    s += line(x, y, 0, t * h, { c, w: sw });
    s += line(x, y, w, t * h, { c, w: sw });
  }
  return s;
}

/** Horizon line with eye-level label (f07/f04 comps). */
export const horizon = (w, y, label = 'HORIZON · EYE LEVEL') =>
  line(0, y, w, y, { c: 'var(--guide)', w: 1 })
  + `<text x="${w}" y="${n(y + 20)}" text-anchor="end" fill="var(--muted)" font-size="11.5" `
  + `font-family="Inter,system-ui,sans-serif" font-weight="500" letter-spacing=".9">${label}</text>`;

/* ---- fields ---- */
/** Corner ticks marking an open drawing field (b01 comp). */
export function corners(w, h, len = 22, c = 'var(--guide)') {
  const L = (x1, y1, x2, y2) => line(x1, y1, x2, y2, { c, w: 1 });
  return L(0, 0, len, 0) + L(0, 0, 0, len) + L(w - len, 0, w, 0) + L(w, 0, w, len)
    + L(0, h - len, 0, h) + L(0, h, len, h) + L(w, h - len, w, h) + L(w - len, h, w, h);
}

/** Dot grid (b02) — 24px pitch. */
export function dotGrid(w, h, pitch = 24, r = 1.1) {
  let d = '';
  for (let y = pitch; y < h; y += pitch)
    for (let x = pitch; x < w; x += pitch)
      d += `M${x} ${y}m${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
  return `<path d="${d}" fill="var(--guide-l)"/>`;
}

/** Thumbnail frames in a grid. `ratio` is height/width — 4/3 portrait by
    default, pass 3/4 for landscape crops of a landscape scene (s06). */
export function frames(w, cols, rows, { gap = 28, thirds = false, ratio = 4 / 3 } = {}) {
  const fw = (w - gap * (cols - 1)) / cols, fh = fw * ratio;
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c * (fw + gap), y = r * (fh + gap);
    s += rect(x, y, fw, fh);
    if (thirds) {
      for (let i = 1; i < 3; i++) {
        s += line(x + fw * i / 3, y, x + fw * i / 3, y + fh, { c: 'var(--guide-l)' });
        s += line(x, y + fh * i / 3, x + fw, y + fh * i / 3, { c: 'var(--guide-l)' });
      }
    }
  }
  return { svg: s, fw, fh };
}

/* ============================================================
   SOLIDS — parallel projection
   The 形 drills need forms a reader can actually copy, so these build real
   geometry (a box that genuinely turns, a cylinder with a body) rather than
   suggestive line sketches. Parallel projection, not perspective: these pages
   teach the *form*, and the perspective drills (f01–f09) teach convergence.
   ============================================================ */

const K_TILT = 0.45;   // vertical foreshortening of the ground plane

/** A box rotated `deg` about its vertical axis, centred in the cell.
    `refH` centres against a different height than the box's own — objBox uses
    it so a cage and the form inside it share one base plane instead of each
    floating at its own centre. */
export function boxPoints(c, deg, { w = 0.46, d = 0.30, h = 0.42, refH } = {}) {
  const th = (deg * Math.PI) / 180;
  const W = c * w, D = c * d, Hh = c * h, RH = c * (refH ?? h);
  const plan = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]];
  const flat = plan.map(([x, z]) => [
    x * Math.cos(th) - z * Math.sin(th),
    (x * Math.sin(th) + z * Math.cos(th)) * K_TILT,
  ]);
  const xs = flat.map(([x]) => x), ys = flat.map(([, y]) => y);
  // centre the reference solid: x by its own span, y across top-of-top to base
  const ox = c / 2 - (Math.min(...xs) + Math.max(...xs)) / 2;
  const oy = c / 2 - ((Math.min(...ys) - RH) + Math.max(...ys)) / 2;
  const base = flat.map(([x, y]) => [ox + x, oy + y]);
  return { base, top: base.map(([x, y]) => [x, y - Hh]) };
}

/** Draw that box as a SOLID: hidden edges are omitted, so a shaded face reads
    as a surface rather than as hatching seen through a glass box.
    `faces` fills [top, left side, right side] with hatch densities. */
export function isoBox(c, deg, { filled = true, faces, id = 'b', h, refH, cage = false } = {}) {
  const { base, top } = boxPoints(c, deg, { ...(h ? { h } : {}), ...(refH ? { refH } : {}) });
  const st = filled ? 'var(--ink)' : 'var(--guide-l)', sw = filled ? 1.6 : 1.2;
  const P = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';

  /* The nearest base corner is the lowest on screen; the two side faces that
     meet there are the ones facing the viewer. Everything behind it is hidden. */
  let front = 0;
  base.forEach(([, y], i) => { if (y > base[front][1]) front = i; });
  const prev = (front + 3) % 4, next = (front + 1) % 4;
  const rear = (front + 2) % 4;

  const sideFace = (i, j) => [top[i], top[j], base[j], base[i]];
  const sides = [sideFace(prev, front), sideFace(front, next)]
    .sort((q1, q2) => (q1[0][0] + q1[1][0]) - (q2[0][0] + q2[1][0]));   // left, then right

  let s = '';
  if (faces) {
    [top, ...sides].slice(0, faces.length).forEach((q, i) => {
      if (faces[i] == null) return;
      const cid = `fb${id}${i}`;
      s += `<clipPath id="${cid}"><path d="${P(q)}"/></clipPath>`
        + `<g clip-path="url(#${cid})">`
        + hatch(c, c, { angle: 45, spacing: HATCH[faces[i]][0],
                        width: HATCH[faces[i]][1], id: cid + 'h' })
        + `</g>`;
    });
  }
  s += `<path d="${P(top)}" stroke="${st}" stroke-width="${sw}" fill="none"/>`;
  if (cage) {
    /* a construction cage, not an object: show all twelve edges, the three
       hidden ones dashed. Drawn solid it is indistinguishable from the form
       sitting inside it, which is the whole point of the 物 drill. */
    s += `<path d="${P(base)}" stroke="${st}" stroke-width="${sw}" fill="none"/>`;
    for (let i = 0; i < 4; i++)
      s += line(base[i][0], base[i][1], top[i][0], top[i][1],
        i === rear ? { c: st, w: sw, dash: '5 5' } : { c: st, w: sw });
    return s;
  }
  // an opaque solid: only the edges it actually shows
  for (const i of [prev, front, next])
    s += line(base[i][0], base[i][1], top[i][0], top[i][1], { c: st, w: sw });
  for (const [i, j] of [[prev, front], [front, next]])
    s += line(base[i][0], base[i][1], base[j][0], base[j][1], { c: st, w: sw });
  void rear;
  return s;
}

/** A cylinder lying along the axis A→B. `e` is end-cap foreshortening. */
export function capOverhang(x1, y1, x2, y2, r, e = 0.34) {
  const rad = Math.atan2(y2 - y1, x2 - x1);
  return { x: Math.hypot(r * e * Math.cos(rad), r * Math.sin(rad)),
           y: Math.hypot(r * e * Math.sin(rad), r * Math.cos(rad)) };
}

export function cylinderAxis(x1, y1, x2, y2, r, { e = 0.34, filled = true, id = 'c', shade } = {}) {
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const rad = (ang * Math.PI) / 180;
  const nx = -Math.sin(rad) * r, ny = Math.cos(rad) * r;   // perpendicular offset
  const st = filled ? 'var(--ink)' : 'var(--guide-l)', sw = filled ? 1.6 : 1.2;
  const cap = (x, y) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" `
    + `rx="${(r * e).toFixed(1)}" ry="${r.toFixed(1)}" fill="none" stroke="${st}" `
    + `stroke-width="${sw}" transform="rotate(${ang.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  let s = '';
  if (shade) {
    const body = `M${(x1 + nx).toFixed(1)} ${(y1 + ny).toFixed(1)}`
      + `L${(x2 + nx).toFixed(1)} ${(y2 + ny).toFixed(1)}`
      + `L${(x2 - nx).toFixed(1)} ${(y2 - ny).toFixed(1)}`
      + `L${(x1 - nx).toFixed(1)} ${(y1 - ny).toFixed(1)}Z`;
    s += `<clipPath id="cy${id}"><path d="${body}"/></clipPath><g clip-path="url(#cy${id})">`
      + hatch(Math.max(x1, x2) + r * 2, Math.max(y1, y2) + r * 2,
              { angle: ang + 90, spacing: 6, width: 1.5, id: 'cyh' + id })
      + `</g>`;
  }
  s += line(x1 + nx, y1 + ny, x2 + nx, y2 + ny, { c: st, w: sw })
    +  line(x1 - nx, y1 - ny, x2 - nx, y2 - ny, { c: st, w: sw })
    +  cap(x2, y2) + cap(x1, y1);
  return s;
}

/** A cone: base ellipse at A, tip at B, with the axis showing. */
export function coneAxis(x1, y1, x2, y2, r, { e = 0.34, filled = true, fit } = {}) {
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const rad = (ang * Math.PI) / 180;
  const nx = -Math.sin(rad) * r, ny = Math.cos(rad) * r;
  if (fit) {
    // axis-aligned half-extents of the rotated base ellipse (rx along the axis)
    const hx = Math.hypot(r * e * Math.cos(rad), r * Math.sin(rad));
    const hy = Math.hypot(r * e * Math.sin(rad), r * Math.cos(rad));
    const bx = [Math.min(x2, x1 - hx), Math.max(x2, x1 + hx)];
    const by = [Math.min(y2, y1 - hy), Math.max(y2, y1 + hy)];
    const dx = fit / 2 - (bx[0] + bx[1]) / 2, dy = fit / 2 - (by[0] + by[1]) / 2;
    return `<g transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)})">`
      + coneAxis(x1, y1, x2, y2, r, { e, filled }) + `</g>`;
  }
  const st = filled ? 'var(--ink)' : 'var(--guide-l)', sw = filled ? 1.6 : 1.2;
  return line(x1, y1, x2, y2, { c: 'var(--guide)', w: 1, dash: '4 5' })
    + `<ellipse cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" rx="${(r * e).toFixed(1)}" `
    + `ry="${r.toFixed(1)}" fill="none" stroke="${st}" stroke-width="${sw}" `
    + `transform="rotate(${ang.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)})"/>`
    + line(x1 + nx, y1 + ny, x2, y2, { c: st, w: sw })
    + line(x1 - nx, y1 - ny, x2, y2, { c: st, w: sw });
}

/** A sphere wrapped in contour lines, tilted so the wrap reads as 3D. */
export function sphereContours(cx, cy, r, tilt = 0, { filled = true, lats = 4, lon = true } = {}) {
  const st = filled ? 'var(--ink)' : 'var(--guide-l)', sw = filled ? 1.6 : 1.2;
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r}" fill="none" stroke="${st}" stroke-width="${sw}"/>`;
  if (!filled) return s;
  const g = [];
  for (let i = 1; i <= lats; i++) {
    const t = -1 + (2 * i) / (lats + 1);
    g.push(`<ellipse cx="${cx}" cy="${(cy + r * t).toFixed(1)}" `
      + `rx="${(r * Math.sqrt(1 - t * t)).toFixed(1)}" ry="${(r * 0.2).toFixed(1)}" `
      + `fill="none" stroke="var(--guide)" stroke-width="1"/>`);
  }
  if (lon) g.push(`<ellipse cx="${cx}" cy="${cy}" rx="${(r * 0.36).toFixed(1)}" ry="${r}" `
    + `fill="none" stroke="var(--guide)" stroke-width="1"/>`);
  return s + `<g transform="rotate(${tilt} ${cx} ${cy})">${g.join('')}</g>`;
}
