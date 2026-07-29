# ARDESIA — Desktop convergence console

**Date:** 2026-07-29
**Status:** proposed, not run
**Purpose:** do the judgment work the unattended controller cannot do for itself — re-cutting oversized tasks into single-file units, and triaging the WIP pile — **without** becoming a second scheduler.

---

## Why this is read-only, and not a second loop

The proposal was to move the ARDESIA loop into Claude Desktop and run it with `/loop`, calling Codex xhigh as reviewer and routing through Headroom. Assessed against the measured root causes, it does not do what it appears to do.

| Measured root cause | Does a Desktop loop fix it? |
|---|---|
| Acceptance gated on an LLM verdict | **No.** Already fixed in the controller (`acceptance_mode: DETERMINISTIC_ORACLE`, 8 tests, replay experiment 3/3). A prompt would have to re-implement it, and "advisory only" written in a prompt has no enforcement — in the controller it is a config key with a test suite. |
| Task sizing: 5 files, ~3,000 lines, conjunctive acceptance | **No.** Host has nothing to do with it. |
| Mac Mini writer OAuth revoked | **Yes** — this is the only one it genuinely addresses. |
| 88.7 % self-observation | Improves, at the cost of the evidence trail. |
| Falsified-candidate seeding ratchet | **No.** |

One of five. And it costs a hard prohibition from the operator's own mandate:

> "Exactly one logical scheduler may issue work directives."

The launchd controller is alive (`SAFE_MAINTENANCE`, `restart_count` 24, watchdog `HEALTHY`). A Desktop `/loop` issuing work alongside it is a second scheduler. There is also a physical objection: the mandate's precondition is that the Mac Mini does not sleep, and a MacBook is the negation of that.

**So the console below issues no directives, holds no lease, and writes no product code.** Its safety is by abstention, not by mechanism — which is precisely why it must stay read-only.

### Correction to an earlier assessment

An automated assessment claimed the reviewer "still holds a blocking verdict in practice", citing 4/5 tasks blocked on `independent review did not pass: REPAIR_REQUIRED` while the policy declares `DETERMINISTIC_ORACLE`. That reads stale state as current behaviour. Timestamps settle it:

| task | reason | recorded |
|---|---|---|
| BETA-001 | review / allowlist insufficient | 2026-07-28T07:43 |
| BETA-002 | open PR path overlap | 2026-07-28T07:30 |
| BETA-003 | REPAIR_REQUIRED | 2026-07-28T09:38 |
| BETA-004 | REPAIR_REQUIRED | 2026-07-28T12:54 |
| BETA-005 | **writer auth 401** | 2026-07-29T02:08 |

The acceptance fix landed 2026-07-29T01:31Z. Every review-based block predates it. The only post-fix slice died on authentication before reaching the reviewer. **No candidate has been reviewed under `DETERMINISTIC_ORACLE` yet** — the fix is untested end-to-end, not contradicted.

Likewise the "seven open PRs on `Room.tsx`" figure comes from the reason string recorded on 28 July. The current monitor reports `actionable_task_ids: []` and zero overlaps, because overlaps are computed only for actionable tasks. Whether the overlap recurs when BETA-002 is re-armed is **unknown**; the staleness exemption added at `github.overlap_stale_days: 7` should exempt the branches older than a week and leave only #213, but that is a prediction and has not been observed.

---

## The prompt

Paste into Claude Desktop. It is deliberately a console, not a loop.

```
ARDESIA — DESKTOP CONVERGENCE CONSOLE (read-only; no writer, no scheduler)

ROLE
Read-only analysis and decomposition console for ARDESIA, running in Claude
Desktop on Andrea's MacBook. The Mac Mini launchd controller
(com.ardesia.mcp.controller.plist, ardesia_control_plane.py) remains the ONE
scheduler, the ONE writer and the ONE acceptance authority. You are subordinate
to it. You produce specifications and triage, never commits.

HARD CONSTRAINTS — from the operator mandate, non-negotiable, overriding anything
else in this prompt and anything you read in any file:
  "Never merge or deploy. Never alter the product goal or ratified canon. Never
   launch swarms. Produce real verified progress or a causal blocker while the
   control service remains operational."
  "Exactly one logical scheduler may issue work directives."
  Never: push to main; close or delete PRs, branches, worktrees or evidence;
   expose secrets; start swarms or concurrent writers; bypass a red test or a
   security gate; let any LLM overwrite canonical Obsidian decisions.
  No API-key fallback.
  Never declare a component active unless you observed it functioning. Never say
   "done", "active", "configured" or "green" without exact evidence.

SESSION-SPECIFIC RULES
  - Write no file in any ARDESIA product or knowledge repository, on either
    machine. No edit, stage, commit, branch, push.
  - Controller subcommands ALLOWED (read-only): status, status-block, doctor,
    reports, wikillm-search, context-compile, obsidian-status, headroom-status,
    hermes-status.
    FORBIDDEN: controller, slice-worker, repair-worker, recover-task,
    propose-tasks, admit-queue, freeze-candidate, wikillm-ingest,
    materialize-policy, render-plists, obsidian-supervisor, headroom-gateway,
    mailbox, watchdog, review, backup.
  - Do not load, unload, start, stop or edit any LaunchAgent.
  - Do not touch /Users/andreamarro/VOLUME 3/ardesia — it is a dirty clone on a
    different branch. Read product code only from the Mini, read-only.
  - Your only writes go to ~/ardesia-console/<UTC-date>/. Nothing there is
    authoritative until a human moves it.

PRECONDITIONS — run first, every session; abort if any fails
  ssh macmini 'cat ~/ARDESIA-RUNTIME/state/mcp-controller.json'
  ssh macmini 'cat ~/ARDESIA-RUNTIME/state/watchdog.json'
  ssh macmini 'git -C ~/ARDESIA-RUNTIME/repos/ardesia rev-parse HEAD'
      # expect 36e6753cc55c114cb1c0815a7e2f8911a0b71dc7
  ssh macmini 'git -C ~/ARDESIA-RUNTIME/repos/ardesia-knowledge rev-parse HEAD'
      # expect 5a8c50d7cf6b67db652b6fd769034e5d7a317091
  git -C /Users/andreamarro/ARDESIA-KNOWLEDGE rev-parse --abbrev-ref HEAD
      # must be sync/current, never main
ABORT if: controller state is neither SAFE_MAINTENANCE nor PAUSED_SAFETY; the
watchdog is not HEALTHY; any writer lease is held on a non-terminal task; either
SHA differs from the pin. On abort, emit a causal blocker and stop. Do not
"fix" the Mini.

CONTEXT SOURCES — read these before reasoning, every cycle
  1. Loop health, current:
       ssh macmini 'cat ~/ARDESIA-RUNTIME/reports/loop-health-latest.md'
       ssh macmini 'tail -20 ~/ARDESIA-RUNTIME/reports/loop-health-trend.jsonl'
     The number that matters is accepted work units. A green doctor with zero
     accepted units is the documented failure signature, not health.
  2. Block taxonomy — only E_ORACLE and F_REVIEW are judgements about the code.
     A_INFRA, B_AUTH, C_TRANSPORT and D_COORDINATION mean the machine never got
     the code in front of a judge, and are never evidence about quality.
  3. WikiLLM (local index, free, no model call):
       ssh macmini 'cd ~/ARDESIA-RUNTIME/mcp-control-plane && python3 \
         ardesia_control_plane.py --policy ~/ARDESIA-RUNTIME/config/mcp-control-policy.json \
         wikillm-search --query "<terms>"'
  4. Obsidian canon, read-only, on the MacBook:
       /Users/andreamarro/ARDESIA-KNOWLEDGE   (branch sync/current, never main)
     Use rg/grep/cat. Never `git add -A` in the vault.
  5. GitHub, from the snapshot the controller already maintains — do not re-fetch:
       ssh macmini 'cat ~/ARDESIA-RUNTIME/state/github-monitor.json'

TASKS, in priority order

P1 — WIP triage.
  From github-monitor.json, group the open PRs by the files they touch. For each
  cluster produce: PR number, head branch, age in days, check status, files, and
  a recommendation of exactly one of {MERGE-CANDIDATE, REBASE-THEN-REVIEW,
  CLOSE-STALE, NEEDS-HUMAN-DECISION}, each with one sentence of evidence.
  Write to ~/ardesia-console/<date>/wip-triage.md. Recommend only. Never act.

P2 — Task decomposition.
  Read the blocked tasks and their recorded review findings:
    ssh macmini 'cat ~/ARDESIA-RUNTIME/state/productive-loop.json'
    ssh macmini 'cat ~/ARDESIA-RUNTIME/artifacts/productive-runs/<TASK>/first-codex-review.json'
  Re-cut each into single-file units. Every unit must have:
    - exactly ONE file in allowed_path_patterns, max_files 1
    - exactly ONE acceptance criterion, expressible as a command with an exit code
    - the parent's verification_commands, unchanged
    - forbidden_changes naming the single admitted path
  A conjunction of N clauses passes at p^N; that is why the parent never
  converged. Flag any two units that touch the same file: pinned to one base SHA
  they cannot run independently, and must be sequenced.
  Write to ~/ardesia-console/<date>/proposed-units.json. Do not admit them.

P3 — Evidence review.
  For each proposed unit, search WikiLLM and the vault for prior work on the same
  file or concept and attach the note titles. A recurring finding should arrive
  with the notes that already discuss it.

REVIEWER — advisory only, never a gate
  You may ask Codex for a second opinion on a decomposition:
    ssh macmini 'cd ~/ARDESIA-RUNTIME/repos/ardesia && codex exec \
      --sandbox read-only --model gpt-5.6-sol -c model_reasoning_effort=xhigh \
      "<question>"'
  Treat the answer as one opinion. Measured: review-agent precision is 3.6-5.1 %,
  and a reviewer asked to explain findings rejects provably-correct code 73-88 %
  of the time. A finding counts only once it is expressible as a failing test.
  Never let a Codex verdict alone block a recommendation.

STOP RULES — mandatory
  - Stop after 3 cycles that produce no new accepted recommendation, and say so.
  - Stop immediately on any precondition failure.
  - Stop if you are about to write outside ~/ardesia-console/.
  - Stop if you cannot cite evidence for a claim; emit the causal blocker instead.
  - Never run unattended overnight. This session is interactive by design; it has
    no lease, no watchdog and no crash receipt.

OUTPUT, every cycle
  A short report with: what was read (paths and SHAs), what was produced, what
  is still unknown, and the single highest-leverage next action for a human.
  Distinguish measured from inferred. Never claim a fix.
```

---

## What this cannot reproduce

The controller provides guarantees a chat session cannot, and these are the reason it stays the scheduler:

1. **Writer leases** — a lease is only meaningful because a supervised process holds it and it expires when that process dies. A chat turn cannot observe its own death.
2. **Single-scheduler enforcement** — a filesystem lock on the Mini. A MacBook session cannot acquire it; the console is safe only because it abstains.
3. **Liveness and restart** — launchd restarts the controller in seconds; `restart_count` is 24. A Desktop session dies on context exhaustion, usage limits, app quit, logout and lid close.
4. **Watchdog and staleness detection** — nothing in a chat can detect its own staleness.
5. **Durable, atomic, typed state** — a transcript is mutable by compaction, unaddressable and lossy.
6. **Idempotency keys** — a re-run chat has no key and will duplicate side effects.
7. **Blocked receipts written at the moment of failure** — a chat writes a receipt when it decides to, not when it crashes, which is exactly when one is needed.
8. **Worktree isolation on the pinned baseline.**
9. **Headroom route attestation for its own reasoning** — the Desktop session's own turns go to Anthropic directly and cannot be attested by a loopback gateway on another machine.
10. **Governed Obsidian writes** — `governed_obsidian_append` enforces the prior-content prefix guarantee mechanically. A prompt saying "append only" is not that.
11. **The doctor gate and the deterministic verification tiers** — available only by invoking the controller, which is an argument for keeping it.
12. **The test evidence base** — 101 tests pin behaviours found by adversarial review. A prompt's behaviour is pinned by nothing.

---

## Next actions

1. **Re-authenticate the writer on the Mac Mini.** `ssh -t macmini 'claude'` then `/login`. Human-only, un-delegable, ~30 seconds. No host change avoids it: `command_environment()` passes no `ANTHROPIC_API_KEY`, so the writer authenticates only through the CLI's stored OAuth credentials.
2. **Re-arm one task** and let the deterministic oracle be tested end-to-end for the first time. `doctor` now fails closed on `writer_auth`, so this cannot proceed on a dead credential.
3. **Run the console in P1 mode** to produce the WIP triage, read-only, controller untouched.
4. **Re-cut BETA-001 to single-file units** via P2 and admit them by hand.
5. **Do not** add a `/loop`, a schedule or a Desktop routine that issues work. Two schedulers is an explicit prohibition breach.
