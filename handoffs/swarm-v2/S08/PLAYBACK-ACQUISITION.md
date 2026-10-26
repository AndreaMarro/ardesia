# S08 — sottotitoli nel replay, checkpoint del 26 ottobre 2026

Base50083404, main992d1a0b, stessa313 finché aperta. Il primo batch resta verificato nella sua fonte storica. Questo incremento è IN_IMPLEMENTATION: typecheck, browser e CI della nuova fonte ancora da eseguire, non trasferire i verdi500.

## Decisione di riuso

Registro139 riletto, hashdf6d75716ab99dbd79d98d666818e56f75a9ebcd2dcb9a61e0a60516c2ad1141. Tre candidati pertinenti: APIWebTextTrack/activeCues (REUSE), renderer media-captions0.0.18 MIT già acquisito (DEFER rendering; l'entryserver createVTTCueTemplate dichiara throw), Video.js10.2.0 Apache2 da metadata npm ufficiale (DEFER, non installato o eseguito). Il playeraudio/ReplayEngine esiste già: il motore nativo fornisce cuechange/seek/pausa/fine senza sostituirlo. Nessun nuovo codice terzo, manifest/lock, server, storage, consenso o ledger.

Fonti: https://html.spec.whatwg.org/multipage/media.html#text-track-api ; https://developer.mozilla.org/en-US/docs/Web/API/TextTrack/mode ; https://legacy.videojs.org/guides/text-tracks/ . La documentazioneVideojs è legacy, non prova della compatibilità v10. Il runtime nativo sarà verificato sul browser effettivo, non dedotto dai documenti. REA della nuova esperienza ancora NON_RUN.

## Consumer e Core

Il catalogo aggiunge solo pin ID/revisione/SHA al replay esistente. Il player legge fonte/indice dal Core e verifica la stessa lezione/sessione/registrazione/hash/durata contro il journal locale. Nessun testo nell'URL, fallback a revisioni diverse o enumerazione di risorse. Un track Blob temporaneo usa WebVTTgià implementato: il motore browser seleziona solo ID; testo Core reso daReact, maiinnerHTML. Lettura aggiornata all'ingresso, focus/visibilità e prima dei salti; rilettura15s con deadline5s mentre visibile, dati rimossi quando nascosto o dopo errore. Non è revoca fisica dei byte locali o servizio push.

ReplayView integra il pannelloS08 e mantiene la propria autorità audio/journal; sincronizza anche seek nativo inpausa/fine. Controllati tutti14PRaperti: nessun writerReplayView/replayTimeline osservato; le riserve concrete rimangonoRoomS07/S14 eRootApp/API/releaseS00. Il solo raccordo necessario alla fruizionemedia è rivendicatoS08 e incluso nel candidate, S00integra. La precedente richiesta cautelativa è preservata e precisata in PLAYBACK-CONTRACT-DRAFT.md.

## Prove/fallimenti al checkpoint

14test modello e4UI PASS effettivi prima delle aggiunte successive. Prima suite namespace:43PASS più errore startupworker (non verde); secondo run interrotto dopo2FAIL dei testimport preesistenti mentre altri slot erano attivi, causaUNKNOWN. Nessun timeout o asserzione preesistente modificato per aggirarlo.

Review read-only ha riprodotto P2: risposta Core tardiva sovrascrive seek manuale più recente. Fix: revisione dei comandi condivisa colplayer, snapshot prima delpreflight e verifica prima delcallback; un cambio successivo annulla il salto con messaggio. Tre probe puri del reviewer dopo fix: posizione8s/epoch9000 preservata, percorso normale0.125s/1125 corretto, identità cambiata non muove. Nessun nuovo finding nella controprova; non eseguiti dalreviewer React/browser/tsc/build. Nuove regressioni React eStudio preparate, ancora da eseguire.

## Risorse e continuità

CheckoutDocuments originale compressed,dataless preservato; worktree da commit esatto in /private/tmp, nessun reset o hydrationmassiva. Fermati solo propri read/test bloccati con verifica cwd ecommandline. Runtime Node/npm esistente riutilizzato, nienteinstall. S00/S14/S02 occupavano gli slot; nessun compiler/browser S08 avviato al checkpoint.

1. P0: ns50test e Studio regression/tsc seriali in slotlibero, conservando FAIL e diagnostici; criterio: prove effettive sulla nuova fonte.
2. P0: browser suWAV/journal eCore reali, seek/cue/pausa/fine/cambio take/cookie/revoca e race con HTTP ritardato, mobile/tastiera/Blobcleanup; REA sullo stesso scenario.
3. P0: stessaPR aggiornata solo come candidate verificato, allrequired esatti e handoffS00/main/postmerge; non DONE prima dell'integrazione.
4. P1: server/storage/video/upload/Range S10; nessun endpointinventato, ascoltoumano/Safari/device e revoca fisica delle copie non certificati.

## Correzione CI81 e confine workspace

CI81 ha verificato Web/Core/API/MCP/hygiene/golden/marketing, ma Studio/readiness sono FAIL: React ejsx-runtime non risolti dal fileWeb durante npmci delsoloStudio, erroriTS2307/TS2875 e derivati. Il consumerReact, CSS e7test ora vivono in apps/studio/src/lesson-media; solo contratti/helper senza framework restanoWeb. Nessun manifest/lock/gate o nuovo pacchetto. Il primo setup di prova standalone aveva cwd errata e non aveva rimosso rootdeps: il tsc0 successivo è un check caldo, NON una prova di installazione pulita. Percorsi corretti prima del prossimo check.

La fonte primaria viene riletta dopo l'indice, come nel catalogo: un indice ancora leggibile non autorizza la vista dopo il ritiro della fonte. Nuovo negativo controllato per ritiro durante indexload, senza fingere una transazione atomica tra dueGET. I timer e i controlliCore non sono revoca fisica dei byte o un nuovo sistema di consenso.

## Addendum 26 ottobre — correzione confine Studio verificata

Il consumer React/CSS e i suoi test sono nel package Studio; Web conserva contratti/helper privi di React. Typecheck forzato `tsc -b --noEmit --force` EXIT0 in102.14s con root/Web node_modules realmente assenti, runtime Studio già installato riusato: prova del confine di risoluzione, non una nuova npmci. NamespaceWeb44/44PASS in5file; Studio27/27PASS in2file (7consumer+20ReplayView), seriali coi flagAGENTS. Nessun manifest/lock/gate modificato. Il precedente processo50208 non era più interrogabile dopo ripresa: nessun esito dedotto, prova ripetuta con risultato/log sufile.

Review read-only del delta: nessun nuovo finding; source-last negativo discriminante e import puri verificati staticamente. Lo spy del vero ReplayEngine verifica scena calcolata/cursore, non dimostra da solo renderingExcalidraw. Browser/REA di questo batch ancora NON_RUN al commit. Le dueFAIL import e lo startup precedente restano storici, non riscritti come verdi. Patch di raccordo aggiornata nel file `replay-captions-integration-current.patch`, informativa e già applicata; vecchia patch conservata.

## Addendum CI89: vincolo token e whitespace reali

Studio/readiness typecheck oraPASS, ma fullsuite intercetta1FAIL di design-tokens: i fallbackhex nel CSSspostato violano il canoneStudio. Fix nel solo replay-captions.css: tokenesistenti, canvas/accent-wash sostituiscono due nomi nondefiniti. Nessun test/token/gate comune cambiato. HygieneFAIL per blanklineEOF in2snapshotlog: byteoriginali conservati .gz+hash, agli snapshot testuali aggiunto solo footer. CI89FAIL conservata; nonverdeglobale. Browser89PASS9gruppi, ma review delimita: cursorejournal, non transizionevisiva; track rimosso, revokeBlobsolo statico; hidden solo unit. Runner successivo rinforza403/401 con statusHTTPesatti, noseek e assenzatrack entrambi; non si trasferiscono taliasserzioni alla prova89.

Controprova design-tokens dopo fix:17/17PASS in2.56s, fileesistente immutato. Il solo cambiamento prodotto dopo il browser89 è CSSsenza fallbackhex/nomi inesistenti. Nessun compiler/build/browser riavviato mentreS14 prende il gap annunciato6412863321. Il prossimo browser userà status403/401 e no-seek/track espliciti; nessuna prova nuova ancora rivendicata.

## Addendum 26 ottobre — player sincronizzato, fonte1eb71382

La frase storica «sottotitoli montati nel player da implementare» è superata da questo batch. [Rapporto nuovo](NATIVE-PLAYER-REPORT.md): consumerStudio/Core e TextTrack reali,44Web+27Studio+17tokenPASS, typecheckStudioforzato senza root/WebdepsPASS, browserfinale9gruppiPASS1440/390. Source `1eb713820dba483726504fd8c79d71cb19a3dc4d`; CI della consegna finale da rileggere. Fallimenti81/89 e byte raw conservati; REA passivo89 distinto dalla prova finale e dai parserstatici. Merge/deployS00 non eseguiti. Nessun DONE o ascoltoumano/Safari/remoto dichiarato.
