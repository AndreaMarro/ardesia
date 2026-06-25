# CONTEXT-PACKET-TEMPLATE (GSD)

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 integration roles (GSD cross-tick context-packet pattern)

Purpose: a GSD context-packet carries state ACROSS ticks/sessions so a worker starts grounded, not cold. Copy this, fill it, hand it to the worker. Keep it tight.

---

```yaml
context_packet:
  id: cp-<YYYY-MM-DD>-<short-slug>
  created: <ISO8601>
  served_sha: 20560ec            # the lessonos auto/main SHA this work is keyed to
  vault_sot: ~/ardesia-vault     # source of truth
  task:
    goal: <one sentence, verifiable>
    success_criteria:            # how the worker KNOWS it is done (firsthand)
      - <criterion 1>
      - <criterion 2>
    out_of_scope:
      - <explicit non-goals>
  grounding:
    state_files:                 # ops/knowledge STATE to read first
      - ops/knowledge/<X>-STATE.md
    recall_pointer:              # AgentMemory pointer (not duplicated content)
      url: http://127.0.0.1:19828
      wiki_path: <page/path>
      last_ingest_sha: <SHA>
    prior_decisions:             # relevant DECISIONS.md entries
      - D<n>
    known_regressions:           # relevant REGRESSIONS.md entries
      - R<n>
  inputs:
    files: [<paths>]
    repos: [<repo@branch@sha>]
  constraints:
    privacy: NON-sensitive-only until llm_wiki egress audit passes
    gate_andrea: [<actions that require Andrea>]
  handoff:
    write_to: <target paths>
    report_back: WORKER-RESULT-PACKET → AgentMemory
```

## Rules
- FIRSTHAND only: every claim in the packet must trace to evidence (cite the WF1 output path or a live command).
- Key everything to `served_sha`; if the worker's HEAD differs, it must reconcile against the local bare HEAD first (lineage trap, R3).
- Never put PII/secrets/corpus in a packet (privacy bar).
- If a value is unknown, write `UNKNOWN` — do not invent.
