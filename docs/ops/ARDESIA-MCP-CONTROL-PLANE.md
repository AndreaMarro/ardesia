# ARDESIA MCP control plane

Status: control-plane v1.8 implementation for `DEVOS-MCP-BOOTSTRAP-001`. This document is not activation evidence. The installed runtime reports, per-slice completion receipt and GitHub issue `#215` are the activation record.

## Runtime model

The Mac mini runs exactly one logical scheduler and seven user LaunchAgents:

| Label | Purpose | Schedule |
|---|---|---|
| `com.ardesia.headroom-gateway` | required loopback AI gateway and no-bypass boundary | continuous, `KeepAlive` |
| `com.ardesia.mcp.controller` | state machine, exact-SHA health and lease authority | continuous, `KeepAlive` |
| `com.ardesia.mcp.mailbox` | authenticated issue directives plus open-PR/CI monitor | every 300 seconds |
| `com.ardesia.mcp.watchdog` | exact-process heartbeat recovery | every 900 seconds |
| `com.ardesia.mcp.review` | deterministic probes, WikiLLM refresh and independent SOL/xhigh scientific audit | every 30 minutes |
| `com.ardesia.mcp.backup` | verified Git bundles and control-state archive | daily |
| `com.ardesia.obsidian-sync` | official Obsidian Headless read/write sync supervisor | continuous, `KeepAlive` |

The controller admits only immutable tasks embedded in the reviewed policy. It remains `PAUSED_SAFETY` until the exact product and Knowledge SHAs are clean, the GitHub inventory is fresh, and official Obsidian Headless Sync is observed as `ACTIVE_CONTINUOUS`. An overlap belonging only to a later task remains visible as `BLOCKING_OVERLAP` but cannot stall the current non-overlapping task; task-specific phase gates block that later task when it becomes actionable. The five-minute monitor records every open PR head and CI rollup even while a slice is running; the worker refreshes GitHub and inventories canonical plus local dirty/ahead worktrees at preflight, before and after the writer, after a repair and immediately before commit. During a long Claude turn, the lease is renewed every 30 seconds, changed paths and elapsed time are recorded, and both coordination oracles are refreshed at most every five minutes. A current-task overlap, stale oracle, lease mismatch or path escape terminates only the exact writer process group and blocks the slice without external writes. Terminal task worktrees remain append-only evidence but are classified separately, so a correctly frozen `BLOCKED_CAUSAL` or `READY_FOR_HUMAN` task cannot poison a later queue member.

A causally blocked task can be rearmed with `recover-task` only after the former exact worker is no longer live, its immutable task digest still matches, the admitted branch remains at the frozen base SHA, the worktree has zero product changes and any matching stale lease is released with a recovery receipt. This supports surgical recovery from a fixed infrastructure cause without silently retrying or bypassing a product/test/review failure.

A provider `overloaded_error` is treated as a narrow transport failure rather than a product verdict. During the primary writer turn, the live worker may resume the same bound Claude session at most twice; during the single Codex-directed repair, the controller may resume the same session at most twice through `repair-worker`. Recovery requires the overload receipt, task/session digest, exact branch/base, worktree path and bounded diff to match, with no competing worker. Every retry receives a new renewable lease; afterward the complete verification and independent review still run. No other Claude/API failure is automatically recoverable.

## Roles

`writer-claude` is the primary writer. Its invocation uses Claude Code Opus at `max` effort in batch mode with `--dangerously-skip-permissions`, but only for one pre-approved task after an exclusive renewable writer lease, inside a realpath-checked isolated worktree. The controller fixes the model class, effort, tool set, command, timeout, output bound, base SHA and exact path set. Claude loads project settings only and uses a strict, controller-supplied MCP configuration: WikiLLM search, the authenticated GitHub monitor snapshot, exact local code status and the latest scientific evidence. User plugins, user MCP configuration, AgentMemory, claude-mem, Web search and generic external MCP servers are excluded; mutable home-directory aliases mentioned by repository guidance are not authority. The controller rejects the canonical product and Knowledge repositories as writer targets. The only ignored worktree infrastructure path is an exact symlink from `apps/studio/node_modules` to the canonical dependency directory; a missing, replaced or differently targeted link loses that exception, and every other untracked path remains blocking. Finished slice workers are explicitly reaped by the continuous controller.

Every managed AI inference is fail-closed through pinned Headroom `0.32.1` on `127.0.0.1:8787`. The gateway starts stateless and lossless with semantic cache, persistent memory, learning, output shaping, effort routing, verbosity autotuning, telemetry, rate limiting, subscription polling, Read lifecycle rewriting and Kompress disabled. Upstream retries are limited to one, while the request timeouts permit long Claude sessions. Claude receives a controller-owned `ANTHROPIC_BASE_URL` plus a unique `X-Headroom-Stack` correlation header and runs inside the outer macOS network sandbox that permits outbound traffic only to the pinned Headroom loopback port, including subprocesses launched through `Bash`. Every Codex CLI and App Server launch instead uses its native read-only sandbox, frozen controller-owned `model_provider`, loopback `base_url`, Responses wire protocol, WebSocket support, OpenAI-auth settings, unique correlation header and post-call route attestation; Codex does not have a second outer network sandbox. Caller-supplied Codex routing overrides are rejected. The controller validates the exact gateway binary, PID, process arguments and stable semantic health contract, then requires the same PID, a positive request-counter delta and a matching client/provider/correlation record around every AI call. Each attestation is persisted as a content-addressed route receipt. A healthy proxy without observed correlated traffic is a failure, and there is no accepted direct-provider fallback.

The minimized command environment disables Node 25's incomplete experimental global Web Storage with `NODE_OPTIONS=--no-experimental-webstorage`. This prevents the Node global from shadowing Vitest's DOM `localStorage`; it does not skip or filter tests. On the frozen product SHA, the uncontrolled Node 25 environment reproducibly produces 18 storage-related false failures, while the isolated environment executes all 1,987 tests successfully.

`reviewer-codex` is the independent reviewer. The lifecycle adapter uses `codex app-server --listen stdio://`; productive review uses the official Codex CLI with `gpt-5.6-sol`, `xhigh` reasoning, a read-only sandbox and a strict verdict schema. One Claude repair is allowed, followed by a second full verification and Codex review. There is no direct-provider or API-key fallback.

The reviewer executable is pinned outside the repositories at `ARDESIA-RUNTIME/tools/codex-cli/node_modules/.bin/codex`. Productive health requires `codex-cli >= 0.145.0`, the first locally verified release that accepts `gpt-5.6-sol`; an older Codex.app resource binary pauses the queue before writer dispatch instead of failing after implementation.

Automatic writer dispatch is enabled only for the immutable `PREAPPROVED_IMMUTABLE` queue. Admission is append-only at queue level: the already admitted task IDs and digests must remain an exact ordered prefix, and the state transition is protected by the productive-state lock. Removal, reordering, insertion before an admitted task or digest mutation pauses the loop with `queue_admission_violation` without terminating the controller.

The 30-minute scientific cycle continues after that finite queue is exhausted. It compiles frozen operator sources, exact-base repository rules and history, prior run/review evidence, authenticated external directives, GitHub state, local worktree coordination, Obsidian/WikiLLM state, the required Headroom boundary and the explicitly disabled Hermes boundary. Unchanged exogenous material returns `SKIP_NO_AI` with zero model calls and zero Obsidian writes. Changed material receives a real `gpt-5.6-sol`/`xhigh` read-only audit that classifies progress versus mere liveness and may publish one bounded proposal under `85-Agent-Proposals`. The proposal is explicitly `PROPOSED_NOT_ADMITTED`: it cannot dispatch Claude, rewrite policy or weaken a gate. A successful audit proves that the bounded audit ran; it is not evidence of accepted product progress. Therefore continuous supervision is no-stop, while autonomous product writing remains continuous only across already approved queue items. Calling an empty finite queue a no-stop writer would be false; additional product work requires an append-only reviewed admission.

Every causal stop writes a local failure JSON plus an append-only Obsidian evidence receipt with the failed phase, task/session binding, observed paths and review verdict. A failure receipt is not an automatic retry token and cannot promote a blocked delta.

Scheduled jobs also fail observably rather than disappearing into launchd stderr. A review directory is created before GitHub, doctor or WikiLLM work begins; any early exception produces typed `failure.json`, `completion.json`, manifest, ledger event and—when Headless Sync is live—an append-only Obsidian receipt. A failed SOL transport/schema sets `audit_execution_state=FAIL` and cannot satisfy the scheduled scientific-evidence gate. Backup bundle/archive failures and malformed watchdog heartbeats likewise become typed state receipts.

`BETA-001-CONTINUITY-RUNTIME` is retained as a falsified first attempt: all gates passed, but independent review found that its allow-list excluded real navigation and could not satisfy the acceptance criteria. `BETA-002-CONTINUITY-REACHABLE` preserves the real-navigation hypothesis and its independent findings, but is causally blocked because `Room.tsx` overlaps open PRs. `BETA-003-CONTINUITY-FAIL-CLOSED-STORAGE` is a separately admitted, non-overlapping bounded task at the same frozen product SHA. It hardens zero-I/O scope validation, truthful IndexedDB/in-memory persistence identity, raw-envelope validation, legacy/data-loss/evidence states and fresh-adapter cold reopen; the second independent review retained six falsifiers.

`BETA-004-CONTINUITY-TRUSTED-REOPEN` is the only appended successor. It starts from the same exact clean product SHA and zero-overlap oracle. Only after the full clean baseline may the controller apply a content-addressed three-file snapshot of BETA-003, bound to the immutable source-task digest and the second Codex review digest. The snapshot is labelled `FALSIFIED_UNTRUSTED_SEED`, re-runs all three full gates before Claude receives it, and is repair input rather than accepted evidence. BETA-004 receives a new task digest, branch, lease, Claude session, one-repair budget and independent Codex review. Its five-file boundary closes the six residual persistence, byte-read, immutability, provenance, cold-reopen and component-fault-matrix falsifiers without claiming route reachability. No component can merge, deploy, push, write `main`, alter goals or promote an Obsidian proposal to canon.

`BETA-005-CONTINUITY-SCOPED-AUTHORITY-ORACLE` is the next immutable successor. Its real writer and repair sessions, full tests, typecheck and build completed, but the second independent review retained five major authority, immutability, cleanup and scoped-recovery falsifiers. It is therefore `BLOCKED_CAUSAL`, with the candidate preserved as evidence rather than accepted or silently retried work.

## Knowledge and optional memory

WikiLLM prefers the live Headless-synchronized Obsidian vault and falls back to the exact clean Knowledge SHA only while Sync is unavailable. An exclusive ingest/shared-read lock and a two-phase source digest prevent a database built from a moving vault snapshot from being published. It builds a replace-on-success SQLite FTS5 projection and extracts note classification, headings, wikilinks, supersession metadata, file hashes and source snapshot. Search and compiled context packets retain provenance. The index is derived and rebuildable. Agent-generated proposal/run/receipt/evidence/context roots remain searchable, but a separate exogenous material digest excludes those roots from the 30-minute change trigger. Consequently a scientific receipt cannot trigger another receipt merely by entering WikiLLM; canonical decisions, human inbox material, GitHub/directive changes and productive-task progress still change the trigger.

Every task context also binds the supplied bootstrap, scientific analysis, prior-findings ledger and no-stop bundles by SHA-256; repository rules and operating sources are read from the exact frozen product commit rather than mutable home-directory copies. Text allocation is priority-and-quota based, so a large repository coordination file cannot starve the operator bootstrap, prior findings or scientific analysis; every entry reports included, omitted and truncated character counts. The writer context packet is capped at 30,000 characters and the scientific supervisor packet at 24,000 characters. The packet includes task-scoped Git history, all bounded schema-validated prior Codex review artifacts plus failure/completion digests, full validated mailbox directive payloads and the local coordination inventory. A stable content digest excludes compilation timestamps, while the run-specific context digest preserves the exact packet used by the writer.

Headroom route receipts retain only an allow-list of non-negative finite numeric observations plus route identity metadata; prompts, response bodies, headers, credentials and full messages are not retained. Per-route token and latency fields are exact Headroom observations. The controller also records wall time around the bound invocation. Headroom exposes cost only at the global statistics-window level, so `cost_window_delta_usd` is explicitly attributed as `GLOBAL_WINDOW_UPPER_BOUND`, never as exact per-request billing.

Obsidian access is broad-read/narrow-write. All Markdown notes are readable except hidden/system material. Automatic writes are append-only and confined to `80-Sources/AI-Inbox`, `85-Agent-Proposals`, `90-Runs`, `91-Auto-Receipts`, `92-Evidence` and `93-Context-Packets`. `00-Control`, `10-Requirements`, `20-Decisions`, `30-Architecture` and `40-Product-Canon` are readable but protected from automatic write, delete, overwrite and promotion. Every verified slice creates a local Knowledge branch receipt and a live Obsidian receipt; pending notes are flushed idempotently after Sync recovery.

TencentDB is removed from the control plane because it produced no verified workflow benefit. Hermes `0.19.0` is classified only as a future derived-memory/planner candidate and cannot schedule work or write canon. It remains `DISABLED_HERMES_HEADROOM_BYPASS_5875`: its normal credential pool, auxiliary clients, image path, model probes and Codex App Server adapter can still select direct provider endpoints despite `HERMES_CODEX_BASE_URL`. Hermes may become an AI component only after a central endpoint patch, all fallback paths are disabled, a no-bypass matrix passes and Headroom-down failure is proven closed.

Paperclip and Pi are not active schedulers or workers. Any later champion/challenger pilot must preserve the single scheduler, canonical Obsidian/Git authority and the same Headroom request-attestation gate; an adapter that cannot prove this remains disabled.

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
2. live required Headroom health plus no-bypass failure injection;
3. live Codex App Server interrupt/resume with a positive Headroom request delta;
4. live isolated Claude writer probe with the requested permission flag and a positive Headroom request delta;
5. controller restart recovery;
6. a mailbox execution triggered by launchd rather than a foreground command;
7. a scientific review triggered by its real 30-minute calendar schedule;
8. verification of all service logs.

A productive task may report `READY_FOR_HUMAN` only after:

1. exact-SHA, fresh GitHub PR/CI snapshot and open-PR overlap preflight;
2. live Obsidian context ingestion and immutable context digest;
3. clean baseline Studio test, typecheck and build;
4. one isolated Claude writer invocation;
5. maximum five changed files, all on the task allow-list;
6. post-write Studio test, typecheck and build;
7. independent Codex `PASS`, optionally after exactly one repair;
8. a final live GitHub overlap gate, hook-respecting local commit and append-only memory delta.

The required runtime reports are written under `ARDESIA-RUNTIME/reports`. Rollback boots out the seven new labels and bootstraps the preserved prior controller and watchdog plists. Runtime ledgers, evidence and backups are retained.

## Local source tests

```bash
python3 -m unittest -v ops/dev-os/control-plane/test_ardesia_control_plane.py
```

The test suite covers strict schemas, traversal and symlink rejection, mailbox authorization and idempotency, GitHub PR/CI monitoring and overlap blocking, local-worktree coordination, terminal-task overlap isolation, ordered append-only queue admission, controller-safe admission failure, review-bound content-addressed seeding with transactional rollback, session-bound and retry-bounded Claude overload recovery, Headroom policy/health/route attestation and direct-AI rejection, Hermes gating, stale evidence, typed optional failure, renewable lease confinement, five-file path bounds, append-only Obsidian writes, exact-SHA binding, Node 25 test-environment isolation, blocked-task liveness, two-phase live/fallback WikiLLM behavior, LaunchAgent schedules, required reports and prevention of premature activation state.
