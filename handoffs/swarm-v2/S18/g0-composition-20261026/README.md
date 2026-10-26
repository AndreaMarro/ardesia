# G0 Poiseuille: un percorso reale fra PDF, lezione e risposta

**26 ottobre 2026 — PASS locale sintetico sul prodotto `6ecbdc4d78d675207056a63af38fccbd89ca5c5a`.**

La prova finale usa un solo Core, lo stesso docente e lo stesso studente, due browser distinti e le superfici ordinarie Web/Studio compilate. Attraversa PDF originale, annotazione e formula, audio e oggetto della lavagna, risposta S20, feedback docente, problema successivo e riapertura dopo il riavvio. I componenti non sono dichiarati G0 sulla base di prove separate.

Questo esito riguarda il percorso **G0 locale sintetico**. Non attesta backend remoto, provider storage, G1, approvazione scientifica, padronanza, completamento del corso, pubblicazione o merge su main. S20 viene abilitato esplicitamente nel build privato della prova; il default del prodotto resta OFF.

## Provenienza

| Riferimento | SHA |
| --- | --- |
| Base congiunta S00 | `5d93186462abf787e225d3bed37e241d23495241` |
| Raccordi tipizzati | `34eccf94350035cded2d8a317fbe4ead8e28a0ce` |
| Apertura media senza perdere il draft | `4bf40ced2cad045fb6aa73f2d3354b3d622bf807` |
| Guard consenso media integrato come merge parent | `34e1db4a11c7823e26a3685052dcef1f10de08db` |
| Prima composizione e prima prova funzionale | `ec5f19076d07f5a71b6151d8cd89bf33c8713a64` |
| Prodotto finale, con isolamento CSS e reader adattivo | `6ecbdc4d78d675207056a63af38fccbd89ca5c5a` |
| Tree del prodotto finale | `fd667384892ff118e4594c789e13a0062150ab84` |

Branch locale: `local/g0-source-media-20261026`. Il commit che aggiunge questa consegna contiene soltanto prove e documentazione; non cambia i byte runtime provati. S00 conserva ownership di integrazione, gate congiunti, CI remoto e pubblicazione.

Il [risultato finale](golden/result.json) registra hash aggregati e numero di file delle due build. Il runner verifica che HEAD, sorgenti tracked e output compilati non cambino durante la prova. Verifica anche che gli eventi nel bundle realmente esportato dichiarino lo stesso commit produttore, e confronta i byte audio, la versione dell’oggetto e il capitolo con il descrittore pubblicato nel Core.

## Raccordi di prodotto

1. **Passaggio → Materiali esatti.** `SourceViewer` apre una route tipizzata con resource ID e revision ID. La nuova scheda è dichiarata nel testo visibile e usa `noopener noreferrer`; il draft S20 aperto rimane nella scheda originale. Il parametro del checkpoint viene conservato.
2. **Lettura media senza sostituzione.** La libreria usa la coppia esatta. Se la revisione non coincide con il workspace corrente, legge la revisione storica dal Core e controlla identità, edizione e struttura. Riferimenti malformati, duplicati, mancanti o negati non diventano una lettura del contenuto corrente. I vecchi bookmark con il solo resource ID restano una modalità legacy esplicita.
3. **Fonti S18 nel percorso.** S20 ammette `living-source` e `living-annotation` di gruppo. I titoli sono proiezioni leggibili, senza mostrare il JSON della risorsa. Il reader esistente conserva verifica, autorizzazione e originale esatto. Anche l’etichetta del collegamento nell’indice media usa la proiezione leggibile.
4. **Aiuto e ricevuta.** L’adapter confronta il `helpSource` del draft con `activityEvidence.lessonPassageRef` e con i riferimenti della consegna. Un cambio della revisione dell’aiuto non viene accettato al ripristino della ricevuta. L’avanzamento al problema successivo continua ad azzerare l’aiuto: per dichiararlo nuovamente occorre consultare di nuovo il passaggio.
5. **Composizione visiva reale.** Il nome della sidebar dell’app è `ps-sidebar`, distinto dal selettore globale del CSS PDF.js. I due E2E che dipendevano dalla classe usano il ruolo e il nome accessibile dell’aside. Il reader usa la propria larghezza come contenitore per gli stessi breakpoint 1050/600; il `ResizeObserver` già presente riapplica il fit senza nuovo codice JavaScript di ridimensionamento.

Questi raccordi usano risorse, revisioni, CAS, sessione e ricevute Core esistenti. Nessun secondo ledger, grant, session authority, dipendenza o gate viene introdotto.

## Percorso finale effettivamente eseguito

La fixture crea soltanto tre attori sintetici, l’edizione e un PDF originale generato dal codice incluso. Tutte le scritture del lavoro didattico passano dai controlli del prodotto. Login, letture di verifica e controlli negativi usano HTTP reale; il server è la factory `create_app` ordinaria, senza backend di successo, sostituzioni in memoria o trasformazioni dei sorgenti.

| Passaggio | Evidenza verificata |
| --- | --- |
| PDF del docente | Upload da Materiali; hash Core uguale ai byte originali; selezione nativa PDF.js dell’equazione |
| Annotazione e formula | Blocco esplicativo e LaTeX salvati; riferimento esatto a PDF, pagina e digest; contesto lezione fornito dalla route tipizzata `living` |
| Aula → Studio | Popup e handshake reali; room `aula-fluidi`; annotazione sulla lavagna; microfono OFF iniziale e consenso esplicito |
| Registrazione e capitolo | MediaRecorder reale su dispositivo sintetico; writer canonico; oggetto e versione; invio del passaggio all’Aula e condivisione esplicita nel Core |
| Media → PDF | Indice creato nell’editor Materiali; fonte media con ID/revisione/hash e link alla revisione esatta dell’annotazione |
| Trasferimento locale | Export `.lesson` dalla UI; import esplicito nel browser nuovo dello studente, senza copia diretta di OPFS o identità |
| Consultazione | S20 registra il passaggio come aiuto; la nuova scheda apre la revisione media esatta; replay importato arriva a fine audio; dall’indice si riaprono annotazione, formula e PDF |
| Primo problema | Previsione 16 a Δp costante; manipolazione da tastiera del laboratorio; valutazione Core; procedimento e formula; ricevuta con annotazione e aiuto esatti |
| Feedback | Lo stesso docente apre la vera UI Review, inizia e restituisce la correzione; lo studente la rilegge nel percorso |
| Problema successivo | La risposta precedente e l’aiuto vengono azzerati; nuova consultazione esplicita; previsione 1/16 a Q costante; seconda ricevuta distinta |
| Riavvio e ritorno | Core arrestato e riavviato con PID diverso; browser nuovo; reimport esplicito del bundle; seconda ricevuta, feedback precedente, PDF e replay originali riaperti |
| Isolamento ed errori | Peer iscritto riceve 403 su checkpoint e ricevuta privati; una revisione media inesistente riceve 404 e non apre la revisione corrente |

Il Core aggiunge atomicamente una terza fonte alla consegna: l’originale privato del tentativo. La prova ne controlla kind, owner, visibilità e testo; non lo confonde con la fonte PDF, raggiunta attraverso il target dell’annotazione. La formula del PDF e della risposta usa il consumer notebook esistente; il lavoro S14 di inserimento formula nella Room rimane una composizione distinta di S00.

## Risultati

| Verifica | Esito |
| --- | --- |
| Nuovi raccordi, prima dell’implementazione | 7 RED |
| Nuova scheda e mantenimento del draft | 1 RED / 7 PASS → 8/8 GREEN |
| Suite finale mirata Web, media, Journey, shell e mount S18 | **41/41 PASS, 9 file** |
| Build Web ordinaria, incluso typecheck | **PASS** |
| Build Studio ordinaria, incluso `tsc -b` | **PASS** |
| Golden finale con Core reale, Chromium 148.0.7778.96 | **23/23 PASS** |
| Layout reale dopo caricamento PDF, quattro larghezze | **6 RED / 10 PASS → 16/16 GREEN** |
| Errori JavaScript, richieste esterne, HTTP 5xx nel golden | **0** |
| Body overflow 1440 / 820 / 390 / 360 | **Assente** |
| Sorgente e build stabili durante il golden | **PASS** |

La sola risposta browser HTTP negativa è il 404 provocato deliberatamente sulla revisione inesistente. I 403 del peer sono richieste di verifica HTTP dirette. La review visiva ha aperto gli screenshot finali delle quattro larghezze, il replay e il PDF annidato.

### Rettifica della prima prova funzionale

[La prima prova completa](continuity-before-layout-fix/result.json) su `ec5f190` passa 23 gruppi funzionali. La successiva ispezione visiva rivela però una collisione del CSS upstream PDF.js: `.sidebar` passa da `fixed` a `relative`, riducendo anche la barra tablet da 820 a 632 px. Il PDF annidato sul desktop viene compresso a 150 px. Quel PASS resta conservato come **continuità funzionale con difetto visivo**, non come risultato finale dell’interfaccia.

La [misura iniziale](layout-observed/layout.json) registra il cambiamento prima/dopo l’apertura del PDF. Il [RED esplicito](layout-red/layout.json) usa gli stessi asset compilati `ec5f190`; segnala sorgenti dirty perché il fix era stato preparato ma non ancora compilato. Non viene presentato come prova di un build ricavato dai sorgenti dirty. Il [GREEN](layout-green/layout.json), su `6ecbdc4` pulito e ricompilato, verifica sidebar invariata, note e miniature adattive, testo nativo, zoom e fit. Il PDF annidato cresce da 150 a 448 px sul desktop e da 252 a 386 px nel pannello tablet.

I tre precedenti errori del runner sono conservati in `runner-corrections`: drag prima di portare il testo dentro il viewport; selettore esatto di una label che includeva le option; aspettativa errata di due riferimenti anziché tre dopo l’originale atomico Core. Non richiedevano modifiche al prodotto. Il runner finale corregge anche il salvataggio già effettuato da `nextStep`, e aspetta il text layer prima dello screenshot del PDF collegato.

Il primo build Studio senza escalation falliva perché il processo Git usato per la provenienza non era eseguibile nel sandbox. Il build ordinario autorizzato risolve il problema; non viene impostato o inventato un SHA provider. Il log dell’errore è conservato in `checks/studio-build.log.gz`.

## Riprodurre

Sono richieste le dipendenze dei lockfile, Python dell’ambiente Study API e Chromium della toolchain. Nessun listener delle prove viene lasciato acceso. Il runner usa la porta loopback 5498: eseguire golden e verifica layout in sequenza. Usare una nuova directory di output per ogni golden; lo script rifiuta di sovrascrivere un Core esistente.

```sh
VITE_S20_LEARNING_JOURNEY=1 npm run build:web
ARDESIA_STUDIO_BASE=/studio/ npm run build --prefix apps/studio

ARDESIA_G0_OUTPUT=/tmp/ardesia-g0-proof-output \
ARDESIA_G0_PYTHON=/absolute/path/to/study-api/.venv/bin/python \
ARDESIA_CHROMIUM=/absolute/path/to/chrome \
node handoffs/swarm-v2/S18/g0-composition-20261026/verify-golden.mjs

ARDESIA_G0_STATE=/tmp/ardesia-g0-proof-output/private-state \
ARDESIA_G0_RESULT=/tmp/ardesia-g0-proof-output/result.json \
ARDESIA_G0_LAYOUT_OUTPUT=/tmp/ardesia-g0-layout-output \
ARDESIA_G0_PYTHON=/absolute/path/to/study-api/.venv/bin/python \
ARDESIA_CHROMIUM=/absolute/path/to/chrome \
node handoffs/swarm-v2/S18/g0-composition-20261026/verify-layout.mjs
```

Ricompilare dopo ogni nuovo commit: il golden richiede che il producer nel `.lesson` sia il HEAD corrente. `ARDESIA_G0_REPO` consente di indicare esplicitamente il worktree. Il `PYTHONPATH` viene riferito a quel worktree, evitando gli editable import di altri checkout.

I test mirati sono riproducibili da `apps/web`:

```sh
node ../../node_modules/vitest/vitest.mjs run \
  src/features/lesson-media/exact-navigation.test.tsx \
  src/features/lesson-media/library.test.tsx \
  src/features/learning-journey/sourceBridge.test.tsx \
  src/features/learning-journey/receipt-source.test.ts \
  src/features/learning-journey/model.test.ts \
  src/features/product-shell/__tests__/shell.test.tsx \
  src/features/product-shell/__tests__/navigation.test.ts \
  src/features/product-shell/__tests__/states.test.tsx \
  src/features/living-sources/consumerIntegration.test.tsx \
  --maxWorkers=1 --no-file-parallelism
```

## Dati, limiti e consegna a S00

Il [manifest SHA-256](SHA256SUMS.json) copre prove e comandi. I log raw sono compressi losslessly con gzip. Non vengono pubblicati token, SQLite, directory blob, archivi OPFS, bundle audio o file `identity.json`. La copia curata è controllata contro tutti i token delle fixture. Il generatore del PDF originale è incluso e consente di riprodurre gli stessi byte.

La registrazione usa un dispositivo sintetico Chromium, non voci reali; il controllo di playback verifica eventi e byte, non ascolto umano. La dichiarazione Core del passaggio non trasferisce l’audio: export/import espliciti restano necessari. Copie esportate non sono revocabili fisicamente. Due problemi e un feedback sono verificati; questo non completa i tre passaggi dell’esperienza o gli obiettivi della banca DRAFT.

Le prove locali usano Node 24.22.1, Python 3.13 e storage locale SQLite/blob_dir. CI remoto, tree congiunto con Formula e gli altri stream, preview protetta e eventuale rilascio restano verifiche di S00 su SHA esatti. Nessun push, merge remoto, commento GitHub, modifica di protection o deployment è stato eseguito da questo stream.
