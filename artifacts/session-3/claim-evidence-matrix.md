# Sessione 3 — matrice claim/evidence, falsificatori, CoV, debito residuo

/ Freeze: base `36e6753cc55c114cb1c0815a7e2f8911a0b71dc7` → head `a397263e01db0b3b35155d3efd831c371b5bf819`
/ Ambito eseguito: **review-only**. Nessun byte di codice prodotto è stato modificato. Nessuna slice aperta, nessun oracolo eseguito.
/ Revisori terminali eseguiti: **due**, più un controllo di aggiudicazione sul primo.

## 0. CoV-0 — freeze e ingresso: **VERDE**, ricalcolato per intero

| grandezza | atteso | ricalcolato | esito |
|---|---|---|---|
| SHA-256 archivio handoff | `d55940cc…8505f2` | `d55940cc94660583e8b33a387a727ba14570b9054ceccee76b9eacfbac8505f2` | ✅ |
| HEAD prodotto | `a397263e…` | `a397263e01db0b3b35155d3efd831c371b5bf819` | ✅ |
| tree | `c1e7caf7…` | `c1e7caf74868a75972596e3a18514924aefde873` | ✅ |
| SHA-256 `git diff --binary --full-index --no-ext-diff --no-textconv` base→HEAD | `a83a3658…` | `a83a3658aba2d5dd9fe85be54776c1662dd83a553d473596a43eb00b06794ef3` | ✅ |
| SHA-256 lista ordinata file | `6877120d…` | `6877120d9db0612e1fc840f2682ecb36423e1ac0bcff4fc3f553145a3bbe9716` | ✅ |
| stat diff | 36 file, +6016/-469 | 36 files changed, 6016 insertions(+), 469 deletions(-) | ✅ |
| `ToolCanvasEmbeddable.tsx` | ≤ 111574 byte | 111574 | ✅ (esatto, non sotto) |

## 1. Matrice claim / evidence

| claim | stato dopo questo ciclo | evidenza o documento da cui ritirarlo |
|---|---|---|
| **A5** — letture UI live provider-derived | **NON REGGE**, confermato da due revisori indipendenti | `ToolCanvasEmbeddable.tsx:1336` scarta `solveOutcome`/`diagnostics`; radice al livello di tipo in `messages.ts:401-412`, dove i due campi non inferiscono come required. Ritiro richiesto dai documenti prodotto. |
| **A6** — cold restore della diagnostica sul percorso live | **NON REGGE**, ma **declassato a `MEDIUM`** | `roomSimulationComposition.ts:155` crea un ToolHost senza `simulationInitialState`; `:215` scrive la sola scena. La **topologia sopravvive** e viene ricalcolata: ciò che si perde è `lastSolverResult`, diagnostics e history. Il declassamento **non salva il claim**: quel che i doc chiamano «cold restore della diagnostica» è esattamente la parte che non sopravvive. |
| **A4** — atomicità end-to-end runtime↔board↔audit | **NON REGGE nel nucleo; un sottoclaim del primo revisore è falso** | Regge: audit di successo durevole prodotto prima del CAS (`roomSimulationComposition.ts:180`, `:192`, `:207`) e fallimento audit invisibile (`caps/board.ts:182`, `audit.ts:78`). **Cade**: «stato runtime persistentemente divergente» — `:192` chiude l'host prima del CAS, nessun envelope viene persistito. Lo split durevole riguarda **solo l'audit**. |
| **A1-A3** — postcontratto attesta il wire per intero; byte-invarianza | **NON REGGE** | `caps/simulation.ts:346`/`:405` non attestano `color`; `:405-450` confronta gli id in modo condizionale. Byte-invarianza falsificata dalla contraddizione numerica sotto. |
| **A7** — coerenza documentale sullo stesso SHA | **NON REGGE, PEGGIORATO** | Tre major documentali in X6 più una contraddizione numerica **misurata in questo ciclo** e prima non registrata. |
| **Partial simulation harness per connect-wire, postcontratto ristretto alla proiezione host, dichiarato tale** | **unico claim ancora ammesso** | Invariato. Nessuna misura di questo ciclo lo tocca. |

## 2. Matrice dei falsificatori — cosa renderebbe falso ciascun claim residuo

| claim residuo | falsificatore |
|---|---|
| «l'audit fail-soft è una policy, non un buco» | un oracolo con store audit rigettante dopo `board.write` riuscita: se **nessun** contatore, evento o diagnostica riceve esattamente un errore, la policy non esiste. |
| «il postcontratto attesta l'operazione applicata» | un runtime iniettato che cambia **solo** `wire.color`, oppure che restituisce lo stesso wire con id diverso: se `applyOperation` accetta, il postcontratto non attesta. |
| «l'invarianza topologica di `solve` è verificata» | un runtime con `sceneDigest: () => "constant"` che muta la scena durante `solve`: se il commit avviene, l'oracolo di integrità è fornito dalla parte auditata. |
| «la coda protegge le mutazioni» | una prima operazione sospesa indefinitamente e una seconda room sullo stesso store: se B resta pending senza limite, la coda è un single point of wedge. |
| «l'audit conserva ogni riga» | due `ToolHost` distinti sullo stesso store/tool, con barriera che completa entrambe le read prima delle write: se il log finale contiene una sola entry, il read-modify-write non è atomico. |
| «la board resta idratabile dopo gesti utente ordinari» | duplicare un post-it plugin v2 in Excalidraw: se il marker duplicato conserva `owner`/`state.instanceId` dell'originale e viene persistito, la board diventa non idratabile. |
| «le evidence ref sono risolvibili» | un caso con `resolution: "missing"`: se il test passa, la conformità è implicita e la provenance non è provata. |
| «i byte del freeze sono quelli dichiarati» | già falsificato: vedi §4. |

## 3. Aggiudicazione del primo revisore — controllo eseguito

Sei finding prodotti dalla review avversariale via companion (`codex-companion-adversarial-raw.md`), tutti dichiarati `[high]`. Verdetto del secondo revisore (`codex-falsification-review-raw.md`):

| # | locus | verdetto |
|---|---|---|
| 1 | `ToolCanvasEmbeddable.tsx:1336-1342` | REGGE, `HIGH` |
| 2 | `roomSimulationComposition.ts:180-220` | REGGE **nel nucleo**; cade il sottoclaim sullo stato runtime durevole |
| 3 | `caps/board.ts:182-186` | REGGE, `HIGH` |
| 4 | `caps/simulation.ts:206-228` | REGGE, `HIGH` |
| 5 | `roomSimulationComposition.ts:155-164` | REGGE, **ma `MEDIUM` non `HIGH`** |
| 6 | `roomSimulationComposition.ts:327-339` | REGGE, `HIGH` |

Nessuno cade interamente. Due richiedono qualificazione.

### Rifiuti del ciclo precedente, riesaminati

| voce X4 | esito | falsificatore o conferma |
|---|---|---|
| voce 1 — `host.ts:75-95`, `deps.simulation` senza `roomId` | **RIFIUTO REGGE** | Nessuna seconda porta: gli handler `host.ts:326` chiamano solo `ToolSimulation`. Non verde per inerzia: `ToolHostSimulationBroker.test.ts:266` (stateful positivo con room) e `:448` (`describe` roomless positivo) **stabiliscono** il percorso accettante. |
| voce 12 — `RoomSimulationConnectWire.test.tsx:637-639` | **RIFIUTO NON REGGE** | `ToolCanvasEmbeddable.tsx:520` usa `Date.now()`: l'identità byte non è garantita e il test non l'asserisce, quindi `roomABytes !== roomBBytes` già **prima** dell'operazione. La riga 638 resta verde anche con una `apply` no-op. |
| voce 16 — `caps/simulation.ts:330-372` | ribaltamento in `ACCEPT` **regge** | `color` eliminato a `:368-375`, non confrontato a `:426-429`. |
| voce 4 — doppio reader post-it | **la prova addotta non regge** | Il controllo `type === "embeddable"` esiste, `pluginPostitBoardRender.tsx:47`. Resta la duplicazione; cade quella divergenza. |
| voce 6 — migrazione digest «silenziosa» | **non regge** | È fail-closed: `multiPostitWorkbenchModel.ts:217` chiama `assertWorkbenchPostit`, che rifiuta a `:327-331`. |
| voci 5 e 20 — motivazioni di differimento | **non reggono** | «nessun writer corrente» non protegge un confine di **lettura**; il timeout di `session.ts:132` è host→tool e non copre handshake/RPC tool→host. |
| X5 — leak dei due `MessagePort` | **NON REGGE** | `connect.ts:150` chiude `port2`; `session.ts:112` chiude `port1` via `unmount`. |

**Due errori di aggiudicazione nella stessa disposizione** (voci 12 e 16), su due cicli. Lo strato in cui si nascondono gli errori non è il codice: è la classificazione.

## 4. Contraddizioni numeriche misurate in questo ciclo

**Byte del freeze — tre valori per lo stesso file allo stesso SHA:**

```
artifacts/session-2/cov-exact-sha.md:46     112384 → 111130   (delta -1254)
artifacts/session-2/current-flow.md:401     112384 → 111361   (delta -1023)
file su disco a a397263e                             111574
```

Ogni documento è autocoerente; nessuno coincide col file.

**Conteggio finding X5:**

`00-HANDOFF/01-AUDIT-TECNICO-EVIDENCE.md:88` dichiara «`21` finding» per X5. Il record terminale grezzo `x5-coderabbit-raw.jsonl` dichiara `29`. **21 è il numero di X4.**

Entrambi gli errori hanno la stessa forma: **un numero copiato da una vista adiacente invece che riletto dalla fonte.** È esattamente ciò che il protocollo vieta quando impone di rileggere i `.jsonl` prima di citare un conteggio.

## 5. Difetti nuovi, non coperti da nessun ciclo precedente

| # | locus | scenario | perché conta |
|---|---|---|---|
| N1 | `audit.ts:55`, `:91`, `host.ts:149` | due `ToolHost` sullo stesso store/tool hanno `_chain` indipendenti: entrambi leggono `audit.jsonl`, concatenano, scrivono. L'ultimo write elimina la riga dell'altro. Il test esistente copre solo append concorrenti sulla **stessa** istanza. | **Si compone con il finding audit**: le righe si perdono *e* la perdita è invisibile. Chiudere prima l'osservabilità farebbe emergere questa race da sola. |
| N2 | `ToolCanvasEmbeddable.tsx:572`, `Room.tsx:519`, `pluginPostitBoardRender.tsx:55` | Excalidraw duplica l'elemento con nuovo `id`; marker, owner e `state.instanceId` restano dell'originale. Render e restore lanciano `id mismatch`; al successivo `onChange` il duplicato incoerente viene salvato e **la board diventa non idratabile**. | Perdita dati su un gesto utente banale. È il difetto più visibile all'utente dell'intero set e nessun revisore precedente l'aveva. |

## 6. Stato CoV — con i peggioramenti dichiarati

| CoV | oggetto | stato | nota |
|---|---|---|---|
| CoV-0 | freeze e ingresso | **GREEN** | tutti e 7 i binding ricalcolati e coincidenti (§0). Migliorato rispetto al freeze precedente. |
| CoV-1 | oracolo RED | **NOT_STARTED** | nessuna slice aperta: ciclo review-only. Non è un verde mancato, è un ambito non aperto. |
| CoV-2 | A5 | **BLOCKED** | claim falsificato da due revisori; né chiuso né ritirato dai documenti. |
| CoV-3 | A6 | **BLOCKED**, severità **rivista a `MEDIUM`** | il declassamento è un dato nuovo, non un miglioramento del claim. |
| CoV-4 | A4 | **BLOCKED**, ma **meglio localizzato** | lo split durevole è nell'audit, non nello stato runtime: il sottoclaim del primo revisore è stato falsificato. |
| CoV-5 | provenance | **BLOCKED, PEGGIORATO** | due nuovi falsificatori indipendenti: `simulation-plugin-v2.md:43-44` dichiara vincolato ciò che `cov-exact-sha.md` dà pending; `SimulationPluginVertical.test.ts:710-712` accetta `resolution: "missing"` come conformità. |
| CoV-6 | review | **PARZIALE — vedi caveat** | entrambi i revisori terminali eseguiti (X6 `review_completed` exit 0; falsificazione exit 0 con le tre sezioni obbligatorie) **più** il controllo di aggiudicazione. Caveat sotto. |
| CoV-7 | docs/canon | **BLOCKED, PEGGIORATO** | contraddizione numerica sui byte del freeze **misurata in questo ciclo e prima non registrata**, più l'errore di conteggio X5 nel documento delle prove numeriche. |

### Caveat su CoV-6 — «zero byte cambiati dopo»

Nessun byte **del diff revisionato** è cambiato dopo le review: HEAD resta `a397263e`, tree `c1e7caf7`, i 36 file e i loro hash sono invariati.

Sono stati aggiunti **dopo** le review 5 file **non tracciati** in `artifacts/session-3/`, che non fanno parte del diff revisionato. Finché restano non committati, la copertura delle review su HEAD è intatta.

⚠️ **Nel momento in cui questi artifact venissero committati, HEAD si sposterebbe e nessuna delle due review coprirebbe più HEAD.** Va dichiarato in quel commit, non scoperto dopo.

Tre CoV peggiorati (CoV-5, CoV-7, e la severità rivista in CoV-3). Come nella sessione precedente, il peggioramento nasce da **misure che prima mancavano**, non da regressioni del codice.

## 7. Debito residuo, ordinato per gravità

1. **Audit invisibile + race di append** (`caps/board.ts:182`, `audit.ts:55`/`:78`/`:91`, `host.ts:149`) — perdita silenziosa di evidenza durevole, con la perdita stessa non osservabile. Convergenza a tre revisori. **Da aprire per primo**: rende diagnosticabile tutto il resto.
2. **Digest auto-attestato** (`caps/simulation.ts:206-228`) — l'oracolo di integrità è fornito dalla parte auditata. Ordina prima di A5: arricchire una ricevuta la rende più convincente, non più vera.
3. **Duplicazione post-it → board non idratabile** (N2) — perdita dati su gesto utente.
4. **Wedge store-scoped senza timeout** (`roomSimulationComposition.ts:327-339`, `connect.ts:57`/`:131`) — liveness; nessun CoV lo copre e nessun test che non si pianta lo vede.
5. **A5 e la sua radice di tipo** (`ToolCanvasEmbeddable.tsx:1336`, `messages.ts:401-412`).
6. **Split audit/board** (`roomSimulationComposition.ts:180-207`).
7. **A6 envelope runtime** (`:155-164`) — `MEDIUM`; se il costo eccede una slice, ritirare il claim dai documenti.
8. **Quattro DEFERRED**, di cui uno promosso a major in X6 (`multiPostitBoardPersistence.ts:277-300`).
9. **A7 documentale**, incluse le due contraddizioni numeriche di §4.

## 8. Rollback

Questo ciclo ha prodotto **solo file non tracciati**. Nessun file tracciato è stato modificato, nessun commit, nessun push, nessuna dipendenza, nessun `.env*`.

```
rm -rf "artifacts/session-3"
```

riporta il worktree allo stato esatto del freeze. Verifica: `git status --porcelain --untracked-files=all` deve tornare vuoto e `git rev-parse HEAD` deve restare `a397263e01db0b3b35155d3efd831c371b5bf819`.

## 9. Gate eseguiti — numeri osservati, non «verde»

Seriali, mai in pipe che maschera l'exit code.

| gate | atteso dal protocollo | osservato | esito |
|---|---|---|---|
| `npm run verify` | Engine 2044 passed / 7 skipped; Studio 2042 passed / 5 skipped | Engine `2044 passed, 7 skipped in 28.89s`; Studio `Test Files 183 passed \| 1 skipped (184)`, `Tests 2042 passed \| 5 skipped (2047)` | **exit 0** ✅ |
| `python3 bin/ci/elab_boundary_gate.py` | 12 offender baseline, 0 nuovi | `OK (12 baseline offenders remain, none added; packs/ clean)` | **exit 0** ✅ |
| `bash apps/studio/eval/gate.sh` | `{"passed":2043,"failed":0,"exit":0}` | `{"passed":2043,"failed":0,"exit":0}` | **exit 0** ✅ |
| `git diff --check` | pulito | nessun output | **exit 0** ✅ |
| `ToolCanvasEmbeddable.tsx` | ≤ 111574 | 111574 | ✅ |
| lockfile vs base | invariato | `package-lock.json` non compare nel diff | ✅ |

⚠️ `npm run verify` **non è il comando della CI**: `bin/monorepo.sh` usa il pool di default, la CI usa `--pool=threads --maxWorkers=1 --no-file-parallelism`. Questo verde **non** è un verde di CI. Non è stato eseguito il comando CI-equivalente in questo ciclo.

⚠️ `eval/gate.sh` ha superato i 120 s ed è stato spostato in background, non ucciso. Un timeout sincrono l'avrebbe terminato facendolo sembrare rotto: stessa classe del falso «CodeRabbit è rotto» già falsificato in Sessione 2.

### Risultato scientificamente rilevante

Tre blocchi di numeri dichiarati sono stati riverificati in questo ciclo:

| blocco | esito |
|---|---|
| byte del freeze nei documenti | **falso** in due documenti su due |
| conteggio finding X5 nell'audit | **falso** |
| baseline dei gate eseguibili | **vero**, tutti e tre coincidenti |

**Le falsità stanno nello strato documentale, non in quello eseguibile.** L'evidenza prodotta da un comando in questo freeze è affidabile; la prosa che la descrive non lo è. È una distinzione azionabile: i gate non vanno rifatti, i documenti sì.

## 10. Verdetto sulla Definition of Done di Sessione 2 (§16)

Il protocollo di Sessione 2 dichiara: «Esito positivo **soltanto se**» tutte e 13 le condizioni valgono. Ciascuna è qui giudicata con la sua evidenza, e dove possibile con una misura eseguita oggi.

| # | condizione §16 | verdetto | evidenza |
|---|---|---|---|
| 1 | una verticale reale completa è verde | **FALSO** | §8 richiede ai passi 10-12 chiusura runtime, cold reopen e **stessa diagnostica**. Il test che lo prova inietta `simulationInitialState` (`SimulationPluginVertical.test.ts:402`); il percorso live non lo passa (`roomSimulationComposition.ts:155`). §8 vieta esplicitamente di usare fixture e dichiarare provato il confine runtime. |
| 2 | il percorso di mutazione attraversa il confine canonico | **VERO con riserva** | `service.simulation.applyOperation` è host-mediated. Riserva: l'oracolo di integrità dell'attraversamento è fornito dalla parte auditata (`caps/simulation.ts:206-228`). |
| 3 | il servizio non importa l'implementazione privata del plugin | **VERO — misurato** | nessun import da `sim/` in `caps/simulation.ts`; boundary gate `0 nuovi offender`, `packs/ clean`. |
| 4 | ELABTutor resta pack e non seconda app | **VERO** | nessun secondo eseguibile fra i 36 file del diff; `packs/` pulito al gate. |
| 5 | due PluginInstance sono isolate | **NON PROVATO** | l'oracolo è verde per inerzia: `RoomSimulationConnectWire.test.tsx:637-639` confronta con `roomABytes`, e `ToolCanvasEmbeddable.tsx:520` usa `Date.now()`, quindi i byte differiscono **prima** dell'operazione. X4 aveva rifiutato il rilievo; il rifiuto è stato falsificato. §11 definisce l'isolamento «un confine di sicurezza, non un dettaglio funzionale». **È la falla più grave del verdetto.** |
| 6 | save, cold reopen ed export/import provati | **FALSO in parte** | sopravvive la topologia; non sopravvivono `lastSolverResult`, diagnostics e history. |
| 7 | diagnostica e misure derivano dal provider | **FALSO** | `ToolCanvasEmbeddable.tsx:1336` scarta `solveOutcome`/`diagnostics`; radice di tipo in `messages.ts:401-412`. Viola l'invariante §7.8-7.9. |
| 8 | LessonOS riceve un evento con provenienza risolvibile | **FALSO** | `SimulationPluginVertical.test.ts:710-712` accetta `resolution: "missing"` come conformità implicita. §11 impone `MISSING`, non `verified`. |
| 9 | contratto SDK aggiornato con SemVer | **VERO — misurato** | `CONTRACT_VERSION` `1.3.0`→`1.4.0`; golden `SdkContract.compat.test.ts` nel diff; controllo negativo contro host vecchio a `SimulationPluginVertical.test.ts:1658`: `protocolSatisfies("1.3.0", manifest.contract) === false`. Tutte le sei obbligazioni §9 soddisfatte. |
| 10 | `ToolCanvasEmbeddable.tsx` non cresce | **VERO — misurato** | base `112384` → head `111574`, **delta −810**. Diminuito, non solo invariato. |
| 11 | nessun claim Tinkercad parity | **VERO** | nessuna dichiarazione del genere prodotta. |
| 12 | tutti i rilievi CodeRabbit classificati | **VERO** | X6: 25/25 in `x6-terminal-coderabbit-disposition.md`, con stati onesti (`PENDING_ADJUDICATION` dove non ho letto il codice, non rifiuto implicito). |
| 13 | lavoro su exact SHA con gate di Sessione 1 verdi | **VERO — misurato oggi** | quattro gate eseguiti su `a397263e`, tutti exit 0 e coincidenti con la baseline (§9). |

**Conteggio: 7 VERO (4 dei quali misurati oggi) · 1 VERO con riserva · 4 FALSO · 1 NON PROVATO.**

### Verdetto

§16 richiede la congiunzione di tutte e 13. **La Definition of Done di Sessione 2 non è soddisfatta**, e da oggi lo è in modo *dimostrato*, con file e riga, su cinque condizioni invece che per impressione.

Questo **non** è un peggioramento del prodotto: nessuna delle cinque è una regressione introdotta ora. È l'esito di aver misurato ciò che prima era dichiarato. Il valore consegnato dalla Sessione 2 resta reale — protocollo, boundary, SemVer, riduzione del god-component e gate riproducibili sono **veri e misurati**. Ciò che non regge è la parte di catena che i documenti descrivevano come provata.

### Il difetto più grave non è nessuno dei tre claim del piano

Il piano di Sessione 3 ordinava A5 → A6 → A4. La misura dice altro: **la condizione §16.5, isolamento fra istanze, è l'unica che il protocollo stesso qualifica come confine di sicurezza, ed è l'unica il cui oracolo è verde per inerzia.** A5, A6 e A4 producono evidenza falsa o muta; §16.5 produce evidenza *inesistente* su un confine di sicurezza, mascherata da verde.

Riordino conseguente del debito, rispetto a §7:

0. **§16.5 — oracolo di isolamento verde per inerzia** (`RoomSimulationConnectWire.test.tsx:637-639`, `ToolCanvasEmbeddable.tsx:520`). Costo minimo: un baseline con `updated` diversi e una `apply` no-op deve far fallire il confronto. Beneficio massimo: converte un confine di sicurezza da asserito a provato.

Il resto dell'ordine di §7 resta invariato.

## 11. Divieti di claim — rispettati

Non è stato dichiarato: completo, beta, production-ready, fedeltà visiva al manuale, Tinkercad parity, provenance risolta, copertura host-mediated, letture UI provider-derived, cold restore della diagnostica, rollback atomico end-to-end.

L'unico claim sostenuto resta: **esiste un partial simulation harness per connect-wire sullo SHA indicato, con postcontratto ristretto alla proiezione host e dichiarato tale.**
