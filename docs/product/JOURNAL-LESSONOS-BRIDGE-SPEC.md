# JOURNAL-LESSONOS-BRIDGE-SPEC — Contratto JournalEvent → LessonOsEvent

- **Status**: spec di contratto, zero codice. L'implementazione (`apps/studio/src/lessonos/journalBridge.ts`) è una slice separata, sbloccata SOLO dopo il merge di #24 (event-log) e #30 (projection).
- **Data**: 2026-07-03
- **Fonti** (lette firsthand):
  - `apps/studio/src/store/JournalRecorder.ts` (main) — tipi `JournalEvent`: `element.add/update/delete`, `t0`/`t1`, `math.insert`, `pdf.page.view`, `audio.chunk`; JSONL append-only in `raw/events.jsonl`.
  - `apps/studio/src/lessonos/eventlog.ts` (PR #24) — `LessonOsEvent` (6 kind), `EvidenceRef` `namespace:payload`, `assertEvidence` (evidence obbligatoria mai vuota, `eventlog.ts:74` nel DDL: `evidence TEXT NOT NULL`), disciplina append-only via `EventLogStore.append`.
  - `apps/studio/src/lessonos/teacherDashboardProjection.ts` (PR #30) — la projection consuma GIÀ i journal come counts per segmento (`counts: { elements, mathInserts, pdfPagesViewed, audioChunks }`), con finestre derivate SOLO da `lesson.started/ended`.
  - `docs/product/TEACHER-DASHBOARD-SPEC.md` §0 (PR #22) — cruscotto = projection read-only, MAI secondo store.
  - Commento cross-check su PR #27 (02jul sera) — Stage 4 ELABTutor deve usare l'event-log #24, non "export/import state".

## 0. Principio

Il journal della lavagna (`raw/events.jsonl`) e l'event-log LessonOS sono DUE log con
ruoli diversi che NON vanno fusi:

- **Journal** = telemetria grezza della board, alta frequenza, per-room, senza semantica
  didattica. Resta la fonte dei *counts* di attività.
- **Event-log LessonOS** = fatti didattici con provenienza (`evidence` obbligatoria),
  bassa frequenza, fonte unica della memoria didattica (niente grafo parallelo).

Il bridge promuove a `LessonOsEvent` SOLO ciò che ha semantica didattica certa e
deterministica. Tutto il resto resta journal-side e viene consumato dalla projection
come counts (come #30 già fa). Promuovere troppo = inquinare la memoria didattica con
rumore di board; promuovere con euristiche LLM = violare il canone zero-LLM del log.

## 1. Mapping normativo

| JournalEvent | Destino | Motivazione |
|---|---|---|
| `t0` / `t1` (pointer stroke) | **Finestre di attività DENTRO i segmenti `lesson.started`/`ended`** — mai eventi LessonOS propri | Un tratto di penna non è un fatto didattico; è densità di attività. La projection può derivare "minuti attivi" per segmento dai timestamp t0/t1, ma `startedAt/endedAt` vengono SOLO dagli eventi LessonOS (regola già in #30, `teacherDashboardProjection.ts:191-192`) |
| `element.add` / `element.update` / `element.delete` | **Counts Z2 per segmento** (`counts.elements`) — NON eventi LessonOS singoli | Troppo granulari (ogni onChange Excalidraw); un elemento board non mappa 1:1 su un concetto. Già implementato in #30 |
| `math.insert` | **Count** (`counts.mathInserts`) — NO `material.cited` | Una formula scritta a mano non cita alcun materiale identificabile; promuoverla richiederebbe interpretazione del LaTeX (=euristica). Resta count |
| `pdf.page.view` | **`material.cited`** con `evidence: ["manual:vol<N>:p<page>"]` **SOLO SE** la pagina è riconosciuta come pagina di un manuale registrato (vedi §2.3); altrimenti count (`counts.pdfPagesViewed`) | Unico caso con semantica didattica certa e deterministica: il docente sta mostrando la pagina X del manuale Y. Il riconoscimento è lookup su registry, zero inferenza |
| `audio.chunk` | **Count** (`counts.audioChunks`) | Il chunk audio è materia prima per pipeline future (trascrizione = fuori scope, LLM); come evento è solo attività |

## 2. Regole vincolanti del bridge

### 2.1 Evidence obbligatoria, mai vuota
Ogni `LessonOsEvent` prodotto passa da `assertEvidence` (`eventlog.ts`): il bridge
non costruisce MAI un evento con `evidence: []`. Per `material.cited` da
`pdf.page.view` l'evidence è `["manual:vol<N>:p<page>", "journal:pdf.page.view@<t>"]`
(fatto + provenienza journal, doppio ref).

### 2.2 Append-only, host-attributed, zero LLM
- Scrittura SOLO via `EventLogStore.append` (mai INSERT diretti, mai UPDATE/DELETE).
- Il bridge gira lato host (Studio), mai dentro un plugin: gli eventi che produce sono
  host-attributed. Un plugin che vuole scrivere fatti didattici passa dal canale
  `graph.*` RPC (host-attribuito, anti-forge), non da questo bridge.
- Zero LLM, zero euristiche non deterministiche: ogni mapping di §1 è una funzione
  pura dei dati journal + registry manuali.

### 2.3 Riconoscimento pagina manuale (per `material.cited`)
`pdf.page.view` porta solo `page`/`totalPages`, non l'identità del PDF. La promozione
richiede un `ManualRegistry` passato come input al bridge: mapping
`documento-PDF-aperto → { manualId: "manual:vol<N>", pageOffset }`. Se il documento
corrente non è nel registry (PDF qualunque caricato dal docente), NESSUN
`material.cited`: solo count. Il registry è configurazione esplicita, non inferenza.

### 2.4 Determinismo e idempotenza (dedup per journal offset)
- Firma: `bridgeJournalToLessonOs(journalEvents, opts) → LessonOsEvent[]` — funzione
  PURA: stesso input ⇒ stesso output, nessun clock interno (i `t` vengono dai journal).
- Idempotenza al replay: ogni evento promosso porta nell'evidence il ref
  `journal:<type>@<t>` (offset/timestamp del journal sorgente). Chi appende tiene un
  cursore (ultimo offset journal processato) e NON ri-appende eventi già promossi: il
  re-run del bridge sull'intero journal produce lo stesso insieme, il consumer ne
  appende solo la coda nuova. Nessun UPDATE: il dedup è del writer, il log resta
  append-only.

### 2.5 Room/finestra
I journal non portano ancora un room-id (nota in #30: `journalRoom` di input). Finché
`JournalRecorder` non registra il room, il bridge accetta `opts.room` esplicito e lo
usa per associare gli eventi promossi al segmento lezione corretto. Mai inventare room.

## 3. Cosa NON fa il bridge (anti scope-creep)

- NON crea `concept.introduced` / `error.observed` / `exercise.completed`: quelli
  nascono da superfici con semantica esplicita (plugin ELABTutor via `graph.*`,
  flussi esercizio), non dalla telemetria board.
- NON scrive nel journal (unidirezionale journal→LessonOS).
- NON è un materializer: il grafo resta derivato da `materializer.ts` sull'event-log.
- NON introduce un secondo store (canone #22 §0).

## 4. Sequencing implementazione

1. **Ora**: questa spec (docs-only, base main).
2. **Post-merge #24+#30**: `apps/studio/src/lessonos/journalBridge.ts` + test
   (funzione pura, ≤4 file, test 3×). Se implementata prima, la slice è stacked
   sulla catena #24 e va dichiarata tale nella PR.
3. **Dopo**: cablaggio runtime (chi chiama il bridge e quando — a fine lezione al
   `lesson.ended`, o incrementale al flush del journal) = decisione separata, con
   vincolo iPad/WebKit: la persistenza dell'event-log deve sopravvivere alla
   eviction di WebKit (`navigator.storage.persist()` + Home-Screen install come
   requisito P0, dal report deep-research 02jul).
