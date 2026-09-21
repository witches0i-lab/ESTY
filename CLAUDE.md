# CLAUDE.md — witches0i-lab/ESTY

## ── COMMON (applies to every journal theme in this repo) ──

> ⚠️ "COMMON"은 **GOYO 라인의 저널 테마들**에 적용된다. 이 레포에는 라인이 둘 있다 —
> **GOYO**(najeon/light/hanji + 스티커 가이드)와 **INAE**(`inae/`, 별개 라인).
> INAE에 COMMON을 통째로 적용하지 말 것: 어느 항목이 유효하고 어느 항목이 아닌지는
> 아래 「INAE (이내) — 신규 라인」 섹션에 명시돼 있다.

### Repo scope
This is the CODE track only. Design and marketing live elsewhere, NOT here:
- Design: Figma `Ds1jpwqKkL1nkWpTXsJczw` (Etsy-Project)
- Marketing / copy / SEO / pricing / pin status: Notion master hub
  → Read Notion page "🧭 GOYO 현재 상태 (Single Source of Truth)" for cross-track state.
- Chat-side Claude (claude.ai) handles Figma + Notion but CANNOT access this repo.
  Claude Code CANNOT access Figma or Notion. The Notion status page is the bridge.
- Chat-side memory and Claude Code memory are NOT shared. Don't assume shared context — read this file + Notion.

### Stack
Plain static site — no framework, no bundler, no npm dependencies. `tools/*.mjs` use
only Node built-ins (`node:fs`, `node:path`, `node:child_process`, `fetch`/`WebSocket`).
There is no test suite and no linter; correctness is verified visually + via
`docs/link-test.md`'s PDF link-count check.

### Source of truth (READ FIRST)
- `index.html` is the source of truth for **page design/markup** — one hand-authored
  instance of each of the 7 base pages (Cover, Year, Monthly, Daily, Habits, Notes,
  Gratitude; 1080×1440px each), styled by `css/tokens.css` + `css/base.css`, populated
  at load time by `js/journal.js` (date strip, calendar grid, mood/water widgets, etc.)
  and `js/medallion.js` (procedural najeon cover art). Open it with `npm run dev` to
  preview design changes directly.
- **`tools/planner.mjs` does NOT read `index.html`'s page markup** (only its `.cover`
  block, via `sliceClass()`, for the cover art). Every other page (Year, Monthly, Daily,
  Habits, Notes, Gratitude) is a **second, independent copy** of the same markup, built
  as template-literal string functions (`yearPage()`, `monthlyPage()`, `dailyPage()`,
  `habitsPage()`, `monthNotesPage()`, `gratitudePage()`) that loop over real
  month/day data to emit the full undated year (366 days incl. Feb 29, 12 months ×
  monthly+habits+notes pages, 405 pages total).
  **→ Any markup/structure change made in `index.html` for a non-cover page must be
  hand-mirrored into the matching function in `tools/planner.mjs`, or the shipped
  product silently drifts from the design source.** This is the single most important
  gotcha in this repo.
- `planner.html` (repo root) is a **generated build artifact** — `planner.mjs` overwrites
  it on every run as the najeon-only live preview of the full 405-page build. Never
  hand-edit it; don't treat it as canonical.

### Build pipeline (`tools/`)
- `npm run export` (`tools/planner.mjs`) → the real product: per-theme
  `export/<theme>/goyo-print.html` (combined, hyperlinked, 405 undated pages) +
  root `planner.html` (najeon preview). Anchor-ID scheme: `p-cover`, `p-year`,
  `p-m<MM>`, `p-d<MM><DD>`, `p-h<MM>`, `p-n<MM>`, `p-grat` (see `mId/dId/hId/nId`
  helpers) — any new page type must follow this scheme and be wired into both
  `tabs()` (top nav) and `rail()` (month rail).
- `npm run guide` (`tools/guide.mjs`) → 5-page per-theme user guide,
  `export/<theme>/goyo-guide.html`.
- `npm run sticker-guide` (`tools/sticker-guide.mjs`) → 3-page sticker-pack guide,
  `export/goyo/goyo-sticker-guide.html` (single `goyo` theme only — see below).
- Both guides share one design system + component builders — `tools/guide-kit.mjs`
  (`SEAL`, `gpage()`, `steps()`, `navlist()`, `guideCss` with the `--gz-*` type-scale
  tokens). **Edit `guide-kit.mjs` for shared guide layout/type changes; each
  generator only supplies its own copy/page list** (`sticker-guide.mjs` additionally
  layers a small `stickerCss` override to fit its content onto 3 pages instead of 5).
- `npm run pdf` (`tools/pdf.mjs`) → drives a local Chrome/Chromium over raw DevTools
  Protocol (dependency-free, no Puppeteer) to print every `goyo-print.html` /
  `goyo-guide.html` / sticker-guide HTML to PDF, preserving `#anchor` links as PDF
  GoTo links. Requires local Chrome; otherwise prints a manual
  "Print → Save as PDF" fallback and exits cleanly. Known constraints baked into the
  code (don't "fix" these away): `generateTaggedPDF:false` (avoids ~45% size bloat),
  streamed `IO.read` in ~1MB chunks (inlining hangs on 20MB+ files), a 600ms settle
  delay before printing (webfonts/medallion need to finish rendering).
- `npm run build` = export + guide + sticker-guide + pdf, in that order.
- QA: `docs/link-test.md` is the pre-publish checklist (GoodNotes/Notability tap-through
  + a `node -e` one-liner counting `/Subtype /Link` annotations in the built PDF;
  expect ~18,800 across 405 pages for the planner).

### Design-token / theme conventions
- `css/tokens.css` — single source of design tokens (`:root` palette/type/spacing
  variables). Change a variation by editing tokens only; `css/base.css` (layout) should
  never need to change per-theme.
- Colorway files (`themes/light.css`, `themes/hanji.css`) override `:root` tokens and
  add a handful of theme-specific selector overrides (seal fill, cover gradient,
  medallion swap). They must be linked **after** `tokens.css` — later link wins.
  najeon is the unstyled base (no override file); it IS `tokens.css`'s defaults.
- Per-theme cover art lives in `themes/cover/` (SVG `defs` + a pre-baked base64 PNG
  "pine" raster layer per theme). The pine layer is flattened to a single raster
  deliberately — stacked semi-transparent SVG shapes render fine in Chromium but some
  PDF viewers mis-composite nested transparency groups as black; baking to PNG also
  roughly halves final PDF size.
- Keep product lines/themes namespaced; one theme's change must never leak into another.
- When color assignments change, edit CSS rules AND HTML markup together.
- Measure before changing; never guess coordinates/values from memory.
- Don't treat `planner.html` as canonical.

### Undated-design invariant
No year or weekday is ever printed anywhere (design intent: reuse every year).
Day counts are fixed system-wide at `[31,29,31,30,31,30,31,31,30,31,30,31]` (Feb
pinned to 29 so the same file works in leap years) — this constant is duplicated in
`js/journal.js`, `index.html`'s static Monthly sample, and `tools/planner.mjs`'s
`MLEN`; if it ever needs to change, update all three.

## ── GOYO (Journal) — theme-specific ──
- Korean craft-inspired digital wellness journal for iPad (GoodNotes/Notability), undated hyperlinked PDFs.
- Colorways: Najeon (dark, the base), Light (pink/cyan on white), Hanji (warm cream paper, amber/sage — NOT dark, unlike najeon/light being read as "the dark ones"). Keep each colorway isolated.
- Status: journal build COMPLETE (2026-07). Maintenance/edits only.

## ── GOYO Sticker Guide — product-specific ──
- Separate product line: a quick-start guide for the companion GOYO sticker pack (162 stickers), NOT a journal theme.
- Single `goyo` theme only (the Najeon base, dark) — no light/hanji colorways. 3 pages, same GOYO guide design language (seal, type, frame) via `tools/guide-kit.mjs`.
- Build: `tools/sticker-guide.mjs` (`npm run sticker-guide`, also part of `npm run build`) → `export/goyo/goyo-sticker-guide.html` → `.pdf` via `tools/pdf.mjs`.
- The COMMON "7 journal base pages" rule does NOT apply here; keep this product namespaced from the journal.
- Status: build COMPLETE (2026-07). Maintenance/edits only.

## ── INAE (이내) — 신규 라인 (GOYO와 별개) ──
- **제품 라인이지 GOYO 테마가 아니다.** 착수 결정 2026-09-21 (Jude), Notion 마스터 허브
  「🆕 신규 착수 상태」에 기록. GOYO의 컬러웨이(najeon/light/hanji)와 같은 층위가 아니라
  GOYO와 나란히 서는 별개 라인.
- **격리 계약 — 공유 파일 0개.** 토큰·레이아웃·페이지 마크업·표지 아트·guide-kit 전부 분리.
  공통은 *포맷* 제약(1080×1440, print reset, `#anchor` 하이퍼링크)뿐이고 그건 커플링이 아니다.

  | | GOYO | INAE |
  |---|---|---|
  | 디자인 소스 오브 트루스 | `index.html` | `inae/index.html` |
  | 토큰 | `css/tokens.css` | `inae/css/tokens.css` |
  | 레이아웃 | `css/base.css` | `inae/css/base.css` |
  | 생성기 | `tools/planner.mjs` | `inae/tools/build.mjs` |
  | 산출물 | `export/<theme>/goyo-*.html` | `export/inae/inae-*.html` |
  | 앵커 프리픽스 | `p-*` | `i-*` |

  → **한쪽 변경이 다른 쪽을 건드리게 만들지 말 것.** 라인 경계를 넘어 import하고 싶어지면
  옆으로 손 뻗지 말고 라인 중립 모듈로 따로 빼낸다.
- 빌드: `npm run inae:export` → `export/inae/inae-print.html`. GOYO의 `npm run build`에는
  **일부러 넣지 않았다** (라인 격리). 프리뷰는 `npm run dev` 후 `/inae/`.
- **COMMON의 다음 규칙은 INAE에 적용되지 않는다:** 「7개 저널 base 페이지」,
  「undated 불변식(MLEN 366일 고정)」, 「index.html ↔ planner.mjs 수동 미러링」,
  「`themes/` 컬러웨이 등록 체크리스트」. 전부 GOYO 라인의 규칙이다.
- **COMMON에서 그대로 유효한 것:** 레포 범위(코드 트랙 전용), 스택(no framework/bundler/npm deps,
  Node 빌트인만), 라인 네임스페이싱, 「측정하고 바꿔라 · 기억으로 좌표 추측 금지」,
  색 바꿀 때 CSS와 HTML 같이 고치기.
- **안티드리프트:** GOYO 최악의 함정(마크업 두 벌 = `index.html`과 `planner.mjs`)을
  **INAE에서 재현하지 말 것.** `inae/tools/build.mjs`는 마크업을 `inae/index.html`에서
  슬라이스해 온다. 데이터 루프가 필요해져도 *마크업*은 계속 index.html에서 읽어라.
- **Etsy 어휘는 `journal`이 아니라 `planner`.** Notion Marketplace Insights 12건 전수에서
  planner 계열=High~Very high 전환 / journal 계열=Low~Typical, 예외 없음. GOYO는 journal로
  이미 발행해 되돌리는 비용을 치르는 중이고 INAE는 백지라 처음부터 맞게 간다 —
  제품명·파일명·SKU·페이지 타이틀·리스팅 카피 전부.
- **아직 미정 (실제 페이지 작업을 막는 항목):** 제품 형태(GOYO식 405p 언데이티드 영속형인지
  다른 페이지 구성인지) · 페이지 세트 · 모티프/팔레트/타입 · 컬러웨이 수.
  현재 유일한 디자인 입력은 Framer 랜딩 티저 **색·달·구름·별**뿐이고 Figma
  `Ds1jpwqKkL1nkWpTXsJczw`에 INAE 페이지는 **없다**.
- **현재 상태: 스캐폴드만 존재.** `inae/css/tokens.css` 값은 전부 **임시 플레이스홀더**이고
  `inae/index.html`은 파이프라인 동작 확인용 Cover 1장뿐. 세부는 `inae/README.md`.
- PDF 단계는 **아직 없다** — `tools/pdf.mjs`(172줄 CDP 드라이버)를 플레이스홀더 때문에
  복사하면 이후 버그를 두 번 고치게 된다. 페이지 세트 확정되면 그때 **CDP 드라이버를
  라인 중립 모듈로 추출해 양쪽이 호출**하게 할 것. 그때까지는 수동 인쇄.

## ── Adding a new theme later ──
- Duplicate the GOYO theme-specific section, rename, and fill in that theme's specifics.
- Keep the COMMON section untouched.
- New theme checklist (derived from how light/hanji were built): add `themes/<name>.css`
  (tokens override + seal/cover selector overrides), `themes/cover/<name>.defs.svg` +
  `<name>.pine.b64` (or a `.med-swap` raster swap like hanji's changho PNG), register
  the theme in the `themes` object in both `tools/planner.mjs` and `tools/guide.mjs`,
  and add it to the `themes` array in `tools/pdf.mjs`.
