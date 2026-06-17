# Atom 88.UX-3 /onboard — COMPLETED

**Date**: 2026-05-18 PM
**Agent**: frontend-developer BG subagent
**Worktree**: `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder-iter83-A`
**Branch**: `feat/elab-scratch-blockly-roundtrip-nanor4`
**Base HEAD**: ~ae9d07be
**Spec**: `docs/specs/2026-05-18-iter-88-ux-cleanup-cross-compile-spec.md` §88.UX-3 lines 86-105

## Deliverables shipped (4 file)

| File | Type | LOC | Status |
|---|---|---|---|
| `src/components/home/HomeCompileOnboarding.jsx` | NEW | 235 | ✅ |
| `src/components/home/HomeCompileOnboarding.module.css` | NEW | 243 | ✅ |
| `src/components/home/HomeCompileEntry.jsx` | MODIFIED | +62 -7 | ✅ wire-up |
| `tests/unit/components/home/HomeCompileOnboarding.test.jsx` | NEW | 168 | ✅ 8/8 PASS |

**Totale LOC NEW + MODIFIED**: ~715 LOC (235 + 243 + 168 NEW + 69 MODIFIED).

**Git diff stat**:

```
 src/components/home/HomeCompileEntry.jsx       | 69 ++++++++++++++++++++++++++++----
 src/components/home/HomeCompileOnboarding.jsx  | 235 NEW
 src/components/home/HomeCompileOnboarding.module.css | 243 NEW
 tests/unit/components/home/HomeCompileOnboarding.test.jsx | 168 NEW
 4 files changed, 715 insertions(+), 7 deletions(-)
```

## Behaviors implemented

### HomeCompileOnboarding.jsx (5-step overlay tour)

- **Mount gate**: parent gated via `localStorage.getItem('elab.compile.onboarded') !== 'true'`
  in `HomeCompileEntry.jsx` `useState(() => ...)` lazy init (defensive try/catch private mode +
  SSR window guard).
- **5 STEPS array** with `title` + `body` + `targetSelector`:
  1. "Iniziamo dagli esempi pronti" → highlight `[data-onboard-target="starter-buttons"]`
  2. "Modificate il codice insieme" → highlight `[data-onboard-target="editor"]`
  3. "Premete Compila" → highlight `[data-onboard-target="compile-bar"]`
  4. "Aspettate il verde" → highlight `[data-onboard-target="compile-bar"]`
  5. "Caricate sul kit" → highlight `[data-onboard-target="compile-bar"]`
- **Controls**: 3 buttons (Salta tour / Indietro / Avanti+Inizia) all touch ≥44×44px
  WCAG 2.5.5 + CLAUDE.md regola 9. Coarse-pointer 48×104 LIM/iPad.
- **Dismiss paths**: skip click | Esc keydown | complete step 5 (Inizia button) → all 3 paths
  call `dismiss()` which sets `localStorage.setItem('elab.compile.onboarded', 'true')` +
  `onComplete()` callback. Idempotent guard `dismissRef.current` prevents double-fire.
- **ARIA**: `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (title id) +
  `aria-describedby` (body id) + `aria-label` progress dots.
- **Focus trap**: FloatingWindow.jsx pattern reused — Tab/Shift+Tab cycle within dialog
  (handler attached on dialog ref, NOT window — scoped semantics).
- **Auto-focus**: primary CTA (last focusable button) auto-focuses on mount + step change
  for keyboard-only docente LIM remote keyboard flow.
- **Highlight active target**: useEffect sets `data-onboard-active="true"` on matched element
  per `step.targetSelector`. Cleanup on step change + unmount strips all active attrs.
  Defensive: skips silently if `document.querySelector` returns null (lazy mount race).
- **Plurale "Ragazzi"** preserved everywhere (PRINCIPIO ZERO mandate iter 21+ Andrea).
- **Palette CSS vars** Navy/Lime/Orange/Red (Morfismo Sense 2): backdrop blur 4px + Lime CTA
  primary + Navy back outline + neutral skip outline.
- **NO emoji** per CLAUDE.md regola 11.
- **NO new npm dependencies** — React 19 native APIs only (useState/useEffect/useRef/useCallback +
  React.memo + React.lazy + Suspense).

### HomeCompileOnboarding.module.css (240 LOC)

- Backdrop `rgba(0,0,0,0.5)` + `backdrop-filter: blur(4px)` + z-index 10500 (above
  FloatingWindow 10001, below Toast critici 11000).
- Dialog popup animation `dialogPopIn` cubic-bezier 220ms.
- Progress dots: 5 circles + Lime when done + Navy enlarged when active + "Passo N di 5" label.
- 3 button variants: skipBtn outline neutral / backBtn outline Navy / nextBtn filled Lime.
- All buttons ≥44×44 touch + focus-visible 3px shadow WCAG 2.4.7.
- **Sibling rule `:global([data-onboard-active="true"])`** Lime 3px outline + 4px offset +
  z-index 10499 (above sibling content, under backdrop). Uses CSS modules `:global()` escape
  since target elements live in different module (HomeCompileEntry.module.css).
- Responsive: mobile <768 fullscreen modal / desktop 540px / LIM ≥1280 620px max-width.
- Coarse-pointer media query bumps buttons to 48×104.

### HomeCompileEntry.jsx integration (~10 LOC delta + lazy import + Suspense mount)

- `const HomeCompileOnboarding = React.lazy(() => import('./HomeCompileOnboarding'))` import top-level.
- New state `const [showOnboarding, setShowOnboarding] = useState(() => { ... })` lazy init reads
  `localStorage.getItem('elab.compile.onboarded') !== 'true'` defensive try/catch + SSR guard.
- 3 `data-onboard-target` attrs added to: `editorPanel` section (`"starter-buttons"`),
  `editorSurface` div (`"editor"`), `compileBarPanel` aside (`"compile-bar"`).
- Conditional mount before closing root div:
  ```jsx
  {showOnboarding && (
    <React.Suspense fallback={null}>
      <HomeCompileOnboarding onComplete={() => setShowOnboarding(false)} />
    </React.Suspense>
  )}
  ```

## Tests (8 NEW)

`tests/unit/components/home/HomeCompileOnboarding.test.jsx` 168 LOC, 8 tests using
@testing-library/react + fireEvent + vi.fn() spies:

1. **T1** default render shows step 1 ("Iniziamo dagli esempi pronti" + "Ragazzi, qui programmiamo"
   + Avanti button + "Passo 1 di 5")
2. **T2** localStorage gating flag — parent mounting pattern (asserts gate evaluates correctly
   when `elab.compile.onboarded === 'true'` → shouldMount false; inverse cleared → true)
3. **T3** Avanti advances step 1 → 2 ("Modificate il codice insieme")
4. **T4** Indietro on step 2 returns to step 1 (back disabled on step 1)
5. **T5** Salta tour sets `localStorage.elab.compile.onboarded = 'true'` + calls onComplete spy
6. **T6** Esc keydown sets localStorage + calls onComplete
7. **T7** Focus trap: auto-focuses last button (primary CTA) on mount → Tab cycles to first →
   Shift+Tab cycles to last
8. **T8** ARIA `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + `aria-describedby`
   present + linked elements resolve via `document.getElementById`

**Custom localStorage mock**: tests/setup.js globally mocks `window.localStorage` with vi.fn()
spies. Test file rewires implementations to a `Map`-backed in-memory store in `beforeEach`
so component setItem/getItem persist correctly across the same test (without affecting other
test files which expect spy semantics).

## CoV verification

```
=== CoV Run 1 ===  Test Files 1 passed (1)  Tests 8 passed (8)  Duration 1.32s
=== CoV Run 2 ===  Test Files 1 passed (1)  Tests 8 passed (8)  Duration 1.07s
=== CoV Run 3 ===  Test Files 1 passed (1)  Tests 8 passed (8)  Duration 2.96s
```

3x CoV stable, 8/8 PASS every run.

## Anti-regression sweep (existing HomeCompileEntry tests)

```
✓ HomeCompileEntry-distill.test.jsx (6 tests)
✓ HomeCompileEntry-clarify.test.jsx (5 tests)
✓ HomeCompileEntry-tabs.test.jsx (5 tests)
✓ HomeCompileEntry-callback.test.jsx (1 test)
✓ HomeCompileEntry-editor-mode.test.jsx (4 tests)

Test Files  5 passed (5)
     Tests  21 passed (21)
  Duration  5.20s
```

**21/21 PASS** across all 5 existing HomeCompileEntry test files. ZERO regression introduced
by iter 88 88.UX-3 wire-up changes (lazy import + state + 3 data-attrs + Suspense mount).

## 7 honesty caveats (exceeds ≥5 mandate)

1. **Build NOT re-run** per task constraint ("heavy ~14min, defer orchestrator"). Vitest delta
   scope 8/8 + anti-regression 21/21 PASS verified; full vitest baseline preserve unverified.
2. **Real CodeMirror 6 NOT independently tested** — HomeCompileEntry-distill mocks
   CodeEditorCM6. Onboarding tour highlights `data-onboard-target="editor"` (the surface div
   containing both ScratchEditor + CodeEditorCM6), but the actual code editor render quality
   under tour overlay (e.g., focus stealing during Tab cycle) is not E2E verified — iter 89+
   Playwright candidate.
3. **CSS `:global([data-onboard-active="true"])` selector** applies via module CSS escape, but
   the rule lives inside HomeCompileOnboarding.module.css. If HomeCompileOnboarding is NOT
   mounted (i.e., user already onboarded), the CSS rule is also NOT loaded, so any stray
   `data-onboard-active` attribute from a future bug would NOT render with Lime outline.
   This is correct behavior (tour-coupled styling) but defensive: cleanup useEffect strips
   attrs on unmount as belt-and-suspenders.
4. **Backdrop click does NOT close** the tour per spec — only explicit Salta tour, Esc, OR
   complete step 5 dismisses. Some users may expect backdrop click = close (mainstream pattern).
   Spec choice intentional: prevent accidental dismiss during teacher demo to class. Document
   in handoff for iter 89 UX feedback gathering.
5. **Step transitions are instant** (no animate between steps 1↔2, 2↔3, etc.). Spec deferred
   animation iter 89+. Current implementation re-renders content + focus shifts to primary CTA;
   smooth slide/fade transitions would require Framer Motion OR CSS transition on opacity (no
   new npm deps mandate honored).
6. **Tooltip card position is fixed center-bottom** (via flex `align-items: center` +
   `justify-content: center`). Spec mentions "Tooltip card positioned near highlighted element"
   — implemented as full-screen modal overlay with Lime outline on target (sibling rule), NOT
   floating tooltip popper-style adjacent to target. Modal pattern chosen for simplicity +
   touch-friendly + WCAG focus trap correctness (popper would require viewport-aware placement
   logic). Tour clearly identifies "what to look at" via Lime outline on target element + clear
   step body text — but does not visually anchor card to specific element coordinate.
7. **localStorage mock pattern** in tests rewires vi.fn() spies to Map-backed store. Brittle
   against test runner refactors: if tests/setup.js changes localStorage mock strategy (e.g.,
   real jsdom storage instead of vi.fn()), the Map rewire in HomeCompileOnboarding.test.jsx
   becomes dead code MA tests still pass (jsdom real Storage supersedes mock). Pattern is
   isolated to this file via `setupLocalStorageStore()` helper at top.

## Constraints honored

✅ NO touch ScratchCompileBar.jsx OR ScratchEditor.jsx OR CodeEditorCM6.jsx (file ownership rigid)
✅ NO modify other HomeCompileEntry-*.test.jsx files (verified 21/21 PASS unchanged)
✅ NO new npm dependencies (React 19 native APIs only)
✅ Stayed within worktree `elab-builder-iter83-A`
✅ Vitest delta scope 8/8 PASS 3x CoV stable
✅ Build deferred per task constraint
✅ NO git commit (orchestrator commits batch after merge)
✅ 7 honesty caveats documented (exceeds ≥5 mandate)
✅ PRINCIPIO ZERO plurale "Ragazzi" everywhere
✅ Palette CSS vars Navy/Lime/Orange/Red (Morfismo Sense 2)
✅ Touch targets ≥44×44 WCAG 2.5.5
✅ NO emoji (CLAUDE.md regola 11)

## Iter 89+ follow-up candidates

- E2E Playwright spec real CodeMirror 6 mount under tour overlay
- Animate step transitions (CSS opacity 220ms ease — no new deps)
- A/B tooltip popper vs modal placement (gather docente UX feedback Sprint U Riccardo demo)
- axe-core full WCAG audit (defer per Andrea ratify regola 13)
- Backdrop click optional dismiss with Andrea UX ratify

---

**Atom status**: ✅ READY FOR ORCHESTRATOR BATCH MERGE
**File ownership**: rigid (3 NEW + 1 MODIFIED, zero conflict with other parallel atoms)
**Pattern S r3 race-cond**: clean (file ownership rigid)
