# PDR Giorno 11 — Giovedì 01/05/2026 (Festa lavoro IT)

**Sett 2** | Andrea 4h light + Tea OFF | Goal: **BGE-M3 embedding endpoint Hetzner + 549 chunk re-embed PTC**.

NB: festa lavoro Italia. Andrea capacity ridotta. Tea OFF.

## Pre-flight (10:00 light)
```bash
git status; git pull
ssh elab-prod 'docker ps'
```

## Task del giorno (light)
1. **(P0) DEV: deploy BGE-M3 inference server Hetzner (text-embeddings-inference)** (2h)
2. **(P0) TESTER: PTC batch re-embed 549 chunk (PROGRAMMATIC_TOOL_CALLING.md use case 5)** (1.5h)
3. **(P1) ARCHITECT: ADR-007 BGE-M3 vs OpenAI ada-002 (recall comparison)** (30 min)

## Multi-agent dispatch
```
@team-dev "Deploy BGE-M3 server Hetzner. Container HF text-embeddings-inference. Port 8001."
@team-tester "PTC re-embed 549 RAG chunk con BGE-M3. Vedi PROGRAMMATIC_TOOL_CALLING.md use case 5."
@team-architect "ADR-007 BGE-M3 vs OpenAI. Recall test 50 query. Output docs/decisions/ADR-007-embedding-model.md."
```

## PTC use case 5
Vedi PROGRAMMATIC_TOOL_CALLING.md sez 3 use case 5 per codice completo.

## DoD
- [ ] BGE-M3 server up port 8001 healthy
- [ ] 549 chunk re-embedded + saved
- [ ] Recall comparison BGE-M3 vs OpenAI documented
- [ ] ADR-007 scritto
- [ ] Handoff (light)

## Rischi
- Festa: Andrea capacity 4h max → priorize
- BGE-M3 GPU richiesta? → Hetzner CX31 CPU OK per inference (slow ma operational)

## Handoff
`docs/handoff/2026-05-01-end-day.md`
