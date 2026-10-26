# S11 — raccordi installati, 26 ottobre 2026

Appendice successiva a9fa0600c. Conserva le consegne precedenti e chiude il loro blocco **nel codice della PR**, senza riscriverne gli esiti. Stessa PR312, base main992d1a0b osservata. Nessun merge o deploy da S11.

Il proprietario ha risposto esplicitamente alla richiesta dei tre raccordi: «Sì, applica i raccordi nella PR». La domanda nominava API, shell e restore, lasciando merge e rilascio a S00. L’autorizzazione è stata comunicata nel rendezvous306/6411160039 prima degli edit. Non è una delega generale alle altre superfici.

## Comportamento installato

- `create_app` installa una sola volta il router usando le proprie dipendenze cookie/store/admission. Parametro `learning_insights_notice=None`: raccolta facoltativa disabilitata per default, consenso inventato rifiutato409 e nessun evento scritto.
- Il tabwork della vera App monta lazy `LearningInsights` per l’edizione già autorizzata. I confini sessione/edizione restano quelli del Core e della shell.
- Il vero `operations.restore_data` invalida preferenze e osservazioni facoltative sulla copia di staging, prima di check/rename; revoca le sessioni, preserva le ricevute Core e richiede una scelta nuova. Controprova reale backup→optout→restore, nessuna copia del modulo operatori usata dal test di accettazione.
- Anche le schede sono paginate25perpagina. Filtri e navigazione URL riportano alla prima pagina; l’export resta l’intero sottoinsieme filtrato e rilegge l’API autenticata. Test61ricevute:25/25/11, MATCH, azzeramento→prima pagina.

La precedente patch `shared-integration.patch` è ora **APPLIED_IN_THIS_BRANCH**. Il generatore storico riconosce i raccordi già applicati; la vecchia composizione resta verificabile alla9fa. Il demo corrente usa la factory installata, senza auth/router alternativi; `--synthetic-notice` abilita l’informativa soltanto nel fixture sintetico esplicito.

## Prove e review

35 Core/HTTP/operations PASS sui moduli installati,17 UI namespace PASS e9 regressioni sessione PASS. BuildWeb `tsc -b && vite build` PASS. Controprove storiche dei moduli copiati2PASS restano distinte e non vengono sommate a questi35.

30 controlli Chromium sul compilato vero servito dalla stessa API: entrymodulo assets, PlotSVG reale, fonte/revisioneCore, filtri/reload/back, export fresco, optin/segnalazione/optout, contestazione, tastiera/reducedmotion/mobile390 senzaoverflow, revoca che rimuove l’app privata, docente con prove autorizzate ma aggregato<5nascosto/eventi facoltativi esclusi, peer senza prove/grafico. Zero errori inattesi;401 deliberato separato. Dati esclusivamente sintetici. Le impronte sorgenti e build sono in evidence/installed. Nessuna fonteApp/API trasformata in copia dal runner.

Review separata read-only: P2 riprodotto sul ripristino di una vecchia pagina dopo all→MATCH→azzeramento; testRED e correzione dell’effetto dipendente dai filtri. Review successiva non ha trovato problemi rimanenti nel confine esaminato. Il reviewer non ha eseguito test/build/browser; non è approvazione umana o scientifica.

Due test root/classroom aggiuntivi sono falliti localmente (timeout/aspettativa caricamento) durante contesa host;17test dello stesso run passati. Log conservato, nessun timeout aumentato e nessun test indebolito. CI esatta e prova ripetuta sul commit sono da leggere prima della consegna finale; non trasferire il verde9fa. Il monitor applicativo e i file iCloud dataless non sono un guasto dei servizi Core.

## Riuso e ambiente

Questo incremento collega il consumer Plot già acquisito e il Core esistente; nessuna nuova libreria o capacità da reimplementare. Confronto3donor, REA parziale, licenze42package e bundle96ab3961 invariati e preservati nel precedente addendum. Il bundle di produzione osservato perPlot è244,08kB/85,19kBgzip, non un benchmark didattico.

Il checkout precedente in Documents conteneva anche `.git` e sorgenti segnati compressed,dataless: letture bloccate. Recuperata la commit9fa dal Git comune in `/private/tmp/ardesia-s11-integration-20261026`, senza sovrascrivere il checkout originale. RuntimePython esistente letto da `/private/tmp/ardesia-r1-20261024/services/study-api/.venv`, Node e lock già adottati. Nessuna installazione o account nuovo.

## Riproduzione del percorso installato

```sh
npm run build:web
PYTHONPATH=packages/engine:services/study-api python handoffs/swarm-v2/S11/run_demo.py --data-dir /PERCORSO_PRIVATO_NUOVO --port 55610 --frontend apps/web/dist --synthetic-notice
node handoffs/swarm-v2/S11/run_installed_browser.mjs /PERCORSO_PRIVATO_NUOVO/access.json /PERCORSO_PRIVATO_EVIDENZE
```

Senza `--synthetic-notice` il fixture usa noticeNone. Un data-dir nuovo per ogni scenario, perché optout e contestazione modificano davvero il Core. Chiudere il solo server proprio. Non inserire DB/token/cookie nei deliverable.

## Memoria append-only per S00 e prossimi passi

1. **P0 integrazione S00:** review del raccordo e merge della stessa312 dopo check della head, merge-tree e postmerge; primo passo verificare i3file e rieseguire il test reale di restore. Accettazione: tabwork raggiungibile nella main consolidata, dueidentità/edizioni e revoca verificati. Non riproporre il vecchio hook come ancora assente nel branch.
2. **P0 ambiente S00/S10:** prova privata nel deployment pertinente e policy reale di retention/backup/informativa. Defaultoff conservato; nessuna automazione o raccolta reale autorizzata implicitamente. PostgreSQL e account mai riaperti rimangono da validare.
3. **P1 scala:** misurare dataset/coorti grandi, query Core e carichi concorrenti. La paginazione limita DOM delle schede e della tabella; non certifica scalabilità delle query o efficacia educativa.
4. **P1 S12/S15:** riconciliare propostaPlot dopo integrazione main; dati/provenienza immutabili, nessunLRS o secondoCore. Prossimo candidato xAPI126/Caliper solo con valutazione3donor e consumer utile.
