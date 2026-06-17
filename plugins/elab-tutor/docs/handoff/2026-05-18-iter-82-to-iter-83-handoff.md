# Handoff iter 82 → iter 83 — Blockly UX Overhaul Sub-project A close + iter 83 follow-up

**Date**: 2026-05-18 | **Branch**: feat/iter-41-sprint-u-cycle-2-real-user-fix
**Iter 82 close ONESTO G45 cap**: **7.5/10**
**Iter 83 score target**: 8.5+/10 conditional 6 deferred HIGH/MED close

## §1 ACTIVATION STRING iter 83 entrance (paste-ready)

```
Iter 83 entrance. Pre-flight:
- vitest baseline 14489 verify (automa/baseline-tests.txt)
- build PASS (~18s) + PWA precache 27 entries 1959 KiB
- E2E 5/5 PASS verify post iter 82 PHASE 5.5 fixes
- git log HEAD = f69a3a8a iter 82 close

Iter 82 close audit + handoff: docs/{audits,handoff}/2026-05-18-iter-82-*
Iter 82 deferred HIGH/MED 6 items (Codex Pattern V + code-reviewer convergent findings post-merge ship-then-fix lesson):
1. Codex HIGH-2 ScratchOnboarding focus trap WCAG 2.4.3 (~2h)
2. Code-reviewer HIGH-1 undoStack_ private API getUndoStack public (~10min)
3. Code-reviewer HIGH-2 onComplete useCallback stabilize (~5min)
4. Code-reviewer HIGH-3 trashcan + Svuota UX collision (Andrea ratify)
5. Codex MED-3 E2E 06 real drag + compile assertion (~2h)
6. Codex MED-4 axe-playwright full WCAG audit (Andrea ratify @axe-core/playwright devDep)

iter 70 TEAM A+B Codex HIGH still deferred 30+ days (Vol3 dataset + 94 esperimenti P0 assertion).

Pattern S r3 29× consecutive validated. Codex Pattern C + code-reviewer dual verify VALIDATED VALUE: caught 6 CRITICAL bugs pre-push iter 82 PHASE 5.5.

Iter 83 P0 priorities cascade 7.5 → 8.5+:
- A1 Codex Pattern V verify-iter82-PHASE5.5-post-fix dispatch (~15min BG) confirm 6 fixes no new HIGH
- A2 Codex HIGH-2 focus trap atom (~2h orchestrator inline OR subagent BG)
- A3 Code-reviewer HIGH-1+2 quick fixes (~15min orchestrator inline)
- A4 Andrea ratify queue gruppo 14 (5 voci): @axe-core/playwright devDep + trashcan vs Svuota canonical + scratchToolboxProgressive iter 83 decision + elab-blockly-theme.css iter 83 refactor decision + hardware UAT Nano R4 USB schedule
- A5 E2E 06 real drag spec (~2h subagent BG)
```

## §2 Setup steps Andrea iter 83 entrance (5-10 min)

1. **Verify push origin landed**:
   ```bash
   cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"
   git ls-remote origin feat/iter-41-sprint-u-cycle-2-real-user-fix
   # Expected: f69a3a8a (iter 82 close)
   ```

2. **Verify CoV iter 82 baseline preserved**:
   ```bash
   npx vitest run --reporter=basic 2>&1 | tail -3
   # Expected: 14489 PASS + 15 skipped + 11 todo
   cat automa/baseline-tests.txt
   # Expected: 14489
   ```

3. **Verify E2E iter 82 specs 5/5 PASS** (optional regression check):
   ```bash
   (npx vite preview --port=4173 &) && sleep 4
   BASE_URL=http://localhost:4173 npx playwright test --config=tests/e2e/playwright.iter82-blockly-ux.config.js --reporter=line
   # Expected: 5 passed (~14s)
   pkill -f "vite preview --port=4173"
   ```

4. **Andrea ratify queue gruppo 14 (5 voci)** — see §3 below

## §3 Andrea ratify queue gruppo 14 (iter 83 entrance)

1. **@axe-core/playwright devDep install** ratify (per CLAUDE.md regola 13 NPM dep ratify mandate)? Unblocks Codex MED-4 full WCAG 2.2 AA audit iter 83 atom.
2. **Trashcan + Svuota canonical** decision (code-reviewer HIGH-3 UX collision)? Options: (a) keep both + document distinction in onboarding; (b) remove Blockly trashcan UI + Svuota only; (c) remove Svuota button + trashcan primary
3. **scratchToolboxProgressive.js iter 83 decision**? Options: (a) audit + rename block IDs to scratchBlocks.js canonical names (~30min) + wire iter 83+; (b) delete file iter 83 entrance (defer progressive toolbox iter 84+)
4. **elab-blockly-theme.css iter 83 refactor decision**? Options: (a) consolidate with inline ELAB_BLOCKLY_CSS in single theme file (~30min); (b) scope to .blockly-light-mode parent class for #compile-home only (~15min); (c) delete file iter 83 entrance (defer light mode iter 84+)
5. **Hardware UAT Nano R4 USB** schedule (chain ready end-to-end iter 79.A A3 hexBase64 + iter 80.A2 IDE-1 + iter 82 Blockly UX)? Tea/Riccardo Omaric kit physical board test.

## §4 P0 cascade lift table iter 83

| Atom | Source | Scope | Effort | Lift |
|---|---|---|---|---|
| A1 Codex verify-iter82-PHASE5.5-post-fix | self | confirm 6 fixes no new HIGH | 15min BG | +0.1 confidence gate |
| A2 ScratchOnboarding focus trap | Codex HIGH-2 | WCAG 2.4.3 | 2h | +0.2 |
| A3 undoStack_ → getUndoStack public | code-reviewer HIGH-1 | Blockly upgrade safety | 10min inline | +0.05 |
| A4 onComplete useCallback | code-reviewer HIGH-2 | render perf | 5min inline | +0.05 |
| A5 E2E 06 real drag | Codex MED-3 | test quality | 2h subagent BG | +0.15 |
| A6 axe-playwright install + use | Codex MED-4 | full WCAG audit | 2h post Andrea ratify | +0.2 |
| A7 emoji regex expand | code-reviewer LOW-3 | regola 11 coverage | 5min inline | +0.05 |
| A8 ScratchErrorOverlay pin regex test | code-reviewer MED-3 | edge case T7 | 15min | +0.05 |
| A9 trashcan/Svuota UX | code-reviewer HIGH-3 | post Andrea ratify | 1h post decision | +0.10 |
| A10 scratchToolboxProgressive iter 83 decision | both | block ID audit OR delete | 30min OR 5min post Andrea | +0.05 |

**Iter 83 score projection**: 7.5 + (A1+A2+A3+A4+A5+A6+A7) ≈ **8.0-8.5/10** ONESTO conditional 7+ atoms close.

## §5 Honest caveats iter 82 → iter 83 (8 critical)

(See full list in `docs/audits/2026-05-18-iter-82-CLOSE-audit.md` §honesty caveats)

Summary:
1. Ship-then-fix Codex + code-reviewer dual verify saved 6 production bugs — invoke BEFORE commit iter 83+
2. Pattern S r3 29× = race-cond architectural, NOT feature quality validator
3. scratchToolboxProgressive dead code shipped with WARNING (trap door iter 83+ audit)
4. elab-blockly-theme.css disk-preserved NOT imported (iter 83+ refactor)
5. ScratchOnboarding focus trap WCAG 2.4.3 gap (Codex HIGH-2 iter 83 mandatory)
6. E2E "5/5 PASS" mechanically true MA 2/5 duplicate UI mount checks per code-reviewer MED-1
7. axe-core full WCAG audit defer iter 83+ post Andrea ratify
8. 6 PHASE 5.5 fixes NOT independently re-reviewed (iter 83 entrance A1 verify)

## §6 Sprint U close projection

**iter 84+**: 9.0/10 ONESTO conditional 6 deferred HIGH/MED iter 83 close + Opus indipendente review G45 mandate + hardware UAT Nano R4 USB Andrea/Tea/Riccardo verified.

## §7 Cross-link docs iter 82

- Close audit: `docs/audits/2026-05-18-iter-82-CLOSE-audit.md` (Opus indipendente review documented via Codex Pattern V + code-reviewer dual verify)
- Plan: `docs/superpowers/plans/2026-05-18-blockly-ux-overhaul.md` (1735 LOC TDD bite-sized)
- Codex Pattern V output: `/tmp/codex-verify-iter82-blockly-ux.txt` (5570 LOC BLOCK-PUSH verdict — 3 HIGH + 5 MED + 2 LOW)
- Code-reviewer output: full transcript in agent BG task ab9b77fcc33106faa (FIX-BEFORE-PUSH 3 CRITICAL + 3 HIGH + 7 MED + 8 LOW + 1 nit)
- Push origin: `29a2a0d4..f69a3a8a` 9 commits iter 82 batch LANDED remote
- baseline-tests.txt: 14457 → 14489 sync DONE
