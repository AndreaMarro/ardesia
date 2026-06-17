# Swarm 1 — Compile + Upload One-Shot Bug — STATUS

Branch: `fix/swarm-1-compile-upload-one-shot-bug-2026-05-29`
Worktree: `/Users/andreamarro/swarm1-isolated` (isolated from contested main worktree)
Started: 2026-05-29 00:20
Closed: 2026-05-29 00:48

## STATE: ready-for-merge (pending codex review)

## ROOT_CAUSE

`HomeCompileEntry.jsx` was passing `blocklyXml` state directly to ScratchEditor
as the `initialCode` prop. ScratchEditor (`src/components/simulator/panels/ScratchEditor.jsx:548-581`)
runs a `useEffect[initialCode]` that wipes the workspace (`workspace.clear()`)
and reloads from the prop, then emits a synthetic onChange.

Sequence per user Blockly edit:

1. User changes a block in the workspace.
2. Blockly's change listener fires → calls `onChange(xmlText, code)`.
3. HomeCompileEntry's `handleScratchCodeChange` runs → `setBlocklyXml(xmlText)` + `setScratchCode(code)`.
4. React re-renders the parent.
5. ScratchEditor receives a new `initialCode` value (the just-typed XML).
6. `useEffect[initialCode]` fires → `workspace.clear()` + reload + synthetic onChange.

The workspace remount disturbed the user's interaction:
"sembra che succeda niente se cambi i blocchi". After the first compile +
upload cycle, the user could not produce a meaningful second compile because
every Blockly edit got wiped by the workspace reload → so compile + upload
appeared to work "una sola volta".

This is a **state ping-pong / circular-flow bug**, not a stale closure.
PR #182 (`fix(home): handleCompile stale closure — add targetBoardId to deps`)
addressed a separate sibling bug (compile API receiving wrong fqbn after
board switch). Both bug classes share the symptom "compile only works once"
but have different root causes.

### Hypothesis falsification log

- **A. Stale closure on `cppCode` in handleCompile deps** — FALSIFIED.
  `handleCompile` reads its code from `codeOverride` first (passed via inline
  arrow `onCompile={() => handleCompile(activeSketchCode)}`), so the closure
  capture of `scratchCode` is irrelevant on the C++ path. The arrow rebuilds
  every render → fresh `activeSketchCode`.
- **B. `setCompiledHex(null)` race during compile** — INSUFFICIENT.
  Only matters if user clicks upload mid-compile; not the reported symptom.
- **C. ScratchEditor `useEffect[initialCode]` feedback loop** — CONFIRMED.
  See sequence above. Test `swarm-1-compile-stale-state.test.jsx` test C
  reproduces by simulating the real useEffect behaviour and counting reloads.
  Pre-fix: 5 user-edit emissions → 5 workspace reloads.
  Post-fix: 5 emissions → 0 reloads.

## FIX_SUMMARY

`src/components/home/HomeCompileEntry.jsx` — surgical, 45 insertions, 3 deletions.

1. Introduce `blocklyInitialCodeRef = useRef(DEFAULT_BLOCKS_BLINK)` that pins
   the value passed as `initialCode` to ScratchEditor. The ref is updated
   ONLY by intentional re-seeds (C++ → Blocks mode switch via
   `cppToBlocklyXml`).
2. Introduce `blocklyEditorKey` integer state. Bumping it forces React to
   remount ScratchEditor → its first-mount `useEffect` runs once with the
   new ref value → clean workspace load.
3. New helper `reseedBlocklyEditor(xml)` packages the ref-update + state +
   key-bump into one call.
4. Replace `<ScratchEditor initialCode={blocklyXml}>` with
   `<ScratchEditor key={blocklyEditorKey} initialCode={blocklyInitialCodeRef.current}>`.
5. In `handleModeChange`, the C++ → Blocks branch now calls
   `reseedBlocklyEditor(xml)` instead of `setBlocklyXml(xml)`.

User-edits keep updating `blocklyXml` state (the code preview consumes it,
and the cppToBlocklyXml flow needs the current value), but `blocklyXml`
NEVER flows back into ScratchEditor as `initialCode` → the feedback loop
is broken.

### File ownership respected

- Only `src/components/home/HomeCompileEntry.jsx` is touched in this swarm.
- `ScratchEditor.jsx` is untouched (it's a shared dependency — Passo Passo
  mode in the simulator + NewElabSimulator depend on its current
  `useEffect[initialCode]` reload semantics for forced step-change reloads,
  and we do NOT want to change that contract).
- `codeSync.js` is untouched.

## TESTS_ADDED

New file: `tests/unit/components/home/swarm-1-compile-stale-state.test.jsx`
(401 lines, 5 tests).

- **A**: Re-compile after first cycle picks up NEW Blockly-derived C++
  (regression guard for the user-visible symptom).
- **B**: Re-compile after edits sends fresh hex to UniversalUploadButton
  (different content length proves replacement, not cache reuse).
- **C**: ScratchEditor `initialCode` prop NEVER causes useEffect reload
  after user onChange (the REAL regression guard — this test relies on a
  stub that mirrors the real ScratchEditor's `useEffect[initialCode]`
  behavior; pre-fix: 5 reloads, post-fix: 0 reloads). Validated as a
  proper regression guard — fails without the fix, passes with it.
- **D**: C++ → Blocks mode switch DOES trigger an intentional remount
  (key bump) so cppToBlocklyXml output reaches the workspace cleanly.
- **E**: `compileStatus` transitions success → compiling → success on
  second cycle (locks down the "compile una sola volta" symptom).

### Regression-guard validation

Stashed the fix; ran the new test. Result: test C fails with
`expected [...] to have a length of +0 but got 5`. Restored the fix; all
5 pass. The test correctly distinguishes pre/post-fix behavior.

## VALIDATION RUN

- New test: `npx vitest run tests/unit/components/home/swarm-1-compile-stale-state.test.jsx`
  → 5/5 PASS.
- `tests/unit/components/simulator/panels/` (full suite, 98 tests) → 98/98 PASS
  (ScratchEditor + ScratchCompileBar contracts preserved).
- `npm run build` → exit 0, 33 precache entries, 2641 KiB (no bundle size regression).

## PRE-EXISTING TEST FAILURES (NOT CAUSED BY SWARM 1)

Verified by stashing the fix and re-running:

- `tests/unit/components/home/HomeCompileEntry-callback.test.jsx` — 1 fail
  pre-existing (legacy n8n provider expectations).
- `tests/unit/components/home/HomeCompileEntry-tabs.test.jsx` — 1 fail
  pre-existing.
- `tests/unit/components/home/HomeCompileEntry-codekit-layout.test.jsx` — 1 fail
  pre-existing.
- `tests/unit/features/elabBlocks/codeSync.test.js` — 8 fails pre-existing
  (cppToBlocklyXml bidirectional translator missing).

These are pre-existing failures from PRs in the 11-PR chain shipped today
(likely from the i18n migration #174 and Renesas wire-up #172). Swarm 1
does not touch these surfaces.

## CODEX_VERDICT

Pending — no `codex:rescue` agent available in this Claude Code session
(only Read + Bash tools provided to the orchestrator). The user should
review via Codex Companion separately or via the orchestrator (main
Claude session) after this swarm closes.

Areas a Codex pass should specifically check:

1. **React 18 strict-mode double-effect** — the new `useRef` + `useState`
   key-bump pattern is strict-mode safe (refs survive double-effect, key
   bump triggers proper remount).
2. **`handleModeChange` deps array** — `reseedBlocklyEditor` was added.
   This is a stable `useCallback` (empty deps), so `handleModeChange`
   doesn't churn unnecessarily.
3. **Other useCallback deps in the same file** — `handleScratchCodeChange`
   has empty deps and only calls state setters → fine. `handleCompile`
   deps `[scratchCode, targetBoardId]` are unchanged (PR #182 fix
   preserved).
4. **Side effects in setState** — none introduced. `reseedBlocklyEditor`
   updates a ref then dispatches a setState — refs are writable outside
   render, this pattern is idiomatic.

## BLOCKERS

- The shared `/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder` working tree
  was contested by a parallel orchestrator process (branch kept being
  switched between bash calls; the worktree I created inside elab-builder
  was reaped). Worked around by creating an isolated worktree at
  `/Users/andreamarro/swarm1-isolated` symlinked to node_modules. The PR
  can be opened from this worktree.
- 11 pre-existing test failures noted above. Swarm 1 should NOT be blocked
  on them — they're owned by other surfaces (i18n, R4 wire-up, code
  bidirectional translator).

## NEXT STEPS

1. Commit the fix + the test in this isolated worktree.
2. Push `fix/swarm-1-compile-upload-one-shot-bug-2026-05-29` to origin.
3. Open PR against `main` with title
   `fix(home): swarm-1 compile+upload one-shot bug`.
4. Orchestrator (main Claude session) integrates after swarms 2-5 close.

