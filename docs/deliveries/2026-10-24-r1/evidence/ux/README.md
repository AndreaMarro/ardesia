# R1 · continuità della previsione e QA pubblica

Base verificata dal coordinatore: PR299,6f19b1956cedbebf36a5cf097af66e47ed8acecd. Scope autore: PhysicsLab/PoiseuilleVisual/publicPreview, proiezione pubblica e test pertinenti. Marketing/server/builder/Core/private sono ownership del coordinatore o dell’autore privato. Nessun commit,push,pubblicazione,account reale,token,invio WhatsApp,API a pagamento o configurazione cloud da questo autore. Prove sintetiche e raw donor restano qui in work; non sono asset da distribuire.

## Difetti prima dell’intervento

`baseline-defects.json`, due PNG a390 e `probe-baseline.cjs`: retry con Enter lascia activeElement=BODY; dopo un nuovo problema e cambio manuale di vincolo il banner continua a dichiarare Q costante mentre il modello indica Δp fissata. Nessun pageerror. Il primo probe aveva un locator troppo esatto sul label del select: timeout, corretto con combobox/name; questo è un errore del runner, distinto dai due difetti.

`baseline-text200-red.json`, `baseline-text200-360.png`: con font calcolati raddoppiati, le tre quantità superano le proprie colonne e scrollWidth366>360. Primo controfattuale flex-wrap risolve le quantità ma conserva6px di overflow. Ispezione dei rettangoli identifica il min-content della parola nel titolo finale; aggiungendo overflow-wrap:anywhere soltanto a quel titolo, `counterfactual2-text200.json` verifica360=360 e quantità contenute. Sono controprove CSS sulla299, non il GREEN del pacchetto finale. Il coordinatore applica l’ultima regola al checkout recuperato.

## REA: una sola missione ripresa

MissioneC della299, CircuitJS su https://www.falstad.com/circuit/circuitjs.html, percorso Circuits→Basics→Ohm’s Law→Resistors. Il modulo dichiarato nel DOM resta circuitjs112/circuitjs-D4a6dPHu.js; il suo hash live non è stato rimisurato. Il nuovo runtime aggiorna titolo e Current Circuit insieme al cambio di esempio.

Ricevuta nuova `ev_782935bb9b848aa2257a7502c4fbcf91072b0da21aa8c10375317c3ebb7a9c87`, file `C-context-switch-pointer-evidence.json`, SHA2562ccbdd1a30b0023cf74ccd500780afec1a9f5aec42882ca5dda0e980144fc3dc:11/11step completati, complete,7282ms del provider, processo proprio terminato. Estratto verificabile `C-context-observation.json`. Primo tentativo Enter sui li non attiva l’esempio: successivo timeout; ricevuta incompleta `ev_f5343757f30694cd699152bb2b8dc79d6259ccc560ce500a9852ba3d17c908ef`, SHA5699dd0d587fdd3bf647d15cd7ff532c5b098e6c527323bbd58aa1e6cf6f3c1a,18150ms, conservata. Non dimostra un focus donor corretto. Warning/error di serviceworker bloccato dal provider restano nel raw.

CLI6.7.0 effettiva offline, help/provider/doctor salvati. Primo doctor usa per errore Node22.14 della shell; quello con PATH esplicito Node26.5.1 è healthy per lo scope, environment_healthy resta false per provider nativi non configurati. Nessuna riconfigurazione. REA MCP non esposto nell’inventario della sessione; browser scenario via CLI è riuscito. Browser plugin/skill assente; per il prodotto usato Playwright già bloccato dal lock.

`original-contract.md` precede RED/fix: istruzione prescritta soltanto nel suo contesto, modifica manuale→esplorazione libera, retry/reset→previsione focalizzata con risultato/recupero chiusi. Il trasferimento osservato rivendicato è coerenza fra contesto attivo ed etichetta. Focus e accessibilità sono implementazione originale Ardesia e controprova del limite tastiera; nessun codice,solver,immagine o stile GPL è trapiantato. Costo totale engineering/token UNKNOWN; durata cattura non è risparmio end-to-end. Nessuna nuova archeologia generale o altre due missioni.

## Codice e RED/GREEN

- `continuity-red.log`:4FAIL+2PASS; `continuity-green.log`:6PASS. Il primo tentativo di redirezione log aveva un percorso inesistente e non ha eseguito test; non è contato come RED.
- `transfer-red.log`:2FAIL+26PASS, dopo finding scientifico sul problema solo numerico. Nuova prova pubblica: r/r₀=1,η/η₀=2,L/L₀=2,Q fissata→Δp/Δp₀=4. Core calcola anche visual1/4/1; nessuna formula nel frontend.
- `public-final-focused.log`:34PASS su4file; `typecheck-final.log`:PASS Node26.5.1. Il successivo guard Core e la rigenerazione finale appartengono al coordinatore e richiedono la sua nuova identità artefatto.
- `projection-comparison.json`:62parametri e risultati numerici esatti rispetto299; delta floating-point massimo delle visual4,44e−16 dopo derivazione spostata in Core, tolleranza1e−14. Domain comune canonico Core leggibile prima del risultato.
- PhysicsLab usa uno scenario pubblico esplicito, exact lookup, grafico ordinario nascosto durante transfer, geometriaL proporzionale e metadatiη/L; un edit manuale torna allo scenarioη=L=1. PoiseuilleModel accetta visualState/lengthRatio/viscosityRatio anche per i due nuovi casi privati del coordinatore.

L’esperimento audio locale c90c71d5…0f8336,25,549s,rate140 è riproducibile da `generate-voice.mjs`/`voice-provenance.json` ma è SUPERATO: il coordinatore sceglie il generatore versionato preesistente,rate0,95,nuovo WAV530c78a6…738989,42,695s. Non attribuire al candidato finale la prima prova audio. Trascrizione e chiusa v2 corrispondono al nuovo task; approvazione umana audio/scientifica non acquisita da questo autore. Il QA legge durata/hash dal WAV effettivo del pacchetto.

## Misure e verifica finale

`performance-baseline299/`:12campioni,38checkPASS, tre contesti anonimi per390/1440 e per profilo. Plain loopback separato dalla simulazione CDP CPU4/rete150ms,200000B/sdown,93750B/sup. Tutte le risposte HTML/JS/CSS uguali al frozen work/r1/base-public; manifest73cfbfacbf41e2f5d8f76e7ef911d19281a8a0450288d5a9621e3a32e64d70ce,sourceManifestfb2c8fa54a266511f74f5452cf6b5074dace64b1b3a80d75836d8da8ee26ef87 immutati. JS239504/CSS60065byte,3richieste iniziali,0interazione/audio/API. Raw CDP heap/task/script/layout osservati; non sono CPU percentuale OS,fieldINP,fps o diagnosi leak. Event→2rAF è un proxy e include due frame.

`native-zoom2-baseline299.json`: vero zoom tab Chromium200% con chrome.tabs.setZoom, in un profilo anonimo temporaneo e un’estensione locale di sola prova, poi rimossi. Outer1440→inner720,DPR2,visualViewport.scale1; risultato16 e nessun overflow. Questo è distinto dal pageScale2/pinch del runner generale e dalla simulazione testo200 tramite font calcolati doppi.

I runner finali sono `run-public-qa.cjs`, `measure-public.cjs`, `probe-native-zoom.cjs`, `record-journey.cjs`. Accettano UX_REPO per il checkout non cloud,UX_ORIGIN e UX_ARTIFACT.

### Risultato finale del candidato esatto

Commit prodotto `c762e30af0dbfb709a68468a71df16449e96c1b5`, artifact `/private/tmp/ardesia-r1-candidate-c762e30`, origine locale5416. SourceTreeSha256 del builder `f5af01464d4e0c5afd22947513bbc8abb262846f6ff8782bd92a3d5349ba0f6e`,1595file,758asset. SHA del candidate-manifest `ea3b747337f83a7a4b99de4082a883826f42f12579ce62e5db881f9c5feaa853`, del source-manifest `fe84993da8a25fcbfc88dd6b6476b6b82f15eb9a721818aeece34b8596cf8c0e`.

| Controllo proprio | Risultato | Prova |
|---|---|---|
| E2E pubbliche del repository |6/6PASS, quattro viewport, media/CSP/rifiuti404, stato animazione e focus|public-e2e-final.log|
| Journey avversariale |113/113PASS,360/390/820/1440, tastiera, errore/recupero, nuova provaη/L, retry/reset, editmanuale, Back/Forward/reload/directcourse, font200% e pageScale2|public-qa-2/result.json|
| Bytes effettivi serviti |104risposteHTML/JS/CSS/immagine/audio o range, tutte SHA esattamente uguali ai file/byte del pacchetto; nessun consoleerror/warning,HTTPerror,requestfailed,API privata o origin esterno|stesso result.json|
| Zoom reale Chromium200% |PASS, outer1440→inner720,DPR2,visualViewport.scale1; input e risultato16 utilizzabili senza overflow, HTML uguale al pacchetto|native-zoom2-candidateR1.json+PNG|
| Prestazioni candidato |12campioni,38/38checkPASS; stesso protocollo baseline, richieste/bytes verificati|performance-candidateR1/,performance-comparison.json|
| Video continuo |21,52s,1440×1000,VP8,1.848.016byte,SHA2f6bb7a0828e762101754db20545ef43170cbf6a254b4e67b9cf8f1ca946043b|video-1/ardesia-r1-public.webm,ffprobe.json,video-metadata.json|
| Sorgenti di ownership |11file byte-identici prima/dopo, aggregateSHA7a2022fca7e50bb0c12e5684a550c71142a66b5f720afd75d973453b552dd68d; Git c762 invariato; export--check e diff--check finalePASS|source-final-before.json,source-final-after.json|

Il primo runner avversariale `public-qa-1` conserva il FAIL finale del collector: tutte le asserzioni UI a4viewport erano passate, ma navigazioni immediate interrompevano lazyasset landing e response.body perdeva il loader; inoltre URL `/` era mappato a una directory producendo EISDIR. Corretto soltanto il runner: `/`→index.html e termine delle risposte della pagina statica prima di distruggere il documento. Il secondo run mantiene gli assert zero errori e uguaglianza byte, senza filtri di errore o timeout prodotto aumentati. Raw,HTML e screenshot del primo tentativo restano distinti.

`qa-collector-correction.json` conserva conteggi e digest dei due esiti. Il log E2E conserva anche warning CLI di Node26/loader e NO_COLOR: sono output del processo di test, distinti dalla console della pagina verificata.

L’audio canonico finale è `530c78a6075ea26949265a80fe9efc7d23083cf638cb600ec52fb42ddc873989`,1.882.900byte: decodifica e avvio manuale nativi verificati a4larghezze, durata letta dal WAV del pacchetto. Nel video viene mostrato l’avvio manuale, ma Playwright registra solo video: nessuna traccia audio e nessuna rivendicazione di registrazione sonora continua. Frame del nuovo problema ispezionato in video-1/new-task-frame.png; screenshot finali first-viewport,new-task-viewport,text200-viewport a4larghezze in public-qa-2. Il numero di check non è una misura di qualità grafica o efficacia didattica.

### Confronto con299

| Asset iniziali |299|R1|Delta|
|---|---:|---:|---:|
|HTML|580|580|0|
|JS|239.504|249.666|+10.162|
|CSS|60.065|60.135|+70|
|Richieste iniziali|3|3|0|
|Richieste dopo controllo/raggio|0|0|0|

Nessun chunk iniziale aggiuntivo, font remoto,MathLive runtime,audio automatico oAPI. L’audio facoltativo aumenta di76.116byte e non è richiesto all’ingresso. Il bundle include metadati canonici completi e una nuova prova; il confronto non è un esperimento isolato di ottimizzazione.

| Mediana ms ·299→R1 |390 plain|1440 plain|390 simulato CPU/rete|1440 simulato CPU/rete|
|---|---:|---:|---:|---:|
|Load|20,1→22,0|20,7→18,3|1872,2→1925,1|1878,2→1926,0|
|Snapshot visibile/font/2rAF|92,5→90,4|75,0→75,2|2101,9→2119,3|2074,6→2123,9|
|Click calcola→2rAF|40,2→38,5|40,0→41,0|50,0→50,0|52,1→54,3|
|Input raggio→2rAF|20,7→22,5|19,9→18,7|22,8→23,0|19,7→17,8|

Host condiviso, due set sequenziali distinti,n=3, cache HTTP disabilitata ma cache OS/JIT/filesystem non azzerate. CPU4/rete150ms,200000B/sdown,93750B/sup sono emulazioni del browser, non smartphone fisico o rete reale. Heap JavaScript circa3,8MB nei set, metriche CDP task/script/layout conservate: nessuna inferenza di leak o percentualeCPU OS. Non dichiarati INP di campo,fps,consumo,velocità causale o apprendimento. Screenshot e prove automatiche non sostituiscono review visuale indipendente e approvazione scientifica/editoriale umana. Costo totale REA/ingegneria/token UNKNOWN.

Riproduzione con il pacchetto già costruito e servito dal coordinatore:

```sh
UX_REPO=/private/tmp/ardesia-r1-20261024 UX_ORIGIN=http://127.0.0.1:5416 UX_ARTIFACT=/private/tmp/ardesia-r1-candidate-c762e30 node run-public-qa.cjs
UX_REPO=/private/tmp/ardesia-r1-20261024 UX_ORIGIN=http://127.0.0.1:5416 UX_ARTIFACT=/private/tmp/ardesia-r1-candidate-c762e30 UX_LABEL=candidateR1 node measure-public.cjs
UX_REPO=/private/tmp/ardesia-r1-20261024 UX_ORIGIN=http://127.0.0.1:5416 UX_ARTIFACT=/private/tmp/ardesia-r1-candidate-c762e30 UX_ZOOM_LABEL=candidateR1 node probe-native-zoom.cjs
UX_REPO=/private/tmp/ardesia-r1-20261024 UX_ORIGIN=http://127.0.0.1:5416 UX_ARTIFACT=/private/tmp/ardesia-r1-candidate-c762e30 node record-journey.cjs
```

Eseguire con PATH=/opt/homebrew/bin:$PATH per lo stesso Node26.5.1. Usare nuove directory output per preservare questi originali. Nessun rebuild di prodotto è eseguito dai runner.

## Recupero filesystem

Dal checkout Documents, git rev-parse e diff--check terminano con fatal:mmap failed:Operation timed out,exit128. Il coordinatore ha diagnosticato packed-refs32KiB con0blocchi, non leggibile per filesystem cloud, e ricostruito /private/tmp/ardesia-r1-20261024 dalla base299 con33fileR1 verificati. Tutti gli edit al vecchio source sono sospesi da quel momento. `source-freeze.json` è PREFINALE e non include i cambiamenti finali audio/generated/h2 del coordinatore; l’identità finale deve essere quella del suo nuovo manifest.
