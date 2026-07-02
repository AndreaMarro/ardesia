# FASTAPI-INTEGRATION-GATEWAY

> Spec **prodotto** del gateway di integrazione FastAPI di ARDESIA.
> Complementare a `docs/ops/FASTAPI-CHATGPT-MCP-GATEWAY.md` (ops, 193 righe):
> questo è il livello prodotto/confine; l'altro è operativo. Non implementare
> backend qui — **specificare prima**.

## Ruolo
FastAPI è **integration gateway**, non il core. Espone verso l'esterno
(ChatGPT Apps, MCP, LMS, Moodle, Teams) capacità che vivono nel Core ARDESIA
e in LessonOS. **Il gateway non è fonte di verità**: legge/orchestra, non possiede stato.

## Confini (non negoziabili)
- **No segreti nel frontend.** Chiavi/token solo server-side.
- **MCP/ChatGPT = adapter**, non owner del grafo o della memoria.
- Il gateway **non muta** il grafo LessonOS nella prima fase (read-mostly).
- Auth: **futura**, non nella prima slice (vedi sotto).

## Endpoint (mappa futura, MVP marcato)
| Endpoint | Cosa fa | Fase |
|---|---|---|
| `POST /graph/search` | ricerca sul materialized graph (scope studente/docente) | **MVP** |
| `GET  /student-pack/{id}` | export student-pack (artefatto) | **MVP** |
| `POST /circuit/solve` | risolve circuito DC confermato → passi + PDF LaTeX | futuro |
| `POST /exam/generate` | ExamForge: blueprint → prova nuova + soluzioni | futuro |
| `POST /lesson/open` | apre/monta una `.lesson` | futuro |
| `POST /plugin/mount` | monta plugin via host (firma verificata) | futuro |
| `POST /export/pdf` | export PDF di materiale/recap | futuro |

## MVP vs futuro
- **MVP:** `graph.search` + `student-pack` in **read-only**, deterministici, senza auth (dietro rete locale/dev).
- **Futuro:** solve/exam/mount/export + auth + rate-limit + multi-tenant docente.

## Rischi
- Esporre `plugin/mount` senza verifica firma = bypass del kernel sicurezza host → **vietato**.
- Accoppiare il gateway alla forma interna del grafo → rompe local-first. Esporre **contratti**, non tabelle.

## TODO prima di implementare
- Definire schema risposta `graph.search` (contratto stabile).
- Decidere formato student-pack export (già primitivo `study-pack route` esistente — riusare).
