# /goal — BLOCKLY CROSS-COMPILER WAVE 2 X.3 + VOL3 BLOCKLY AUDIT (Iter X.3)

> **Context inheritance**: this prompt continues [PROMPT-NEXT-SESSION-2026-05-27-BLOCKLY-WAVE-1B-EXPANSION.md](./PROMPT-NEXT-SESSION-2026-05-27-BLOCKLY-WAVE-1B-EXPANSION.md) iter X.2b → X.3. Wave 1b CLOSED 2026-05-25/26 (11 commit including 2 Codex catches + esp4/esp5 scratchXml fix + Play/Stop/Pause buttons). PR #167 MERGED admin override (CI red iter 102+ pre-existing). www.elabtutor.school live with Wave 1b.

---

## STATO EREDITATO (read before start)

### Branch + worktree
- **Worktree**: `PRODOTTO/elab-builder-blockly-definitivo/` (or create fresh worktree from main if branch deleted)
- **Branch base**: `main` (PR #167 merged commit `11a67cf0d6b58e530d0d6c7a8e3bb0bb62f2e1f8` at 2026-05-25T23:46:07Z)
- **Memory project**: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/blockly-crosscompiler-definitivo-phase0.md`

### Wave 1b CLOSED 2026-05-25/26 — 11 commit shipped + merged

| SHA | Atom | Files | LOC | Note |
|-----|------|-------|-----|------|
| `41582af5` | Impl-A-2 i18n | blockly-msg-it.js + test | +415/-24 | 60+ IT keys |
| `d149bbf1` | Impl-A-2 toolbox | scratchToolboxProgressive + scratchBlocks + test | +492/-16 | canonical 16-cat + RGB block |
| `75244099` | Impl-B-2 codegen | codeSync + starterTemplates + scratchGenerator + 2 test | +967/-8 | tolerant + #define + multi-fn |
| `95222e79` | Impl-G-2 tests | 3 NEW E2E + roundtrip 20-case contract + perf bench + UNSKIP 08 | +1037/-14 | 11 FIXME upstream wait |
| `58ecc5fc` | Impl-C-2 compile | compiler + compileCache + 3 test | +651/-16 | RAM + size warn + telemetry |
| `1cc0146b` | Fix #1 | scratchGenerator + test | +124/-0 | arduino_rgb_led generator (Codex catch) |
| `3f901df3` | Close docs | tracking + plan + brief | +230/-7 | Wave 1b close synthesis |
| `fe1f843b` | Fix #2 | starterTemplates + test | +15/-0 | BUTTON_LED ELSE mutation (Codex catch) |
| `9ca3f98a` | Close addendum | tracking + plan | +8/-4 | Fix #2 docs |
| `685848bc` | esp4+esp5 scratchXml fix | experiments-vol3 + NEW test | +157/-2 | placeholder → real Blockly XML |
| `1aafe0c4` | Play/Stop/Pause | MinimalControlBar + test | +91/-15 | 3-button explicit cluster |

### Verification close gate PASSED
- ✅ Independent CoV 3× IDENTICAL global: `3 failed | 425 passed | 2 skipped (430)`, `9 failed | 16057-16058 passed`
- ✅ Live preview verify: esp4 + esp5 mount OK, Blockly tab renders 3 draggable blocks each, C++ tab matches ESERCIZIO 6.4/6.5, zero console errors
- ✅ npm run build exit 0 × all atoms
- ✅ Branch deploy public URL HTTP 200 (PR #167 Vercel preview)
- ✅ www.elabtutor.school HTTP 200 (post-merge propagation)

### Codex stop-time review findings (Wave 1b)
- Review #1: caught `arduino_rgb_led` missing generator → fix `1cc0146b` ✅
- Review #2: invalid JSON output (review system flake) — non-blocking
- Review #3: caught `BUTTON_LED_XML` ELSE branch drop missing mutation → fix `fe1f843b` ✅
- Lead initial diagnosis: regex `[a-z_]+` missed capital U in `controls_whileUntil` — false-positive included in fix #1 ratify. Lesson: case-insensitive cross-reference grep when auditing generator coverage.

### Andrea ratify Wave 1b carried forward
- R1 ELAB Agent localhost:8765 primary + Web Serial fallback
- R8 PR per-iter (Wave 1b shipped as single PR #167 merged)
- Branch policy: continue worktree pattern
- Stop = halt + reset state semantic (Stop button = Reset rinominato)
- 4 atom parallel team-implementer pattern works

---

## 4 DECISIONI ANDREA REQUIRED PRIMA START X.3

⚠️ **Sessione blocca se non ratificate** (silenzio = default):

1. **Wave 2 X.3 scope**: 4 atom parallel (Impl-D Upload-WebSerial + Impl-E UNLIM-HomePage + Impl-F UNLIM-Vol3 + Impl-H A11y-Polish) OR start con sottoinsieme?
   - **Default se silenzio**: 4 atom parallel same Wave 1b pattern
2. **Vol3 Blockly audit P1**: esp4/esp5 fix landed Wave 1b. Restano 21 esperimenti Vol3 (esp1/2/3 + cap5/7/8) probabilmente con placeholder scratchXml identico. Audit + fix bulk in X.3 OR atom dedicato X.3.5?
   - **Default se silenzio**: atom dedicato X.3.5 dopo X.3 (scope risk: 21 experiments × ~150 LOC each = 3000+ LOC tedious)
3. **Vol1+Vol2 Blockly audit P2**: estendi audit anche a Vol1 (38 esp) + Vol2 (27 esp)?
   - **Default se silenzio**: separato iter X.4 (after Vol3 complete) — Sprint 8+ scope
4. **CI red iter 102+ blocker**: investigate + fix CI red (3 gate: test + E2E + quality-ratchet) prima OR continuare admin-merge?
   - **Default se silenzio**: continua admin-merge per Wave 2 + iter X.6 dedicato CI fix

---

## PLUGIN MANDATORY (ordine esecuzione X.3)

1. **superpowers:using-superpowers** — establishes how to find/use skills (auto-load each turn)
2. **claude-mem:mem-search** — verifica eredità prev session (search "blockly wave 1b close iter X.2b", "esp4 esp5 scratchXml")
3. **superpowers:executing-plans** — esegui plan doc `2026-05-25-blockly-crosscompiler-definitivo.md` Iter X.3 row
4. **agent-teams:team-spawn** — create team "blockly-wave-2" + 4 implementer parallel
5. **superpowers:test-driven-development** — TDD red-green ogni atom
6. **superpowers:dispatching-parallel-agents** — Wave 2 batched single-message
7. **superpowers:verification-before-completion** — claim-verify pre-commit ogni atom
8. **elab-quality-gate** — pre-commit ogni atom + Wave 2 close

## SCOPE WAVE 2 X.3 — 4 IMPL EXPANSION

### Impl-D-Upload-WebSerial
**Owner exclusive files**:
- `src/services/uploadAgent.js` (NEW or extend) — ELAB Agent localhost:8765 primary upload via Web Serial fallback
- `src/components/simulator/canvas/CompileUploadButton.jsx` (1239 LOC) — wire upload flow
- `tests/unit/services/uploadAgent.test.js` (NEW)

**Tasks**:
- ELAB Agent HTTP POST localhost:8765/upload with HEX file body (R1 ratified)
- Fallback Web Serial API (navigator.serial) for browsers without ELAB Agent
- Upload progress events (0-100%)
- Error handling: agent down → Web Serial fallback. Web Serial unsupported → IT error toast
- TDD coverage ≥ 60% on uploadAgent.js

**Stima**: 5-7h.

### Impl-E-UNLIM-HomePage
**Owner exclusive files**:
- `src/components/home/UnlimChatPanel.jsx` (NEW — split from UnlimCompileHelper 152 LOC)
- `src/components/home/UnlimCompileHelper.jsx` (refactor to mini-helper only)
- `tests/unit/components/home/UnlimChatPanel.test.jsx` (NEW)

**Tasks**:
- Split UnlimCompileHelper into 2: `UnlimChatPanel` (floating full chat) + `UnlimCompileHelper` (mini banner)
- Wire RAG Blockly-aware: when user asks about Blockly blocks, retrieve from `rag-chunks.json` + `scratchBlocks.js` registry
- Vision wire: "guarda il mio circuito Blockly" → screenshot Blockly editor → Gemini Vision diagnosis
- IT plurale + Principio Zero + cita Vol/pag verbatim
- Max 120 parole per UNLIM response

**Stima**: 5-7h.

### Impl-F-UNLIM-Vol3
**Owner exclusive files**:
- `src/components/lavagna/PassoPassoUnifiedPanel.jsx` (extend with UNLIM chat wire)
- `src/data/lesson-paths/v3-cap6-esp*.json` (extend ALL Vol3 esp with `unlim_template` Blockly highlight coordinator)
- `src/services/blocklyHighlightBridge.js` (NEW) — coord Blockly block IDs ↔ esp step

**Tasks**:
- Passo Passo UNLIM chat wire (currently regression from iter 36 PM — see feedback_passo_passo_regression_06may2026.md)
- Per Vol3 esp template: define block IDs to highlight per step (e.g. esp4 step "Carica codice" → highlight arduino_pin_mode blocks)
- Bridge between Blockly workspace block.id and UNLIM AZIONE tag `[AZIONE:highlight:block_id]`
- IT verbatim Vol/pag references in passo passo lessons

**Stima**: 4-6h.

### Impl-H-A11y-Polish
**Owner exclusive files**:
- `src/components/simulator/panels/scratchToolboxProgressive.js` (ARIA labels per category)
- `src/components/common/ElabIcons.jsx` (add HammerIcon — referenced in spec, not yet exported)
- `tests/e2e/11-blockly-axe-core-accessibility.spec.js` (NEW E2E)
- `tests/unit/components/common/ElabIcons.test.jsx` (extend)

**Tasks**:
- ARIA sweep Blockly toolbox: aria-label per category + aria-expanded for collapsible
- Focus ring visible all Blockly buttons (currently default Blockly styling — override)
- WCAG AA contrast audit on canonical 16-cat colors (Sez 1 line 88) — some colors may fail
- ElabIcons.HammerIcon (referenced by spec Sez 21 estetica)
- E2E axe-core 0 violations on Blockly mode

**Stima**: 3-5h.

---

## FILE OWNERSHIP MATRIX (LOCK pre-Wave 2)

Identical to Wave 1+1b. Hard rule: **un impl tocca SOLO i suoi file**.

| Agent | Files exclusive | NO touch |
|-------|-----------------|----------|
| Impl-D-Upload-WebSerial | uploadAgent.js (NEW) + CompileUploadButton.jsx + upload test | scratchGenerator.js / compiler.js (Wave 1b owners) |
| Impl-E-UNLIM-HomePage | UnlimChatPanel.jsx (NEW) + UnlimCompileHelper.jsx + Chat test | lesson-paths/ (Impl-F) |
| Impl-F-UNLIM-Vol3 | PassoPassoUnifiedPanel.jsx + lesson-paths/v3-*.json + blocklyHighlightBridge.js (NEW) | UnlimCompileHelper (Impl-E) |
| Impl-H-A11y-Polish | scratchToolboxProgressive ARIA only (Wave 1b Impl-A merged, careful regression) + ElabIcons + a11y E2E + icons test | ALL other src/ files |

**Revert-protected (READ-ONLY tutti agent)** — same Wave 1b carry-forward:
- engine files (CircuitSolver.js / AVRBridge.js / PlacementEngine.js / SimulatorCanvas.jsx)
- intelHexValidator.js
- ScratchCompileBar.jsx + NewElabSimulator.jsx (cliffhanger wire iter 74-75)
- experiment-visibility.js 8-esp whitelist
- elabArduinoAst/* (STILL Wave 3+ deferred)

---

## EVIDENCE FORMAT (same Wave 1+1b)

```
BEFORE: git diff --stat clean
CHANGE: git diff --stat HEAD numeric
AFTER scoped: vitest CoV 3× IDENTICAL on owned tests
AFTER global: 3 failed | 425+N passed | 2 skipped (430+N) — baseline preserved
BUILD: npm run build exit 0
OWNERSHIP: git diff --cached --stat shows ONLY owned files
```

## REGOLE FERREE (no compromise)

- NO `--no-verify` on commit
- NO touching engine files revert-protected without `authorized-engine-change` branch
- NO auto-add ID to VISIBLE_EXP_IDS without Andrea explicit OK
- NO scope-creep elabArduinoAst (deferred Wave 3+)
- NO inflation score self-rated
- NO `git add -A` — explicit `git add <file>`
- NO module-load side effects in JSX (Wave 1 lesson)
- Pre-commit hook ASSENTE worktree but policy discipline applies
- Caveman mode chat. Code/commits/PRs normal.
- Commit format: `tipo(area): descrizione — Wave 2 Impl-X` + Co-Authored-By

## SUCCESS CRITERIA WAVE 2 X.3 CLOSE

- [ ] 4 atom shipped (Impl-D + E + F + H) con commit individuali
- [ ] Independent CoV 3× IDENTICAL global lead-direct
- [ ] `npm run build` exit 0 × 2 consecutive
- [ ] Test Files baseline ≥ 425 PASS (no regression Wave 1b)
- [ ] UNLIM HomePage chat live + Vision wire functional
- [ ] Web Serial upload OR ELAB Agent upload flow E2E PASS
- [ ] PassoPassoUnifiedPanel chat wire NO regression (iter 36 PM still open from Wave 1b)
- [ ] A11y axe-core 0 violations Blockly mode E2E
- [ ] PROMPT-CROSSCOMPILATORE Sez 5/6/7/8/10/21 marked further-DONE
- [ ] Plan doc Iter X.3 marked CLOSED
- [ ] Memory file update con Wave 2 commits
- [ ] PR open + admin merge OR await CI fix decision

---

## FOLLOW-UP P0/P1/P2 NOT IN X.3 SCOPE (carry forward)

### P0 — within X.3 if time
- Vol3 audit scratchXml placeholder bug — esp4/esp5 fixed Wave 1b. Remaining 21 esp (esp1/2/3/6/7/8 + cap5 + cap7 + cap8) likely same placeholder. If time: atom X.3.5 audit + bulk fix.

### P1 — X.4+
- Vol1 + Vol2 Blockly audit (38 + 27 esp likely same placeholder problem)
- E2E 11 FIXME markers from Wave 1b Impl-G-2 (08-esp4 + 09-esp5 + 10-homepage upstream wait)
- CI red blocker iter 102+ investigation (3 gate failing)

### P2 — X.5+
- elabArduinoAst/* refactor (1185 LOC cascade risk — Wave 3 deferred)
- Vitest cache discrepancy investigation (16057 stuck across pre/post-fix runs Wave 1b)
- Codex review #2 invalid JSON output flake — review system reliability

---

## ANTI-PATTERN STOP (red flags carry forward)

- Implementare TUTTO single-agent → STOP, 4 parallel mandatory
- Skip TDD "per velocità" → NO, test first sempre
- Edit revert-protected file → STOP, branch authorized-engine-change required
- Touch elabArduinoAst → STOP, Wave 3+ deferred explicit
- Pre-existing test fail nascosto → NO, indaga delta CoV 3× → committi solo flake noted
- 1 impl scrive file altro impl → BREAK ownership = reject commit + revert
- Top-level side effects in JSX modules → STOP, vitest mocks break
- Andrea ratify gate ignored → STOP, default applies se silenzio MA flag esplicito
- Codex stop-time review skip → NO, run /codex:review --wait OR bypass solo dopo investigation

---

## NEXT IMMEDIATE ACTION (session start)

1. Andrea ratify 4 decisioni Wave 2 (scope + Vol3 audit + Vol1/2 audit + CI red) — silenzio = default applies
2. `claude-mem:mem-search "wave 1b close esp4 esp5"` per recupero context cross-session
3. `cd PRODOTTO/elab-builder-blockly-definitivo && git fetch && git checkout main && git pull` to sync post-merge state. If worktree branch deleted: create fresh worktree from main.
4. `git status` verify clean tree + `git log --oneline -15` confirm merge commit `11a67cf0` reachable
5. Spawn `agent-teams:team-spawn` con preset `feature --members 5` (1 lead + 4 implementer) OR custom 4-implementer parallel
6. Dispatch Wave 2 atom briefs (each agent with self-contained scope from above)
7. Monitor wave progress, integrate at end, CoV 3× + build verify
8. Update PROMPT-CROSSCOMPILATORE tracking + memory + close commit
9. PR open + admin merge OR wait CI fix decision

---

**FINE PROMPT.** Wave 2 X.3 expected output: 4 commit atomic + 1 integration commit + tracking docs refresh + PR open. Stima sessione 6-10h con team-spawn orchestration. Iter X.3.5 Vol3 Blockly audit + X.4 Vol1+Vol2 audit + X.5 Codex Phase 3 sessioni successive.
