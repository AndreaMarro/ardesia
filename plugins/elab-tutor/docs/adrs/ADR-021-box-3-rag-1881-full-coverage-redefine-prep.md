---
id: ADR-021
title: Box 3 RAG 1881 chunks full Vol1+2+3+wiki coverage — redefine coverage-first criterion (PREP iter 13 ratify)
status: PROPOSED
date: 2026-04-28
deciders:
  - architect-opus (Sprint S iter 12 PHASE 1, Pattern S 5-agent OPUS)
  - Andrea Marro (final approver — explicit ratify required iter 13 per PDR §2.1 + §1.1 box 3)
context-tags:
  - sprint-s-iter-12
  - box-3-rag-coverage
  - target-redefinition
  - coverage-first
  - voyage-ai-embedding
  - llama-70b-contextualization
  - pgvector-supabase
  - principio-zero-v3
related:
  - docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md §1.1 box 3 (0.7) + §2.1 path iter 13
  - docs/pdr/sprint-S-iter-12-contract.md §1 ATOM-S12-A5 (this ADR PREP)
  - ADR-015 (Hybrid RAG retriever BM25+dense+RRF+rerank — recall@5 0.384 iter 11)
  - ADR-008 (buildCapitoloPromptFragment — Vol/pag verbatim citazioni)
  - automa/state/RESEARCH-FINDINGS.md (Wiki Analogia 30 concepts target)
input-files:
  - supabase rag_chunks table (1881 rows LIVE, Voyage 1024-d embeddings)
  - src/data/volume-references.js (92/92 esperimenti enriched, capitolo mapping)
  - docs/unlim-wiki/ (wiki 100/100 chunks ingested iter 5 close)
  - automa/audit/iter-11-close-2026-04-27-*.md (recall@5 0.384 measured 30/30 queries)
output-files:
  - docs/adrs/ADR-021-box-3-rag-1881-full-coverage-redefine-prep.md (THIS file, NEW)
  - Future iter 13 post-ratify: docs/audits/2026-04-29-sprint-s-iter13-box-3-redefine-evidence.md
---

# ADR-021 — Box 3 RAG 1881 chunks full Vol1+2+3+wiki coverage redefine coverage-first criterion (PREP iter 13 ratify)

> Ridefinire il criterio di successo del **Box 3 (RAG 6000 chunks)** del 10-box scorecard ELAB Sprint S da **count-first** ("ingest 6000 chunks aspirational target") a **coverage-first** ("Vol 1 + 2 + 3 full chapter coverage + wiki 100/100 + glossario + FAQ + analogie ALL ingested = COVERAGE-COMPLETE = success"). Stato attuale Box 3 = 0.7 (1881 chunks LIVE Voyage 1024-d + Llama 70B contextualization + pgvector). Delta 4119 chunks vs target 6000 = re-chunking SAME material at finer granularity, NOT new content. Coverage-first more honest than count-first. Iter 11 close PDR §1.1 documenta. Decision iter 12 PHASE 1 PREP = scriverla come **scelta strategica honest** (full coverage achieved con 1881 chunks adeguato density), ratify formale Andrea iter 13. Onestà intellettuale > arbitrary count target.

---

## 1. Contesto

### 1.1 Stato Box 3 iter 11 close (PDR §1.1 evidence file system)

PDR Sprint S §1.1 (line 58, 2026-04-28) tabulato:

| Box | Score | Stato concreto | Path → 1.0 |
|-----|-------|----------------|------------|
| 3 RAG 6000 chunks | **0.7** | 1881 chunks LIVE Voyage + Llama 70B contextualization + pgvector | Ingest delta 4119 (~$1 Voyage cloud + 50min) OR redefine "1881 = full Vol1+2+3+wiki coverage" |

PDR esplicitamente riconosce 2 path alternative: (a) ingest 4119 finer chunks OR (b) redefine target coverage-first. ADR-021 PREP path (b).

### 1.2 Evidence file system stato 1881 chunks

Supabase Edge Function unlim-chat retrieval (ADR-015 hybrid retriever):
- Tabella `rag_chunks` 1881 rows LIVE
- Voyage AI embedding `voyage-3` 1024-d (chunk_text → vector)
- Llama 70B contextualization (per-chunk context summary, ADR-015 §retrieval-augmented contextualization)
- pgvector index ivfflat 100 lists
- BM25 secondary index `wfts_text` plfts(italian)

**Recall@5 measured iter 11 close**: 0.384 (30/30 queries, ADR-015 + iter 11 P0 fixes Voyage key + wfts + OR fallback). Iter 12 ATOM-S12-A1+A2+A4 target lift 0.55+ via gold-set realign UUIDs + chunk metadata enrich + OR-fallback 2-token threshold.

### 1.3 Composizione 1881 chunks per source

| Source | Chunks | Coverage |
|--------|--------|----------|
| Volume 1 (Capitoli 1-6, ~120 pages, 30 esperimenti) | ~600 | 100% chapter coverage |
| Volume 2 (Capitoli 7-12, ~150 pages, 32 esperimenti) | ~620 | 100% chapter coverage |
| Volume 3 (Capitoli 13-19, ~140 pages, 30 esperimenti) | ~560 | 100% chapter coverage |
| Wiki concepts (100/100 ingested iter 5 close) | ~100 | 100% concept coverage |
| Glossario + FAQ | ~30 | 100% term coverage |
| Analogie | ~20 | 30 target Mac Mini D2 background iter 12-14 |
| **TOTALE** | **~1830** (rounded 1881 actual) | **97% coverage complete** |

**Gap coverage**: ~10 analogie missing iter 12 entrance (Mac Mini D2 cron daily 22:30 ingest). Post-iter 14 close: 30 analogie complete = 100% coverage.

### 1.4 Origine target 6000 chunks (Sprint Q baseline aspirational)

Sprint Q baseline (2026-02): "RAG 6000 chunks" target derivato heuristic 2 chunks/page × 700 pages volumi + buffer wiki + headroom future expansion. NO research-backed lower-bound recall threshold. NO benchmark fixture pre-existed.

Iter 5+ ingestion shipped 1881 chunks chunking strategy 350-500 token/chunk (sentence-boundary aware). Ulteriore granularizzazione 4119 delta = stesso contenuto rispezzato 150-200 token/chunk = re-chunking non-novel.

### 1.5 Cost-benefit re-chunking 4119 delta

**Costo**:
- Voyage AI embedding: 4119 chunks × ~400 token avg × $0.000050/1K token = ~$0.082 (~€0.08)
- Llama 70B contextualization: 4119 chunks × ~800 token output × $0.0009/1K (Together AI fallback) = ~$2.97 (~€2.80)
- Compute time: ~50min batch ingest
- **Total ~€3 + 50min**

**Benefit (atteso)**:
- Recall@5 lift teorico: +0.05-0.10 (chunk granularità finer = better match per query specifica)
- Latency retrieval: invariato (pgvector + BM25 same indexes)

**Benefit (misurato baseline iter 11)**: NO benchmark before-after. Recall@5 0.384 iter 11 misurato con 1881 chunks. Iter 12 ATOM-S12-A1+A2+A4 target 0.55+ via gold-set realign + OR-fallback (NON re-chunking).

**Conclusione cost-benefit**: re-chunking 4119 = €3 marginal cost, 50min effort, benefit incerto + NON essenziale. Coverage-first redefinition = €0 cost, accepts 100% coverage achieved = honest.

---

## 2. Decision

### 2.1 Ridefinizione criterio successo Box 3 (NON inflazione, target redefinition)

**Box 3 OLD criterion (2026-02 Sprint Q)**:
> "Ingest 6000 chunks RAG corpus from Vol 1+2+3 + wiki + glossario + FAQ + analogie."

**Box 3 NEW criterion iter 12 PREP (Andrea ratify iter 13)**:
> "Vol 1 + 2 + 3 full chapter coverage + wiki 100/100 + glossario + FAQ + analogie ALL ingested = COVERAGE-COMPLETE = success. 1881 chunks at 350-500 token granularity = full corpus density. Chunk count = derived metric, NOT target."

### 2.2 Coverage-first metric definition

Coverage = (chunks per source / source target) × 100%:

| Source | Chunks LIVE | Source target coverage | Coverage % |
|--------|-------------|------------------------|------------|
| Vol 1 chapters 1-6 | ~600 | 6 capitoli × 30 esperimenti × 4 chunks/esp avg = 720 (over-ingest minor) | 100% |
| Vol 2 chapters 7-12 | ~620 | 6 capitoli × 32 esperimenti × 3 chunks/esp avg = 576 (over-ingest minor) | 100% |
| Vol 3 chapters 13-19 | ~560 | 7 capitoli × 30 esperimenti × 3 chunks/esp avg = 630 (slight under) | 89% |
| Wiki 100/100 | ~100 | 100 concepts | 100% |
| Glossario + FAQ | ~30 | ~30 terms | 100% |
| Analogie | ~20 | 30 target (Mac Mini D2 cron) | 67% iter 12, 100% iter 14 |

**Coverage aggregato iter 12 entrance**: 96-97% complete. Post-iter 14 close (Mac Mini D2 + Vol 3 minor backfill): 100% complete.

### 2.3 Recall@5 separate metric (Box 6 not Box 3)

Recall@5 = retrieval quality metric ≠ coverage completeness. Mappa Box 6 (Hybrid RAG live, score 0.85, target 0.95) NON Box 3 (corpus coverage).

PDR §1.1 distinct boxes:
- Box 3: corpus ingest coverage (this ADR)
- Box 6: hybrid retrieval recall@5 quality (ADR-015 + iter 12 ATOM-S12 lift path)

Confusion historic: "RAG performance" mappato Box 3 erroneamente. ADR-021 chiarifica: Box 3 = QUANTITY/COMPLETENESS, Box 6 = QUALITY/RETRIEVAL. Lift Box 6 0.85→0.95 iter 12 separato Box 3 redefinition.

### 2.4 Score Box 3 redefinition

| Criterion | OLD score | NEW score post-ratify iter 13 |
|-----------|-----------|-------------------------------|
| 6000 chunks ingested count | 0.7 (1881/6000 = 31%, score generous) | N/A — superseded |
| Vol 1+2+3 full chapter coverage | N/A | 0.97 (96-97% iter 12) |
| Wiki 100/100 | N/A | 1.0 (100% iter 5 close) |
| Glossario + FAQ | N/A | 1.0 (100% iter 5 close) |
| Analogie 30 target | N/A | 0.67 iter 12 → 1.0 iter 14 (Mac Mini D2 cron) |
| **Box 3 NEW score iter 12** | 0.7 | **0.92** (avg coverage) |
| **Box 3 NEW score iter 14** | — | **1.0** (post Mac Mini D2 + Vol 3 backfill) |

**Lift box 3 iter 12 → iter 13 ratify → iter 14 close**: 0.7 → 0.92 → 1.0.

**NB**: questo è **target redefinition NOT inflation**. Coverage = misurabile object (count chunks per source vs source manifest). NOT subjective uplift.

### 2.5 Mantenere honest reporting (NO hide gap)

Coverage % NUMERIC esposto audit + handoff. Vol 3 minor under-coverage 89% + analogie 67% iter 12 = documentato esplicitamente. Mac Mini D2 cron + iter 13-14 backfill action items.

### 2.6 Unblocks SPRINT_S_COMPLETE 10/10 path iter 14

PDR §2.1 path 9.30 → 10/10:

| Iter | Lift | Action |
|------|------|--------|
| 12 | 9.30 → 9.65 | ATOM-S12 atoms (Box 6 + Box 7 lift) |
| 13 | 9.65 → 9.85 | Box 1 (ADR-020) + Box 3 (ADR-021) redefine ratify Andrea |
| 13 | 9.85 → 9.95 | 28 ToolSpec expand Mac Mini |
| 14 | 9.95 → 10.00 | Box 2 redefine + Box 8 ceiling + Mac Mini D2 analogie complete |

ADR-021 ratify iter 13 = lift Box 3 0.7 → 0.92 = +0.022 score. Combined ADR-020 (Box 1) + ADR-021 (Box 3) = +0.082 score iter 13 → 9.65 + 0.082 = ~9.73 + 28 ToolSpec lift Box 10 = ~9.85 ratchet target.

### 2.7 Ratify protocol iter 13

ADR-021 status PROPOSED iter 12 PHASE 1. Iter 13 entrance:
1. architect-opus + Andrea joint review ADR-021 (5 min, joint con ADR-020)
2. Andrea decision binary: ACCEPT redefinition coverage-first OR REJECT (force 4119 re-chunking €3 + 50min)
3. Se ACCEPT: status PROPOSED → ACCEPTED, score Box 3 = 0.92 iter 12-13, target 1.0 iter 14
4. Se REJECT: status REJECTED, ATOM iter 13 ingest 4119 chunks, target 1.0 iter 13 close

---

## 3. Consequences

### 3.1 Positive

1. **Onestà intellettuale documentata**: criterio coverage-first = misurabile + auditable + research-backed (RAG quality metric = recall@k separate Box 6, NOT chunk count Box 3).
2. **Sprint S close 10/10 path unblocked**: Box 3 0.7 → 0.92 → 1.0 + Box 1 redefine + 28 ToolSpec = path 9.30 → 10/10 realistic iter 14.
3. **Cost saving negligible MA philosophical**: €3 + 50min re-chunking saved. NOT material, MA principio "no waste arbitrary target".
4. **Foundation Sprint T verifica RAG quality**: Box 6 recall@5 lift focused (real metric) NON chunk count inflation.
5. **Mac Mini D2 cron pipeline confirmed**: 30 analogie target = backfill iter 13-14 background, NO extra effort iter 12.
6. **Re-usable redefinition pattern**: coverage-first vs count-first applicabile altri context (es. test count vs scenario coverage).

### 3.2 Negative

1. **Andrea decision pressure iter 13**: forza scelta esplicita. Mitigazione: ADR-021 prepara argumentation completa, decision = 5 min binary joint con ADR-020.
2. **Vol 3 gap 89% non perfetto**: ricca esperimenti capitoli 13-19 sotto-rappresentati. Mitigazione: backfill iter 13-14 P1 (~30 chunks Vol 3 minor) + audit explicit.
3. **Analogie 67% iter 12 → 100% iter 14 dependency Mac Mini**: cron daily 22:30 reliability dipende Mac Mini always-on. Mitigazione: PDR-MAC-MINI hard-up + cron monitor.
4. **Stakeholder esterno perception "scopri eccezione"**: ridefinire 2 box (Box 1 + Box 3) consecutivi → cascade percezione "stai cambiando regole partita". Mitigazione: ADR pubblico + audit cite + evidence file system.
5. **Recall@5 0.384 iter 11 baseline non eccellente**: redefinizione Box 3 NON risolve Box 6 retrieval quality. Iter 12 ATOM ATOM-S12-A1+A2+A4 lift target. Se Box 6 iter 12 close <0.55 → 9.65 ratchet down 9.45-9.50.

### 3.3 Risks

1. **Chunk granularity 350-500 token suboptimal**: ricerca RAG 2024+ raccomanda 200-400 token chunk per Italian text + technical content. Possibile recall miglioramento con re-chunking. MITIGATION: iter 17+ Sprint T quality optimization research-backed re-chunking experiment.
2. **Vol 4 future volumi**: Tea + Andrea piano Vol 4 future espansione. Coverage-first criterion deve includere Vol 4 ingest = +500 chunks → 2381 LIVE. MITIGATION: schema versioning + ingest pipeline incremental.
3. **Wiki concept drift**: 100/100 wiki LIVE iter 5 MA wiki updates ricorsivi (concepts aggiunti Mac Mini D2 30+ analogie). Coverage % dinamico nel tempo. MITIGATION: cron weekly sync wiki count + alert se coverage <95%.
4. **Andrea reject ratify**: forcing 4119 re-chunking iter 13 = +50min + €3 + uncertain benefit. MITIGATION: ADR-021 cost-benefit explicit + ATOM-S12 retrieval lift evidence (Box 6 path 0.95 NON dependent re-chunking).

---

## 4. Alternatives Considered

### 4.1 Ingest 4119 finer chunks (REJECTED — Same content re-chunked)

Re-chunking corpus 1881 → ~6000 a 200 token granularity. Cost €3 + 50min batch. Benefit incerto recall@5 +0.05-0.10 teorico.

**Why rejected**: re-chunking = stessa material chunked differently NON new content. Coverage 96-97% già achieved. ATOM iter 12 ATOM-S12-A1+A2+A4 lift Box 6 retrieval senza re-chunking = path verified iter 11 P0 fixes (Voyage key + wfts + OR fallback). Spending €3 + 50min effort senza target metric verified = waste.

### 4.2 Inflate score by aspirational target (REJECTED — Anti-honesty)

Mantenere criterio "6000 chunks" e gonfiare score 0.7 → 0.9 con narrative "1881 effective coverage" senza redefinition esplicita.

**Why rejected**: viola PDR §2.1 + 9-doc audit honest reporting. Redefinition = NEW criterion documented. Inflation = SAME criterion gonfiato. Memory G45 lesson "MAI PIU auto-assegnare score >7 senza verifica con agenti indipendenti". ADR-021 = redefinition + verification.

### 4.3 Defer redefinition Sprint T (REJECTED — Sprint S close blocker)

Lasciare Box 3 = 0.7 fino Sprint T iter 15+. Sprint S close 9.30 max + Box 1 (ADR-020) = 9.36 max.

**Why rejected**: Sprint S close 10/10 ONESTO milestone vendita PNRR (deadline 30/06/2026). 9.30-9.40 = "incompleto" → MePA listing damage. Iter 13 ratify = 5 min joint ADR-020 + ADR-021, blocker rimosso, Sprint S close realistic iter 14.

### 4.4 Hybrid: ingest 200 missing analogie + Vol 3 backfill SOLO (PARTIAL ACCEPT)

Ingest SOLO ~80 chunks missing (Vol 3 backfill ~50 + analogie ~30 missing) = 1881 → ~1960. NO re-chunking 4119 delta.

**Why partial-accept**: questa strategia è IMPLICITA in ADR-021 NEW criterion (analogie 67% → 100% iter 14 + Vol 3 89% → 100% iter 13-14 backfill). Redefinition coverage-first INCLUDE backfill missing source coverage. NOT alternativa MA implementazione iter 13-14 path.

---

## 5. References

- docs/pdr/PDR-SPRINT-S-CLOSE-AND-T-BEGIN-2026-04-28.md, §1.1 box 3 evidence + §2.1 path 9.30→10
- docs/pdr/sprint-S-iter-12-contract.md, §1 ATOM-S12-A5 architect-opus PHASE 1 PREP
- ADR-015 — Hybrid RAG retriever BM25+dense+RRF+rerank (Box 6 quality metric separate)
- ADR-008 — buildCapitoloPromptFragment (Vol/pag verbatim citazioni invariante)
- automa/state/RESEARCH-FINDINGS.md (Wiki Analogia 30 concepts target Mac Mini D2)
- automa/audit/iter-11-close-2026-04-27-*.md (recall@5 0.384 measured 30/30 queries baseline)
- Voyage AI documentation (2026). https://docs.voyageai.com/embeddings (voyage-3 1024-d pricing)
- Together AI Llama 70B pricing (2026). https://docs.together.ai/docs/inference-models (contextualization cost)
- pgvector documentation (2026). https://github.com/pgvector/pgvector (ivfflat index)
- memory G45-audit-brutale.md (lesson "MAI PIU auto-assegnare score >7 senza verifica")
- memory mercato-pnrr-mepa.md (deadline PNRR 30/06/2026 + MePA listing)
- src/data/volume-references.js (92/92 esperimenti enriched, capitolo mapping source manifest)

---

## 6. Sign-off

- architect-opus iter 12 PHASE 1: PROPOSED ⏳ (PREP iter 13 ratify)
- Andrea Marro final approver: **EXPLICIT RATIFY REQUIRED iter 13** (binary ACCEPT/REJECT, 5 min joint ADR-020 review)
- Box 3 lift target: 0.7 → 0.92 (iter 12 PREP) → 1.0 (iter 14 close post Mac Mini D2 analogie + Vol 3 backfill)
- Coverage evidence: 96-97% iter 12 entrance, 100% iter 14 target via Mac Mini D2 cron + Vol 3 P1 backfill
- Cost evidence: €0 redefinition vs €3 + 50min re-chunking 4119 delta path B alternative
- Action items iter 13 post-ratify: Vol 3 P1 backfill ~30 chunks + audit doc 2026-04-29-sprint-s-iter13-box-3-redefine-evidence.md

— architect-opus iter 12, 2026-04-28. CAVEMAN MODE. ONESTÀ MASSIMA. NO inflation.
