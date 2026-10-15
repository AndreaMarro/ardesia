# Continuità: rigetto di apertura archivio — issue #260

Stato: LOCAL_GREEN_REVIEWED, TARGET_INCOMPLETE. Base del lavoro `50aed925d44542f923687c186fde7034b1dba1fd` (#259), branch locale `codex/continuity-open-260-20261015`. Questo receipt precede il commit che lo contiene: il pin delle misure è la base più gli hash dei quattro file sottostanti. Non è una prova di integrazione in main.

Requisito: se l'apertura del log rigetta, la superficie deve uscire dal caricamento con `storage-unavailable` e conservare la causa. Non può concludere che la lezione non contenga sessioni. L'apertura senza Web Crypto fallisce realmente nel costruttore di `IndexedDbEventLog`, prima che il factory restituisca un handle.

La modifica ripristina il catch dell'apertura già presente nello stack #255 (`7af8f51ca958f395544af79f0a39cbc3d03c82c7`). Mantiene scope prima dell'accesso, lettura fallita come `unreadable` e finally di chiusura best-effort. Non importa la cronologia delle sessioni del vecchio stack e non dimostra l'assorbimento globale di #255.

## Controesempi e risultati

- RED unit/UI: 3 fallimenti, 15 passaggi e una rejection non gestita; stessa prova di controllo sul vecchio sorgente: exit 1. La UI restava in `loading`.
- RED Chromium sul vecchio sorgente: 2 fallimenti desktop/mobile nello stato loading. Tracce conservate nel workspace privato prima della successiva esecuzione.
- GREEN mirato: 18 test. Suite completa con profilo CI: 2440 passaggi, 5 skip storici, zero fallimenti. Typecheck e build separati: exit 0.
- Browser live: 6 passaggi, ossia quattro percorsi CircuitCheck originali (procedimento/correzione/riapertura/continuità) e due guasti dell'archivio. Test E2E finale della sequenza Tab su desktop/mobile: 2 passaggi. Il test usa IndexedDB reale del browser e rende indisponibile Web Crypto prima del caricamento.
- Gate congelato: `NODE_OPTIONS=--no-experimental-webstorage bash eval/gate.sh` → `{"passed":2441,"failed":0,"exit":0}`. Il totale include 2440 test unit e un replay-kill-test reale. Nessun `SKIP_REPLAY`, modifica al gate, soglia, expected storico o skip aggiunto.
- Igiene: NUL, segreti e test, confini, trigger e test, doc claims e test, stato generato e test/verify: tutti exit 0 prima del receipt. Controlli documentali e whitespace ripetuti dopo l'append dei ledger.

Il primo gate è stato eseguito durante una controprova che ripristinava temporaneamente il vecchio sorgente: è un run confounded, non usato come misura finale. Il secondo gate su sorgenti stabili ha comunque riprodotto 2416 passaggi e 24 fallimenti. I log e il JSON completo sono conservati: nessuno dei nuovi casi #260 era fra quei fallimenti. Node locale e gate usano v26.5.1; il getter globale `localStorage` esiste ma restituisce undefined senza `--localstorage-file`, interferendo con JSDOM nei worker forks. Il profilo CI threads passava già. Un probe dei due file interessati al guasto di storage passa 16/16 eliminando soltanto quel getter tramite l'opzione Node documentata; il successivo gate completo passa con la stessa opzione. Il gate resta byte-identico alla base (SHA256 `46dbf3e019cb4fd89c39148d5336752ade34cf1dc4449ecc136c6ac9829f69f3`). CI usa Node22; non è stata simulata una nuova esecuzione GitHub.

## Pin dei file verificati

| File | SHA256 |
| --- | --- |
| src/lessonos/continuitySurface.ts | 1188fb052e23988e8a3d874909391821b8f73c2b33273d16d9741532813e828a |
| src/__tests__/ContinuitySurface.test.ts | 0aaa2c6d777924134176581fa9dafef0d8f0ff1831b7d3cc4405c742373cd753 |
| src/__tests__/ContinuityView.test.tsx | 47e4732c8131a5b5dd74f3acaa4c53e55e049019e836bdf0e06bd39afb8abc40 |
| e2e/continuity-storage-failure.spec.ts | 0309603b0f2b31b8295ab3558977e52f3e82a3d197f1fcf3195bef1408a9173f |

I path della tabella sono relativi ad `apps/studio`. Log integrali nel workspace privato del run: ardesia260-red.log, ardesia260-control-red.log, ardesia260-browser-control-red.log, ardesia260-studio-final-results.json, ardesia260-frozen-vitest-results.json, ardesia260-frozen-gate-node26-compatible.log e ardesia260-frozen-replay.log. I log non sono allegati al repository né trasformati in presunte prove CI.

## Review e limiti

Review tecnica Codex in contesto separato: APPROVE sul delta dei quattro file, senza finding bloccanti nel perimetro concreto di #260; identificatore esatto del modello non esposto. Probe propri del reviewer: apertura sincrona/asincrona, errori non Error ordinari, Web Crypto assente con IndexedDB sintetico reale, chiusura su quattro rami, apertura tardiva/unmount/supersessione e quattro osservazioni Chromium con controllo sano. Non è un'approvazione GitHub né un quorum di modelli diversi. Il pin del commit verrà verificato dopo l'aggiunta di questo receipt e dei ledger.

P2 preesistente separato nella issue #261: backend corrupt/data-loss con log non null può ancora apparire senza sessioni. Non corretto da questa unità. P3 hardening: un factory iniettato che rigetta un oggetto non stringificabile può ancora rigettare; nessun percorso equivalente è stato dimostrato nel backend reale di questo caso. Non sono stati provati tutti i guasti possibili, Firefox/WebKit, dati personali o accettazione umana. Le cinque prove screenshot storiche restano skipped per assenza dei relativi asset.

Nessun push, merge, deploy o chiusura di #260. La configurazione corrente degli effetti automatici Vercel non è leggibile con gli accessi disponibili; la pubblicazione del branch attende tale verifica. Restano richiesti CI sul commit effettivo e approvazione GitHub distinta, poi integrazione e prova di main prima di chiudere la issue. Le 21 famiglie e il prodotto complessivo restano incompleti.
