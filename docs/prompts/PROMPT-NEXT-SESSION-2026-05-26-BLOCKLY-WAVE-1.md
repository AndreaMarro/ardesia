# /goal — BLOCKLY CROSS-COMPILER WAVE 1 DISPATCH (Iter X.2)

> **Context inheritance**: questo prompt continua [PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md](./PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md) iter X.1.x → X.2. Phase 0 + 3 atom shipped. Wave 1 = 4 implementer parallel disjoint file ownership.

---

## STATO EREDITATO (read before start)

### Worktree
- `PRODOTTO/elab-builder-blockly-definitivo/` branch `feature/blockly-crosscompiler-definitivo` da `origin/main 9c473f58`
- 3 commit landed worktree:
  - `1ad9d13f` pilot intelHexValidator (160 LOC + 19 test)
  - `2e6b7cf3` consumer wire compiler.js fetchHexFile (+5 test, 139/139 CoV 3×)
  - `97e8a295` C4 architecture doc 238 LOC

### Documenti spec + plan + arch
- Spec living: `docs/prompts/PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md` (~440 righe, Sez 4 item 6 + Sez 20 item 3 marked DONE)
- Plan Phase 0: `docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md` (372 righe — audit + risk register + iter breakdown)
- Architecture C4: `docs/architectures/blockly-arduino-cross-compiler.md` (238 righe — 3 livelli + decision log + anti-pattern)
- Memory project: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/blockly-crosscompiler-definitivo-phase0.md`

### Finding strategico chiave
>70% infra cross-compiler già esiste. "Definitivo" = integration+polish+WCAG+UNLIM-wire pass NON build-from-scratch:
- Editor Blockly: ScratchEditor 626 + scratchGenerator 497 + scratchBlocks 414 + scratchToolboxProgressive 91 + scratch-xml-templates 390 = **2722 righe**
- Compile UI: HomeCompileEntry 525 + UnlimCompileHelper 152 + CompileAgentBanner 281 + ScratchCompileBar 293 + CompileUploadButton 1239 = **2490 righe**
- Compiler Service: compiler.js 359 + intelHexValidator.js 160 NEW = **519 righe**
- Engine AVR: AVRBridge.js 1242 🔒 revert-protected
- AST + sync: codeSync.js 141 + elabArduinoAst/* 591 = **732 righe**
- Cliffhanger CTA: already wired iter 74 (ScratchCompileBar) + iter 75 (NewElabSimulator) + 394 LOC test
- 4 E2E spec: 05-cross-compile-mock-board, 06-blockly-first-block-60s, 07-blockly-accessibility, cross-compile-upload-e2e

---

## 4 DECISIONI ANDREA REQUIRED PRIMA START

⚠️ **Sessione blocca se non ratificate** (R1 critica):

1. **R1 — Strategia upload USB Arduino fisico** (Sez 6):
   - **opzione A**: ELAB Agent localhost:8765 primary + Web Serial nuovo come fallback (default plan doc — safer, no breaking)
   - **opzione B**: Web Serial diretto browser (no ELAB Agent dipendenza) — più portabile ma richiede dev arduino-cli wrap browser-side
   - **opzione C**: ELAB Agent only, no Web Serial (deferred indefinitely)
   - **Default se silenzio**: A

2. **R8 — Strategia PR**:
   - PR per-iter (8-10 totali, granular reviewable)
   - **Default se silenzio**: PR per-iter

3. **Branch policy**: worktree `elab-builder-blockly-definitivo` confermato OK?
   - **Default se silenzio**: continua corrente

4. **Wave 1 dispatch green-light**: spawn `agent-teams:team-lead` con plan doc + ownership matrix come input?
   - **Default se silenzio**: dispatch

---

## PLUGIN MANDATORY (ordine esecuzione Wave 1)

1. **superpowers:using-superpowers** — establishes how to find/use skills (auto-load each turn)
2. **claude-mem:mem-search** — verifica eredità prev session (search "blockly crosscompiler", "intelHexValidator", "fetchHexFile", "iter X.1")
3. **superpowers:executing-plans** — esegui plan doc `2026-05-25-blockly-crosscompiler-definitivo.md` Iter X.2 Wave 1
4. **agent-teams:team-lead** — decompose Wave 1 in 4 task atomic file ownership
5. **agent-teams:team-implementer × 4** — parallel impl Wave 1:
   - Impl-A-Toolbox-IT
   - Impl-B-Codegen-CodeSync
   - Impl-C-Compile
   - Impl-G-Tests
6. **superpowers:test-driven-development** — TDD red-green ogni atom
7. **superpowers:dispatching-parallel-agents** — Wave 1 batched single-message
8. **superpowers:verification-before-completion** — claim-verify pre-commit ogni atom
9. **elab-quality-gate** — pre-commit ogni atom + Wave 1 close

## SCOPE WAVE 1 — 4 IMPL DISJOINT

### Impl-A-Toolbox-IT
**Owner exclusive files**:
- `src/components/simulator/panels/scratchToolboxProgressive.js` (extend 91 → completeness audit)
- `src/components/simulator/panels/scratchBlocks.js` (extend 414 → category coverage)
- NEW `src/i18n/blockly-msg-it.js` (Blockly.Msg.* override IT completo)

**Tasks** (Sez 1 + Sez 11):
- Audit toolbox IT completeness: SETUP / Pin digitali / Pin analogici / Loop / Math / Logica / Variabili / Funzioni / Comunicazione Serial / Sensori / Attuatori / Tempo / Stringhe / RGB LED / Servo / Buzzer
- Identifica EN leftover, traduci IT VERBATIM (Vol/pag stesse parole)
- Aggiungi `Blockly.Msg.SETUP_FUNCTION = "Avvio"` etc. — coverage tutti msg
- Search box toolbox (input top, filter visibile per nome block)
- Toolbox collapse/expand toggle btn
- Welcome empty state copy IT plurale "Trascina blocco SETUP per iniziare ragazzi"

**Test**: `tests/unit/components/simulator/panels/scratchToolboxProgressive.test.js` + snapshot toolbox XML.

**Stima**: 4-6h.

### Impl-B-Codegen-CodeSync
**Owner exclusive files**:
- `src/components/simulator/panels/scratchGenerator.js` (extend 497 — pinMode auto + #include auto + variable decls top)
- `src/features/elabBlocks/codeSync.js` (extend 141 — tolerant parser + comment preserve + #define/#ifdef)
- `src/features/elabArduinoAst/generators/*.ts` (extend 591)

**Tasks** (Sez 2 + Sez 3):
- pinMode auto-inserted setup() based on usage (LED → pinMode OUTPUT, button → pinMode INPUT)
- `#include` auto su block specifico (Servo.h se block Servo, LiquidCrystal.h se LCD)
- Variable declarations top-of-file `int led1 = 13;` invece inline
- AST parse C++ con error recovery (tolerant parser)
- Unknown C++ construct → "TODO" Blockly block placeholder (no perdita codice)
- Preserve original comments through roundtrip
- Handle `#define` macros (display in Blockly come var const)
- Multi-function support (non solo setup/loop)
- Error messages localizzati IT su parse fail

**Test**: `tests/unit/features/elabBlocks/codeSync.roundtrip.test.js` ≥ 30 test per block type + snapshot block→C++ + C++→XML.

**Stima**: 6-8h (più rischio scope creep — limita a 5 costrutti specifici).

### Impl-C-Compile
**Owner exclusive files**:
- `src/services/compiler.js` (extend 359 — retry exponential + RAM report + cache LRU 20)
- `src/components/simulator/utils/compileCache.js` (extend — LRU 20 entries)

**Tasks** (Sez 4):
- Timeout 30s + retry 1× exponential backoff (replace current 5s flat)
- RAM usage report (parse arduino-cli stdout per RAM%)
- Size warning UI > 28KB (ATmega328p) o > 90% Nano R4 256KB
- Compile cache LRU 20 entries (current Map illimitato)
- Compile counter telemetry (number compilazioni per session, success/fail ratio)
- Wire intelHexValidator anche su remote response (non solo precompiled) — extends iter X.1.6

**Test**: `tests/unit/services/compiler.test.js` (extend 25 attuali) + nuovo `compileCache.test.js` LRU eviction.

**Stima**: 3-4h.

### Impl-G-Tests
**Owner exclusive files**:
- `tests/unit/features/elabBlocks/*` (NEW dir)
- `tests/unit/services/compiler-lru.test.js` (NEW)
- `tests/e2e/08-blockly-v3-cap6-esp4-full-cycle.spec.js` (NEW)
- `tests/e2e/09-blockly-v3-cap6-esp5-full-cycle.spec.js` (NEW)
- `tests/e2e/10-homepage-codekit-drag-compile-sim.spec.js` (NEW)

**Tasks** (Sez 18):
- E2E v3-cap6-esp4 (Due LED sirena pin 6+9) full ciclo: Blockly drag → compile → upload AVR8js → pin states correct (D6=HIGH alternato D9=HIGH)
- E2E v3-cap6-esp5 (semaforo) full ciclo: stessa pipeline + 3 LED red/yellow/green sequence
- E2E HomePage Codekit (`#compile-home`): drag block → compile → sim pin states
- Compile latency regression < 5s p95 (perf bench)
- CoV protocol script `scripts/cov-blockly.sh` (3× vitest blockly tests, abort if non-identical)

**Stima**: 4-6h.

---

## FILE OWNERSHIP MATRIX (LOCK pre-Wave 1)

Hard rule: **un impl tocca SOLO i suoi file**. Coordination point = integration phase post-Wave 1.

| Agent | Files exclusive | NO touch |
|-------|-----------------|----------|
| Impl-A-Toolbox-IT | scratchToolboxProgressive.js + scratchBlocks.js + blockly-msg-it.js NEW + scratchToolboxProgressive.test.js | scratchGenerator.js (Impl-B) |
| Impl-B-Codegen-CodeSync | scratchGenerator.js + codeSync.js + elabArduinoAst/* + codeSync.roundtrip.test.js | scratchToolboxProgressive.js (Impl-A) |
| Impl-C-Compile | compiler.js + compileCache.js + compiler.test.js (extend) + compileCache.test.js NEW | intelHexValidator.js (revert-protected post-pilot) |
| Impl-G-Tests | tests/unit/features/elabBlocks/ + 3 nuovi E2E spec | NO src/ edit |

**Revert-protected (READ-ONLY tutti agent)**:
- CircuitSolver.js / AVRBridge.js / PlacementEngine.js / useCircuitHandlers.js / Battery9V.jsx
- intelHexValidator.js (pilot Sez 4+20 chiusa)
- ScratchCompileBar.jsx (cliffhanger wire iter 74 closed)
- NewElabSimulator.jsx ScratchCompileBar wire (iter 75 closed)
- experiment-visibility.js 8-esp whitelist

---

## EVIDENCE FORMAT ogni atom

- **BEFORE**: file content snippet (cat target sections) + git diff --stat clean
- **CHANGE**: git diff --stat HEAD post-edit (LOC delta numerico)
- **AFTER**: vitest run output con test count delta ≥ 0 + CoV 3× IDENTICAL output
- **Anti-regression**: `npx vitest run` global non scende baseline (current 14551)
- **Build**: `npm run build` exit 0
- **Format**: caveman ack su chat + report tecnico

## REGOLE FERREE (no compromise)

- NO `--no-verify` su commit (sessione 2026-05-25 acknowledged violation; pre-commit hook assente ma policy discipline mandatory)
- NO toccare engine files revert-protected senza branch `authorized-engine-change`
- NO auto-add ID a `VISIBLE_EXP_IDS` senza Andrea OK esplicito
- NO inflazione score self-rated — `node scripts/benchmark.cjs --write` unica fonte
- NO commit incrociati file owner altrui (break ownership = REGRESSION)
- NO `git add -A` — esplicito `git add <file>`
- Pre-commit hook attualmente ASSENTE ma policy discipline applies anyway
- Caveman mode chat. Code/commits/PRs normal.
- Commit format: `tipo(area): descrizione` + Co-Authored-By

## SUCCESS CRITERIA WAVE 1 CLOSE

- [ ] 4 atom shipped (Impl-A + B + C + G) con commit individuali
- [ ] CoV 3× IDENTICAL output su global vitest
- [ ] `npm run build` exit 0 × 2 consecutive
- [ ] Baseline test count ≥ 14551 (no regression)
- [ ] E2E v3-cap6-esp4 + v3-cap6-esp5 PASS
- [ ] Compile latency < 5s p95
- [ ] Coverage codeSync.js ≥ 60% (target ≥80% iter X.4)
- [ ] PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md tracking checkboxes refresh (Sez 1, 2, 3, 4, 11, 18 items marked)
- [ ] Plan doc iter X.2 marked DONE
- [ ] Memory project file update con commits worktree

## ANTI-PATTERN STOP (red flags)

- Implementare TUTTO single-agent → STOP, 4 parallel mandatory
- Skip TDD "per velocità" → NO, test first sempre
- Edit revert-protected file → STOP, branch authorized-engine-change required
- Pre-existing test fail nascosto → NO, indaga delta CoV 3× → committi solo flake noted
- 1 impl scrive file altro impl → BREAK ownership = reject commit + revert
- Cliffhanger CTA "fix" — NO, già wired iter 74+75 (CLAUDE.md NARRATIVE ARC gap list STALE)

---

## NEXT IMMEDIATE ACTION

1. Andrea ratify 4 decisioni (R1 + R8 + branch + dispatch) — silenzio = default applies
2. `claude-mem:mem-search "blockly crosscompiler iter X"` per recupero context cross-session
3. `cd PRODOTTO/elab-builder-blockly-definitivo && git status && git log --oneline -5` verify worktree state
4. Spawn `agent-teams:team-lead` con prompt: "Iter X.2 Wave 1 dispatch — 4 impl parallel per file ownership matrix. Input: docs/plans/2026-05-25-blockly-crosscompiler-definitivo.md + docs/architectures/blockly-arduino-cross-compiler.md. Hard rule: ownership matrix immutable in-iter."
5. Monitor wave progress, integrate at end, CoV 3× + build verify
6. Update PROMPT-CROSSCOMPILATORE-BLOCKLY-DEFINITIVO.md tracking + memory + commit

---

**FINE PROMPT.** Wave 1 expected output: 4 commit atomic + 1 integration commit + tracking docs refresh. Stima sessione 8-12h con team-lead orchestration. Iter X.3 Wave 2 (UNLIM-HomePage + UNLIM-Vol3 + Upload-WebSerial + A11y-Polish) successiva sessione.
