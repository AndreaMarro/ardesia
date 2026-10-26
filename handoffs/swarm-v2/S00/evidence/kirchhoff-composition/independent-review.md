# Review indipendente — composizione Kirchhoff S19 / PR325

Data: 26 ottobre 2026. Reviewer: `review_study_composition`.

Ambito: checkout di composizione `$WORKTREE`, non ancora committato al momento della prova. S00 è integratore e writer dei raccordi; un altro agente modifica il consumer CircuitLab. Nessun sorgente, RUNLOG, NEXT o commit modificato da questo reviewer. Solo questo rapporto e le controprove nella directory evidence.

La prova non usa `compose_candidate`, monkeypatch dell'installer o il conftest S19: importa la factory e i moduli effettivamente presenti nel checkout. La sola iniezione di guasto sostituisce `adapter.assert_engine` con lo stesso tipo di errore emesso dai suoi controlli sul pin. I digest esatti prima/dopo sono in `review-probe.json`; sono identici durante l'esecuzione. Non attribuire questi risultati a una futura SHA senza nuova associazione/verifica.

## Finding aperti

### F1 — P2: indisponibilità del pin scientifico classificata come input invalido

Posizioni: `plugins/s19-circuit-lab/s19_circuit_lab/engine.py:34-41,48-57,64-72`; `plugins/s19-circuit-lab/s19_circuit_lab/routes.py:27-35`.

Il verificatore emette `ValueError` quando checkout, versione, snapshot o byte dell'engine non sono disponibili/coerenti. La route classifica tutti questi errori come `422 s19_invalid_input`. Sono problemi del runtime con un documento valido: il client riceve una responsabilità di correzione dei dati che non può risolvere.

Riproduzione conservata: utente sintetico autenticato, documento predefinito valido, `assert_engine` solleva `ValueError('pinned checkout unavailable')`. La factory reale restituisce `POST /study/s19/circuits/solve → 422 s19_invalid_input`; `GET` della risorsa restituisce invece `200 assessmentState=UNAVAILABLE` conservando il documento. Il caso corrisponde a un ramo reale di `assert_engine`, non a una stringa di errore inventata dal browser.

Correzione suggerita: distinguere errore di disponibilità/provenienza dell'engine da validazione del documento, restituendo il contratto `503 s19_engine_unavailable` per il primo. Conservare 422 per input invalidi e non indebolire la verifica del pin.

### F2 — P2: il JSON degli input richiede inutilmente l'engine

Posizione: `plugins/s19-circuit-lab/s19_circuit_lab/adapter.py:211-217`.

`export_document` chiama `assert_engine()` prima di leggere il formato. Il ramo JSON serializza soltanto il documento validato, ma viene bloccato quando l'engine manca. La scelta di installazione corrente permette intenzionalmente all'host di conservare input senza dipendenza scientifica; in quello stesso stato l'utente non può ottenere il JSON portabile dei propri input.

Riproduzione nella stessa prova: `POST /study/s19/circuits/export/json → 422 s19_invalid_input` con documento valido e pin indisponibile. Nessun risultato viene esportato: il documento contiene solo componenti, domanda, previsione, procedimento, note e layout.

Correzione suggerita: validare e serializzare il JSON senza engine; richiedere il pin per SPICE/CircuitikZ e per il calcolo. Aggiungere la controprova con engine assente e round-trip degli input identico.

## Evidenze positive effettivamente eseguite

Comando:

```sh
$S19_ENV/bin/python -B $LOCAL_EVIDENCE/review_probe.py
```

Esito: 17 check passati, exit 0; digest dei cinque moduli coinvolti invariati durante la prova. Database temporaneo sintetico rimosso; nessun token, cookie o database copiato nell'evidenza.

- Docente negato prima della consegna; dopo consegna R1 e salvataggio R2 vede esattamente R1 con risultato 8 e `canRevise=false`. La R2 non consegnata resta negata; peer negato anche su R1.
- Retry dell'aggiornamento recupera l'ack originale. Retry di una consegna accettata recupera la stessa ricevuta dopo R2 anche senza engine; un nuovo tentativo su R1 restituisce 409. Rimane una sola consegna.
- Due connessioni SQLite concorrenti, stessa revisione attesa e chiavi distinte: un salvataggio, uno `stale_revision`, esattamente una revisione aggiunta.
- JSON con 2.000 caratteri emoji nelle note: export/import identici; dimensione UTF-8 registrata nel report.
- Factory reale con installer S19; sessione cookie effettiva; dopo revoca globale la lettura esatta restituisce 401. Dopo rimozione membership il retry precedentemente accettato restituisce 403.

## Analisi statica di packaging e consumer Web

- `services/study-api/pyproject.toml` e `uv.lock` risolvono `ardesia-s19-circuit-lab` dal percorso locale `../../plugins/s19-circuit-lab`. Il plugin non dichiara una dipendenza PyPI `kirchhoff`: `engine.lock.json` + `install_engine.py` fissano il repository e il commit e rifiutano checkout non puliti.
- `assert_engine` controlla installazione editable, sorgente locale e pin; il loader congelato legge byte attestati e non riutilizza `.pyc` arbitrari. Non ho installato o cambiato dipendenze.
- Il nuovo `reopen(..., revision_id)` usa `get_resource_revision`; la verifica di `canRevise` non prova a leggere la head privata per il docente, grazie allo short-circuit sull'ownership.
- Il nuovo percorso `revise_resource(..., key=...)` passa dal comando/ricevuta canonico, con CAS e invalidazione delle proiezioni esistenti; non aggiunge ledger separati.
- `CircuitSource` è una proiezione tipizzata degli input; `SourceViewer` esclude il fallback JSON e conserva l'uguaglianza id/revisione e l'annullamento delle risposte obsolete del reader esistente. `Materials` esclude l'editor generico per questo tipo. I link includono risorsa e revisione esatte.
- Il link Web usa il client di sessione condiviso e interrompe l'aggiornamento dello stato dopo cleanup. La disponibilità rilevata riguarda il frontend montato, non costituisce prova di disponibilità scientifica.

## Limiti

Nessun browser, porta 5198, build, installazione o suite pesante eseguiti. Non eseguiti: PostgreSQL concorrente, deploy remoto, UI CircuitLab aggiornata dall'altro agente, navigazione reale e revoca con risposta tardiva nel consumer standalone. Questi restano oggetto della review finale UI e delle prove S00. Le vecchie evidenze S19 sono storiche, non verdi ereditati da questa composizione. La review è tecnica, non approvazione umana.


## Addendum del 26 ottobre 2026 — correzioni e review finale UI

Questo addendum conserva integralmente i finding precedenti e aggiorna il loro stato alla composizione ancora non committata. Le prove originali non sono state sostituite. I byte UI riletti sono attestati in `review-ui-source.json`; per Core/routes valgono i digest prima/dopo di `review-fix-probe.json`.

### F1 e F2 chiusi con controprova indipendente

Eseguito dal reviewer:

```sh
$S19_ENV/bin/python -B $LOCAL_EVIDENCE/review_fix_probe.py
```

Risultato: **19 check PASS**, exit 0, moduli invariati durante l'esecuzione. `adapter._require_engine` distingue l'indisponibilità del pin; `_run` traduce `EngineUnavailableError` in 503. Con la stessa iniezione di guasto del RED originale, solve restituisce `503 s19_engine_unavailable`, export JSON restituisce 200 e conserva esattamente gli input, reopen restituisce 200 con `assessmentState=UNAVAILABLE`. Le verifiche ACL/revisioni/retry/doppio writer/Unicode/revoca continuano a passare. Nessun token o database conservato.

### Review UI conclusa sui sorgenti indicati

- `CircuitLab` usa risorsa e revisione esatte. Il docente e il proprietario di una revisione storica ricevono una superficie non modificabile; i controlli di salvataggio/consegna verificano `readOnly`, oltre alla disabilitazione visuale. La copia privata azzera identità, risorsa, ricevuta e chiave idempotente; non aggiorna la fonte storica.
- L'ack di salvataggio si applica soltanto alla stessa identità di documento. Se l'utente ha scritto nel frattempo, il nuovo riferimento canonico viene conservato insieme alla bozza più recente, che resta dirty. `acknowledged` evita che il parent controllato trasformi quell'ack in una riapertura distruttiva.
- Cambio di risorsa/revisione/edizione e unmount invalidano le risposte precedenti. Il lettore Web conserva i controlli id/revisione; il circuito non cade nel fallback JSON. La richiesta di disponibilità del link viene annullata al cleanup e certifica solo il mount frontend.
- Il consumer reale `dev.tsx` usa transport e ciclo di sessione Ardesia esistenti. `/me` determina il ruolo per la consegna; focus/visibility ricontrollano l'attore. Non è stata introdotta una seconda autorità della sessione.
- `AttemptText` riconosce soltanto il piccolo payload `s19-attempt.v1` con stringhe tipizzate e mostra previsione/note nella consegna e nella revisione. Nessuna valutazione è ricostruita nel frontend; il procedimento resta nella fonte esatta. Il messaggio mantiene distinta la verifica del modello dalla prova di apprendimento.

### F3 — negazione tardiva dopo modifica: RED dell'integratore, patch riletta

La review aveva segnalato che il ramo 403 lasciava visibili dati privati e che una modifica contemporanea incrementava `generation`, facendo ignorare il diniego. S00 ha riprodotto il problema nel browser con transport host e barriera sulla richiesta: `revocation-403-red.log` conserva il fallimento (input Note ancora presente dopo 403). Il reviewer ha letto la prova, non l'ha eseguita.

La patch ora cancella documento, risultato, procedimento, riferimento e ricevuta per 401/403/404 pertinenti; distingue sessione scaduta da accesso non disponibile e non fa logout globale su 403. `browser-full-final.log` registra 28/28 PASS prima dell'ulteriore correzione F4; il risultato è storico, non certifica da solo i byte finali.

### F4 — diniego della risorsa A dopo apertura di B: RED dell'integratore e fix riletti

La review ha individuato una conseguenza della prima patch: un 403/404 incondizionato di A poteva cancellare B autorizzata, già adottata dopo `popstate`. `scope-red-exact-request.log` riproduce il caso nel consumer reale: GET esatto di A trattenuto, B caricata con le note attese, rilascio del 403 di A, note di B non più presenti. Il tentativo precedente che tratteneva anche la navigazione non era una controprova valida e resta distinto.

La correzione in `CircuitLab.tsx:190-207` cattura `identity` alla partenza: un diniego di risorsa vale anche dopo edit della stessa identità, ma non invalida una risorsa diversa. Il 401 resta globale. `actionSequence` impedisce al finally di una richiesta vecchia di sbloccare un'azione nuova ancora pendente. La lettura statica non rileva ulteriori difetti bloccanti in questa correzione.

### Stato delle prove dell'integratore lette dal reviewer

- `product-first.log`: **2/2 PASS**, desktop e touch, percorso reale App → corso → laboratorio → materiale privato → consegna → fonte esatta del docente → revoca, senza shim. I manifest in `product-first/` attestano i byte di quella prova, precedenti al fix F4; non trasferire il verde automaticamente alla versione finale.
- `browser-all-final.log`: **30 PASS, 2 FAIL** in 44,4 s. I casi aggiunti 403/404 dopo edit e A→B passano sia desktop sia touch. Gli ultimi due touch falliscono nel `beforeEach`, prima di revoca/round-trip: manca il laboratorio e il DOM chiede l'accesso. La suite completa NON è verde.
- Ipotesi comunicata a S00: sono 32 login nella finestra di 60 s, contro `create_app(auth_limit=30)` e bucket IP+path. Il test non controlla lo status del POST `/study/session`. La soglia spiega la posizione 31/32 dei fallimenti, ma richiede ancora conferma tramite status HTTP; non chiamare il caso flaky né alzare il limite per far passare il gate.

### Limiti residui

Nessun browser/build installazione eseguito da questo reviewer. Nessuna prova PostgreSQL concorrente o remota. UI e controprove browser sono state rilette da sorgenti/log dell'integratore; la sola esecuzione indipendente di questo addendum è la controprova Python da 19 check. La chiusura della suite completa, l'associazione alla SHA finale e la CI restano gate dell'integratore. Questa review non autorizza merge o deploy.


## Chiusura locale della review — 26 ottobre 2026, 20:00 UTC

Letti direttamente i log finali prodotti da S00:

- `browser-isolated-final.log`: **16/16 desktop e 16/16 touch PASS**; inclusi 401/403/404 dopo edit concorrente, A→B con diniego tardivo, revoca reale, riapertura e round-trip dei byte Unicode.
- `product-final.log`: **2/2 PASS** sul consumer App e sulla factory effettivi. Il test aggiornato riapre anche R1 storica in sola lettura, crea una copia privata, elimina dall'URL i riferimenti vecchi, salva un id diverso dall'originale e verifica la successiva revoca. La review ha letto anche queste asserzioni.
- `web-tests-serial.log`: **530/530 test, 76/76 file PASS**.
- `core-context-regression.log`: **8/8 PASS**.

Il problema 31°/32° login ha una causa distinta dai comportamenti applicativi: S00 riferisce la verifica delle trace con POST sessione 429, senza esporre token. Il reviewer ha verificato direttamente la correzione della fixture: `run_browser.sh` avvia un server e database temporaneo separato per ciascun viewport, mantiene tutti i casi e i timeout, e `beforeEach` ora richiede esplicitamente POST sessione 200. `create_app(auth_limit=30)` e il rate limiter canonico restano invariati. La causa HTTP è confermata da S00; le trace non sono state riaperte da questo reviewer. Il precedente FAIL rimane conservato: non viene qualificato come flaky.

Controllo indipendente dei digest eseguito ora, senza browser/test pesanti: tutti e sette i file attestati in ciascun manifest `product-final/product-{desktop,touch}.json` coincidono con i byte attuali; coincidono anche i cinque moduli della controprova Python indipendente da 19 check. Risultati in `review-final-digest-check.json`. `git diff --check` passa. HEAD resta `dd60fca5c85b0e9660928c64b600028faae3be0e` con composizione non ancora committata: i digest attestano il working tree, non rendono quel commit da solo equivalente alla consegna.

**Verdetto tecnico locale: nessun finding bloccante residuo negli ambiti revisionati. F1–F4 chiusi sulle prove e sui byte indicati.** Via libera tecnico a preparare il commit/push e sottoporlo ai gate previsti; non è autorizzazione al merge. La disponibilità remota e PostgreSQL concorrente non sono certificati da questa review. Restano necessari CI sulla SHA finale, review richieste dal repository e verifica dell'albero effettivamente integrato dopo merge.

Il tentativo aggiuntivo di review Claude CLI non è stato eseguito: S00 segnala OAuth scaduto. Non è contato tra i revisori né tra le prove riuscite. Questa review indipendente resta quella documentata qui. Nessun sorgente, RUNLOG, NEXT o commit modificato dal reviewer.
