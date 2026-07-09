# P32 — Gates

Binary gates per iteration. GREEN only when the command's own exit is 0 and the
output is read directly (not through a `tail` pipe that masks the exit code).

## Iter 1 — Phase 0 (reachability caveat close)

| Gate | Command | Result |
|---|---|---|
| single-writer | `git status --short` (tutor-ux) | **clean, 0 dirty** ✅ |
| no write-lock | `ls .git/index.lock` | **absent** ✅ |
| security (diff) | `git diff origin/main...HEAD \| grep -E <secret patterns>` | **0 hits** ✅ |
| typecheck | `npm run typecheck` (`tsc -b --noEmit`) | **0 errors** ✅ |
| p30 e2e ×3 | `playwright test e2e/p30-free-manipulation.spec.ts --repeat-each=3` | **3 passed (8.7s)** ✅ |
| p30 e2e ×5 | `… --repeat-each=5` | **5 passed (20.7s)** ✅ |
| regression e2e | `playwright test e2e/montaggio-canvas.spec.ts e2e/first-led-ipad-touch.spec.ts` | **2 passed / 1 skipped (3.4s)** ✅ |
| PR #150 CI (`6082555b`) | `gh pr checks 150` | **4/4 pass** ✅ |

### Not run this iteration (scope, honest)
- `npm run build` — **not run**. Diff is e2e-spec-only; build unaffected. Covered by CI `studio` job on push.
- full `vitest` (1574) — **not run**. No product/shared code changed. Covered by CI `studio` job on push.
- The 1 skipped regression test = `first-led-ipad-touch.spec.ts:56` (pre-existing `test.fixme`, touch tap-tap). Not introduced by this change.

### First attempt (RED, informative — kept for the record)
The reachability probe **without** activation failed 3/3 with
`Error: puntatore reale colpisce CANVAS, atteso il controllo stesso`.
Root cause (verified, not guessed): Excalidraw embeddables are inert until a
double-click activates them (`montaggio-canvas.spec.ts:55-57`). Fix = add the raw
dblclick activation the caveat explicitly asked for; then GREEN. Repair cycle 1 of 2.
