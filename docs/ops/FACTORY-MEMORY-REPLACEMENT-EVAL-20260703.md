# FACTORY MEMORY REPLACEMENT EVAL - 2026-07-03

Status: decision matrix, no runtime change
Verified: 2026-07-02 23:08-23:35 CEST from MacBook `/Users/andreamarro/VOLUME 3/ardesia`
Branch/worktree: `docs/factory-memory-replacement-eval-20260703` at `/tmp/ardesia-memory-eval-20260703`

## Executive Decision

Do not replace AgentMemory in-place.

Use a three-tier path:

1. **BASELINE now**: file-based Markdown + git memory packets, readable and
   versioned. This is the only source-of-truth fallback while factory scheduling
   stays stopped.
2. **SHADOW candidate**: Hindsight or TencentDB Agent Memory first; Supermemory
   is also worth a sandbox if its local binary/export story checks out. Run only
   with synthetic fixtures and a tiny adapter that writes JSON evidence.
3. **NON-CORE**: OpenHuman only as design inspiration or sidecar because GPL-3.0
   and product scope are too broad. Graphiti/Cognee only if ARDESIA actually
   needs temporal knowledge graph semantics, not just agent recall.

The replacement criterion is not "better README". It is: local backup, bounded
health checks, deterministic export, no secret capture, observable failure, and
Codex/Claude hooks that can be disabled without losing source-of-truth state.

## Current Factory State

Verified live on 2026-07-02 23:08 CEST:

| Area | Verified fact |
|---|---|
| Codex app automation | `ardesia-factory-audit-and-concrete-progress` is `status = "PAUSED"` in `/Users/andreamarro/.codex/automations/.../automation.toml`. |
| Mini launchctl filter | No `com.elab.lessonos-hourly` row in the filtered `launchctl list` sample. Active rows include `com.ardesia.api`, `com.ardesia.litellm`, `com.ardesia.tutor`, `com.ardesia.nanobot`, `com.headroom.proxy`, `com.broker`, `com.maestro.tg-bridge`, `com.elab.ardesia-ipad`, and `com.elab.agentmemory`. |
| Mini process filter | No `hourly-tick`, `driver-orch`, `eval/gate`, `uv run pytest`, or `pytest -q` rows in the filtered sample. Active rows include Headroom, LiteLLM, broker workers, AgentMemory node, and AgentMemory `iii`. |
| AgentMemory | `/agentmemory/livez` returned `{"service":"agentmemory","status":"ok","viewerPort":3113,"viewerSkipped":false}` locally and on Mini. Process still deserves caution: `com.elab.agentmemory` launchd status sampled as `-9`, node PID `7206`, RSS about 1.85 GB. |
| Headroom | Mini `127.0.0.1:8787/health` returned healthy, ready, version `0.27.0`; memory backend disabled. |

STOP remains active. No launchd job was restarted, re-enabled, killed, or edited.

## Candidate Snapshot

All counts below were verified firsthand via `gh repo view`, `gh release list`,
license files, and shallow clones under `/tmp/ardesia-memory-eval-sources`.
Counts are volatile; treat them as a 2026-07-02 snapshot.

| Candidate | Snapshot | License | Storage / DB | API / hooks / MCP | LLM and embedding cost | Factory fit |
|---|---:|---|---|---|---|---|
| [TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory) | TS, 6,395 stars, 604 forks, latest stable `v0.3.6` 2026-05-28, prerelease `v1.0.0` 2026-06-11, HEAD `4339e63` | MIT per `LICENSE` text, GitHub SPDX unresolved | Defaults to local `SQLite + sqlite-vec`; hybrid BM25 + vector + RRF; optional Tencent Cloud VectorDB backend | OpenClaw/Hermes plugin, HTTP gateway on `:8420`, capture/search/recall endpoints; no standard MCP surface verified in root docs | L1/L2/L3 extraction requires LLM endpoint unless wired to local model; embeddings configurable via OpenAI-compatible endpoint | Strong shadow candidate if sandboxed. Best match for local-first + transparent intermediates, but needs adapter work for Codex/Claude and English tokenizer/failure tests. |
| [mem0](https://github.com/mem0ai/mem0) | Python, 59,961 stars, 6,950 forks, releases active 2026-07-01, HEAD `cd79fa8` | Apache-2.0 per `LICENSE`; GitHub SPDX unresolved | Library supports vector-store extras; self-hosted server uses Postgres + pgvector; TS OSS includes better-sqlite3/Qdrant/Redis options | Python/TS SDKs, FastAPI self-hosted server, dashboard, OpenAPI; Codex/Claude plugin dirs present | Requires LLM; default documented as `gpt-5-mini`; default embedding `text-embedding-3-small`; local alternatives possible but must be configured | Mature but heavier than needed for fallback. Candidate only if Postgres/pgvector ops burden is acceptable. |
| [langmem](https://github.com/langchain-ai/langmem) | Python, 1,534 stars, 173 forks, no GitHub release, HEAD `c01e273` | MIT | Not a storage system; uses LangGraph `BaseStore`; in-memory example loses state on restart; production points to `AsyncPostgresStore` or equivalent | Tool primitives: manage/search memory, background manager, LangGraph integration | Uses LLM providers and embeddings such as OpenAI in docs | Useful extraction/optimization library, not an AgentMemory replacement. Good as a component inside another layer. |
| [Graphiti](https://github.com/getzep/graphiti) | Python, 28,291 stars, 2,832 forks, `v0.29.2` 2026-06-08, HEAD `f4330dc` | Apache-2.0 | Temporal graph over Neo4j, FalkorDB, Neptune/OpenSearch, deprecated Kuzu; Docker compose for Neo4j/FalkorDB | MCP server, FastAPI server, Python framework | Defaults to OpenAI for LLM and embeddings; supports Anthropic, Gemini, Groq, local OpenAI-compatible endpoints; rate-limit/concurrency tuning needed | Non-core unless temporal KG is a product requirement. Strong capability, high ops surface. |
| [Cognee](https://github.com/topoteretes/cognee) | Python, 26,602 stars, 2,470 forks, `v1.2.2` 2026-06-26, HEAD `f7e2267` | Apache-2.0 | Minimal path: SQLite + LanceDB + Ladybug. Production docs recommend Postgres + PgVector; optional Neo4j and Redis/UI services | Direct library mode, FastAPI server, Cognee MCP; MCP strips vectors before LLM output | Requires `LLM_API_KEY`; supports provider config, fastembed/Ollama extras | Powerful but heavy. Good if ARDESIA needs self-hosted KG engine; overkill for "keep factory memory alive". |
| [Supermemory](https://github.com/supermemoryai/supermemory) | TypeScript, 28,115 stars, 2,427 forks, `server-v0.0.3` 2026-06-13, HEAD `d4c451c` | MIT | Local README claims one binary, local embeddings, data in `./.supermemory`; monorepo package also has Cloudflare/Postgres deps | API, app, plugins for Claude Code/OpenCode/OpenClaw/Hermes, remote MCP endpoint; local API runs at `localhost:6767` | Bring OpenAI/Anthropic/Gemini/Groq/OpenAI-compatible, or fully offline with Ollama per README | Interesting shadow candidate, especially for API/context engine ergonomics. Must audit local binary, export/import, and whether self-host is source-auditable enough. |
| [Hindsight](https://github.com/vectorize-io/hindsight) | Python, 17,896 stars, 1,088 forks, `v0.8.4` 2026-07-01, HEAD `ba158c9` | MIT | Docker defaults to embedded PostgreSQL (`pg0`) volume; external Postgres supported; pgvector default, local embeddings default | REST API retain/recall/reflect, UI, Claude Code plugin hooks, MCP knowledge tools, local daemon auto-start | LLM provider required for extraction unless using Claude Code/local providers; embeddings/reranker can be local | Best shadow candidate for task-outcome learning and Codex/Claude hooks. Needs strict timeout, bank isolation, and no-secret fixture tests before any live use. |
| [Memobase](https://github.com/memodb-io/memobase) | Python/Go/TS, 2,773 stars, 220 forks, no release, HEAD `358c16b`, pushed 2026-01-11 | Apache-2.0 | Local server uses Postgres + pgvector and Redis | REST clients and MCP template; cloud/local project URL + token model | Server depends on OpenAI for memory processing | Secondary. More user-profile/chatbot oriented and less active; not first candidate for factory memory. |
| [OpenHuman](https://github.com/tinyhumansai/openhuman) | Rust, 34,090 stars, 3,314 forks, `v0.58.7` 2026-06-30, HEAD `0f6f023` | GPL-3.0 | SQLite memory-tree/chunks DB, OS keychain, hybrid OpenAI embeddings + SQLite FTS5, Neo4j graph noted in architecture docs | Desktop/orchestrator app, JSON-RPC/MCP read-only memory tools, connectors, background memory sync | Supports provider stack plus local Ollama/LM Studio paths; many post-turn hooks | Non-core for ARDESIA due GPL-3 and broad product scope. Valuable inspiration for readable memory trees, job recovery, and local-first UX. |

## Decision Matrix

Scoring is coarse: 3 = good fit, 2 = viable with work, 1 = concern, 0 = blocker
for factory core. "Core" here means a trusted memory layer for autonomous
build/review loops, not an end-user personal AI product.

| Candidate | License | Local/offline | Storage simplicity | API/hooks/MCP | Export/recovery | LLM cost control | DB ops burden | Codex/Claude fit | Failure observability | Core score |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Markdown + git baseline | 3 | 3 | 3 | 1 | 3 | 3 | 3 | 2 | 3 | 24 |
| TencentDB-Agent-Memory | 3 | 2 | 3 | 2 | 2 | 2 | 3 | 2 | 3 | 22 |
| Hindsight | 3 | 2 | 2 | 3 | 2 | 2 | 2 | 3 | 2 | 21 |
| Supermemory | 3 | 3 | 2 | 3 | 1 | 2 | 2 | 3 | 2 | 21 |
| LangMem | 3 | 2 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 16 |
| Mem0 | 3 | 2 | 1 | 2 | 2 | 1 | 1 | 2 | 2 | 16 |
| Cognee | 3 | 2 | 1 | 3 | 1 | 1 | 1 | 2 | 2 | 16 |
| Graphiti | 3 | 1 | 1 | 3 | 1 | 1 | 0 | 2 | 2 | 14 |
| Memobase | 3 | 1 | 1 | 2 | 1 | 1 | 0 | 2 | 1 | 12 |
| OpenHuman | 0 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 3 | 16, but license blocks core |

## Failure Modes To Test Before Any Shadow PR

| Failure mode | Required test |
|---|---|
| Memory endpoint hangs and blocks agent turn | Adapter must have a hard timeout and return a structured degraded-cache result. |
| Agent stores secrets or raw transcripts | Fixture must assert redaction and allowlist fields before retain. |
| Recall injects stale or wrong context | Adapter output must include source memory IDs, age, score, and candidate name; caller decides whether to use it. |
| DB/index corruption | Must have backup/export command and a cold-start restore check. |
| LLM extraction cost spikes | Shadow run must log extraction call count, provider, model, and estimated token classes without printing secrets. |
| Cross-project contamination | Memory namespace/bank/project ID must derive from repo root and branch/worktree policy. |
| AgentMemory replacement hides source of truth | Baseline Markdown packet remains authoritative until a shadow candidate passes canary and recovery gates. |
| Vendor lock or opaque binary | Candidate must produce exportable JSON/Markdown or documented DB dump before any live hook. |

## Recommended Shadow Slice

Do not replace AgentMemory. Add at most one sandbox adapter in a later PR.

Allowed shape:

```text
ops/tools/memory_shadow_adapter.(py|mjs)
ops/tools/fixtures/memory-shadow-input.json
ops/tools/fixtures/memory-shadow-expected.json
ops/tools/README-memory-shadow.md
```

Behavior:

1. Read a synthetic fixture only.
2. Redact/validate fields.
3. Run `retain` and `recall` against one configured local candidate.
4. Emit deterministic JSON evidence: candidate, endpoint, timeout, retained IDs,
   recall IDs/scores, degraded/error state.
5. Never install packages in the repo, never capture live Codex/Claude
   transcripts, and never write secrets.

Preferred order:

1. Hindsight: best hook alignment for Claude Code and task-outcome learning.
2. TencentDB-Agent-Memory: best local SQLite/sqlite-vec story and transparent
   intermediate files.
3. Supermemory: best "single API" ergonomics; requires export/local-binary audit.

## Runbook: How To Restart Work Without Restarting The Factory

STOP remains active. These are restart instructions for the next human-approved
session, not actions taken by this run.

1. Confirm Andrea explicitly approves a shadow memory experiment.
2. Verify STOP is still active:
   - local Codex automation stays `PAUSED`;
   - no `com.elab.lessonos-hourly` in filtered `launchctl list`;
   - no `hourly-tick`, `driver-orch`, `eval/gate`, or pytest factory process.
3. Keep AgentMemory as degraded/optional cache unless `/agentmemory/livez` is
   fast and RSS/CPU are bounded for the sample window.
4. Create a clean worktree from `origin/main`; do not use the dirty main
   checkout and do not stage unrelated files.
5. Implement only the shadow fixture adapter above, max 5 files.
6. Run only local fixture tests and `git diff --check`.
7. Do not route live Codex/Claude hooks to the candidate.
8. If the adapter fails, keep Markdown+git baseline and record the failed JSON.
9. If the adapter passes, open a PR as "shadow only"; do not replace
   AgentMemory or re-enable factory scheduling in the same PR.

## Lane B Queue Status

Verified via `gh pr list` and `gh pr view` on 2026-07-02:

| PR | State | Decision |
|---|---|---|
| #24 `feat(lessonos): micro-slice event-log...` | OPEN, clean, base `main` | Not merged, so do not update #30 as if #24 landed. |
| #30 `feat(lessonos): add teacher dashboard projection` | OPEN, clean, base `feat/lessonos-eventlog-microslice-20260702` | Dependent on #24; no rebase/update in this run. |
| #19 `fix(sim): topologia canonica ELAB...` | OPEN, clean, base `main` | Not merged, so do not update #31/#16 as if #19 landed. |
| #31 `test(sim): add breadboard topology validator` | OPEN, clean, base `feat/elab-v1-cap6-esp1-book-topology` | Dependent on #19; no rebase/update in this run. |
| #23 flaky hunt | OPEN | Not remeasured per Andrea instruction. |
| #27 ELABTutor plugin spec | OPEN draft | Not touched per Andrea instruction. |

Lane B product code was skipped because the requested queue predicates did not
fire and a new product slice would add a third line of work beside #19/#24 and
their dependent PRs. No product file was changed.

## Commands And Evidence

Read-only / verification:

```bash
git -C /Users/andreamarro/VOLUME\ 3/ardesia status --short --branch
sed -n '1,260p' AGENTS.md
sed -n '1,240p' docs/vault/ARDESIA-MAP.md
for f in plugins/elab-tutor/automa/ORDERS/*.md; do sed -n '1,220p' "$f"; done
gh pr list --repo AndreaMarro/ardesia --state all --limit 60 --json ...
gh pr view 24/30/19/31 --repo AndreaMarro/ardesia --json ...
ssh macmini 'date; launchctl list | grep -iE "..."; ps aux | grep -iE "..."'
curl --max-time 5 -fsS http://127.0.0.1:3111/agentmemory/livez
ssh macmini 'curl --max-time 5 -fsS http://127.0.0.1:3111/agentmemory/livez; curl --max-time 5 -fsS http://127.0.0.1:8787/health'
gh repo view <candidate> --json nameWithOwner,description,licenseInfo,stargazerCount,forkCount,primaryLanguage,pushedAt,createdAt,updatedAt,defaultBranchRef,url,latestRelease
gh release list --repo <candidate> --limit 3
curl -L --max-time 10 -fsS https://raw.githubusercontent.com/<candidate>/main/LICENSE
gh repo clone <candidate> /tmp/ardesia-memory-eval-sources/<repo> -- --depth 1 --quiet
rg -n -i "sqlite|postgres|pgvector|neo4j|mcp|export|import|offline|local|openai|embed|vector|bm25|llm" ...
git worktree add /tmp/ardesia-memory-eval-20260703 -b docs/factory-memory-replacement-eval-20260703 origin/main
```

Not executed:

- no candidate installed;
- no adapter implemented;
- no AgentMemory restart/compaction/import;
- no factory launchd change;
- no push, PR creation, merge, deploy, or service restart;
- no full product gate, because docs-only in an isolated worktree.

## Verified Vs Not Verified

Verified:

- repo metadata, release metadata, license text heads, root files, selected
  README/config/dependency lines from shallow clones;
- factory STOP signals and process samples listed above;
- #19/#24/#30/#31 queue status;
- one new docs file only in the isolated worktree.

Not verified:

- benchmark quality claims from any vendor;
- Supermemory local binary internals/export format;
- Hindsight embedded PostgreSQL backup/restore in practice;
- TencentDB import/export scripts on an ARDESIA fixture;
- exact runtime cost under ARDESIA workloads;
- production behavior under concurrent Codex/Claude hooks.

## Andrea Gates Still Open

1. Approve whether a shadow memory adapter PR is wanted now, or whether the
   factory should remain Markdown+git only until #19/#24 queues clear.
2. Choose first shadow candidate: Hindsight, TencentDB-Agent-Memory, or
   Supermemory.
3. Approve whether local LLM providers may be used for extraction, or whether
   all shadow tests must be no-LLM/dry-run fixtures.
4. Confirm whether any candidate may read real factory transcripts. Default:
   no.
5. Confirm when, if ever, to re-enable the paused Codex automation or Mini
   factory scheduler. Default: keep STOP active.

## Prompt Successivo Aggiornato

Sei Codex su `/Users/andreamarro/VOLUME 3/ardesia`. Prima leggi
`/Users/andreamarro/VOLUME 3/AGENTS.md`, `ardesia/AGENTS.md`,
`docs/vault/ARDESIA-MAP.md`, `docs/ops/FACTORY-LIVE-STATUS.md`, e questo file:
`docs/ops/FACTORY-MEMORY-REPLACEMENT-EVAL-20260703.md`.

Non riaccendere la fabbrica. Non pushare, mergiare, deployare, riavviare
AgentMemory o launchd senza OK esplicito Andrea. Verifica STOP con launchctl e
process filter. Se Andrea approva la shadow lane, crea una PR separata max 5
file con un adapter in `ops/tools/` che usa solo fixture sintetiche:
input JSON -> redact/retain/recall -> output JSON. Candidato preferito:
Hindsight se l'obiettivo e imparare da task outcomes; TencentDB se l'obiettivo
e local-first SQLite/sqlite-vec; Supermemory solo dopo audit export/local
binary. Se non c'e' OK, mantieni Markdown+git come baseline e lavora sulla
queue prodotto secondo #19/#24/#30/#31.
