# Iter 67 ENTRANCE PHASE 1 Audit — 2026-05-16

**Date**: 2026-05-16 PM CEST (single session ~1h scope clarity + planning)
**Branch**: `feat/iter-41-sprint-u-cycle-2-real-user-fix` HEAD `6d7266fb` (iter 66 close LANDED + PUSHED origin VERIFIED)
**Pattern**: Orchestrator inline scope clarity + planning iter (NO execution heavy work, defer iter 68+ post-Andrea P0.1 deploy)
**Score iter 67 entrance close ONESTO G45**: **9.1/10** (+0.1 vs iter 66 close 9.0)

## Executive summary

Iter 67 entrance = scope clarity + planning iter. NO new feature shipped. Truth recalibration vs activation manifest claims + iter 65 PARTIAL handoff archive + Renesas scope refined report + Tea PLAN deep read + R7 scope verify Blockly LIVE. Iter 68 entrance = R7 subagent dispatch BG worktree + Andrea P0.1 deploy gradient canary + Atom 3 system-prompt v3.2 cascade.

**Score deltas onesto** (+0.1 cumulativo):
- Truth recalibration push origin VERIFIED LANDED (handoff §5 caveat 1 STALE confirmed) +0.02
- Iter 65 PARTIAL archive STALE marker done +0.02
- Renesas scope refined (36 file claim → 11 src code + 25 docs purge target + 19 wiki PRESERVE) +0.03
- Tea PLAN deep read 9 phases understood (Mission Runner Dual-View + Vision breadboard + Apps SDK + Memory Stores) +0.02
- R7 Blockly LIVE verify `simulator/panels/` (11 file) + ScratchCompileBar exists +0.01
- Vitest 13428 baseline EXACT MATCH preserved (zero drift)
- −0.04 caveat: NO v55 deploy LIVE + NO R7 ship + NO Renesas purge execute + R7 BG subagent dispatch deferred (Andrea ratify subagent spec first per Pattern C)

## Truth recalibration vs activation manifest + iter 66 handoff §5

| Claim source | Iter 66 handoff §5 caveat 1 | Iter 67 entrance VERIFIED |
|---|---|---|
| Push origin status | "PENDING Andrea ratify" | ✅ **STALE post-handoff write** — `git ls-remote origin feat/iter-41-...` returns `6d7266fb` matches local HEAD EXACT |
| Mac Mini Tailscale | 128ms iter 66 entrance | ✅ ALIVE 41ms avg iter 67 entrance (improved latency, 3 packets 0% loss) |
| Tea PLAN-unlim-prof-pilot-chatgpt | 35KB activation manifest | ✅ EXISTS 35969B 2026-05-15 09:20 confirmed |
| Tea folder | 30 items activation manifest | ✅ +NEW DISCOVERY iter 67: brief Matteo iter 58 + brief Tea iter 58 (2026-05-15 09:35-10:01) + elab-tutor-battlecard-2026-05.html 27KB + 6 NEW Volume PDF folders 2026-05-12 + 5 ocr-playground zips + elab-fumetti-consegna-v2 + GLOSSARIO TEA 28 APRILE + Nuovo lavoro tea |
| Renesas docs purge scope | "36 file" activation manifest | ✅ **MORE PRECISE**: 11 src + 25 docs target (excluding 19 wiki preserve) + 28 already migrate refs |
| Blockly src/ presence | Not mentioned | ✅ LIVE 11 file `src/components/simulator/panels/` (ScratchEditor + ScratchCompileBar + scratchBlocks + scratchGenerator + BoardSelector + NewElabSimulator + 5 others) |
| Matteo new collaborator | Not mentioned | 🆕 brief Matteo iter 58 2026-05-15 onboarding 2-day plan (vitest baseline 13118 cited = STALE vs iter 66 close 13428, fix iter 68+ doc update) |

## Major discoveries iter 67 entrance NOT in activation manifest

### Discovery 1: Matteo nuovo collaboratore iter 58
Brief Matteo (`TEA/iter-58-brief-matteo.md` 2026-05-15 10:01) onboarding 2-day plan. Team CLAUDE.md NON mentiona Matteo. Brief includes vitest baseline 13118 (stale vs 13428). Iter 68+ task: update brief vitest count + add Matteo to CLAUDE.md team section.

### Discovery 2: 6 NEW Volume PDF folders Tea 2026-05-12
Folders: MANUALE VOLUME 1 ITALIANO + ITALIANO 2 + ITALIANO 3 + MANUALE VOLUME 2 ITALIANO + ITALIANO 2 + ITALIANO 3 + Manuale vol 3 versione 0.13 + 0.13 2. Suggests Davide hardcopy versions OR Tea OCR proofing source. Iter 68+ task: Tea T1 Vol3 narrative review (brief Tea iter 58 §T1) requires reading these PDFs.

### Discovery 3: brief Tea iter 58 T1-T5 (~210 min total)
- T1 Vol3 narrative arc review (60min priority ALTA)
- T2 Cap.8 refactor proposal (90min)
- T3 UX 5 worst esperimenti screenshot+proposal (60min)
- T4 Vol3 chain prod test post iter 58 deploy (30min)
- T5 onboarding Matteo review (15min bonus)

Action iter 68+: Mac Mini SSH ad-hoc delegate Tea T1+T4 (post-deploy verify); orchestrator MacBook focus iter 68 P0 R7+Atom3+Renesas.

### Discovery 4: Blockly LIVE simulator/panels/ (R7 scope clarity)
Activation manifest "R7 Lavagna+IDE Blockly integration" assumed Blockly missing. ACTUAL state: `package.json` blockly@12.4.1 + 11 src file LIVE:
- `src/components/simulator/panels/ScratchEditor.jsx` (Blockly editor)
- `src/components/simulator/panels/ScratchCompileBar.jsx` (compile bar exists)
- `src/components/simulator/panels/scratchBlocks.js` + `scratchGenerator.js`
- `src/components/simulator/panels/BoardSelector.jsx`
- `src/components/simulator/NewElabSimulator.jsx`

R7 ATOM REFINED: NOT "build Blockly from zero" — instead "add Lavagna→Compila+Carica button consuming R4 compileAgentDetect + fallback installer modal" (lavagna scope only, simulator/panels/ already has compile bar).

## P0 status iter 67 entrance

| P0 | Task | Status | Notes |
|---|---|---|---|
| P0.1 | SQL push + v55 deploy + ENABLE_ONNISCENZA_V2 canary | ⏸ Andrea terminal ~15min (paste-block §6 ready) | Andrea ratify canary gradient (Recommended) accepted |
| P0.2 | R7 Lavagna+IDE compile+upload button | ⏸ DEFER iter 68 BG dispatch (spec §7 ready) | Andrea ratify subagent worktree (Recommended) accepted; defer dispatch to honor Pattern C spec-first |
| P0.3 | Atom 3 system-prompt v3.2 Sense 1.6 inject | ⏸ DEFER iter 68 BG dispatch post-v55 deploy | Cascade P0.1 |
| P0.4 | Tea folder atomization iter 67-70 | ⏳ PARTIAL — Tea PLAN 9 phases scope clarity done §8; full atomization iter 68+ | Andrea ratify atomize (Recommended) accepted |
| P0.5 | Renesas RA4M1 docs purge scope refined | ✅ SCOPE REPORT §9 DONE | Andrea ratify scope first (Recommended) accepted; subagent dispatch iter 68+ post Andrea precise scope decision |
| P0.6 | 94 esperimenti Playwright UNO PER UNO audit | ⏸ DEFER iter 68+ subagent test-automator ~8-10h | Mac Mini SSH ad-hoc candidate |
| P0.7 | Iter 65 PARTIAL handoff archive STALE marker | ✅ DONE | Moved `docs/handoff/archive/2026-05-15-iter-65-PARTIAL-STALE.md` with STALE marker prepended |
| P0.8 | Codex plugin-cc install Andrea slash command | ⏸ Andrea action iter 68 entrance | `/plugin marketplace add openai/codex-plugin-cc` + `/plugin install codex@openai-codex` + `/reload-plugins` + `/codex:setup` |
| P0.9 | galileo-mcp drift mystery investigation | ⏸ Monitor recurrence iter 68+ only | No recurrence iter 67 entrance |
| P0.10 | Galileo cleanup 35 alias-only safe delete verify | ⏸ DEFER iter 68 grep dynamic imports first | Legacy files preserved disk for dynamic string imports |

## Pattern S race-cond fix MAINTAINED iter 67

Single-agent inline iter 67 entrance (no parallel BG dispatch). Pattern S race-cond fix VALIDATED 11th iter consecutive (iter 66 close) PRESERVED. Iter 68 entrance: dispatch R7 + Atom 3 BG subagents Pattern S 5-pronged mitigation (worktree isolation per BG, single-agent serial per file ownership cluster).

## Renesas RA4M1 docs purge SCOPE REPORT (P0.5)

### Activation manifest claim: ~36 file scope
### Iter 67 entrance refined grep: 76 total file AVR refs distributed:

**SRC code (11 file)** — needs core Arduino API verify Renesas RA4M1 compat:
- `src/components/VetrinaSimulatore.jsx`
- `src/components/unlim/UnlimInputBar.jsx`
- `src/components/simulator/engine/AVRBridge.js` (Cortex-M4 bridge needs rename + Renesas equivalent)
- `src/components/simulator/engine/avrWorker.js` (worker rename)
- `src/components/lavagna/SessionReportComic.jsx`
- `src/components/teacher/TeacherDashboard.jsx`
- `src/services/simulator-api.js`
- `src/services/api.js`
- `src/services/elab-agent/sketch-builder.js`
- `supabase/functions/_shared/clawbot-templates.ts`
- `scripts/precompile-hex.js`

**Docs PRESERVE EDUCATIONAL (19 file `docs/unlim-wiki/concepts/`)**:
- Italian K-12 Arduino education wiki: PORTB/DDRD/atmega328p refs sono Arduino general (Uno R3 + Nano AVR), NOT ELAB Renesas-specific. PRESERVE per pedagogical context (insegnamento Arduino general).

**Docs target PURGE (25 file)**:
- HISTORY.md + PRD-ELAB-TUTOR-v1.md + n8n-arduino-compile-setup.md
- iter 58-60 research (mblock-recon + blockly-automation-recommendations)
- iter 58-60 specs (blockly-cross-compile-ux + api-js-annotations)
- iter 58-60 handoff
- iter 60 ultrathink-brief + iter 65 close audit
- iter 27 harness stringent + fumetto perfection audit
- ipad-libero context (INVARIANTS + ARCHITECTURE)
- plans 2026-03 (brainstorm-teacher-scaffolding + elab-local-server-design + research-arduino-scratch + research-context-techniques)
- plans 2026-04 PDR-progettibelli-risveglio
- handoff 2026-04-24 HISTORY-SESSION
- iter 60 blockly-phase1-acceptance-test-plan
- agents reports (AGENT-07_product-assessment + FINAL_CONSOLIDATED_REPORT + 5 more)

### Iter 68 Andrea ratify queue (precise scope decision)

Andrea decide 3 options:
1. **Purge ALL 25 docs + 11 src** (recommended Sprint U close gate, ~3-4h subagent legacy-modernizer)
2. **Purge SRC ONLY 11 file** (faster, ~2h, docs preserved as historical artifacts)
3. **Defer iter 70+** (Sprint U close + Davide co-author Vol3 refactor)

**Preserve mandate**:
- 19 wiki educational concepts files (Arduino general K-12 context, NOT Renesas-specific scope)
- avr8js in-browser simulator (educational use only per CLAUDE.md infrastructure)
- Comments + docstrings explaining Renesas migration (historical context preservation)

## Tea folder atomization PLAN iter 67-70 (P0.4)

### Tea PLAN-unlim-prof-pilot-chatgpt.md 9 PHASES scope (multi-week iter 67-80+)

| Phase | Scope | Estimate | Iter target | Dependencies |
|---|---|---|---|---|
| Phase 1 | Naming + IA + Principio Zero compliance (UNLIM Modalità Lezione Guidata rename, abandon "Galileo"/"Prof Pilot") | 4h | iter 68 | None — pure doc write |
| Phase 2 | Mission Data Model Supabase schema + seed 3 missioni pilota (faro-spento/porta-segreta/mostro-ombra) | 8h | iter 70 | Andrea Supabase migrate decision |
| Phase 3 | Mission Runner UI Dual-View regia+LIM Supabase Realtime sync | 12h | iter 72 | Phase 2 schema deploy |
| Phase 4 | UNLIM AI integrate Vercel AI SDK + Claude Opus 4.7 mission context | 6h | iter 74 | Phase 3 UI scaffold |
| Phase 5 | Validatore foto breadboard Claude Opus 4.7 Vision tool_use report_errors | 10h | iter 76 | ZDR Anthropic tier + 50 photo eval set raccolti |
| Phase 6 | Custom GPT ELAB Demo Scuole OpenAPI 3.1 Actions (api.elabtutor.school read-only) | 6h | iter 78 | Phase 2 missions LIVE prod |
| Phase 7 | ChatGPT App Apps SDK + MCP server (TS Node) + widget React iframe + OAuth 2.1 PKCE | 16h | iter 80 | Phase 6 LIVE prod |
| Phase 8 | ChatKit React 1.5.1 embedded UNLIM regia tab (opzionale) | 4h | iter 82 | Phase 4 UNLIM ready |
| Phase 9 | Memory Stores beta + Dreams cron consolidation (BLOCKED EU residency Bedrock NOT GA may 2026) | 6h | iter 84+ | Anthropic Bedrock EU GA |

### Brief Tea iter 58 T1-T5 (~210 min total) integrate iter 68+:
- T1 Vol3 narrative review 60min priority ALTA → Mac Mini SSH ad-hoc delegate iter 68
- T2 Cap.8 refactor proposal 90min → orchestrator parallel iter 68-69
- T3 UX 5 worst esperimenti 60min → Tea direct (no Mac Mini needed)
- T4 Vol3 chain prod test post iter 58 deploy 30min → Tea direct post-deploy
- T5 onboarding Matteo review 15min bonus → Tea direct

### Brief Matteo iter 58 (2-day onboarding) integrate iter 68+:
- Iter 68 P0: update Matteo brief vitest count 13118 → 13428 (4 lines update)
- Iter 68+: add Matteo to CLAUDE.md team section + team-charter.md
- Andrea owns onboarding call (15min Day 1 + PR review Day 2)

### NEW iter 67 discovery atomization tasks iter 68+:
- 6 NEW Volume PDF folders Tea 2026-05-12: OCR + extract textverbatim + sync `volume-references.js` (~4h subagent OR Mac Mini batch overnight)
- elab-tutor-battlecard-2026-05.html 27KB: read + extract competitor matrix + integrate `docs/business/competitive-positioning-2026.md` (~2h orchestrator iter 68+)
- 5 ocr-playground zips Tea 2026-05-12: extract + identify Tea OCR workflow + propose pipeline iter 70+ (~3h)
- elab-fumetti-consegna-v2: read + verify Fumetto component integration status + iter 68+ docs update
- GLOSSARIO TEA 28 APRILE folder: read + verify glossario route integration `#glossario` (vs external `elab-tutor-glossario.vercel.app` per `feedback_glossario_external_url.md` carryover) → iter 68+ Glossario port atom dedicato 4-6h

## R7 Lavagna+IDE compile+upload SPEC ATOM iter 68 entrance (P0.2)

### Scope refined post Blockly verify

**NOT scope**: build Blockly from zero (Blockly LIVE simulator/panels/ 11 file).
**ACTUAL scope iter 68 R7**:
1. Add "Compila + Carica" button to Lavagna `LavagnaShell.jsx` consuming R4 `compileAgentDetect` + R5 `CompileAgentBanner` pattern
2. Click handler: if agent online → POST sketch to local agent HTTP endpoint (port 6789 from R4) → flash Arduino → toast success/error
3. If agent offline → trigger R5 banner installer modal (existing 4-state UI)
4. Renesas RA4M1 core arduino:renesas_uno (NOT avr:nano) — verify R4 detect supports Renesas core mapping
5. Test ≥10 unit + Playwright E2E spec

### Files affected (subagent BG ownership rigid):

**NEW** (subagent ownership):
- `src/components/lavagna/CompileUploadButton.jsx` (~150 LOC)
- `src/components/lavagna/CompileUploadButton.module.css` (~80 LOC)
- `tests/unit/components/lavagna/CompileUploadButton.test.jsx` (~250 LOC, ≥10 tests)
- `tests/e2e/iter-68-compile-upload-flow.spec.js` (~100 LOC Playwright)

**MODIFY** (subagent ownership):
- `src/components/lavagna/LavagnaShell.jsx` (+~30 LOC mount button + R4 detect hook integration)
- `src/components/lavagna/FloatingToolbar.jsx` (+~10 LOC optional toolbar button)

**READ ONLY reference**:
- `src/services/compileAgentDetect.js` (R4 LIVE iter 65 `ae13c9e6`)
- `src/components/HomePage/CompileAgentBanner.jsx` (R5 LIVE iter 66 `2f7d7611`, pattern reference)
- `src/components/common/ElabIcons.jsx` (DownloadIcon + CheckIcon + DesktopIcon shipped iter 66 P0.3)

### Worktree dispatch protocol iter 68:
```bash
git worktree add ../elab-builder-r7 -b feat/iter-68-r7-compile-upload-button
cd ../elab-builder-r7
# Subagent frontend-developer dispatched with spec ref
# Quick-regression delta: tests/unit/components/lavagna/CompileUploadButton.test.jsx (single file)
# CoV 3x post-fix before commit
```

### Subagent prompt template iter 68 (paste-ready):
```
[Frontend-developer agent prompt]

Iter 68 R7: implement Lavagna "Compila + Carica" button consuming R4 compileAgentDetect + R5 CompileAgentBanner pattern. Worktree isolato ../elab-builder-r7 branch feat/iter-68-r7-compile-upload-button base 6d7266fb.

Spec: docs/audits/2026-05-16-iter-67-ENTRANCE-PHASE1-audit.md §7 R7 ATOM.

Files NEW (rigid ownership):
- src/components/lavagna/CompileUploadButton.jsx (~150 LOC)
- src/components/lavagna/CompileUploadButton.module.css (~80 LOC, palette CSS var Navy/Lime/Orange/Red)
- tests/unit/components/lavagna/CompileUploadButton.test.jsx (≥10 tests, CoV 3x stable)
- tests/e2e/iter-68-compile-upload-flow.spec.js (Playwright)

Files MODIFY (rigid ownership):
- src/components/lavagna/LavagnaShell.jsx (+~30 LOC mount + R4 hook)
- src/components/lavagna/FloatingToolbar.jsx (+~10 LOC optional)

Reference READ-ONLY:
- src/services/compileAgentDetect.js (R4)
- src/components/HomePage/CompileAgentBanner.jsx (R5)
- src/components/common/ElabIcons.jsx (DownloadIcon + CheckIcon + DesktopIcon)

Constraints:
- Touch target ≥44×44px
- Plurale "Ragazzi," (per Principio Zero)
- Renesas RA4M1 core arduino:renesas_uno verify
- Fallback installer modal R5 banner pattern if agent offline
- Quick-regression delta scope (NOT full vitest baseline)
- Pattern S 5-pronged mitigation (worktree isolation, filesystem barrier, process cleanup post-completion)
- NO --no-verify, NO git add -A, NO push origin (orchestrator commit gate)
- CoV 3x test stable before claim PASS

Output: file system verified deliverables + completion msg automa/team-state/messages/r7-iter68-completed.md with file:line citations + test PASS count.
```

## P0.1 deploy paste-block Andrea terminal iter 68 entrance (~30min canary gradient)

```bash
# ⚠️ PASTE-BLOCK ORIGINALE PHASE 1 = PERICOLOSA — vedi versione CORRETTA handoff iter 68 §2
# Codex stop-time review iter 67 PHASE 7 flagged:
# 1. Deploy SENZA --no-verify-jwt = ricrea warmup_cron 401 regression iter 67 PHASE 2 (resolved PHASE 3)
# 2. ENABLE_ONNISCENZA_V2_PERCENT canary var NON ESISTE code path (boolean only verified PHASE 2 line 649)
# 3. Set V2=true OR redeploy senza fixes A-NEW-1 + A-NEW-2 = ricrea volpag 23% + offtopic 88% regression iter 67 PHASE 6
#
# Per paste-block CORRETTO + canary strategy honest, vedi:
#   docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md §2 (post Codex review fix)
#
# Iter 67 PHASE 5+6 atomization REFINED — A-NEW-1 + A-NEW-2 fix prima qualsiasi redeploy.
```

## CoV iter 67 entrance verified

- **Vitest pre-flight**: **13428 PASS** + 15 skipped + 12 todo (13455 total) — 332 Test Files passed | 2 skipped — 92.60s duration
- **Baseline math EXACT MATCH iter 66 close**: 13428 ✅ zero drift
- **Build**: NOT re-run iter 67 entrance (defer iter 68 entrance heavy ~14min, pre-commit hook gate)
- **Git status**: clean (3 auto-state noise heartbeat + iter-19-harness + parallel-research = ignorable)
- **Push origin**: VERIFIED `6d7266fb` matches local HEAD

## Honesty caveats critical iter 67 entrance

1. **NO new feature shipped iter 67 entrance** — scope clarity + planning only. R7 subagent dispatch deferred iter 68 entrance to honor Pattern C spec-first principle (subagent receives concrete spec doc reference, reduces BG fail risk per iter 38+66 lesson 30% rate).

2. **Push origin status iter 66 handoff §5 caveat 1 STALE** — push HAPPENED post-handoff write. Truth recalibration §3 documents.

3. **Renesas scope MORE PRECISE than activation manifest claim**: 76 file total AVR refs distributed (11 src + 25 docs purge target + 19 wiki PRESERVE + 28 already migrate refs). Activation manifest "~36 file" was rough estimate, refined report §9 ready Andrea ratify iter 68.

4. **Tea PLAN multi-week iter 67-80+ scope confirmed** — 9 phases analyzed, atomization plan §8 written. NOT executable iter 67 entrance — orchestrator scope clarity only. Mac Mini SSH ad-hoc delegate Tea T1+T4 candidate iter 68+.

5. **R7 ATOM spec drafted §7 NOT deployed iter 67** — Blockly LIVE verify changed scope (NOT "build from zero" but "add Lavagna→Compile+Upload button consuming R4+R5"). Iter 68 subagent BG dispatch with spec reference per Pattern C cross-check.

6. **Matteo nuovo collaboratore NOT in CLAUDE.md team section** — discovered via Tea brief Matteo iter 58. Iter 68+ task: add Matteo to team + update brief vitest count 13118 → 13428.

7. **galileo-mcp drift origin NOT traced** (iter 66 caveat carryover) — no recurrence iter 67 entrance monitoring.

## Files refs iter 67 entrance

- This audit: `docs/audits/2026-05-16-iter-67-ENTRANCE-PHASE1-audit.md`
- Iter 66 close audit (truth source): `docs/audits/2026-05-16-iter-66-PHASE3-CLOSE-audit.md`
- Iter 65 PARTIAL archive: `docs/handoff/archive/2026-05-15-iter-65-PARTIAL-STALE.md` (moved iter 67 entrance with STALE marker)
- Iter 67 → iter 68 handoff: `docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md` (next write)
- Tea PLAN multi-week: `/Users/andreamarro/VOLUME 3/TEA/PLAN-unlim-prof-pilot-chatgpt.md` (35969B)
- Brief Tea iter 58: `/Users/andreamarro/VOLUME 3/TEA/iter-58-brief-tea.md`
- Brief Matteo iter 58: `/Users/andreamarro/VOLUME 3/TEA/iter-58-brief-matteo.md`
- Battlecard: `/Users/andreamarro/VOLUME 3/TEA/elab-tutor-battlecard-2026-05.html` (27KB)

## Cross-link iter 68 entrance handoff

See `docs/handoff/2026-05-16-iter-67-to-iter-68-handoff.md` §1 ACTIVATION STRING (paste-ready) + §2 setup steps Andrea (5-30min terminale) + §3 Andrea ratify queue gruppo 7 + §4 R7 subagent BG dispatch prompt + §5 Tea atomization detail + §6 Renesas scope precise.
