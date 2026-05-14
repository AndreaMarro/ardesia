# Decision Record - Mistral Embeddings per UNLIM

Data: 2026-05-09

## Decisione

Usare Mistral embeddings come strato semantico principale per il cervello ELAB, con due indici distinti:

- `mistral-embed` per conoscenza testuale: Tea, volumi, narrative map, album, fumetti metadata, note sessione, messaggi compressi.
- `codestral-embed` per codice e artefatti tecnici: Arduino, Scratch/Blockly XML, errori compiler, ricette tool, snippet verificati.

Il retrieval deve essere ibrido: BM25/FTS + dense vector + metadata filter + Reciprocal Rank Fusion + rerank leggero. Le citazioni Vol./pag. sono ancore brevi, non la risposta.

## Perche'

UNLIM deve essere consapevole senza diventare lento. Gli embeddings non sono la memoria completa: sono l'indice rapido per trovare il contesto giusto. La risposta finale deve nascere dalla fusione di:

- stato live del circuito;
- cronologia sessione;
- intent operativo;
- knowledge Tea/volumi;
- narrative/album/fumetti;
- tool status e verifier.

## Schema proposto

```sql
create table elab_semantic_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  narrative_map_id text,
  volume int,
  chapter int,
  experiment_id text,
  page_start int,
  page_end int,
  components text[] default '{}',
  arc_id text,
  chunk_hash text not null,
  embedding_model text not null default 'mistral-embed',
  embedding vector,
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id, chunk_hash, embedding_model)
);

create table elab_code_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  language text not null,
  experiment_id text,
  chunk_hash text not null,
  embedding_model text not null default 'codestral-embed',
  embedding vector,
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id, chunk_hash, embedding_model)
);
```

Nota: la dimensione `vector(...)` va fissata solo dopo il test reale del modello scelto e dell'opzione `output_dimension`.

## Pipeline

1. Chunking admin/offline per Tea, volumi, narrative map, fumetti e codice.
2. Calcolo `chunk_hash`.
3. Skip se hash gia indicizzato con stesso modello.
4. Batch embeddings via API Mistral.
5. Upsert in Supabase pgvector.
6. Benchmark con gold set: recall@5, precision@5, MRR, latenza p50/p95.
7. Solo dopo, collegamento a `AgentDecision.rag`.

## Runtime

Input query:

- messaggio utente;
- stato live sintetico;
- ultimi eventi importanti;
- esperimento/capitolo/modalita;
- tool richiesto o fallito.

Output retrieval:

- massimo 3-6 chunk text;
- massimo 2 chunk code/tool;
- metadata sempre incluso;
- nessun blocco lungo copiato nel prompt.

## Non fatto in questa sessione

- Nessuna chiamata reale a Mistral.
- Nessun ingest remoto.
- Nessun benchmark live su pgvector.

Serve `MISTRAL_API_KEY` nell'ambiente target prima di eseguire ingest reale.
