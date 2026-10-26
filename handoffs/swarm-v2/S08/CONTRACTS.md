# S08 — confini osservati e richieste

Base 37e0fe828e47b7c81784c2eb48a1b9776dd859ed, 26 ottobre 2026.

## Riuso implementato

Consumer: Materiali → LessonMediaLibrary → MediaIndexEditor / player Studio. Delta locale Materials: import e mount, esclusione del tipo indice dalla lista testuale generica. Nessun routing/root lock/CI/shared auth/schema modificati. La regressione sul resolver canonico è nel workspace Studio (nuovo test dedicato), senza modificare il suo codice.

`lesson-passage.v1` e `lesson-passage-source.v1` restano canonici; `validate_lesson_passage`/`lesson_passage_resource` riusati nel dominio. Nuovo documento editoriale `ardesia.lesson-media-index.v1` trasportato dal Core `StudyResource(kind=lesson-media-index)` con fonte `{id,revisionId,sha256}`, durata immutabile, cue con startMs/endMs espliciti, capitoli e riferimenti a revisioni di materiali/attività. CRUD, owner, membership, CAS e idempotenza creazione sono quelli delle risorse Core. Gli indici non contengono byte/URL media e non concedono permessi. Gli indici malformati non sono proiettati; un riferimento non viene sostituito con la revisione corrente. Editor teacher-owner e condivisione group soltanto.

Servizio Python locale esportato: `validate_index`, `create_index`, `read_index`, `revise_index`. **Nessuna route nuova:** l'UI usa il trasporto generico esistente; la validazione Python specifica non è agganciata server-side alle route generiche. Il parser browser e le riletture delle fonti governano questo consumer; non presentare tale controllo come vincolo SQL/API globale. Indici creati da altri client possono essere invalidi e vengono esclusi dal catalogo.

Il passaggio clip→oggetto conserva lesson/session/recording/hash/object/version e usa il player Studio esistente, in una scheda separata; ritorno alla scheda catalogo. Il player effettua il controllo locale dei byte e del consenso. Le trascrizioni manuali restano utili senza byte locali. Accesso remoto al testo non è accesso remoto all'audio.

## S10/S00 — richiesta per il prossimo batch

Consumer mancante: registrazione video privata fruibile dal partecipante da un altro browser. I servizi osservati `assets.py` consentono solo audio<=20MiB/180s e immagini/PDF, accesso owner o allegato consegnato al tutor. Non esiste concessione a un media docente al gruppo, API a chunk, quarantena/pubblicazione video o lettura segmenti firmati.

Input richiesto: identità Core autenticata, edizione, recording/session/sourceRevision, MIME/sniffing, dimensione/hash e versione/scopo consenso verificati. Output: upload intent con token scadente e offset confermato; commit idempotente in quarantena; stato worker con retry; grant di lettura/Range breve dopo pubblicazione autorizzata. Errori richiesti: not_found/forbidden, stale_revision/consent_revoked, offset_conflict/hash_mismatch, unsupported_media/size_limit, processing_failed/cancelled. Compatibilità: gli indici attuali restano pointer a fonti immutabili; nessun auth o database parallelo.

Prove discriminanti prima di chiamarlo remoto: anonimo e altro studente non leggono manifest/segmenti; revoca invalida grant/cache; rete interrotta→resume con hash esatto; formato falso/quarantena/worker fail/retry/cancel; due registrazioni della stessa lezione distinte; restore/export rispettano i grant e la revoca corrente. Nessuna implementazione fittizia/mocked approvata come servizio reale.

## S05/S02 — consumatori

S05 può indicizzare titolo e cue solo dopo lettura autorizzata di indice e fonte, conservando entrambe le revisioni; nessun evento “guardato=imparato”. S02 può revisionare CSS locale basato sui token correnti e percorso Materiali. La prova browser della consegna dichiara ciò che è stato realmente eseguito; nessuna approvazione umana presunta.
