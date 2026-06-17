# PDR Giorno 17 — Mercoledì 07/05/2026

**Sett 3** | Andrea 8h + Tea 3h | Goal: **RAG retrieval BGE-M3 + pgvector + tool `search_book_text`**.

## Task del giorno
1. **(P0) DEV: implementa pgvector schema Supabase (vector(1024) col)** (1.5h)
2. **(P0) DEV: PTC batch insert 549 chunk con embedding BGE-M3 → pgvector** (2h)
3. **(P0) DEV: tool `search_book_text` retrieval BGE-M3 → pgvector cosine** (2h)
4. **(P0) TESTER: recall test 50 query → top-5 retrieval verify** (2h)
5. **(P2) Tea: PR esperimenti vol1 cap 8 (auto-merge)** (Tea 3h)

## Multi-agent dispatch
```
@team-architect "ADR-009 RAG architecture: BGE-M3 + pgvector vs Supabase Edge Vector vs Pinecone."
@team-dev "Implement pgvector schema + PTC batch insert + tool search_book_text."
@team-tester "PTC use case: 50 query recall test. Acceptance: recall@5 ≥0.85."
```

## PTC use case 5 (re-embed) + nuovo (batch insert)

```python
# 1. Re-embed con BGE-M3 (use case 5 PROGRAMMATIC_TOOL_CALLING.md)
# 2. Batch insert pgvector
import asyncio
import json
from pathlib import Path
import psycopg2

chunks = json.loads(Path("/Users/andreamarro/VOLUME 3/PRODOTTO/elab-builder/src/data/rag-chunks.json").read_text())

def insert_batch(batch):
    conn = psycopg2.connect("postgresql://...")
    cur = conn.cursor()
    for c in batch:
        cur.execute("INSERT INTO rag_chunks (text, source, embedding) VALUES (%s, %s, %s)",
                    (c["text"], c["source"], c["embedding"]))
    conn.commit(); conn.close()
    return len(batch)

# 11 batch da 50 chunk parallel
async def main():
    batches = [chunks[i:i+50] for i in range(0, 549, 50)]
    inserted = await asyncio.gather(*[asyncio.to_thread(insert_batch, b) for b in batches])
    return {"inserted": sum(inserted)}

print(asyncio.run(main()))
```

## DoD
- [ ] pgvector schema Supabase
- [ ] 549 chunk inseriti
- [ ] tool search_book_text invokable
- [ ] Recall@5 ≥0.85 verified
- [ ] Tea PR
- [ ] Handoff

## Rischi
- pgvector extension non installato Supabase free → enable manual `CREATE EXTENSION vector`
- BGE-M3 embedding 1024-dim vs schema mismatch → ALTER TABLE

## Handoff
`docs/handoff/2026-05-07-end-day.md`
