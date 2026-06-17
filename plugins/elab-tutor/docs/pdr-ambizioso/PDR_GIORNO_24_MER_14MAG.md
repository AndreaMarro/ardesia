# PDR Giorno 24 — Mercoledì 14/05/2026

**Sett 4** | Andrea 8h + Tea 4h | Goal: **Glossario Tea 200+ termini completion + integration RAG**.

## Task del giorno
1. **(P0) Tea: PR finale glossario 200+ termini cumulative (Vol 1+2+3)** (Tea 4h)
2. **(P0) DEV: integra glossario in RAG corpus (chunk per termine + analogia)** (2h)
3. **(P0) TESTER: glossario coverage test (100% termini key da Vol 1+2+3 presenti)** (2h)
4. **(P0) DEV: tool `get_glossary_term` (vedi PDR_SETT_5 tool 18)** (1h)

## Multi-agent dispatch
```
@team-dev "Glossario integration: ogni termine = 1 chunk RAG con analogia bambini 10-14."
@team-tester "Coverage test: 200+ termini key Vol 1+2+3 presenti, no orphan."
@team-reviewer "Review glossario quality: analogie validate, lingua chiara, no Principio Zero violations."
```

## DoD
- [ ] Glossario 200+ termini cumulative
- [ ] Glossario integrato RAG (200+ chunk)
- [ ] Coverage 100% Vol 1+2+3 key terms
- [ ] tool get_glossary_term invokable
- [ ] Tea PR auto-merged
- [ ] Handoff

## Handoff
`docs/handoff/2026-05-14-end-day.md`
