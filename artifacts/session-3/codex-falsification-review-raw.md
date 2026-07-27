### FINDING PER SEVERITÀ

1. **HIGH — l’esito autoritativo del provider viene scartato dalla UI.** [ToolCanvasEmbeddable.tsx:1336](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:1336>), [ToolCanvasEmbeddable.tsx:991](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:991>), [simulationRuntime.ts:193](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/sim/core/simulationRuntime.ts:193>).  
   Scenario: `applyOperation` accetta il wire ma il solve restituisce `ok:false`, blocker e mappe vuote; `onAccepted` conserva solo scena e `operationId`, mentre la UI ricalcola corrente e stato con `computeElabMnaView`/`batteryLedCurrentMa`, potendo mostrare valori “risolti” nonostante il fallimento autoritativo.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** un `applyConnectWire` controllato restituisce scena aggiornata e `solveOutcome.ok:false`; dopo il click la UI deve mostrare il blocker esatto e nessun valore numerico ricalcolato. Il codice corrente dovrebbe fallire.

2. **HIGH — CAS fallito dopo audit di successo produce evidenza durevole falsa.** [roomSimulationComposition.ts:180](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:180>), [roomSimulationComposition.ts:192](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:192>), [roomSimulationComposition.ts:207](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:207>).  
   Scenario: durante RPC/audit una callback modifica layout o provenance della board; `simulation.applyOperation` viene committata e auditata `ok`, poi il CAS rifiuta. Il caller riceve errore, il wire non compare sulla board, ma rimane un audit di applicazione riuscita senza abort compensativo. Lo stato runtime committato è invece effimero, perché l’host viene chiuso prima del CAS.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** una store hook muta il marker durante l’append audit; attendersi board invariata e audit correlato `abort/error`, mai un `applyOperation:ok` isolato. Oggi resterebbe il successo.

3. **HIGH — il fallimento dell’audit dopo `board.write` è completamente invisibile.** [board.ts:177](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/board.ts:177>), [board.ts:182](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/board.ts:182>), [audit.ts:78](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:78>).  
   Scenario: `updateScene` riesce e `audit.append` rigetta; `Promise.allSettled` ignora il rigetto e ritorna successo. Anche `ToolAuditLog._chain` trasforma il rigetto in risoluzione, contraddicendo il commento secondo cui `audit.idle()` lo renderebbe osservabile.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** store audit rigettante; la board deve restare committata, ma un sink/counter strutturato deve ricevere esattamente un errore. Oggi non esiste alcun segnale.

4. **HIGH — un digest iniettato costante disattiva il controllo topologico di `solve`.** [simulation.ts:206](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/simulation.ts:206>), [simulation.ts:222](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/simulation.ts:222>), [simulation.ts:394](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/simulation.ts:394>).  
   Scenario: runtime ostile con `sceneDigest: () => "constant"` aggiunge un wire durante `solve`; entrambi i digest coincidono e lo stato alterato viene committato a riga 227.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** digest iniettato costante più `solve` mutante; `solve` deve rigettare e `serializeState` restituire la scena precedente. Oggi dovrebbe accettare.

5. **HIGH — la coda store-scoped può bloccare indefinitamente tutte le room.** [roomSimulationComposition.ts:327](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:327>), [connect.ts:57](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolsdk/connect.ts:57>), [connect.ts:131](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolsdk/connect.ts:131>).  
   Scenario: nella room A una `store.read/write`, handshake, RPC o `audit.idle()` non si risolve; il turno resta trattenuto. Una mutazione della room B sullo stesso store non raggiunge neppure la propria board. Il timeout di `session.ts:132` copre solo host→tool lifecycle, non queste chiamate tool→host.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** prima operazione sospesa indefinitamente e seconda room sullo stesso store; B deve terminare o rigettare entro un limite e la coda deve liberarsi. Oggi B resta pending.

6. **HIGH, NUOVO — append audit concorrenti tra due `ToolHost` possono perdere righe.** [audit.ts:55](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:55>), [audit.ts:91](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:91>), [host.ts:149](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/host.ts:149>).  
   Scenario: due host dello stesso tool/store hanno due `_chain` indipendenti; entrambi leggono lo stesso `audit.jsonl`, concatenano la propria riga e scrivono. La serializzazione di `WorkspaceStore.write` non rende atomico il read-modify-write: l’ultimo write elimina l’altra riga. Il test esistente verifica soltanto append concorrenti sulla stessa istanza `ToolAuditLog`.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** due `ToolAuditLog` o `ToolHost` distinti, stessa coppia store/tool, barriera che completa entrambe le read prima delle write; il log finale deve contenere entrambe le entry. Oggi dovrebbe contenerne una.

7. **HIGH, NUOVO — la duplicazione di un post-it plugin v2 produce un marker internamente incoerente e persistibile.** [ToolCanvasEmbeddable.tsx:572](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:572>), [Room.tsx:519](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/Room.tsx:519>), [pluginPostitBoardRender.tsx:55](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/pluginPostitBoardRender.tsx:55>).  
   Scenario: Excalidraw duplica l’elemento assegnandogli un nuovo `id`; la normalizzazione aggiorna solo il link e clona `customData`, ma marker, owner e `state.instanceId` restano quelli dell’originale. Render e restore calcolano l’id canonico dalla vecchia istanza e lanciano `id mismatch`; al successivo `onChange` il duplicato incoerente può essere salvato e rendere la board non idratabile.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** clonare un elemento ottenuto da `createPluginPostitBoardScene`, assegnargli un nuovo id, normalizzarlo, poi renderizzare e ripristinare originale+duplicato. Devono risultare due identità distinte e valide; oggi il duplicato dovrebbe lanciare.

8. **HIGH — schema post-it ignoto viene scartato come elemento estraneo.** [multiPostitBoardPersistence.ts:277](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/design/multiPostitBoardPersistence.ts:277>), [multiPostitBoardPersistence.ts:133](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/design/multiPostitBoardPersistence.ts:133>), [pluginPostitBoardRender.tsx:109](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/pluginPostitBoardRender.tsx:109>).  
   Scenario: import o writer futuro presenta `plugin-postit-board-state/3`; il reader restituisce `null`, `flatMap` elimina il post-it e un salvataggio successivo consolida la perdita. “Nessun writer corrente” non protegge un confine di lettura da dati futuri, esterni o corrotti.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** board con marker `/3` e un normale elemento; hydrate/restore deve fallire visibilmente o preservare l’elemento opaco. Oggi il post-it sparisce.

9. **HIGH — il postcontratto `connect-wire` non attesta `color`.** [simulation.ts:346](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/simulation.ts:346>), [simulation.ts:405](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/simulation.ts:405>).  
   Scenario: richiesta wire rosso, runtime restituisce lo stesso id/endpoints con colore blu; `_sceneFromState` elimina il colore e `_assertAppliedOperation` confronta solo id/from/to. Lo stato blu viene committato, la board scrive il rosso, sotto receipt accettata.  
   **Stato:** ipotesi causale, non misurata.  
   **Oracolo:** runtime iniettato che cambia soltanto `wire.color`; `applyOperation` deve rigettare e mantenere lo stato precedente. È la voce 16 già correttamente ribaltata in `ACCEPT`.

10. **MEDIUM — il percorso live perde envelope runtime, risultati e diagnostica tra due operazioni.** [roomSimulationComposition.ts:83](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:83>), [roomSimulationComposition.ts:155](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:155>), [roomSimulationComposition.ts:211](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:211>).  
    Scenario: la prima operazione produce `lastSolverResult`, diagnostics e `appliedOperations`; sulla board viene scritta soltanto `scene`. La seconda operazione crea un host nuovo e `loadScene` riparte da diagnostics e history vuote. Inoltre il runtime live non espone `restoreState`.  
    **Stato:** ipotesi causale, non misurata.  
    **Oracolo:** dopo un’operazione con diagnostica univoca, verificare il marker e ricreare il percorso live; envelope, ultimo solve e diagnostics devono sopravvivere esattamente. Oggi mancano. La severità `[high]` del primo revisore è eccessiva: la topologia resta persistita e viene ricalcolata.

11. **MEDIUM — self-loop accettato dal protocollo ma vietato dal montaggio.** [messages.ts:375](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost-protocol/messages.ts:375>), [simulationOperations.ts:478](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/sim/core/simulationOperations.ts:478>), [montaggioProjection.ts:111](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/sim/elab/montaggioProjection.ts:111>).  
    Scenario: `from === to` supera Zod e `requireWireDescriptor`, arriva al runtime e può essere persistito; lo stesso collegamento è considerato invalido dal percorso montaggio.  
    **Stato:** ipotesi causale, non misurata.  
    **Oracolo:** operazione `connect-wire` con endpoint uguali; deve essere respinta prima del runtime, senza audit `ok` e senza board write. Oggi gli ingressi la accettano.

12. **MEDIUM — i fori occupati dalle connessioni base non entrano nel controllo di collisione.** [montaggioProjection.ts:183](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/sim/elab/montaggioProjection.ts:183>).  
    Scenario: scena base con connessione su `bb1:c3`, `pinAssignments` vuoto; un nuovo placement usa `bb1:c3`. `occupiedHoles` non vede la connessione e produce due usi fisici dello stesso foro.  
    **Stato:** ipotesi causale, non misurata.  
    **Oracolo:** proiettare il placement sopra un endpoint già presente nelle connessioni; deve lanciare `holes already occupied`. Oggi dovrebbe accettare.

13. **MEDIUM — I/O dentro updater React può duplicare o anticipare la persistenza.** [ToolCanvasEmbeddable.tsx:1297](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:1297>), [ToolCanvasEmbeddable.tsx:1352](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:1352>).  
    Scenario: React riesegue o abbandona un functional updater in Strict/Concurrent mode; `persistScene` viene invocato due volte o per uno stato non committato, producendo write duplicate o board avanti rispetto alla UI.  
    **Stato:** ipotesi causale, non misurata.  
    **Oracolo:** componente sotto `StrictMode`, un solo evento canvas e spy su `persistEmbedState`; deve esserci una sola write uguale allo stato React effettivamente committato.

14. **MEDIUM — una posa con proprietà opzionali esplicitamente `undefined` può bloccare il CAS come falsa scena stantia.** [elabCanvasAdapter.ts:137](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/sim/elab/elabCanvasAdapter.ts:137>), [montaggioProjection.ts:243](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/sim/elab/montaggioProjection.ts:243>).  
    Scenario: un layout update passa `{x, y, rotation: undefined}`; lo spread conserva la chiave, mentre persistenza JSON la omette. Al successivo connect `jsonPlainEqual` lancia su `undefined` invece di riconoscere i due stati persistiti come equivalenti.  
    **Stato:** ipotesi causale, non misurata.  
    **Oracolo:** layout update con optional esplicitamente undefined, round-trip JSON e successivo connect; il percorso deve accettare la stessa scena semantica oppure rifiutare l’undefined al primo ingresso, non durante il CAS.

15. **LOW — un reject di singola operazione riclassifica il mount e perde la causa.** [ToolCanvasEmbeddable.tsx:1344](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:1344>), [simulationPluginRegistry.ts:86](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/simulationPluginRegistry.ts:86>).  
    Scenario: CAS o provider rifiuta un wire; il canvas già montato riceve `mountStatus="error"`, mentre la ragione viene ignorata e il catch terminale la sopprime. Telemetria e UI confondono errore operativo recuperabile con errore di mount.  
    **Stato:** ipotesi causale, non misurata.  
    **Oracolo:** mount riuscito seguito da un connect rigettato; il mount deve restare `mounted` e la causa originale deve apparire nel canale operativo osservabile.

16. **LOW — l’assert della voce X4-12 può passare senza alcuna mutazione di room B.** [RoomSimulationConnectWire.test.tsx:637](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:637>), [ToolCanvasEmbeddable.tsx:520](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:520>).  
    Scenario: i due harness nascono in millisecondi diversi, quindi `roomABytes !== roomBBytes` già prima della chiamata; una `apply` no-op lascia verde la riga 638. La riga 652 salva il test complessivo, ma non rende corretta la riga 638.  
    **Stato:** ipotesi causale, non misurata.  
    **Oracolo:** baseline con `updated` diversi e applicazione no-op; il confronto contro `roomBBytes` deve fallire, mentre quello corrente contro `roomABytes` passa.

### CLAIM CHE REGGONO

- **X4 voce 1 — RIFIUTO REGGE.** Argomento ricostruito: tutti i metodi stateful convergono su `_requireRoomId()`; `validateRoomId` rifiuta anche `""`; `describe()` è intenzionalmente stateless e un gate costruttore lo renderebbe inutilizzabile. Il tentativo di trovare una seconda porta fallisce: gli handler in [host.ts:326](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/host.ts:326>) chiamano esclusivamente `ToolSimulation`, e ogni metodo pubblico stateful applica il gate. Non è un oracolo verde per inerzia: [ToolHostSimulationBroker.test.ts:266](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolHostSimulationBroker.test.ts:266>) dimostra il percorso stateful positivo con room, mentre [ToolHostSimulationBroker.test.ts:448](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolHostSimulationBroker.test.ts:448>) dimostra il `describe` roomless positivo.

- **X4 voce 16 — il ribaltamento in `ACCEPT` regge.** L’argomento originario provava la divergenza board/runtime; `wire.color` viene eliminato a `simulation.ts:368-375` e non confrontato a `:426-429`.

- **X4 voci 5, 18, 19 e 20 — i finding sottostanti reggono.** Schema ignoto scartato, self-loop, fori base non seminati e assenza di timeout hanno tutti scenari causali concreti sopra.

- **Primo revisore 1 — REGGE, severità HIGH.** Il risultato autoritativo viene effettivamente scartato e sostituito da fisica UI locale.

- **Primo revisore 2 — REGGE nel nucleo, severità HIGH.** Regge l’audit durevole di successo senza write-back; non regge soltanto l’idea di uno stato runtime durevolmente divergente.

- **Primo revisore 3 — REGGE, severità HIGH.** Il fallimento audit viene drenato e ignorato; il successo deriva dalla risposta board.

- **Primo revisore 4 — REGGE, severità HIGH.** Entrambi i lati del confronto dipendono dallo stesso digest iniettato.

- **Primo revisore 5 — REGGE, ma severità MEDIUM.** Il percorso live non persiste né ripristina l’envelope runtime; tuttavia la scena/topologia non viene perduta.

- **Primo revisore 6 — REGGE, severità HIGH.** La coda è store-scoped, il turno comprende tutte le dipendenze lente e non esiste un timeout tool→host.

- **X5 side-effect negli updater, `canonicalJson` con `undefined`, mount status/reason e audit `allSettled` — REGGONO** con le severità riportate sopra.

- **Nuovi claim — REGGONO staticamente:** race read-modify-write tra più `ToolAuditLog` e duplicazione incoerente dei post-it plugin. Sono i due difetti materiali non coperti dalle review precedenti.

### CLAIM CHE NON REGGONO

- **La premessa “6 voci `REJECT_INVALID`” non è sostenuta dagli artifact.** La tabella e i totali mostrano 3 originarie e 2 residue dopo la supersessione: [x4-terminal-coderabbit-disposition.md:100](</private/tmp/claude-501/-Users-andreamarro-VOLUME-3/60f13e6f-61a4-4e12-9fee-19da6da3c1f6/scratchpad/handoff/ARDESIA-SESSIONE-3-HANDOFF-20260727/02-PRODOTTO/artifacts/session-3/x4-terminal-coderabbit-disposition.md:100>).

- **Il conteggio X5 “21 finding” nell’audit tecnico non regge.** Il record terminale grezzo dichiara `findings:29`: [x5-coderabbit-raw.jsonl:45](</private/tmp/claude-501/-Users-andreamarro-VOLUME-3/60f13e6f-61a4-4e12-9fee-19da6da3c1f6/scratchpad/handoff/ARDESIA-SESSIONE-3-HANDOFF-20260727/02-PRODOTTO/artifacts/session-3/x5-coderabbit-raw.jsonl:45>).

- **X4 voce 12 — RIFIUTO NON REGGE.** Argomento ricostruito: la riga 638 sarebbe soltanto ridondante perché i due harness partirebbero byte-identici e la riga 652 contiene il confronto corretto. Il falsificatore è [ToolCanvasEmbeddable.tsx:520](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:520>): `Date.now()` rende l’identità byte non garantita e il test non la asserisce. La riga 638 può quindi essere verde prima dell’operazione. La suite complessiva conserva un buon oracolo grazie alla riga 652, ma il finding locale era valido.

- **X4 voce 4 — non regge la prova addotta per il `DEFERRED`.** La disposizione afferma che il reader render non controlla `type === "embeddable"`; il controllo esiste esplicitamente in [pluginPostitBoardRender.tsx:47](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/pluginPostitBoardRender.tsx:47>). Resta duplicazione, ma non quella divergenza concreta.

- **X4 voce 6 — non regge “migrazione fallita indistinguibile e silenziosa”.** Anche se `migrateLegacySimulationSceneDigest` restituisce l’originale, [multiPostitWorkbenchModel.ts:217](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/design/multiPostitWorkbenchModel.ts:217>) esegue subito `assertWorkbenchPostit`, che rifiuta lo stato senza digest a `:327-331`. È fail-closed, sebbene con diagnostica generica.

- **Le motivazioni di differimento X4-5 e X4-20 non reggono.** “Nessun writer corrente” non legittima lo scarto silenzioso a un confine di import; il timeout di [session.ts:132](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/session.ts:132>) è nella direzione host→tool e non protegge handshake/RPC tool→host.

- **X5, leak dei due `MessagePort` — NON REGGE.** [connect.ts:150](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolsdk/connect.ts:150>) chiude `port2` tramite `connection.close`; [session.ts:112](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/session.ts:112>) chiude `port1` tramite `host.unmount`. Anche il catch chiude port1 attraverso `unmount` e port2 esplicitamente.

- **Primo revisore 2, sottoclaim “stato runtime persistente senza board” — NON REGGE.** [roomSimulationComposition.ts:192](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:192>) chiude l’host prima del CAS e nessun envelope viene persistito. Lo split persistente riguarda l’audit, non lo stato runtime.

- **Primo revisore 5, severità `[high]` — NON REGGE.** La perdita riguarda risultato, diagnostics e history runtime; la scena viene scritta a [roomSimulationComposition.ts:215](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/roomSimulationComposition.ts:215>) e ricostruita a ogni chiamata. La classificazione sostenibile è `MEDIUM`.

- **Nessuno dei sei finding del primo revisore è interamente `NON REGGE`.** Due richiedono le qualificazioni appena indicate; gli altri quattro mantengono integralmente il nesso causale.
