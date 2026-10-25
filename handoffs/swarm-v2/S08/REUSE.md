# Riuso S08 — 26 ottobre 2026

Nessuna nuova dipendenza o asset di terzi adottati. Il catalogo riusa i contratti first-party già presenti alla base immutabile 37e0fe828e47b7c81784c2eb48a1b9776dd859ed:

| Sottosistema | Fonte nel repository | Consumer e prova | Limite / rollback |
| --- | --- | --- | --- |
| Player/replay, audio + oggetto | apps/studio/src/ReplayView.tsx, store/lessonPassage.ts, audioRecording.ts, replayTimeline.ts | Link dal catalogo con recording/session/hash/object/version/time esatti; prova browser con due WAV sintetici e journal canonico | locale; nessuna nuova route media. Rimuovere mount Materials e cartella feature |
| Fonti/identità/persistenza | packages/engine/lessonos/study/store.py, context.py; API resources/revise | indice editoriale come StudyResource, CRUD/CAS e autorizzazioni esistenti; test SQLite reopen e HTTP | API generica non impone il tipo indice; parser fail-closed. Risorse vecchie preservate |
| Validazione descrittore | learning_experiences.validate_lesson_passage / lesson_passage_resource | servizio Python S08, nessun secondo validatore descriptor | metadati non attestano byte disponibili |
| Presentazione | React 19.2.6, Vite 8.0.12 già nel lock; styles.css e token esistenti | Materiali + CSS locale, desktop/mobile/tastiera | nessun sistema visuale parallelo; review S02 richiesta in handoff |
| Trascrizione manuale e WebVTT | implementazione originale S08 | cue con tempi espliciti; export testo dopo rilettura Core | niente ASR, nuova AI o dato vocale esterno |

Video.js/hls.js/WaveSurfer/LiveKit/FFmpeg/MediaCMS restano candidati non adottati. Non serve aggiungere un runtime player quando il primo consumer necessita del replay canonico del quaderno già presente. Non vengono attribuite versioni/licenze/test a pacchetti non installati. Nessun bundle proprietario, asset senza licenza, server a pagamento o ASR esterno usato.

Gli asset QA sono WAV sintetici generati dal runner (onda sinusoidale, non voce di persone) e testo originale first-party. Nessun media di studenti nel Git/bundle prodotto. Non è stato eseguito un esperimento REA nuovo su un donor esterno: questa è ispezione di API/codice first-party e riuso diretto. Risparmio temporale complessivo UNKNOWN; nessun moltiplicatore rivendicato.
