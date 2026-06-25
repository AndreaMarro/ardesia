# KNOWLEDGE-FABRIC — how the fabric works

last-verified 2026-06-25 · served-SHA 20560ec
source: WF1 audit (w2xk3ra9f.output) — integration roles (llm_wiki eval) + GitHub/Vercel/ELAB evidence

The Knowledge-Fabric is the layered memory ARDESIA uses to stay grounded across ticks, sessions, and agents. It exists so no worker starts cold and no claim is made from memory instead of evidence.

## The five layers

1. **Vault = Source of Truth (SoT).**
   `~/ardesia-vault` (Obsidian markdown, GitHub repo `ardesia-vault`). Directives, handoffs, prompts, audits. Durable, human-authored, NON-sensitive by policy ("niente corpus/studenti"). Everything else points back here. (Also surfaced as `AndreaMarro/ardesia-wiki`, a manual Obsidian vault — NOT an llm_wiki install.)

2. **`ops/knowledge/` STATE files = distilled, evidence-keyed snapshots.**
   Concise per-domain state (PRODUCT, FACTORY, PLUGIN, MARKETPLACE, GITHUB-VERCEL, TESTING, MEMORY, LLM-WIKI) + an append-only DECISIONS log + a REGRESSIONS log + GSD context/result packet templates. Each file is stamped `last-verified <date> + served-SHA <sha>` and cites its source. This is what a worker reads FIRST. (Overlaps ardesia PR #1 Knowledge-Fabric draft — reconciliation at merge = gate-Andrea.)

3. **AgentMemory = operational recall + pointer.**
   Holds working recall and a POINTER to the visual layer (llm_wiki URL `127.0.0.1:19828` + page/path + last-ingest SHA). It does **not duplicate** wiki content — it tells a worker where to look and what SHA it was last grounded at.

4. **llm_wiki = visual layer.**
   nashsu/llm_wiki (GPLv3, Tauri+React+Sigma.js) renders the vault as a navigable 4-signal graph with Louvain clusters and gap-detection, served over a loopback `127.0.0.1:19828` API + a bundled MCP server. **SANDBOX-ADOPT (P1)**, Ollama-only, MinerU-off, web-search-off, gated on a firsthand egress audit before any real/PII data. It is a *lens over the SoT*, never the store of record.

5. **GSD context-packets = cross-tick carrier.**
   A context-packet (see CONTEXT-PACKET-TEMPLATE) bundles goal + success-criteria + grounding (STATE files, recall pointer, relevant DECISIONS/REGRESSIONS) and is keyed to the served-SHA. It carries state across ticks so the next worker starts grounded. The worker returns a WORKER-RESULT-PACKET that updates STATE and writes a pointer back to AgentMemory.

### factory-wiki anti-bloat
The factory (lessonos auto/main) can churn satellite artifacts. The fabric counters bloat by making the SoT + STATE files the only durable, evidence-keyed record: anything not distilled into `ops/knowledge` (with a source citation + served-SHA) is treated as transient. STATE files + DECISIONS (append-only) + REGRESSIONS give done-detection on *content*, not on gate-count or branch churn — which is the documented failure mode of FIFO factory loops.

## Worker read-before / write-after protocol

**Before doing any work (read-before):**
1. Read the relevant `ops/knowledge/*-STATE.md` for the domain.
2. Read DECISIONS.md (binding decisions) and REGRESSIONS.md (known traps).
3. Pull the AgentMemory recall pointer; if useful, open the llm_wiki page it points to.
4. Confirm the served-SHA you are keyed to; if your HEAD differs, reconcile against the **local bare HEAD** (lineage trap — GitHub lags by design for lessonos/studio).

**After doing the work (write-after):**
1. Verify FIRSTHAND — every "done" needs an observed command/output. No assertion without evidence.
2. Write outputs to their target paths (absolute).
3. Append to DECISIONS.md (never edit prior entries); add any new REGRESSIONS.
4. Bump the affected STATE file(s) with a fresh `last-verified + served-SHA` stamp.
5. Write a POINTER back to AgentMemory (URL + path + last-ingest SHA) — not duplicated content.
6. List anything that requires Andrea under gate-Andrea; never mark a gated deploy/merge as done.

## Privacy bar (non-negotiable)
NON-sensitive material only flows into the wiki/recall layer until the llm_wiki egress audit passes (sniffer during ingest, provider=Ollama, MinerU-off). No corpus / student / PII / secrets / tokens before that gate.
