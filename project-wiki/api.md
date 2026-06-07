# API HTTP — FastAPI minimale (M6-task2, opzionale PLAN §15)

> FastAPI endpoint che espone la pipeline demo su HTTP.

## Endpoint

### `GET /health`
Health check strutturato: restituisce `{"status": "ok", "version": "0.1.0"}`.

**Esempio:**
```bash
curl http://localhost:8000/health
```

### `POST /paths/demo`
Esegue l'intera pipeline demo sul percorso sintetico `fixtures/sample_path` e restituisce JSON strutturato con 6 sezioni:

- `path` — dati del percorso caricato (id, title, subject, lesson_ids)
- `capsules` — array di 3 Lesson Capsule (timeline topic + concepts + exercises + questions + homework, con citazioni grounded)
- `memory` — Path Memory aggregata (7 concetti canonici, lesson_index, exercise_bank)
- `delta` — Didactic Delta (L1+L2 vs L1+L2+L3: 3 concetti nuovi)
- `debt` — Learning Debt Ledger (item per categoria)
- `plan` — Next Lesson Plan (agenda prioritizzata: prerequisiti > review > dubbi > pratica > nuovo)

**Esempio:**
```bash
curl -X POST http://localhost:8000/paths/demo | jq '.path.title'
```

## Implementazione

- `lessonos/api.py` — FastAPI app + `run_demo_pipeline()` helper + `_serialise()` per dataclass frozen + MappingProxyType
- `lessonos/cli.py:_LESSON_MOCKS` — mock payload deterministici per il router LLM
- `lessonos/cli.py:_build_router()` — costruisce il router mock per una lezione

Tutti i dati sono mock (deterministici, zero chiamate LLM reali). La pipeline interna è identica a `lessonos/cli.py:run_path()` ma restituisce oggetti strutturati invece di stamparli.

## Running

```bash
uv run uvicorn lessonos.api:app --port 8000
```

## Dipendenze

- `fastapi` — framework HTTP
- `uvicorn[standard]` — server ASGI
- `httpx` (dev) — TestClient per i test
