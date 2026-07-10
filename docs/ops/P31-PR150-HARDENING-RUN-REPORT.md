# P31 — Harden PR #150 (P30 free-manipulation) RED → reliable GREEN

**Result: ✅ trace v0 green AFFIDABILE.** The e2e is no longer `test.fixme`; it passes `--repeat-each=5`.

## What was RED (P30)
The trace logic worked (passed once, 7.5s) but the e2e was flaky and quarantined `test.fixme`. Two root causes:
1. **Unhandled rejection in the LessonOS event log.** `IndexedDbEventLog.append` did `await requestToPromise(add)` **then** `await done`; on a duplicate-`seq` `add` failure (concurrent appends racing on `lastSeq`), the first `await` threw and returned, leaving the `done` transaction-promise a **floating rejected promise** → `"scrittura fallita"` unhandled rejection → console error → failed `expect(consoleErrors).toEqual([])`.
2. **e2e interaction flakiness.** Excalidraw embed activation timing → `boundingBox`/`click` timeouts; no app-ready gate; shared default room polluted across runs.

## Fixes
**Fix #1 — `apps/studio/src/lessonos/indexedDbEventLog.ts`:**
- Serialize appends via a `writeQueue` promise-chain → concurrent appends get distinct, monotonic `seq` (no collision).
- `await Promise.all([requestToPromise(add), done])` → a handler is attached to both promises, so a failure never leaves an orphan rejection. Real errors still reject the caller (`run`); a failed append never bumps `lastSeq`.

**Fix #2 — `apps/studio/e2e/p30-free-manipulation.spec.ts`:**
- `?room=p30-free-<parallelIndex>-<repeatEachIndex>` isolation (reload preserves the query → reopens same room).
- `waitAppReady` (`__MAESTRO_TEST__.ready`) before interacting; `testInfo.setTimeout(60_000)`.
- Embedded controls clicked via `dispatchEvent("click")` → React `onClick`, bypassing Excalidraw pointer routing (reliable); `<details>` opened via native `.open=true`.

## Tests added
- `apps/studio/src/__tests__/IndexedDbEventLog.test.ts` → new "affidabilità emit (P31)" block: concurrent appends → distinct seqs / no reject; solved→error→solved distinct; rapid identical benign appends all resolve; a non-benign error stays visible to the caller. (**25/25** in file.)

## Gates
| Gate | Result |
|---|---|
| typecheck (tsc -b) | 0 ✅ |
| build | 0 ✅ |
| `p30-free-manipulation.spec.ts` `--repeat-each=3` / `=5` | **3/3, 5/5** ✅ |
| regression e2e (montaggio-canvas + first-led-ipad-touch) | 2/2 ✅ |
| full vitest suite | **1574 pass / 5 skip / 0 fail** (174 files) ✅ |
| `test.fixme` removed | ✅ yes |
| console errors in test | none ✅ |

## Honesty / coverage boundary (from adversarial review)
The spec proves the **logic** (onClick → real scene mutation → real solver outcome → event → digest → persistence across reopen) reliably. It does **not** prove real-pointer *reachability* of the embed (Excalidraw activation/hit-testing) — that is covered by `montaggio-canvas.spec.ts` (palette + holes via raw mouse). The free-mode strip's real-pointer reachability is an explicit follow-up (see NEXT). Header comment updated to say so.

## NOT Tinkercad parity
Still v0. Missing: wide palette (battery/wire as first-class), free wire connect/retarget via drag, undo/redo, instruments, Arduino/code, full circuit export. **No parity claim.**

## Draft?
Reliable now (repeat-each green + full suite + regression). Recommend Andrea decides un-Draft after CI runs the un-fixme'd spec on a fresh runner.
