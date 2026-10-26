# S05 — Quaderno personale, fonti, collegamenti e rettifiche

> Appendice del26ottobre2026: il [nuovo incremento REA-FIRST](acquisition-2026-10-26/README.md)
> acquisisce Cytoscape e aggiunge disposizione persistente e grafo interattivo.
> Il rapporto sotto conserva prove e decisioni del primo batchdde23c0; non è
> stato riscritto per attribuirgli retroattivamente la nuova acquisizione.

Stato della consegna locale: **READY_FOR_INTEGRATION**, subordinato ai check della
head effettiva della PR e alla composizione S00. Base verificata:
`37e0fe828e47b7c81784c2eb48a1b9776dd859ed`. Il commit candidato è la head della PR;
questo rapporto non anticipa merge, deployment o approvazioni umane.

## Risultato utilizzabile

L'account autenticato apre `/?view=memory`, anche senza edizioni o iscrizioni.
Può scrivere idee personali e annotazioni, indicare concetti, collegare altre
note e citare una revisione precisa di una fonte accessibile. Le classificazioni
sono esplicite: idea, annotazione, osservazione, ipotesi, rettifica, non determinato,
non ho capito. Una rettifica crea una nuova versione, senza riscrivere lo storico.

Quaderno e grafo navigabile proiettano gli stessi oggetti. Il grafo collega
concetti, note, fonti, tentativi consegnati, review pubblicate, osservazioni del
diario e nuove prove; non crea un planner o un punteggio di competenza. Cliccare
un riferimento apre la coppia `resourceId/revisionId` originale; per i passaggi
Studio validi riusa il descrittore temporale esistente, con avvertenza sullo spazio
locale necessario. Non sono stati trasferiti audio o session authority.

La ricerca comprende testo delle note, concetti e originali autorizzati. I
backlink sono ricostruiti. Export/import JSON conserva le note correnti e i loro
riferimenti, verifica integrità interna e permessi attuali e rimappa i link fra
note importate. L'hash non è una firma; l'archivio non concede accesso alle fonti,
non contiene gli originali e non sostituisce un backup del database.

## Autorità, persistenza e compatibilità

- Dominio: `packages/engine/lessonos/study/learning_memory/`.
- UI: `apps/web/src/features/learning-memory/`; renderer HTML nativo con nodi e
  relazioni navigabili da tastiera/touch. Nessuna dipendenza nuova o root lockfile.
- Adapter HTTP: `learning_memory_routes.py`, autenticazione e store dependency
  esistenti. Un hook additivo in `app.py`; lazy view e voce shell in App/Shell.
- `SourceViewer` accetta la coppia immutabile con `contextId` opzionale: usa già
  il contesto restituito dal server. I chiamanti precedenti restano compatibili.
- Unico database e ledger `study_events`; ricevute idempotenti atomiche, controllo
  della versione attesa e lock dell'aggregato personale. Nessuna migrazione.
- Scope SQL per attore prima del replay; ogni fonte è riletta tramite
  `get_resource_revision`. Storico, ricerca, grafo, export e retry nascondono il
  contenuto dipendente da una fonte non disponibile. Il selettore non si fida
  dei titoli memorizzati nel workspace del browser.
- Marker di versione senza contenuto nello stesso ledger impediscono che la
  cancellazione di una fonte/studente faccia promuovere una vecchia versione o
  risuscitare una nota eliminata. Il corpo può essere rimosso dal normale erase
  Core senza perdere la dismissione dell'aggregato.

Limiti espliciti: massimo 500 note per account, 8 fonti e 20 link per nota,
4.000 caratteri di testo, archivio JSON entro 240.000 byte. Proiezioni ricalcolate
per lettura; prestazioni su carriere grandi e PostgreSQL reale non misurate qui.

## Prove e review realmente eseguite

`evidence/core-http.log`: **55 PASS**, sui nuovi contratti e regressioni di
contesto, diario ed erasure. Include cold reopen, backup/restore, revisione
storica, ritiro fonte, isolamento fra A/B, retry, import atomico, rettifica ed
erasure senza resurrezione. Una deprecazione upstream Starlette TestClient/httpx.

`evidence/web.log`: **8 PASS**, inclusi StrictMode, salvataggio, navigazione alla
prima lezione, risposta tardiva di un altro attore, editor revocato, navigazione
durante una lettura sospesa, sorgenti in cache e accesso senza corso.
`evidence/typecheck.log`: comando TypeScript concluso con exit 0. La verifica
browser e le schermate sono descritte dal file `browser-results.json` quando
presente; dati sempre sintetici, Chromium/Chrome installato, 1440 e 390 px.

La suite web generale iniziale è stata **interrotta**, con timeout in
`session-boundary.test.tsx`, `exam.test.tsx` e `source-context-identity.test.tsx`.
Non è riportata come verde o come bug attribuito alla base. Il Mac aveva 8 GiB RAM,
disco sceso da circa 8,5 a 1,1 GiB liberi e swap osservato oltre 8 GiB, con altre
sessioni attive. Sono stati fermati soltanto processi di questa sessione. Le suite
complete e i gate obbligatori della head effettiva devono passare in CI.

Review tecnica di un secondo agente: eseguiti 14 test iniziali e riproduttori
HTTP/erasure; UI esaminata staticamente, non provata dal reviewer. Cinque finding
corretti e coperti da riproduzione RED/GREEN: snapshot revocato nell'editor,
StrictMode, promozione di versioni dopo erase, link malformati nell'import e
spinner dopo cambio nodo. Non è approvazione umana o revisione scientifica.

La prova browser ha inoltre trovato un'etichetta non stabile sul textarea già
compilato: resa esplicita con `for/id`. Due errori iniziali del runner erano
selettori non univoci, corretti nel runner senza indebolire le aspettative.
Il contrasto del toggle selezionato in hover è stato corretto usando i token
esistenti. Nessuna modifica a gate, test storici o policy ZERO-LLM.

## Riproduzione locale

Dalla root, con dipendenze Python del progetto e `npm ci` già disponibili:

```sh
export ARDESIA_S05_DEMO_DIR="$PWD/artifacts/s05-demo"
PYTHONPATH=packages/engine:services/study-api python -m uvicorn synthetic_server:app --app-dir handoffs/swarm-v2/S05 --host 127.0.0.1 --port 5426
```

In un secondo terminale, dalla root:

```sh
node node_modules/vite/bin/vite.js --config handoffs/swarm-v2/S05/vite.config.mts
```

Con la stessa variabile `ARDESIA_S05_DEMO_DIR`, il runner apre browser separati,
usa soltanto le identità sintetiche create dal server e scrive prove nel demo dir:

```sh
node handoffs/swarm-v2/S05/browser_qa.mjs
PYTHONPATH=packages/engine:services/study-api python -m pytest packages/engine/tests/study/test_learning_memory.py services/study-api/tests/test_learning_memory_http.py packages/engine/tests/study/test_context_memory.py packages/engine/tests/study/test_error_diary.py packages/engine/tests/study/test_diary_erasure.py -q
npm run test --workspace @ardesia/web -- src/features/learning-memory/MemoryView.test.tsx --maxWorkers=1
npm run typecheck:web
```

Usare porte libere e un demo dir nuovo. Il runner ritira intenzionalmente una
fonte sintetica alla fine: per ripetere lo scenario completo usare un nuovo
demo dir. Le sessioni demo scadono dopo quattro ore. Il fixture di accesso è
privato e non va aggiunto a Git. Nessun servizio remoto o browser scaricato.

## Donor, licenze e scelte

Consultati [link interni](https://obsidian.md/help/links) e
[backlink](https://obsidian.md/help/plugins/backlinks) nella documentazione
ufficiale Obsidian. Benchmark: riprendere un blocco preciso e mostrare i riferimenti
entranti. Implementazione originale, senza importare codice, testo o asset del
donor. Cattura REA **6.7.0**, skill **42**, Evidence
`ev_a4e7e3442ebc538b3c93970db92c977aa6211e2c7ed137dbc0fa99c72b90265e`:
pagina della documentazione caricata, browser posseduto dal tool poi terminato.
Non prova un flusso nell'app nativa Obsidian, né un esperimento AFFiNE/Heptabase.
Metadati in `evidence/donor-metadata.json`; DOM completo mantenuto solo nel lavoro
locale, non redistribuito. Tempo/costo totale UNKNOWN, nessun risparmio dichiarato.

React Flow/Cytoscape restano candidati: il primo consumer non richiede layout
spaziale o drag, quindi è stato usato un renderer accessibile senza nuove
dipendenze, evitando un cambiamento al lockfile di S00. Il grafo attuale è una
vista di nodi e relazioni, non una mappa spaziale con zoom. API, storia, autorità
e persistenza restano indipendenti dal renderer.

## Integrazione e tre prossimi batch

S00 riceve piccoli hook App/Shell/API e la memoria sotto questo namespace;
RUNLOG/NEXT comuni non sono stati riscritti da un secondo writer. Checkpoint
START/CONTRACT e consegna sul rendez-vous #306, con autorizzazione dell'utente a
pubblicare. Nessun merge, deploy, spesa, telemetria o messaggio a studenti.

1. **Composizione e remoto con S00/S10.** Primo passo: integrare questa PR sulla
   main aggiornata, risolvere i piccoli hook condivisi e far passare i gate sulla
   head/merge tree. Poi prova autenticata su staging autorizzato: due browser,
   revoca e restore reali. Il locale non certifica la continuità remota.
2. **Originali e scala.** Collegare l'export delle versioni e degli originali al
   notebook Core esistente, con test su fonte ritirata, import da un'altra
   installazione autorizzata e backup. Misurare replay e ricerca su una carriera
   ampia prima di introdurre checkpoint o un indice vettoriale.
3. **Consumer S06 e revisione visiva S02.** S06 deve usare i segnali autorizzati
   di `diary.get_diary`, mantenendo candidati, contestazioni, stati storici e
   fonti non disponibili; non inferire competenza da tag manuali. S02 può
   evolvere il renderer verso una mappa spaziale conservando gli stessi oggetti
   e la navigazione da tastiera. Accettazione: segnale spiegabile e passaggio
   originale risolvibile anche dopo rettifica o revoca.
