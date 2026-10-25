# Poiseuille — prove dell’incremento

Base del checkout condiviso: `ae25b93b`, dipendenza dalla draft #297. Questo file
documenta il filone esperienza; SHA finale, CI e giudizio complessivo sono del root.

## Percorso e autorità

Aula → **Apri episodio guidato**. Il laboratorio libero resta disponibile.
Tre previsioni si salvano come normali consegne Study prima che la UI mostri il
risultato Core: raggio doppio a Δp fissata → 16; raggio doppio a Q fissata → 1/16;
problema diverso RF-04 con raggio dimezzato e Q fissata → 16. Non esiste un registro
di tentativi dell’episodio separato dal Core.

Il manifest editoriale risolve attività/esercizi del CoursePack immutato, con la
versione e lo SHA dell’edizione. La seconda variante usa RF-02/RF-03/TR-A3 nello
stesso renderer. Stato DRAFT; nessuna approvazione scientifica attribuita al calcolo.

Il tutor incolla il riferimento prodotto dalla lavagna e una trascrizione, poi
condivide esplicitamente una risorsa Core `lesson-passage` di gruppo. La previsione
conserva `(resourceId, revisionId)` della fonte e il proprio originale privato come
primo riferimento: Review e diario possono ancorare il procedimento dello studente.
Il recupero rilegge solo la revisione autorizzata e apre la lavagna locale con pin
sessione, recording, digest, oggetto/versione e tempo nell’intervallo. Il JSON non
dimostra disponibilità dei byte; il replay la verifica. Nessun port è nel prodotto.

`activityEvidence` vive nella ricevuta canonica, non in nuove tabelle. Il Core
verifica attività/parametri e calcola separatamente rapporto e vincolo. Gli aiuti
richiesti sono dichiarati dal client; un risultato già disponibile per lo stesso
step viene aggiunto dal server anche dopo riapertura. Questo non prova assenza
di aiuti esterni e non attesta padronanza. La review e la verifica del trasferimento
richiedono ancora i comandi tutor esistenti; le prove sotto usano attori sintetici.

## Test eseguiti durante lo sviluppo

| Prova | Esito osservato |
| --- | --- |
| Nuovo percorso UI prima dell’implementazione | RED: titolo episodio assente |
| Nuovi contratti Core prima dell’implementazione | 4 FAIL: parametro evidence e modulo mancanti |
| Riapertura dello stesso step dopo risultato | RED: assistenza cancellabile; GREEN dopo lettura dei receipt precedenti |
| Core esperienza | 6 PASS, incluso budget fonti atomico |
| HTTP fonte→tre previsioni→candidate→publish→osservazione→assegnazione→practice→verifica tutor | PASS, con `syntheticTutor` esplicito |
| HTTP URL/sessione/digest/versione oggetto alterati | PASS: rifiuto 422 e nessuna consegna |
| Web episodio | 4 PASS: prima previsione, tre step/exact source, retry immutabile senza risultato anticipato, pin |
| Web regressioni selezionate classroom/course workspace/public/workflows + episodio iniziale | 5 file, 36 PASS |
| Typecheck Web | PASS dopo correzione conflitto case-insensitive del nome file |

La review indipendente ha confermato un difetto sul budget: cinque riferimenti
forniti dal chiamante più l’originale dell’episodio producevano sei fonti e
bloccavano l’export del quaderno (contratto massimo cinque). La regressione RED
è stata corretta rifiutando più di quattro fonti in ingresso quando si aggiunge
l’originale, prima di ogni mutazione. Quattro più originale restano cinque.
Un altro RED HTTP ha dimostrato che `urlparse` accettava una porta non numerica
senza leggere `url.port`; ora quel riferimento è rifiutato, come già nel client.

Il test HTTP ha inizialmente atteso 400; il contratto StudyError risponde 422.
È stata corretta l’aspettativa al contratto esistente, conservando errore e assenza
di scrittura. Warning osservato: deprecazione Starlette TestClient/httpx; nessuna
dipendenza è stata cambiata per nasconderlo.

Comandi dal root del repository:

```sh
PYTHONPATH=packages/engine:services/study-api services/study-api/.venv/bin/python -m pytest packages/engine/tests/study/test_learning_experiences.py services/study-api/tests/test_learning_experience_http.py -q
npm run test:web -- src/__tests__/poiseuille-episode.test.tsx
npm run typecheck:web
```

## Browser reale

Browser plugin non disponibile: Playwright/Chromium del lock del progetto.
`run-journey.cjs` usa l’API SQLite sintetica in esecuzione e il descriptor/bundle
prodotti dalla cattura nativa della lavagna, importa il bundle tramite UI, condivide
la fonte tramite UI e percorre errore→recupero reale→nuova prova→review→diario.
Le autenticazioni sintetiche precedono ciascuna trace per evitare token nelle prove.

```sh
ARDESIA_DEMO_ACCESS=../study-qa/demo-access.json \
ARDESIA_PASSAGE_DESCRIPTOR=../studio-ui-run-3/passage.json \
ARDESIA_LESSON_BUNDLE=../studio-ui-run-3/lesson-a.lesson \
ARDESIA_POISEUILLE_QA_OUTPUT=../poiseuille-ui-run-7 \
node docs/deliveries/2026-10-24-audio-v2/evidence/poiseuille/run-journey.cjs
```

Risultato browser da associare al run eseguito dal root. Screenshot desktop/390 px,
focus/tastiera, preferenza movimento ridotto, crash, warning ed errori di rete sono
rendicontati separatamente in `result.json` e nelle trace. Nessuna prova locale
certifica dati reali, autorizzazione remota, tutti i browser o efficacia didattica.

Run intermedi conservati fuori dal repository: run-1 si è fermato su un locator
`getByLabel exact` del test per un select annidato; run-2 presumeva durata HTML
audio finita; run-3 leggeva `ArrayBuffer.byteLength` dopo il detach di
`decodeAudioData`. Le correzioni hanno riguardato lo script. Run-4 ha completato
il ciclo desktop fino alla verifica del diario e decodificato i 21.413 byte reali
importati (1,319977 s); si è fermato sullo stesso tipo di locator nel loop mobile.
Non sono PASS integrali. Il run finale aggiunge manifest hash di tutti i sorgenti
di prodotto prima/dopo, per rifiutare attribuzioni a codice mutato durante la prova.

Run-5, con sorgenti invariati prima/dopo (`f33e859c…`), si è fermato sull’import
del bundle del run Studio-1. La trace contiene l’errore prodotto esplicito
`Audio bundle: canonical recordings require reader schema version 2`: la fixture
era stata esportata prima del nuovo requisito, non è un timeout attribuibile al
carico. Il nuovo run deve usare descriptor e bundle rigenerati dal candidato con
reader schema 2. Nessun validator o timeout è stato indebolito per accettare il
vecchio file sottodichiarato.

## Esito browser finale — run-7

**20/20 controlli PASS**, Chromium reale, API SQLite e attori sintetici; nessun
mock del servizio. Import effettuato tramite UI del bundle reader-2 generato dalla
cattura nativa Studio run-3. Replay aperto dal recupero sul recording/sessione,
digest e versione oggetto effettivi: 20.447 byte, durata decodificata 1,259977 s.
Il descriptor è dichiarazione del docente; la disponibilità dei byte è stata
verificata dal replay e dalla decodifica del blob effettivamente caricato.

Il journey ha attraversato fonte condivisa→previsioni 16/0,0625/16→errore sul
vincolo→trascrizione e popup reale→candidate privata→restituzione del tutor→
osservazione ancorata all’originale→nuovo problema assegnato→procedimento→verifica
del tutor. Una rilettura autorizzata ha confermato `VERIFIED_RESOLVED` sul thread
esatto della seconda ricevuta di run-7; lo screenshot `teacher-current-thread-verified-desktop.png`
inquadra il marker di quel tentativo, evitando di attribuirgli una card storica.

A 390×844 px tutti e tre i controlli di previsione hanno bounding box nel viewport;
Tab dal procedimento raggiunge il submit e Invio consegna la seconda variante,
che restituisce 2,0736. Preferenza movimento ridotto attiva. Screenshot desktop e
mobile sono stati ispezionati. Nessun crash, warning/error console o risposta HTTP
≥400. Restano **25 richieste `net::ERR_ABORTED`**, conservate in `result.json`,
durante StrictMode, cambi account/route e smontaggio delle fonti; non vengono
riclassificate come richieste riuscite.

586 sorgenti di prodotto, lock e configurazioni hanno lo stesso hash aggregato
prima/dopo:
`f33e859cba7621a01298b6ce4fdb7acd5caaa943007317b72e4157913b2886e4`.
I file finali sono in `../poiseuille-ui-run-7` rispetto al checkout; il root
associa gli artefatti necessari alla consegna finale e allo SHA pubblicato.

Il dataset conserva i tentativi dei run precedenti: il trasferimento di run-7
risulta correttamente assistito per un risultato già disponibile, anziché
resettare l’evidenza alla riapertura. La nuova risposta della seconda variante
dello studente sintetico distinto non ha aiuti richiesti. I test Core/HTTP su store
nuovo coprono separatamente il trasferimento senza aiuto richiesto. Nessuna di
queste prove equivale a efficacia didattica o revisione scientifica umana reale.

Il riepilogo distribuibile è [browser-result.json](browser-result.json). Le trace
raw restano fuori dal repository: Playwright registra header di sessioni sintetiche.
Le copie in `../poiseuille-ui-run-7/sanitized-traces` hanno quei valori redatti,
con digest raw/copia e controllo assenza delle credenziali osservate nel
[manifest](trace-sanitization-manifest.json). Lo script riproducibile è
[sanitize-traces.py](sanitize-traces.py). La redazione è esplicita; una copia
sanificata non è presentata come archivio raw byte-identico.
