# S08 — catalogo registrazioni e replay contestuale

Stato dell'incremento: IMPLEMENTATO / TESTATO LOCALMENTE, integrazione e distribuzione non eseguite da S08. La validazione completa e l'esito PR sono da leggere insieme alla SHA della consegna; una PR aperta non è DONE. Il mandato video/remoto complessivo resta incompleto.

## Risultato utilizzabile

Materiali → «Ritrova un passaggio»: catalogo dei passaggi `lesson-passage` già condivisi con l'edizione, ricerca tra trascrizioni/capitoli, due registrazioni della stessa lezione distinte. Un tutor owner prepara titolo, frammenti e timecode espliciti, capitoli e revisioni di fonti/attività collegate; salva come risorsa Core con CAS e riapre la revisione editoriale. Il testo si può correggere senza spostare i tempi. Nessun provider ASR/LLM necessario.

Il comando principale apre il player Studio sulla scena canonica verificata con oggetto/versione; un capitolo/frammento apre il tempo audio scelto, senza fingere che la versione dell'oggetto esistesse già a quell'istante. Lo Studio locale verifica byte, hash, sessione e consenso; la scheda catalogo resta aperta per il ritorno. Il servizio remoto può condividere testo e riferimenti, ma non trasferisce i media locali.

WebVTT manuale preparato dopo rilettura della fonte e dell'indice dal Core; fonte ritirata blocca export/player. Le revisioni precedenti rimangono esplicite. La vista di fonti/allegati ricontrolla i permessi della revisione. Non registra eventi “guardato=imparato”.

Build Web,9nuovi test Web,18test dominio/regressioni e1testHTTP: PASS. Chromium desktop/mobile finale: PASS;12controlli funzionali, nessun erroreJS/console inatteso. La suite Web ampia locale ha fallimenti conservati, non è verde: [dettagli e comandi](VALIDATION.md).

## Codice, proprietà e compatibilità

- UI nel namespace apps/web/src/features/lesson-media; mount minimo in Materials.tsx, senza RootApp/routing/shell.
- Dominio in packages/engine/lessonos/study/lesson_media; riuso StudyStore/context/lesson_passage_resource, nessuna migrazione o route nuova.
- Nuovo documento editoriale lesson-media-index.v1 come risorsa Core. L'API generica conserva owner, membership, CAS e idempotenza; non applica la validazione specifica Python. Il consumer browser valida e ricontrolla fonte/revisioni; documenti invalidi non vengono proiettati.
- Nessuna dipendenza aggiunta, nessun servizio a pagamento/worker remoto attivato; dati di prova originali e sintetici. [Riuso e limiti](REUSE.md), [contratti](CONTRACTS.md), [review tecnica](REVIEW.md).

## Come provarlo

Dopo una condivisione da Studio all'Aula, aprire Materiali della stessa edizione. In alternativa riprodurre [la prova QA](QA.md) con database e browser sintetici nuovi. Il runner genera due WAV e journal canonico, pubblica i riferimenti nella sola API di prova e attraversa il consumer reale, senza mock di API o byte.

Il testo può essere condiviso nel gruppo mentre l'audio è assente dall'archivio corrente: questo è uno stato esplicito, non un link remoto funzionante. Le registrazioni locali richiedono lo stesso origin/archivio Studio oppure importazione .lesson già implementata. Il catalogo non concede accesso remoto a tali byte.

## Limiti e prosecuzione

Non implementati: video remoto, bitrate adattivo/HLS, upload a chunk riprendibile, quarantena/worker/retry media remoto, concessioni Range e revoca cache URL remoti, offline autorizzato, sottotitoli montati nel player e avvio di attività canoniche a timestamp. Il collegamento a una fonte/attività non crea un nuovo tentativo o una prova di apprendimento. Nessun test automatizzato certifica ascolto umano, Safari/device fisico o correttezza scientifica umana.

Il primo batch locale include più del primo esempio: editing/riapertura, ricerca tra lezioni, capitoli, export e permessi negativi. Il primo batch remoto resta subordinato ai contratti assenti osservati in assets/uploads/blobs, dettagliati in CONTRACTS.md. Non sono state inventate API o approvazioni. RUNLOG/NEXT restano al writer S00: [append proposta e tre prossimi batch](RUNLOG-APPEND.md).
