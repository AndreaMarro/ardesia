# MEMORY-STATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — llm_wiki eval (integration roles); AgentMemory not re-probed firsthand in WF1

## Layers (integration roles per WF1 llm_wiki eval)

- **ardesia-vault + `ops/knowledge/`** = durable Source of Truth (markdown).
- **llm_wiki** = visual graph/cluster/gap layer rendered ON TOP of the vault (not a store of record).
- **AgentMemory** = operational recall. It holds a **POINTER** (llm_wiki URL `127.0.0.1:19828` + page-index/path + last-ingest SHA), it does **not duplicate** the wiki content.

## Worker recall flow
AgentMemory recall → llm_wiki (via MCP/HTTP) → GSD context-packet → files written → result packet back to AgentMemory.

## AgentMemory status
WF1 did not re-probe AgentMemory firsthand. From prior canon (NOT re-verified this pass): endpoints under `/agentmemory/*` (not `/`); recall OK; the extraction graph was reported empty / to-be-rearmed with a local key. Treat graph-populated claims as UNVERIFIED until re-probed.

## Pointer schema (to wire — safe-prep)
`{ url: "http://127.0.0.1:19828", wiki_path: "<page or path>", last_ingest_sha: "<SHA>" }`
Document this before wiring AgentMemory ↔ llm_wiki.

## Privacy bar
AgentMemory pointers and llm_wiki ingest must stay NON-sensitive until the llm_wiki egress audit passes. No corpus / student / PII data into the recall+wiki layer before that gate (see LLM-WIKI-STATE).

## Gate-Andrea
- Re-probe AgentMemory graph state firsthand and re-arm extraction with a local key if empty.
- Register llm_wiki MCP into the worker config once egress-audited.
