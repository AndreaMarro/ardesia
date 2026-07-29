# dev-os control plane — AGENTS

Autonomous productive loop for the ARDESIA product repo. Runs on the Mac Mini as
`progettibelli`, runtime root `~/ARDESIA-RUNTIME`. Live policy is
`~/ARDESIA-RUNTIME/config/mcp-control-policy.json`; `policy.source.json` here is
the template.

## Commands

```bash
python3 -m unittest test_ardesia_control_plane     # 82 tests, must be green before install
python3 ardesia_control_plane.py --policy <policy> doctor        # 10 admission checks
python3 ardesia_control_plane.py --policy <policy> loop-audit --trigger manual
python3 ardesia_control_plane.py --policy <policy> propose-tasks --task-id <id>
python3 ardesia_control_plane.py --policy <policy> recover-task --task-id <id> --reason RECOVERED_AFTER_<CODE>
python3 ardesia_control_plane.py --policy <policy> render-plists --output <dir>
```

## Sizing work

`propose-tasks` reads a task's surviving review findings and emits one
single-file unit per finding, each with exactly one acceptance criterion, into
`artifacts/productive-runs/<task>/proposed-tasks.json`. Output is
`PROPOSED_NOT_ADMITTED`: the queue stays immutable and admission is a human act.
The loop must not be able to author its own mandate.

Why it exists: 91 % of a slice is AI wall-clock, and a five-file unit with a
ten-clause conjunctive acceptance resolves under 10 % of the time. One file, one
clause, moves per-attempt odds into the 48-72 % band and costs less per attempt.

Read `path_collisions` before admitting. Every unit is pinned to the frozen base
SHA, so two units on the same file must run sequentially with the base advanced —
otherwise the second starts from base and silently drops the first's work.

## Invariants — do not weaken

- **The deterministic oracle is authoritative.** `loop.acceptance_mode` is
  `DETERMINISTIC_ORACLE`: a candidate commits when the task's own verification
  commands are green and the reviewer raised neither `BLOCKED` nor a `critical`
  finding. Setting it back to `REVIEW_UNANIMOUS` reproduces the 21-hour run that
  accepted nothing. See `2026-07-29-loop-engineering-root-cause-and-fix.md`.
- **The independent reviewer is advisory.** Codex xhigh keeps authority over
  structural rejection and critical defects only. Its other findings become
  `residual-findings.json`, never a reason to discard a verified diff.
- **Nothing pushes, merges or deploys.** Every successful slice terminates at
  `READY_FOR_HUMAN` on a local branch. Keep it that way.
- **The audit consults no model.** `loop-audit` is mechanical and must stay
  free, or it becomes another thing that observes instead of producing. It also
  excludes its own events from its metrics — an instrument that counts itself
  reports the problem it exists to detect.
- **Test the decision functions.** `finalize_productive_slice` shipped for its
  entire history with no test and rejected every green candidate. Any change to
  acceptance, admission or the overlap gate needs a test first.

## Scheduling

launchd, plists rendered by `render-plists` into `~/ARDESIA-RUNTIME/launchd/mcp`
then copied to `~/Library/LaunchAgents`:

| Label | Cadence | Cost |
|---|---|---|
| `com.ardesia.mcp.controller` | KeepAlive | AI when a task is active |
| `com.ardesia.mcp.review` | :00 and :30 | skipped when material is unchanged |
| `com.ardesia.mcp.loop-audit` | hourly at :41 | none, mechanical |
| `com.ardesia.mcp.mailbox` / `.watchdog` | 300 s / 900 s | none |
| `com.ardesia.mcp.backup` | 03:17 | none |

## Reading the audit

`~/ARDESIA-RUNTIME/reports/loop-health-latest.md` is rewritten only when the
finding set changes. `loop-health-trend.jsonl` is append-only — one row per run,
so throughput over time is visible without re-deriving it.

The number that matters is **accepted work units**. A green doctor, a rising test
count and zero accepted units is the documented failure signature, not health.

## Efficiency — where the time actually goes

Measured on a real slice (BETA-004, 78 min end to end):

| phase | share |
|---|---:|
| writer, `claude -p` opus at effort max | ~34 min |
| independent review + repair | ~37 min |
| all verification commands, every phase | ~5 min |

**91 % is AI wall-clock.** Caching verification results would save ~2.5 % and is
not worth the complexity. The only lever that matters is reducing the number of
*failed* attempts, which is what `propose-tasks` addresses.

**Headroom cannot help here, and this is not a misconfiguration.** The policy
sets `lossless: true` and `stateless: true`, so every feature that compresses
(`kompress`, `code_aware`, `output_shaper`, `verbosity_autotune`) or remembers
(`cache`, `memory`, `learn`) is necessarily off, and `headroom savings` reports
`No savings recorded yet`. Those flags are load-bearing: a proxy that rewrites a
review payload makes the receipt unable to prove what the model actually saw,
which is the one thing this system exists to provide. Do not enable the
`agent-90` profile — it sets `HEADROOM_LOSSLESS=0` and `HEADROOM_FORCE_KOMPRESS=1`.
Headroom stays for routing and attestation, not for token savings.

## Known gaps

- Tasks are authored at ~5 files / ~3,000 lines. SWE-bench-Live measures < 10 %
  resolution at 3+ files. `propose-tasks` generates the replacement units;
  admitting them is still manual.
- `FALSIFIED_CANDIDATE_SEED_APPLIED` carries rejected candidates into the next
  task, so each retry inherits the previous objection set. Reset to base instead.
- `finalize_productive_slice` hardcodes one commit message for every task.
- `loop.queue_mode` is `PREAPPROVED_IMMUTABLE`: the loop cannot enqueue its own
  follow-ups, so residual findings need manual admission.
