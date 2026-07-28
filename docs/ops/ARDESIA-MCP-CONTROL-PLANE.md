# ARDESIA MCP control plane

Status: productive-loop implementation for `DEVOS-MCP-BOOTSTRAP-001`. This document is not activation evidence. The installed runtime reports, per-slice completion receipt and GitHub issue `#215` are the activation record.

## Runtime model

The Mac mini runs exactly one logical scheduler and six user LaunchAgents:

| Label | Purpose | Schedule |
|---|---|---|
| `com.ardesia.mcp.controller` | state machine, exact-SHA health and lease authority | continuous, `KeepAlive` |
| `com.ardesia.mcp.mailbox` | authenticated issue directives plus open-PR/CI monitor | every 300 seconds |
| `com.ardesia.mcp.watchdog` | exact-process heartbeat recovery | every 900 seconds |
| `com.ardesia.mcp.review` | deterministic evidence and WikiLLM refresh | every 30 minutes |
| `com.ardesia.mcp.backup` | verified Git bundles and control-state archive | daily |
| `com.ardesia.obsidian-sync` | official Obsidian Headless read/write sync supervisor | continuous, `KeepAlive` |

The controller admits only immutable tasks embedded in the reviewed policy. It remains `PAUSED_SAFETY` until the exact product and Knowledge SHAs are clean, the GitHub monitor has a fresh clear snapshot, no actionable task path overlaps an open PR, and official Obsidian Headless Sync is observed as `ACTIVE_CONTINUOUS`. The five-minute monitor records every open PR head and CI rollup even while a slice is running; the controller refreshes this oracle immediately before admitting the next pending task, and the worker rechecks GitHub at preflight, before and after the writer, after a repair and immediately before commit. A new overlap or unavailable inventory blocks the affected slice without external writes. Terminal tasks remain append-only evidence but are excluded from later path admission, so a correctly frozen `BLOCKED_CAUSAL` task cannot poison unrelated queue members.

A causally blocked task can be rearmed with `recover-task` only after the former exact worker is no longer live, its immutable task digest still matches, the admitted branch remains at the frozen base SHA, the worktree has zero product changes and any matching stale lease is released with a recovery receipt. This supports surgical recovery from a fixed infrastructure cause without silently retrying or bypassing a product/test/review failure.

A provider `overloaded_error` during the single Codex-directed Claude repair is a narrower transport case: partial allowed-path work must not be discarded or mistaken for a product failure. The controller may resume the same Claude session at most twice through `repair-worker`, only when the overload receipt, task digest, frozen review, exact branch/base, worktree path and bounded diff all match and no prior worker is live. Each retry receives a new lease; afterward the complete verification and independent second review still run. No other Claude/API failure is automatically recoverable.

## Roles

`writer-claude` is the primary writer. Its invocation uses Claude Code Opus at `max` effort in batch mode with `--dangerously-skip-permissions`, but only for one pre-approved task after an exclusive writer lease, inside a realpath-checked isolated worktree. The controller fixes the model class, effort, tool set, command, timeout, output bound, base SHA and exact path set. Claude loads project settings only and uses a strict, controller-supplied MCP configuration: WikiLLM search, the authenticated GitHub monitor snapshot, exact local code status and the latest scientific evidence. User plugins, user MCP configuration, AgentMemory, claude-mem, Web search and generic external MCP servers are excluded; TencentDB is not exposed to the writer before a separate verified shadow canary. The controller rejects the canonical product and Knowledge repositories as writer targets. The only ignored worktree infrastructure path is an exact symlink from `apps/studio/node_modules` to the canonical dependency directory; a missing, replaced or differently targeted link loses that exception, and every other untracked path remains blocking. Finished slice workers are explicitly reaped by the continuous controller.

The minimized command environment disables Node 25's incomplete experimental global Web Storage with `NODE_OPTIONS=--no-experimental-webstorage`. This prevents the Node global from shadowing Vitest's DOM `localStorage`; it does not skip or filter tests. On the frozen product SHA, the uncontrolled Node 25 environment reproducibly produces 18 storage-related false failures, while the isolated environment executes all 1,987 tests successfully.

`reviewer-codex` is the independent reviewer. The lifecycle adapter uses `codex app-server --listen stdio://`; productive review uses the official Codex CLI with `gpt-5.6-sol`, `xhigh` reasoning, a read-only sandbox and a strict verdict schema. One Claude repair is allowed, followed by a second full verification and Codex review. There is no API-key fallback.

The reviewer executable is pinned outside the repositories at `ARDESIA-RUNTIME/tools/codex-cli/node_modules/.bin/codex`. Productive health requires `codex-cli >= 0.145.0`, the first locally verified release that accepts `gpt-5.6-sol`; an older Codex.app resource binary pauses the queue before writer dispatch instead of failing after implementation.

Automatic writer dispatch is enabled only for the immutable `PREAPPROVED_IMMUTABLE` queue. `BETA-001-CONTINUITY-RUNTIME` is retained as a falsified first attempt: all gates passed, but independent review found that its allow-list excluded real navigation and could not satisfy the acceptance criteria. `BETA-002-CONTINUITY-REACHABLE` preserves the real-navigation hypothesis and its independent findings, but is causally blocked because `Room.tsx` overlaps open PRs. `BETA-003-CONTINUITY-FAIL-CLOSED-STORAGE` is a separately admitted, non-overlapping bounded task at the same frozen product SHA. It hardens zero-I/O scope validation, truthful IndexedDB/in-memory persistence identity, raw-envelope validation, legacy/data-loss/evidence states and genuine fresh-adapter cold reopen. Its acceptance explicitly forbids claiming that the blocked navigation requirement is complete. No component can merge, deploy, push, write `main`, alter goals or promote an Obsidian proposal to canon.

## Knowledge and optional memory

WikiLLM prefers the live Headless-synchronized Obsidian vault and falls back to the exact clean Knowledge SHA only while Sync is unavailable. It builds a replace-on-success SQLite FTS5 projection and extracts note classification, headings, wikilinks, supersession metadata, file hashes and source snapshot. Search and compiled context packets retain provenance. The index is derived and rebuildable.

Obsidian access is broad-read/narrow-write. All Markdown notes are readable except hidden/system material. Automatic writes are append-only and confined to `80-Sources/AI-Inbox`, `85-Agent-Proposals`, `90-Runs`, `91-Auto-Receipts`, `92-Evidence` and `93-Context-Packets`. `00-Control`, `10-Requirements`, `20-Decisions`, `30-Architecture` and `40-Product-Canon` are readable but protected from automatic write, delete, overwrite and promotion. Every verified slice creates a local Knowledge branch receipt and a live Obsidian receipt; pending notes are flushed idempotently after Sync recovery.

TencentDB is capture-only shadow infrastructure. Without a private credential reference it reports `DEFERRED_NO_CREDENTIAL_REFERENCE`. Even with a reference, recall injection, offload, persona generation, automatic skill generation and canonical writes remain disabled until a separate bounded canary and approval.

AgentMemory is outside this architecture and must not be read or written. Basic Memory, when available, is only a rebuildable derived index.

## MCP surface

The stdio MCP server exposes only bounded read/validation tools:

- `knowledge.search`
- `knowledge.compile`
- `code.status`
- `evidence.latest`
- `run.status`
- `github.status`
- `workflow.validate_directive`

Every tool declares strict JSON Schema draft 2020-12 and rejects additional tool arguments. The transport accepts and ignores the MCP client’s protocol-level `_meta` object while rejecting any other unexpected call field. No write-capable MCP tool is exposed.

## Activation gates

The control-plane bootstrap may report `READY_FOR_HUMAN_REVIEW` only when all of these are recorded as passing:

1. deterministic controller safety tests;
2. live Codex App Server interrupt/resume;
3. live isolated Claude writer probe with the requested permission flag;
4. controller restart recovery;
5. a mailbox execution triggered by launchd rather than a foreground command;
6. a scientific review triggered by its real 30-minute calendar schedule;
7. verification of all service logs.

A productive task may report `READY_FOR_HUMAN` only after:

1. exact-SHA, fresh GitHub PR/CI snapshot and open-PR overlap preflight;
2. live Obsidian context ingestion and immutable context digest;
3. clean baseline Studio test, typecheck and build;
4. one isolated Claude writer invocation;
5. maximum five changed files, all on the task allow-list;
6. post-write Studio test, typecheck and build;
7. independent Codex `PASS`, optionally after exactly one repair;
8. a final live GitHub overlap gate, hook-respecting local commit and append-only memory delta.

The required runtime reports are written under `ARDESIA-RUNTIME/reports`. Rollback boots out the six new labels and bootstraps the preserved prior controller and watchdog plists. Runtime ledgers, evidence and backups are retained.

## Local source tests

```bash
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

The test suite covers strict schemas, traversal and symlink rejection, mailbox authorization and idempotency, GitHub PR/CI monitoring and overlap blocking, terminal-task overlap isolation, session-bound and retry-bounded Claude overload recovery, stale evidence, typed optional failure, lease confinement, immutable queue admission, five-file path bounds, append-only Obsidian writes, exact-SHA binding, Node 25 test-environment isolation, blocked-task liveness, live/fallback WikiLLM behavior, LaunchAgent schedules, required reports and prevention of premature activation state.
