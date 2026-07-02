# FASTAPI-CHATGPT-MCP-GATEWAY

> **Nota import e riconciliazione (2026-07-02, sessione Claude).** Importato verbatim da Volume 3 locale
> (riga TSV `VOLUME3-GITHUB-CANDIDATES.tsv`: `DOCS-CANDIDATE P1`, `requires_sanitization=yes`, `requires_human_ok=no`,
> next_action «Reconcile with product docs»). Sanitize: zero segreti/endpoint vivi/PII; le uniche URL sono docs OpenAI ufficiali.
> Riconciliazione con le spec prodotto di PR #20 — `docs/product/FASTAPI-INTEGRATION-GATEWAY.md` e
> `docs/product/CHATGPT-APPS-MCP-INTEGRATION.md` — che citano questo doc come «complementare (ops, 193 righe)»:
>
> 1. **I contratti di confine li fissano le spec prodotto** (MVP = `graph_search` + `get_student_pack`, read-only;
>    `mount_plugin` solo dietro verifica firma ed25519, mai bypass). Lo sketch endpoint `/v1/*` qui sotto è un
>    superset di design con nomi NON allineati (es. `POST /v1/search` vs `POST /graph/search`): all'implementazione
>    prevale il product doc; questo doc resta la mappa operativa estesa (archetipo Apps SDK, annotazioni tool, CSP).
> 2. **Input datati (scritti 01jul)**: «ToolHost exists but is unmounted» (§Verified Inputs) è superato — su `main`
>    esistono `apps/studio/src/toolhost/ToolFrame.tsx` e i test `ToolHostMountGate`/`ToolHostE2E`; inoltre il layout
>    reale del monorepo è `apps/studio` (non `packages/studio` come nel §Placement) — la scelta `packages/api`
>    vs `apps/api` resta aperta e va decisa alla prima implementazione.
> 3. **Vincoli condivisi confermati** (nessun conflitto): gateway = boundary layer e NON fonte di verità; no segreti
>    client-side; niente PII studenti in GitHub/Vercel; prima fase read-only; niente mutazioni grafo via MCP.

Date: 2026-07-01  
Status: design proposal, not implemented  
Scope: FastAPI integration gateway for ARDESIA, ChatGPT Apps/MCP, Claude/Codex/Hermes tooling, LMS integrations.

## Verified Inputs

- ARDESIA canon says the current product is split across live repos: `lessonos` engine, `ardesia-studio`/`maestro-studio` board and host, `ardesia-tools`, `ardesia-vault`, `ardesia-wiki`.
- `PRODUCT-CANON.md` says ARDESIA is the local-first plugin-native didactic platform; ELAB is a Pack above a Simulation Plugin.
- `PLUGIN-MARKETPLACE-CANON.md` says ToolHost exists but is unmounted, and plugin taxonomy lacks `kind`.
- OpenAI Apps SDK docs say a ChatGPT App is an MCP server + widget/UI bundle + model, with tools, `structuredContent`, `_meta`, UI resource templates, and MCP Apps bridge.
- OpenAI Apps SDK docs explicitly allow Python/FastAPI as a backend route through MCP/Python SDK.

Official OpenAI docs used:

- `https://developers.openai.com/apps-sdk/build/mcp-server`
- `https://developers.openai.com/apps-sdk/build/chatgpt-ui`
- `https://developers.openai.com/apps-sdk/plan/tools`
- `https://developers.openai.com/apps-sdk/reference`
- `https://developers.openai.com/apps-sdk/build/examples`
- `https://developers.openai.com/apps-sdk/deploy`

## Placement Decision

Target monorepo path:

```text
packages/api/
```

Rationale:

- `packages/engine` is the LessonOS core.
- `packages/studio` is the board and ToolHost.
- `packages/tools` is factory tooling.
- The integration gateway is cross-cutting and should not live inside Studio or Engine.

Alternative `apps/api/` remains valid if the monorepo chooses an app/package split later. For now, use `packages/api` in docs because ARDESIA already uses package language.

## Role

The FastAPI Integration Gateway is not the product core. It is the boundary layer that exposes stable, auditable APIs to hosts:

- ChatGPT Apps / MCP.
- Claude/Codex/Hermes tooling.
- Vercel demo frontend.
- Teams/Moodle/LMS future connectors.
- Plugin registry and local marketplace.
- Student-pack/export flows.
- Electrotechnics Solver Pack.
- ExamForge Pack.

It must not contain secrets in frontend bundles and must not store real student PII in GitHub/Vercel.

## Minimal Architecture

```text
ChatGPT Apps / MCP / Claude / Codex / Teams / Moodle
        |
packages/api  FastAPI Integration Gateway
        |
contracts: LessonOS Graph | Plugin Registry | Student Pack | Solver | ExamForge
        |
packages/engine + packages/studio + plugin/pack data
```

## ChatGPT Apps Archetype

Primary archetype: `interactive-decoupled`.

Reason:

- ARDESIA has a long-lived visual surface: board/lavagna, plugin objects, solver steps, student-pack previews.
- OpenAI docs recommend separating data-processing tools from render tools so widgets do not remount unnecessarily.
- ARDESIA also needs read-only knowledge access, so it should additionally implement standard `search` and `fetch` tools for graph/manual/company-knowledge style access.

## Tool Surface v0

### Read-only knowledge tools

These follow OpenAI/MCP search/fetch guidance.

| Tool | Purpose | Mutates? | Notes |
|---|---|---:|---|
| `search` | Search LessonOS graph, lessons, manuals, plugin catalog, student-pack metadata | no | Must return ids, titles, user-openable URLs when possible |
| `fetch` | Fetch one document/node/lesson/plugin descriptor by id | no | Must return full text/metadata for citations |

### ARDESIA data tools

| Tool | Purpose | Mutates? | MVP status |
|---|---|---:|---|
| `lesson.open` | Return lesson metadata, board snapshot reference, plugin state refs | no | desired |
| `graph.query` | Query concepts, prerequisites, errors, citations | no | engine exists partially; gateway missing |
| `plugin.registry.list` | List installed/local first-party plugins and packs | no | desired |
| `student_pack.preview` | Create preview data for student-pack export | no | engine partial |
| `simulation.scene.validate` | Validate a CircuitScene/netlist against solver/validators | no | solver exists in ELAB lineage; gateway missing |
| `electrotechnics.solve_preview` | Solve a confirmed structured circuit/netlist step-by-step | no | future pack |
| `examforge.generate_preview` | Generate new exam-like exercise draft from verified inputs | no | future pack |

### Render tools

Render tools attach UI resources and should depend on data tools.

| Tool | Purpose | UI |
|---|---|---|
| `render.board_slice` | Show selected board/lesson/plugin snapshot | widget |
| `render.simulation_scene` | Show circuit scene and validator result | widget |
| `render.student_pack` | Show student-pack preview | widget |
| `render.solver_steps` | Show Electrotechnics Solver steps | widget |
| `render.examforge_pack` | Show generated exam/solutions preview | widget |

### Mutating tools

These are not P0. They require auth, explicit confirmation, idempotency, audit log, and rollback.

| Tool | Purpose | Required guard |
|---|---|---|
| `lesson.save_snapshot` | Save board/plugin state | confirm + idempotent version id |
| `plugin.install_local` | Install local/private plugin | signature/hash/kill-list |
| `student_pack.export` | Produce downloadable pack/PDF/zip | file output, no inline binary |
| `moodle.export_qti` | Export QTI/GIFT | explicit target + no official-school impersonation |

## FastAPI Endpoint Sketch

```text
GET  /health
GET  /version
POST /mcp
GET  /openapi.json

POST /v1/search
GET  /v1/fetch/{id}

GET  /v1/lessons/{lesson_id}
GET  /v1/lessons/{lesson_id}/board-snapshot
GET  /v1/lessons/{lesson_id}/student-pack/preview
POST /v1/lessons/{lesson_id}/student-pack/export

GET  /v1/graph/query
GET  /v1/plugins
GET  /v1/plugins/{plugin_id}/manifest

POST /v1/simulation/scene/validate
POST /v1/electrotechnics/solve/preview
POST /v1/examforge/preview
```

## Apps SDK Requirements To Preserve

- Tool descriptions: one job per tool.
- Tool annotations: `readOnlyHint`, `destructiveHint`, `openWorldHint`, and `idempotentHint` where relevant.
- Data/render split: data tools first, render tools second.
- `structuredContent`: concise, model-visible.
- `_meta`: widget-only details; never secrets.
- Resource templates: `text/html;profile=mcp-app`.
- UI bridge: MCP Apps bridge first; `window.openai` only optional/additive.
- CSP: exact `connectDomains` and `resourceDomains`.
- File handling: use file references, not inline binary/base64.
- Published apps: treat tool metadata as versioned API contract; no breaking changes without new version/review.

## Integration Status Map

| Integration | Status | Current evidence | Next step |
|---|---|---|---|
| ChatGPT Apps | desired | official docs read; no ARDESIA MCP app implemented | design v0 tools, then scaffold behind `/mcp` |
| MCP | desired/partial | Codex/Mini uses MCP servers; ARDESIA product MCP missing | FastAPI `/mcp` bridge |
| Claude | desired tooling | factory uses Claude/Opus; product integration absent | map tooling only, no product claim |
| Codex | partial tooling | Mini Codex config uses Headroom | use for factory/docs, not product claim |
| Teams | future | no verified implementation | export/webhook research later |
| Moodle/LMS | future | no verified implementation | QTI/GIFT export design later |
| GitHub | exists ops | `gh` verified canonical repo | keep repo/PR maps |
| Vercel | exists deploy surface | CLI auth verified; Vercel map exists | preview only after vertical slice |
| AgentMemory | exists ops | REST live; status fluctuates healthy/degraded | memory cache, not product SoT |
| Headroom | exists ops | health OK, version `0.27.0` | enforce packets for Opus/Codex/Hermes |

## P0 Vertical Slice

Do not build the whole gateway. Build only:

1. `/health`.
2. `/mcp` with `search` and `fetch` over a small verified corpus.
3. `student_pack.preview` if the engine route is stable.
4. `simulation.scene.validate` only for confirmed structured `CircuitScene`, not image-to-netlist.
5. one render widget after data tools work.

## COV

- Read: ARDESIA `AGENTS.md`, `ARDESIA-MAP.md`, `CANON-INDEX.md`, `PRODUCT-CANON.md`, `PLUGIN-MARKETPLACE-CANON.md`, `ELAB-AS-PLUGIN-CANON.md`, `ARCHITECTURE-CANON.md`.
- Read official OpenAI docs listed above through OpenAI Developer Docs MCP.
- Verified GitHub canonical repo: `AndreaMarro/ardesia`, private, default `main`.
- Not implemented: FastAPI package, `/mcp`, widgets, auth, deploy.
- Risk: direct product claims about ChatGPT/Teams/Moodle would be false today.
