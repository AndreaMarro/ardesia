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

## Addendum 26 ottobre — acquisizione sottotitoli

Il testo precedente descrive il primo batch e resta intatto. Il successivo incremento93deff59, candidato con main48251a32, adotta **media-captions0.0.18 MIT**: distribuzione server e tipi ufficiali immutati,29file byte-esatti, pin/integrità/licenze e manutenzione nel manifest locale. Parsing/tokenizzazione VTT/SRT lazy → anteprima/cancel → bozza → stesse revisioni Core → ricerca/export. Nessun manifest/lock condiviso o servizio modificato.

Tre candidati comparati, REA su variante prod e vendorizzato finale, limiti, correzioni, review e prove sono in [CAPTIONS-ACQUISITION.md](CAPTIONS-ACQUISITION.md). La prima proposta npm è superseduta e mai applicata; decisione finale ADAPT con distribuito locale verificato. Il mandato media remoto resta aperto.

## Addendum 26 ottobre — player sincronizzato, fonte1eb71382

La frase storica «sottotitoli montati nel player da implementare» è superata da questo batch. [Rapporto nuovo](NATIVE-PLAYER-REPORT.md): consumerStudio/Core e TextTrack reali,44Web+27Studio+17tokenPASS, typecheckStudioforzato senza root/WebdepsPASS, browserfinale9gruppiPASS1440/390. Source `1eb713820dba483726504fd8c79d71cb19a3dc4d`; CI della consegna finale da rileggere. Fallimenti81/89 e byte raw conservati; REA passivo89 distinto dalla prova finale e dai parserstatici. Merge/deployS00 non eseguiti. Nessun DONE o ascoltoumano/Safari/remoto dichiarato.
