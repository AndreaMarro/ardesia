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
