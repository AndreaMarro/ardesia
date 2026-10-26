# Review S17

Review separata, in sola lettura, su namespace non ancora committato (base a00f2f40). Nessuna approvazione umana o scientifica implicita.

Finding ricevuti e correzioni:

- P1: azioni play/save tardive di A potevano mostrare un errore sopra B. Fence separate per play/note, invalidate al cambio contesto/media/accesso; controlli dopo await prima di side effect o messaggio.
- P1: autorizzazione del marker B non implicava identità del media A in una sovrapposizione temporale. assertCursorRecording verifica lesson/session/recording/hash/intervallo; hook ReplayView seleziona esplicitamente selectedRecordingId. Il media non viene associato per sola vicinanza temporale.
- P2: selezioni concorrenti potevano concludersi fuori ordine. Fence di selezione copre save/load e logout/unmount.
- P2: nota privata legata solo a markerId/audioSHA non distingueva epoch e revisione. Fingerprint completo include lesson/session/recording/hash/epoch/marker/oggetti+versioni; principal separato nel port dell'host. Titolo e label editoriali non cambiano il contesto immutabile.
- P2: lettura iniziale della nota poteva sovrascrivere una bozza. Editor disabilitato finché la nota non è caricata; risposte di contesto precedente ignorate.
- Restart: i peaks possono essere pronti prima dei metadata. currentTime0 non prova che il cursore canonico non sia alla fine: il comando sostituisce il seek pending usando anche epoch/ended. La prova nativa ha osservato avanzamento dopo400ms, poi il percorso completo è passato a sorgenti ferme.

Prove: lifetime.test.ts (isolamento/fence/overlap), note-lifetime.test.tsx (lettura/salvataggio tardivi reali sul componente), browser-complete.log.gz/result.json (percorso nativo), ulteriori test di azioni tardive nel componente. RED storici conservati. Un primo giro browser è stato interferito dalla reidratazione FileProvider; trasferimento a checkout temporaneo locale e nuove prove, senza rietichettare il vecchio giro come PASS.

La rilettura separata ha confermato staticamente i cinque fix, senza rieseguire i test, e ha trovato una variante P2: navigazione alla scrittura/cambio vista doveva invalidare la selezione pending. I due controlli ora attraversano clearSelection e la stessa fence; anche il seguito asincrono della creazione marker viene invalidato. Il cambio a vista studente ferma e drena una cattura attiva prima della transizione: controprova nativa in track-ended/result.json. Le risposte tardive sono coperte dagli unitari di fence/azioni; la specifica gara caricamento→Torna alla scrittura non è presentata come prova browser dedicata.
