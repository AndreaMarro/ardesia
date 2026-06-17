# Claude-mem Save Observation — Usage Guide

**Scope**: discipline MCP save observation calls at lifecycle points so Day N
MCP floor (≥10 calls/day per sett-2 contract) is met automatically, not
depending on agent memory.

**Problem solved**: Day 11 audit honest floor miss — direct MCP calls = 0 vs
target ≥10. Manual discipline drift. Need automation scaffold.

## The script

`scripts/cli-autonomous/claude-mem-save.sh` generates canonical JSON payload
for a claude-mem save-observation MCP call and writes to
`automa/state/claude-mem-pending/<event>-<ts>.json`.

**Script does NOT call MCP directly.** MCP is a Claude CLI tool namespace.
The script prepares the payload so the next Claude turn dispatches the MCP
call in a single tool invocation (no context manipulation needed).

## Events supported

| Event        | When to invoke                                    |
|--------------|---------------------------------------------------|
| `commit`     | Post-commit (each atomic commit)                  |
| `end-day`    | End-of-day rollup (after handoff written)         |
| `end-week`   | Sprint end (after review + retrospective)         |
| `decision`   | Architectural decision captured (ADR written)     |
| `blocker`    | New blocker detected (blockers.md entry added)    |
| `audit`      | Honest audit snapshot produced (day-N-audit.md)   |

## Usage examples

### 1) Post-commit
```bash
git commit -m "feat(scope): ... [TEST NNNN]"
./scripts/cli-autonomous/claude-mem-save.sh commit
# Then in Claude CLI turn: dispatch
# mcp__plugin_claude-mem_mcp-search__save_observation using payload file
```

### 2) End-of-day
```bash
./scripts/cli-autonomous/end-day-handoff.sh
./scripts/cli-autonomous/claude-mem-save.sh end-day
# Claude CLI: dispatch save with generated payload file
```

### 3) End-of-week
```bash
./scripts/cli-autonomous/end-week-gate.sh
./scripts/cli-autonomous/claude-mem-save.sh end-week sprint-2-complete
```

### 4) Decision/ADR
```bash
git add docs/architectures/ADR-004-foo.md
git commit -m "docs(adr): ADR-004 foo [TEST 12166]"
./scripts/cli-autonomous/claude-mem-save.sh decision adr-004
```

### 5) Blocker added
```bash
# After appending BLOCKER-00N to automa/team-state/blockers.md
./scripts/cli-autonomous/claude-mem-save.sh blocker blocker-009 p1
```

### 6) Audit snapshot
```bash
# After writing docs/audit/day-N-audit.md
./scripts/cli-autonomous/claude-mem-save.sh audit
```

## Payload structure

```json
{
  "event": "end-day",
  "timestamp": "2026-04-21T17:30:00+08:00",
  "title": "Day 12 end — sett-2-stabilize-v2",
  "content": "End-of-day rollup. Last SHA: ...",
  "tags": "end-day,day-12,sprint-sett-2-stabilize-v2",
  "sha": "ded2e19...",
  "branch": "feature/sett-2-stabilize-v2",
  "sprint": "sett-2-stabilize-v2",
  "sprint_day": "12",
  "test_count_baseline": "12166"
}
```

## Pending directory lifecycle

- `automa/state/claude-mem-pending/` — payloads awaiting MCP save dispatch
- After successful MCP save in Claude CLI turn, file SHOULD be moved to
  `automa/state/claude-mem-sent/` (subagent responsibility OR manual cleanup)
- Pending files > 7 days old → cleanup by end-week-gate.sh (future enforcement)

## Integration points (current + future)

### Currently wired
- Manual invocation per event (script invokable standalone)
- Documented in Day 12 Sprint Contract P0-1

### Future integration (post-Andrea approval)
- Git post-commit hook → auto-invoke with `commit` event
- `end-day-handoff.sh` pipeline step → auto-invoke with `end-day` event
- `end-week-gate.sh` pipeline step → auto-invoke with `end-week` event

**Design**: script remains safe to run without MCP dispatch (idempotent file
write). Dispatch coupling stays loose — Claude CLI drives actual MCP save.

## Smoke test

```bash
./scripts/cli-autonomous/claude-mem-save.sh commit
ls automa/state/claude-mem-pending/ | grep commit-
cat "$(ls -t automa/state/claude-mem-pending/commit-* | head -1)" | head -20
```

Expected: JSON with `event: commit`, valid `title`, `tags`, `sha`.

## Day 11 floor miss recovery

Day 12 aims ≥10 MCP calls direct. Of those, ≥4 should come from save
observations at lifecycle points (commit × 3-4 + end-day × 1). Rest from
search operations during task execution (mcp__plugin_claude-mem_mcp-search__
smart_search, get_observations, timeline).

## Audit trail

- Script source: `scripts/cli-autonomous/claude-mem-save.sh` (Day 12 P0-1)
- This doc: `docs/workflows/claude-mem-save-usage.md` (Day 12 P0-1)
- Floor target: sett-2 contract (`automa/team-state/sprint-contracts/sett-2-sprint-contract.md`)
- Day 11 floor miss: `docs/handoff/2026-04-21-day-11-end.md`
