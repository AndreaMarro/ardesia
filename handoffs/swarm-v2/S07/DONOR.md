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


## Valutazione REA-FIRST aggiornata sul mandato comune

Registro letto: TARGET-080 Excalidraw, TARGET-088 Yjs, TARGET-089 tldraw; Hocuspocus non trovato nel registro di questa base. Delta proposto in REGISTRY-DELTA.json per S12/S15/S00, senza assegnare nuovi ID o sovrascrivere evidenze precedenti. Consultazione effettiva via GitHub306 commento6405603588; il successivo commento6405669965 aggiorna prove e stato.

| Candidato | Decisione | Evidenza e costo evitato |
| --- | --- | --- |
| Excalidraw 0.18.1 già nel lock | REUSE | Canvas/PDF, gesture API e restoreElements riusati. Nessuna migrazione della scena storica. MIT ufficiale: https://github.com/excalidraw/excalidraw/blob/v0.18.1/LICENSE |
| Yjs 13.6.27 | ADAPT | Adottati motore merge binario, causalità, mappe e UndoManager. Evitata riscrittura CRDT; nessuna stima ore risparmiate. Fonti/API e MIT pin sopra. |
| Hocuspocus 4.7.1 osservato nel package su main | DEFER | Backend WebSocket Yjs completo pertinente; nessun pin/installazione o runtime provato. MIT e hook osservati nelle fonti ufficiali, ma richiede authority/retention/ACL per-scope Core S10. Adottarlo ora con DB/auth paralleli violerebbe il contratto. Fonti: https://github.com/ueberdosis/hocuspocus ; https://github.com/ueberdosis/hocuspocus/blob/main/packages/server/package.json ; https://github.com/ueberdosis/hocuspocus/blob/main/LICENSE.md |
| tldraw 5.5.2 osservato nel package su main | DEFER | SDK canvas completo osservabile dal sorgente pubblico; versione non installata/pinnata. Introduce editor/store/schema e migrazione del canvas; produzione richiede chiave/licenza. Nessun codice o asset acquisito. Fonti: https://github.com/tldraw/tldraw/blob/main/packages/tldraw/package.json ; https://github.com/tldraw/tldraw#license |

Per Hocuspocus/tldraw le versioni sono osservazioni dei manifest remoti al 26 ottobre2026, non attestazioni di ultima release né lock di acquisizione. Prima di adozione servono pin immutable e verifica closure. Prossima acquisizione a maggior valore: Hocuspocus sotto l'autorità Core esistente, previa decisione S10/S00 sul trasporto.

REA applicabilità: consultata la skill reverse-engineer-anything v42, che indirizza l'analisi ordinaria di un repository sorgente completo ai normali strumenti. Qui le fonti MIT complete e le API documentate erano già disponibili; i contratti di cattura sono stati verificati nel pacchetto installato e nel nostro Room reale. Non è servita decompilazione o cattura di un donor chiuso: nessun tool REA eseguito, nessun Evidence ID inventato. Questa è l'eccezione motivata prevista dal mandato, non una prova REA runtime. La prova browser Playwright riguarda Ardesia, con snapshot trasportati dal fixture e limiti espliciti.

Funzioni originali necessarie: schema scientifico source/page/revision, documenti per owner/audience, validazione atomica di buste, outbox con ricevuta esatta, isolamento delle projection dai sink legacy, binding verso geometrie PDF e toolbar. Sono adattatori di dominio; non sostituiscono Yjs o Excalidraw e non attribuiscono identità/permessi.
