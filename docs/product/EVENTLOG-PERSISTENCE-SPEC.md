# EVENTLOG-PERSISTENCE-SPEC — Persistenza dell'event-log LessonOS, iPad-first

- **Status**: spec di prodotto/architettura, zero codice applicativo. Il binding SQLite
  (scelta libreria WASM e sua introduzione come dipendenza) resta **GATE ANDREA ⑦**:
  questa spec lo prepara, non lo decide.
- **Data**: 2026-07-03
- **Fonti codice** (lette firsthand):
  - `apps/studio/src/lessonos/eventlog.ts` (PR #24) — contratto `EventLogStore`
    (`append`/`readAll`), `InMemoryEventLog`, `EVENT_LOG_DDL` (schema SQLite come
    contratto di persistenza), disciplina append-only, `assertEvidence`.
  - `apps/studio/src/lessonos/materializer.ts`, `recall.ts` (PR #24) — consumer puri:
    `materialize(events)` prende `readonly AppendedEvent[]`, `neighbors(graph,…)`
    lavora sul grafo derivato. Nessuno dei due conosce lo store.
  - `apps/studio/src/store/WorkspaceStore.ts` + `drivers/fsa.ts` +
    `drivers/localStorage.ts` (main) — lo storage attuale della lavagna.
  - `docs/product/JOURNAL-LESSONOS-BRIDGE-SPEC.md` (PR #34) — §4.3: il cablaggio
    runtime del bridge ha come vincolo che "la persistenza dell'event-log deve
    sopravvivere alla eviction di WebKit".
  - `docs/product/TEACHER-DASHBOARD-SPEC.md` (PR #22) — §0: event log
    "`raw/events.jsonl` oggi, SQLite domani"; projection mai secondo store.
  - `docs/ops/DEEP-RESEARCH-LESSONOS-SIM-ELABTUTOR-20260702.md` (PR #32) — claim
    OPFS/persistence **ora verificati firsthand** in §7 (il report stesso dichiarava
    "No benchmark was run for … OPFS" per rate-limit).
- **Fonti web**: elenco completo con verdetti in §7. Ogni affermazione su
  browser/persistenza in questa spec cita una fonte di §7; dove le fonti tacciono,
  la spec lo dice esplicitamente.

---

## 1. Problema

L'event-log LessonOS (#24) è **l'unica fonte di verità della memoria didattica**:
grafo e cruscotto sono viste materializzate riderivabili da zero. Oggi l'unica
implementazione è `InMemoryEventLog`: **al reload della pagina la memoria didattica
sparisce**. Finché il log è volatile, il bridge journal→LessonOS (#34) e la
projection docente (#30/#22) producono memoria che non supera una lezione.

Il contesto d'uso P0 è il **docente su iPad** (LIM in classe + iPad a casa, personas
P1/P2 di #22), incluso l'uso come web-app installata su Home Screen. Su
iPad/WebKit valgono vincoli specifici e documentati:

1. **Niente File System Access API** (`showDirectoryPicker`): non supportata da
   Safari in nessuna versione, desktop o iOS (fonte F10). Il percorso FSA del
   WorkspaceStore attuale non esiste su iPad.
2. **Storage best-effort evictable**: senza `navigator.storage.persist()` l'origin
   è soggetto a eviction LRU sotto pressione di quota (F7) e — con la protezione
   anti-tracking attiva — alla **cancellazione ITP dello storage script-writable
   dopo 7 giorni d'uso di Safari senza interazione col sito** (F8, F9).
3. **localStorage ~5 MB**: il fallback attuale del WorkspaceStore; il commento nel
   driver stesso lo definisce "il limite REALE che oggi tronca le scene".

Requisito: un backend `EventLogStore` **persistente, append-only, iPad-first**, che
sostituisca `InMemoryEventLog` **senza cambiare materializer né recall**, con
recovery e compaction che non perdano mai la provenance (`evidence`).

### 1.1 Come funziona oggi il WorkspaceStore (per confronto)

`apps/studio/src/store/WorkspaceStore.ts` seleziona un driver:

- **FSA** (`drivers/fsa.ts`): `showDirectoryPicker()` su gesto utente
  (`connectFolder()`), cartella con `raw/` (immutabile, include
  `raw/events.jsonl` del JournalRecorder) e `derived/` (rigenerabile). Solo
  Chromium (Chrome/Edge 105+, F10); commento nel file: "Chrome 86+".
- **localStorage** (`drivers/localStorage.ts`): cache/fallback sempre disponibile,
  binari in base64, quota ~5 MB. `init()` parte SEMPRE da qui, in silenzio.
- **Bundle `.lesson`** (`zipBundle.ts`/`lessonBundle.ts`): export/import esplicito —
  il percorso di recovery visibile all'utente.

Su iPad quindi lo stato attuale è: **localStorage 5 MB + export manuale**. È
esattamente il buco che questa spec chiude per l'event-log.

---

## 2. Opzioni

Premessa architetturale valida per tutte: il VFS `opfs` "classico" di sqlite-wasm
richiede `SharedArrayBuffer` e quindi header **COOP/COEP** sull'intera pagina (F1).
COEP `require-corp` è incompatibile con l'architettura ToolHost di ARDESIA (plugin
montati in iframe sandbox a origin opaca / srcdoc single-file, gotcha canonico
opaque-origin): imporrebbe vincoli CORP/CORS su ogni subresource dei plugin. Il VFS
`opfs` con COOP/COEP è quindi **escluso a priori**, indipendentemente dal browser.

### Opzione A — IndexedDB nativo, log append-only (senza SQLite)

Un object store IndexedDB `lessonos_events` con chiave `seq` autoincrementale e
record `{ seq, t, kind, payload, evidence }` — la trasposizione 1:1 di
`EVENT_LOG_DDL`. Zero dipendenze nuove, nessun binding WASM.

**Pro**
- Funziona su Safari/iPadOS oggi, nessun requisito di header, nessun gate: è
  l'unica opzione spedibile subito senza decisione ⑦.
- Quota reale: fino al 60% del disco per origin nei browser (80% complessivo),
  15%/20% per web-app standalone WebKit (F7) — ordini di grandezza sopra i 5 MB
  di localStorage; per un log di eventi didattici a bassa frequenza (#34 §0) è
  abbondante per anni.
- Append-only naturale (`add`, mai `put` su chiavi esistenti); transazionale;
  utilizzabile da più tab (IndexedDB è multi-contesto).
- Stessa classe di durabilità di OPFS su WebKit: entrambi storage script-writable
  best-effort, stessa policy di eviction (F7, F9) — su iPad **non si perde
  durabilità scegliendo IndexedDB invece di OPFS**; si perde solo SQL.

**Contro**
- Niente SQL: query = scan + filtro in JS. Irrilevante per questa slice (il
  materializer fa comunque `readAll()` + replay completo), diventa un limite solo
  quando il log sarà grande abbastanza da volere query indicizzate lato storage.
- Non è il contratto finale: #24 dichiara lo schema SQLite come contratto di
  persistenza; IndexedDB è un backend-ponte che rispetta lo stesso contratto
  logico (stessi campi, stessa disciplina) ma richiederà una migrazione (§6).
- Performance su dataset grossi peggiore di OPFS+SQLite (F3: IDB-based VFS degrada
  oltre ~100 MB) — soglia lontanissima dal caso d'uso.

### Opzione B — OPFS + sqlite-wasm con VFS `opfs-sahpool`

Il backend "vero" previsto da #24: SQLite WASM sul thread di un Worker dedicato,
database su OPFS via **`opfs-sahpool`** (SyncAccessHandle Pool VFS).

**Fatti verificati (Fase 1, §7):**
- `opfs-sahpool` **non richiede COOP/COEP né SharedArrayBuffer** e "should work on
  all major browsers released since March 2023"; su Safari funziona da **16.4+**
  (F1) — quindi compatibile con Safari/iPadOS attuali (2026) e con l'hosting
  statico Vercel senza header speciali, e non confligge con gli iframe ToolHost.
- Limite strutturale: "does not support multiple simultaneous connections" —
  **una sola connessione/contesto per volta**; un secondo tab che apre lo stesso
  DB fallisce (F1, F2). Serve un single-writer guard (Web Locks) lato app.
- Il VFS `opfs` classico richiede COOP/COEP + SharedArrayBuffer e Safari ≥17 (F1):
  escluso (vedi premessa).
- **Safari in navigazione privata non supporta OPFS** (F3): serve comunque il
  fallback (A o InMemory + export).
- Manutenzione: build ufficiale del team SQLite, doc di persistenza aggiornata
  con test 2026-03 (F1); pacchetto npm `@sqlite.org/sqlite-wasm`.

**Pro**
- È il contratto di persistenza dichiarato in #24 (`EVENT_LOG_DDL` eseguito così
  com'è); indici `kind`/`t` reali; pronto per query future del cruscotto.
- Prestazioni OPFS sync-access ("easily the highest OPFS performance", F1).

**Contro**
- **GATE ANDREA ⑦**: introduce una dipendenza WASM (~1 MB+) e la scelta di
  libreria. Non spedibile prima della decisione.
- Single-connection: richiede disciplina single-writer host-side (comunque già
  coerente con "il bridge gira lato host", #34 §2.2).
- Niente OPFS in private browsing su Safari (F3): fallback obbligatorio.
- Stessa evictability WebKit di IndexedDB (F7): non compra durabilità extra.

**Alternativa nello stesso slot**: `wa-sqlite` (MIT dal 2023-02, attivo, v1.1.1 del
2026-04-23; `OPFSCoopSyncVFS` = multi-connessione multi-tab senza COOP/COEP, F3,
F5). È la raccomandazione generale 2026 di PowerSync (F3). Resta materiale per la
decisione ⑦: build ufficiale SQLite (manutenzione = team SQLite, un solo vendor)
vs wa-sqlite (multi-tab, ecosistema VFS più ricco, manutentore singolo).
**`sql.js` è escluso**: mantenuto (v1.14.1, 2026-03-04, F4) ma **solo in-memory,
nessun supporto OPFS nativo** (F4) — sarebbe un `InMemoryEventLog` più pesante.

### Opzione C — File System Access come il WorkspaceStore attuale

Persistere il log come file (JSONL o .db) in una cartella scelta con
`showDirectoryPicker`, riusando `drivers/fsa.ts`.

**Pro**
- File visibili all'utente, fuori dallo storage evictable del browser: durabilità
  eccellente su desktop Chromium; percorso già collaudato dal journal
  (`raw/events.jsonl`).

**Contro — squalificante per P0**
- **Safari non supporta la File System Access API in nessuna versione (3.1→26.5+,
  F10)**; Firefox nemmeno. Su iPad l'opzione semplicemente non esiste.
- Richiede gesto utente e ri-concessione permessi; UX estranea al flusso lezione.

Resta valida come **canale di export** su desktop Chrome (il log serializzato entra
in `raw/` accanto a `events.jsonl`), non come backend primario.

---

## 3. Raccomandazione

1. **Ora (nessun gate): Opzione A** — `IndexedDbEventLog` che implementa
   `EventLogStore` (§5), zero dipendenze, dietro una factory con fallback
   `InMemoryEventLog` (test/SSR/private-browsing). Chiude subito la perdita al
   reload su iPad, che è il danno P0. Su iPad, IndexedDB e OPFS hanno la stessa
   classe di eviction (F7, F9): rimandare l'attesa di SQLite non costa durabilità.
2. **Dopo (GATE ANDREA ⑦): Opzione B** — sqlite-wasm ufficiale con `opfs-sahpool`
   in Worker dedicato + Web Locks single-writer; `wa-sqlite/OPFSCoopSyncVFS` come
   alternativa se il multi-tab si rivela requisito reale. Migrazione da A per
   replay ordinato (§6), possibile perché il contratto logico (campi/disciplina)
   è identico.
3. **Sempre**: `.lesson` bundle come recovery path esplicito (già canone #32:
   "keep explicit export/import") — lo snapshot dell'event-log entra nel bundle.
   L'Opzione C resta solo come destinazione di export su desktop Chromium.

Motivazione in una riga: **su WebKit nessun backend browser-storage è "durabile per
davvero" (§4), quindi la scelta del backend ottimizza contratto e query, non
durabilità — e allora conviene spedire subito il backend senza gate (A) e riservare
il gate ⑦ al backend con il contratto giusto (B).**

---

## 4. Requisito P0 — `navigator.storage.persist()` + Home Screen su iPad

Cosa le fonti **garantiscono davvero** (niente wishful thinking):

| Meccanismo | Cosa garantisce (fonte) | Cosa NON garantisce |
|---|---|---|
| `navigator.storage.persist()` concesso | L'origin è escluso dall'**eviction LRU/quota** ("origin might be excluded from eviction if … its storage is in persistent mode", F7). Su Safari 17+/iOS 17+ la Storage API è pienamente supportata (F7). | **Nessuna fonte primaria afferma che protegga dalla cancellazione ITP dei 7 giorni** (F9 descrive le due policy separatamente; verdetto claim 3: INCERTO su questo punto). Trattare come NON protetto. |
| Concessione di `persist()` su WebKit | Automatica, senza prompt, "based on heuristics like whether the website is opened as a Home Screen Web App" (F7). Nessuna garanzia che venga concessa nel browser. | Non è richiedibile con certezza: può essere negata silenziosamente. |
| Web-app su Home Screen | "Not part of Safari and thus have their own counter of days of use … which resets the timer. **We do not expect** the first-party … to have its website data deleted" (F8, 2020, mai revocato). Quota identica al browser (F7). Episodio EU feb-2024 (rimozione Home-Screen web-app) **rientrato** il 2024-03-01: restano WebKit standalone anche in EU (F11). | "We do not expect" ≠ garanzia contrattuale; nessuna fonte primaria post-2023 ri-afferma esplicitamente l'esenzione per iPadOS 18/19+ (verdetto claim 4: VERIFICATO con riserva). #32 lo dice già: "do not claim Home Screen install prevents eviction". |

**Requisiti normativi P0** (coerenti con l'acceptance già scritta in #32):

1. **Preflight storage** all'avvio workspace: `navigator.storage.estimate()` +
   `persisted()`; se false, chiamare `persist()` **in un momento di chiara
   interazione utente** (primo `lesson.started`); registrare il risultato nel
   capability snapshot. Mai bloccare la lezione sull'esito.
2. **Prompt di installazione Home Screen** su iPad come *raccomandazione* UX
   (aumenta sia l'euristica di concessione di `persist()` (F7) sia il contatore
   d'uso proprio (F8)), mai presentata come garanzia di durabilità.
3. **Export come unica durabilità vera**: al `lesson.ended` (o al flush del
   journal) lo snapshot dell'event-log è incluso nel `.lesson` bundle; la UI
   degrada a "export consigliato" se `persist()` negato o quota bassa — linguaggio
   docente ("salvato / da esportare"), niente vocabolario OPFS (#32).
4. **Telemetria di perdita**: alla riapertura, se il log atteso non c'è (eviction
   avvenuta), l'evento va reso visibile ("memoria della lezione non trovata,
   ripristina da export"), mai silenzioso.

---

## 5. Interfaccia `EventLogStore` persistente

Il contratto #24 resta **intatto**: `append`/`readAll` sono l'intera superficie
vista da materializer (che riceve `AppendedEvent[]`) e recall (che riceve il grafo).
Un backend persistente implementa `EventLogStore` così com'è; le capacità di
persistenza sono un'estensione **opzionale** che nessun consumer didattico usa.

```ts
// Tipi esistenti da apps/studio/src/lessonos/eventlog.ts (PR #24) — INVARIATI:
//   LessonOsEvent, AppendedEvent (= LessonOsEvent & { readonly seq: number }),
//   EventLogStore { append(e): Promise<AppendedEvent>; readAll(): Promise<AppendedEvent[]> }

/** Esito dell'apertura/recovery del log persistente. */
export interface RecoveryReport {
  /** Eventi validi recuperati (ordine seq, contiguo). */
  recovered: number
  /** Ultimo seq valido; il prossimo append usa lastSeq + 1. */
  lastSeq: number
  /**
   * Record scartati in coda perché incompleti/corrotti (torn write al crash).
   * SOLO record in coda: un buco in mezzo alla sequenza è corruzione,
   * non recovery → `corrupted: true` e il chiamante propone il restore da export.
   */
  droppedTail: number
  corrupted: boolean
}

export interface CompactionReport {
  /** DEVE valere: eventsBefore === eventsAfter (vedi invarianti). */
  eventsBefore: number
  eventsAfter: number
  bytesBefore: number
  bytesAfter: number
}

/** Estensione persistente: additiva, i consumer #24 continuano a vedere EventLogStore. */
export interface PersistentEventLogStore extends EventLogStore {
  /** Apre lo storage, verifica integrità, ricostruisce lastSeq. Idempotente. */
  open(): Promise<RecoveryReport>
  /** Durabilità esplicita (no-op dove ogni append è già durable). */
  flush(): Promise<void>
  /** Snapshot JSONL dell'intero log (una riga = un AppendedEvent) per il .lesson bundle. */
  exportSnapshot(): Promise<Blob>
  /**
   * Import per restore/migrazione: accetta SOLO su log vuoto, preserva i seq
   * originali. Mai merge su log non vuoto (i seq collidono = corruzione).
   */
  importSnapshot(snapshot: Blob): Promise<RecoveryReport>
  /**
   * Compaction PER COPIA (nuovo segmento/tabella + swap atomico), mai in-place —
   * come da commento normativo in EVENT_LOG_DDL (#24).
   */
  compact(): Promise<CompactionReport>
  close(): Promise<void>
}
```

**Invarianti (normative, testabili):**

1. **Append-only**: nessun metodo muta o cancella eventi; `compact()` riscrive lo
   storage, mai il contenuto logico.
2. **Provenance intatta**: per ogni evento, `{seq, t, kind, payload, evidence}`
   sopravvive byte-identico a recovery, export→import e compaction. Test canonico:
   `materialize(await store.readAll())` produce lo stesso grafo (deep-equal) prima
   e dopo ciascuna operazione. **`eventsBefore === eventsAfter` sempre**: la
   compaction recupera spazio fisico (pagine morte, overhead), non "pota" eventi.
   Un'eventuale politica di archiviazione (spostare lezioni chiuse su export) è
   un'operazione utente esplicita FUORI da questa interfaccia, non decisa qui.
3. **`seq` monotono e persistito**: dopo `open()`, il primo `append` usa
   `lastSeq + 1`; mai riuso di seq, nemmeno dopo crash (in SQLite:
   `AUTOINCREMENT` già lo garantisce; in IndexedDB: key generator nativo, che non
   riusa chiavi).
4. **Validazione identica a #24**: `append` passa da `assertEvidence` e dal check
   su `t` PRIMA di scrivere; un evento invalido non tocca lo storage.
5. **Recovery conservativa**: si scarta solo la coda torn-write (`droppedTail`);
   buchi interni ⇒ `corrupted: true`, il log non si "ripara" inventando.
6. **Single-writer**: un solo contesto scrive (Web Locks `lessonos-eventlog` come
   guardia); i backend che non supportano più connessioni (`opfs-sahpool`, F1)
   falliscono `open()` con errore chiaro nel secondo contesto, mai comportamento
   silenzioso.
7. **Sostituzione drop-in**: `InMemoryEventLog` continua a soddisfare
   `EventLogStore`; il cablaggio avviene in una factory
   (`createEventLogStore(): Promise<EventLogStore>`) — materializer, recall,
   bridge (#34) e projection (#30) non cambiano di una riga.

---

## 6. Piano di migrazione da `InMemoryEventLog`

| Fase | Contenuto | Gate |
|---|---|---|
| **0 — Spec** | Questo documento. | — |
| **1 — IndexedDB (Opzione A)** | `IndexedDbEventLog implements PersistentEventLogStore` (object store = trasposizione di `EVENT_LOG_DDL`); factory con feature-detect e fallback `InMemoryEventLog`; preflight `persist()` + capability snapshot (§4); `exportSnapshot` nel `.lesson` bundle. Test: invarianti §5 + parity-suite contro `InMemoryEventLog` (stessi input ⇒ stesso `readAll()` ⇒ stesso grafo). | Nessuno (zero dipendenze). Slice post-merge #24; se prima, dichiarata stacked su #24. |
| **2 — Cablaggio consumer** | Bridge #34 e projection #30 leggono dalla factory; policy di flush (al `lesson.ended` e a intervalli); UX "salvato/da esportare". | Post-merge #24+#30 (stesso sequencing di #34 §4). |
| **3 — SQLite WASM (Opzione B)** | Scelta libreria (raccomandata: `@sqlite.org/sqlite-wasm` + `opfs-sahpool`; alternativa `wa-sqlite/OPFSCoopSyncVFS`, dossier in §2-B); Worker dedicato; Web Locks single-writer; `EVENT_LOG_DDL` eseguito verbatim. | **GATE ANDREA ⑦** (binding SQLite = decisione umana). |
| **3a — Migrazione dati** | Alla prima apertura del backend SQLite: se IndexedDB non vuoto e SQLite vuoto ⇒ `importSnapshot(exportSnapshot())` (replay ordinato, seq preservati) ⇒ verifica `count` + deep-equal del grafo materializzato ⇒ solo allora l'origine IndexedDB è marcata `migrated` (non cancellata: resta come backup finché l'utente non esporta). Fallimento verifica ⇒ si resta su IndexedDB, zero perdita. | Dentro fase 3. |
| **4 — Compaction/scala** | Attivazione `compact()` su soglia; eventuale archiviazione per-lezione su export (decisione separata, vedi invariante 2). | Decisione separata, non questa spec. |

Rollback per ogni fase: la factory sceglie il backend con una precedenza
configurabile; tornare a una fase precedente = cambiare la precedenza. Nessuna fase
cancella i dati della precedente prima della verifica di cui sopra.

---

## 7. Fonti (accesso: 2026-07-03) e verdetti sui claim #32

### Verdetti richiesti (Fase 1)

| # | Claim | Verdetto | Fonti |
|---|---|---|---|
| 1 | `opfs-sahpool` compatibile Safari/iPadOS attuale, senza COOP/COEP né SharedArrayBuffer; limite un-contesto-per-volta | **VERIFICATO** — "does not require COOP/COEP HTTP headers", Safari 16.4+, "does not support multiple simultaneous connections". Caveat nuovo: niente OPFS in Safari private browsing | F1, F2, F3 |
| 2 | sql.js vs wa-sqlite vs sqlite-wasm ufficiale (manutenzione/OPFS 2026) | **VERIFICATO con correzione**: TUTTI e tre mantenuti nel 2026 (sql.js v1.14.1 2026-03-04; wa-sqlite v1.1.1 2026-04-23; sqlite-wasm doc con test 2026-03) — ma **solo wa-sqlite e sqlite-wasm ufficiale hanno OPFS persistente; sql.js è in-memory only** e va escluso | F1, F3, F4, F5 |
| 3 | `navigator.storage.persist()` su WebKit/Safari: cosa garantisce | **VERIFICATO in parte / INCERTO sul punto chiave**: Storage API piena da Safari 17/iOS 17; concessione automatica per euristiche (Home-Screen install), senza prompt; il persistent mode esclude dall'eviction LRU/quota. **INCERTO/NON DOCUMENTATO: nessuna fonte primaria afferma che protegga dalla cancellazione ITP dei 7 giorni** → da trattare come NON protetto | F7, F9 |
| 4 | Web-app Home Screen esenti dalla 7-day cap (iPadOS attuale) | **VERIFICATO con riserva**: fonte primaria WebKit (2020, mai revocata): contatore "days of use" proprio, "we do not expect … data deleted"; quota identica al browser (2023). Episodio EU feb-2024 rientrato il 2024-03-01 (Home-Screen web-app restano WebKit anche in EU). Riserva: "we do not expect" non è una garanzia e nessuna fonte primaria iPadOS 18/19+ ri-afferma l'esenzione | F8, F7, F11 |

### Registro fonti

- **F1** — SQLite, "Persistent Storage Options" (doc ufficiale WASM, trunk; cita
  test 2026-03): <https://sqlite.org/wasm/doc/trunk/persistence.md> — VERIFICATO
- **F2** — Chrome Developers, "SQLite Wasm in the browser backed by OPFS":
  <https://developer.chrome.com/blog/sqlite-wasm-in-the-browser-backed-by-the-origin-private-file-system> — VERIFICATO (concorde con F1)
- **F3** — PowerSync, "The Current State Of SQLite Persistence On The Web"
  (aggiornamento maggio 2026): <https://powersync.com/blog/sqlite-persistence-on-the-web> — VERIFICATO (secondaria, recente)
- **F4** — sql.js, repo GitHub (release v1.14.1, 2026-03-04; README: in-memory,
  niente persistenza nativa): <https://github.com/sql-js/sql.js> — VERIFICATO
- **F5** — wa-sqlite, repo GitHub (MIT dal 2023-02; v1.1.1, 2026-04-23; VFS
  OPFSCoopSyncVFS/OPFSWriteAheadVFS/IDBBatchAtomicVFS…):
  <https://github.com/rhashimoto/wa-sqlite> — VERIFICATO
- **F7** — WebKit Blog, "Updates to Storage Policy" (2023-08-10; Safari 17/iOS 17,
  quota 60%/15%, LRU eviction, persist() per euristiche, Home-Screen stessa quota):
  <https://webkit.org/blog/14403/updates-to-storage-policy/> — VERIFICATO
- **F8** — WebKit Blog, "Full Third-Party Cookie Blocking and More" (2020-03-24;
  7-day cap su storage script-writable; Home-Screen: contatore proprio):
  <https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/> — VERIFICATO
- **F9** — MDN, "Storage quotas and eviction criteria" (eviction ITP 7 giorni;
  persist() concesso senza prompt su Safari/Chromium; **tace** sul rapporto
  persist()↔ITP):
  <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria> — VERIFICATO (con lacuna dichiarata)
- **F10** — caniuse, "File System Access API" (Safari 3.1→26.5+: non supportata;
  Firefox: non supportata; Chrome/Edge 105+):
  <https://caniuse.com/native-filesystem-api> — VERIFICATO
- **F11** — 9to5Mac/MacRumors + Apple Developer "Update on apps distributed in the
  EU" (2024-03-01: reversal, Home-Screen web-app restano WebKit in EU):
  <https://9to5mac.com/2024/03/01/apple-home-screen-web-apps-ios-17-eu/>,
  <https://developer.apple.com/support/dma-and-apps-in-the-eu/> — VERIFICATO
- **F12** — WebKit bug 209563 ("Support longterm persistent storage" re: 7-day
  ITP expiry — la richiesta esiste proprio perché l'esenzione non è garantita):
  <https://bugs.webkit.org/show_bug.cgi?id=209563> — INCERTO (tracker, non policy)
