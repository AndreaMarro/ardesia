# WORKER-RESULT-PACKET-TEMPLATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 integration roles (worker result → AgentMemory loop)

Purpose: what a worker returns when done, so the result feeds back into AgentMemory recall + updates ops/knowledge STATE. Tight, evidence-keyed.

---

```yaml
worker_result:
  context_packet_id: cp-<...>     # the packet this answers
  completed: <ISO8601>
  served_sha: 20560ec             # SHA the work was keyed to
  status: done | partial | blocked
  summary: <one sentence of what was actually achieved>
  evidence:                       # FIRSTHAND only — commands/outputs/paths
    - <command or file path → observed result>
  files_written:                  # absolute paths
    - <path>
  state_updates:                  # which ops/knowledge STATE files to bump
    - ops/knowledge/<X>-STATE.md: <what changed>
  decisions:                      # new DECISIONS.md entries (append-only)
    - <decision text>
  regressions_found:              # new REGRESSIONS.md entries
    - <regression text>
  gate_andrea:                    # actions that need Andrea, not done by worker
    - <action>
  unknowns:                       # honest gaps, do not invent
    - <unknown>
  recall_writeback:               # pointer pushed to AgentMemory
    url: http://127.0.0.1:19828
    wiki_path: <path>
    last_ingest_sha: <SHA>
```

## Rules
- `status: done` requires firsthand verification evidence — no assertion without an observed command/output.
- Never claim a deploy/merge that is gate-Andrea is "done"; list it under `gate_andrea`.
- Append decisions; never edit prior DECISIONS entries.
- Write back only a POINTER to AgentMemory, not duplicated content.
- If served-SHA drifted during the work, note it (lineage trap, R3).
