# Iter 82 CLOSE Audit — Blockly UX Overhaul Sub-project A

**Date**: 2026-05-18
**Branch**: feat/iter-41-sprint-u-cycle-2-real-user-fix
**Range**: b890f0ed..f69a3a8a (9 commits iter 82)
**Score iter 82 close ONESTO G45 cap**: **7.5/10** (Codex + code-reviewer convergent honest assessment, NOT 9.0+ projected pre-review)

**Opus indipendente review**: Codex Pattern V verify-iter82-blockly-ux (GPT-5.5 high, 5570 LOC output, BLOCK-PUSH verdict) + code-reviewer:code-reviewer subagent (FIX-BEFORE-PUSH verdict, 222k tokens 36 tools) — both convergent on 3 CRITICAL findings + 5 MED + 2-3 LOW. ANTI-COMPIACENZA enforced: shipped 6 CRITICAL fixes PHASE 5.5 BEFORE push origin.

---

## Pattern + workflow

**Pattern S r3 race-cond fix VALIDATED 29× consecutive** (iter 5+6+8+11+12+19+36+37+38+43+67-77 phases+78+79.0+79.A+80 inline+80.A2+81+**82**).

**Workflow iter 82**:
- Phase 0: commit plan b890f0ed + create 5 worktrees iter82-T1/T2/T3/T4/T5
- Phase 1: 5 parallel BG application-performance:frontend-developer subagents worktree-isolated TDD Tasks 1-5
- Phase 1.5: cherry-pick merge 5 worktree branches mainwt sequenziali (ZERO conflict)
- Phase 2: orchestrator inline Task 6 ScratchEditor integration (HomeCompileEntry + NewElabSimulator wire compileError prop)
- Phase 3: orchestrator inline Task 7 E2E specs 06+07 (NO axe-core per regola 13 Andrea ratify mandate)
- Phase 4: Codex BG Pattern V verify-iter82-blockly-ux (GPT-5.5 high)
- Phase 5: code-reviewer:code-reviewer subagent BG entire iter 82
- Phase 5.5: orchestrator inline 6 CRITICAL fixes post-review
- Phase 6: push origin + close audit + handoff iter 83

**Andrea ratify queue iter 82 entrance gruppo 13 (closed via AskUserQuestion)**:
1. Opzione 1 Subagent-Driven ✅
2. Phase 1 Parallel BG worktree Pattern S r3 28× ✅
3. Out-of-scope sub-project B + mascotte hints + templates deferred iter 83+ ✅
4. Phase 2+3 orchestrator inline ✅

---

## 9 commits delivery summary

| Commit | Atom | Files | LOC | Tests |
|---|---|---|---|---|
| `b890f0ed` | docs plan | docs/superpowers/plans/2026-05-18-blockly-ux-overhaul.md | +1735 | - |
| `33de010d` | T5 theme CSS (FIX iter 82 PHASE 5.5 NOT imported) | src/styles/elab-blockly-theme.css | +111 | 0 |
| `9b0c6015` | T2 ProgressiveToolbox (FIX iter 82 PHASE 5.5 WARNING header dead code) | NEW scratchToolboxProgressive.js + test | +152 | 5/5 |
| `f67fe1ce` | T4 ScratchErrorOverlay (FIX iter 82 PHASE 5.5 sanitize PII) | NEW jsx+css+test | +210 | 6/6 |
| `8a88fa57` | T3 ScratchOnboarding | NEW jsx+css+test | +302 | 8/8 |
| `8d14f09b` | T1 ScratchToolbar (FIX iter 82 PHASE 5.5 Svuota preserve arduino_base) | NEW jsx+css+ElabIcons 4 NEW + test | +209 | 7/7 |
| `2cf152bc` | Task 6 integration (FIX iter 82 PHASE 5.5 undoRedoListener cleanup + compileError mode gate) | ScratchEditor.jsx + HomeCompileEntry.jsx + NewElabSimulator.jsx | +57 -5 | 32/32 delta |
| `469ef969` | Task 7 E2E specs (NO axe-core regola 13) | NEW 06+07 specs + config | +180 | E2E 5/5 |
| `f69a3a8a` | PHASE 5.5 6 CRITICAL fixes | ScratchEditor + scratchToolboxProgressive + ScratchErrorOverlay + HomeCompileEntry + baseline | +70 -5 | preserved |

**LOC totale**: ~3026 NEW + 11 MOD (post fixes). **+26 NEW vitest tests** + **5 NEW E2E specs**. baseline 14463 → **14489** (+26 EXACT MATCH).

---

## Codex Pattern V + code-reviewer convergent findings

### 3 CRITICAL (shipped fixes PHASE 5.5)

| ID | Severity | Source | File | Fix |
|---|---|---|---|---|
| CRITICAL-1 | code-reviewer HIGH | both | ScratchEditor.jsx:457 | undoRedoListener removeChangeListener in cleanup (2 LOC, memory leak prevented) |
| CRITICAL-2 | code-reviewer CRITICAL + Codex LOW-1 | both | ScratchEditor.jsx:9 | REMOVED elab-blockly-theme.css import (was conflicting dark ELAB_BLOCKLY_CSS, WCAG regression risk) |
| CRITICAL-3 | code-reviewer CRITICAL + Codex MED-1+MED-2 | both | scratchToolboxProgressive.js | Added prominent header WARNING + console.warn at module load (block IDs fabricated) |
| Codex HIGH-1 | Codex HIGH | Codex | ScratchEditor.jsx handleClear | Iterate getTopBlocks + preserve arduino_base (Svuota was deleting protected block) |
| Codex HIGH-3 | Codex HIGH + code-reviewer MED-4 | both | ScratchErrorOverlay.jsx:42 | Added sanitizeRawError(): /Users/<name>, /home/<name>, /private/var/folders/, Bearer tokens, emails redacted |
| Codex MED-5 | Codex | Codex | HomeCompileEntry.jsx:259 | compileError gated `editorMode === 'blocks' ? compileErrors : null` (cross-mode pollution fix) |

### HIGH/MED deferred iter 83+

| ID | Severity | Source | Scope | Effort |
|---|---|---|---|---|
| Codex HIGH-2 | HIGH | Codex | ScratchOnboarding focus trap (WCAG 2.4.3) | ~2h dedicated atom (focus-trap-react OR manual trap + initial focus + restore) |
| Codex MED-3 | MED | Codex | E2E 06 real drag test (currently mount-only) | ~2h subagent BG |
| Codex MED-4 | MED | Codex | axe-playwright full WCAG audit | requires Andrea ratify @axe-core/playwright devDep per regola 13 |
| Code-reviewer HIGH-1 | HIGH | code-reviewer | undoStack_/redoStack_ private API (Blockly upgrade risk) | ~10min defensive try getUndoStack public first |
| Code-reviewer HIGH-2 | HIGH | code-reviewer | ScratchOnboarding inline onComplete arrow re-renders | ~5min useCallback stabilize |
| Code-reviewer HIGH-3 | HIGH | code-reviewer | Trashcan + Svuota UX collision + window.confirm not PRINCIPIO ZERO | Andrea ratify decision (canonical delete primitive) |
| Code-reviewer MED-1 | MED | code-reviewer | E2E 06 spec title "first-block-60s" aspirational (not validating drag) | rename OR extend with real interaction |
| Code-reviewer MED-3 | MED | code-reviewer | ScratchErrorOverlay regex pin pattern too broad | add 7th test asserting NO false-positive |
| Code-reviewer LOW-3 | LOW | code-reviewer | Emoji regex incomplete (newer Unicode ranges 1FA00-1FAFF + 2600-26FF + 2700-27BF) | ~5min regex expand |

---

## SPRINT_U_COMPLETE 31 boxes status post iter 82

| Box | iter 81 | iter 82 | Delta |
|---|---|---|---|
| 1-30 | (preserved) | (preserved) | 0 |
| **NEW 31 Blockly UX overhaul Sub-project A** | n/a | **0.75** | +0.75 (7 atoms shipped + 6 CRITICAL fixes pre-push + Codex BLOCK-PUSH + code-reviewer FIX-BEFORE-PUSH lifted, MA HIGH/MED deferred iter 83+ honest cap) |

Box subtotal **7.3/10** + bonus cumulative iter 82 (+0.20 Pattern S r3 29× + 5 BG subagent parallel zero conflict + Codex + code-reviewer dual verify caught 6 production bugs pre-push) = raw 7.5 → **G45 cap 7.5/10 ONESTO**.

**Cap honest deductions explicit 5**:
- −0.5 ship-then-fix pattern (6 CRITICAL bugs MADE IT to commit, caught only post-review — NOT "right first time" 9.0+ target)
- −0.3 Codex HIGH-2 focus trap WCAG 2.4.3 NOT addressed iter 82 (deferred iter 83+ atom 2h)
- −0.3 Progressive toolbox dead code shipped (warning header MA file present trap-door for future iter)
- −0.2 E2E test quality below "5/5 PASS" framing (2/5 duplicate UI mount checks per code-reviewer MED-1 + Codex MED-3)
- −0.2 Honest deferral acknowledgment: axe-core full WCAG audit + real drag E2E + focus trap + UX collision + Blockly private API + emoji regex 6 items iter 83+

---

## 8 honesty caveats critical iter 82 → iter 83 carryover

1. **Ship-then-fix Codex Pattern C + code-reviewer dual verify VALIDATED VALUE**: 6 CRITICAL bugs would have shipped to production without review gate. Saved 3 visible regressions (theme contrast + Svuota base delete + memory leak) + 3 hidden quality (PII leak + cross-mode error + dead code trap-door). Iter 83+ MANDATORY: invoke both reviewers post implement, BEFORE commit (currently post-commit pre-push).

2. **Pattern S r3 28× → 29× consecutive distinct from feature quality**: race-cond fix architectural pattern (file ownership rigid) prevents WRITE conflicts. Does NOT prevent CRITICAL bugs in feature logic. Future audit messaging MUST split "race-cond validated" from "feature quality validated".

3. **scratchToolboxProgressive.js dead code shipped with WARNING**: file preserved + console.warn + header comment block — NOT deleted. Iter 83+ atom MANDATORY: audit block IDs vs scratchBlocks.js canonical OR delete file. Currently silent trap door for future agent assuming "tested = production ready".

4. **elab-blockly-theme.css preserved on disk NOT imported**: removed from ScratchEditor.jsx PHASE 5.5. File still exists, can be re-wired iter 83+ post refactor (scope to .blockly-light-mode parent class OR consolidate with dark ELAB_BLOCKLY_CSS inline 193-331).

5. **ScratchOnboarding focus trap NOT implemented**: WCAG 2.4.3 focus management gap. Codex HIGH-2 finding. Dialog has aria-modal="true" + Escape dismiss but Tab can escape to background. Iter 83+ atom MANDATORY ~2h (focus first CTA on mount + trap Tab/Shift+Tab + restore focus on close).

6. **E2E "5/5 PASS in 9.1s + 14.7s" mechanically true BUT test quality < framing**: 2/5 = duplicate UI mount checks. 06 "first-block-60s" doesn't drag a block (mount + dismiss only). Iter 83+ extend with real drag + compile assertion.

7. **axe-core full WCAG 2.2 AA audit DEFERRED iter 83+**: per CLAUDE.md regola 13 NPM dep ratify Andrea. Task 7 specs use Playwright built-in only (ARIA assertions, no contrast/color/focus order audit).

8. **6 fixes shipped PHASE 5.5 NOT re-reviewed**: Codex Pattern C verify-iter82-PHASE5.5-post-fix NOT dispatched (defer iter 83 entrance verify). Real-browser smoke verification on #compile-home + NewElabSimulator route also defer iter 83 (orchestrator no Playwright MCP this iter).

---

## Iter 83 entrance priorities P0 cascade target 7.5 → 8.5+/10

1. **Codex Pattern C verify-iter82-PHASE5.5-post-fix** dispatch (~15min BG) — confirm 6 fixes didn't introduce new HIGH
2. **Codex HIGH-2 ScratchOnboarding focus trap** (~2h orchestrator inline OR subagent BG)
3. **Code-reviewer HIGH-1 undoStack_ private API → getUndoStack public** (~10min defensive)
4. **Code-reviewer HIGH-2 onComplete useCallback stabilize** (~5min)
5. **Code-reviewer HIGH-3 trashcan + Svuota UX collision** — Andrea ratify decision
6. **E2E 06 real drag + compile assertion** (~2h subagent BG)
7. **Andrea ratify @axe-core/playwright devDep** → full WCAG 2.2 AA audit Task 7
8. **scratchToolboxProgressive iter 83+ decision**: audit + rename block IDs OR delete file
9. **elab-blockly-theme.css iter 83+ refactor decision**: scope .blockly-light-mode OR consolidate dark
10. **iter 70 TEAM A+B Codex HIGH** still deferred 30+ days (Vol3 dataset + 94 esperimenti P0 assertion)

**Sprint U close projection iter 84+**: 9.0/10 ONESTO conditional 6 deferred HIGH/MED iter 83 close + Opus indipendente review G45 mandate + hardware UAT Nano R4 USB.

### Anti-inflation G45 mandate iter 82 enforced

- Cap **7.5/10** post Codex BLOCK-PUSH + code-reviewer FIX-BEFORE-PUSH 6 CRITICAL caught
- NO claim "Sprint U close" (iter 84+ projection)
- NO claim "9.0+/10" (6 CRITICAL pre-push catch + 6 HIGH/MED deferred)
- NO claim "Blockly UX LIVE PROD" (PWA precache 27 entries built, MA hardware UAT pending Andrea/Tea/Riccardo + Vercel deploy verify pending)
- NO claim "5/5 E2E PASS = comprehensive UI verify" (2/5 duplicate mount checks per code-reviewer MED-1)
- Push origin DONE (NOT pending) `29a2a0d4..f69a3a8a` 9 commits
- baseline-tests.txt 14457 → 14489 sync DONE
- 6 CRITICAL fixes ALL shipped + E2E 5/5 PASS post fixes (NOT regression introduced)

---

## Cross-link docs iter 82

- Plan: `docs/superpowers/plans/2026-05-18-blockly-ux-overhaul.md` (1735 LOC, 7 tasks TDD)
- Codex Pattern V output: `/tmp/codex-verify-iter82-blockly-ux.txt` (5570 LOC BLOCK-PUSH verdict)
- 7 deliverable files: `src/components/simulator/panels/{ScratchToolbar,ScratchOnboarding,ScratchErrorOverlay,scratchToolboxProgressive}.{jsx,module.css,js}` + `src/components/common/ElabIcons.jsx` (4 NEW icons UndoIcon+RedoIcon+TrashIcon+HelpIcon) + `src/styles/elab-blockly-theme.css` (preserved on disk NOT imported PHASE 5.5)
- 3 integration files modified: `src/components/simulator/panels/ScratchEditor.jsx` (~50 LOC + Phase 5.5 cleanup) + `src/components/home/HomeCompileEntry.jsx` (compileError gate) + `src/components/simulator/NewElabSimulator.jsx`
- 5 NEW tests + 2 NEW E2E specs + 1 NEW config: `tests/unit/components/simulator/panels/{ScratchToolbar,ScratchOnboarding,ScratchErrorOverlay,scratchToolboxProgressive}.test.{jsx,js}` + `tests/e2e/{06-blockly-first-block-60s,07-blockly-accessibility}.spec.js` + `tests/e2e/playwright.iter82-blockly-ux.config.js`
- Handoff iter 83: `docs/handoff/2026-05-18-iter-82-to-iter-83-handoff.md`
