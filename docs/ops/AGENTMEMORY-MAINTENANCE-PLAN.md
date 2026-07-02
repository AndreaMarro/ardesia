# AGENTMEMORY-MAINTENANCE-PLAN

Status: P0 maintenance plan, not executed
Created: 2026-07-02 02:25 CEST
Scope: make AgentMemory safe before any restart, compaction, or import.

## Guardrails

- Do not restart AgentMemory without a local backup bundle and rollback notes.
- Do not run `agentmemory stats`; it previously created a hot diagnostic process.
- Do not run broad recall, import, graph build, or compaction while `livez` times out.
- Do not print `.env` or provider keys. Only print key presence or redacted values.
- Do not delete or truncate logs before backup.
- Do not change launchd jobs until the current state is captured.

## P0 Goal

Return AgentMemory to a bounded, observable state:

1. `/agentmemory/livez` returns within 2 seconds.
2. Main `node agentmemory` CPU settles below 50% for 5 consecutive minutes.
3. Main `node agentmemory` RSS stops climbing and stays below 1.2 GB after warmup.
4. `worker.err` stops repeating `ECONNREFUSED 127.0.0.1:3111` and BM25 shard warnings.
5. Recall/remember canary uses a tiny payload and returns or fails within 5 seconds.

## Operational Canary Runbook

Status: prepared, not executed. This runbook is the minimum operational canary
for the next approved maintenance window. It does not authorize restart, kill,
compaction, import, launchd modification, or log deletion.

### Step 0: Confirm Backup

Use the latest verified backup bundle before any runtime mutation:

- known verified bundle: `/Users/progettibelli/agentmemory-canary-backups/20260702-025141`;
- verification command, run from inside the bundle only:

```bash
shasum -a 256 -c SHA256SUMS.txt
```

Pass condition: every listed file reports `OK`. If any checksum fails, stop and
create a fresh owner-only backup before doing anything else.

### Step 1: Read-Only Baseline

Collect a baseline immediately before maintenance. These commands are read-only
and may be run without changing service state:

```bash
date
hostname
curl -fsS --max-time 8 http://localhost:3111/agentmemory/livez
ps -o pid,ppid,stat,%cpu,%mem,rss,vsz,etime,command -p "$(cat ~/.agentmemory/worker.pid 2>/dev/null)" 2>/dev/null
lsof -nP -iTCP:3111 -iTCP:3112 -iTCP:3113 -sTCP:LISTEN
stat -f '%z %Sm %N' ~/.agentmemory/worker.err ~/.agentmemory/worker.log ~/.agentmemory/consolidate.log 2>/dev/null
tail -n 200 ~/.agentmemory/worker.err | egrep -i 'BM25 shard missing|ECONNREFUSED|WebSocket error|timeout|error' | tail -n 80
```

Metrics to record:

| Metric | Pass target | Current degraded signal |
|---|---:|---|
| `livez` latency | `<2s` | timeout/HTTP 000 |
| node CPU | `<50%` for 5 minutes | hot, several hundred percent |
| node RSS | stable and `<1.2 GB` after warmup | multi-GB sample |
| `worker.err` growth | no rapid growth over 10 minutes | large and still active |
| BM25 warnings | zero new warnings over 10 minutes | repeated shard-missing warnings |
| proxy errors | zero new `ECONNREFUSED 127.0.0.1:3111` | repeated viewer proxy failures |

### Step 2: Approval Gate

Stop here unless Andrea explicitly approves exactly one action. The approval
must name the action and rollback boundary. Do not combine actions.

Allowed one-action candidates, in safety order:

| Action | Runtime mutation? | Why | Rollback boundary |
|---|---|---|---|
| Take a fresh owner-only backup | no service mutation | refresh pre-change evidence | remove only the new backup bundle if Andrea asks |
| Rotate/copy logs after backup | filesystem mutation only | bound `worker.err` growth | restore copied log file from verified backup |
| Pause consolidate/restart launchd job | launchd mutation | stop churn that hides root cause | restore original plist/job state from backup |
| Controlled main service recycle | runtime mutation | clear hot process after evidence capture | restore wrapper/plist state, then re-run baseline |
| BM25/index repair | storage mutation | repair missing shard only after diagnosis | restore changed index/KV files from backup |

### Step 3: Observe One Action

After one approved action, observe for 10 minutes before deciding anything else.

Required samples:

```bash
for i in 1 2 3 4 5; do
  date
  curl -fsS --max-time 8 http://localhost:3111/agentmemory/livez || true
  ps -o pid,stat,%cpu,%mem,rss,etime,command -p "$(cat ~/.agentmemory/worker.pid 2>/dev/null)" 2>/dev/null
  stat -f '%z %Sm %N' ~/.agentmemory/worker.err ~/.agentmemory/worker.log ~/.agentmemory/consolidate.log 2>/dev/null
  sleep 120
done
```

Pass condition: `livez` returns, CPU/RSS trend down or stabilize, and
`worker.err` does not add new BM25/proxy error bursts.

Fail condition: `livez` still times out, CPU/RSS climb again, or log growth
continues. On fail, stop and rollback only the changed boundary. Do not try a
second action in the same window.

### Step 4: Tiny Canary Only After `livez`

Run remember/recall only when `livez` is fast and Andrea explicitly approves the
state-changing canary write:

```bash
curl -fsS --max-time 5 http://localhost:3111/agentmemory/livez
curl -fsS --max-time 5 -X POST http://localhost:3111/agentmemory/remember \
  -H 'Content-Type: application/json' \
  -d '{"content":"agentmemory canary: livez recovered after approved maintenance","concepts":["agentmemory-canary"],"files":[]}'
curl -fsS --max-time 5 -X POST http://localhost:3111/agentmemory/smart-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"agentmemory canary livez recovered","limit":1}'
```

No secrets, no large payloads, no looped retries. If either write/read times out,
stop and keep AgentMemory in fallback mode.

## Phase 1: Freeze And Backup

This phase is required before any service change.

Backup bundle contents:

| Artifact | Reason |
|---|---|
| `~/.agentmemory` metadata and logs | Preserve current engine state, preferences, logs, backups |
| `~/agentmemory-run.sh` | Active runtime wrapper and feature flags |
| `~/bin/am-restart.sh` | Periodic restart behavior |
| `~/bin/agentmemory-consolidate.sh` | Hourly consolidate/graph/restart behavior |
| `~/Library/LaunchAgents/com.elab.agentmemory*.plist` | launchd source of truth |
| `launchctl list | grep -i agentmemory` output | Active job state |
| `ps/lsof/netstat` samples | Process and port ownership evidence |

Backup handling:

- Store the bundle on the Mini only, under a timestamped operator directory.
- Keep permissions owner-only because `.env` backups may contain provider secrets.
- Record size and checksum for the bundle.
- Do not push the backup to GitHub.

Rollback notes must identify:

- original wrapper path;
- original launchd plist paths;
- original `worker.pid` and `iii.pid`;
- exact pre-change port listeners;
- the operator-controlled service action used;
- the matching operator-controlled restore action.

## Phase 2: Stop The Thrash Source

Only after Phase 1 is complete:

1. Pause or gate the hourly consolidation path that performs forced summarize,
   consolidate, graph build, and post-consolidation worker restart.
2. Pause or gate the periodic `am-restart.sh` path if it can mask root cause.
3. Leave the main service untouched until backup and rollback are confirmed.

Reason: the current consolidation log shows `no-growth` followed by worker
restart, while livez remains timed out and the worker is hot. Repeating that
loop is unlikely to heal the index and may hide failure boundaries.

## Phase 3: Diagnose Index And Proxy

Read-only checks after the freeze:

- confirm whether `iii` can answer any lightweight internal endpoint;
- compare viewer proxy failures with direct `:3111` failures;
- locate the BM25 shard path or namespace that owns
  `idx_mr1s9wwt_45a34393b765:00002`;
- inspect whether the shard is missing, corrupt, or referenced by stale metadata;
- verify whether repeated OTel WebSocket errors correlate with engine reconnects.

Do not rebuild the graph yet. A rebuild against a missing shard warning can make
the evidence harder to interpret.

## Phase 4: Controlled Recovery Window

Only after Phases 1-3 are documented:

1. Choose one recovery action, not several.
2. Execute it during a quiet factory window, with no full gate running.
3. Observe for 10 minutes with `ps`, `lsof`, `livez`, and log tails.
4. If CPU/RSS climb immediately or `livez` still times out, stop and rollback.

Allowed recovery candidates, in order of safety:

| Candidate | Purpose | Exit condition |
|---|---|---|
| rotate logs after backup | reduce noisy `worker.err` growth | log tail remains readable, no service state changed |
| pause consolidate/restart jobs | stop forced churn | main service remains running, no hourly restart |
| controlled main service recycle | clear hot process only after backup | `livez` returns, ports preserved, canary passes |
| index repair/rebuild | repair BM25 shard only after root cause | no repeated missing-shard warning |

## Phase 5: Canary

Run only when `/agentmemory/livez` is fast:

- tiny remember payload, one sentence, no secrets;
- tiny recall query, `limit=1`;
- graph/stats or memories endpoint only with a short timeout;
- record timings, HTTP status, and whether the memory can be retrieved.

If the canary times out, revert to fallback mode and do not retry in a loop.

## Fallback Mode

Until the canary passes:

- Treat AgentMemory as recall/cache, never source of truth.
- Use `docs/vault`, `docs/ops`, GitHub PRs, and current live probes as primary evidence.
- Save intended memory payloads into `docs/ops/SCHEDULED-ACTIVITY-LOG.md` or a status
  packet instead of forcing `remember`.
- Keep payloads small enough to paste manually later.
- Do not let a memory outage block product or ops verification.

## Open Questions

- Where does iii persist the active KV/index data outside the visible
  `~/.agentmemory` files?
- Is the BM25 shard warning a stale reference, missing persisted shard, or failed
  rebuild artifact?
- Why does launchd list `com.elab.agentmemory` with status `-9` while the service
  keeps running?
- Which timeout value is actually active: wrapper `45000` or `.env` `120000`?
- Should auto-compress/inject/reflect remain on while AgentMemory is hot?

## COV

Inputs used:

- livez and graph/stats timeouts from 2026-07-02 02:20-02:22 CEST.
- process sample showing PID 33892 at 477.2% CPU and about 2.97 GB RSS.
- `~/.agentmemory` size and log sizes.
- redacted `worker.err`, `worker.log`, and `consolidate.log` tails.
- sanitized launchd plist and wrapper reads.

No maintenance action was executed by this plan.
