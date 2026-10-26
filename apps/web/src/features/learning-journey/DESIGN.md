# S20 — esperienza unificata

Base osservata: main a00f2f40091aecf69e58ebaba42cf70d748e4066, 26 ottobre 2026.
Mandato: allegato S20, esecuzione richiesta dal proprietario. Ownership esclusiva di questa cartella. S00 integra; nessun file condiviso modificato.

## Scelte

Un consumer componibile dentro Classroom, montato lazy e dietro flag esplicito. Nessuna seconda shell. Una colonna principale per obiettivo, previsione, PhysicsLab e risposta; fonte in Dialog Radix esistente, ricevuta e feedback nello stesso percorso. Su mobile tutto scorre in ordine di lettura. La modalità concentrazione è un Dialog Radix a schermo pieno che rende inerte la shell e gestisce focus/Escape.

Si riusano PoiseuilleModel/PhysicsLab, SourceViewer, FormulaField/FormulaPreview e le API già installate. L'alternativa di importare le PR aperte non fornisce una prova main; l'alternativa di una nuova applicazione duplica navigazione e stato. Le capacità future sono adapter tipizzati con NOT_AVAILABLE, senza comandi fittizi.

Posizione, previsione e testo si conservano in una risorsa privata `learning-journey-checkpoint` nel medesimo StudyStore. È una bozza UI e un riferimento alla ricevuta, non un nuovo ledger: ricevute, assistenza e risultato sono sempre riletti dal Core. Il comando di consegna è congelato nel checkpoint prima dell'invio e usa l'idempotenza Core; una risposta persa si recupera ripetendo quel comando. CAS impedisce overwrite tra schede. Il cache UI esistente conserva solo modifiche non ancora confermate nella sessione; beforeunload protegge il refresh non salvato. Nessun localStorage/IndexedDB S20.

## Stati e linguaggio

Obiettivo → Previsione → Esplorazione facoltativa → Risposta → Ricevuta/feedback → Problema diverso. Fonte e aiuto restano accessibili. Aiuto e modello sono dichiarati al Core; il confronto numerico non è grading del ragionamento. `NO_SUPPORT_REQUESTED` non è prova di padronanza né verifica effettiva. Nessuna verifica è offerta senza il consumer esame autorizzato.

Gli errori di rete mantengono bozza/comando, revisione mancante non usa fallback, revoca rimuove la UI privata. Il cambio identità/edizione/pack rimonta il consumer e invalida le richieste tardive. Nessuna risposta precedente viene presentata come previsione nuova.

## Piano esecutivo

1. Adapter tipizzato main: caricamento, validazione checkpoint, CAS, idempotenza, ricevuta e confini identità. Testare mismatch/retry/revoca.
2. Componenti Journey, Dialog, step navigation, stato salvataggio, fonte, feedback e formule. Testare focus e draft attraverso navigazione.
3. Patch Classroom applicata solo nella composizione QA; servizio Study API originale con SQLite/identità sintetiche. Browser a 360/390/820/1440, tastiera/touch/mouse, rete, revisione mancante, revoca, cold reopen e confronto flusso attuale.
4. Misurare lazy bundle, raccogliere screenshot e risultato raw, handoff S00/S03/S06/S17 e una sola PR implementativa. I risultati non eseguiti restano NOT_RUN.

## Rischi da verificare

Risposta POST persa; CAS tra schede; sessione cambiata durante richiesta; fonte aggiornata/mancante; unmount con bozza; ripresa di un problema già consegnato. Revisione scientifica, Safari/VoiceOver e utenti reali non sono attestati dai test browser.
