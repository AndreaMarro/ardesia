# PDR Giorno 44 — Martedì 03/06/2026

**Sett 7** | Andrea 8h + Tea 4h | Goal: **Memoria multi-livello schema (student/class/teacher/school)**.

## Task del giorno
1. **(P0) ARCHITECT: design schema 4-tier (student/class/teacher/school)** (1.5h)
2. **(P0) DEV: Supabase tables + RLS policies** (3h)
3. **(P0) DEV: API service `unlimMemory` (read/write 4-tier)** (2h)
4. **(P0) TESTER: integration test multi-tier query (RLS verify)** (1.5h)

## Multi-agent dispatch
```
@team-architect "Schema 4-tier memoria. Tabelle: students, classes, teachers, schools + RLS robusto.
ADR docs/decisions/ADR-013-memoria-multi-livello.md."
@team-dev "Implement Supabase tables + RLS + service unlimMemory."
@team-tester "Test cross-tier query: student appartiene class, class appartiene teacher, teacher appartiene school. RLS isolation."
```

## DoD
- [ ] Schema 4-tier creato Supabase
- [ ] RLS policies enforced
- [ ] unlimMemory service operational
- [ ] Integration test PASS
- [ ] Handoff

## Handoff
`docs/handoff/2026-06-03-end-day.md`
