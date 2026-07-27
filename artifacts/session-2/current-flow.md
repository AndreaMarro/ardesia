# Sessione 2 — CoV-0: flusso corrente Simulation / ELABTutor

Data audit: 2026-07-27

Product base: `36e6753cc55c114cb1c0815a7e2f8911a0b71dc7`

Product tree: `4dc0f51de8c706d7b7cbb2b6e9b314f169a926fb`

Worktree: `ardesia-wt-session2-20260727`

Stato: CoV locale; le sezioni fino a “Esito misurato” congelano l'audit
pre-implementazione, le sezioni successive registrano il candidato osservato

## Gate e PLAN-DEVIATION

La Sessione 1 ha prodotto SHA, gate ripetibile, inventario, stato PR e receipt.
Al momento di questo audit i PR prodotto `#211` e Knowledge `#18` sono però
ancora aperti. Il receipt di Sessione 1 autorizza esplicitamente come base
alternativa `36e6753c` finché `#211` non è fuso.

La Sessione 2 procede quindi solo in una worktree locale e isolata sul full SHA
autorizzato. Nessun push, PR, merge o deploy fa parte di questa deviazione. Il
vault dovrà registrare che il lavoro è impilato sopra la linea di Sessione 1
ancora non fusa.

Seconda falsificazione del piano iniziale: il protocollo chiama
`v1-cap6-esp1` «già verificato», ma il repository distingue:

- `apps/studio/sim/fixtures/elab-v1-cap6-esp1.json`: fixture di contesto
  circuitale, verificata contro dati esperimento e lesson-path;
- `apps/studio/sim/fixtures/elab-scene-v2-candidate-v1cap6esp1.json`: scena v2
  con `provenance.status = candidate` e `visualMatch = unknown`;
- `apps/studio/sim/fixtures/elab-scene-v2-verified-synthetic.json`: unica scena
  v2 marcata verified, ma sintetica e quindi fuori ambito.

La verticale può usare i dati reali e il provider reale di `v1-cap6-esp1`, ma
non può trasformarli in prova di fedeltà visiva o di parità col libro. Il claim
resta `partial simulation harness`.

## Baseline prima del codice

Comando:

```text
npm run bootstrap && npm run verify
```

Esito:

- engine: `2044 passed, 7 skipped`;
- Studio: `1982 passed, 5 skipped`;
- TypeScript: verde;
- build Vite: verde;
- worktree ancora byte-clean dopo il gate.

I warning peer-dependency e l'audit npm (`2 low`, `3 high`) sono preesistenti;
non è stata aggiunta o aggiornata alcuna dipendenza.

## Gerarchia osservata

```text
ARDESIA Core
  Room / WorkspaceStore / ToolHost / LessonOS / export-import

io.ardesia.simulation — kind: plugin, version 2.0.0
  manifest eseguibile e runtime simulation-runtime/1

io.elab.tutor — kind: pack, version 0.1.0
  dati e metodo; dipende da io.ardesia.simulation >=2.0.0

workflow di lezione
  oggi compone la UI tramite callback dirette, non tramite ToolHost
```

Fonti:

- `apps/studio/plugins/simulation/manifest.ts::manifest`;
- `packs/elab-tutor/manifest.json`;
- `apps/studio/sim/core/simulationRuntime.ts`;
- `apps/studio/src/Room.tsx`;
- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`.

Il pack canonico non contiene shell, auth, dashboard, memory o solver. Il
legacy `plugins/elab-tutor` è ancora importato come renderer/canvas tramite
alias Vite, ma non viene promosso a seconda applicazione canonica.

## Flusso live osservato

```text
Room.insertSimulationPlugin
  → embed Excalidraw con tool link
Room.renderEmbeddable
  → renderToolCanvasEmbeddable
SimulationElabCoreCanvas
  → import("@elab-tutor-plugin/plugin/renderEmbeddable")
callback onComponentAdd/onLayoutChange/onConnectionAdd/onWireUpdate/onWireDelete
  → costruzione SimulationOperationEnvelope
  → applyElabCanvas* DIRETTO su localScene
  → host.persistEmbedState
  → Room write-back / WorkspaceStore room-scoped
render/solve
  → solveElabExperiment / computeElabMnaView DIRETTO
  → host.emitLessonEvent
  → Room lessonEventLog.append DIRETTO
```

`ToolHost`, `service.simulation` e `lesson.event.emit` non sono attraversati da
questa catena UI.

## Matrice chiamate, identità e ownership

| Freccia | Chiamante → chiamato | Tipo/schema | Identità presente | Owner dello stato | Test esistente | Buco |
|---|---|---|---|---|---|---|
| inserimento | `Room.insertSimulationPlugin` → creazione embed | tool link + `customData` | `room`; embed id | scena Excalidraw della room | `Room.integration.test.tsx` | nessun mount ToolHost |
| dispatch | `Room.renderEmbeddable` → `renderToolCanvasEmbeddable` | callback `SimulationToolHost` locale | `room`, embed id | Room | `ToolCanvasEmbeddable.test.tsx` | registry non è security boundary |
| renderer | `SimulationElabCoreCanvas` → import dinamico `renderEmbeddable` | props/callback JS | embed id | React local state | test canvas mirati | import diretto del legacy renderer |
| operation | callback canvas → `elabCanvas*Operation` | `simulation-operation/1` | operation id derivato da embed | envelope locale | adapter tests | envelope non viene inviato al runtime |
| mutation | callback canvas → `applyElabCanvas*` | `SimulationSceneV1` | embed id | `localScene` React | canvas write-back tests | bypass ToolHost/provider |
| solve | UI/adapter → `solveElabExperiment` | esperimento ELAB | experiment id | vista UI | solver + canvas tests | nessun receipt/digest host-mediated |
| persistence | `persistEmbedState` → Room write-back → WorkspaceStore | embed `customData` | room + embed id | Core/WorkspaceStore | post-it persistence tests | stato `ToolSimulation` non restaurato |
| event | UI → `emitLessonEvent` → `EventLogStore.append` | `LessonOsEvent` v1 | room implicita nel composition root | LessonOS | solve-event/event-log tests | non passa da `lesson.event.emit`; evidence non usa digest |

## Flusso broker formale già presente

```text
tool JSON-RPC
  → ToolHostSession
  → TOOL_METHODS strict Zod
  → ToolHost.handlers
  → ToolSimulation
  → SimulationRuntimeApiLike iniettata dal composition root
  → simulation-runtime/1
```

Fonti:

- `apps/studio/src/toolhost-protocol/messages.ts::TOOL_METHODS`;
- `apps/studio/src/toolhost/host.ts::ToolHost.handlers`;
- `apps/studio/src/toolhost/caps/simulation.ts::ToolSimulation`;
- `apps/studio/sim/core/simulationRuntime.ts`.

Metodi correnti:

- `simulation.describe`;
- `simulation.loadScene`;
- `simulation.solve`;
- `simulation.readDiagnostics`;
- `simulation.serializeState`.

Proprietà già presenti:

- capability unica `service.simulation`;
- `instanceId` imposto host-side;
- `_state` e `_digest` per istanza `ToolSimulation`;
- receipt con plugin id, API, instance id e scene digest;
- deny esplicito prima del load;
- runtime iniettato: `caps/simulation.ts` non importa `sim/`.

Gap:

- `simulation.applyOperation` è esplicitamente differito;
- nessun composition root di produzione collega la UI live a questo broker;
- la sola composizione col runtime reale è oggi nel test
  `ToolHostSimulationBroker.test.ts`;
- serialize non equivale a restore automatico: la riapertura deve ricaricare la
  scena canonica persistita e rieseguire deterministicamente il solve.

## Motore di mutazione già esistente

`apps/studio/sim/core/simulationRuntime.ts::applySimulationRuntimeOperation`
esegue:

```text
validateSimulationOperationEnvelope
  → runSimulationPlacementPipeline
  → patch SimulationScene canonica
  → validateSimulationScene
  → occupancy + pin vocabulary
  → solveWithProvider
  → diagnostica
```

Questa funzione è l'unico motore da riusare. Non serve un secondo solver, una
seconda `SimulationScene` o un endpoint di patch generico.

Il runtime è puro rispetto allo stato in ingresso: restituisce uno stato nuovo.
Tuttavia, su un'operazione rifiutata aggiunge diagnostica allo stato ritornato.
Il wrapper host deve quindi committare stato e digest soltanto se
validazione/placement sono accettati; in caso contrario deve conservare
byte/logicamente lo stato precedente.

## Probe A / Probe B

### Probe A — fallito

La mutazione live:

- non attraversa ToolHost;
- usa embed id ma non un `instanceId` imposto dal broker;
- modifica una scena locale direttamente;
- non produce receipt della mutazione;
- non invalida il digest del broker;
- non rilancia il provider attraverso il servizio;
- persiste soltanto l'embed UI.

### Probe B — richiesto

Il delta minimo è un solo metodo esplicito:

```text
simulation.applyOperation
```

sotto `service.simulation`, con:

- params Zod strict;
- sola mutazione topologica `connect-wire` in questa slice;
- nessun `instanceId` nel payload;
- precondition `expectedSceneDigest`;
- deny prima del load;
- deny per kind non supportato;
- delega a `applySimulationRuntimeOperation`;
- commit congiunto di stato e nuovo digest solo dopo esito accettato;
- receipt + solve outcome + diagnostica;
- bump SDK `1.3.0 → 1.4.0`;
- golden aggiornato;
- controllo negativo su host vecchio.

I probe sul provider hanno falsificato le due mutazioni preferite dal prompt:

- rimozione del resistore: LED spento/corrente zero, ma nessun errore esplicito
  del solver;
- inversione dei pin LED: LED spento, ma nessun errore esplicito del solver.

La scelta causale è quindi un singolo `connect-wire` fra
`bat1:positive` e `bat1:negative`. È una mutazione topologica, cambia il digest
e il provider locale deriva realmente `solverDiagnostics.shortCircuit = true`.
Non è un numero o un errore costruito dal test. Una semplice move sarebbe fuori
oracolo perché il digest corrente esclude il layout.

## Stato LessonOS e provenienza

`lesson.event.emit` accetta eventi v1 strict e il backend fidato li adatta a
`EventEnvelopeV2`. Il composition root può imporre:

- `lessonId`;
- `sessionId`;
- actor;
- producer `{ id, version, commitSha }`.

L'adapter legacy marca ogni evidence ref come `resolution: missing`. È
fail-closed e va mantenuto: una ref sintatticamente valida non diventa
`verified` senza un resolver. La verticale deve quindi provare:

1. passaggio esclusivo via `lesson.event.emit`;
2. producer con full SHA del checkout;
3. evidence `manual:vol1:p29-31`,
   `simulation:scene:<digest>` e `simulation-instance:<instanceId>`;
4. risoluzione canonica `missing`, non falsa `verified`;
5. grafo ricalcolabile da `readAll()` tramite `materialize`, senza write diretta.

Il contratto attuale di `simulation.error.observed` non possiede campi payload
dedicati `instanceId`/`sceneDigest`; l'istanza è registrabile con
`plugin.mounted` e il digest viaggia in `sceneId`/evidence. Estendere anche il
contratto eventi sarebbe una slice distinta e non viene nascosto come fatto.

## Persistenza e isolamento da provare

La verticale userà i confini reali già disponibili:

- `WorkspaceStore` come `StorageDriverLike` e `AuditStore`;
- `WorkspaceStore.exportBundle/importBundle` atomici;
- nuovo `ToolHost` dopo chiusura per il cold reopen;
- due istanze host con `instanceId` distinti;
- seconda room/workspace per il controllo cross-room;
- `createEventLogStore` con trusted context e
  `EnvelopeEventLogStore` per la provenance canonica.

Ricaricare soltanto `state.scene` e rieseguire il solve non conserva
`appliedOperations`, risultato e diagnostica: non è lo stesso stato canonico.
Il restore non deve introdurre un nuovo wire method generico. Il Core salva lo
stato serializzato nel marker room-scoped della PluginInstance e, prima del
mount, lo inietta come `simulationInitialState` host-owned. L'interfaccia
strutturale del provider riusa `restoreSimulationRuntimeState`; nessun dato di
scope arriva dal payload del plugin.

Il broker corrente possiede solo `instanceId`. La nuova operazione deve inoltre
richiedere un `roomId` host-owned nel composition root e restituirlo nel
risultato. Gli host legacy senza room possono continuare a usare i cinque
metodi 1.3, ma non possono applicare mutazioni 1.4.

## Negative controls richiesti

| Caso | Oracolo |
|---|---|
| solve/apply prima di load | errore esplicito |
| capability non concessa | `CAPABILITY_DENIED` |
| `instanceId` nel payload | `INVALID_PARAMS` |
| digest stantio | reject, stato invariato |
| operation kind non supportato | `INVALID_PARAMS` |
| target inesistente / placement reject | stato e digest invariati |
| provider assente | blocker `provider-unavailable`, nessun reading |
| istanza A vs B | digest/stato separati |
| room A vs B | nessun path/byte condiviso |
| export corrotto | import atomico, destinazione preservata |
| cold reopen | stessa scena canonica, digest e diagnostica |
| evidence non verificata | `missing`, mai promossa |
| host SDK 1.3 | metodo non presente |

## File esclusi dal delta funzionale

- `apps/studio/src/toolhost/ToolCanvasEmbeddable.tsx`: deve restare
  byte-invariato;
- `apps/studio/sim/core/simulationRuntime.ts`: il motore necessario esiste;
- `apps/studio/sim/core/simulationOperations.ts`: il vocabolario necessario
  esiste;
- legacy `plugins/elab-tutor`: nessuna nuova ownership.

## Falsificatori

La verticale non è accettata se:

- il test passa senza una request JSON-RPC `simulation.applyOperation`;
- la scena usata non deriva dalla fixture e dal pack reali;
- il provider non è `local` o il risultato è costruito dal test;
- un reject cambia stato, digest o operation log;
- l'istanza arriva dal payload;
- un valore corrente/tensione è hardcoded;
- il grafo viene scritto direttamente;
- `ToolCanvasEmbeddable.tsx` cresce;
- una scena candidate viene descritta come visualmente verificata;
- compare un claim Tinkercad parity, beta o plugin completo.

## Esito misurato dopo l'implementazione

Linea locale impilata sul base autorizzato
`36e6753cc55c114cb1c0815a7e2f8911a0b71dc7`; nessun push, PR, merge o deploy:

| Commit | Scopo |
|---|---|
| `3d73be0b2c3ce663ecceda2c5d234ac40951a827` | test causale della verticale e cold restore |
| `5a716f0ad4999a945a842ce7860c7ccdd1386a62` | contratto SDK 1.4 `simulation.applyOperation` |
| `bc8b50fa6a4b59556625d1873ab9ec63c3050ccc` | binding al runtime/provider reale |
| `f8ebacc2627c2aedaea332877ed7a3f9949a3b40` | rollback e validation hardening |
| `f686ef2dbd7bfa6d6259d8df7872de7c8e9568c7` | marker, cold restore ed export/import reali |
| `25c37a1243ee01ab40650e38514f820a7434e3de` | gesto live `connect-wire` via ToolHost |
| `9af49956ae32b1d90f7b4c46156c011b8c4bde97` | isolamento degli oggetti runtime iniettati |
| `55a258ff10adf1611107f6f43ae344ed302ada04` | marker/workbench v2 e migrazione digest v1 |
| `4675ea5fca8505b04e43e5523fc64b80e22ea98b` | contratto documentato room-scoped |

L'exact SHA prodotto finale, comprensivo dei documenti, viene legato dal
receipt nel repository Knowledge dopo il commit documentale; non viene
anticipato con un placeholder o ottenuto riscrivendo la storia.

### Flusso live provato

```text
Room.renderEmbeddable
  → callback applyConnectWire senza identità fidate dal canvas
  → applyRoomSimulationConnectWire
  → identità room/tool/embed ricavate dal composition root
  → SDK client su MessageChannel
  → ToolHost + capability service.simulation
  → simulation.loadScene
  → simulation.applyOperation
  → applySimulationRuntimeOperation
  → provider locale reale
  → receipt room/instance/digest + diagnostica short-circuit
  → board.write own-embed
  → marker v2 con digest obbligatorio
```

Il solo gesto live portato oltre il confine è `connect-wire`. Add/move di
componenti, layout, edit/delete wire e le altre callback del canvas restano
debito diretto in `ToolCanvasEmbeddable.tsx`; quindi non esiste una prova di
autonomia universale del plugin.

Il file `ToolCanvasEmbeddable.tsx` è passato da `112384` a `112298` byte:
`-86` byte. Il vincolo “non cresce” è rispettato, anche se la concentrazione di
responsabilità resta debito architetturale.

### Negative controls eseguiti

| Caso | Esito misurato |
|---|---|
| solve/apply prima di load | `INTERNAL`, nessuna scena implicita |
| capability non concessa | `CAPABILITY_DENIED` prima dell'handler |
| `instanceId` nel payload | `INVALID_PARAMS`; identità sempre host-owned |
| digest stantio | rifiuto e stato byte/logicamente invariato |
| target/kind non supportati | rifiuto; nessun commit |
| result `applyOperation`/`solve` malformato | rifiuto contrattuale |
| provider mutante o con reference trattenuta | clone host-owned; nessuna mutazione tardiva |
| serializer/diagnostics mutanti | clone + digest check; stato invariato |
| provider assente | blocker `provider-unavailable`, readings vuote |
| istanza A/B e room A/B | nessun byte o audit condiviso |
| richiesta concorrente/stale live | rifiuto prima del secondo `board.write` |
| kill-list | mount/operazione negati |
| marker v2 senza digest o con digest stantio | restore e render fail-closed |
| marker v1 senza digest | migrazione limitata al v1, poi writer v2 |
| marker v1 con digest discordante | rifiuto, mai “sanato” |
| topologia legacy malformata | nessuna promozione a v2 |
| export corrotto | import atomico, stato precedente preservato |
| cold reopen/import `.lesson` | stesso digest, stato runtime e diagnostica |
| evidence non risolta | `missing`, mai promossa a `verified` |
| host SDK 1.3 | consumer 1.4 non soddisfatto |

## Tabella CodeRabbit

Sono conteggiate soltanto review concluse. La review finale full-stack verrà
aggiunta prima del freeze del candidato; un tentativo intermedio è stato
bloccato dal rate limit e non è contato.

| Ciclo | Finding | Decisione ed evidenza |
|---|---|---|
| 1 | room requirement vs commento compatibilità 1.3 | codice room-scoped mantenuto per l'invariante Sessione 2; commento contraddittorio corretto e test no-room verde |
| 1 | shape di `applyOperation` dereferenziata | valido; guard `isRecord`, falsificatori `null/string/{}` |
| 1 | rimozione digest marker canonico | valido; schema marker/workbench v2, migrazione soltanto v1, test omissione/mismatch |
| 1 | `simulationInitialState` ignorato | valido; constructor fail-fast, due test di dipendenza mancante |
| 1 | `localStorage` jsdom implicito | respinto: ambiente jsdom installa lo storage, suite completa e isolamento `beforeEach` verdi; nessun difetto prodotto |
| 1 | `solve` committa stato con digest vecchio | valido; clone, ricalcolo, confronto e rollback |
| 1 | manca test rimozione digest canonico | valido; v2 omissione coperta in restore e render |
| 1 | response asincrona può sovrascrivere scena nuova | valido; scene ref + stale check + coda/in-flight; test pending/reject/stale |
| 1 | board guard fuori dal `try` | valido; errore convogliato nel percorso visibile |
| 2 | review incrementale gesto live | `0 findings` su cinque file |
| 3 | oggetti restituiti dal runtime restano mutabili | valido; snapshot host-owned per load/apply/solve/restore/serialize e digest su copia |
| 3 | result `solve` non validato | valido; shape guard prima della dereference |
| 4 | render legacy asserito solo non-null | valido; instance/plugin verificati e digest ristretto |
| 4 | `expectedDigest` poteva essere `undefined` | valido; precondition stringa non vuota |
| 4 | test non-promozione legacy ambiguo | valido nel nucleo: input v1 e digest assente restano immutati dopo il reject |
| 4 | costante schema hardcoded | valido; test usa costante corrente, literal v1 resta intenzionalmente storico |
| 4 | plugin id hardcoded | valido; lookup usa `SIMULATION_PLUGIN_ID` |
| 4 | digest ricalcolato due volte | respinto: la seconda validazione è defense-in-depth sul post-it migrato, non stato condiviso |
| 4 | trattare `sceneDigest: null` come legacy missing | respinto: i writer legacy omettevano il campo; `null` è dato esplicito invalido e deve fallire chiuso |

Review indipendente aggiuntiva: due Major sul marker (topologie malformate
hashabili e policy bare-id divergente tra restore/render), entrambi riprodotti,
corretti e riesaminati con zero finding residui.

## Claim / evidence matrix

| Claim | Evidenza | Stato |
|---|---|---|
| SDK 1.4 espone una sola mutazione stretta | schema/golden/negative controls `applyOperation` | provato |
| mutazione provider-derived | short battery → `solverDiagnostics.shortCircuit=true` dal provider locale | provato |
| gesto live attraversa ToolHost | audit ordinato load → apply → board.write | provato solo per `connect-wire` |
| room e instance isolation | test A/B, store/audit separati, scope host-owned | provato nella slice |
| persistence/cold reopen/import | marker runtime v2 + `.lesson` reale + cold host | provato nella slice |
| LessonOS è derivato dal log | emit host-mediated + `materialize(readAll())` | provato |
| provenance risolvibile | refs manual/scene/instance hanno `resolution: missing` | **bloccato** |
| fedeltà visiva al manuale | fixture v2 è `candidate`, `visualMatch: unknown` | non provato |
| plugin autonomo completo | altre callback UI bypassano il broker | non provato |
| Tinkercad parity / beta | nessun oracolo o copertura sufficiente | vietato |

## CoV e verdetto

| CoV | Stato |
|---|---|
| CoV-0 — confine osservato | `GREEN_MEASURED` |
| CoV-1 — test rosso causale | `GREEN_CAUSAL_RED_TO_GREEN` |
| CoV-2 — protocollo | `GREEN_BOUNDED` |
| CoV-3 — runtime/provider | `GREEN_BOUNDED` |
| CoV-4 — persistenza/isolamento | `GREEN_BOUNDED` |
| CoV-5 — provenienza risolvibile | `BLOCKED_EVIDENCE_RESOLUTION_MISSING` |
| CoV-6 — review | `GREEN_CLASSIFIED`; review full-stack finale da congelare nel receipt |
| CoV-7 — docs/canon | `IN_PROGRESS_LOCAL` fino ai commit prodotto e Knowledge |
| DoD Sessione 2 | `PARTIAL_BLOCKED` |

Verdetto ammesso: **partial simulation harness**. La verticale tecnica è
eseguibile, ma la Definition of Done della Sessione 2 non è chiusa perché
CoV-5 è bloccato e il percorso live non copre tutte le operazioni.

## Rollback e handoff Sessione 3

Rollback: revert chirurgico dei commit locali in ordine inverso e rerun degli
stessi falsificatori; nessuna migrazione distruttiva. I reader v1 restano
migrate-safe, mentre i writer emettono soltanto v2.

Superfici UI alimentabili da dati reali nella Sessione 3:

- stato pending/accepted/rejected del gesto `connect-wire`;
- receipt con room, instance, operation id e digest;
- diagnostica provider, incluso short-circuit e provider unavailable;
- stato di provenance `candidate`/`missing`, mai badge “verified”;
- stato cold-restore/import e isolamento per istanza;
- errore kill-list, stale scene o richiesta concorrente.

Non sono alimentabili onestamente badge di parità, fedeltà visiva verificata,
strumenti avanzati o copertura universale delle operazioni canvas.
