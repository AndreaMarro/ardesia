# Registro append-only — S06 acquisizione, 26 ottobre 2026

## Candidato su base ff384000, prima del commit acquisizione

- Donor:41 contratti upstream PASS in2.78s, log fsrs-upstream.log. Codice originale/adattato e test verificati per hash in PROVENANCE.json.
- TDD adattatore:10 FAIL attesi con stub NotImplementedError, poi10PASS dopo implementazione. Log RED preservato. Successivamente aggiunto contratto di secondo ciclo con undo/checkpoint limitato; da verificare nella consegna esatta.
- Core/HTTP:82PASS,1warning Starlette/httpx deprecation,28.62s (26Core+10adapter+41upstream+5HTTP). Un precedente test di riapertura era fallito nel solo harness per colonna principal_id inesistente: corretto in student_id; nessuna modifica allo schema o controllo autorizzativo.
- Web primo comando: FAIL harness, root sbagliata/no test files found. Comando corretto: due nuovi test FAIL su nome accessibile dei pulsanti; aggiunto nome esplicito con scelta e data. Poi9PASS; revisore ha riprodotto un P2 (due409 scheduler presentati come conflitto generico). Fix con messaggi specifici e due regressioni:11WebPASS/3file in9.41s. Log falliti e verdi distinti, timeout/gate invariati.
- Typecheck: primo processo S0642749 terminato volontariamente alla scoperta di due tsc S04 concorrenti, nessun PASS attribuito. Rilancio seriale `npm run typecheck` exit0 prima della sola correzione messaggi409. Nessun build/fullsuite locale aggiuntivo.
- REA: processo reale exit0, evidence completa e output/probe separati. Non è prova di main/prod o efficacia didattica.
- Browser reale: scheduler-browser.mjs,25controlli PASS/27.499s, zero errori console/pageerror inattesi. Cookie/API/SQLite veri su loopback con due identità sintetiche; quattro rating+undo, fonti/assistenza/2receipts invariati, data personale, reload, nuova sessione cookie, Tab/Enter, touch390, no overflow, revoca e cancellazione copia locale. Le quattro coppie rating/undo misurate389/589/476/642ms; osservazione locale singola, non SLO o benchmark generalizzabile.
- Screenshot desktop1440 e touch390 letti visivamente. La nuova immagine della molla mostra il punto Core nel grafico; la vecchia screenshot prima del fix resta distinta nello storico precedente.
- API/Vite propri56408/56417 terminati dopo browser, nessun PID altrui toccato. [Rilascio slot](https://github.com/AndreaMarro/ardesia/pull/306#issuecomment-6406008304).

La prima CI verde ff384000 e il suo browser14PASS rimangono prove del primo incremento. Non sono promossi a verde dell'acquisizione. Commit finale/CI e composizione shared saranno appendici successive. Il candidato resta READY_FOR_INTEGRATION solo dopo le prove esatte; DONE richiede integrazione e ambiente appropriato.

## Chiusura codice e raccordo alla main

Commit acquisizione `267425d9`; merge ordinario della main `992d1a0b5cdf40d94259d3be698a4d6c5dcc1231` in `32b002e2914185a5d0fb7989762399daf19e06f6`, senza conflitti o forcepush. Nessuna modifica al prodotto S06 nel merge: inventario27file verificato byte per byte dopo l'allineamento. `git apply --check` della patch installerAPI e whitespace PASS.

Ultimo comando dominio:37PASS in27.85s (26Core+11adapter), incluso secondo ciclo/undo. Donor41PASS e HTTP5PASS restano le verifiche separate delle stesse sorgenti; totale83 contratti pertinenti, senza dichiarare un'unica nuova esecuzione83. Web11PASS e browser25PASS sulle stesse sorgenti inventariate. Review separata: nessun altro difetto azionabile, un P2 messaggi risolto con regressioni. CI della head di consegna da leggere separatamente dopo push; non viene presunta da questi PASS locali.

## Correzione di packaging dei log — stesso 26 ottobre

Head6a3a07c8: igiene CI40253316401 FAIL sul solo step whitespace, causato dagli spazi/righe finali dei log allegati. Il precedente controllo locale `git diff --check` copriva solo working tree, non l'intero intervalloPR: rettifica esplicita, non un PASS di quel gate. Gli altri stepigiene, inclusi NUL/secrets/boundary/inventory, erano PASS.

I sette log coinvolti sono preservati byte-esatti in `.log.gz`, compressione lossless con manifest SHA256/bytecount e roundtrip verificato. I file originali restano anche nel commit6a3a07c8. Non vengono normalizzati, tagliati o riscritti risultati storici. I riferimenti storici a quei nomi `.log` si leggono ora tramite il relativo `.log.gz` e RAW-LOGS-MANIFEST.json. Nuovo controllo `git diff --check origin/main` PASS sull'intero diff, senza cambiare gate o sorgenti prodotto. Nuova CI head necessaria.
