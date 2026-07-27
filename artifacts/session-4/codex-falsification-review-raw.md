## FINDING PER SEVERITA

Nessun finding Critical.

### HIGH

1. **C2/A2 — lost update nell’audit, riprodotto; `auditDropCount` resta zero.**  
   Scenario: due `ToolAuditLog` distinti, stesso store/tool, completano entrambe le read prima delle write. Le `_chain` sono per istanza ([audit.ts:55](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:55>)); il read-modify-write non è atomico ([audit.ts:98](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:98>)); ogni `ToolHost` crea un log nuovo ([host.ts:149](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/host.ts:149>)). La serializzazione di `WorkspaceStore` copre solo la write, non la read precedente ([WorkspaceStore.ts:478](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/store/WorkspaceStore.ts:478>)).  
   Esito riprodotto: una sola delle due entry sopravvive, `malformed=0`, `auditDropCount=0`. Il `WeakMap` di [board.ts:128](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/caps/board.ts:128>) protegge solo il helper write-back, non i log creati dai `ToolHost`.

2. **C3 — il segnale non è osservabile da alcun chiamante di produzione.**  
   `auditDropCount` è letto soltanto nei due nuovi assert di test. Il reader docente continua a restituire esclusivamente `AuditReadResult` ([audit.ts:137](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:137>)); anche il pannello espone solo `readAuditLog` ([panelHost.ts:79](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/panelHost.ts:79>), [panelHost.ts:107](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/panelHost.ts:107>)).  
   Scenario: `board.write` riesce, la write audit rigetta, il contatore sale a 1; UI, diagnostica e shutdown non lo interrogano. L’utente vede log vuoto e nessun allarme. Dopo reload il `WeakMap` module-scoped di [audit.ts:117](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:117>) riparte vuoto: perdita durevole, segnale azzerato. Il claim forte “policy, non buco” non regge.

### MEDIUM

3. **C2 — altre perdite non attraversano un rigetto di append.**

   - `now()` che lancia prima della creazione di `p`: l’azione viene committata, `routeRequest` ingoia l’eccezione ([audit.ts:69](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:69>), [router.ts:43](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/router.ts:43>)). Riprodotto: response riuscita, zero entry, drop zero.
   - Store che risolve `write()` senza rendere durevoli i byte: `_doAppend` non fa read-back ([audit.ts:98](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:98>)); append risolta, riga assente, drop zero.
   - Crash/reload dopo l’azione ma prima della write fire-and-forget di [host.ts:212](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/host.ts:212>): nessuna rejection osservabile.
   - Sovrascrittura, cancellazione, eviction o corruzione successiva: il contatore registra solo il rigetto originario; una cancellazione lascia `entries=[]`, `malformed=0`.

4. **C1/A4 — la correzione stabilisce un cambiamento di B, non prova il confine di isolamento.**  
   Il confronto con la baseline propria a [RoomSimulationConnectWire.test.tsx:650](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:650>) è corretto; inoltre [riga 668](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:668>) verifica il wire atteso. Ma A e B sono due closure separate e la chiamata B riceve soltanto `roomB.board` ([righe 622-633](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:622>)): non viene stabilito un canale capace di raggiungere erroneamente A.  
   Source mutant concreto che lascia verde il test: `ToolBoard.write` muta direttamente l’oggetto restituito da `getSceneElements()` senza chiamare realmente `updateScene`. Il harness espone riferimenti vivi tramite `binding()` e `json()` ([righe 149-173](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:149>)); byte, wire semantico e audit `board.write` risultano corretti, ma il commit Excalidraw/persistente non è avvenuto.

   A4 non regge: il nuovo commento afferma che la riga successiva stabilisce la condizione che rende l’assert una “prova di isolamento” ([righe 637-650](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:637>)); la matrice afferma che quella modifica “converte” il confine in provato ([claim-evidence-matrix.md:205](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/artifacts/session-3/claim-evidence-matrix.md:205>)). Inoltre la mappa corrente, sebbene preesistente ai tre commit, dichiara già l’isolamento provato ([ARDESIA-MAP.md:43](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/ARDESIA-MAP.md:43>)).

5. **C4 — il contatore è cumulativo e attribuisce al percorso corrente errori precedenti.**  
   Non esiste reset in [audit.ts:117-135](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:117>). Scenario riprodotto: prima append rigettata → `1`; store riparato e seconda append riuscita → entry presente ma contatore ancora `1`. Due host, room o operazioni dello stesso tool/store si contaminano. Il reload produce il difetto opposto: torna `0` e cancella la storia.  
   I due test nuovi, però, non interferiscono oggi: usano store distinti a [riga 220](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx:220>) e [riga 253](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx:253>).

6. **C5 — il commit documentale introduce dati locali e rollback pericoloso.**  
   Scenario: branch pubblicato o artifact condiviso → username e percorso locale esposti in [x6-coderabbit-raw.jsonl:1](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/artifacts/session-3/x6-coderabbit-raw.jsonl:1>), [codex-falsification-review-raw.md:3](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/artifacts/session-3/codex-falsification-review-raw.md:3>) e account personale in [x6-terminal-coderabbit-disposition.md:5](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/artifacts/session-3/x6-terminal-coderabbit-disposition.md:5>).  
   Il rollback `rm -rf artifacts/session-3` a [claim-evidence-matrix.md:137](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/artifacts/session-3/claim-evidence-matrix.md:137>) cancellerebbe anche file aggiunti successivamente o estranei. Inoltre `git diff --check d7b517cf^..d7b517cf` fallisce per trailing whitespace nel raw: il claim di pulizia non è trasferibile all’intero stack.

### LOW

7. **A1 — il “16/20” misura la prima riga che fallisce, non l’efficacia del test.**  
   Se i due `Date.now()` di [ToolCanvasEmbeddable.tsx:520](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx:520>) cadono nello stesso millisecondo, il vecchio assert fallisce subito; se differiscono, passa e il controllo successivo contro `roomBBytes` — oggi a [riga 664](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:664>) — fallisce. Vitest interrompe il test alla prima eccezione: il test complessivo intercettava il no-op in entrambi i casi.  
   Il guasto “updateScene di B no-op” è plausibile per il write-back, ma non rappresenta una contaminazione B→A. Le frequenze 24/30 e 16/20 dipendono da risoluzione del clock, carico e scheduling locale; l’esistenza del false-green della singola riga è trasferibile, la percentuale no.

8. **A3 — “decine di `toEqual`” è una sovrastima e una motivazione di comodità.**  
   Il costo reale osservato è: due return di `readAuditLog` e sette siti di uguaglianza esatta, non decine: [RoomSimulationConnectWire.test.tsx:457](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:457>), [riga 614](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/RoomSimulationConnectWire.test.tsx:614>), [ToolCanvasMontaggioPersistenza.test.tsx:229](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx:229>), [riga 267](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx:267>), [riga 362](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx:362>), [riga 415](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolCanvasMontaggioPersistenza.test.tsx:415>) e [ToolPolicyAudit.test.ts:233](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/__tests__/ToolPolicyAudit.test.ts:233>).  
   Separare “file malformed” da “writer drops” è tecnicamente sensato; lasciarlo in un export che nessuno consuma non lo è.

9. **Commento residuo falso, ma preesistente.**  
   [host.ts:212-214](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/host.ts:212>) dice che l’errore resta osservabile tramite `audit.idle()`. `idle()` restituisce la chain già convertita in risoluzione ([audit.ts:84-95](</Users/andreamarro/VOLUME 3/ardesia-wt-session2-20260727/apps/studio/src/toolhost/audit.ts:84>)); da solo non espone l’errore. Non è una regressione nuova, ma il commit non ha riallineato il commento.

Verifiche: HEAD e ancestry coincidono con gli SHA forniti; race e perdita pre-promise riprodotte con Node. I test Vitest mirati non sono eseguibili nel sandbox read-only perché Vite tenta di creare `node_modules/.vite-temp` e riceve `EPERM`. Nessun file è stato modificato; receipt/registro capability: `INDEX_SYNC_DEFERRED`.

## CLAIM CHE REGGONO

- **C1, forma stretta:** room B viene ora confrontata con la propria baseline; il cambiamento serializzato e il wire atteso sono stabiliti.
- **C2, forma stretta:** una promise restituita da `ToolAuditLog.append` che rigetta incrementa il contatore prima che `allSettled` termini.
- **C4, forma stretta dei due test:** store distinti e controllo negativo distinguono correttamente successo e rigetto nella singola esecuzione.
- **C5:** il commento di `caps/board.ts` è vero nel perimetro delle append rigettate. Non emerge un leak che impedisca la GC dello store: la chiave è debole. Sul successo non viene eseguita alcuna operazione sulla Map; resta solo la closure già associata alla promise. Il Map per-tool può però crescere finché lo store vive.
- **A1, solo qualitativamente:** il vecchio confronto contro `roomABytes` poteva essere verde prima della mutazione.
- **A2:** la race generale fra `ToolHost` distinti non è chiusa. La coda store-scoped protegge il solo percorso `applyRoomSimulationConnectWire`, non tutti i `ToolHost`.

## CLAIM CHE NON REGGONO

- **C1, forma forte:** il test non prova l’isolamento room/instance; prova due mutazioni sequenziali su board closure separate.
- **C2, forma generale:** molte perdite non rigettano e la race riprodotta sovrascrive con successo lasciando `drop=0`.
- **C3:** fail-soft non è una policy operativamente osservabile finché nessun consumer di produzione legge il segnale e il segnale sparisce al reload.
- **C4, forma generale:** il valore assoluto non discrimina l’esecuzione corrente perché è cumulativo; dopo reload produce invece un falso zero.
- **C5, inteso come “nessuna regressione nei tre commit”:** non regge per PII/path locali, rollback `rm -rf` e `diff --check` non pulito nel commit documentale. Sul solo hot path/GC del contatore, invece, non emerge una regressione materiale.
- **A1:** “l’oracolo/test era inerte 16/20” è una classificazione scorretta; era inerte quella singola riga, mentre il test completo falliva comunque. La percentuale è locale.
- **A3:** il costo dichiarato non è tecnico né “decine di test”; è un aggiornamento meccanico circoscritto. La separazione semantica è valida, ma richiedeva un consumer reale.
- **A4:** commento e matrice implicano che la one-line fix trasformi l’assert in prova; quindi la dichiarazione “Slice 1 non claima isolamento provato” non è sostenibile.
