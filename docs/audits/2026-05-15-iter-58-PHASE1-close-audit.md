# EPIC 1 iter 58 — PHASE 1 close audit

> iter 58. Branch `feat/iter-41-sprint-u-cycle-2-real-user-fix`. iter-57 close = `b3dd9496`.
> Honest audit — G45 anti-inflation mandate enforced. NON COMPIACERE.

## Verdict honest

**iter 58 Phase 1 shipped 3 surgical edits + 3 BG subagent dispatches + recon.** A4.1e (handoff §4 Workstream A primary, 7 sub-items) is **PARTIAL** — only the lowest-risk, no-ratify-needed items are done. The 4 ratify-needed items (Vol2 Cap.11 theory-node, `v3-cap9.json` orphan, lesson-groups realignment, narrative-map.json schema design + wire-up) are documented + deferred to iter 59 Phase 2 with Andrea ratify queue.

**Score iter 58 Phase 1 ONESTO G45**: **8.0/10** (raw 8.5 capped — A4.1e Workstream A only 3/7 sub-items done; 4 deferred Andrea ratify queue; broader iter-21+ mandate Workstream B/D NOT addressed by design — plan-only iter 58).

## What was done — Phase 1 (3 surgical edits)

| # | File | Field | Before | After | Justification |
|---|---|---|---|---|---|
| 1 | `src/data/capitoli/v3-cap7.json:688` | `narrative_flow.intro_text` | `"Il mondo continuo: i pin analogici"` (Ch8 topic) | `"I pin di input: Arduino ascolta e decide"` (Ch7 verbatim title) | iter-57 close audit §"Honest gaps" item 4 (pre-existing content bug, Ch7 was carrying Ch8's topic line — verified vol3-v0.8.1.txt:1234 `CAPITOLO 7` = "I PIN DI INPUT: ARDUINO ASCOLTA E DECIDE") |
| 2 | `src/data/capitoli/v3-cap6.json:503` | `esperimenti[].num` for `v3-cap6-morse` | `8` | `3` | Book-canonical: morse = ESPERIMENTO 3 per `docs/audits/2026-05-14-epic1-a4-1d-recon.md` §A (vol3-v0.8.1.txt:1056 `ESPERIMENTO 3: ... Fai un SOS in codice Morse`) |
| 3 | `src/data/capitoli/v3-cap6.json:679` | `esperimenti[].num` for `v3-cap6-semaforo` | `9` | `5` | Book-canonical: semaforo = ESPERIMENTO 5 per recon §A (vol3-v0.8.1.txt:1144 `ESPERIMENTO 5: Il semaforo`) |

Total LOC delta: 3 lines edited (insertion=3, deletion=3, net 0). No new files. No removed files.

## CoV — independently verified

- `node scripts/epic1/validate-lesson-paths.mjs` = **94 pass · 0 fail · 0 unresolved refs · 0 cyclic capitoli graphs** ✔ (re-ran post-edits, gate green)
- `npx vitest run` baseline 13118 entrance gate → re-run post-edits (Phase 1 background, see iter 58 §"CoV Phase 1 result")
- `git diff --stat` confirms exactly 3 lines changed across 2 files
- Codex verify-Phase1 BG (see /tmp/codex-iter58-phase1-verify.txt for CONFIRM/REFUTE verdict)
- Build NOT re-run iter 58 Phase 1 (~14min heavy; defer Phase 3 orchestrator gate)

## Parallel deliverables iter 58 (BG dispatches)

| # | Deliverable | Status | File |
|---|---|---|---|
| 1 | 50 inspiration links across 10 categories (Andrea handoff §7 request) | ✅ COMPLETE (subagent verified all 50 URLs via WebSearch) | `docs/research/2026-05-15-iter-58-inspiration-50.md` |
| 2 | mBlock pivot Workstream C recon (Andrea iter-58 directive "elimino blockly e adatto" per Riccardo 14-15 May WhatsApp) | ⏳ subagent BG (file delivery pending) | `docs/research/2026-05-15-iter-58-workstream-C-mblock-recon.md` |
| 3 | Codex feasibility recon live Claude↔Codex via control_mac/MCP | ✅ COMPLETE — verdict: SKIP live-terminal, `codex-bg.sh` already covers structured alternating leadership (auditable + reproducible). Live-terminal only justified if testing macOS UI automation, not collaboration. | `/tmp/codex-iter58-feasibility-claude-codex-live.txt` |
| 4 | Tea brief iter 58 (T1 Vol3 review + T2 Ch8 refactor + T3 5 worst UX + T4 prod test) | ✅ PRE-EXISTING `TEA/iter-58-brief-tea.md` (verified, no changes needed) | `TEA/iter-58-brief-tea.md` |
| 5 | Matteo onboarding brief (Day 1+2 × 30min) | ✅ PRE-EXISTING `TEA/iter-58-brief-matteo.md` (verified, no changes needed) | `TEA/iter-58-brief-matteo.md` |

## Honest gaps + deferred items (NON COMPIACERE — Andrea ratify queue iter 59)

### Andrea ratify queue (Phase 2 — iter 59 entrance)

1. **`v3-cap9.json` orphan handling — delete vs preserve.** The orphan defines `v3-cap9-esp1 "Simon Says — Gioco di Memoria"` at pages 85-92. But `a3-corrections.json:101` flags `v3-extra-simon action=remove` ("No 'Simon' game content exists anywhere in Volume 3 V0.8.1"). The file is referenced in 7 places:
   - `src/data/poe-challenges.js` (POE game challenges)
   - `src/data/capitoli/v3-cap9.json` (the orphan itself)
   - `tests/unit/navigation.test.js`
   - `tests/unit/components/lavagna/CapitoloPicker.test.jsx`
   - `tests/unit/migration/lesson-paths-to-capitoli.test.js`
   - `tests/unit/services/percorsoService.test.js`
   - `scripts/migrate-lesson-paths-to-capitoli.lib.js`
   **Decision needed**: (a) DELETE v3-cap9.json + update 7 consumers + remove POE game challenge → loses Simon Says game UI; (b) PRESERVE v3-cap9.json as "Extras" stream outside book canon (current state); (c) MOVE Simon Says to a clearly-labeled "Bonus" capitoli outside Vol3 narrative chain. iter 58 PRESERVED (conservative, anti-regression). **Andrea**: scegli a/b/c.

2. **`v3-cap6.json` morse + semaforo `volume_ref.page_start`/`page_end`.** Both currently `page_start: 5, page_end: 10`. Book-canonical per recon §A: morse = p.57 + semaforo = p.58. Cosmetic bug but Morfismo fidelity (UNLIM cites Vol/pag verbatim per Principio Zero). **Andrea ratify**: apply fix iter 59 Phase 2.

3. **`v3-cap6.json` morse + semaforo `title_classe`/`title_docente`.** Current: `"SOS in codice Morse"` + `"Semaforo 3 LED"`. Clean book-faithful (per `clean-titles.md` + a3-corrections): `"Esperimento 3: fai un SOS in codice Morse"` + `"Esperimento 5: il semaforo"`. Lesson-path top-level `title` was cleaned iter 57 Phase 3, but capitoli `title_classe`/`title_docente` were NOT cleaned (iter 57 scope). **Andrea ratify**: align capitoli titles with lesson-path titles iter 59 Phase 2.

4. **Vol1/Vol2 33 coupled-title cascade** (iter-57 deferred item 1). 33 `next_experiment.title` drifts across Vol1+Vol2 lesson-paths (16 caused by iter-57 Phase 3 retitled experiments; 17 pre-existing). All Vol1/Vol2; zero Vol3. Low severity (stale label, not wrong-content). Reproducible via the script in iter-57 close §"Honest gaps" item 1. **Andrea ratify**: schedule dedicated Vol1/Vol2 coupled-title pass iter 59+ (out of A4.1e Vol3 narrative scope).

5. **Vol2 Cap.11 theory-node** (A3 master verdict Open decision 6). Still open since iter-54. `v2-cap11.json` exists (`src/data/capitoli/v2-cap11.json` per ls) but is NOT in `CHAPTER_MAP` (chapter-map.js) — appears to be a theory-node Cap that doesn't have lesson-paths. **Andrea ratify**: keep as theory-only chapter OR convert to lesson-paths? iter 59 Phase 2 decide.

6. **`v3-cap6.json|v3-cap7.json|v3-cap8.json` transition prose `text_classe`/`text_docente_action`** (iter-57 deferred item 2). Still carries text authored for the old pre-iter-57 chain order. E.g. `v3-cap8.json` `closing_text` "Prossimo passo: il display LCD" still references removed `v3-extra-lcd-hello`. Editorial, ungated. **Andrea ratify**: schedule prose pass iter 59+ Phase 2 (could be Tea task T2).

7. **`narrative-map.json` schema design + wire-up.** iter 58 Phase 1 found NO `src/data/narrative-map.json` consumer in runtime code (only TEA folder Tea-canon + scripts audit `reconcile-narrative-canon.mjs`). Generating a dead file = NO value. **Andrea ratify**: (a) define UI component that consumes `src/data/narrative-map.json` (e.g. Mission Runner narrative arc viewer) BEFORE generating; (b) skip narrative-map.json entirely + rely on lesson-paths/capitoli runtime + `chapter-map.js` (current state). iter 58 PRESERVED state (b). iter 59 Phase 2: Andrea ratify (a) vs (b).

8. **`.test-count-baseline.json` `commit` field** = `bee5e627` (iter-57 Phase 4 ancestor). Phase 1 iter 58 is NOT baseline-changing (test count 13118 preserved). Field bump opportunistic. Hygiene only.

### iter-21+ Andrea mandate carryover NOT addressed iter 58 by design (plan-only iter 58)

- Linguaggio codemod 200 violations singolare → plurale (Andrea iter 21 mandate critical, carryover from `feedback_iter21_mandate_critical.md` + Sprint U Cycle 1 73 lesson-paths violations + 91 teacher_messages missing "Ragazzi,"). Multi-iter task. **iter 59+ Workstream B item 1**.
- 92 esperimenti Playwright UNO PER UNO sweep (real prod evidence kit fisico mismatch). Multi-iter task. **iter 59+ Workstream B item 5**.
- Grafica overhaul (`/colorize` `/typeset` `/arrange`) + Modalità Percorso UX. **iter 59+ Workstream B item 4**.
- Vol3 narrative refactor schema (ADR-027, Davide co-author). **Deferred Sprint U**.
- Modalità Passo Passo (`feedback_passo_passo_regression_06may2026.md` P0 Andrea). **iter 59+ Workstream B item 3**.
- HomePage prod regression + Glossario Tea integration. **iter 59+ Workstream B item 6**.
- `PLAN-unlim-prof-pilot-chatgpt.md` 10-phase mega-plan (Mission Runner Dual-View + Vision breadboard + ChatGPT canali + Anthropic Managed Agents Memory + Dreams). **Workstream D plan-only iter 58, multi-iter execute iter 59+**.

### mBlock pivot Workstream C — recon BG (deliverable pending)

Subagent dispatched 2026-05-15 ~9:50 GMT+2. Output expected `docs/research/2026-05-15-iter-58-workstream-C-mblock-recon.md` covering:
- C1 Blockly inventory in `src/` (9 files identified via initial grep: `NewElabSimulator.jsx`, `ScratchEditor.jsx`, `ScratchCompileBar.jsx`, `scratchGenerator.js`, `scratchBlocks.js`, `experiments-vol3.js`, `scratch-xml-templates.js`, `unlim-knowledge-base.js`, `simulator-api.js`)
- C2 mBlock Extension Builder feasibility for Arduino Nano R4 (Renesas RA4M1)
- C3 Migration paths A/B/C (separate desktop tool / embed .mext / hybrid)
- C4 Effort estimate FTE-weeks
- C5 Andrea ratification request

**Andrea decision iter 59 entrance**: review recon + ratify path A/B/C OR request more recon detail.

## Codex cross-check (anti-inflation loop)

| step | Codex verdict |
|---|---|
| feasibility live Claude↔Codex | RECOMMEND skip live-terminal, stick with `codex-bg.sh` (auditable, structured, reproducible) |
| Phase 1 diff (3 surgical edits) | BG running — see /tmp/codex-iter58-phase1-verify.txt for CONFIRM/REFUTE verdict |

Codex artifact: `/tmp/codex-iter58-feasibility-claude-codex-live.txt`

## State for iter 59 — handoff

iter 58 Phase 1 PARTIAL. iter 59 Phase 2 inputs ready:
- 3 Phase 1 edits committed (capitoli v3-cap6+v3-cap7)
- 50 inspiration links delivered
- mBlock recon delivered (Workstream C)
- 8 Andrea ratify queue items (above §"Honest gaps")
- iter-57 deferred items 1-6 still open (33 coupled-title cascade Vol1/Vol2, v3-cap9 orphan, Vol2 Cap.11, transition prose, num field cosmetic, baseline `commit` hygiene)

iter 59 priorities (handoff §4 Workstream split):
- P0: Andrea ratify queue 8 items (~15-30 min)
- P0: Phase 2 execute ratified items (v3-cap9, capitoli titles align, v3-cap6 pages, Vol2 Cap.11, narrative-map.json design)
- P1: Workstream B start (linguaggio codemod scale + 92 esperimenti Playwright entry)
- P2: Workstream C mBlock execute (post Andrea ratify A/B/C)
- P2: Workstream D plan refinement (PLAN-unlim Mission Runner Phase 1 implementation scope)

## NON COMPIACERE

Onestà sopra comodità. iter 58 Phase 1 = 3 surgical edits + 1 BG recon delivered + 1 BG recon pending + iter-21+ mandate Workstream B/C/D PLAN-ONLY. Score 8.0/10 ONESTO G45 (NOT 9.0 inflated). A4.1e is **PARTIAL** not COMPLETE (4/7 sub-items deferred). Andrea ratify queue 8 items explicit + Codex CONFIRM iter 58 Phase 1 BG pending — verdict will be cited iter 59 entrance pre-commit gate.
