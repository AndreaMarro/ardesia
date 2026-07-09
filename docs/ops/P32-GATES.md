# P32 — Gates

Binary gates per iteration. GREEN only when the command's own exit is 0 and the
output is read directly (not through a `tail` pipe that masks the exit code).

## Iter 3 — R10 (.lesson import → event-log restore)

| Gate | Command | Result |
|---|---|---|
| single-writer | `git status` clean, HEAD==`5be02e38`, no lock | PASS ✅ |
| CI on `5be02e38` | `gh pr checks 150` | **4/4 pass** ✅ |
| RED first | new describe-block before impl | 6/7 fail (7° = guard pre-esistente) ✅ |
| targeted | `vitest run LessonBundle + IndexedDbEventLog` | **50/50** ✅ |
| typecheck | `tsc -b --noEmit` | **0** ✅ |
| build | `npm run build` | **0** (chunk-size warning pre-esistente) ✅ |
| full vitest | CI-deterministic profile | **1581 pass / 5 skip / 0 fail** (174 file; era 1574 → +7 nuovi) ✅ |
| secret scan diff | grep patterns su `git diff` | 0 hit ✅ |

Not run: Playwright e2e (diff non tocca superfici e2e: import file-picker flow non coperto da e2e esistenti; contratto DOM sim invariato).

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

### Post-push CI (verified at iter 2 re-gate)
| Gate | Result |
|---|---|
| CI on `69f928c8` — engine (pytest) | **pass** ✅ |
| CI on `69f928c8` — hygiene (NUL+secrets+boundary+whitespace) | **pass** ✅ |
| CI on `69f928c8` — no-deploy-check | **pass** ✅ |
| CI on `69f928c8` — studio (typecheck+test+build) | **pass** ✅ |

PR #150 did **not** regress. Phase 0 verified end-to-end (local e2e ×5 + CI 4/4).

### First attempt (RED, informative — kept for the record)
The reachability probe **without** activation failed 3/3 with
`Error: puntatore reale colpisce CANVAS, atteso il controllo stesso`.
Root cause (verified, not guessed): Excalidraw embeddables are inert until a
double-click activates them (`montaggio-canvas.spec.ts:55-57`). Fix = add the raw
dblclick activation the caveat explicitly asked for; then GREEN. Repair cycle 1 of 2.
