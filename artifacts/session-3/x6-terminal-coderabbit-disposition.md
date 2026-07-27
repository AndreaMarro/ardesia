# X6 — disposizione terminale CodeRabbit su `a397263e`

/ Ciclo: **X6** · base `36e6753cc55c114cb1c0815a7e2f8911a0b71dc7` · head `a397263e01db0b3b35155d3efd831c371b5bf819`
/ Comando: `coderabbit review --agent --committed --base-commit 36e6753c…`
/ CLI: `0.7.0` · account `AndreaMarro` · exit `0` · stderr vuoto
/ Evento terminale: `{"type":"complete","status":"review_completed","findings":25}` — presente in `x6-coderabbit-raw.jsonl`
/ Durata osservata: **~6 minuti** (16:08→16:14 CEST), non i ~40 misurati in Sessione 2. La durata **non** è indicatore di completezza: l'unico discriminante è l'evento terminale.

## Tracciabilità: `DEGRADED_TRACEABILITY`

La `0.7.0` con `--agent` **non emette UUID**. La chiave `ciclo + UUID` non è producibile.
Chiave adottata: **`X6` + file + intervallo di righe**, come emesso in `codegenInstructions`.
Il `.jsonl` grezzo è la sola fonte riverificabile: `x6-coderabbit-raw.jsonl`.

Conteggi grezzi riletti dai record terminali, non citati a memoria:

| ciclo | `findings` nel record `complete` |
|---|---:|
| X4 | 21 |
| X5 | **29** |
| X6 | 25 |

⚠️ `00-HANDOFF/01-AUDIT-TECNICO-EVIDENCE.md:88` apre la sezione X5 con «`21` finding». Il record grezzo di X5 dichiara `29`. **21 è il numero di X4**, trascritto nella sezione sbagliata del documento che il protocollo definisce «quello con le prove numeriche». Falsificatore: `x5-coderabbit-raw.jsonl`, record `complete`.

## Vocabolario di disposizione

Nessun oracolo è stato eseguito in questo ciclo: la sessione è stata **review-only**, nessun byte di codice è stato toccato. La disposizione riflette questo limite invece di nasconderlo.

| stato | significato |
|---|---|
| `ACCEPT_PENDING_ORACLE` | finding giudicato valido, ma **non ancora riprodotto**. Richiede un oracolo ROSSO causale prima di qualunque fix. Un fix senza riproduzione è un guess-fix. |
| `PENDING_ADJUDICATION` | non ancora giudicato. Richiede lettura del codice non eseguita in questo ciclo. **Non è un rifiuto implicito.** |
| `DEFERRED_SCOPE` | reale ma fuori dagli ordini di Sessione 3 (§3: test-splitting e refactor non si aprono). |
| `CONFIRMED_MEASURED` | verificato con una misura eseguita, non con lettura. |

## Severità: 9 major · 5 minor · 11 trivial

## MAJOR

| # | file:righe | rilievo | disposizione |
|---|---|---|---|
| 1 | `toolhost/caps/board.ts:182-186` | rendere osservabili i rejection di `auditWrites` senza toccare il fail-soft: contatore di righe perse + logging diagnostico | **`ACCEPT_PENDING_ORACLE` — priorità massima.** Convergenza indipendente a tre: X5, review avversariale companion (#3), review di falsificazione (#3). Tre rilevazioni, due strumenti, tre cicli. |
| 2 | `toolhost/ToolCanvasEmbeddable.tsx:1318-1349` | nessun timeout su apply irrisolta: `connectWireInFlightRef` mai pulito, settlement tardivo corrompe lo stato | `ACCEPT_PENDING_ORACLE`. Corrobora indipendentemente, a un altro layer, la tesi «nessun timeout tool→host» della falsificazione (#5) e la perdita di causa (#15). |
| 3 | `roomSimulationComposition.ts:197-210` | ordinamento `connections` divergente da `projectMontaggioPlacements`: il **secondo** connect-wire consecutivo viene rifiutato come stale | `PENDING_ADJUDICATION`. Causa distinta da quella trovata dalla falsificazione (#14, chiavi `undefined` esplicite): due strade diverse verso lo stesso falso-stantio. |
| 4 | `design/multiPostitBoardPersistence.ts:277-300` | esportare `readPluginPostitBoardMarker` e rimuovere il duplicato in `pluginPostitBoardRender.tsx` | `ACCEPT_PENDING_ORACLE`. Era DEFERRED nel piano; ora è major terminale. ⚠️ La falsificazione demolisce la **motivazione** X4 voce 4 («il reader render non controlla `type === "embeddable"`»): quel controllo esiste, `pluginPostitBoardRender.tsx:47`. Resta la duplicazione, cade la prova addotta. |
| 5 | `__tests__/RoomSimulationConnectWire.test.tsx:348-385` | aggiungere un placement di tipo wire e due connect-wire consecutivi; il secondo non deve essere rifiutato come stale | `ACCEPT_PENDING_ORACLE`. È §1 applicato: le precondizioni vanno **stabilite**, non assunte. |
| 6 | `artifacts/session-2/current-flow.md:400-403` | numero di byte del freeze ambiguo, riferimento a `0380b67c` non etichettato | **`CONFIRMED_MEASURED`.** Vedi §Contraddizione numerica sotto. |
| 7 | `artifacts/session-2/current-flow.md:15-18` | confine cronologico: «Esito misurato dopo l'implementazione» classificato come parte congelata pre-implementazione | `PENDING_ADJUDICATION`. Materia A7. |
| 8 | `docs/architecture/simulation-plugin-v2.md:43-44` | dichiara SHA finale e disposizione review **già vincolati**, mentre `cov-exact-sha.md` li dà pending | `PENDING_ADJUDICATION`, **marcato CoV-5**: è una dichiarazione di provenance risolta che la fonte adiacente contraddice. |
| 9 | `docs/vault/ARDESIA-MAP.md:12-18` | il tombstone contiene istruzioni operative (clone, mirror, retention, rewrite, force-push) che appartengono ad `AGENTS.md`/`COORDINATION.md` | `DEFERRED_SCOPE`. Governance documentale, fuori dagli ordini. |

### Contraddizione numerica misurata (finding #6)

Tre valori diversi per lo **stesso file allo stesso freeze**:

```
artifacts/session-2/cov-exact-sha.md:46     112384 → 111130   (delta -1254)
artifacts/session-2/current-flow.md:401     112384 → 111361   (delta -1023)
file su disco a a397263e                             111574
```

Ogni documento è **aritmeticamente coerente con sé stesso** (`112384-1254=111130`, `112384-1023=111361`) e in disaccordo con l'altro; **nessuno dei due coincide con il file**. La soglia del protocollo (`111574`) è l'unica che combacia con il disco.

Non è «documenti disallineati»: sono **due ricevute che dichiarano una misura e sbagliano entrambe**. È un falsificatore diretto della famiglia di claim sulla byte-invarianza (A1-A3).

## MINOR

| # | file:righe | rilievo | disposizione |
|---|---|---|---|
| 10 | `__tests__/SimulationPluginVertical.test.ts:710-712` | il test tratta `resolution: "missing"` come **conformità implicita**: evidence non risolvibili passano | `ACCEPT_PENDING_ORACLE`, **marcato CoV-5**. Oracolo verde per inerzia. |
| 11 | `__tests__/SimulationPluginVertical.test.ts:1662-1689` | `studioProducerIdentity` passa in silenzio sul fallback ambientale, senza registrare che il confronto con `checkoutSha` non è stato misurato | `ACCEPT_PENDING_ORACLE`. Secondo oracolo verde per inerzia, stessa forma del precedente. |
| 12 | `toolhost/caps/simulation.ts:405-450` | `retainedTopologyMatches`: confronto id condizionale invece di uguaglianza stretta | `ACCEPT_PENDING_ORACLE`. Terzo colpo su `caps/simulation.ts` in tre cicli, su tre righe diverse. Vedi §Pattern. |
| 13 | `design/SimulationPluginWorkbench.tsx:418-422` | gli id riservati per `nextMontaggioPlacementId` escludono `boardScene.connections` → collisione possibile nello spazio `cavo-libero-*` | `PENDING_ADJUDICATION`. Adiacente al finding `occupiedHoles` della falsificazione (#12): due modi diversi di collidere sulla stessa risorsa. |
| 14 | `Room.tsx:1090-1093` | prefissare l'errore docente con «Salvataggio non riuscito: » | `DEFERRED_SCOPE`. UX, non correttezza. |

## TRIVIAL — tre non sono cosmetica

La severità dichiarata dallo strumento **non è il criterio**. Tre voci `trivial` toccano cause strutturali:

| # | file:righe | perché non è cosmetica | disposizione |
|---|---|---|---|
| 15 | `toolhost-protocol/messages.ts:401-412` | `solveOutcome` e `diagnostics` devono inferire come **required**; oggi `z.unknown().refine` li rende opzionali al tipo | `ACCEPT_PENDING_ORACLE`. **È la radice a livello di tipo del finding A5**: se il protocollo li rende opzionali, scartarli in `onAccepted` non è nemmeno un errore di tipo. Severità `trivial` fuorviante. |
| 16 | `toolhost/caps/simulation.ts:206-232` | costruire e validare l'oggetto di ritorno **prima** di committare `this._state` | `ACCEPT_PENDING_ORACLE`. ⚠️ Stessa regione del finding HIGH della falsificazione (#4, digest auto-attestato) ma **difetto diverso**: CodeRabbit vede l'ordine di commit, non il confine di fiducia. Il revisore che legge il diff ha visto la regione e mancato la classe. |
| 17 | `toolhost/simulationPluginRegistry.ts:68-93` | `dispatchSimulationConnectWire` scarta l'errore originale di `input.apply`, perdendo la distinzione fra policy denial e store failure | `ACCEPT_PENDING_ORACLE`. Corrobora il finding LOW #15 della falsificazione (mount riclassificato, causa soppressa). |

Nota su `host.ts:138-145` (#18, trivial — estendere la validazione costruttore di `simulationInitialState` a `deps.roomId`): **non contraddice** il `REJECT_INVALID` di X4 voce 1, confermato valido dalla falsificazione. Quel rifiuto riguardava `describe()`, intenzionalmente stateless; questo riguarda `simulationInitialState`. Domini diversi.

Restanti `trivial` — `DEFERRED_SCOPE` per §3 (test-splitting e refactor non si aprono):
`BoardPluginPostitPersistence.test.ts:824-840` · `multiPostitWorkbenchModel.ts:492-531` · `BoardPluginPostitPersistence.test.ts:464-501` · `RoomSimulationConnectWire.test.tsx:676-789` · `roomSimulationComposition.ts:132-143` · `ToolHostSimulationBroker.test.ts:95-130` · `SimulationPluginVertical.test.ts:249-288`.

## Pattern: `caps/simulation.ts` colpito in tre cicli su tre righe diverse

| ciclo | righe | rilievo | esito |
|---|---|---|---|
| X4 voce 16 | `330-372` | il postcontratto non verifica `wire.color` | `REJECT_INVALID` → **ribaltato in `ACCEPT`** dalla review avversariale precedente |
| X6 #12 | `405-450` | uguaglianza id non stretta in `retainedTopologyMatches` | `ACCEPT_PENDING_ORACLE` |
| falsificazione #4 | `206-228` | entrambi i digest vengono dalla parte auditata | `ACCEPT_PENDING_ORACLE`, HIGH |

Quando il difetto si sposta ma il file resta, il problema non è la riga: **il postcontratto attesta meno di quanto dichiari**.

## Nessun Major incompreso

§9 impone lo stop se «CodeRabbit segnala un Major non compreso». Tutti e 9 i major sono stati letti nel testo integrale e collocati; nessuno resta oscuro. Sei sono in attesa di oracolo o di aggiudicazione, il che è dichiarato, non nascosto.
