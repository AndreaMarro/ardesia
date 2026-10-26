# S02 — prova nativa e correzione proposta del Root, 26 ottobre 2026

Appendice alla consegna3326ac2e: fotografie e risultati precedenti restano intatti. Nessuna modifica al codice produttivo Shell/App/API in questo incremento. **Patch Root proposta a S00, non applicata al branch o main.**

## Risultato e fonte

Consumer Memoria reale di S05, fonte `b6cba73dfec35a243da3e4c322ba58546b1ca3fb`, con Shell identica a `3326ac2e30624248c01b67f2ac876671e5ed3886` (gitdiff sul namespace/Shell vuoto). Copia temporanea estratta dai Gitobjects esistenti; originale Documents preservato dopo letture git/rg bloccate. `composition.json` identifica gli hash Root prima/dopo; solo nella copiaQA sono applicati la prop `enabledViews={views}` già proposta da S05 e il fix della cronologia.

Il primo runner riproduce un difetto Root: `navigate` usa sempre replaceState; dopo menu→Memoria→ricerca→Oggi, Back non riapre Memoria. Prima del rosso passano ingresso dalla nav e nota salvata/recuperata byte-esatta dal Core. Conservati `result-red-back.json`, log compresso e screenshot del documento vuoto. Non era un errore della persistenza o di Radix.

`root-navigation-and-availability.patch` propone pushState per una vista diversa e replaceState per quella corrente, così la selezione ripetuta non crea duplicati. Conserva il replaceState di logout/revoca. Entrambe le hunks passano gitapply--check sulle fonti esatte S05b6cb e main992d1a0b. S00 deve comporle con i propri mount e verificarle sulla propria head; nessun grant Root dedotto dal test.

## Prove effettive

Finale **14 controlliPASS** con Chromium148.0.7778.96 cached, cookie/API/SQLite reali e nuovi dati sintetici: menu/ricerca→Memoria; nota create/save/reload con contenuto esatto; Back/Forward; focus main; selezione corrente senza duplicati; studente senza edizioni e docente;1440/820/390 senza overflow. La route independent-study resta nascosta perché non montata in questa fonte. In una fixture tecnica distinta, senza API o feature di dominio: rimozione del risultato focalizzato, contenimento, Escape/ritorno, Tabloop e frecce a1440x900/820x900/390x844/390x320. Il codice Shell reale non richiede un nuovo trap.

Zero errori inattesi di console/pagina. Finale91.999s totali sotto carico condiviso, non benchmark o CoreWebVitals; prima controprova13PASS/5.427s di azioni più45s di attesa controllerREA (50.473s totali) conservata separatamente. Il rilancio finale ha stampato compiler/suite altrui nel campioneps; il launcher ha proseguito prima dell'ispezione di quel campione, errore di coordinamento registrato. Nessun PID altrui terminato; non ripetere una presa basata su un comando ps concatenato al lancio.

Screenshot realmente prodotti e letti dall'agente:1440 cattura lo stato loading autenticato,820/390 il quaderno caricato. Non sono giudizio umano o certificazione WCAG. DevVite, nessun nuovo build/tsc o test remoto. Safari, VoiceOver, dispositivi fisici e nuova composizione integrata/deployment NON_RUN.

## REA/riuso e limiti

Continua REUSE di Radix1.3.1 MIT già adottato; confronto tre candidati e licenze nel precedente batch02, nessun nuovo codice donor/dipendenza acquisito. Osservazione REA passiva del consumer reale **durante** il runner: `ev_222534c8c069f3f0ee0a4de77e67b700f4f623339f1965bfebdf2383d3cb7f8d`, providerCDP2. Policyfiltered e attachlimited, nessun troncamento; niente identità dell'artefatto fornita daREA. Riguarda la finestra osservata, non tutti i passi o la rete precedente. Le azioni14 sono di Playwright e non vengono attribuite aREA. La prima inspect restituisce endpoint_unreachable dopo la chiusura del precedente browser: errore conservato, nuova osservazione sul processo successivo.

Export JSON compressi lossless con digest nel MANIFEST. Nessun database, access code, cookie, profilo o trace. Il log finale esporta solo righe azione: inventario processi altrui escluso; originale privato conservato con hash. Sorgenti originali: fixture, driver e proposta di routing; stato e autorizzazioni rimangono nel Core reale di S05.

## Riproduzione

Usare un target temporaneo assente e lo stesso ambiente già installato; nessun npm/pip install. Preparare con `repro/prepare.py --git-dir <common-git-dir> --target <temporary-root> --node-modules <existing-node-modules> --python <existing-venv-python>`. Dalla radiceQA avviare, in finestra host libera, il Python indicato con `qa/serve.py` e Node con `node_modules/vite/bin/vite.js --config qa/vite.config.ts`. Attendere /study/health e la pagina Vite, poi `node qa/verify.mjs`. Porte loopback5420/5421, CDP5422. Il runner apre un solo browser, registra e chiude nel finally. L'attesa controllerREA è al massimo45s e non fa parte delle azioni di prodotto. Per osservare usare list_browser_targets→inspect_web_page nella finestra attiva, quindi creare `qa/rea.done`; senza capture il risultatoUI può passare ma non costituisce provaREA.

## Prossime azioni per owner

1. **S00 Root:** primo passo applicare/revisionare patch sulla composizione S05/S06; dipendenza316+mount reali. Accettazione: nativeback/forward, ripetizione della vista corrente, menu/ricerca stessi ID e ruoli/senza corsi. Prova su nuovahead, merge tree/main/postmerge e ambiente pertinente.
2. **S02+S01/S06/S08:** primo passo assegnare adozione SurfaceState/SourceStatus/Feedback con heading/role/recovery conservati. Dipendenze writer e mapping Core. Accettazione E2E per consumer, freshnessunknown quando non attestata; non reinterpretare il successo del GET storico.
3. **S02 accessibilità/compatibilità:** primo passo VoiceOver/Safari/device sul journey integrato quando disponibili. Dipendenze host e operatore. Accettazione focus/annunci/touch/zoom e performance misurata sul prodotto reale; geometria e approvazione umana separate.

RUNLOG/NEXT restano al writerS00; questa appendice conserva lo storico. PR316 rimane l'unica S02 attiva, nessun merge/deploy autonomo.

### Correzione datata del rilascio, 26 ottobre 2026

Nel commento6411465580 la frase «porte senza listener» anticipava la lettura conclusiva: il primo lsof, eseguito subito dopo TERM, mostrava ancora Vite5420 durante lo shutdown. Le sessioni API/Vite sono poi terminate entrambe143; la successiva verifica TCP esplicita attesta5420/5421/5422 chiuse. Il browser finale termina EXIT0 prima del rilascio. Nessuna presenza residua attuale dedotta dal solo invio del segnale; aspettare sempre completion e poi controllare i listener.


### Appendice successiva — review e uguaglianza esatta, 26 ottobre 2026

Correzione alla descrizione dei14check e al primo commento di rilascio: la loro asserzione usava substring della proiezione e titolo UI, insufficienti a dimostrare il testo esatto della stessa nota. Il P2 è conservato in REVIEW.md; driver originale in evidence/verify-14-original.mjs. Quel PASS rimane riferito a quelle asserzioni, senza cancellarlo o promuoverlo retroattivamente a prova più forte.

Il nuovo helper exact-note.mjs acquisisce ID dal POST della UI, confronta titolo/testo con uguaglianza esatta suPOST, GETstessoID e proiezione filtrata perID; verifica textContentraw del dettaglio dopo reload. Riusato nel driver completo aggiornato, è stato eseguito nel SOLO mirato verify-exact-session.mjs:3checkPASS in2.752s, include logout→Backall'URLmemory senza UIprivata e GET401. HTTPfactory separato conferma esattamente anche la nota originale dei14check; non sostituisce la prova UI del nuovo helper. Nessun nuovo fullrerun o modifica al prodotto. Follow-upreviewstaticaconferma P2risolto, senza esecuzioni del revisore.

La prenotazione6411769574 segue due snapshot senza suite/compiler/browser. RunnerEXIT0/browserchiuso, API11776/Vite11777 dopo verifica identità terminano entrambeEXIT143; POI TCP5420/5421/5422chiuse. Rilascio6411837108 pubblicato dopo completion. Nessun risultato del mirato è trasferito al cambio edizione, ruolo/sessione sullo stesso history o revoca amministrativa: restano prove future per il Root integrato.
