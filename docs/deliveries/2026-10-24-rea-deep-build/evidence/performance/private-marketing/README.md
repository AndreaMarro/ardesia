# Caricamento Studio e marketing · confronto circoscritto

Nessun edit di prodotto, build actual, token, audio capture o lettura di dataset utente. Baseline Studio ricostruito da `f456ade218acee1a8b65f5dc24e9220681658b11` in `work/deep-build/performance-baseline-studio`, includendo gli alias originali `plugins/elab-tutor` e `packs/elab-tutor`. I lock root e Studio erano identici al candidato artifact2 al momento del build baseline. Dipendenze collegate per-package; `.tmp`, `.vite` e `.vite-temp` sono cartelle locali, così il build isolato non scrive cache del checkout actual. `baseline-source.json` conserva file/hash. Primo build Node22 scartato e conservato in `baseline-build-node22-attempt.log`; il build usato per le misure è quello Node26.5.1 in `baseline-build.log`. Il messaggio Git fallback “not a git repository” del build isolato è previsto: la provenienza è impostata esplicitamente a f456 e validata dalla config originale.

Baseline marketing: artifact statico già preparato dal root in `work/deep-build/baseline-marketing`, servito su5420. Baseline Studio su5419; candidato Studio su5412/studio/ e marketing su5414. Confronto con release-final-2, sorgenti aggregati `d8d28f7d14495778fd4f7e688037def42766b0ce4d6ab7e2210763b60d75597d`.

## Campioni originari

Un solo run,24 campioni: baseline/candidato per Studio/landing,390/1440, tre contesti Chromium isolati nuovi per ciascuna combinazione. Ordine delle coppie invertito nel secondo campione per ridurre un bias temporale costante, senza attribuire significatività statistica a n=3. Attesa load, Studio Excalidraw visibile, `document.fonts.ready`, due rAF. JS/CSS conteggiati dalle risorse completate a quel punto;82 risposte HTML/JS/CSS confrontate byte per byte con gli artifact corrispondenti. Nessun API Study, pageerror, requestfailed o status HTTP di errore.

`run.log` e `failure.json` preservano il FAIL successivo alla raccolta: sia Studio base sia candidato richiedono font MathLive da `unpkg.com`, con redirect alla versione0.111.1. L’assert “tutte risposte sullo stesso origin locale” rimane falso, senza filtro o rinomina verde. I24 campioni non sono stati ripetuti: `summarize.cjs` deriva `summary.json` e `samples.json` dagli originali. Marketing è tutto locale; il load/render Studio include dipendenze e caching esterni non controllati.

Mediane locali in ms; “snapshot” è il proxy descritto sopra, inclusivo del trasporto dell’automazione.

| Superficie | Larghezza | DCL base→candidato | Load base→candidato | Snapshot base→candidato |
|---|---:|---:|---:|---:|
| Landing |390|9,4→9,5|22,2→23,5|48,1→61,4|
| Landing |1440|7,9→9,0|20,0→23,8|52,4→59,5|
| Studio, prima del fix font locale |390|18,2→23,3|18,3→23,3|909,2→882,0|
| Studio, prima del fix font locale |1440|17,6→23,3|18,0→23,3|460,8→874,2|

Asset iniziali JS/CSS completati al punto di misura, byte decodificati (non tutto il dist e non traffico complessivo):

| Superficie | JS base→candidato | CSS base→candidato |
|---|---:|---:|
| Landing |4.986→4.986|15.294→17.421 (+2.127)|
| Studio pre-fix font |3.098.580→3.109.558 (+10.978)|162.842→169.721 (+6.879)|

Le due larghezze hanno gli stessi insiemi iniziali JS/CSS. Il gzip nei JSON è calcolato offline e non indica compressione effettiva sul filo. Le dimensioni cross-origin possono risultare0 dal Resource Timing: il totale delle risorse Studio non va interpretato come un conteggio completo dei font CDN.

## Controllo finale Studio dopo il fix font

Il root ha assegnato il finding preesistente all’autore Studio. Dopo verifica primaria del changelog, il finale passa a MathLive0.111.1 per la correzione concreta del renderer/editor, con font locali e caricamento differito. I lock identici dichiarati sopra riguardano esclusivamente il confronto originario baseline/artifact2; nel finale3 la versione è cambiata esplicitamente. La baseline built è conservata e non viene ricostruita contro le dipendenze nuove. Web/marketing non ricevono altri cambiamenti funzionali; il root aggiorna i pin dell’adapter Web coerentemente con la dipendenza.

`run-final-studio.cjs` ha completato sei contesti nuovi, tre per390/1440: **9/9 check PASS** in `final-studio-summary.json`, con righe originali in `final-studio-samples.json`. Chromium148.0.7778.96 e Node26.5.1 rilevati durante il run. Release-final-3 del commit `375dbe8d50ce46fab1e47704d73e548c797da09c`, aggregato sorgenti `95f3fe6faadd52ac412a8f8de8f065429e6402e743aa935bba9d7c311fa2df92`, invariato dopo il run. Le risposte HTML/JS/CSS/woff2 corrispondono per SHA256 ai file esatti di `beta/studio`. Tutti gli URL iniziati sono sull’origin locale esatto; nessuna API Study, pageerror, requestfailed, errore HTTP o overflow. La scena Excalidraw vuota è visibile e il font set corrente è caricato. Screenshot finali: `final-studio-390.png`, `final-studio-1440.png`. Il set originale con il suo FAIL resta distinto e intatto.

| Studio finale3 | DCL mediano ms | Load mediano ms | Snapshot mediano ms | LCP osservato mediano ms |
|---|---:|---:|---:|---:|
|390, tre contesti|21,9|22,3|854,2|508,0 (3/3)|
|1440, tre contesti|23,0|23,1|860,9|440,0 (3/3)|

Per entrambe le larghezze, gli asset iniziali completati sono25 JS (2.306.195 byte),2 CSS (169.721 byte),4 woff2 (85.888 byte). Totale iniziale di tutte le risorse completate:2.561.804 byte. Rispetto alla baseline Studio, i JS richiesti scendono di792.385 byte (circa25,6%); i CSS crescono di6.879 byte. È un confronto deterministico dei file richiesti, che comprende caricamento differito e aggiornamento MathLive espliciti; non attribuisce il delta dei tempi al solo peso JS. Non sono stati eseguiti altri build del checkout da questo autore.

## Limiti

Host condiviso durante il gate Studio del root, nessun CPU/network throttle. Contesti nuovi isolano HTTP/site storage, senza azzerare cache OS/font/processo/JIT/filesystem. Browser headless su desktop a viewport390 non è un dispositivo mobile fisico. Server baseline Python diversi dalla composizione FastAPI/statico candidata. `fonts.ready` descrive il font set corrente, non certifica che inizializzazioni asincrone tardive di librerie abbiano terminato ogni download. LCP può non essere già consegnato dall’observer al punto di misura: campioni mancanti restano null.

Non sono misurati INP di campo, fps, consumo, replay pieno, performance di cattura audio o apprendimento. Non si deduce uno speedup o una regressione causale dai piccoli delta temporali. La variazione JS/CSS è deterministica per gli asset richiesti e verificati; il passaggio da font CDN a font locali è un cambiamento di prodotto esplicito e rende non equivalente il confondente rete fra base e finale.

Riproduzione dal checkout, con server e artifact già pronti:

```sh
PATH=/opt/homebrew/bin:$PATH node docs/deliveries/2026-10-24-rea-deep-build/evidence/performance/private-marketing/run.cjs
PATH=/opt/homebrew/bin:$PATH node docs/deliveries/2026-10-24-rea-deep-build/evidence/performance/private-marketing/summarize.cjs
ARDESIA_PERF_RELEASE=../deep-build/release-final-3 PATH=/opt/homebrew/bin:$PATH node docs/deliveries/2026-10-24-rea-deep-build/evidence/performance/private-marketing/run-final-studio.cjs
```

Il primo comando riproduce anche il FAIL di dipendenza remota sullo Studio pre-fix: non è un gate prodotto cambiato per far passare il candidato. Per ricostruire esattamente la misura originaria bisogna servire l’artifact2, non sostituirlo con il finale3.
