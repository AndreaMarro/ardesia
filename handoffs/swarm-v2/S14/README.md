# S14 — raccolta della lezione, raccordo pronto per S00

## Stato del 26 ottobre 2026

Utility implementata in `apps/studio/src/whiteboard-library/`; **non montata sulla main**. La patch [room-library.patch](room-library.patch) è un consumer concreto della Room finale S07 `0d809591ca47a3c87878548d59b343d62e7ff7a8`. S00/S07 hanno richiesto di applicarla sequenzialmente con writer assegnato: Room e manifest nel branch di consegna sono intatti. Non è DONE, collaborazione remota o distribuzione.

Il sottosistema acquisito è la Library nativa di **Excalidraw 0.18.1, MIT**, già nel prodotto: selezione e raccolta di schemi, inserimento, rimozione, importazione e unione `.excalidrawlib`, esportazione e anteprime. L'SDK conserva questi comportamenti; il nuovo codice originale si limita al confine di persistenza della lezione. Nessun nuovo canvas, package, database, sistema di identità o motore di replay.

La raccolta vive nel campo opzionale `libraryItems` dello stesso `raw/board.excalidraw`. Il manifest e il digest del bundle `.lesson` coprono già quei byte. Non ci sono sidecar o modifiche al formato del contenitore. Un vecchio board senza campo apre una raccolta vuota; il campo presente ma corrotto blocca il salvataggio finché una fonte valida è caricata. Non è un archivio globale di elementi fra account o lezioni.

## Consumer e confini

Il raccordo conserva `legacyBoardScene`, journal, file, audio e WorkspaceStore S07. Uno snapshot immutabile di LibraryItems entra nella coda di salvataggio; la raccolta viene caricata con la scena e sostituita anche all'importazione `.lesson`. Il bottone docente «raccolta» apre la sidebar nativa `{name: "default", tab: "library"}`. La vista studente in sola lettura non riceve comandi di modifica della raccolta; l'autorizzazione remota non viene inferita dal parametro della vista locale.

Il donor attende la propria coda `updateLibrary`, ma non attende `onLibraryChange`. La patch drena quindi la coda SDK prima del flush canonico. La callback ripristina l'ultima raccolta ammessa se l'aggiornamento non è valido. I limiti espliciti sono 100 schemi, 2000 elementi e 2 MiB di JSON UTF-8; sono protezioni del payload, non una misura di prestazioni del dispositivo. Cache locale e archivio durevole mantengono la distinzione esistente.

`ardesiaInkV1` è una projection S07 riservata e viene rifiutata **anche annidata**: non può entrare nella raccolta esportabile o diventare uno snapshot collaborativo. Gli scope, i trasporti e le sidecar S07 conservano i rispettivi owner. Lo stesso principio vale per le future raccolte scientifiche.

## REA e scelta del donor

Tre candidati pertinenti valutati:

| Candidato | Decisione per questo incremento | Fonte e motivo |
| --- | --- | --- |
| Excalidraw 0.18.1 Library, MIT | ADAPT | SDK già adottato; [contratto props](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/) e [API](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/excalidraw-api). Il sottosistema completo evita di ricostruire un editor di raccolte. |
| Goodnotes Elements, proprietario | REIMPLEMENT solo del collegamento originale alla lezione; nessun codice o asset copiato | [Documentazione Elements](https://support.goodnotes.com/hc/en-us/articles/7353727577359-Create-Use-and-Share-Elements), osservata come contratto documentato, non come prova UI. L'approfondimento REA Goodnotes appartiene alla chat complementare `01a175a6-aa38-7142-82c3-c642e522e608`. |
| tldraw SDK corrente | DEFER | [Licenza/FAQ ufficiale](https://tldraw.dev/faq): produzione soggetta a chiave/licenza. Nessuna licenza commerciale acquisita e nessuna sostituzione del canvas giustificata per questa capacità già disponibile. Versione npm non acquisita; non dichiarata analisi di un artefatto tldraw. |

REA `analyze_javascript_application` è stato eseguito sui byte **immutati** `package.json` e `dist/dev/index.js` del pacchetto installato, selezionati in un contenitore isolato; dipendenze, chunk e mappe non inclusi nella selezione. Identità e limiti sono in [provenance.json](provenance.json). L'analisi è statica e parziale, non prova runtime. Le API ufficiali e la lettura dei sorgenti distribuiti hanno dato un'integrazione più efficace della ricostruzione/estrazione del codice. La coda, il callback non atteso e la sidebar sono stati verificati nel distribuito. Nessun codice donor è vendorizzato dal nuovo helper.

## Prove e riproduzione

- Utility: **6 PASS**, `library-tests.log`; immutabilità, legacy, cancellazione, input invalido/budget, blocco della fonte corrotta, rifiuto projection annidata, store reale e bundle con digest/nuova istanza/isolamento fra due lezioni.
- Controprova consumer isolata: **4 PASS**, `lifecycle-green.log` (primo checkpoint2PASS in `room-green.log`), contro un RED reale `room-red.log` (callback assente sulla Room S07). Include regressioni su callback di una generation ritirata e notifica valida durante il completamento di una riparazione. Esercita la Room vera e WorkspaceStore, con l'SDK simulato per isolare il contratto del callback. Non è E2E nativo.
- `red.log`, `corrupt-red.log`, `nested-projection-red.log` preservano i passaggi RED. Il primo harness consumer aveva percorso di copia errato, dipendenza PDF/DOMMatrix e fence API del mock da correggere; quei problemi non erano difetti del prodotto. I risultati sono descritti qui; il primo file room-red.log fu sostituito dal successivo RED sul callback assente, quindi non si rivendica un log separato conservato per ciascun tentativo del runner. Il controllo del distribuito ha inoltre corretto `name: "library"` in `name: "default", tab: "library"` prima della consegna.
- Browser nativo, typecheck della composizione, suite completa, integrazione S00 e CI post-merge: **pendenti**, da leggere sulle SHA effettive. Nessuna approvazione umana o prova con studenti reali.

Nel branch utility:

```sh
cd apps/studio
node node_modules/vitest/vitest.mjs run src/whiteboard-library --pool=threads --maxWorkers=1 --no-file-parallelism --testTimeout=30000 --hookTimeout=30000 --teardownTimeout=30000
```

Per il consumer, usare un checkout isolato della fonte S07 indicata, copiare il namespace utility, verificare e applicare la patch, poi copiare `RoomLibrary.test.tsx` in `apps/studio/src/whiteboard-library/` ed eseguirlo. Il test rimane nel handoff finché il raccordo non è montato: non si indeboliscono i gate con un test saltato o un consumer fittizio.

## Prossimi incrementi

1. S00 assegna/applica il solo wiring Room, dopo la composizione S07, senza sostituire Room intera. Accettazione: patch e consumer test riferiti alla head composta; test privacy S07 ancora verdi.
2. Finestra S14 per typecheck e browser nativo: selezione→raccolta→inserimento→salvataggio/reload→export/import, desktop/mobile e tastiera; errore di quota, dati corrotti e vista studente. Conservare FAIL e screenshot reali.
3. CI della head e del merge tree, merge S00 e verifica post-merge; soltanto allora dichiarare la capacità integrata. Ambiente distribuito e limiti remoti separati.
4. Acquisizione successiva con owner: schemi scientifici originali riutilizzabili nella raccolta e collegati a fonti/versioni Core. Non importare asset da raccolte esterne senza diritti; non sovrapporsi al batch formula/Goodnotes dell'altra chat S14.


## Addendum review — 26 ottobre 2026

Due finding della review separata riprodotti al confine host (lifecycle-red.log:2FAIL/2PASS), poi quattro test consumer PASS: token di generation, API/owner catturati e verificati dopo await, riparazione funzionale sulla raccolta SDK più recente, senza flag globale che sopprima notifiche valide. REVIEW.md preserva i finding iniziali e la verifica statica successiva. Il reviewer non ha eseguito test. Il precedente scenario P2 «B+C già in coda» non è provato nel donor nativo: notifyListeners drena la coda prima della callback. Il RED è una prova del confine host simulato, non una registrazione del timing nativo.

Compatibilità: i vecchi board senza raccolta rimangono leggibili. La conservazione della raccolta quando un vecchio Studio privo di questo raccordo riapre e risalva un nuovo board non è garantita: quel serializer può ignorare il campo opzionale. Nessuna migrazione o compatibilità di roundtrip con vecchi writer è dichiarata.


## Addendum nativo e preflight — 26 ottobre 2026

La composizione temporanea supera TypeScript EXIT0 e il runner nativo **9check PASS**, Chromium148.0.7778.96: caricamento497ms in questa esecuzione dev, inserimento dalla raccolta reale e autosave, reload vero, download UI .lesson, import legacy che svuota la Library e reimport che la ripristina, errore di quota/retry con bozza conservata,390px senzaoverflow, apertura da tastiera e assenza comando nella vista studente locale. Report/sourcehash e screenshot1440/390 in [native-proof/](native-proof/), letti visivamente. Zero console/pageerror. Il primo render è una misura locale di questo run, non un benchmark generale o mobiledevice. Inserimento delle tile con sola tastiera NON_VERIFICATO; il donor ha tile senza ruoli/nomi nel snapshot accessibile. Non si certifica WCAG.

Il nuovo preflight `validateLibraryLesson` usa JSZip già presente per validare soltanto il campo opzionale prima che l'import canonico sostituisca il board; percorsi, identità, digest, transazione e restore restano a WorkspaceStore. Un archivio corrotto o contenente projection riservate non può prima essere scritto e poi rifiutato solo dalla UI. Utility ora **7PASS**, con RED/GREEN in import-preflight-*.log.

REA runtime: primo scenario FAIL per selettore non univoco (comprendeva il tile «aggiungi»), poi10azioni completate con nuova navigazione di documento e selettore del solo elemento salvato. Evidence e limiti in rea-native-summary.json. Il risultato conteneva8errori403 su4font Assistant: il devserver di controprova non ammetteva il realpath dei node_modules collegati. Corretto soltanto il suo allow-list del percorso font; il runner nativo successivo registra zero errori. Nessuna modifica CSP/config prodotto, fonte o licenza dei font.

Il primo launcher Node diretto Chrome155 non è arrivato alla pagina; terminato il solo albero proprio, dopo SIGTERM non sufficiente. Una seconda invocazione ha restituito1 senza log/directory output (causaUNKNOWN); non è PASS o difetto prodotto. Il terzo run usa il Chromium cached del Playwright già installato ed è concluso EXIT0 con cleanup. Esiti precedenti conservati separatamente; nessun timeout aumentato.

La PR319 continua come batch unico. Il verde CI d373ee32 è della prima utility, non viene trasferito a questa nuova revisione. Room/sharedfile sono ancora intatti sul branch di consegna: S00 applica la patch dopo S07 e verifica la sua composizione prima di dichiarare integrazione.
