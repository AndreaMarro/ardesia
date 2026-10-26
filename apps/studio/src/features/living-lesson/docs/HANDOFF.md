# S17 → S00 / S08 / S20

Base reale a00f2f40091aecf69e58ebaba42cf70d748e4066. Solo namespace `apps/studio/src/features/living-lesson/`; nessun edit a Room, ReplayView, RootApp, store, Core, schema o lock condivisi. I donor provengono da package realmente acquisiti: vedere ACQUISITION e NOTICE.

## S00 — raccordo minimo

1. Rileggere main e ownership di Room/ReplayView. I due patch file sono vincolati ai checksum di PATCH-BASE.json e passano `git apply --check` sulla base indicata; il consumer verifica e applica quello ReplayView in memoria. Non sono un grant a editare file condivisi.
2. Conservare `livingLesson` dopo il serializer canonico e dopo `legacyBoardScene`: il test usa la sorgente esatta S07 e rifiuta proiezioni/private bytes. La conservazione del scene envelope deve avere **un writer**; questa patch non aggiunge CAS o risolve la scrittura concorrente di due Room. Non montare un secondo scene writer.
3. Esporre alla proiezione waveform lo stesso media element, la take selezionata esplicitamente e il cursore/seek canonico. Le callback tardive devono essere respinte per identità/generazione e range. Il `.lesson` di prova dimostra stesso passaggio docente/studente; il mount finale nella Room è ancora di S00.
4. Dopo313, comporre il seek con `seekToEpoch/seekRevision` esistenti, senza duplicarli. Le patch main hanno un semplice pending-seek per mostrare il contratto sulle capacità oggi disponibili; non certificano la composizione con313.
5. Integrare gli append RUNLOG/NEXT proposti sotto, verificare merge-tree e CI post-merge. Una PR aperta non è un'integrazione né una beta.

## S08 — media e captions

`captionContent` è ReactNode per ospitare ReplayCaptions invariato, non testo/indice esportato dal pannello. Collegare audioRef/seekRevision/identity/search/onSeek del medesimo ReplayView. Nessun reader, cache o modello di autorizzazione caption in S17. MediaIndex resta exact. I marker S17 dichiarano la relazione oggetto/versione; eventuali capitoli già nell'indice S08 devono restare proiezioni del relativo source revision/hash. Test della composizione: risposta caption ritardata + seek S17 successivo conserva l'intento nuovo;401/403/ritiro rimuovono track/testo; take/digest differenti non si associano.

## S20 — recupero studente

Importare i tipi pubblici dall'index del namespace. Il consumer host fornisce LessonAccess e un PrivateNotes già isolato per principal; il fingerprint aggiunge il contesto storico completo. Nessuna identità passata in query string costituisce un grant. La proposta locale usa un URL di riapertura con lesson/moment/recording/session/hash/at/objectVersion e mode=student; l'audio richiede il medesimo archivio o l'import `.lesson`. Un media/revisione/file mancante è indisponibilità esplicita, senza fallback all'ultima versione. La preparazione per l'Aula mantiene il descriptor canonico della take; il marker preciso rimane nell'extension della lezione, senza inventare condivisione Core.

## Append RUNLOG proposto — writer S00

26 ottobre2026, S17: implementato e verificato consumer locale Living Lesson su basea00f2f40, namespace isolato e Wavesurfer7.11.1BSD con provenance/checksum. Riusa recorder/journal/LessonOS/ReplayView/WorkspaceStore canonici. Prova browser fake-device con MediaRecorder reale distingue due take/oggetti, correzione/revisione storica, waveform, pausa/seek/fine/restart, nota privata/riapertura, export/import nuovo store, revoca/logout; layout390/820/1440 e touch/tastiera. Prova track-stop/logout live separata. Nessun hardware/remote ACL certificato. Writer storico Excalidraw perde extension: negativo conservato e helper di conservazione + patch SHA-pinned consegnati. Review separata ha trovato e fatto correggere5race/identità note, con controprove; nessuna firma umana inventata. REA MCP assente, CLI Timeline riuscita, tentativi più ampi timeout/interrotti espliciti. Le prime prove FileProvider/HMR non sono i PASS finali; esecuzione ripetuta su checkout temporaneo locale. Stato PR/CI della SHA esatta va letto nel body/record finale; merge e mount finale S00 pendenti.

## NEXT proposto — 4 task prioritari

1. P0 S00: primo passo comporre i due hook su Room/ReplayView proprietari finali; dipendenze311/313 e writer unico scena; accettazione stesso percorso docente/studente nella Room integrata; prova merge-tree+browser+post-mergeCI della nuova SHA.
2. P0 S00/S08: collegare ReplayCaptions al medesimo media/seekRevision; dipendenza riferimentiCore esatti e preflight; accettazione cue tardivo/revoca non sposta o espone contesto vecchio; prova HTTP+browser di composizione.
3. P1 S20: innestare LessonAccess/PrivateNotes reali nel suo consumer; dipendenza identità/Core canonici; accettazione isolamento principal+context, logout e cold reopen; prova due utenti autorizzati e controprove401/403.
4. P1 operatore: ascolto e microfono hardware/Safari/iPad; dipendenza consenso e dispositivo reale; accettazione comprensibilità e rilascio tracce; prova distinta dai device simulati. Le copie già esportate restano esterne alla revoca locale.


## Aggiornamento del 26 ottobre2026 — revoca OFF→ON (successivo alla consegna883)

La precedente consegna READY883 è stata ritirata e PR322 riportata in bozza quando la rilettura ha trovato due lacune: consenso OFF→ON fra due tick poteva riabilitare bytes già caricati; nascondere la waveform smontava anche il guard. Due regressioni reali aggiunte su eb36f7b sono RED in CI40367877918 (2 falliti,2337 passati,5 skipped), con log grezzo compresso in evidence/revocation. Il primo tentativo ed0ebdf era fallito al typecheck per un binding test inutilizzato, corretto prima di osservare il RED delle asserzioni.

Il delta mantiene LivingLessonReplay montato con showWaveform=false, separa il decoder dal guard e usa readLessonSnapshot/resolveReplayRecording canonici per il preflight del file. Il player lega la sessione allo SHA immutabile osservato: una variazione richiede riapertura, anche se l'ultimo consenso è true. Il digest audio resta distinto dal digest della sessione. Polling250ms e ogni comando play ricontrollano il binding; i dati mancanti/corrotti non passano attraverso il fallback di sola waveform. Non viene creato un nuovo media source o archivio.

Verifica locale del delta a sorgenti ferme:26/26 test S17, typecheck, due patch git apply --check e browser completo PASS, compresa revoca in ascolto con waveform nascosta. Il browser di questo primo giro era su working tree modificato rispetto a eb36f7b: non è un PASS della vecchia SHA. Le prove finali sul commit pulito e lo stato della CI della nuova SHA sono registrati nella consegna finale e nel body PR. Review separata del delta solo statica, senza nuovi finding; nessuna approvazione umana implicita. La finestra locale è stata rilasciata a S00 prima di continuare con git/rete. RUNLOG/NEXT condivisi non modificati.

Raccordo obbligatorio per S00: non legare il mount del guard alla visibilità della waveform. Il componente deve vivere quanto il media canonico autorizzato; nascondere la UI usa showWaveform. Restano pendenti mount Room integrato, composizione313, hardware/Safari e ACL remoti come nella consegna iniziale. S00 conserva merge e certificazione integrata.
