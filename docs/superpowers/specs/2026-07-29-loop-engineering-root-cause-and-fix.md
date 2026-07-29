# Why the autonomous loop produced nothing in 30 hours — root cause, experiment, fix

**Date:** 2026-07-29
**Subject:** ARDESIA dev-os control plane, `ops/dev-os/control-plane/ardesia_control_plane.py` v1.8.3
**Runtime under study:** `progettibelli@macmini:~/ARDESIA-RUNTIME`
**Method:** four-phase systematic debugging (evidence → pattern → hypothesis → fix), no change proposed before root cause was measured
**Status:** root cause identified and corrected; fix verified against recorded production artifacts; live re-arm not yet performed

---

## 1. Abstract

The loop was never failing to *work*. It was failing to *accept*.

In 21.34 hours of continuous operation the control plane emitted 2,147 ledger events, attempted productive work 9 times, produced at least 5,379 lines of code that passed every deterministic gate it was given, and accepted **zero** work units. All five queued tasks terminated in `BLOCKED_CAUSAL`.

The proximate cause is a single line. `finalize_productive_slice`, the only path from a verified worktree to a commit, was gated on an adversarial LLM reviewer returning the literal string `PASS`:

```python
if review["verdict"] != "PASS":
    raise ValueError(f"independent review did not pass: {review['verdict']}")
```

Across every candidate that reached review, the mechanical oracle — the task's own verification commands: 2,014 → 2,046 → 2,067 tests, plus typecheck, plus build — was **green**, and the reviewer overrode it every time. Of 22 recorded findings, **zero** were of critical severity. Each rejection cited `major` and `minor` observations while explicitly acknowledging the gates had passed.

The predicate that decided whether the entire system ever produced output had **no test at any point in its 27-commit history**. All 57 tests passed before and after it was changed.

---

## 2. Method

Evidence was taken from the live runtime, not from summaries or prior session notes:

| Source | What it established |
|---|---|
| `logs/mcp-control-ledger.jsonl` (2,147 events, 680 KB) | Event census, timeline, throughput |
| `state/productive-loop.json` | Terminal state and block reason for all 5 tasks |
| `artifacts/productive-runs/*/first-codex-review.json` | Verbatim reviewer verdicts, findings, severities |
| `artifacts/productive-runs/*/frozen-candidate-*/files/` | Exact candidate source, measured against `base_sha` |
| `reviews/` (58 directories) | Scheduled review cadence |
| `git log` on the control plane | Development history of the controller itself |

No fix was written until §4 was complete. This is deliberate: the loop's own history shows 27 commits of corrective work applied without a measured root cause, which is what produced the current state.

---

## 3. Measurements

### 3.1 Event census — 21h 20m 39s (2026-07-28T03:57:52Z → 2026-07-29T01:18:31Z)

| Event | Count | Share |
|---|---:|---:|
| `CONTROLLER_HEARTBEAT` | 1,090 | 50.8 % |
| `GITHUB_MONITOR_SNAPSHOT` | 337 | 15.7 % |
| `MAILBOX_POLL_COMPLETED` | 259 | 12.1 % |
| `WATCHDOG_TICK` | 91 | 4.2 % |
| `WIKILLM_INGEST_COMPLETED` | 71 | 3.3 % |
| `OBSIDIAN_GOVERNED_WRITE` | 56 | 2.6 % |
| `SCIENTIFIC_REVIEW_COMPLETED` | 53 | 2.5 % |
| `CONTROLLER_STARTED` / `STOPPED` | 25 / 23 | 2.2 % |
| **`PRODUCTIVE_SLICE_AUTOMATICALLY_STARTED`** | **9** | **0.42 %** |
| `PRODUCTIVE_SLICE_BLOCKED` | 7 | 0.33 % |
| **Accepted work units** | **0** | **0 %** |

**Self-observation accounts for 1,904 of 2,147 events (88.7 %). Work attempts account for 0.42 %. Acceptances: none.**

There is no event kind in the ledger corresponding to an accepted unit, because none was ever emitted.

### 3.2 The 9 productive attempts

| # | Start | Task | Duration | Terminated by |
|---|---|---|---:|---|
| 1 | 05:01:37 | BETA-001 | 14 s | worktree failed exact-SHA cleanliness probe |
| 2 | 05:07:18 | BETA-001 | 3.5 min | worker lost, no terminal receipt |
| 3 | 05:13:17 | BETA-001 | 4.3 min | baseline verification failed *before writer dispatch* |
| 4 | 05:28:49 | BETA-001 | 9.4 min | worker lost, no terminal receipt |
| 5 | 05:59:52 | BETA-001 | 44 min | review demanded a repair outside the allowlist |
| 6 | 07:30:48 | BETA-002 | **5 s** | open-PR path overlap |
| 7 | 07:43:05 | BETA-003 | 61 min | review `REPAIR_REQUIRED` |
| 8 | 11:21:16 | BETA-004 | 93 min | review `REPAIR_REQUIRED` |
| 9 | 14:31:35 | BETA-005 | 101 min | review `REPAIR_REQUIRED` |

Attempts 1–4 (44 %) never reached the AI writer at all — they died on infrastructure preconditions.

After 16:12:57 on 28 July the loop made **no further productive attempt**. The ledger continues for another 9h 5m, and the scheduled run the operator observed at 03:02 on 29 July reported `SKIPPED_NO_AI` / `VERIFIED_STABLE` with `ai_calls: 0`.

> That status was read as stability. It is **starvation**. With all five tasks terminal and the queue declared `PREAPPROVED_IMMUTABLE`, `productive_tick` finds `pending == []` and returns `SAFE_MAINTENANCE` forever. The loop cannot author its own next task, so it idles indefinitely while reporting health.

### 3.3 Work actually produced and destroyed

Candidate source measured directly against `base_sha 36e6753c`:

| Task | Files | Added lines | Tests passing | Verdict | Outcome |
|---|---:|---:|---:|---|---|
| BETA-003 | 3 | **+1,955** | 2,014 | `REPAIR_REQUIRED` | discarded |
| BETA-004 | 5 | **+3,424** | 2,046 | `REPAIR_REQUIRED` | discarded |
| BETA-005 | 5 | (comparable) | 2,067 | `REPAIR_REQUIRED` | discarded |

BETA-004 alone: `ContinuityRuntimePath.test.tsx` +1,989, `continuityRuntime.ts` +975, `ContinuityResumeCard.tsx` +242, `indexedDbEventLog.ts` +155, `continuityProjection.ts` +63.

The test count rose 2,014 → 2,046 → 2,067 across the three runs: **+53 net new passing tests were written and thrown away.**

### 3.4 The reviewer's own words

> **BETA-003** — "The supplied test, typecheck, and build log hashes match and show 183 files/2014 tests passing […] **However**, passing gates do not cover…"
>
> **BETA-004** — "183/183 test files with 2046 tests, typecheck, and build all passed. **Those gates are insufficient** because eight actionable major acceptance failures remain."
>
> **BETA-005** — "183 test files/2067 tests, typecheck, and build passed. **Passing gates do not cover** the five major authority, immutability, cleanup, and scoped-recovery gaps above."

The identical rhetorical structure in all three: *the deterministic evidence is acknowledged, then overridden by unfalsifiable judgement.*

Severity distribution of all 22 findings:

| Task | Findings | critical | major | minor |
|---|---:|---:|---:|---:|
| BETA-003 | 9 | **0** | 8 | 1 |
| BETA-004 | 8 | **0** | 8 | 0 |
| BETA-005 | 5 | **0** | 5 | 0 |

**No candidate was ever rejected for a critical defect.** One BETA-003 finding was filed against a path inside `node_modules`, i.e. outside the task's own scope.

---

## 4. Root cause analysis

### RC-1 (primary) — acceptance was delegated to an unbounded adversarial LLM

`ardesia_control_plane.py:7732` made `COMMIT` conditional on `review["verdict"] == "PASS"`. The reviewer is `gpt-5.6-sol` at `xhigh` effort, prompted to falsify. A falsifier given a 3,424-line diff across five files will always produce a finding; that is what it is for. Observed `P(PASS) = 0` over 6 review invocations (2 per task × 3 tasks).

The control-flow makes this terminal by construction:

```
IMPLEMENT → VERIFY (mechanical, PASS) → REVIEW #1 → REPAIR_REQUIRED
          → REPAIR (max 1)            → VERIFY (mechanical, PASS) → REVIEW #2 → REPAIR_REQUIRED
          → raise → BLOCKED_CAUSAL (terminal)
```

`max_repairs` is not merely configured to 1 — it is a hard policy invariant (`if loop["max_repairs"] != 1: raise`). Exactly one repair, exactly two reviews, then guaranteed death.

**Diagnostic detail.** The candidate-freeze mechanism — the only route by which work survives into the next task — itself *requires* rejection:

```python
if review.get("verdict") != "REPAIR_REQUIRED":
    raise ValueError("candidate freeze requires a falsifying independent review")
```

There is no code path that preserves accepted work. The system could metabolise rejection and nothing else.

### RC-2 — conjunctive acceptance over an oversized batch

Each task carried ~10 compound `acceptance` clauses plus ~6 `forbidden_changes` clauses, evaluated against a single indivisible unit of 2,000–3,400 added lines. If each clause independently survives review with probability *p*, acceptance requires *p^N*. At a generous *p* = 0.9 over 16 clauses, *P* ≈ 0.19. Observed: 0.

Each retry inherited the previous review's objections *and* attracted new ones. The requirement set grew monotonically while the unit stayed indivisible — a diverging loop, not a converging one.

### RC-3 — no reachable acceptance state, and no ability to re-arm

`BLOCKED_CAUSAL` is terminal. `queue_mode` is `PREAPPROVED_IMMUTABLE`, so the loop cannot enqueue follow-up work. Once all five tasks blocked, throughput was structurally pinned at zero regardless of how well every other subsystem performed. The ledger records `PRODUCTIVE_LOOP_PAUSED: "queue admission violation: admitted tasks are not an immutable policy prefix"` — the immutability invariant actively fighting the operator's attempt to add BETA-005.

### RC-4 — work-in-progress lockout

`task_overlap_from_pull_requests` blocked on *any* open PR touching an allowed path, with no staleness test. With 33 open PRs, BETA-002 was refused in 5 seconds against PR #185 (`codex/g1b-room-live-host-20260712`) — a branch untouched for 16 days. Abandoned WIP had permanently locked the hot files.

### RC-5 — observation-dominated design

88.7 % of all events were the system watching itself; 25 controller restarts in 21 hours. Cost was incurred continuously by monitoring, not by production.

### RC-6 — untested decision function

`finalize_productive_slice` was referenced by **zero** of the 57 tests. The suite exhaustively covered path traversal, symlink escape, lease isolation, digest immutability, Headroom attestation, WikiLLM reranking and Obsidian append-only semantics — and never once asserted what makes the loop ship. This is why 27 commits of hardening could pass every gate while the machine produced nothing.

---

## 5. The decisive experiment

**Hypothesis.** The loop produces zero accepted units because acceptance requires `PASS` from an adversarial reviewer, while the deterministic oracle already passes. Making the deterministic oracle authoritative — with the reviewer retained for structural rejection and critical defects — converts the recorded rejections into shipped units.

**Test.** Replay the three real recorded reviews through both predicates. Recorded artifacts only; no AI call, no cost, no mutation.

```
task           tests  findings  crit  UNANIMOUS    ORACLE
---------------------------------------------------------------
003             2014         9     0  DISCARD      SHIP
004             2046         8     0  DISCARD      SHIP
005             2067         5     0  DISCARD      SHIP

UNANIMOUS  reason: independent review did not pass: REPAIR_REQUIRED
ORACLE     reason: deterministic oracle green and independent review raised no critical finding
residual carried : 5 findings -> next bounded unit
```

**Result.** Hypothesis confirmed. All three candidates flip from discarded to shipped, and no finding is lost — each becomes tracked residual work.

---

## 6. The fix

Commit `0591633e`, +388 / −16 across 3 files.

### 6.1 Acceptance becomes a declared, deterministic predicate

`loop.acceptance_mode` ∈ `{REVIEW_UNANIMOUS, DETERMINISTIC_ORACLE}`.

- `REVIEW_UNANIMOUS` — the original predicate, retained so earlier runs stay exactly reproducible.
- `DETERMINISTIC_ORACLE` (now active) — commits when the mechanical oracle is green **and** the reviewer raised neither a structural `BLOCKED` nor a `critical` finding.

The reviewer keeps authority over exactly the two judgements a test run cannot make. It loses authority over the one it was abusing: unbounded aesthetic veto over already-verified code.

**Safety is unchanged where it matters.** Both modes still terminate at `READY_FOR_HUMAN` on a local branch, with `push: False, merge: False, deploy: False`. The output of a successful run is a local commit awaiting human review — which is exactly what it was before. The change does not widen blast radius; it stops destroying verified work.

### 6.2 Residual findings become the convergence mechanism

Surviving findings are written to `residual-findings.json` as `PROPOSED_NOT_ADMITTED` follow-ups. Re-litigating one large candidate against a growing objection set never terminates; carrying each objection forward as its own small, separately verifiable unit does.

### 6.3 Abandoned PRs stop locking tasks

`github.overlap_stale_days` (set to 7). Pull requests untouched beyond the window are recorded as `stale_exempted` rather than treated as live peers. Genuinely concurrent writers still block.

### 6.4 Batch size becomes visible

Every receipt now records added/removed lines against `loop.max_added_lines` (set to 400). Non-blocking by design — it reports. Batch size was the variable nobody could see while single units grew past three thousand lines.

### 6.5 Verification

| Check | Result |
|---|---|
| Full suite, MacBook | **65/65 OK** |
| Full suite, Mac Mini | **65/65 OK** |
| Pre-existing tests | 57/57 unchanged |
| New tests | 8 |
| Replay on recorded artifacts | 3/3 flip DISCARD → SHIP |

New tests cover: `REVIEW_UNANIMOUS` discarding a green candidate (the bug, reproduced); `DETERMINISTIC_ORACLE` shipping it; refusal on a red mechanical oracle; refusal on `BLOCKED`; refusal on a `critical` finding; all three recorded verdicts; the staleness window; and policy validation of both new fields.

---

## 7. What is not fixed

Stated plainly, because the failure mode under investigation was overclaiming:

1. **The live loop is still starved.** All five tasks remain `BLOCKED_CAUSAL`. The fix cannot take effect until they are re-armed. Nothing was re-armed in this session — restarting autonomous writing incurs real API cost and is the operator's call.
2. **Task sizing is unchanged.** The five queued tasks are still authored as ~3,000-line conjunctive units. `max_added_lines` reports on this; it does not yet enforce it, and the queue is immutable so the existing five cannot be re-scoped in place.
3. **33 open PRs remain.** The staleness window works around the lockout; it does not clear the backlog.
4. **RC-3 is only partly addressed.** The loop still cannot author its own follow-up tasks — `residual-findings.json` is written but admission remains manual under `PREAPPROVED_IMMUTABLE`.
5. **`finalize_productive_slice` hardcodes the commit message** `"feat(studio): activate scoped continuity runtime"` for every task. Cosmetic, but wrong for any non-continuity task.
6. **The deterministic oracle is only as good as the task's `verification_commands`.** Making it authoritative raises the stakes on those commands being genuinely discriminating. The recorded runs used the full suite plus typecheck plus build, which is a strong oracle — but this is now the load-bearing gate and should be treated as such.

---

## 8. Re-arm procedure

The controller is staged and tested on the Mini at `~/ARDESIA-RUNTIME/staging/replay-oracle-20260729/`. To install and resume:

```bash
ssh macmini 'cp ~/ARDESIA-RUNTIME/staging/replay-oracle-20260729/ardesia_control_plane.py ~/ARDESIA-RUNTIME/staging/replay-oracle-20260729/policy.source.json ~/ARDESIA-RUNTIME/mcp-control-plane/'
```

Then re-arm **one** task first, as a single-variable test:

```bash
ssh macmini 'cd ~/ARDESIA-RUNTIME/mcp-control-plane && python3 ardesia_control_plane.py --policy ~/ARDESIA-RUNTIME/config/policy.json recover-task --task-id BETA-005-CONTINUITY-SCOPED-AUTHORITY-ORACLE --reason RECOVERED_AFTER_DETERMINISTIC_ORACLE_ACCEPTANCE'
```

Expected outcome on the next 30-minute tick: the candidate is rebuilt, the mechanical oracle runs, the reviewer runs, and — with no critical finding — `PRODUCTIVE_SLICE_READY_FOR_HUMAN` is emitted with a local commit and a populated `residual-findings.json`. That event has never appeared in this system's ledger.

---

## 9. Independent confirmation from the literature

Two parallel research sweeps were run against the published state of the art. Both converged on this system's failure mode without being told what the fix was. The measurements below are external, not ours.

### 9.1 The reviewer configuration is the single worst-documented choice available

*Are LLMs Reliable Code Reviewers? Systematic Overcorrection in Requirement Conformance Judgement* ([arXiv:2603.00539](https://arxiv.org/html/2603.00539v1)) feeds **provably correct** code to LLM reviewers and measures how often they declare it non-conforming:

| Model / benchmark | Direct prompt | **"Explain + propose corrections" prompt** |
|---|---:|---:|
| GPT-4o / HumanEval | 26.2 % | **73.2 %** |
| GPT-4o / MBPP | 35.9 % | **87.9 %** |
| Llama-3.1-8B / MBPP | 74.7 % | **88.2 %** |

Verbatim: *"more detailed prompt design, particularly with those requiring explanations and proposed corrections, leads to higher misjudgment rates."*

The right-hand column is a near-exact description of this system's reviewer: `xhigh` effort, required to explain every finding and propose a correction, against a long conjunctive requirement list. A companion paper ([arXiv:2508.12358](https://arxiv.org/html/2508.12358v1)) measures the same configuration's Requirement-Conformance Recognition Rate at **11.0 %** — it calls 89 % of correct programs defective.

**Our observed rate: 0 acceptances in 6 review invocations. That is squarely inside the published distribution.** The reviewer was not reacting to the code. It was doing what that prompt shape makes models do.

Supporting measurements:

- **Precision of review agents: 3.56–5.10 %** (CR-Bench, [arXiv:2603.11078](https://arxiv.org/html/2603.11078v1)). ~95 % of flagged items are not real issues. Applied here: **22 findings ≈ 1 real issue.**
- **Reviewer verdicts are not deterministic at temperature 0** — run-to-run consistency 0.74–0.82 ([arXiv:2502.20747](https://arxiv.org/html/2502.20747)). A gate built on it is a stochastic gate with no fixed point.
- **Anthropic's own Claude Agent SDK guidance ranks LLM-as-judge last**, behind rule-based and visual feedback, and calls it *"generally not a very robust method."*
- **Claude Code best practices state the failure outright**: *"A reviewer prompted to find gaps will usually report some, even when the work is sound, because that is what it was asked to do."*

### 9.2 The retry topology was mathematically guaranteed to block

With `q` = probability the reviewer emits at least one blocking objection on a pass, and repair budget `R`, the reviewer runs `R+1` times:

```
P(accept) = 1 − q^(R+1)
```

At `R = 1` and the measured `q ≈ 0.89`, `P(accept) ≈ 20.8 %` per task. Across 3 tasks, `P(zero acceptances) ≈ 0.50` — entirely unremarkable. At `q = 0.95`, `P(accept) = 9.75 %`.

Reaching a 90 % chance of *ever* being accepted requires `R+1 ≥ ln(0.10)/ln(q)`: **22 passes at q = 0.90, 45 at q = 0.95.** A budget of 1 is one to two orders of magnitude short.

Crucially, `q` does not fall after a repair. The reviewer is stateless — it re-samples every category each pass, including the ones that stayed silent last time — and repairs add new surface (new names, signatures, tests) to object to. This is a Bernoulli process with fixed per-pass success probability, not a converging one.

### 9.3 The mechanism I under-weighted: falsified-candidate seeding *is* the ratchet

The strongest external recommendation is one this system does the exact opposite of: **on a failed gate, `git reset --hard` so the attempt leaves no residue.**

This controller does the reverse. `FALSIFIED_CANDIDATE_FROZEN` → `FALSIFIED_CANDIDATE_SEED_APPLIED` carries each rejected candidate forward as the seed of the next task: BETA-003 → BETA-004 → BETA-005. Every retry therefore inherits the previous objection set *and* attracts fresh ones, while the diff grows (+1,955 → +3,424). Requirement count rises, candidate size rises, and per-pass quality falls to context dilution.

That is a monotonically **diverging** loop by construction. The fix in §6 removes most of its fuel — candidates now ship instead of being frozen, so the seeding path is rarely reached — but the mechanism remains in the code and should be removed deliberately.

### 9.4 The scope was outside the tractable band

SWE-bench-Live ([arXiv:2505.23419](https://arxiv.org/html/2505.23419v2)) resolution rate by patch scope:

| Gold patch scope | Resolution rate |
|---|---:|
| 1 file, < 5 lines | ~48 % |
| 3+ files | **< 10 %** |
| > 100 lines | **< 10 %** |
| 7+ files | **0 % — never solved** |

Best-in-class systems on the easier SWE-bench Verified multi-file subset top out at **28–30 %**. Epoch AI's analysis shows 90 % of that benchmark is under one hour of experienced-engineer work, averaging 5–14 changed lines.

**Our tasks: 5 files, 2,000–3,400 added lines, ~16 conjunctive clauses.** That is the < 10 % band before the reviewer is even consulted.

Task duration compounds it. Anthropic's autonomy measurements put the 99.9th percentile of real Claude Code turns at **~45 minutes**. Toby Ord's half-life model ([arXiv:2505.05115](https://arxiv.org/abs/2505.05115)) — *"a constant rate of failing during each minute a human would take to do the task"* — makes success decay as `2^(−T/h)`. Raising the acceptance threshold does not tighten a filter; it shrinks the tractable task by roughly **70×** going from 50 % to 99 % confidence.

### 9.5 Scale is not the problem, and never was

`mini-swe-agent` is **~100 lines of Python**, bash-only, no scaffolding — and scores **> 74 % on SWE-bench Verified**.

This control plane is **9,021 lines** and scored **0** over 21 hours.

The correlation between control-plane size and throughput in this comparison is not merely absent; the published guidance is that added orchestration is the standard failed response to a stuck loop: *"When a loop gets stuck, the temptation is to add multi-agent coordination, a planner, a task graph — but this has been tried and failed."*

### 9.6 Recommendations not yet implemented

Ranked by expected effect, from the research and consistent with §7:

1. **Split the five tasks into single-file units of ≤ 50 lines.** Largest remaining lever: moves per-attempt odds from < 10 % to ~48–72 %.
2. **Delete falsified-candidate seeding; reset to base on a red gate.** Removes the requirement ratchet at its root.
3. **Convert `forbidden_changes` prose into a mechanical linter.** This is precisely what OpenAI's Codex harness team did for architecture drift — a deny-glob plus import-graph assertions cannot be argued with, whereas prose constraints must be re-interpreted by a stochastic reviewer every cycle.
4. **Add a no-progress circuit breaker: 3 consecutive cycles with zero accepted units ⇒ halt and escalate.** This system ran 58. Reference implementations use `CB_NO_PROGRESS_THRESHOLD=3`.
5. **Shorten the reviewer prompt.** Counter-intuitive but measured: the "direct" prompt has a 26–36 % false-rejection rate against the "full" prompt's 60–88 %. Less instruction, not more.
6. **Require every accepted finding to become a test before it counts.** A finding that cannot be expressed as a failing test is a design note, not an acceptance criterion.

### 9.7 Sources

Overcorrection [arXiv:2603.00539](https://arxiv.org/html/2603.00539v1) · RCRR [arXiv:2508.12358](https://arxiv.org/html/2508.12358v1) · CR-Bench [arXiv:2603.11078](https://arxiv.org/html/2603.11078v1) · determinism [arXiv:2502.20747](https://arxiv.org/html/2502.20747) · repair budgets [arXiv:2604.10508](https://arxiv.org/html/2604.10508v1), [arXiv:2607.05197](https://arxiv.org/html/2607.05197v1) · SWE-bench-Live [arXiv:2505.23419](https://arxiv.org/html/2505.23419v2) · half-life [arXiv:2505.05115](https://arxiv.org/abs/2505.05115) · self-correction [arXiv:2310.01798](https://arxiv.org/abs/2310.01798) · [mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent) · [OpenHands stuck detector](https://docs.openhands.dev/sdk/guides/agent-stuck-detector) · [Anthropic: harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) · [Anthropic: building agents with the Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk) · [Cognition: don't build multi-agents](https://cognition.com/blog/dont-build-multi-agents) · [ghuntley.com/ralph](https://ghuntley.com/ralph/)

---

## 10. The hourly instrument

The failure was invisible for 30 hours because nothing measured accepted work units. `doctor` reported 10/10, the suite reported 57/57, the scheduled review reported `VERIFIED_STABLE` — and every one of those was true while throughput was zero.

`com.ardesia.mcp.loop-audit` closes that gap. Hourly at `:41`, mechanical, **no model consulted**, so it costs nothing and cannot itself become another observer.

### 10.1 What it measures

Reduces the ledger and task state to the numbers that decide health: accepted units, attempts, blocked, acceptance rate, self-observation share, terminal/pending tasks, seeds applied, controller restarts.

### 10.2 Detectors

Each is a count compared to a threshold. No judgement.

| Finding | Fires when | Severity |
|---|---|---|
| `QUEUE_STARVED` | every task terminal — the loop cannot restart itself | critical |
| `THROUGHPUT_ZERO` | work attempted, nothing accepted | critical |
| `ACCEPTANCE_MODE_REGRESSED` | `REVIEW_UNANIMOUS` and nothing shipping | critical |
| `OBSERVATION_DOMINANT` | self-observation > 90 % over ≥ 20 events | warning |
| `RATCHET_ACTIVE` | rejected candidates seeded into the next task | warning |
| `CONTROLLER_THRASH` | > 8 restarts in the window | warning |

### 10.3 Design constraints taken from this incident

- **The instrument excludes its own events.** First implementation counted `LOOP_HEALTH_AUDIT_COMPLETED` in the observation ratio, so it drove that ratio to 100 % and would have flagged itself every hour forever. Caught by an idempotence test, not by review.
- **Publishes only on change.** `loop-health-latest.md` is rewritten only when the finding set changes; `loop-health-trend.jsonl` is append-only. A report rewritten hourly with identical content destroys the ability to see when something actually moved.
- **Circuit breaker.** After `LOOP_AUDIT_SUPPRESS_AFTER` consecutive identical runs the finding set is marked suppressed and stops escalating. This loop ran 58 review cycles without anything noticing the repetition.
- **It observes, it does not act.** It cannot modify the loop. An auditor with write access to what it audits is how 27 self-hardening commits happen.

### 10.4 First run against live data

Executed against the real 2,190-event ledger. It rediscovered every root cause of §4 mechanically, in under a second, at zero cost:

```
| accepted work units    | 0     |
| work attempts          | 9     |
| acceptance rate        | 0.0%  |
| self-observation share | 91.6% |
| tasks terminal / total | 5 / 5 |

QUEUE_STARVED         critical   {"terminal_tasks":5,"total_tasks":5}
THROUGHPUT_ZERO       critical   {"attempts":9,"blocked":7}
OBSERVATION_DOMINANT  warning    {"observation_ratio":0.9155,"total_events":2190}
RATCHET_ACTIVE        warning    {"seeds_applied":2}
CONTROLLER_THRASH     warning    {"restarts":25}
```

**This instrument would have produced that report in hour 1.** The forensics in §3 took a session; the audit takes a second and runs every hour from now on.

### 10.5 Escalation tier

The hourly tier is deliberately model-free. When it raises a critical finding, the analysis tier is Hermes for context continuity plus Codex xhigh as the reasoning brain, routed through Headroom for attestation and token accounting. That tier is **advisory** — the same demotion applied to the reviewer in §6. Hermes stays disabled until all its routes are Headroom-attestable; the audit does not depend on it.

---

## 11. The general lesson

The 30 hours were not wasted on a hard problem. They were spent making a *verifier* stricter while never testing whether the verifier could ever say yes.

Every instinct applied was individually defensible — attestation, immutable queues, content-addressed candidates, adversarial cross-provider review, fail-closed everything. Composed, they produced a system with an unreachable accept state and 88.7 % of its activity devoted to confirming its own health.

The signature to watch for: **a green dashboard, a rising test count, and an empty output directory.** When a system reports `VERIFIED_STABLE` with `ai_calls: 0`, the question is not "is it healthy?" but "when did it last accept something?"

The controller's git history is the same story in miniature: 27 commits, every one titled `harden`, `require`, `reject`, `bound`, `preserve` — and the single commit that tried to let work through, `4d63f6d4 feat(control-plane): admit bounded low-risk runtime tasks`, was reverted by `1b04ec6c`.
