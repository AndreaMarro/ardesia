---
from: iter13-coordinator-opus
to: fumetto-opus
iter: 13
sprint: S
date: 2026-04-28
timestamp: 053037
atoms_assigned: [F1, F2, F3, F4]
priority: 1 — Fumetto perfection
file_ownership_rigid:
  WRITE_NEW:
    - docs/audits/2026-04-28-fumetto-perfection-audit.md
    - tests/unit/SessionReportComic.test.jsx
  WRITE_MODIFY:
    - src/components/lavagna/SessionReportComic.jsx
    - src/components/lavagna/SessionReportComic.module.css
    - src/components/unlim/UnlimReport.jsx
    - src/services/simulator-api.js
    - src/components/lavagna/LavagnaShell.jsx
  READ_ONLY: all_other_repo_files
parent_contract: docs/pdr/sprint-S-iter-13-contract.md §2.1
loc_estimate: ~700 LOC (audit 150 + impl 200 + wire 100 + test 150 + CSS 100)
time_estimate: 6h Opus dedicated
completion_msg_required: automa/team-state/messages/fumetto-opus-iter13-to-orchestrator-2026-04-28-*.md
---

# Dispatch brief — fumetto-opus iter 13

## Self-contained context (NO prior conversation memory)

You are fumetto-opus, an Opus 4.7 1M-context agent dispatched by iter13-coordinator for **Sprint S iter 13** of ELAB Tutor (educational electronics platform for children 8-14, kit + 3 volumes + web software). Working directory: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder`. Repo HEAD: `9f589ba` (iter 12 PHASE 1+2 SHIPPED).

ELAB has a **session report fumetto** feature: end-of-class teacher generates a comic-style PDF/HTML recap of student lesson activities. Current implementation (`src/components/lavagna/SessionReportComic.jsx`, 98 LOC) is functional skeleton but lacks: real photo extraction, real narration injection, brand-aligned typography, and proper wire-up to voice command "crea il report". User Andrea Marro (sole developer) has identified Fumetto perfection as **iter 13 Priority 1** (one of 4 user priorities for 12h product-sellable deadline).

CRITICAL CONSTRAINTS from `CLAUDE.md`:
- **Regola 12**: NO mock NO demo data — must work with REAL session data.
- **Regola 11**: NO emoji icons — use `ElabIcons.jsx`.
- **Regola 17**: Font Oswald (titoli) + Open Sans (body) + Fira Code (codice).
- **Regola 16**: Palette Navy `#1E4D8C` / Lime `#4A7A25` / Orange `#E8941C` / Red `#E54B3D`.
- **Sense 2 Morfismo**: cite Vol/pag VERBATIM from `src/data/volume-references.js` (92/92 enriched).
- **Principio Zero**: linguaggio plurale "Ragazzi," — fumetto is FOR teacher to project on LIM, narration in plurale.

## Task scope detailed (4 atoms)

### F1 — Fumetto component audit current state (~150 LOC audit doc)

Write `docs/audits/2026-04-28-fumetto-perfection-audit.md` covering:

1. **All 7 grep findings** (verified iter 13 entrance):
   - `src/components/unlim/UnlimOverlay.jsx:84` "Calcola la posizione del fumetto accanto al componente"
   - `src/components/unlim/UnlimOverlay.jsx:163` "Freccia SVG del fumetto — punta verso il componente"
   - `src/components/unlim/UnlimReport.jsx:578` `a.download = fumetto-elab-${session.experimentId || 'sessione'}.html`
   - `src/components/unlim/UnlimReport.jsx:595-597` regex patterns matching "report" / "fumetto"
   - `src/components/lavagna/LavagnaShell.jsx:857` `// ── Voice command integration: "crea il report" / "fumetto" ──`
   - `src/components/lavagna/SessionReportComic.jsx` (entire 98 LOC component)
   - `src/services/simulator-api.js:868+877` fumettoExportRequested event emission
2. Current state quality assessment: visual quality, narrative quality, actionable feedback (3 axes per user).
3. Gaps identified vs `.impeccable.md` 5 Design Principles (especially Morfismo Triplet + Mai Demo Mai Mock).
4. Mapping to F2/F3/F4 atom acceptance criteria.

**Verify**: `wc -l docs/audits/2026-04-28-fumetto-perfection-audit.md` ≥150.

### F2 — Visual + narrative redesign (~200 LOC modify + ~100 LOC CSS)

MODIFY `src/components/lavagna/SessionReportComic.jsx` + `SessionReportComic.module.css`:

- **Real photo extraction**: integrate `src/components/lavagna/VolumeViewer.jsx` annotations (page+volume images saved per session) — currently only static `buildPhotoUrl` from `experiment-photo-map`. Augment with VolumeViewer annotations as primary, static map as fallback.
- **Real narration auto-generated**: each vignette caption derives from `unlimMemory` 3-tier (`src/services/unlimMemory.js` if exists, else `src/services/unlimContextCollector.js`). Currently `narrations` prop empty → empty `<p className={styles.narration}>`.
- **Vol/pag citation**: each vignette includes `Vol.X pag.Y` from `src/data/volume-references.js` mapping experimentId → volume + page.
- **Brand-aligned typography**: Oswald for `.captionTitle` + `.title`, Open Sans for `.narration` + `.subtitle`, Fira Code for any code snippet shown.
- **6 vignettes + cover/back-cover**: extend VIGNETTE_SLOTS=6 to include cover (header) + back-cover (footer) layout — print-optimized A4.
- **NO emoji**: import from `src/components/common/ElabIcons.jsx` for any iconography.
- **Accessibility**: aria-labels per vignette, aria-describedby for narration, role="article".

**Verify**: visually open SessionReportComic with mock session prop in vitest test (F4) → render snapshot includes all elements.

### F3 — Wire-up real session data (~100 LOC)

MODIFY 3 files:

- `src/components/unlim/UnlimReport.jsx`: when voice command "crea il report" / "fumetto" matched (regex line 595-597), invoke `fumettoExportRequested` event with `{ session, narrations, photos }` payload.
- `src/services/simulator-api.js` lines 868+877: ensure `emitSimulatorEvent('fumettoExportRequested', payload)` carries full payload (currently event-stub per comment "Day 38+").
- `src/components/lavagna/LavagnaShell.jsx` line 857: voice integration — when "crea il report" / "fumetto" detected, call `__ELAB_API.unlim.exportFumetto()` (NEW window API method — define inline `window.__ELAB_API.unlim.exportFumetto = () => emitSimulatorEvent('fumettoExportRequested', collectFullSessionData())`).
- Connect `collectFullSessionData()` from `src/services/unlimContextCollector.js` (`collectFullContext()` function — extend to return `{ experimentsCompleted, narrations, photos, studentAlias, startedAt }` shape expected by `SessionReportComic`).

**Verify**: manual smoke (Andrea ratify ~1 min) — open Lavagna, complete 2-3 experiments, voice "crea il report" → PDF/HTML downloads with REAL data NO mock.

### F4 — Unit tests (~150 LOC NEW)

Write `tests/unit/SessionReportComic.test.jsx` ≥10 tests:

1. Renders 6 vignettes with valid session prop.
2. Handles empty session prop (all 6 placeholders).
3. Fallback photo placeholder when buildPhotoUrl returns null.
4. Narration injection from session.narrations[exp.id].
5. Export PDF callback invoked on button click.
6. Accessibility: aria-label "Report fumetto della sessione" on `<article>`.
7. Vol/pag citation regex `/Vol\.\d+\s+pag\.\d+/` present in vignette text when experiment has volume reference.
8. NO emoji icons (regex check for emoji codepoints in rendered HTML).
9. Oswald font-family applied to `.title` (CSS check via getComputedStyle in jsdom mock or className assertion).
10. studentAlias optional (renders without when undefined).

**Verify**: `npx vitest run tests/unit/SessionReportComic.test.jsx` 10/10 PASS + global `npx vitest run | tail -5` ≥12609 PASS (12599 baseline + 10 new).

## Anti-regression mandate (CoV mandatory)

1. `npx vitest run` ≥12599 PASS (iter 12 baseline). Re-run 3× before declaring "tests pass".
2. `automa/baseline-tests.txt` delta ≥0 (NEVER negative — pre-commit hook enforces).
3. ZERO touch other agents' files (rotation-opus / design-opus / omniscient-opus file ownership rigid).
4. Build PASS NOT required this agent (pure component change — orchestrator PHASE 3 runs `npm run build`).

## CoV requirements

- 3× verify rule: every claim ("test pass", "fumetto renders correctly") verified 3 times.
- File system verify post-write: `ls -la <file>` for each NEW file.
- LOC verify post-write: `wc -l <file>` for audit + test + impl files (must match estimates within ±20%).
- NO inflation: do NOT claim "fumetto is now perfect" — list HONEST limitations (e.g., "narration uses simple template, not LLM-generated rich text iter 14").

## Completion message expected output

Write `automa/team-state/messages/fumetto-opus-iter13-to-orchestrator-2026-04-28-<HHMMSS>.md` with:

```yaml
---
from: fumetto-opus
to: orchestrator
iter: 13
date: 2026-04-28
status: complete | partial | blocked
atoms_completed: [F1, F2, F3, F4]
loc_actual: <number>
tests_added: <number>
vitest_baseline: <12599 + delta>
---
```

Body: 4 sections (one per atom) + CoV checklist + honest gaps list + ratify request to Andrea (if any).

## Honesty caveats expected in your audit + completion msg

1. **Fumetto perfection NOT single-iter**: F1-F4 ship visible improvements, but full "perfection" includes iter 14 LLM-generated narrations, iter 15 multi-modal photo+video, iter 16 teacher review/edit before export. State this explicitly in audit §6.
2. **VolumeViewer annotations integration**: if `src/components/lavagna/VolumeViewer.jsx` does NOT actually save annotations to session state (verify via Read), document gap + propose iter 14 wire-up. Your F2 may need annotation persistence first.
3. **PDF export quality**: `window.print()` fallback in F2 line 36 produces poor PDFs (no page break control, no print CSS). Document iter 14 needs `@media print` CSS overhaul OR third-party PDF lib.
4. **Voice command coverage**: regex line 595-597 covers "crea il report" / "fumetto" / "crea il fumetto" — verify no false positives ("crea il programma"). Add disambiguation if needed.
5. **Performance**: 6 vignettes × real photos (potentially Supabase Storage URLs) may impact load time. Add lazy loading verify (line 70 already has `loading="lazy"`).

## Pattern S race-cond mitigation reminder

You are 1 of 4 parallel OPUS agents (rotation-opus, design-opus, omniscient-opus). Race-cond fix iter 5+ validated 5×. Iter 12 §7.2 protocol gap: 3/4 agents skipped completion msg emission. **MANDATORY iter 13**: emit completion msg BEFORE final response per §9 contract. Without your msg, scribe-opus PHASE 2 BLOCKED indefinitely (filesystem barrier 4/4).

NO inflation. Caveman mode preferred. ONESTÀ MASSIMA.

— iter13-coordinator-opus, 2026-04-28 05:30:37 CEST.
