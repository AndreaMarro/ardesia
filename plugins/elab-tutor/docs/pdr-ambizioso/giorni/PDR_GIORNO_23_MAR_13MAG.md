# PDR Giorno 23 — Martedì 13/05/2026

**Sett 4** | Andrea 8h + Tea 4h | Goal: **Embedding 6000+ chunk + pgvector batch insert + recall test**.

## Task del giorno
1. **(P0) DEV: PTC use case 5 — BGE-M3 embedding 6000+ chunk parallel Semaphore(16)** (3h)
2. **(P0) DEV: pgvector batch insert (batch 500 row/insert)** (2h)
3. **(P0) TESTER: recall test 50 query → top-5 retrieval verify (target ≥0.90)** (2h)
4. **(P2) Tea: PR Vol 2 cap 4** (Tea 4h)

## Multi-agent dispatch
```
@team-dev "PTC use case 5 BGE-M3 embed 6000+ chunk. Pgvector batch insert."
@team-tester "Recall@5 test 50 query random. Acceptance ≥0.90."
@team-auditor "Live verify retrieval working (5 query random, manual eval relevance)."
```

## DoD
- [ ] 6000+ chunk embedded
- [ ] 6000+ chunk in pgvector
- [ ] Recall@5 ≥0.90 verified
- [ ] Tea PR
- [ ] Handoff

## Rischi
- BGE-M3 GPU richiesta heavy → CPU OK ma slow (3h+)
- pgvector index ivfflat tuning lists param → benchmark lists=100 vs 256

## Handoff
`docs/handoff/2026-05-13-end-day.md`
