# Lane advisory import/riapertura post-it — recupero PR #244

Stato locale: implementazione e gate finale verdi, APPROVE tecnico separato sui due hash; pin del commit con questa receipt e ledger ancora pendente. Non è una nuova esecuzione GitHub o certificazione di main. Base locale `a47cd69d3075c4d2274d5eaea1e8bdf6bdda8851`; parent originale da conservare `f44dccce0074d222862282c5c75ef7bf9951f311`, con commit produttivo `8260944ec229045411f01a3d31998edf9e2931f7` e merge storico di main.

## Requisito e recupero

La lane golden-path seleziona un solo file e non carica la spec dedicata ai post-it. Recuperato il job advisory separato della PR con selettore diretto, senza cambiare contesti richiesti, trigger, concorrenza o permessi. Il merge ha prodotto conflitti nel workflow perché il candidato contiene anche D2/Pandoc: risolti preservando l'intero workflow corrente e inserendo soltanto il nuovo job adattato. Un controllo YAML confronta tutti i campi superiori e i cinque job precedenti con HEAD: invariati; l'unica nuova key è e2e-postit-reload. Il job mantiene continue-on-error:true e un limite di dieci minuti.

La spec precedente passava ma provava solo import, identità e layout. I commenti che la descrivevano come prova di stato divergente dopo reload sono rettificati. Il PRD/KERN-001 originale non è ricostruito nelle fonti tracked lette: questa unità non lo certifica e non crea una nuova norma.

Conservati tutti gli assert originali sull'import prima di ogni navigazione. Aggiunti provider e letture noti diversi (local0.0153, fastapi senza misura?), snapshot dei pluginState osservati per istanza, attesa della chiave cache esatta della room con tutte e tre le identità, vero page.reload, identità/readout e pluginState uguali dopo la riapertura. Il setup non cancella più localStorage a ogni nuovo documento: ogni caso ha già un contesto Playwright isolato. Dopo il reload la verifica degli ID è scoped ai plugin; non assume stabili fra documenti gli ID casuali globali di Excalidraw.

Il comando della lane abilita --trace retain-on-failure. L'artifact include sia apps/studio/test-results sia output/playwright, dove la spec scrive realmente PNG/JSON di import e riapertura. Il caricamento dell'artifact su GitHub non è ancora eseguito. Nessuna modifica a codice app, solver, formati, soglie o fix243/260/261.

## Controprove e verifiche

- Runner precedente --list:1testgolden, spec dedicata assente. Runner dedicato:2testdesktop/tablet; spec originale sul candidato2PASS, senza reload. Non è una deduzione dal nome del file.
- Prototipo privato esteso, senza modificare il candidato:2PASS con riapertura reale. Le importazioni del prototipo puntano agli stessi sorgenti e dipendenze; il percorso output è privato. Il file finale nel repo è byte-identico alla sua versione source, senza hook QA.
- Mutante produttivo solo nella risposta JavaScript Vite, valido/eseguito nel browser: il consumer rende entrambe le correnti0.0153 mantenendo identità/layout/factory. L'originale passa2/2 con l'overlay applicato; il nuovo oracolo fallisce2/2 sul dato sim-b0.0153 anziché?. Le trace e gli errori attesi sono conservati. Non è un errore di import o mancata selezione dei test.
- Fault injection distinta, non mutante di codice: beforeunload cancella l'archivio del solo contesto browser sintetico. La spec originale passa2/2 perché non riapre; l'estesa fallisce2/2 dopo il reload, zero post-it anziché tre. Nessun dato personale o archivio dell'utente è coinvolto.
- CLI finale del repository, servizio locale esistente e config QA:2PASS desktop/tablet. Comando esatto della nuova lane con configurazione standard, variabili di baseURL/live rimosse e Vite temporaneo sulla porta5199:2PASS. Il server temporaneo è stato arrestato dal runner; porta verificata libera. Browser già in cache, nessuna installazione/download.
- npm run typecheck:exit0 sul progetto app. La spec E2E è fuori dai project tsc esistenti: è stata trasformata/eseguita da Playwright, non viene dichiarato un suo typecheck statico dedicato. Codice app byte-identico al commit243 già verificato; nessun nuovo build necessario per i soli workflow/E2E.
- Undici controlli di igiene e self-test richiesti:exit0, incluso workflow_trigger_gate e i suoi venti self-test. Diff staged check:PASS.
- Gate congelato invariato:2474PASS/0FAIL/exit0, con2473unit e1replay reale, il cui log è stato copiato e letto. Ambiente Node26/JSDOM già documentato: NODE_OPTIONS=--no-experimental-webstorage, replay non saltato. Il precedente profilo2473PASS/5SKIP appartiene alla tranche243; il nuovo gate2474/0 è eseguito su questi due hash stabili e non riusa il PASS precedente.

Errori del setup preservati separatamente: il primo prototipo privato era fuori da package type:module e non caricava i test; la prima estensione confrontava ID globali casuali fra due documenti, dando due falsi RED. Corretti rispettivamente il package privato e la posizione degli assert: nessun expected originale rimosso o indebolito, nessuna eccezione aggiunta per inseguire il verde. Il conflitto YAML intermedio è stato salvato prima della risoluzione, e nessun check YAML è dichiarato verde su quel file irrisolto.

## Review e pin

Assessment separata: contributo unico recuperabile con adattamento, tre P2 su claim/setup/artifact. La review sul diff finale verifica separatamente YAML, preservation dei cinque job e dei sorgenti app, due hash working/index e identità con il source privato. Le prove del writer sono lette come tali. Nell'assessment il reviewer aveva osservato che gli assert originali non rilevavano un readout costante, ma il suo callback completo falliva anche nel controllo per CDN bloccati: non lo dichiariamo verde o mutante killed. Nessuna API/provider reale. Il reviewer non ha avviato servizi; i Vite temporanei sono gestiti dai runner dei controlli locali.

Verdetto tecnico precommit: APPROVE sui due hash, P0/P1 e nuovi blocker non individuati. Report privato separato SHA256 ca45b1c419b1b3ededb86a47236009944a3d7ad2834322ff4204d89780daf1df. Pin del futuro commit con questa receipt/ledger: PENDING; sarà registrato separatamente senza riscrivere questo fatto storico. Identificatore specifico del modello Codex non esposto; contesto separato non è quorum non-Codex o approvazione GitHub.

```text
043fada0af66a84f671bc34cee4e09df4c7905872d121751077db70c443b1669  .github/workflows/ci.yml
2bd80315dfa8e57cd5a094c1b95b77317c0861cd7e0c41600145a64827aee4a6  apps/studio/e2e/plugin-postit-room-reload.spec.ts

```

Log integrali privati: ardesia244-current-selection/old-lane-selection/current-import, expanded-private, old-observer-mutant, expanded-readout-mutant, old-observer-drop-on-reload, expanded-drop-on-reload, final-reload, exact-job-command, workflow-structural-check, typecheck, hygiene-results, frozen-gate. Prototipi/hook/fault injection restano soltanto nel workspace privato e non entrano nel repository.

## Limiti e destinazione

È una prova su byte sintetici, browser Chromium desktop1440x960 e viewport tablet768x1024; non un test con persone, hardware tablet/stilo, Safari o tutte le viste responsive. Riapre la cache del browser predefinito, non prova durata garantita, FSA o ripresa dopo perdita dell'archivio. I pluginState sono quelli osservati dopo import: non si dichiara coperto ogni campo del payload prima dell'import, né l'export/reimport arbitrario o il completo KERN-001. Il debito copia/incolla245 resta aperto e fuori da questa spec.

Nessun nuovo job eseguito su GitHub, promozione a required, code push, merge in main, deploy o chiusura244. Il recupero resta nel singolo candidato locale Ardesia. Prima della pubblicazione occorrono verifica attuale degli effetti Vercel, CI sul commit corretto, approvazione GitHub distinta e prova di main; nessuna vecchia misura di produzione viene riusata come fatto corrente.
