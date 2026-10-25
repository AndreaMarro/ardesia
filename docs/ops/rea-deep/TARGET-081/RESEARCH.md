# TARGET-081 MathLive - ricerca circoscritta reale

Stato: DEEP_OBSERVED_WITH_LIMITS; contratto funzionale ADAPT, installazione nel prodotto DEFER. Questo documento non e una ricevuta di assimilazione, un test prodotto o una certificazione G0/G1. Il catalogo139 rimane lo snapshot storico; questo dossier e un avanzamento separato.

## Prova funzionale e provenienza

Il 20 ottobre2026, REA6.7.0/Node26.5.1 ha pilotato il widget pubblico ufficiale `https://mathlive.io/mathfield/`, senza account o accesso al runtime Ardesia. Dieci capture reali e sei altre Evidence sono conservate originali: elenco, ID e hash in `manifest.json`. Un solo Chrome proprio, PID46782/CDP5356, profilo temporaneo chiuso e rimosso alle07:07:40UTC; `browser-cleanup.json`. Nessun token o profilo personale utilizzato.

Il pacchetto primario NPM MathLive0.111.1, MIT, punta al commit `30ad20a7a47ea43a2f6915808023202c78f37742`. SHA512 del tarball verificato contro il registry, SHA256 `f285cd7b8ab5cbd67d792305c753dd4b6444f1799e012c2aef701eb87fe95f8b`. LICENSE primaria al commit: `3caebd18611959ca725ab976a004d408017eb1d7093d6c9b9b09c5a4790eaff8`. Tre sorgenti selezionate sono verificate sia SHA256 sia Gitblob contro il tree al commit. Non e stato copiato codice nel prodotto.

Il V8 source reale del browser, script16 `https://cdn.jsdelivr.net/npm/mathlive`, e843924B e ha SHA256 `51e9ab5c4739209a2951a550042dcecb99ad3047269c1d791d09d7d613226eae`: coincide byte per byte con `mathlive.min.js` del tarball verificato. La versione del sito/documentazione completo resta UNKNOWN. L'export passivo, invece, esclude quel CDN per policy: la corrispondenza deriva dalla Evidence di esecuzione V8, non viene attribuita retroattivamente all'export.

| Flusso effettivo | Risultato osservato | Evidence / limite |
|---|---|---|
| Formula iniziale, seleziona tutto, inserisci `r^4+1` | `.value` e `getValue('latex')` entrambi esatti | `official-edit-v3`;11 step completati |
| Undo da tastiera | `r^4+` | `official-undo`: una sola battuta annullata, non tutta la formula |
| Redo da tastiera | `r^4+1` | `official-redo` |
| Apri tastiera virtuale | Palette numeri, simboli, greche; valore invariato | `official-keyboard`, PNG originale estratto in `pixels/keyboard.png` |
| Nuovo documento nella stessa istanza Chrome | Formula quadratica iniziale; il nostro draft non ritorna | `official-fresh-reopen`; nessuna prova di salvataggio cloud o riavvio OS |
| `setValue('z^{2} + 2')` via API ordinaria dichiarata | Stringa esatta preservata; undo ancora disponibile | `programmatic-set-probe.json`, non azione GUI REA |
| Undo GUI dopo quella sostituzione API | Ritorna la precedente `r^4+1` | `official-api-undo`: cronologia locale del widget |
| `setValue('b^{3}+3')`, poi `resetUndo()` via API dichiarata | canUndo/canRedo falsi; successivo Meta+Z lascia `b^{3}+3` | probe separato + `official-cleared-undo` |

Gli errori sono conservati. `official-edit` fallisce il click sul textbox nascosto largo0px, poi cancella gli step dipendenti; non e classificato come bug vendor. `official-edit-v2` completa le azioni ma produce `+1` davanti alla formula iniziale: non e una prova di input corretto. Il click sull'host seguito da tasti sul sink accessibile risolve nella v3. Un primo avvio helper `bad_scope` non ha prodotto Evidence e resta nel log degli errori. La completezza degli step non equivale a completezza globale: le capture sono INCOMPLETE, eventi rete mancanti, equality_eligible=false.

## Analisi di struttura ed esecuzione

`source.application` analizza solo `mathfield-element.ts`, `undo.ts`, `model-private.ts`:3 file/129886B,11749ASTnode,123finding,0parsefailure. Non e l'intera libreria. `undo-feature` visita76node/90edge,17fatti osservati/168inferiti, copertura parziale. `undo-semantic`, seed funzione reale undo, produce1nodo/0relazioni e3unknown per accessi dinamici: non autorizza equivalenza semantica completa.

`undo-execution` osserva una finestra8s dalle07:00:53.832Z alle07:01:01.839Z. Due azioni ordinarie esplicitamente dichiarate nel sidecar (undo e redo) avvengono nella finestra; il V8 source verificato contiene funzioni undo/redo con count1 e setState count2. I wrapper omonimi non vengono contati come ulteriori azioni utente. Nessuna sourcemap collega automaticamente i range compilati alle linee TypeScript; tale equivalenza non e rivendicata. Script senzaURL di strumentazione sono esclusi dai claim vendor.

Fonti precise: `source/src/editor/undo.ts:8` limita a1000 snapshot, non a un budget byte; linee64-84 applicano stato+selezione e notificano undo/redo. `source/src/public/mathfield-element.ts:1750` espone setValue, con default silenceNotifications=true; linea1908 espone resetUndo. Il coalescing e la rimozione del ramo redo sono meccaniche della cronologia locale, non transazioni Core.

## Anatomia e decisione di assimilazione

Il campo osservato misura698x55.8px; menu e toggle tastiera34x34px. La palette virtuale visualizzata usa gruppi espliciti e simboli grandi, conserva l'editing al di sopra della palette. Il sink tastiera nascosto non e un target pointer adatto. Lo screenshot mostra la palette nella colonna documentazione; non e una validazione responsive o Axe, ne una prescrizione di layout Ardesia. Un eventuale adattatore deve usare API pubbliche, label e CSSparts documentate, senza dipendere dai selettori interni usati qui per la prova.

Il riuso utile e un piccolo port di editing matematico dentro l'attuale compositore, con il Core unico ancora autore di fonte, revisione, permessi e commit. `apps/web/src/components/useResourceComposer.ts` resta il confine che possiede draft/dirty/ACK; `SourceBoard.tsx` proietta riferimenti autorizzati. Non introdurre un secondo store di memoria o formato canonico parallelo. Il testo LaTeX originale deve restare riconoscibile e hashabile come contenuto dell'originale, senza inferire correttezza scientifica dal renderer.

La chiave di istanza deve includere attore/ruolo, corso, resourceId e revisionId; su cambio contesto o revoca, smontare oppure caricare e azzerare esplicitamente undo. Il comportamento setValue->undo qui osservato e una normale proprieta del widget, non una fuga ACL dimostrata. Rende pero necessario un confine di adattamento: nessun undo puo richiamare un draft di un'altra fonte/identita. Il caricamento silenzioso non e un commit e undo locale non revoca consegne o revisioni canoniche.

Decisione: ADAPT questo contratto; DEFER l'installazione MathLive finche esiste un bisogno misurato di authoring matematico, un budget input/storia e una verifica a11y specifica. La licenza MIT del core e verificata; font, asset e dipendenze necessitano inventario separato. ComputeEngine e stato caricato dal sito e catturato da V8, ma non ne sono stati verificati licenza/versione per riuso ne esercitati metodi di grading/CAS: UNKNOWN. Il corpus terzo grezzo resta privato; il report e originale.

Regressioni necessarie se adottato: cambio attore/corso/revisione seguito da undo; revoca e readonly; caricamento silenzioso senza dirty/commit; ACK tardivo incapace di sovrascrivere altra fonte; limiti Unicode/LaTeX e storia anche in byte; navigazione tastiera/Tab/Escape/virtualkeyboard e lettura assistiva; preservazione dell'originale al roundtrip; separazione renderer/validazione scientifica. Nessuna di queste nuove prove di prodotto e stata eseguita qui. Beneficio qualitativo atteso: input matematico piu preciso e fonti/versioni coerenti. Guadagno di tempo e benchmark: UNKNOWN.
