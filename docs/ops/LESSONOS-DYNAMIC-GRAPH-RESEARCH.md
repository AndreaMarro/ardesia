# LESSONOS-DYNAMIC-GRAPH-RESEARCH

> Ricerca sul **grafo dinamico** di LessonOS (crescita nel tempo da eventi).
> Sessione local-only. Stessa nota epistemica di `LESSONOS-MEMORY-ARCHITECTURE-RESEARCH`:
> claim su repo esterni = **[VERIFY-WEB]** (compito Codex), non verificati qui.

## Problema
Il grafo LessonOS non è statico: cresce da lezioni, appunti, materiali, manuali,
plugin, **errori**, esercizi, simulazioni, recap, student-pack. Serve:
- **incrementalità** (aggiungere un evento non ricalcola tutto);
- **temporalità** (quando un concetto è stato introdotto/corretto);
- **provenienza** (ogni arco cita evidenza);
- **query economiche** su client iPad.

## Pattern esaminati (epistemica marcata)
| Fonte | Cosa può servire | Cosa NON copiare |
|---|---|---|
| **Logseq** [VERIFY-WEB] | grafo da blocchi/backlink, local-first, file `.md` | UI/DB completo; a noi serve il modello, non l'app |
| **GUN** [VERIFY-WEB] | grafo distribuito/offline-first, CRDT | sync P2P = complessità non richiesta ora |
| **Graphiti / Neo4j** [VERIFY-WEB] | grafo temporale, query ricche | server esterno = anti local-first/iPad |
| **TerminusDB / QLever / JanusGraph** [VERIFY-WEB] | versioning/RDF/scala | pesanti, overkill per la prima slice |
| **AGENTiGraph** [VERIFY-WEB] | costruzione grafo da interazioni agente | accoppiato a LLM/agente |
| **RepoDoc / Codebase-Memory** [VERIFY-WEB] | grafo da artefatti + evidence refs file:riga | dominio-codice, adattare al dominio-lezione |
| **Prometheus** [VERIFY-WEB] | modello append/scrape series (ispirazione event log) | è metriche, non knowledge graph |

## Cosa può servire a LessonOS
- **CRDT/append-only** come principio (Logseq/GUN) → grafo derivabile, mai corrotto.
- **Backlink model** (Logseq) → archi bidirezionali cita/citato-da.
- **Evidence refs file:riga** (RepoDoc/Codebase-Memory) → allineato a CANON `provenance`.
- **Temporalità bi-temporale** (Graphiti, concettuale) → `introdotto_a` / `corretto_a` come attributi d'arco, senza adottare Neo4j.

## Cosa viola local-first / è troppo pesante
- Qualsiasi graph DB server-side come dipendenza runtime del client.
- Sync distribuito P2P (GUN) nella prima slice: risolve un problema che non abbiamo ancora.
- RDF/SPARQL completo (QLever/TerminusDB): potere espressivo non necessario per student-pack.

## Cosa è utile per iPad
- Grafo materializzato **in-process** (SQLite + indici), query O(vicinato) non O(grafo).
- Snapshot esportabile `.lesson` per portabilità tra device.

## Cosa è utile per FastAPI / MCP
- `graph.search` e `graph.neighbors(node, depth=1)` come tool read-only.
- Nessuna mutazione del grafo via MCP nella prima slice (MCP = adapter, non fonte di verità).

## Cosa va studiato (non deciso ora)
- Strategia di **incrementalità**: materializer che consuma solo delta di eventi.
- **Compaction**: quando cachare recall e quando invalidare.

## Cosa NON copiare
- App intere (Logseq) o framework agentici (AGENTiGraph) — solo i **modelli**.
- Licenze copyleft forti su codice che finirebbe nel marketplace ([VERIFY-WEB], stesso rischio AGPL di SceneForge).

## Micro-slice realistica (coerente con MEMORY-ARCHITECTURE)
- Riusare l'**event log** della slice memoria come unica sorgente.
- Aggiungere `neighbors(node, depth)` deterministico sul grafo materializzato.
- Un test su fixture: "aggiungo evento errore → nasce arco corregge tra esercizio e concetto".

## Decisione allineata
> Nessun graph DB esterno ora. **Event log + materialized graph + evidence refs + export/import.**
> Temporalità e provenienza come **attributi**, non come nuovo motore.
