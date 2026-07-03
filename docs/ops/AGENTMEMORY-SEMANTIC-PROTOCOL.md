# AGENTMEMORY-SEMANTIC-PROTOCOL

Version: 2026-07-01 04:45 CEST  
Status: operational protocol for meaningful ARDESIA memory.

## Role

AgentMemory is the factory memory fabric, not the source of truth.

It should help agents recall verified decisions, failures, context packets, and next actions. It must not replace filesystem, GitHub, Vercel, tests, logs, or official docs.

## What "True Sense" Means

Useful memory has four parts:

1. a verified outcome or decision;
2. evidence source or file path;
3. concepts that future agents will actually search;
4. the next implication or guardrail.

Bad memory is:

- raw long logs;
- generic "worked on ARDESIA";
- broad project summaries without evidence;
- unverified claims copied from chat;
- secrets, env values, PII, or real student corpus content.

## Recall Before Work

Before diagnosis or planning, do a narrow recall.

Use 2-4 precise concepts from the current task, for example:

- `ardesia-factory-routing`;
- `headroom-context-packet`;
- `agentmemory-degraded`;
- `chatgpt-apps-fastapi-mcp`;
- `demo-vertical-slice`;
- `monorepo-cutover`.

Preferred REST call on the Mini:

```bash
curl -fsS -X POST http://127.0.0.1:3111/agentmemory/smart-search \
  -H "content-type: application/json" \
  --data '{"query":"ardesia factory routing headroom","limit":5}'
```

If recall is low-signal, say so and continue from primary sources.

If AgentMemory is degraded, keep queries small and avoid exploratory broad searches.

## Remember After Work

After a material outcome, save exactly one short memory unless multiple independent decisions were verified.

Required fields:

- project: `ardesia`;
- content: 1-4 sentences, verified only;
- concepts: 3-7 concrete terms;
- files: real paths touched or used as evidence when available;
- status words such as `verified`, `not_proven`, `target`, or `blocked`.

Preferred REST call on the Mini:

```bash
curl -fsS -X POST http://127.0.0.1:3111/agentmemory/remember \
  -H "content-type: application/json" \
  --data '{"project":"ardesia","content":"Verified outcome here.","concepts":["ardesia","headroom"],"files":["docs/ops/NEXT-AUTOMATION-PACKET.md"]}'
```

If save fails, append the memory payload to `docs/ops/SCHEDULED-ACTIVITY-LOG.md` under a `Memory fallback` note.

## Memory Taxonomy

Use concepts from this controlled set when possible:

- `ardesia-product-truth`
- `ardesia-monorepo-cutover`
- `ardesia-demo-vertical-slice`
- `ardesia-factory-routing`
- `headroom-context-packet`
- `opus-quota`
- `hermes-minimax-m3`
- `gpt-55-hermes-target`
- `agentmemory-semantic-protocol`
- `agentmemory-degraded`
- `fastapi-chatgpt-mcp-gateway`
- `vercel-preview`
- `github-repo-map`
- `lesson-os-graph`
- `simulation-plugin`
- `elab-pack`

New concepts are allowed when they are specific and likely to be reused.

## Scheduled Automation Requirements

Every scheduled ARDESIA run must:

1. read `docs/ops/ARDESIA-KNOWLEDGE-PACKET-FOR-AGENTS.md`;
2. recall AgentMemory with 2-4 precise concepts;
3. state whether recall was useful;
4. do one verified micro-task;
5. remember one verified result;
6. update `NEXT-AUTOMATION-PACKET.md` and `SCHEDULED-ACTIVITY-LOG.md`.

## Health Protocol

If AgentMemory is degraded/critical:

- no bulk import;
- no full export reads;
- no restart or compaction without explicit maintenance decision;
- keep recall/remember payloads short;
- document heap/status and continue with filesystem evidence.

## COV

- Based on the installed AgentMemory skills and live REST endpoints used in prior ARDESIA checks.
- Treat this as protocol. Actual memories still require live save verification.
