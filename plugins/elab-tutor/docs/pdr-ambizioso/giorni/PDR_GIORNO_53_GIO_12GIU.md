# PDR Giorno 53 — Giovedì 12/06/2026

**Sett 8** | Andrea 8h + Tea 4h + 3 docenti UAT | Goal: **UAT day 1 — 3 sessioni docenti reali**.

## Task del giorno
1. **(P0) Andrea + 3 docenti: UAT session 2h ognuno (6h total Andrea)** (6h)
   - 9:00-11:00 — Docente 1 (Giovanni)
   - 11:30-13:30 — Docente 2 (Davide)
   - 14:30-16:30 — Docente 3 (contact 1)
2. **(P0) Tea: live observe + log issue** (Tea 4h)
3. **(P0) TPM: triage feedback (P0/P1/P2)** (1h)

## Multi-agent dispatch
```
@team-tester "Live observe UAT. Log ogni issue:
- Severity (P0/P1/P2)
- Riproducibilità (sempre/intermittente)
- Impatto (blocking/cosmetic)
- Workaround
Output: docs/uat/uat-day1-issues.md."

@team-tpm "End-of-day triage. Aggrega 3 sessioni issue.
Output: priorità fix venerdì + DECISION-XXX se issue blocking release."
```

## DoD
- [ ] 3 sessioni UAT completate
- [ ] Tutti issue logged
- [ ] Triage completato
- [ ] Priority fix giovedì sera
- [ ] Handoff

## Rischi
- Docente cancella all'ultimo → backup contact lista
- P0 issue critical scoperto → release v1.0 slittata
- Andrea overwhelmed 6h consecutive → break 1h pomeriggio

## Handoff
`docs/handoff/2026-06-12-end-day.md`
