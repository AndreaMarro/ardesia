# PRD — Blockly Nano R4 Cross-Compile + UX Self-Explanatory Overhaul

> **Owner**: Andrea Marro (Founder/Dev) · **Authors**: Claude Code iter 59 + Codex GPT-5.5 Pattern C-V verify · **Date**: 2026-05-15
> **Status**: DRAFT — pending Andrea ratify before Phase 1 execute · **Iter scope**: 59 (Phase 1) → 60 (Phase 2) → 61 (Phase 3)
> **Source rejection**: iter 58 mBlock pivot Path C Hybrid REJECTED by Andrea. This PRD replaces Workstream C direction.

---

## Problem Statement

ELAB Tutor's current Blockly editor targets **Arduino Nano classic** (ATmega328p AVR) hardware: `compileCode(code, board = 'arduino:avr:nano:cpu=atmega328old')` ([src/services/api.js:1293](src/services/api.js:1293)) compiles for AVR, and `AVRBridge.js` (1242 LOC) emulates ATmega328p only. But Omaric's physical kit ships an **Arduino Nano R4** (Renesas RA4M1 Cortex-M4) — students upload generic Blockly-generated Arduino C++ to a board the compiler is not configured to target. Schools cannot reliably flash the kit hardware. Additionally, the Blockly UI uses the default Blockly theme + 23 custom blocks with terse labels — `docente scuola pubblica` without Arduino background struggles to read the editor on a LIM projection, violating Andrea iter-21+ mandate "fruibile e semplice". The competitive risk: docenti revert to mBlock or Arduino IDE for actual lessons, breaking the triplet Morfismo (software ↔ kit ↔ volumi) and hollowing the moat.

## Users

| Persona | Role | iter 59 expectation |
|---|---|---|
| **Primary** — Docente scuola pubblica (italian, 8-14 anni) | Tramite Principio Zero — proietta UNLIM + Blockly su LIM | Cross-compile = "premi compila, il kit dei ragazzi funziona". UX = ogni blocco comprensibile in lingua italiana senza training. |
| **Secondary** — Studenti 8-14 anni | Vedono LIM proiettata + lavorano kit fisico | Blocchi colorati, icone leggibili da fondo aula, parole verbatim dal volume. |
| **Tertiary** — Tea + Matteo (collaboratori) | Co-dev / UAT / onboarding | Iter 58 brief Matteo prevede "Day 2 first PR" — Blockly UX overhaul = ottimo terreno. Tea T3 esistente "5 worst esperimenti UX". |
| **Quaternary** — Davide Fagherazzi | Autore volumi cartacei | Verifica software label verbatim volume cartaceo (Morfismo Sense 2 audit). |

## Goals

1. **Cross-compile parità hardware**: Nano R4 (kit Omaric) compiles + uploads successfully from Blockly UI without code changes. Selettore board UI esposto a docente. → Acceptance: 13/13 Vol3 esperimenti compile success su `arduino:renesas_uno:unor4wifi` (FQBN Nano R4) entro Phase 1 close.
2. **UX self-explanatory**: docente without Arduino background interpreta tutti i 23 blocchi via visual cue (icona + label IT + tooltip) entro 5 minuti senza training esterno. → Acceptance: Matteo (iter 58 brief Day 1 orientation) completa orientation test 23/23 blocks identificati senza chiedere ad Andrea.
3. **Anti-regression**: vitest 13118 PRESERVED + validator 94/94 PRESERVED + AVR Nano classic existing 13 Vol3 esperimenti continuano compile + simulate via AVRBridge.js (zero behavior change AVR path).
4. **Morfismo Sense 2**: palette Navy/Lime/Orange/Red applicata Blockly theme + Italian labels verbatim Vol3 chapters dove applicable + zero block names English/code-fragment leakage.
5. **Score iter 61 close**: ≥8.5/10 ONESTO G45 conditional 3-Phase complete + Andrea ratify Phase gates × 2 + Codex Pattern C-V CONFIRM × N commits.

## Non-Goals (esplicite)

1. **Nano R4 in-browser simulation**. Cortex-M4 emulator = 12-20 FTE-weeks unrelated work. iter 59 sim stays ATmega328p (AVRBridge.js unchanged). Defer iter 70+.
2. **Replace Blockly with mBlock**. iter 58 mBlock recon Path C Hybrid REJECTED by Andrea (this PRD is the replacement direction). DO NOT re-litigate.
3. **Vol4 mBlock authoring** (Riccardo Omaric separate workstream). Decoupled from elab-builder — Riccardo can use mBlock 5 Desktop standalone; ELAB Tutor non lo embed.
4. **Block library export as `.mext` format**. Not needed if Blockly kept. Custom JSON serialization of Blockly workspaces is already supported natively.
5. **Visual programming for Nano R4-specific peripherals** (Wi-Fi, BLE, Crypto chip on UNO R4 WiFi). Out of scope iter 59-61. Reserve for iter 70+ post in-browser sim feasibility.
6. **Code editor LSP/IntelliSense Arduino C++** in CodeMirror. Already partial via `@codemirror/lang-cpp`. Not scope of this PRD.

## User Stories

### Docente persona

- US-D1 (P0): As a docente, I want a **board selector** (radio toggle "Nano classic AVR" vs "Nano R4") near the compile button, so that I select the actual board kit my class is using before pressing "Compila".
- US-D2 (P0): As a docente, when I press "Compila" with Nano R4 selected, I want the **same workflow** as the current AVR path (toast feedback + error display) — so that my class isn't surprised by new failure modes.
- US-D3 (P1): As a docente, I want **each Blockly block to show its purpose** when I hover/long-press on LIM (tooltip Italian + 1-line example "Es. accendi LED 13"), so that I can explain the block to students without consulting Volume.
- US-D4 (P1): As a docente, I want **only the blocks relevant to the current esperimento** shown in the toolbox, so that students aren't overwhelmed by 23 blocks when they need only 4 (per esperimento context filter).
- US-D5 (P2): As a docente, I want a **"Mostra Arduino C++" panel** toggle that shows the generated code as I drag blocks, so I can teach the bridge between visual and text programming.

### Studente persona (via LIM)

- US-S1 (P0): As a studente 8-14, I want **block colors matching kit components** (LED block lime like the LED, motor block orange like the motor body), so that I recognize them at fondo aula without reading.
- US-S2 (P1): As a studente, I want **block icons** (LED icon = 💡, pulsante = 🔘, potenziometro = 🎛️) so I can identify blocks before learning Italian terms.

### Co-dev persona (Tea + Matteo)

- US-CD1 (P1): As Tea (Andrea iter 58 brief T3), I want to **report 5 worst Blockly esperimenti UX bugs** in `TEA/Nuovo lavoro tea/iter-58-ux-5-worst.md` with screenshots + proposals. Phase 2 input.
- US-CD2 (P1): As Matteo (iter 58 brief Day 2), I want to **fix one Blockly typo / cosmetic bug** as first PR, getting comfortable with the workflow. Phase 2 input.

### Anti-regression persona (Claude + Codex Pattern C-V)

- US-AR1 (P0): As Claude, I want every commit gated by 4 checks (vitest + build + validator + Codex CONFIRM), so that 13118 baseline NEVER scendere.
- US-AR2 (P0): As Codex, I want a parametric `verify-codegen-output.txt` prompt template to re-derive AVR codegen output vs Renesas after each scratchGenerator.js edit, so that codegen determinism preserved.

## Requirements

### P0 — Must-have (Phase 1, iter 59, ~6-8h)

| ID | Requirement | Acceptance |
|---|---|---|
| R1 | **Board selector UI** in compile region: radio `Nano classic AVR` / `Nano R4` near "Compila" button. Default = `Nano R4` (Andrea decide: which is the default?). | Selettore visibile + accessibile keyboard + touch ≥44px (CLAUDE.md rule 9). State persists localStorage `elab-compile-board` (Morfismo Sense 1.5 per-docente). |
| R2 | **`ALLOWED_COMPILE_BOARDS` extend** ([api.js:1293](src/services/api.js:1293) — `Set` allowlist) to include `arduino:renesas_uno:unor4wifi` (UNO R4 WiFi FQBN) + `arduino:renesas_uno:minima` (UNO R4 Minima FQBN). | grep `ALLOWED_COMPILE_BOARDS` returns 3 entries minimum (AVR Nano + 2 Renesas). Defensive check `if (!ALLOWED_COMPILE_BOARDS.has(board)) board = DEFAULT_BOARD` works unchanged. |
| R3 | **n8n compile endpoint verifies Renesas core support**. Andrea ratify needed — does `n8n.srv1022317.hstgr.cloud/compile` currently have `arduino-cli core install arduino:renesas_uno` installed? If NO, Andrea adds it (server-side) before Phase 1 close. | Test: POST `{code: <13 Vol3 esperimenti>, board: 'arduino:renesas_uno:unor4wifi'}` returns `{success: true, hex: <non-null>}` for 13/13. |
| R4 | **OpenAPI 3.1 contract** generated for n8n compile endpoint: request (`code` string + `board` enum + `libraries` array optional) + response (`success` bool + `hex` string|null + `errors` string|null + `output` string). | `docs/api/n8n-compile-openapi.yaml` exists + valid via `npx @apidevtools/swagger-cli validate` (or equivalent). |
| R5 | **API docs human-readable** from OpenAPI yaml. | `docs/api/n8n-compile-api.md` exists, generated via `/generate-api-docs` skill. |
| R6 | **Anti-regression preserved**: AVR Nano classic existing 13 Vol3 esperimenti compile + simulate via AVRBridge.js without change. | vitest 13118 PRESERVED + validator 94/94 + Codex Pattern C-V CONFIRM Phase 1 diff. |

### P1 — Nice-to-have (Phase 2, iter 60, ~10-16h)

| ID | Requirement | Acceptance |
|---|---|---|
| R7 | **Italian block labels verbatim** Vol3 chapters where applicable + Italian tooltips (description per blocco, 1 esempio). | `grep -c 'tooltip:' scratchBlocks.js` ≥ 23 (one per block). Codex verify each label matches Vol3 nomenclature via per-block citation. |
| R8 | **Block icons** (emoji or SVG ElabIcons per CLAUDE.md rule 11) per block, fondo aula readable. | Each of 23 blocks has `iconURL` or visual prefix. Visual regression Playwright screenshot baseline + diff. |
| R9 | **Morfismo palette** Navy/Lime/Orange/Red applied as Blockly theme (`Blockly.Theme` custom). Block categories color-coded per concetto. | Codex grep `colour:` + `theme:` in `scratchBlocks.js` + `ScratchEditor.jsx` — colors all from palette CSS var + zero hardcoded hex outside palette. |
| R10 | **Touch targets ≥44px** (CLAUDE.md rule 9) for block drag handles + category buttons + compile button. | DevTools inspector + Playwright touch test (no element <44px in Blockly toolbar). |
| R11 | **Per-experiment block filter** — toolbox shows only blocks needed for current esperimento. Default = all 23. | `ScratchEditor.jsx` accepts `experimentId` prop + filters toolbox via `experiments-vol3.js` block list per experiment. Test parametric: 13 Vol3 esperimenti each show ≤8 blocks. |
| R12 | **Tea T3 5-worst UX bugs delivery** as Phase 2 input. | `TEA/Nuovo lavoro tea/iter-58-ux-5-worst.md` exists with 5 bullets + screenshots. |
| R13 | **Matteo Day 2 first PR**: 1 cosmetic Blockly fix merged. | PR open + Andrea merge + iter 60 close audit cita. |

### P2 — Future (Phase 3, iter 61, ~6-10h)

| ID | Requirement | Acceptance |
|---|---|---|
| R14 | **"Mostra Arduino C++" toggle panel** — generated code real-time as drag blocks. | `ScratchEditor.jsx` `showGeneratedCode` state + CodeMirror panel toggle. |
| R15 | **Walkthrough first-time** Blockly UI (animated overlay 3-step: "drag block / connect / compile"). | First-time visit shows overlay + dismissable. localStorage flag `elab-blockly-walkthrough-seen`. |
| R16 | **Playwright E2E** Blockly drag-drop happy path (13 Vol3 esperimenti). | `tests/e2e/iter59-blockly-cross-compile-uno-per-uno.spec.js` 13 specs PASS in CI. |
| R17 | **Visual regression** Blockly canvas screenshots baseline. | `tests/e2e/__screenshots__/blockly-canvas-*.png` baseline set + diff threshold ≤2% per esperimento. |
| R18 | **Matteo UX test** — Matteo identifies 23/23 blocks in <5min senza help. | Recorded session + timestamp. Acceptance: 23/23 senza domande. |
| R19 | **Andrea ratify Phase 3 close** — score ≥8.5/10 ONESTO via Codex independent verify. | Codex cumulative audit CONFIRM ≥ X% of acceptance criteria met. |

## Success Metrics

### Leading indicators (1-2 settimane post Phase 1+2 ship)

| Metric | Source | Target |
|---|---|---|
| Cross-compile success rate | n8n compile endpoint logs (Andrea verify) | ≥95% per `arduino:renesas_uno:unor4wifi` over 100 compile calls |
| Blockly compile latency p95 | network panel n8n proxy | ≤8s (current AVR baseline TBD) |
| Block identification time (Matteo + Tea + Andrea-blind teacher) | recorded session | ≤5 min for 23/23 blocks |
| Lavagna Blockly drag-drop error rate | Playwright E2E flake | ≤2% over 100 runs |

### Lagging indicators (1-3 mesi)

| Metric | Source | Target |
|---|---|---|
| Andrea-reported "kit Nano R4 works in classroom" | Andrea + 1 scuola pilot feedback | qualitative ≥4/5 satisfaction |
| Tea/Matteo reported "Blockly UX confusione" tickets | feedback file | ≤2 per mese (post Phase 2) |
| Iter score progression | iter 60+ close audit Codex G45 | iter 60 ≥8.5/10, iter 61 ≥9.0/10 |
| Davide volume label divergence flagged | `morfismo-validator` skill | 0 violations Vol3 block labels |

## Risks + Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| n8n compile endpoint NOT supporting Renesas core | MEDIUM | HIGH (blocks Phase 1) | Andrea ratify R3 entrance Phase 1 — verify `arduino-cli core list` on n8n server. If missing, Andrea installs `arduino-cli core install arduino:renesas_uno` before code edits. |
| Existing `compileCode` `ALLOWED_COMPILE_BOARDS` change breaks AVR path | LOW | HIGH (regression) | Codex Pattern C-V verify per commit. Anti-regression FERREO 4-gate. vitest 13118 PRESERVED. |
| Blockly v12 Theme API breaking change vs current default theme | LOW | MEDIUM (UX overhaul Phase 2) | Phase 2 entrance: read Blockly v12 Theme docs via context7 MCP. Codex verify theme API compat. |
| Blockly toolbox dynamic filter break drag-drop on touch | MEDIUM | MEDIUM (UX Phase 2) | Phase 3 visual regression + Playwright touch test catches before merge. |
| Italian labels diverge from Vol3 verbatim | MEDIUM | MEDIUM (Morfismo Sense 2 violation) | `elab-morfismo-validator` skill invoke post Phase 2 labels. Davide cited as Volume canon source. |
| Matteo UX test fails (8-14 anni perspective NOT his) | LOW | LOW (test design flaw) | Matteo is dev not target user — accept proxy test. Real student UX test deferred iter 65+ Tea coordina con scuola pilot. |
| 4 P1 Andrea ratify queue voci iter 58 still open block iter 60 entry | HIGH | LOW (parallel workstreams) | iter 60 entrance: Andrea ratify queue 8 voci PRIMA Phase 2 execute (parallel A4.1e + Blockly UX). |

## Open Questions (require Andrea decision before Phase X)

### Block Phase 1 entry (R1-R6):

1. **Default board iter 59**: `Nano R4` (new direction Andrea iter 59) OR `Nano classic AVR` (backward compat existing 13 Vol3 esperimenti)? **Andrea decide**.
2. **R3 n8n Renesas core install**: is `arduino-cli core install arduino:renesas_uno` already on n8n server, OR Andrea must install? **Andrea verify** via SSH `arduino-cli core list`.
3. **UNO R4 variant**: WiFi or Minima as default kit board? Affects FQBN choice. Riccardo Omaric specifies. **Andrea + Riccardo decide**.

### Block Phase 2 entry (R7-R13):

4. **Block label canon source**: Vol3 OCR txt OR `a3-corrections.json` `bookFaithfulTitle` field OR Davide direct review? **Andrea decide**.
5. **Block icons**: emoji (fast, accessible) OR SVG ElabIcons (Morfismo coerente)? **Andrea ratify** post-design proposal.
6. **Per-experiment block filter**: does Vol3 esperimento `v3-cap6-esp1` (LED) get only 5 blocks OR all 23 with relevant highlighted? **Andrea decide UX preference**.

### Block Phase 3 entry (R14-R19):

7. **Walkthrough first-time** — language: Italian only OR Italian + visual icons fallback? **Andrea ratify** post-design.

## Timeline + Phasing

| Phase | Iter | Effort | Deliverables | Andrea gate |
|---|---|---|---|---|
| **Phase 1** Cross-compile | 59 | 6-8h | R1 board selector + R2 ALLOWED_COMPILE_BOARDS extend + R3 n8n core verify + R4 OpenAPI yaml + R5 API docs md + R6 anti-regression PRESERVED | Andrea ratify Q1+Q2+Q3 PRIMA execute |
| **Phase 2** UX overhaul | 60 | 10-16h | R7-R13 Italian labels + tooltips + icons + Morfismo palette + touch ≥44 + per-experiment filter + Tea T3 + Matteo Day 2 | Andrea ratify Q4+Q5+Q6 PRIMA execute |
| **Phase 3** Verification | 61 | 6-10h | R14-R19 Mostra C++ + walkthrough + Playwright E2E + visual regression + Matteo UX test + Andrea ratify | Andrea ratify Q7 PRIMA execute |

Total estimated effort: **22-34 hours** across 3 iterations. Realistic with 4-gate per commit + Codex Pattern C-V.

## Anti-regression FERREO (CLAUDE.md mandate)

- vitest 13118 PRESERVED (NEVER scendere)
- `npm run build` exit 0 PRIMA ogni commit
- `node scripts/epic1/validate-lesson-paths.mjs` 94/94 PRESERVED
- Codex Pattern C-V CONFIRM per ogni claim/score/commit
- MAI `--no-verify`, MAI push main, MAI `git stash`, MAI `git add -A`
- Pre-commit + pre-push hooks attivi (`scripts/quick-regression-check.sh`)

## Codex workflow refinement (Andrea iter 59 mandate)

- Standard prompt template GOAL/CONTEXT/CONSTRAINTS/DONE codified (see `docs/research/2026-05-15-iter-59-blockly-automation-recommendations.md` §Codex workflow refinement).
- Anti-failure-mode guards baked: no SKILL.md reads, no heredoc, explicit paths.
- Pattern matrix C-V (default) / V-C (enumeration) / C-C-V (high-stakes design).
- Reusable prompts library `scripts/dev/codex-prompts/` proposed (iter 59 P1 deliverable).

## /ultrareview gate (user-triggered, NOT Claude-launched)

Per session inventory: `/ultrareview` is **user-triggered + billed**. Claude **cannot** launch it via Bash or otherwise. Andrea must run independently:
- `/ultrareview` (no arg, bundles current branch local diff) — OR
- `/ultrareview <PR#>` for GitHub PR multi-agent cloud review

Recommended trigger points iter 59-61:
- **Phase 1 close**: `/ultrareview` of branch post 6-8h Phase 1 commits.
- **Phase 2 mid**: `/ultrareview` of branch dopo UX overhaul 5-7h.
- **Phase 3 close**: `/ultrareview` cumulative + Andrea final ratify pre-merge main.

## Phasing close criteria + Andrea ratify gates

### Phase 1 close (iter 59):
- All P0 acceptance criteria (R1-R6) PASS.
- 13/13 Vol3 esperimenti compile success on Nano R4 board.
- vitest 13118 PRESERVED.
- Codex Pattern C-V CONFIRM Phase 1 cumulative diff.
- Andrea ratify Phase 2 entry.

### Phase 2 close (iter 60):
- All P1 acceptance criteria (R7-R13) PASS.
- 23/23 Blockly blocks Italian label + tooltip + icon + Morfismo palette compliant.
- Tea T3 delivered + Matteo Day 2 PR merged.
- vitest 13118 PRESERVED.
- Codex + `elab-morfismo-validator` skill CONFIRM.
- Andrea ratify Phase 3 entry.

### Phase 3 close (iter 61):
- All P2 acceptance criteria (R14-R19) PASS.
- 13 Playwright E2E + visual regression baseline.
- Matteo UX test 23/23 blocks <5min.
- Score Codex G45 ≥8.5/10 ONESTO.
- Andrea ratify cumulative + merge main consideration.

## Follow-up artifacts (offered)

- Engineering ticket breakdown (1 ticket per R1-R19, parametric).
- Design brief for Phase 2 UX (Italian labels canon + icon set + palette mapping).
- Stakeholder pitch for Andrea + Davide review.
- ADR-032 (Architecture Decision Record): "Blockly preserved, cross-compile via board param, NO mBlock migration".

**Ask**: which follow-up Andrea wants generated first (or skip — execute directly)?
