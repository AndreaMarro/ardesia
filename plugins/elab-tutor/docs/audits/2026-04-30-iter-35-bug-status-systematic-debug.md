# Iter 35 Bug Status — Systematic Debug Phase 1
**Date**: 2026-04-30  
**Method**: diff verification + source reading, NO fixes applied  
**Anti-inflation**: commit message claims NOT trusted without diff verification

---

## Bug 1 — UNLIM tabs sovrapposizione

**Commit claimed**: `7f963c4`  
**Status**: ✅ FIXED VERIFIED  
**Confidence**: HIGH

**Diff evidence**: `GalileoAdapter.jsx` lines 656-662 — tab bar (`<button>PERCORSO</button>` + `<button>GUIDA</button>`) removed. Only CHAT rendered.  
**Root cause addressed**: Yes. The 3 tabs were duplicate navigation (PERCORSO duplicated the top ModalitaSwitch; GUIDA was legacy iter 26 ADR-025 deprecated). Removal is the correct fix.  
**Residual risk**: None for this specific bug. The orphan render blocks (688-714) were addressed separately in Bug 4 fix.

---

## Bug 2 — Lavagna persistence "premi Esci scritti spariscono"

**Commit claimed**: `3db89e1`  
**Status**: ❌ NOT FIXED — fix is logically broken  
**Confidence**: HIGH

**Root cause in fix**: `DrawingOverlay.jsx:126` initializes `lastLocalSaveAtRef = useRef(0)`. The fix at lines 177-183 compares `remoteTs > lastLocalSaveAtRef.current` to detect a stale remote. But `lastLocalSaveAtRef.current` is NEVER assigned after initialization — it stays `0` forever. Search confirms: only 3 occurrences of `lastLocalSaveAtRef` in the file (`:126` init, `:177` read, `:209` read). Zero writes.

**Consequence**: For any experiment that has a Supabase row with a real `updatedAt` timestamp (which is ALL real rows), `remoteTs > 0` is always true → `remoteIsNewer = true` → the guard `if (remoteIsEmpty && localHasPaths && !remoteIsNewer)` never fires → remote empty array still overwrites local cache.

**The fix only works in one narrow edge case**: remote row exists but has `updatedAt = null` (no timestamp). This is not the typical prod path.

**Evidence file**: `/src/components/simulator/canvas/DrawingOverlay.jsx:124-183`

**Phase 4 fix required**: Update `lastLocalSaveAtRef.current = Date.now()` inside `handlePointerUp` (line ~271), `handleUndo` (line ~281), `handleRedo` (line ~290), `handleClearAll` (line ~300), `handleClose` (line ~317) — anywhere `saveDrawingPaths()` is called. This stamps the ref so the timestamp comparison has a real local value to compare against.

---

## Bug 3 — Lavagna bianca Libero blank

**Commit claimed**: `3db89e1`  
**Status**: ✅ FIXED VERIFIED  
**Confidence**: HIGH

**Diff evidence**: `LavagnaShell.jsx` lines 530-538 — the ADR-025 forced redirect (`if (nextMode === 'libero') { setModalita('percorso'); return; }`) is removed. Lines 547-555 now call `api.clearAll()` + `api.setBuildMode('sandbox')` on Libero click.  
**Root cause addressed**: Yes. The old behavior explicitly redirected Libero to Percorso (ADR-025 §4.4). The new behavior correctly sets blank sandbox. The `api.clearAll()` call is protected by `typeof window !== 'undefined'` + try/catch.  
**Residual risk**: Low. If `window.__ELAB_API` is not yet mounted when user clicks Libero before the simulator loads, clearAll silently fails. Acceptable.

---

## Bug 4 — CRASH "ora crasha sempre"

**Commit claimed**: `60b8fad`  
**Status**: ✅ FIXED VERIFIED  
**Confidence**: HIGH

**Root cause correctly identified**: Commit `7f963c4` removed the tab BAR buttons but left the render blocks for `activeTab === 'percorso'` and `activeTab === 'guida'` at lines 688-714. localStorage had persisted `activeTab = 'percorso'` from before the fix, so `useState(initialTab)` re-initialized to `'percorso'`, entered the render block, hit missing deps → React render fail → crash.

**Fix**: `GalileoAdapter.jsx:440` — `useState('chat')` hardcoded (no more `initialTab` fallback). Lines 688-714 render blocks removed. The crash path no longer exists.  
**Evidence**: `git show 60b8fad` diff confirms both changes.

---

## Bug 5 — Fumetto generation broken "non viene mai fatto generare"

**Commit claimed**: `f230bce` (iter 35)  
**Status**: ⚠️ FIXED CLAIMED NOT VERIFIED (functionality exists, popup blocker may still silently fail)  
**Confidence**: MEDIUM

**Diff evidence**: `UnlimReport.jsx` — `buildStubSession()` function added (lines 563-576). `openReportWindow()` now builds a stub session when none exists (lines 589-596) instead of returning `'no-session'`/`'no-content'`. Toast feedback improved.

**What is fixed**: The "nothing happens" case when no localStorage session exists. Previously returned early with a toast but no output. Now always attempts to open a popup.

**Residual risk (REAL)**: `window.open(url, '_blank')` at line 605. Browsers block `window.open()` calls that are NOT in a user gesture synchronous callstack. `handleFumettoOpen` is `async` and does `await import('../unlim/UnlimReport')` before calling `openReportWindow()`. That `await` breaks the user gesture chain → popup is blocked → falls back to `<a download>`. The download fallback works but is not the expected "fumetto opens" behavior. This is a pre-existing structural issue.

**Evidence**: `LavagnaShell.jsx:960-980` — `handleFumettoOpen` is async with `await import()` before the `window.open()` call.

**Phase 4 fix**: Pre-import `UnlimReport` at module level (or via `lazy()` already loaded), so `handleFumettoOpen` can call `openReportWindow` synchronously within the click gesture. Alternatively wrap in a preloaded import at component mount.

---

## Bug 6 — Capitoli panel scroll/crash "non permette scorrimento e crasha"

**Commit claimed**: `ca3e941` (iter 35)  
**Status**: ✅ FIXED VERIFIED  
**Confidence**: HIGH

**Root cause confirmed in commit message**: CSS classes `.capitoloPickerOverlay`, `.capitoloPickerContent`, `.capitoloPickerClose` were referenced in JSX but NOT defined in `LavagnaShell.module.css`. Without these classes: no `overflow`, no `max-height`, content escaped viewport, clicks passed through backdrop → appeared as "crash".

**Fix**: `LavagnaShell.module.css` lines 366-434 — all 3 classes added with `overflow-y: auto`, `max-height: calc(100dvh - 48px)`, `backdrop-filter: blur(2px)`, sticky close button. `ErrorBoundary` wrapping added around both `CapitoloPicker` and `PercorsoCapitoloView`. Crash from lazy-load failures now caught.

**Evidence**: `git show ca3e941` diff + current file lines 366-434 read directly.

---

## Bug 7 — Passo Passo icona resizable

**Commit claimed**: `dcc3671` (iter 35)  
**Status**: ⚠️ FIXED CLAIMED NOT VERIFIED (misunderstanding of bug description)  
**Confidence**: MEDIUM

**What was actually fixed**: `ModalitaSwitch.module.css` — `.modeIcon` font-size 18px → 24px, hover scale 1.15, active scale 1.2. Button padding and label font-size increased. **This is a readability/visual polish fix.**

**What was NOT fixed**: The bug description says "icona NON allargabile" — this might mean the user expected the Passo Passo panel itself to be resizable (draggable/resizable FloatingWindow). The ModalitaSwitch buttons are fixed-width buttons in a top bar, NOT a resizable window. If Andrea meant the panel content is not resizable/scrollable, that is a separate issue not addressed.

**Evidence**: `dcc3671` diff only touches `ModalitaSwitch.module.css` — button sizes, icon scale. No FloatingWindow or panel resize logic added.

**Remaining gap**: If "resizable" means the Passo Passo content view (currently not shown as a FloatingWindow, it uses `LessonReader` inside `css.dashboardView`) should be draggable/resizable → NOT fixed. `LavagnaShell.jsx:1121` shows `LessonReader` inside a static `div.dashboardView`, not a FloatingWindow.

---

## Bug 8 — Wake word "Ehi UNLIM"

**Status**: 🔍 NOT INVESTIGATABLE (no commit claims to fix this)  
**Confidence**: HIGH (code present, behavior unknown)

**Code status**: `wakeWord.js` implementation is complete (lines 1-191). `startWakeWordListener` + WAKE_PHRASES 11 variants + `continuous: true` + auto-restart on `onend`. `LavagnaShell.jsx:432-514` — lifecycle wired: `wakeWordEnabled` state (default `true` unless localStorage `'off'`), starts/stops listener on toggle.

**Likely issue**: `TERMINAL_ERRORS = new Set(['not-allowed', 'service-not-allowed'])` — if mic permission is denied by Chrome (common in incognito, or if user denied previously), `isListening` flips to `false` and the listener dies silently with one log. The user sees nothing. There is no UI feedback when wake word is disabled due to mic denial.

**Evidence**: `wakeWord.js:127-138` — terminal error handling stops listener, `terminalErrorLogged = true`, one `logger.warn`. No event dispatched to UI. User gets no toast/indicator.

**Phase 4 fix**: Dispatch a custom event on terminal error so LavagnaShell can show a toast "Microfono non disponibile — attiva il permesso mic per usare 'Ehi UNLIM'". Also: expose `wakeWordActive` state to AppHeader for mic indicator.

---

## Bug 9 — Onnipotenza "tantissime azioni non sono fatte o non fatte con precisione"

**Status**: ❌ NOT FIXED — partial implementation  
**Confidence**: HIGH

**Evidence from source**: `useGalileoChat.js` — `executeAzioneTags()` function has 46 `case` statements (grep count verified). These map to actions like `play`, `pause`, `highlight`, `addcomponent`, `addwire`, `compile`, `undo`, `redo`, `clearall`, `setvalue`, `screenshot`, `describe`, `movecomponent`, `removewire`, `openeditor`, `closeeditor`, `switcheditor`, `setcode`, `appendcode`, `getcode`, `resetcode`, `loadblocks`, `fullscreenscratch`, `exitscratchfullscreen`, `opentab`, `openvolume`, `openchat`, `closechat`, `setbuildmode`, `nextstep`, `prevstep`, `showbom`, `listcomponents`, `getstate`, `showserial`, `serialwrite`, `highlightpin`, `quiz`, `youtube`, `createnotebook`, `interact`, `removecomponent`, `measure`, `diagnose`, `loadexp`.

**CRITICAL GAP**: The dispatcher (`scripts/openclaw/dispatcher.ts`) with the full 62-tool ToolSpec registry is NOT wired into the prod path. The `[AZIONE:cmd]` tags in `useGalileoChat.js` are a separate client-side parser, NOT the ClawBot 62-tool OpenClaw dispatcher. The Supabase Edge Function `unlim-chat` does NOT call any server-side dispatcher post-LLM — confirmed in CLAUDE.md: "Dispatcher 62-tool NOT in production path — only L2 template router wired."

**Many actions are also stubs**: `diagnose` (line 134-136) only `logger.info` — no actual diagnose flow. `measure` (line 128-132) only logs. `removewire` calls `api.removeWire(parseInt(parts[1]))` — wire index-based removal is fragile.

**Phase 4 fix**: This requires a full iter. Minimum viable: (a) wire `[AZIONE:diagnose]` to actual `api.unlim.setDiagnoseMode(true)` call, (b) wire `[AZIONE:measure]` to `api.getMeasurement()` if it exists, (c) document which of the 46 handlers actually map to working `__ELAB_API` methods vs stubs.

---

## Bug 10 — Tea homepage + Cronologia integration

**Status**: ⚠️ FIXED CLAIMED NOT VERIFIED (shipped code, NOT verified in prod)  
**Confidence**: MEDIUM

**Code evidence**:
- `HomePage.jsx` NEW (~280 LOC): 5 cards (Glossario, Lavagna, Manuale, UNLIM, Chi siamo). Committed `b74a805`.
- `HomeCronologia.jsx` NEW (~230 LOC): reads `elab_unlim_sessions` localStorage + `description_unlim` field from Supabase sessions. Committed `b74a805`.
- `App.jsx:62,114` — `'home'` added to `VALID_HASHES`, `initialPage` defaults to `'home'` (was `'showcase'`). Wiring confirmed.

**Critical gap**: `unlim-session-description` Edge Function (`eeca41c`) — commit message says **"NOT YET DEPLOYED"**. The `description_unlim` column needs an `ALTER TABLE unlim_sessions ADD COLUMN description_unlim TEXT` migration not applied. So `HomeCronologia.jsx:226` will always use the local fallback `localFallbackSummary()` — UNLIM-generated descriptions will never appear until Andrea deploys the function and applies the migration.

**Cronologia only shows localStorage sessions** — if user has no sessions in `elab_unlim_sessions`, the list is empty. Supabase sessions are NOT fetched (no Supabase call in `HomeCronologia.jsx`). This may surprise users who expect cross-device history.

---

## Summary Table

| # | Bug | Status | Confidence |
|---|-----|--------|-----------|
| 1 | UNLIM tabs sovrapposizione | ✅ FIXED VERIFIED | HIGH |
| 2 | Lavagna persistence premi Esci | ❌ NOT FIXED (`lastLocalSaveAtRef` never written) | HIGH |
| 3 | Lavagna bianca Libero blank | ✅ FIXED VERIFIED | HIGH |
| 4 | CRASH ora crasha sempre | ✅ FIXED VERIFIED | HIGH |
| 5 | Fumetto generation broken | ⚠️ PARTIAL (popup blocker breaks async path) | MEDIUM |
| 6 | Capitoli panel scroll/crash | ✅ FIXED VERIFIED | HIGH |
| 7 | Passo Passo icona resizable | ⚠️ PARTIAL (visual only, panel not resizable) | MEDIUM |
| 8 | Wake word "Ehi UNLIM" | 🔍 NOT INVESTIGATABLE (mic permission silent fail, no fix attempted) | HIGH |
| 9 | Onnipotenza azioni incomplete | ❌ NOT FIXED (46 client cases, dispatcher NOT wired, several stubs) | HIGH |
| 10 | Tea homepage + Cronologia | ⚠️ PARTIAL (code shipped, Edge Fn NOT deployed, no Supabase fetch) | MEDIUM |

---

## P0 Punch List — Prioritized iter 35+

### P0 — Must fix before release

**P0-A: Bug 2 — Persistence still broken**
- File: `/src/components/simulator/canvas/DrawingOverlay.jsx:126`
- Fix: Add `lastLocalSaveAtRef.current = Date.now()` inside every `saveDrawingPaths()` call site: `handlePointerUp` (~line 271), `handleUndo` (~281), `handleRedo` (~290), `handleClearAll` (~300), `handleClose` (~317).
- Impact: Without this, drawings still wipe on Esci when Supabase has any real row.
- Effort: 5 lines.

**P0-B: Bug 8 — Wake word silent failure**
- File: `/src/services/wakeWord.js:127-138`, `/src/components/lavagna/LavagnaShell.jsx`
- Fix: On `TERMINAL_ERRORS`, dispatch `new CustomEvent('elab-wake-word-denied')` so LavagnaShell can show a toast. Add UI indicator when `wakeWordActive === false && wakeWordEnabled === true`.
- Impact: User has no idea wake word is dead. Critical UX gap for a marketed feature.
- Effort: 15-20 lines.

### P1 — High priority

**P1-A: Bug 5 — Fumetto popup blocked by async import**
- File: `/src/components/lavagna/LavagnaShell.jsx:960-980`
- Fix: Pre-load `UnlimReport` at component mount (e.g. `import('../unlim/UnlimReport')` in a `useEffect` on mount, store reference). Then `handleFumettoOpen` can call synchronously within click gesture.
- Impact: Most users will get a download instead of a popup open — confusing.
- Effort: 10-15 lines.

**P1-B: Bug 9 — Onnipotenza stub actions**
- Files: `/src/components/lavagna/useGalileoChat.js:128-136`
- Fix: Wire `diagnose` case to `api.unlim.setDiagnoseMode?.(true)`. Wire `measure` to actual measurement call. Document which handlers have no backing API method.
- Impact: AI claims to do things it can't. Erodes trust.
- Effort: 20-30 lines for diagnose+measure; full dispatcher wire is a multi-day effort.

### P2 — Ship before public demo

**P2-A: Bug 10 — Cronologia UNLIM descriptions never appear**
- File: `supabase/functions/unlim-session-description/index.ts` — NOT deployed
- Action: Andrea to run `ALTER TABLE unlim_sessions ADD COLUMN IF NOT EXISTS description_unlim TEXT` + `supabase functions deploy unlim-session-description`.
- Effort: 5 min Andrea action.

**P2-B: Bug 7 — Passo Passo panel truly not resizable**
- If "allargabile" means the full Percorso/Passo Passo content view — currently static `div.dashboardView`, NOT a FloatingWindow.
- Fix: Wrap `LessonReader` in a `FloatingWindow` component (already exists) with `defaultSize` + drag handle.
- Effort: 30-40 lines.

---

*Phase 1 investigation complete. Zero fixes applied.*
