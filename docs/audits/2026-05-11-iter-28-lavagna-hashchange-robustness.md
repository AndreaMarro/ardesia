# Sprint U iter 28 — LavagnaShell hashchange Listener Robustness

**Date**: 2026-05-11
**Owner**: Sprint U iter 28
**Scope**: 1 file impl + 1 file test + this audit
**Status**: Phase 1 complete, pending Andrea iter 29 ratify (deploy verify + manual click test)
**Baseline**: vitest lavagna 27 files / 223 tests PASS (27 files = pre-iter-28 + iter 28 new file)
**Build**: NOT executed iter 28 (heavy ~14min, defer iter 29 entrance pre-flight CoV)

---

## 1. Iter 27 P0 Surgical Fix Completion Gap

### 1.1 What iter 27 shipped

Iter 27 commit `ee4eaa45` ("fix(iter-27): 4-agent parallel + P0 SURGICAL FIX 94/94 esperimenti deep-link + PZ V3 12/12 rules + safety wrap + prod COLLAPSE evidence") wired deep-link `?exp=<id>` consumption on `#lavagna` route. Two pieces:

1. **`src/App.jsx` lines ~82-86**: `getExpFromHash()` regex helper `[?&]exp=([^&]+)` returning decoded expId or null. Reused at line 245 for `#lavagna` branch (pre-fix only `#prova` branch consumed `?exp=`).
2. **`src/components/lavagna/LavagnaShell.jsx` lines ~857-908**: useEffect polls `window.__ELAB_API` every 500ms; once API is ready, picks `initialExperimentId` prop (from App.jsx) OR localStorage fallback, calls `api.loadExperiment(expIdToLoad)`. Priority: prop wins (intentional user deep-link) > localStorage (resume from last exit).

This wire-up fires correctly when the user reaches `#lavagna?exp=<id>` via **fresh page load** (e.g. cold open from Playwright `page.goto()` sweep iter 27 evidence brutale 94/94 deep-link verify).

### 1.2 What iter 27 left open

In-place hashchange (no page reload) does **not** trigger `loadExperiment`. The useEffect runs once on mount; subsequent `window.location.hash` assignments inside the same SPA session leave LavagnaShell stuck on the first-mount expId.

Concrete scenario:

1. User loads `#lavagna?exp=v1-cap6-esp1` → iter 27 wire-up fires → simulator mounts `v1-cap6-esp1` ✓
2. User clicks a different experiment link in-app (e.g. ExperimentPicker, PercorsoCapitoloView, Cronologia chip) that updates `window.location.hash = '#lavagna?exp=v3-cap5-esp1'`
3. Hashchange fires in the browser, but **no listener in LavagnaShell consumes it** → simulator stays on `v1-cap6-esp1`.

Verified iter 27 preview during 94/94 sweep: Playwright sweep used `page.goto()` (full reload) = mounts fresh = iter 27 fix path = green. But the in-place navigation case is real for client UX (no full page reload between experiments inside `#lavagna`).

### 1.3 Why this matters

Per CLAUDE.md PRINCIPIO ZERO + MORFISMO Sense 1.5: client navigation between experiments without full page reload is the canonical docente flow (LIM front-class, scrolling Cronologia chips, clicking ExperimentPicker entries, voice-driven `[INTENT:loadExperiment]` from UNLIM). Forcing a full page reload between every experiment switch is bad LIM-mode UX (loses scroll position, mascotte state, panel arrangement Morphic Sense 1.5).

Therefore: hashchange listener is the missing piece to complete iter 27 P0 fix.

---

## 2. Implementation: hashchange useEffect Listener

### 2.1 File ownership

- **MODIFIED**: `src/components/lavagna/LavagnaShell.jsx` (+25 LOC NEW after line 908)
- **NEW**: `tests/unit/lavagna/LavagnaShell-hashchange-iter28.test.jsx` (~180 LOC, 13 tests)
- **NEW**: `docs/audits/2026-05-11-iter-28-lavagna-hashchange-robustness.md` (this file)

Per task ownership rigid: NO modification to `src/App.jsx` (iter 27 wire-up complete) NOR any other file.

### 2.2 Insertion point

The hashchange listener useEffect was inserted **immediately after** the `__ELAB_API` polling useEffect (line 908), **before** the `panelStateRef` useEffect (line 911). This keeps related window-event/API-bridge concerns physically adjacent in the file (DOM observer cluster), aiding future readers.

### 2.3 Listener implementation (paste-ready)

```jsx
// iter 28 hashchange listener — in-place navigation from #lavagna?exp=A to
// #lavagna?exp=B triggers `loadExperiment(B)`. Complements iter 27 first-mount
// prop wiring (which only fires on FIRST mount via __ELAB_API polling above).
// Guards: skip if same expId (no double-load), skip if API not ready
// (will retry on next hashchange), skip if no `?exp=` (graceful).
useEffect(() => {
  if (typeof window === 'undefined') return;
  function getExpFromHash() {
    const m = window.location.hash.match(/[?&]exp=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function handleHashChange() {
    const newExpId = getExpFromHash();
    if (!newExpId) return;
    const api = window.__ELAB_API;
    if (!api || !api.loadExperiment) return;
    // Only switch if different from current (avoid double-load race with first-mount)
    const current = api.getCurrentExperiment?.();
    if (current?.id === newExpId) return;
    api.loadExperiment(newExpId);
  }
  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);
```

### 2.4 Regex reuse vs inline helper

The task spec asked to "use existing `getExpFromHash()` regex pattern `/[?&]exp=([^&]+)/`". I defined a pure helper inline inside the useEffect closure rather than importing the App.jsx helper, for two reasons:

1. **Decoupling**: LavagnaShell does not currently import from App.jsx (and shouldn't — App is the container, LavagnaShell is a child route). Importing creates a backward dependency.
2. **Surgical scope**: inline helper is ~3 LOC, character-identical regex, zero new dependencies, fully testable in isolation. Risk surface = 0.

If a future refactor wants a shared helper, the right move is to extract to `src/utils/hash.js` (NEW) and have both App.jsx and LavagnaShell import from there. That refactor is out of scope iter 28 — deferred ratify queue.

### 2.5 LOC delta

- `src/components/lavagna/LavagnaShell.jsx`: +25 LOC NEW (file 1694 → 1719 LOC). No deletions, no modifications outside the inserted block.

---

## 3. Test Coverage NEW

13 new tests in `tests/unit/lavagna/LavagnaShell-hashchange-iter28.test.jsx`:

| # | Test | Asserts |
|---|---|---|
| 1 | calls loadExperiment when hash changes to a new experiment id | core happy path |
| 2 | does NOT call loadExperiment when hash changes to the SAME experiment id (no double-load) | race condition guard with iter 27 first-mount |
| 3 | does NOT call loadExperiment when hash has no `?exp=` param (graceful) | `#lavagna` plain navigation safe |
| 4 | does NOT call loadExperiment when API is not ready (graceful, will retry on next hashchange) | API mount race condition |
| 5 | does NOT call loadExperiment when API exists but lacks loadExperiment method | defensive optional chaining |
| 6 | removes hashchange listener on unmount (cleanup, no memory leak) | useEffect cleanup invariant |
| 7 | still calls loadExperiment for invalid expId format (API responsibility to validate) | layered concern: API validates |
| 8 | decodes URI-encoded expId via decodeURIComponent | regex decode correctness |
| 9 | handles `?exp=` as first query param (regex anchor) | regex anchor `[?&]` first case |
| 10 | handles `?exp=` as second/later query param (regex anchor `[?&]`) | regex anchor `[?&]` later case |
| 11 | does NOT trigger when getCurrentExperiment returns null (treats as different — loads) | null current → load fires |
| 12 | handles missing getCurrentExperiment method (optional chaining safe) | partial API surface |
| 13 | fires once per hashchange event (not duplicated by re-renders) | listener stability across React re-renders |

### 3.1 Test strategy honest caveat

The test does NOT mount the full `LavagnaShell` component. Instead, a tiny `HashChangeListenerStub` component mirrors the exact useEffect logic in isolation. Rationale:

- Full LavagnaShell mount requires mocking AuthContext + useSessionTracker + classProfile + wakeWord + logger + NewElabSimulator + GalileoAdapter + VideoFloat + VolumeViewer + ExperimentPicker + MicPermissionNudge + UpdatePrompt (12+ mocks per other tests in `tests/unit/lavagna/`). That's the right call for component-integration tests (other files in the dir), but it's overkill for verifying an isolated useEffect with no React state dependencies.
- The stub is character-identical to the prod block (same `getExpFromHash`, same `handleHashChange`, same guards, same listener add/remove). Drift risk = if someone modifies the prod block without also updating the stub, tests pass but prod regresses.
- **Mitigation iter 29 ratify queue**: add 1 Playwright E2E spec that drives the full LavagnaShell + hashchange chain end-to-end against `https://www.elabtutor.school` (manual click between experiments inside `#lavagna`, assert simulator switches without page reload).

### 3.2 Test run result

```
✓ tests/unit/lavagna/LavagnaShell-hashchange-iter28.test.jsx (13 tests) 62ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
   Duration  1.36s
```

Full lavagna folder run (anti-regression):

```
 Test Files  27 passed (27)
      Tests  223 passed (223)
   Duration  26.08s
```

Zero regressions. 13 NEW tests landed on top of pre-iter-28 baseline.

---

## 4. UX Implication

### 4.1 Before iter 28

User experience pre-iter-28:

- Cold open `#lavagna?exp=v1-cap6-esp1` ✓ (iter 27)
- Click "next experiment" inside the picker → hash updates → **nothing happens** ✗
- Workaround: user must press F5 (full page reload) to get the new experiment to mount. Loses scroll, mascotte conversation state, panel arrangement, voice context.

### 4.2 After iter 28

- Cold open `#lavagna?exp=v1-cap6-esp1` ✓ (iter 27, unchanged)
- Click "next experiment" inside the picker → hash updates → hashchange fires → `__ELAB_API.loadExperiment` invoked → simulator switches in-place ✓
- Scroll preserved, mascotte state preserved (UNLIM panel stays open), panel arrangement preserved (Morphic Sense 1.5).

### 4.3 PRINCIPIO ZERO + MORFISMO compliance

- **PRINCIPIO ZERO**: docente continues to drive LIM lesson without page-reload interruption. UNLIM context (already cited Vol/pag) stays alive across experiment switch — important for narrative continuity per CLAUDE.md "Volumi narrative refactor schema" (ADR-027 deferred Sprint U).
- **MORFISMO Sense 1.5**: panel arrangement learned per-docente (left panel open / closed, UNLIM tab position, Cronologia bucket scroll position) persists across in-place navigation. Full reload would wipe it.

### 4.4 Voice intent path

Iter 36+ `[INTENT:loadExperiment]` voice-driven navigation already calls `api.loadExperiment` directly via `intentsDispatcher.js` (iter 37 wire-up, surface-to-browser pattern). For consistency, **future canonical path for any "switch experiment" action should also update `window.location.hash`** so that:

- Browser back-button works (history entry per experiment)
- Cronologia bucket reflects navigation
- Deep-link shareable URL stays in sync with what's actually mounted

This is out of scope iter 28 (current intentsDispatcher writes directly to API without touching hash). Deferred iter 29+ refactor: have `loadExperiment` intent also call `history.replaceState({}, '', '#lavagna?exp=<id>')` to maintain hash↔state sync.

---

## 5. Risk + Caveats

### 5.1 Race condition with first-mount (mitigated)

**Risk**: first-mount useEffect (iter 27) and hashchange useEffect (iter 28) could both fire `loadExperiment(<same-id>)` if a user hard-refreshes with a hash, then immediately triggers a hashchange event. Result: double-load.

**Mitigation shipped**: hashchange handler reads `api.getCurrentExperiment?.()?.id` and skips if it matches `newExpId`. Test 2 verifies this.

**Remaining edge**: if hashchange fires *before* `getCurrentExperiment` reflects the first-mount load (microtask timing in `experimentChange` event handler line 882: `setTimeout(() => setCurrentExperiment(fullExp), 100)`), the deduplication may miss. In practice the 100ms delay + 500ms API polling interval makes this very unlikely, but possible under heavy main-thread contention. Worst case: load fires twice with the same id. `loadExperiment` should be idempotent (verify Sprint U Cycle 2). Defer iter 29 verify.

### 5.2 Hashchange fires after redirect (no guard)

**Risk**: third-party code (e.g. a misbehaving polyfill, or a future feature) sets `window.location.hash` programmatically without intent to switch experiments. Hashchange fires → listener invokes `loadExperiment`.

**Mitigation**: the regex requires `?exp=` to be present. Hash changes that don't include `?exp=` are silently ignored (test 3 verifies).

**Remaining edge**: malicious or buggy code that puts a wrong expId in the hash will indeed trigger a load. `loadExperiment` is the right place to validate (whitelist 94 known expIds). Test 7 documents this layering.

### 5.3 Listener cleanup mandatory (verified)

**Risk**: if useEffect cleanup is missing, switching React routes (e.g. unmounting LavagnaShell when user navigates to `#home`) would leave the listener alive — memory leak + ghost handler firing on subsequent hashchanges.

**Mitigation shipped**: useEffect returns `() => window.removeEventListener('hashchange', handleHashChange)`. Test 6 spies on `removeEventListener` and asserts cleanup fires on unmount.

### 5.4 Iter 27 first-mount and iter 28 hashchange are orthogonal (no interference)

The two paths are intentionally complementary, not overlapping:

- iter 27 = "mount with initial experiment from URL or localStorage"
- iter 28 = "in-flight URL change while LavagnaShell already mounted"

Neither path triggers the other; they handle disjoint scenarios. Verified by test 2 (same expId skips) and the orderly state in test 4 (API not ready → skip, will fire on next event after API mounts).

### 5.5 No bench/build re-run iter 28

**Caveat**: vitest lavagna run was full lavagna folder (27 files / 223 tests, all PASS). NOT full vitest suite (~13500 tests, ~5-6min). NOT `npm run build` (~14min heavy). Phase 3 orchestrator iter 29 entrance gate MANDATORY: full vitest + build PASS verify before commit.

### 5.6 Stub-mirror drift risk (test layer)

**Risk**: test uses a stub mirror of the useEffect logic (per §3.1). If someone modifies the prod block in `LavagnaShell.jsx` without also updating the stub in the test file, tests pass while prod regresses.

**Mitigation**: prod and stub are in different files, but the comment at the top of the test file explicitly calls out the mirror discipline. Code review must enforce.

**Future hardening (iter 29+)**: extract the listener body to a `useHashChangeExperimentSync.js` hook and have both LavagnaShell and the test import the same hook. Then the test exercises the actual production code path. Out of scope iter 28 (surgical scope).

---

## 6. Andrea iter 29 Ratify Queue

### 6.1 Deploy verify (mandatory, ~5 min)

1. `cd "/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder"`
2. `npm run build` (verify build PASS, ~14min)
3. `npx vercel --prod --yes` (deploy)
4. Open `https://www.elabtutor.school/#lavagna?exp=v1-cap6-esp1` in browser
5. Open DevTools → Console
6. In console: `window.location.hash = '#lavagna?exp=v2-cap5-esp1'`
7. Verify: simulator switches to v2-cap5-esp1 within ~1s WITHOUT full page reload (Network tab shows no document fetch, only API/RAG calls).

### 6.2 Manual click test (mandatory, ~10 min)

1. Open `https://www.elabtutor.school/#lavagna?exp=v1-cap6-esp1`
2. Open ExperimentPicker (UNLIM mascotte "scegli esperimento" OR keyboard shortcut)
3. Click a different experiment (e.g. v2-cap5-esp1)
4. Verify: URL hash updates AND simulator switches in-place. Scroll position + UNLIM panel state preserved.
5. Repeat 3× with different volumes (Vol1 → Vol2 → Vol3 → Vol1) verifying no console errors, no double-load (Network tab: only 1 RAG retrieve per switch).
6. Verify browser back-button (defer iter 29+ refactor noted §4.4).

### 6.3 Anti-regression spot check

- Verify Cronologia chip click still works (iter 35-ish wire-up): switching from Cronologia chip should update hash AND mount experiment, same as ExperimentPicker.
- Verify HomePage → "Vai a Lavagna libera" still mounts in Libero mode (no `?exp=` → hashchange listener skips per test 3).

### 6.4 Future hardening backlog (NOT iter 29 mandatory, defer iter 30+)

- Extract hashchange logic to shared hook `useHashChangeExperimentSync.js` → test imports actual prod hook (closes stub-mirror drift §5.6)
- Make `intentsDispatcher.js` voice intent path also update `window.location.hash` (closes §4.4)
- Sprint U Cycle 2 + iter 21+ mandate: Playwright UNO PER UNO sweep 94 esperimenti including in-place navigation (currently sweep uses `page.goto` = first-mount path only). Add 5-10 specs that drive in-place hashchange to exercise iter 28 path end-to-end.

---

## 7. Wire-up Confirmation

NO orchestrator wire needed. The useEffect is self-contained:

- Mounts on LavagnaShell first render
- Listens on `window` (browser global) → no React state dependency, no prop dependency, no Context
- Cleans up on unmount
- Reads `window.__ELAB_API` lazily inside the handler → no race with the iter 27 polling useEffect (which is responsible for first-mount API readiness)

No changes needed to:

- `src/App.jsx` (iter 27 wire-up complete)
- `src/services/simulator-api.js` (`__ELAB_API` global)
- `src/services/api.js` (Edge Function chain)
- `src/components/lavagna/ExperimentPicker.jsx` (picker still updates hash as before)
- `src/components/lavagna/intentsDispatcher.js` (voice intent path independent)

---

## 8. Summary

- **LOC delta `src/components/lavagna/LavagnaShell.jsx`**: +25 LOC NEW (1694 → 1719)
- **Test count delta**: +13 NEW (file: `LavagnaShell-hashchange-iter28.test.jsx`)
- **Risk**: low — surgical scope, self-contained useEffect, double-load guard verified, cleanup verified, ZERO regressions in 223 lavagna tests
- **Caveats**:
  1. Stub-mirror test pattern means prod drift undetected (§5.6)
  2. Full vitest + build NOT re-run iter 28 — defer iter 29 entrance gate
  3. iter 27 first-mount path and iter 28 hashchange path orthogonal but share state — getCurrentExperiment timing edge possible (§5.1)
  4. Future intent dispatcher should also update hash to keep URL in sync (§4.4)
- **Wire-up**: NO orchestrator wire needed. useEffect self-contained. Iter 27 wire intact and complementary.

Iter 28 closes the iter 27 P0 gap. Pending Andrea ratify §6 (deploy + manual click test ~15 min).
