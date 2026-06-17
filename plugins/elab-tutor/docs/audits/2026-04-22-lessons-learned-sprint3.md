# Lessons Learned — Sprint 3 + Stress Test 2026-04-22

**Context**: Sprint 3 `sett-3-stabilize-v3` merged to main `2b5bab7`, deployed ~07:56 GMT+8. Stress test run at 08:10–08:25 GMT+8 found **1 P0 + 3 P1 + 7 P2 + 5 P3** bugs in prod live. Parallel loop CLI continued sett-4 Day 01/02/03 (commits `a450b85 → f23e448 → c5c7adc → 946aafb`, Karpathy Wiki POC foundations).

This doc captures the **process errors** — not the bugs themselves but the gaps in the Sprint 3 DoD that let those bugs ship — so future sprints can raise the gate.

---

## 1. What Sprint 3's DoD missed

Sprint 3 benchmark 4.75/10 was internal. CI PASS 12220/12220 tests. Yet prod shipped **catastrophic** (P0-001 blank page for all returning users). The DoD gaps:

| Gap | Concrete evidence from stress test |
|---|---|
| **No PWA regression test across deploys** | P0-001: workbox-precache served a stale `index.html` referencing dead chunk hashes. No test installs the old SW + runs the new build. |
| **No live prod smoke on real SW-controlled profile** | Deploy-smoke checks HTTP 200 on `/` but never loads the page under a persistent cache. An SPA with SW *always* needs a "controlled-client" smoke. |
| **Vision endpoint never E2E-verified on prod** | CLAUDE.md known bug #4 still open ("Vision non testata live"). Sprint 3 did not add that test. P1-001 `/chat → 422` is the cost. |
| **Principio Zero v3 labeled "VERIFIED LIVE" without a repeatable check** | CLAUDE.md: "CoV 3/3 PASS (12056 test)" for Principio Zero v3. But those were unit/integration tests, not a live chat assertion on the deployed Edge Function. Prod now violates it (P1-002). |
| **Console-cleanliness not gated** | ~180 WakeWord warnings/30s in prod. Nothing in CI enforced a "zero-warning" or "bounded-warning" threshold. |
| **Benchmark score only tracks 10 weighted metrics** — none of which correlate with "can a returning user load the homepage" | Benchmark 4.75 is honest for what it measures, but what it measures doesn't cover user-visible regressions on deploy. |

### Takeaway for future sprints

Add to **every** sprint DoD a **post-deploy live check** that runs on two browser profiles:
1. **Cold profile** (no SW, no cache) — must mount.
2. **Warm profile** (last-deploy's SW + caches installed) — must mount OR force-reload cleanly.

Anything else leaves P0-001-style bugs invisible until real users hit them.

---

## 2. Why the CLAUDE.md "VERIFIED LIVE" claim aged badly

CLAUDE.md at commit `2b5bab7` says of Principio Zero v3:

> "UNLIM backend scatola nera **RISOLTO v3 VERIFICATO LIVE (18/04 sera)** … Test live: risposta 'Ragazzi, come spiega il Vol. 1 a pagina 29…470 Ohm…ingredienti ricetta speciale!' per v1-cap6-esp1. Zero meta-istruzioni 'Docente leggi'. CoV 3/3 PASS (12056 test)."

Stress test 2026-04-22 shows live response is:
> "Ciao! Il tuo LED è acceso e brilla perfettamente! Hai costruito un circuito vincente…"

That is **singular "tu"**, not plural "Ragazzi". The regression is real.

Most likely root cause: **Edge Function prompt drift**. Since 18/04 there were 17 commits touching Supabase/Edge Functions or their config; one of them deployed a prompt that reverted to the singular style.

### Lesson

"VERIFIED LIVE" in a README is a single point-in-time claim. **It needs an expiry or a link to a repeatable test.** Two options next sprint:

- **Option A**: Add `tests/live/principio-zero-v3.e2e.js` that hits prod `/tutor-chat` and asserts the response text contains the token "Ragazzi" and does NOT contain the token "il tuo LED" / "hai costruito". Run in CI nightly against prod.
- **Option B**: Add a post-deploy hook that runs the same assertion once, and either ships or rolls back based on result. This is what "deploy-smoke" was probably meant to be.

Either way, stop treating a single manual test as a permanent guarantee.

---

## 3. What the benchmark doesn't capture (and should)

Current `benchmark.cjs` (CLAUDE.md): 10 weighted metrics, target 8.0/10, current 2.77/10 fast mode. What it misses, per the findings:

| Dimension | Covered? |
|---|---|
| Unit tests pass count | YES |
| Build time | YES |
| Playwright E2E count | YES (0 actually written per CLAUDE.md bug #10) |
| Live HTTP on `/` | YES (HTTP 200 only, blind to blank body) |
| **Live render under a stale-SW cache** | **NO** |
| **Console errors/warnings budget on prod** | **NO** |
| **Vision endpoint live test** | **NO** |
| **Principio Zero token-presence on prod** | **NO** |
| Mobile viewport smoke (tap targets ≥44, no hscroll) | NO |
| Bundle budget (per-chunk size threshold) | partial (2 chunks >1MB warning) |

All of the stress-test P0/P1 findings sit in the "NO" rows. Benchmark weights should be adjusted next sprint to penalise these specifically.

---

## 4. Process errors during stress test itself (self-reflection)

Being honest about my own process, not only Sprint 3:

| I did | What was wrong / what I learned |
|---|---|
| Navigated with Playwright MCP that had stale SW from prior session — found P0-001 | Lucky-by-accident. Should have been a **designed** test, not a by-product. Script: "always run once with warm state, once with cold." |
| Labeled the P0 `blank page` immediately as prod-catastrophic | Correct on evidence. But I **assumed** most users had an SW installed. I don't have analytics to prove percentage affected. Should flag as "P0 for affected cohort; cohort size unknown — measure". |
| Ran fixes without baseline vitest at first | Caught by CLAUDE.md re-read. Baseline was only run after. Lesson: **baseline vitest is step zero**, not step one. |
| Symlinked `node_modules` from loop's worktree into stress worktree | Works; fast. Risk: if loop mutates node_modules (`npm install`), my build may break mid-run. Acceptable for read-only vitest but worth calling out. |
| Skipped emoji→ElabIcons fix | Correct call — sett-4 branch appears to touch lavagna UI (Lesson Reader MVP per `91efd8d`). Would rebase-conflict. Ship after sett-4 merge. |
| Skipped server-side P0 fix (PWA cache) | Correct — requires deploy which the mission forbade. Fix documented for next hotfix PR. |

---

## 5. What the loop CLI got right (parallel context)

The loop CLI in parallel delivered Days 01/02/03 of Karpathy Wiki POC cleanly:
- `a450b85` Day 01 foundations + ADR-006
- `c5c7adc` Day 02 ADR-005 + Together AI research
- `946aafb` Day 03 `wiki-build-batch-input` + `wiki-validate-file` + axe-core devDep (TEST 12220 → 12248)

Things the loop did right that Sprint 3 should copy:
- **ADR-first**: every day starts with a written architecture decision (ADR-005, ADR-006). No code without the decision on paper.
- **Test count in commit title**: `[TEST 12248]` is visible in `git log --oneline`. Self-documenting.
- **Day-level audit file**: Days end with an audit doc and a composite score. Sprint 3 had one at the end; daily is denser and catches drift earlier.

Things the loop is still climbing back on:
- MCP discipline: Day 01 = 0 calls, Day 02 = 3, Day 03 target ≥10 (below auditor floor).
- Composite score 6.75 < 7.0 floor — still phase-appropriate but needs to trend up in Day 04+.

**Cross-pollination**: the ADR-first + daily-audit rhythm should be baked into the sprint DoD, not just into the loop. Human-driven sprints skipped the daily audit in Sprint 3 and paid with the P0 above.

---

## 6. Concrete actions for Sprint 5

(Sprint 4 is in flight; these are additions to Sprint 5 DoD.)

1. **P0 canary test**: Playwright test that registers SW, navigates once, redeploys fake `index.html`, then re-navigates and asserts mount. Run on every PR.
2. **Live-prod assertion suite** (`tests/live-prod/`): runs against `https://www.elabtutor.school` — tokens-in-response for Principio Zero v3, `POST /chat` 200 (Vision), `POST /tutor-chat` 200, HTTP 200 on `/`, SW precache key matches current deploy.
3. **Console-warning budget**: CI fails if a given Playwright E2E generates > 20 warnings.
4. **Bundle budget**: per-chunk hard limit (`react-pdf` + `mammoth` must live behind dynamic import before they are allowed to ship in the lavagna entry chunk).
5. **Mobile smoke**: iPhone SE viewport, tap targets audit, no hscroll — as a Playwright project.
6. **CLAUDE.md claim hygiene**: every "VERIFIED LIVE" claim must link to an assertion file path. No orphan claims.

---

## 7. Summary table

| What | Status |
|---|---|
| Sprint 3 CI | 12220/12220 PASS |
| Sprint 3 prod deploy | shipped with P0 + 3 P1 |
| Benchmark | 4.75/10 — did not catch any of the above |
| Stress test surface | 1 P0 + 3 P1 + 7 P2 + 5 P3 = 16 findings in ~15 minutes |
| Client-side fixes applied this session | 4 (SafeMarkdown double-escape, WakeWord terminal-error back-off, /health HEAD→GET, lavagna `<h1>`) |
| Server-side / deploy-gated fixes left open | 3 (PWA cache P0, Vision 422, Principio Zero prompt drift) |
| Tests run before fixes | 1 (baseline 12220) |
| Tests run after fixes | (CoV 3× in progress at time of writing) |
| Commits on main | 0 |
| Commits on sett-4 | 0 (loop owns) |
| Commits planned on test/stress-2026-04-22 | 1 |

---

## 8. Honesty disclosure

- `node_modules` was symlinked from the loop's worktree, not installed cleanly. Vitest ran but any build-step mismatch would surface only on a CI rebuild.
- No live Playwright test was written yet — findings are from *manual* MCP-driven runs. Regression coverage for these specific bugs must follow in a dedicated commit next session.
- None of the 4 applied fixes have been tested via `npm run build` yet — only vitest. Bundle-time errors remain theoretically possible.
- CLAUDE.md's "benchmark 2.77/10" line is still honest; stress-test 5.0/10 score is manual and opinionated, not a benchmark replacement.
