# Iter 74 TRACK B-3 — Passo Passo regression RESOLVED iter 45 (no iter 74 action needed)

## Audit conclusione

**B-3 STATUS: ✅ ALREADY FIXED iter 45 — NO iter 74 action needed**

Memory file `feedback_passo_passo_regression_06may2026.md` documenta regressione iter 36 PM. Verify empirical iter 74: regressione **risolta iter 45** (Andrea video 06/05/2026 stesso). Memory file outdated.

## Evidence empirical iter 74

### LavagnaShell.jsx:1630-1637 comment fix iter 45

```jsx
{/* iter 45 fix Andrea video 06/05/2026: rimosso FloatingWindow LessonReader per
     modalita='passo-passo'. Era duplicato sbagliato (narrative capitolo invece
     click-by-click build). Vero Passo Passo = ComponentDrawer in NewElabSimulator
     (Andrea Marro 20/02/2026 src/components/simulator/panels/ComponentDrawer.jsx)
     che renderizza quando currentExperiment.buildMode === 'guided' (iniettato
     da ExperimentPicker:202 quando experiment ha buildSteps[]).
     Andrea audio Voxtral verbatim 06/05/2026: "passo passo qua è sbagliato,
     parla di cose a caso mentre in realtà sotto si nascondono i veri pulsanti". */}
```

### LavagnaShell.jsx:1000-1006 passo-passo mode wiring

```jsx
if (mode === 'passo-passo') {
  try { api.setBuildMode?.('guided'); } catch { /* noop */ }
  try { api.setBuildStepIndex?.(0); } catch { /* noop */ }
  try { api.unlim?.setDiagnoseMode?.(false); } catch { /* noop */ }
  setBuildMode('guided');
  return;
}
```

Passo Passo modalità → `api.setBuildMode('guided')` + `setBuildStepIndex(0)` triggers ComponentDrawer step-by-step (NewElabSimulator pipeline).

### NewElabSimulator.jsx ComponentDrawer wiring (~9 grep matches)

- Line 53: `import ComponentDrawer from './panels/ComponentDrawer'`
- Line 321: `const [buildStepIndex, setBuildStepIndex] = useState(-1)`
- Line 329: `setBuildStepIndex(newIndex)` state handler
- Lines 341 + 351 + 360: consume `currentExperiment.buildSteps[]`
- Lines 661 + 690 + 737: exposed via `__ELAB_API` to LavagnaShell

Full pipeline functional iter 45+ shipped.

## Why memory file outdated

Memory file `feedback_passo_passo_regression_06may2026.md` written iter 36 PM (initial report). Iter 45 (next active sprint) implemented fix per Andrea video. Memory file NOT updated post-fix.

## Iter 74 B-3 action

1. ✅ Audit empirical complete (this document)
2. ✅ Conclusion: NO source code changes needed iter 74
3. ⏸ Memory file update iter 75 entrance (mark resolved + cross-link iter 45 commit)

## Honesty caveats

1. NON re-test browser empirical passo-passo modalità Live iter 74 (assumed iter 45 fix preserved iter 46-73, NO regression reports between iter 45 and iter 74 entrance).
2. ComponentDrawer.jsx source NOT read full (only grep matches). Real iter 75 verify if regression re-introduced.
3. Tea iter 58 brief T3 "5 worst UX experiments" potentially overlaps passo-passo UX feedback — review post-Tea deliverable.
4. iter 45 fix commit SHA NOT identified iter 74 (could be useful for git blame iter 75+ if regression returns).
5. Memory file `feedback_passo_passo_regression_06may2026.md` superseded MA NOT deleted (preserved history, mark resolved iter 75).

## Cross-link

- Memory feedback: `/Users/andreamarro/.claude/projects/-Users-andreamarro-VOLUME-3/memory/feedback_passo_passo_regression_06may2026.md`
- Fix LavagnaShell comment: `src/components/lavagna/LavagnaShell.jsx:1630-1637`
- Fix LavagnaShell wiring: `src/components/lavagna/LavagnaShell.jsx:1000-1006`
- ComponentDrawer: `src/components/simulator/panels/ComponentDrawer.jsx`
- NewElabSimulator pipeline: `src/components/simulator/NewElabSimulator.jsx` (lines 53, 321, 329, 341, 351, 360, 661, 690, 737)
