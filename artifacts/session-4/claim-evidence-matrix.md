# Sessione 4 — matrice claim/evidence, falsificatori, CoV, debito residuo

/ Base `36e6753cc55c114cb1c0815a7e2f8911a0b71dc7` · freeze d'ingresso `a397263e…` · **head prodotto `c387b369fdc07db75ba0501ddb24ed9d3c6c7941`**
/ Vault `agent/session-1-gate-truth-20260727` (= `sync/current` +5, 0 indietro), head `0509c2d4…`
/ Ambito eseguito: **due slice su cinque**, più il commit degli artifact e le correzioni nate dalla review.
/ Revisori terminali: **due**, entrambi con evento terminale e exit 0.

## 0. CoV-0 — freeze e ingresso: **VERDE**

Nove grandezze ricalcolate, nove coincidenti. Dettaglio e comandi in
`30-Evidence-Receipts/2026-07-27-SESSIONE-4-SLICE-1-ORACOLO-ISOLAMENTO-CAUSALE`.

## 1. Commit prodotti — e la copertura di review che ciascuno rompe

| # | SHA | scopo | file | coperto da review? |
|---|---|---|---:|---|
| 0 | `d7b517cf` | artifact di Sessione 3 | 5 | no, e **dichiarato nel commit** |
| 1 | `7cd0a64e` | oracolo di isolamento §16.5 | 1 | ✅ X7 + falsificazione |
| 2 | `d5324a44` | osservabilità del fallimento audit | 3 | ✅ X7 + falsificazione |
| 3 | `c387b369` | ritiro di due commenti che sovraclaimavano | 2 | ❌ **prodotto DOPO le review** |

⚠️ Il commit 3 nasce **dai finding delle review** e quindi per costruzione non
può esserne coperto. Delta non revisionato: 2 file, **solo commenti**, zero
cambiamenti di comportamento. Chi riprende lo tratti come non revisionato.

## 2. Matrice claim / evidence

| claim | stato | evidenza |
|---|---|---|
| **La precondizione dell'asserzione di isolamento è stabilita** | **REGGE in forma stretta** | forma corretta: guasto colto 10/10; forma precedente: mancato 16/20 |
| **§16.5 — due PluginInstance sono isolate** | **NON PROVATO, invariato** | il revisore ha mostrato che `roomA`/`roomB` sono closure separate: il test prova due mutazioni isolate *per costruzione*. Claim ritirato dal commento in `c387b369` |
| **Il fallimento di un'append di audit è osservabile** | **REGGE in forma stretta** | rosso `expected +0 to be 1`, verde dopo, controllo negativo sul percorso di successo |
| **Fail-soft è una policy e non un buco** | **NON REGGE in forma forte** | nessun chiamante di produzione legge `auditDropCount`; il contatore è in-memory e sparisce al reload |
| **L'audit conserva ogni riga** | **NON REGGE, invariato** | race read-modify-write fra due `ToolHost` **riprodotta dal revisore**: il write riesce e sovrascrive, `auditDropCount` resta `0` |
| **Partial simulation harness per connect-wire, postcontratto ristretto alla proiezione host** | **unico claim ammesso, invariato** | nessuna misura di questo ciclo lo tocca |

## 3. Falsificatori per ogni claim residuo

| claim residuo | falsificatore |
|---|---|
| «la precondizione è stabilita» | un mutante che faccia scrivere `ToolBoard.write` direttamente sull'array di `getSceneElements()` senza `updateScene`: byte, wire e audit restano corretti e il test resta verde |
| «il fallimento audit è osservabile» | qualunque perdita che non passi da un rigetto di `append` — race, `now()` che lancia, store che risolve senza durabilità, crash prima della write fire-and-forget, cancellazione successiva |
| «il contatore discrimina» | è **cumulativo e senza reset**: dopo un rigetto seguito da un successo resta `1`. Dopo reload torna `0` e cancella la storia |
| «l'inerzia era 16/20» | percentuale **locale**: dipende da risoluzione del clock, carico e scheduling. Trasferibile è l'esistenza del falso verde, non il numero |
| «i tre commit non introducono regressioni» | **falsificato**: `git diff --check d7b517cf^..d7b517cf` → **exit 2** (trailing whitespace negli artifact grezzi) |

## 4. Numeri miei riverificati in questo ciclo

| numero dichiarato | esito | fonte |
|---|---|---|
| «31,35% di divergenza dell'orologio» | **falso al sito** (80%): misurato su un costrutto diverso | mio controfattuale, prima del commit |
| «20 rossi su 20, il guasto è sempre visto» | **falso**: 16/20 su un'altra riga | attribuzione per riga sui 20 output |
| «decine di `toEqual` in ~28 file» | **falso**: `readAuditLog` compare in **10 file**, il revisore conta **7 siti** | il revisore, dopo il commit |
| «`git diff --check` pulito» | **falso sul range del commit**: exit 2 | il revisore, dopo il commit |
| baseline dei gate eseguibili | **vero**, tutti coincidenti | rieseguiti |

**La forma è sempre la stessa: un numero misurato su un referente adiacente.**
Due li ho intercettati io prima del commit, due li ha intercettati il revisore
dopo. Registrati come `E-53`…`E-57`.

## 5. Gate osservati — numeri, non «verde»

| gate | osservato su `d5324a44` | exit |
|---|---|---|
| `npm run verify` | Engine `2044 passed, 7 skipped`; Studio `183 passed \| 1 skipped (184)`, `2043 passed \| 5 skipped (2048)` | 0 |
| equivalente CI | `--pool=threads --maxWorkers=1 --no-file-parallelism` → `183 passed \| 1 skipped`, `2043 passed \| 5 skipped` | 0 |
| `bin/ci/elab_boundary_gate.py` | `OK (12 baseline offenders remain, none added; packs/ clean)` | 0 |
| `apps/studio/eval/gate.sh` | `{"passed":2044,"failed":0,"exit":0}` | 0 |
| `npm run typecheck` (`tsc -b --noEmit`) | nessun errore. **È già coperto da `npm run verify`**: `bin/monorepo.sh:150` → `verify_core() { test_core; typecheck_core; build_core; }` | 0 |
| `git diff --check` (working tree) | nessun output | 0 |
| `git diff --check d7b517cf^..d7b517cf` | trailing whitespace | **2** |
| `ToolCanvasEmbeddable.tsx` | 111574 byte, invariato | ✅ |
| lockfile e manifest | invariati vs base | ✅ |

Delta di baseline `+1` su Studio e su `eval/gate.sh`: spiegato **per intero**
dal test nuovo della Slice 2.

## 6. Stato CoV

| CoV | oggetto | stato | nota |
|---|---|---|---|
| CoV-0 | freeze | **GREEN** | nove binding ricalcolati |
| CoV-1 | oracolo RED | **GREEN** | due oracoli visti rossi per la causa dichiarata, entrambi con control run |
| CoV-2 | §16.5 isolamento | **PARZIALE** | l'oracolo non è più inerte; il confine resta `NOT_PROVEN` e il claim è stato **ritirato dal commento** |
| CoV-3 | audit osservabile | **PARZIALE** | append rigettate osservabili; race e assenza di consumer aperte |
| CoV-4 | digest host-owned | **NOT_STARTED** | slice non aperta |
| CoV-5 | provenance | **BLOCKED**, invariato | nessuna misura nuova |
| CoV-6 | review | **PARZIALE** | due revisori con evento terminale ed exit 0, ma 25 major non aggiudicati e un commit successivo alle review |
| CoV-7 | docs/canon | **BLOCKED, PEGGIORATO** | il revisore ha trovato `ARDESIA-MAP.md:43` che dichiara l'isolamento già provato — contraddizione **non registrata prima** |

Un CoV che peggiora va registrato come peggioramento: CoV-7 peggiora perché è
stata fatta una misura che prima mancava.

## 7. Debito residuo, ordinato per gravità

1. **Race read-modify-write dell'audit** — riprodotta dal revisore, `drop=0`. Chiudere condividendo la catena per store/tool.
2. **Nessun consumer di produzione di `auditDropCount`** + contatore volatile e cumulativo: il segnale esiste e nessuno lo interroga.
3. **25 major X7 non aggiudicati**, più 6 minor e 7 trivial.
4. **`ARDESIA-MAP.md:43`** dichiara provato l'isolamento: contraddice §16.5 `NOT_PROVEN`.
5. **Digest auto-attestato** (`caps/simulation.ts:206-228`) — Slice 3, non aperta.
6. **Duplicazione post-it → board non idratabile** — Slice 4, non aperta.
7. **A5 e la sua radice di tipo** (`messages.ts:401-412`) — Slice 5, non aperta.
8. ~~**`tsc -b` assente dalla lista dei gate**~~ — **ritirato, era falso**:
   `bin/monorepo.sh:150` mostra che `npm run verify` esegue già
   `typecheck_core` e `build_core`. Errore mio, `E-58`, stessa famiglia dei
   cinque numerici sopra: assenza asserita senza leggere il referente.
9. **PII e path locali** negli artifact grezzi committati; rollback `rm -rf artifacts/session-3` troppo largo.

## 8. Rollback

Revert chirurgici in ordine inverso: `c387b369`, `d5324a44`, `7cd0a64e`,
`d7b517cf`. Nessuna migrazione dati, nessuna dipendenza, nessun `.env*`,
nessun push. `ToolCanvasEmbeddable.tsx` mai toccato.

## 9. Divieti di claim — rispettati

Non è stato dichiarato: completo, beta, production-ready, fedeltà visiva al
manuale, Tinkercad parity, provenance risolta, copertura host-mediated, letture
UI provider-derived, cold restore della diagnostica, rollback atomico
end-to-end, **isolamento provato**.

Unico claim sostenuto: **esiste un partial simulation harness per connect-wire
sullo SHA indicato, con postcontratto ristretto alla proiezione host e
dichiarato tale.**
