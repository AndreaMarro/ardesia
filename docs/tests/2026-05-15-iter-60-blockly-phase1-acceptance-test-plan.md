# Iter 60 Phase 1 — Blockly Cross-Compile Acceptance Test Plan (OUTLINE)

**Date**: 2026-05-15
**Scope**: Phase 1 R1-R6 acceptance per PRD `docs/specs/2026-05-15-iter-59-blockly-cross-compile-ux.md`
**Role**: TESTER subagent — `/ultrathink:ultrathink` coordinator dispatch
**Status**: OUTLINE ONLY — no test code execution, no test file creation. This document enumerates what tests SHOULD exist + acceptance criteria + Codex Pattern C-V verify hooks.

---

## 1. Overview

- **Tested in Phase 1**: BoardSelector component unit (R1), `ALLOWED_COMPILE_BOARDS` allowlist integration (R2), OpenAPI yaml validate (R4), API docs review (R5), anti-regression gate (R6).
- **Deferred Phase 1**: n8n server core install verify (R3 — Andrea SSH manual); full 26-assertion E2E Playwright sweep (CI iter 61); pilot test gate Q8 (Lino mandate iter 62); WebSerial flash protocol (Phase 4 iter 70+).
- **Anti-regression mandate** (CLAUDE.md FERREO): vitest baseline `13118 PASS / 0 failed` MUST be preserved. Re-baseline only with arithmetic proof per CLAUDE.md.

---

## 2. R1 — BoardSelector Component Unit Tests

**File**: `tests/unit/components/simulator/panels/BoardSelector.test.jsx` (NEW)
**Component under test**: `src/components/simulator/panels/BoardSelector.jsx` (Coder parallel scaffold ~50 LOC)
**Framework**: vitest + @testing-library/react + jsdom

**Outlined tests** (~10):

1. **Render default props**: 3 boards rendered (AVR / Nano R4 WiFi / Nano R4 Minima), `value="arduino:avr:nano:cpu=atmega328old"` (AVR default), `disabled=true` (Phase 1 ships disabled until Andrea Q4 ratify).
2. **onChange callback fires**: simulated radio click → `onChange` invoked with new FQBN string.
3. **localStorage persist**: change radio → key `elab-compile-board` written with selected FQBN.
4. **localStorage load on mount**: pre-seed `elab-compile-board` → initial render value matches.
5. **Touch target ≥44px**: assert `getBoundingClientRect().height >= 44 && .width >= 44` per radio label (JSDOM mock; real DOM verified in Playwright E2E §8).
6. **Keyboard arrow nav**: ArrowDown/ArrowUp cycle focus across radios (WCAG 2.1 SC 2.1.1).
7. **ARIA role**: container `role="radiogroup"` + `aria-label="Scheda di compilazione"` present.
8. **Disabled prop blocks onChange**: `disabled=true` → click does NOT fire onChange + does NOT write localStorage.
9. **Italian labels verbatim**: "Nano classic AVR" / "Nano R4 WiFi" / "Nano R4 Minima" rendered exactly (Sense 1.5 docente language).
10. **Undefined initial value fallback**: `value={undefined}` → first `availableBoards[0]` selected (no crash).

**Expected delta**: +10 tests → baseline 13118 → 13128.

---

## 3. R2 — ALLOWED_COMPILE_BOARDS Extension Integration Tests

**File**: `tests/integration/api/compileCode-board-allowlist.test.js` (NEW)
**SUT**: `src/api/compileCode.js` `ALLOWED_COMPILE_BOARDS` Set + `safeBoard` fallback logic
**Framework**: vitest + fetch mock (msw or vi.fn)

**Outlined tests** (~5):

1. **Nano R4 WiFi accepted**: `compileCode(code, 'arduino:renesas_uno:unor4wifi')` → fetch body contains `board: 'arduino:renesas_uno:unor4wifi'` (NO fallback to DEFAULT_BOARD).
2. **Nano R4 Minima accepted**: `compileCode(code, 'arduino:renesas_uno:minima')` → fetch body contains `board: 'arduino:renesas_uno:minima'`.
3. **Invalid FQBN falls back**: `compileCode(code, 'invalid:board')` → fetch body contains `board: DEFAULT_BOARD` (`'arduino:avr:nano:cpu=atmega328old'`).
4. **AVR baseline preserved** (anti-regression): `compileCode(code, 'arduino:avr:nano:cpu=atmega328old')` → unchanged behavior, fetch body identical to pre-R2 snapshot.
5. **Mock fetch success all 4 FQBN**: mock returns `{ hex: '...', success: true }` for each — assert no throw + hex propagated to caller.

**Expected delta**: +5 tests → 13128 → 13133.

---

## 4. R3 — n8n Server Core Install SSH Verify (MANUAL — Andrea action only)

**NOT automatable from CI** — server-side prereq.

- **Verify command**: `ssh n8n-server "arduino-cli core list | grep renesas"`
- **Expected output**: `arduino:renesas_uno  1.X.X  Arduino UNO R4 Boards`
- **If missing**: `ssh n8n-server "arduino-cli core install arduino:renesas_uno"` (~80MB download, ~2-3min)
- **Post-install verify**: re-run grep, expect line present.
- **Honest gap**: ONLY Andrea has SSH key access to n8n server. Phase 1 close gate (§10) blocks until Andrea confirms.

---

## 5. R4 — OpenAPI YAML Validate

**Command**: `npx @apidevtools/swagger-cli validate docs/api/n8n-compile-openapi.yaml`
**Expected**: exit code 0 + stdout contains `"docs/api/n8n-compile-openapi.yaml is valid"`.
**CI integration**:
- Add to `package.json` scripts: `"validate:openapi": "npx @apidevtools/swagger-cli validate docs/api/n8n-compile-openapi.yaml"`
- Pre-commit hook OR Vercel build step — **defer ratify iter 60+** (Andrea Q-ratify needed).

---

## 6. R5 — API Docs Markdown Update Review

**File**: `docs/api/n8n-compile-api.md` §7 board allowlist
**Trigger**: post Andrea Q1-Q3 ratify answers (FQBN strings, default board, enable timing).
**Verify**: visual diff review (manual) — NO automated test. Confirm §7 lists 3 boards + ratified default + enable-when condition.

---

## 7. R6 — Anti-Regression Acceptance Gate (CRITICAL)

**CLAUDE.md FERREO**: vitest baseline preserved or +arithmetic-proven delta.

### 7.1 Vitest baseline
- **Pre-Phase-1**: `npx vitest run` = `13118 PASS / 0 failed` (baseline `automa/baseline-tests.txt`).
- **Post-Phase-1 expected**: `13133 PASS / 0 failed` (+10 R1 unit + 5 R2 integration = +15 delta).
- **Arithmetic proof template** (CLAUDE.md re-baseline mandate):
  ```
  Baseline: 13118 PASS
  + R1 BoardSelector unit: +10
  + R2 compileCode-board-allowlist: +5
  = New baseline: 13133 PASS
  ```
- **Re-baseline only if**: all +15 new tests authored by TESTER subagent, reviewed by Andrea, NO existing test count decreased.

### 7.2 Lesson-paths validator
- **Command**: `node scripts/epic1/validate-lesson-paths.mjs`
- **Expected**: `94 pass / 0 fail / 0 unresolved / 0 cyclic` (UNCHANGED — Phase 1 has zero lesson-path edits).

### 7.3 Build
- **Command**: `npm run build`
- **Expected**: exit 0, bundle within tolerance of prior commit (±5% LOC).

### 7.4 Codex Pattern C-V verify hook
- **Per commit**:
  ```bash
  bash scripts/dev/codex-bg.sh iter60-phase1-verify-anti-regression \
    --profile verify \
    "$(sed -e 's/\$COMMIT_HASH/<HASH>/g' -e 's/\$BASELINE_COUNT/13118/g' \
       scripts/dev/codex-prompts/verify-anti-regression.txt)"
  ```
- **Expected**: `CONFIRM diff-review` returned.

---

## 8. E2E Playwright — 13 Vol3 Esperimenti × 2 Boards (DEFERRED CI iter 61, manual smoke iter 60)

**File**: `tests/e2e/iter60-blockly-cross-compile-uno-per-uno.spec.js` (OUTLINE — author iter 61)
**Framework**: Playwright + visual regression baseline
**Prereq**: R3 n8n server core install completed (Andrea SSH).

**Per esperimento Vol3** (13 total):
1. Navigate to esperimento route (e.g. `#esperimento-vol3-led-blink`).
2. Open Blockly workspace, place expected blocks (per esperimento JSON spec).
3. Click "Compila" button.
4. Assert HEX bytes returned in response + simulator accepts upload.

**Parametric per board** (2 × 13 = **26 assertions**):
- AVR: `arduino:avr:nano:cpu=atmega328old` (regression preserved)
- Nano R4: `arduino:renesas_uno:unor4wifi` (NEW — requires R3 prereq)

**Visual regression**: screenshot Blockly canvas pre-compile + post-compile per esperimento → store baselines `tests/e2e/snapshots/iter60-vol3-{name}-{board}.png`.

**Runtime estimate**: ~3-5min per Vol3 esperimento × 13 = ~45-65min full sweep. **CI iter 61 schedule**: nightly. **Iter 60 schedule**: manual smoke 3 esperimenti only (LED blink, Pushbutton, MOSFET) × 2 boards = 6 manual passes.

---

## 9. Codex Pattern C-V Verify Hook Template Usage

All templates pre-created iter 59 entrance under `scripts/dev/codex-prompts/`:

| Template | Trigger | Params |
|----------|---------|--------|
| `verify-anti-regression.txt` | Per commit | `$COMMIT_HASH`, `$BASELINE_COUNT=13118` |
| `verify-codegen-output.txt` | Per scratchGenerator edit (NONE expected Phase 1) | `$BLOCK_NAME`, `$EXPECTED_OUTPUT` |
| `verify-lesson-path-edit.txt` | Per lesson-path edit (NONE expected Phase 1) | `$PATH_ID`, `$VALIDATOR_RESULT` |
| `verify-morfismo-compliance.txt` | Per UX edit (Phase 2+ only — disabled state, palette, fonts) | `$COMPONENT`, `$PALETTE_KEY` |

**Phase 1 active templates**: only `verify-anti-regression.txt` runs per commit. Others stay dormant until Phase 2 ratify.

---

## 10. Acceptance Gate — Phase 1 Close Iter 60

Phase 1 closes when ALL boxes ticked:

- [ ] **13/13 Vol3 esperimenti AVR compile success preserved** (anti-regression, manual smoke 3 + nightly CI full sweep iter 61).
- [ ] **13/13 Vol3 esperimenti Nano R4 compile success** (R3 PREREQ Andrea SSH + n8n endpoint live, manual smoke 3 iter 60).
- [ ] **Vitest baseline preserved or +arithmetic-proven delta** (13133 expected, arithmetic doc in commit msg).
- [ ] **Validator 94/94 PRESERVED** (`scripts/epic1/validate-lesson-paths.mjs`).
- [ ] **Build exit 0** (`npm run build`).
- [ ] **Codex Pattern C-V CONFIRM per commit** (`verify-anti-regression.txt`).
- [ ] **Andrea ratify Phase 2 entry** (separate gate post Q4-Q8 ratify — board enable timing, pilot test, Lino mandate).

---

## 11. Honest Gaps + Risks

- **PREREQ R3 server-side**: ONLY Andrea SSH can verify n8n `arduino:renesas_uno` core install. Phase 1 close blocks on Andrea action.
- **E2E full sweep ~45-65min**: too slow for per-commit CI iter 60. Manual smoke 3 esperimenti × 2 boards iter 60; full sweep nightly CI iter 61.
- **Pilot test gate Q8**: Lino mandate iter 62 — pilot 5 docenti Strambino classroom NOT in Phase 1 scope. Phase 1 closes WITHOUT pilot evidence.
- **WebSerial flash protocol**: Nano R4 HEX upload from browser → board USB-CDC flash NOT in Phase 1 scope. Phase 4 iter 70+ (separate spec required).
- **Anti-regression risk**: if R1/R2 author tests that accidentally count duplicate vitest runs, baseline check fails. Mitigation: TESTER subagent reviews delta arithmetic before commit.
- **OpenAPI validate CI integration deferred**: R4 ships as manual command iter 60; pre-commit/Vercel hook iter 60+ ratify.

---

## Summary

**10 unit + 5 integration + 26 E2E parametric + 1 anti-regression gate + Codex Pattern C-V per commit.**

File: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/docs/tests/2026-05-15-iter-60-blockly-phase1-acceptance-test-plan.md`
