/* ============================================================
   GOYO — guide toolkit  (shared by the two sellable guides)
   The user guide (tools/guide.mjs) and the sticker guide
   (tools/sticker-guide.mjs) are the same GOYO guide design language —
   same seal, page frame, type scale and components; only the words
   differ. This module is the single source for all of that, so the two
   files can never drift apart.

   Exports:
     SEAL           najeon seal markup (shared with the planner/sample)
     gpage()        standard guide page (eyebrow · h1 · body · foot)
     steps()        numbered step list
     navlist()      term / description definition list
     guideCss       the guide design system (type scale + frame + parts)

   The type scale lives in one place: the :root --gz-* variables at the
   top of guideCss. Nine steps, no near-duplicates — every guide font
   size resolves to one of them.
   ============================================================ */

export const SEAL = '<div class="seal"><svg viewBox="0 0 52 16">'
  + '<ellipse cx="6" cy="9" rx="5" ry="3" fill="#74a89f" opacity=".9"/>'
  + '<ellipse cx="17" cy="9" rx="3.3" ry="2.1" fill="#e6bcc7" opacity=".85"/>'
  + '<ellipse cx="25" cy="9" rx="1.9" ry="1.3" fill="#cdbfb0" opacity=".6"/>'
  + '<circle cx="44" cy="7" r="4" fill="#efe4cf" opacity=".85"/></svg></div>';

export const gpage = (eyebrow, title, body, foot = '') =>
  `<div class="page"><div class="gpad">${SEAL}
    <div class="g-head"><div class="eyebrow">${eyebrow}</div><h1 class="h1">${title}</h1></div>
    ${body}
    ${foot ? `<div class="g-foot">${foot}</div>` : ''}</div></div>`;

export const steps = (items) => `<ol class="steps">${items.map((t) => `<li>${t}</li>`).join('')}</ol>`;
export const navlist = (items) => `<ul class="navlist">${items.map(([k, v]) =>
  `<li><span class="nk">${k}</span><span class="nv">${v}</span></li>`).join('')}</ul>`;

/* ---- guide design system (layered after base.css) ---- */
export const guideCss = `
/* type scale — the only guide font sizes; everything below references these */
:root{
  --gz-display:72px;  /* cover wordmark            */
  --gz-h1:54px;       /* page title                */
  --gz-tag:27px;      /* cover tagline             */
  --gz-feature:22px;  /* lead + emphasis (nav key, filename) */
  --gz-body:20px;     /* body copy                 */
  --gz-body-sm:18px;  /* steps, nav value, notes   */
  --gz-meta:16px;     /* supporting meta           */
  --gz-eyebrow:13px;  /* page eyebrow + footers    */
  --gz-label:12px;    /* section labels            */
}
html,body{margin:0;padding:0;background:var(--bg);}
body{display:block;}
.page{margin:0 auto;break-after:page;page-break-after:always;background:
  radial-gradient(120% 80% at 50% 28%,var(--surface) 0%,var(--bg) 60%);}
.page:last-of-type{break-after:auto;}
@page{size:1080px 1440px;margin:0;}
@media print{.page{box-shadow:none;}}
.gpad{padding:96px 110px;height:100%;display:flex;flex-direction:column;}
.g-head{margin-bottom:18px;}
.h1{font-size:var(--gz-h1);}
.eyebrow{font-size:var(--gz-eyebrow);}
.g-body,.g-lead{font-family:var(--sans);color:var(--muted);font-size:var(--gz-body);line-height:1.7;margin:18px 0;}
.g-lead{font-size:var(--gz-feature);color:var(--ink);max-width:760px;}
.g-body b,.g-lead b{color:var(--ink);font-weight:600;}
.g-sub{font-family:var(--sans);font-size:var(--gz-label);letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent);margin:34px 0 6px;border-bottom:1px solid var(--accent-line);padding-bottom:9px;}
.steps{counter-reset:s;list-style:none;padding:0;margin:14px 0 6px;}
.steps li{counter-increment:s;position:relative;padding:12px 0 12px 56px;font-size:var(--gz-body-sm);color:var(--ink);
  line-height:1.55;border-bottom:1px solid var(--hair);}
.steps li::before{content:counter(s);position:absolute;left:0;top:11px;width:34px;height:34px;
  border-radius:50%;border:1px solid var(--accent-line);color:var(--accent);font-family:var(--serif);
  font-size:var(--gz-body-sm);display:flex;align-items:center;justify-content:center;}
.steps li b{color:var(--accent);font-weight:500;}
.navlist{list-style:none;padding:0;margin:20px 0;}
.navlist li{display:flex;gap:24px;padding:16px 2px;border-bottom:1px solid var(--hair);align-items:baseline;}
.navlist .nk{font-family:var(--serif);font-style:italic;font-size:var(--gz-feature);color:var(--accent);width:210px;flex:none;}
.navlist .nv{font-size:var(--gz-body-sm);color:var(--muted);line-height:1.55;}
.navlist b,.g-note b{color:var(--ink);}
.g-note{margin-top:28px;border:1px solid var(--accent2-line);background:var(--accent2-fill);
  border-radius:12px;padding:22px 26px;font-size:var(--gz-body-sm);line-height:1.65;color:var(--muted);}
.g-foot{margin-top:auto;padding-top:28px;border-top:1px solid var(--hair);
  font-size:var(--gz-eyebrow);letter-spacing:.08em;color:var(--faint);}
/* welcome / cover */
.g-welcome{align-items:center;text-align:center;justify-content:center;}
.g-welcome .seal{justify-content:center;}
.g-eyebrow{font-size:var(--gz-eyebrow);letter-spacing:.42em;text-transform:uppercase;color:var(--faint);margin-top:8px;}
.g-wordmark{font-family:var(--serif);font-weight:300;font-size:var(--gz-display);letter-spacing:.36em;
  color:var(--ink);padding-left:.36em;margin:30px 0 16px;}
.g-tag{font-family:var(--serif);font-style:italic;font-size:var(--gz-tag);color:var(--accent);}
.g-welcome .g-lead{margin-top:40px;text-align:center;}
.g-rule{display:flex;justify-content:space-between;width:100%;margin-top:54px;border-top:1px solid var(--hair);
  padding-top:24px;font-size:var(--gz-eyebrow);letter-spacing:.08em;color:var(--faint);}
`;
