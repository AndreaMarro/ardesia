# dev-os control plane — AGENTS

Autonomous productive loop for the ARDESIA product repo. Runs on the Mac Mini as
`progettibelli`, runtime root `~/ARDESIA-RUNTIME`. Live policy is
`~/ARDESIA-RUNTIME/config/mcp-control-policy.json`; `policy.source.json` here is
the template.

## Commands

```bash
python3 -m unittest test_ardesia_control_plane     # 74 tests, must be green before install
python3 ardesia_control_plane.py --policy <policy> doctor        # 10 admission checks
python3 ardesia_control_plane.py --policy <policy> loop-audit --trigger manual
python3 ardesia_control_plane.py --policy <policy> recover-task --task-id <id> --reason RECOVERED_AFTER_<CODE>
python3 ardesia_control_plane.py --policy <policy> render-plists --output <dir>
```

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

## Known gaps

- Tasks are authored at ~5 files / ~3,000 lines. SWE-bench-Live measures < 10 %
  resolution at 3+ files. Split into single-file units of ≤ 50 lines.
- `FALSIFIED_CANDIDATE_SEED_APPLIED` carries rejected candidates into the next
  task, so each retry inherits the previous objection set. Reset to base instead.
- `finalize_productive_slice` hardcodes one commit message for every task.
- `loop.queue_mode` is `PREAPPROVED_IMMUTABLE`: the loop cannot enqueue its own
  follow-ups, so residual findings need manual admission.
