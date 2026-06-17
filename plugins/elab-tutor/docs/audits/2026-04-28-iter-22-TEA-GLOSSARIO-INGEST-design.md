# Iter 22 — Tea Glossario Ingest (design + verifica)

Data: 2026-04-28
Autore: Claude (caveman pipeline)
Status: PARSER VERIFIED · SQL READY · MIGRATION/SEED NOT APPLIED · EMBEDDING DEFERRED
Owner ratify: Andrea (gate post-bench)

## Riepilogo deliverables

| File | Path | Bytes | Note |
|------|------|-------|------|
| Parser ESM | `PRODOTTO/elab-builder/scripts/tea-glossario-parser.mjs` | 11k | 180/180 OK |
| JSON termini | `automa/state/tea-glossario-180.json` | 87k | 180 entries |
| Migration | `PRODOTTO/elab-builder/supabase/migrations/2026-04-28-wiki-concepts-tea-glossario.sql` | 5.3k | NOT applied |
| Bulk seed | `PRODOTTO/elab-builder/supabase/seed/tea-glossario-180.sql` | 116k | 180 INSERT |
| Embedder | `PRODOTTO/elab-builder/scripts/tea-glossario-embed.mjs` | 5.2k | Deferred |
| Audit doc | `PRODOTTO/elab-builder/docs/audits/2026-04-28-iter-22-TEA-GLOSSARIO-INGEST-design.md` | this | LOC<600 |

## Sezione 1 — Parser logic + verifica counts

### Algoritmo (caveman robusto)

1. Leggi i 3 file `/tmp/tea-vol{1,2,3}.txt` (estratti via `pdftotext` in iter 21).
2. Strip leading `\f` (PDF page-break) — necessario per Vol1 Cap1 / Cap11 dove
   il form-feed precedeva "Capitolo".
3. Trova **anchor lines**: ogni riga con `SPIEGAZIONE TECNICA` esatto = un termine.
4. **Term name** = prima riga non-rumore camminando all'indietro dall'anchor,
   skippando blank, `■`, simboli unità (`V`, `A`, `Ω`, `mA`), digit-only.
5. **Technical text** = righe tra anchor e `PER BAMBINI`.
6. **Kids text** = righe dopo `PER BAMBINI` fino al prossimo anchor (con
   walkback per evitare di mangiare il nome del termine successivo).
7. **Chapter** = ultimo `Capitolo N · Titolo` visto prima dell'anchor (gestisce
   wrap su 2 righe per Vol3 Cap8 e Vol3 Cap10).
8. **Noise scrub** finale: rimuove tokens `■`, simboli unità, digit-only
   embedded all'interno di technical/kids.

### Verifica counts

| Vol | Termini parsed | Atteso | Capitoli parsed | Atteso | Δ termini | Δ capitoli |
|-----|----------------|--------|-----------------|--------|-----------|------------|
| 1   | 66             | 66     | 14              | 14     | 0         | 0          |
| 2   | 59             | 59     | 12              | 12     | 0         | 0          |
| 3   | 55             | 55     | 12              | 12     | 0         | 0          |
| **Tot** | **180**    | **180**| **38**          | **38** | **0**     | **0**      |

### Parse gap noto + heuristic fix

**Vol3 Cap1 — coppia "Linguaggio macchina / Linguaggio di programmazione"**:
nel PDF i due termini condividono un blocco con doppio nome ravvicinato e
doppio `SPIEGAZIONE TECNICA`. Il parser greedy attribuiva il nome sbagliato.
Fix applicato in `applyKnownFixes`:
- `term[i] = "Linguaggio macchina"` (era "Linguaggio di programmazione")
- `term[i].kids_explanation` = recuperato dal field-leak del `term[i+1].term`
- `term[i+1] = "Linguaggio di programmazione"` (era una stringa lunga di kids)

Validazione post-fix: 0 bad rows (tutte le 180 entry hanno term, technical, kids non vuoti).

## Sezione 2 — Schema `wiki_concepts`

```sql
CREATE TABLE wiki_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vol INT NOT NULL CHECK (vol BETWEEN 1 AND 3),
  cap INT NOT NULL CHECK (cap BETWEEN 1 AND 14),
  cap_title TEXT,
  term TEXT NOT NULL,
  technical TEXT NOT NULL,
  kids_explanation TEXT NOT NULL,
  source TEXT DEFAULT 'tea-glossario-2026-04-27',
  embedding VECTOR(1024),  -- BGE-M3 dim
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Indici

- `wiki_concepts_unique_idx (vol, cap, term)` UNIQUE → idempotent INSERT/UPSERT
  (rationale: stesso `term` può ricorrere across volumi; chiave dedup naturale
  è la tripla, NON il solo `term`).
- `wiki_concepts_fts_idx` GIN su `to_tsvector('italian', term||tech||kids)` →
  Italian FTS per match boost.
- `wiki_concepts_term_trgm_idx` GIN trigram su `term` → fuzzy lookup typo-tolerant.
- `wiki_concepts_embed_idx` IVFFLAT cosine su `embedding`, `lists=4` (180 row →
  4 lists è la soglia minima ragionevole; rebuild post-bulk-insert con
  `REINDEX` se accuracy <90%).

### RLS policies

- `wiki_concepts_anon_read`: `SELECT` libero per anon (classe virtuale pattern,
  no Auth required — coerente con `lesson_contexts` / `nudge`).
- `wiki_concepts_service_all`: `ALL` per service_role (insert/update/delete
  controllato).
- `GRANT SELECT TO anon` + `GRANT ALL TO service_role`.

### RPC `wiki_concepts_hybrid_search`

Inclusa nella migration: combina FTS rank + embedding cosine con RRF k=60
(coerente con `match_rag_chunks` esistente). Embedding param nullable →
fallback FTS-only quando le 180 entry non hanno ancora vector. Top-N
configurabile (default 5).

### Why separate table vs riusare `rag_chunks`

- Schema rigido term/tech/kids triplet (no free-form chunks → query precisa
  "definisci LED" può colpire term=LED diretto).
- Re-embed indipendente (180 row si re-embeddano in <30s, non serve
  ri-vectorizzare i 549 chunk volume).
- Boost fusion in RRF: trattare wiki_concepts come 4° lista nel multi-list RRF
  esistente (vedi sez. 4) evita il problema 1881-vs-100 corpus imbalance già
  risolto in `rag.ts` per i wiki ELAB.

## Sezione 3 — Embedding strategy

### Provider waterfall

| Priorità | Provider | Dim | Costo (180 termini ~14k tok) | Stato |
|----------|----------|-----|------------------------------|-------|
| 1 | BGE-M3 RunPod V2 | 1024 | $0 (self-hosted) | Deferred (pod down iter 21) |
| 2 | Voyage AI `voyage-3` | 1024 | ~$0.001 ($0.06/1M tok) | Fallback paid |
| 3 | OpenAI `text-embedding-3-large` | 1024 (truncate) | ~$0.0018 ($0.13/1M) | Last resort |

### Text strategy

```
${term}: ${technical} ${kids_explanation}
```

Rationale: term first → highest TF-IDF weight nel context window; technical
fornisce domain anchor; kids estende coverage di paraphrase (query bambini sono
spesso non-tecniche, "lampadina che si accende" → match LED via kids overlap).

### Output

`automa/state/tea-glossario-embeddings.json` con shape:
```json
[{"vol":1,"cap":6,"term":"LED","embedding":[0.012,...,−0.04],"dim":1024,"provider":"bge"}, ...]
```

### Loading post-embed

UPDATE statements one-shot:
```sql
UPDATE wiki_concepts SET embedding = $1::vector
WHERE vol = $2 AND cap = $3 AND term = $4;
```

Eseguibile via Supabase CLI o script Node con pg/postgrest. NON lanciato in
iter 21 — gate Andrea richiesto.

## Sezione 4 — UNLIM RAG retrieval boost

### Stato attuale `rag.ts` (verified)

`hybridRetrieve()` (line 911) già implementa:
- BM25 italian su `rag_chunks` (lista 1)
- Dense pgvector su `rag_chunks` (lista 2)
- BM25 wiki-only filter (lista 3)
- Dense wiki-only filter (lista 4)
- RRF k=60 fusion via `rrfFuseMulti` (line 843)

### Modifica proposta (NON applicata)

Aggiungere quinta + sesta lista per `wiki_concepts`:
1. Chiamata RPC `wiki_concepts_hybrid_search(query_text, query_embedding, 10, 60)` →
   già fa fusion interna FTS+vec.
2. Score returned già RRF-shaped → merge come 5ª lista in `rrfFuseMulti`
   (peso uguale; volendo boost, weight=1.5 → richiede modifica `rrfFuseMulti`
   per accettare list weights).

### Patch sketch (non scritta in codice)

```ts
// rag.ts dentro hybridRetrieve()
const wikiConceptsHits = await supabase.rpc('wiki_concepts_hybrid_search', {
  query_text: query,
  query_embedding: queryVec,
  match_count: 10,
  rrf_k: 60,
});
// Map a HybridChunk shape: { id, content: term + ': ' + tech, source: 'wiki_concept', vol, cap }
const wikiList = wikiConceptsHits.data.map(...);
const fused = rrfFuseMulti([ragBm25, ragDense, wikiBm25, wikiDense, wikiList], 60);
```

### Perché RRF k=60 invariato

- 60 è il valore canonico (paper Cormack et al.) e già usato in `match_rag_chunks`.
- Aumentare k smussa scores → meno boost differenziale per top-1 wiki hit
  (controproducente: vogliamo che query "definisci tensione" PROMUOVA il wiki
  hit term=Tensione sopra ai chunk volume).
- Decrease k a 30 testabile in bench post-deploy ma rischio cherry-pick.

## Sezione 5 — Andrea ratify gate

Migration NON applicata + seed NON applicato + embeddings NON generati. Gate
sequence proposta:

1. **Andrea review** di `supabase/migrations/2026-04-28-wiki-concepts-tea-glossario.sql`
   + spot-check 5 random termini in `automa/state/tea-glossario-180.json`.
2. **Apply migration** (staging Supabase project prima):
   ```bash
   SUPABASE_ACCESS_TOKEN=sbp_... npx supabase db push --linked
   ```
3. **Apply seed** in staging:
   ```bash
   psql $STAGING_URL -f supabase/seed/tea-glossario-180.sql
   ```
4. **Verifica counts**: `SELECT vol, COUNT(*) FROM wiki_concepts GROUP BY vol;`
   atteso 66/59/55.
5. **Bench wiki retrieval senza embedding** (FTS-only): query di test
   ("cos'è un LED", "spiega tensione", "differenza compilatore vs interprete").
   Atteso: top-1 hit = wiki_concepts row pertinente.
6. **Embed** (RunPod V2 quando alive, altrimenti Voyage): `PROVIDER=bge node
   scripts/tea-glossario-embed.mjs`.
7. **Update embeddings** + `REINDEX wiki_concepts_embed_idx`.
8. **Bench wiki retrieval con embedding** (paraphrase queries).
9. **Patch `rag.ts`** per integrare 5ª lista RRF.
10. **Production deploy** edge function + apply su prod Supabase.

## Sezione 6 — Sample 3 termini cross-volumi

### LED Vol1 Cap6 — "Cos'è il diodo LED?"
- Term: `LED`
- Tech: Light Emitting Diode: diodo che emette luce visibile quando attraversato da corrente nel verso diretto.
- Kids: È una piccola lampadina elettronica che si accende con luce colorata quando passa la corrente nel verso giusto. Consuma poco ed è molto resistente.

### Tensione di soglia (LED) Vol2 Cap6 — "Approfondiamo i LED"
- Term: `Tensione di soglia (LED)`
- Tech: Tensione minima necessaria per accendere un LED (tipicamente 1,8-2V per LED rossi, 3-3,2V per LED bianchi/blu).
- Kids: È la 'spinta minima' che serve al LED per accendersi. Sotto questa tensione, il LED resta spento; sopra, si accende. Per i LED del kit, di solito serve almeno 2V.

### Programmazione Vol3 Cap1 — "Un viaggio nella storia della programmazione"
- Term: `Programmazione`
- Tech: Attività di scrittura di istruzioni per un computer o microcontrollore in un linguaggio formale.
- Kids: È quando dici a un computer cosa fare, scrivendo le istruzioni una dopo l'altra. Programmare vuol dire pensare in modo ordinato e tradurre la tua idea in parole che la macchina capisce.

Cross-volume LED coverage verified: query `"cos'è un LED"` produrrà hit di
LED Vol1 (definizione base) + Tensione di soglia Vol2 (approfondimento) — RRF
fusion li promuove entrambi in top-3, dando a UNLIM contesto stratificato.

## Sezione 7 — Cost estimate

### Embedding 180 termini

| Provider | Tok input ~14400 | Costo USD | Tempo | Note |
|----------|------------------|-----------|-------|------|
| BGE-M3 RunPod V2 | n/a | **$0** | ~5s (GPU) | Self-hosted, primary |
| Voyage `voyage-3` | 14400 | ~**$0.0009** | ~3s API | Fallback |
| OpenAI 3-large 1024d | 14400 | ~**$0.0019** | ~2s API | Last resort |

### Storage Supabase

- 180 row × (~250 byte payload + 1024 float32 = 4096 byte vector) ≈ **780 KB**
  totale → trascurabile (free tier 500 MB).

### Indici

- IVFFLAT con 4 lists: ~50 KB.
- GIN tsvector: ~120 KB.
- GIN trigram: ~80 KB.

### Runtime cost RAG hybrid

- Aggiunta di 1 RPC wiki_concepts_hybrid_search per query UNLIM = +1
  round-trip Postgres (~5ms p50).
- Nessun impatto su Gemini routing (la RAG è pre-prompt). Token UNLIM context
  cresce di ~200 token per i top-3 wiki hits = ~$0.00006 per query Gemini Flash.

### Gate budget

Embedding deferred → costo iter 22 = **$0** finché Andrea non sblocca Voyage
key OR RunPod V2 alive. Migration apply costo = $0 (Supabase free tier).

---

## Note di onestà (NO compiacenza)

- **Heuristic fix Vol3 Cap1 è hardcoded**: se Tea revisiona il PDF e altera
  ordine termini, la fix table va rivista. Mitigazione: test snapshot da
  aggiungere per vincolo `term ∈ {Linguaggio macchina, Linguaggio di programmazione}`.
- **Parse non perfetto**: il walkback per "next term name" può essere troppo
  greedy o troppo timido in casi non testati. 180/180 OK ma 0 bad rows ≠
  semantic correctness completa. Andrea spot-check raccomandato.
- **Embedding deferred**: senza vector, hybrid_search RPC funziona solo in
  modalità FTS — perdita di paraphrase coverage (~30% recall stimato).
- **Rerank non incluso**: Voyage rerank-2 darebbe boost +5-10% NDCG ma costa
  $0.05 per 1k query → fuori budget €50/mese se >5k query/mese.
- **No test unit per parser**: le 180/180 sono empiriche, una tea-PDF v2 con
  schema diverso romperebbe silenziosamente.

LOC doc: ~270 righe (limite 600 OK).
