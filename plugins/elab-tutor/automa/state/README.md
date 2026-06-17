# automa/state/

Stato runtime della triade Planner/Generator/Evaluator e del benchmark oggettivo.

## File persistenti

| File | Scritto da | Uso |
|------|------------|-----|
| `benchmark.json` | `scripts/benchmark.cjs --write` | Ultimo score oggettivo (10 metriche pesate) |
| `PLANNER-NOTES.md` | planner agent | Memoria cross-sessione del planner |
| `revert-log.txt` | evaluator agent | Log dei revert automatici con motivo |
| `unlim-latency.log` | probe script (TODO) | Latenze Render /chat, una per riga, ms |

## File temporanei (generati per sessione)

| Pattern | Significato |
|---------|-------------|
| `PLANNER-IDLE-*.md` | Planner non ha trovato task; stato passato |
| `BLOCKED-*.md` | Generator si è bloccato; serve intervento umano |
| `FAILED-ATOM-*.md` | Task fallito con diagnosi |

## Comando quick-status

```bash
cat automa/state/benchmark.json | jq '{score, delta, timestamp, commit_sha}'
ls -la automa/tasks/pending automa/tasks/active automa/tasks/done | head
```
