# S05 · acquisizione Cytoscape · 26 ottobre 2026

Addendum al primo batch `dde23c0`, che rimane una fotografia storica distinta.
Stato iniziale di questo incremento: IMPLEMENTATO, verifica e composizione in
corso; non INTEGRATO o DISTRIBUITO. Stessa PR [315](https://github.com/AndreaMarro/ardesia/pull/315).
S00 conserva integrazione, rilascio e scrittura RUNLOG/NEXT comuni.

## Capacità acquisita e risultato utente

Il grafo usa il sottosistema maturo **Cytoscape 3.34.0**: modello di nodi/archi,
renderer canvas, pan/zoom, drag, layout grid/breadthfirst/circle, vicinanze,
percorso minimo Dijkstra e lifecycle. Non è una dipendenza installata senza
consumer: `GraphExplorer.tsx` carica su richiesta l'ESM distribuito e
`graphAdapter.ts` lo alimenta con la proiezione autorizzata Study.

Docente e studente possono ritrovare una spiegazione attraverso il percorso
fra due oggetti, concentrarsi sui vicini, aprire la revisione originale e
salvare la disposizione personale. Rimane un elenco HTML equivalente per
aprire nodi e relazioni da tastiera/touch; i percorsi hanno anche una lista
ordinata di passi. In assenza di canvas gli stessi controlli usano il motore
headless e l'elenco. Un percorso esprime associazioni, non prerequisiti,
diagnosi, efficacia didattica o competenze certificate.

## Confronto e decisioni

Registro `registry/TARGETS.json` riletto: 139 target, preservati gli ID esistenti.
TARGET-119 rimane React Flow; Obsidian Canvas096, AFFiNE097 e Heptabase099
restano scenari distinti. Nessuna modifica concorrente al registro condiviso.

| Candidato | Provenienza osservata | Decisione per questo consumer |
| --- | --- | --- |
| Cytoscape3.34.0 | [npm ufficiale](https://registry.npmjs.org/cytoscape/3.34.0), [API](https://js.cytoscape.org/), MIT completo nel tarball, nessuna dipendenza runtime dichiarata | **ADAPT**: motore e renderer distribuiti invariati, adapter/ACL/persistenza originali. Già presente transitivamente nel lock Studio attraverso Mermaid. |
| React Flow12.12.0 | [documentazione ufficiale](https://reactflow.dev/learn), metadata npm MIT; dipendenze dichiarate zustand, classcat, @xyflow/system | **DEFER**: buon editor di flussi, ma qui servono algoritmi/vicinanze/layout; evitata una seconda closure React. Nessuna misura comparativa di prestazioni e nessun audit completo della closure dichiarati. |
| Sigma4.0.3 | [documentazione ufficiale](https://www.sigmajs.org/get-started/quickstart/), metadata npm MIT; events e graphology-utils dichiarati | **DEFER**: alternativa per reti grandi, non dimostrate necessarie dal consumer corrente. Closure e rendering WebGL non collaudati qui. |

Obsidian rimane **REIMPLEMENT** per il solo modello funzionale dei backlink:
il precedente esperimento riguarda documentazione web, non app nativa e non
codice acquisito. Nessun prelievo da bundle proprietari. Cytoscape non era un
target presente nel registro letto: proposta di nuova voce al writer S12/S15,
senza assegnare autonomamente un ID o riciclare119. Consultazioni effettive
nel rendez-vous306: commenti6405629665,6405659830,6405820182 e6405947479.

## Codice riutilizzato e licenza

Tarball ufficiale `cytoscape-3.34.0.tgz`, upstream commit
`22716bfb75834b56fa6679648b0abb06f4ae691c`, SHA512
`62rNSrioXw93uliKFBwjukeQyeWwH2PqDrTac31r2P6464u3AUvTk0xS4LVvT251g7IgkFunrI48ZEZGjywSOg==`.
Il digest coincide con quello già nel lock Studio. Versione scelta per riusare
quell'artefatto, non dichiarata come ultima versione disponibile.

In `apps/web/src/features/learning-memory/vendor/cytoscape-3.34.0/` sono copiati
byte-esatti soltanto ESM minificato ufficiale, tipi ufficiali e LICENSE MIT.
`PROVENANCE.json` contiene i loro SHA256. Il piccolo `cytoscape.d.mts` è un
ponte di tipi originale, non upstream. Nessun font, icona, asset o dipendenza
runtime aggiuntiva. Nessuna modifica a manifest o lockfile comuni. La licenza
completa è inclusa anche nel consumer tramite import raw e dettagli apribili.

Manutenzione: aggiornamenti espliciti, nuovo tarball ufficiale, verifica della
licenza/closure/digest e ripetizione dei test adapter+UI+browser; niente URL CDN
o intervalli semver in runtime. Rollback del renderer: rimuovere il lazy mount
GraphExplorer preservando l'elenco HTML. Gli eventi di disposizione sono
additivi e ignorabili; nessuna migrazione distruttiva.

## REA realmente eseguita

REA6.7.0, skill42. I record completi sono in `evidence/rea-*.json`.

- Runtime sul pacchetto distribuito con Node26.5.1 e limite heap128MiB:
  `ev_e2af8c909d15d95db6235474999df78291caae98883e4b8ae428d572ee087a72`.
  Nove controlli PASS: versione, vicinanze, percorso e disconnessione, layout,
  coordinate/zoom/pan dopo ricostruzione, rimozione sorgente e destroy.
  Il probe importava l'ESM non minificato dello stesso tarball; i test adapter
  di prodotto usano invece il modulo minificato effettivamente vendorizzato.
- Primo FAIL conservato:
  `ev_b3345cf078f04a735284196363ff2b9654b42b98ba060097a799dc86ed4b0a18`.
  Passare `{id,x,y}` a position conservava anche id nell'oggetto posizione.
  Correzione del probe e dell'adapter: trasferire solo `{x,y}`; nessuna
  importazione di snapshot cy.json o campi arbitrari.
- Analisi statica su dijkstra.mjs, core/viewport.mjs e breadthfirst.mjs:
  summary `ev_d2917ca03ee673f9011b4ade350c895b1d83a84377887d1a79f95a262edbf470`,
  padre `ev_addb37ae486b391db5382feaf1dcaae9b526361396f5c23997603f38542b4f54`.
  Digest directory `91684f6584656132a43fd8e5418cabdd5a640c474ed35f933c45003dd38a7536`.
  Copertura **parziale**:178 file inventariati fuori dallo scope selezionato,
  limite unknown600 raggiunto, semantica conservativa; non analisi esaustiva.

Limiti runtime: cattura processo headless, non canvas/browser; fingerprint
prelaunch non atomicamente legato dal sistema operativo all'eseguibile;
ambiente ereditato, campionamento processi parziale, filesystem non osservato.
Il probe green ha impiegato circa27ms interni su quel piccolo grafo: non è una
misura generale di prestazioni UI. Costo totale e risparmio comparativo UNKNOWN.
Non servono nuovi tool REA per leggere queste evidenze già conservate.

## Funzioni originali, integrazione e autorità

`learning_memory/view.py` salva solo layout/coordinate/zoom/pan in eventi
`memory.view.saved.v1` del ledger Study esistente. Ricevuta idempotente, lock
aggregato personale e versione attesa; nessun secondo database o ACL canvas.
GET/POST `/study/memory/view` passano dall'autenticazione già esistente.
`get_memory` restituisce la vista filtrata sui soli ID attualmente autorizzati.
Nessun testo/titolo della fonte nella disposizione; massimo1024 posizioni,
coordinate finite e limitate, zoom0.2–4. Campi extra, duplicati e ID estranei
sono rifiutati. L'export JSON delle note resta formato1 e non include layout;
la continuità del layout usa l'account e il backup canonico del database.

L'apertura di un nodo rilegge il Core e ritira anche gli altri oggetti che la
stessa lettura mostra revocati. Il renderer riceve solo id/label/kind e archi
con entrambi gli estremi autorizzati. Su cambio proiezione/utente il grafo è
distrutto e ricreato, senza recuperare dati dalla memoria del renderer.

Salvataggio incerto: snapshot e key restano congelati per un retry identico.
Se un'altra finestra ha già salvato una versione successiva, anche il retry
della vecchia ricevuta risponde409; non conferma silenziosamente la versione
altrui. Il consumer richiede ricarica. Se la risposta perde ID per revoca,
ricarica la proiezione corrente. Nessun falso salvataggio offline.

## Prove e correzioni al checkpoint

Primo batch65Core/HTTP PASS prima della review nuova; dopo le correzioni,
13test mirati sul layout/HTTP PASS. UI+adapter18PASS: algoritmi del vendor
reale, StrictMode, passi da tastiera, ripristino, retry byte-identico, conflitto,
risposta tardiva dopo unmount, apertura e ritiro di nodi revocati.

Review tecnica di un altro agente, lettura statica senza browser/compiler:
tre difetti reali riprodotti e corretti, con RED/GREEN conservati:
retry crosswindow, OverflowError su int401cifre e mancato ritiro di altri nodi
revocati dopo apertura di un nodo ancora accessibile. Non è approvazione
scientifica umana né indipendenza statistica garantita. Lo script storico
engine/review.sh usa ladder di account/modelli alternativi: non eseguito per
non introdurre identità alternative; adottata la review tecnica corrente.

Typecheck e browser di questo incremento ancora da eseguire al checkpoint,
con una sola operazione pesante alla volta. I precedenti55/8/10PASS del
batchdde23c0 non certificano il nuovo renderer. Il registro finale di verifica
aggiungerà commit, ambiente, risultati e limiti effettivi senza riscriverli.

## Debito e prossima acquisizione

Dipendenza reale: contratto shell della PR316. Conservare il re-exportS02,
mountmemory prima del gate edizioni e enabledViews dal solo root ownerS00.
Non ripristinare Shell legacy. Main osservata992d1a0b, non più la base37e0fe8.
PR315 ancora non integrata al checkpoint; nessun merge main o deployS05.

Prossimo candidato di maggior valore: proiezione portabile delle versioni e
degli originali tramite notebook Core, con valutazione del formato aperto
Obsidian/JSON Canvas dopo permessi, backup e scala. Un indice vettoriale o
un secondo archivio non sono giustificati dalle misure attuali.
