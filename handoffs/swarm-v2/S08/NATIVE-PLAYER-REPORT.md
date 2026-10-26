# S08 — player con trascrizione sincronizzata, 26 ottobre 2026

Stato: IMPLEMENTATO E TESTATO; CI della consegna finale da rileggere. Stessa [PR313](https://github.com/AndreaMarro/ardesia/pull/313), prodotto `1eb713820dba483726504fd8c79d71cb19a3dc4d`, base main `992d1a0b5cdf40d94259d3be698a4d6c5dcc1231`. S00 integra e distribuisce. Nessun merge/deploy S08; non DONE. I rapporti e i verdi dei batch precedenti restano snapshot distinti.

## 1. Capacità acquisita

Da Materiali si apre il player Studio già esistente con i pin di fonte e indice Core. Audio locale, journal, sessione e consenso restano canonici. Il testo segue il tempo audio usando TextTrack/activeCues nativi; trascrizione completa e capitoli permettono il salto dopo una nuova lettura autorizzata. Il player non salva una seconda copia della trascrizione. L’editor/import VTT-SRT/Core/CAS dei batch precedenti è il produttore dello stesso indice persistente, senza nuova API o tabella.

## 2. Riuso e candidati

Registro139 riletto (SHA256df6d75716ab99dbd79d98d666818e56f75a9ebcd2dcb9a61e0a60516c2ad1141). TextTrack/activeCues REUSE: motore della piattaforma, nessun codice/asset terzo copiato. media-captions0.0.18 MIT già acquisito continua a produrre/parlare il formato; renderer DEFER perché non serve sostituire il player e l’entryserver createVTTCueTemplate dichiara throw. Video.js10.2.0 Apache2, metadata npm ufficiale, DEFER per questo consumer; non installato/eseguito. La documentazioneVideo.js osservata è legacy e non prova compatibilitàv10. Nessuna dipendenza, lock o gate aggiunto.

Fonti ufficiali: [HTML TextTrack](https://html.spec.whatwg.org/multipage/media.html#text-track-api), [TextTrack.mode](https://developer.mozilla.org/en-US/docs/Web/API/TextTrack/mode), [Video.js text tracks legacy](https://legacy.videojs.org/guides/text-tracks/). La licenzaMIT e i29file/hash del parser rimangono in vendor/PROVENANCE del precedente batch.

## 3. REA realmente osservato

Provider rea-cdp-browser versione2, HeadlessChrome148.0.7778.96. List+inspect passivo sullo stesso browser del primo scenario89cc1fe9, al primo cue in pausa: DOM179nodi, track audio e accessibility del frammento letterale e dei comandi. Bundle2record esportato in `rea/native-player-runtime-evidence.json`; IDs/hash nel manifest. Copertura policy_filtered/attach_limited; niente sorgenti, cookie o valori storage. REA non attesta identità artefatto né ricostruisce retroattivamente la sequenza. Il runner Playwright prova la sequenza nativa; i due strumenti non vengono confusi. Nessun binario REA aperto da chiudere; browser e server QA conclusi.

## 4. Implementazione originale e consumer

`apps/studio/src/lesson-media` contiene React/CSS/test; Web contiene solo contratti/helper e adapter TextTrack. `ReplayView` riceve un raccordo minimo per pannello, autorità del seek e allineamento cursore anche durante seek nativo in pausa/fine. Controllati14PRaperti prima di rivendicare il file: nessun writerReplayView osservato; Room eRootApp/API/release non toccati. Patch informativa già applicata `replay-captions-integration-current.patch`, non applicarla due volte.

I pin portano solo ID/revisione/hash, mai testo/token. Il reader legge prima l’indice e poi la fonte primaria, verifica lezione/sessione/registrazione/hash/inizio/fine/edizione. Rifiuta mismatch e riferimenti malformati senza enumerare Core. La lettura finale non finge una transazione atomica fra dueGET. React rende il testo letterale; gli ID numerici dei cue nativi selezionano solo frammenti validati. Nessun innerHTML o nuovo ledger.

## 5. Permessi, persistenza ed errori

Le risorse persistono nel Core già esistente e il player legge revisioni esatte a ingresso/focus/visibilità, prima di ogni salto e ogni15s mentre visibile, con deadline5s. Errore/ritiro/cambio take rimuovono testo e track. Nascosto/sessione terminata cancellano i dati del consumer. Cookie, membership e permessi restano Core; byte audio locali richiedono le verifiche Studio già presenti. Nessuna pretesa di revoca fisica dei file scaricati o di notifica push immediata.

Una revisione dei comandi impedisce a un preflight tardivo di sovrascrivere un seek manuale successivo: compare un messaggio e l’intento nuovo resta autorevole. Il track Blob è temporaneo e il cleanup chiama revokeObjectURL; il browser asserisce la rimozione del track, non la liberazione della memoria.

## 6. Prove sulla fonte

- Typecheck Studio forzato EXIT0 in102.14s con root/Web node_modules realmente assenti; runtimeStudio esistente riusato, non una nuova npmci. Log+JSON checkpoint conservati.
- Web44/44PASS in5file; Studio27/27PASS in2file (7consumer+20ReplayView), seriali coi flagAGENTS. Il vero ReplayEngine produce scena/cursore del seek inpausa; lo spy non prova da solo il renderingExcalidraw.
- TokenStudio17/17PASS dopo correzioneCSS; test/gate invariati.
- Browser finale su1eb71382, Chromium148,52.81s inclusi3server:9gruppiPASS. Catalogo/Core→WAV/journal reali, URLpin, cue nativi, testo letterale/script non eseguito, seekpausa/cursore, raceHTTP reale senza mock della risposta, fine naturale4x, due take, ritornoMateriali,403e401esatti/no-seek/no-track,390px/tastiera e ritiro14891ms. Zero pageerror/HTTPinattesi;401/403/404previsti registrati. Screenshot1440/390 finali ispezionati.
- Il fixture ha una scena invariata: prova cursore e audio, non una transizione visiva dinamica. Hidden è coperto dal test unitario, non dallo scenario browser. Nessun ascolto umano o Safari/device/Range remoto attestato.

Manifest: `native-player-final-validation.json`; output `final-native-captions-browser-result.json`, screenshot `final-s08-native-captions-*.png`. La fonte prodotto resta congelata; la CI deve essere letta sulla head effettiva di consegna, senza ereditare verdi storici.

## 7. Errori, review e memoria conservati

CI81FAILStudio/readiness: ReactWeb importato in cleanStudio, nascosto dal runtime condiviso locale. Fix: consumerReact nel packageStudio, contrattiWebpuri. Prima preparazione standalone con cwd errata fallita; tsc caldo successivo non spacciato per pulito. Una sessionecompiler non più interrogabile alla ripresa non ha esito dedotto: nuova prova con log sufile.

CI89FAILdesign-tokens per fallbackhex del CSSspostato, e hygiene per blanklineEOF in2log allegati. Fix solo CSStokenesistenti e footer metadati agli snapshot; gzip conserva byte raw e SHA originali. LogCI compressi nel namespace, nessun gate indebolito. Startupworker e2FAILimport locali precedenti restano FAIL/causaUNKNOWN;44PASS successivi sono una nuova esecuzione.

Review read-only ha riprodotto il P2 seek tardivo, poi3controprove purePASS. Review delta finale senza nuovi finding; review browser delimita correttamente Blob/scene/hidden/REA e ha portato a rinforzare403/401 nel secondo runner. Nessuna firma scientifica/umana. Nessun file modificato dal reviewer.

## 8. Risultato e limiti reali

Trascrizioni manuali/importate già salvate possono ora essere seguite e consultate nel replay della registrazione corrispondente, conservando sorgente/versione e contesto del quaderno. Il catalogo resta aperto. Nessuna raccolta studenti, microfono o providerASR/LLM usato; fixture interamente sintetico.

Restano video/remoto, upload riprendibile/hash/quarantena/worker/retry, concessioniRange/cache/offline autorizzato, attivitàcanoniche a timestamp e prova sul deployment dopo integrazioneS00. Server/storage/auth/schema sono S10. Non vengono dichiarati imparato/efficacia didattica o approvazione scientifica dai test sintetici.

## 9. Prossime tre acquisizioni

1. P0S00: integrare stessa313 dopo head/checks esatti, provare percorso sulla main risultante e deployment privato pertinente, appendere memoria comune. Criterio: SHA/CI e consumer reale ricontrollati; READY non equivale a DONE.
2. P1S10/S08: contratto remoto grants/uploads/blobs→player; negativi401/403/revoca/Range, interruzione/resume/hash/quarantena/cancel su servizio reale prima di video/HLS. Primo passo confrontare CONTRACTS.md con API effettive, senza endpoint inventati o spese implicite.
3. P1S05/S06/S08: attività/fonti a timestamp con revisioni e ricevute canoniche, poi offline solo per contenuti ammessi. Primo passo consumerconcreto e contratto owner; criterio ritornoquaderno e permessi al riuso/export/restore.

Tutto lo storico precedente resta immutato, con addenda datati. RUNLOG/NEXT comuni restano S00; appendice proposta in RUNLOG-APPEND.md. WorktreeDocuments dataless preservato, checkout operativo isolato in /private/tmp, runtime riusato senza installazioni. Porte5480/5481/5482/5483 chiuse e nessun altroheavy S08 in coda.
