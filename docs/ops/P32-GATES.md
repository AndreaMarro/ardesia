# P32 — Gates

Binary gates per iteration. GREEN only when the command's own exit is 0 and the
output is read directly (not through a `tail` pipe that masks the exit code).

**Method note (bitten twice, iter 1 e iter 6):** `cmd | tail; echo $?` riporta
l'exit di `tail`, NON di `cmd` — falso verde. Pattern corretto:
`cmd > log 2>&1; X=$?` poi leggere il log. L'iter-6 tsc RED è stato scoperto
dal TESTO dell'errore, non dall'exit code.

## Loop close (10 jul, 00:2x)
CI su `42ed7e13` (iter 7): **4/4 PASS** (engine · hygiene · no-deploy · studio).
Ogni commit del loop (7/7) è CI-validato. Loop CHIUSO pulito — ripresa: vedi
[P32-NEXT.md](P32-NEXT.md) (gate umani: un-Draft #150, R10b, battery9v, U3;
gate macchina: R14 hardening montaggio-canvas su macchina fresca).

## Iter 7 — Annulla one-step (D8)

| Gate | Result |
|---|---|
| single-writer / CI su `e4b11f32` | PASS / **4/4** ✅ |
| RED first | 3/26 fail pre-impl ✅ |
| targeted | **26/26** ✅ |
| typecheck / build | **0 / 0** ✅ |
| full vitest | **1597 pass / 5 skip / 0 fail** (+3) ✅ |
| e2e montaggio-canvas | **HONEST RED — ambiente, NON la slice.** Evidenza: ①×5 su macchina scarica 4/5 fail, failure-line VAGANTE (35/42/46/88), incl. fail a linea 46 con `canUndo=false` (bottone Annulla NON nel DOM); ②**CONTROL: stash del diff → stesso spec ×5 su `e4b11f32` pulito (CI-green, 6/6 alle 23:37) → 4/5 FAIL identici**; ③fresh vite server → invariato; ④kill orfani chromium (15) → invariato. p30-free-manipulation: **3/3 verde in OGNI run**. |
| secret scan | 0 ✅ |

**Method note 3:** prima di attribuire un fail e2e alla slice, CONTROL RUN con
`git stash` sul commit pulito — 20 minuti di diagnosi risparmiati da un esperimento
da 2 minuti. montaggio-canvas (raw-mouse + timeout default 30s) è il canarino
della salute-macchina; p30 (app-ready gate + 60s) sopravvive. → Candidato
reliability: hardening di montaggio-canvas come P31 fece per p30.

## Iter 6 — Gomma (D7)

| Gate | Result |
|---|---|
| single-writer / CI su `2e5b7eae` | PASS / **4/4** ✅ |
| RED first | 4/23 fail pre-impl ✅ |
| targeted | **23/23** ✅ |
| typecheck | prima RED (workbench `MontaggioPlacementType | null` stantio → repair cycle 1: widen a `MontaggioTool` + specchio gomma + fix drift id cavo iter-4) → **0** ✅ |
| build | **0** ✅ |
| full vitest | **1594 pass / 5 skip / 0 fail** (+4) ✅ |
| e2e ×3 | prima run **3/6 FAIL** con load-average **39.81** (tutti timeout di readiness, zero assertion) → retry macchina scarica **6/6 (45.5s)** ✅ — load-flake, non regressione |
| secret scan | 0 ✅ |

**Method note 2:** non lanciare l'e2e mentre vitest/build girano in parallelo —
sopra load ~40 i timeout di readiness (15-60s) scattano. Gates seriali.

## Iter 5 — Slice (a) rigettata; invarianti affordance locked (D6-bis)

| Gate | Command | Result |
|---|---|---|
| single-writer | clean, HEAD==`a67ae0b1`, no lock | PASS ✅ |
| CI on `a67ae0b1` | `gh pr checks 150` | **4/4 pass** ✅ |
| targeted | `vitest ToolCanvasMontaggioLibero` | **19/19** (3 invarianti nuovi, verdi al primo run) ✅ |
| typecheck | `tsc -b` | **0** ✅ |
| full vitest | CI-deterministic profile | **1590 pass / 5 skip / 0 fail** (+3) ✅ |
| e2e | non rirun (nessuna superficie e2e toccata; ultimo ×3 6/6 su a67ae0b1) | n/a — onesto |
| build | non rirun (diff test+docs only; CI lo esegue su push) | n/a — onesto |
| secret scan diff | grep patterns | 0 hit ✅ |

## Iter 4 — Phase 5 slice 1 (cavo in palette, D6)

| Gate | Command | Result |
|---|---|---|
| single-writer | clean, HEAD==`884f6b38`, no lock | PASS ✅ |
| CI on `884f6b38` | `gh pr checks 150` | **4/4 pass** ✅ |
| RED first | 6 nuovi test pre-impl | 6/16 fail ✅ |
| targeted | `vitest ToolCanvasMontaggioLibero` | **16/16** ✅ |
| typecheck / build | `tsc -b` / `npm run build` | **0 / 0** ✅ |
| full vitest | CI-deterministic profile | **1587 pass / 5 skip / 0 fail** (+6) ✅ |
| e2e regression | `p30-free-manipulation + montaggio-canvas --repeat-each=3` | **6/6** ✅ |
| secret scan diff | grep patterns | 0 hit ✅ |

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
