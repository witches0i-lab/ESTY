# INAE Practice — 드로잉북 스펙 v0.2

> 배치 위치: `docs/drawingbook-spec.md` (v0.1 덮어쓰기)
> 갱신: 2026-09-21 · v0.1(2026-09-07) 대비 변경점은 §0

---

## 0. v0.1 → v0.2 변경점 (클코 필독)

| 항목 | v0.1 | v0.2 |
|---|---|---|
| 분량 | 63p (실질 백지 23장, 37%) | **60p · 드릴 52장 · 백지 템플릿 3장** |
| 커리큘럼 단위 | 30 Days (프롬프트 30개) | **52 Drills** — 모든 드릴 페이지가 번호를 가짐 |
| 라틴 디스플레이 | Cormorant Garamond | **Newsreader Light / Light Italic** |
| 메타 라벨 | Courier Prime | **Inter Medium** |
| 지시 문법 | 墨=`EXAMPLE→YOURS`, 形=`GIVEN` 혼재 | **`EXAMPLE → YOURS` 단일 문법** |
| 표지 메타 | `63 PAGES · 30 DAYS · UNDATED` | **`60 PAGES · 52 DRILLS · UNDATED`** |

서체 변경 이유: INAE 파운데이션(Figma `INAE journal` 770:11917, `Foundations v1 — Newsreader / Noto Serif KR / Inter`)과 일치시킨다. GOYO 서체를 쓰면 같은 샵 썸네일에서 INAE가 GOYO 변형으로 읽힌다.

---

## 1. 스코프

INAE 라인 첫 제품. **디지털 드로잉 연습북 1권** (iPad · GoodNotes/Notability, 하이퍼링크 PDF).

- 손그림 불필요 — 전 페이지 벡터/코드 생성
- 목표는 판매. 브랜드 실험 아님
- 가격 $7–9. 진입 미끼는 무료 샘플 3페이지(Pinterest·리드마그넷)로 대체, 리스팅 수 늘리지 않음

**표지 카피 (확정):**
> The fundamentals of line and space.
> 매일 20분, 선과 여백의 기초

한자(`練習`, 섹션 한자 탭)는 브랜드 인상 담당, 기능 정보는 영어가 담당한다. 지시문·라벨은 영어 우선.

---

## 2. 아키텍처 — repo 구조 복사 규칙

**복사 대상은 스티커 가이드 패턴이다. `index.html`(저널 7페이지 소스) 아님.** CLAUDE.md 스티커 가이드 항목의 선례를 따른다.

**상속:** 생성기 단일 소스(`tools/<product>.mjs`) · `guide-kit.mjs` 참조 방식 · 앵커 ID 스킴 + `tabs()` 배선 · `tools/pdf.mjs` 파이프라인(`#anchor` → PDF GoTo 보존) · `docs/link-test.md` 링크 QA
**상속 안 함:** 저널 7페이지 마크업 · `index.html`↔`planner.mjs` 이중화 · 366일 루프 / `MLEN` / `rail()`
**불변식:** 연도·요일·날짜 미인쇄 (undated)

```
tools/drawingbook.mjs        # 생성기 단일 소스
tools/drawingbook-kit.mjs    # 드릴 프리미티브 (그리드/소실점/해칭/점묘/프레임/타원)
css/drawingbook.css
themes/inae.css              # 토큰
assets/inae/hanji-1080x1440.png
export/inae/inae-practice.html
export/inae/inae-practice.pdf
```
`npm run drawingbook` 추가, `npm run build` 체인 편입.

---

## 3. 비주얼 시스템

### 3.1 타이포그래피
| 역할 | 서체 | 비고 |
|---|---|---|
| 한자·한글 (탭, 제목 앞부분, 부 표기) | Noto Serif KR Regular | |
| 라틴 디스플레이 (제목 라틴부, 표지 INAE/PRACTICE, 표지 카피) | Newsreader Light | 강조 필요 시 Light Italic |
| 메타 라벨 — 대문자 (FORM · DRILL 36, 15–25 MIN, EXAMPLE, YOURS, VP · L) | Inter Medium | 트래킹 **8%** |
| 지시문·폴리오 — 소문자 포함 | Inter Medium | 트래킹 **1%** |

- **혼용 줄은 단일 텍스트 노드 + 구간별 폰트.** 한자/라틴을 별도 노드로 나누면 베이스라인이 어긋난다.
- 12–13px 메타 줄에는 한자 금지. 부 표기(`二 墨`)는 푸터에만.
- 제목 크기 38 / 메타 12.5 (v0.1 샘플값 유지).

### 3.2 색 토큰
| 토큰 | 값 | 용도 |
|---|---|---|
| `--paper` | `#F2EDE4` (텍스처 베이스 `#F3EEE6`) | 배경 |
| `--ink` | `#262322` | 예시 선·면, 제목 |
| `--guide` | `#B9AE9B` | 드릴 가이드 |
| `--guide-l` | `#D3C9B7` | 옅은 가이드 |
| `--hair` | `#CFC5B2` | 괘선, YOURS 박스 |
| `--muted` | `#8C8172` | 메타·지시문 |
| `--seal` | `#9C4A3A` | 낙관 (미정, 예약) |

### 3.3 페이지 그리드 (1080×1440, 좌우 여백 84)
| 요소 | y |
|---|---|
| 탭 내비 베이스라인 | 60 |
| 탭 하단 괘선 | 98 |
| 메타 줄 (좌: 섹션 · DRILL nn / 우: 소요시간) | 168 |
| 제목 | 214 |
| 지시문 | 264 |
| 본문 시작 | 356 |
| 본문 끝 / 푸터 괘선 | 1310 / 1352 |
| 푸터 (좌: 부 표기 / 우: `p-{id} · {folio}`) | 1384 |

### 3.4 종이 텍스처
- 1080×1440 전면 래스터 PNG 1장. CSS 배경으로 문서에 **1회만** 임베드, 전 페이지 공유.
- 1px 그레인(σ 2.1) + 광역 농담(진폭 0.85). 섬유 결 넣지 않음(긁힘으로 읽힘).
- SVG `<pattern>` 타일링 금지 (Figma 미지원, 늘어나서 깨짐).

### 3.5 탭 내비
`目次 線 墨 餘白 形 自由 記錄` — 각 탭은 해당 섹션 첫 페이지 앵커로 링크. 현재 섹션 탭은 `--ink` + 하단 2px 언더라인, 나머지 `--muted`.

---

## 4. 지시 문법 — `EXAMPLE → YOURS`

모든 드릴 페이지에 적용. 레이아웃은 두 가지만 쓴다.

| 레이아웃 | 구조 | 쓰는 곳 |
|---|---|---|
| **A · Rows** | 좌 EXAMPLE 칸 → 화살표 → 우 YOURS 칸, 행 반복 (m01 샘플 기준) | 농담·단계·비교형 |
| **B · Band** | 상단 EXAMPLE 띠(높이 ~200) + 하단 YOURS 필드 | 선 반복·투시·구도형 |

- EXAMPLE = `--ink`로 완성된 시연. YOURS = `--hair` 박스 + 필요한 가이드만 `--guide-l`.
- 형(形) 섹션의 기존 `GIVEN` 라벨은 `EXAMPLE`로 교체. 투시 가이드선은 YOURS 필드에 남긴다.
- 사용법 페이지(x02)에서 이 문법 1회 설명 + "Duplicate any page to repeat a drill." 안내.

### 해칭 계조 공식 (v0.1 유지)
45° 해칭 실효 간격 = 간격 × 0.707 → 굵기 = 목표농도 × 0.707 × 간격
25% → 간격 8 / 굵기 1.4 · 50% → 5 / 1.8 · 75% → 4 / 2.1 · 100% → 면 채움

---

## 5. 페이지 맵 (60p)

ID 규칙: `x`=전면 · `l`=線 · `m`=墨 · `s`=餘白 · `f`=形 · `b`=自由 · `r`=記錄
DRILL 번호는 01–52 전역 연번. 메타 줄 좌측 = `{SECTION} · DRILL {nn}`.

| 섹션 | ID | 폴리오 | DRILL | 섹션 라벨 | 푸터 |
|---|---|---|---|---|---|
| 前 | x01–x03 | 1–3 | — | — | — |
| 一 線 | l01–l12 | 4–15 | 01–12 | LINE | 一 線 |
| 二 墨 | m01–m12 | 16–27 | 13–24 | INK | 二 墨 |
| 三 餘白 | s01–s08 | 28–35 | 25–32 | SPACE | 三 餘白 |
| 四 形 | f01–f20 | 36–55 | 33–52 | FORM | 四 形 |
| 五 自由 | b01–b03 | 56–58 | — | FREE | 五 自由 |
| 記錄 | r01–r02 | 59–60 | — | RECORD | 記錄 |

### 5.0 前
| ID | 폴리오 | 내용 |
|---|---|---|
| x01 | 1 | 표지 (Figma `881:1724`) |
| x02 | 2 | How to use — `EXAMPLE → YOURS` 설명, 페이지 복제 안내, 권장 도구(단단한 브러시, 불투명도 100%) |
| x03 | 3 | 目次 — 5부 + 記錄, 각 드릴 제목 목록 전부 하이퍼링크 |

### 5.1 一 線 Line — DRILL 01–12
| ID | DRILL | 제목 | 지시문 | 레이아웃 · 생성 파라미터 | 시간 |
|---|---|---|---|---|---|
| l01 | 01 | 橫線 · Horizontal lines | Connect each pair of dots in one stroke. | B · 점쌍 12행, 길이 780, 행간 64 | 5–10 |
| l02 | 02 | 縱線 · Vertical lines | Top to bottom. Don't slow down at the end. | B · 점쌍 10열, 길이 700 | 5–10 |
| l03 | 03 | 斜線 · Diagonals | Both directions. Keep the angle steady. | B · 45°·30° 각 8쌍 | 5–10 |
| l04 | 04 | 連點 · Connect the points | Join the numbered points in order. | B · 산포점 24개(seed 고정), 번호 라벨 | 10 |
| l05 | 05 | 平行 · Parallel lines | Add five lines beside the given one. Keep the gap even. | A · 기준선 1 → 빈칸, 6행, 목표 간격 12 | 10 |
| l06 | 06 | 長線 · Long lines | Edge to edge. Use your shoulder, not your wrist. | B · 전폭 912 점쌍 8행 | 5–10 |
| l07 | 07 | 弧 · Arcs | Pass through all three points. | B · 3점 호 12세트 | 10 |
| l08 | 08 | 圓 · Circles | One motion per circle. Do not correct. | B · 140 박스 4×5, EXAMPLE 띠에 가이드 원 | 10 |
| l09 | 09 | 楕圓 · Ellipses in boxes | Touch all four sides of each box. | A · 박스 비율 1:0.2 / 0.35 / 0.5 / 0.65 / 0.8 | 10–15 |
| l10 | 10 | 螺旋 · Spirals | From the center out. Keep the spacing even. | B · 아르키메데스 나선 예시 1 + 빈칸 4 | 10 |
| l11 | 11 | 輪郭 · Contour | Trace the outline, then draw it again beside it. | A · 윤곽 3종: 잎, 달항아리 실루엣, 돌 | 15 |
| l12 | 12 | 强弱 · Line weight | Press, then release. One line, three weights. | A · 테이퍼 선 0.8 / 1.6 / 3.2 | 10 |

### 5.2 二 墨 Ink — DRILL 13–24
| ID | DRILL | 제목 | 지시문 | 레이아웃 · 생성 파라미터 | 시간 |
|---|---|---|---|---|---|
| m01 | 13 | 四段 濃淡 · Four values | Match the density on the left. One direction only, one pen. | A · 해칭 공식 25/50/75/100 (Figma `878:17110`) | 15–25 |
| m02 | 14 | 交叉 · Cross-hatching | Add one layer per step. | A · 레이어 1–4 (45° → 135° → 0° → 90°) | 15–25 |
| m03 | 15 | 點描 · Stippling | Dots only. Build the value slowly. | A · 점밀도 25/50/75 (100px²당 약 20/55/110점) | 20–25 |
| m04 | 16 | 亂線 · Scribble | Loose loops. Control the density, not the shape. | A · 랜덤워크 스크리블 3단 | 10–15 |
| m05 | 17 | 七段 · Seven-step scale | Fill each cell one step darker than the last. | A · 7칸 바, EXAMPLE 평면 명도 95→10% | 15 |
| m06 | 18 | 漸層 · Gradient | Light to dark without visible steps. | B · 912×120 바, EXAMPLE 해칭 간격 점증 | 15 |
| m07 | 19 | 球 · Shade a sphere | Light from the upper left. | A · 원 윤곽 + 광원 화살표, EXAMPLE 해칭 음영 | 15–20 |
| m08 | 20 | 六面體 · Shade a cube | Three faces, three values. | A · 등각 육면체, 면별 25/50/75 | 15 |
| m09 | 21 | 圓柱 · Shade a cylinder | Follow the curve with your strokes. | A · 원기둥, 곡면 해칭 | 15–20 |
| m10 | 22 | 影 · Cast shadows | Find where the light stops. | B · 지면 + 광원점 + 구·육면체·원뿔 | 20 |
| m11 | 23 | 光向 · Light direction | Same cube, three lights. | A · 육면체 ×3, 광원 좌/상/우 | 20 |
| m12 | 24 | 質感 · Texture | Match each surface with line alone. | A · 나무결 / 돌(점묘) / 천(교차) / 물(수평 끊은선) | 20–25 |

### 5.3 三 餘白 Space — DRILL 25–32
| ID | DRILL | 제목 | 지시문 | 레이아웃 · 생성 파라미터 | 시간 |
|---|---|---|---|---|---|
| s01 | 25 | 餘白 一 · Negative space | Fill only the space around the object. | A · 실루엣: 의자 | 15–20 |
| s02 | 26 | 餘白 二 · Negative space | Fill only the space around the object. | A · 실루엣: 사발 + 잔 | 15–20 |
| s03 | 27 | 餘白 三 · Negative space | Fill only the space around the object. | A · 실루엣: 잎 달린 가지 | 20 |
| s04 | 28 | 黑白 · Notan | Two values only. Decide what is dark. | A · 3:4 썸네일 6칸 | 15 |
| s05 | 29 | 三分 · Thirds | Place the subject on a line, not the center. | B · 3:4 프레임 6칸 + 삼분할 가이드 | 15 |
| s06 | 30 | 裁斷 · Crop | Redraw each crop from the scene above. | B · 주어진 장면 1 + 크롭 창 4 | 20 |
| s07 | 31 | 均衡 · Balance | Add one shape to balance the frame. | A · 한쪽에 매스가 놓인 프레임 ×4 | 10–15 |
| s08 | 32 | 比較 · Compare | One subject, three placements. | A · 중앙 / 삼분할 / 가장자리 라벨 빈 프레임 | 15–20 |

실루엣은 단순 벡터 도형으로 생성 (일러스트 아님).

### 5.4 四 形 Form — DRILL 33–52
| ID | DRILL | 제목 | 지시문 | 레이아웃 · 생성 파라미터 | 시간 |
|---|---|---|---|---|---|
| f01 | 33 | 一點透視 · One-point box | Pull the front face back to the vanishing point. | B · VP 중앙, 정면 사각형 6개 | 15 |
| f02 | 34 | 一點透視 · Room | Draw the room you are standing in. | B · 후벽 사각형 + VP | 20 |
| f03 | 35 | 一點透視 · Corridor | Place the posts at equal steps. | B · 소실선 4 + 기둥 1 | 20 |
| f04 | 36 | 二點透視 · Two-point box | Trace the guides. Then draw the same box with the guides ignored. | B · VP 좌우, 수직 모서리 1 (Figma `878:17049`) | 15–25 |
| f05 | 37 | 二點透視 · Stacked boxes | Stack three. Keep every edge on its point. | B · VP 좌우 + 바닥 박스 | 20 |
| f06 | 38 | 二點透視 · Block building | Add windows that shrink toward the points. | B · 건물 매스 윤곽 | 25 |
| f07 | 39 | 二點透視 · Above and below | Two boxes over the horizon, two under. | B · 수평선 중앙, 수직 모서리 4 | 20 |
| f08 | 40 | 三點透視 · Worm's eye | The third point is above you. | B · VP 3개 (상단) | 20–25 |
| f09 | 41 | 三點透視 · Bird's eye | The third point is below you. | B · VP 3개 (하단) | 20–25 |
| f10 | 42 | 回轉 · Rotation | Turn the box in 15° steps. | A · 0–90° 7단계 | 20 |
| f11 | 43 | 楕圓 · Ellipse degrees | Ellipses open as they drop below eye level. | A · 10/20/35/50/70° 수직축 | 15 |
| f12 | 44 | 圓柱 · Cylinders | Both ends share one axis. | A · 서기/눕기/기울기 | 15–20 |
| f13 | 45 | 圓錐 · Cones | Find the tip on the axis. | A · 3방향 | 15 |
| f14 | 46 | 球 · Spheres | Wrap the contour lines around the form. | A · 등고선 구 3각도 | 15–20 |
| f15 | 47 | 複合 · Combined forms | Join the box and cylinder cleanly. | A · 박스+원기둥 / 원뿔+원기둥 | 20 |
| f16 | 48 | 積 · Stacking | Balance four forms on each other. | B · 지면 + VP | 20 |
| f17 | 49 | 斷面 · Cross-sections | Slice the form. Show every section. | A · 자유곡면 3 | 20 |
| f18 | 50 | 器 · Vessel | Build the jar from ellipses. | A · 달항아리 / 사발 (타원 + 윤곽) | 20–25 |
| f19 | 51 | 物 · Objects as boxes | Reduce each object to a box first. | A · 책 / 잔 / 상자 | 20 |
| f20 | 52 | 綜合 · Still life | Everything together. One page, no guides. | B · 지면선만 | 25+ |

f18 달항아리는 Pinterest·Etsy 썸네일 후보 (K 정체성이 콘텐츠 안에 들어간 페이지).

### 5.5 五 自由 Free
| ID | 폴리오 | 내용 |
|---|---|---|
| b01 | 56 | 白紙 · Blank — 한지 무지 (Figma `878:17402`, 지시문 유지) |
| b02 | 57 | 點格 · Dot grid — 24px 간격 |
| b03 | 58 | 框 · Frames — 3:4 썸네일 프레임 6칸 |

### 5.6 記錄 Record
| ID | 폴리오 | 내용 |
|---|---|---|
| r01 | 59 | Drill log — 52칸 체크박스, 각 칸은 해당 드릴로 하이퍼링크 |
| r02 | 60 | Before / After — "Redo DRILL 06 and DRILL 36 after finishing all 52." 좌우 빈 칸 2쌍 |

---

## 6. Figma 반영 절차 (매번 동일)

1. `upload_assets` → SVG POST (위치 지정 불가)
2. `use_figma`로 `INAE drawing`(859:1724)에 `appendChild` + 좌표 + 구버전 삭제
3. 같은 스크립트에서 텍스트 폰트 강제 지정 (§3.1). SVG 임포트는 Inter Regular로 폴백됨
4. `get_screenshot`으로 실제 렌더 확인 후 보고

---

## 7. QA 체크

- [ ] 탭 7개 × 60페이지 링크 동작, 目次 드릴 52개 링크, r01 체크박스 52개 링크 → `docs/link-test.md` 카운트 기록
- [ ] 서체: 산출물에 Cormorant Garamond / Courier Prime 0건
- [ ] 메타 줄 DRILL 번호 = §5 표와 일치, 폴리오 1–60 연속
- [ ] 텍스처 PNG 1회 임베드 (PDF 용량으로 확인)
- [ ] 날짜·요일 인쇄 0건

---

## 8. 미결

- [ ] 표지 모티프 — `INAE journal`의 日(sun/dusk) / 산·안개 수묵 시안 중 택1 재사용
- [ ] 낙관 마크 — 미정. `內` 사용 금지(이내는 순우리말)
- [ ] 키워드 검증: `drawing practice worksheets` / `perspective practice` / `digital sketchbook` / `goodnotes sketchbook`
- [ ] 리스크: 그림 예시 없는 연습북의 시장 반응은 미검증. 무료 샘플 3p 반응으로 1차 판정
