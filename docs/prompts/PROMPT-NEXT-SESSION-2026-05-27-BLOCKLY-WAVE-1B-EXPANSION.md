# /goal — BLOCKLY CROSS-COMPILER WAVE 1b EXPANSION (Iter X.2b)

> **Context inheritance**: this prompt continues [PROMPT-NEXT-SESSION-2026-05-26-BLOCKLY-WAVE-1.md](./PROMPT-NEXT-SESSION-2026-05-26-BLOCKLY-WAVE-1.md) iter X.2 → X.2b. Wave 1 first-slice CLOSED 2026-05-25 (6 atomic commits + tracking refresh). Wave 1b = complete each Impl atom (scope CAP applied last session shipped surgical, now expand).

---

## STATO EREDITATO (read before start)

### Worktree
- `PRODOTTO/elab-builder-blockly-definitivo/` branch `feature/blockly-crosscompiler-definitivo`
- 13 commit landed worktree (3 Phase 0 + 4 doc cherry-picks + 4 Wave 1 atom + 1 fix + 1 tracking)
- Branch ahead of `origin/main 9c473f58` by 13 commits

### Wave 1 first-slice DONE 2026-05-25
| SHA | Atom | Files | LOC | Tests |
|-----|------|-------|-----|-------|
| `0c3e48e3` | Impl-B scratchGenerator pinMode auto-emit setup() | scratchGenerator.js + .pinMode.test.js | +205/-1 | +5 |
| `ef50e968` | Impl-C compileCache LRU 20 + n8n retry [1s,2s] 5xx-only | compileCache.js + compiler.js + tests | +356/-33 | +10 |
| `b1e19e14` | Impl-G cov-blockly.sh + 08-spec.js E2E skeleton | scripts/ + tests/e2e/ | +73 | 3 skipped |
| `12c49be6` | Impl-A 15 IT Blockly.Msg + ScratchEditor wire | blockly-msg-it.js + ScratchEditor.jsx + test | +277 | +21 |
| `62bd32ae` | Fix regression ScratchEditor-callbacks (useEffect + try/catch) | ScratchEditor.jsx + blockly-msg-it.js | +19/-9 | +3 unblocked |
| `85a349b7` | Tracking docs refresh PROMPT + plan | docs/prompts/ + docs/plans/ | +37/-11 | 0 |

### Verification close gate PASSED 2026-05-25
- CoV 3× IDENTICAL `Test Files 3 failed | 422 passed | 2 skipped (427)` — 9 fails ALL pre-existing UnlimCompileHelper/HomeCompileEntry-tabs baseline, ZERO Wave 1 contribution
- `npm run build` exit 0 (50s, PWA 27 entries 2076.13 KiB)
- intelHexValidator wiring preserved (compiler.js line 13 + 363)
- File ownership matrix immutable respected (Impl-A self-recovered initial sweep violation)

### Documenti reference (in worktree)
- Spec living: `docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md` (443 righe, Iter X.2 marked CLOSED)
- Plan Phase 0: `docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md` (refreshed Iter X.2 close table + X.2b row)
- Architecture C4: `docs/architectures/blockly-arduino-cross-compiler.md` (238 righe)
- Memory project: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/blockly-crosscompiler-definitivo-phase0.md`

### Andrea decisioni Wave 1 RATIFIED default-silenzio (carry forward)
- R1: ELAB Agent localhost:8765 primary + Web Serial fallback (opzione A)
- R8: PR per-iter (8-10 totali, granular reviewable)
- Branch policy: continua `feature/blockly-crosscompiler-definitivo`
- Wave 1 dispatch: completed via agent-teams:team-lead + 4 implementer parallel

---

## 4 DECISIONI ANDREA REQUIRED PRIMA START WAVE 1b

⚠️ **Sessione blocca se non ratificate** (silenzio = default):

1. **PR push Wave 1?** push branch + `gh pr create` PR Wave 1 ship before X.2b expansion? (R8 ratified → expect YES)
   - **Default se silenzio**: PUSH + PR open per R8
2. **Wave 1b scope priority**: expand all 4 atom in single Wave 1b OR ship one atom per atomic PR?
   - **Default se silenzio**: 4 atom parallel Wave 1b dispatch (same team-lead pattern)
3. **elabArduinoAst Wave 2 split**: keep deferred OR start exploratory atom this iter (read-only audit no edits)?
   - **Default se silenzio**: deferred Wave 2 (1185 LOC actual scope risk)
4. **Wave 2 X.3 timing**: after Wave 1b complete OR interleave Impl-D Upload-WebSerial parallel?
   - **Default se silenzio**: Wave 1b complete first, then X.3 Wave 2

---

## PLUGIN MANDATORY (ordine esecuzione Wave 1b)

1. **superpowers:using-superpowers** — establishes how to find/use skills (auto-load each turn)
2. **claude-mem:mem-search** — verifica eredità prev session (search "blockly wave 1 close", "Impl-A regression fix", "iter X.2")
3. **superpowers:executing-plans** — esegui plan doc `2026-05-25-blockly-crosscompiler-definitivo.md` Iter X.2b row
4. **agent-teams:team-lead** — decompose Wave 1b in 4 task atomic file ownership (same matrix as Wave 1)
5. **agent-teams:team-implementer × 4** — parallel impl Wave 1b:
   - Impl-A-Toolbox-IT-2 (search box + collapse btn + welcome state + 30+ msg keys)
   - Impl-B-Codegen-CodeSync-2 (codeSync tolerant parser + #define + multi-function + starterTemplates)
   - Impl-C-Compile-2 (RAM report + size warn + telemetry + intelHexValidator on remote)
   - Impl-G-Tests-2 (v3-cap6-esp5 E2E + HomePage Codekit E2E + tests/unit/features/elabBlocks/ unit dir)
6. **superpowers:test-driven-development** — TDD red-green ogni atom
7. **superpowers:dispatching-parallel-agents** — Wave 1b batched single-message
8. **superpowers:verification-before-completion** — claim-verify pre-commit ogni atom
9. **elab-quality-gate** — pre-commit ogni atom + Wave 1b close

## SCOPE WAVE 1b — 4 IMPL EXPANSION

### Impl-A-Toolbox-IT-2
**Owner exclusive files** (extends Wave 1 Impl-A):
- `src/components/simulator/panels/scratchToolboxProgressive.js` (91 → expand audit IT completeness all categories)
- `src/components/simulator/panels/scratchBlocks.js` (414 → category coverage Servo / Buzzer / RGB / Sensori)
- `src/i18n/blockly-msg-it.js` (extend 100 → add 30+ remaining msg keys: SETUP_FUNCTION_TIP, LOOP_TIP, all category labels)

**Tasks** (Sez 1 + Sez 11):
- Audit toolbox IT completeness: SETUP / Pin digitali / Pin analogici / Loop / Math / Logica / Variabili / Funzioni / Serial / Sensori / Attuatori / Tempo / Stringhe / RGB LED / Servo / Buzzer
- Identifica EN leftover, traduci IT VERBATIM (Vol/pag stesse parole)
- Aggiungi 30+ Blockly.Msg.* per coverage tutti msg + tooltips
- Search box toolbox (input top, filter visibile per nome block)
- Toolbox collapse/expand toggle btn (per-category)
- Welcome empty state copy IT plurale "Trascina blocco SETUP per iniziare ragazzi"

**Test**: extend `tests/unit/i18n/blockly-msg-it.test.js` + NEW `tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js` (snapshot toolbox XML + IT labels)

**Stima**: 3-5h.

### Impl-B-Codegen-CodeSync-2
**Owner exclusive files** (extends Wave 1 Impl-B):
- `src/components/simulator/panels/scratchGenerator.js` (497+50 → add #include auto-injection + variable decls top-of-file)
- `src/features/elabBlocks/codeSync.js` (38 → tolerant parser + comment preserve + #define/#ifdef)
- `src/features/elabBlocks/starterTemplates.js` (extend templates)

**Tasks** (Sez 2 + Sez 3):
- `#include` auto-injection: block Servo → `#include <Servo.h>`; LCD → `#include <LiquidCrystal.h>`
- Variable declarations top-of-file: collect `int ledN = pin` from variables, emit before setup()
- AST parse C++ tolerant: error recovery on malformed syntax, emit TODO Blockly placeholder
- Preserve original comments roundtrip C++ → Blockly → C++
- Handle `#define` macros: display as const var Blockly
- Multi-function support beyond setup/loop (user-defined `void foo() {...}` → Blockly procedures_def)
- Error messages localizzati IT su parse fail

**Test**: extend `scratchGenerator.pinMode.test.js` + NEW `codeSync.roundtrip.test.js` ≥ 20 test per block type

**Stima**: 5-7h (still scope-risky — keep elabArduinoAst untouched, Wave 2 deferred).

**STILL DEFERRED Wave 2**: `src/features/elabArduinoAst/*` (1185 LOC, refactor cascade risk).

### Impl-C-Compile-2
**Owner exclusive files** (extends Wave 1 Impl-C):
- `src/services/compiler.js` (373+30 → RAM report + size warn + telemetry + intelHexValidator on remote)
- `src/components/simulator/utils/compileCache.js` (94+83 → telemetry counter integration)

**Tasks** (Sez 4):
- RAM usage report: parse arduino-cli stdout for "RAM:X% (used Y bytes of Z)" → expose to UI
- Size warning UI: > 28KB ATmega328p OR > 90% Nano R4 256KB → warn banner
- Compile counter telemetry session: number compilazioni / success rate / avg latency, persist Supabase
- Wire intelHexValidator on remote n8n response (currently only precompiled HEX path validated)

**Test**: extend `compiler.test.js` + `compileCache.lru.test.js`

**Stima**: 3-4h.

### Impl-G-Tests-2
**Owner exclusive files** (NEW + extends Wave 1 Impl-G):
- `tests/e2e/09-blockly-v3-cap6-esp5-full-cycle.spec.js` (NEW)
- `tests/e2e/10-homepage-codekit-drag-compile-sim.spec.js` (NEW)
- `tests/unit/features/elabBlocks/codeSync.roundtrip.test.js` (NEW — Impl-B-2 contract test)
- `tests/unit/features/elabBlocks/` (NEW dir)
- UNSKIP `tests/e2e/08-blockly-v3-cap6-esp4-full-cycle.spec.js` (remove `.skip` once Impl-A-2 + Impl-B-2 land their dependencies)

**Tasks** (Sez 18):
- E2E v3-cap6-esp5 semaforo full ciclo: Blockly drag → compile → upload AVR8js → 3 LED red/yellow/green sequence
- E2E HomePage Codekit (`#compile-home`): drag block → compile → sim pin states
- UNSKIP 08-spec.js stub tests + implement real assertions (3 tests)
- Compile latency regression < 5s p95 (perf bench script)
- tests/unit/features/elabBlocks/ unit dir with codeSync roundtrip ≥ 20 test

**Stima**: 4-6h.

---

## FILE OWNERSHIP MATRIX (LOCK pre-Wave 1b)

Identical to Wave 1 + scope expansion. Hard rule: **un impl tocca SOLO i suoi file**.

| Agent | Files exclusive | NO touch |
|-------|-----------------|----------|
| Impl-A-Toolbox-IT-2 | scratchToolboxProgressive.js + scratchBlocks.js + blockly-msg-it.js EXTEND + new toolbox test | scratchGenerator.js (Impl-B) |
| Impl-B-Codegen-CodeSync-2 | scratchGenerator.js + codeSync.js + starterTemplates.js + scratchGenerator.pinMode.test.js | scratchToolboxProgressive.js (Impl-A) / elabArduinoAst (Wave 2) |
| Impl-C-Compile-2 | compiler.js + compileCache.js + compiler.test.js EXTEND + compileCache.lru.test.js EXTEND | intelHexValidator.js (revert-protected) / api.js (Wave 2) |
| Impl-G-Tests-2 | tests/unit/features/elabBlocks/ NEW + 2 new E2E spec + UNSKIP 08-spec.js | NO src/ edit |

**Revert-protected (READ-ONLY tutti agent)**:
- CircuitSolver.js / AVRBridge.js / PlacementEngine.js / useCircuitHandlers.js / Battery9V.jsx
- intelHexValidator.js
- ScratchCompileBar.jsx (iter 74 cliffhanger wire closed)
- NewElabSimulator.jsx ScratchCompileBar wire (iter 75 closed)
- experiment-visibility.js 8-esp whitelist
- elabArduinoAst/* (Wave 2 deferred)

---

## EVIDENCE FORMAT ogni atom (same as Wave 1)

- **BEFORE**: file content snippet + git diff --stat clean
- **CHANGE**: git diff --stat HEAD post-edit (LOC delta numerico)
- **AFTER**: vitest run output con test count delta ≥ 0 + CoV 3× IDENTICAL output
- **Anti-regression**: `npx vitest run` global non scende baseline (current 422 PASS + 9 pre-existing FAIL = floor)
- **Build**: `npm run build` exit 0
- **Format**: caveman ack su chat + report tecnico

## REGOLE FERREE (no compromise)

- NO `--no-verify` su commit (sessione 2026-05-25 acknowledged violation; pre-commit hook assente ma policy discipline mandatory)
- NO toccare engine files revert-protected senza branch `authorized-engine-change`
- NO auto-add ID a `VISIBLE_EXP_IDS` senza Andrea OK esplicito
- NO inflazione score self-rated — `node scripts/benchmark.cjs --write` unica fonte
- NO commit incrociati file owner altrui (break ownership = REGRESSION — Wave 1 Impl-A self-recovered, future iter must verify pre-commit `git diff --cached --stat` shows ONLY owned files)
- NO `git add -A` — esplicito `git add <file>`
- NO module-load side effects (Wave 1 fix lesson learned: `applyItalianMessages` at top-level broke vitest mocks → moved into useEffect)
- Pre-commit hook attualmente ASSENTE ma policy discipline applies anyway
- Caveman mode chat. Code/commits/PRs normal.
- Commit format: `tipo(area): descrizione` + Co-Authored-By

## SUCCESS CRITERIA WAVE 1b CLOSE

- [ ] 4 atom shipped (Impl-A-2 + B-2 + C-2 + G-2) con commit individuali
- [ ] CoV 3× IDENTICAL output su global vitest
- [ ] `npm run build` exit 0 × 2 consecutive
- [ ] Test Files baseline ≥ 422 PASS (no regression Wave 1)
- [ ] E2E v3-cap6-esp4 UNSKIPPED + PASS
- [ ] E2E v3-cap6-esp5 PASS
- [ ] E2E HomePage Codekit PASS
- [ ] Compile latency < 5s p95
- [ ] Coverage codeSync.js ≥ 60% (target ≥80% iter X.4)
- [ ] PROMPT-CROSSCOMPILATORE Sez 1, 2, 3, 4, 11, 18 marked further-DONE
- [ ] Plan doc iter X.2b marked CLOSED
- [ ] Memory project file update con Wave 1b commits worktree
- [ ] Push branch + `gh pr create` (if R8 PR per-iter ratified — Andrea push action confirmation)

## ANTI-PATTERN STOP (red flags carry forward)

- Implementare TUTTO single-agent → STOP, 4 parallel mandatory
- Skip TDD "per velocità" → NO, test first sempre
- Edit revert-protected file → STOP, branch authorized-engine-change required
- Touch elabArduinoAst → STOP, Wave 2 deferred explicit
- Pre-existing test fail nascosto → NO, indaga delta CoV 3× → committi solo flake noted
- 1 impl scrive file altro impl → BREAK ownership = reject commit + revert (Wave 1 Impl-A precedent)
- Top-level side effects in JSX modules → STOP, vitest mocks break (Wave 1 lesson)
- Cliffhanger CTA "fix" — NO, già wired iter 74+75 (CLAUDE.md NARRATIVE ARC gap list STALE post iter 72.5 correction)

---

## NEXT IMMEDIATE ACTION (session start)

1. Andrea ratify 4 decisioni Wave 1b (push PR + parallel/serial + AST scope + Wave 2 timing) — silenzio = default applies
2. `claude-mem:mem-search "blockly wave 1 close iter X.2"` per recupero context cross-session (memory file Wave 1 close already written)
3. `cd PRODOTTO/elab-builder-blockly-definitivo && git status && git log --oneline -8` verify worktree state (expect 13 commits over origin/main, branch clean)
4. **If R8 push ratified**: `git push -u origin feature/blockly-crosscompiler-definitivo` + `gh pr create --title "feat(blockly): Wave 1 cross-compiler first slice — 4 atom + fix + tracking" --body "$(cat docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md | head -80)"`
5. Spawn `agent-teams:team-lead` con prompt: "Iter X.2b Wave 1b expansion — 4 impl parallel per same Wave 1 ownership matrix. Input: docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md Iter X.2b row + docs/architectures/blockly-arduino-cross-compiler.md + docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md. Hard rule: ownership matrix immutable + elabArduinoAst still deferred Wave 2."
6. Monitor wave progress, integrate at end, CoV 3× + build verify
7. Update PROMPT-CROSSCOMPILATORE tracking + memory + commit

---

**FINE PROMPT.** Wave 1b expected output: 4 commit atomic + 1 integration commit + tracking docs refresh + (optional) PR push. Stima sessione 6-10h con team-lead orchestration. Iter X.3 Wave 2 (UNLIM-HomePage + UNLIM-Vol3 + Upload-WebSerial + A11y-Polish) sessione successiva.
