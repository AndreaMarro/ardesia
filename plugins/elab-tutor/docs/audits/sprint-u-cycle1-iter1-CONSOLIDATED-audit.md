# Sprint U Cycle 1 — Consolidated Audit
**Date**: 2026-05-01
**Branch**: mac-mini/sprint-u-cycle1-iter1-20260501T0815
**Agents**: 7 dispatched — 6 COMPLETE + 1 FAILED (persona, stall timeout 600s)
**Score Cycle 1**: N/A (audit-only, no fixes yet)

---

## Executive Summary

Cycle 1 is a comprehensive read-only audit of all 94 experiments across Vol1+Vol2+Vol3, covering circuit quality, linguaggio compliance, UNLIM routing behavior, design tokens, and live test coverage. No source files were modified.

### Violations by Category (consolidated)

| Category | Metric | Count | Severity |
|---|---|---|---|
| **UNLIM routing** | L2 template catch-all: same response for all 94 experiments | 93/94 wrong experiments | BLOCKER |
| **UNLIM citation** | vol/pag strict (page number): 0/20 queries | 20/20 | MAJOR |
| **Linguaggio — lesson-paths** | teacher_message singolare violations (fai/premi/clicca/inserisci/collega) | 73/94 files | HIGH |
| **Linguaggio — lesson-paths** | teacher_message without "Ragazzi," opener | 91/94 files | HIGH |
| **Linguaggio — unlimPrompts** | "studente" framing instead of "docente" framing | 94/94 | CRITICAL (P0 state-map) |
| **Circuit quality** | v3-cap8-serial: solo 1 componente, mancante bb1 | 1 experiment | MEDIUM |
| **Data quality** | Title/ID mismatch | 4 experiments (all vol3) | MEDIUM |
| **Data quality** | Content mismatch unlimPrompt vs title | 1 experiment (v3-cap6-esp4) | MEDIUM |
| **Data quality** | Missing scratchXml | 3 experiments | LOW-MEDIUM |
| **Performance** | Lighthouse perf=43 (react-pdf 407KB + mammoth 70KB eager-loaded) | Both routes | CRITICAL |
| **Design — palette** | Hardcoded hex violations | 833 occurrences, 80+ files | HIGH |
| **Design — typography** | CSS font-size <13px violations | 17 (CSS) + 42 (JSX) | HIGH/MEDIUM |
| **Design — touch** | Interactive elements <44px | 4 elements | MEDIUM |
| **Design — console** | console.log/warn remaining | 4 occurrences | LOW |

### Sprint U Success Criteria: Current vs Target

| Criterion | Current | Target | Gap |
|---|---|---|---|
| Lesson-path linguaggio compliance (plurale) | 21/94 (22%) | 94/94 (100%) | 73 files |
| teacher_message with "Ragazzi," | 3/94 (3%) | 94/94 (100%) | 91 files |
| unlimPrompt docente-framing | 0/94 (0%) | 94/94 (100%) | 94 files |
| UNLIM experiment-specific content | 1/20 tested (5%) | 94/94 | Fix L2 routing |
| UNLIM vol/pag strict citation | 0/20 (0%) | ≥85% | Fix template |
| Lighthouse perf | 43 | ≥90 | +47 pts needed |
| Palette CSS var compliance | ~27% (est.) | 100% | 833 violations |
| Live test PASS (smoke) | 18/18 (100%) | 94/94 | Full spec Cycle 2 |
| Circuit structural correctness | 93/94 (99%) | 94/94 | 1 fix (v3-cap8-serial) |

---

## P0 Blockers (must fix before PR / Sprint U close)

### 1. L2 Template Routing Catch-All — UNLIMVerify BLOCKER

**Source**: unlimverify completion + unlim-matrix.md
**What**: `selectTemplate()` in `scripts/openclaw/clawbot-template-router.ts` routes ALL `lesson-explain` category requests to `L2-explain-led-blink` regardless of `experimentId`. The 20-experiment cross-volume test (v1-cap6 through v3-cap8) confirms 100% hit on the LED blink template.

**Evidence**: 20/20 queries return `template_id: L2-explain-led-blink` + identical response body:
> "Ragazzi, Vol.1 pag. 'Catodo: Terminale negativo del diodo...' Sul kit guardate il LED rosso e la resistenza da 220Ω in serie."

**Impact**: Vol2 multimeter experiments, Vol3 Arduino/Serial experiments — all receive LED blink content. Morfismo Sense 2 broken for 93/94 experiments.

**Root cause confirmed**: Only a few specific experimentIds (likely just `v1-cap6-esp1`) are mapped to distinct templates. All others fall through to the default catch-all.

**Fix required**: Template router must check `experimentId` against a mapping table; if no specific template exists, fall through to LLM call (not LED blink default). See Cycle 2 handoff §4 for exact code fix.

---

### 2. 73/94 Lesson-Paths Have Singolare Imperative Violations — Linguaggio CRITICAL

**Source**: phase0-state-map.md §3.2 + audit-vol1-vol2.md §D + audit-vol3.md §Priority 3
**What**: 52/65 Vol1+Vol2 lesson-paths + 21/29 Vol3 lesson-paths = **73/94 total** have singolare imperatives in `teacher_message` fields. Teachers read these messages directly to the class.

**Dominant pattern**: `"Premi Play e osserva cosa succede."` in OSSERVA phase — appears in ~50/65 Vol1+Vol2 LPs.

**Other patterns found** (audit matrices):
- `"Collega il resistore..."` → `"Collegate il resistore..."`
- `"Fai clic su..."` → `"Fate clic su..."`
- `"Inserisci..."` → `"Inserite..."`
- `"Clicca su..."` → `"Cliccate su..."`

**Worst offenders**:
- v1-cap8-esp1: 3 violations (PREPARA+CHIEDI+OSSERVA)
- v1-cap8-esp3, v1-cap10-esp6, v1-cap11-esp2, v1-cap9-esp9, v2-cap10-esp3: 3 violations each
- v3-cap6-esp6: 3 violations

**Exemplary zero-violation LPs** (models for other files):
- Vol1: v1-cap7-esp3, v1-cap7-esp6
- Vol2: v2-cap3-esp1..4, v2-cap4-esp1..3, v2-cap5-esp1..2, v2-cap6-esp1..4, v2-cap7-esp1..2

**Fix**: Batch sed codemod (see Cycle 2 handoff §5). Estimated ~200 string replacements across 73 JSON files.

---

### 3. Vol/Pag Citation Malformed in L2 Template — UNLIMVerify MAJOR

**Source**: unlim-matrix.md §ISSUE 2
**What**: The L2 template inlines a RAG text excerpt after `pag.` instead of a page number. Current format: `Vol.1 pag. 'Catodo: Terminale negativo...'` — PZ V3 canonical requires `Vol.1 pag. 42`.

**Strict citation rate**: 0/20 (0%). Loose citation rate: 20/20 (100%) — string "Vol." + "pag." present but no page number.

**Fix required**: L2 template must extract the `page_number` metadata field from the matched RAG chunk and format as `Vol.N pag. NNN`. The RAG chunk schema (`rag_chunks` Supabase table) has `page_number` column (iter 14 metadata backfill). Template must use it.

---

## P1 High Priority

### 4. 94 unlimPrompts Use "studente" Framing Instead of "docente" — PRINCIPIO ZERO CRITICAL

**Source**: phase0-state-map.md §3.1 + audit-vol1-vol2.md §B
**What**: ALL 94 `unlimPrompt` fields begin with:
> "Sei UNLIM, il tutor AI di ELAB. Lo studente sta guardando l'esperimento..."

PRINCIPIO ZERO states: gli studenti NON interagiscono con UNLIM. UNLIM è lo strumento del DOCENTE. The framing should be:
> "Sei UNLIM, il tutor AI di ELAB. Il docente sta mostrando alla classe l'esperimento..."

**Nuance from audit-vol1-vol2 §B**: audit1 argues these are architecturally context briefs to UNLIM (not verbatim scripts), and linguaggio compliance is enforced at inference via BASE_PROMPT v3.1. The framing issue is real but lower severity than it appears — the unlimPrompt is not read by teachers directly.

**Recommendation**: Phase 1 fix is docente-framing rewrite for all 94 prompts (batch replace). This is the "codemod 200 violations" from Andrea iter 21 mandate carryover. See Cycle 2 scope.

---

### 5. v3-cap8-serial Circuit: Solo Nano, Mancante bb1

**Source**: audit-vol3.md §Priority 1
**What**: `v3-cap8-serial` experiment definition has only 1 component (`nano1`), no breadboard component (`bb1`). All other serial experiments (v3-cap8-esp1..5) include `bb1`. The experiment circuit is not structurally broken (Serial-only connection does not need breadboard), but the visual inconsistency with all other experiments is pedagogically confusing.

**Fix**: Add `{ type: "breadboard-half", id: "bb1" }` to components array and add `bb1` layout coordinates in `experiments-vol3.js`.

---

### 6. 4 Title/ID Mismatches in Vol3

**Source**: audit-vol3.md §Priority 4

| ID | Exposed Title | Problem |
|----|--------------|---------|
| v3-cap6-esp3 | "Cap. 6 Esp. 2 - Cambia il numero di pin" | Duplica il titolo di v3-cap6-esp2 |
| v3-cap6-esp5 | "Cap. 7 Ese. 7.3 - Pulsante con INPUT_PULLUP" | ID dice cap6, titolo dice cap7 |
| v3-cap6-esp6 | "Cap. 7 Mini-progetto - Due LED, un pulsante" | ID dice cap6, titolo dice cap7 Mini-progetto |
| v3-cap8-serial | "Cap. 8 Esp. 1 - Comunicazione seriale: primo messaggio" | Numerazione identica a v3-cap8-esp1 |

**Fix**: Update `title` fields in `experiments-vol3.js` to match the actual `id`/`chapter` values. The `chapter` field is correct in all cases — only the exposed title string is wrong.

---

### 7. v3-cap6-esp4 Content Mismatch — unlimPrompt Descrive Semaforo, Titolo è Effetto Polizia

**Source**: audit-vol3.md §Priority 5
**What**: `v3-cap6-esp4` title is "Due LED: effetto polizia" but the unlimPrompt describes "il semaforo con 3 LED sui pin 5, 6 e 9" — content from a different experiment.

**Fix**: Rewrite unlimPrompt for v3-cap6-esp4 to describe the police light effect experiment (alternating blue/red LED blink pattern) rather than the semaphore.

---

### 8. v3-cap6-esp1 Missing scratchXml

**Source**: audit-vol3.md §Priority 6
**What**: `v3-cap6-esp1` ("Colleghiamo la resistenza") is the only Cap6 experiment without `scratchXml`. All other Cap6 experiments have it. The constant `BLINK_EXTERNAL_SCRATCH` is already defined in `experiments-vol3.js`.

**Fix**: Add `scratchXml: BLINK_EXTERNAL_SCRATCH` to the v3-cap6-esp1 experiment definition.

---

### 9. Lighthouse perf=43 — DesignCritique CRITICAL

**Source**: design-critique.md §Lighthouse + designcritique completion
**What**: Both routes (`/` and `/#chatbot-only`) score perf=43. a11y=100, SEO=100, BP=92 are strong.

**Root cause**: `react-pdf` (407KB unused JS) and `mammoth` (70KB unused JS) are loaded eagerly on the initial page bundle. These are VolumeViewer dependencies.

**Fix required** (minimum for perf ~65-70):
```javascript
// In src/App.jsx or wherever VolumeViewer is imported
const VolumeViewer = React.lazy(() => import('./lavagna/VolumeViewer'));
// Similarly for mammoth import
```

**Fix for perf ≥90**: Lazy-loading + image delivery optimization (explicit `width`/`height` attributes) + render-blocking CSS font audit.

---

## P2 Medium Priority

### 10. 833 Palette Hex Violations

**Source**: design-critique.md §Palette
**What**: 833 raw hex occurrences across 80+ files. The `--elab-*` CSS variable system IS correctly defined in `src/styles/design-system.css`. The issue is widespread adoption gap.

**Top 5 worst files**:
1. `src/components/teacher/TeacherDashboard.jsx` — 55 violations (raw inline JSX)
2. `src/components/simulator/canvas/SimulatorCanvas.jsx` — 33 (SVG fill/stroke)
3. `src/components/simulator/ElabSimulator.css` — 31 (raw hex with var() fallback)
4. `src/components/lavagna/GalileoAdapter.jsx` — 29 (JSX inline styles)
5. `src/components/teacher/TeacherDashboard.module.css` — 28 (CSS module)

**Recommended priority**: Start with `TeacherDashboard.jsx` (55 violations, pure inline style migration) and `GalileoAdapter.jsx` (29 violations, high user-facing surface).

---

### 11. Typography <13px Violations

**Source**: design-critique.md §Typography
**Critical for LIM audience**: 10px/11px text projected at 5m is invisible to 8-14yr students.

**CSS violations (17 total)**:
- `ChatbotOnly.module.css`: 10px ×3 (timestamps/badges) + 11px (secondary label)
- `EasterModal.module.css:175`: 11px sub-caption
- `PercorsoCapitoloView.module.css:169`: 11px step indicator
- `IncrementalBuildHint.module.css`: 12px ×5 hint text
- `DocenteSidebar.module.css:30`: 12px secondary label
- `CapitoloPicker.module.css:113,129`: 12px chapter sub-labels

**JSX violations (42 total)**: Mostly `SimulatorCanvas.jsx` SVG labels and `TeacherDashboard.jsx` inline styles.

---

### 12. Touch Target Violations — 4 Elements

**Source**: design-critique.md §Touch Target
**What**: 4 confirmed interactive elements below 44px minimum:
1. `ChatbotOnly.module.css:245` — tool buttons `height: 36px`
2. `ElabTutorV4.css:97` — tab button `height: 36px`
3. `ElabTutorV4.css:423` — nav control `height: 28px`
4. `FloatingWindow.module.css:135` — mobile close button `height: 32px`

**Positive note**: Prior audits claimed 103 violations; this audit confirms only 4 real interactive violations. The prior 103 included decorative dividers and non-interactive elements.

---

### 13. 4 console.log Remaining

**Source**: design-critique.md §Console
**Files**: `UpdatePrompt.jsx` (×2), `simulator-api.js` (×1), `VisionButton.jsx` (×1)
**Fix**: Remove each — low effort, clean codebase signal.

---

## P3 Low Priority (Cycle 3 if time)

### 14. bookText Thin — 3 Experiments

**Source**: audit-vol1-vol2.md §C + audit-vol3.md §Priority 7
- `v2-cap5-esp1`: bookText = 5 words (just a title — "Batterie in serie (più spinta!)")
- `v3-cap6-esp3`: bookText = 10 words
- `v3-cap8-esp3/4/5`: bookText = 17 words each (borderline)

---

### 15. UnlimPrompt Thin — 3 Vol1 Cap7 Experiments

**Source**: audit-vol1-vol2.md §Issue 2
- `v1-cap7-esp5`: 47 words (thinnest in dataset) — no analogy
- `v1-cap7-esp6`: 53 words
- `v1-cap7-esp4`: 56 words

---

### 16. v2-cap11 Missing Entirely

**Source**: audit-vol1-vol2.md §Gap
Vol2 jumps from cap10 to cap12 — no `v2-cap11-*` experiments exist. Verify with Davide Fagherazzi whether Vol2 Chapter 11 requires simulator coverage.

---

### 17. n8n CORS on Vol3 AVR Mount

**Source**: livetest2-vol3 completion + livetest-vol3.md §Issues
When a vol3 AVR experiment mounts, it auto-fires a compile preflight to `n8n.srv1022317.hstgr.cloud` which is blocked by CORS. Does NOT affect rendering. Fix: add `Access-Control-Allow-Origin: https://www.elabtutor.school` to n8n Hostinger endpoint.

---

### 18. v3-cap6-morse unlimPrompt Missing Identity Prefix

**Source**: audit-vol3.md §Audit Matrix
`v3-cap6-morse` is the only experiment whose unlimPrompt does NOT begin with "Sei UNLIM, il tutor AI di ELAB." — it begins directly with "Lo studente sta...". This breaks the standard identity preamble.

---

## Cycle 2 Work Plan

### Cycle 2 Agents (4 merge + fix agents)

| Agent | Scope | Files | Estimated LOC |
|---|---|---|---|
| **Audit-merge** | Consolidate vol1+vol2+vol3 findings into structured JSON | `automa/state/sprint-u-findings.json` | ~100 |
| **LiveTest-merge** | Execute full 94-experiment Playwright spec (vol1+vol2 full, vol3 full) | `tests/e2e/sprint-u-cycle1-iter1-vol1-vol2-full.spec.js` + `vol3-full.spec.js` | 0 (already created) |
| **UNLIMFix** | Fix L2 template routing catch-all in `clawbot-template-router.ts` | 1 TS file | ~30 LOC |
| **Codemod** | Apply linguaggio batch fix (73 JSON files + 94 unlimPrompts) | 167 files | ~200 string replacements |

### Cycle 3 Verifier Agents (2)

| Agent | Scope |
|---|---|
| **UNLIMVerify-2** | Re-run 20-experiment matrix post UNLIMFix deploy — verify template diversity ≥80% + strict vol/pag ≥80% |
| **LinguaggioVerify** | Grep all 94 lesson-paths post-codemod — confirm 0 singolare violations + "Ragazzi," presence rate ≥85% |

### Estimated Fix Scope

| Fix | Files | Effort |
|---|---|---|
| L2 template routing fix | `scripts/openclaw/clawbot-template-router.ts` | ~30 LOC, medium complexity |
| Linguaggio codemod (lesson-paths) | 73 JSON files | sed batch, low complexity |
| docente-framing (unlimPrompts) | 94 JS entries in 3 files | sed/script, medium complexity |
| v3-cap8-serial circuit fix | `src/data/experiments-vol3.js` | ~5 LOC |
| v3-cap6-esp4 prompt fix | `src/data/experiments-vol3.js` | ~3 lines |
| v3-cap6-esp1 scratchXml | `src/data/experiments-vol3.js` | ~1 line |
| Vol3 title/ID mismatch (4) | `src/data/experiments-vol3.js` | ~4 string edits |
| Lazy-load react-pdf + mammoth | `src/components/lavagna/VolumeViewer.jsx` (or App.jsx) | ~5 LOC |
| vol/pag citation fix in L2 template | L2 template string in `clawbot-templates.ts` | ~2 lines |

---

## § Persona Simulation Findings (RETRY — simulazione offline post-stall)

**Source**: `docs/audits/sprint-u-cycle1-iter1-persona-simulation.md` (80 scenari, 430 LOC)
**Metodo**: simulazione offline su dati audit — NON testing live utenti reali

### Score per Persona

| Persona | Profilo | Score pre-fix | Score post-fix (proiezione) |
|---------|---------|--------------|---------------------------|
| P1 Maria | 4ª primaria, 45aa, bassa exp Arduino | **4.1/10** | 6.5/10 |
| P2 Giovanni | 1ª secondaria, 38aa, intermedio | **5.0/10** | 7.5/10 |
| P3 Lucia | 3ª media, 52aa, esperta 10+ anni | **5.4/10** | 7.8/10 |
| P4 Marco | Sostituto last-minute, 28aa, zero contesto | **2.9/10** | 5.5/10 |
| **Media globale** | | **4.35/10** | **6.8/10** |

### Score per Modalità (media 4 personas)

| Modalità | Score pre-fix | Dipendenza UNLIM |
|---------|--------------|-----------------|
| Percorso | 3.75/10 | Alta — routing fail impatta massimamente |
| Passo Passo | 4.5/10 | Media |
| Libero | 5.2/10 | Bassa — meno dipendente da UNLIM sbagliato |
| Già Montato | 3.95/10 | Media — F6-NOMOUNT catastrofico su 2 esperimenti |

### Top 5 Friction da Simulazione

| Rank | Code | Scenari impattati | Δ score | Fix |
|------|------|-------------------|---------|-----|
| 1 | F1-ROUTING | 75/80 (94%) | −2.5 | Cycle 2 P0.1 (routing fix) |
| 2 | F3-NOCAPTION | 80/80 (100%) | −0.5 | Cycle 2 P1.1 (codemod) |
| 3 | F2-LINGUAGGIO | 57/80 (71%) | −0.5 | Cycle 2 P1.1 (sed batch) |
| 4 | F6-NOMOUNT | 2/80 (2.5%) | −5.0 | Cycle 2 P0.2 (#lavagna route) |
| 5 | F8-TITLEDUP | 4/80 (5%) | −2.0 | Cycle 2 P1.2 (title fix) |

### Fix Aggiuntivi Identificati da Simulazione (non in audit precedente)

1. **P4 onboarding gap**: Score 2.9/10 riflette assenza di quick-start tutorial. Cycle 3+: "tutorial modalità 0" per utenti senza contesto.
2. **Modalità Libero nome ambiguo**: "Libero" senza sottotitolo è incomprensibile per P1 + P4. Suggerito rinominare "Esplora" o aggiungere tooltip.
3. **v3-extra-* label ambigua**: Extra experiments senza riferimento al volume confondono P3 Lucia sulla coerenza col curriculum fisico.

---

## Appendix: Agent Results Matrix

| Agent | Status | Key Output | Pass Rate | Critical Findings |
|---|---|---|---|---|
| **Audit-1 (vol1+vol2)** | COMPLETE | `audit-vol1-vol2.md` | 65/65 experiments — 0 circuit issues | 52/65 LP singolare "Premi Play"; 0 unlimPrompt structure issues |
| **Audit-2 (vol3)** | COMPLETE | `audit-vol3.md` | 29/29 experiments — 1 circuit gap | 21/29 LP singolare violations; 4 title mismatches; 1 content mismatch |
| **LiveTest-1 (vol1+vol2)** | COMPLETE | `livetest-vol1-vol2.md` | 10/10 smoke PASS | circuitState.components empty (lazy init — not a failure) |
| **LiveTest-2 (vol3)** | COMPLETE | `livetest-vol3.md` | 8/8 smoke PASS (10/10 tests) | v3-cap7-mini + v3-cap8-serial: 0 data-component-id on #tutor route |
| **UNLIMVerify** | COMPLETE | `unlim-matrix.md` | 20/20 surface / 1/20 honest | L2 routing BLOCKER: all 20 → LED blink template |
| **DesignCritique** | COMPLETE | `design-critique.md` | a11y=100 / perf=43 | 833 palette violations; Lighthouse perf CRITICAL |
| **Persona** | COMPLETE (offline retry) | `persona-simulation.md` | 80/80 scenari simulati | Score globale 4.35/10 pre-fix; F6-NOMOUNT catastrofico (1/10); P4 score 2.9/10 |

### Cumulative Coverage

| Dimension | Coverage | Source |
|---|---|---|
| Experiments audited (static) | 94/94 (100%) | audit1 + audit2 |
| Experiments live-tested (smoke) | 18/94 (19%) | livetest1 (10) + livetest2 (8) |
| Full specs ready for Cycle 2 | 94/94 | livetest1 + livetest2 full specs |
| UNLIM queries tested | 20/94 (21%) | unlimverify |
| Components analyzed (design) | ~80+ files | designcritique |
| Persona simulations | 80/80 (100%) | persona (offline retry, 4P×4M×5E) |

### Honest Scores

| Domain | Score | Cap Condition |
|---|---|---|
| Circuit structural quality | 9.5/10 | 1 gap (v3-cap8-serial) |
| Lesson-path completeness | 8.0/10 | All 94 exist, 5-phase structure complete |
| Lesson-path linguaggio | 2.5/10 | 73/94 singolare violations |
| UNLIM content quality | 1.5/10 | L2 routing blocks experiment-specific content |
| Design token compliance | 3.0/10 | 833 hex violations + perf=43 |
| Live test (smoke) | 10/10 | 18/18 PASS, full spec ready Cycle 2 |
| **UX comprehensibility (docente)** | **4.35/10** | Persona simulation: F1-ROUTING blocker −2.5 su 94% scenari |

---

*Consolidated by Scribe agent — Sprint U Cycle 1 Iter 1 — 2026-05-01*
*Updated post Persona retry (simulazione offline 80 scenari) — 2026-05-01*
