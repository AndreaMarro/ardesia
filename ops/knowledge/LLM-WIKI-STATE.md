# LLM-WIKI-STATE

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — Knowledge-Fabric / llm_wiki evaluation (WebFetch 25/06 + machine audit)

## What it is (live-verified)
nashsu/llm_wiki — Tauri v2 (Rust) + React + Sigma.js desktop app. **GPLv3 · 12.8k stars · v0.5.1 (24-Jun-2026).** Incrementally builds and maintains a **persistent interlinked wiki** from sources (not blind RAG).

| Field | Value |
|---|---|
| Storage | local `my-wiki/`: `raw/sources/`, `wiki/`, `.llm-wiki/`, `.obsidian/` |
| LLM | configurable: OpenAI/Anthropic/Google/**Ollama**/Custom (OpenAI-compat) |
| Local LLM | yes — Ollama or custom endpoint → 100% local, €0 |
| Local API | `127.0.0.1:19828`, token-protected, loopback-only |
| MCP | bundled server: hybrid search, file read, graph traversal, source rescan |
| Graph | 4-signal graph + Louvain clustering + Graph-Insights (gap detection) + Sigma.js viz |
| Install | prebuilt `.dmg`/`.msi`/`.deb`/`.AppImage`; or source (Node 20+ AND Rust 1.70+) |

## Egress / privacy verdict
Local-first but **NOT zero-egress by default.** Vectors to disable:
1. Cloud LLM provider (sends raw sources at generation) → force **provider=Ollama**.
2. **MinerU cloud PDF parsing** (optional) → disable, use local parser.
3. Web-search (Tavily/SerpApi/SearXNG) → off by default, keep off.
4. Vector-search (LanceDB) is local; off by default.
With Ollama + MinerU-off + websearch-off it should not phone home — **must confirm in sandbox with a network sniffer during a real ingest. Do not assume.**

## Install feasibility on this machine
macOS 26.0.1, GUI Aqua session present (so a .dmg is launchable). Node v22.14.0 OK; **Rust absent** (cargo/rustc not found) → build-from-source not feasible; use prebuilt .dmg (ARM). Ollama already has qwen2.5:7b, qwen3:4b, llava:7b, qwen2.5:1.5b → enough for bulk generation + image parsing at €0. Docker absent; 41Gi free.

## ardesia-wiki relationship
`AndreaMarro/ardesia-wiki` is a **manual Obsidian vault**, NOT an llm_wiki install (INDEX.md: "Solo materiale NON sensibile"). → it is the **ideal NON-sensitive ingest source** for llm_wiki to render the navigable graph layer. Complementary, not competing.

## DECISION: SANDBOX-ADOPT (P1)
Adopt in sandbox, not production. Gates before any real data:
1. firsthand egress audit (sniffer) during ingest,
2. provider=Ollama verified,
3. MinerU-off verified.
Reject only if Ollama-mode still phones home (unlikely; must be tested).
Filled eval: `/Users/andreamarro/ardesia-vault/LLM-WIKI-EVAL-2026-06-25.md`.

## Ingest set (NON-sensitive only)
From `~/ardesia-vault/`: PROJECT-RECON, SYSTEM-DIAGNOSTIC, ARDESIA-MAP, PROMPT-NEXT-*, {GITHUB,VERCEL,BROWSER}-DEEP-AUDIT, HANDOFF, META-PROMPT, NEW-SYSTEMS-RESEARCH, KARPATHY-ACTIONS, MARKETPLACE-PLUGIN-ARCH, RESEARCH-SYNTHESIS.
**FORBIDDEN until egress audit passes:** storia-corpus, student DB, any PII, secrets/.env, tokens.

## Gate-Andrea
- Download + install the .dmg (new GPLv3 desktop app).
- Run the egress audit (Little Snitch/sniffer) during ingest.
- Register llm_wiki MCP into Claude Code / Hermes worker config.
- Ingest any real corpus/PII — BLOCKED until egress audit passes.
