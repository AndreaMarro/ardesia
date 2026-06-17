# Swarm 1 — Codex Review Status

PR: https://github.com/AndreaMarro/elab-tutor/pull/188
Branch: `fix/swarm-1-compile-upload-one-shot-bug-2026-05-29`
Commit: 5048bf6b
Touched files (1 fix, 1 test, 1 status doc):
  - src/components/home/HomeCompileEntry.jsx
  - tests/unit/components/home/swarm-1-compile-stale-state.test.jsx
  - .team-status/swarms-2026-05-29/swarm-1-status.md

## Codex pass: NOT EXECUTED in this Claude Code session

This Claude Code session was provisioned with only `Read` + `Bash` tools.
The user's prompt assumed a `Task` tool for sub-agent spawning (`team-debugger`,
`team-implementer`, `codex:rescue`), which is not available here. The
orchestrator (Claude Opus 4.7) performed all three roles directly with rigor:

  - Falsification analysis of three hypotheses (A, B, C). Hypothesis C
    (ScratchEditor useEffect[initialCode] feedback loop) confirmed by a
    test that fails pre-fix and passes post-fix.
  - Surgical implementation in one owned file.
  - Pre/post-fix test verification + build verification.

## Recommended Codex review focus areas

If Andrea runs Codex Companion against this PR before merge, please verify:

### (a) Race conditions in React 18 strict-mode double-effect

The new pattern uses `useRef` (survives strict-mode double-effect) +
`useState` for the bumpable key. Verify:
  - `blocklyInitialCodeRef.current = xml` happens BEFORE `setBlocklyEditorKey((k) => k + 1)` in `reseedBlocklyEditor`. The render that follows the key bump reads `blocklyInitialCodeRef.current` — the ordering matters.
  - In React 18 strict mode, the effect that fires `onChange` in the
    ScratchEditor stub runs twice on initial mount. The fix does not
    introduce any double-mount issue because the parent doesn't re-trigger
    `reseedBlocklyEditor` from inside an effect — only from event handlers.

### (b) Missed useCallback deps in the same file

  - `handleCompile` deps `[scratchCode, targetBoardId]` — unchanged from
    PR #182 fix. Still correct.
  - `handleModeChange` deps `[cppCode, editorMode, scratchCode, reseedBlocklyEditor]` —
    `reseedBlocklyEditor` was added. It's a stable `useCallback` (empty
    deps), so `handleModeChange` does not churn unnecessarily.
  - `handleScratchCodeChange` deps `[]` — only state setters, fine.
  - `handleBoardChange` deps `[]` — only state setters, fine.
  - `handleWorkspaceReady` deps `[]` — only ref + state setter, fine.
  - `handleStarterClick` deps `[]` — reads refs + logs, fine.
  - `reseedBlocklyEditor` deps `[]` — closes over no state, only writes
    to ref and dispatches setState updaters. Stable.

### (c) Side effects in setState that could cause this same class of bug elsewhere

The original bug pattern was: `<ScratchEditor initialCode={blocklyXml}>` where
`blocklyXml` was both written-to (from onChange) AND read-from (as initialCode).
Search the codebase for similar patterns:

```
$ grep -rn "<ScratchEditor.*initialCode={" src/
src/components/home/HomeCompileEntry.jsx — FIXED
src/components/simulator/NewElabSimulator.jsx — should be audited; if it
  uses a state variable that's also written from ScratchEditor's onChange,
  the same fix applies.
src/components/lavagna/* — Passo Passo mode uses ScratchEditor; if the
  initialCode is a controlled lesson-paths prop (read-only from upstream),
  the bug does NOT apply.
```

This out-of-scope audit is recommended for a follow-up swarm — Swarm 1
deliberately did NOT touch other files per ownership boundaries.

