# CLAUDE.md — witches0i-lab/ESTY

## ── COMMON (applies to every journal theme in this repo) ──

> ⚠️ "COMMON"은 **GOYO 라인의 저널 테마들**에 적용된다. 이 레포에는 라인이 둘 있다 —
> **GOYO**(najeon/light/hanji + 스티커 가이드)와 **INAE**(드로잉 연습북, 별개 라인).
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

## ── INAE (이내) — 별개 제품 라인 ──
- **제품 라인이지 GOYO 테마가 아니다.** 착수 결정 2026-09-21 (Jude), Notion 마스터 허브
  「🆕 신규 착수 상태」에 기록. GOYO 컬러웨이(najeon/light/hanji)와 같은 층위가 아니다.
- **첫 제품: INAE Practice — 디지털 드로잉 연습북.** 60p · 드릴 52장 · iPad
  (GoodNotes/Notability) 하이퍼링크 PDF · $7–9. 손그림 없이 전 페이지 벡터/코드 생성.
- **스펙 원본 = `docs/drawingbook-spec.md` (v0.2).** 페이지 맵·그리드·토큰·타이포·지시 문법이
  전부 거기 있다. **INAE 작업 전 반드시 먼저 읽을 것.** 이 블록은 그 요약이 아니라 배선 메모다.
- **구조 선례는 스티커 가이드 패턴이다** — `index.html`(저널 7페이지 소스) 아님. 파일 트리와
  상속·미상속 항목은 스펙 §2가 원본:
  `tools/drawingbook.mjs` · `tools/drawingbook-kit.mjs` · `css/drawingbook.css` ·
  `themes/inae.css` · `assets/inae/` · `export/inae/inae-practice.{html,pdf}`
- ⚠️ **`themes/inae.css`는 GOYO 컬러웨이가 아니다.** 아래 「Adding a new theme later」
  체크리스트의 `themes/<name>.css`와 파일명 규칙만 같을 뿐이고, `tools/planner.mjs` ·
  `tools/guide.mjs` · `tools/pdf.mjs`의 `themes` 배열에 **절대 등록하지 말 것.**
  등록하면 GOYO 3종 빌드에 INAE 토큰이 샌다.
- **서체를 GOYO와 공유하지 않는다:** Newsreader Light / Noto Serif KR / Inter Medium
  (스펙 §3.1, Figma `INAE journal` 770:11917 파운데이션과 일치). GOYO 서체(Bodoni Moda)를
  쓰면 같은 샵 썸네일에서 INAE가 GOYO 변형으로 읽힌다. 산출물에 Cormorant Garamond ·
  Courier Prime이 남아 있으면 v0.1 잔재다 (스펙 §7).
- **앵커:** 푸터 표기 `p-{id} · {folio}` (스펙 §3.3, Figma 푸터에 이미 반영됨).
  ⚠️ GOYO도 `p-` 프리픽스를 쓴다 — `p-m01`은 GOYO에선 1월 월간, INAE에선 墨 드릴1이다.
  산출물이 별개 PDF라 실동작 충돌은 없지만, 레포에서 `p-m01`을 볼 때 어느 제품인지 먼저 볼 것.
- **COMMON 중 적용 안 되는 것:** 「7개 저널 base 페이지」 · 366일 루프 / `MLEN` / `rail()` ·
  `index.html`↔`planner.mjs` 마크업 이중화 · `themes/` 컬러웨이 등록 체크리스트.
  **적용되는 것:** undated 불변식(연도·요일·날짜 미인쇄) · 코드 트랙 전용 ·
  no framework/bundler/npm deps · 라인 네임스페이싱 · 측정 후 변경.
- **Figma:** 같은 파일 `Ds1jpwqKkL1nkWpTXsJczw`의 **`INAE drawing` 페이지 (859:1724)**.
  ⚠️ `get_metadata`를 nodeId 없이 호출하면 상위 페이지 목록에 이 페이지가 **안 나온다** —
  반드시 노드 ID로 직접 호출할 것. 기존 프레임: `881:1724` x01 표지 · `878:17049` f04 투시 ·
  `878:17110` m01 해칭 · `878:17402` b01 백지. 반영 절차는 스펙 §6.
- **빌드:** `npm run drawingbook` 추가 + `npm run build` 체인 편입 (스펙 §2).
  PDF는 `tools/pdf.mjs`를 재사용한다 (새로 복사하지 말 것 — CDP 드라이버는 라인 중립 인프라).
- **서체는 서브셋해서 임베드한다** (`tools/inae-fonts.mjs` → `assets/inae/fonts.css`).
  연습북은 전 텍스트가 빌드 타임에 고정이라(독자는 그리지, 타이핑하지 않는다) 글자 목록이
  닫혀 있다 → Noto Serif KR 풀셋 수 MB 대신 **실사용 190자 = 57KB**. 외부 `<link>`를
  안 쓰는 이유는 GOYO와 같다(오프라인 렌더에서 Chrome 인쇄 파이프라인이 멈출 수 있음).
  ⚠️ **카피를 바꾸면 2패스**: `drawingbook` → `inae-fonts` → `drawingbook`.
  3패스째가 서브셋을 벗어난 글자를 잡아서 알려준다. `npm run build`에는 **일부러 안 넣었다**
  — 네트워크가 필요해서 빌드가 오프라인으로 못 돌게 된다. `fonts.css`는 커밋돼 있다.
  ⚠️ **한자·라틴 혼용 줄은 font-family 리스트로 처리한다** (`--display-mix` / `--meta-mix`,
  `--han`도 Newsreader를 뒤에 둔다). 스펙 §3.1의 "단일 노드 + 구간별 폰트"가 이것이고,
  CJK를 라틴 전용 스택에 두면 시스템 CJK 폰트로 조용히 폴백한다.
- **종이 텍스처:** `tools/inae-texture.mjs` → `assets/inae/hanji-1080x1440.png`.
  전면 RGB 래스터 1장을 문서에 1회만 임베드해 60페이지가 공유. **blend mode로 바꾸지 말 것**
  — 중첩 투명 그룹은 일부 PDF 뷰어가 검게 합성한다(GOYO pine 레이어와 같은 함정).
- **PDF:** `node tools/pdf.mjs inae` 로 이 타깃만 렌더 가능(라벨 필터). 전체는 405p × 3이라 느리다.
- **칸 정렬은 눈이 아니라 `npm run inae-audit`으로 본다.** 229개 프레임(레이아웃 A 칸 전부 +
  x02 데모 + 레이아웃 B의 band·field)의 잉크 위치를 픽셀로 재서 5px 넘게 벗어난 것,
  그리고 band/field를 **위아래로 뚫고 나간 잉크**를 잡는다. ⚠️ SVG `getBBox()`는 **클립 이전** 기하를 주므로
  길게 그어 클립한 해칭이 칸을 탈출한 것처럼 나온다 — 반드시 렌더된 픽셀로 잴 것.
  의도적 비대칭 2건(`s07` 균형, `f13`의 YOURS 축)은 도구에 선언돼 있다.
  형태 프리미티브는 **자기 bbox로 스스로 중앙정렬**한다(`boxPoints`·`coneAxis{fit}`·
  `section`·`scribble`) — 손으로 맞춘 상수를 새로 넣지 말 것.
- **QA:** 스펙 §7 체크리스트 + `docs/link-test.md` 하단 INAE 섹션.
  현재 기준값: **60페이지 · 링크 528개**(탭 413 + 目次 57 + 드릴로그 52 + x02 五部 6) · 폴백 서체 0건.
- **상태: 1차 빌드 완료 (2026-09-21).** 60p·52드릴 생성, 서체 임베드, 링크 검증 통과.
  남은 것은 스펙 §8 미결(표지 모티프·낙관·키워드 검증) + 墨 7–12 / 餘白 / 形 일부의
  EXAMPLE 작화 품질 + f04 제목(Figma `Two-point perspective` vs 스펙 `Two-point box`) 확정.

## ── Adding a new theme later ──
- Duplicate the GOYO theme-specific section, rename, and fill in that theme's specifics.
- Keep the COMMON section untouched.
- New theme checklist (derived from how light/hanji were built): add `themes/<name>.css`
  (tokens override + seal/cover selector overrides), `themes/cover/<name>.defs.svg` +
  `<name>.pine.b64` (or a `.med-swap` raster swap like hanji's changho PNG), register
  the theme in the `themes` object in both `tools/planner.mjs` and `tools/guide.mjs`,
  and add it to the `themes` array in `tools/pdf.mjs`.
