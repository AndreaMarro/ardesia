# Riapertura portabile del quaderno scientifico — design review indipendente

20 ottobre 2026. Base letta: `12296e6be225be7571be88ca55b67bd3fd30784d` nel checkout `/tmp/ardesia-public-rea-20261020`. Nessun file di prodotto modificato; nessuna suite, prova browser, richiesta esterna o CLI di review eseguita. Letti gli AGENTS root, Studio ed Engine; lo stato generato presente nel checkout è coerente con la base. Il generatore non è stato rieseguito perché questa attività è in sola lettura.

## Proposta minima

Il formato Core contiene già snapshot strutturati, coordinate, formule e PDF. Non serve una migrazione né un secondo formato di archivio. Serve conservare questi dati nella proiezione di presentazione e separare il lettore visivo dal caricamento autorizzato.

1. `NotebookPanel` mantiene il caricamento `.study.json`, i limiti, l'ispezione e le diciture sull'autenticità non verificata.
2. `readNotebookPreview` conserva una rappresentazione esplicita dello snapshot scientifico e i metadati dei suoi asset, invece di scartare `notebook` e `bytes`.
3. Una selezione locale identifica **la coppia resourceId/revisionId**, risolve **assetId e SHA esatti**, prepara un Blob PDF verificato e ne possiede il lifecycle.
4. Il componente di lettura riceve snapshot e Blob già pronti; riusa `PdfReader`, `AnnotationLayer` e il rendering delle formule. Non riceve attore, callback di salvataggio, handoff o API di modifica.
5. Un solo lettore aperto per volta; cambio selezione/file o chiusura distrugge worker e render e revoca gli URL creati dal componente.

La scelta più piccola conserva **POST `/notebook/inspect`**, ma non esegue alcun GET Core per risorsa, revisione o PDF. Questo significa **render locale dopo ispezione online autenticata**, non riapertura completamente offline. L'endpoint attuale chiama `authenticate`; una promessa di funzionamento senza server o senza sessione richiederebbe un validatore locale completo, oltre a questo incremento.

## Cosa è già disponibile

| Area | Evidenza letta | Conseguenza |
|---|---|---|
| Export Core | `portable.py:66`, unione degli asset delle consegne con quelli referenziati dai quaderni | Il PDF di un quaderno deve essere incluso anche se non è un allegato esplicito della consegna. |
| Revisioni | `portable.py:154`, indice `(id, revisionId)`; riferimenti storici e perdite dichiarate | Nessuna sostituzione di V1 con la head V2. |
| Snapshot | `scientific_notebook.py:76` | Versione, schema, stato, testo derivato, hash dello snapshot e binding PDF sono già verificati dall'ispezione Core. |
| Binding tra revisioni | `portable.py:186` e seguito | La stessa risorsa deve mantenere lo stesso source; è rifiutato anche il cambio di kind. |
| Contenuto binario | `portable.py:186` e seguito | Base64, byte effettivi, SHA, duplicati degli asset e totale decodificato vengono controllati; per i quaderni anche MIME e numero pagine. |
| Presentazione attuale | `notebookPreview.ts:84` | Conserva solo testo e identità della fonte: non mantiene `notebook`, `editionId` né `asset.bytes`. |
| Lettore attuale | `NotebookEditor.tsx:12–50` | Anche `readOnly=true` esegue `studyOriginal` e si lega alla sessione prima di aprire `NotebookReading`. |
| Motore PDF | `PdfReader.tsx:10`, `pdfDocument.ts`, `renderPdfPage.ts` | È già basato su Blob e worker posseduto, con cancellazione, retry, limiti delle pagine e canvas separato. |

## Confine dei tipi e dipendenze

`VerifiedOriginalAsset` non è il tipo corretto da inventare con i dati del file. In `originalAsset.ts:1–12` significa un descrittore ricevuto da una risposta Core autorizzata e verificato insieme ai byte; il file non fornisce `kind`, `editionId` autorizzato o `extractionStatus`. Non riempire questi campi con valori fittizi e non usare una Response sintetica per far sembrare remoto un oggetto locale.

Il lettore grafico può accettare un tipo binario neutro, ad esempio `{ blob, sha256 }`, con identità di selezione e provenienza mantenute dal chiamante. Il contratto di `studyOriginal` e il significato del suo descrittore restano invariati. Un adapter Core può fornire lo stesso Blob al lettore senza perdere i controlli esistenti.

Estrarre il solo `NotebookReading` da `NotebookEditor` è il riuso corretto. Una props `originalOverride` su tutto l'editor lascerebbe vicini accesso remoto, draft, attore e handoff, aumentando le possibilità di accoppiamento involontario. Il componente di lettura richiede solo identità della revisione, snapshot scientifico e originale locale; non serve inventare una risorsa completa con autorità o corso correnti.

`NotebookPanel` è condiviso tra Studio e Web. Importare da esso direttamente il lettore Web introdurrebbe una dipendenza inversa e richiederebbe anche gli asset PDF.js/MathLive nella build Studio. Confine minimo per il primo incremento Web: un renderer/callback opzionale iniettato da `Materials` e `Work`, con fallback testuale esplicito in Studio. Se l'obiettivo comprende subito il lettore visuale anche in Studio, spostare il lettore in una sede condivisa e attivare consapevolmente plugin/static asset in entrambe le build; non presentare il solo ramo Web come parità già ottenuta.

## Invarianti di ammissione al lettore

- Il risultato dell'ispezione deve appartenere allo stesso file/generazione ancora selezionato. Non pubblicare la preview durante l'ispezione.
- Indice revisioni per `JSON.stringify([resourceId, revisionId])`; duplicati identici possono essere deduplicati, duplicati discordanti devono essere rifiutati.
- Per `scientific-notebook` conservare `notebook.v`, `notebook.sha256`, `source` e `state`. Non usare il cast permissivo `notebookResource` come validatore di file: verifica solo pochi discriminanti e non controlla geometria, numero pagine, tipi del contenuto o hash.
- Il source deve essere esattamente quello dello snapshot selezionato: `assetId`, SHA a 64 cifre esadecimali, `application/pdf`, convenzione di coordinate nota e pageCount intero 1–20.
- Costruire un indice asset con ID univoci. Non associare per posizione, per MIME, per primo PDF, per fingerprint PDF.js o soltanto per SHA. Due upload con byte identici possono avere identità diverse.
- Il Blob locale deriva esclusivamente dalla voce con quell'assetId; lunghezza effettiva e SHA-256 dei byte devono concordare con l'asset e con lo snapshot. Un hash PDF.js non sostituisce SHA-256.
- Mantenere un binding source unico per resourceId attraverso head e revisioni; kind diverso o source differente nella stessa risorsa è un errore del file.
- Dopo l'apertura PDF.js, confrontare `pdf.numPages` con il pageCount dello snapshot **prima** di mostrare overlay. Il lettore attuale verifica solo l'intervallo 1–20; non verifica l'uguaglianza.
- Per un riferimento mancante dichiarato, mostrare la perdita. Non aprire la head locale, non cercare il Core e non trasferire le annotazioni al PDF di un'altra versione.
- Anche un file coerentemente ricalcolato è solo internamente integro: owner, visibilità, ricevute e ruolo tutor/student sono affermazioni presenti nel file. Non alimentano sessione, ACL, cache autorizzate, salvataggi o consegne.

Per il primo incremento il server continua a verificare hash dello snapshot, testo derivato e geometria completa. Il parser client deve comunque produrre una forma sicura per React e il renderer, senza lasciar passare oggetti al posto delle stringhe o rettangoli non finiti. Se si elimina l'ispezione Core, questi controlli diventano tutti responsabilità del validatore locale e non sono sostituibili da `checked.valid` inventato.

## Budget e costo delle risorse

| Confine | Limite da conservare |
|---|---|
| File codificato | 96 MiB, controllato prima di `file.text` |
| Asset totali decodificati | 50 MiB |
| PDF selezionato per il lettore | 1–20 MiB; l'upload Core già limita ogni originale a 20 MiB |
| Collezioni | 100 risorse, 500 revisioni, 100 asset, 100 consegne, 50 viste |
| Snapshot | 200 annotazioni, 160 KiB di stato canonico, testo derivato 20.000 codepoint |
| Annotazioni | ID univoco nel formato Core; pagina valida; rettangolo finito contenuto in `[0,1]`; contenuto massimo 5.000 codepoint |
| Documento PDF | 1–20 pagine; canvas e testo estratto con i limiti già presenti |

L'ispezione portabile Core limita il totale degli asset a 50 MiB, ma non ripete il limite di 20 MiB del singolo upload. Un artefatto costruito localmente non deve quindi poter usare il via libera globale per aprire un singolo PDF di 50 MiB nel lettore con contratto da 20 MiB.

Prima di `atob`, controllare `bytes` intero sicuro, intervallo e lunghezza decodificata derivabile dalla base64. Decodificare soltanto il PDF selezionato, non tutti i PDF delle 600 versioni possibili. Per le revisioni che condividono lo stesso asset basta riusare un Blob immutabile, se la cache è limitata al file corrente e viene svuotata al cambio file.

Non montare un lettore/worker per ogni articolo di `preview.sources`: il budget dei file non è un budget di memoria PDF.js. Un massimo di 200 formule per snapshot non giustifica 600 lettori contemporanei. L'elenco resta leggero; un'azione apre una sola versione. Preferire `FormulaPreview` statico per l'elenco delle formule in sola lettura oppure misurare il costo delle istanze MathLive read-only, senza cambiare i filtri già verificati.

Gli attuali limiti canvas non costituiscono un tetto assoluto alla memoria del parser o delle immagini decodificate; non dichiararlo.

## Lifecycle e isolamento

La chiave del viewer deve includere la generazione del file e la coppia risorsa/revisione, oltre all'identità del PDF e dello snapshot. Lo stesso resourceId può comparire in due file non correlati; il loro stato di caricamento non può coincidere per caso. Una revisione differente deve ricevere le proprie annotazioni anche se il PDF è lo stesso.

La selezione possiede un AbortController. Dopo decode, `blob.arrayBuffer`, digest, import del modulo, apertura worker e render, verificare abort/generazione prima di pubblicare stato. Il digest WebCrypto non è annullabile: ignorare comunque il suo completamento tardivo. Alla chiusura o al cambio file:

- invalidare la generazione prima della distruzione asincrona;
- smontare il lettore, che cancella render e task e termina il worker;
- revocare gli URL di download creati dalla vista;
- rilasciare Blob/cache della selezione e del vecchio file;
- impedire che catch o success di un caricamento abbandonato sostituiscano il risultato del nuovo file.

`file.text()` non è abortibile: l'attuale controllo generazionale di NotebookPanel protegge la pubblicazione dopo la risposta, ma il nuovo percorso dovrebbe ricontrollare montaggio/generazione anche subito dopo la lettura, prima di inviare l'ispezione o iniziare decode onerosi.

La nuova vista locale non usa `studySessionTicket` per attribuire autorità al contenuto. L'ispezione HTTP esistente resta protetta dall'abort della richiesta di sessione. Un cambio account deve smontare/azzerare la selezione nel contenitore applicativo; il file non deve riapparire come contenuto del nuovo attore attraverso una cache indicizzata da IDs importati.

## Compatibilità degli hash: rischio preesistente da rendere esplicito

`store.canonical` usa `json.dumps(..., ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)`. Non equivale a `JSON.stringify`, nemmeno ordinando le chiavi: differiscono rappresentazioni numeriche e altri dettagli.

Esempio ricavabile dal codice: uno stato Core valido può contenere coordinate Python `0.0` e `1.0`. Il file mantiene tali numeri, ma `JSON.parse` seguito da `JSON.stringify` li trasforma in `0` e `1`. La nuova decodifica Python contiene interi e gli hash canonici calcolati sullo stato o sul bundle possono cambiare. `NotebookPanel` oggi segue già quel percorso prima di POST inspect; non è un difetto introdotto dal nuovo viewer. Non ho eseguito un probe HTTP per questo caso.

Perciò non aggiungere un hash locale di snapshot/bundle basato su un canonicalizzatore JS improvvisato. La soluzione minima usa l'ispezione Core per la semantica del JSON e SHA-256 locale per i byte PDF. Per garantire anche la riapertura di tutti gli export validi, prevedere il test Python → file → JS → inspect con float integrali, esponenti e `-0.0`; valutare trasporto del JSON originale nell'ispezione invece della sua riserializzazione. Lo stesso problema riguarda l'export browser che attualmente parse/riserializza la risposta. Un'eventuale correzione del trasporto va circoscritta e deve mantenere credenziali, abort, gestione della sessione e limite del corpo.

## Test necessari per questo incremento

1. **Roundtrip significativo:** PDF di almeno due pagine, nota, evidenziazione e formula in pagina 2; export dello studente con V1 consegnata e V2 privata. Aprendo V1 compaiono solo annotazioni/formule V1; aprendo V2 quelle V2. Export tutor senza head privata apre comunque V1.
2. **Nessun GET Core:** con POST inspect consentito, tutte le chiamate `/study/resources`, `/study/assets` e altri endpoint di lettura falliscono il test. Restano permessi i moduli e asset statici locali PDF.js/MathLive. Nessuna POST di modifica, submit o DELETE.
3. **Associazione avversaria:** invertire ordine degli asset, aggiungere un secondo PDF, usare stesso SHA con assetId differente, cambiare SHA dello snapshot, duplicare un ID con contenuti discordanti, rimuovere il PDF esatto. Mai fallback al primo asset o alla head.
4. **Integrità distinta:** alterare stato e ricalcolare solo l'hash esterno; alterare PDF e conservare SHA/bytes; alterare bytes dichiarati; base64 malformata; kind cambiato per la stessa risorsa. Tutti rifiutati prima del rendering interessato.
5. **Geometria:** CropBox non originario, rotazione intrinseca, rotazione utente, zoom; stessa annotazione salvata nella pagina non ruotata appare nello stesso punto. pageCount del PDF divergente blocca l'overlay.
6. **Budget reali e limiti inclusivi:** 20 MiB selezionato, +1 byte; 50 MiB totale; 96 MiB codificato; 20/21 pagine; 200/201 annotazioni; astral Unicode ai limiti Core. Non testare solo metadati dichiarati.
7. **Lifecycle:** file A sostituito da B mentre hash/import/worker è sospeso; B con stessi ID ma contenuto diverso; chiusura prima di decode, durante render e dopo errore worker; URL revocati e worker terminati; completamento tardivo di A ignorato.
8. **Assenza di autorità:** artefatto coerentemente ricalcolato con owner/tutor/visibilità falsi rimane soltanto un file in lettura. Nessun salvataggio, handoff, recupero live o ripristino delle ACL. Legacy e perdite dichiarate mantengono le diciture attuali.
9. **Sicurezza formula:** HTML/handler nel testo, alias MathLive di stile/URL, CSS attivo; i filtri restano quelli esistenti anche nel ramo locale. Nessuna richiesta esterna generata dalle formule.
10. **UX e accessibilità:** apri/chiudi/focus, selezione di revisione esatta, stato vuoto/errore/retry/download, tastiera, 390/820/1440 px, zoom e nomi accessibili; lettore unico e ritorno del focus alla sorgente selezionata.
11. **Compatibilità:** fixture export Core autentiche attraversano il vero parser/trasporto browser, includendo i casi numerici sopra; gli attuali test di preview con `valid:true` mock e SHA fittizi non provano questo roundtrip.
12. **Regressioni condivise:** NotebookPanel senza renderer continua a funzionare in Studio; entrambe le build/typecheck interessate passano. Se il lettore entra anche in Studio, collaudare gli asset statici nella sua build prodotta.

## Limiti della presente review

Questa è una proposta fondata sulla lettura, non una verifica dell'implementazione futura. Non è stato aperto un `.study.json` nel browser né eseguito un roundtrip HTTP o un test di memoria. I rischi indicati derivano dai contratti e dai rami letti; non sono presentati come vulnerabilità sfruttate. Nessuna affermazione di completamento SYS-01, equivalenza completa con il prodotto di riferimento o funzionamento offline.


## Addendum — implementazione autorizzata del solo modello condiviso

Dopo la fase di design, il builder ha delegato la modifica di `apps/studio/src/study/notebookPreview.ts`, il nuovo `scientificNotebookSnapshot.ts` e il test `apps/web/src/__tests__/notebook-portable-model.test.ts`. Questi tre file sono quindi lavoro del reviewer, non oggetto di una sua review indipendente; il builder li verifica separatamente. Nessun file UI/API/Core modificato dal reviewer.

API: `Rect`, `Annotation`, `NotebookState`, `NotebookSnapshot` e `readNotebookSnapshot(value, derivedText)`. Il parser preserva `editionId?`, `notebook?` e `asset.bytes?`; editionId e dimensione del PDF incluso sono richiesti per il quaderno scientifico. Rimane compatibile con fonti/allegati generici legacy che omettono tali campi. Valida forma, limiti Unicode, geometria, testo derivato, duplicati e binding tra revisioni/asset. Conserva snapshot e testo quando il PDF manca, senza sostituzioni: l'ammissibilità delle omissioni resta al Core. Non ricomputa gli hash canonici e non verifica i byte reali, responsabilità dell'ispezione e del decoder.

Eseguito soltanto il nuovo file di test, con un worker: **41/41 passati**, durata Vitest 272 ms. Non eseguiti gate, build, typecheck, browser o suite preesistenti; nessun commit.
