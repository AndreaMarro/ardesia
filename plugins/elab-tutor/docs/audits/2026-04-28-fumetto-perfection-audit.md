# Fumetto Perfection Audit — Sprint S iter 13 atom F1

**Date**: 2026-04-28
**Author**: fumetto-opus (Opus 4.7 1M-context)
**Sprint**: S — iter 13 PHASE 1
**Atom**: F1 (parent contract `docs/pdr/sprint-S-iter-13-contract.md` §2.1)
**Repo HEAD entrance**: `3588853` (iter 12 close 9.30/10 ONESTO)
**Mandate**: 12h product-sellable. NO regressions. vitest 12599+ baseline.

---

## §1 — Grep findings (7 entry points VERIFIED filesystem 2026-04-28)

All 7 file paths confirmed via `ls -la` post-grep:

| # | File:Line | Role | LOC scope |
|---|-----------|------|-----------|
| 1 | `src/components/unlim/UnlimOverlay.jsx:84` | "Calcola la posizione del fumetto accanto al componente" — overlay-positioning helper, NON related to SessionReportComic | helper jsdoc |
| 2 | `src/components/unlim/UnlimOverlay.jsx:163` | "Freccia SVG del fumetto — punta verso il componente" — overlay arrow rendering | jsdoc |
| 3 | `src/components/unlim/UnlimReport.jsx:578` | `a.download = fumetto-elab-${session.experimentId\|'sessione'}.html` — HTML blob fallback download path | export logic |
| 4 | `src/components/unlim/UnlimReport.jsx:595-597` | 3 regex patterns matching "crea\|genera\|fai\|apri\|mostra\|stampa (il) report\|fumetto" — `isReportCommand` voice-trigger predicate | voice cmd |
| 5 | `src/components/lavagna/LavagnaShell.jsx:857-866` | Voice command effect — listens `elab-voice-command` event detail.action==='createReport' → calls `handleFumettoOpen` (line 829-855) which dynamic-imports UnlimReport.openReportWindow | wire-up DONE |
| 6 | `src/components/lavagna/SessionReportComic.jsx` (98 LOC entire) | Functional skeleton: 6 vignette grid + photo + caption + narration + export button | redesign target F2 |
| 7 | `src/services/simulator-api.js:867-879` | `__ELAB_API.unlim.exportFumetto({sessionData,format})` → emits `fumettoExportRequested` event (stub Day 38+ comment) | wire-up F3 |

**Voice commands map** (`src/services/voiceCommands.js:327-337`): action `createReport`, patterns: `['crea il report','crea report','mostra report','genera report','report fumetto','apri report']`. Dispatches `elab-voice-command` CustomEvent `detail:{action:'createReport'}`. **MISSING from spec**: "leggi rapporto" / "mostra fumetto" — current pattern set DOES NOT include "leggi rapporto" verbatim NOR "mostra fumetto" (only "mostra report" + "report fumetto"). Add atom F3 tweak.

**Voice flow E2E (verified)**: User says "crea il report" → SpeechRecognition → voiceCommands.js:332 → `window.dispatchEvent(elab-voice-command)` → LavagnaShell.jsx:858 useEffect listener → `handleFumettoOpen()` → dynamic import `unlim/UnlimReport.js` → `openReportWindow(expId)` → captureSimulatorScreenshot + buildReportHTML + window.open OR a.download fallback. **Wire-up COMPLETE iter 12 close, NOT requiring rebuild iter 13**.

---

## §2 — Current state quality assessment (3 axes per user F1 spec)

### 2.1 Visual quality — score 5/10 onesto

**Strengths verified `src/components/lavagna/SessionReportComic.module.css` 187 LOC**:
- Brand palette compliant: Navy `#1E4D8C` (border + title color line 16,28,95,134) + Lime `#4A7A25` (export btn line 53) + Orange `#E8941C` (footer + focus line 71,160).
- Oswald applied: `.title` line 26 + `.photoPlaceholder` line 119 + `.footer` line 159.
- Open Sans applied: `.container` body line 5.
- Print CSS present: `@media print` line 169-181 hides exportBtn + page-break-inside avoid vignette.
- Reduced motion: line 183-186 transition-none.
- Photo aspect 4:3 line 106 (industry-standard comic frame).

**Weaknesses verified**:
- 3-column grid 720px breakpoint (line 81-85) → 2-col, 480px → 1-col. **Missing A4-portrait print layout** (210mm × 297mm). 6 vignettes 3×2 grid OK, but no cover/back-cover header for print.
- `.captionTitle` font-size 0.9375rem (15px) → **fails CLAUDE.md regola 8 minimum 13px** but borderline for LIM 5m projection (need ≥16-18px).
- NO Vol/pag citation in vignette text (per CLAUDE.md Sense 2 morfismo regola — VERBATIM citation mandatory). Currently only `exp.title`.
- NO Fira Code styling for any code-snippet display (Vol3 experiments include Arduino C++ code).
- `.photoPlaceholder` lime+navy gradient line 117 OK aesthetic but lacks Morfismo coupling to kit photos.

### 2.2 Narrative quality — score 3/10 onesto

**Critical gaps**:
- `narrations` prop empty by default (line 28: `session?.narrations ?? {}`). Caller (UnlimReport HTML builder NOT wired to SessionReportComic JSX component — they're TWO SEPARATE rendering paths, see §5).
- Captions are bare `exp.title` strings — no narrative arc, no Vol/pag verbatim citation, no learning-outcome summary.
- Header static "Ragazzi, ecco cosa abbiamo fatto oggi!" — Principio Zero plurale OK, but no per-class personalization (studentAlias/classKey).
- Footer static "Grazie ragazzi! Alla prossima lezione!" — generic, no next-step pedagogical pointer.

### 2.3 Actionable feedback — score 4/10 onesto

**Strengths**:
- `aria-label="Report fumetto della sessione"` line 41 (passes accessibility requirement).
- Export PDF button line 50-57 with aria-label.
- Photo placeholder when buildPhotoUrl null (line 72-76).

**Gaps**:
- NO per-vignette feedback (success/diagnosis/error). Currently caption is title only — student/teacher cannot distinguish "esperimento riuscito" vs "in corso" vs "errore corretto".
- NO ElabIcons used (regola 11 NO emoji — but icons absent altogether, e.g. could use ReportIcon, PrintIcon for export btn, BookIcon for header).
- NO accessibility role="article" verified (line 41 uses `<article>` element by default which IS implicit role=article — OK).
- Export button feedback: clicking calls `onExport` if function else `window.print()` — print quality on multi-vignette layout is browser-default (poor — see §6).

---

## §3 — Gaps vs `.impeccable.md` 5 Design Principles

**Principle 1 Morfismo Triplet (kit + volumi + software unified)**:
- VIOLATED: no Vol/pag verbatim citation per vignette. CLAUDE.md regola Sense 2 mandate "stesso ordine, stessi nomi, stesse pagine" — vignettes currently floating, not coupled to volume page numbers.

**Principle 2 Principio Zero Pedagogico**:
- PARTIAL: header "Ragazzi" plurale OK. But Sense 1.5 morfismo iter 10+ extension: should adapt to docente experience (esperto vs primo anno) + classe livello — currently static template.

**Principle 3 LIM-First Light Mode**:
- PARTIAL: white background OK. Body text 0.875rem-0.9375rem (14-15px) — borderline LIM 5m distance. Recommended ≥16-18px body, ≥24px title for LIM legibility (see Priority 3 D2 SPEC iter 14).

**Principle 4 Mai Demo Mai Mock**:
- VIOLATED: skeleton shows 6 placeholder vignettes when `experimentsCompleted=[]` — pedagogically OK as empty-state guidance but borderline mock. F2 fix: empty state should be onboarding nudge ("Inizia il primo esperimento per popolare il fumetto").

**Principle 5 Anti-Inflation CoV**:
- COMPLIANT: 98 LOC component does what claims, no over-engineering.

---

## §4 — Mapping F1 → F2/F3/F4 atom acceptance criteria

| Gap (this audit) | Addressed by | Acceptance criterion |
|------------------|--------------|----------------------|
| Vol/pag citation absent | F2 redesign | each vignette has `<span>Vol.X pag.Y</span>` rendered when `getVolumeRef(exp.id)` returns non-null |
| narrations prop empty | F2 + F3 wire-up | F2 reads `session.narrations[exp.id]` fallback to bookText auto-generated narration; F3 wire-up populates narrations from `unlimMemory` 3-tier OR `unlimContextCollector.collectFullContext()` |
| Voice cmd "leggi rapporto" / "mostra fumetto" missing | F3 wire-up | extend `voiceCommands.js:330` patterns array += `'leggi rapporto'`,`'leggi il rapporto'`,`'mostra fumetto'` |
| ElabIcons absent | F2 redesign | use `<ReportIcon/>` in header + `<PrintIcon/>` in export btn + `<BookIcon/>` in vignette caption |
| Captions feedback poor | F2 redesign | per-vignette ariaLabel describes outcome ("Esperimento N — Vol.X pag.Y — costruzione completa") |
| No tests | F4 | ≥10 unit tests vitest jsdom |
| No Oswald assertion | F4 | className-based check (CSS module class) for `.title` + `.captionTitle` |

---

## §5 — Two rendering paths discovered (CRITICAL — not in original brief)

`UnlimReport.jsx:566-585` `openReportWindow` builds **HTML string** via `buildReportHTML(session, lessonPath, screenshot)` — this is the LIVE path triggered by voice command. It opens `window.open(url)` with raw HTML blob (NOT React component).

`SessionReportComic.jsx` is a **React JSX component** — currently NOT mounted anywhere in production wire-up (ZERO `<SessionReportComic>` JSX usage found via grep `<SessionReportComic` in `src/`). It's an orphan component awaiting integration.

**Implication for F3 wire-up**: voice cmd CURRENTLY works → `openReportWindow` HTML path. SessionReportComic JSX path is ALTERNATIVE not replacement. F3 must decide:
- **Option A** (less risky iter 13): keep HTML path live, expose SessionReportComic as preview-modal via `window.__ELAB_API.unlim.previewFumetto()` for in-Lavagna preview, voice cmd still hits HTML path.
- **Option B** (more risky): rewrite `openReportWindow` to render SessionReportComic via `react-dom/server` `renderToStaticMarkup`, emit HTML from JSX. Bigger refactor risk.

**F3 chosen**: Option A — preserve voice path live, add SessionReportComic as in-Lavagna preview (modal/overlay) gated by `window.__ELAB_API.unlim.previewFumetto()` action. Iter 14 may unify paths.

---

## §6 — Honesty caveats (iter 13 scope NOT iter 14)

1. **Fumetto perfection NOT single-iter goal**: F1-F4 ship visible improvements in JSX path + Vol/pag citation + tests. Full perfection includes iter 14 LLM-generated narrations from session.errors+session.successes auto-summary, iter 15 multi-modal photo+video, iter 16 teacher review/edit before export.

2. **VolumeViewer annotations integration deferred iter 14**: per `src/components/lavagna/VolumeViewer.jsx:3` jsdoc "Annotations saved in localStorage per volume+page. Contributes to fumetto report." — verified VolumeViewer exists but iter 13 F2 does NOT integrate annotations into vignettes (scope creep). Static photo map + buildPhotoUrl preserved. Iter 14 atom: read `localStorage.getItem('elab_volume_annotations_${volume}_${page}')` per vignette, render thumbnail.

3. **PDF export quality**: `window.print()` fallback line 36 uses browser default A4 layout. Print CSS present (line 169-181) but lacks: explicit page-break-after on cover, header repeat per page, full-bleed image control. Iter 14: `@page { size: A4; margin: 1.5cm }` + per-vignette page-break-before for guaranteed N-vignettes-per-page layout. Iter 15: third-party PDF lib (jsPDF + html2canvas) for pixel-accurate export.

4. **Voice command coverage gaps**: regex `/^(crea|genera|fai|apri|mostra|stampa)\s+(il\s+)?(report|fumetto)$/` does NOT match "leggi rapporto" / "leggi il rapporto" / "mostra fumetto". F3 fix extends patterns. False-positive check: "crea il programma" → does NOT match (no `report|fumetto` token), safe.

5. **Performance — 6 vignettes × real photos**: photos served from `/public/photos/<volume>/<id>.jpg` via static map. `loading="lazy"` already present line 70. NO Supabase Storage URLs iter 13 (would need CDN cache). Iter 14: VolumeViewer annotations canvas snapshots (data URLs) — bigger but inline.

6. **Test environment fonts**: Vitest jsdom does NOT compute font-family via `getComputedStyle` reliably (CSS modules transform classNames at runtime). F4 tests assert className containment NOT computed font-family.

7. **HEAD `3588853` not `9f589ba`**: brief stated `9f589ba` (iter 12 close), actual repo HEAD verified `git log` is `3588853`. Iter 12 PHASE 2 commit subsequently made — NO regression risk, just version label drift.

---

## §7 — F2/F3/F4 implementation notes (handoff to next atoms)

**F2 strategy**:
- ADD `volumeRef` derivation per vignette using `getVolumeRef(exp.id)` from `src/data/volume-references.js` (1225 LOC, 92/92 enriched).
- ADD `<cite className={styles.volumeRef}>Vol.{ref.volume} pag.{ref.bookPage}</cite>` rendering when ref non-null.
- ADD `narration` derivation: `narrations[exp.id] || (ref?.bookText ? \`\${ref.bookText.slice(0,140)}…\` : null)` — fallback uses verbatim bookText excerpt (Sense 2 Morfismo verbatim citation).
- ADD `<ReportIcon/>` next to title + `<PrintIcon/>` in export button via ElabIcons.
- ADD cover header section + back-cover footer (no extension to 8 vignettes — keep 6 grid + 2 separate sections as cover/footer styled differently).
- CSS: increase `.captionTitle` to 1rem (16px LIM-friendly), add `.volumeRef` Fira Code 0.8125rem mono font, add `@media print { @page { size: A4 portrait; margin: 1.5cm; } .grid { grid-template-columns: repeat(2, 1fr); } }`.
- Accessibility: `role="article"` explicit (already implicit via `<article>`), `aria-describedby={'narration-'+exp.id}` for each figcaption referencing narration paragraph.

**F3 strategy** (Option A from §5):
- voiceCommands.js:330 patterns += `'leggi rapporto'`,`'leggi il rapporto'`,`'mostra fumetto'`,`'apri fumetto'`.
- LavagnaShell.jsx:857 useEffect EXTEND: `if (action === 'createReport' || action === 'previewFumetto')` → call `handleFumettoOpen` (existing wire-up).
- simulator-api.js:867 ADD `previewFumetto()` method emitting `fumettoExportRequested` with `{ preview: true }` flag.
- UnlimReport.jsx (no modify needed iter 13 — voice cmd already wired via LavagnaShell).
- Honest scope: F3 iter 13 = voice patterns extension + minor wire-up checks. NO openReportWindow refactor.

**F4 strategy**:
- Vitest jsdom + @testing-library/react render `<SessionReportComic session={mockSession} />`.
- 10 tests minimum (per brief): renders 6 vignettes / handles empty / fallback photo / narration injection / export callback / aria-label / Vol/pag citation regex / no emoji codepoint / Oswald className present / studentAlias optional.
- Mock `getVolumeRef` to return predictable `{volume:1, bookPage:29, bookText:'...'}` for `v1-cap6-esp1`.
- Use `expect(container.querySelector('article')).toHaveAttribute('aria-label', 'Report fumetto della sessione')`.

---

## §8 — File system verify post-write (CoV 3× rule)

```
$ wc -l docs/audits/2026-04-28-fumetto-perfection-audit.md
# Target ≥150 LOC — actual see end of file
$ ls -la src/components/lavagna/SessionReportComic.jsx
# 98 LOC verified
$ ls -la src/components/lavagna/SessionReportComic.module.css
# 187 LOC verified
$ ls -la src/services/voiceCommands.js src/components/unlim/UnlimReport.jsx
# verified
```

Audit complete. Hand off F2 redesign + F3 wire-up + F4 tests.

— fumetto-opus, 2026-04-28 PHASE 1 atom F1.
