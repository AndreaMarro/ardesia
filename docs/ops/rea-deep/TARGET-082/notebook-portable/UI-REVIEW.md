# Riapertura portabile — review indipendente della UI

20 ottobre 2026. Diff rispetto a `12296e6be225be7571be88ca55b67bd3fd30784d`, checkout `/tmp/ardesia-public-rea-20261020`.

**Nessun finding concreto individuato nei file UI letti e nei quattro probe mirati.** Il risultato non attesta assenza di difetti, completamento SYS-01 o funzionamento offline.

## Separazione del lavoro

Questa review riguarda i file scritti dal builder:

- `apps/studio/src/study/NotebookPanel.tsx`;
- `apps/web/src/integrations/notebook/PortableNotebook.tsx`, `portablePdf.ts`, `NotebookReading.tsx`, `PdfReader.tsx`, `NotebookEditor.tsx`;
- collegamenti in `Work.tsx` e `Materials.tsx`;
- regole aggiunte a `notebook.css`.

`notebookPreview.ts`, `scientificNotebookSnapshot.ts` e `notebook-portable-model.test.ts` sono invece implementazione delegata allo stesso reviewer e vengono verificati dal builder. Non sono oggetto di una pretesa review indipendente in questo documento.

Durante la review UI non sono stati modificati file di prodotto. I soli nuovi file sono i probe e questo report nella scratch. Nessuna suite completa, gate, build, browser, servizio esterno o commit.

## Esame per lettura

- **Trasporto del JSON:** il download usa il Blob della risposta; l'ispezione riceve il testo del file tramite `RequestInit.body`, con `body` del wrapper lasciato undefined. La lettura di `studyRequest` conferma che in tale caso non viene applicato `JSON.stringify` al payload. I token numerici del documento non vengono quindi ricreati dal modello JS.
- **Assenza di lookup live nel renderer:** `PortableNotebook` trova l'asset locale per ID esatto e passa il suo SHA allo stesso decoder locale. `NotebookReading` dipende solo da stato, revisione, Blob, assetId e pageCount; non porta con sé sessione, draft, attore, salvataggio o handoff.
- **Byte locali:** il decoder rifiuta MIME/SHA/dimensioni discordanti, limita il PDF a 20 MiB e verifica lunghezza base64 attesa prima di `atob`. Confronta poi lunghezza effettiva e SHA-256 dei byte. La verifica post-digest scarta un abort avvenuto durante il lavoro asincrono. Non usa fingerprint PDF.js.
- **Pagine e overlay:** `PdfReader` controlla l'uguaglianza tra pageCount atteso e `pdf.numPages` prima di pubblicare il documento. La chiave del dato caricato conserva anche il numero atteso; un risultato con aspettativa precedente non passa il controllo di visibilità.
- **Identità della selezione:** il pannello tiene una sola coppia risorsa/revisione aperta. Cambio file azzera preview e selezione prima dell'attesa; il contenuto locale precedente viene smontato. La sostituzione con un file avente gli stessi ID è inclusa nei probe.
- **Sessione:** il pannello invalida generazione, request controller, preview e selezione all'abort della sessione. Il contenitore Web è inoltre rimontato dalla chiave di sessione di `Shell`; il cambio attore/edizione rimonta il contenuto attraverso `Suspense key={affinity}`. Studio usa a sua volta la chiave sessione/attore di `StudyWorkspace`. La review non presume che il pannello, isolato da tali contenitori, possa attraversare arbitrariamente più sessioni senza rimontaggio.
- **Cancellazione:** dopo `file.text` viene ricontrollata la generazione prima dell'ispezione. Success/catch/finally dell'ispezione o export precedente non alterano il nuovo tentativo. Il componente locale possiede il controller del decoder e lo abortisce quando si smonta.
- **Cleanup e fallback:** `NotebookReading` monta il PDF soltanto dopo il decoder; il suo download crea un Object URL con cleanup. Testo/formule restano consultabili quando l'originale manca o non supera il decoder. L'ammissibilità dei PDF mancanti resta quella dell'ispezione Core; la UI non modifica tale politica.
- **Formule:** il ramo read-only usa `FormulaPreview` statico già sanitizzato, eliminando la necessità di istanze MathLive interattive nella lista. La review precedente dei filtri resta un'evidenza distinta; in questo passaggio non ho eseguito fuzzing di formule.
- **CSS:** le nuove regole contengono titolo/formule, conservano la geometria degli anchor e neutralizzano il margine globale dei pulsanti dentro il lettore portabile. Non ne deduco un risultato visuale senza verifica browser.

## Probe indipendenti

File: `ui-probe.test.tsx`. Risultato: **4/4 passati**, durata Vitest **7,72 s** (test 1,62 s), singolo worker.

1. **Apertura/chiusura locale:** pannello, adapter e decoder effettivi; una sola richiesta POST `/study/notebook/inspect`, nessun GET Core. Il Blob passato al lettore contiene i byte locali attesi e pageCount=2. Nessun comando di salvataggio/consegna esposto. Chiudendo la fonte, il lettore viene smontato e l'URL del PDF revocato.
2. **Sessione durante lettura del file:** `file.text` tenuto pendente, poi cambio sessione, poi completamento. Nessuna ispezione viene inviata e la vecchia preview non viene pubblicata.
3. **Stessi ID, nuovo file e vecchio hash tardivo:** il digest del file A rimane pendente; viene aperto il file B con stessi resourceId/revisionId/assetId ma byte/SHA differenti. Il solo Blob consegnato al lettore è B; il completamento tardivo di A non rimonta o sostituisce il contenuto. Il successivo cambio sessione smonta il lettore e revoca l'URL.
4. **Byte e abort:** byte alterati mantenendo lo SHA dichiarato falliscono; un abort dopo l'avvio del digest impedisce la restituzione del Blob.

Il trasporto HTTP è mock, ma usa il vero wrapper `studyRequest`. PDF.js e `FormulaPreview` sono mock per isolare il confine; il conteggio degli smontaggi dimostra il lifecycle del componente, **non** la terminazione di un worker PDF.js reale. I byte sintetici non sono una fixture PDF completa: attestano il controllo di byte/SHA, non l'apertura di un documento valido.

Comando usato:

```sh
/Users/andreamarro/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /tmp/ardesia-public-rea-20261020/node_modules/vitest/vitest.mjs run --config /tmp/ardesia-notebook-portable-20261020/vitest.config.mjs --maxWorkers=1 --no-file-parallelism --testTimeout=10000
```

## Limiti e verifiche ancora separate

- Roundtrip reale Core → download → riapertura, documenti PDF autentici, font/formule, rendering geometrico, worker, CSP e accessibilità sono verifiche del builder.
- Nessuna prova ai massimi di memoria/tempo o sugli asset compressi avversari. Il decoder è limitato a 20 MiB, ma il costo del parser PDF non ha un tetto di memoria assoluto.
- Il parser condiviso e i suoi 41 test non sostituiscono la verifica di integrità del Core né la verifica dei byte. I probe della UI non ne certificano indipendentemente l'intera validazione.
- L'ispezione del file rimane un POST autenticato. Nessuna attestazione di riapertura senza server, sessione o asset statici dell'app.
- La dichiarazione “autenticità canonica non verificata” rimane necessaria anche quando hash e riferimenti interni coincidono.


## Passata finale — contenimento dei token lunghi, sola lettura

Letta la sola aggiunta `.study-notebook { min-width: 0; overflow-wrap: anywhere; }` in `apps/web/src/integrations/notebook/notebook.css:92`. **Nessun nuovo finding concreto.** La regola permette al contenitore di restringersi e alle stringhe lunghe dei metadati (SHA e riferimenti tecnici) di andare a capo; non modifica byte, testo memorizzato, binding, lifecycle o dimensioni esplicite del canvas. Le regole locali del viewport PDF e della barra di navigazione rimangono presenti, compreso `white-space: nowrap` delle etichette della paginazione. Gli anchor avevano già il contenimento del testo nelle caption.

Il builder riferisce una misura precedente di overflow a 390 px (`scrollWidth=545`, `clientWidth=390`) attribuita ai metadati; non l'ho riprodotta né ho letto tale misura come una prova indipendente. Questa passata è basata sul sorgente: nessuna suite, probe, build o prova browser avviata. La conferma dell'assenza di overflow dopo il fix resta alla nuova misurazione browser del builder. Nessun file di prodotto modificato dal reviewer.
