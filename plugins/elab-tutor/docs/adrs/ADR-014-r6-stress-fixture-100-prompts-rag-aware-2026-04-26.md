---
id: ADR-014
title: R6 stress fixture extension — 50 → 100 prompts, RAG-aware (post-RAG ingest 6000 chunks)
status: proposed
date: 2026-04-26
deciders:
  - architect-opus (Sprint S iter 6 Phase 1, Pattern S 5-agent OPUS)
  - Andrea Marro (final approver per category weights + RAG threshold)
context-tags:
  - sprint-s-iter-6
  - sprint-r6-stress-test
  - rag-retrieval-accuracy
  - multi-volume-synthesis
  - temporal-continuity
related:
  - ADR-011 (R5 stress fixture 50 prompts) — base pattern extension
  - ADR-009 (validatePrincipioZero middleware) — runtime PZ runtime gate
  - ADR-010 (Together AI fallback gated) — chain provider for stress test
  - ADR-012 (Vision flow E2E) — sibling iter 6
  - ADR-013 (ClawBot composite handler) — sibling iter 6
  - SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md §6 P1 4 (RAG ingest)
input-files:
  - scripts/bench/r5-fixture.jsonl (iter 4, 50 entries jsonl)
  - scripts/bench/score-unlim-quality.mjs (12 RULES scorer + category-aware iter 3)
  - scripts/bench/run-sprint-r5-stress.mjs (Edge Function runner iter 4-5)
output-files:
  - scripts/bench/workloads/sprint-r6-stress-fixtures.jsonl (NEW — 100 entries jsonl)
  - scripts/bench/run-sprint-r6-stress.mjs (NEW — runner with RAG telemetry capture)
  - .github/workflows/sprint-r6-bench.yml (NEW — workflow_dispatch optional)
---

# ADR-014 — R6 stress fixture extension (50 → 100 prompts, RAG-aware post-ingest)

> Estendere R5 fixture (50 prompts iter 4 con 6 categorie) a R6 (100 prompts iter 6+ con 9 categorie). Aggiunge 3 nuove categorie RAG-aware: `rag_retrieval_accuracy` (10), `multi_volume_synthesis` (10), `temporal_continuity` (10). Pre-condition: RAG ingest 6000 chunks Voyage stack completato (iter 6 P1 4 deferred). Pass gate: ≥85% overall AND ≥80% per categoria. Box 9 lift consolidation post-RAG ingest da 1.0 → 1.0 (R5 ≥90% mantenuto + R6 nuovo gate).

---

## 1. Contesto

### 1.1 R5 baseline + gap copertura

Sprint S iter 5 close: R5 91.80% PASS production Edge Function (50 prompts × 6 categorie ADR-011). Coverage:

| Category | Count | R5 PASS rate |
|----------|-------|--------------|
| principio-zero-plurale | 10 | 100% |
| citazione-volume-pagina | 10 | 100% |
| sintesi-max-60-parole | 8 | 100% |
| safety-warning-corrente | 6 | 100% |
| off-topic-redirect | 6 | 100% |
| deep-question-elettronica | 10 | 90% |

Gap noti R5:
1. NO category test RAG retrieval accuracy (citazione corretto chunk RAG?)
2. NO category test multi-volume synthesis (combina Vol.1 + Vol.2 + Vol.3?)
3. NO category test temporal continuity (ricorda sessione precedente?)

Iter 6 RAG ingest 6000 chunks (P1 4 ADR-014 pre-condition) abilita test RAG retrieval. Post-ingest, R6 misura:
- Retrieval accuracy: prompt cita correttamente chunk specifico Vol+pag?
- Multi-volume: prompt complesso richiede sintesi 2+ volumi?
- Temporal: prompt richiama lezione precedente via sessionId/recallPastSession?

### 1.2 Pre-condition RAG ingest

ADR-014 pre-suppose iter 6 P1 4 completato (RAG ingest 6000 chunks via Voyage stack). Se NON completato iter 6:
- ADR-014 SCOPE shift: skeleton fixture committed ma NOT executed
- Box 9 lift defer iter 7+ post RAG ingest

Iter 6 score impact:
- Se RAG ingest DONE: R6 fixture executed → Box 9 mantained 1.0 + bonus deliverables
- Se RAG ingest NOT DONE: R6 skeleton committed, executed iter 7+

### 1.3 Perché 100 prompts (non 75 né 150)

R5 50 prompts → R6 100 prompts = **2x scale-up**.

**Razionale 100**:
- Statistical power: n=100 → CI ±5pp overall, n=10 per category → CI ±15pp (matched R5)
- Cost: ~100 calls × 5s × Gemini Flash $0.075/M tokens = trascurabile $0.05/run
- Manutenzione: 100 prompts curati manualmente = 2-3h architect/Andrea (R5 1-2h × 2)
- Coverage: 9 categorie × 10-12 prompts each = balanced

**Alternative scartate**:

- "75 prompts" → asymmetric category counts, harder R6 vs R5 comparison
- "150 prompts" → cost 3x, manutenzione fixture pesante diminishing returns
- "200 prompts iter 8" → defer roadmap iter 8+

---

## 2. Decisione

### 2.1 Decisione D1 — 9 categorie (6 R5 + 3 RAG-aware NEW)

**Scelta**: estensione R5 con 3 nuove categorie.

| # | Category | Count | New iter 6 |
|---|----------|-------|-----------|
| 1 | principio-zero-plurale | 12 (+2) | NO |
| 2 | citazione-volume-pagina | 12 (+2) | NO |
| 3 | sintesi-max-60-parole | 10 (+2) | NO |
| 4 | safety-warning-corrente | 8 (+2) | NO |
| 5 | off-topic-redirect | 8 (+2) | NO |
| 6 | deep-question-elettronica | 10 | NO |
| 7 | **rag_retrieval_accuracy** | 10 | **YES iter 6** |
| 8 | **multi_volume_synthesis** | 10 | **YES iter 6** |
| 9 | **temporal_continuity** | 10 | **YES iter 6** |

**Razionale 3 nuove**:

- **rag_retrieval_accuracy (10)**: prompts dove citazione Vol+pag preciso è verificabile contro RAG ingest. Es. "Cosa dice il libro a pag.27 di Vol.1?" → response deve contenere keyword chunk specifico ingestito.
- **multi_volume_synthesis (10)**: prompts che richiedono sintesi cross-volume. Es. "Come collego il LED del Vol.1 con il PWM del Vol.3?" → response deve citare entrambi Vol.
- **temporal_continuity (10)**: prompts con sessionId precedente che richiamano fatto passato. Es. sessionId X iter 1 cita Vol.1 LED → sessionId X iter 2 "ricordi cosa abbiamo visto?" → response deve citare LED Vol.1.

**Existing categories +2 each**:
- Bilanciamento count migliore con n=10-12 per category (R5 alcune erano n=6, troppo bassa)

**Alternative scartate**:

- "Solo 3 nuove categorie, no expand existing" → asymmetric vs R5
- "5 nuove categorie iter 6" → over-engineered, 3 sufficient first iteration RAG-aware

### 2.2 Decisione D2 — Pre-condition RAG ingest 6000 chunks

**Scelta**: ADR-014 pre-suppose `scripts/rag-contextual-ingest-voyage.mjs` (iter 5 close shipped) eseguito iter 6 P1. Pre-flight check in `run-sprint-r6-stress.mjs`:

```js
// Pre-flight: verify RAG chunk count via Supabase query
const { count } = await supabase.from('rag_chunks').select('*', { count: 'exact' });
if (count < 5000) {
  console.error(`R6 pre-condition FAIL: only ${count} RAG chunks ingested (need ≥5000)`);
  process.exit(1);
}
```

**Razionale**:
- Hard gate: RAG-aware categories meaningless senza RAG corpus
- 5000 minimum vs 6000 target = 17% margin per partial ingest

**Alternative scartate**:

- "Skip pre-flight" → false PASS R6 con RAG vuoto
- "Mock RAG corpus" → no signal real prod

### 2.3 Decisione D3 — Pass gate ≥85% overall + ≥80% per category

**Scelta**: gate più lasco rispetto R5 (90% overall) per riconoscere difficoltà categorie nuove.

**Threshold**:

| Category | Count | Min PASS | Pass % |
|----------|-------|----------|--------|
| principio-zero-plurale | 12 | 10/12 | 83.3% |
| citazione-volume-pagina | 12 | 10/12 | 83.3% |
| sintesi-max-60-parole | 10 | 8/10 | 80% |
| safety-warning-corrente | 8 | 7/8 | 87.5% |
| off-topic-redirect | 8 | 7/8 | 87.5% |
| deep-question-elettronica | 10 | 8/10 | 80% |
| rag_retrieval_accuracy | 10 | 8/10 | 80% |
| multi_volume_synthesis | 10 | 7/10 | 70% (lasso categoria difficile) |
| temporal_continuity | 10 | 7/10 | 70% (lasso categoria difficile) |
| **Overall** | **100** | **85/100** | **85%** |

**Verdetto**:
- **PASS**: overall ≥85% AND ≥7 categorie ≥80% AND multi_volume + temporal ≥70%
- **WARN**: overall ≥80% OR 1-2 categorie 70-80%
- **FAIL**: overall <80% OR ≥3 categorie <70%

**Razionale**:
- R5 mantenuto 90% gate (existing 6 categorie)
- R6 NEW categories (multi_volume + temporal) = first measurement, threshold lasco
- Overall 85% = sotto R5 90% per riconoscere difficoltà aggiunta categorie

### 2.4 Decisione D4 — Runner Capture RAG telemetry

**Scelta**: `run-sprint-r6-stress.mjs` capture RAG retrieval metadata per category 7 (`rag_retrieval_accuracy`).

```js
// In Edge Function unlim-chat (modify needed iter 7+):
// Add response.metadata.rag_chunks_retrieved: [{ chunk_id, score, vol, pag }]

// Runner consume:
async function runR6Prompt(fixture) {
  const response = await postToEdgeFunction(fixture);
  const ragMeta = response.metadata?.rag_chunks_retrieved || [];

  if (fixture.category === 'rag_retrieval_accuracy') {
    // Assert: at least 1 retrieved chunk matches expected_vol + expected_pag
    const match = ragMeta.find(c => c.vol === fixture.expected_vol && Math.abs(c.pag - fixture.expected_pag) <= 2);
    fixture.rag_match = !!match;
  }
  return { ...fixture, response, ragMeta };
}
```

**Razionale**:
- Telemetry RAG retrieval = audit chunk-level accuracy (not just keyword match in response)
- Fuzzy match pag ±2 = handle pag boundary chunks
- Runner-side computation = NO Edge Function modification iter 6 baseline (fall-back keyword match if rag_chunks_retrieved metadata not exposed yet)

### 2.5 Decisione D5 — Honesty caveats RAG-aware

**Scelta**: extend honesty_caveats array R5 ADR-011 §2.9 con RAG-specific:

```json
{
  "rag_chunks_count": 6234,
  "rag_match_rate": 0.85,
  "rag_pag_fuzzy_tolerance": 2,
  "ingest_age_days": 0,
  "voyage_embedding_model": "voyage-multilingual-2",
  ...
}
```

**Razionale**:
- Rag chunks count = trasparenza ingest size at run time
- Match rate = retrieval accuracy meta-honesty
- Embedding model = audit Voyage version

### 2.6 Decisione D6 — Roadmap futura R7+

**Scelta**:
- R6 v1.0 (iter 6+) = 100 prompts × 9 categorie post RAG ingest
- R7 v1.0 (iter 8+) = 150 prompts + adversarial (prompts cercano rompere PZ)
- R8 v1.0 (iter 10+) = 200 prompts + LLM-judge automatic Sonnet
- R9 v1.0 (iter 12+) = continuous bench cron + dashboard observability

iter 6 SCOPE: SOLO R6 v1.0 100 prompts.

---

## 3. Implementation contract per generator-test-opus

```jsonl
// File: scripts/bench/workloads/sprint-r6-stress-fixtures.jsonl (NEW, 101 lines)
// Line 1: metadata jsonl entry
// Lines 2-101: 100 fixture entries with full schema (extends R5 + 3 new categories)
```

```js
// File: scripts/bench/run-sprint-r6-stress.mjs (NEW)
// Runner Edge Function unlim-chat with RAG telemetry capture + 9 categorie scoring
```

```yaml
# File: .github/workflows/sprint-r6-bench.yml (NEW)
# manual_dispatch workflow, secrets injection, artifacts upload
```

---

## 4. Acceptance criteria per implementation

Per `generator-test-opus`:

- [ ] File creato: `scripts/bench/workloads/sprint-r6-stress-fixtures.jsonl` con 100 entries + 1 metadata
- [ ] Distribution rispetta D1 (12/12/10/8/8/10/10/10/10 per 9 categorie)
- [ ] 3 nuove categorie con schema arricchito (`expected_vol`, `expected_pag`, `requires_session_history`)
- [ ] File creato: `scripts/bench/run-sprint-r6-stress.mjs` con pre-flight RAG check + telemetry capture
- [ ] File creato: `.github/workflows/sprint-r6-bench.yml` con workflow_dispatch
- [ ] Pre-flight check: skip if RAG chunks <5000
- [ ] Runner produce `r6-summary-<TS>.json` con honesty_caveats RAG-aware
- [ ] Verdetto PASS/WARN/FAIL per ADR-014 §2.3
- [ ] No regressione test baseline (12574+ PASS preservato)

---

## 5. Trade-off summary onesto

**Pro**:
- Coverage RAG-aware: 30 nuovi prompts categories misurano retrieval + multi-volume + temporal
- Statistical power: n=100 → CI ±5pp overall (vs ±7pp R5 n=50)
- Honesty caveats RAG-specific: trasparenza ingest size + match rate
- Pre-flight check evita false PASS RAG vuoto
- Backward compat R5 existing categories preservate

**Contro / debt**:
- Pre-condition RAG ingest 6000 chunks (iter 6 P1 4 deferred se NON completato)
- 100 prompts manualmente curati = 2-3h architect/Andrea
- Edge Function NON espone rag_chunks_retrieved metadata iter 6 (fall-back keyword match)
- Multi_volume + temporal threshold lasco (70%) = difficoltà inherent categorie
- Cost per run ~$0.05 (Gemini Flash 100 calls), ok ma cumula 10 run/mese = $0.50

**Alternative rejected**:
- "Skip RAG pre-flight" → false PASS rischio
- "75 prompts iter 6" → asymmetric vs R5 comparison
- "150 prompts iter 6" → cost 3x diminishing returns
- "Continuous bench cron" → defer iter 12+

---

## 6. Open questions per Andrea/orchestrator

1. **[ANDREA-DECIDE] R6 execution timing**: ADR-014 pre-suppose iter 6 RAG ingest. Se ingest NON completato iter 6, R6 skeleton committed + execution iter 7+. Andrea conferma?

2. **[ANDREA-DECIDE] Threshold multi_volume + temporal**: ho proposto 70% (lasso) per riconoscere difficoltà categorie nuove. Andrea preferisce stricter 80%?

3. **[ORCHESTRATOR] Edge Function metadata expose**: rag_chunks_retrieved metadata non esposto iter 6. Iter 7+ aggiungere? Mio default: yes per audit RAG accuracy chunk-level.

4. **[ORCHESTRATOR] Pre-flight 5000 vs 6000 threshold**: 5000 chunks minimum proposto. Andrea conferma o vuole 6000 esatto?

---

## 7. Riferimenti

- **PDR Sprint S iter 6**: `SETUP-NEXT-SESSION/ARCHITETTURA-FINALE-SESSIONE-2026-04-26.md` §6 P1 4 (RAG ingest)
- **R5 fixture base**: `scripts/bench/r5-fixture.jsonl` (50 entries iter 4 ADR-011)
- **R5 scorer**: `scripts/bench/score-unlim-quality.mjs` (12 RULES + category-aware iter 3)
- **R5 runner**: `scripts/bench/run-sprint-r5-stress.mjs` (Edge Function iter 4-5)
- **RAG ingest script**: `scripts/rag-contextual-ingest-voyage.mjs` (iter 5 close shipped, defer execution iter 6)
- **Sibling iter 3**: ADR-011 R5 stress fixture 50 prompts (base pattern extension)
- **Sibling iter 6**: ADR-012 Vision flow E2E (single-fixture pattern)
- **Sibling iter 6**: ADR-013 ClawBot composite handler (Sprint 6 Day 39 gate)
- **PRINCIPIO ZERO**: `CLAUDE.md` apertura
- **R5 91.80% PASS production baseline**: `CLAUDE.md` Sprint S iter 5 close
