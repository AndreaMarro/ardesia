# LESSONOS-MEMORY-ARCHITECTURE-RESEARCH

> Ricerca architetturale sulla **memoria di LessonOS**. Sessione local-only.
> **Nota epistemica:** i pattern dei repo esterni qui sotto derivano da conoscenza
> pregressa e NON sono stati verificati leggendo i loro sorgenti in questa sessione.
> Ogni claim su licenza/API/versione è marcato **[VERIFY-WEB]** → compito Codex.

## Anchor verificati localmente (da CANON-INDEX)
- **AgentMemory = cache, NON fonte di verità.** `recall@10` live floor **≈0.21** (`moat_gate.py`, `~/lessonos`) — il `0.23` del vision è MISMATCH.
- **Memoria-per-studente-persistita = greenfield.** Esistono solo primitivi parziali (PDF board, study-pack route, `intentSchema` isolato, `VolumeCitation` ELAB-only).
- Local-first è vincolo di prodotto (README MATCH).

## Requisito di LessonOS (cosa deve fare la memoria)
Trasformare **eventi** (lezione, appunti, materiali, plugin usati, errori,
esercizi, simulazioni, recap) in un **grafo di conoscenza per studente/docente**
che: (a) cresce nel tempo, (b) è interrogabile, (c) produce **student-pack**,
(d) cita evidenza (`evidence refs` → file:riga / lesson-id), (e) è esportabile.

## Pattern esaminati (epistemica marcata)
| Fonte | Pattern utile a LessonOS | Rischio / da non copiare |
|---|---|---|
| **TencentDB-Agent-Memory** [VERIFY-WEB] | separazione memory-write vs recall; scoring recall | dipendenza DB esterno pesante; non local-first |
| **OpenHuman** [VERIFY-WEB] | modello profilo/preferenze longitudinale | scope OS-completo = overengineering per noi |
| **AIOS** [VERIFY-WEB] | kernel come projection layer sopra eventi | "vero OS" = fuori scope (vedi PER-USER-AIOS) |
| **aiox-core** [VERIFY-WEB] | store eventi + adapter | accoppiamento a runtime agentico |
| **Letta (ex MemGPT)** [VERIFY-WEB] | memoria gerarchica core/archival, self-editing | LLM-in-the-loop nella memoria = NO nella prima slice |
| **mem0** [VERIFY-WEB] | estrazione fatti + dedup + recall | dipendenza da LLM per estrazione; licenza [VERIFY-WEB] |
| **Graphiti** [VERIFY-WEB] | grafo temporale bi-temporale | richiede Neo4j → pesante per iPad/local |

## Cosa serve a LessonOS
- **Event log append-only** (SQLite locale) come sorgente di verità.
- **Materialized graph** derivato (nodi: lesson/nota/materiale/errore/esercizio; archi: cita/deriva-da/corregge).
- **Evidence refs** obbligatori su ogni nodo (no fatti senza provenienza → coerente con CANON `provenance`).
- **Export/import** `.lesson` per portabilità.
- **AgentMemory come cache di recall**, ricostruibile dall'event log.

## Cosa è overengineering (per ARDESIA, ora)
- Graph DB esterno (Neo4j/JanusGraph/TerminusDB) come dipendenza runtime → viola local-first / iPad.
- LLM dentro il path di scrittura memoria → non deterministico, costoso, non offline.
- Secondo grafo parallelo a LessonOS → esplicitamente vietato.

## Cosa è utile per iPad
- SQLite locale (già disponibile lato client via WASM/native) + grafo materializzato in memoria.
- Recall pre-calcolato/cachato, non query grafo live pesante.

## Cosa è utile per FastAPI/MCP
- Endpoint `graph.search(query, scope=student)` che legge il materialized graph.
- Export student-pack come artefatto (no stato mutabile esposto).

## Decisione iniziale (consigliata, salvo evidenze locali contrarie)
> **NON** introdurre subito un graph DB esterno.
> Usare **event log (SQLite) + materialized graph + evidence refs + export/import**.
> **AgentMemory = cache**, ricostruibile, non fonte di verità.
> Zero LLM nel path di memoria nella prima slice.

## Micro-slice realistica (≤5 file, zero LLM, zero MCP runtime)
1. `event log` schema + append API (SQLite).
2. `materializer` eventi→nodi/archi (funzione pura, testabile).
3. `evidence ref` type + validazione (no nodo senza provenienza).
4. `recall` che legge il grafo materializzato (deterministico).
5. test unit del materializer su un fixture di eventi.

**Precondizione:** verificare che esistano `apps/studio/src/store` e un WorkspaceStore
prima di implementare. Se incerto → context packet, non codice.

## TODO web (Codex)
- [VERIFY-WEB] licenze reali di Letta / mem0 / Graphiti / TencentDB-Agent-Memory (trap AGPL come per SceneForge).
- [VERIFY-WEB] se OpenHuman/AIOS espongono un projection-layer riusabile senza pull-in dell'intero framework.
