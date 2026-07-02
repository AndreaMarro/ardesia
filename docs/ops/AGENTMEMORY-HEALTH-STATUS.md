# AGENTMEMORY-HEALTH-STATUS

Verified: 2026-07-02 02:20-02:22 CEST
Host: `macmini` / `Mac.homenet.telecomitalia.it`
Mode: read-only health probe. No restart, no compaction, no import, no process kill.

## Verdict

AgentMemory is live at the socket/process level but unhealthy for normal use.

Treat it as a degraded cache until maintenance is completed. Do not use broad
recall, `agentmemory stats`, bulk import, graph rebuild, manual compaction, or
restart flows while `/agentmemory/livez` is timing out.

## Livez

Both local tunnel and Mini loopback probes timed out.

| Probe | Result |
|---|---|
| MacBook `127.0.0.1:3111/agentmemory/livez` | timeout after 5.006s, HTTP 000 |
| Mini `127.0.0.1:3111/agentmemory/livez` | timeout after 5.011s, HTTP 000 |
| Mini `127.0.0.1:3111/agentmemory/graph/stats` | timeout after 2.005s, HTTP 000 |

## Processes

Observed at 2026-07-02 02:21-02:22 CEST:

| PID | Role | Elapsed | CPU | MEM | RSS | Status |
|---:|---|---:|---:|---:|---:|---|
| 33892 | `node /Users/progettibelli/node-local/bin/agentmemory` | 11m | 477.2% | 17.7% | 2,968,160 KB | hot/high memory |
| 20051 | `iii --config .../iii-config.yaml` | 6h09m | 0.0% | 14.7% | 2,471,456 KB | high memory, listening |

Launchd view:

| Label | State |
|---|---|
| `com.elab.agentmemory` | PID 33892, status `-9` |
| `com.elab.agentmemory-consolidate` | listed, no PID |
| `com.elab.agentmemory-restart` | listed, no PID |
| `com.elab.agentmemory-mini-capture` | listed, no PID |

Port ownership:

| Port | Listener |
|---:|---|
| 3111 | `iii` PID 20051 |
| 3112 | `iii` PID 20051 |
| 3113 | `node` PID 33892 |
| 3114 | no listener in this sample |

## Storage

Filesystem has headroom; AgentMemory itself is not large, but error logs are.

| Item | Size / State |
|---|---:|
| `/System/Volumes/Data` | 460 Gi total, 276 Gi used, 110 Gi available |
| `~/.agentmemory` | 253 MB |
| `~/.agentmemory/worker.err` | about 225 MB |
| `~/.agentmemory/worker.log` | about 416 KB |
| `~/.agentmemory/consolidate.log` | about 84 KB |
| `~/.agentmemory/backups` | about 36 KB |

Large files sampled:

- `~/.agentmemory/worker.err`, about 222 MB at `ls -ls` sample time.
- `~/.agentmemory/bin/iii`, about 27 MB.

No SQLite/DB-sized local data file was found under `~/.agentmemory` in the
sampled `*.db`, `*.sqlite*`, `*.json`, `*.jsonl` search. This suggests the live
state is primarily in the iii engine/KV path, not in an obvious local DB file.

## Logs

Redacted tails only; no raw env secret values were printed.

`worker.err` repeats:

- viewer proxy failures on `/graph/stats` and `/memories`;
- `connect ECONNREFUSED 127.0.0.1:3111`;
- repeated `[OTel] WebSocket error`;
- repeated AgentMemory warning: BM25 shard missing for
  `mem:index:bm25:bm25:idx_mr1s9wwt_45a34393b765:00002`.

`worker.log` shows repeated clean startup banners for AgentMemory `v0.9.26`:

- REST API `http://localhost:3111`;
- Viewer `http://localhost:3113`;
- Streams `ws://localhost:3112`;
- Engine `ws://localhost:49134`.

`consolidate.log` shows hourly cycles ending with:

- `nodes_post=-1 edges_post=-1 mem_post=-1 verdict=no-growth`;
- `post-consolidation worker restart (RSS drop)`.

## Config Signals

Sanitized wrapper/env flags observed:

| Flag | Value |
|---|---|
| `EMBEDDING_PROVIDER` | `local` |
| `AGENTMEMORY_AUTO_COMPRESS` | `true` |
| `GRAPH_EXTRACTION_ENABLED` | `true` |
| `CONSOLIDATION_ENABLED` | `true` |
| `AGENTMEMORY_REFLECT` | `true` |
| `AGENTMEMORY_INJECT_CONTEXT` | `true` |
| `AGENTMEMORY_LLM_TIMEOUT_MS` | wrapper `45000`, `.env` `120000` |
| `FALLBACK_PROVIDERS` | empty |

The active wrapper contains local LiteLLM/OpenAI-compatible and Gemini fallback
settings, with values redacted in this probe.

## Immediate Risk

1. `livez` timeout means the REST surface is not safe for routine recall.
2. Hot `node` process plus high RSS can overlap with factory gates.
3. Hourly consolidation currently performs graph/consolidation calls and then
   restarts the worker, which may hide the root cause.
4. BM25 shard warnings suggest index persistence or shard lookup damage.
5. `worker.err` growth can keep consuming disk if the loop remains noisy.

## COV

Commands/probes used:

- `curl --max-time 5 .../agentmemory/livez` locally and on Mini.
- `curl --max-time 2 .../agentmemory/graph/stats` on Mini.
- `ps -axo pid,ppid,etime,%cpu,%mem,rss,comm,args`.
- `lsof -nP -iTCP:3111..3114 -sTCP:LISTEN`.
- `launchctl list | grep -i agentmemory`.
- `du -sh ~/.agentmemory`, `df -h ~/.agentmemory`.
- redacted `tail` of `worker.err`, `worker.log`, `consolidate.log`.
- sanitized reads of `agentmemory-run.sh`, launchd plists, and AgentMemory flags.

Not done:

- no restart;
- no process kill;
- no compaction/consolidation trigger;
- no bulk import;
- no env secret dump;
- no destructive storage action.
