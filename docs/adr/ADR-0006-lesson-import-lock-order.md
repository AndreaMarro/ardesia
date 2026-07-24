# ADR-0006 — Ordine dei lock e transazione dell'import `.lesson`

- **Stato**: PARTIALLY IMPLEMENTED (ratifica dell'ordine = Andrea; lease e porta grezza eseguite il 24-07)
- **Data**: 2026-07-24
- **Programma**: convergenza a dieci azioni — Action 7
- **Base misurata**: `4d697f5e`

## Il fatto, riprodotto (non riportato)

`LessonMutationCoordinator` dichiara nel proprio commento di **non essere
reentrante**. Gli audit del 23-07 ne registravano la conseguenza —
`withWorkspaceExclusive` sull'import «deadlocca» — come nota di review.

Ora è un predicato eseguibile:
`apps/studio/src/__tests__/LessonMutationReentrancy.test.ts`, **7/7 verdi in
1,22 s** sul broker in-process di produzione (nessun mock).

Il meccanismo, letto dal codice:

- `withWorkspaceExclusive` prende `ardesia:workspace-mutation` in **esclusiva**;
- `withPathMutation` prende **lo stesso nome** in *shared*, e solo dentro quello
  prende il lock di lezione in esclusiva;
- una `withPathMutation` annidata dentro l'esclusiva si accoda dietro lo
  scrittore che sta aspettando proprio lei. Attesa circolare.

Lo stesso vale per `withPathMutation` annidata su una seconda risorsa della
**stessa** lezione.

### Scoperta scrivendo i test: il danno non è locale

Il primo giro di test è fallito per il motivo giusto. Il broker in-process di
default è un **singleton di modulo**: un import bloccato lascia il lock di
workspace preso *per sempre*, e chiunque altro nello stesso realm resta fuori —
anche su una lezione che non c'entra nulla.

Il test `un'attesa circolare avvelena il workspace per tutto il realm` congela
questo comportamento. Non è un dettaglio di test: in produzione un solo import
annidato basterebbe a congelare ogni mutazione della tab.

Per poter misurare senza falsare, `lessonMutationLock.ts` ora esporta
`createInProcessMutationLockBroker()` — stessa implementazione del fallback, con
stato proprio. È l'unica modifica al prodotto di questa slice, additiva.

## Cosa esiste già (misurato)

`store/lessonImportTransaction.ts` (433 righe) implementa **davvero** una
transazione: fasi `staged → committing → rollback-needed → committed`, stage in
namespace canonico (`raw/.ardesia/import-transactions/stage/<i>.blob`, path non
canonico rifiutato), backup dei target, verifica **byte-a-byte** in rilettura
(`assertBlobMatches`), rollback che fallisce esplicitamente se manca un backup, e
pulizia dei residui solo dopo il commit.

Il pezzo mancante non è la transazione. È **chi possiede i lock** mentre gira.

## Decisione proposta

1. **Un solo ordine di acquisizione**, sempre lo stesso:
   `workspace → activity → lesson → path`.
2. Il macro-import **possiede internamente l'intero ordine**. Non chiama
   operazioni pubbliche che riacquisirebbero i lock: usa una **porta driver
   grezza** già protetta.
3. Il coordinator resta **non reentrante per contratto**, e questa proprietà è
   ora sorvegliata dai test: chi tenta l'annidamento non ottiene lentezza, ma
   una promise che non si stabilizza.
4. **Fencing token** per lezione/sessione registrato all'ingresso, così che uno
   scrittore sopravvissuto a un reload non possa promuovere byte vecchi.
5. **L'aliasing di case si rifiuta prima di mutare.** Su storage
   case-insensitive `RoomA` e `rooma` sono la stessa lezione — il nome del lock
   già le fonde (verificato in test) — e scoprirlo a metà scrittura produce
   esattamente lo stato misto che la transazione esiste per impedire.
6. **Rilascio in ordine fisso e inverso**, sempre, anche sui rami di errore.

### Macchina a stati richiesta

```text
valida tutti gli input
  → acquisisce la proprietà di mutazione del workspace
  → registra il fencing token di lezione/sessione
  → stage in namespace a prova di collisione
  → verifica schema, identità, inventario e hash
  → persiste l'intento di commit versionato
  → promuove attraverso la porta driver grezza
  → riverifica l'identità dei byte in rilettura
  → persiste il marcatore di commit
  → pulisce lo stage o espone i residui come diagnostica
  → rilascia i lock in ordine fisso
```

## Controlli negativi richiesti prima dell'implementazione

- ZIP troncato → **zero** scritture canoniche;
- fallimento su **ogni** arco della macchina a stati → resume o rollback deterministico;
- due import concorrenti → nessun interleaving;
- `RoomA`/`rooma` → rifiuto **prima** di qualunque mutazione;
- schema futuro → nessun downgrade silenzioso;
- import fallito → i byte precedenti restano identici.

## Stato di implementazione (aggiornato il 24-07, dopo la stesura)

Il primo passo è stato eseguito: **l'import possiede la lease di workspace per
intero e scrive attraverso la porta driver grezza.**

Prima, ogni file dell'import passava da `store.write()`, che prende e rilascia
il lock di path uno alla volta: fra un file e il successivo un altro scrittore
poteva infilarsi. La transazione era atomica sul *contenuto* — stage, backup,
verifica byte-a-byte, rollback — ma non nel *tempo*.

Il rimedio non poteva essere avvolgere l'import in `withWorkspaceExclusive`
lasciando dentro le `write` pubbliche: quello deadlocca, ed è il fatto
dimostrato in cima a questo documento. Serve la lease **e** la porta grezza.
`WorkspaceStore.leasedStore()` è una facade, non un flag di istanza: un flag
resterebbe attivo per chiunque usi lo store nel frattempo, mentre così solo chi
riceve quell'oggetto scrive grezzo.

Coperti dalla lease: `importLessonBlob`, `importLessonBlobForRoom` (inclusa la
cache della scena legacy, che va aggiornata prima che qualcun altro possa
scrivere) e `recoverPendingLessonImport` — la recovery muta lo stesso stato,
quindi due recovery concorrenti, o una recovery e un import, si
calpesterebbero.

Prova: `__tests__/LessonImportIsolation.test.ts`, **5/5**, osservati **4 rossi
su 5** prima della modifica. I test leggono il *ledger dei lock*, non i tempi:
nessuna corsa, nessun flake. Verificano una sola lease esclusiva, **zero**
riacquisizioni al suo interno, nessun rilascio a metà strada, e un intruso che
entra solo dopo l'uscita.

Nota di metodo, perché è il tipo di errore che rende verde un test inutile: il
primo ledger era un broker semplificato scritto a mano, e non accodava le
richieste `shared` dietro uno scrittore esclusivo — l'intruso "passava" anche
quando la lease funzionava. Ora il ledger **delega al broker di produzione** e
si limita a registrare. Un oracolo che diverge dall'originale misura sé stesso.

`npm run verify` exit 0: engine 2044/7 skipped, studio 1989 passed / 5 skipped,
typecheck 0, build 0.

### Ancora aperto

- **fencing token** per lezione/sessione: non implementato. Uno scrittore
  sopravvissuto a un reload può ancora promuovere byte vecchi;
- **rifiuto dell'aliasing di case prima della mutazione** su storage
  case-insensitive: non implementato. Il nome del lock già fonde `RoomA` e
  `rooma` (test presente), ma la transazione non rifiuta l'alias in ingresso;
- **`withLessonImport`** come primitiva del coordinator: non introdotta. Oggi
  l'ordine è posseduto da `WorkspaceStore`, non dal coordinator;
- i controlli negativi elencati sotto (ZIP troncato, fallimento su ogni arco,
  schema futuro) **non** sono ancora tutti coperti.

R6 è ridotto, non chiuso.

## Conseguenze

- Positive: il formato locale resta aperto e offline, nessun database cloud; il
  prossimo che tenterà l'annidamento lo scoprirà da un test, non da una tab
  congelata in aula.
- Negative: finché il macro-import non esiste, l'import multi-file resta senza
  isolamento transazionale end-to-end. È il rischio **R6**, e resta aperto.
