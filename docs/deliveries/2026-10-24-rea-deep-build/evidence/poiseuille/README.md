# Poiseuille · Web, proiezione pubblica e passaggio Studio/Aula

Base `f456ade218acee1a8b65f5dc24e9220681658b11` (#298). Ownership: `apps/web`, `bin/web/export_public_preview.py`, `bin/web/serve_public_preview.py`; nessun edit di questo autore a Studio, Engine, API o marketing. Sorgenti di questo scope in `source-manifest.json`; il manifest di composizione globale appartiene al root. Nessun commit o push dell’autore.

L’entrata pubblica `/esperienza/?percorso=fluidi-termodinamica` richiede una previsione prima di mostrare risultato, moto medio e grafico. Raggio selezionabile da0,5 a2 con passo0,05 e vincolo Δp/Q; il grafico compare su gesto distinto. Errore, aiuto, ripetizione e problema diverso sono gesti espliciti. Quest’ultimo annuncia il nuovo vincolo, nasconde il risultato e porta il focus al campo della prossima previsione. Il ritorno conserva i quattro ID canonici riconosciuti e conduce a `/?percorso=ID#contatto`; un ID sconosciuto ricade sull’esperienza fluidi. Il contatto esprime interesse, senza attestare iscrizione.

Il controllo autenticato usa ancora `/activities/evaluate` e le ricevute dell’episodio. Il pubblico usa soltanto i62 risultati del Core materializzati dall’exporter:31 raggi per ciascun vincolo, senza interpolazione delle risposte. La velocità media del disegno è derivata alla preparazione da Q/area; i punti sono traccianti schematici del trasporto medio, senza pretesa di profilo locale o conteggio della portata. A raggio2: Δp fissata→Q16 e velocità4; Q fissata→Δp0,0625 e velocità0,25. A raggio0,5 e Q fissata→Δp16. Il modello dichiara regime laminare stazionario, fluido newtoniano incomprimibile, tubo rigido, L e viscosità fissate.

Il recupero pubblico include audio dimostrativo sintetico, comando di avvio manuale accessibile, `preload=none`, errore leggibile e la trascrizione integrale con collegamento esplicito alla formula. La fonte autentica privata è distinta: il docente apre Studio dall’Aula, Studio invia una proposta dopo annotazione/cattura esplicite, Web richiede spiegazione e conferma separata prima di `/resources`. Sono verificate finestra, origine derivata, canale effimero e handshake; nessuna origine arbitraria da query, credenziale o media nel messaggio. La fonte conserva registrazione/sessione/intervallo/digest/versione oggetto e lo studente legge la revisione esatta autorizzata. Il JSON dichiara il riferimento, senza attestare disponibilità di byte remoti. La modalità copia/incolla preesistente resta accessibile nei dettagli.

## Prove riproducibili

- `baseline.log`:21 test originari mirati PASS. `red.log`: nuovi moduli assenti, import failure; è assenza della funzionalità, non RED comportamentale REA.
- REA A successivo all’osservazione donor: `rea-a-focus-red.log` fallisce precisamente su `document.activeElement` (body contro input); `rea-a-focus-green.log` PASS dopo ref/focus minimo. L’errore iniziale del selettore status è preservato separatamente in `rea-a-selector-fixture-error.log`, senza contarlo come RED comportamentale. L’e2e replica Enter, soluzione nascosta, annuncio live e focus sul campo a360/390/820/1440.
- Review P2 pin: `duplicate-pins-red.log`3 FAIL/4 PASS prima del fix singleton. Una lista recording/session/object non può diventare un ID con virgola tramite join. Un singolo pin contenente la virgola resta accettato come dichiarazione, coerentemente con Core.
- Review P2 proposta ciclica: `cyclic-proposal-red.log`1 FAIL/1 PASS prima del catch locale, poi nessuna eccezione o pubblicazione per payload non serializzabile.
- `all-final-focused.log`:33/33 PASS in6 file dopo gli ultimi bordi e dopo il WAV finale. `full-web-rea-final.log`:309/309 PASS in47 file prima degli ultimi due bordi P2; non è etichettato come full finale. Il root/CI ripete la full sul candidato congelato.
- `private-build-complete-final.log`, `public-build-complete-final.log`:build e TypeScript PASS. Resta l’avviso preesistente sul chunk math>500kB nel privato; nessuna nuova dipendenza runtime.
- `public-e2e-complete-final.log`:6/6 PASS su server statico vero5324, quattro viewport, tastiera, reduced motion, confronto numerico, recupero/audio reale, problema diverso, pausa/ripresa dei frame, reset, nessun pageerror/requestfailed o richiesta API. CSP `connect-src 'none'`, media solo self, API GET/POST404, niente SPA fallback. La modalità standalone redirige `/` a `/esperienza/`; il pacchetto composto serve la propria landing a `/`.
- `bridge-final-2/result.json`:16/16 PASS sul privato same-origin5412: teacher UI→Studio `/studio/`→MediaRecorder nativo con traccia sintetica→bozza→conferma Core→replay con audio e highlight→studente/revisione autorizzata. Questo run precede gli ultimi bordi P2. `run-bridge.cjs` è stato esteso e replicato dopo il build unico del root: `bridge-journey-complete/result.json`31/31 PASS su5412 con gli ultimi bordi Web. La successiva correzione Studio della race revoca/prepare è dichiarata separatamente dal root, con RED/GREEN mirato; non è attribuita a questa prova ordinaria.

Comandi dal checkout:

```sh
python3 bin/web/export_public_preview.py --check
npm exec --workspace @ardesia/web -- vitest run --maxWorkers=1
npm run build --workspace @ardesia/web
npm run build:web:public
ARDESIA_BROWSER='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm exec --workspace @ardesia/web -- playwright test --config playwright.public.config.ts
ARDESIA_PUBLIC_BASE_URL=http://127.0.0.1:5414 ARDESIA_BROWSER='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm exec --workspace @ardesia/web -- playwright test --config playwright.public.config.ts
ARDESIA_WEB_ORIGIN=http://127.0.0.1:5412 ARDESIA_DEMO_ACCESS=../deep-build/private-qa/demo-access.json ARDESIA_BRIDGE_OUT=../deep-build/poiseuille/bridge-journey-complete node docs/deliveries/2026-10-24-rea-deep-build/evidence/poiseuille/run-bridge.cjs
```

I build di composizione finale sono eseguiti solo dal root, senza concorrenza sui dist. Le trace rimangono in `work/deep-build/poiseuille`, fuori dal repository; accessi con token scambiati prima delle trace, dati esclusivamente sintetici.

## Replica finale del pacchetto composto

`public-e2e-artifact-final.log`:6/6 PASS direttamente su5414 (`release-final/public`), senza rebuild o proxy. Quattro viewport360/390/820/1440, Enter e focus, reduced motion, animazione normale/pausa/ripresa/reset, WAV eSpeak reale dopo avvio manuale, CSP e rifiuti API mantenuti. Nessun pageerror, richiesta fallita o richiesta API. La landing reale risponde200, i percorsi sconosciuti restano404.

`bridge-journey-complete/result.json`:31/31 PASS su5412 dopo il build unico del root. La prova include cattura nativa sintetica, proposta senza salvataggio, conferma umana della fonte, revisione autorizzata, replay reale evidenziato, quattro ricevute, errore di vincolo, recupero, correzione figlia assistita, problema distinto a raggio dimezzato, review del docente, proposta al diario, assegnazione, consegna e verifica umana della nuova procedura. Tutti pageerror/requestfailed/console vuoti, senza filtro. `receipts.json` conserva le ricevute, e gli screenshot mostrano l’esito trovato nel diario docente.

Le prime due ricevute segnalano `SUPPORT_REQUESTED` con `model-result` perché i risultati erano già disponibili dai tentativi di QA precedenti. La correzione mantiene `parentId`, `lesson-passage` e `model-result`. La terza situazione distinta (raggio0,5, Q fissa) è nuova nel dataset: `NO_SUPPORT_REQUESTED`, lista aiuti vuota, rapporto16. Questo segnale descrive gli aiuti osservati dal servizio; non certifica autonomia o padronanza. Il docente verifica separatamente il procedimento della nuova prova assegnata nel diario.

`source-after.json` conferma gli stessi137 file di ownership, SHA-256 `4ca7866993808aae470feb3eb27f9aee080fbd7417f4894fac5b7d9b138e6caf`, dopo entrambe le repliche. Le trace integrali sono solo in work; i risultati e gli screenshot sono qui. La replica privata integrale è desktop1440; la UI pubblica e lo Studio hanno le quattro prove responsive distinte. Nessuna dichiarazione di autenticazione remota o disponibilità cloud dei media.

## Esiti intermedi preservati

`full-web.log` contiene303 PASS/3 FAIL: il nuovo pannello aggiunge una seconda occorrenza testuale del rapporto. Le tre query sono state rese più precise su `physics-ratio`, mantenendo il valore completo atteso5,0625; nessun timeout o valore atteso è stato ridotto. Il root conserva separatamente il precedente errore TypeScript di fixture `exact` usato per errore in TestingLibrary; corretto prima dei build finali.

`public-e2e-selector-red.log` contiene il selettore generico del raggio, corretto con il ruolo slider esatto. `public-e2e-polish-final.log` preserva5 PASS/1 FAIL sul click a coordinate nel controllo audio nativo: nessuna richiesta WAV era partita a360. Il comando testuale di play ora usa un gesto Enter, verifica currentTime>0 e offre un errore leggibile; l’assert non è stato rimosso. I risultati anteriori alla sostituzione del WAV provano il percorso, ma la prova di quell’audio è ritirata per provenienza/licenza.

`bridge-dev/result.json` conserva i passaggi funzionali riusciti e il FAIL zero-requestfailed per due aborti StrictMode dev, senza filtri. `bridge-final` conserva il timeout del selettore label esatto sul select, pur mostrando la fonte disponibile. `bridge-journey-final` conserva due ricevute reali, recupero e replay riusciti, poi il timeout del selettore label esatto sulla textarea già compilata dopo “Correggi”. I selettori del runner ora usano i ruoli e i prefissi del nome visibile; i timeout rimangono invariati.

## Asset finale e limiti

Il WAV macOS iniziale è stato scartato. L’asset distribuito finale è la spiegazione originale sintetizzata con eSpeak NG formant, senza modello vocale registrato/MBROLA né tool GPL nel runtime:1.806.784 byte,40,969 secondi, SHA-256 `cba509da0fbc7892d2e2ff6f94fa8f040788ffc411cc5be99223e09e0a885508`. Provenienza nel delivery `evidence/assets/voice-provenance.json`; digest aggiornato nella proiezione e controllato dall’exporter. Il file si carica solo al gesto manuale di ascolto nel recupero. JS pubblico239,50kB (gzip70,26), CSS60,06kB (gzip12,58).

La review indipendente ha misurato contrasto insufficiente del testo attenuato: l’opacità è stata spostata sulla sola geometria del riferimento. Screenshot finali `initial-*` e `recovery-*` presenti in questo folder; canvas mobile con testi SVG ingranditi, focus e controllo senza overflow. Il controllo numerico non certifica padronanza, il segnale “nessun aiuto richiesto” non osserva aiuti esterni, e la verifica del diario resta un gesto umano. Nessun provider, ASR, inferenza, autenticazione remota o distribuzione cloud dell’audio è stato aggiunto.
