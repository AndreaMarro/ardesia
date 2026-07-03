# CHATGPT-APPS-MCP-INTEGRATION

> Spec **prodotto** dell'integrazione ChatGPT Apps / MCP di ARDESIA.
> Complementare a `FASTAPI-INTEGRATION-GATEWAY.md` e a
> `docs/ops/FASTAPI-CHATGPT-MCP-GATEWAY.md`. Non implementare qui — specificare.

## Principio
ChatGPT Apps e MCP sono **adapter di superficie**, non fonte di verità.
Espongono un sottoinsieme delle capacità del gateway FastAPI come **tool**.
La verità resta nel Core ARDESIA + LessonOS (local-first). MCP runtime **non**
entra nella prima slice di UserAIOS/memoria (vedi `PER-USER-AIOS-CRITICAL-ANALYSIS`).

## Tool MCP / ChatGPT (mappa, MVP marcato)
| Tool | Backing endpoint | Fase |
|---|---|---|
| `graph_search` | `POST /graph/search` | **MVP** |
| `get_student_pack` | `GET /student-pack/{id}` | **MVP** |
| `solve_circuit` | `POST /circuit/solve` | futuro |
| `generate_exam` | `POST /exam/generate` | futuro |
| `open_lesson` | `POST /lesson/open` | futuro |
| `mount_plugin` | `POST /plugin/mount` (firma host) | futuro |
| `export_pdf` | `POST /export/pdf` | futuro |

## Regole di sicurezza
- **No segreti lato client / nel manifest dell'app.**
- Tool **read-only** nella prima fase (nessuna mutazione grafo via MCP).
- `mount_plugin` disponibile solo dietro verifica firma ed25519 dell'host — mai bypass.
- Ogni tool dichiara scope (studente/docente) e non attraversa i confini di tenant.

## MVP vs futuro
- **MVP:** `graph_search` + `get_student_pack`, read-only, deterministici.
- **Futuro:** solve/exam/open/mount/export, auth, quota, audit log.

## Multilingua
- I tool devono accettare/propagare la **lingua** (multilingua nativo è requisito Core).
- Le risposte non devono hardcodare l'italiano.

## Rischi
- Trattare MCP come sorgente autorevole → drift dallo stato locale (già visto con AgentMemory recall low-signal). MCP = adapter.
- Esporre troppa superficie prima di stabilizzare i contratti del gateway.

## TODO prima di implementare
- Congelare i contratti `graph_search` / `get_student_pack`.
- Definire il manifest ChatGPT App (nome tool, descrizioni, scope) — **[VERIFY-WEB]** requisiti attuali ChatGPT Apps/MCP (compito Codex).
