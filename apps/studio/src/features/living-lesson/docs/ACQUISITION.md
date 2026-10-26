# Acquisizione e confini dei donor

Base rilevata: `a00f2f40091aecf69e58ebaba42cf70d748e4066`, 26 ottobre 2026. PR311/313/318/319 aperte al rilevamento: non sono API disponibili in main.

## Wavesurfer 7.11.1 — acquisito e usato

Registry tarball originale, BSD-3-Clause, zero dipendenze runtime. Integrità SHA-512 pubblicata verificata sui byte; checksum per ogni file in `vendor/wavesurfer/PROVENANCE.json`. Core ESM, Regions e Timeline sono distribuzioni upstream integre. Le sole aggiunte sono sidecar TypeScript `.esm.d.ts`. Il codice Record non è acquisito né usato. Nessuna CDN richiesta.

Il player riceve `media` al costruttore, perché il flag di proprietà dell'elemento viene fissato lì. I peaks provengono da `AudioContext.decodeAudioData` sui byte già verificati dal consumer canonico; la durata è quella della take. La costruzione conserva il source dell'elemento esterno. `interact:false` impedisce un seek interno concorrente; regioni e slider chiedono il seek a ReplayView. Il cursore di ReplayView segue `currentTime`, con offset `startEpoch`, e proietta l'unico ReplayEngine. Il teardown distrugge soltanto la proiezione e i listener; il consumer canonico mantiene la proprietà di src/URL. Questa ultima proprietà richiede e riceve una controprova browser, non si deduce dal nome della libreria.

REA MCP assente nella sessione. CLI6.7.0 disponibile: doctor registra Codex sano ma non dimostra connessione MCP. Il tentativo sull'intero package è stato interrotto dopo oltre8min senza Evidence completa; la selezione core+regioni+timeline è terminata con `provider_timeout`20s, con record parziale conservato. La selezione del solo Timeline è riuscita (`ev_9bca5bce5d33231527467781d0584f45edfec51f6f649ae34b5595d85fcabbcb`);97 file non selezionati. I record completi gzip sono nelle prove. Non si attribuisce una riuscita dell'intero package al sottoinsieme. L'analisi diretta di bundle/dichiarazioni e la prova del vendor nel browser sono distinte dalla Evidence REA statica.

## Excalidraw — riuso della dipendenza esistente

Versione effettiva, licenza e digest del package registrati in ACQUISITION.json. `onChange(elements, appState, files)` alimenta JournalRecorder e il salvataggio dello scene envelope. `initialData` conserva i BinaryFiles; il replay richiede il file esatto per ogni immagine/pagina presente nello snapshot. `serializeAsJSON` ricostruisce l'envelope e scarta un'extension top-level: controprova ripetibile in serialization.test.ts. `preserveEditorial` conserva esclusivamente l'extension validata dopo il serializer, senza copiare campi privati dal vecchio envelope. Non sostituisce il filtro delle proiezioni private di S07: la composizione con legacyBoardScene è una prova separata.

## Yjs — ispezionato, nessun secondo documento

Package13.6.27 MIT realmente scaricato; URL, integrità, dipendenze e tarball SHA256 in ACQUISITION.json. Il codice pubblico `src/utils/encoding.js` usa applyUpdate/encodeStateAsUpdate e document update binari. Gli update sono commutativi/idempotenti; non sono revisioni immutabili di una scena scientifica e non sostituiscono la verifica oggetto/versione. PR311 espone un adapter con scope room/owner/audience/source(resourceId,revisionId,sha256,pageCount), segnale di cancellazione e checkpoint commesso/pending/requestId. È ancora aperta: S17 non apre un altro Y.Doc o un altro checkpoint store. Il consumer futuro consegna elementi pubblici già filtrati e il riferimento scientifico risolto; i marker continuano a riferirsi al journal canonico.

## Trascrizioni e capitoli

Raccordo concordato con S08 sulla sua head congelata `ee551e41f35c7b90ca4c473f68ebd8f397533572`: `captionContent` è soltanto uno slot ReactNode per ospitare ReplayCaptions, non un payload o una cache di testo. Audio hash e source/index SHA Core restano distinti. Il pannello S08 conserva preflight, revoca, riferimenti esatti e seekRevision. La sua composizione con questa patch non è implicita e resta da certificare da S00. I marker locali sono dichiarazioni esplicite del docente di contesto oggetto/versione; non estendono MediaIndex né inferiscono significato della voce. Un capitolo già presente nell'indice S08 deve essere proiettato dal suo consumer, senza duplicarne l'autorità.

Fonti primarie: [Wavesurfer API](https://wavesurfer.xyz/docs/), [player7.11.1](https://github.com/katspaugh/wavesurfer.js/blob/7.11.1/src/player.ts), [Wavesurfer7.11.1](https://github.com/katspaugh/wavesurfer.js/blob/7.11.1/src/wavesurfer.ts), [Excalidraw API](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/), [Yjs update API](https://docs.yjs.dev/api/document-updates).
