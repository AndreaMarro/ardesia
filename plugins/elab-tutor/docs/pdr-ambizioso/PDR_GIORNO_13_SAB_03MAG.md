# PDR Giorno 13 — Sabato 03/05/2026

**Sett 2** | Andrea 6h sabato light + Tea opzionale | Goal: **Buffer + integration test stack completo + AUDITOR live verify**.

## Pre-flight (10:00)
```bash
git status; git pull; npx vitest run --reporter=dot | tail -3
node scripts/benchmark.cjs --fast
```

## Task del giorno
1. **(P0) Buffer: completa task slittati (Together AI, Hetzner, RunPod, BGE-M3)** (3h)
2. **(P0) AUDITOR: live verify TUTTI endpoint setup sett 2** (2h)
3. **(P0) TESTER: PTC integration test stack completo (chain Together → Hetzner → RunPod)** (1h)

## Multi-agent dispatch
```
@team-auditor "Live verify FINE SETT 2.
- Together AI key OK + 1 query sample
- Hetzner CX31 ssh OK + docker ps healthy
- RunPod endpoint up + 1 cold start cycle
- BGE-M3 server up + 5 embedding test
- claude-mem corpus query OK
Output: docs/audits/2026-05-03-stack-onesto-fine-sett2.md"

@team-tester "PTC integration test stack chain end-to-end.
1 query → Together AI Llama 70B
1 RAG retrieval → BGE-M3 embed + pgvector search
1 inference → RunPod Mistral 24B fallback
Verify chain working."
```

## PTC use case
Integration test parallel (chain Together → Hetzner → RunPod).

## DoD
- [ ] Tutti task sett 2 chiusi (P0 7/7)
- [ ] AUDITOR onesto report stack
- [ ] Integration test chain PASS
- [ ] Score benchmark ≥6.5 (target sett 2)
- [ ] Handoff

## Rischi
- Carry-over esteso → indaga blocker reale, slip sett 3 (NON nascondere)

## Handoff
`docs/handoff/2026-05-03-end-day.md`
