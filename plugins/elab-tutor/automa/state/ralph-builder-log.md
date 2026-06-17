# Ralph Loop — Builder Log

Log append-only di ogni run del ralph-builder.
Formato per ogni entry: timestamp, task, commit SHA, test count pre/post, build status, note.

## 2026-04-18T08:47Z — BOOTSTRAP (sessione interactive Claude)

- **Task:** bootstrap infrastruttura Ralph Loop avversariale
- **Commits totali sessione:** 4 (59e8fce, 8293e3f, 927cdbd, 62c9702)
- **Baseline iniziale:** 11983 test PASS
- **Baseline corrente:** 12039 test PASS (+56 comportamentali)
- **Build:** PASS (precache ~4785 KiB)
- **Zero regressioni confermate**
- **Next action:** primo fire automatico del builder al prossimo slot cron

## Protocollo per builder

Ogni run APPEND in cima (sotto questo header fisso) con:

```
## YYYY-MM-DDThh:mmZ — <task-id>

- Task scelto: <descrizione>
- Commit: <sha>
- Test: <n>/<n> PASS (baseline >=12039)
- Build: PASS/FAIL
- File toccati: <elenco>
- Note: <blocchi/decisioni>
```
