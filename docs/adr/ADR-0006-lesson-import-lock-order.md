# ADR-0006 — Ordine dei lock e transazione dell'import `.lesson`

- **Stato**: PROPOSED (ratifica = Andrea; nessun macro-import implementato qui)
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

## Cosa questo ADR NON fa

Non implementa il macro-import, non introduce `withLessonImport`, non cambia il
comportamento del coordinator. Congela il fatto e fissa l'ordine: sono le due
cose che devono esistere *prima* di scrivere la transazione, non dopo.

## Conseguenze

- Positive: il formato locale resta aperto e offline, nessun database cloud; il
  prossimo che tenterà l'annidamento lo scoprirà da un test, non da una tab
  congelata in aula.
- Negative: finché il macro-import non esiste, l'import multi-file resta senza
  isolamento transazionale end-to-end. È il rischio **R6**, e resta aperto.
