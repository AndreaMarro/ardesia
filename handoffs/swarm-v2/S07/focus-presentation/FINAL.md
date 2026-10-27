# Focus presentazione — consegna S07

Capacità acquisita: API native Excalidraw per coordinate/camera e Yjs esistente per ink, senza dipendenze nuove. Teacherhost può indicare un punto; il partecipante aderisce esplicitamente, mantienezoom e lavora fino a finegesto prima del focus. Scope/source/page e sequenza controllati, offline/riprova, errori stabili, revoca e risposte tardive gestiti.

Funzioni originali: policyview locale e bindingCore, non trasporto/CRDT/login. Core deve fornire grant e porteautorizzati; niente autoattribuzione role. Consumer realeRoomCollaboration/Toolbar, Room.tsx byte77 intatto, focusnoncheckpointato; cachevista segue il comportamentoStoreoriginale.

Fonte verificata2a1286a0707952fd303f5815a7d65ccd1bde67bb, base992d1a0b, stessaPR311. Native20PASS12.376s in3contesti/2pagine, byteSHA eGitbuildverificati; sourcea383 identico,43namespacePASS efullStudio2347PASS/5skipstorici, typecheck/build e7requiredverdi. CI dellahead di sola consegna va letta live prima delmerge; goldenadvisoryeventualepending non èPASS. Nessunmerge/deployS07 oapprovazioneumana.

REAeffettiva:2EvidenceID/bundle nelREADME, providerCDPversion2; osservazione passiva delprimo browser17, AXviewer senzaPublish, policyfiltered/attachlimited e artifactidentityUNKNOWN. Non azioniREA o provaCore; nuovi20nativi sono una esecuzione separata. Pin/licenze/4candidati e ragioniADAPT/DEFER inDONORparent eREA-DECISIONS. Nessunasset/codiceproprietario o risparmiomisurato.

Debito: mount/grant/transport/storageCore e sorgenteCore reale, sidecar.lesson,11browser/remoto, consegna/freeze/compattazione, mediaS08, formule/libraryS14 dawriterS00, mobile/deviceumano. Native390 senzaoverflow maautofit/canvasridotto è limite dichiarato. Prossimo: S00review+integrazione, S10protocolloCore e3poi11remoti, S08/S14roundtrip+replay/proposte. Primo passo/dipendenze/accettazione/evidenza nelREADME.


## Checkpoint nativo 21 e scorciatoie — 2026-10-26T10:42:47.897462+00:00

La prova su commit esatto `876b4ddba24328a2454ed156e0bab6e5e0cb6bb0` termina EXIT 0: **21 controlli PASS**, tre contesti isolati, stesso PDF di due pagine, zero errori inattesi, 8.466 secondi nello scenario caldo. Git SHA della build verificata nei tre contesti. Il nuovo caso controlla il nome accessibile «Tratti a penna»; rimangono verificati consenso, zoom personale, penna e Space/pan con focus durante pointer-down, acquisizione sulla pagina originale prima del cambio, ordine, revisione errata, recupero, errore/riprova e revoche. JSON, log originale compresso, screenshot desktop/mobile e inventario dei blob Git sono in `evidence/native-pen-scope/`. Screenshot ispezionati: nessun overflow a 390 px, ma canvas ridotto e autofit al 10% rimangono un limite dichiarato. REA non è stata ripetuta: i due record del primo browser 17 sono separati e non attribuiti a questa esecuzione.

Tutti i controlli CI di `876b4ddb` sono SUCCESS, compresi golden advisory, marketing e no-deploy. Non si trasferisce questo risultato automaticamente al commit successivo. Il processo Vite proprio 19514 è concluso, il runner ha chiuso Chromium, porte 5470/5477 libere e fixture rimosse dalla root Studio; release effettiva commento 6413861445 della PR 306.

Il source trace di MathComposer ha rilevato un conflitto concreto: il listener globale Ctrl/Cmd+Z del layer ink escludeva i campi testuali ma intercettava il custom element `math-field` usato dall'editor di formule dentro Room. Controprova DOM **1 FAIL** sul vecchio selettore, poi **1 PASS** con la guardia `isInkUndoTarget` che esclude anche MathLive e i suoi discendenti. Il listener usa ora quella guardia, senza modificare MathComposer/Room o il lavoro S14. Log RED/GREEN conservati lossless con hash in LOGS.json. Review separata solo statica: nessun problema residuo in questa modifica; nessun test eseguito dal reviewer e nessuna approvazione umana.

La prova nativa 21 precede questa sola guardia di tastiera: non è dichiarata una nuova esecuzione browser del commit successivo né un test del composer S14 combinato. La guardia ha prova DOM mirata e attende CI completa sulla nuova head. Focus, toolbar e logica di cattura sono invariati rispetto al browser 21. Stato: candidato READY_FOR_INTEGRATION dopo CI esatta; integrazione e rilascio S00, grant/trasporto/storage remoto S10 restano da svolgere.
