# ARDESIA MCP control plane

Status: bootstrap implementation for `DEVOS-MCP-BOOTSTRAP-001`. This document is not activation evidence. The installed runtime reports and GitHub issue `#215` are the activation record.

## Runtime model

The Mac mini runs exactly one logical scheduler and five user LaunchAgents:

| Label | Purpose | Schedule |
|---|---|---|
| `com.ardesia.mcp.controller` | state machine, exact-SHA health and lease authority | continuous, `KeepAlive` |
| `com.ardesia.mcp.mailbox` | authenticated GitHub issue poll | every 300 seconds |
| `com.ardesia.mcp.watchdog` | exact-process heartbeat recovery | every 900 seconds |
| `com.ardesia.mcp.review` | deterministic evidence and WikiLLM refresh | hourly |
| `com.ardesia.mcp.backup` | verified Git bundles and control-state archive | daily |

The control plane starts in `SAFE_MAINTENANCE`: reads, indexing, evidence, mailbox validation and backups work, while product writes remain disabled until a trusted, current and unexpired directive is validated.

## Roles

`writer-claude` is the primary writer. Its invocation uses Claude Code batch mode with `--dangerously-skip-permissions`, but only after a valid mailbox directive and exclusive writer lease, inside a realpath-checked isolated worktree. The controller fixes the command, timeout, output bound and expected path set. It rejects the canonical product and Knowledge repositories as writer targets.

`reviewer-codex` is the independent reviewer. The primary adapter uses `codex app-server --listen stdio://` and proves initialize, thread start, turn start, interrupt and resume. The official Codex CLI is the fallback; there is no API-key fallback. `reviewer-claude` may only review non-Claude-authored work.

Automatic writer dispatch is disabled in this bootstrap. No component can merge, deploy, write `main`, alter goals or overwrite the canonical Obsidian/Markdown corpus.

## Knowledge and optional memory

The real WikiLLM pipeline indexes the exact clean Knowledge SHA into a replace-on-success SQLite FTS5 projection. It extracts note classification, headings, wikilinks, supersession metadata, source file hashes and the source commit. Search and compiled context packets retain provenance. Markdown/Git remains canonical; the index is derived and rebuildable.

TencentDB is capture-only shadow infrastructure. Without a private credential reference it reports `DEFERRED_NO_CREDENTIAL_REFERENCE`. Even with a reference, recall injection, offload, persona generation, automatic skill generation and canonical writes remain disabled until a separate bounded canary and approval.

AgentMemory is outside this architecture and must not be read or written. Basic Memory, when available, is only a rebuildable derived index.

## MCP surface

The stdio MCP server exposes only bounded read/validation tools:

- `knowledge.search`
- `knowledge.compile`
- `code.status`
- `evidence.latest`
- `run.status`
- `workflow.validate_directive`

Every tool declares strict JSON Schema draft 2020-12 and rejects additional properties. No write-capable MCP tool is exposed.

## Activation gates

The runtime may report `READY_FOR_HUMAN_REVIEW` only when all of these are recorded as passing:

1. deterministic controller safety tests;
2. live Codex App Server interrupt/resume;
3. live isolated Claude writer probe with the requested permission flag;
4. controller restart recovery;
5. a mailbox execution triggered by launchd rather than a foreground command;
6. a scientific review triggered by its hourly calendar schedule;
7. verification of all five service logs.

The required runtime reports are written under `ARDESIA-RUNTIME/reports`. Rollback boots out the five new labels and bootstraps the preserved prior controller and watchdog plists. Runtime ledgers, evidence and backups are retained.

## Local source tests

```bash
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

The test suite covers strict schemas, traversal and symlink rejection, mailbox authorization and idempotency, stale evidence, typed optional failure, lease confinement, exact-SHA binding, blocked-task liveness, derived WikiLLM behavior, LaunchAgent schedules, required reports and prevention of premature activation state.
