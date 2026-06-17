# /goal — BLOCKLY CROSS-COMPILER WAVE 2 X.3b EXPANSION (Iter X.3b)

> **Context inheritance**: this prompt continues [PROMPT-NEXT-SESSION-2026-05-28-WAVE-2-X3-PLUS-VOL3-AUDIT.md](./PROMPT-NEXT-SESSION-2026-05-28-WAVE-2-X3-PLUS-VOL3-AUDIT.md) iter X.3 → X.3b. Wave 2 X.3 CLOSED 2026-05-26 (3 commit on `feature/blockly-wave2-x3` → PR [#169](https://github.com/AndreaMarro/elab-tutor/pull/169) OPEN). Andrea ratify scope-narrow Wave 2 to 2 atom (Impl-D + Atom-Vol3 audit P0). Bonus Wave 1b silent bug surfaced + repaired (esp4/esp5 over-closure).

---

## STATO EREDITATO (read before start)

### Branch + worktree
- **Worktree**: `PRODOTTO/elab-builder-blockly-definitivo/` (or create fresh from main if branch deleted)
- **Branch base**: depends on PR #169 status
  - If `feature/blockly-wave2-x3` MERGED → branch from `main` HEAD
  - If still OPEN → branch from `feature/blockly-wave2-x3` HEAD (`bddbf818`) to extend Wave 2
  - Default: branch from main post-merge (per Andrea R8 PR per-iter)
- **Memory project**: `~/.claude/projects/-Users-andreamarro-VOLUME-3/memory/blockly-crosscompiler-definitivo-phase0.md`

### Wave 2 X.3 CLOSED 2026-05-26 — 3 commit shipped

| SHA | Atom | Files | LOC | Note |
|-----|------|-------|-----|------|
| `26280ff0` | Impl-D Upload-WebSerial | uploadAgent.js NEW + test NEW | +784/-0 | ELAB Agent primary + Web Serial STUB fallback + orchestrator |
| `0e533b41` | Atom-Vol3 + esp4/esp5 repair | experiments-vol3.js + test NEW | +394/-21 | 19 placeholder scratchXml + Wave 1b over-closure carryover fix |
| `bddbf818` | Plan doc close synth | plan doc | +31/-2 | Iter X.3 NEXT → CLOSED row |

### Verification close gate Wave 2 X.3 PASSED
- ✅ Independent CoV 3× IDENTICAL global: `3 failed | 428 passed | 2 skipped (433)` / `9 failed | 16214 passed | 15 skipped | 10 todo (16248)`
- ✅ Wave 1b baseline `3 failed | 425 passed (430)` preserved + 3 net new test files
- ✅ npm run build exit 0 (19.28s, PWA 27 entries 2081.64 KiB precache)
- ✅ File ownership respected exactly — engine files revert-protected untouched
- ✅ 3 remaining failed Test Files = pre-existing UI failures (UnlimCompileHelper × 2 + HomeCompileEntry-tabs × 1) unrelated to Wave 2

### Wave 1b silent bug surfaced + fixed (lesson learned carry-forward)
- esp4 + esp5 scratchXml shipped Wave 1b commit `685848bc` had extra `</next></block>` close pair → strict XML parser rejected, Blockly tolerant HTML parser silently accepted at runtime
- Wave 1b "3 failed" baseline either pre-dated strict XML tests OR mis-reported them
- Lead-direct global CoV caught via tests/unit/scratchXmlBlockly.test.js + tests/unit/scratchXmlValidation.test.js → bundled repair with Vol3 audit commit
- **ANTI-PATTERN**: do NOT trust subagent self-reported test counts; always lead-direct global CoV before close synthesis

### Andrea ratify Wave 2 X.3 carried forward
- Wave 2 scope ratify = 1 atom solo (Impl-D) → Impl-E + F + H deferred to THIS iter X.3b
- Vol3 audit P1 ratify = Inside X.3 P0 (DONE — 19 esp fixed)
- Vol1/Vol2 audit P2 ratify = Separato iter X.4 (still deferred)
- CI red blocker ratify = Admin-merge continua (iter X.6 dedicato)
- Branch policy = continue worktree pattern (PR per-iter per R8)

---

## 4 DECISIONI ANDREA REQUIRED PRIMA START X.3b

⚠️ **Sessione blocca se non ratificate** (silenzio = default):

1. **Wave 2 X.3b scope**: 3 atom parallel (Impl-E UNLIM-HomePage + Impl-F UNLIM-Vol3 + Impl-H A11y-Polish) OR add 4th atom CompileUploadButton wire-up?
   - **Default se silenzio**: 4 atom parallel — Impl-E + Impl-F + Impl-H + Impl-Wire (CompileUploadButton wire-up to uploadHex orchestrator). Stima 8-12h.

2. **Real DFU/STK500 protocol in uploadViaWebSerial**: implement now OR defer iter X.4+?
   - **Default se silenzio**: defer iter X.4+ (existing webUsbDetect.js + mockUsbDfuDevice.js iter 76-78 cover Nano R4 DFU; uploadAgent.js stub adequate for current scope)

3. **CompileUploadButton.jsx unify** with uploadHex orchestrator: full refactor OR add fallback hook leaving existing path intact?
   - **Default se silenzio**: add fallback hook (extend `fetchImpl` injection pattern with `uploadHexImpl` injection that defaults to uploadHex). Preserves existing wire to avoid scope creep.

4. **PR #169 merge timing**: wait merge before starting X.3b OR start X.3b on top of feature/blockly-wave2-x3 (stack PR)?
   - **Default se silenzio**: wait PR #169 merge → branch X.3b from main. Cleaner PR review per Andrea R8 PR per-iter ratify.

---

## PLUGIN MANDATORY (ordine esecuzione X.3b)

1. **superpowers:using-superpowers** — establishes how to find/use skills (auto-load each turn)
2. **claude-mem:mem-search** — verifica eredità prev session (search "wave 2 x.3 close", "uploadAgent facade", "vol3 scratchXml bulk fix")
3. **superpowers:executing-plans** — esegui plan doc `2026-05-25-blockly-crosscompiler-definitivo.md` Iter X.3b row (NEW row to add)
4. **agent-teams:team-spawn** — create team "blockly-wave-2b" + 3-4 implementer parallel
5. **superpowers:test-driven-development** — TDD red-green ogni atom
6. **superpowers:dispatching-parallel-agents** — Wave 2b batched single-message
7. **superpowers:verification-before-completion** — claim-verify pre-commit ogni atom
8. **elab-quality-gate** — pre-commit ogni atom + Wave 2b close

## SCOPE WAVE 2 X.3b — 3-4 IMPL EXPANSION

### Impl-E-UNLIM-HomePage (deferred from X.3)
**Owner exclusive files**:
- `src/components/home/UnlimChatPanel.jsx` (NEW — split from UnlimCompileHelper 152 LOC)
- `src/components/home/UnlimCompileHelper.jsx` (refactor to mini-helper only)
- `tests/unit/components/home/UnlimChatPanel.test.jsx` (NEW)

**Tasks**:
- Split UnlimCompileHelper into 2: `UnlimChatPanel` (floating full chat) + `UnlimCompileHelper` (mini banner)
- Wire RAG Blockly-aware: when user asks about Blockly blocks, retrieve from `rag-chunks.json` + `scratchBlocks.js` registry
- Vision wire: "guarda il mio circuito Blockly" → screenshot Blockly editor → Gemini Vision diagnosis
- IT plurale + Principio Zero + cita Vol/pag verbatim
- Max 120 parole per UNLIM response (per feedback_unlim_language_rules_10may2026)

**Stima**: 5-7h.

### Impl-F-UNLIM-Vol3 (deferred from X.3)
**Owner exclusive files**:
- `src/components/lavagna/PassoPassoUnifiedPanel.jsx` (extend with UNLIM chat wire — iter 36 PM regression P0)
- `src/data/lesson-paths/v3-cap*.json` (extend ALL Vol3 esp with `unlim_template` Blockly highlight coordinator — verify before adding since iter 72.5 audit confirmed lesson-paths schema HAS `next_experiment {id,title,preview}`)
- `src/services/blocklyHighlightBridge.js` (NEW) — coord Blockly block IDs ↔ esp step

**Tasks**:
- Passo Passo UNLIM chat wire (currently regression from iter 36 PM — see feedback_passo_passo_regression_06may2026.md, 9+ iter carryover)
- Per Vol3 esp template: define block IDs to highlight per step (e.g. esp4 step "Carica codice" → highlight arduino_pin_mode blocks)
- Bridge between Blockly workspace block.id and UNLIM AZIONE tag `[AZIONE:highlight:block_id]`
- IT verbatim Vol/pag references in passo passo lessons

**Stima**: 4-6h.

### Impl-H-A11y-Polish (deferred from X.3)
**Owner exclusive files**:
- `src/components/simulator/panels/scratchToolboxProgressive.js` (ARIA labels per category)
- `src/components/common/ElabIcons.jsx` (add HammerIcon — referenced in spec, not yet exported)
- `tests/e2e/11-blockly-axe-core-accessibility.spec.js` (NEW E2E)
- `tests/unit/components/common/ElabIcons.test.jsx` (extend)

**Tasks**:
- ARIA sweep Blockly toolbox: aria-label per category + aria-expanded for collapsible
- Focus ring visible all Blockly buttons (currently default Blockly styling — override)
- WCAG AA contrast audit on canonical 16-cat colors (spec Sez 1 line 88) — some colors may fail
- ElabIcons.HammerIcon (referenced by spec Sez 21 estetica)
- E2E axe-core 0 violations on Blockly mode

**Stima**: 3-5h.

### Impl-Wire-CompileUploadButton (NEW from Wave 2 deferred)
**Owner exclusive files**:
- `src/components/lavagna/CompileUploadButton.jsx` (1239 LOC — extend `uploadHexImpl` injection prop defaulting to imported uploadHex from `../../services/uploadAgent.js`)
- `tests/unit/components/lavagna/CompileUploadButton-uploadAgent-wire.test.jsx` (NEW — wire-up specific test, separate from existing CompileUploadButton.test.jsx)

**Tasks**:
- Add `uploadHexImpl` prop with default `uploadHex` from uploadAgent.js
- When `enableDemoMode = false` AND `elabAgent unavailable`: try uploadHex orchestrator → falls back Web Serial if available
- Preserve existing AGENT_COMPILE_UPLOAD_URL path as primary when agent online (no regression)
- Honest state machine update: add `FALLBACK_WEB_SERIAL` state distinct from `UPLOADING` for transparency
- Test: agent down → uploadHex tries Web Serial → state transitions correctly + IT toast on failure

**Stima**: 3-4h.

---

## FILE OWNERSHIP MATRIX (LOCK pre-Wave 2b)

Identical to Wave 1+1b+2. Hard rule: **un impl tocca SOLO i suoi file**.

| Agent | Files exclusive | NO touch |
|-------|-----------------|----------|
| Impl-E-UNLIM-HomePage | UnlimChatPanel.jsx (NEW) + UnlimCompileHelper.jsx + ChatPanel test | lesson-paths/ (Impl-F) |
| Impl-F-UNLIM-Vol3 | PassoPassoUnifiedPanel.jsx + lesson-paths/v3-*.json + blocklyHighlightBridge.js (NEW) | UnlimCompileHelper (Impl-E) |
| Impl-H-A11y-Polish | scratchToolboxProgressive ARIA only + ElabIcons + a11y E2E + icons test | ALL other src/ files |
| Impl-Wire-CompileUploadButton | CompileUploadButton.jsx + uploadAgent-wire test (NEW separate file, NOT existing CompileUploadButton.test.jsx) | uploadAgent.js (Wave 2 owner READ-ONLY ref) |

**Revert-protected (READ-ONLY tutti agent)** — same Wave 1b+2 carry-forward:
- engine files (CircuitSolver.js / AVRBridge.js / PlacementEngine.js / SimulatorCanvas.jsx)
- intelHexValidator.js
- ScratchCompileBar.jsx + NewElabSimulator.jsx (cliffhanger wire iter 74-75)
- experiment-visibility.js 8-esp whitelist
- elabArduinoAst/* (STILL Wave 3+ deferred)
- uploadAgent.js (Wave 2 X.3 ship — extension via injection prop only, NO modification to src/services/uploadAgent.js)
- src/data/experiments-vol3.js (Wave 2 X.3 ship — Vol3 audit closed)

---

## EVIDENCE FORMAT (same Wave 1+1b+2)

```
BEFORE: git diff --stat clean
CHANGE: git diff --stat HEAD numeric
AFTER scoped: vitest CoV 3× IDENTICAL on owned tests
AFTER global: 3 failed | 428+N passed | 2 skipped (433+N) — baseline preserved
BUILD: npm run build exit 0
OWNERSHIP: git diff --cached --stat shows ONLY owned files
```

## REGOLE FERREE (no compromise — carry-forward from Wave 2 X.3)

- NO `--no-verify` on commit
- NO touching engine files revert-protected without `authorized-engine-change` branch
- NO auto-add ID to VISIBLE_EXP_IDS without Andrea explicit OK
- NO scope-creep elabArduinoAst (deferred Wave 3+)
- NO inflation score self-rated
- NO `git add -A` — explicit `git add <file>`
- NO module-load side effects in JSX (Wave 1 lesson)
- NO trust subagent self-reported test counts — ALWAYS lead-direct global CoV before close (Wave 2 X.3 lesson)
- Pre-commit hook ASSENTE worktree but policy discipline applies
- Caveman mode chat. Code/commits/PRs normal.
- Commit format: `tipo(area): descrizione — Wave 2b Impl-X` + Co-Authored-By
- Andrea ratify 4 decisioni pre-start MANDATORY (silenzio = default applies)

## SUCCESS CRITERIA WAVE 2 X.3b CLOSE

- [ ] 3-4 atom shipped (Impl-E + F + H ± Wire) con commit individuali
- [ ] Independent CoV 3× IDENTICAL global lead-direct
- [ ] `npm run build` exit 0 × 2 consecutive
- [ ] Test Files baseline ≥ 428 PASS (no regression Wave 2 X.3)
- [ ] UNLIM HomePage chat live + Vision wire functional (Impl-E)
- [ ] PassoPassoUnifiedPanel chat wire NO regression (iter 36 PM closed via Impl-F)
- [ ] CompileUploadButton wire to uploadHex (if 4-atom scope) — agent down → Web Serial fallback exercised
- [ ] A11y axe-core 0 violations Blockly mode E2E (Impl-H)
- [ ] PROMPT-CROSSCOMPILATORE Sez 5/6/7/8/10/21 marked further-DONE
- [ ] Plan doc Iter X.3b marked CLOSED
- [ ] Memory file update con Wave 2b commits
- [ ] PR open + admin merge OR await CI fix decision (Andrea R4 ratify default = admin-merge continua)

---

## FOLLOW-UP P0/P1/P2 NOT IN X.3b SCOPE (carry forward)

### P0 — within X.3b if time
- iter 36 PM Passo Passo regression actually closes via Impl-F (mandatory per feedback)

### P1 — X.4
- Vol1 + Vol2 Blockly scratchXml audit (38 + 27 esp likely same placeholder pattern as Vol3 — Wave 2 X.3 confirmed empirical pattern formulaic)
- E2E 11 FIXME markers from Wave 1b Impl-G-2 (08-esp4 + 09-esp5 + 10-homepage upstream wait)
- CI red blocker iter 102+ investigation (3 gate failing since 12/05)

### P2 — X.5+
- elabArduinoAst/* refactor (1185 LOC cascade risk — Wave 3 deferred)
- Vitest cache discrepancy investigation (16057 stuck across pre/post-fix runs Wave 1b)
- Real DFU/STK500 protocol in uploadViaWebSerial (currently Intel HEX line stub adequate per Andrea R2 default)
- 5 Atom-Vol3 pedagogical deviations resolved when corresponding Blockly blocks added (analogWriteResolution, math_arithmetic float chain, controls_for with variable, while(!Serial))

---

## ANTI-PATTERN STOP (red flags carry forward + Wave 2 X.3 additions)

- Implementare TUTTO single-agent → STOP, 3-4 parallel mandatory
- Skip TDD "per velocità" → NO, test first sempre
- Edit revert-protected file → STOP, branch authorized-engine-change required
- Touch elabArduinoAst → STOP, Wave 3+ deferred explicit
- Touch uploadAgent.js or experiments-vol3.js → STOP, Wave 2 X.3 SHIPPED ownership preserved (extend via injection prop)
- Pre-existing test fail nascosto → NO, indaga delta CoV 3× → committi solo flake noted
- 1 impl scrive file altro impl → BREAK ownership = reject commit + revert
- Top-level side effects in JSX modules → STOP, vitest mocks break
- Andrea ratify gate ignored → STOP, default applies se silenzio MA flag esplicito
- Codex stop-time review skip → NO, run /codex:review --wait OR bypass solo dopo investigation
- **Trust subagent test counts → STOP** (Wave 2 X.3 lesson: subagent reports may miss global state failures that lead-direct CoV surfaces)

---

## NEXT IMMEDIATE ACTION (session start)

1. Verify PR #169 status via `gh pr view 169 --json state,mergedAt` — if merged go branch from main, else stack on `feature/blockly-wave2-x3` or wait merge per Andrea R4 ratify
2. Andrea ratify 4 decisioni Wave 2b (scope + DFU + wire + merge timing) — silenzio = default applies
3. `claude-mem:mem-search "wave 2 x.3 close uploadAgent vol3 scratchXml"` per recupero context cross-session
4. `cd PRODOTTO/elab-builder-blockly-definitivo && git fetch && git checkout main && git pull` to sync post-merge state. If worktree branch X.3b not yet created: `git checkout -b feature/blockly-wave2-x3b`
5. `git status` verify clean tree + `git log --oneline -15` confirm Wave 2 commits reachable
6. Spawn `agent-teams:team-spawn` con preset `feature --members 4-5` (1 lead + 3-4 implementer) OR custom parallel implementer dispatch
7. Dispatch Wave 2b atom briefs (each agent with self-contained scope from above)
8. Monitor wave progress, integrate at end, CoV 3× + build verify
9. **Lead-direct global vitest CoV 3× BEFORE close synthesis** (Wave 2 X.3 lesson learned — subagent counts not authoritative)
10. Update plan doc Iter X.3b CLOSED row + memory + close commit
11. PR open + admin merge OR wait CI fix decision

---

**FINE PROMPT.** Wave 2 X.3b expected output: 3-4 commit atomic + 1 integration commit + tracking docs refresh + PR open. Stima sessione 8-12h con team-spawn orchestration. Iter X.4 Vol1+Vol2 audit + X.5 Codex Phase 3 + X.6 CI red fix sessioni successive.
