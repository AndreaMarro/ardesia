# S07 — IMPLEMENTATO, verifica di integrazione in corso

Base `37e0fe828e47b7c81784c2eb48a1b9776dd859ed`; branch `codex/s07-collaboration-20261026`. Non DONE: nessuna integrazione o distribuzione dichiarata.

Consumer: Room accetta `collaboration?: RoomInkAdapter` soltanto dall'host; il default è assente. Nessun actor/ruolo da URL o nuovo login. L'adapter fornisce due InkSession (personale/condiviso), sorgente esatta e geometrie PDF, layer shared già autorizzati dal trasporto e AbortSignal della sessione Core. Toolbar lazy, acquisizione a pointer-up, proiezioni locked, undo locale, pagina/zoom personali, snapshot via WorkspaceStore. Room/journal/audio conservano le autorità esistenti.

## Prove attuali

18 test namespace PASS prima del wiring Room: collisione reale WorkspaceStore, convergenza3/11autori, dup/reorder, undo proprio e stesso autore su altro device, snapshot source/page/version, binary forged-author/hidden-root/incomplete, freeze, outbox/retry e lateack/revoca, cold key retry, UI save failure. Log `tests-local.log`. Non sono test di scala remota o studenti reali.

Browser iniziale FAIL conservato: tre context Chromium caricano lo stesso PDF sintetico, ma harness invocava updateScene troppo presto; warning Excalidraw e gesto non acquisito→timeout. Correzione del lifecycle implementata nel consumer Room (effect dopo API/mount); rerun attende slot host. Non dichiarato visualPASS.

Typecheck completo locale arrestato per contesa host8GiB e disco sceso a1GiB; nessun errore compilatore mascherato, nessun PASS dichiarato. npm package-lock-only conclude exit0 con warning peer preesistenti Radix/React19. Pin/closure esatti in DONOR.md; delta manifestStudio+49righe lock, rootlock immutato. Full Studio/Room/audio e build da eseguire sulla SHA corrente.

## Autorizzazioni e confini

S00 ACCEPT https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6404992331 e correzione percorso6405061639: esclusiva temporanea Room reale e manifestStudio, prop/toolbar opzionali. Nessun App/rootlock/shared schema modificato. Test e consumer UI non certificano ACL remote. `validateLayerUpdate` valida contenuto/casualità/budget per documento separato; il server deve prima verificare identità e scope Core a ogni update/reconnect. Porta InkTransport esplicita, nessun provider predefinito o endpoint pubblico.

Checkpoint locale: committed separato da pending e chiave idempotente conservata anche a cold reopen; localStorage rimane cache. Le sidecar non sono ancora parte del bundle `.lesson` canonico: non dichiarare roundtrip bundle/export remoto. Undo history non ripristinata dal checkpoint. Limiti512KiB/layer,2000oggetti,4096punti/tratto; nessuna promessa di scala infinita.

## Residui e tre prossimi batch

1. Completare typecheck, suiteStudio/Room/audio, browser suRoom reale e review del confine S00; integrare solo dopo CI esatta. Pipeline/default prodotto preservati da verificare.
2. S10: transport autenticato, ACL per-scope anche sui binari, revoca websocket/offline server, receipts e storage Core, stress latency/disconnect3poi11. Nessun endpoint simulato può chiudere questa accettazione.
3. Estendere focus docente con grant verificato, proposta tutor su layer distinto, freeze/consegna canonici e snapshotepoch per compattazione sicura. Aggancio media solo S08 e integrazione sidecar nel bundle con ownership. Formule attuali sono dati/projection testuale; typesetting e oggetti scientifici passano dal renderer esistente, non una capacità completa già pronta.

## Review tecnica e correzioni — dopo la prima candidata

Review separata read-only di9b3ede6 (nessun test eseguito dal reviewer):6finding accettati. La CI9b3ede6 è tuttaSUCCESS ma non dimostrava questi casi. Controprove RED effettive: cold retry dopo undo rifiutava receipt originale; cicli grandi raggiungevano615878byte oltre512KiB; baseline del gesto/isolamento board mancanti. Primo GREEN16testNode dopo le correzioni in7.35s. Prova testo passa ora dal restoreElements reale, non solo dalla shape del DTO; esito da aggiungere dopo esecuzione.

Correzioni: baseline precedente al gesto (Excalidraw emette pointerDown dopo insertion), rifiuti rimossi dal canvas, projection di qualunque autore e nuovi rawdraft fuori dalla scena/journal/export legacy. La baseline del board conserva gli elementi precedenti. Le sidecar conservano gli scope separati; nessun contenuto privato introdotto nel journal pubblico. GCfalse conserva causalità/storia, con budget conservativo prima di add/undo/redo; nessuna compattazione implicita. La busta pending conserva update bytes esatti insieme alla chiave, anche dopo undo/coldreopen. Formule/proposte hanno boundingbox visibile ma restano testo, non typesetting scientifico completo.


## 26 ottobre2026 — checkpoint di consolidamento append-only

Le sezioni precedenti descrivono le candidate storiche. Non sono eliminate o promosse retroattivamente a PASS. Base corrente8e0737b114f147735ef4daf062285e1dbe4064e3; codice finale candidato0d809591ca47a3c87878548d59b343d62e7ff7a8 (merge ordinario, prodotto Studio identico a7a263e27). PR unica https://github.com/AndreaMarro/ardesia/pull/311 . Il delta S02 importato da main riguarda solo Web/handoffS02.

**Capacità acquisite e codice riusato.** Yjs13.6.27 integra causalità/merge/mappe/UndoManager; Excalidraw0.18.1 mantiene il canvas, renderer PDF e storico. Studio aggiunge una sola dipendenza diretta e3pacchetti al suo lock (49righe), root lock intatto. MIT, integrity, closure, alternative e ragione REA/source in DONOR.md. Quattro candidati e delta registro proposto in REGISTRY-DELTA.json. Consultazione S12/S15/S14 via306 effettiva, commenti6405603588/6405700111/6405710817. Nessun clone proprietario, decompilazione inventata o risparmio orario stimato.

**Funzioni originali e integrazione.** Room reale riceve RoomInkAdapter soltanto dall'host: personal/shared, owner, source immutabile, geometrie PDF, peer shared e segnale revoca. Toolbar, cattura gesto, undo, pagina/zoom, checkpoint e proiezioni usano il canvas/store/journal esistenti. Schema e isolamento sono adattamenti di dominio; nessun algoritmo CRDT riscritto. Nessuna route prodotto attiva l'adapter automaticamente: la composizione autenticata resta al writer S00/S10. Il fixture E2E monta il medesimo Room reale, senza sostituirne store/journal/PDF loader o recorder; consenso audio spento.

**Prove mirate.** tests-final.log:28test/9file PASS in25.19s sull'inventario di codice7a263e27/0d809591; host8GiB con contesa, nessuna metrica di prestazioni remota. Convergenza3e11autori in processo, dup/reorder, own/same-author-device undo, validazione binari e causalità, snapshot/budget/tombstone, lostACK+retry exact bytes, lateACK/revoca, cold reopen, privacy, source field-order e restoreElements reale. Canvas jsdom shim solo measurement/feature probe all'import; restore non mockato. Non sono11browser o studenti autentici.

**Errori, controprove e correzioni datate.**

- La CI816dd472 falliva in restoredInk all'import del package: jsdom non implementa getContext e il donor consulta filter. I log remoti mostravano220file/2326testPASS,1suiteFAIL,5skip; non una CI verde. Lo shim solo-test risolve l'ambiente e la suite locale finale è verde; la CI nuova deve confermarlo senza skip o gate modificati.
- Il primo browser falliva chiamando updateScene prima del mount, poi il gesto puntava il pannello colori aperto dalla penna. Diagnosi con elementFromPoint e callback reali: spostato solo il punto sintetico nell'area canvas visibile. Un temporaneo403font derivava dal percorso node_modules symlink negato da Vite; fs.allow corretto nella config di prova, non nel prodotto.
- Peer prop sostituita durante pointer-down non deve smontare il listener di cattura. Listener stabili, ref aggiornato e baseline originale Excalidraw; la prova browser include il cambio peer durante il gesto.
- ID projection concatenati potevano collidere: tuple source/room/owner/audience/object codificate senza ambiguità e test discriminante.
- RED save-race-red.log: write locale sospesa, add+ack fa null→R→null e il badge vecchio dice salvato. Ora confronto checkpoint completo; testGREEN. Nel test jsdom si decodificano bytes nella realm ricevente, poiché structuredClone è Node; non viene mockata la sessione.
- Source equality non dipende più dall'ordine proprietà; test con deserializzazione inversa. Geometria letta dall'adapter corrente al pointer-down, fotografata finoUp, evitando closure stantia.
- Il primo reporter browser calcolava sourceEqual anche su una riga case senza source: falso, pur con tre hash actor uguali. Log originale preservato in evidence/browser-first-pass.*; runner finale conta e confronta solo tre actor e rifiuta mismatch. Nessuna riscrittura del vecchio risultato.

**Review.** Reviewer separato read-only ha trovato i casi precedenti; root li ha accettati e riprodotti dove indicato. Ultima review limitata alle tre correzioni su7a263e27/0d809591 non trova residui nelle riproduzioni. Non ha eseguito test/build/browser e non è approvazione umana/scientifica o audit completo.

**Risultato utente delimitato.** Nell'host che fornisce l'adapter, docente/studente possono scrivere su layer separati, sovrapporre contributi, annullare soltanto i propri, cambiare vista senza muovere i compagni e riaprire la copia locale pending. La UI dichiara collegamento remoto non attivo. Il confronto di snapshot nel fixture dimostra il raccordo; nessun servizio collaborativo remoto è presentato come già funzionante.

**Debito residuo.** Core ACL per update/reconnect/storage/receipt e server revocation non implementati; nessun secondoAuth/DB/relay. Sidecar fuori bundle.lesson canonico; cold reopen conserva stato e retry, non undo history. Proposte/formule hanno dati e testo, non workflow/typesetting scientifico completo. Freeze locale non è consegna canonica. Focus docente richiede grant verificato. Mobile è Chromium emulato; Safari/device vero e uso umano non eseguiti. A390px la toolbar dispone i controlli senza overflow, ma il canvas disponibile è ridotto e l'autofit nativo può essere molto piccolo: nessuna certificazione di ergonomia tablet/mobile. Nessun deploy/merge autonomo.

### Prossimi batch prioritizzati

1. **P0 S00 integrazione candidata.** Primo passo leggere head/CI esatte311 e rieseguire confine Room→ink→passaggio→cold/revoca; dipendenze7checkstrict e ownership; accettazione default Room/audio preservati, merge/postmergeCI e rollback; evidenza SHA/run e prova propria S00. Non aggiornare RUNLOG/NEXT concorrenti: appendice pronta in HISTORY-APPENDIX.md.
2. **P0 S10 trasporto Core.** Primo passo definire porta autenticata per layer e receipt exact bytes; dipendenze sessione/lezione/source/grant Core e storage esistente; accettazione3poi11browser remoti con revoca/reconnect/restore/negativi; evidenza HTTP/ws reali, ricevute e digest. Valutare acquisizione HocuspocusMIT sotto la stessa authority, senza auth/DB paralleli.
3. **P1 continuità e consumer scientifici.** Primo passo concordare con S08/S14 owner bundle l'inclusione sidecar/versioni e collegamento passaggi senza projection private nei sink; dipendenze bundlemanifest/grant/replay Core; accettazione roundtrip sorgente esatta, proposta tutor distinta e freeze/consegna canonici; evidenza test bundle, UI scientifica, negative privacy e device/tastiera reali.


## 26 ottobre2026 — controprova esatta conclusa

Su0d809591ca47a3c87878548d59b343d62e7ff7a8: browser reale PASS, Chromium148.0.7778.96/Node26.5.1,3context isolati,1440x1000 e390x844, touch emulato e reducedmotion. Scenario completo30754ms, non benchmark rete o scala. PDFsourceSHAec2b62c5f0182ff21fd8de565173c3016b624d7b22abd6f60d088cfdc5aa78ff uguale nei tre actor. Peer prop aggiornata durante il gesto reale, duplicati/inversi, ownundo preserva peer, cold reopen, privacy board/journal con passaggio, pagina2/zoom1.5 prima del resize, revoca visibile e nessunoverflow. Controprova geometria sostituita preservando sessions/signal: nuovo gesto normalizzatoX=0.6666666666666666 atteso2/3. Zero console/pageerror/HTTP inattesi. RunnerJSON, log e screenshot in evidence; screenshot effettivamente ispezionati, limiti mobile sopra confermati.

CI0d809591: tutti i checkSUCCESS, run40250552612 (Web/Studio/Engine/API/MCP/hygiene/golden), marketing40250552629, no-deploy40250552631, contract40250713721. Studio typecheck e buildPASS,2332testPASS/5skip storici,222filePASS/1skip; nessun nuovo skip. Evidenza esatta in ci-0d809591.json e ci-studio-0d809591-summary.log. Source inventory SHA256 di tutti i sorgenti Studio+manifest/lock verificato invariato prima e dopo il browser; gli ulteriori commit di sola consegna non cambiano l'applicativo. Browser e proprio Vite arrestati, fixture rootStudio rimossi; riproduzione conservata soltanto nel namespace handoff. Nessun processo altrui interrotto.

Stato: READY_FOR_INTEGRATION del primo incremento, non DONE della collaborazione remota. Head finale di sola evidenza e relativa CI devono essere rilette al merge; source commit e confini non cambiano. Le verifiche precedenti restano fotografie storiche.
