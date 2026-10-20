# TARGET-082 — lettore degli originali nel corso

Stato al 20 ottobre 2026: integrazione locale verificata degli allegati PDF delle
consegne. **SYS-01 resta aperto.** Questo passaggio non certifica il quaderno
scientifico completo, G0/G1, gli 85 criteri storici o il rilascio in produzione.

## Problema e risultato

Il viewer incorporato del browser non esponeva un ciclo di vita controllabile né
un'identità binaria verificata al client. Il prototipo recuperato aveva inoltre
catch non protetti: una pagina vecchia poteva sostituire lo stato della nuova
fonte dopo un rigetto tardivo di getPage/getTextContent. Il nuovo adattatore usa
PDF.js 6.4.299, codice originale di integrazione, un canvas separato per richiesta
e invalidazione su cambio sorgente, pagina, sessione e smontaggio.

Percorso attuale: Il mio lavoro → Consegne e feedback → Originali, versione e
ricevuta → Leggi il PDF. Lo stesso componente è utilizzato nella review tutor.
Sono disponibili paginazione, zoom, rotazione, testo incorporato, retry e download.
Le fonti testuali e gli allegati conservano identità distinte: non si associano
per posizione negli array e il fingerprint PDF non è una chiave del Core.

## Evidenze REA e recupero

REA è rimasto registrato a 6.7.0 su Node 24.19.0. Le chiamate sono vere chiamate
MCP stdio con initialize, tools/list (207 strumenti) e tools/call; non tool
aggiunti a caldo alla chat. Il client e i piani sono nella consegna locale.

- 79 file del prototipo congelato controllati contro il manifest. SHA del
  manifest: `3189e99e8e26bd9dabc5e5cec10307f3600084ed69602afe10629ddc65e90cad`.
- Analisi JavaScript REA e traccia getPage: osservazioni parziali, ricevitore
  dinamico non risolto; non equivalgono a prova completa della logica.
- Scenario REA originale: V1, pagina 2, V2, hash errato rifiutato, retry.
- Scenario REA integrato: cookie sintetico passato tramite riferimento a variabile
  segreta, consegna, originale, pagina 2, testo, rotazione, zoom.
- `core-reader/evidence-index.json` riporta identità e limiti. Gli step browser
  completati non rendono completa la cattura globale: alcuni corpi di rete non
  sono esposti, e i bundle JS superano il budget predefinito di 64 KiB.
- `core-reader/fingerprints.json`: i due PDF sintetici hanno lo stesso primo
  fingerprint PDF.js e SHA-256 differenti. La misura usa PDF.js legacy in Node;
  non è da sola una prova di sostituzione della fonte nella UI del corso.

## Autorità, memoria e recupero

Il Core restituisce `X-Study-Asset-Descriptor` solo insieme ai byte autorizzati,
dopo verifica di dimensione e SHA. La policy di accesso preesistente resta:
proprietario oppure tutor della stessa edizione con riferimento consegnato.
`read_asset` conserva la precedente coppia byte/MIME. Nessun secondo archivio,
nessuna migrazione, nessun URL del blob remoto esposto.

Il client usa il trasporto condiviso C7, legge lo stream entro 20 MiB reali,
controlla il descrittore e l'hash e conserva un Blob immutabile. Solo una copia
arrayBuffer viene trasferita al renderer. Gli ID legacy sono conteggiati fino a
8192 codepoint, coerentemente con il Core. Il testo estratto non sostituisce mai
l'identità binaria. Logout/cambio sessione rimuove la vista e revoca l'object URL.

Ogni apertura possiede un Worker nativo. La prova 503 ha riprodotto il fallback
fallito memorizzato da PDF.js: senza correzione il retry non recuperava. L'adattatore
usa l'API pubblica PDFWorker.create({port}) con una porta fresca e osserva gli errori
anche dopo l'apertura. La pulizia prova destroy; dopo al massimo un secondo termina
la porta anche se il worker non risponde. La nuova fonte non aspetta quella vecchia.
Non viene attivato il fallback di rendering sul thread principale.

Limiti misurabili: 20 pagine; raster del canvas entro 4 milioni di pixel e 8192 px
per lato; il testo mostrato è limitato a 200.000 caratteri con omissione dichiarata.
Le immagini incorporate non vengono eliminate silenziosamente sopra 4 MP; una
scansione di 4,8 MP è stata effettivamente renderizzata. Questi budget **non sono
un limite alla memoria totale del browser** o al costo di decompressione.

## Dipendenza, distribuzione e licenze

`pdfjs-dist@6.4.299` è esatto in package.json/lock. È giustificato dal recupero del
motore completo, incluse decodifica e risorse tipografiche; il codice PDF viene
caricato solo aprendo il documento. Vite distribuisce localmente CMaps, font, ICC,
Wasm, relative licenze e manifest SHA-256. Worker e libreria provengono dallo stesso
pacchetto fissato. Il build pubblico separato non include questo plugin o renderer.

PDF.js è Apache-2.0; le licenze specifiche Adobe CMaps, Foxit, Liberation, QCMS,
OpenJPEG e JBIG2 sono conservate come distribuite dal pacchetto, sotto
`/pdfjs/6.4.299/`. L'adattatore non usa un CDN, XFA, layer di azioni PDF o scripting
host. La CSP restrittiva è stata provata nel browser come policy candidata; non è
una dichiarazione di configurazione della produzione.

## Verifica e revisione

Le ricevute macchina sono in `core-reader/verification.json`, con i log nella
consegna. La review indipendente è stata svolta con il subagente Codex disponibile,
non con la CLI esterna review.sh e non con un modello cross-family attestato.
Il riscontro sul limite legacy di 256 caratteri è stato corretto. La revisione
successiva comprende probe separati sulle race e sul ciclo di vita Worker.

Browser: Chrome 155, dati sintetici SQLite/FastAPI, build Vite reale. Larghezze
390/820/1440 senza overflow della pagina; zoom CSS 200%; Enter sui controlli e focus
visibile; scansione; download byte-identico; chiusura worker; tutor V1=200 e V2
privata=403; 503 worker con retry riuscito. Axe sulla regione allegato non riporta
violazioni per i tag richiesti; restano controlli automatici incompleti su contrasto
e attributi ARIA. Screenshot ispezionati. Non è una certificazione di accessibilità
completa o una prova di UI perfetta.

## Perimetro ancora da completare

| Criterio SYS-01 dello ZIP | Stato corrente / prossima prova |
|---|---|
| Stesso fingerprint, originali distinti | Identità binarie e permessi verificati; sostituzione reale nella futura lavagna ancora da provare |
| Cambio attore/corso/fonte e Undo | Sessione del lettore verificata; storia Undo di annotazioni e formule ancora da integrare |
| PDF → pagina/ancora → annotazione → formula → salva → chiudi → riapri | Lettore pronto; binding canonico, geometria, MathLive, persistenza e ripresa ancora necessari |
| Sistema originale Studio + workflow equivalente | Prototipo 082 ispezionato con REA; confronto completo con un sistema autorizzato ancora necessario |
| Motore, worker/CSP/dispose/feature flag | PDF.js completo con risorse locali; superficie attuale limitata agli allegati delle consegne; lavagna da collegare |
| Secondo utente, revoca, lentezza, zoom, rotazione, riavvio | Controlli API, sessione, race e zoom/rotazione eseguiti; ripresa dello stato annotato dopo riavvio ancora aperta |
| Consegna V1, nuova V2 privata, export/cancellazione | Accesso al binario esatto verificato; ciclo delle annotazioni, export integrato e cancellazione ancora aperti |
| Uso nell'aula e lavoro individuale | Disponibile nelle consegne/review; flusso scientifico completo nell'aula ancora aperto |

Le priorità successive dello ZIP restano SYS-02 esercizi (Numbas/Perseus), SYS-03
voce e tratti, SYS-04 rubriche, SYS-05 consolidamento registro, SYS-06 memoria e
retrieval, SYS-07 laboratori e SYS-08 condizionale. Nessuna di queste acquisizioni
è stata sostituita da questo lettore. Restano aperti gli accessi nominativi, la
policy per contatti reali e il preflight cloud che in precedenza restituiva 403.
