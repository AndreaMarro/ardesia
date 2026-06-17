# ClawBot L2 Gold Set v4 — 30 queries Italian K-12

**Sprint T iter 19** — gen-test-opus 2026-04-28

## Scope

Gold-set v4 per **BGE-M3 multilingual 1024-dim** (target Scaleway H100 prod) + **Voyage 1024-dim transitional** (Sprint S iter 7-12).

30 query educational K-12 italiane, distribuite uniformemente sulle **10 intent classes ADR-023 §6.1** (3 query per classe).

## Schema query

```json
{
  "id": "Q01..Q30",
  "query": "string IT",
  "intent_class": "concept_explain | diagnose_visual | state_current | code_help | kit_question | lesson_navigation | glossary_term | analogy_request | error_recovery | meta_question",
  "expected_chunks": [
    { "vol_pag": "Vol.X|pag.Y", "source_type": "rag-volume" },
    { "concept": "kebab-case", "source_type": "wiki-llm" },
    { "termine": "kebab-case", "source_type": "glossario" }
  ],
  "expected_response_pattern": "regex hint",
  "language": "it",
  "expected_layers_active": ["L1", "L2", ...]
}
```

## Distribuzione (3 queries per intent class)

| Intent class | Q ids | Layers attivi (ADR-023 §6.1) |
|---|---|---|
| concept_explain | Q01, Q02, Q03 | L1+L2+L3+L6+L7 |
| diagnose_visual | Q04, Q05, Q06 | L4+L5+L6+L7 |
| state_current | Q07, Q08, Q09 | L4+L7 |
| code_help | Q10, Q11, Q12 | L1+L2+L4+L6+L7 |
| kit_question | Q13, Q14, Q15 | L3+L4+L7 |
| lesson_navigation | Q16, Q17, Q18 | L4+L7 |
| glossary_term | Q19, Q20, Q21 | L3+L7 |
| analogy_request | Q22, Q23, Q24 | L2+L3+L6+L7 |
| error_recovery | Q25, Q26, Q27 | L1+L4+L5+L6+L7 |
| meta_question | Q28, Q29, Q30 | L7 |

## Linguaggio (Principio Zero V3)

- **Plurale obbligatorio** "Ragazzi," in ogni query (modello docente parlante)
- **Vol/pag VERBATIM** dove possibile (es. Q01 cita Vol.1 pag.34)
- **≤60 parole** target risposta UNLIM (NON applicabile alla query stessa)
- Riferimenti cartacei Davide (Vol.1+2+3 ELAB)

## Come eseguire

### 1. Bench retrieval (ADR-015 §3.5 hybrid retriever)

```bash
# RAG hybrid retriever BM25+dense+RRF k=60+rerank top-5
node scripts/bench/run-hybrid-rag-bench.mjs \
  --fixture tests/fixtures/clawbot-l2-gold-set-v4/30-queries-italian.json \
  --output scripts/bench/output/iter-19-gold-v4-results.json
```

### 2. Recall@5 metric

Per ogni query: `recall@5 = |expected_chunks ∩ retrieved_top_5| / |expected_chunks|`

Target gate iter 19 close: **recall@5 ≥ 0.55** (vs gold v3 0.45 baseline).

### 3. Latency p50/p95

Target ADR-023 §4.1: p50 <800ms p95 <1500ms per Layer 1 RAG.

## Golden update protocol

**Quando aggiornare**:
- Volumi cartacei v2 (Davide refactor narrative continuum) → re-aggancio Vol/pag canonical
- Glossario Tea ingest (180 termini Vol1+2+3) → estensione expected_chunks source_type='glossario'
- Wiki LLM 100 → 200+ concepts → estensione expected_chunks source_type='wiki-llm'
- Embedding model swap (Voyage → BGE-M3 production) → re-bench full + delta report

**Procedura**:
1. Branch `chore/gold-set-v5-<motivo>` da main
2. Modify `30-queries-italian.json` solo expected_chunks (NO query change senza Andrea ratify)
3. Re-run bench retrieval + verifica recall@5 NON regredisce
4. PR review da Tea (review pedagogica) + Andrea (architecturale)
5. Merge + bump version `_meta.version` to v5

## Compatibilita' con embedding model

| Embedding model | dim | gold-set v4 compat |
|---|---|---|
| Voyage voyage-3 | 1024 | YES (ingest iter 7 baseline 1881 chunks) |
| BGE-M3 multilingual | 1024 | YES (target Scaleway H100 prod) |
| OpenAI text-embedding-3-small | 1536 | partial (re-embed required) |
| Mistral mistral-embed | 1024 | YES (alternative provider) |

## Cross-reference

- ADR-023 Onniscenza 7-layer (intent classes §6.1)
- ADR-015 Hybrid RAG retriever (BM25+dense+RRF k=60)
- ADR-024 Onnipotenza ClawBot (gold-set integrazione test E2E)
- `tests/fixtures/hybrid-gold-30.jsonl` (gold v3 30-query Sprint S iter 8)
- `tests/fixtures/r6-fixture.jsonl` (R6 stress fixture 100 prompts)
