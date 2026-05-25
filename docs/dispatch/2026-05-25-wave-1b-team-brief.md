# Wave 1b Team Brief — Iter X.2b Blockly Cross-Compiler Expansion

**Date**: 2026-05-25
**Source spec**: `docs/prompts/PROMPT-NEXT-SESSION-2026-05-27-BLOCKLY-WAVE-1B-EXPANSION.md`
**Plan doc**: `docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md` (Iter X.2b row line 292)
**Branch**: `feature/blockly-crosscompiler-definitivo` (worktree: `PRODOTTO/elab-builder-blockly-definitivo/`)
**Wave 1 baseline**: 13 commit landed + PR #167 OPEN. `Test Files 3 failed | 422 passed | 2 skipped (427)` IDENTICAL CoV 3× (9 pre-existing UnlimCompileHelper fails ALL pre-Wave-1).
**Andrea ratify**: silenzio = default applied. R1 push satisfied (#167 OPEN). R2 4 atom parallel. R3 elabArduinoAst Wave 2 deferred. R4 X.3 after Wave 1b.

---

## Shared rules — ALL implementers

### File ownership matrix (IMMUTABLE — Wave 1 Impl-A precedent: self-recovered sweep violation)

| Agent | Files exclusive OWNED | Hard NO-TOUCH |
|-------|----------------------|---------------|
| **Impl-A-Toolbox-IT-2** | `src/components/simulator/panels/scratchToolboxProgressive.js` (91 → expand), `src/components/simulator/panels/scratchBlocks.js` (414 → category gaps), `src/i18n/blockly-msg-it.js` (108 → +30 msg keys), `tests/unit/i18n/blockly-msg-it.test.js` (extend), NEW `tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js` | `scratchGenerator.js` (Impl-B), `compiler.js` (Impl-C), `tests/e2e/` (Impl-G) |
| **Impl-B-Codegen-CodeSync-2** | `src/components/simulator/panels/scratchGenerator.js` (545 → #include + var decls top), `src/features/elabBlocks/codeSync.js` (38 → tolerant + #define + multi-fn + comment preserve), `src/features/elabBlocks/starterTemplates.js` (129 → extend), `tests/unit/components/simulator/panels/scratchGenerator.pinMode.test.js` (extend) | `scratchToolboxProgressive.js` (Impl-A), `compiler.js` (Impl-C), `src/features/elabArduinoAst/*` (Wave 2 DEFERRED — 1185 LOC cascade risk) |
| **Impl-C-Compile-2** | `src/services/compiler.js` (384 → RAM report + size warn + telemetry + intelHexValidator on remote), `src/components/simulator/utils/compileCache.js` (162 → telemetry hook), `tests/unit/services/compiler.test.js` (extend), `tests/unit/components/simulator/utils/compileCache.lru.test.js` (extend) | `intelHexValidator.js` (revert-protected READ-ONLY), `api.js` (Wave 2), `scratchGenerator.js` (Impl-B) |
| **Impl-G-Tests-2** | NEW `tests/e2e/09-blockly-v3-cap6-esp5-full-cycle.spec.js`, NEW `tests/e2e/10-homepage-codekit-drag-compile-sim.spec.js`, NEW `tests/unit/features/elabBlocks/codeSync.roundtrip.test.js` (contract test ≥ 20 test), NEW `tests/unit/features/elabBlocks/` dir, UNSKIP `tests/e2e/08-blockly-v3-cap6-esp4-full-cycle.spec.js` (remove `.skip` once Impl-A-2 + Impl-B-2 land deps) | ZERO `src/` edit |

### Revert-protected (READ-ONLY for ALL implementers — engine integrity)

- `src/components/simulator/engine/CircuitSolver.js`
- `src/components/simulator/engine/AVRBridge.js`
- `src/components/simulator/engine/PlacementEngine.js`
- `src/components/simulator/canvas/SimulatorCanvas.jsx` (useCircuitHandlers)
- `src/components/simulator/components/Battery9V.jsx`
- `src/services/intelHexValidator.js` (Phase 1 pilot atom — preserved)
- `src/components/simulator/canvas/ScratchCompileBar.jsx` (iter 74 cliffhanger wire)
- `src/components/simulator/NewElabSimulator.jsx` (iter 75 ScratchCompileBar wire)
- `src/data/experiment-visibility.js` (8-esp whitelist)
- `src/features/elabArduinoAst/**` (Wave 2 deferred)

### Hard discipline rules

- **NO `--no-verify`** on commit. Pre-commit hook ABSENT in worktree, but policy discipline mandatory (Wave 1 acknowledged violation).
- **NO `git add -A`** — explicit `git add <file>` only (ownership protection).
- **NO commit cross-owner file** — `git diff --cached --stat` MUST show ONLY owned files pre-commit.
- **NO module top-level side effects** in JSX (Wave 1 lesson: `applyItalianMessages` at module top broke vitest mocks → moved into `useEffect`).
- **NO auto-add visibility ID** to `VISIBLE_EXP_IDS` without Andrea explicit OK.
- **TDD red-green-refactor mandatory**: write failing test FIRST, then minimal impl to pass, then refactor.
- **CoV 3× pre-commit per atom**: run `npx vitest run <owned-files-glob>` 3× IDENTICAL pre-commit.
- **Anti-regression floor**: global `npx vitest run` MUST stay at baseline `3 failed | 422 passed | 2 skipped (427)` — 9 fails ALL pre-existing UnlimCompileHelper/HomeCompileEntry-tabs. ZERO new fails permitted.
- **Build gate**: `npm run build` exit 0 MUST hold pre-commit.
- Commit format: `tipo(area): descrizione — Wave 1b Impl-X-2` + Co-Authored-By Claude Opus 4.7.
- Caveman mode chat. Code/commits/PRs/PR-body: write normal.

### Evidence format per atom (mandatory pre-commit)

```
BEFORE:
- file content snippet (first 20 lines)
- git diff --stat clean

CHANGE:
- git diff --stat HEAD (LOC delta numeric)

AFTER:
- vitest run scoped output (test count delta ≥ 0)
- CoV 3× IDENTICAL output for atom-scoped test
- global vitest baseline preserved 422 PASS

BUILD:
- npm run build exit 0

OWNERSHIP CHECK:
- git diff --cached --stat shows ONLY owned files
```

### Coordination point Impl-B ↔ Impl-G

- Impl-G writes `codeSync.roundtrip.test.js` (contract test ≥ 20 test cases) FIRST — these go RED initially.
- Impl-B implements `codeSync.js` expansion to pass Impl-G's contract.
- Impl-G also has internal tests (E2E, perf bench) independent of Impl-B.
- Sync via TaskList: Impl-G creates task "Impl-B contract test ready" with description listing test cases; Impl-B references it when implementing.
- DO NOT block: if codeSync.roundtrip.test.js red >2h, Impl-B writes minimal stub to unblock + Impl-G iterates contract test.

---

## Scope Impl-A-Toolbox-IT-2 (extend Wave 1 Impl-A — 12c49be6 + 62bd32ae)

**Owned files** (above).

**Tasks** (Sez 1 + Sez 11):

1. Audit IT completeness in toolbox + scratchBlocks (16 categories: SETUP / Pin digitali / Pin analogici / Loop / Math / Logica / Variabili / Funzioni / Serial / Sensori / Attuatori / Tempo / Stringhe / RGB LED / Servo / Buzzer). Identify EN leftover, translate IT VERBATIM (Vol/pag language).
2. Extend `blockly-msg-it.js`: add 30+ remaining Blockly default msg keys: `SETUP_FUNCTION_TIP`, `LOOP_TIP`, all category labels, `VARIABLES_*`, `PROCEDURES_*`, etc.
3. Add search box in toolbox UI (input top, filter visible per block name). Component location TBD audit; may need extend ScratchEditor.
4. Add toolbox collapse/expand toggle btn per category.
5. Welcome empty state copy IT plurale: "Trascina blocco SETUP per iniziare ragazzi" (or volume-canonical phrasing).

**Tests**:
- Extend `tests/unit/i18n/blockly-msg-it.test.js` — verify all new 30+ keys present + IT values exact.
- NEW `tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js` — snapshot toolbox XML output + IT category labels assertions.

**Estimate**: 3-5h.

---

## Scope Impl-B-Codegen-CodeSync-2 (extend Wave 1 Impl-B — 0c3e48e3)

**Owned files** (above).

**Tasks** (Sez 2 + Sez 3):

1. `#include` auto-injection in `scratchGenerator.js`: detect block usage → emit `#include`. Mapping: Servo block → `#include <Servo.h>`; LCD → `#include <LiquidCrystal.h>`; SoftwareSerial → `#include <SoftwareSerial.h>`; Wire/I2C → `#include <Wire.h>`.
2. Variable declarations top-of-file: collect `int ledN = pin;` from variables, emit BEFORE `setup()`.
3. AST parse C++ tolerant in `codeSync.js`: error recovery on malformed syntax, emit TODO Blockly placeholder block + console.warn IT.
4. Preserve original comments roundtrip C++ → Blockly → C++ in `codeSync.js`.
5. Handle `#define` macros: display as const var Blockly block.
6. Multi-function support beyond setup/loop: user-defined `void foo() { ... }` → Blockly `procedures_defnoreturn` block.
7. Error messages localizzati IT su parse fail: `"Errore di sintassi alla riga X: ..."` (NOT English).
8. Extend `starterTemplates.js` with templates for: blink (existing), servo-sweep, lcd-hello, button-led, serial-echo (5+ templates total).

**Tests**:
- Extend `scratchGenerator.pinMode.test.js` — add #include auto-emit cases + var decls top assertions.
- Impl-G's `codeSync.roundtrip.test.js` is contract test for Impl-B (≥ 20 case: blink/servo/lcd/button/serial/comments-preserved/multi-fn/define/ifdef/error-recovery).

**Estimate**: 5-7h (scope-risk highest atom — keep `elabArduinoAst` UNTOUCHED).

---

## Scope Impl-C-Compile-2 (extend Wave 1 Impl-C — ef50e968)

**Owned files** (above).

**Tasks** (Sez 4):

1. RAM usage report in `compiler.js`: parse arduino-cli stdout for `"RAM: X% (used Y bytes of Z)"` → expose via compile result `{ ram: { used, total, percent } }`.
2. Size warning UI hook: `> 28KB ATmega328p` OR `> 90% Nano R4 256KB` → set warn flag in compile result `{ warn: ['size-near-limit', 'ram-near-limit'] }`. UI render is consumer's concern (Wave 2).
3. Compile counter telemetry session: number compilazioni, success rate, avg latency, persist Supabase via existing edge function pattern (read `src/services/api.js` for pattern reference — DO NOT edit api.js).
4. Wire `intelHexValidator` on remote n8n response in `compiler.js` (currently only precompiled HEX path validated per line 13 + 363; extend to remote response validation).

**Tests**:
- Extend `compiler.test.js` — RAM parse + size warn + telemetry counter assertions.
- Extend `compileCache.lru.test.js` — telemetry counter hook verification.

**Estimate**: 3-4h.

---

## Scope Impl-G-Tests-2 (extend Wave 1 Impl-G — b1e19e14)

**Owned files** (above).

**Tasks** (Sez 18):

1. NEW `tests/e2e/09-blockly-v3-cap6-esp5-full-cycle.spec.js` — semaforo full cycle: Blockly drag → compile → upload AVR8js → 3 LED red/yellow/green sequence verified pin states.
2. NEW `tests/e2e/10-homepage-codekit-drag-compile-sim.spec.js` — HomePage Codekit (`#compile-home`): drag block → compile → sim pin states verified.
3. UNSKIP `tests/e2e/08-blockly-v3-cap6-esp4-full-cycle.spec.js` — remove `.skip()` markers + implement real assertions (3 tests currently skipped).
4. Compile latency regression script `scripts/bench/blockly-compile-latency.mjs` — p95 < 5s asserted on 20 sample compiles.
5. NEW `tests/unit/features/elabBlocks/codeSync.roundtrip.test.js` (contract for Impl-B) — ≥ 20 cases: blink roundtrip / servo-sweep / lcd-hello / button-led / serial-echo / comments-preserve (3 cases inline + block) / multi-fn (2 cases) / define (3 cases) / ifdef stub / error-recovery TODO placeholder / IT error msg verify.
6. NEW `tests/unit/features/elabBlocks/` directory with `README.md` describing test conventions.

**Tests**: ALL above ARE the tests.

**Estimate**: 4-6h.

---

## Wave 1b CLOSE criteria (after all 4 atom shipped)

- [ ] 4 atom commit landed in worktree branch `feature/blockly-crosscompiler-definitivo`
- [ ] Global vitest CoV 3× IDENTICAL: baseline `3 failed | 422 passed + N new` (no fail delta)
- [ ] `npm run build` exit 0 × 2 consecutive
- [ ] E2E `08-blockly-v3-cap6-esp4` UNSKIPPED + PASS (or skip with `test.fixme()` if upstream wait)
- [ ] E2E `09-blockly-v3-cap6-esp5` PASS (or stub + fixme)
- [ ] E2E `10-homepage-codekit` PASS (or stub + fixme)
- [ ] Compile latency p95 < 5s asserted in perf script
- [ ] Codesync `codeSync.roundtrip.test.js` ≥ 60% coverage on `codeSync.js`
- [ ] `docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md` Sez 1, 2, 3, 4, 11, 18 further-DONE marked
- [ ] `docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md` Iter X.2b row CLOSED
- [ ] Memory project file `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/blockly-crosscompiler-definitivo-phase0.md` updated with Wave 1b commit list
- [ ] PR #167 update + push (R8 PR per-iter ratified)

## Anti-pattern red flags (STOP immediately)

- Implementing single-agent — STOP, 4 parallel mandatory.
- Skip TDD "per velocità" — STOP, test first sempre.
- Edit revert-protected file — STOP, branch `authorized-engine-change` required.
- Touch `elabArduinoAst/` — STOP, Wave 2 deferred explicit.
- Hide pre-existing test fail — STOP, indaga delta CoV 3× → commit ONLY flake noted.
- One implementer writes another's owned file — REJECT commit + revert (Wave 1 Impl-A precedent).
- Top-level side effects in JSX modules — STOP, vitest mocks break (Wave 1 lesson).
- Cliffhanger "fix" — NO, already wired iter 74+75.

---

**Self-recovery protocol**: if you detect ownership violation in your own diff, immediately `git reset --soft HEAD` + `git restore --staged <other-owner-files>` + recommit clean owned-only. Document in commit body. NO `--no-verify`.

**Coordination**: use `TaskUpdate` + `SendMessage` to peer implementers. Lead synthesis post all 4 commit.
