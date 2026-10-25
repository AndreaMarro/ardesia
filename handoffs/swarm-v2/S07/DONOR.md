# Donor e decisione S07

- Fonte ufficiale: https://github.com/yjs/yjs/tree/v13.6.27 ; https://docs.yjs.dev/api/undo-manager ; https://docs.yjs.dev/api/document-updates .
- Pin: yjs 13.6.27, integrity sha512-OIDwaflOaq4wC6YlPBy2L6ceKeKuF7DeTxx+jPzv1FHn9tCZ0ZwSRnUBxD05E3yed46fv/FWJbvR+Ud7x0L7zw== .
- Closure al lock: lib0 0.2.119, isomorphic.js 0.2.5. Tutte MIT, notice nei pacchetti. Nessun asset/font/bundle proprietario copiato. Excalidraw 0.18.1 già adottato MIT, non aggiornato.
- Scenario reale osservato: WorkspaceStore intero snapshot perde un tratto concorrente; Yjs map per autore/scope converge con 3 e 11 autori, update duplicati e ordine inverso. UndoManager trackedOrigins locale con captureTimeout 0 preserva autore concorrente e stesso autore su altro device.
- Decisione: adapter Yjs; nessun algoritmo CRDT originale, Hocuspocus o relay pubblico. Trasporto resta una porta autenticata da collegare al Core. Yjs non assegna permessi; la validazione binaria non è un grant di accesso.
- Consumer: InkSession, projection sul canvas Excalidraw, CollaborationToolbar, checkpoint via WorkspaceStore. Binding Room e auth remota richiedono il contratto richiesto a S00/S10.
- Dati in uscita: nessuno senza trasporto esplicito; scope e update bounded solo alla porta iniettata. Nessuna telemetria, inferenza o microfono.
- Limiti: 512KiB encoded per layer, 2000 oggetti, 4096 punti per tratto, 200 pagine nello schema locale. Non sono una garanzia di scala. Lo snapshot mantiene causalità/tombstone; nessuna compattazione che invalida client offline. Undo non ripristinato dal checkpoint; pending e chiave retry invece sì.
- Manutenzione: aggiornare pin/closure con suite di convergenza, validazione e roundtrip; validare ACL nel server prima di ricevere binari; proteggere anche trasporto, sessioni, CSRF e revoca.
- Rollback: scollegare l'adapter e ritirare il solo pin dai manifest Studio. Nessuna migrazione/database/endpoint da distruggere; checkpoint sorgente/versione conservati, mai reinterpretati come altra fonte.
- REA: tool mcp__rea disponibili nella sessione (capture_process_scenario, strumenti web/native); versione runtime non esposta dalla metadata dei tool. Nessun donor proprietario osservato e nessuna falsa cattura native. Qui le API e le prove ufficiali aperte erano sufficienti; non eseguiti passi REA rituali né dichiarati risparmi misurati.
