# Post-it: coerenza del link nel renderer corrente — recupero circoscritto #213

Base locale `22e5a8bc64408639c0de4959162258ac4720b077`. Questa nota riguarda un
adattamento minimo dell'invariante di identità trovato nel diff #213, non il
recupero della sua intera implementazione. Nessun push Ardesia: istruzione del
proprietario SOLO LOCALE. Commit esatto, browser postcommit e pin finale pendenti.

## Requisito e controesempio

Il restorer della board v1 verifica già la correlazione tra owner, ID e link.
Il renderer chiamato dal ToolCanvas controllava owner e ID, ma ignorava un link
presente contraddittorio. La nuova spec sul sorgente immutato mostra 6 FAIL e
3 PASS sani: link verso altro plugin/istanza, vuoto, numero, oggetto e array sono
accettati; link canonici, null e assenti mantengono le tre card distinte.

## Modifica minima

Il costruttore di link già usato dal producer/restorer è esportato dal suo modulo
e riusato dal renderer. Un link presente deve coincidere con quello del plugin e
dell'elemento canonico; null/undefined restano ammessi per il passaggio normalizzato
di Room. Non cambia il trattamento degli ID legacy nel restorer o nel renderer.
Nessun nuovo schema, migrazione, SDK1.4, applyOperation, solver, provider o regola
owner-locked. La guardia assicura coerenza interna, non autenticità crittografica.

## Verifiche osservate

- Nuova spec: RED 6 FAIL / 3 PASS con fonti produttive immutate; GREEN 9 PASS.
  Insieme alle due suite persistenza/consumer esistenti: 28 PASS / 3 suite.
  Le tre card reali sim-a, sim-b e consumer sono renderizzate nei controlli sani;
  l'input non viene mutato, neppure nei rifiuti.
- Typecheck e build, eseguiti separatamente: exit 0 per entrambi.
- Primo gate congelato: 2476 PASS / 24 FAIL / exit 1. Il writer ha omesso il
  profilo Node26 `NODE_OPTIONS=--no-experimental-webstorage` già usato nelle unità
  precedenti. Il run fallito resta conservato; il gate scarta il JSON dettagliato,
  quindi non vengono inventate identità o cause individuali dei 24 fallimenti.
  Il replay non è stato eseguito nel primo run perché Vitest era fallito.
- Nuovo run del medesimo gate e medesimi byte fonte/test: 2501 PASS / 0 FAIL /
  exit 0 con il solo profilo compatibile ripristinato. Include il replay reale
  1 PASS, codice 0. Nessuno SKIP_REPLAY, soglia, timeout o gate modificato.
  Gate SHA256 `46dbf3e019cb4fd89c39148d5336752ade34cf1dc4449ecc136c6ac9829f69f3`.
  Il nuovo run verde non riscrive il primo fallimento.
- Vecchi output del replay e il suo log sono stati preservati prima del gate;
  l'output browser di ogni nuova verifica avrà una destinazione distinta.
- NUL, segreti, confini, trigger workflow, doc-claims e diff-check staged: exit 0.
  Nessuna attivazione dei documenti DRAFT o della PR normativa bloccata #247.

## Pin dei tre contenuti funzionali

```text
3119763f637d59d6943136d182c5b5a22c87ef16196c249faaae54e80478d11b  apps/studio/src/design/multiPostitBoardPersistence.ts
edb31713ed12df3bec3cb2b26fa42c80a25e252d4b2eb244736cbdee898ebc46  apps/studio/src/toolhost/pluginPostitBoardRender.tsx
a5416d1c4f5178751cb21332f99bec41866cd4b53f90b4097fa257ecdf737097  apps/studio/src/__tests__/PluginPostitBoardLinkIdentity.test.tsx
```

## Stato della review e limiti

La review Codex separata avversaria APPROVE_LOCAL_SOURCE_CONTENT è registrata
sui tre hash: SHA256 `5fe19d1e93b0c979ab42ff9e3d815e9a665af8c19f76d883d7f60b0870e6183a`. Il reviewer
ha eseguito 11 controesempi discriminanti sul renderer corrente e su un overlay
del renderer base, con moduli reali caricati soltanto in memoria, senza solver.
I quattro controlli sani, i casi non pertinenti e il ripristino legacy sono
preservati. Non è un approval GitHub né un’attestazione dell’intera PR213. Commit/ledger/browser finale verranno
pinnati separatamente dopo il normale commit locale. Non viene eseguita nuova CI
GitHub o integrazione in main, e nessuna issue/PR viene chiusa.

Restano aperti i contributi più ampi della PR213: schema2/SDK1.4, broker mutante,
composizione di room, proiezione del montaggio e relativi oracoli; i 20 finding
storici non sono chiusi. Questo adattamento non qualifica integralmente i file
originali o i due moduli correnti fuori dal delta letto.

not_checked: browser postcommit e pin del futuro commit; durabilità IndexedDB o
power loss; autenticità del marker; completezza degli altri contributi213;
regressioni dell'intero prodotto ELAB; hardware/pilot; CI e main remoti. Restano
invariati tutti i vincoli espliciti, in particolare nessun push/merge/deploy.
